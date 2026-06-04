(function () {
  'use strict';

  const DOC_URLS = {
    license: 'assets/docs/Licencia%20de%20Obra.pdf',
    plans: 'assets/docs/P00-PE-PLANOS_firmado_sellado.PDF'
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
    if (modalTitle) {
      modalTitle.textContent = docKey === 'license'
        ? 'Download Construction License'
        : 'Download Architectural Plans';
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

  // Riba-Roja construction progress gallery (portfolio-brochure)
  // Add image paths here when site photos are uploaded to assets/brand/riba-roja-progress/
  const PROGRESS_IMAGES = [
    // 'assets/brand/riba-roja-progress/example-01.jpg',
  ];
  const progressGallery = document.getElementById('progressGallery');
  const progressEmpty = document.getElementById('progressGalleryEmpty');
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
  }
})();
