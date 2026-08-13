/**
 * ambient.js — Sistema atmosférico: Destellos de sol (sun flares)
 *
 * DOS FUENTES DE LUZ:
 *   DORADA   → esquina inferior-izquierda (fuera de pantalla)
 *   AZUL     → esquina superior-derecha   (fuera de pantalla)
 *
 * CADA FUENTE EMITE:
 *   · Halo ambiental (gradiente radial difuso)
 *   · 10 destellos (streaks largos con forma de lanceta y glow)
 *
 * RESPIRACIÓN:
 *   · Ciclo de 38s: alterna dominancia gold ↔ blue con Math.sin
 *   · Cada destello tiene su propia fase y frecuencia
 *   · El scroll desplaza el balance: arriba = gold, abajo = blue
 *
 * CAMPO ESTELAR:
 *   · 600+ partículas, deriva lenta, pulsación individual (6-25s)
 *   · 40% cálidas (ámbar), 60% frías (azul-blanca)
 *
 * El Canvas es position:fixed y cubre TODA la experiencia.
 */

export function initAmbient() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* =============================================================
     PUNTOS FUENTE (normalizados al viewport)
     Ligeramente dentro del viewport para que el halo sea visible.
     ============================================================= */
  const GOLD_SRC = { x: 0.0,  y: 1.0  };  // esquina inferior-izquierda
  const BLUE_SRC = { x: 1.0,  y: 0.0  };  // esquina superior-derecha

  /* =============================================================
     DESTELLOS DORADOS
     Centro: bottom-left. Ángulos negativos = hacia arriba en canvas (y↓).
     Van de -5° (casi horizontal derecha) a -76° (casi vertical arriba).
     { angle[rad], length[×W], w[px], opa[0-1], ph[rad], fr[Hz] }
     ============================================================= */
  const GOLD_STREAKS = [
    { angle: -1.33, length: 0.88, w: 14, opa: 0.90, ph: 0.00, fr: 0.062 },
    { angle: -1.16, length: 1.02, w: 10, opa: 0.80, ph: 0.85, fr: 0.078 },
    { angle: -1.00, length: 1.10, w: 16, opa: 0.95, ph: 1.72, fr: 0.054 },
    { angle: -0.85, length: 0.92, w:  9, opa: 0.72, ph: 0.48, fr: 0.091 },
    { angle: -0.70, length: 0.80, w: 13, opa: 0.78, ph: 2.38, fr: 0.068 },
    { angle: -0.57, length: 1.15, w:  7, opa: 0.62, ph: 1.18, fr: 0.058 },
    { angle: -0.44, length: 0.88, w: 11, opa: 0.55, ph: 3.08, fr: 0.098 },
    { angle: -0.32, length: 1.20, w:  6, opa: 0.47, ph: 0.68, fr: 0.073 },
    { angle: -0.20, length: 0.95, w:  8, opa: 0.40, ph: 1.98, fr: 0.083 },
    { angle: -0.09, length: 1.05, w:  5, opa: 0.32, ph: 1.38, fr: 0.062 },
  ];

  /* =============================================================
     DESTELLOS AZULES
     Centro: top-right. Ángulos hacia bajo-izquierda.
     En canvas: 135° (2.36 rad) = diagonal↙, 180° (π) = horizontal←
     { angle[rad], length[×W], w[px], opa[0-1], ph[rad], fr[Hz] }
     ============================================================= */
  const BLUE_STREAKS = [
    { angle: 2.18, length: 0.90, w: 14, opa: 0.88, ph: 0.32, fr: 0.068 },
    { angle: 2.36, length: 1.05, w: 10, opa: 0.78, ph: 1.22, fr: 0.082 },
    { angle: 2.54, length: 1.12, w: 16, opa: 0.92, ph: 2.12, fr: 0.058 },
    { angle: 2.72, length: 0.95, w:  9, opa: 0.70, ph: 0.62, fr: 0.094 },
    { angle: 2.90, length: 0.82, w: 13, opa: 0.74, ph: 2.58, fr: 0.072 },
    { angle: 3.05, length: 1.15, w:  7, opa: 0.60, ph: 1.42, fr: 0.062 },
    { angle: 3.18, length: 0.90, w: 11, opa: 0.52, ph: 3.18, fr: 0.102 },
    { angle: 3.30, length: 1.22, w:  6, opa: 0.44, ph: 0.82, fr: 0.078 },
    { angle: 3.44, length: 0.96, w:  8, opa: 0.37, ph: 2.22, fr: 0.088 },
    { angle: 3.57, length: 1.06, w:  5, opa: 0.29, ph: 1.62, fr: 0.065 },
  ];

  /* =============================================================
     CAMPO ESTELAR — 600+ partículas
     ============================================================= */
  let particles = [];
  let W = 0, H = 0;

  const createParticles = () => {
    particles = [];
    // ~600 partículas en pantalla 1920×1080 (densidad 1/3456 px²)
    const N = Math.min(700, Math.floor((W * H) / 3456));
    for (let i = 0; i < N; i++) {
      const warm = Math.random() > 0.60; // 40% cálidas, 60% frías
      particles.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.10 + 0.08,
        // Deriva muy lenta (~1.5-3 px/s a 60fps)
        vx:    (Math.random() - 0.5) * 0.032,
        vy:    (Math.random() - 0.5) * 0.020,
        // Pulsación individual
        base:  Math.random() * 0.48 + 0.04,
        phase: Math.random() * Math.PI * 2,
        // Rango 0.03-0.15 Hz → períodos 6.7-33s
        freq:  Math.random() * 0.12 + 0.03,
        // Colores: cálidas = ámbar, frías = azul-blanca
        cr: warm ? (215 + (Math.random() * 35 | 0)) : (135 + (Math.random() * 55 | 0)),
        cg: warm ? (158 + (Math.random() * 30 | 0)) : (175 + (Math.random() * 45 | 0)),
        cb: warm ? (35  + (Math.random() * 28 | 0)) : (205 + (Math.random() * 48 | 0)),
      });
    }
  };

  /* =============================================================
     RESIZE
     ============================================================= */
  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createParticles();
  };

  /* =============================================================
     DIBUJAR UN DESTELLO (sun flare streak)

     La forma es una lanceta — ancha cerca de la fuente, se afina
     hasta un punto en la punta. El gradiente va de opaco en la
     fuente a transparente en la punta.

     Args:
       sx, sy  : coordenadas de la fuente (ya convertidas a px)
       angle   : ángulo del destello (rad)
       length  : longitud del destello (px)
       maxW    : anchura máxima del destello en la base (px)
       opacity : opacidad resultante tras multiplicar por intensidad y respiración
       cr,cg,cb: componentes RGB del color
     ============================================================= */
  const drawStreak = (sx, sy, angle, length, maxW, opacity, cr, cg, cb) => {
    if (opacity < 0.004) return;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    // Gradiente a lo largo del destello (fuente → punta)
    const grad = ctx.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0,    `rgba(${cr},${cg},${cb},${opacity})`);
    grad.addColorStop(0.05, `rgba(${cr},${cg},${cb},${opacity * 0.93})`);
    grad.addColorStop(0.20, `rgba(${cr},${cg},${cb},${opacity * 0.60})`);
    grad.addColorStop(0.50, `rgba(${cr},${cg},${cb},${opacity * 0.22})`);
    grad.addColorStop(0.82, `rgba(${cr},${cg},${cb},${opacity * 0.06})`);
    grad.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`);

    // Forma lanceta: punta en el extremo, base ancha cerca de la fuente
    const hw = maxW * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -hw * 0.8);       // base superior
    ctx.lineTo(length * 0.10, -hw); // ensanche máximo
    ctx.lineTo(length, 0);          // punta
    ctx.lineTo(length * 0.10, hw);  // ensanche máximo inferior
    ctx.lineTo(0, hw * 0.8);        // base inferior
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  /* =============================================================
     RENDER LOOP
     t : tiempo acumulado en segundos reales
     CYCLE : período del ciclo gold↔blue en segundos
     ============================================================= */
  let t = 0, lastTS = null, raf = null;
  const CYCLE = 38; // segundos por ciclo completo

  const draw = (ts) => {
    if (!lastTS) lastTS = ts;
    const dt = Math.min((ts - lastTS) / 1000, 0.05);
    t += dt;
    lastTS = ts;

    ctx.clearRect(0, 0, W, H);

    // Coordenadas absolutas de las fuentes
    /* ── TILT PARALLAX SHIFT (de DeviceOrientation o Touch) ─────── */
    const rawTiltX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-tilt-x')) || 0;
    const rawTiltY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-tilt-y')) || 0;
    const shiftX   = rawTiltX * 25;
    const shiftY   = rawTiltY * 20;

    const gx = GOLD_SRC.x * W + shiftX * 1.3;
    const gy = GOLD_SRC.y * H + shiftY * 1.3;

    const bx = BLUE_SRC.x * W + shiftX * 1.1;
    const by = BLUE_SRC.y * H + shiftY * 1.1;

    /* ── CICLO MAESTRO GOLD ↔ BLUE ──────────────────────────────
       timeCycle oscila entre 0 (gold máx) y 1 (blue máx) cada 38s.
       scrollFactor desplaza el balance según posición de scroll:
         - Top (scroll=0): gold domina
         - Bottom (scroll=1): blue domina
       Mezcla 60% tiempo + 40% scroll para que el efecto de scroll
       sea perceptible pero no brusco.
    ───────────────────────────────────────────────────────────── */
    const timeCycle = 0.5 + 0.5 * Math.sin(t * (2 * Math.PI / CYCLE));

    const scrollY   = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollFactor = Math.min(1, scrollY / maxScroll);

    const cycle   = 0.60 * timeCycle + 0.40 * scrollFactor;
    const goldInt = 0.35 + 0.65 * (1.0 - cycle);  // 1.0→0.35→1.0
    const blueInt = 0.35 + 0.65 * cycle;            // 0.35→1.0→0.35

    /* ── CAPA 1: HALOS AMBIENTALES ───────────────────────────── */

    // Halo dorado (esquina inferior-izquierda)
    {
      const r = W * 0.85;
      const wa = goldInt * (0.20 + 0.08 * Math.sin(t * 0.22));
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0,    `rgba(255,175,28,${wa})`);
      g.addColorStop(0.28, `rgba(235,150,22,${wa * 0.50})`);
      g.addColorStop(0.58, `rgba(205,125,16,${wa * 0.16})`);
      g.addColorStop(1,    `rgba(185,105,12,0)`);
      ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }

    // Halo azul (esquina superior-derecha)
    {
      const r = W * 0.78;
      const ba = blueInt * (0.16 + 0.06 * Math.sin(t * 0.19 + 1.6));
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0,    `rgba(37,99,255,${ba})`);
      g.addColorStop(0.28, `rgba(37,90,240,${ba * 0.42})`);
      g.addColorStop(0.58, `rgba(28,75,210,${ba * 0.14})`);
      g.addColorStop(1,    `rgba(20,62,195,0)`);
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }

    /* ── CAPA 2: DESTELLOS DORADOS ───────────────────────────── */
    GOLD_STREAKS.forEach(({ angle, length, w, opa, ph, fr }) => {
      const breathe = 0.60 + 0.40 * Math.sin(t * fr * Math.PI * 2 + ph);
      drawStreak(gx, gy, angle, length * W, w, opa * breathe * goldInt, 248, 185, 48);
    });

    /* ── CAPA 3: DESTELLOS AZULES ────────────────────────────── */
    BLUE_STREAKS.forEach(({ angle, length, w, opa, ph, fr }) => {
      const breathe = 0.60 + 0.40 * Math.sin(t * fr * Math.PI * 2 + ph);
      drawStreak(bx, by, angle, length * W, w, opa * breathe * blueInt, 55, 125, 255);
    });

    /* ── CAPA 4: CAMPO DE PARTÍCULAS ESTELARES ───────────────── */
    ctx.save();
    particles.forEach(p => {
      // Deriva muy lenta (wrap)
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -2)  p.x = W + 2;
      if (p.x > W+2) p.x = -2;
      if (p.y < -2)  p.y = H + 2;
      if (p.y > H+2) p.y = -2;

      // Pulsación individual
      const a = p.base * (0.22 + 0.78 * Math.sin(t * p.freq * Math.PI * 2 + p.phase));
      if (a < 0.004) return;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${a})`;
      ctx.fill();
    });
    ctx.restore();

    raf = requestAnimationFrame(draw);
  };

  /* =============================================================
     INICIALIZACIÓN
     ============================================================= */
  resize();
  raf = requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(draw);
  }, { passive: true });
}
