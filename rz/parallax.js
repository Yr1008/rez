(function(){
  /* rAF-driven parallax + count-ups. Parallax tracks the (already smoothed)
     scroll position DIRECTLY - no second easing layer - so it feels responsive
     and locked to the page instead of floating behind it. Respects
     reduced-motion. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* Touch / small screens: parallax translate on native momentum scroll stutters and
     makes sections feel like they "jump". Skip the transforms there - reveals and
     count-ups (in counts()) still run every frame. IMPORTANT: evaluated on every
     collect(), not once - the page can load wide and be resized narrow (preview
     frames, window resize, rotation), and a stale value leaves transforms running. */
  function isCoarse(){ return (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || window.innerWidth <= 1024; }
  var items = [];
  function unboxAll(){
    /* Full-bleed [data-par] imagery is PRE-BOXED in the templates (width:110%;height:120%;
       inset:-10% auto auto -5%; data-par-box="1"), so geometry is never written at runtime -
       here we only clear transforms. Never remove the attribute or touch geometry: the DC
       renderer memoizes props and would not restore cleared inline styles. */
    [].forEach.call(document.querySelectorAll('[data-par],[data-py]'), function(el){
      el.style.transform = '';
    });
  }
  function collect(){
    items = [];
    if (isCoarse()){
      /* Phones/tablets: keep a GENTLE parallax on full-bleed imagery (dampened factor,
         translate3d only - composited, no layout) so the page still feels alive.
         data-py content-column drift stays off: shifting text columns reads as jumpy
         on touch. */
      [].forEach.call(document.querySelectorAll('[data-py]'), function(el){ el.style.transform=''; });
      [].forEach.call(document.querySelectorAll('[data-par]'), function(el){
        if (el.getAttribute('data-par-box') !== '1') return; /* only pre-boxed imagery is safe to drift */
        items.push({ el: el, f: (parseFloat(el.getAttribute('data-par')) || 0) * 0.6, scale: false, max: 34, settle: true });
      });
      return;
    }
    /* data-par: full-bleed imagery. We enlarge the element's BOX by ~10% (so the
       browser rasterizes it crisp at final size) and move it with pure
       translate3d - no transform:scale(), which would upscale-blur the layer. */
    [].forEach.call(document.querySelectorAll('[data-par]'), function(el){
      if (el.getAttribute('data-par-box') !== '1'){
        var pos = '';
        try { pos = getComputedStyle(el).position; } catch(e){}
        if (pos === 'absolute' || pos === 'fixed'){
          /* grow 10% and recentre so drift never reveals an edge - crisp, no scale() */
          el.style.width = '110%'; el.style.height = '120%';
          el.style.left = '-5%';  el.style.top = '-10%';
          el.style.right = 'auto'; el.style.bottom = 'auto';
          el.setAttribute('data-par-box','1');
        } else {
          el.setAttribute('data-par-box','scale'); /* fallback: keep transform scale */
        }
      }
      var boxed = el.getAttribute('data-par-box') === '1';
      items.push({ el: el, f: parseFloat(el.getAttribute('data-par')) || 0, scale: !boxed, max: 9999, settle: boxed });
    });
    /* data-py: section content columns - pure translate (text stays sharp),
       clamped so a section never drifts far enough to collide with its neighbour. */
    [].forEach.call(document.querySelectorAll('[data-py]'), function(el){
      items.push({ el: el, f: parseFloat(el.getAttribute('data-py')) || 0, scale: false, max: 56 });
    });
  }
  function counts(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    /* reveal fallback: mark [data-rv] elements as they enter the viewport. Lives here because
       this loop re-queries the LIVE tree on every frame - immune to the runtime swapping the
       DOM after a logic class's own observer attached to a stale tree. */
    var rvs = document.querySelectorAll('[data-rv]:not([data-in="1"])');
    for (var r=0;r<rvs.length;r++){ if (rvs[r].getBoundingClientRect().top < vh*0.92){ rvs[r].setAttribute('data-in','1'); } }
    var els = document.querySelectorAll('.cnum:not([data-done])');
    for (var i=0;i<els.length;i++){ (function(el){
      if (el.getBoundingClientRect().top < vh*0.94){
        el.setAttribute('data-done','1');
        var pre = el.getAttribute('data-pre')||'', suf = el.getAttribute('data-suf')||'', val = parseFloat(el.getAttribute('data-val'))||0;
        if (reduce){ el.textContent = pre + Math.round(val) + suf; return; }
        var t0 = performance.now();
        function step(t){ var p = Math.min(1,(t-t0)/1100); p = 1-Math.pow(1-p,3); el.textContent = pre + Math.round(val*p) + suf; if(p<1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      }
    })(els[i]); }
    /* chart draw-in: ledger sparklines/axes draw themselves as they enter (timed with the
       count-ups they sit beside). One-time per path; restores inline styles after. */
    var dps = document.querySelectorAll('.ledger svg path:not([data-drawn])');
    for (var d=0;d<dps.length;d++){ (function(p, idx){
      var host = p.closest ? p.closest('.ledger') : null;
      if (!host || host.getBoundingClientRect().top >= vh*0.9) return;
      p.setAttribute('data-drawn','1');
      if (reduce) return;
      try{
        var L = p.getTotalLength();
        p.style.strokeDasharray = L + ' ' + L;
        p.style.strokeDashoffset = L;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.25s cubic-bezier(.3,.7,.2,1) ' + (idx*0.14) + 's';
        p.style.strokeDashoffset = '0';
        setTimeout(function(){ p.style.strokeDasharray=''; p.style.strokeDashoffset=''; p.style.transition=''; }, 1900 + idx*140);
      }catch(e){}
    })(dps[d], d); }
  }
  /* Logo marquees animate forever by default — pause them while offscreen
     (battery/CPU, matters most on phones). Re-scanned during streaming. */
  var mio = null, mseen = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;
  function watchMarquees(){
    if (!('IntersectionObserver' in window)) return;
    if (!mio){
      try{
        mio = new IntersectionObserver(function(es){
          for (var i=0;i<es.length;i++){ es[i].target.style.animationPlayState = es[i].isIntersecting ? '' : 'paused'; }
        }, {rootMargin:'80px'});
      }catch(e){ return; }
    }
    [].forEach.call(document.querySelectorAll('.logotrack'), function(el){
      if (mseen){ if (mseen.has(el)) return; mseen.add(el); }
      mio.observe(el);
    });
  }
  var running=false, lastKick=0, lastY=-1, lastCounts=0;
  function frame(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i=0;i<items.length;i++){
      var it = items[i], r = it.el.getBoundingClientRect();
      if (r.bottom < -240 || r.top > vh + 240){ continue; } /* offscreen: skip */
      var target = ((r.top + r.height/2) - vh/2) * it.f;
      /* boxed scale-image drift can't exceed the headroom the box gives, or an edge shows */
      var mx = it.scale ? r.height * 0.045 : it.max;
      if (target > mx) target = mx; else if (target < -mx) target = -mx;
      /* premium settle-in: full-bleed imagery eases from a hair larger to crisp
         1:1 as it first enters (compositor scale on the pre-boxed layer, so no
         edge can show and the FINAL state is untransformed = sharp). Image-only,
         one-time, skipped under reduced-motion. */
      var sc = it.scale ? ' scale(1.1)' : '';
      if (it.settle && !reduce){
        if (!it.el._stl && r.top < vh*0.96 && r.bottom > 0){ it.el._stl = performance.now(); }
        if (it.el._stl){
          var sp = (performance.now() - it.el._stl) / 950;
          if (sp < 1){ var se = 1 - Math.pow(1 - sp, 3); sc = ' scale(' + (1.045 - 0.045*se).toFixed(4) + ')'; }
        }
      }
      /* lock directly to the scroll position - the scroll is already eased upstream */
      it.el.style.transform = 'translate3d(0,' + Math.round(target) + 'px,0)' + sc;
    }
    /* counts() re-queries the whole tree (reveal fallback, count-ups, chart
       draw-ins) — at 60fps that's real main-thread cost while scrolling on
       phones. ~8/s is indistinguishable for entrance effects. */
    var nowT = performance.now();
    if (nowT - lastCounts > 120){ lastCounts = nowT; counts(); }
    /* Keep looping while the (eased) scroll is still moving so parallax never
       freezes mid-glide and trails behind; stop only once it settles. */
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var moving = Math.abs(y - lastY) > 0.25; lastY = y;
    if (moving || performance.now() - lastKick < 260){ requestAnimationFrame(frame); }
    else { running = false; }
  }
  function kick(){ lastKick = performance.now(); if (!running){ running = true; requestAnimationFrame(frame); } }
  collect();
  /* DC templates stream in - re-collect for a while so late images get tagged. */
  var n = 0, iv = setInterval(function(){ collect(); watchMarquees(); kick(); if (++n > 24) clearInterval(iv); }, 350);
  watchMarquees();
  window.addEventListener('scroll', kick, {passive:true, capture:true});
  window.addEventListener('wheel', kick, {passive:true});
  window.addEventListener('touchmove', kick, {passive:true});
  window.addEventListener('resize', function(){ collect(); kick(); });
  kick();
})();
