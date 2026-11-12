import { links, applicationsOpen, season, table, tracks, episodes, meetups, faqs, lastUpdate, payment, company, team } from './content.js';
import * as S from './stickers.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Smooth scrolling + an eased pointer for parallax ──── */

// Smooth scrolling is an extra: loaded on its own so a missing or blocked file never stops the page.
let lenis = null;
if (!reduceMotion) {
  import('./vendor/lenis.js')
    .then(({ default: Lenis }) => { lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, anchors: { offset: -80 } }); })
    .catch((err) => console.warn('[tfm] smooth scrolling unavailable, using native scroll', err));
}
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });
function frame(t) {
  lenis?.raf(t);
  if (!reduceMotion) {
    pointer.sx += (pointer.x - pointer.sx) * 0.07;
    pointer.sy += (pointer.y - pointer.sy) * 0.07;
    document.documentElement.style.setProperty('--mx', pointer.sx.toFixed(4));
    document.documentElement.style.setProperty('--my', pointer.sy.toFixed(4));
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const goTo = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y }));

/* ── Sections ease in as they arrive ──────────────────── */

function reveals() {
  const groups = [
    '.block-head', '.intro > *', '.road > li', '.lineup > figure', '.trailer > *', '.pillars > li', '.tracks > .track',
    '.index', '.glimpse > figure', '.keywords > li', '.info-grid > *', '.steps > li', '.rules > li', '.team > li',
    '.channels > li', '.meetups > li', '.faq > details', '.look-for > li', '.split > *', '.join .wordmark-pill', '.footer-pills', '.the-end',
  ];
  const els = [];
  for (const sel of groups) {
    for (const el of $$(sel)) {
      if (el.closest('.collage') || el.classList.contains('drop')) continue;
      const sibs = [...el.parentElement.children].filter((c) => c.matches(sel));
      el.style.setProperty('--rv', Math.max(0, sibs.indexOf(el)) % 6);
      el.classList.add('rv');
      els.push(el);
    }
  }
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((e) => io.observe(e));
}
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? encodeURI(u) : '');
// Local files from content.js (e.g. 'media/host.jpg') or full https links; nothing else.
const safeAsset = (u) => {
  const v = String(u || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return encodeURI(v);
  if (/^[\w./-]+$/.test(v) && !v.startsWith('/') && !v.includes('..')) return v;
  return '';
};

/* ── Loader: "Opening the office" ─────────────────────── */

const LOADER_MAX_MS = 2800; // the loader never stays up longer than this

function revealPage() {
  document.body.classList.add('is-ready');
  window.__tfmReady?.(); // tells the inline failsafe in <head> it can stand down
}

// Waits for one asset, but never longer than `ms`; errors count as "done".
function settle(promise, ms) {
  return Promise.race([
    Promise.resolve(promise).catch(() => {}),
    new Promise((r) => setTimeout(r, ms)),
  ]);
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
    if (img.complete) resolve();
  });
}

function loader() {
  const el = $('.loader');
  if (!el) { revealPage(); return; }
  const pct = $('.loader-pct', el);
  const seen = (() => { try { return sessionStorage.getItem('tfm-open') === '1'; } catch { return false; } })();
  const minMs = reduceMotion || seen ? 250 : 1300;
  const t0 = performance.now();

  // Real assets the first screen needs. Each one resolves on load, error or timeout.
  const assets = [
    settle(document.fonts?.ready, 2000),
    ...$$('img[src]').slice(0, 4).map((img) => settle(preloadImage(img.currentSrc || img.src), 2400)),
  ];
  let loaded = 0;
  assets.forEach((a) => a.then(() => { loaded += 1; }));

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    pct.textContent = '100%';
    el.style.setProperty('--load', 100);
    try { sessionStorage.setItem('tfm-open', '1'); } catch {}
    setTimeout(revealPage, 120);
  };

  // Progress = the slower of time and assets, so it always moves and always reaches 100.
  const tick = () => {
    if (done) return;
    const now = performance.now();
    const timeP = 1 - Math.pow(1 - Math.min(1, (now - t0) / minMs), 2.2);
    const assetP = assets.length ? loaded / assets.length : 1;
    const v = Math.round(Math.min(timeP, 0.15 + assetP * 0.85) * 100);
    pct.textContent = `${v}%`;
    el.style.setProperty('--load', v);
    if (v >= 100) finish();
  };
  // setInterval keeps counting even where requestAnimationFrame is paused (background tabs).
  const timer = setInterval(() => { tick(); if (done) clearInterval(timer); }, 50);
  tick();

  Promise.all(assets).then(() => setTimeout(tick, 0));
  setTimeout(finish, LOADER_MAX_MS); // hard fallback: reveal no matter what
}

/* ── Top bar, progress, spacebar ──────────────────────── */

function chrome() {
  const page = document.body.dataset.page;
  for (const a of $$('[data-nav]')) if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');

  const bar = $('.topbar');
  const menu = $('.menu-pill');
  menu?.addEventListener('click', () => {
    const open = !bar.classList.contains('is-open');
    bar.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  });

  const socials = [['instagram', 'Insta'], ['linkedin', 'Linkd'], ['youtube', 'YouTube'], ['spotify', 'Spotify']];
  $$('[data-socials]').forEach((el) => {
    el.innerHTML = socials.filter(([k]) => links[k])
      .map(([k, l]) => `<a class="pill" href="${safeUrl(links[k])}" target="_blank" rel="noopener">${l}</a>`).join('');
  });
  $$('[data-last-update]').forEach((el) => { el.textContent = `Last update · ${lastUpdate}`; });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$('[data-copyright]').forEach((el) => { el.textContent = `© 2026 ${company}`; });

  const prog = $('.progress-pill');
  const pctEl = $('.progress-pill .pct');
  const space = $('.spacebar');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    prog?.style.setProperty('--prog', p.toFixed(4));
    if (pctEl) pctEl.textContent = `${Math.round(p * 100)}%`;
    space?.classList.toggle('is-hidden', p > 0.985);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  const scrollStep = (dir = 1) => goTo((lenis ? lenis.targetScroll : scrollY) + dir * innerHeight * 0.85);
  $('.spacebar .round')?.addEventListener('click', () => scrollStep(1));
  $('.spacebar .pill')?.addEventListener('click', () => scrollStep(1));
  addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target.closest('input, textarea, select, button, a, summary, [contenteditable]')) return;
    e.preventDefault();
    scrollStep(e.shiftKey ? -1 : 1);
  });
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => goTo(0)));
}

/* ── Objects you can pick up and move ─────────────────── */

function draggable(el) {
  let sx = 0, sy = 0, ox = 0, oy = 0, id = null;
  const base = getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform;
  el.addEventListener('pointerdown', (e) => {
    id = e.pointerId;
    el.setPointerCapture(id);
    sx = e.clientX - ox; sy = e.clientY - oy;
    el.classList.add('is-dragging');
    el.style.zIndex = 40;
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    ox = e.clientX - sx; oy = e.clientY - sy;
    el.style.transform = `translate(${ox}px, ${oy}px) ${base} rotate(${Math.max(-12, Math.min(12, (e.movementX || 0) * 0.8))}deg)`;
  });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    el.classList.remove('is-dragging');
    el.style.transform = `translate(${ox}px, ${oy}px) ${base}`;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

function mountObjects() {
  const art = {
    clip: S.paperclip, pin: S.pin, 'pin-dark': () => S.pin('#93032E'), cigar: S.cigar,
    seal: () => S.seal('THE FOUNDER MAFIA', 'TFM'),
    match: S.matchbook, fedora: S.fedora, rose: S.rose, mic: S.mic,
    ruler: () => S.ruler(12),
    ticket: () => S.ticket('ADMIT ONE FOUNDER', season.name.toUpperCase(), 'SEAT AT THE TABLE'),
    note: () => S.note('HOUSE RULE Nº 2', ['Numbers,', 'not adjectives.']),
    badge: () => S.badge(['100%', 'ON THE', 'RECORD'], '*UNLESS YOU SAY SO'),
  };
  $$('[data-art]').forEach((el) => {
    const make = art[el.dataset.art];
    if (make) el.insertAdjacentHTML('afterbegin', make());
    if (el.classList.contains('obj')) draggable(el);
  });
  $$('[data-oval]').forEach((el) => {
    el.innerHTML = S.oval('ENTER', applicationsOpen ? `${season.name.toUpperCase()} · GUEST PITCHES OPEN` : `${season.name.toUpperCase()} · PITCHES CLOSED`, 'THE MAFIA · PULL UP A CHAIR');
  });
}

/* ── Home sections ────────────────────────────────────── */

function mountHome() {
  const road = $('#road');
  if (road) road.innerHTML = season.steps.map((s) => `<li><p class="when">${esc(s.when)}</p><p class="what">${esc(s.what)}</p></li>`).join('');
  $$('[data-season]').forEach((el) => { el.textContent = season.name; });

  const lineup = $('#lineup');
  if (lineup) lineup.innerHTML = table.map((p, i) => `
    <figure>
      <div class="shot"><span class="tape" aria-hidden="true"></span>${S.lineup(esc(p.name), esc(p.role), i + 1, safeAsset(p.photo))}</div>
      <figcaption>${esc(p.note)}</figcaption>
    </figure>`).join('');

  const host = $('#hostCard');
  if (host && table[0]) host.innerHTML = `<figure><div class="shot"><span class="tape" aria-hidden="true"></span>${S.lineup(esc(table[0].name), esc(table[0].role), 1, safeAsset(table[0].photo))}</div></figure>`;

  const tv = $('#tv');
  if (tv) {
    const url = safeUrl(links.trailer);
    const video = safeAsset(links.trailerVideo);
    const screen = video
      ? `<video class="tv-video" src="${video}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>`
      : '';
    tv.outerHTML = url
      ? `<a class="tv${video ? ' has-video' : ''}" id="tv" href="${url}" target="_blank" rel="noopener" aria-label="Watch the full trailer on YouTube">${S.tv()}${screen}</a>`
      : `<div class="tv${video ? ' has-video' : ''}" id="tv" role="img" aria-label="${video ? 'The show intro, playing on a TV' : 'Trailer coming soon'}">${S.tv()}${screen}</div>`;
    const v = $('#tv video');
    if (v) {
      v.addEventListener('error', () => v.remove()); // a missing file falls back to the play screen
      if (reduceMotion) v.removeAttribute('autoplay');
      v.play?.().catch(() => {});
    }
    const note = $('#tvNote');
    if (note) note.textContent = url ? 'Click the TV to watch the full trailer on YouTube.' : video ? '' : 'The trailer drops before the first episode.';
  }

  const tr = $('#tracks');
  if (tr) tr.innerHTML = Object.values(tracks).map((t, i) => `
    <article class="track">
      ${[S.dollar, S.rupee, S.collab][i % 3]()}
      <div><p class="label">${esc(t.sub)}</p><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p></div>
    </article>`).join('');

  const tbody = $('#episodeRows');
  if (tbody) tbody.innerHTML = episodes.map((ep) => {
    const t = tracks[ep.track] || { suit: '', name: '' };
    const url = safeUrl(ep.url);
    return `<tr>
      <td class="no">${String(ep.number).padStart(2, '0')}</td>
      <td class="ttl">${esc(ep.title)}</td>
      <td data-label="Guest">${esc(ep.guest)}</td>
      <td data-label="Company">${esc(ep.company)}</td>
      <td data-label="Track"><span class="suit" aria-hidden="true">${t.suit}</span>${esc(t.name)}</td>
      <td>${url ? `<a class="pill" href="${url}" target="_blank" rel="noopener">Watch</a>` : '<span class="soon">Coming soon</span>'}</td>
    </tr>`;
  }).join('');

  const g = $('#glimpse');
  if (g) g.innerHTML = [
    ['media/glimpse-door.jpg', 'the door is open', 'A door left half open, warm light spilling across the floor'],
    ['media/glimpse-mics.jpg', 'two mics, ready', 'Two leather chairs and a table of studio microphones'],
    ['media/glimpse-empty-chair.jpg', 'one chair is empty', 'A circle of dark chairs with a single empty chair in the spotlight'],
    ['media/glimpse-funds.jpg', 'funds on table', 'Bundles of cash and briefcases on a wooden table'],
  ].map(([src, cap, alt]) => `<figure class="polaroid"><div class="polaroid-frame">
      <img src="${src}" alt="${alt}" width="600" height="510" loading="lazy" decoding="async">
      <figcaption>${cap}</figcaption></div></figure>`).join('');
}

/* ── About: the team ──────────────────────────────────── */

function mountTeam() {
  const el = $('#team');
  if (!el) return;
  const initials = (n) => /^(to be|co-founder)/i.test(n) ? '?' : String(n).split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  el.innerHTML = team.map((p) => {
    const photo = safeAsset(p.photo);
    return `<li class="member">
      <div class="member-photo">${photo ? `<img src="${photo}" alt="Portrait of ${esc(p.name)}" width="640" height="800" loading="lazy" decoding="async">` : `<span aria-hidden="true">${esc(initials(p.name))}</span>`}</div>
      <h3>${esc(p.name)}</h3>
      <p class="member-role">${esc(p.role)}</p>
      ${p.bio ? `<p class="member-bio">${esc(p.bio)}</p>` : ''}
    </li>`;
  }).join('');
}

/* ── Enter the Mafia ──────────────────────────────────── */

function mountEnter() {
  const form = $('#pitchForm');
  if (!form) return;
  const status = $('#formStatus');
  const contact = $('#contactLine');
  if (contact) {
    contact.innerHTML = links.contactEmail
      ? `Prefer email? Write to <code>${esc(links.contactEmail)}</code>`
      : '';
  }
  if (!applicationsOpen) {
    form.innerHTML = `<p class="closed-note span-2">${esc(season.name)} guest pitches are closed. Join the community to hear first when they open again.</p>`;
    $('.stamp-mark').textContent = 'Closed';
    return;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    for (const f of form.elements) {
      if (!f.name) continue;
      const ok = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstBad) firstBad = f;
    }
    if (firstBad) { status.textContent = 'Fill in every field, with a valid email, to send your pitch.'; firstBad.focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    try { localStorage.setItem('tfm-pitch', JSON.stringify(d)); } catch {}
    const pay = safeUrl(payment.razorpayLink);
    if (!pay) {
      status.textContent = 'Payments open soon. Your pitch is saved on this device — come back to complete it.';
      return;
    }
    // Hand over to Razorpay. Name, email and phone prefill the payment page where it supports it.
    const u = new URL(pay);
    if (d.name) u.searchParams.set('name', d.name);
    if (d.email) u.searchParams.set('email', d.email);
    status.textContent = 'Taking you to Razorpay to complete your entry…';
    setTimeout(() => { location.href = u.toString(); }, 350);
  });

  const fee = $('#feeNote');
  if (fee) {
    const amt = String(payment.amount || '').trim();
    fee.innerHTML = `<b>Note:</b> joining the Mafia carries ${amt ? `a fee of <b>${esc(amt)}</b>` : 'a one-time participation fee'}. When you send your pitch you'll go to Razorpay to pay securely.`;
  }

  const faq = $('#faq');
  if (faq) faq.innerHTML = faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
}

/* ── Community ────────────────────────────────────────── */

function mountCommunity() {
  $$('[data-join]').forEach((a) => { const u = safeUrl(links.startupitch); if (u) a.href = u; else a.remove(); });
  $$('[data-channel]').forEach((el) => {
    const url = safeUrl(links[el.dataset.channel]);
    const slot = $('.slot', el);
    slot.outerHTML = url
      ? `<a class="pill is-solid" href="${url}" target="_blank" rel="noopener">${esc(slot.dataset.label)}</a>`
      : '<span class="soon">Opening soon</span>';
  });
  const list = $('#meetups');
  if (list) {
    const suits = ['♠', '♥', '♦', '♣'];
    list.innerHTML = meetups.length
      ? meetups.map((m, i) => `<li><span class="suit" aria-hidden="true">${suits[i % 4]}</span><p class="when">${esc(m.when)}</p><p class="what">${esc(m.what)}</p><p class="where">${esc(m.where)}</p></li>`).join('')
      : '<li><p class="what">First meetup announced soon.</p></li>';
  }
  const card = $('.member-card');
  if (card && !reduceMotion) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
      card.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
  }
}

/* ── 3D spaces between sections ───────────────────────── */

function mountSpaces() {
  const spaces = $$('[data-space]');
  if (!spaces.length) return;

  for (const sp of spaces) {
    const kind = sp.dataset.space;
    const stage = $('.space-stage', sp);
    if (kind === 'tunnel') {
      const words = (sp.dataset.words || '').split('|');
      stage.innerHTML = `<div class="tunnel-floor"></div><div class="tunnel">${words.map((w) => `<div class="frame"><span>${esc(w)}</span></div>`).join('')}</div>`;
    }
    if (kind === 'ring') {
      const suits = ['♠', '♥', '♦', '♣'];
      stage.innerHTML = `<div class="ring-shadow"></div><div class="ring-stage">${Array.from({ length: 8 }, (_, i) => `
        <div class="ring-card" style="--i:${i}">
          <div class="front">${S.card('', suits[i % 4], '', { red: i % 2 === 1 })}</div>
          <div class="back"><span>♠♥♦♣</span></div>
        </div>`).join('')}</div>`;
    }
    if (kind === 'coin') {
      const edges = Array.from({ length: 17 }, (_, i) => `<div class="edge" style="--z:${(i - 8) * 1.75}px"></div>`).join('');
      stage.innerHTML = `<div class="coin-glow"></div><div class="coin">${edges}
        <div class="face front">${S.coinFace('THE FOUNDER MAFIA', 'TFM', { id: 'cfa' })}</div>
        <div class="face back">${S.coinFace('ON THE RECORD', '♠♥♦', { id: 'cfb' })}</div></div>`;
    }
    if (kind === 'cube') {
      const faces = [['♠', 'Story'], ['♥', 'Speed'], ['♦', 'Spine'], ['♣', 'Family'], ['TFM', 'Since 2026'], ['?', 'Your seat']];
      stage.innerHTML = `<div class="cube">${faces.map(([s, t], i) => `<div class="f${i + 1}"><span class="suit"${s.length > 1 || s === '?' ? ' style="font:900 calc(var(--s)*.24) var(--display)"' : ''}>${s}</span><b>${t}</b></div>`).join('')}</div>`;
    }
    // pointer leans the object a little
    if (!reduceMotion) {
      sp.addEventListener('pointermove', (e) => {
        sp.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        sp.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      }, { passive: true });
    }
  }

  const coins = spaces.filter((s) => s.dataset.space === 'coin');
  const tunnels = spaces.filter((s) => s.dataset.space === 'tunnel').map((sp) => ({ sp, frames: $$('.frame', sp), words: $$('.frame span', sp), count: $('.space-count', sp) }));

  function tick() {
    const vh = innerHeight;
    for (const sp of spaces) {
      const r = sp.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const p = reduceMotion ? 0.5 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      sp.style.setProperty('--p', p.toFixed(4));
      sp._p = p;
    }
    // coin: flips face → back → face, resting face-on between flips so it reads in full
    for (const sp of coins) {
      const turns = (sp._p ?? 0) * 2;
      const k = Math.min(1, Math.floor(turns));
      const f = Math.min(1, turns - k);
      const dwell = Math.min(1, Math.max(0, (f - 0.3) / 0.4)); // still for the first and last 30% of each half
      const e = dwell * dwell * (3 - 2 * dwell);
      sp.style.setProperty('--coin', `${((k + e) * 180).toFixed(2)}deg`);
    }
    for (const t of tunnels) {
      const p = t.sp._p ?? 0;
      const n = t.frames.length;
      const pos = p * (n - 0.35); // which frame is at the glass
      t.frames.forEach((f, i) => {
        const d = pos - i;           // <0: still ahead, 0: at the glass, >0: behind you
        const z = d * 900;
        const o = d > 0.55 ? Math.max(0, 1 - (d - 0.55) * 3) : Math.max(0, 1 + d * 0.32);
        f.style.transform = `translate3d(0,0,${z.toFixed(1)}px)`;
        f.style.opacity = o.toFixed(3);
        // only the frame at the glass shows its word; the rest are the corridor walls
        t.words[i].style.opacity = Math.max(0, 1 - Math.abs(d) * 2.2).toFixed(3);
        f.classList.toggle('is-front', Math.abs(d) < 0.45);
      });
      if (t.count) t.count.textContent = `${Math.min(n, Math.max(1, Math.round(pos) + 1))} / ${n}`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Page-to-page: the desk slides ────────────────────── */

function transitions() {
  if (reduceMotion) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    document.body.classList.remove('is-ready');
    setTimeout(() => { location.href = url.href; }, 380);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.add('is-ready'); });
}

// Start the loader first, then build each part of the page on its own:
// one part failing is logged and skipped, it never blocks the rest or the loader.
loader();
for (const [name, fn] of [
  ['chrome', chrome], ['spaces', mountSpaces], ['objects', mountObjects], ['home', mountHome],
  ['enter', mountEnter], ['team', mountTeam], ['community', mountCommunity], ['transitions', transitions], ['reveals', reveals],
]) {
  try { fn(); } catch (err) { console.error(`[tfm] ${name} failed`, err); }
}
