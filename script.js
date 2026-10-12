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

/* =====================================================================
   v2 — interactions & animations
   ===================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Typed rotating roles in the hero eyebrow
(function typedRoles() {
  const el = document.getElementById('typedRole');
  if (!el) return;
  const roles = ['Data Team Lead', 'Head of AI & Data Tracks', 'Data Scientist', 'AI Engineer', 'AI Instructor'];
  if (reduceMotion) { el.textContent = roles.slice(0, 3).join(' · '); return; }
  let r = 0, i = roles[0].length, deleting = true;
  function tick() {
    const word = roles[r];
    if (deleting) {
      i--;
      if (i <= 0) { deleting = false; r = (r + 1) % roles.length; }
    } else {
      i++;
    }
    el.textContent = roles[r].slice(0, Math.max(i, 0));
    let delay = deleting ? 35 : 70;
    if (!deleting && i >= roles[r].length) { deleting = true; delay = 1800; }
    if (deleting && i === 0) delay = 300;
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2200);
})();

// Count-up numbers (start when visible)
(function countUp() {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;
  const run = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1400 + Math.min(target, 200) * 3;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(t) * target);
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach((c) => io.observe(c));
})();

// Reveal individual timeline/education items
(function revealItems() {
  const items = document.querySelectorAll('.reveal-item');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  items.forEach((el) => io.observe(el));
})();

// Scroll progress bar, timeline fill and active nav link
(function scrollEffects() {
  const bar = document.getElementById('scrollProgress');
  const fill = document.getElementById('timelineFill');
  const timeline = document.querySelector('.timeline');
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;

    if (fill && timeline) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(Math.max((vh * 0.75 - r.top) / r.height, 0), 1);
      fill.style.transform = `scaleY(${prog})`;
    }

    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= 120) current = s.id; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Epoch counter on the training card
(function epochs() {
  const el = document.getElementById('epochCounter');
  if (!el || reduceMotion) { if (el) el.textContent = 'epoch 50/50'; return; }
  let e = 1;
  const id = setInterval(() => {
    e++;
    el.textContent = `epoch ${String(e).padStart(2, '0')}/50`;
    if (e >= 50) clearInterval(id);
  }, 55);
})();

// Desktop-only pointer effects: tilt cards, magnetic buttons, cursor glow
if (finePointer && !reduceMotion) {
  document.body.classList.add('has-pointer');

  const glow = document.getElementById('cursorGlow');
  window.addEventListener('mousemove', (e) => {
    if (glow) glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
  }, { passive: true });

  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
