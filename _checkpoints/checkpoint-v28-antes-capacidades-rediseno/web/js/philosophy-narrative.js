/**
 * philosophy-narrative.js — Narrativa visual de la sección Filosofía v2.3
 *
 * Transición cinematográfica entre objetivos:
 * - 3 segundos como objetivo activo (legible, sin prisa)
 * - ~700ms de transición suave entre objetivos (sin saltos, sin parpadeos)
 * - Separación de fases: fade-out del actual → fade-in del siguiente
 * - El nodo perimetral también transiciona suavemente (no instantáneo)
 */

const PHI_THRESHOLD   = 0.12;
const PHI_ROOT_MARGIN = '0px 0px -60px 0px';

// Tiempos de la secuencia cinematográfica
const ACTIVE_DURATION    = 3200;  // ms — tiempo como objetivo activo (legible y pausado)
const FADE_OUT_DURATION  = 500;   // ms — duración del fade-out antes de cambiar
const TRANSITION_GAP     = 120;   // ms — pequeña pausa entre fade-out y fade-in

function observeRepeatable(selector, onEnter, onLeave) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if (reducedMotion) {
    elements.forEach(el => onEnter(el));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onEnter(entry.target);
        } else if (onLeave) {
          onLeave(entry.target);
        }
      });
    },
    { threshold: PHI_THRESHOLD, rootMargin: PHI_ROOT_MARGIN }
  );

  elements.forEach(el => observer.observe(el));
}

function initPhiReveal() {
  observeRepeatable(
    '[data-phi-reveal]',
    el => el.classList.add('is-visible'),
    el => el.classList.remove('is-visible')
  );
}

function initPhiNodes() {
  const system = document.querySelector('#phi-nodes');
  if (!system) return;

  const nodes    = system.querySelectorAll('.phi__node');
  const insights = system.querySelectorAll('.phi__insight-text');

  let sequenceTimer = null;
  let currentIdx    = 0;
  let isTransitioning = false;

  /**
   * Fase 1: Desactiva suavemente el nodo/insight ACTUAL.
   * El CSS tiene transition: opacity/transform que crea el fade-out natural.
   */
  function deactivateCurrent() {
    nodes.forEach(n => n.classList.remove('is-active'));
    insights.forEach(t => t.classList.remove('is-active'));
  }

  /**
   * Fase 2: Activa el nodo/insight SIGUIENTE.
   * Ejecutado después de un gap para que el fade-out complete antes del fade-in.
   */
  function activateNode(idx) {
    currentIdx = idx;
    const nodeKeys = Array.from(nodes).map(n => n.dataset.phiNode);

    nodes.forEach((n, i) => n.classList.toggle('is-active', i === idx));
    insights.forEach(t => {
      const key = t.dataset.insight;
      t.classList.toggle('is-active', key === nodeKeys[idx]);
    });
  }

  /**
   * Ciclo cinematográfico:
   * [activo 3.2s] → [fade-out 500ms] → [gap 120ms] → [fade-in siguiente] → repite
   */
  function runCycle() {
    if (isTransitioning) return;

    // Programar la próxima transición después del tiempo activo
    sequenceTimer = setTimeout(() => {
      isTransitioning = true;

      // 1. Iniciar fade-out del actual
      deactivateCurrent();

      // 2. Tras el fade-out, activar el siguiente
      sequenceTimer = setTimeout(() => {
        currentIdx = (currentIdx + 1) % nodes.length;
        activateNode(currentIdx);
        isTransitioning = false;

        // 3. Programar el siguiente ciclo
        runCycle();
      }, FADE_OUT_DURATION + TRANSITION_GAP);

    }, ACTIVE_DURATION);
  }

  function startCycle() {
    stopCycle();
    activateNode(currentIdx);
    runCycle();
  }

  function stopCycle() {
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    isTransitioning = false;
  }

  // Interacción manual: click en un nodo lo activa y pausa 8s el ciclo automático
  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      stopCycle();
      activateNode(i);
      // Reiniciar el ciclo automático después de 8s de inactividad
      setTimeout(startCycle, 8000);
    });
  });

  // Observer: arrancar/parar el ciclo cuando la sección entra/sale del viewport
  const nodeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Revelar nodos con stagger visual
          nodes.forEach((node, i) => {
            setTimeout(() => node.classList.add('is-visible'), i * 80);
          });
          startCycle();
        } else {
          nodes.forEach(node => node.classList.remove('is-visible', 'is-active'));
          insights.forEach(t => t.classList.remove('is-active'));
          stopCycle();
        }
      });
    },
    { threshold: 0.15, rootMargin: PHI_ROOT_MARGIN }
  );

  nodeObserver.observe(system);
}

export function initPhilosophyNarrative() {
  initPhiReveal();
  initPhiNodes();
}
