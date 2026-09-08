/* Rezonate smooth-scroll - Lenis-style inertial wheel scrolling.
   Animates the REAL scrollTop on a rAF lerp (never transforms the page), so
   every scroll-driven effect on the site - the cinematic hero scrub, parallax
   (data-par / data-py), and reveal triggers - rides the same eased motion and
   feels like one continuous, weighted glide instead of stepping with the wheel.

   Safety: desktop pointer only (touch keeps native momentum), respects
   reduced-motion, yields to nested scrollers (menu sheet, chat, modals), and
   FEATURE-TESTS on first wheel - if the host blocks programmatic scrolling
   (e.g. a screenshot sandbox), it disables itself and leaves native scroll
   untouched rather than preventing default and freezing the page. */
(function(){
  if (location.pathname.indexOf('/v1/design/') !== -1) return; /* editor-preview bail; never matches on getrezonate.com */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  if (reduce || coarse) return;

  var se = document.scrollingElement || document.documentElement;
  var EASE = 0.18;           /* lerp toward target - higher = snappier, locked feel (was .095, too floaty) */
  var WHEEL = 1.0;           /* wheel-delta gain */
  var target = 0, current = 0, running = false;
  var tested = false, ok = false;

  function maxS(){ return se.scrollHeight - se.clientHeight; }
  function clamp(v){ var m = maxS(); return v < 0 ? 0 : v > m ? m : v; }

  /* One-time probe: can we actually move the scroll position here? */
  function canScroll(){
    var y = se.scrollTop;
    if (y > 0) return true;
    se.scrollTop = y + 2;
    var moved = se.scrollTop !== y;
    se.scrollTop = y;
    return moved;
  }

  function loop(){
    var d = target - current;
    if (Math.abs(d) < 0.5){ current = target; se.scrollTop = current; running = false; return; }
    current += d * EASE;
    se.scrollTop = current;
    requestAnimationFrame(loop);
  }
  function start(){ if (!running){ running = true; requestAnimationFrame(loop); } }

  /* Let an inner scroll area (mobile menu sheet, chat panel, modal) scroll natively. */
  function nested(el){
    while (el && el !== document.body && el !== document.documentElement){
      var s;
      try { s = getComputedStyle(el); } catch(e){ return false; }
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2) return true;
      el = el.parentElement;
    }
    return false;
  }

  window.addEventListener('wheel', function(e){
    if (e.ctrlKey) return;                       /* pinch-zoom */
    if (!tested){ tested = true; ok = canScroll(); }
    if (!ok) return;                             /* host blocks programmatic scroll → native */
    if (nested(e.target)) return;
    e.preventDefault();
    if (!running){ current = se.scrollTop; target = current; }
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? se.clientHeight : 1);
    target = clamp(target + dy * WHEEL);
    start();
  }, { passive:false });

  /* Resync the glide to the real position whenever something else moves it
     (keyboard paging, anchor jumps, focus, drag). */
  function sync(){ if (!running){ current = target = se.scrollTop; } }
  ['keydown','mousedown','touchstart'].forEach(function(ev){
    window.addEventListener(ev, sync, { passive:true });
  });
  window.addEventListener('resize', function(){ target = clamp(target); });
})();
