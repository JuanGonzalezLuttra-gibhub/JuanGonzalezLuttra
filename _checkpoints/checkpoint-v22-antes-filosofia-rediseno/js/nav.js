/**
 * nav.js — Navegación principal
 * - Crystallización al hacer scroll (glassmorphism)
 * - Scroll progress bar electric→gold en la parte superior
 * - Indicador de sección activa mediante dots
 * - Menú mobile con overlay
 */

export function initNav() {
  const nav         = document.getElementById('nav');
  const progressBar = document.getElementById('scrollProgress');
  const burger      = document.getElementById('navBurger');
  const mobileMenu  = document.getElementById('navMobile');
  const navLinks    = document.querySelectorAll('.nav__link');

  if (!nav) return;

  /* ---- Progress bar de scroll ---- */
  const updateProgress = () => {
    if (!progressBar) return;
    const st      = window.scrollY;
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const pct     = docH > 0 ? Math.min(100, (st / docH) * 100) : 0;
    progressBar.style.setProperty('--progress', `${pct}%`);
  };

  /* ---- Crystallización del nav ---- */
  const SCROLL_THRESHOLD = 60;
  let   isScrolled       = false;

  const updateNav = () => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    if (scrolled !== isScrolled) {
      isScrolled = scrolled;
      nav.classList.toggle('nav--scrolled', scrolled);
    }
    updateProgress();
  };

  /* ---- Sección activa ---- */
  const sections = [...document.querySelectorAll('section[id]')];

  const updateActiveLink = () => {
    const vh         = window.innerHeight;
    let   activeId   = null;

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= vh * 0.4 && rect.bottom >= vh * 0.4) {
        activeId = sec.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('nav__link--active', href === activeId);
    });
  };

  /* ---- Mobile menu ---- */
  const openMenu = () => {
    mobileMenu?.classList.add('is-open');
    burger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ---- Cinematic Transport Navigation (Transición animada entre secciones) ---- */
  const overlay = document.getElementById('transportOverlay');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        e.preventDefault();
        closeMenu();

        // 1. Activar velo cinemático (fade in 300ms)
        if (overlay) {
          overlay.classList.add('is-active');
        }

        // 2. Realizar salto en el pico de opacidad (280ms)
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });

          if (history.pushState) {
            history.pushState(null, '', href);
          } else {
            window.location.hash = href;
          }

          updateNav();
          updateActiveLink();

          // 3. Desvanecer velo tras breve pausa cinemática (80ms)
          setTimeout(() => {
            if (overlay) {
              overlay.classList.remove('is-active');
            }
          }, 80);
        }, 280);
      }
    });
  });

  /* ---- Scroll handler con rAF throttle ---- */
  let rafPending = false;
  const onScroll = () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        updateNav();
        updateActiveLink();
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Estado inicial
  updateNav();
  updateActiveLink();
}
