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
    if (e.gamma !== null && e.beta !== null) {
      hasOrientationData = true;
      // gamma (-30° a 30°), beta (centrado alrededor de 30° de descanso)
      const normGamma = Math.max(-1, Math.min(1, e.gamma / 28));
      const normBeta  = Math.max(-1, Math.min(1, (e.beta - 32) / 28));
      targetX       = normGamma;
      targetY       = normBeta;
      isInteracting = true;
    }
  };

  if ('DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ Safari: solicitar permiso en el primer toque del usuario
      const requestiOSPermission = () => {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, { passive: true });
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
    }
  }

  // ─── 3. MOBILE: Touch Drag Fallback (Si no hay giróscopo o sin permiso) ───────
  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (e) => {
    if (!isMobile() || hasOrientationData) return;
    if (e.touches.length === 1) {
      touchStartX   = e.touches[0].clientX;
      touchStartY   = e.touches[0].clientY;
      isInteracting = true;
    }
  };

  const onTouchMove = (e) => {
    if (!isMobile() || hasOrientationData) return;
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      targetX      = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.35)));
      targetY      = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.35)));
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
    // Lerp suave (0.07)
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;

    if (Math.abs(currentX) > 0.0005 || Math.abs(currentY) > 0.0005 || isInteracting) {
      const rotY        = currentX * 3.5;
      const rotX        = -currentY * 3.5;
      const transXLeft  = currentX * (isMobile() ? 10 : 14);
      const transYLeft  = currentY * (isMobile() ? 10 : 14);
      const transXRight = currentX * (isMobile() ? 6  : 9);
      const transYRight = currentY * (isMobile() ? 6  : 9);

      heroLeft.style.transform  = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXLeft.toFixed(1)}px, ${transYLeft.toFixed(1)}px, ${isMobile() ? 15 : 40}px)`;
      heroRight.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transXRight.toFixed(1)}px, ${transYRight.toFixed(1)}px, ${isMobile() ? 10 : 30}px)`;

      // Transmitir desplazamientos al Canvas atmosférico mediante CSS Variables
      document.documentElement.style.setProperty('--hero-tilt-x', currentX.toFixed(3));
      document.documentElement.style.setProperty('--hero-tilt-y', currentY.toFixed(3));
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}
