/**
 * philosophy-narrative.js — Narrativa visual de la sección Filosofía v2.2
 *
 * Administra las animaciones de entrada por scroll y la rotación interactiva
 * del sistema de nodos con el núcleo circular translúcido.
 */

const PHI_THRESHOLD   = 0.12;
const PHI_ROOT_MARGIN = '0px 0px -60px 0px';

function observeRepeatable(selector, onEnter, onLeave) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if (reducedMotion) {
    elements.forEach(el => onEnter(el));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onEnter(entry.target);
        } else if (onLeave) {
          onLeave(entry.target);
        }
      });
    },
    { threshold: PHI_THRESHOLD, rootMargin: PHI_ROOT_MARGIN }
  );

  elements.forEach(el => observer.observe(el));
}

function initPhiReveal() {
  observeRepeatable(
    '[data-phi-reveal]',
    el => el.classList.add('is-visible'),
    el => el.classList.remove('is-visible')
  );
}

function initPhiNodes() {
  const system   = document.querySelector('#phi-nodes');
  if (!system) return;

  const nodes    = system.querySelectorAll('.phi__node');
  const insights = system.querySelectorAll('.phi__insight-text');

  let cycleTimer = null;
  let currentIdx = 0;

  function activateNode(idx) {
    currentIdx = idx;
    const nodeKeys = Array.from(nodes).map(n => n.dataset.phiNode);

    nodes.forEach((n, i) => n.classList.toggle('is-active', i === idx));
    insights.forEach(t => {
      const key = t.dataset.insight;
      t.classList.toggle('is-active', key === nodeKeys[idx]);
    });
  }

  function startCycle() {
    if (cycleTimer) return;
    activateNode(currentIdx);
    cycleTimer = setInterval(() => {
      currentIdx = (currentIdx + 1) % nodes.length;
      activateNode(currentIdx);
    }, 3500);
  }

  function stopCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
  }

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      stopCycle();
      activateNode(i);
      setTimeout(startCycle, 6000);
    });
  });

  const nodeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nodes.forEach((node, i) => {
            setTimeout(() => node.classList.add('is-visible'), i * 80);
          });
          startCycle();
        } else {
          nodes.forEach(node => node.classList.remove('is-visible', 'is-active'));
          insights.forEach(t => t.classList.remove('is-active'));
          stopCycle();
        }
      });
    },
    { threshold: 0.15, rootMargin: PHI_ROOT_MARGIN }
  );

  nodeObserver.observe(system);
}

export function initPhilosophyNarrative() {
  initPhiReveal();
  initPhiNodes();
}
