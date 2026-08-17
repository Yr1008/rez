/* Industry sub-nav: auto-hide on scroll down, slide back on scroll up.
   When hidden, clicking "Industries" in the main nav brings it back. */
(function(){
  function init(){
    var bar=document.querySelector('.indbar');
    if(!bar) return false;
    var lastY=window.scrollY||0, forced=false;
    function show(){ bar.classList.remove('ind-hidden'); }
    function hide(){ if(!forced) bar.classList.add('ind-hidden'); }
    function onScroll(){
      var y=window.scrollY||document.documentElement.scrollTop||0;
      if(y<140){ show(); forced=false; lastY=y; return; }
      var dy=y-lastY;
      if(dy>6){ forced=false; hide(); }
      else if(dy<-6){ show(); }
      lastY=y;
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    /* click "Industries" anywhere in the main nav → reveal and hold */
    [].slice.call(document.querySelectorAll('nav a, nav button, nav span, .navitem')).forEach(function(el){
      if(el.closest('.indbar')) return;
      var t=(el.textContent||'').trim().toLowerCase();
      if(t==='industries'){ el.addEventListener('click',function(){ forced=true; show(); }); }
    });
    return true;
  }
  if(!init()){ var n=0, iv=setInterval(function(){ if(init()||++n>40) clearInterval(iv); },200); }
})();
