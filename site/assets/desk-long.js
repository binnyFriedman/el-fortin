/* El Fortín Riba-roja — The Concierge Desk (long page)
   Split-flap board, progress carousel, masthead, guest-book handoff. */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     The lead goes to our own origin, which keeps the notification target
     out of the page and lets the server validate before anything is stored.
     SOURCE tells the server which page this form belongs to: the long page
     here, "short" in desk.js.
  ------------------------------------------------------------------ */
  var CAPTURE_ENDPOINT = "/api/leads";
  var SOURCE = "long";

  /* Labels the form events in analytics, so short and long stay separable. */
  var FORM_ID = SOURCE + "_form";

  /* Offered only if we could not record the note. */
  var URIEL_WHATSAPP = "34626459818";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- masthead turns solid once the window has scrolled by ---------- */

  function initMasthead() {
    var masthead = document.querySelector("[data-masthead]");
    var hero = document.getElementById("top");
    if (!masthead || !hero || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        masthead.classList.toggle("is-solid", !entries[0].isIntersecting);
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(hero);
  }

  /* ---------- the split-flap board ---------- */

  function initFlap() {
    var board = document.querySelector("[data-flap]");
    if (!board) return;

    var tabs = Array.prototype.slice.call(board.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(board.querySelectorAll('[role="tabpanel"]'));

    function show(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.setAttribute("tabindex", selected ? "0" : "-1");
      });
      panels.forEach(function (panel) {
        var active = panel.id === tab.getAttribute("aria-controls");
        panel.hidden = !active;
        if (active && !reduceMotion) {
          panel.querySelectorAll("[data-flip]").forEach(function (cell, i) {
            cell.classList.remove("is-flipping");
            cell.style.animationDelay = i * 60 + "ms";
            void cell.offsetWidth;
            cell.classList.add("is-flipping");
          });
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        show(tab);
      });
      tab.addEventListener("keydown", function (event) {
        var index = tabs.indexOf(tab);
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          next.focus();
          show(next);
        }
      });
    });
  }

  /* ---------- the progress carousel ---------- */

  function initCarousel() {
    var track = document.querySelector("[data-carousel]");
    var prev = document.querySelector("[data-carousel-prev]");
    var next = document.querySelector("[data-carousel-next]");
    if (!track || !prev || !next) return;

    function step() {
      var first = track.querySelector("li");
      if (!first) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function scrollBy(direction) {
      track.scrollBy({ left: direction * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () {
      scrollBy(-1);
    });
    next.addEventListener("click", function () {
      scrollBy(1);
    });

    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollBy(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollBy(-1);
      }
    });
  }

  function composeMessage(data) {
    var lines = [
      "Hello Uriel,",
      "",
      "Name: " + data.name,
      "Email: " + data.email,
      "Phone: " + data.phone,
    ];
    if (data.type) lines.push("Interested in: " + data.type);
    if (data.questions) lines.push("", "Questions:", data.questions);
    lines.push("", "Sent from the El Fortín Riba-roja page.");
    return lines.join("\n");
  }

  function whatsappUrl(data) {
    return (
      "https://wa.me/" + URIEL_WHATSAPP +
      "?text=" + encodeURIComponent(composeMessage(data))
    );
  }

  function track(eventName, extra) {
    if (!window.EFAnalytics || typeof window.EFAnalytics.track !== "function") return;
    window.EFAnalytics.track(eventName, extra || {});
  }

  function flushAnalytics() {
    if (window.EFAnalytics && typeof window.EFAnalytics.flush === "function") {
      window.EFAnalytics.flush();
    }
  }

  /* Ads parameters, present only once analytics consent is accepted. */
  function attribution() {
    if (!window.EFAnalytics || typeof window.EFAnalytics.attribution !== "function") {
      return {};
    }
    return window.EFAnalytics.attribution() || {};
  }

  function visitId() {
    if (!window.EFAnalytics || typeof window.EFAnalytics.visitId !== "function") {
      return "";
    }
    return window.EFAnalytics.visitId() || "";
  }

  /* Tells Google Ads a lead landed. Never called before the lead is stored. */
  function reportConversion() {
    if (!window.EFAnalytics || typeof window.EFAnalytics.reportConversion !== "function") {
      return;
    }
    window.EFAnalytics.reportConversion();
  }

  function leadBody(data) {
    var lead = Object.assign({}, attribution(), {
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      questions: data.questions,
      page: location.href,
      source: SOURCE,
      visit_id: visitId(),
    });
    return JSON.stringify(lead);
  }

  /* Same-origin JSON, so only a real 2xx counts as captured. Anything else
     leaves the visitor a direct route to Uriel instead of a false thank-you. */
  function captureLead(data) {
    return fetch(CAPTURE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: leadBody(data),
      credentials: "same-origin",
    }).then(function (res) {
      if (!res.ok) throw new Error("bad-status");
    });
  }

  function initForm() {
    var form = document.querySelector("[data-form]");
    if (!form) return;

    var status = form.querySelector("[data-status]");
    var submit = form.querySelector("[data-submit]");
    var idleLabel = submit ? submit.textContent : "Send to Uriel";
    var received = document.getElementById("form-received");
    var receivedFocus = null;

    function field(name) {
      return form.elements[name];
    }

    function setError(name, show) {
      var input = field(name);
      var wrapper = input.closest(".field");
      var error = form.querySelector('[data-error-for="' + name + '"]');
      wrapper.classList.toggle("is-invalid", show);
      input.setAttribute("aria-invalid", String(show));
      if (error) error.hidden = !show;
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    function validPhone(value) {
      return value.replace(/\D/g, "").length >= 8;
    }

    function showStatus(message, isError) {
      if (!status) return;
      status.hidden = false;
      status.classList.toggle("is-error", !!isError);
      status.textContent = message;
    }

    /* Nothing was stored, so offer the direct route rather than a thank-you. */
    function showCaptureFailure(data) {
      if (!status) return;
      status.hidden = false;
      status.classList.add("is-error");
      status.textContent = "";
      status.appendChild(document.createTextNode("We could not record your note. "));
      var wa = document.createElement("a");
      wa.href = whatsappUrl(data);
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.textContent = "Write on WhatsApp instead";
      status.appendChild(wa);
      status.appendChild(document.createTextNode(", or try again."));
    }

    function idle() {
      if (!submit) return;
      submit.disabled = false;
      submit.textContent = idleLabel;
    }

    function openReceived() {
      if (status) {
        status.hidden = true;
        status.textContent = "";
        status.classList.remove("is-error");
      }
      if (!received) {
        showStatus("Your message was received. Uriel will be in touch.");
        return;
      }
      receivedFocus = document.activeElement;
      if (typeof received.showModal === "function") received.showModal();
      else received.setAttribute("open", "");
      var done = received.querySelector(".receipt__body [data-received-close]");
      if (done) done.focus();
    }

    function closeReceived() {
      if (!received) return;
      if (typeof received.close === "function") received.close();
      else received.removeAttribute("open");
      if (receivedFocus && typeof receivedFocus.focus === "function") receivedFocus.focus();
    }

    if (received) {
      received.querySelectorAll("[data-received-close]").forEach(function (btn) {
        btn.addEventListener("click", closeReceived);
      });
      received.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeReceived();
      });
      received.addEventListener("click", function (event) {
        if (event.target === received) closeReceived();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = {
        name: field("name").value.trim(),
        email: field("email").value.trim(),
        phone: field("phone").value.trim(),
        type: (form.querySelector('input[name="type"]:checked') || {}).value || "",
        questions: field("questions").value.trim(),
      };

      var nameOk = data.name.length > 0;
      var emailOk = validEmail(data.email);
      var phoneOk = validPhone(data.phone);
      setError("name", !nameOk);
      setError("email", !emailOk);
      setError("phone", !phoneOk);
      if (!nameOk || !emailOk || !phoneOk) {
        field(nameOk ? (emailOk ? "phone" : "email") : "name").focus();
        return;
      }

      var honey = field("company");
      if (honey && honey.value.trim()) {
        openReceived();
        return;
      }

      if (!submit) return;
      submit.disabled = true;
      submit.textContent = "Sending…";
      showStatus("Sending your note to Uriel…");

      captureLead(data)
        .then(function () {
          idle();
          form.reset();
          openReceived();
          /* A stored lead is the only thing that counts as success, here and
             in Google Ads. Everything before this is intent. */
          track("form_submitted", { cta_id: FORM_ID });
          flushAnalytics();
          reportConversion();
        })
        .catch(function () {
          idle();
          showCaptureFailure(data);
          track("form_failed", { cta_id: FORM_ID });
          flushAnalytics();
        });
    });

    /* Reaching for the first field is the intent we compare submits against.
       Typing counts too, because autofill can populate the form without ever
       giving a field focus. */
    var startedTracked = false;
    function trackFormStarted() {
      if (startedTracked) return;
      startedTracked = true;
      track("form_started", {
        cta_id: FORM_ID,
        idempotency_key: visitId() + ":form_started",
      });
    }
    form.addEventListener("focusin", trackFormStarted);
    form.addEventListener("input", trackFormStarted);

    ["name", "email", "phone"].forEach(function (name) {
      field(name).addEventListener("input", function () {
        if (form.querySelector(".is-invalid")) setError(name, false);
      });
    });
  }

  /* ---------- place map dialog ---------- */

  function initMapDialog() {
    var dialog = document.getElementById("place-map");
    var openers = document.querySelectorAll("[data-map-open]");
    if (!dialog || !openers.length) return;

    var frame = dialog.querySelector(".map-dialog__frame");
    var closer = dialog.querySelector("[data-map-close]");
    var lastFocus = null;

    function loadFrame() {
      if (!frame || frame.getAttribute("src")) return;
      var src = frame.getAttribute("data-map-src");
      if (src) frame.setAttribute("src", src);
    }

    function open() {
      lastFocus = document.activeElement;
      loadFrame();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      if (closer) closer.focus();
      track("door_opened", { door_id: "place-map" });
    }

    function close() {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", open);
    });
    if (closer) closer.addEventListener("click", close);
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });
  }

  /* ---------- external links: stay on this page ---------- */

  function initExternalLinks() {
    var dialog = document.getElementById("ext-dialog");
    if (!dialog) return;

    var titleEl = document.getElementById("ext-dialog-title");
    var frame = dialog.querySelector("[data-ext-frame]");
    var fallback = dialog.querySelector("[data-ext-fallback]");
    var fallbackCopy = dialog.querySelector("[data-ext-fallback-copy]");
    var openWindow = dialog.querySelector("[data-ext-open-window]");
    var external = dialog.querySelector("[data-ext-external]");
    var closer = dialog.querySelector("[data-ext-close]");
    var lastFocus = null;

    /* Sites that refuse iframe embedding. */
    var noEmbed = [
      "wa.me",
      "whatsapp.com",
      "api.whatsapp.com",
      "google.com",
      "google.es",
      "calendar.app.google",
      "calendar.google.com",
      "facebook.com",
      "fb.com",
      "instagram.com",
      "homify.es",
      "homify.com",
      "houzz.es",
      "houzz.com",
      "x.com",
      "twitter.com",
    ];

    /* Sites that refuse embeds and our on-page popup — leave them to target="_blank".
       OpenStreetMap’s full map is not the embed endpoint and cannot load in an iframe. */
    var leaveAlone = ["linkedin.com", "lnkd.in", "openstreetmap.org"];

    function hostnameOf(url) {
      try {
        return new URL(url, window.location.href).hostname.replace(/^www\./, "");
      } catch (err) {
        return "";
      }
    }

    function hostMatches(host, list) {
      return list.some(function (blocked) {
        return host === blocked || host.endsWith("." + blocked);
      });
    }

    function isExternalHttp(url) {
      try {
        var parsed = new URL(url, window.location.href);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
        return parsed.origin !== window.location.origin;
      } catch (err) {
        return false;
      }
    }

    function canEmbed(url) {
      var host = hostnameOf(url);
      return !hostMatches(host, noEmbed);
    }

    function labelFor(anchor, url) {
      var text = (anchor.getAttribute("aria-label") || anchor.textContent || "").replace(/\s+/g, " ").trim();
      text = text.replace(/\s*\(opens in a (popup|new tab|new window)\)\s*$/i, "").trim();
      if (text && text.length < 80) return text;
      return hostnameOf(url) || "External link";
    }

    /* Open beside this page — never assign location.href (that would leave). */
    function openBeside(url) {
      return window.open(url, "_blank", "noopener,noreferrer");
    }

    function wireAwayLinks(url) {
      if (openWindow) {
        openWindow.href = url;
        openWindow.setAttribute("target", "_blank");
        openWindow.setAttribute("rel", "noopener noreferrer");
      }
      if (external) {
        external.href = url;
        external.setAttribute("target", "_blank");
        external.setAttribute("rel", "noopener noreferrer");
        external.textContent = "Open full page";
      }
    }

    function showDialog() {
      lastFocus = document.activeElement;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      if (closer) closer.focus();
    }

    function closeDialog() {
      if (frame) {
        frame.hidden = true;
        frame.removeAttribute("src");
      }
      if (fallback) fallback.hidden = true;
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function openExternal(anchor) {
      var url = anchor.href;
      wireAwayLinks(url);
      if (titleEl) titleEl.textContent = labelFor(anchor, url);

      if (canEmbed(url) && frame) {
        if (fallback) fallback.hidden = true;
        frame.hidden = false;
        frame.setAttribute("title", titleEl ? titleEl.textContent : "External site");
        frame.setAttribute("src", url);
        showDialog();
        return;
      }

      /* Instagram etc.: open a parallel tab on this gesture, keep the landing page. */
      if (frame) {
        frame.hidden = true;
        frame.removeAttribute("src");
      }
      var opened = openBeside(url);
      if (fallback) fallback.hidden = false;
      if (fallbackCopy) {
        fallbackCopy.textContent = opened
          ? "Opened in another window. This page is still here."
          : "Your browser blocked the window. Use the button below — this page will stay put.";
      }
      showDialog();
    }

    document.addEventListener(
      "click",
      function (event) {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        var anchor = event.target.closest && event.target.closest("a[href]");
        if (!anchor || anchor.hasAttribute("data-ext-ignore")) return;
        if (anchor.closest("#ext-dialog") || anchor.closest("#place-map")) return;
        if (!isExternalHttp(anchor.getAttribute("href"))) return;
        if (hostMatches(hostnameOf(anchor.href), leaveAlone)) return;

        event.preventDefault();
        event.stopPropagation();
        openExternal(anchor);
      },
      true
    );

    if (closer) closer.addEventListener("click", closeDialog);
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeDialog();
    });
  }

  /* ---------- photograph album ---------- */

  function initAlbum(dialogId, openAttr, closeAttr) {
    var dialog = document.getElementById(dialogId);
    var openers = document.querySelectorAll("[" + openAttr + "]");
    if (!dialog || !openers.length) return;

    var closer = dialog.querySelector("[" + closeAttr + "]");
    var lastFocus = null;

    function openAlbum() {
      lastFocus = document.activeElement;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      if (closer) closer.focus();
      track("door_opened", { door_id: dialogId });
    }

    function closeAlbum() {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", openAlbum);
    });
    if (closer) closer.addEventListener("click", closeAlbum);
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeAlbum();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeAlbum();
    });
  }

  function initAnalyticsCtas() {
    document.addEventListener("click", function (event) {
      var el = event.target.closest && event.target.closest("[data-cta]");
      if (!el) return;
      var id = el.getAttribute("data-cta");
      if (!id) return;
      var channel = el.getAttribute("data-cta-channel") || "";
      var extra = { cta_id: id };
      if (channel) extra.channel = channel;
      track("cta_opened", extra);
      if (channel === "whatsapp" || channel === "email" || channel === "calendar") {
        track("handoff_opened", { channel: channel, cta_id: id });
      }
      /* Any CTA can be the last thing that happens on this page — the deal
         sheet navigates away — so never leave the click sitting in the queue. */
      flushAnalytics();
    });
  }

  initMasthead();
  initFlap();
  initCarousel();
  initForm();
  initMapDialog();
  initExternalLinks();
  initAlbum("listing-photos", "data-listing-open", "data-listing-close");
  initAlbum("puzol-story", "data-puzol-open", "data-puzol-close");
  initAnalyticsCtas();
})();
