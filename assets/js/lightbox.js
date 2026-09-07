/**
 * Keyboard photo lightbox.
 * Markup: #lightbox with .lb-img, .lb-caption, .lb-close, .lb-prev, .lb-next
 * Open with EFLightbox.open([{ full, caption, alt }], startIndex, label)
 * Bind thumbnails with data-full, data-caption, data-alt on buttons.
 */
(function (global) {
  'use strict';

  function ensureMarkup() {
    var lb = document.getElementById('lightbox');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image gallery');
    lb.hidden = true;
    lb.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close">×</button>' +
      '<button class="lb-prev" type="button" aria-label="Previous photo">‹</button>' +
      '<img class="lb-img" src="" alt="" />' +
      '<p class="lb-caption"></p>' +
      '<button class="lb-next" type="button" aria-label="Next photo">›</button>';
    document.body.appendChild(lb);
    return lb;
  }

  function dataOf(el) {
    return {
      full: el.getAttribute('data-full') || (el.querySelector('img') && el.querySelector('img').src),
      caption: el.getAttribute('data-caption') || el.getAttribute('aria-label') || '',
      alt: el.getAttribute('data-alt') || ''
    };
  }

  function init() {
    var lb = ensureMarkup();
    var lbImg = lb.querySelector('.lb-img');
    var lbCap = lb.querySelector('.lb-caption');
    var order = [];
    var idx = 0;
    var lastFocused = null;

    function show() {
      var d = order[idx];
      if (!d) return;
      lbImg.src = d.full;
      lbImg.alt = d.alt || '';
      lbCap.textContent = d.caption
        ? d.caption + ' · ' + (idx + 1) + ' of ' + order.length
        : idx + 1 + ' of ' + order.length;
    }

    function openLightbox(items, start, label) {
      order = items.filter(Boolean);
      if (!order.length) return;
      idx = start || 0;
      lb.setAttribute('aria-label', label || 'Image gallery');
      show();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lastFocused = document.activeElement;
      lb.querySelector('.lb-close').focus();
    }

    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(delta) {
      if (!order.length) return;
      idx = (idx + delta + order.length) % order.length;
      show();
    }

    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', function () {
      step(-1);
    });
    lb.querySelector('.lb-next').addEventListener('click', function () {
      step(1);
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-lightbox-gallery]'), function (gallery) {
      var buttons = Array.prototype.slice.call(gallery.querySelectorAll('button, a'));
      buttons.forEach(function (btn, i) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          openLightbox(buttons.map(dataOf), i, gallery.getAttribute('aria-label'));
        });
      });
    });

    global.EFLightbox = {
      open: openLightbox,
      close: closeLightbox,
      dataOf: dataOf
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
