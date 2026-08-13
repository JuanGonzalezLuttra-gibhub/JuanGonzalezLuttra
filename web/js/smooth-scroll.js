/**
 * smooth-scroll.js — Motor de Scroll Cinemático Global v8.0
 *
 * Arquitectura de Navegación Refinada:
 * 1. SCROLL GLOBAL PESADO Y CONTINUO (Proyectos, Filosofía, Capacidades, Persona, Despedida, Contacto):
 *    - Cero imanes artificiales. Eliminados completamente de todas las secciones salvo Proceso.
 *    - El usuario recorre la web con total libertad y se puede detener en cualquier punto.
 *    - Inercia pesada cinemática (lerp = 0.044, max velocity = 18px/frame).
 *
 * 2. PROCESO — ÚNICA SECCIÓN CON CHECKPOINTS OBLIGATORIOS (4 Etapas):
 *    - Descubrimiento (Panel 0)
 *    - Diseño (Panel 1)
 *    - Construcción (Panel 2)
 *    - Evolución (Panel 3)
 *    - Cada gesto razonable en Proceso avanza/retrocede estrictamente al siguiente checkpoint.
 *    - Imposible saltarse Diseño o Construcción. Centrado perfecto de cada etapa.
 */

export function initSmoothScroll() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let currentY    = window.scrollY;
  let targetY     = window.scrollY;
  let isAnimating = false;

  const LERP_FACTOR            = 0.044; // Inercia pesada cinemática
  const MAX_VELOCITY_PER_FRAME = 18;    // Velocidad máxima por frame
  const WHEEL_SENSITIVITY      = 0.65;  // Sensibilidad amortiguada por tick de rueda
  const MAX_TARGET_LEAD        = 400;   // Avance máximo acumulable por gesto fuera de Proceso (~400px)

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Obtiene los 4 checkpoints exactos de la sección PROCESO
   */
  function getProcessCheckpoints() {
    const procSec = document.querySelector('#proceso');
    if (!procSec) return null;

    const outer = procSec.querySelector('.process__outer');
    if (!outer) return null;

    const secTop = procSec.getBoundingClientRect().top + window.scrollY;
    const windowH = window.innerHeight;
    const scrollable = outer.offsetHeight - windowH;

    if (scrollable <= 0) return null;

    // 4 Paneles exactos: 0%, 33.333%, 66.666%, 100%
    return {
      top: secTop,
      bottom: secTop + scrollable,
      scrollable,
      checkpoints: [
        secTop + 0.0000 * scrollable, // Descubrimiento
        secTop + 0.3333 * scrollable, // Diseño
        secTop + 0.6666 * scrollable, // Construcción
        secTop + 1.0000 * scrollable  // Evolución
      ]
    };
  }

  function step() {
    const maxScroll = getMaxScroll();
    targetY = clamp(targetY, 0, maxScroll);

    const diff = targetY - currentY;

    if (Math.abs(diff) > 0.01) {
      const dir = Math.sign(diff);
      const stepDist = Math.min(Math.abs(diff) * LERP_FACTOR, MAX_VELOCITY_PER_FRAME);
      currentY += dir * stepDist;
    }

    if (Math.abs(targetY - currentY) < 0.2) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      isAnimating = false;
      return;
    }

    window.scrollTo(0, currentY);
    requestAnimationFrame(step);
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(step);
    }
  }

  // Cooldown de gesto para el paso discreto de checkpoints en Proceso
  let processLockTimer = null;
  let isProcessTransitioning = false;

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();

    if (!isAnimating && Math.abs(window.scrollY - currentY) > 5) {
      currentY = window.scrollY;
      targetY  = window.scrollY;
    }

    const procData = getProcessCheckpoints();
    const currY = window.scrollY;

    // ¿Estamos dentro de la zona de la sección Proceso?
    if (procData && currY >= procData.top - 60 && currY <= procData.bottom + 60) {
      if (isProcessTransitioning) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 8) return; // Ignorar micro-movimientos espurios

      const points = procData.checkpoints;
      
      // Encontrar en qué checkpoint estamos o a cuál estamos más cerca
      let currentIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < points.length; i++) {
        const d = Math.abs(currY - points[i]);
        if (d < minDiff) {
          minDiff = d;
          currentIdx = i;
        }
      }

      if (delta > 0) {
        // Scroll ABAJO
        if (currentIdx < points.length - 1) {
          // Avanzar AL SIGUIENTE CHECKPOINT OBLIGATORIO (sin saltar ninguno)
          targetY = points[currentIdx + 1];
          isProcessTransitioning = true;
          clearTimeout(processLockTimer);
          processLockTimer = setTimeout(() => {
            isProcessTransitioning = false;
          }, 650);
        } else {
          // Si estamos en el último checkpoint (Evolución), liberar hacia abajo (Capacidades)
          const scrollDelta = delta * WHEEL_SENSITIVITY;
          targetY = clamp(targetY + scrollDelta, currentY - MAX_TARGET_LEAD, currentY + MAX_TARGET_LEAD);
        }
      } else {
        // Scroll ARRIBA
        if (currentIdx > 0 && currY <= points[currentIdx] + 80) {
          // Retroceder AL CHECKPOINT ANTERIOR
          targetY = points[currentIdx - 1];
          isProcessTransitioning = true;
          clearTimeout(processLockTimer);
          processLockTimer = setTimeout(() => {
            isProcessTransitioning = false;
          }, 650);
        } else {
          // Liberar hacia arriba
          const scrollDelta = delta * WHEEL_SENSITIVITY;
          targetY = clamp(targetY + scrollDelta, currentY - MAX_TARGET_LEAD, currentY + MAX_TARGET_LEAD);
        }
      }
    } else {
      // Fuera de Proceso: SCROLL CONTINUO Y LIBRE CON PESO (Sin imanes)
      const scrollDelta = e.deltaY * WHEEL_SENSITIVITY;
      const minAllowedTarget = currentY - MAX_TARGET_LEAD;
      const maxAllowedTarget = currentY + MAX_TARGET_LEAD;

      targetY = clamp(targetY + scrollDelta, minAllowedTarget, maxAllowedTarget);
    }

    targetY = clamp(targetY, 0, getMaxScroll());
    startAnimation();
  }, { passive: false });

  // Sincronizar en scroll nativo o saltos
  window.addEventListener('scroll', () => {
    if (!isAnimating) {
      currentY = window.scrollY;
      targetY  = window.scrollY;
    }
  }, { passive: true });

  // Reajustar en resize
  window.addEventListener('resize', () => {
    const maxScroll = getMaxScroll();
    currentY = clamp(currentY, 0, maxScroll);
    targetY  = clamp(targetY, 0, maxScroll);
  }, { passive: true });

  // API global para saltos directos (Nav bar)
  window.__setSmoothScrollTarget = (newTarget) => {
    const maxScroll = getMaxScroll();
    currentY = window.scrollY;
    targetY  = clamp(newTarget, 0, maxScroll);
    startAnimation();
  };

  window.__syncSmoothScrollPos = (pos) => {
    currentY = pos;
    targetY  = pos;
    isAnimating = false;
  };
}
