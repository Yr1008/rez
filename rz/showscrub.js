/* "How Kira works" scrollytelling: JS pin + SCROLL-DRIVEN one-by-one reveal.
   The section pins; each message is tied to scroll progress through the pinned
   range, so it stays stuck until you've scrolled through the whole conversation,
   then releases. Scrolling back up reverses cleanly (never traps). */
(function(){
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function init(){
    var sec=document.getElementById('showcase');
    var pin=document.getElementById('showpin');
    if(!sec||!pin) return false;
    var track=document.getElementById('showtrack')||sec;
    var caller=document.getElementById('scrub-caller');
    var msgs=[].slice.call(pin.querySelectorAll('[data-scrub]'));
    if(!msgs.length) return false;
    var full=caller?(caller.getAttribute('data-text')||caller.textContent||''):'';
    var curShown=-1, curN=-1, maxShown=0, maxN=0;
    pin.style.willChange='transform'; pin.style.backfaceVisibility='hidden';
    function applyMsgs(shown){
      if(shown===curShown) return; curShown=shown;
      for(var i=0;i<msgs.length;i++){ var m=msgs[i], on=i<shown;
        m.style.setProperty('opacity', on?'1':'0','important');
        m.style.setProperty('transform', on?'none':'translateY(20px)','important');
        m.style.setProperty('transition','opacity .45s cubic-bezier(.16,.84,.44,1),transform .45s cubic-bezier(.16,.84,.44,1)');
      }
    }
    applyMsgs(0);
    var vh=function(){ return window.innerHeight||document.documentElement.clientHeight; };
    function frame(){
      var r=track.getBoundingClientRect(); var H=vh(); var range=track.offsetHeight-H; if(range<1) range=1;
      /* pin is CSS position:sticky now - browser handles pin/release with zero
         jitter; JS only maps scroll progress to typing + message reveal. */
      var p=clamp((-r.top)/range,0,1);
      /* caller types over first 14% - latched: scrolling up never untypes it */
      var n=Math.round(full.length*clamp(p/0.14,0,1));
      if(n>maxN) maxN=n;
      if(caller && maxN!==curN){ curN=maxN; caller.textContent=full.slice(0,maxN)||'\u200b'; }
      /* messages spread across 0.16 -> 0.9, reveal-once (latched): once shown they
         STAY shown - scrolling up neither undoes nor re-animates them */
      var start=0.16, end=0.9;
      var shown=clamp(Math.round(((clamp(p,start,end)-start)/(end-start))*msgs.length),0,msgs.length);
      if(shown>maxShown) maxShown=shown;
      applyMsgs(maxShown);
    }
    var ticking=false;
    function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    frame();
    return true;
  }
  if(!init()){ var k=0, iv=setInterval(function(){ if(init()||++k>60) clearInterval(iv); },200); }
})();
