/* Rezonate — hero background video.
   Desktop: eager, buffered, looping autoplay (the scroll choreography needs it).
   Mobile / save-data: swap the <video> to its lightweight encode (data-msrc,
   ~170-490KB vs the 1-2MB desktop clip) so phones load fast, then just let it
   play — cine.js also plays the mobile hero, so we cooperate rather than fight it.
   We do NOT strip the video on mobile any more: the old poster-only strip fought
   cine.js's play() every frame, which flickered the hero as it scrolled into view.
   The DC/React renderer mounts the <video> late and re-mounts it once after
   hydration, and doesn't reliably apply the boolean `muted` attribute as a
   property — so we retry until it exists and set muted/loop/playsinline as
   PROPERTIES, guarding each element so we touch it once (no churn). */
(function(){
  if (location.pathname.indexOf('/v1/design/') !== -1) return; /* editor-preview bail; never matches on getrezonate.com */
  var v = null;
  var MOB = (window.matchMedia && window.matchMedia('(max-width:1024px)').matches) || window.innerWidth <= 1024;
  function grab(){ if(!v) v = document.querySelector('#cinevid-wrap video'); return v; }
  function slowConn(){ try{ var c=navigator.connection; return !!(c && (c.saveData || /(^|-)2g/.test(c.effectiveType||''))); }catch(_){ return false; } }

  /* ---- MOBILE / save-data: lightweight encode + play (once per element) ---- */
  if (MOB){
    /* Setup is once-per-element (src swap, props, hooks) so there's no DOM churn,
       but PLAYING is retried at every opportunity. The old code bundled the two:
       one play() fired right after load() (zero data buffered — iOS rejects it)
       and the done-flag then blocked every retry, leaving phones on a frozen
       first frame. kick() is a paused-check + play(), safe to call any time. */
    var io = null;
    try{
      io = new IntersectionObserver(function(es){
        for(var i=0;i<es.length;i++){ if(es[i].isIntersecting) kick(es[i].target); }
      }, {threshold:0, rootMargin:'120px'});
    }catch(_){}
    function kick(vid){
      try{ if(vid && vid.paused){ var p = vid.play(); if(p && p.catch) p.catch(function(){}); } }catch(_){}
    }
    function setup(vid){
      if(vid._mset) return; vid._mset = 1;
      try{
        var m = vid.getAttribute('data-msrc');
        if(m && (vid.getAttribute('src')||'') !== m){
          /* Point at the mobile encode. A src attribute overrides <source>
             children, but drop them too so the parser never starts the heavier
             desktop fetch. */
          var s = vid.querySelectorAll('source');
          for(var i=0;i<s.length;i++){ if(s[i].parentNode) s[i].parentNode.removeChild(s[i]); }
          vid.setAttribute('src', m);
          vid.load();
        }
        vid.muted = true; vid.defaultMuted = true; vid.loop = true; vid.playsInline = true;
        vid.setAttribute('playsinline',''); vid.setAttribute('muted','');
        vid.setAttribute('preload','auto');
        /* play the moment data actually arrives — the reliable path on iOS */
        vid.addEventListener('canplay', function(){ kick(vid); });
        vid.addEventListener('loadeddata', function(){ kick(vid); });
        if(io) io.observe(vid);
      }catch(_){}
    }
    var lastPrime = 0;
    function prime(){
      var now = Date.now();
      if (now - lastPrime < 250) return true;   /* throttle the scroll-driven calls */
      lastPrime = now;
      var vids = document.querySelectorAll('#cinevid-wrap video');
      if(!vids.length) return false;
      for(var k=0;k<vids.length;k++){ setup(vids[k]); kick(vids[k]); }
      return true;
    }
    if(!prime()){ var iv = setInterval(function(){ if(prime()) clearInterval(iv); }, 100); setTimeout(function(){ clearInterval(iv); }, 8000); }
    /* React re-mounts the <video> after hydration (fresh element, no _mset, no
       listeners) and slow networks deliver data late — keep nudging through that
       window, then interaction/visibility listeners take over for the long tail. */
    var kv = setInterval(prime, 500);
    setTimeout(function(){ clearInterval(kv); }, 20000);
    try{
      var wrap = document.querySelector('#cinevid-wrap') || document.body;
      var mo = new MutationObserver(function(){ lastPrime = 0; prime(); });
      mo.observe(wrap, { childList:true, subtree:true });
      setTimeout(function(){ try{ mo.disconnect(); }catch(_){ } }, 20000);
    }catch(_){}
    ['touchstart','pointerdown','scroll'].forEach(function(e){
      window.addEventListener(e, function(){ lastPrime = 0; prime(); }, {passive:true});
    });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden){ lastPrime = 0; prime(); } });
    return;
  }

  /* ---- DESKTOP: eager buffered autoplay + loop for the choreography ---- */
  function prime(){
    if(!grab()) return false;
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline',''); v.setAttribute('muted','');
    v.setAttribute('preload','auto');
    try{ v.fetchPriority = 'high'; }catch(_){}
    return true;
  }
  function play(){ if(!prime()) return false; var p = v.play(); if(p && p.catch) p.catch(function(){}); return true; }
  function start(){ if(!play()){ var iv = setInterval(function(){ if(play()) clearInterval(iv); }, 100); setTimeout(function(){ clearInterval(iv); }, 8000); } }
  start();
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', start); }
  ['touchstart','pointerdown','click','scroll','keydown'].forEach(function(e){
    window.addEventListener(e, play, {passive:true, once:true});
  });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) play(); });
  try{
    var io = new IntersectionObserver(function(es){
      if(!grab()) return;
      if(es[es.length-1].isIntersecting){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
      else { try{ v.pause(); }catch(_){} }
    }, {threshold:0, rootMargin:'150px'});
    setTimeout(function(){ if(grab() && v.parentNode) io.observe(v.parentNode); }, 500);
  }catch(_){}
})();
