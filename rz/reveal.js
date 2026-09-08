(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  var seen=new WeakSet();
  function scan(){
    document.querySelectorAll('[data-rev],[data-rev-line]').forEach(function(el){
      if(seen.has(el))return;seen.add(el);
      el.style.transitionDelay=(el.getAttribute('data-rev-d')||0)+'ms';io.observe(el);
    });
  }
  scan();
  new MutationObserver(scan).observe(document.body||document.documentElement,{childList:true,subtree:true});
  addEventListener('load',scan);
})();
