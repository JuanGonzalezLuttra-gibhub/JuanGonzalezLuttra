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
  const dots     = document.querySelectorAll('.process__dot');

  if (!outer || !track || !panels.length) return;

  const isMobile      = () => window.innerWidth < 1024;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM_PANELS    = panels.length;

  let rafPending = false;

  const updateScroll = () => {
    if (isMobile()) {
      track.style.transform = '';
      return;
    }

    const rect       = outer.getBoundingClientRect();
    const windowH    = window.innerHeight;
    const scrollable = outer.offsetHeight - windowH;

    if (scrollable <= 0) return;

    // Progreso de scroll exclusivo dentro del rango sticky
    let progress = 0;
    if (rect.top <= 0) {
      progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    }

    // Desplazamiento horizontal exacto
    const totalTranslate = window.innerWidth * (NUM_PANELS - 1);
    const translateX     = -(progress * totalTranslate);

    if (!reducedMotion) {
      // Eje Y fijado estrictamente a 0px para eliminar movimiento diagonal
      track.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
    }

    // Actualización de la barra de progreso
    if (progLine) {
      progLine.style.width = `${progress * 100}%`;
    }

    // Actualización de indicadores (dots)
    const currentPanel = Math.round(progress * (NUM_PANELS - 1));
    dots.forEach((dot, idx) => {
      dot.classList.remove('is-active', 'is-done');
      if (idx < currentPanel)       dot.classList.add('is-done');
      else if (idx === currentPanel) dot.classList.add('is-active');
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
  window.addEventListener('resize', updateScroll,  { passive: true });

  // Ejecución inicial
  updateScroll();
}
