/**
 * hero-depth.js — Efecto Parallax 3D de profundidad para el Hero
 *
 * Mueve sutilmente el contenido del Hero en el plano Z/XY al desplazar el ratón,
 * creando una sensación real de flotación tridimensional sobre el vídeo espacial.
 */

export function initHeroDepth() {
  const heroGrid  = document.querySelector('.hero__grid');
  const heroLeft  = document.querySelector('.hero__left');
  const heroRight = document.querySelector('.hero__right');

  if (!heroGrid || !heroLeft || !heroRight) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let targetX  = 0;
  let targetY  = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovered = false;

  const onMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth - 0.5) * 2;
    const normY = (e.clientY / innerHeight - 0.5) * 2;

    targetX   = normX;
    targetY   = normY;
    isHovered = true;
  };

  const onMouseLeave = () => {
    targetX   = 0;
    targetY   = 0;
    isHovered = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);

  const loop = () => {
    // Lerp suave (easing 0.06)
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    if (Math.abs(currentX) > 0.0005 || Math.abs(currentY) > 0.0005 || isHovered) {
      const rotY       = currentX * 3.5;   // deg tilt
      const rotX       = -currentY * 3.5;  // deg tilt
      const transXLeft = currentX * 14;    // px
      const transYLeft = currentY * 14;    // px
      const transXRight = currentX * 9;
      const transYRight = currentY * 9;

      heroLeft.style.transform  = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXLeft.toFixed(1)}px, ${transYLeft.toFixed(1)}px, 40px)`;
      heroRight.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXRight.toFixed(1)}px, ${transYRight.toFixed(1)}px, 30px)`;
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}
