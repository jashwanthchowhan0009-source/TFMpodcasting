// Hand-drawn doodles in the style of the show intro: a cream ink line, a dark
// wine fill printed slightly off-register, and a slow line "boil" so they feel
// drawn rather than placed. Each one does what it is: the rocket flies in an
// arc, the globe spins and orbits, the case opens, the mic records, the bulb
// switches on, the chart climbs, the coin tosses, the arrow hits the target.

const INK = '#f3e4c4';
const FILL = '#4d0a1c';
const PINK = '#c25b78';
const RED = '#ff4d6d';
const GLOW = '#ffe3a1';

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
let R = rng(1);
// a little seeded jitter so no two copies are drawn identically
const w = (d) => d.replace(/-?\d+(\.\d+)?/g, (n) => (+n + (R() - 0.5) * 2.2).toFixed(1));
const ink = (d, extra = '') => `<path class="i" d="${d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
// a filled shape: off-register fill underneath, ink line on top
const shape = (d, fill = FILL, cls = '') => { const s = w(d); return `<path class="f ${cls}" d="${s}" fill="${fill}" transform="translate(3.5 4)"/>${ink(s)}`; };
const lines = (...ds) => ds.map((d) => ink(w(d))).join('');
const g = (cls, inner, style = '') => `<g class="${cls}"${style ? ` style="${style}"` : ''}>${inner}</g>`;

const CIRCLE = (cx, cy, r) => `M${cx} ${cy - r}C${cx + r * 0.56} ${cy - r} ${cx + r} ${cy - r * 0.56} ${cx + r} ${cy}C${cx + r} ${cy + r * 0.56} ${cx + r * 0.56} ${cy + r} ${cx} ${cy + r}C${cx - r * 0.56} ${cy + r} ${cx - r} ${cy + r * 0.56} ${cx - r} ${cy}C${cx - r} ${cy - r * 0.56} ${cx - r * 0.56} ${cy - r} ${cx} ${cy - r}Z`;

let uid = 0;
const DRAW = {
  bulb: () => g('rays', lines('M50 -2L50 4', 'M14 12L19 17', 'M86 12L81 17', 'M2 42L9 42', 'M98 42L91 42'))
    + shape('M50 12C30 12 20 28 22 42C24 54 34 58 36 68L64 68C66 58 76 54 78 42C80 28 70 12 50 12Z', FILL, 'glass')
    + lines('M37 76L63 75', 'M38 83L62 83', 'M43 90L57 90', 'M42 66L44 47L50 55L56 46L58 66'),

  globe: () => {
    const id = `gc${++uid}`;
    const mer = [0, 1, 2, 3, 4, 5, 6].map((k) => { const x = 6 + k * 19; return `M${x} 12C${x - 9} 30 ${x - 9} 70 ${x} 88`; });
    return `<defs><clipPath id="${id}"><path d="${CIRCLE(50, 50, 36)}"/></clipPath></defs>`
      + shape(CIRCLE(50, 50, 38))
      + `<g clip-path="url(#${id})">${g('spin', mer.map((d) => ink(d, ' stroke-width="4"')).join(''))}</g>`
      + lines('M15 37C38 44 62 44 85 37', 'M15 63C38 56 62 56 85 63', 'M12 50L88 50');
  },

  briefcase: () => g('paper', shape('M24 44L24 22L72 22L72 44', '#f3e4c4'))
    + shape('M13 40L87 40L87 84L13 84Z')
    + lines('M13 58L87 58', 'M44 53L56 53L56 63L44 63Z')
    + g('lid', shape('M13 40L13 31L87 31L87 40Z') + lines('M38 31L38 22L62 22L62 31')),

  mic: () => g('waves', lines('M22 22C16 30 16 40 22 48', 'M14 16C5 28 5 42 14 54', 'M78 22C84 30 84 40 78 48', 'M86 16C95 28 95 42 86 54'))
    + shape('M37 21C37 9 63 9 63 21L63 49C63 61 37 61 37 49Z')
    + lines('M37 31L63 32', 'M37 40L63 40', 'M27 44C27 68 73 68 73 44', 'M50 63L50 81', 'M35 83L65 82')
    + `<circle class="rec" cx="50" cy="-1" r="5" fill="${RED}"/>`,

  chart: () => lines('M15 13L15 85L89 85')
    + g('bar b1', shape('M24 84L24 64L35 64L35 84Z'))
    + g('bar b2', shape('M43 84L43 52L54 52L54 84Z'))
    + g('bar b3', shape('M62 84L62 38L73 38L73 84Z'))
    + g('trend', ink(w('M21 58L39 40L53 49L81 20'), ' pathLength="100"') + lines('M67 20L83 18L81 34')),

  coin: () => g('toss', shape(CIRCLE(50, 50, 39)) + lines(CIRCLE(50, 50, 28), 'M39 36L62 36', 'M39 45L62 45', 'M41 36C58 36 58 54 41 54L58 69')),

  target: () => g('board', shape(CIRCLE(46, 54, 36)) + lines(CIRCLE(46, 54, 23), CIRCLE(46, 54, 10)))
    + g('arrow', lines('M46 54L94 6', 'M84 4L96 4L96 16', 'M88 0L100 0L100 12')),

  rocket: () => g('flame', shape('M38 63C30 67 25 74 21 81C29 78 36 74 41 66Z', RED))
    + shape('M73 15C58 18 42 34 36 52L48 64C66 58 82 42 85 27C86 19 80 14 73 15Z')
    + lines(CIRCLE(62, 38, 6), 'M36 52L21 53L32 40L45 37', 'M48 64L47 79L60 68L63 55'),

  plane: () => shape('M11 49L89 15L62 85L48 58Z') + lines('M48 58L89 15', 'M48 58L46 75L56 66'),

  cup: () => g('steam s1', lines('M38 27C33 21 42 17 38 10')) + g('steam s2', lines('M53 27C48 21 57 17 53 10'))
    + shape('M22 37L71 37L66 79C64 85 29 85 27 79Z') + lines('M71 45C85 43 85 65 68 65'),

  hourglass: () => g('flip', shape('M32 13C32 37 46 42 46 50C46 58 32 63 32 87L68 87C68 63 54 58 54 50C54 42 68 37 68 13Z') + lines('M26 12L74 13', 'M26 88L74 87', 'M40 79L60 79')),

  spark: () => g('twinkle', shape('M50 9C54 38 62 46 91 50C62 54 54 62 50 91C46 62 38 54 9 50C38 46 46 38 50 9Z')),
  spade: () => shape('M50 13C40 30 19 40 22 56C24 68 38 71 46 62C46 72 42 80 35 87L65 86C58 80 54 72 54 62C62 71 77 68 78 56C81 40 60 30 50 13Z', PINK),
  heart: () => shape('M50 83C30 67 13 54 16 36C18 21 36 18 50 34C64 18 83 22 84 36C86 54 70 67 50 83Z', PINK),
  diamond: () => shape('M50 9L76 50L50 91L24 50Z', PINK),
  club: () => shape('M50 13C40 13 35 22 38 30C40 35 43 38 46 40C40 36 25 38 24 50C22 63 37 68 46 60C46 70 42 80 35 87L65 86C58 80 54 70 54 60C64 68 79 62 76 50C74 38 60 36 54 40C57 38 61 35 62 30C65 21 60 13 50 13Z'),
  crown: () => shape('M15 72L20 29L36 50L50 21L64 50L80 29L85 72Z') + lines('M17 82L83 82'),
  key: () => g('turn', shape(CIRCLE(30, 50, 16)) + lines('M46 50L89 50', 'M77 50L77 63', 'M85 50L85 60')),
};

export const NAMES = Object.keys(DRAW);

export function doodle(name, seed = 1) {
  R = rng(seed * 7919 + name.length);
  const draw = DRAW[name] || DRAW.spark;
  return `<svg class="dd k-${name}" viewBox="-8 -8 116 116" aria-hidden="true" focusable="false">${draw()}</svg>`;
}

// One shared filter makes every line "boil" a few times a second, like
// hand-drawn animation. Reduced motion keeps the wobble but stops the boil.
function boilFilter(still) {
  const anim = still ? '' : '<animate attributeName="seed" values="1;3;5;7" dur="0.9s" calcMode="discrete" repeatCount="indefinite"/>';
  return `<svg class="doodle-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="tfm-boil" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1">${anim}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" scale="3"/></filter></svg>`;
}

// how each doodle travels across the page
const TRAVEL = { rocket: 'arc', plane: 'glide', globe: 'orbit' };
const CAST = ['rocket', 'globe', 'briefcase', 'mic', 'bulb', 'chart', 'coin', 'target', 'plane', 'cup', 'spade', 'heart', 'hourglass', 'diamond', 'club', 'spark'];

export function mountSky({ still = false } = {}) {
  if (document.querySelector('.doodle-sky')) return;
  const page = document.body.dataset.page || 'page';
  const seed0 = [...page].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = rng(seed0);
  const phone = matchMedia('(max-width: 820px)').matches;
  const cast = phone ? CAST.slice(0, 9) : CAST.slice(0, 14);

  const sky = document.createElement('div');
  sky.className = 'doodle-sky';
  sky.setAttribute('aria-hidden', 'true');
  let html = boilFilter(still);
  const actors = cast.map((name, i) => {
    const size = phone ? 46 + r() * 16 : 62 + r() * 30;
    const a = {
      name, size, mode: TRAVEL[name] || 'wander',
      // wander: a slow Lissajous loop across the whole page
      cx: 0.1 + r() * 0.8, cy: (i + r()) / cast.length,
      ax: 0.12 + r() * 0.22, ay: 0.08 + r() * 0.14,
      fx: (0.5 + r() * 0.7) / 60, fy: (0.4 + r() * 0.8) / 60, px: r() * 6.3, py: r() * 6.3,
      z: 0.15 + r() * 0.45, t0: r() * 60,
    };
    html += `<i class="doodle" data-mode="${a.mode}" style="--s:${size.toFixed(0)}px;--delay:${(-r() * 8).toFixed(1)}s">${doodle(name, i + seed0)}</i>`;
    return a;
  });
  sky.innerHTML = html;
  const amb = document.querySelector('.ambient');
  if (amb) amb.after(sky); else document.body.prepend(sky);
  const els = [...sky.querySelectorAll('.doodle')];
  els.forEach((el, i) => { actors[i].el = el; });

  const place = (a, x, y, rot = 0) => { a.x = x; a.y = y; a.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`; };
  const wrapY = (y, vh) => { const span = vh + 240; let v = (y + 120) % span; if (v < 0) v += span; return v - 120; };

  const frame = (now) => {
    const t = now / 1000, W = innerWidth, H = innerHeight, sy = scrollY;
    for (const a of actors) {
      const s = a.size;
      if (a.mode === 'arc') {
        // lift off low on one side, climb across the page in an arc, leave at the top
        const T = 11, k = ((t + a.t0) % T) / T;
        const cyc = Math.floor((t + a.t0) / T);
        const rr = rng(cyc * 31 + 7);
        const x0 = rr() * W * 0.45, x1 = W * 0.55 + rr() * W * 0.45;
        const p0 = [x0, H + s], c = [x0 + (x1 - x0) * 0.12, H * (0.05 + rr() * 0.25)], p1 = [x1, -s * 1.5];
        const e = k, u = 1 - e;
        const x = u * u * p0[0] + 2 * u * e * c[0] + e * e * p1[0];
        const y = u * u * p0[1] + 2 * u * e * c[1] + e * e * p1[1];
        const dx = 2 * u * (c[0] - p0[0]) + 2 * e * (p1[0] - c[0]);
        const dy = 2 * u * (c[1] - p0[1]) + 2 * e * (p1[1] - c[1]);
        place(a, x - s / 2, y - s / 2, (Math.atan2(dy, dx) * 180) / Math.PI + 45);
        a.el.style.opacity = k > 0.97 ? 0 : 1;
      } else if (a.mode === 'glide') {
        const T = 26, k = ((t + a.t0) % T) / T;
        const x = -s + (W + 2 * s) * k;
        const base = wrapY(a.cy * H - sy * a.z, H);
        const y = base + Math.sin(k * Math.PI * 4) * 30;
        const slope = Math.cos(k * Math.PI * 4) * 30 * Math.PI * 4 / (W + 2 * s);
        place(a, x, y, (Math.atan2(slope, 1) * 180) / Math.PI + 24);
      } else if (a.mode === 'orbit') {
        // revolve around a slowly drifting centre
        const cx = W * (a.cx + a.ax * Math.sin(t * a.fx * 2 * Math.PI * 0.4 + a.px));
        const cy = wrapY(a.cy * H + H * a.ay * Math.sin(t * a.fy * 2 * Math.PI * 0.4 + a.py) - sy * a.z, H);
        const ang = t * 0.5 + a.px;
        place(a, cx + Math.cos(ang) * 90 - s / 2, cy + Math.sin(ang) * 46 - s / 2);
      } else {
        const x = W * (a.cx + a.ax * Math.sin(t * a.fx * 2 * Math.PI + a.px)) - s / 2;
        const y = wrapY(a.cy * H + H * a.ay * Math.sin(t * a.fy * 2 * Math.PI + a.py) - sy * a.z, H) - s / 2;
        place(a, Math.min(Math.max(x, -s * 0.3), W - s * 0.7), y);
      }
    }
    if (!still) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  if (still) return;

  // the cursor nudges doodles out of its way
  if (matchMedia('(pointer: fine)').matches) {
    let mr = 0, mx = -999, my = -999;
    const nudge = () => {
      mr = 0;
      for (const a of actors) {
        const dx = a.x + a.size / 2 - mx, dy = a.y + a.size / 2 - my;
        const d = Math.hypot(dx, dy), reach = 170;
        const f = d < reach ? (1 - d / reach) * 50 : 0;
        a.el.style.setProperty('--px', `${((dx / (d || 1)) * f).toFixed(1)}px`);
        a.el.style.setProperty('--py', `${((dy / (d || 1)) * f).toFixed(1)}px`);
      }
    };
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!mr) mr = requestAnimationFrame(nudge); }, { passive: true });
  }
}
