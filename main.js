import { links, applicationsOpen, season, table, tracks, episodes, meetups, faqs, lastUpdate } from './content.js';
import * as S from './stickers.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? encodeURI(u) : '');

/* ── Loader: "Opening the office" ─────────────────────── */

function loader() {
  const el = $('.loader');
  if (!el) { document.body.classList.add('is-ready'); return; }
  const pct = $('.loader-pct', el);
  const seen = (() => { try { return sessionStorage.getItem('tfm-open') === '1'; } catch { return false; } })();
  const total = reduceMotion || seen ? 250 : 1500;
  const t0 = performance.now();
  let fontsReady = false;
  (document.fonts?.ready || Promise.resolve()).then(() => { fontsReady = true; });
  function step(now) {
    let p = Math.min(1, (now - t0) / total);
    p = 1 - Math.pow(1 - p, 2.2);
    if (!fontsReady && p > 0.9) p = 0.9;
    const v = Math.round(p * 100);
    pct.textContent = `${v}%`;
    el.style.setProperty('--load', v);
    if (v < 100) requestAnimationFrame(step);
    else {
      try { sessionStorage.setItem('tfm-open', '1'); } catch {}
      setTimeout(() => document.body.classList.add('is-ready'), 120);
    }
  }
  requestAnimationFrame(step);
  setTimeout(() => document.body.classList.add('is-ready'), 4000); // never block the page
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

  const scrollStep = (dir = 1) => scrollBy({ top: dir * innerHeight * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
  $('.spacebar .round')?.addEventListener('click', () => scrollStep(1));
  $('.spacebar .pill')?.addEventListener('click', () => scrollStep(1));
  addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target.closest('input, textarea, select, button, a, summary, [contenteditable]')) return;
    e.preventDefault();
    scrollStep(e.shiftKey ? -1 : 1);
  });
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })));
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
    clip: S.paperclip, pin: S.pin, cigar: S.cigar,
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
      <div class="shot"><span class="tape" aria-hidden="true"></span>${S.lineup(esc(p.name), esc(p.role), i + 1)}</div>
      <figcaption>${esc(p.note)}</figcaption>
    </figure>`).join('');

  const host = $('#hostCard');
  if (host && table[0]) host.innerHTML = `<figure><div class="shot"><span class="tape" aria-hidden="true"></span>${S.lineup(esc(table[0].name), esc(table[0].role), 1)}</div></figure>`;

  const tv = $('#tv');
  if (tv) {
    const url = safeUrl(links.trailer);
    tv.outerHTML = url
      ? `<a class="tv" id="tv" href="${url}" target="_blank" rel="noopener" aria-label="Watch the trailer on YouTube">${S.tv()}</a>`
      : `<div class="tv" id="tv" role="img" aria-label="Trailer coming soon">${S.tv()}</div>`;
    const note = $('#tvNote');
    if (note) note.textContent = url ? 'Opens on YouTube.' : 'The trailer drops before the first episode.';
  }

  const tr = $('#tracks');
  if (tr) tr.innerHTML = Object.values(tracks).map((t, i) => `
    <article class="track">
      ${S.card(['A', 'K', 'Q'][i], t.suit, t.name.toUpperCase(), { red: t.suit === '♥' || t.suit === '♦' })}
      <div><p class="label">${esc(t.sub)}</p><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p></div>
    </article>`).join('');

  const tbody = $('#episodeRows');
  if (tbody) tbody.innerHTML = episodes.map((ep) => {
    const t = tracks[ep.track] || { suit: '', name: '' };
    const url = safeUrl(ep.url);
    return `<tr>
      <td class="no">${String(ep.number).padStart(2, '0')}</td>
      <td class="ttl">${esc(ep.title)}</td>
      <td>${esc(ep.guest)}</td>
      <td>${esc(ep.company)}</td>
      <td><span class="suit" aria-hidden="true">${t.suit}</span>${esc(t.name)}</td>
      <td>${url ? `<a class="pill" href="${url}" target="_blank" rel="noopener">Watch</a>` : '<span class="soon">Coming soon</span>'}</td>
    </tr>`;
  }).join('');

  const g = $('#glimpse');
  if (g) g.innerHTML = [['door', 'the door'], ['table', 'two mics, one table'], ['lamp', 'the lamp stays on'], ['cards', 'cards on the table']]
    .map(([s, c]) => `<figure class="polaroid" style="margin:0">${S.polaroid(s, c)}</figure>`).join('');
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
    if (links.contactEmail) {
      const subject = `Guest pitch: ${d.name} (${d.company})`;
      const body = `Name: ${d.name}\nCompany: ${d.company}\nStage: ${d.stage}\nEmail: ${d.email}\n\nThe story I'd tell:\n${d.story}`;
      status.textContent = `Your email app should open with the pitch ready. If it doesn't, send it to ${links.contactEmail}.`;
      location.href = `mailto:${links.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      status.textContent = 'Pitch saved on this device. The pitch inbox opens soon — join the community to hear when.';
    }
  });

  const faq = $('#faq');
  if (faq) faq.innerHTML = faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
}

/* ── Community ────────────────────────────────────────── */

function mountCommunity() {
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
      const labels = [...episodes.map((e) => `EP ${String(e.number).padStart(2, '0')}`), 'HOST', 'GUEST', 'YOU?', 'NEXT'].slice(0, 8);
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
      stage.innerHTML = `<div class="ring-shadow"></div><div class="ring-stage">${labels.map((l, i) => `
        <div class="ring-card" style="--i:${i}">
          <div class="front">${S.card(ranks[i], suits[i % 4], l, { red: i % 2 === 1 })}</div>
          <div class="back"><span>TFM</span></div>
        </div>`).join('')}</div>`;
    }
    if (kind === 'coin') {
      const edges = Array.from({ length: 15 }, (_, i) => `<div class="edge" style="--z:${(i - 7) * 2}px"></div>`).join('');
      stage.innerHTML = `<div class="coin-glow"></div><div class="coin">${edges}
        <div class="face front">${S.seal('THE FOUNDER MAFIA', 'TFM')}</div>
        <div class="face back">${S.seal('ON THE RECORD', '♠♥♦')}</div></div>`;
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

chrome();
mountSpaces();
mountObjects();
mountHome();
mountEnter();
mountCommunity();
transitions();
loader();
