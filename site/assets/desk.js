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
      var opened = window.open(handoffUrl(data), "_blank", "noopener");
      if (!opened) window.location.href = handoffUrl(data);

      status.hidden = false;
      status.textContent =
        HANDOFF.mode === "mailto"
          ? "Your mail app should now be open with the message ready for Uriel."
          : "WhatsApp should now be open with your message to Uriel. If it did not open, write to " + HANDOFF.email + ".";
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

  initMasthead();
  initRack();
  initFlap();
  initCarousel();
  initForm();
  initMapDialog();
})();
