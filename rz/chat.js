/* Rezonate - Kira chat widget (standalone, site-wide).
   Injects the floating "Chat with Kira" FAB + glass chat panel into any page
   and runs the same canned-reply behavior as the homepage. Self-initialising. */
(function(){
  if (window.__rzChatBooted) return;
  window.__rzChatBooted = true;

  function botReply(q){
    q = (q||'').toLowerCase();
    var demo = {label:'Request a demo', href:'Rezonate.dc.html#demo'};
    var live = {label:'Book a live demo', href:'Rezonate.dc.html#demo'};
    if(/\b(hi|hey|hello|howdy|yo)\b/.test(q)) return {text:"Hi! I'm Kira. I can explain what Rezonate does, walk you through an industry, or set up a live demo.", ctas:[{label:'What is Kira?',ask:'What is Kira?'},{label:'Which industries?',ask:'Which industries?'}]};
    if(/(what.*(kira|rezonate|you do|is this)|who are you|\bproduct\b)/.test(q)) return {text:"Rezonate is an AI voice agent, Kira, that answers, understands and resolves real conversations across phone, chat and messaging, 24/7, in 60+ languages.", ctas:[{label:'How it works',ask:'How does it work?'}, live]};
    if(/(how.*(work|does)|mechanic|the flow)/.test(q)) return {text:"Kira listens, reads intent, acts in your systems, booking, triage, updates, then resolves. It hands off to a human only when it should.", ctas:[{label:'See the platform',href:'Solutions.dc.html'}, live]};
    if(/(industr|vertical|use case|sector)/.test(q)) return {text:"We run across four industries, each with its own proof. Which fits you?", ctas:[{label:'Healthcare',href:'Industry-Healthcare.dc.html'},{label:'Financial',href:'Industry-Financial.dc.html'},{label:'Business',href:'Industry-Business.dc.html'},{label:'Sports',href:'Industry-Sports.dc.html'}]};
    if(/(health|hospital|clinic|patient|triage|no.?show)/.test(q)) return {text:"In healthcare, Kira triages after-hours calls, cuts no-shows and handles referrals, forged over a decade inside Singapore's public hospitals.", ctas:[{label:'Healthcare',href:'Industry-Healthcare.dc.html'}, demo]};
    if(/(financ|bank|insur|kyc|policy|claim)/.test(q)) return {text:"In financial services, Kira handles account support, onboarding and identity verification, compliant and audit-ready.", ctas:[{label:'Financial services',href:'Industry-Financial.dc.html'}, demo]};
    if(/(sport|fan|stadium|ticket|season|club)/.test(q)) return {text:"For sports, Kira engages fans at scale, memberships, ticketing and event info, in the voice of your club.", ctas:[{label:'Sports',href:'Industry-Sports.dc.html'}, demo]};
    if(/(business|retail|enterprise|it help|help.?desk|\bhr\b|order)/.test(q)) return {text:"For business ops, Kira covers IT help-desk, HR, orders and sales follow-up, resolving routine requests instantly.", ctas:[{label:'Business',href:'Industry-Business.dc.html'}, demo]};
    if(/(customer|case stud|proof|result|reference|who use)/.test(q)) return {text:"Teams like KKH, NHG Health, AIA and Asahi trust Kira, with the numbers to match.", ctas:[{label:'Customer stories',href:'Customers.dc.html'},{label:'Case studies',href:'CaseStudy.dc.html'}]};
    if(/(secur|hipaa|compli|\bsoc\b|gdpr|privacy|\bdata\b|audit)/.test(q)) return {text:"Rezonate is SOC 2 Type II, ISO 27001 and HIPAA-ready, with data-residency options and a full audit trail.", ctas:[{label:'Talk to our team',href:'Rezonate.dc.html#demo'}]};
    if(/(channel|voice|whatsapp|\bsms\b|email|omni|phone)/.test(q)) return {text:"Kira works across voice, chat, SMS and messaging, one agent with one memory, so context never resets between channels.", ctas:[{label:'See the platform',href:'Solutions.dc.html'}, live]};
    if(/(language|multiling|translat)/.test(q)) return {text:"Kira speaks 60+ languages natively, from the first ring, with no extra setup.", ctas:[live]};
    if(/(integrat|\bcrm\b|\bapi\b|connect|your system|\behr\b)/.test(q)) return {text:"Kira plugs into your existing stack, CRM, EHR, scheduling and telephony, and acts in real time.", ctas:[demo]};
    if(/(pric|cost|quote|budget|\bplan\b)/.test(q)) return {text:"Pricing scales with resolved conversations. The team can tailor it to your call types on a short call.", ctas:[demo]};
    if(/\b(yes|yeah|yep|sure|ok|okay|please|book|demo|contact|sales|talk)\b/.test(q)) return {text:"Great, the fastest way in is a 20-minute demo on your own call types.", ctas:[demo, live]};
    return {text:"Happy to help. I can go deep on the product, a specific industry, security, pricing, or set up a live demo, where should we start?", ctas:[{label:'What is Kira?',ask:'What is Kira?'},{label:'Which industries?',ask:'Which industries?'},{label:'Is it secure?',ask:'Is it secure?'}, demo]};
  }

  function boot(){
    if (document.querySelector('.rzfab')) return; // a native one already exists (homepage)
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot); return; }

    // ---- styles ----
    var css = document.createElement('style');
    css.textContent = [
      "@keyframes rzwave{0%,100%{transform:scaleY(.6)}50%{transform:scaleY(1)}}",
      ".rzfab-wave{display:flex;align-items:center;justify-content:center;gap:2.5px;height:30px}",
      ".rzfab-wave i{display:block;width:5px;border-radius:50%;background:rgba(255,255,255,.62);transform-origin:center}",
      ".rzfab-wave i:nth-child(1){height:46%;animation:rzwave 2.8s ease-in-out infinite;animation-delay:-2.1s}",
      ".rzfab-wave i:nth-child(2){height:80%;animation:rzwave 3.4s ease-in-out infinite;animation-delay:-1s}",
      ".rzfab-wave i:nth-child(3){height:100%;animation:rzwave 2.6s ease-in-out infinite;animation-delay:-.4s}",
      ".rzfab-wave i:nth-child(4){height:80%;animation:rzwave 3.2s ease-in-out infinite;animation-delay:-1.7s}",
      ".rzfab-wave i:nth-child(5){height:46%;animation:rzwave 2.9s ease-in-out infinite;animation-delay:-2.4s}",
      ".rzfab{transition:transform .35s,box-shadow .35s}",
      ".rzfab:hover{transform:translateY(-3px) scale(1.04)}",
      ".rzfab:hover .rzfab-wave i{animation-duration:1.6s}",
      ".rzchat{transition:opacity .34s cubic-bezier(.2,.8,.3,1),transform .34s cubic-bezier(.2,.8,.3,1),visibility .34s;transform-origin:bottom right}",
      ".rzchat[data-chat='0']{opacity:0;visibility:hidden;transform:translateY(14px) scale(.96);pointer-events:none}",
      ".rzchat[data-chat='1']{opacity:1;visibility:visible;transform:none;pointer-events:auto}"
    ].join("");
    document.head.appendChild(css);

    // ---- panel ----
    var panel = document.createElement('div');
    panel.className = 'rzchat';
    panel.setAttribute('data-chat','0');
    panel.style.cssText = "position:fixed;right:clamp(16px,2vw,28px);bottom:clamp(88px,11vh,104px);z-index:202;width:min(332px,calc(100vw - 32px));height:min(468px,68vh);display:flex;flex-direction:column;border-radius:24px;overflow:hidden;background:rgba(18,18,22,.24);backdrop-filter:blur(48px) saturate(190%);-webkit-backdrop-filter:blur(48px) saturate(190%);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 30px 70px -24px rgba(0,0,0,.6)";
    panel.innerHTML =
      '<div style="display:flex;align-items:center;gap:11px;padding:14px 15px">'+
        '<span style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);flex:0 0 auto"><img src="rz/chat-mark-white.png" alt="" style="width:19px;height:19px;object-fit:contain"></span>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="color:#fff;font-weight:600;font-size:15px;letter-spacing:-.01em">Kira</div>'+
          '<div style="display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.6);font-size:12px"><span style="width:6px;height:6px;border-radius:50%;background:#3ED27E;box-shadow:0 0 8px #3ED27E"></span>Online · replies in seconds</div>'+
        '</div>'+
        '<button data-rzclose aria-label="Close chat" style="width:30px;height:30px;flex:0 0 auto;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>'+
      '</div>'+
      '<div data-rzbody style="flex:1;overflow-y:auto;padding:16px 16px 6px"></div>'+
      '<div data-rzchips style="display:flex;flex-wrap:wrap;gap:7px;padding:4px 14px 12px"></div>'+
      '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px 12px">'+
        '<input data-rzinput placeholder="Message Kira…" style="flex:1;min-width:0;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff;padding:0 16px;font-size:14px;font-family:inherit;outline:none">'+
        '<button data-rzsend aria-label="Send" style="width:42px;height:42px;flex:0 0 auto;border-radius:50%;border:none;cursor:pointer;background:#fff;color:#15140f;display:flex;align-items:center;justify-content:center;font-size:18px">↑</button>'+
      '</div>';
    document.body.appendChild(panel);

    // ---- fab ----
    var fab = document.createElement('button');
    fab.className = 'rzfab';
    fab.setAttribute('aria-label','Chat with Kira');
    fab.style.cssText = "position:fixed;right:clamp(16px,2vw,28px);bottom:clamp(16px,2vw,28px);z-index:202;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.08);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(18,18,20,.32);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 16px 40px -14px rgba(0,0,0,.7)";
    fab.innerHTML = '<span class="rzfab-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
    document.body.appendChild(fab);

    // ---- state + render ----
    var body = panel.querySelector('[data-rzbody]');
    var input = panel.querySelector('[data-rzinput]');
    var chipWrap = panel.querySelector('[data-rzchips]');
    var msgs = [{who:'bot',text:"Hi, I'm Kira, Rezonate's voice agent. Ask me what we do, pick an industry, or book a demo.", ctas:[{label:'What is Kira?',ask:'What is Kira?'},{label:'Book a live demo',href:'Rezonate.dc.html#demo'}]}];
    var botT;

    function bubble(m){
      var me = m.who === 'me';
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-direction:column;margin-bottom:10px;'+(me?'align-items:flex-end':'align-items:flex-start');
      var b = document.createElement('div');
      b.style.cssText = 'max-width:82%;padding:10px 13px;border-radius:15px;font-size:14px;line-height:1.45;text-wrap:pretty;'+(me?'background:rgba(255,255,255,.92);color:#15140f;border-bottom-right-radius:5px':'background:rgba(255,255,255,.1);color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.12);border-bottom-left-radius:5px');
      b.textContent = m.text;
      row.appendChild(b);
      if(m.ctas && m.ctas.length){
        var cw = document.createElement('div');
        cw.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;max-width:90%';
        m.ctas.forEach(function(c){
          var el;
          if(c.href){ el = document.createElement('a'); el.href = c.href; el.textContent = c.label+' \u2192';
            el.style.cssText = 'display:inline-flex;align-items:center;font-size:12.5px;font-weight:600;color:#15140f;background:#fff;border-radius:999px;padding:7px 13px;text-decoration:none'; }
          else { el = document.createElement('button'); el.textContent = c.label;
            el.style.cssText = 'font-size:12.5px;font-weight:600;color:rgba(255,255,255,.92);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:7px 12px;cursor:pointer';
            el.addEventListener('click', function(){ send(c.ask || c.label); }); }
          cw.appendChild(el);
        });
        row.appendChild(cw);
      }
      return row;
    }
    function render(){
      body.innerHTML = '';
      msgs.forEach(function(m){ body.appendChild(bubble(m)); });
      setTimeout(function(){ body.scrollTop = body.scrollHeight; }, 30);
    }
    function send(txt){
      var v = ((txt != null ? txt : input.value) || '').trim();
      if(!v) return;
      msgs.push({who:'me',text:v});
      if(txt == null) input.value = '';
      render();
      clearTimeout(botT);
      botT = setTimeout(function(){ var r = botReply(v); msgs.push({who:'bot',text:r.text,ctas:r.ctas}); render(); }, 620);
    }
    ['What is Kira?','Which industries?','Is it secure?','Book a demo'].forEach(function(label){
      var c = document.createElement('button');
      c.textContent = label;
      c.style.cssText = 'font-size:12.5px;font-weight:600;color:rgba(255,255,255,.92);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:7px 12px;cursor:pointer';
      c.addEventListener('click', function(){ send(label); });
      chipWrap.appendChild(c);
    });

    function toggle(){ panel.setAttribute('data-chat', panel.getAttribute('data-chat')==='1' ? '0' : '1'); if(panel.getAttribute('data-chat')==='1'){ setTimeout(function(){ try{ input.focus(); }catch(e){} }, 120); } }
    fab.addEventListener('click', toggle);
    panel.querySelector('[data-rzclose]').addEventListener('click', toggle);
    panel.querySelector('[data-rzsend]').addEventListener('click', function(){ send(); });
    input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ send(); } });

    render();
  }

  boot();
})();
