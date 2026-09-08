/* Rezonate - mobile conversion + nav layer.
   1) Persistent thumb-zone CTA bar on phones (<=560px), self-configuring from
      the page's primary nav CTA (.nav-cta-d). Hidden on desktop via CSS.
   2) A real hamburger menu on tablet/phone (<=860px): the inline .nav-links are
      hidden by CSS at that width and this builds a tap-friendly dropdown from
      them so the nav is never a row of cramped 11px links. Desktop (>=861px) is
      untouched - the button + panel are display:none there.
   Everything is injected/hidden behind media queries, so desktop renders
   byte-for-byte as before. */
(function(){
  if (window.__rzMcta) return; window.__rzMcta = true;
  /* Design-editor preview guard: inside the Claude Design editor the DC runtime
     re-renders the tree while streaming, endlessly stripping the nodes this
     script's MutationObservers re-inject - a microtask feedback loop that
     freezes the tab. This glue is production-only; bail in the editor.
     (Path never matches on getrezonate.com, so deploys are unaffected.) */
  if (location.pathname.indexOf('/v1/design/') !== -1) return;

  /* ---------- 0a. Framed-preview safe-area fallback ----------
     Inside an <iframe> (e.g. the Mobile Preview device mock) the browser
     reports env(safe-area-inset-top)=0, so the glass nav rides up under the
     frame's drawn Dynamic Island. Real notched devices are unaffected (this
     only runs when embedded). Add a class the stylesheet keys a fallback off. */
  try { if (window.self !== window.top) document.documentElement.classList.add('rz-framed'); }
  catch(e){ document.documentElement.classList.add('rz-framed'); }

  /* ---------- 0. Uniform section rhythm on phone/tablet ---------- */
  function normalizePadding(){
    if (window.innerWidth > 1024) return;
    var pad = Math.round(Math.min(104, Math.max(72, window.innerWidth * 0.09)));
    /* the top-of-page section sits UNDER the fixed nav pill; measure the nav so its
       hero heading always clears it (a plain `pad` was too small when the first
       section is a normal section, e.g. Solutions' #live-demo, and tucked the
       heading behind the nav). */
    var navEl = document.querySelector('.nav-wrap');
    var navClear = navEl ? Math.round(navEl.getBoundingClientRect().bottom + 56) : 116;
    document.querySelectorAll('section[data-screen-label]').forEach(function(s){
      if (s.id === 'cinehero' || s.querySelector('canvas[data-seq]')) return;
      var cs = getComputedStyle(s);
      var pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
      /* only normalize sections that carry their own padding (inner-padded ones stay) */
      if (pt > 8 || pb > 8) {
        var topPad = (s.offsetTop < 10) ? Math.max(pad, navClear) : pad;
        s.style.setProperty('padding-top', topPad + 'px', 'important');
        s.style.setProperty('padding-bottom', pad + 'px', 'important');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizePadding);
  else normalizePadding();
  /* DC pages render sections after first paint - re-run a few times so the late
     first section still gets its nav clearance. */
  [300, 900, 1800].forEach(function(t){ setTimeout(normalizePadding, t); });
  /* DC sections appear after hydration; a MutationObserver callback runs as a
     microtask BEFORE the next paint, so normalizing here means the section's
     first painted frame already has its mobile padding - no layout shift.
     The timeouts above stay as a belt-and-braces fallback. */
  try{
    new MutationObserver(function(){ normalizePadding(); })
      .observe(document.getElementById('dc-root') || document.body, { childList:true, subtree:true });
  }catch(_){}
  window.addEventListener('resize', function(){ clearTimeout(window.__rzPadT); window.__rzPadT = setTimeout(normalizePadding, 180); });

  /* ---------- 1. Sticky CTA bar ---------- */
  function ensureBar(){
    var bar = document.getElementById('rz-mcta');
    if (bar) return bar;
    bar = document.createElement('a');
    bar.id = 'rz-mcta';
    bar.className = 'mcta';
    bar.setAttribute('href', '#demo');
    bar.innerHTML =
      '<span class="mcta-dot" aria-hidden="true"></span>' +
      '<span class="mcta-l">Request a demo</span>' +
      '<span class="mcta-go" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg></span>';
    if (document.body) document.body.appendChild(bar);
    return bar;
  }
  function configureBar(){
    var bar = ensureBar();
    if (!bar) return false;
    var primary  = document.querySelector('.nav-cta-d');
    var demoLink = document.querySelector('a[href*="#demo"]');
    var href  = (primary && primary.getAttribute('href'))
             || (demoLink && demoLink.getAttribute('href'))
             || '#demo';
    var label = (primary && primary.textContent.trim()) || 'Request a demo';
    bar.setAttribute('href', href);
    bar.setAttribute('aria-label', label);
    var l = bar.querySelector('.mcta-l'); if (l) l.textContent = label;
    if (document.querySelector('.rzfab')) bar.classList.add('mcta-fab');
    return !!primary;
  }

  /* ---------- 2. Hamburger menu ---------- */
  function buildMenu(){
    var navbar  = document.querySelector('.nav-bar');
    var navwrap = document.querySelector('.nav-wrap');
    var links   = document.querySelector('.nav-links');
    if (!navbar || !navwrap || !links) return false;
    if (navbar.querySelector('.rzmenu-btn')) return true;
    /* Unify EVERY page on this one injected button. Any page-level markup toggle
       (.nav-toggle / .sheet) is hidden by injectNavCSS(), so there is exactly one
       button - identical size, position and behavior - on every page. */
    var anchors = links.querySelectorAll('a');
    if (!anchors.length) return false;

    var btn = document.createElement('button');
    btn.className = 'rzmenu-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    navbar.appendChild(btn);

    var panel = document.createElement('div');
    panel.className = 'rzmenu';
    /* Canonical industry list so every page's menu is identical (some pages have
       no .indbar to read from). Current page is marked from the URL. */
    var INDUSTRIES = [
      ['Healthcare', 'Industry-Healthcare.dc.html'],
      ['Finance',    'Industry-Financial.dc.html'],
      ['Business',   'Industry-Business.dc.html'],
      ['Sports',     'Industry-Sports.dc.html']
    ];
    var RESOURCES = [
      ['Newsroom', 'Newsroom.dc.html'],
      ['Articles', 'Articles.dc.html'],
      ['Careers', 'Careers.dc.html']
    ];
    var here = (location.pathname.split('/').pop() || '').toLowerCase();
    /* Fold a labelled group (Industries, Resources) into a tap-to-expand accordion. */
    function foldGroup(label, list){
      var acc = document.createElement('button');
      acc.type = 'button'; acc.className = 'rzmenu-acc'; acc.setAttribute('data-open','0');
      acc.innerHTML = label + ' <svg class="rzmenu-chev" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var wrap = document.createElement('div'); wrap.className = 'rzmenu-subwrap'; wrap.setAttribute('data-open','0');
      var inner = document.createElement('div'); inner.className = 'rzmenu-subinner';
      list.forEach(function(pair){
        var sl = document.createElement('a');
        sl.href = pair[1]; sl.textContent = pair[0]; sl.className = 'rzmenu-sub';
        if (pair[1].toLowerCase() === here) sl.classList.add('cur');
        inner.appendChild(sl);
      });
      wrap.appendChild(inner);
      panel.appendChild(acc); panel.appendChild(wrap);
    }
    anchors.forEach(function(a){
      if (a.closest && a.closest('.navdrop')) return; /* dropdown items live under a group */
      var label = a.textContent.trim();
      if (/^industries$/i.test(label)){ foldGroup('Industries', INDUSTRIES); return; }
      if (/^resources$/i.test(label)){ foldGroup('Resources', RESOURCES); return; }
      var l = document.createElement('a');
      l.href = a.getAttribute('href') || '#';
      l.textContent = label;
      panel.appendChild(l);
    });
    var cta = document.querySelector('.nav-cta-d');
    if (cta){
      var c = document.createElement('a');
      c.href = cta.getAttribute('href') || '#demo';
      c.textContent = cta.textContent.trim();
      c.className = 'rzmenu-cta';
      panel.appendChild(c);
    }
    navwrap.appendChild(panel);

    function set(open){
      btn.setAttribute('data-open', open ? '1' : '0');
      panel.setAttribute('data-open', open ? '1' : '0');
    }
    set(false);
    btn.addEventListener('click', function(e){ e.stopPropagation(); set(panel.getAttribute('data-open') !== '1'); });
    panel.addEventListener('click', function(e){ if (e.target.closest('a')) set(false); });
    document.addEventListener('click', function(e){ if (!navwrap.contains(e.target)) set(false); });
    return true;
  }

  /* Single source of truth for the mobile nav button. Injected at runtime so it
     overrides every page's inline CSS (later in the cascade + !important): hides
     all markup toggles and the in-bar CTA, and styles the one injected button to
     the homepage look (transparent, 44px, three thin white lines → X). Identical
     on every page by construction. */
  function injectNavCSS(){
    if (document.getElementById('rz-navfix')) return;
    var s = document.createElement('style');
    s.id = 'rz-navfix';
    s.textContent =
      '@media(min-width:861px){.rzmenu,.rzmenu-btn{display:none!important}}' +
      '@media(max-width:860px){' +
        '.nav-bar .nav-links{display:none!important}' +
        '.nav-toggle{display:none!important}' +
        '.nav-bar .nav-cta-d{display:none!important}' +
        '.rzmenu-btn{display:flex!important;flex:0 0 auto;width:44px;height:44px;background:transparent!important;border:none!important;border-radius:12px;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0;cursor:pointer}' +
        '.rzmenu-btn span{display:block!important;width:18px;height:2px;background:#fff!important;border-radius:2px;transition:transform .3s,opacity .3s}' +
        '.rzmenu-btn[data-open="1"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}' +
        '.rzmenu-btn[data-open="1"] span:nth-child(2){opacity:0}' +
        '.rzmenu-btn[data-open="1"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}' +
        '.rzmenu[data-open="1"]{display:flex!important}' +
      '}';
    (document.body || document.head || document.documentElement).appendChild(s);
  }

  function tick(){
    var a = configureBar();
    var b = buildMenu();
    alignIndbar();
    return a && b;
  }

  /* Align the industry sub-bar so its center sits under the nav links' center
     (desktop only). Measured live so it tracks each page's CTA width and the
     viewport. On mobile (<=820px) the bar is a CSS scrollable strip - leave it. */
  function alignIndbar(){
    var links = document.querySelector('.nav-links');
    var bar = document.querySelector('.indbar');
    if (!links || !bar) return;
    if (window.innerWidth <= 820){ bar.style.left = ''; bar.style.transform = ''; return; }
    var r = links.getBoundingClientRect();
    if (!r.width) return;
    bar.style.left = (r.left + r.width / 2) + 'px';
    bar.style.transform = 'translateX(-50%)';
  }
  window.addEventListener('resize', alignIndbar);

  /* Tap-to-expand the "Industries" group in any mobile menu (injected .rzmenu
     or the markup .nav-sheet). Delegated so it works no matter when the menu
     is built. */
  document.addEventListener('click', function(e){
    var acc = e.target.closest && e.target.closest('.rzmenu-acc, .sheet-acc');
    if (!acc) return;
    e.preventDefault(); e.stopPropagation();
    var wrap = acc.nextElementSibling;
    if (!wrap || !wrap.classList.contains('rzmenu-subwrap')) return;
    var open = acc.getAttribute('data-open') === '1';
    acc.setAttribute('data-open', open ? '0' : '1');
    wrap.setAttribute('data-open', open ? '0' : '1');
  }, true);

  function run(){
    injectNavCSS();
    tick();
    var n = 0, iv = setInterval(function(){ if (tick() || ++n > 60) clearInterval(iv); }, 100);
    /* Keep re-aligning the sub-bar for a couple seconds while fonts/CTA settle
       (their final widths shift the nav links' center), then on every resize. */
    var m = 0, av = setInterval(function(){ alignIndbar(); if (++m > 16) clearInterval(av); }, 130);
    /* DC pages can render the nav AFTER the short retry window above; watch the
       DOM and re-run until the one button is injected, then a slow permanent
       heartbeat re-injects it if a re-render ever wipes it. Guarantees the same
       button on every page no matter how late or how often the nav renders. */
    try {
      var mo = new MutationObserver(function(){
        injectNavCSS();
        if (buildMenu() && document.querySelector('.rzmenu-btn')) mo.disconnect();
      });
      mo.observe(document.documentElement, { childList:true, subtree:true });
    } catch(e){}
    setInterval(function(){ injectNavCSS(); buildMenu(); }, 1000);
    window.addEventListener('load', function(){ injectNavCSS(); tick(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignIndbar);
    wireMctaAutohide();
  }

  /* ---------- Scroll-aware CTA bar ----------
     The persistent bar otherwise sits permanently over content (cutting hero
     stats, demo quotes, bios). Hide it during the cinematic hero and while the
     reader scrolls DOWN; reveal it on scroll-up or at the page end. */
  function wireMctaAutohide(){
    if (window.__rzMctaAuto) return; window.__rzMctaAuto = true;
    var lastY = window.pageYOffset || 0, hidden = false;
    function heroEl(){ return document.querySelector('[data-screen-label="Hero"],[data-screen-label="Industry hero"],#cinehero'); }
    function onScroll(){
      var bar = document.getElementById('rz-mcta'); if (!bar) return;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var vh = window.innerHeight, docH = document.documentElement.scrollHeight;
      var h = heroEl();
      var heroCovers = h ? (h.getBoundingClientRect().bottom > vh * 0.6) : (y < vh * 0.85);
      var nearBottom = (y + vh) > (docH - 60);
      var want;
      if (nearBottom) want = true;
      else if (heroCovers) want = false;
      else if (y > lastY + 5) want = false;
      else if (y < lastY - 5) want = true;
      else want = !hidden;
      if (want && hidden) { bar.classList.remove('mcta-hidden'); hidden = false; }
      else if (!want && !hidden) { bar.classList.add('mcta-hidden'); hidden = true; }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    /* poll briefly until the bar is injected so the initial state is right */
    var t = 0, iv = setInterval(function(){ onScroll(); if (document.getElementById('rz-mcta') || ++t > 30) clearInterval(iv); }, 100);
  }

  /* ---------- 3. "Industries" → glow the sub-bar instead of navigating ----------
     Universal: on any page that has the industry sub-bar (.indbar), clicking an
     "Industries" nav link (desktop or in the injected mobile menu) lights up the
     strip rather than reloading the homepage. Pages with no .indbar fall through
     to normal navigation (to the homepage industries section). */
  function wireIndustriesGlow(){
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a.navlink, .rzmenu a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#industries') === -1) return;
      var bar = document.querySelector('.indbar');
      if (!bar) return; /* no strip here → allow navigation */
      e.preventDefault();
      var panel = document.querySelector('.rzmenu'), btn = document.querySelector('.rzmenu-btn');
      if (panel) panel.setAttribute('data-open', '0');
      if (btn) btn.setAttribute('data-open', '0');
      var links = [].slice.call(bar.querySelectorAll('.indlink'));
      bar.classList.remove('glow'); links.forEach(function(l){ l.classList.remove('lit'); });
      void bar.offsetWidth;
      bar.classList.add('glow');
      links.forEach(function(l, i){ setTimeout(function(){ l.classList.add('lit'); setTimeout(function(){ l.classList.remove('lit'); }, 680); }, 70 + i * 120); });
      setTimeout(function(){ bar.classList.remove('glow'); }, 1500);
    }, true);
  }
  wireIndustriesGlow();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

/* ---------- Email links ----------
   The preview CDN scrambles any literal email in the HTML, so we set the
   real address (href + text) at runtime. Renders as a normal mailto link. */
(function(){
  if (window.__rzMail) return; window.__rzMail = true;
  function build(a){
    if (!a) return;
    var u = a.getAttribute('data-u'), d = a.getAttribute('data-d');
    if (!u || !d) return;
    var href = 'mailto:' + u + '@' + d;
    if (a.getAttribute('href') !== href) a.setAttribute('href', href);
  }
  function scan(root){
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('a[data-u][data-d]').forEach(build);
  }
  scan(document);
  [0, 200, 600, 1500].forEach(function(t){ setTimeout(function(){ scan(document); }, t); });
  try {
    var mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        var ns = muts[i].addedNodes;
        for (var j=0;j<ns.length;j++){
          var n = ns[j];
          if (n.nodeType === 1){
            if (n.matches && n.matches('a[data-u][data-d]')) build(n);
            scan(n);
          }
        }
      }
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  } catch(e){}
})();


/* nav-ready gate: no animated nav on first paint/refresh */
(function(){
  var el = document.documentElement;
  function ok(){ el.classList.add('nav-ready'); }
  var loaded = new Promise(function(r){ if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fonts]).then(function(){ setTimeout(ok, 150); });
  setTimeout(ok, 3000);
})();
