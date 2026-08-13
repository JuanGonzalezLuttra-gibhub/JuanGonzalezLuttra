/**
 * main.js — Entry point de la aplicación
 * Importa e inicializa todos los módulos en orden
 */

import { initSmoothScroll }      from './smooth-scroll.js';
import { initNav }               from './nav.js';
import { initCursor }            from './cursor.js';
import { initAnimations }        from './animations.js';
import { initTransitions}       from './transitions.js';
import { initProcessScroll }     from './process-scroll.js';
import { initHeroDepth }         from './hero-depth.js';
import { initWorkNarrative }     from './work-narrative.js';
import { initPhilosophyNarrative} from './philosophy-narrative.js';
import { initCapabilitiesDeck }  from './capabilities-deck.js';

const init = () => {
  initSmoothScroll();             // Motor de scroll pesado cinematográfico
  initNav();
  initCursor();
  initAnimations();
  initTransitions();              // Animaciones disruptivas de sección
  initProcessScroll();
  initHeroDepth();                // Profundidad 3D flotante en el Hero
  initWorkNarrative();            // Narrativa visual Antes → Después en proyectos
  initPhilosophyNarrative();      // Narrativa de 6 fases en la sección Filosofía
  initCapabilitiesDeck();         // Mazo de tarjetas interactivo en Capacidades

  // Año dinámico en el footer
  const yearEls = document.querySelectorAll('[data-year]');
  const year    = new Date().getFullYear();
  yearEls.forEach((el) => { el.textContent = year; });
};

// DOMContentLoaded o inmediato si ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
