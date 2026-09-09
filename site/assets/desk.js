/* El Fortín Riba-roja — The Concierge Desk
   Key rack, split-flap board, progress carousel, masthead, guest-book handoff. */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Configuration — the one place to change when the form target is decided.
     mode: "whatsapp" opens a chat with Uriel carrying the message;
           "mailto"   opens the visitor's mail client addressed to Uriel.
  ------------------------------------------------------------------ */
  var HANDOFF = {
    mode: "whatsapp",
    whatsapp: "34626459818",
    email: "uriel.nabel@elfortincapital.com",
    subject: "El Fortín Riba-roja — enquiry",
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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

  /* ---------- the key rack ---------- */

  function unitMarkup(tag) {
    var d = tag.dataset;
    return (
      '<div class="unit">' +
      '<span class="unit__num">' + d.unit + "</span>" +
      '<span class="unit__type">' + d.type + "</span>" +
      '<span class="unit__lines">' +
      "<span>Useful <b>" + d.area + " m²</b></span>" +
      "<span>Built <b>~" + d.built + " m²</b></span>" +
      "<span>Appraised <b>" + euro.format(Number(d.price)) + "</b></span>" +
      "<span>Registered in <b>your name</b></span>" +
      "</span>" +
      "</div>"
    );
  }

  function initRack() {
    var rack = document.querySelector("[data-rack]");
    var detail = document.querySelector("[data-rack-detail]");
    if (!rack || !detail) return;

    var emptyState = detail.innerHTML;
    var tags = Array.prototype.slice.call(rack.querySelectorAll(".tag"));

    function settle(tag) {
      if (reduceMotion) return;
      tag.classList.add("is-settling");
      tag.addEventListener(
        "animationend",
        function () {
          tag.classList.remove("is-settling");
        },
        { once: true }
      );
    }

    function select(tag) {
      var wasPressed = tag.getAttribute("aria-pressed") === "true";
      tags.forEach(function (t) {
        if (t.getAttribute("aria-pressed") === "true" && t !== tag) settle(t);
        t.setAttribute("aria-pressed", "false");
      });
      if (wasPressed) {
        settle(tag);
        detail.innerHTML = emptyState;
        return;
      }
      tag.setAttribute("aria-pressed", "true");
      detail.innerHTML = unitMarkup(tag);
    }

    rack.addEventListener("click", function (event) {
      var tag = event.target.closest(".tag");
      if (tag) select(tag);
    });

    rack.addEventListener("keydown", function (event) {
      var tag = event.target.closest(".tag");
      if (!tag) return;
      var index = tags.indexOf(tag);
      var next = null;
      if (event.key === "ArrowRight") next = tags[(index + 1) % tags.length];
      if (event.key === "ArrowLeft") next = tags[(index - 1 + tags.length) % tags.length];
      if (next) {
        event.preventDefault();
        next.focus();
      }
    });
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
            // restart the animation on the next frame
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

  /* ---------- the guest book ---------- */

  function composeMessage(data) {
    var lines = [
      "Hello Uriel,",
      "",
      "Name: " + data.name,
      "Email: " + data.email,
    ];
    if (data.residence) lines.push("Tax residence: " + data.residence);
    if (data.type) lines.push("Interested in: " + data.type);
    if (data.questions) lines.push("", "Questions:", data.questions);
    lines.push("", "Sent from the El Fortín Riba-roja page.");
    return lines.join("\n");
  }

  function handoffUrl(data) {
    var body = composeMessage(data);
    if (HANDOFF.mode === "mailto") {
      return (
        "mailto:" + HANDOFF.email +
        "?subject=" + encodeURIComponent(HANDOFF.subject) +
        "&body=" + encodeURIComponent(body)
      );
    }
    return "https://wa.me/" + HANDOFF.whatsapp + "?text=" + encodeURIComponent(body);
  }

  function initForm() {
    var form = document.querySelector("[data-form]");
    if (!form) return;

    var status = form.querySelector("[data-status]");
    var hint = form.querySelector("[data-hint]");
    var submit = form.querySelector("[data-submit]");

    if (hint && HANDOFF.mode === "mailto") {
      hint.textContent = "Your message opens in your mail app, addressed to Uriel. Nothing is stored on this page.";
    }

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

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = {
        name: field("name").value.trim(),
        email: field("email").value.trim(),
        residence: field("residence").value.trim(),
        type: (form.querySelector('input[name="type"]:checked') || {}).value || "",
        questions: field("questions").value.trim(),
      };

      var nameOk = data.name.length > 0;
      var emailOk = validEmail(data.email);
      setError("name", !nameOk);
      setError("email", !emailOk);
      if (!nameOk || !emailOk) {
        (nameOk ? field("email") : field("name")).focus();
        return;
      }

      submit.disabled = true;
      var opened = window.open(handoffUrl(data), "_blank", "noopener,noreferrer");
      status.hidden = false;
      status.textContent = opened
        ? HANDOFF.mode === "mailto"
          ? "Your mail app should now be open with the message ready for Uriel."
          : "WhatsApp should now be open with your message to Uriel."
        : "Could not open a new window. Write to " +
          HANDOFF.email +
          " or allow pop-ups for this site — this page will stay open.";
      submit.disabled = false;
    });

    ["name", "email"].forEach(function (name) {
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

    /* LinkedIn refuses embeds and our on-page popup — leave it to target="_blank". */
    var leaveAlone = ["linkedin.com", "lnkd.in"];

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
        if (anchor.closest("#ext-dialog")) return;
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

  /* ---------- Puzol album ---------- */

  function initPuzolAlbum() {
    var dialog = document.getElementById("puzol-story");
    var openers = document.querySelectorAll("[data-puzol-open]");
    if (!dialog || !openers.length) return;

    var closer = dialog.querySelector("[data-puzol-close]");
    var lastFocus = null;

    function openAlbum() {
      lastFocus = document.activeElement;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      if (closer) closer.focus();
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

  initMasthead();
  initRack();
  initFlap();
  initCarousel();
  initForm();
  initMapDialog();
  initExternalLinks();
  initPuzolAlbum();
})();
