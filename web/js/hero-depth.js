/**
 * hero-depth.js — Efecto Parallax 3D de profundidad para el Hero
 *
 * DESKTOP: Mueve el contenido del Hero con el cursor del ratón.
 * MOBILE: Reacciona a DeviceOrientation (giróscopo/inclinación del móvil)
 *         con fallback automático a Touch Drag Parallax (movimiento del dedo).
 */

export function initHeroDepth() {
  const heroGrid  = document.querySelector('.hero__grid');
  const heroLeft  = document.querySelector('.hero__left');
  const heroRight = document.querySelector('.hero__right');
  const heroSec   = document.querySelector('.hero');

  if (!heroGrid || !heroLeft || !heroRight) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;

  let targetX  = 0;
  let targetY  = 0;
  let currentX = 0;
  let currentY = 0;
  let isInteracting = false;
  let hasOrientationData = false;

  // ─── 1. DESKTOP: MouseMove ───────────────────────────────────────────────────
  const onMouseMove = (e) => {
    if (isMobile()) return;
    const { innerWidth, innerHeight } = window;
    targetX       = (e.clientX / innerWidth - 0.5) * 2;
    targetY       = (e.clientY / innerHeight - 0.5) * 2;
    isInteracting = true;
  };

  const onMouseLeave = () => {
    if (isMobile()) return;
    targetX       = 0;
    targetY       = 0;
    isInteracting = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);

  // ─── 2. MOBILE: DeviceOrientation (Inclinación física del teléfono) ──────────
  const handleOrientation = (e) => {
    if (!isMobile()) return;
    const gamma = e.gamma;
    const beta  = e.beta;
    if (gamma !== null && beta !== null && (gamma !== 0 || beta !== 0)) {
      hasOrientationData = true;
      // gamma (-30° a 30°), beta (centrado alrededor de 30° de descanso)
      const normGamma = Math.max(-1, Math.min(1, gamma / 25));
      const normBeta  = Math.max(-1, Math.min(1, (beta - 30) / 25));
      targetX       = normGamma;
      targetY       = normBeta;
      isInteracting = true;
    }
  };

  if ('DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const requestiOSPermission = () => {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, { passive: true });
              window.addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
            }
          })
          .catch(() => {})
          .finally(() => {
            window.removeEventListener('touchstart', requestiOSPermission);
          });
      };
      window.addEventListener('touchstart', requestiOSPermission, { passive: true, once: true });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      window.addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
    }
  }

  // ─── 3. MOBILE: Touch Drag & Scroll Parallax Fallback ─────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (e) => {
    if (!isMobile()) return;
    if (e.touches.length === 1) {
      touchStartX   = e.touches[0].clientX;
      touchStartY   = e.touches[0].clientY;
      isInteracting = true;
    }
  };

  const onTouchMove = (e) => {
    if (!isMobile()) return;
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      if (!hasOrientationData) {
        targetX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.30)));
        targetY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.30)));
      }
    }
  };

  const onTouchEnd = () => {
    if (!isMobile() || hasOrientationData) return;
    targetX       = 0;
    targetY       = 0;
    isInteracting = false;
  };

  if (heroSec) {
    heroSec.addEventListener('touchstart', onTouchStart, { passive: true });
    heroSec.addEventListener('touchmove', onTouchMove,   { passive: true });
    heroSec.addEventListener('touchend', onTouchEnd,     { passive: true });
  }

  // ─── 4. LOOP DE ANIMACIÓN RENDER ─────────────────────────────────────────────
  const loop = () => {
    // Lerp suave (0.08)
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Agregar parallax de scroll sutil en móvil si el usuario se desplaza
    const scrollParallaxY = isMobile() ? Math.min(0.8, (window.scrollY / window.innerHeight) * 0.6) : 0;
    const effectiveY      = currentY + scrollParallaxY;

    if (Math.abs(currentX) > 0.0005 || Math.abs(effectiveY) > 0.0005 || isInteracting) {
      const rotY        = currentX * 3.8;
      const rotX        = -effectiveY * 3.8;
      const transXLeft  = currentX * (isMobile() ? 12 : 14);
      const transYLeft  = effectiveY * (isMobile() ? 12 : 14);
      const transXRight = currentX * (isMobile() ? 7  : 9);
      const transYRight = effectiveY * (isMobile() ? 7  : 9);

      heroLeft.style.transform  = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXLeft.toFixed(1)}px, ${transYLeft.toFixed(1)}px, ${isMobile() ? 18 : 40}px)`;
      heroRight.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXRight.toFixed(1)}px, ${transYRight.toFixed(1)}px, ${isMobile() ? 12 : 30}px)`;

      // Transmitir desplazamientos al Canvas atmosférico mediante CSS Variables
      document.documentElement.style.setProperty('--hero-tilt-x', currentX.toFixed(3));
      document.documentElement.style.setProperty('--hero-tilt-y', effectiveY.toFixed(3));
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}
