/* Rezonate — CTA click tracking (GA4).
   One delegated listener instead of per-button handlers, so every CTA on every
   page is covered — including ones inside the dc-imported Kira demo (its clicks
   bubble to this document) and any CTA React re-mounts later. Fires a single
   `cta_click` event with the button text, target and section. The inline gtag
   stub exists from first paint, so events queue in dataLayer even if the GA
   library is still loading (or blocked — then this is a harmless no-op). */
(function(){
  /* The DC runtime executes helmet scripts twice (body parse + head re-mount),
     which would register two listeners and double-count every click. */
  if (window.__rzTrack) return; window.__rzTrack = 1;
  var SEL = 'a.btn, .kvx-cta, .kvx-call, [data-rzform], a[href^="mailto:"], .nav-cta-d';
  document.addEventListener('click', function(e){
    try{
      if (typeof gtag !== 'function') return;
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if (!el) return;
      var text = (el.getAttribute('aria-label') || el.innerText || el.textContent || '').trim().replace(/\s+/g,' ').slice(0,80);
      var sec = el.closest('section[data-screen-label], footer, nav');
      var section = sec ? (sec.getAttribute('data-screen-label') || sec.tagName.toLowerCase()) : '';
      gtag('event', 'cta_click', {
        cta_text: text || el.tagName.toLowerCase(),
        cta_href: el.getAttribute('href') || '',
        cta_section: section,
        page_path: location.pathname
      });
    }catch(_){}
  }, {capture:true, passive:true});

  /* ---- Forms (HubSpot modal) ----
     The Request-a-demo / Contact forms are HubSpot iframe embeds opened by
     rz/forms.js, so GA's built-in form tracking can't see them. We emit:
     - form_open      when a form CTA opens the modal (same selector forms.js uses)
     - form_submit    when HubSpot posts onFormSubmitted to the parent page
     - generate_lead  additionally for the demo form (GA4 recommended lead event) */
  var FORMS = {};
  function formIds(){
    FORMS[window.RZ_DEMO_FORM   || 'b445588a-290a-4278-adb1-367d98a82477'] = 'request_a_demo';
    FORMS[window.RZ_CONTACT_FORM|| '260ae856-9aa9-4c33-8a63-d7adbf586e29'] = 'contact_us';
  }
  document.addEventListener('click', function(e){
    try{
      if (typeof gtag !== 'function') return;
      var t = e.target && e.target.closest ? e.target.closest('[data-rzform], a[href$="#demo"]') : null;
      if (!t) return;
      var pane = t.getAttribute('data-rzform') || 'demo';
      gtag('event', 'form_open', {
        form_name: pane === 'contact' ? 'contact_us' : 'request_a_demo',
        page_path: location.pathname
      });
    }catch(_){}
  }, {capture:true, passive:true});
  var submitted = {};
  window.addEventListener('message', function(e){
    try{
      if (typeof gtag !== 'function') return;
      var d = e.data;
      if (typeof d === 'string'){ try{ d = JSON.parse(d); }catch(_){ return; } }
      if (!d || d.type !== 'hsFormCallback') return;
      if (d.eventName !== 'onFormSubmitted' && d.eventName !== 'onFormSubmit') return;
      var id = d.id || (d.data && d.data.formGuid) || '';
      if (submitted[id + d.eventName]) return;   /* HubSpot can echo the callback */
      submitted[id + d.eventName] = 1;
      if (d.eventName !== 'onFormSubmitted') return;  /* count completed submissions only */
      formIds();
      var name = FORMS[id] || 'hubspot_form';
      gtag('event', 'form_submit', {
        form_id: id,
        form_name: name,
        form_destination: 'hubspot',
        page_path: location.pathname
      });
      if (name === 'request_a_demo'){
        gtag('event', 'generate_lead', { form_id: id, form_name: name, page_path: location.pathname });
      }
    }catch(_){}
  });
})();
