/**
 * cursor.js — Cursor personalizado con lerp (interpolación lineal)
 * Solo activo en dispositivos con puntero fino (desktop)
 * mix-blend-mode: difference para el efecto visual
 */

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Solo en dispositivos con puntero fino
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mouseX = 0;
  let mouseY = 0;
  let curX   = 0;
  let curY   = 0;
  const LERP = reducedMotion ? 1 : 0.14; // lerp factor — más bajo = más suave

  const moveCursor = () => {
    curX += (mouseX - curX) * LERP;
    curY += (mouseY - curY) * LERP;
    cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    requestAnimationFrame(moveCursor);
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursor.classList.contains('cursor--visible')) {
      cursor.classList.add('cursor--visible');
      curX = mouseX;
      curY = mouseY;
    }
  }, { passive: true });

  // Ocultar cursor al salir de la ventana
  document.addEventListener('mouseleave', () => cursor.classList.remove('cursor--visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('cursor--visible'));

  // Cursor expand en elementos interactivos
  const interactives = 'a, button, [role="button"], input, textarea, select, label[for]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.remove('cursor--hover');
    }
  });

  requestAnimationFrame(moveCursor);
}
