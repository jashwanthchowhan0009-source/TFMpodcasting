// The episode deck: each episode is a card in the family deck.
// Side cards slide to the centre; the centre card turns over to show the episode.

const BRASS = '#c9a24b';

function sunburst(cx, cy, n, r) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    d += `M${cx} ${cy}L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d;
}

function mic(rot) {
  // a broadcast mic, drawn pointing up, rotated about the medallion centre
  return `
    <g transform="rotate(${rot} 150 220)">
      <rect x="143" y="96" width="14" height="44" rx="7" fill="${BRASS}"/>
      <rect x="143" y="96" width="14" height="44" rx="7" fill="none" stroke="#7a5a22" stroke-width="1"/>
      <path d="M146 106h8M146 112h8M146 118h8M146 124h8" stroke="#7a5a22" stroke-width="1.2"/>
      <rect x="148" y="140" width="4" height="200" fill="${BRASS}"/>
      <rect x="140" y="336" width="20" height="6" rx="2" fill="${BRASS}"/>
    </g>`;
}

const CARD_BACK = `
<svg class="card-art" viewBox="0 0 300 440" aria-hidden="true">
  <defs>
    <radialGradient id="cb-glow" cx="50%" cy="50%" r="60%">
      <stop offset="0" stop-color="#6a1d26"/>
      <stop offset="1" stop-color="#2a0a0f"/>
    </radialGradient>
    <clipPath id="cb-clip"><rect x="20" y="20" width="260" height="400" rx="6"/></clipPath>
  </defs>
  <rect width="300" height="440" rx="14" fill="url(#cb-glow)"/>
  <g clip-path="url(#cb-clip)">
    <path d="${sunburst(150, 220, 48, 320)}" stroke="${BRASS}" stroke-opacity="0.16" stroke-width="1.2"/>
  </g>
  <rect x="10" y="10" width="280" height="420" rx="9" fill="none" stroke="${BRASS}" stroke-width="2"/>
  <rect x="20" y="20" width="260" height="400" rx="6" fill="none" stroke="${BRASS}" stroke-opacity="0.55"/>
  <g fill="${BRASS}">
    <path d="M150 4l8 8-8 8-8-8z"/><path d="M150 420l8 8-8 8-8-8z"/>
    <path d="M4 220l8-8 8 8-8 8z"/><path d="M280 220l8-8 8 8-8 8z"/>
  </g>
  <path d="M20 54h28l-28 28M280 54h-28l28 28M20 386h28l-28-28M280 386h-28l28-28" stroke="${BRASS}" stroke-opacity="0.7" fill="none"/>
  ${mic(-34)}${mic(34)}
  <path d="M150 140l78 80-78 80-78-80z" fill="#140608" stroke="${BRASS}" stroke-width="2.2"/>
  <path d="M150 156l62 64-62 64-62-64z" fill="none" stroke="${BRASS}" stroke-opacity="0.5"/>
  <text x="150" y="236" text-anchor="middle" font-family="'Big Shoulders Display', sans-serif" font-weight="900" font-size="46" letter-spacing="2" fill="${BRASS}">TFM</text>
  <text x="150" y="392" text-anchor="middle" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="${BRASS}" fill-opacity="0.85">The Founder Mafia</text>
</svg>`;

// Placeholder portrait: a guest under the lamp. Swap for a real photo via `image` in content.js.
const SILHOUETTE = `
<svg class="card-portrait" viewBox="0 0 200 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="sil-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd58a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffd58a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sil-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a0f15"/>
      <stop offset="1" stop-color="#140608"/>
    </linearGradient>
  </defs>
  <rect width="200" height="170" fill="url(#sil-floor)"/>
  <path d="M100 0v12" stroke="${BRASS}" stroke-width="1.5"/>
  <path d="M88 12h24l9 12H79z" fill="${BRASS}"/>
  <path d="M80 24h40l70 146H10z" fill="url(#sil-beam)"/>
  <g fill="#0b0304">
    <path d="M42 170c4-36 26-48 58-50 32 2 54 14 58 50z"/>
    <rect x="92" y="104" width="16" height="20"/>
    <ellipse cx="100" cy="94" rx="16" ry="19"/>
    <path d="M81 82c0-19 6-25 19-25s19 6 19 25z"/>
    <ellipse cx="100" cy="83" rx="33" ry="6"/>
  </g>
  <path d="M68 82.5c10-4 54-4 64 0" stroke="#ffd58a" stroke-opacity="0.55" stroke-width="1.2" fill="none"/>
  <rect x="81" y="76" width="38" height="4" fill="#5a1a22"/>
  <rect x="96" y="136" width="8" height="34" fill="#1a1718"/>
  <rect x="90" y="112" width="20" height="32" rx="10" fill="#151314" stroke="${BRASS}" stroke-width="1.4"/>
  <path d="M93 122h14M93 127h14M93 132h14" stroke="#3a3335" stroke-width="1.2"/>
</svg>`;

export function renderDeck({ episodes, mount, onTurn }) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = episodes.length;
  mount.innerHTML = `
    <div class="deck-stage"></div>
    <div class="deck-controls">
      <button class="deck-btn" type="button" data-dir="-1">
        <span class="deck-btn-key" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg></span>
        Previous
      </button>
      <div class="deck-progress" aria-hidden="true">${episodes.map(() => '<span></span>').join('')}</div>
      <button class="deck-btn" type="button" data-dir="1">
        Next
        <span class="deck-btn-key" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg></span>
      </button>
    </div>
    <p class="deck-hint">Tap the centre card to turn it over.</p>
    <p class="visually-hidden" aria-live="polite" id="deckLive"></p>`;

  const stage = mount.querySelector('.deck-stage');
  const live = mount.querySelector('#deckLive');
  const bars = [...mount.querySelectorAll('.deck-progress span')];
  const [prevBtn, nextBtn] = mount.querySelectorAll('.deck-btn');

  const cards = episodes.map((ep, i) => {
    const no = String(ep.number).padStart(2, '0');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">${CARD_BACK}</div>
        <div class="card-face card-front">
          <div class="card-frame">
            <p class="card-count">Episode ${no} <span>of ${String(total).padStart(2, '0')}</span></p>
            <div class="card-picture">${ep.image ? `<img src="${encodeURI(ep.image)}" alt="">` : SILHOUETTE}</div>
            <p class="card-title"></p>
            <p class="card-guest"></p>
            ${ep.url
              ? `<a class="card-link" href="${encodeURI(ep.url)}" target="_blank" rel="noopener">Watch episode</a>`
              : `<p class="card-soon">Coming soon</p>`}
          </div>
        </div>
      </div>
      <button class="card-hit" type="button"></button>`;
    card.querySelector('.card-title').textContent = ep.title;
    card.querySelector('.card-guest').textContent = [ep.guest, ep.length].filter(Boolean).join(', ');
    card.querySelector('.card-hit').addEventListener('click', () => {
      if (i !== index) go(i, true);
      else turn(!flipped);
    });
    stage.appendChild(card);
    return card;
  });

  let index = 0;
  let flipped = false;
  let flipTimer = 0;

  function layout() {
    cards.forEach((card, i) => {
      const d = Math.max(-2, Math.min(2, i - index));
      card.dataset.pos = String(d);
      card.classList.toggle('is-flipped', i === index && flipped);
      const visible = Math.abs(d) <= 1;
      const hit = card.querySelector('.card-hit');
      const ep = episodes[i];
      hit.tabIndex = visible ? 0 : -1;
      hit.setAttribute('aria-hidden', visible ? 'false' : 'true');
      hit.setAttribute('aria-label', i === index
        ? `${flipped ? 'Turn back' : 'Turn over'} episode ${ep.number}: ${ep.title}`
        : `Show episode ${ep.number}: ${ep.title}`);
      const link = card.querySelector('.card-link');
      if (link) link.tabIndex = i === index && flipped ? 0 : -1;
    });
    bars.forEach((b, i) => b.classList.toggle('is-on', i === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
  }

  function turn(state) {
    clearTimeout(flipTimer);
    flipped = state;
    layout();
    if (state) {
      const ep = episodes[index];
      live.textContent = `Episode ${ep.number}: ${ep.title}. ${ep.guest}. ${ep.url ? '' : 'Coming soon.'}`;
      onTurn?.();
    }
  }

  function go(i, autoTurn) {
    if (i < 0 || i >= total) return;
    clearTimeout(flipTimer);
    index = i;
    flipped = false;
    layout();
    if (autoTurn) flipTimer = setTimeout(() => turn(true), reduceMotion ? 0 : 520);
  }

  prevBtn.addEventListener('click', () => go(index - 1, true));
  nextBtn.addEventListener('click', () => go(index + 1, true));
  mount.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
  });

  // Deal the first card face up the first time the deck comes into view.
  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) {
      io.disconnect();
      flipTimer = setTimeout(() => turn(true), reduceMotion ? 0 : 450);
    }
  }, { threshold: 0.55 });
  io.observe(stage);

  layout();
}
