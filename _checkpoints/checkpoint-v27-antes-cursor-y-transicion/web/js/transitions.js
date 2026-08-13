/**
 * transitions.js — Animaciones disruptivas entre secciones
 *
 * EFECTOS IMPLEMENTADOS:
 *   1. TEXT SCRAMBLE   — Los labels de sección se "descifran" al aparecer
 *   2. CLIP REVEAL     — Los títulos de sección emergen desde abajo con máscara
 *   3. STAGGER CASCADE — Tarjetas y grids aparecen en cascada diagonal
 *   4. COUNTER         — Números estadísticos cuentan hasta su valor real
 *   5. LINE SCAN       — Una línea luminosa barre la sección al entrar
 *   6. GLITCH FLASH    — Breve destello de glitch al cruzar el umbral
 *
 * No conflicto con animations.js: opera sobre clases y elementos distintos.
 * Las clases CSS están en base.css bajo el bloque ":root transitions".
 */

/* ============================================================
   TEXT SCRAMBLE
   Mezcla aleatoria de caracteres que gradualmente revela el texto real.
   Efecto: "3LF[2LD" → "Trabajo" en ~700ms
   ============================================================ */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&·×';

function scrambleText(el, duration = 680) {
  const original = el.textContent.trim();
  const chars = original.split('');
  const totalFrames = Math.ceil(duration / 28);
  let frame = 0;

  // Preserve the element's original content for reset
  el.dataset.scrambleOriginal = original;

  const tick = () => {
    const revealed = Math.floor((frame / totalFrames) * chars.length);
    el.textContent = chars.map((ch, i) => {
      if (ch === ' ' || ch === '·' || ch === '-') return ch;
      if (i < revealed) return original[i];
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }).join('');

    if (++frame <= totalFrames) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = original; // Restore exact original
    }
  };

  requestAnimationFrame(tick);
}

/* ============================================================
   COUNTER ANIMATION
   Cuenta desde 0 hasta el valor final con easing ease-out.
   Detecta automáticamente el número en el texto del elemento.
   ============================================================ */
function animateCounter(el) {
  const text = el.textContent;
  const match = text.match(/(\d+)/);
  if (!match) return;

  const target = parseInt(match[1], 10);
  const prefix = text.slice(0, text.indexOf(match[0]));
  const suffix = text.slice(text.indexOf(match[0]) + match[0].length);
  const duration = 1200;
  const startTS = performance.now();

  const tick = (ts) => {
    const elapsed = ts - startTS;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };

  el.textContent = prefix + '0' + suffix;
  requestAnimationFrame(tick);
}

/* ============================================================
   GLITCH FLASH
   Añade brevemente un overlay de color y un ligero desplazamiento.
   Simula la interferencia digital cuando se cruza un umbral.
   ============================================================ */
function glitchFlash(el) {
  el.classList.add('glitch-flash');
  setTimeout(() => el.classList.remove('glitch-flash'), 400);
}

/* ============================================================
   SCANLINE REVEAL
   Una línea luminosa barre el elemento de arriba a abajo.
   CSS define la animación; este módulo añade la clase trigger.
   ============================================================ */
function scanReveal(el) {
  el.classList.add('scan-reveal');
}

/* ============================================================
   INIT — Observadores IntersectionObserver
   ============================================================ */
export function initTransitions() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  /* ── 1. SECTION LABELS — Text scramble ─────────────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        scrambleText(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.60 });

    // Aplicar a labels de sección (excluir los del hero que tienen su propia animación)
    document.querySelectorAll('.section-label').forEach(el => {
      obs.observe(el);
    });
  }

  /* ── 2. SECTION TITLES — Clip-path word reveal ──────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('title-enter');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.section-title').forEach(el => {
      el.classList.add('title-mask'); // establece estado inicial
      obs.observe(el);
    });
  }

  /* ── 3. WORK SECTION HEADER — Glitch + scan ────────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        glitchFlash(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.50 });

    const workHeader = document.querySelector('.work__header');
    if (workHeader) obs.observe(workHeader);
  }

  /* ── 4. CASE CARDS — Stagger con slide-right ───────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Escalonar usando el índice del elemento entre sus hermanos
        const siblings = [...document.querySelectorAll('.case')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('case-enter');
        }, idx * 70);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.case').forEach(el => {
      el.classList.add('case-hidden'); // estado inicial
      obs.observe(el);
    });
  }

  /* ── 5. PHILOSOPHY PRINCIPLES — Scale pop con stagger ──────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...document.querySelectorAll('.principle')];
        const idx = siblings.indexOf(el);
        setTimeout(() => el.classList.add('principle-enter'), idx * 90);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.principle').forEach(el => {
      el.classList.add('principle-hidden');
      obs.observe(el);
    });
  }

  /* ── 6. CAPABILITIES GRID — Diagonal stagger ───────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const items = [...document.querySelectorAll('.cap-item, .capability')];
        const idx = items.indexOf(el);
        setTimeout(() => el.classList.add('cap-enter'), idx * 55);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.cap-item, .capability').forEach(el => {
      el.classList.add('cap-hidden');
      obs.observe(el);
    });
  }

  /* ── 7. COUNTERS — Animar números al entrar ─────────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.70 });

    document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
  }

  /* ── 8. ABOUT + CONTACT — Slide-up con fade ────────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('block-enter');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-block]').forEach(el => {
      el.classList.add('block-hidden');
      obs.observe(el);
    });
  }

  /* ── 9. PROCESS SECTION — Scanline reveal ───────────────────── */
  {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('process-revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.20 });

    const processSection = document.querySelector('.process');
    if (processSection) obs.observe(processSection);
  }
}
