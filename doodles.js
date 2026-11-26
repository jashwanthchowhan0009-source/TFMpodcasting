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

  briefcase: () => g('paper', shape('M26 56L26 34L58 34L58 56Z', '#f3e4c4') + shape('M40 56L40 30L72 30L72 56Z', '#f3e4c4') + lines('M45 37L66 37', 'M45 43L62 43'))
    + shape('M12 52L88 52L88 86L12 86Z')
    + lines('M30 52L30 58', 'M70 52L70 58')
    + g('lid', shape('M12 52L12 40C12 35 15 32 20 32L80 32C85 32 88 35 88 40L88 52Z') + lines('M38 32L38 23L62 23L62 32', 'M28 52L28 46L34 46L34 52', 'M66 52L66 46L72 46L72 52')),

  mic: () => g('waves', lines('M22 22C16 30 16 40 22 48', 'M14 16C5 28 5 42 14 54', 'M78 22C84 30 84 40 78 48', 'M86 16C95 28 95 42 86 54'))
    + shape('M37 21C37 9 63 9 63 21L63 49C63 61 37 61 37 49Z')
    + lines('M37 31L63 32', 'M37 40L63 40', 'M27 44C27 68 73 68 73 44', 'M50 63L50 81', 'M35 83L65 82')
    + `<circle class="rec" cx="50" cy="-1" r="5" fill="${RED}"/>`,

  chart: () => lines('M15 13L15 85L89 85')
    + g('bar b1', shape('M24 84L24 64L35 64L35 84Z'))
    + g('bar b2', shape('M43 84L43 52L54 52L54 84Z'))
    + g('bar b3', shape('M62 84L62 38L73 38L73 84Z'))
    + g('trend', ink(w('M21 58L39 40L53 49L81 20'), ' pathLength="100"') + lines('M67 20L83 18L81 34')),

  coin: () => {
    const id = ++uid;
    const face = `M50 10C72 10 90 28 90 50C90 72 72 90 50 90C28 90 10 72 10 50C10 28 28 10 50 10Z`;
    return `<defs><linearGradient id="cg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1bf"/><stop offset=".45" stop-color="#f3c25a"/><stop offset="1" stop-color="#c8871c"/></linearGradient>
      <clipPath id="cc${id}"><path d="${face}"/></clipPath></defs>`
      + `<ellipse class="cshadow" cx="50" cy="106" rx="30" ry="5" fill="rgba(20,0,6,.38)"/>`
      + g('toss',
        `<path d="${face}" fill="#8f5a10" transform="translate(0 5)"/>`
        + `<path d="${face}" fill="url(#cg${id})" stroke="#4d0a1c" stroke-width="4"/>`
        + `<circle cx="50" cy="50" r="35" fill="none" stroke="#fff3cc" stroke-width="2.4" stroke-dasharray="1.5 4.2" opacity=".9"/>`
        + `<circle cx="50" cy="50" r="30" fill="none" stroke="#b47617" stroke-width="2.5"/>`
        + g('heads', `<g fill="none" stroke="#7f011f" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M39 33L61 33"/><path d="M39 42L61 42"/><path d="M41 33C57 33 57 51 41 51L57 66"/></g><text x="50" y="80" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="800" font-size="8" letter-spacing="1.5" fill="#7f011f">TFM</text>`)
        + g('tails', `<g transform="matrix(1 0 0 -1 0 100)"><path d="M50 26C44 36 32 42 34 52C35 59 43 61 48 56C48 62 46 66 42 70L58 70C54 66 52 62 52 56C57 61 65 59 66 52C68 42 56 36 50 26Z" fill="#7f011f"/><text x="50" y="81" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="800" font-size="7" letter-spacing="1.2" fill="#7f011f">MAFIA</text></g>`)
        + `<g clip-path="url(#cc${id})"><rect class="shine" x="-30" y="-20" width="16" height="140" fill="#fff" opacity=".55" transform="rotate(25 50 50)"/></g>`);
  },

  target: () => g('board', shape(CIRCLE(44, 56, 36)) + `<path d="${w(CIRCLE(44, 56, 23))}" fill="${PINK}" opacity="0.55"/>` + lines(CIRCLE(44, 56, 23), CIRCLE(44, 56, 10)))
    + g('arrow', `<path d="M44 56L56.7 51.7L48.3 43.3Z" fill="${INK}"/>` + lines('M50 50L94 6', 'M80 20L88.5 20', 'M80 20L80 11.5', 'M86 14L94.5 14', 'M86 14L86 5.5', 'M92 8L100.5 8', 'M92 8L92 -0.5')),

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
  // the rocket and the plane cross the whole page; everyone else gets a cell of an even grid
  const roamers = cast.filter((n) => !['rocket', 'plane'].includes(n)).length;
  const cols = phone ? 3 : 4, rows = Math.ceil(roamers / cols);
  let cell = 0;
  const actors = cast.map((name, i) => {
    const k = ['rocket', 'plane'].includes(name) ? 0 : cell++;
    const size = phone ? 30 + r() * 10 : 40 + r() * 18;
    const a = {
      name, size, mode: TRAVEL[name] || 'wander',
      // wander: a slow Lissajous loop across the whole page
      // spread evenly: each doodle owns a cell of a grid over the page and roams around it
      cx: ((k % cols) + 0.5) / cols + (r() - 0.5) * 0.06, cy: (Math.floor(k / cols) + 0.2 + r() * 0.6) / rows,
      ax: (0.22 + r() * 0.12) / cols, ay: (0.3 + r() * 0.25) / rows,
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

  const place = (a, x, y, rot = 0) => { a.tx = x; a.ty = y; a.rot = rot; };
  actors.forEach((a) => { a.ox = 0; a.oy = 0; a.x = 0; a.y = 0; });
  // the landing banner and the intro film stay clear of doodles
  const clear = [...document.querySelectorAll('.hero, .film-sec .hero-film')];
  const settle = () => {
    // keep doodles from touching: neighbours push each other apart, softly
    const n = actors.length;
    const fx = new Float32Array(n), fy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const A = actors[i];
      for (let j = i + 1; j < n; j++) {
        const B = actors[j];
        const dx = (B.tx + B.size / 2) - (A.tx + A.size / 2);
        const dy = (B.ty + B.size / 2) - (A.ty + A.size / 2);
        const d = Math.hypot(dx, dy) || 0.01, min = (A.size + B.size) / 2 + 46;
        if (d < min) {
          const push = (min - d) * 0.5, ux = dx / d, uy = dy / d;
          fx[i] -= ux * push; fy[i] -= uy * push; fx[j] += ux * push; fy[j] += uy * push;
        }
      }
    }
    const boxes = clear.map((el) => el.getBoundingClientRect());
    for (let i = 0; i < n; i++) {
      const a = actors[i];
      // ease toward this frame's push only — offsets fade as soon as they're clear of each other
      a.ox += (Math.max(-120, Math.min(120, fx[i] * 1.6)) - a.ox) * 0.08;
      a.oy += (Math.max(-120, Math.min(120, fy[i] * 1.6)) - a.oy) * 0.08;
      a.x = a.tx + a.ox; a.y = a.ty + a.oy;
      const cx = a.x + a.size / 2, cy = a.y + a.size / 2;
      const hidden = boxes.some((b) => cx > b.left - 30 && cx < b.right + 30 && cy > b.top - 30 && cy < b.bottom + 30);
      a.el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) rotate(${a.rot.toFixed(1)}deg)`;
      if (a.hidden !== hidden) { a.hidden = hidden; a.el.classList.toggle('is-clear', hidden); }
    }
  };
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
        // alternate: left-to-right one flight, right-to-left the next
        let x0 = rr() * W * 0.45, x1 = W * 0.55 + rr() * W * 0.45;
        if (cyc % 2) [x0, x1] = [W - x0, W - x1];
        const p0 = [x0, H + s], c = [x0 + (x1 - x0) * 0.12, H * (0.05 + rr() * 0.25)], p1 = [x1, -s * 1.5];
        const e = k, u = 1 - e;
        const x = u * u * p0[0] + 2 * u * e * c[0] + e * e * p1[0];
        const y = u * u * p0[1] + 2 * u * e * c[1] + e * e * p1[1];
        const dx = 2 * u * (c[0] - p0[0]) + 2 * e * (p1[0] - c[0]);
        const dy = 2 * u * (c[1] - p0[1]) + 2 * e * (p1[1] - c[1]);
        place(a, x - s / 2, y - s / 2, (Math.atan2(dy, dx) * 180) / Math.PI + 45);
        a.el.classList.toggle('is-gone', k > 0.97);
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
    settle();
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
