/**
 * animations.js — Sistema de animaciones de entrada y microinteracciones
 *
 * Técnicas:
 * - Hero: word-stagger con clip-path (no simple fade — editoral mask reveal)
 * - Secciones: IntersectionObserver con stagger entre siblings
 * - Philosophy: reveal diferenciado por tipo de principio
 * - Contact email: copy-to-clipboard con feedback visual
 * - Cases: full-card click handler
 */

/* ============================================================
   HERO — Animación de entrada de palabras
   clip-path mask reveal: cada palabra "entra" desde abajo
   en vez del simple opacity fade
   ============================================================ */
function initHeroAnimation() {
  const words = document.querySelectorAll('.hero__word');
  if (!words.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  words.forEach((word, i) => {
    if (reducedMotion) {
      word.style.opacity        = '1';
      word.style.clipPath       = 'none';
      word.style.transform      = 'none';
    } else {
      const delay = 120 + i * 90; // ms
      word.style.transitionDelay    = `${delay}ms`;
      word.style.transitionDuration = '800ms';
      word.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
      word.style.transition = `opacity ${800}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${800}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

      // Trigger en siguiente frame para que la transición sea visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          word.style.opacity   = '1';
          word.style.transform = 'translateY(0)';
        });
      });
    }
  });

  // Hero rule expand
  const rule = document.querySelector('.hero__rule');
  if (rule && !reducedMotion) {
    rule.style.transition = 'width 1200ms cubic-bezier(0.16,1,0.3,1) 1200ms';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rule.classList.add('is-expanded');
      });
    });
  }
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver con stagger
   ============================================================ */
function initScrollReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el      = entry.target;
        const siblings = el.parentElement
          ? [...el.parentElement.querySelectorAll('[data-animate]')]
          : [el];
        const idx = siblings.indexOf(el);

        // Stagger: cada elemento se retrasa 80ms respecto al anterior del mismo padre
        const delay = idx * 80;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
}

/* ============================================================
   PHILOSOPHY — Reveal por tipo de principio
   Monumental: mask desde izquierda
   Contrast: desde derecha
   Intimate, Closing: fade-up (el IntersectionObserver base lo maneja)
   ============================================================ */
function initPhilosophyReveal() {
  // Los principios usan data-animate pero tienen transiciones
  // diferenciadas vía CSS según su clase de modificador.
  // Este módulo sólo añade la clase .is-triggered para activar
  // las variaciones de clip-path definidas en philosophy.css
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const manifesto = document.querySelector('.philosophy__manifesto');
  if (!manifesto) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-triggered');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  manifesto.querySelectorAll('.principle').forEach((p) => observer.observe(p));
}

/* ============================================================
   CASES REVEAL — Secuencia de entrada escalonada y repetible en scroll
   ============================================================ */
function initCasesReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cases = document.querySelectorAll('.case');

  if (!cases.length) return;

  if (reducedMotion) {
    cases.forEach((c) => c.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Permite que la animación se repita siempre al entrar en pantalla (scroll arriba y abajo)
          entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  cases.forEach((c) => observer.observe(c));
}

/* ============================================================
   CONTACT — Copy email al portapapeles
   ============================================================ */
function initEmailCopy() {
  const btn = document.getElementById('emailCopy');
  if (!btn) return;

  const iconCopy  = btn.querySelector('.icon-copy');
  const iconCheck = btn.querySelector('.icon-check');
  const label     = btn.querySelector('[data-label]');
  let   timer;

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email || 'hola@juangonzalezluttra.com';
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback para entornos sin permisos de clipboard
      const ta = Object.assign(document.createElement('textarea'), {
        value: email, style: 'position:fixed;opacity:0;',
      });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    iconCopy?.classList.add('is-hidden');
    iconCheck?.classList.remove('is-hidden');
    if (label) label.textContent = '¡Copiado!';
    btn.classList.add('is-copied');

    clearTimeout(timer);
    timer = setTimeout(() => {
      iconCopy?.classList.remove('is-hidden');
      iconCheck?.classList.add('is-hidden');
      if (label) label.textContent = email;
      btn.classList.remove('is-copied');
    }, 2400);
  });
}

/* ============================================================
   CURSOR — Actualizar label contextual únicamente en la captura del caso
   ============================================================ */
function initCursorContext() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const visuals = document.querySelectorAll('.case__visual[href]');
  visuals.forEach((visual) => {
    visual.addEventListener('mouseenter', () => cursor.classList.add('cursor--open'));
    visual.addEventListener('mouseleave', () => cursor.classList.remove('cursor--open'));
  });
}

/* ============================================================
   EXPORT principal
   ============================================================ */
export function initAnimations() {
  initHeroAnimation();
  initScrollReveal();
  initCasesReveal();
  initPhilosophyReveal();
  initEmailCopy();
  initCursorContext();
}
