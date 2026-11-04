// Motion helpers shared by every page.
// Scroll and pointer positions are written to CSS custom properties; the CSS does the moving.

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ── pointer → --mx / --my on <html>, eased ─────────────── */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

/* ── scroll scenes ──────────────────────────────────────────
   [data-scene]  sticky scene: --p goes 0 → 1 while it is pinned
   [data-drift]  normal block: --v goes -1 (below) → 0 (centred) → 1 (above) */
let scenes = [];
let drifts = [];
export function watchScroll() {
  scenes = [...document.querySelectorAll('[data-scene]')];
  drifts = [...document.querySelectorAll('[data-drift]')];
}

function tick() {
  const vh = window.innerHeight;
  if (!reduceMotion) {
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    document.documentElement.style.setProperty('--mx', mouse.sx.toFixed(4));
    document.documentElement.style.setProperty('--my', mouse.sy.toFixed(4));
  }
  for (const el of scenes) {
    const r = el.getBoundingClientRect();
    const span = Math.max(1, r.height - vh);
    const p = reduceMotion ? 0 : clamp(-r.top / span, 0, 1);
    el.style.setProperty('--p', p.toFixed(4));
  }
  for (const el of drifts) {
    const r = el.getBoundingClientRect();
    const v = clamp((vh / 2 - (r.top + r.height / 2)) / vh, -1, 1);
    el.style.setProperty('--v', (reduceMotion ? 0 : v).toFixed(4));
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ── embers / dust: a soft particle field on a canvas ───── */
export function embers(canvas, { count = 60, hue = [32, 44], rise = 18, size = [1, 3.2], drift = 14, twinkle = true } = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, visible = false, parts = [];

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const sg = sprite.getContext('2d');
  const grd = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,240,200,1)');
  grd.addColorStop(0.25, 'rgba(255,190,110,0.75)');
  grd.addColorStop(1, 'rgba(255,140,60,0)');
  sg.fillStyle = grd;
  sg.fillRect(0, 0, 64, 64);

  const spawn = (anywhere) => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    s: size[0] + Math.random() * (size[1] - size[0]),
    vy: rise * (0.5 + Math.random()),
    ph: Math.random() * Math.PI * 2,
    a: 0.35 + Math.random() * 0.65,
    hue: hue[0] + Math.random() * (hue[1] - hue[0]),
  });

  function size_() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(count * Math.min(1, (w * h) / (1400 * 800)) + count * 0.3);
    parts = Array.from({ length: n }, () => spawn(true));
  }
  new ResizeObserver(size_).observe(canvas);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || !w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      if (!reduceMotion) {
        p.y -= p.vy * dt;
        p.ph += dt;
        p.x += Math.sin(p.ph * 0.7) * drift * dt;
      }
      if (p.y < -12) Object.assign(p, spawn(false));
      const tw = twinkle ? 0.6 + 0.4 * Math.sin(p.ph * 2.3) : 1;
      const fade = Math.min(1, (h - p.y) / 80, p.y / 80 + 0.2);
      ctx.globalAlpha = Math.max(0, p.a * tw * fade);
      const d = p.s * 6;
      ctx.drawImage(sprite, p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
}

/* ── tilt: a card that leans toward the pointer ─────────── */
export function tilt(el, max = 10) {
  if (!el || reduceMotion) return;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(x * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-y * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  });
  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
}

/* ── city windows that switch on and off ────────────────── */
export function cityLife(root) {
  if (!root || reduceMotion) return;
  const wins = [...root.querySelectorAll('.hs-win')];
  if (!wins.length) return;
  setInterval(() => {
    for (let i = 0; i < 3; i++) wins[Math.floor(Math.random() * wins.length)].classList.toggle('is-off');
  }, 900);
}

/* ── the stage door: fade between pages like walking through a door ── */
export function stageDoor() {
  const veil = document.createElement('div');
  veil.className = 'stage-door';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);
  requestAnimationFrame(() => document.body.classList.add('is-entered'));
  if (reduceMotion) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.remove('is-entered');
    setTimeout(() => { location.href = url.href; }, 420);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.add('is-entered'); });
}
