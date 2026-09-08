(function () {
  'use strict';

  if (window.RZConsent) return;

  var VERSION = 1;
  var COOKIE = 'rz_consent';
  var MAX_AGE = 60 * 60 * 24 * 180;
  var GA_ID = 'G-CFV0VT8RRK';
  var saved = read();
  var state = saved || { version: VERSION, analytics: false, marketing: false, decidedAt: null };
  var listeners = [];
  var hubspotPromise = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    if (arguments[0] === 'event' && !state.analytics) return;
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function read() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]+)'));
    if (!match) return null;
    try {
      var value = JSON.parse(decodeURIComponent(match[1]));
      if (value.version !== VERSION || typeof value.analytics !== 'boolean' || typeof value.marketing !== 'boolean') return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function write(next) {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(next))
      + '; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Lax' + secure;
  }

  function expire(name) {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', location.hostname, '.' + host];
    for (var i = 0; i < domains.length; i++) {
      var domain = domains[i] ? '; Domain=' + domains[i] : '';
      document.cookie = name + '=; Path=/; Max-Age=0; SameSite=Lax' + domain;
    }
  }

  function removeVendorCookies() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var name = cookies[i].split('=')[0].trim();
      var analyticsCookie = /^_ga(?:_|$)/.test(name) || /^_gid$/.test(name) || /^_gat/.test(name);
      var hubspotCookie = /^__hs/.test(name) || /^hubspotutk$/.test(name) || /^messagesUtk$/.test(name);
      if ((!state.analytics && analyticsCookie) || (!state.marketing && hubspotCookie)) {
        expire(name);
      }
    }
  }

  function loadAnalytics() {
    if (document.getElementById('rz-ga4')) return;
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    var script = document.createElement('script');
    script.id = 'rz-ga4';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function loadHubSpot() {
    if (!state.marketing) return Promise.reject(new Error('Marketing consent is required.'));
    if (hubspotPromise) return hubspotPromise;
    hubspotPromise = new Promise(function (resolve, reject) {
      function fail() {
        hubspotPromise = null;
        reject(new Error('Unable to load HubSpot forms.'));
      }
      var existing = document.getElementById('rz-hubspot-forms');
      if (existing) {
        /* A still-pending script from an earlier call. Must also listen for
           error: waiting on 'load' alone leaves this promise unsettled forever
           when that script fails, so no caller ever shows a fallback. */
        if (existing.hasAttribute('data-rz-loaded')) resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', fail, { once: true });
        }
        return;
      }
      var script = document.createElement('script');
      script.id = 'rz-hubspot-forms';
      /* DEVELOPER embed - the only loader this portal's form renders under
         (the classic /forms/embed/ loader leaves the div empty). It renders
         the form inline into .hs-form-html divs, so the page CSP must allow
         its submit POST (form-action), its API calls (connect-src) and the
         captcha hosts (script/frame-src) - all present in prepare-deploy.sh.
         Its unstyled markup is dressed by rz/forms.css. */
      script.src = 'https://js.hsforms.net/forms/embed/developer/4034633.js';
      script.defer = true;
      script.onload = function () {
        script.setAttribute('data-rz-loaded', '1');
        resolve();
      };
      script.onerror = function () {
        /* Remove the dead element so the next attempt injects a fresh one
           instead of finding this corpse via the `existing` branch above. */
        if (script.parentNode) script.parentNode.removeChild(script);
        fail();
      };
      document.head.appendChild(script);
    });
    return hubspotPromise;
  }

  function notify() {
    var detail = get();
    window.dispatchEvent(new CustomEvent('rzconsentchange', { detail: detail }));
    for (var i = 0; i < listeners.length; i++) listeners[i](detail);
  }

  function get() {
    return {
      version: state.version,
      analytics: state.analytics,
      marketing: state.marketing,
      decidedAt: state.decidedAt
    };
  }

  function set(next) {
    var previous = get();
    state = {
      version: VERSION,
      analytics: typeof next.analytics === 'boolean' ? next.analytics : state.analytics,
      marketing: typeof next.marketing === 'boolean' ? next.marketing : state.marketing,
      decidedAt: new Date().toISOString()
    };
    write(state);
    if (state.analytics) loadAnalytics();
    else window.gtag('consent', 'update', { analytics_storage: 'denied' });
    removeVendorCookies();
    hideBanner();
    hideSettings();
    notify();
    if ((previous.analytics && !state.analytics) || (previous.marketing && !state.marketing)) {
      location.reload();
    }
    return get();
  }

  function has(category) {
    return category === 'necessary' || Boolean(state[category]);
  }

  function css() {
    if (document.getElementById('rz-consent-style')) return;
    var link = document.createElement('link');
    link.id = 'rz-consent-style';
    link.rel = 'stylesheet';
    link.href = 'rz/consent.css?v=20260827c';
    document.head.appendChild(link);
  }

  function banner() {
    if (document.getElementById('rz-consent-banner')) return;
    var el = document.createElement('section');
    el.id = 'rz-consent-banner';
    el.className = 'rz-consent rz-consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie preferences');
    el.innerHTML =
      '<div class="rz-consent-copy"><strong>Your privacy, your choice</strong>'
      + '<p>We use necessary storage to remember your choice. With permission, we also use Google Analytics to improve the site and HubSpot to provide our enquiry forms. '
      + '<a href="Privacy.dc.html#other">Privacy Policy</a> · <a href="Terms.dc.html">Terms</a></p></div>'
      + '<div class="rz-consent-actions">'
      + '<button type="button" class="rz-consent-secondary" data-rz-consent="reject">Reject non-essential</button>'
      + '<button type="button" class="rz-consent-secondary" data-rz-consent="manage">Manage preferences</button>'
      + '<button type="button" class="rz-consent-primary" data-rz-consent="accept">Accept all</button></div>';
    document.body.appendChild(el);
  }

  function hideBanner() {
    var el = document.getElementById('rz-consent-banner');
    if (el) el.remove();
  }

  function settings() {
    var existing = document.getElementById('rz-consent-settings');
    if (existing) return existing;
    var el = document.createElement('div');
    el.id = 'rz-consent-settings';
    el.className = 'rz-consent rz-consent-backdrop';
    el.hidden = true;
    el.innerHTML =
      '<div class="rz-consent-modal" role="dialog" aria-modal="true" aria-labelledby="rz-consent-title">'
      + '<div class="rz-consent-head"><div><h2 id="rz-consent-title">Cookie preferences</h2><p>Choose which optional services Rezonate may load. You can change this choice at any time.</p></div>'
      + '<button type="button" class="rz-consent-close" data-rz-consent="close" aria-label="Close">&times;</button></div>'
      + '<div class="rz-consent-row"><div><strong>Necessary</strong><p>Stores your consent choice and supports security and requested site functions.</p></div><button type="button" class="rz-consent-switch" role="switch" aria-checked="true" disabled aria-label="Necessary cookies always enabled"></button></div>'
      + '<div class="rz-consent-row"><div><strong>Analytics</strong><p>Google Analytics helps us understand aggregated site usage. Advertising features remain disabled.</p></div><button type="button" class="rz-consent-switch" role="switch" data-rz-toggle="analytics" aria-label="Analytics cookies"></button></div>'
      + '<div class="rz-consent-row"><div><strong>Forms</strong><p>HubSpot provides our demo and contact forms and may store identifiers when enabled.</p></div><button type="button" class="rz-consent-switch" role="switch" data-rz-toggle="marketing" aria-label="HubSpot forms"></button></div>'
      + '<div class="rz-consent-modal-actions"><button type="button" class="rz-consent-secondary" data-rz-consent="reject">Reject non-essential</button><button type="button" class="rz-consent-primary" data-rz-consent="save">Save preferences</button></div>'
      + '</div>';
    document.body.appendChild(el);
    return el;
  }

  function syncSwitches() {
    var el = settings();
    var analytics = el.querySelector('[data-rz-toggle="analytics"]');
    var marketing = el.querySelector('[data-rz-toggle="marketing"]');
    analytics.setAttribute('aria-checked', state.analytics ? 'true' : 'false');
    marketing.setAttribute('aria-checked', state.marketing ? 'true' : 'false');
  }

  function openSettings() {
    css();
    var el = settings();
    syncSwitches();
    hideBanner();
    el.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    el.querySelector('[data-rz-toggle="analytics"]').focus();
  }

  function hideSettings() {
    var el = document.getElementById('rz-consent-settings');
    if (el) el.hidden = true;
    document.documentElement.style.overflow = '';
    if (!state.decidedAt) banner();
  }

  function addSettingsLink() {
    if (document.querySelector('[data-rz-cookie-settings-footer]')) return;
    var privacy = document.querySelector('footer a[href*="Privacy"]');
    if (!privacy || !privacy.parentElement) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'foot-link rz-cookie-settings';
    button.setAttribute('data-rz-cookie-settings-footer', '');
    button.textContent = 'Cookie settings';
    button.addEventListener('click', openSettings);
    privacy.parentElement.appendChild(button);
  }

  function watchForFooter() {
    addSettingsLink();
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      addSettingsLink();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    var retry = window.setInterval(addSettingsLink, 500);
    window.setTimeout(function () {
      window.clearInterval(retry);
      observer.disconnect();
    }, 10000);
  }

  function handleClick(event) {
    var settingsLink = event.target.closest && event.target.closest('[data-rz-open-cookie-settings], [data-rz-cookie-settings-footer]');
    var action = event.target.closest && event.target.closest('[data-rz-consent]');
    var toggle = event.target.closest && event.target.closest('[data-rz-toggle]');
    if (settingsLink) {
      openSettings();
      return;
    }
    if (toggle) {
      toggle.setAttribute('aria-checked', toggle.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      return;
    }
    if (!action) return;
    var name = action.getAttribute('data-rz-consent');
    if (name === 'accept') set({ analytics: true, marketing: true });
    if (name === 'reject') set({ analytics: false, marketing: false });
    if (name === 'manage') openSettings();
    if (name === 'close') hideSettings();
    if (name === 'save') {
      var el = settings();
      set({
        analytics: el.querySelector('[data-rz-toggle="analytics"]').getAttribute('aria-checked') === 'true',
        marketing: el.querySelector('[data-rz-toggle="marketing"]').getAttribute('aria-checked') === 'true'
      });
    }
  }

  function init() {
    css();
    settings();
    watchForFooter();
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hideSettings();
    });
    if (!saved) banner();
    if (state.analytics) loadAnalytics();
  }

  window.RZConsent = {
    version: VERSION,
    get: get,
    set: set,
    has: has,
    openSettings: openSettings,
    loadHubSpot: loadHubSpot,
    onChange: function (callback) {
      listeners.push(callback);
      return function () {
        var index = listeners.indexOf(callback);
        if (index >= 0) listeners.splice(index, 1);
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
