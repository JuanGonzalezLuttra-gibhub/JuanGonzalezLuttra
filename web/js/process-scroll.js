/**
 * process-scroll.js — Scroll horizontal ultra-fluido para Proceso (Desktop & Mobile)
 *
 * Principio de diseño:
 * - .process__outer tiene height: 500vh (duración del recorrido).
 * - .process__sticky tiene position: sticky; top: 0; height: 100vh / 100dvh.
 * - Desplazamiento 100% horizontal mediante translate3d(translateX, 0px, 0px).
 * - Lerp smoothing (0.16) para que el movimiento sea fluido, controlado, progresivo
 *   y consistente en todas las pantallas (especialmente Mobile).
 */

export function initProcessScroll() {
  const outer    = document.querySelector('.process__outer');
  const track    = document.getElementById('processTrack');
  const progLine = document.getElementById('processProgressLine');
  const panels   = document.querySelectorAll('.process__panel');

  if (!outer || !track || !panels.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM_PANELS    = panels.length;

  let targetX     = 0;
  let currentX    = 0;
  let isAnimating = false;

  const calculateTargetX = () => {
    const rect       = outer.getBoundingClientRect();
    const windowH    = window.innerHeight;
    const scrollable = outer.offsetHeight - windowH;

    if (scrollable <= 0) return 0;

    let progress = 0;
    if (rect.top <= 0) {
      progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    }

    const panelWidth     = panels[0].offsetWidth || window.innerWidth;
    const totalTranslate = panelWidth * (NUM_PANELS - 1);
    return -(progress * totalTranslate);
  };

  const render = () => {
    // Lerp smoothing (0.16 para respuesta inmediata e inercia suave)
    const diff = targetX - currentX;

    if (Math.abs(diff) > 0.05) {
      currentX += diff * 0.16;
    } else {
      currentX = targetX;
    }

    if (!reducedMotion) {
      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0px, 0px)`;
    }

    // Actualización de la barra de progreso
    const panelWidth     = panels[0].offsetWidth || window.innerWidth;
    const totalTranslate = panelWidth * (NUM_PANELS - 1);
    const progress       = totalTranslate > 0 ? Math.min(1, Math.max(0, -currentX / totalTranslate)) : 0;

    if (progLine) {
      progLine.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // Actualización de indicadores (dots) en cada panel
    const currentPanel = Math.min(NUM_PANELS - 1, Math.max(0, Math.round(progress * (NUM_PANELS - 1))));
    document.querySelectorAll('.process__dots').forEach((container) => {
      const panelDots = container.querySelectorAll('.process__dot');
      panelDots.forEach((dot, dIdx) => {
        dot.classList.remove('is-active', 'is-done');
        if (dIdx === currentPanel) {
          dot.classList.add('is-active');
        } else if (dIdx < currentPanel) {
          dot.classList.add('is-done');
        }
      });
    });

    if (Math.abs(targetX - currentX) > 0.05) {
      requestAnimationFrame(render);
    } else {
      isAnimating = false;
    }
  };

  const onScroll = () => {
    targetX = calculateTargetX();
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(render);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    targetX  = calculateTargetX();
    currentX = targetX;
    if (!reducedMotion) {
      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0px, 0px)`;
    }
  }, { passive: true });

  // Ejecución inicial
  targetX  = calculateTargetX();
  currentX = targetX;
  if (!reducedMotion) {
    track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0px, 0px)`;
  }
}
