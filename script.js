// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Animated neural network background behind the hero visual
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ACCENT = '52, 84, 209';   // --accent
  const ACCENT_2 = '18, 184, 166'; // --accent-2
  const LINK_DIST = 130;
  const NODE_COUNT_DESKTOP = 34;
  const NODE_COUNT_MOBILE = 18;

  let nodes = [];
  let pulses = [];
  let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let rafId = null;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    const count = width < 640 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1.2,
    }));
  }

  function maybeSpawnPulse() {
    if (Math.random() > 0.02 || nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const candidates = nodes.filter((n) => {
      const d = Math.hypot(n.x - a.x, n.y - a.y);
      return n !== a && d < LINK_DIST;
    });
    if (!candidates.length) return;
    const b = candidates[Math.floor(Math.random() * candidates.length)];
    pulses.push({ a, b, t: 0 });
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // move nodes, wrap around edges
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -10) n.x = width + 10;
      if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10;
      if (n.y > height + 10) n.y = -10;
    });

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, 0.55)`;
      ctx.fill();
    });

    // draw traveling signal pulses
    maybeSpawnPulse();
    pulses = pulses.filter((p) => p.t <= 1);
    pulses.forEach((p) => {
      p.t += 0.02;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_2}, 0.9)`;
      ctx.fill();
    });

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(step);
    }
  }

  function start() {
    resize();
    makeNodes();
    if (rafId) cancelAnimationFrame(rafId);
    step(); // first frame; step() re-schedules itself unless reduced motion is on
  }

  window.addEventListener('resize', () => {
    resize();
    makeNodes();
  });

  start();
})();

// Scroll reveal for sections
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
