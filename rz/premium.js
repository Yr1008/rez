/* rz/premium.js — the site's motion + interaction engine.
 *
 * Why this exists: every page authors scroll-reveal hooks (data-rv + data-d) but the
 * shared stylesheet used to disable them outright, because the previous implementation
 * hid everything up front and then waited on a 300ms polling scan, so above-the-fold
 * content visibly shifted in about a second after load.
 *
 * The contract here fixes that root cause rather than the symptom:
 *   1. Nothing is hidden by CSS until this script adds html.rv-on, so a blocked, failed
 *      or thrown script can never strand content invisible.
 *   2. These pages are rendered by a client-side runtime (support.js + React), so the
 *      markup appears long after this file executes. A MutationObserver resolves each
 *      new element in the same microtask it is inserted — before the browser paints it —
 *      so there is no polling delay to shift into.
 *   3. Anything already inside the viewport when it is first seen resolves immediately
 *      with a short opacity-led intro instead of the full travel.
 *   4. A hard failsafe reveals everything unconditionally after a few seconds.
 *   5. Under prefers-reduced-motion the hidden state is never armed at all.
 *
 * It also owns the pointer-driven polish (spotlight, magnetic CTAs), the headline word
 * reveal, the scroll-progress fallback, and the Unicode-caret replacement. All of it is
 * idempotent and self-healing, because the React runtime may replace subtrees at any time.
 */
(function () {
  'use strict';
  if (window.__rzPremium) return;
  window.__rzPremium = true;

  var doc = document;
  var root = doc.documentElement;
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  } catch (e) {}

  var fine = false;
  try {
    fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  } catch (e) {}

  /* ------------------------------------------------------------------ *
   * 0. Document-level fixes that belong on every page
   * ------------------------------------------------------------------ */
  function honorHash() {
    if (root.getAttribute('data-hash-honored') === '1') return;
    var id = (location.hash || '').replace(/^#/, '');
    if (!id || !/^(kiravoice|demo|faq|platform|capabilities)$/.test(id)) return;
    var el = doc.getElementById(id);
    if (!el) return;
    root.setAttribute('data-hash-honored', '1');
    try { el.scrollIntoView({ block: 'start' }); } catch (e) {}
  }

  function documentBasics() {
    if (!root.getAttribute('lang')) root.setAttribute('lang', 'en');

    // Skip link, ahead of everything in the tab order.
    if (!doc.querySelector('.rz-skip')) {
      var a = doc.createElement('a');
      a.className = 'rz-skip';
      a.href = '#rz-main';
      a.textContent = 'Skip to content';
      if (doc.body) doc.body.insertBefore(a, doc.body.firstChild);
    }

    // Give the skip link a target. <main> is rendered by the runtime, so this is
    // retried from the observer until it exists.
    var main = doc.querySelector('main');
    if (main && !doc.getElementById('rz-main')) main.id = 'rz-main';

    // Scroll progress hairline. Browsers with scroll-driven animations run it from
    // CSS; everywhere else the scroll handler below writes --rz-progress.
    if (!reduce && !doc.querySelector('.rz-prog')) {
      var bar = doc.createElement('div');
      bar.className = 'rz-prog';
      bar.setAttribute('aria-hidden', 'true');
      if (doc.body) doc.body.appendChild(bar);
    }

    // The decorative hero video should not be announced.
    var hv = doc.querySelector('#cinevid-wrap video');
    if (hv && !hv.hasAttribute('aria-hidden')) hv.setAttribute('aria-hidden', 'true');

    var nav = doc.querySelector('nav.nav-wrap, nav');
    if (nav && !nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'Main');
  }

  /* ------------------------------------------------------------------ *
   * 1. Reveal engine
   *
   * The previous attempt at this was disabled because reveals got permanently
   * stuck at opacity:0 on the cinematic pages: those [data-rv] elements live
   * inside the cine.js-driven sticky hero, where the container's transforms and
   * clipping mean the IntersectionObserver never reports them as in-view.
   *
   * Three defences, so that cannot happen again:
   *   a. cine.js owns the hero outright. Anything inside #cinehero is excluded
   *      from the reveal system entirely, since cine.js already animates opacity
   *      and position on those elements frame by frame and the two systems would
   *      fight over the same properties.
   *   b. A rect-based backstop runs on scroll for anything the observer has not
   *      resolved. getBoundingClientRect() reports real on-screen geometry through
   *      transforms and clipping, so it catches whatever the observer misses. It
   *      detaches itself as soon as nothing is pending, so steady-state cost is nil.
   *   c. An unconditional failsafe timer reveals everything regardless.
   * ------------------------------------------------------------------ */
  var io = null;
  var armed = false;
  var revealedAll = false;
  var pendingSet = [];
  var backstopBound = false;

  // Elements the cinematic hero animates itself. The reveal system must not touch
  // opacity or transform on any of these.
  function ownedByCine(el) {
    return !!(el.closest && (
      el.closest('#cinehero') ||
      el.closest('#cinestage') ||
      el.closest('.cine-card') ||
      el.closest('.cine-beat')
    ));
  }

  function markDone(el) {
    // Drop will-change once the animation has played, so long pages do not hold
    // dozens of composited layers alive.
    var clear = function () {
      el.setAttribute('data-rv-done', '1');
      el.style.willChange = '';
    };
    el.addEventListener('animationend', clear, { once: true });
    setTimeout(clear, 1600);
  }

  function reveal(el, immediate) {
    if (el.getAttribute('data-in') === '1') return;
    if (immediate) el.setAttribute('data-rv-now', '1');
    el.setAttribute('data-in', '1');
    markDone(el);
  }

  // Last resort only. Disarming drops the hidden state for the whole document, so
  // nothing below the fold can animate afterwards — it is reserved for the case where
  // something is demonstrably stuck.
  function disarm() {
    revealedAll = true;
    pendingSet = [];
    root.classList.remove('rv-on');
    var all = doc.querySelectorAll('[data-rv]:not([data-in]),[data-split]:not([data-in])');
    for (var i = 0; i < all.length; i++) all[i].setAttribute('data-in', '1');
  }

  // Reveals anything that is hidden while on screen — i.e. anything the observer and
  // the scroll sweep both missed. Runs on a short schedule after arming, on load, and
  // on resize. Elements still below the fold are left alone so they keep their
  // entrance for when the reader reaches them.
  function watchdog() {
    if (revealedAll) return 0;
    var vh = window.innerHeight || 800;
    var stuck = doc.querySelectorAll('[data-rv]:not([data-in]),[data-split]:not([data-in])');
    var n = 0;
    for (var i = 0; i < stuck.length; i++) {
      var r;
      try {
        r = stuck[i].getBoundingClientRect();
      } catch (e) {
        reveal(stuck[i], true);
        n++;
        continue;
      }
      if (r.bottom > -80 && r.top < vh + 80) {
        reveal(stuck[i], true);
        n++;
      }
    }
    return n;
  }

  function observer() {
    if (io || !window.IntersectionObserver) return io;
    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          reveal(entries[i].target, false);
          io.unobserve(entries[i].target);
        }
      }
    }, {
      // Fire a little before the element's top edge reaches the fold, so the
      // motion is finishing as the reader arrives rather than starting.
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.01,
    });
    return io;
  }

  // Defence (b): rect-based sweep for anything the observer has not resolved.
  function sweep() {
    if (revealedAll || !pendingSet.length) return;
    var vh = window.innerHeight || 800;
    var still = [];
    for (var i = 0; i < pendingSet.length; i++) {
      var el = pendingSet[i];
      if (el.getAttribute('data-in') === '1') continue;
      if (!el.isConnected) continue;
      var r;
      try {
        r = el.getBoundingClientRect();
      } catch (e) {
        reveal(el, true);
        continue;
      }
      // A zero-height box means the element is not laid out yet; leave it pending.
      if (r.top < vh * 0.92 && (r.height > 0 || r.width > 0)) reveal(el, false);
      else still.push(el);
    }
    pendingSet = still;
    if (!pendingSet.length && backstopBound) {
      window.removeEventListener('scroll', onScroll);
      backstopBound = false;
    }
  }

  var sweepQueued = false;
  function onScroll() {
    if (sweepQueued) return;
    sweepQueued = true;
    requestAnimationFrame(function () {
      sweepQueued = false;
      sweep();
    });
  }

  function bindBackstop() {
    if (backstopBound) return;
    backstopBound = true;
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function collect(scope) {
    if (reduce || revealedAll) return;
    var nodes = (scope || doc).querySelectorAll('[data-rv]:not([data-rv-seen]),[data-split]:not([data-rv-seen])');
    if (!nodes.length) return;

    var pending = [];
    var vh = window.innerHeight || 800;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.setAttribute('data-rv-seen', '1');

      // Defence (a): the cinematic hero animates its own children.
      if (ownedByCine(el)) {
        el.setAttribute('data-in', '1');
        el.setAttribute('data-rv-done', '1');
        continue;
      }

      var top;
      try {
        top = el.getBoundingClientRect().top;
      } catch (e) {
        top = 0;
      }
      // Already in view (or above it) when first seen: resolve now with the short
      // intro. Everything else waits for the observer.
      if (top < vh * 0.94) reveal(el, true);
      else pending.push(el);
    }

    if (!armed) {
      armed = true;
      root.classList.add('rv-on');
      // Defence (c): sweep anything that is hidden while on screen. Staggered rather
      // than one-shot, so late layout (web fonts, images settling, the runtime
      // mounting a section) cannot leave something behind.
      [900, 2200, 5000].forEach(function (t) { setTimeout(watchdog, t); });
      window.addEventListener('load', function () { setTimeout(watchdog, 150); });
      window.addEventListener('resize', function () { setTimeout(watchdog, 250); }, { passive: true });
      // Absolute backstop: if anything is still hidden on screen this late, the
      // system is not working on this page and is switched off entirely.
      setTimeout(function () {
        if (watchdog() > 0) disarm();
      }, 10000);
    }

    var ob = observer();
    for (var j = 0; j < pending.length; j++) {
      if (ob) ob.observe(pending[j]);
      pendingSet.push(pending[j]);
    }
    if (pendingSet.length) {
      bindBackstop();
      // Resolve anything that is already on screen but was mid-layout above.
      requestAnimationFrame(sweep);
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. Headline word reveal
   *
   * Splits a heading into per-word masks so display type rises line by line.
   * Only text nodes are touched: existing inline markup (the gradient <span>s,
   * <br>s, links) is preserved as-is and rises with the word around it, so no
   * styling is lost. Re-applied by the observer if the runtime replaces the node.
   * ------------------------------------------------------------------ */
  // A mask unit is <span class="rzw"><span style="--rzw-i:n">…</span></span>: the
  // outer span clips, the inner one rises. --rzw-i is the stagger index.
  function maskUnit(index) {
    var outer = doc.createElement('span');
    outer.className = 'rzw';
    var inner = doc.createElement('span');
    inner.style.setProperty('--rzw-i', index);
    outer.appendChild(inner);
    return outer;
  }

  // Gradient text is painted with background-clip:text on the element itself.
  // Splitting inline-blocks inside it can break the clip, so such an element is
  // masked whole and rises as a single beat.
  function isGradientText(el) {
    if (/grad/i.test(el.className || '')) return true;
    try {
      var cs = getComputedStyle(el);
      return (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text');
    } catch (e) {
      return false;
    }
  }

  function splitOne(el) {
    if (el.getAttribute('data-rzw') === '1' && el.querySelector('.rzw')) return;
    var i = 0;

    function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];

        if (n.nodeType === 3) {
          if (!n.nodeValue.trim()) continue;
          var parts = n.nodeValue.split(/(\s+)/);
          var frag = doc.createDocumentFragment();
          for (var p = 0; p < parts.length; p++) {
            if (!parts[p]) continue;
            if (parts[p].trim()) {
              var unit = maskUnit(i++);
              unit.firstChild.textContent = parts[p];
              frag.appendChild(unit);
            } else {
              // Preserve the original whitespace between words.
              frag.appendChild(doc.createTextNode(parts[p]));
            }
          }
          node.replaceChild(frag, n);
          continue;
        }

        if (n.nodeType !== 1) continue;
        if (n.tagName === 'BR' || n.classList.contains('rzw')) continue;

        if (isGradientText(n)) {
          var whole = maskUnit(i++);
          node.replaceChild(whole, n);
          whole.firstChild.appendChild(n);
        } else {
          walk(n);
        }
      }
    }

    try {
      walk(el);
      el.setAttribute('data-rzw', '1');
    } catch (e) {
      // If the node shape is not what we expect, leave the heading alone. The
      // block-level reveal still applies, so nothing is lost but the flourish.
      el.removeAttribute('data-split');
    }
  }

  function splitAll(scope) {
    if (reduce) return;
    var els = (scope || doc).querySelectorAll('[data-split]');
    for (var i = 0; i < els.length; i++) splitOne(els[i]);
  }

  /* ------------------------------------------------------------------ *
   * 3. Enhancement pass
   *
   * Applies the premium layer's attributes to elements that already exist, by
   * selector, so the effects can be rolled out without editing markup on every
   * page. Attribute writes only — no structural change — which is safe against
   * the client-side runtime re-rendering around them.
   * ------------------------------------------------------------------ */
  // Two constraints shape this list. cine.js animates .cine-card itself, so those are
  // deliberately absent. And data-spot paints into ::before while data-edge paints
  // into ::after, so a class that already uses one of those pseudo-elements only gets
  // the other: .lqcard has its own ::before, .kbcard has its own ::after.
  var ENHANCE = [
    // Raised light surfaces: shared lift, pointer spotlight, gradient edge.
    ['.capcard,.cscard,.team-card,.buyer-card,.usecase,.kbcard,.mayo-card', { 'data-lift': '', 'data-spot': '' }],
    ['.capcard,.cscard,.team-card,.buyer-card', { 'data-edge': '' }],
    // Dark glass cards: the edge only, and no warm spotlight on a dark surface.
    ['.lqcard', { 'data-lift': '', 'data-edge': '' }],
    // Primary CTAs lean toward the cursor.
    ['.btn-glow,.btn-white,.nav-cta-d', { 'data-mag': '' }],
    // Full-bleed section imagery settles as it enters, where the browser can run
    // it off a native view timeline.
    ['[data-par-box] img,[data-par] img', { 'data-vt': 'rise' }],
  ];

  function enhance(scope) {
    var s = scope || doc;
    for (var i = 0; i < ENHANCE.length; i++) {
      var sel = ENHANCE[i][0];
      var attrs = ENHANCE[i][1];
      var els;
      try {
        els = s.querySelectorAll(sel);
      } catch (e) {
        continue;
      }
      for (var j = 0; j < els.length; j++) {
        for (var key in attrs) {
          if (!els[j].hasAttribute(key)) els[j].setAttribute(key, attrs[key]);
        }
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. Accordion semantics
   *
   * The Kira-voice accordions are <div onClick> with no role, tab stop or state,
   * so they are invisible to keyboards and screen readers.
   * ------------------------------------------------------------------ */
  function accessibleAccordions(scope) {
    var hs = (scope || doc).querySelectorAll('.acc-h:not([data-rzacc])');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      h.setAttribute('data-rzacc', '1');
      if (!h.getAttribute('role')) h.setAttribute('role', 'button');
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '0');
      if (!h.hasAttribute('aria-expanded')) h.setAttribute('aria-expanded', 'false');
      h.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
          ev.preventDefault();
          ev.currentTarget.click();
        }
      });
      h.addEventListener('click', function (ev) {
        var el = ev.currentTarget;
        // The runtime owns open/closed state; mirror whatever it settles on.
        setTimeout(function () {
          var open = el.getAttribute('data-open') === '1' ||
            (el.parentNode && el.parentNode.getAttribute('data-open') === '1');
          el.setAttribute('aria-expanded', open ? 'true' : 'false');
        }, 40);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. Pointer polish: spotlight position + magnetic CTAs
   *
   * One delegated pointermove on the document, throttled to one frame, writing
   * two custom properties. No per-element listeners, no layout reads in the
   * handler beyond the target's own box.
   * ------------------------------------------------------------------ */
  function pointerPolish() {
    if (!fine || reduce) return;
    var queued = false;
    var last = null;

    function apply() {
      queued = false;
      if (!last) return;
      var x = last.x, y = last.y, t = last.t;
      var spot = t.closest ? t.closest('[data-spot]') : null;
      if (spot) {
        var r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', ((x - r.left) / (r.width || 1)).toFixed(3));
        spot.style.setProperty('--my', ((y - r.top) / (r.height || 1)).toFixed(3));
      }
      var mag = t.closest ? t.closest('.btn[data-mag]') : null;
      if (mag) {
        var mr = mag.getBoundingClientRect();
        var dx = (x - (mr.left + mr.width / 2)) / (mr.width || 1);
        var dy = (y - (mr.top + mr.height / 2)) / (mr.height || 1);
        // Capped at a few pixels: a lean, not a jump.
        mag.style.setProperty('--tx', (dx * 7).toFixed(2) + 'px');
        mag.style.setProperty('--ty', (dy * 5).toFixed(2) + 'px');
      }
      last = null;
    }

    doc.addEventListener('pointermove', function (ev) {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      last = { x: ev.clientX, y: ev.clientY, t: ev.target };
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    }, { passive: true });

    doc.addEventListener('pointerout', function (ev) {
      var mag = ev.target && ev.target.closest ? ev.target.closest('.btn[data-mag]') : null;
      if (mag) {
        mag.style.setProperty('--tx', '0px');
        mag.style.setProperty('--ty', '0px');
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 6. Scroll progress fallback for browsers without scroll-driven CSS
   * ------------------------------------------------------------------ */
  function progressFallback() {
    if (reduce) return;
    var native = false;
    try {
      native = CSS.supports('animation-timeline', 'scroll()');
    } catch (e) {}
    if (native) return;
    var queued = false;
    function write() {
      queued = false;
      var se = doc.scrollingElement || root;
      var max = se.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, se.scrollTop / max)) : 0;
      root.style.setProperty('--rz-progress', p.toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(write);
      }
    }, { passive: true });
    write();
  }

  /* ------------------------------------------------------------------ *
   * 7. Run, and keep running as the runtime mounts content
   * ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ *
   * 6b. Product-in-motion: the phones and the transcript
   *
   * The "out loud" section used to be a pair of frozen screenshots. A call
   * timer that actually ticks, a message that arrives, and a short transcript
   * that types itself as the section is scrolled is the cheapest way to make
   * the product feel audible without remounting the live demo.
   * ------------------------------------------------------------------ */
  function livePhones(scope) {
    var rootEl = (scope && scope.querySelector) ? scope : doc;
    var kv = doc.getElementById('kiravoice');
    if (kv && kv.getAttribute('data-kv-live') !== '1') {
      kv.setAttribute('data-kv-live', '1');
      if (window.IntersectionObserver) {
        var kio = new IntersectionObserver(function (es) {
          if (es[0] && es[0].isIntersecting) kv.setAttribute('data-on', '1');
        }, { threshold: 0.18 });
        kio.observe(kv);
      } else {
        kv.setAttribute('data-on', '1');
      }
    }

    var timers = rootEl.querySelectorAll('[data-call-timer]:not([data-live])');
    for (var i = 0; i < timers.length; i++) {
      (function (el) {
        el.setAttribute('data-live', '1');
        var start = parseInt(el.getAttribute('data-call-timer'), 10) || 0;
        var t0 = Date.now();
        var id = null;
        function fmt(s) {
          var m = Math.floor(s / 60);
          var r = s % 60;
          return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
        }
        function tick() {
          el.textContent = fmt(start + Math.floor((Date.now() - t0) / 1000));
        }
        function play() {
          if (id || reduce) return;
          tick();
          id = setInterval(tick, 1000);
        }
        function pause() {
          if (id) { clearInterval(id); id = null; }
        }
        if (reduce) {
          el.textContent = fmt(start);
          return;
        }
        if (window.IntersectionObserver) {
          var tio = new IntersectionObserver(function (es) {
            if (es[0] && es[0].isIntersecting) play();
            else pause();
          }, { threshold: 0.2 });
          tio.observe(el);
        } else {
          play();
        }
      })(timers[i]);
    }

    var scripts = rootEl.querySelectorAll('[data-transcript]:not([data-live])');
    for (var s = 0; s < scripts.length; s++) {
      (function (host) {
        host.setAttribute('data-live', '1');
        var lines = host.querySelectorAll('li');
        if (!lines.length) return;
        var queued = false;
        function update() {
          queued = false;
          var sec = host.closest('section') || host;
          var r;
          try { r = sec.getBoundingClientRect(); } catch (e) { return; }
          var vh = window.innerHeight || 800;
          var p = (vh * 0.7 - r.top) / Math.max(r.height, 1);
          p = Math.min(1, Math.max(0, p));
          var n = Math.round(p * (lines.length - 1));
          if (reduce) n = lines.length - 1;
          for (var j = 0; j < lines.length; j++) {
            if (j <= n) lines[j].setAttribute('data-on', '1');
            else lines[j].removeAttribute('data-on');
          }
        }
        window.addEventListener('scroll', function () {
          if (queued) return;
          queued = true;
          requestAnimationFrame(update);
        }, { passive: true });
        update();
      })(scripts[s]);
    }
  }

  function pass(scope) {
    try { documentBasics(); } catch (e) {}
    try { honorHash(); } catch (e) {}
    try { enhance(scope); } catch (e) {}
    try { splitAll(scope); } catch (e) {}
    try { accessibleAccordions(scope); } catch (e) {}
    try { collect(scope); } catch (e) {}
    try { livePhones(scope); } catch (e) {}
  }

  function boot() {
    pass(doc);
    pointerPolish();
    progressFallback();

    if (!window.MutationObserver) {
      // No observer: make sure late content is never left hidden.
      setTimeout(disarm, 2500);
      return;
    }

    // Content mounted by the client-side runtime is resolved in the same microtask
    // it is inserted, which is before the browser paints it — so arming the hidden
    // state cannot cause a flash of already-visible content.
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      // Microtask, not a timer: still ahead of paint.
      Promise.resolve().then(function () {
        queued = false;
        pass(doc);
      });
    });
    mo.observe(doc.documentElement, { childList: true, subtree: true });

    // The runtime is settled well before this; stop watching so long sessions do
    // not pay for subtree observation forever.
    setTimeout(function () {
      try { mo.disconnect(); } catch (e) {}
      pass(doc);
    }, 12000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
