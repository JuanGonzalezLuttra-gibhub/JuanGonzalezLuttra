/**
 * work-narrative.js — Narrativa visual Antes → Después
 *
 * Secuencia (proyectos con versión anterior):
 *
 *    0 ms  — Categoría y título ya visibles (CSS + is-visible)
 *  650 ms  — Imagen ANTES aparece con fundido suave
 *  700 ms  — Etiqueta "ANTES" aparece sobre la imagen
 * 1800 ms  — Etiqueta "ANTES" desaparece
 * 2000 ms  — Flash dorado (momento de transformación, 180ms peak)
 * 2180 ms  — Imagen ANTES se desvanece (500ms) → DESPUÉS emerge
 * 2700 ms  — Etiqueta editorial ("REDISEÑO" / etc.) aparece
 * 3600 ms  — Etiqueta editorial desaparece
 *
 * Secuencia (Luxor, sin versión anterior):
 *
 *  650 ms  — Imagen final aparece (ya controlado por CSS)
 * 1300 ms  — Etiqueta editorial ("DESARROLLO DESDE CERO") aparece
 * 2200 ms  — Etiqueta editorial desaparece
 */

/* ─── Utilidad: sleep no bloqueante ─────────────────────────── */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ─── Mapa de secuencias activas (para cancelación) ─────────── */
const activeSequences = new Map();

/* ─── Inyectar elemento flash en el visual si no existe ──────── */
function getOrCreateFlash(visual) {
  let flash = visual.querySelector('.case__flash');
  if (!flash) {
    flash = document.createElement('span');
    flash.className = 'case__flash';
    flash.setAttribute('aria-hidden', 'true');
    visual.appendChild(flash);
  }
  return flash;
}

/* ─── Inyectar etiqueta ANTES si no existe ───────────────────── */
function getOrCreateBeforeTag(visual) {
  let tag = visual.querySelector('.case__before-tag');
  if (!tag) {
    tag = document.createElement('span');
    tag.className = 'case__before-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'Antes';
    visual.appendChild(tag);
  }
  return tag;
}

/**
 * Resetea todos los elementos visuales dinámicos al estado inicial.
 * Se llama al cancelar o al iniciar una nueva secuencia.
 */
function resetVisuals(article) {
  const visual      = article.querySelector('.case__visual');
  const beforeLayer = article.querySelector('.case__comparison-layer--before');
  const editorial   = article.querySelector('.case__editorial-label');
  const flash       = visual?.querySelector('.case__flash');
  const beforeTag   = visual?.querySelector('.case__before-tag');

  const instant = (el) => {
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity    = '0';
  };

  instant(beforeLayer);
  instant(editorial);
  instant(flash);
  instant(beforeTag);
}

/**
 * Cancela una secuencia activa.
 */
function cancelSequence(article) {
  const seq = activeSequences.get(article);
  if (seq) {
    seq.cancelled = true;
    activeSequences.delete(article);
  }
  resetVisuals(article);
}

/**
 * Aplica una transición de opacidad a un elemento vía JS.
 */
function fade(el, toOpacity, durationMs, easingFn = 'cubic-bezier(0.4, 0, 0.2, 1)') {
  el.style.transition = `opacity ${durationMs}ms ${easingFn}`;
  // Forzar reflow para que la transición se aplique correctamente
  void el.offsetWidth;
  el.style.opacity = String(toOpacity);
}

/* ─── Secuencia narrativa principal ─────────────────────────── */
async function runNarrative(article) {
  const seq = { cancelled: false };
  activeSequences.set(article, seq);

  const hasBefore = article.dataset.hasBefore === 'true';
  const visual    = article.querySelector('.case__visual');
  if (!visual) return;

  const beforeLayer = article.querySelector('.case__comparison-layer--before');
  const editorial   = article.querySelector('.case__editorial-label');

  // Reset inicial sin transición
  resetVisuals(article);
  // Dar un frame para que el reset se aplique antes de animar
  await sleep(16);
  if (seq.cancelled) return;

  /* ══════════════════════════════════════════════════════════
     RAMA A — Proyectos con imagen "ANTES"
  ══════════════════════════════════════════════════════════ */
  if (hasBefore && beforeLayer) {
    const flash     = getOrCreateFlash(visual);
    const beforeTag = getOrCreateBeforeTag(visual);

    // ── Paso 1: La imagen "ANTES" aparece (fundido suave) ──
    await sleep(650);
    if (seq.cancelled) return;

    fade(beforeLayer, 1, 500);

    // ── Paso 2: La etiqueta "ANTES" aparece (ligeramente después) ──
    await sleep(80);
    if (seq.cancelled) return;

    fade(beforeTag, 1, 350);

    // ── Paso 3: Pausa — el usuario lee "ANTES" y ve la web antigua ──
    await sleep(1200);
    if (seq.cancelled) return;

    // ── Paso 4: La etiqueta "ANTES" desaparece antes del flash ──
    fade(beforeTag, 0, 300);

    await sleep(350);
    if (seq.cancelled) return;

    // ── Paso 5: FLASH DORADO — el momento de la transformación ──
    // El flash aparece rápido (150ms) y desaparece (300ms)
    fade(flash, 1, 150, 'ease-out');
    await sleep(150);
    if (seq.cancelled) return;

    // En el pico del flash: comenzar a desvanecerse la capa "antes"
    fade(beforeLayer, 0, 350, 'ease-in');
    await sleep(80);
    if (seq.cancelled) return;

    // El flash se retira revelando el "después"
    fade(flash, 0, 300, 'ease-in');
    await sleep(400);
    if (seq.cancelled) return;

    // ── Paso 6: La etiqueta editorial aparece (REDISEÑO / etc.) y permanece ──
    if (editorial) {
      fade(editorial, 1, 400);
      // La etiqueta permanece visible — no tiene fade-out.
      // Solo desaparecerá cuando el proyecto salga del viewport (resetVisuals).
    }

  /* ══════════════════════════════════════════════════════════
     RAMA B — Luxor (sin imagen "ANTES")
     La imagen final ya apareció vía CSS. Solo añadimos la etiqueta.
  ══════════════════════════════════════════════════════════ */
  } else {

    // Esperar a que la imagen final haya aparecido (CSS delay 650ms)
    await sleep(650 + 700); // imagen visible + pequeña pausa lectora
    if (seq.cancelled) return;

    if (editorial) {
      fade(editorial, 1, 400);
      // La etiqueta permanece visible — no tiene fade-out.
    }
  }

  // Secuencia completada: limpiar mapa
  if (activeSequences.get(article) === seq) {
    activeSequences.delete(article);
  }
}

/* ─── IntersectionObserver — repite en cada entrada al viewport ─ */
export function initWorkNarrative() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cases         = document.querySelectorAll('.case[data-narrative-label]');

  if (!cases.length) return;

  // Con prefers-reduced-motion: estado final directo, sin secuencia
  if (reducedMotion) {
    cases.forEach(article => {
      const beforeLayer = article.querySelector('.case__comparison-layer--before');
      if (beforeLayer) { beforeLayer.style.transition = 'none'; beforeLayer.style.opacity = '0'; }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const article = entry.target;
        if (entry.isIntersecting) {
          cancelSequence(article);
          runNarrative(article);
        } else {
          cancelSequence(article);
        }
      });
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  cases.forEach(article => observer.observe(article));
}
