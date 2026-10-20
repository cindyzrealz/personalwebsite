/* ═══════════════════════════════════════════════════════
   script.js — Shared JavaScript for cindyzeng.com
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  /* ── Header scroll background ── */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* ── Hamburger menu toggle (mobile) ── */
  const nav = document.querySelector('.site-nav');
  if (nav && window.innerWidth <= 640) {
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Menu');
    hamburger.textContent = '☰';
    hamburger.addEventListener('click', function() {
      nav.classList.toggle('open');
      hamburger.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
    header.appendChild(hamburger);
  }

  /* ── Category filters (writing + carving) ── */
  document.querySelectorAll('.category-filters').forEach(function(nav) {
    const container = nav.nextElementSibling;
    if (!container) return;
    const items = container.querySelectorAll('[data-category]');
    const empty = container.nextElementSibling;

    function refreshEmptyState() {
      let visible = 0;
      items.forEach(function(item) { if (item.style.display !== 'none') visible++; });
      if (empty && empty.classList.contains('empty-state')) {
        empty.hidden = visible !== 0;
      }
    }

    nav.querySelectorAll('.filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const category = this.dataset.category;
        nav.querySelectorAll('.filter').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        items.forEach(function(item) {
          const show = (category === 'all' || item.dataset.category === category);
          item.style.display = show ? '' : 'none';
        });
        refreshEmptyState();
      });
    });

    refreshEmptyState();
  });

  /* ── Lightbox (carving gallery) ── */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImage = lightbox.querySelector('.lightbox-image');
    const lbTitle = lightbox.querySelector('.lightbox-title');
    const lbMeta = lightbox.querySelector('.lightbox-meta');
    const lbNotes = lightbox.querySelector('.lightbox-notes');
    const lbClose = lightbox.querySelector('.lightbox-close');

    let lastFocus = null;

    document.querySelectorAll('.gallery-item').forEach(function(item) {
      function open() {
        const title = item.dataset.title || '';
        const medium = item.dataset.medium || '';
        const dims = item.dataset.dims || '';
        const date = item.dataset.date || '';
        const notes = item.dataset.notes || '';
        const thumb = item.querySelector('img');
        const full = item.dataset.full || (thumb && thumb.src) || '';

        lbImage.src = full;
        lbImage.alt = title;
        lbTitle.textContent = title;
        lbMeta.textContent = [medium, dims, date].filter(Boolean).join(' · ');
        lbNotes.textContent = notes;

        lastFocus = item;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
      }
      item.addEventListener('click', open);
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  /* ── Video game intro → script transition ── */
  const gameIntro = document.querySelector('.game-intro-screen');
  if (gameIntro) {
    function goToScript() {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.8s ease';
      setTimeout(function() {
        window.location.href = 'videogame2.html';
      }, 800);
    }
    gameIntro.addEventListener('click', goToScript);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') goToScript();
    });
  }

});
