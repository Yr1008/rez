/* Rezonate — "Now we're talking" footer voice wave.
   Self-initializing: finds #nwt-wave (rendered async by the DC runtime) and
   draws layered iridescent Siri-style ribbons. Identical math to the homepage
   footer so every page matches. Respects prefers-reduced-motion. */
(function(){
  function env(u){ return Math.pow(Math.sin(Math.PI*u), 1.4); }              // spindle envelope
  function breathe(t){ return 0.58 + 0.30*Math.sin(t*0.9) + 0.12*Math.sin(t*0.37 + 1.2); }
  var LAYERS = [
    {f:1.6, s: 0.55, ph:0.0, w:2.4, a:1.00, c:'183,157,232'},
    {f:2.4, s:-0.42, ph:1.1, w:2.0, a:0.70, c:'217,96,90'},
    {f:1.1, s: 0.34, ph:2.2, w:2.2, a:0.88, c:'226,104,62'},
    {f:3.2, s: 0.70, ph:0.5, w:1.5, a:0.48, c:'255,255,255'}
  ];
  function draw(c, t){
    var ctx = c.getContext('2d'); if(!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round((c.clientWidth || 600)*dpr), H = Math.round((c.clientHeight || 90)*dpr);
    if(c.width !== W || c.height !== H){ c.width = W; c.height = H; }          // self-healing size
    ctx.clearRect(0,0,W,H);
    var mid = H/2, N = Math.max(24, Math.floor(W/(2*dpr))), A = H*0.40, br = breathe(t);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(var li=0; li<LAYERS.length; li++){
      var L = LAYERS[li]; ctx.beginPath();
      for(var i=0;i<=N;i++){
        var u=i/N, x=u*W, y=mid + env(u)*br*A*L.a*Math.sin(u*Math.PI*2*L.f + t*L.s + L.ph);
        i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.strokeStyle='rgba('+L.c+',0.62)'; ctx.shadowColor='rgba('+L.c+',0.55)';
      ctx.shadowBlur=16*dpr; ctx.lineWidth=L.w*dpr; ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var t0 = performance.now();
  /* Only draw while the footer is actually on screen and the tab is visible —
     the 4-layer shadow-blurred stroke pass is expensive, and this canvas sits
     at the very bottom of every page, so most of a session it's offscreen.
     The rAF loop parks itself when hidden and restarts on re-entry. */
  var c = null, vis = true, rafOn = false, io = null;
  function frame(now){
    rafOn = false;
    if(!c){
      c = document.getElementById('nwt-wave');         // canvas mounts asynchronously
      if(c){
        if('IntersectionObserver' in window){
          vis = false;
          try{
            io = new IntersectionObserver(function(es){
              vis = es[es.length-1].isIntersecting;
              if(vis) start();
            }, {rootMargin:'120px'});
            io.observe(c);
          }catch(e){ vis = true; }
        }
      }
    }
    if(c){
      if(reduce){ draw(c, 1.6); return; }              // one static frame
      if(!vis || document.hidden) return;              // park until visible again
      draw(c, (now - t0)/1000);
    }
    start();
  }
  function start(){ if(!rafOn){ rafOn = true; requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) start(); });
  start();
})();
