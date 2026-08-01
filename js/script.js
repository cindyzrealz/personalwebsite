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
  document.querySelectorAll('.filter').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const category = this.dataset.category;
      const parent = this.parentElement;
      parent.querySelectorAll('.filter').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');

      const container = parent.nextElementSibling;
      if (!container) return;
      const items = container.querySelectorAll('[data-category]');
      items.forEach(function(item) {
        item.style.display = (category === 'all' || item.dataset.category === category) ? '' : 'none';
      });
    });
  });

  /* ── Lightbox (carving gallery) ── */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImage = lightbox.querySelector('.lightbox-image');
    const lbTitle = lightbox.querySelector('.lightbox-title');
    const lbMeta = lightbox.querySelector('.lightbox-meta');
    const lbNotes = lightbox.querySelector('.lightbox-notes');
    const lbClose = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.gallery-item').forEach(function(item) {
      item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const overlay = this.querySelector('.gallery-overlay');
        if (img) {
          lbImage.src = img.src;
          lbImage.alt = img.alt;
        }
        if (overlay) {
          const h3 = overlay.querySelector('h3');
          const p = overlay.querySelector('p');
          if (h3) lbTitle.textContent = h3.textContent;
          if (p) lbMeta.textContent = p.textContent;
        }
        lbNotes.textContent = this.dataset.notes || '';
        lightbox.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
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
