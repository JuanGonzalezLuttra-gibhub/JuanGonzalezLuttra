/**
 * capabilities-deck.js — Mazo de tarjetas y secuencia de entrada
 * v10.0 — Entrada progresiva: Estado inicial con INTRODUCCIÓN SOLA (sin tarjetas).
 *         Secuencia por scroll: Intro Sola -> Diseño -> Desarrollo -> Automatización -> IA -> Persona.
 */

// ─── Textos de máquina de escribir ───────────────────────────────────────────

const LINE_1 = 'No se trata de hacer más.';
const LINE_2 = 'Se trata de hacer que todo trabaje para el objetivo.';
const SPEED_MS = 50;

function runTypewriter(section) {
  const el1 = section.querySelector('[data-typewriter-line="1"]');
  const el2 = section.querySelector('[data-typewriter-line="2"]');
  if (!el1 || !el2) return;

  el1.textContent = '';
  el2.textContent = '';

  let charIdx = 0;
  let onSecondLine = false;
  let cursor = null;

  function addCursor(el) {
    if (cursor) cursor.remove();
    cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.appendChild(cursor);
  }

  addCursor(el1);

  const interval = setInterval(() => {
    if (!onSecondLine) {
      if (charIdx < LINE_1.length) {
        el1.textContent = LINE_1.slice(0, charIdx + 1);
        addCursor(el1);
        charIdx++;
      } else {
        charIdx = 0;
        onSecondLine = true;
      }
    } else {
      if (charIdx < LINE_2.length) {
        el2.textContent = LINE_2.slice(0, charIdx + 1);
        addCursor(el2);
        charIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => { if (cursor) cursor.remove(); }, 1200);
      }
    }
  }, SPEED_MS);
}

// ─── Secuencia y animación por scroll ─────────────────────────────────────────

export function initCapabilitiesDeck() {
  const section   = document.querySelector('#capacidades');
  const deckCol   = document.querySelector('#capabilities-deck');
  const stickyCol = section ? section.querySelector('.capabilities__sticky-col') : null;
  if (!section || !deckCol) return;

  const wrapper = deckCol.querySelector('.capabilities__deck-wrapper');
  const cards   = wrapper
    ? Array.from(wrapper.querySelectorAll('.capability-card'))
    : Array.from(deckCol.querySelectorAll('.capability-card'));

  if (!cards.length) return;

  const N = cards.length; // 4 tarjetas

  // Sin animaciones / Móvil
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile      = window.matchMedia('(max-width: 900px)').matches;

  if (reducedMotion) {
    if (stickyCol) stickyCol.classList.add('is-revealed');
    cards.forEach(c => c.classList.add('is-active'));
    const el1 = section.querySelector('[data-typewriter-line="1"]');
    const el2 = section.querySelector('[data-typewriter-line="2"]');
    if (el1) el1.textContent = LINE_1;
    if (el2) el2.textContent = LINE_2;
    return;
  }

  let typewriterTriggered = false;

  function triggerTitleEntrance() {
    if (typewriterTriggered) return;
    typewriterTriggered = true;
    if (stickyCol) stickyCol.classList.add('is-revealed');
    setTimeout(() => {
      runTypewriter(section);
    }, 300);
  }

  function resetTitleEntrance() {
    typewriterTriggered = false;
    if (stickyCol) stickyCol.classList.remove('is-revealed');
    const el1 = section.querySelector('[data-typewriter-line="1"]');
    const el2 = section.querySelector('[data-typewriter-line="2"]');
    if (el1) el1.textContent = '';
    if (el2) el2.textContent = '';
  }

  // ── Secuencia de entrada progresiva por scroll ──────────────────────────────
  // ── Secuencia de entrada progresiva por scroll ──────────────────────────────
  // Estado 0: Intro Sola (0 tarjetas) -> Tarjeta 0 (Diseño) -> Tarjeta 1 (Desarrollo) -> Tarjeta 2 (Automatización) -> Tarjeta 3 (IA)

  const INTRO_BUFFER = 0.16; // 16% inicial exclusivo para mostrar el titular solo (ninguna tarjeta visible)

  function updateCards() {
    const sectionRect = section.getBoundingClientRect();
    const sectionH    = section.offsetHeight;
    const vpH         = window.innerHeight;

    // Fuera de la sección por arriba
    if (sectionRect.top > vpH * 0.85) {
      resetTitleEntrance();
      cards.forEach(c => c.classList.remove('is-active', 'is-passed'));
      return;
    }

    // Disparar animación de entrada del titular cuando la sección se aproxima
    if (sectionRect.top <= vpH * 0.75) {
      triggerTitleEntrance();
    }

    const STICKY_TOP = 90;
    const scrollable = Math.max(1, sectionH - vpH);
    const scrolledIn = Math.max(0, STICKY_TOP - sectionRect.top);
    const progress   = Math.min(1, scrolledIn / scrollable);

    // Determinar qué tarjeta está activa:
    // Si progress < INTRO_BUFFER => activeIdx = -1 (SOLO TITULAR VISIBLE, NINGUNA TARJETA)
    // Si progress >= INTRO_BUFFER => dividimos el rango en 4 tramos para las 4 tarjetas
    let activeIdx = -1;

    if (progress >= INTRO_BUFFER) {
      const cardProgress = Math.min(1, (progress - INTRO_BUFFER) / (1 - INTRO_BUFFER));
      activeIdx = Math.min(N - 1, Math.floor(cardProgress * N));
    }

    cards.forEach((card, idx) => {
      if (activeIdx === -1) {
        // INTRODUCCIÓN SOLA: ninguna tarjeta visible (todas ocultas esperando abajo)
        card.classList.remove('is-active', 'is-passed');
      } else if (idx < activeIdx) {
        // Tarjetas pasadas: apiladas en el mazo por encima
        card.classList.add('is-passed');
        card.classList.remove('is-active');
      } else if (idx === activeIdx) {
        // Tarjeta activa: en primer plano
        card.classList.add('is-active');
        card.classList.remove('is-passed');
      } else {
        // Tarjetas futuras: esperando abajo
        card.classList.remove('is-active', 'is-passed');
      }
    });
  }

  window.addEventListener('scroll', updateCards, { passive: true });
  updateCards();
}
