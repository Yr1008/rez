(function () {
  var PORTAL = '4034633';
  function build() {
    if (document.getElementById('rzModal')) return;
    var demo = window.RZ_DEMO_FORM || 'b445588a-290a-4278-adb1-367d98a82477';
    var contact = window.RZ_CONTACT_FORM || '260ae856-9aa9-4c33-8a63-d7adbf586e29';
    var m = document.createElement('div');
    m.id = 'rzModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:3000;display:none;align-items:flex-start;justify-content:center;padding:5vh 16px;overflow-y:auto;background:rgba(10,10,12,.62);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)';
    m.innerHTML =
      '<div role="dialog" aria-modal="true" style="position:relative;width:100%;max-width:560px;background:#fff;border-radius:24px;padding:38px 30px 30px;box-shadow:0 40px 110px -30px rgba(0,0,0,.6);font-family:Open Sans,system-ui,sans-serif">'
      + '<button type="button" aria-label="Close" data-rzclose style="position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:none;background:#f0eee9;color:#141414;font-size:22px;line-height:1;cursor:pointer">&times;</button>'
      + '<div data-rzpane="demo"><h3 style="font-family:Bricolage Grotesque,Open Sans,sans-serif;font-weight:600;font-size:23px;letter-spacing:-.02em;margin:0 0 4px;color:#141414">Request a demo</h3><p style="margin:0 0 18px;color:#75726D;font-size:14px">See Kira on your workflows. We\u2019ll be in touch within one business day.</p><div class="hs-form-frame" data-region="na1" data-form-id="' + demo + '" data-portal-id="' + PORTAL + '"></div></div>'
      + '<div data-rzpane="contact" style="display:none"><h3 style="font-family:Bricolage Grotesque,Open Sans,sans-serif;font-weight:600;font-size:23px;letter-spacing:-.02em;margin:0 0 4px;color:#141414">Contact us</h3><p style="margin:0 0 18px;color:#75726D;font-size:14px">Questions, partnerships, or press \u2014 send us a note.</p><div class="hs-form-frame" data-region="na1" data-form-id="' + contact + '" data-portal-id="' + PORTAL + '"></div></div>'
      + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.hasAttribute && e.target.hasAttribute('data-rzclose'))) hide();
    });
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
  }
  function hide() {
    var m = document.getElementById('rzModal');
    if (m) { m.style.display = 'none'; document.documentElement.style.overflow = ''; }
  }
  window.rzOpenForm = show;
  window.rzCloseForm = hide;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('[data-rzform], a[href$="#demo"]');
    if (!t) return;
    e.preventDefault();
    show(t.getAttribute('data-rzform') || 'demo');
  }, true);
  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);

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
