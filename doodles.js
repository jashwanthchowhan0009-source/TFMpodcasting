// Hand-drawn doodles in the style of the show intro: a cream ink line,
// a dark wine fill printed slightly off-register, and a slow line "boil"
// so they feel drawn rather than placed. Every page gets a few drifting
// at the edges; they move with scroll at different depths.

const INK = '#f3e4c4';
const FILL = '#4d0a1c';
const PINK = '#c25b78';

// each doodle: [fill shape(s), ink lines, fill colour]
const SET = {
  bulb: [
    'M50 12C30 12 20 28 22 42C24 54 34 58 36 68L64 68C66 58 76 54 78 42C80 28 70 12 50 12Z',
    ['M37 76L63 75', 'M38 83L62 83', 'M43 90L57 90', 'M42 66L44 47L50 55L56 46L58 66'],
  ],
  spade: [
    'M50 13C40 30 19 40 22 56C24 68 38 71 46 62C46 72 42 80 35 87L65 86C58 80 54 72 54 62C62 71 77 68 78 56C81 40 60 30 50 13Z',
    [], PINK,
  ],
  mic: [
    'M37 21C37 9 63 9 63 21L63 49C63 61 37 61 37 49Z',
    ['M37 31L63 32', 'M37 40L63 40', 'M27 44C27 68 73 68 73 44', 'M50 63L50 81', 'M35 83L65 82'],
  ],
  coin: [
    'M50 11C73 11 89 28 89 50C89 73 72 89 50 89C27 89 11 72 11 50C11 28 28 11 50 11Z',
    ['M50 22C66 22 78 34 78 50C78 66 66 78 50 78C34 78 22 66 22 50C22 34 34 22 50 22Z', 'M39 36L62 36', 'M39 45L62 45', 'M41 36C58 36 58 54 41 54L58 69'],
  ],
  rocket: [
    'M73 15C58 18 42 34 36 52L48 64C66 58 82 42 85 27C86 19 80 14 73 15Z',
    ['M62 32C66 32 68 35 68 38C68 42 65 44 62 44C58 44 56 41 56 38C56 35 59 32 62 32Z', 'M36 52L21 53L32 40L45 37', 'M48 64L47 79L60 68L63 55', 'M38 63C30 67 25 74 22 80C30 77 36 73 41 66'],
  ],
  king: [
    'M38 25C38 35 44 36 44 40C40 42 40 47 44 48C42 60 38 70 36 79L64 79C62 70 58 60 56 48C60 47 60 42 56 40C56 36 62 35 62 25Z',
    ['M50 8L50 23', 'M43 15L57 14', 'M30 80L70 80L70 91L30 91Z'],
  ],
  heart: [
    'M50 83C30 67 13 54 16 36C18 21 36 18 50 34C64 18 83 22 84 36C86 54 70 67 50 83Z',
    [], PINK,
  ],
  diamond: ['M50 9L76 50L50 91L24 50Z', [], PINK],
  globe: [
    'M50 12C71 12 88 29 88 50C88 71 71 88 50 88C29 88 12 71 12 50C12 29 29 12 50 12Z',
    ['M50 12C33 30 33 70 50 88', 'M50 12C67 30 67 70 50 88', 'M15 37C38 44 62 44 85 37', 'M15 63C38 56 62 56 85 63', 'M12 50L88 50'],
  ],
  club: [
    'M50 13C40 13 35 22 38 30C40 35 43 38 46 40C40 36 25 38 24 50C22 63 37 68 46 60C46 70 42 80 35 87L65 86C58 80 54 70 54 60C64 68 79 62 76 50C74 38 60 36 54 40C57 38 61 35 62 30C65 21 60 13 50 13Z',
    [],
  ],
  chart: [
    'M24 84L24 66L35 66L35 84ZM43 84L43 56L54 56L54 84ZM62 84L62 44L73 44L73 84Z',
    ['M15 13L15 85L89 85', 'M21 60L39 42L53 51L81 22', 'M67 22L83 20L81 36'],
  ],
  briefcase: [
    'M13 34L87 34L87 83L13 83Z',
    ['M38 34L38 23L62 23L62 34', 'M13 52L87 52', 'M44 47L56 47L56 59L44 59Z'],
  ],
  crown: [
    'M15 72L20 29L36 50L50 21L64 50L80 29L85 72Z',
    ['M17 82L83 82', 'M50 21L50 21'],
  ],
  cup: [
    'M22 37L71 37L66 79C64 85 29 85 27 79Z',
    ['M71 45C85 43 85 65 68 65', 'M38 27C33 21 42 17 38 10', 'M53 27C48 21 57 17 53 10'],
  ],
  plane: [
    'M11 49L89 15L62 85L48 58Z',
    ['M48 58L89 15', 'M48 58L46 75L56 66'],
  ],
  key: [
    'M30 34C39 34 46 41 46 50C46 59 39 66 30 66C21 66 14 59 14 50C14 41 21 34 30 34Z',
    ['M46 50L89 50', 'M77 50L77 63', 'M85 50L85 60', 'M30 44C33 44 36 47 36 50C36 53 33 56 30 56'],
  ],
  target: [
    'M50 14C70 14 86 30 86 50C86 70 70 86 50 86C30 86 14 70 14 50C14 30 30 14 50 14Z',
    ['M50 27C63 27 73 37 73 50C73 63 63 73 50 73C37 73 27 63 27 50C27 37 37 27 50 27Z', 'M50 40C56 40 60 44 60 50C60 56 56 60 50 60C44 60 40 56 40 50C40 44 44 40 50 40Z', 'M50 50L86 14', 'M78 12L88 12L88 22'],
  ],
  spark: ['M50 9C54 38 62 46 91 50C62 54 54 62 50 91C46 62 38 54 9 50C38 46 46 38 50 9Z', []],
  hourglass: [
    'M32 13C32 37 46 42 46 50C46 58 32 63 32 87L68 87C68 63 54 58 54 50C54 42 68 37 68 13Z',
    ['M26 12L74 13', 'M26 88L74 87', 'M40 78L60 78'],
  ],
};

export const NAMES = Object.keys(SET);

// a little seeded jitter so no two copies of a doodle are drawn identically
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const wobble = (d, r) => d.replace(/-?\d+(\.\d+)?/g, (n) => (+n + (r() - 0.5) * 2.4).toFixed(1));

export function doodle(name, seed = 1) {
  const [shape, lines, fill = FILL] = SET[name] || SET.spark;
  const r = rng(seed * 7919 + name.length);
  const s = wobble(shape, r);
  const l = lines.map((d) => wobble(d, r));
  return `<svg viewBox="-6 -6 112 112" aria-hidden="true" focusable="false">
    <path d="${s}" fill="${fill}" transform="translate(3.5 4)"/>
    <g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="${s}"/>${l.map((d) => `<path d="${d}"/>`).join('')}
    </g>
  </svg>`;
}

// One shared filter makes every line "boil" a few times a second, like
// hand-drawn animation. Reduced motion keeps the wobble but stops the boil.
function boilFilter(still) {
  const anim = still ? '' : '<animate attributeName="seed" values="1;3;5;7" dur="0.9s" calcMode="discrete" repeatCount="indefinite"/>';
  return `<svg class="doodle-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="tfm-boil" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1">${anim}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></svg>`;
}

// The page's drifting doodles: a fixed layer behind the content, filled
// only along the left and right edges so text is never drawn over.
export function mountSky({ still = false, count } = {}) {
  if (document.querySelector('.doodle-sky')) return;
  const page = document.body.dataset.page || 'page';
  const seed0 = [...page].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = rng(seed0);
  const phone = matchMedia('(max-width: 820px)').matches;
  const n = count ?? (phone ? 8 : 14);
  const pool = [...NAMES].sort(() => r() - 0.5);

  const sky = document.createElement('div');
  sky.className = 'doodle-sky';
  sky.setAttribute('aria-hidden', 'true');
  let html = boilFilter(still);
  for (let i = 0; i < n; i++) {
    const name = pool[i % pool.length];
    const left = i % 2 === 0;
    // edge bands: 0–7% and 93–100% on desktop, hanging half off-screen on phones
    const size = phone ? 40 + r() * 16 : 54 + r() * 30;
    // left band hangs a little off-screen; right band mirrors it (vw of the doodle's left edge)
    const sw = (size / innerWidth) * 100;
    const x = left ? -sw * 0.35 + r() * (phone ? 2 : 2.6) : 100 - sw * 0.65 - r() * (phone ? 2 : 2.6);
    const y = (i / n) * 100 + r() * (100 / n);
    const depth = (0.25 + r() * 0.75).toFixed(2);   // how fast it drifts with scroll
    const tilt = (-18 + r() * 36).toFixed(1);
    const dur = (7 + r() * 7).toFixed(1);
    const delay = (-r() * 10).toFixed(1);
    html += `<i class="doodle" style="--x:${x.toFixed(1)}vw;--y:${y.toFixed(1)};--s:${size.toFixed(0)}px;--z:${depth};--t:${tilt}deg;--dur:${dur}s;--delay:${delay}s">${doodle(name, i + seed0)}</i>`;
  }
  sky.innerHTML = html;
  const amb = document.querySelector('.ambient');
  if (amb) amb.after(sky); else document.body.prepend(sky);

  if (still) return;
  // scroll drift: each doodle slides up at its own depth and wraps around
  const items = [...sky.querySelectorAll('.doodle')];
  let raf = 0;
  const draw = () => {
    raf = 0;
    const vh = innerHeight, span = vh + 240, y = scrollY;
    for (const el of items) {
      const z = +el.style.getPropertyValue('--z');
      const base = (+el.style.getPropertyValue('--y') / 100) * span;
      let top = (base - y * z * 0.35) % span;
      if (top < 0) top += span;
      el.style.transform = `translate3d(0, ${(top - 120).toFixed(1)}px, 0)`;
    }
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
  // the cursor nudges doodles out of its way
  if (matchMedia('(pointer: fine)').matches) {
    let mr = 0, mx = 0, my = 0;
    const nudge = () => {
      mr = 0;
      for (const el of items) {
        const b = el.getBoundingClientRect();
        const dx = b.left + b.width / 2 - mx, dy = b.top + b.height / 2 - my;
        const d = Math.hypot(dx, dy), reach = 170;
        if (d < reach) {
          const f = (1 - d / reach) * 46;
          el.style.setProperty('--px', `${((dx / (d || 1)) * f).toFixed(1)}px`);
          el.style.setProperty('--py', `${((dy / (d || 1)) * f).toFixed(1)}px`);
        } else if (el.style.getPropertyValue('--px')) { el.style.removeProperty('--px'); el.style.removeProperty('--py'); }
      }
    };
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!mr) mr = requestAnimationFrame(nudge); }, { passive: true });
  }
  addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(draw); });
  draw();
}
