/**
 * process-scroll.js — Scroll horizontal hijack para la sección Proceso
 *
 * Principio de diseño:
 * - .process__outer tiene height: 500vh (define la duración del scroll).
 * - .process__sticky tiene position: sticky; top: 0; height: 100vh.
 * - getBoundingClientRect() calcula dinámicamente rect.top.
 * - Mientras rect.top <= 0, translateY es 0 (fijado por CSS sticky) y
 *   translate3d desplaza el track ÚNICAMENTE en el eje X (-translateX, 0px, 0px).
 * - Esto garantiza un desplazamiento 100% horizontal sin derivas diagonales ni verticales.
 *
 * Mobile (< 1024px): desactivado, layout vertical natural.
 */

export function initProcessScroll() {
  const outer    = document.querySelector('.process__outer');
  const track    = document.getElementById('processTrack');
  const progLine = document.getElementById('processProgressLine');
  const panels   = document.querySelectorAll('.process__panel');

  if (!outer || !track || !panels.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM_PANELS    = panels.length;

  let rafPending = false;

  const updateScroll = () => {
    const rect       = outer.getBoundingClientRect();
    const windowH    = window.innerHeight;
    const scrollable = outer.offsetHeight - windowH;

    if (scrollable <= 0) return;

    // Progreso de scroll exclusivo dentro del rango sticky
    let progress = 0;
    if (rect.top <= 0) {
      progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    }

    // Desplazamiento horizontal exacto:
    // PURE X-axis ONLY via translate3d(translateX, 0px, 0px).
    // Y-axis MUST BE 0px ALWAYS to eliminate any diagonal movement.
    const totalTranslate = window.innerWidth * (NUM_PANELS - 1);
    const translateX     = -(progress * totalTranslate);

    if (!reducedMotion) {
      track.style.transform = `translate3d(${translateX.toFixed(2)}px, 0px, 0px)`;
    }

    // Actualización de la barra de progreso
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
  };

  const onScroll = () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        updateScroll();
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });

  // Ejecución inicial
  updateScroll();
}
