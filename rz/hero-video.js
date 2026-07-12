/* Rezonate — industry hero video autoplay helper.
   The DC/React renderer doesn't reliably apply the boolean `muted` attribute as a
   DOM property, so the browser blocks autoplay and the <video> sits paused. We set
   muted/loop as PROPERTIES and call play(), retry until the element exists, and
   re-try on first interaction. Also pauses when scrolled well offscreen. */
(function(){
  var v = null;
  function grab(){ if(!v) v = document.querySelector('#cinevid-wrap video'); return v; }
  function play(){
    if(!grab()) return false;
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline',''); v.setAttribute('muted','');
    v.setAttribute('preload','auto'); try{ v.fetchPriority='high'; }catch(_){}
    var p = v.play(); if(p && p.catch) p.catch(function(){});
    return true;
  }
  function start(){ if(!play()){ var iv = setInterval(function(){ if(play()) clearInterval(iv); }, 100); setTimeout(function(){ clearInterval(iv); }, 8000); } }
  if(document.readyState==='complete'){ setTimeout(start, 200); } else { window.addEventListener('load', function(){ setTimeout(start, 200); }); }
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
