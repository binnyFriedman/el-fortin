/**
 * First-party campaign analytics collector.
 * Saves consented visit/events to /api/events and handles direct contact links.
 * Also reports the one Google Ads conversion, which is a stored lead.
 * Tracking failure must never block the page.
 */
(function () {
  'use strict';

  var PAGE_META = window.__EF_PAGE__ || {};
  var PAGE_ID = PAGE_META.pageId || 'unknown';
  var PAGE_VERSION = PAGE_META.pageVersion || 'v1';
  var LOCALE = PAGE_META.locale || document.documentElement.lang || 'en';

  /* Ads + contact come only from assets/ef-config.js. Empty Ads turns the tag
     off (non-advertised pages) rather than counting the wrong thing. */
  var SHARED = window.__EF_CONFIG__ || {};
  var ADS = Object.assign(
    { conversionId: '', conversionLabel: '' },
    SHARED.ads || window.__EF_ADS__ || {}
  );
  var CONFIG = Object.assign(
    {
      email: '',
      whatsapp: '',
      calendar: '',
      privacyUrl: 'privacy-policy-en.html'
    },
    SHARED.contact || window.__EF_CONTACT__ || {}
  );

  var CONSENT_KEY = 'ef_analytics_consent';
  var STORAGE_VISIT = 'ef_visit_id';
  var STORAGE_ATTR = 'ef_attr';
  var isSpanish = String(LOCALE).toLowerCase().indexOf('es') === 0;
  var isHebrew = String(LOCALE).toLowerCase().indexOf('he') === 0;
  var isDutch = String(LOCALE).toLowerCase().indexOf('nl') === 0;

  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (_) {
      return null;
    }
  }

  function clearAnalyticsStorage() {
    try {
      localStorage.removeItem(STORAGE_ATTR);
      sessionStorage.removeItem(STORAGE_VISIT);
    } catch (_) {}
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (_) {}
  }

  function renderConsent() {
    var existing = document.getElementById('ef-consent');
    if (existing) existing.remove();

    var banner = document.createElement('section');
    banner.id = 'ef-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute(
      'aria-label',
      isHebrew
        ? 'העדפות פרטיות'
        : isSpanish
          ? 'Preferencias de privacidad'
          : isDutch
            ? 'Privacyvoorkeuren'
            : 'Privacy preferences'
    );
    banner.setAttribute('dir', isHebrew ? 'rtl' : 'ltr');
    banner.innerHTML =
      '<p>' +
      (isHebrew
        ? 'אנחנו משתמשים באנליטיקה עצמית למדידת העמוד והקמפיינים. אפשר לאשר או לדחות; קישורי יצירת הקשר פועלים בכל מקרה. '
        : isSpanish
          ? 'Usamos analítica propia para medir la página y las campañas. Puedes aceptarla o rechazarla; los enlaces de contacto funcionan igual. '
          : isDutch
            ? 'Wij gebruiken eigen statistieken en Google Ads-conversiemeting om deze pagina en onze campagnes te meten. U kunt dit accepteren of weigeren; de contactlinks werken in beide gevallen. '
            : 'First-party analytics help measure the page and campaigns. Accept or reject them; contact links work either way. ') +
      '<a href="' +
      CONFIG.privacyUrl +
      '">' +
      (isHebrew
        ? 'מידע נוסף'
        : isSpanish
          ? 'Más información'
          : isDutch
            ? 'Meer informatie (Engels)'
            : 'Learn more') +
      '</a></p>' +
      '<div class="ef-consent-actions">' +
      '<button type="button" data-consent="rejected">' +
      (isHebrew ? 'דחייה' : isSpanish ? 'Rechazar' : isDutch ? 'Weigeren' : 'Reject') +
      '</button>' +
      '<button type="button" data-consent="accepted">' +
      (isHebrew
        ? 'אישור אנליטיקה'
        : isSpanish
          ? 'Aceptar analítica'
          : isDutch
            ? 'Statistieken accepteren'
            : 'Accept analytics') +
      '</button>' +
      '</div>';

    var style = document.getElementById('ef-consent-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ef-consent-style';
      style.textContent =
        '#ef-consent{position:fixed;z-index:10050;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:18px 20px;background:#FDFCFA;color:#1B2A4A;border:1px solid rgba(27,42,74,.22);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
        '#ef-consent p{margin:0 0 14px;color:#3D4F5F;}' +
        '#ef-consent a{color:#A85E32;text-underline-offset:3px;}' +
        '.ef-consent-actions{display:flex;flex-wrap:wrap;gap:10px;}' +
        '.ef-consent-actions button{flex:1 1 180px;min-height:44px;padding:10px 14px;border:1px solid #1B2A4A;background:#FDFCFA;color:#1B2A4A;font:inherit;font-weight:700;cursor:pointer;}' +
        '.ef-consent-actions button:hover{background:#EDE4D3;}';
      document.head.appendChild(style);
    }
    document.body.appendChild(banner);

    banner.querySelectorAll('[data-consent]').forEach(function (button) {
      button.addEventListener('click', function () {
        var previous = readConsent();
        var choice = button.getAttribute('data-consent');
        saveConsent(choice);
        banner.remove();
        if (choice === 'accepted') {
          window.location.reload();
          return;
        }
        analyticsEnabled = false;
        queue.length = 0;
        clearAnalyticsStorage();
        if (previous === 'accepted') window.location.reload();
      });
    });
  }

  function wireConsentSettings() {
    document.querySelectorAll('[data-consent-settings]').forEach(function (button) {
      button.addEventListener('click', renderConsent);
    });
  }

  var analyticsEnabled = readConsent() === 'accepted';
  if (!analyticsEnabled) clearAnalyticsStorage();

  var SECTION_IDS = [
    'intrigue',
    'location',
    'gallery',
    'ownership',
    'economics',
    'evidence',
    'candor',
    'agency'
  ];

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function qs() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function readAttr() {
    var params = qs();
    var keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'gclid',
      'gbraid',
      'wbraid',
      'campaign',
      'adgroup',
      'ad',
      'keyword'
    ];
    var attr = {};
    var found = false;
    keys.forEach(function (k) {
      var v = params.get(k);
      if (v) {
        attr[k] = v;
        found = true;
      }
    });
    if (found) {
      try {
        localStorage.setItem(STORAGE_ATTR, JSON.stringify(attr));
      } catch (_) {}
      return attr;
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_ATTR) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function getVisitId() {
    try {
      var existing = sessionStorage.getItem(STORAGE_VISIT);
      if (existing) return existing;
      var id = uuid();
      sessionStorage.setItem(STORAGE_VISIT, id);
      return id;
    } catch (_) {
      return uuid();
    }
  }

  function deviceClass() {
    var w = window.innerWidth || 0;
    if (w && w < 760) return 'mobile';
    if (w && w < 1024) return 'tablet';
    return 'desktop';
  }

  function referrerClass(ref) {
    if (!ref) return 'direct';
    try {
      var host = new URL(ref).hostname.toLowerCase();
      if (host.indexOf('google.') !== -1) return 'google';
      if (/bing\.|duckduckgo|yahoo\./.test(host)) return 'search';
      if (/facebook|instagram|linkedin|twitter|x\.com/.test(host)) return 'social';
      return 'referral';
    } catch (_) {
      return 'unknown';
    }
  }

  var visitId = analyticsEnabled ? getVisitId() : uuid();
  var attr = analyticsEnabled ? readAttr() : {};
  var seenSections = {};
  var activeSeconds = 0;
  var lastActiveTick = Date.now();
  var isActive = true;
  var queue = [];
  var flushTimer = null;

  function basePayload() {
    return Object.assign(
      {
        visit_id: visitId,
        page_id: PAGE_ID,
        page_version: PAGE_VERSION,
        locale: LOCALE,
        referrer: document.referrer || null,
        referrer_class: referrerClass(document.referrer),
        device_class: deviceClass(),
        occurred_at: new Date().toISOString()
      },
      attr
    );
  }

  /* Everything that makes this event distinct. The trailing timestamp means an
     event without a caller-supplied key counts every time it happens. */
  function defaultKey(eventName, extra) {
    return [
      visitId,
      eventName,
      (extra && extra.section_id) || '',
      (extra && extra.cta_id) || '',
      (extra && extra.fear_id) || '',
      (extra && extra.channel) || '',
      (extra && extra.seconds) || '',
      (extra && extra.occurred_at) || Date.now()
    ].join(':');
  }

  function track(eventName, extra) {
    if (!analyticsEnabled) return;
    try {
      var payload = Object.assign(basePayload(), extra || {}, {
        event: eventName,
        /* Namespaced by page, whatever the caller passed: one visit can read
           the landing page and then the deal sheet, and that is two page views
           rather than a duplicate of the first. */
        idempotency_key:
          PAGE_ID + ':' + ((extra && extra.idempotency_key) || defaultKey(eventName, extra))
      });
      queue.push(payload);
      scheduleFlush();
    } catch (_) {}
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(flush, 400);
  }

  function flush() {
    flushTimer = null;
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    var body = JSON.stringify({ events: batch });
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon('/api/events', blob)) return;
      }
    } catch (_) {}
    try {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'same-origin'
      }).catch(function () {});
    } catch (_) {}
  }

  function markSection(sectionId) {
    if (!sectionId || seenSections[sectionId]) return;
    seenSections[sectionId] = true;
    track('section_seen', {
      section_id: sectionId,
      idempotency_key: visitId + ':section_seen:' + sectionId
    });
  }

  function bindSections() {
    var nodes = document.querySelectorAll('[data-section-id]');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        markSection(el.getAttribute('data-section-id'));
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          markSection(entry.target.getAttribute('data-section-id'));
        });
      },
      { threshold: [0.5] }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function tickActive() {
    var now = Date.now();
    if (isActive && !document.hidden) {
      activeSeconds += Math.min(5, Math.round((now - lastActiveTick) / 1000));
      if (activeSeconds > 0 && activeSeconds % 15 === 0) {
        track('active_dwell', {
          seconds: activeSeconds,
          idempotency_key: visitId + ':active_dwell:' + activeSeconds
        });
      }
    }
    lastActiveTick = now;
  }

  /* ---------- scroll depth ---------- */

  var deepestScroll = 0;

  function currentDepth() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    /* A page with nothing to scroll was read in full by definition. */
    if (scrollable <= 0) return 100;
    var travelled = window.scrollY || window.pageYOffset || 0;
    return Math.max(0, Math.min(100, Math.round((travelled / scrollable) * 100)));
  }

  function markScroll() {
    var depth = currentDepth();
    if (depth > deepestScroll) deepestScroll = depth;
  }

  function depthBucket(depth) {
    if (depth >= 100) return 100;
    if (depth >= 75) return 75;
    if (depth >= 50) return 50;
    if (depth >= 25) return 25;
    return 0;
  }

  /* Sent as the visit ends rather than on every quarter, so one abandoned read
     costs one beacon. The bucket is in the key: a visitor who comes back from
     the cache and reads further adds a deeper row instead of being ignored, and
     the deepest row per visit is the answer. */
  function trackScrollDepth() {
    markScroll();
    var bucket = depthBucket(deepestScroll);
    track('scroll_depth', {
      depth: bucket,
      idempotency_key: visitId + ':scroll_depth:' + bucket
    });
  }

  function endOfVisit() {
    trackScrollDepth();
    flush();
  }

  /* ---------- Google Ads conversion ---------- */

  /* One conversion, fired from the form once the lead is stored. Clicks on
     WhatsApp, the calendar, or the deal sheet are interest, not a lead, so they
     are measured first-party and never sent here. */

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function adsConsentState(granted) {
    var state = granted ? 'granted' : 'denied';
    return {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state
    };
  }

  /* Consent Mode: denied by default, so the tag holds no advertising storage
     until the visitor accepts. A rejected visit can still send a cookieless
     ping, which is what lets Google model conversions without identifying
     anyone. Accepting reloads the page, so the granted state is set on load. */
  function initAds() {
    if (!ADS.conversionId) return;

    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', adsConsentState(false));
    if (analyticsEnabled) gtag('consent', 'update', adsConsentState(true));
    gtag('js', new Date());
    gtag('config', ADS.conversionId);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS.conversionId);
    document.head.appendChild(script);
  }

  function reportConversion() {
    if (!ADS.conversionId || !ADS.conversionLabel) return;
    if (!window.dataLayer) return;
    try {
      gtag('event', 'conversion', {
        send_to: ADS.conversionId + '/' + ADS.conversionLabel
      });
    } catch (_) {}
  }

  if (analyticsEnabled) {
    ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (evt) {
      window.addEventListener(
        evt,
        function () {
          isActive = true;
          lastActiveTick = Date.now();
        },
        { passive: true }
      );
    });
    window.addEventListener('scroll', markScroll, { passive: true });
    window.addEventListener('resize', markScroll, { passive: true });

    /* Hiding the tab is where a mobile visit usually ends, so bank the read
       there as well as on unload. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) return;
      isActive = false;
      endOfVisit();
    });
    setInterval(tickActive, 5000);

    track('page_view', { idempotency_key: visitId + ':page_view' });
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindSections);
    } else {
      bindSections();
    }
    window.addEventListener('pagehide', endOfVisit);
    window.addEventListener('beforeunload', endOfVisit);
  }

  /* ---------- Frictionless meeting and question handoffs ---------- */

  var selectedFear = null;

  function buildMessage(fearLabel, freeText) {
    var parts = [];
    if (fearLabel) parts.push((isSpanish ? 'Mi pregunta: ' : 'My question: ') + fearLabel);
    if (freeText) parts.push(freeText);
    if (!parts.length) {
      parts.push(
        isSpanish
          ? 'Quiero hablar sobre El Fortín en Riba-roja de Túria.'
          : 'I would like to discuss El Fortín in Riba-roja de Túria.'
      );
    }
    return parts.join('\n\n');
  }

  function openHandoff(channel, fearLabel, freeText) {
    var message = buildMessage(fearLabel, freeText);
    track('handoff_opened', {
      channel: channel,
      cta_id: channel === 'calendar' ? 'book_call' : channel === 'whatsapp' ? 'send_whatsapp' : 'send_email'
    });
    flush();
    if (channel === 'whatsapp') {
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message), '_blank');
      return;
    }
    window.location.href =
      'mailto:' +
      CONFIG.email +
      '?subject=' +
      encodeURIComponent(isSpanish ? 'Consulta sobre El Fortín' : 'El Fortín enquiry') +
      '&body=' +
      encodeURIComponent(message);
  }

  function fearFromDom() {
    var selected = document.querySelector('.fear-btn.selected');
    if (!selected) return null;
    return { id: selected.getAttribute('data-fear'), label: selected.textContent.trim() };
  }

  function wireCtas() {
    document.querySelectorAll('.fear-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.fear-btn').forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        selectedFear = { id: btn.getAttribute('data-fear'), label: btn.textContent.trim() };
        track('fear_selected', {
          fear_id: selectedFear.id,
          idempotency_key: visitId + ':fear_selected:' + selectedFear.id
        });
      });
    });

    document.querySelectorAll('[data-contact-channel]').forEach(function (control) {
      control.addEventListener('click', function (event) {
        var channel = control.getAttribute('data-contact-channel');
        track('cta_opened', { cta_id: control.id || channel });
        if (channel === 'calendar') {
          track('handoff_opened', { channel: channel, cta_id: control.id || 'book_call' });
          flush();
          return;
        }
        event.preventDefault();
        selectedFear = fearFromDom() || selectedFear;
        var free = document.getElementById('fear-text');
        openHandoff(
          channel,
          selectedFear ? selectedFear.label : '',
          free ? free.value.trim() : ''
        );
      });
    });

    var alt = document.getElementById('what-would-stop-you');
    if (alt) {
      alt.addEventListener('toggle', function () {
        if (alt.open) track('cta_opened', { cta_id: 'ask_question', idempotency_key: visitId + ':cta_opened:ask_question' });
      });
    }
  }

  function wireDoors() {
    document.querySelectorAll('details[data-door]').forEach(function (el) {
      el.addEventListener('toggle', function () {
        if (!el.open) return;
        var id = el.getAttribute('data-door');
        track('door_opened', {
          door_id: id,
          idempotency_key: visitId + ':door_opened:' + id
        });
      });
    });
  }

  initAds();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      wireCtas();
      wireDoors();
      wireConsentSettings();
      if (!readConsent()) renderConsent();
    });
  } else {
    wireCtas();
    wireDoors();
    wireConsentSettings();
    if (!readConsent()) renderConsent();
  }

  window.EFAnalytics = {
    track: track,
    flush: flush,
    visitId: function () {
      return visitId;
    },
    /* Ads parameters for the lead form. Empty until analytics consent is
       accepted, so a lead never carries click IDs the visitor refused. */
    attribution: function () {
      return Object.assign({}, attr);
    },
    /* Called by the form, and only after the lead is stored. */
    reportConversion: reportConversion,
    sectionIds: SECTION_IDS
  };
})();
