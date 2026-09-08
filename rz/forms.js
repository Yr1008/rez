(function () {
  /* Every demo / contact CTA opens this modal, on the page the visitor is
     already on - no navigation.

     The HubSpot standard embed is framed from /embed/form rather than injected
     into this document. HubSpot then renders the actual form in its own hosted
     iframe, keeping third-party runtime code outside the strict site document.
     The wrapper is a fragment, not a page: nothing links to it, it is noindex,
     and opening it top-level bounces to the site. */
  var EMBED_URL = '/embed/form';

  function paneHTML(pane, title, sub) {
    return '<div data-rzpane="' + pane + '">'
      + '<h3 class="rzm-title">' + title + '</h3>'
      + '<p class="rzm-sub">' + sub + '</p>'
      + '<div data-rzform-consent><p>This form is provided by HubSpot. Enable forms to load it and allow HubSpot storage.</p><button type="button" data-rzenableforms>Enable form</button></div>'
      + '<div class="rzm-embed" data-rzembed></div>'
      + '<p class="rzm-fine">By submitting, you acknowledge our <a href="Privacy.dc.html" target="_blank" rel="noopener" class="rzm-link">Privacy Policy</a> and <a href="Terms.dc.html" target="_blank" rel="noopener" class="rzm-link">Terms of Service</a>. Prefer e-mail? <a href="mailto:hello@getrezonate.com" class="rzm-link">hello@getrezonate.com</a></p>'
      + '</div>';
  }

  function build() {
    if (document.getElementById('rzModal')) return;
    if (!document.getElementById('rz-forms-style')) {
      var link = document.createElement('link');
      link.id = 'rz-forms-style';
      link.rel = 'stylesheet';
      link.href = 'rz/forms.css?v=6';
      document.head.appendChild(link);
    }
    var m = document.createElement('div');
    m.id = 'rzModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:3000;display:none;align-items:flex-start;justify-content:center;padding:5vh 16px;overflow-y:auto;background:rgba(10,10,12,.62);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)';
    m.innerHTML =
      '<div role="dialog" aria-modal="true" class="rzm-card">'
      + '<button type="button" aria-label="Close" data-rzclose class="rzm-close">&times;</button>'
      + paneHTML('demo', 'Request a demo', 'See Kira on your workflows. We’ll be in touch within one business day.')
      + paneHTML('contact', 'Contact us', 'Questions, partnerships, or press — send us a note.')
      + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-rzenableforms')) {
        if (window.RZConsent) window.RZConsent.set({ marketing: true });
        syncConsent();
        return;
      }
      if (e.target === m || (e.target.hasAttribute && e.target.hasAttribute('data-rzclose'))) hide();
    });
  }

  function each(sel, fn) {
    var m = document.getElementById('rzModal');
    if (!m) return;
    var list = m.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i]);
  }

  function addFrames() {
    var from = location.pathname.replace(/^\/|\.dc(\.html)?$/g, '') || 'home';
    each('[data-rzembed]', function (box) {
      if (box.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.className = 'rzm-frame';
      f.title = 'Request a demo';
      f.src = EMBED_URL + '?from=' + encodeURIComponent(from);
      box.appendChild(f);
    });
  }
  function removeFrames() {
    each('[data-rzembed]', function (box) {
      while (box.firstChild) box.removeChild(box.firstChild);
    });
  }

  /* Same-origin, so the form's height can be read directly - no message
     protocol to keep in sync - and it tracks the form as HubSpot adds
     validation messages or swaps in its thank-you state. */
  function autosize() {
    each('[data-rzembed] iframe', function (f) {
      try {
        var d = f.contentDocument;
        if (!d || !d.body) return;
        var h = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight);
        if (h > 40) f.style.height = h + 'px';
      } catch (e) { /* pre-navigation; the next tick will get it */ }
    });
  }
  function frameHasContent() {
    var found = false;
    each('[data-rzembed] iframe', function (f) {
      try {
        var d = f.contentDocument;
        if (d && d.querySelector('form, iframe')) found = true;
      } catch (e) { /* treat as no content */ }
    });
    return found;
  }
  function noteFailure() {
    each('[data-rzform-consent]', function (el) {
      el.style.display = 'block';
      el.querySelector('p').innerHTML = 'The form could not be loaded. Please email us at <a href="mailto:hello@getrezonate.com" class="rzm-link-strong">hello@getrezonate.com</a> and we’ll get right back to you.';
      var btn = el.querySelector('[data-rzenableforms]');
      if (btn) btn.style.display = 'none';
    });
  }

  var ticker = null;
  function startTicking() {
    if (ticker) return;
    var waited = 0;
    ticker = setInterval(function () {
      waited += 400;
      autosize();
      if (waited === 8000 && !frameHasContent()) noteFailure();
    }, 400);
  }
  function stopTicking() {
    if (!ticker) return;
    clearInterval(ticker);
    ticker = null;
  }

  function syncConsent() {
    var m = document.getElementById('rzModal');
    if (!m) return;
    var allowed = !window.RZConsent || window.RZConsent.has('marketing');
    each('[data-rzform-consent]', function (el) { el.style.display = allowed ? 'none' : 'block'; });
    if (allowed) {
      addFrames();
      startTicking();
    } else {
      /* HubSpot sets cookies, so nothing loads before consent. */
      removeFrames();
      stopTicking();
    }
  }

  function show(pane) {
    build();
    var m = document.getElementById('rzModal');
    var ps = m.querySelectorAll('[data-rzpane]');
    for (var i = 0; i < ps.length; i++) {
      ps[i].style.display = ps[i].getAttribute('data-rzpane') === pane ? 'block' : 'none';
    }
    m.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    syncConsent();
  }
  function hide() {
    var m = document.getElementById('rzModal');
    if (m) { m.style.display = 'none'; document.documentElement.style.overflow = ''; }
    stopTicking();
  }
  window.rzOpenForm = show;
  window.rzCloseForm = hide;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  window.addEventListener('rzconsentchange', syncConsent);
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('[data-rzform], a[href$="#demo"]');
    if (!t) return;
    e.preventDefault();
    show(t.getAttribute('data-rzform') || 'demo');
  }, true);
  function init() {
    build();
    /* Cross-page CTAs point at Rezonate.dc.html#demo; open the form on arrival
       so those land in the same place as every other CTA. */
    if (location.hash === '#demo') show('demo');
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  /* Self-diagnosis: if the browser's policy ever blocks part of the pipeline
     again, name the directive right in the open modal, so a screenshot is
     enough to identify it. */
  document.addEventListener('securitypolicyviolation', function (e) {
    var m = document.getElementById('rzModal');
    if (!m || getComputedStyle(m).display === 'none') return;
    if (!/hsforms|hubspot|hubapi|google|gstatic|recaptcha|embed/.test(e.blockedURI || '')) return;
    var card = m.querySelector('.rzm-card');
    if (!card) return;
    var d = card.querySelector('.rzm-diag');
    if (!d) {
      d = document.createElement('p');
      d.className = 'rzm-fine rzm-diag';
      card.appendChild(d);
    }
    d.textContent = 'Diagnostic: the browser blocked "' + e.effectiveDirective
      + '" for ' + (e.blockedURI || '').split('?')[0].slice(0, 70)
      + ' - please screenshot this line.';
  });

  // Eased in-page anchor glide (skips #demo, handled above)
  function glide(toY, dur) {
    var startY = window.pageYOffset || document.documentElement.scrollTop;
    var diff = toY - startY, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, startY + diff * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest) return;
    var a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id === '#demo') return;
    var el = document.querySelector(id);
    if (!el) return;
    ev.preventDefault();
    var y = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 8;
    glide(y, 1100);
  }, true);
})();
