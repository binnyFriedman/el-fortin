(function () {
  'use strict';

  const DOC_URLS = {
    license: 'assets/docs/Licencia%20de%20Obra.pdf',
    plans: 'assets/docs/P00-PE-PLANOS_firmado_sellado.PDF',
    // tabo: 'assets/docs/tabo-excerpt.pdf',
    // 'investor-summary': 'assets/docs/investor-agreement-summary.pdf'
  };

  const DOC_TITLES = {
    license: 'Download Construction License',
    plans: 'Download Architectural Plans',
    tabo: 'Download deed excerpt',
    'investor-summary': 'Download Investor Agreement Summary'
  };

  let activeDocUrl = null;

  // Scroll reveal
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // Nav scroll effect
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    });
  }

  // Mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navCta = document.getElementById('navCta');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (navCta) navCta.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (navCta) navCta.classList.remove('open');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Contact form (frontend only)
  window.handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form) form.style.display = 'none';
    if (success) success.classList.add('visible');
  };

  const PAGE2_URL = 'project-fact-hub.html';

  function redirectToDataRoom() {
    try {
      sessionStorage.clear();
      localStorage.removeItem('elfortin-intake');
    } catch (_) { /* storage may be unavailable */ }
    window.location.replace(PAGE2_URL);
  }

  // Funnel page — instant redirect to data room (Page 2)
  window.handleFunnelSubmit = function handleFunnelSubmit(e) {
    e.preventDefault();
    redirectToDataRoom();
  };

  // Page 1 landing — clear cache and redirect to due diligence area
  window.handleLandingSubmit = function handleLandingSubmit(e) {
    e.preventDefault();
    redirectToDataRoom();
  };

  // Mobile sticky CTA — appears after scrolling past hero
  const stickyCta = document.getElementById('stickyCta');
  const stickyCtaBtn = document.getElementById('stickyCtaBtn');
  const landingHero = document.querySelector('.page-landing .landing-hero');
  if (stickyCta && landingHero) {
    const mqDesktop = window.matchMedia('(min-width: 1024px)');

    function updateStickyCta() {
      if (mqDesktop.matches) {
        stickyCta.hidden = true;
        stickyCta.classList.remove('is-visible');
        document.body.classList.remove('has-sticky-cta');
        return;
      }
      const pastHero = landingHero.getBoundingClientRect().bottom < 0;
      stickyCta.hidden = false;
      stickyCta.classList.toggle('is-visible', pastHero);
      document.body.classList.toggle('has-sticky-cta', pastHero);
    }

    window.addEventListener('scroll', updateStickyCta, { passive: true });
    mqDesktop.addEventListener('change', updateStickyCta);
    updateStickyCta();

    if (stickyCtaBtn) {
      stickyCtaBtn.addEventListener('click', () => {
        const intake = document.getElementById('intake');
        if (!intake) return;
        const offset = 16;
        const top = intake.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
  }

  // Pre-fill unit interest from ?unit= query param
  const unitSelect = document.getElementById('unitInterest');
  if (unitSelect) {
    const unitParam = new URLSearchParams(window.location.search).get('unit');
    if (unitParam && unitSelect.querySelector(`option[value="${unitParam}"]`)) {
      unitSelect.value = unitParam;
    }
  }

  // Number counter animation
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 600;
        const start = performance.now();
        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + '%';
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter-animated').forEach((el) => counterObserver.observe(el));

  // Smooth scroll for same-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Document download modal
  const modalOverlay = document.getElementById('docModal');
  const modalForm = document.getElementById('docModalForm');
  const modalSuccess = document.getElementById('docModalSuccess');
  const modalTitle = document.getElementById('docModalTitle');

  window.openDocModal = function openDocModal(docKey) {
    activeDocUrl = DOC_URLS[docKey];
    if (!modalOverlay || !activeDocUrl) return;
    const trigger = document.querySelector(`[data-doc="${docKey}"]`);
    if (modalTitle) {
      modalTitle.textContent = (trigger && trigger.dataset.docTitle) || DOC_TITLES[docKey] || 'Project file';
    }
    if (modalForm) {
      modalForm.classList.remove('hidden');
      modalForm.reset();
    }
    if (modalSuccess) modalSuccess.classList.remove('visible');
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closeDocModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeDocUrl = null;
  }

  if (modalOverlay) {
    modalOverlay.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeDocModal);
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeDocModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeDocModal();
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      modalForm.classList.add('hidden');
      if (modalSuccess) modalSuccess.classList.add('visible');
      if (activeDocUrl) {
        const link = document.createElement('a');
        link.href = activeDocUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.click();
      }
    });
  }

  document.querySelectorAll('[data-doc]').forEach((btn) => {
    btn.addEventListener('click', () => openDocModal(btn.getAttribute('data-doc')));
  });

  // Before / after slider
  // Layer order: base img = right of handle (After); after-wrap img = left of handle (Before).
  // See assets/brand/puzol/README.md — filenames are not swapped; HTML layer assignment is intentional.
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const afterWrap = slider.querySelector('.ba-slider__after-wrap');
    const afterImg = afterWrap && afterWrap.querySelector('.ba-slider__img');
    const handle = slider.querySelector('.ba-slider__handle');
    if (!afterWrap || !handle) return;

    let dragging = false;

    function syncAfterWidth() {
      if (afterImg) afterImg.style.width = slider.offsetWidth + 'px';
    }

    function setPosition(percent) {
      const p = Math.max(5, Math.min(95, percent));
      afterWrap.style.width = p + '%';
      handle.style.left = p + '%';
      syncAfterWidth();
    }

    syncAfterWidth();
    window.addEventListener('resize', syncAfterWidth);

    function positionFromEvent(clientX) {
      const rect = slider.getBoundingClientRect();
      const p = ((clientX - rect.left) / rect.width) * 100;
      setPosition(p);
    }

    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      e.preventDefault();
    });
    slider.addEventListener('mousedown', (e) => {
      if (e.target === handle) return;
      dragging = true;
      positionFromEvent(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (dragging) positionFromEvent(e.clientX);
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    handle.addEventListener('touchstart', (e) => {
      dragging = true;
      e.preventDefault();
    }, { passive: false });
    slider.addEventListener('touchstart', (e) => {
      if (e.target === handle) return;
      dragging = true;
      positionFromEvent(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches[0]) positionFromEvent(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });

    setPosition(50);
  });

  // Riba-Roja construction progress gallery — real site photos (June 2026)
  const PROGRESS_IMAGES = [
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.34.jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.34%20(1).jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.30.jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.30%20(1).jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.31.jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.32.jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.33.jpeg',
    'assets/brand/on-going-construction/WhatsApp%20Image%202026-06-09%20at%2018.10.32%20(4).jpeg'
  ];
  const PROGRESS_PLACEHOLDER = false;
  const progressGallery = document.getElementById('progressGallery');
  const progressEmpty = document.getElementById('progressGalleryEmpty');
  const progressCaption = document.getElementById('progressGalleryCaption');
  if (progressGallery && PROGRESS_IMAGES.length > 0) {
    PROGRESS_IMAGES.forEach((src, index) => {
      const fig = document.createElement('figure');
      fig.className = 'photo-gallery__item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Riba-Roja construction progress — photo ${index + 1}`;
      img.loading = 'lazy';
      fig.appendChild(img);
      progressGallery.appendChild(fig);
    });
    progressGallery.classList.remove('progress-gallery--empty');
    if (progressEmpty) progressEmpty.hidden = true;
    if (progressCaption) progressCaption.hidden = !PROGRESS_PLACEHOLDER;
  } else if (progressGallery && progressEmpty) {
    progressEmpty.hidden = false;
  }

  // Fact hub — construction site gallery
  const FH_BUILD_GALLERY = [
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.34.jpeg', alt: 'Site — NODHOUSES banner' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.34 (1).jpeg', alt: 'Site — facade progress' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.30.jpeg', alt: 'Site — structural works' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.30 (1).jpeg', alt: 'Site — ground floor structure' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.31.jpeg', alt: 'Site — upper levels' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.32.jpeg', alt: 'Site — roof structure' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.33.jpeg', alt: 'Site — roof level' },
    { src: 'assets/brand/on-going-construction/WhatsApp Image 2026-06-09 at 18.10.32 (4).jpeg', alt: 'Site — overview' }
  ];
  const buildGalleryEl = document.getElementById('buildGallery');
  const buildGalleryOpen = document.getElementById('buildGalleryOpen');
  const buildGalleryImg = document.getElementById('buildGalleryImg');
  const buildGalleryCaption = document.getElementById('buildGalleryCaption');
  const buildGalleryCount = document.getElementById('buildGalleryCount');
  let buildGalleryIndex = 0;

  function renderBuildGallerySlide(index) {
    if (!buildGalleryEl || !FH_BUILD_GALLERY.length) return;
    buildGalleryIndex = (index + FH_BUILD_GALLERY.length) % FH_BUILD_GALLERY.length;
    const slide = FH_BUILD_GALLERY[buildGalleryIndex];
    if (buildGalleryImg) {
      buildGalleryImg.src = slide.src;
      buildGalleryImg.alt = slide.alt;
    }
    if (buildGalleryCaption) buildGalleryCaption.textContent = slide.alt;
    if (buildGalleryCount) {
      buildGalleryCount.textContent = `${buildGalleryIndex + 1} / ${FH_BUILD_GALLERY.length}`;
    }
  }

  function openBuildGallery(startIndex = 0) {
    if (!buildGalleryEl) return;
    renderBuildGallerySlide(startIndex);
    buildGalleryEl.classList.add('is-open');
    buildGalleryEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    buildGalleryEl.querySelector('[data-close-gallery]')?.focus();
  }

  function closeBuildGallery() {
    if (!buildGalleryEl) return;
    buildGalleryEl.classList.remove('is-open');
    buildGalleryEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    buildGalleryOpen?.focus();
  }

  if (buildGalleryEl && buildGalleryOpen) {
    buildGalleryOpen.addEventListener('click', () => openBuildGallery(0));
    buildGalleryEl.querySelectorAll('[data-close-gallery]').forEach((el) => {
      el.addEventListener('click', closeBuildGallery);
    });
    buildGalleryEl.querySelector('[data-gallery-prev]')?.addEventListener('click', () => {
      renderBuildGallerySlide(buildGalleryIndex - 1);
    });
    buildGalleryEl.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
      renderBuildGallerySlide(buildGalleryIndex + 1);
    });
    buildGalleryEl.addEventListener('click', (e) => {
      if (e.target === buildGalleryEl) closeBuildGallery();
    });
    document.addEventListener('keydown', (e) => {
      if (!buildGalleryEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeBuildGallery();
      else if (e.key === 'ArrowLeft') renderBuildGallerySlide(buildGalleryIndex - 1);
      else if (e.key === 'ArrowRight') renderBuildGallerySlide(buildGalleryIndex + 1);
    });
  }

  // Fact hub — sticky mobile bar
  const fhSticky = document.getElementById('fhSticky');
  const fhInstrument = document.querySelector('.fh-instrument');
  if (fhSticky && fhInstrument) {
    fhSticky.hidden = false;
    const fhMq = window.matchMedia('(max-width: 640px)');
    function updateFhSticky() {
      if (!fhMq.matches) {
        fhSticky.classList.remove('is-visible');
        document.body.classList.remove('has-sticky-bar');
        return;
      }
      const pastInstrument = fhInstrument.getBoundingClientRect().bottom < 0;
      fhSticky.classList.toggle('is-visible', pastInstrument);
      document.body.classList.toggle('has-sticky-bar', pastInstrument);
    }
    window.addEventListener('scroll', updateFhSticky, { passive: true });
    fhMq.addEventListener('change', updateFhSticky);
    updateFhSticky();
  }

  // Fact hub — section nav highlight
  if (document.body.classList.contains('page-fact-hub') && navLinks) {
    const sectionIds = ['summary', 'proof', 'capital', 'call'];
    const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length && navAnchors.length) {
      const setActive = (id) => {
        navAnchors.forEach((link) => {
          const match = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('nav__link--active', match);
          if (match) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      };

      const spyObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.4] });

      sections.forEach((section) => spyObserver.observe(section));
    }
  }

  // Investment overview — highlight nav link for current section
  if (document.body.classList.contains('page-investment-overview') && navLinks) {
    const sectionIds = document.body.classList.contains('page-brochure-refined')
      ? ['asset', 'deal', 'site', 'proof', 'due-diligence', 'briefing']
      : ['development', 'units', 'milestones', 'returns', 'track-record', 'due-diligence', 'briefing'];
    const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length && navAnchors.length) {
      const setActive = (id) => {
        navAnchors.forEach((link) => {
          const match = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('nav__link--active', match);
          if (match) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      };

      const spyObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.4] });

      sections.forEach((section) => spyObserver.observe(section));
    }
  }
})();
