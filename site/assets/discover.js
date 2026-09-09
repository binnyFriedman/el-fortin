(function () {
  "use strict";

  var isHe = String(document.documentElement.lang || "").toLowerCase().indexOf("he") === 0;

  function bedLabel(beds) {
    if (isHe) return beds === 1 ? "דירת חדר" : "דירת שני חדרים";
    return beds + "-Bedroom";
  }

  window.EFConfig = {
    floorPct: 0.04,
    targetPct: 0.07,
    closingPct: 0.12,
    unitTypes: {
      A: {
        bathrooms: 1,
        builtArea: "~47 m²",
        furniture: 15959.66,
        planCaption: "1-Bedroom floor plan",
        planAlt: "1-Bedroom floor plan: one bedroom, bathroom, kitchen and living room"
      },
      B: {
        bathrooms: 2,
        builtArea: "~57 m²",
        furniture: 19357.6,
        planCaption: "2-Bedroom floor plan",
        planAlt: "2-Bedroom floor plan: two bedrooms, two bathrooms and an open living and dining room"
      }
    },
    inventory: [
      { id: "1", beds: 2, layout: "2-Bed", valorPublico: 220225, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "available" },
      { id: "2", beds: 2, layout: "2-Bed", valorPublico: 220225, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "available" },
      { id: "3", beds: 2, layout: "2-Bed", valorPublico: 225707, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "available" },
      { id: "4", beds: 2, layout: "2-Bed", valorPublico: 225707, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "available" },
      { id: "5", beds: 1, layout: "1-Bed", valorPublico: 190557, typeClass: "A", area: "40.48 m² useful", plan: "assets/render-type-a.jpg", status: "available" },
      { id: "6", beds: 1, layout: "1-Bed", valorPublico: 190557, typeClass: "A", area: "40.44 m² useful", plan: "assets/render-type-a.jpg", status: "available" },
      { id: "7", beds: 1, layout: "1-Bed", valorPublico: 190557, typeClass: "A", area: "40.44 m² useful", plan: "assets/render-type-a.jpg", status: "available" },
      { id: "8", beds: 1, layout: "1-Bed", valorPublico: 190557, typeClass: "A", area: "40.44 m² useful", plan: "assets/render-type-a.jpg", status: "available" },
      { id: "9", beds: 2, layout: "2-Bed", valorPublico: 232125, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "available" },
      { id: "10", beds: 2, layout: "2-Bed", valorPublico: 232125, typeClass: "B", area: "49.05 m² useful", plan: "assets/render-type-b.jpg", status: "sold" }
    ]
  };

  window.EFMath = {
    euro: function (n) {
      return "€" + Math.round(n).toLocaleString("en-GB");
    },
    approxEuro: function (n) {
      return "≈ " + this.euro(n);
    },
    priceStack: function (unit) {
      var type = window.EFConfig.unitTypes[unit.typeClass];
      var sale = Math.round(unit.valorPublico);
      var furniture = Math.round(type.furniture);
      var closing = Math.round(sale * window.EFConfig.closingPct);
      return {
        sale: sale,
        closing: closing,
        furniture: furniture,
        allIn: sale + closing + furniture
      };
    },
    yieldBase: function (unit) {
      return Math.round(unit.valorPublico);
    },
    unitLine: function (unit) {
      var prefix = isHe ? "יחידה " : "Unit ";
      return prefix + unit.id + " · " + bedLabel(unit.beds) + " · " + this.euro(unit.valorPublico);
    }
  };

  function bindHeader() {
    var header = document.querySelector(".site-header");
    var hero = document.getElementById("hero");
    if (header && hero && "IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          header.classList.toggle("is-solid", !entries[0].isIntersecting);
        },
        { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
      ).observe(hero);
    }
  }

  function bindCalculator() {
    var selectedUnitId = "5";
    var floorPct = window.EFConfig.floorPct;

    function selectedUnit() {
      return window.EFConfig.inventory.find(function (u) {
        return u.id === selectedUnitId;
      });
    }

    function setText(id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function paintIncome(unit) {
      var annual = window.EFMath.yieldBase(unit) * floorPct;
          setText(
            "calc-slider-yearly",
            "≈ " + window.EFMath.euro(annual) + (isHe ? " / שנה" : " / year")
          );
          var monthly = document.getElementById("calc-slider-monthly");
          if (monthly) {
            monthly.textContent =
              "· ≈ " + window.EFMath.euro(annual / 12) + (isHe ? " / חודש" : " / month");
          }
    }

    function updateCalculator() {
      var unit = selectedUnit();
      if (!unit) return;

      var type = window.EFConfig.unitTypes[unit.typeClass];
      var typeUnits = window.EFConfig.inventory.filter(function (item) {
        return item.typeClass === unit.typeClass;
      });

      setText("calc-unit-title", window.EFMath.unitLine(unit));
      Array.prototype.forEach.call(document.querySelectorAll(".calc-unit-option"), function (opt) {
        var on = opt.getAttribute("data-id") === unit.id;
        opt.classList.toggle("is-selected", on);
        opt.setAttribute("aria-selected", on ? "true" : "false");
      });
      setText("calc-unit-meta", unit.area);
      setText("calc-spec-heading", bedLabel(unit.beds));
      setText("calc-unit-useful", unit.area.replace(" useful", ""));
      setText("calc-unit-built", type.builtArea);
      setText(
        "calc-unit-inventory",
        isHe ? typeUnits.length + " בבניין" : typeUnits.length + " in the building"
      );

      var plan = document.getElementById("calc-unit-plan");
      var planButton = document.getElementById("calc-unit-plan-button");
      var planCaption = document.getElementById("calc-plan-caption");
      var caption = isHe
        ? unit.beds === 1
          ? "תוכנית דירת חדר"
          : "תוכנית דירת שני חדרים"
        : type.planCaption;
      var planAlt = isHe
        ? unit.beds === 1
          ? "תוכנית דירת חדר: חדר שינה, חדר רחצה, מטבח וסלון"
          : "תוכנית דירת שני חדרים: שני חדרי שינה, שני חדרי רחצה וחלל מגורים פתוח"
        : type.planAlt;
      if (plan) {
        plan.src = unit.plan;
        plan.alt = planAlt;
      }
      if (planButton) {
        planButton.setAttribute("data-full", unit.plan);
        planButton.setAttribute("data-caption", caption);
        planButton.setAttribute("data-alt", planAlt);
        planButton.setAttribute(
          "aria-label",
          isHe ? "הגדלת " + caption : "Enlarge the " + caption
        );
      }
      if (planCaption) planCaption.textContent = caption;

      var stack = window.EFMath.priceStack(unit);
      setText("calc-price-sale", window.EFMath.euro(stack.sale));
      setText("calc-price-closing", window.EFMath.approxEuro(stack.closing));
      setText("calc-price-furniture", window.EFMath.euro(stack.furniture));
      setText("calc-price-allin", window.EFMath.approxEuro(stack.allIn));
      paintIncome(unit);
    }

    window.EFSelectUnit = function (id, fromUser) {
      selectedUnitId = id;
      updateCalculator();
      if (fromUser && window.EFAnalytics && typeof window.EFAnalytics.track === "function") {
        window.EFAnalytics.track("unit_selected", { unit_id: id });
      }
    };

    if (!document.getElementById("estimator")) return;
    updateCalculator();
  }

  function bindPicker() {
    var inventory = window.EFConfig.inventory;
    var picker = document.getElementById("calc-unit-picker");
    var trigger = document.getElementById("calc-unit-trigger");
    var menu = document.getElementById("calc-unit-menu");
    if (!picker || !trigger || !menu) return;

    var open = false;
    var activeIndex = -1;

    function options() {
      return Array.prototype.slice.call(menu.querySelectorAll(".calc-unit-option"));
    }

    function enabledOptions() {
      return options().filter(function (opt) {
        return !opt.disabled;
      });
    }

    function setOpen(next) {
      open = next;
      picker.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
      if (open) {
        var selected = menu.querySelector(".calc-unit-option.is-selected:not(:disabled)");
        var items = enabledOptions();
        activeIndex = selected ? items.indexOf(selected) : 0;
        if (activeIndex < 0) activeIndex = 0;
        paintActive();
      } else {
        activeIndex = -1;
        options().forEach(function (opt) {
          opt.classList.remove("is-active");
        });
      }
    }

    function paintActive() {
      var items = enabledOptions();
      items.forEach(function (opt, i) {
        opt.classList.toggle("is-active", i === activeIndex);
      });
      if (items[activeIndex]) items[activeIndex].focus();
    }

    function choose(id) {
      setOpen(false);
      trigger.focus();
      if (typeof window.EFSelectUnit === "function") window.EFSelectUnit(id, true);
    }

    inventory.forEach(function (unit) {
      var option = document.createElement("button");
      var taken = unit.status !== "available";
      option.type = "button";
      option.className = "calc-unit-option";
      option.id = "calc-unit-option-" + unit.id;
      option.setAttribute("role", "option");
      option.setAttribute("data-id", unit.id);
      option.setAttribute("aria-selected", "false");
      option.innerHTML =
        '<span class="calc-unit-option-copy">' +
        (isHe ? "יחידה " : "Unit ") +
        unit.id +
        " · " +
        bedLabel(unit.beds) +
        (unit.status === "sold" ? (isHe ? " · נמכרה" : " · Sold") : taken ? " · " + unit.status : "") +
        '</span><span class="calc-unit-option-price">' +
        window.EFMath.euro(unit.valorPublico) +
        "</span>";
      if (taken) {
        option.disabled = true;
      } else {
        option.addEventListener("click", function () {
          choose(unit.id);
        });
      }
      menu.appendChild(option);
    });

    trigger.addEventListener("click", function () {
      setOpen(!open);
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        if (!open) {
          e.preventDefault();
          setOpen(true);
        }
      }
    });

    menu.addEventListener("keydown", function (e) {
      var items = enabledOptions();
      if (!items.length) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        trigger.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        paintActive();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        paintActive();
      }
    });

    document.addEventListener("click", function (e) {
      if (open && !picker.contains(e.target)) setOpen(false);
    });

    if (typeof window.EFSelectUnit === "function") window.EFSelectUnit("5");
  }

  function bindLightbox() {
    var lb = document.getElementById("lightbox");
    if (!lb) return;
    var lbImg = lb.querySelector(".lb-img");
    var lbCap = lb.querySelector(".lb-caption");
    var order = [];
    var idx = 0;
    var lastFocused = null;

    function show() {
      var d = order[idx];
      lbImg.src = d.full;
      lbImg.alt = d.alt || "";
      lbCap.textContent = d.caption + " · " + (idx + 1) + " of " + order.length;
    }

    function openLightbox(items, start, label) {
      order = items;
      idx = start || 0;
      lb.setAttribute("aria-label", label || "Image gallery");
      show();
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocused = document.activeElement;
      lb.querySelector(".lb-close").focus();
    }

    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(delta) {
      idx = (idx + delta + order.length) % order.length;
      show();
    }

    function dataOf(btn) {
      return {
        full: btn.getAttribute("data-full"),
        caption: btn.getAttribute("data-caption"),
        alt: btn.getAttribute("data-alt")
      };
    }

    Array.prototype.forEach.call(
      document.querySelectorAll("#product-gallery button, .calc-plan-button"),
      function (btn) {
        btn.addEventListener("click", function () {
          var group;
          if (btn.classList.contains("calc-plan-button")) {
            group = [btn];
          } else {
            group = Array.prototype.slice.call(document.querySelectorAll("#product-gallery button"));
          }
          var start = group.indexOf(btn);
          openLightbox(group.map(dataOf), start < 0 ? 0 : start, "Gallery");
        });
      }
    );

    lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lb.querySelector(".lb-prev").addEventListener("click", function () {
      step(-1);
    });
    lb.querySelector(".lb-next").addEventListener("click", function () {
      step(1);
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function bindLead() {
    function openLead(e) {
      var form = document.getElementById("lead-form");
      var name = document.getElementById("lead-name");
      if (!form) return;
      if (e) e.preventDefault();
      form.hidden = false;
      form.classList.add("is-aimed");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      if (name) name.focus();
      window.setTimeout(function () {
        form.classList.remove("is-aimed");
      }, 1600);
    }

    document.querySelectorAll("[data-open-lead]").forEach(function (el) {
      el.addEventListener("click", openLead);
    });

    var form = document.getElementById("lead-form");
    var thanks = document.getElementById("lead-thanks");
    var error = document.getElementById("lead-error");
    if (!form || !thanks) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      error.textContent = "";
      var name = document.getElementById("lead-name").value.trim();
      var email = document.getElementById("lead-email").value.trim();
      var phone = document.getElementById("lead-phone").value.trim();
      var capitalEl = document.getElementById("lead-capital");
      var capital = capitalEl ? capitalEl.value.trim() : "";
      if (!name || !email || !phone || !capital) {
        error.textContent = isHe
          ? "נדרשים שם, אימייל, טלפון והון זמין."
          : "Name, email, phone, and available capital are required.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error.textContent = isHe ? "הזינו אימייל תקין." : "Enter a valid email.";
        return;
      }

      var contact = window.__EF_CONTACT__ || {};
      var waText = encodeURIComponent(
        isHe
          ? "שלום אוריאל — אני רוצה לבחון את אל פורטין.\n\nשם: " +
              name +
              "\nאימייל: " +
              email +
              "\nטלפון: " +
              phone +
              "\nהון זמין: " +
              capital
          : "Hello Uriel — I want to review El Fortín.\n\n" +
              "Name: " +
              name +
              "\nEmail: " +
              email +
              "\nPhone: " +
              phone +
              "\nAvailable capital: " +
              capital
      );
      var waHref = "https://wa.me/" + (contact.whatsapp || "34626459818") + "?text=" + waText;

      if (window.EFAnalytics && typeof window.EFAnalytics.track === "function") {
        window.EFAnalytics.track("cta_opened", {
          cta_id: "discover_lead_form",
          channel: "whatsapp"
        });
        if (typeof window.EFAnalytics.flush === "function") window.EFAnalytics.flush();
      }

      form.hidden = true;
      thanks.hidden = false;
      thanks.classList.add("is-open");

      var wa = document.getElementById("thanks-whatsapp");
      if (wa) wa.href = waHref;
      window.open(waHref, "_blank", "noopener");
    });
  }

  bindHeader();
  bindCalculator();
  bindPicker();
  bindLightbox();
  bindLead();
})();
