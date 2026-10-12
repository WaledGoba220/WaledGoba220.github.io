const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

// Animated neural network behind the photo
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const BLUE = '36, 72, 201';
  const TEAL = '14, 159, 142';
  const LINK = 120;
  let nodes = [], pulses = [], w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = w < 500 ? 22 : 38;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 1.2,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = w + 10; if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10; if (n.y > h + 10) n.y = -10;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${BLUE}, ${(1 - d / LINK) * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach((n) => {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${BLUE}, 0.5)`; ctx.fill();
    });
    if (Math.random() < 0.03) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const near = nodes.filter((n) => n !== a && Math.hypot(n.x - a.x, n.y - a.y) < LINK);
      if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)], t: 0 });
    }
    pulses = pulses.filter((p) => p.t <= 1);
    pulses.forEach((p) => {
      p.t += 0.02;
      ctx.beginPath();
      ctx.arc(p.a.x + (p.b.x - p.a.x) * p.t, p.a.y + (p.b.y - p.a.y) * p.t, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${TEAL}, 0.95)`; ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  step();
})();

// Shared observer helper
function onVisible(els, cb, threshold = 0.3) {
  if (!('IntersectionObserver' in window)) { els.forEach(cb); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
  }, { threshold });
  els.forEach((el) => io.observe(el));
}

// Count-up numbers when they come into view
onVisible(document.querySelectorAll('.count'), (el) => {
  const target = parseInt(el.dataset.target, 10) || 0;
  if (reduceMotion) { el.textContent = target; return; }
  el.textContent = '0';
  const duration = 1300;
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}, 0.6);

// Diploma hour bars fill when visible
onVisible(document.querySelectorAll('#diplomas'), (el) => el.classList.add('is-visible'), 0.3);

// Header shadow, timeline progress and active nav link on scroll
(function scrollEffects() {
  const header = document.getElementById('siteHeader');
  const fill = document.getElementById('timelineFill');
  const timeline = document.getElementById('timeline');
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;

  function update() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (fill && timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(Math.max((window.innerHeight * 0.7 - r.top) / r.height, 0), 1);
      fill.style.transform = `scaleY(${reduceMotion ? 1 : p})`;
    }
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= 120) current = s.id; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
