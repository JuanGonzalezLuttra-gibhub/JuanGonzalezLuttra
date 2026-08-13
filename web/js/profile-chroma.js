/**
 * profile-chroma.js — Eliminación de fondo cian de la foto de perfil
 *
 * El archivo profile.jpg tiene un fondo azul cian brillante (≈ #3AAAE0).
 * Esta función carga la imagen en un Canvas, detecta y elimina el fondo,
 * y actualiza el src del elemento <img> con el resultado procesado.
 *
 * El background del JPG es: R≈51-100, G≈150-210, B≈200-240
 * La piel/cabello en B&W: R≈G≈B (grises varios)
 * La camiseta negra: R≈G≈B≈0-40
 * Los bordes blancos externos: R≈G≈B≈240-255
 *
 * Estrategia: si B es significativamente mayor que R, y G es alto,
 * el píxel es parte del fondo azul. Lo reemplazamos por negro espacial.
 */

export function initProfileChroma() {
  const photoEl = document.querySelector('.about__photo');
  if (!photoEl) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    const w      = img.naturalWidth  || 800;
    const h      = img.naturalHeight || 800;

    canvas.width  = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data      = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Detectar el azul cian del fondo de estudio:
      // - El canal azul domina claramente (B > R + 100)
      // - El canal verde es alto (G > 130)
      // - El canal rojo es bajo (protege los tonos de piel: R > 80)
      const isCyanBackground = (
        b > r + 100 &&
        g > 130 &&
        b > 160 &&
        r < 80   // protege tonos de piel (B&W: piel tiene R=G=B=150-200)
      );

      // Detectar bordes blancos del JPG fuera del círculo recortado:
      // - Todos los canales muy altos y equilibrados = blanco
      const isWhiteBorder = (r > 230 && g > 230 && b > 230 && Math.abs(r - g) < 20 && Math.abs(r - b) < 20);

      if (isCyanBackground || isWhiteBorder) {
        // Reemplazar por negro espacial del diseño
        data[i]     = 5;   // R
        data[i + 1] = 10;  // G
        data[i + 2] = 20;  // B
        data[i + 3] = 255; // A — opaco
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Actualizar el src con el resultado procesado
    photoEl.src = canvas.toDataURL('image/png');

    // Normalizar el blend mode ahora que el fondo está eliminado
    photoEl.style.mixBlendMode = 'normal';
    photoEl.style.filter = 'brightness(1.0) saturate(1.05) contrast(1.06)';
  };

  // Touch Micro-interaction para la foto en móvil
  const photoWrapper = document.querySelector('.about__photo-wrapper');
  if (photoWrapper) {
    photoWrapper.addEventListener('touchstart', () => {
      photoWrapper.classList.add('is-touched');
    }, { passive: true });
    photoWrapper.addEventListener('touchend', () => {
      setTimeout(() => photoWrapper.classList.remove('is-touched'), 350);
    }, { passive: true });
  }

  // Usar timestamp para garantizar que no cargue desde caché
  img.src = `assets/profile.jpg?nocache=${Date.now()}`;
}
