import { links, applicationsOpen, season, table, tracks, episodes, meetups, faqs, lastUpdate, payment, company, team, booking } from './content.js?v=20261114c';
import * as S from './stickers.js?v=20261114c';

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
    '.channels > li', '.meetups > li', '.faq > details', '.look-for > li', '.split > *', '.join .wordmark-pill',
    '.foot-cta > *', '.foot-grid > *', '.foot-end', '.book-grid > *', '.av-card > *', '.av-points > li', '.ticket-card > div',
    '.about-grid > *', '.booth-copy > *', '.booth-form',
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
  }, { rootMargin: '0px 0px -3% 0px', threshold: 0.05 });
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
  $$('[data-contact]').forEach((el) => {
    el.innerHTML = links.contactEmail ? `<a href="mailto:${esc(links.contactEmail)}">${esc(links.contactEmail)}</a>` : '';
  });
  // "THE END" rises letter by letter when the footer arrives
  $$('.the-end-word').forEach((el) => {
    const small = el.querySelector('small');
    const word = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    el.innerHTML = `<span class="letters" aria-label="${esc(word)}">${[...word].map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</span> `;
    if (small) el.append(small);
  });

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

  const scrollStep = (dir = 1) => {
    const now = lenis ? lenis.targetScroll : scrollY;
    const stops = frameStops();
    const next = dir > 0 ? stops.find((y) => y > now + 6) : [...stops].reverse().find((y) => y < now - 6);
    goTo(next ?? (dir > 0 ? document.documentElement.scrollHeight : 0));
  };
  $('.spacebar .round')?.addEventListener('click', () => scrollStep(1));
  $('.spacebar .pill')?.addEventListener('click', () => scrollStep(1));
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, button, a, summary, [contenteditable]')) return;
    let dir = 0;
    if (e.code === 'Space') dir = e.shiftKey ? -1 : 1;
    else if (e.code === 'PageDown') dir = 1;
    else if (e.code === 'PageUp') dir = -1;
    if (!dir) return;
    e.preventDefault();
    scrollStep(dir);
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
  const faq = $('#faq');
  if (faq) faq.innerHTML = faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
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
  form.addEventListener('submit', async (e) => {
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
    status.textContent = 'Filing your dossier…';
    let id = '';
    try { const r = await sendToSheet({ type: 'pitch', ...d }); if (r.ok) id = r.id; } catch (err) { console.warn('[tfm] pitch not saved', err); }
    const pay = safeUrl(payment.razorpayLink);
    if (!pay) {
      status.textContent = id ? `Pitch received — reference ${id}. Payment opens soon; we’ll email you the link.` : 'Payments open soon. Your pitch is saved on this device — come back to complete it.';
      return;
    }
    // Hand over to Razorpay. Name, email and phone prefill the payment page where it supports it.
    const u = new URL(pay);
    if (d.name) u.searchParams.set('name', d.name);
    if (d.email) u.searchParams.set('email', d.email);
    if (id) u.searchParams.set('reference', id);
    status.textContent = 'Taking you to Razorpay to complete your entry…';
    setTimeout(() => { location.href = u.toString(); }, 350);
  });

  const fee = $('#feeNote');
  if (fee) {
    const amt = String(payment.amount || '').trim();
    fee.innerHTML = `<b>Note:</b> joining the Mafia carries ${amt ? `a fee of <b>${esc(amt)}</b>` : 'a one-time participation fee'}. When you send your pitch you'll go to Razorpay to pay securely.`;
  }


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
      stage.innerHTML = `<div class="tunnel-floor"></div><div class="tunnel">${words.map((w, i) => {
        const [title, line] = w.split('::');
        return `<div class="frame"><span><small>${String(i + 1).padStart(2, '0')}</small>${esc(title)}${line ? `<em>${esc(line)}</em>` : ''}</span></div>`;
      }).join('')}</div>`;
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
      stage.innerHTML = `<div class="coin-glow"></div><div class="coin-floor"></div><div class="coin">${edges}
        <div class="face front">${S.coinFace('THE FOUNDER MAFIA', 'TFM', { id: 'cfa' })}<i class="glass"></i><i class="sheen"></i></div>
        <div class="face back">${S.coinFace('ON THE RECORD', '♠♥♦', { id: 'cfb' })}<i class="glass"></i><i class="sheen"></i></div></div>`;
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
      const dwell = Math.min(1, Math.max(0, (f - 0.28) / 0.44)); // rests face-on at both ends of each half turn
      const e = dwell * dwell * dwell * (dwell * (dwell * 6 - 15) + 10); // smootherstep
      const target = (k + e) * 180;
      // the coin follows the scroll with a little inertia, so the turn never steps
      const now = performance.now();
      const dt = Math.min(0.1, (now - (sp._t || now)) / 1000); sp._t = now;
      // time-based easing (τ ≈ 0.11 s): the same feel at 30, 60 or 120 fps
      sp._a = sp._a == null || reduceMotion ? target : target + (sp._a - target) * Math.exp(-dt / 0.11);
      if (Math.abs(target - sp._a) < 0.05) sp._a = target;
      sp.style.setProperty('--coin', `${sp._a.toFixed(3)}deg`);
      // light sweeps across the face as it turns: -1 → 1 over each half turn
      const local = ((sp._a % 180) + 180) % 180;
      sp.style.setProperty('--sheen', (local / 90 - 1).toFixed(4));
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

/* ── Forms: seat bookings, community joins and guest pitches all land in the Google Sheet ── */

// "+91 88970 04533" → "8897004533". Indian numbers become 10 digits; others keep their digits.
function normalizeMobile(v) {
  let digits = String(v || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length >= 8 && digits.length <= 15 ? digits : '';
}

const priceText = () => `₹${Number(booking.price || 0).toLocaleString('en-IN')}`;

async function sendToSheet(payload, route = '') {
  const base = safeUrl(booking.endpoint);
  if (!base) return { ok: false, offline: true };
  const endpoint = route ? `${base.replace(/\/+$/, '')}/${route}` : base;
  // text/plain keeps this a "simple" request: no CORS preflight, which Apps Script can't answer
  const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
  return res.json();
}

function validate(form) {
  let firstBad = null;
  for (const f of form.elements) {
    if (!f.name || f.closest('.hp')) continue;
    const ok = f.checkValidity() && (!f.required || f.value.trim() !== '');
    f.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok && !firstBad) firstBad = f;
  }
  return firstBad;
}

function mountForms() {
  $$('[data-price]').forEach((el) => { el.textContent = Number(booking.price || 0).toLocaleString('en-IN'); });
  $$('[data-booking]').forEach((el) => { const v = booking[el.dataset.booking]; if (v) el.textContent = v; });

  // seats left, when a capacity is set and the sheet is connected
  const left = $('.seats-left');
  if (left && booking.capacity > 0 && safeUrl(booking.endpoint)) {
    fetch(safeUrl(booking.endpoint)).then((r) => r.json()).then((d) => {
      if (!d?.ok) return;
      $('[data-seats-left]', left).textContent = `${Math.max(0, booking.capacity - d.booked)} of ${booking.capacity}`;
      left.hidden = false;
    }).catch(() => {});
  }

  for (const form of $$('form[data-type]')) {
    const type = form.dataset.type;
    const card = form.parentElement;
    const status = $('.form-status', form);
    const button = $('button[type="submit"]', form);
    const key = `tfm-${type}`;
    // details typed earlier on this device come back, so nobody types twice
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) for (const [k, v] of Object.entries(saved)) if (form.elements[k] && !form.elements[k].value) form.elements[k].value = v;
    } catch {}

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = validate(form);
      if (bad) { status.textContent = 'Fill in your name, age, email and a valid mobile number.'; bad.focus(); return; }
      const d = Object.fromEntries(new FormData(form));
      d.mobile = normalizeMobile(d.mobile);
      if (!d.mobile) { status.textContent = 'Enter a valid mobile number.'; form.elements.mobile?.focus(); return; }
      try { const { website, ...keep } = d; localStorage.setItem(key, JSON.stringify(keep)); } catch {}
      button.disabled = true;
      button.classList.add('is-busy');
      status.textContent = type === 'join' ? 'Opening the door…' : 'Holding your seat…';
      try {
        const r = await sendToSheet({ type, ...d, page: location.pathname });
        if (r.offline) {
          status.textContent = type === 'join'
            ? 'Joining opens in a few days. Your details are kept on this device, so it’s one tap when we go live.'
            : 'Seat booking opens in a few days. Your details are kept on this device, so it’s one tap when we go live.';
          button.disabled = false;
          button.classList.remove('is-busy');
          return;
        }
        if (!r.ok) throw new Error(r.error || 'Could not save');
        const done = $('.booked', card);
        $$('[data-out="name"]', done).forEach((el) => { el.textContent = d.name.split(/\s+/)[0]; });
        $$('[data-out="id"]', done).forEach((el) => { el.textContent = r.id; });
        form.hidden = true;
        done.hidden = false;
        requestAnimationFrame(() => done.classList.add('is-in'));
        done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        if (type === 'booking') {
          try { localStorage.setItem('tfm-seat', JSON.stringify({ id: r.id, name: d.name.split(/\s+/)[0] })); } catch {}
          seatState(card, 'held');
          startPayment(card, r.id);
        }
      } catch (err) {
        console.warn('[tfm] form', err);
        status.textContent = String(err.message || '').startsWith('Please') ? err.message : 'Couldn’t reach the booking desk. Check your connection and try again.';
        button.disabled = false;
        button.classList.remove('is-busy');
      }
    });
  }
}

/* ── Razorpay Checkout: hold the seat → pay ₹199 → verified on the server → confirmed ── */

let checkoutLoading = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  checkoutLoading ??= new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = 'https://checkout.razorpay.com/v1/checkout.js';
    tag.async = true;
    tag.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('checkout missing')));
    tag.onerror = () => { checkoutLoading = null; tag.remove(); reject(new Error('checkout blocked')); };
    document.head.append(tag);
  });
  return checkoutLoading;
}

// One place that paints every step of the booking card.
function seatState(card, state, info = {}) {
  const done = $('.booked', card);
  if (!done) return;
  const label = $('[data-out="state"]', done);
  const head = $('[data-out="headline"]', done);
  const payState = $('#payState', done);
  const confirmState = $('#confirmState', done);
  const row = $('#payRow', done);
  const steps = $$('.booked-steps li', done);
  const pills = $$('.book-steps li', card);
  const name = $('[data-out="name"]', done)?.textContent || '';
  const paid = state === 'paid';
  done.dataset.state = state;
  steps.forEach((li, i) => { li.classList.toggle('is-done', i === 0 || paid); li.classList.toggle('is-now', (i === 1 && !paid) || (i === 2 && paid)); });
  pills.forEach((li, i) => { li.classList.toggle('is-done', i === 0 || (paid && i === 1)); li.classList.toggle('is-now', paid ? i === 2 : i === 1); });
  if (label) label.textContent = paid ? 'Seat confirmed' : 'Seat held';
  if (head) head.innerHTML = paid ? `Your seat is confirmed, <span data-out="name">${esc(name)}</span>.` : `You’re on the list, <span data-out="name">${esc(name)}</span>.`;
  const button = (text, busy = false) => `<button class="pill is-solid btn pay-btn${busy ? ' is-busy' : ''}" type="button" data-pay ${busy ? 'disabled' : ''}>${text}</button>`;
  const msg = {
    held: ['Opening secure payment…', button('Opening payment…', true)],
    opening: ['Opening secure payment…', button('Opening payment…', true)],
    open: ['Finish the payment in the Razorpay window.', button('Payment window open…', true)],
    verifying: ['Confirming your payment…', button('Confirming…', true)],
    dismissed: ['Payment not completed. Your seat is still held — pay to confirm it.', button(`Pay ${priceText()} to confirm`)],
    failed: [info.message || 'The payment didn’t go through. Try again, or pick another method.', button(`Try again · ${priceText()}`)],
    blocked: ['The payment window couldn’t load. Turn off any ad-blocker for this site and try again.', button(`Pay ${priceText()} to confirm`)],
    error: [info.message || 'We couldn’t start the payment. Please try again.', button(`Pay ${priceText()} to confirm`)],
    pending: [info.message || 'We couldn’t confirm the payment yet. If money was deducted, it’s recorded automatically within 10 minutes — keep your booking ID.', button('Check again')],
    paid: [`Paid ${priceText()} · ${info.paymentId ? `Payment ID ${esc(info.paymentId)}` : 'confirmed'}`, ''],
    offline: ['Online payment opens in a few days. Your seat is held — we’ll email you the payment link.', ''],
  }[state];
  if (payState) payState.textContent = msg[0];
  if (row) row.innerHTML = msg[1];
  if (confirmState && paid) confirmState.textContent = 'We’ll email the date and venue before recording night.';
}

async function startPayment(card, bookingId) {
  const done = $('.booked', card);
  if (!safeUrl(booking.endpoint)) { seatState(card, 'offline'); return; }
  done.onclick = (e) => { if (e.target.closest('[data-pay]')) startPayment(card, bookingId); };
  seatState(card, 'opening');
  let order;
  try {
    const [Razorpay, created] = await Promise.all([loadCheckout().catch(() => null), sendToSheet({ booking_id: bookingId }, 'create-order')]);
    if (created.paid) { seatState(card, 'paid'); showTicket(card, { id: bookingId, name: $('[data-out="name"]', done)?.textContent }); forgetSeat(); return; }
    if (!created.ok) throw new Error(created.error || 'Could not start the payment.');
    if (!Razorpay) { seatState(card, 'blocked'); return; }
    order = created;
    const rzp = new Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'The Founder Mafia',
      description: `Live recording seat · ${bookingId}`,
      image: new URL('img/tfm-logo.png', location.href).href,
      prefill: order.prefill,
      notes: { booking_id: bookingId },
      theme: { color: '#93032e' },
      retry: { enabled: true },
      hidden: { contact: true, email: true },
      readonly: { contact: true, email: true },
      // Phones open the buyer's UPI app (GPay, PhonePe, Paytm…) with the QR as a fallback; computers show the QR only.
      config: {
        display: isPhone()
          ? {
            blocks: {
              apps: { name: 'Pay with your UPI app', instruments: [{ method: 'upi', flows: ['intent'] }] },
              qr: { name: 'Or scan the UPI QR', instruments: [{ method: 'upi', flows: ['qr'] }] },
            },
            sequence: ['block.apps', 'block.qr'],
            preferences: { show_default_blocks: false },
          }
          : {
            blocks: { qr: { name: 'Scan & pay with any UPI app', instruments: [{ method: 'upi', flows: ['qr'] }] } },
            sequence: ['block.qr'],
            preferences: { show_default_blocks: false },
          },
      },
      modal: { confirm_close: true, ondismiss: () => { if (done.dataset.state === 'open') seatState(card, 'dismissed'); } },
      handler: async (resp) => {
        seatState(card, 'verifying');
        try {
          const v = await sendToSheet({ booking_id: bookingId, ...resp }, 'verify-payment');
          if (v.ok) {
            seatState(card, 'paid', { paymentId: v.payment_id });
            showTicket(card, { id: bookingId, name: order.prefill?.name || $('[data-out="name"]', done)?.textContent, paymentId: v.payment_id, paidAt: new Date().toISOString() });
            forgetSeat();
          }
          else seatState(card, 'pending', { message: v.error ? `${v.error} If money was deducted, it’s recorded automatically within 10 minutes.` : undefined });
        } catch { seatState(card, 'pending'); }
      },
    });
    rzp.on('payment.failed', (resp) => {
      const why = resp?.error?.description;
      seatState(card, 'failed', { message: why ? `Payment failed: ${why}` : undefined });
    });
    seatState(card, 'open');
    rzp.open();
  } catch (err) {
    console.warn('[tfm] payment', err);
    const m = String(err?.message || '');
    // An old deployment of the backend answers /create-order like a form save ("Please fill in…")
    const message = /^Please fill in/.test(m) ? 'Online payment is being switched on. Your seat is held — please try again in a little while.'
      : err instanceof TypeError ? 'Couldn’t reach the payment desk. Check your connection and try again.'
      : /^(This|Booking|Could|Payment)/.test(m) ? m : undefined;
    seatState(card, 'error', { message });
  }
}

/* ── The ticket: issued on payment, made to be screenshotted (and saved as an image) ── */

function ticketData(t) {
  const when = t.paidAt ? new Date(t.paidAt) : new Date();
  return {
    name: (t.name || '').trim() || 'Founder',
    id: t.id,
    paymentId: t.paymentId || '',
    issued: when.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    event: booking.event || 'Live recording',
    date: booking.date || 'To be announced',
    venue: booking.venue || 'To be announced',
    price: priceText(),
  };
}

function showTicket(card, t) {
  const d = ticketData(t);
  try { localStorage.setItem('tfm-ticket', JSON.stringify(t)); } catch {}
  $$('.book-steps li', card).forEach((li) => { li.className = 'is-done'; });
  const done = $('.booked', card);
  if (done) done.hidden = true;
  $('#bookForm', card).hidden = true;
  $('.e-ticket-wrap', card)?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'e-ticket-wrap';
  wrap.innerHTML = `
    <p class="ticket-note"><b>Your seat is confirmed.</b> Take a screenshot of this ticket — show it at the door.</p>
    <article class="e-ticket" aria-label="Your ticket">
      <div class="e-ticket-main">
        <header><img src="img/tfm-logo.png" alt="" width="44" height="43"><div><b>The Founder Mafia</b><span>Admit one founder</span></div></header>
        <p class="e-ticket-event">${esc(d.event)}</p>
        <p class="e-ticket-name">${esc(d.name)}</p>
        <dl>
          <div><dt>Booking ID</dt><dd>${esc(d.id)}</dd></div>
          <div><dt>Paid</dt><dd>${esc(d.price)}</dd></div>
          <div><dt>Date</dt><dd>${esc(d.date)}</dd></div>
          <div><dt>Venue</dt><dd>${esc(d.venue)}</dd></div>
          ${d.paymentId ? `<div class="wide"><dt>Payment ID</dt><dd>${esc(d.paymentId)}</dd></div>` : ''}
          <div class="wide"><dt>Issued</dt><dd>${esc(d.issued)}</dd></div>
        </dl>
        <span class="e-ticket-stamp">Confirmed</span>
      </div>
      <div class="e-ticket-stub" aria-hidden="true"><span>${esc(d.id)}</span><b>Seat</b></div>
    </article>
    <div class="pill-row ticket-actions">
      <button class="pill is-solid btn pay-btn" type="button" data-save-ticket>Save ticket as image</button>
      <button class="linkish" type="button" data-new-seat>Book another seat</button>
    </div>
    <p class="ticket-fine">We’ll email the date and venue before recording night. Keep your booking ID.</p>`;
  card.append(wrap);
  $('[data-save-ticket]', wrap).onclick = () => saveTicket(d);
  $('[data-new-seat]', wrap).onclick = () => {
    try { localStorage.removeItem('tfm-ticket'); } catch {}
    wrap.remove();
    const form = $('#bookForm', card);
    form.hidden = false; form.reset();
    $$('button[type="submit"]', form).forEach((b) => { b.disabled = false; b.classList.remove('is-busy'); });
    $('.form-status', form).textContent = '';
    $$('.book-steps li', card).forEach((li, i) => { li.className = i === 0 ? 'is-now' : ''; });
  };
  requestAnimationFrame(() => wrap.classList.add('is-in'));
  wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
}

// Draws the ticket on a canvas (1080 × 1500) so it saves to the phone's gallery.
async function saveTicket(d) {
  try { await document.fonts.ready; } catch {}
  const W = 1080, H = 1600, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#7f011f'); bg.addColorStop(1, '#3d0010');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // paper ticket
  const x = 70, y = 110, w = W - 140, h = H - 220, r = 36;
  g.fillStyle = '#f5ebd0';
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
  const rows = [['BOOKING ID', d.id], ['PAID', d.price], ['DATE', d.date], ['VENUE', d.venue]];
  if (d.paymentId) rows.push(['PAYMENT ID', d.paymentId]);
  rows.push(['ISSUED', d.issued]);
  // perforation notches, below the last row
  g.fillStyle = '#5c0117';
  const py = y + 500 + rows.length * 98 + 20;
  [[x, py], [x + w, py]].forEach(([cx, cy]) => { g.beginPath(); g.arc(cx, cy, 34, 0, Math.PI * 2); g.fill(); });
  g.strokeStyle = 'rgba(21,21,21,.35)'; g.setLineDash([16, 14]); g.lineWidth = 4;
  g.beginPath(); g.moveTo(x + 50, py); g.lineTo(x + w - 50, py); g.stroke(); g.setLineDash([]);
  const logo = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'img/tfm-logo.png'; });
  if (logo) g.drawImage(logo, x + 60, y + 60, 120, 117);
  const T = (text, tx, ty, font, color, align = 'left', spacing = 0) => { g.font = font; g.fillStyle = color; g.textAlign = align; if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`; g.fillText(text, tx, ty); };
  T('THE FOUNDER MAFIA', x + 210, y + 118, '800 44px Poppins, sans-serif', '#151515', 'left', 1);
  T('ADMIT ONE FOUNDER', x + 210, y + 162, '700 26px Poppins, sans-serif', '#93032e', 'left', 4);
  T(d.event.toUpperCase(), x + 60, y + 290, '700 30px Poppins, sans-serif', '#7f011f', 'left', 2);
  let size = 92; g.font = `900 ${size}px Poppins, sans-serif`;
  while (g.measureText(d.name.toUpperCase()).width > w - 120 && size > 48) { size -= 4; g.font = `900 ${size}px Poppins, sans-serif`; }
  T(d.name.toUpperCase(), x + 60, y + 400, `900 ${size}px Poppins, sans-serif`, '#93032e');
  rows.forEach(([k, v], i) => {
    const ry = y + 500 + i * 98;
    T(k, x + 60, ry, '700 24px Poppins, sans-serif', 'rgba(21,21,21,.55)', 'left', 3);
    T(v, x + 60, ry + 44, '700 36px Poppins, sans-serif', '#151515');
  });
  // stamp
  g.save(); g.translate(x + w - 220, y + 560); g.rotate(-0.2);
  g.strokeStyle = '#93032e'; g.lineWidth = 7; g.beginPath(); g.roundRect(-170, -56, 340, 112, 16); g.stroke();
  T('CONFIRMED', 0, 18, '900 54px Poppins, sans-serif', '#93032e', 'center', 4); g.restore();
  T('Show this ticket at the door.', W / 2, py + 100, '600 36px "Open Sans", sans-serif', '#151515', 'center');
  T('thefoundermafia.com', W / 2, py + 160, '700 28px Poppins, sans-serif', '#93032e', 'center', 2);
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `TFM-ticket-${d.id}.png`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

function isPhone() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (matchMedia('(pointer: coarse)').matches && innerWidth < 900);
}

function forgetSeat() { try { localStorage.removeItem('tfm-seat'); } catch {} }

// Came back later with a held, unpaid seat? Offer to finish paying for it.
function resumeSeat() {
  const card = $('#bookingCard');
  if (!card) return;
  let ticket = null;
  try { ticket = JSON.parse(localStorage.getItem('tfm-ticket') || 'null'); } catch {}
  if (ticket?.id) { showTicket(card, ticket); return; }
  if (!safeUrl(booking.endpoint)) return;
  let seat = null;
  try { seat = JSON.parse(localStorage.getItem('tfm-seat') || 'null'); } catch {}
  if (!seat?.id) return;
  const done = $('.booked', card);
  $$('[data-out="name"]', done).forEach((el) => { el.textContent = seat.name || ''; });
  $$('[data-out="id"]', done).forEach((el) => { el.textContent = seat.id; });
  $('#bookForm').hidden = true;
  done.hidden = false;
  done.classList.add('is-in');
  done.onclick = (e) => { if (e.target.closest('[data-pay]')) startPayment(card, seat.id); };
  seatState(card, 'dismissed');
  const another = document.createElement('button');
  another.type = 'button'; another.className = 'linkish'; another.textContent = 'Book a different seat';
  another.onclick = () => { forgetSeat(); done.hidden = true; $('#bookForm').hidden = false; $$('.book-steps li', card).forEach((li, i) => { li.className = i === 0 ? 'is-now' : ''; }); };
  done.append(another);
}

/* ── Cinema: full-bleed scenes that open like a shutter as you scroll through them ── */

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function mountCinema() {
  const scenes = $$('.cinema').map((sc) => {
    const line = $('.cinema-line', sc);
    if (line) {
      let i = 0;
      line.innerHTML = line.innerHTML.split(/(<br\s*\/?>)/i).map((part) => /^<br/i.test(part) ? part
        : part.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w"><span style="--i:${i++}">${w}</span></span>` : w)).join('')).join('');
    }
    return { sc, tc: $('.tc', sc), on: false };
  });
  if (!scenes.length) return;
  document.documentElement.classList.add('has-cinema');
  if (reduceMotion) { scenes.forEach(({ sc }) => { sc.classList.add('is-on'); sc.style.setProperty('--cp', 0.5); sc.style.setProperty('--bar', 10); }); return; }

  const fps = 24;
  function tick() {
    const vh = innerHeight;
    for (const s of scenes) {
      const r = s.sc.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
      // 0 when the scene's top reaches the bottom of the screen, 1 when its bottom leaves the top
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
      // shutter: closed → open to letterbox → closes again on the way out
      const open = smooth(0.12, 0.34, p) * (1 - smooth(0.84, 0.98, p));
      const bar = 50 - open * 39; // % of the frame each bar covers (50 = shut, 11 = 2.39:1-ish letterbox)
      s.sc.style.setProperty('--cp', p.toFixed(4));
      s.sc.style.setProperty('--bar', bar.toFixed(2));
      const on = p > 0.3 && p < 0.86;
      if (on !== s.on) { s.on = on; s.sc.classList.toggle('is-on', on); }
      if (s.tc) {
        const f = Math.floor(p * 40 * fps);
        const pad = (n) => String(n).padStart(2, '0');
        s.tc.textContent = `00:${pad(Math.floor(f / fps / 60))}:${pad(Math.floor(f / fps) % 60)}:${pad(f % fps)}`;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Chapters: every section is a named scene; the rail and the top pill say where you are ── */

function mountChapters() {
  const scenes = $$('[data-scene]');
  if (scenes.length < 2) return;
  const label = $('.progress-pill > span:not(.fill):not(.site)');
  const textNode = label && [...label.childNodes].find((n) => n.nodeType === 3);
  const rail = document.createElement('nav');
  rail.className = 'scene-rail';
  rail.setAttribute('aria-label', 'Scenes on this page');
  rail.innerHTML = `<ol>${scenes.map((sc, i) => `<li><button type="button" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(sc.dataset.scene)}</span></button></li>`).join('')}</ol>`;
  document.body.append(rail);
  const buttons = $$('button', rail);
  buttons.forEach((b) => b.addEventListener('click', () => goTo(scenes[+b.dataset.i].getBoundingClientRect().top + scrollY - 70)));

  let current = -1;
  function update() {
    const line = innerHeight * 0.382; // the golden line: a scene is "now" once its top passes it
    let idx = 0;
    scenes.forEach((sc, i) => { if (sc.getBoundingClientRect().top <= line) idx = i; });
    if (idx === current) return;
    current = idx;
    buttons.forEach((b, i) => { b.classList.toggle('is-now', i === idx); b.classList.toggle('is-past', i < idx); if (i === idx) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (textNode) textNode.textContent = `${String(idx + 1).padStart(2, '0')} · ${scenes[idx].dataset.scene} `;
    document.body.dataset.scene = idx;
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Frames: where each press of the spacebar lands ───── */

// Every section is one composed frame. 3D spaces and cinema scenes get the
// stops where their story reads best (each tunnel step, each coin face, the open shutter).
function frameStops() {
  const vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const stops = [0];
  const sections = $$('main > section, body > footer');
  for (const sec of sections) {
    const t = top(sec);
    const h = sec.offsetHeight;
    const run = Math.max(0, h - vh); // how far a sticky section scrolls while pinned
    if (sec.matches('.space')) {
      const kind = sec.dataset.space;
      let ps = [0.1, 0.9];
      if (kind === 'tunnel') {
        const n = (sec.dataset.words || '').split('|').length;
        ps = Array.from({ length: n }, (_, i) => Math.min(1, i / (n - 0.35)));
      } else if (kind === 'coin') ps = [0.06, 0.56, 1];
      else if (kind === 'ring') ps = [0.12, 0.6];
      else if (kind === 'cube') ps = [0.1, 0.5, 0.9];
      ps.forEach((p) => stops.push(t + p * run));
    } else if (sec.matches('.cinema')) {
      stops.push(t + vh * 0.5); // shutter fully open, words in
    } else {
      stops.push(t);
      // inner anchors, then anything taller than a screen pages through in steps
      $$('[data-stop]', sec).forEach((el) => stops.push(top(el) - 90));
      if (h > vh * 1.08) {
        for (let y = t + vh * 0.86; y < t + h - vh; y += vh * 0.86) stops.push(y);
        stops.push(t + h - vh);
      }
    }
  }
  return [...new Set(stops.map((y) => Math.round(Math.min(max, Math.max(0, y)))))]
    .sort((a, b) => a - b)
    .filter((y, i, arr) => i === 0 || y - arr[i - 1] > 40);
}

// Links to a section on this page glide there; arriving with #section in the URL lands on it.
function anchors() {
  const land = (hash, smooth) => {
    const el = hash && hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return false;
    const y = el.getBoundingClientRect().top + scrollY;
    if (smooth) goTo(y); else scrollTo({ top: y });
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    if (land(url.hash, true)) { e.preventDefault(); history.replaceState(null, '', url.hash); $('.topbar')?.classList.remove('is-open'); }
  });
  if (location.hash) {
    const go = () => land(location.hash, false);
    go(); addEventListener('load', go); setTimeout(go, 600);
  }
}

/* ── Page-to-page: the desk slides ────────────────────── */

function transitions() {
  if (reduceMotion) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || a.hasAttribute('download')) return;
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
  ['enter', mountEnter], ['team', mountTeam], ['community', mountCommunity], ['forms', mountForms], ['resume-seat', resumeSeat], ['cinema', mountCinema],
  ['chapters', mountChapters], ['anchors', anchors], ['transitions', transitions], ['reveals', reveals],
]) {
  try { fn(); } catch (err) { console.error(`[tfm] ${name} failed`, err); }
}
