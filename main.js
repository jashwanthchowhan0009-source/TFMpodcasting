import { episodes, links, meetups } from './content.js';
import { renderDeck } from './deck.js';
import { heroLayers, donScene, seatCard } from './art.js';
import { watchScroll, embers, tilt, cityLife, stageDoor, reduceMotion } from './fx.js';

const page = document.body.dataset.page;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isSmall = () => window.innerWidth <= 760;

/* ════════════════════════════════════════════════════════════
   Shared chrome
   ════════════════════════════════════════════════════════════ */

const PLATFORMS = [
  ['youtube', 'YouTube'], ['spotify', 'Spotify'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'],
];

function platformLinks() {
  return PLATFORMS.filter(([k]) => links[k])
    .map(([k, label]) => `<a href="${encodeURI(links[k])}" target="_blank" rel="noopener">${label}</a>`)
    .join('');
}

function chrome() {
  // active nav item
  for (const a of $$('.topbar nav a')) {
    if (a.dataset.page === page) a.setAttribute('aria-current', 'page');
  }
  // mobile menu
  const btn = $('.menu-btn');
  const nav = $('.topbar nav');
  btn?.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  // topbar darkens once you leave the top
  const bar = $('.topbar');
  const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const html = platformLinks();
  $$('[data-platforms]').forEach((el) => {
    el.innerHTML = html ? `Listen on ${html}` : 'New episodes land on YouTube and Spotify.';
  });
  const foot = $('#footerLinks');
  if (foot) foot.innerHTML = html;
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  stageDoor();
  watchScroll();
}

/* ════════════════════════════════════════════════════════════
   Pieces
   ════════════════════════════════════════════════════════════ */

function mountHero() {
  const stage = $('#heroLayers');
  if (!stage) return;
  stage.innerHTML = heroLayers()
    .map((l) => `<div class="layer layer-${l.name}" style="--depth:${l.depth}">${l.svg}</div>`)
    .join('');
  // Phones: crop the street around the club door instead of the middle.
  const crop = () => {
    for (const svg of $$('svg', stage)) {
      const wide = stage.classList.contains('is-static') ? '640 0 960 900' : '0 0 1600 900';
      svg.setAttribute('viewBox', isSmall() ? (stage.classList.contains('is-static') ? '900 0 700 900' : '60 0 820 900') : wide);
    }
    // zoom toward the club door, wherever it lands on this screen
    const door = $('.layer-club svg path[d^="M380 860V680"]', stage);
    if (door) {
      const r = door.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      stage.style.setProperty('--ox', `${((r.left + r.width / 2 - s.left) / s.width) * 100}%`);
      stage.style.setProperty('--oy', `${((r.top + r.height * 0.6 - s.top) / s.height) * 100}%`);
    }
  };
  crop();
  window.addEventListener('resize', crop);
  cityLife(stage);
  embers($('#heroEmbers'), { count: 70, rise: 16, size: [0.8, 2.6], drift: 18 });
  // the neon catches, then the title arrives
  setTimeout(() => document.body.classList.remove('is-loading'), reduceMotion ? 0 : 900);
}

function mountDon() {
  const el = $('#donArt');
  if (!el) return;
  el.innerHTML = donScene();
  embers($('#donDust'), { count: 40, rise: 6, size: [0.6, 1.8], drift: 10 });
}

function mountSeat() {
  $$('[data-seat]').forEach((el) => {
    el.innerHTML = `<div class="seat-tilt">${seatCard()}<span class="seat-glare" aria-hidden="true"></span></div>`;
    tilt(el.querySelector('.seat-tilt'), 9);
  });
  $$('[data-embers]').forEach((c) => embers(c, { count: 55, rise: 22, size: [0.8, 3], drift: 16 }));
}

function mountDeck() {
  const mount = $('#deck');
  if (!mount) return;
  renderDeck({ episodes, mount, onTurn: () => window.dispatchEvent(new CustomEvent('tfm:nudge')) });
}

function mountForm() {
  const form = $('#pitchForm');
  if (!form) return;
  const status = $('#formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    for (const field of form.elements) {
      if (!field.name) continue;
      const ok = field.checkValidity() && field.value.trim() !== '';
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstBad) firstBad = field;
    }
    if (firstBad) {
      status.textContent = 'Fill in every field, with a valid email, to send your pitch.';
      firstBad.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    if (!links.contactEmail) {
      status.textContent = 'Guest pitches open soon. Join the community to hear first.';
      return;
    }
    const subject = `Guest pitch: ${d.name} (${d.company})`;
    const body = `Name: ${d.name}\nCompany: ${d.company}\nStage: ${d.stage || ''}\nEmail: ${d.email}\n\nThe story I'd tell:\n${d.story}`;
    window.location.href = `mailto:${links.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email app is opening with the pitch ready to send.';
  });
}

function mountCommunity() {
  $$('[data-channel]').forEach((el) => {
    const url = links[el.dataset.channel];
    const action = el.querySelector('.invite-action');
    if (url) {
      action.outerHTML = `<a class="btn btn-primary invite-action" href="${encodeURI(url)}" target="_blank" rel="noopener">${action.dataset.label}</a>`;
    } else {
      action.textContent = 'Opening soon';
    }
  });
  const list = $('#meetups');
  if (list) {
    list.innerHTML = meetups.length
      ? meetups.map((m) => `<li><p class="meet-when"></p><p class="meet-what"></p><p class="meet-where"></p></li>`).join('')
      : '<li><p class="meet-what">First meetup announced soon.</p></li>';
    meetups.forEach((m, i) => {
      const li = list.children[i];
      li.querySelector('.meet-when').textContent = m.when;
      li.querySelector('.meet-what').textContent = m.what;
      li.querySelector('.meet-where').textContent = m.where;
    });
  }
}

/* ════════════════════════════════════════════════════════════
   The 3D room, with camera shots per page
   ════════════════════════════════════════════════════════════ */

const SHOT = {
  wide: { pos: [0.2, 2.4, 5.7], look: [0, 1.15, 0] },
  side: { pos: [4.3, 1.55, 2.6], look: [0, 0.95, -0.15] },
  mic: { pos: [1.38, 1.1, 0.72], look: [0.52, 1.0, 0.06] },
  orbit: { pos: [-3.7, 2.05, 3.3], look: [0, 1.1, 0] },
  lamp: { pos: [-1.5, 1.0, 2.9], look: [0, 2.2, 0] },
};

async function mountRoom() {
  const canvas = $('#scene');
  const zones = $$('[data-room]');
  if (!canvas || !zones.length) return;
  const shots = zones.map((z) => SHOT[z.dataset.room]);
  // each shot is reached when its section's top is 65% down the screen
  const anchors = () => zones.map((z) => z.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.65);
  const { startRoom } = await import('./room.js');
  startRoom({ canvas, shots, anchors, zones });
}

/* ════════════════════════════════════════════════════════════ */

chrome();
mountHero();
mountDon();
mountSeat();
mountDeck();
mountForm();
mountCommunity();
watchScroll();
mountRoom();
if (!$('#heroLayers')) document.body.classList.remove('is-loading');
