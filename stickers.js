// Desk objects and stickers for The Founder Mafia. All original SVG.
// Palette: burgundy #93032E, wine #7F011F, night #151515, sand #F5EBD0 (+ sand-deep #E6D6AE, brass #C9A24B for tiny details).

const C = { bur: '#93032E', wine: '#7F011F', night: '#151515', sand: '#F5EBD0', deep: '#E6D6AE', brass: '#C9A24B' };
const D = "font-family=\"Unbounded,sans-serif\" font-weight=\"900\"";
const M = "font-family=\"Archivo,sans-serif\" font-weight=\"700\"";

const circleText = (id, cx, cy, r) => `<path id="${id}" d="M${cx - r} ${cy}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0" fill="none"/>`;

/** A cigar standing upright, its band printed with the show's name. */
export function cigar() {
  return `<svg viewBox="0 0 120 640" aria-hidden="true">
    <defs>
      <linearGradient id="cg-body" x1="0" x2="1"><stop offset="0" stop-color="#3b2016"/><stop offset=".45" stop-color="#6b3b24"/><stop offset="1" stop-color="#2a150e"/></linearGradient>
    </defs>
    <path d="M30 70q0-40 30-46q30 6 30 46v520q0 22-30 24q-30-2-30-24z" fill="url(#cg-body)"/>
    <g stroke="#2a150e" stroke-opacity=".55" stroke-width="2" fill="none">
      <path d="M30 140l60 -26M30 220l60 -26M30 300l60 -26M30 380l60 -26M30 460l60 -26M30 540l60 -26"/>
    </g>
    <path d="M42 80v500" stroke="#9a6440" stroke-opacity=".5" stroke-width="3"/>
    <rect x="26" y="430" width="68" height="150" rx="6" fill="${C.bur}"/>
    <rect x="26" y="430" width="68" height="150" rx="6" fill="none" stroke="${C.brass}" stroke-width="2"/>
    <rect x="26" y="440" width="68" height="4" fill="${C.brass}"/><rect x="26" y="566" width="68" height="4" fill="${C.brass}"/>
    <text transform="translate(66 505) rotate(-90)" text-anchor="middle" ${D} font-size="13" letter-spacing="1" fill="${C.sand}">THE FOUNDER MAFIA</text>
    <path d="M36 600q24 18 48 0v6q0 18-24 20q-24-2-24-20z" fill="#d9cdb3"/>
    <ellipse cx="60" cy="28" rx="26" ry="10" fill="#8a8178"/>
    <circle cx="52" cy="26" r="4" fill="#b8ada0"/><circle cx="66" cy="30" r="3" fill="#6a625a"/>
    <path d="M60 14c-8-18 10-26 0-44c-10-18 8-26 0-46" fill="none" stroke="${C.night}" stroke-opacity=".18" stroke-width="5" stroke-linecap="round" class="st-smoke"/>
  </svg>`;
}

/** Wax seal with text around the rim. */
export function seal(top = 'THE FOUNDER MAFIA', centre = 'TFM') {
  return `<svg viewBox="0 0 220 220" aria-hidden="true">
    <defs>${circleText('sl-c', 110, 110, 74)}</defs>
    <path d="M110 6c18 2 22 14 38 18s30-2 40 12-2 26 4 42 18 22 14 40-16 18-20 34 6 28-6 40-26 4-40 12-16 24-34 24-22-12-38-16-30 4-40-10 2-26-6-40-20-20-18-38 16-20 20-36-4-30 8-42 26-2 40-10 18-28 38-28z" fill="${C.bur}"/>
    <circle cx="110" cy="110" r="88" fill="${C.wine}"/>
    <circle cx="110" cy="110" r="88" fill="none" stroke="#5a0016" stroke-width="3"/>
    <circle cx="110" cy="110" r="56" fill="none" stroke="#5a0016" stroke-width="3"/>
    <text ${M} font-size="15" letter-spacing="3.2" fill="${C.sand}"><textPath href="#sl-c" startOffset="0">${top} · ${top} ·</textPath></text>
    <text x="110" y="126" text-anchor="middle" ${D} font-size="34" letter-spacing="1" fill="${C.sand}">${centre}</text>
    <path d="M70 70q20-24 52-26" fill="none" stroke="#c84a64" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

/** Scalloped round badge, like a gold-star sticker. */
export function badge(lines, sub, { fill = C.night, ink = C.sand } = {}) {
  let d = '';
  const n = 22;
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? 92 : 100;
    d += `${i ? 'L' : 'M'}${(110 + Math.cos(a) * r).toFixed(1)} ${(110 + Math.sin(a) * r).toFixed(1)}`;
  }
  const ls = lines.map((l, i) => `<text x="110" y="${100 + (i - (lines.length - 1) / 2) * 38}" text-anchor="middle" ${D} font-size="26" fill="${ink}">${l}</text>`).join('');
  return `<svg viewBox="0 0 220 220" aria-hidden="true">
    <path d="${d}Z" fill="${fill}"/>
    <circle cx="110" cy="110" r="80" fill="none" stroke="${ink}" stroke-opacity=".5" stroke-dasharray="3 5" stroke-width="2"/>
    ${ls}
    <text x="110" y="${118 + (lines.length - 1) * 19 + 22}" text-anchor="middle" ${M} font-size="12" letter-spacing="1" fill="${ink}">${sub}</text>
  </svg>`;
}

/** Spiral-bound note paper with a typed line or two. */
export function note(title, lines) {
  const holes = Array.from({ length: 9 }, (_, i) => `<circle cx="${30 + i * 26}" cy="22" r="5" fill="${C.night}"/><path d="M${30 + i * 26} 22v-14" stroke="${C.night}" stroke-width="3" stroke-linecap="round"/>`).join('');
  const rules = Array.from({ length: 7 }, (_, i) => `<path d="M16 ${74 + i * 26}h248" stroke="${C.bur}" stroke-opacity=".18"/>`).join('');
  const txt = lines.map((l, i) => `<text x="24" y="${96 + i * 26}" ${M} font-size="15" fill="${C.night}">${l}</text>`).join('');
  return `<svg viewBox="0 0 280 270" aria-hidden="true">
    <path d="M6 30h268v228q-4 8-12 8H14q-8 0-8-8z" fill="${C.sand}"/>
    <path d="M6 30h268v228q-4 8-12 8H14q-8 0-8-8z" fill="none" stroke="${C.night}" stroke-opacity=".12"/>
    <path d="M44 30v236" stroke="${C.bur}" stroke-opacity=".45"/>
    ${rules}${holes}
    <text x="24" y="62" ${D} font-size="15" fill="${C.bur}">${title}</text>
    ${txt}
  </svg>`;
}

/** A playing card. */
export function card(rank, suit, label, { red = true } = {}) {
  const ink = red ? C.bur : C.night;
  return `<svg viewBox="0 0 180 252" aria-hidden="true">
    <rect x="2" y="2" width="176" height="248" rx="14" fill="${C.sand}" stroke="${C.night}" stroke-opacity=".2" stroke-width="2"/>
    <rect x="14" y="14" width="152" height="224" rx="8" fill="none" stroke="${ink}" stroke-opacity=".35"/>
    <text x="24" y="50" ${D} font-size="26" fill="${ink}">${rank}</text>
    <text x="24" y="78" font-size="26" fill="${ink}">${suit}</text>
    <g transform="rotate(180 90 126)"><text x="24" y="50" ${D} font-size="26" fill="${ink}">${rank}</text><text x="24" y="78" font-size="26" fill="${ink}">${suit}</text></g>
    <text x="90" y="146" text-anchor="middle" font-size="84" fill="${ink}">${suit}</text>
    <text x="90" y="194" text-anchor="middle" ${M} font-size="12" letter-spacing="2" fill="${C.night}">${label}</text>
  </svg>`;
}

/** Club matchbook, flap open. */
export function matchbook() {
  const heads = Array.from({ length: 8 }, (_, i) => `<rect x="${30 + i * 18}" y="30" width="10" height="70" rx="3" fill="${C.deep}"/><ellipse cx="${35 + i * 18}" cy="30" rx="7" ry="9" fill="${C.wine}"/>`).join('');
  return `<svg viewBox="0 0 220 300" aria-hidden="true">
    ${heads}
    <rect x="14" y="96" width="192" height="196" rx="8" fill="${C.night}"/>
    <rect x="14" y="250" width="192" height="42" rx="0" fill="#3a3a3a"/>
    <path d="M14 250h192" stroke="${C.sand}" stroke-opacity=".3"/>
    <rect x="28" y="110" width="164" height="128" rx="4" fill="none" stroke="${C.bur}" stroke-width="3"/>
    <text x="110" y="150" text-anchor="middle" ${M} font-size="11" letter-spacing="3" fill="${C.sand}">MEMBERS &amp; GUESTS</text>
    <text x="110" y="196" text-anchor="middle" ${D} font-size="36" fill="${C.bur}">TFM</text>
    <text x="110" y="224" text-anchor="middle" ${M} font-size="10" letter-spacing="2" fill="${C.sand}">CLOSE COVER BEFORE STRIKING</text>
  </svg>`;
}

/** Fedora, three-quarter view. */
export function fedora() {
  return `<svg viewBox="0 0 300 170" aria-hidden="true">
    <ellipse cx="150" cy="122" rx="140" ry="36" fill="${C.night}"/>
    <path d="M26 118q124-44 248 0" fill="none" stroke="#3a3a3a" stroke-width="3"/>
    <path d="M78 118q-8-76 28-92q26-12 44 6q18-18 44-6q36 16 28 92q-72-18-144 0z" fill="#262626"/>
    <path d="M150 32q-6 30 0 70" stroke="${C.night}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M80 96q70-16 140 0l2 22q-72-18-144 0z" fill="${C.bur}"/>
    <path d="M96 52q12-22 34-24" stroke="#4a4a4a" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`;
}

/** Admission ticket stub. */
export function ticket(top, big, bottom) {
  return `<svg viewBox="0 0 320 140" aria-hidden="true">
    <path d="M6 6h308v40a24 24 0 0 0 0 48v40H6V94a24 24 0 0 0 0-48z" fill="${C.bur}"/>
    <path d="M240 10v120" stroke="${C.sand}" stroke-opacity=".6" stroke-dasharray="4 6" stroke-width="2"/>
    <rect x="18" y="18" width="210" height="104" fill="none" stroke="${C.sand}" stroke-opacity=".5"/>
    <text x="123" y="44" text-anchor="middle" ${M} font-size="12" letter-spacing="3" fill="${C.sand}">${top}</text>
    <text x="123" y="88" text-anchor="middle" ${D} font-size="30" fill="${C.sand}">${big}</text>
    <text x="123" y="110" text-anchor="middle" ${M} font-size="11" letter-spacing="2" fill="${C.sand}">${bottom}</text>
    <text transform="translate(282 70) rotate(-90)" text-anchor="middle" ${M} font-size="13" letter-spacing="2" fill="${C.sand}">Nº 0001</text>
  </svg>`;
}

/** A centimetre ruler. */
export function ruler(cm = 15) {
  const w = cm * 40 + 40;
  let ticks = '';
  for (let i = 0; i <= cm * 10; i++) {
    const x = 20 + i * 4;
    const h = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10;
    ticks += `<path d="M${x} 6v${h}" stroke="${C.night}" stroke-width="${i % 10 ? 1 : 1.6}"/>`;
    if (i % 10 === 0) ticks += `<text x="${x}" y="48" text-anchor="middle" ${M} font-size="12" fill="${C.night}">${i / 10}</text>`;
  }
  return `<svg viewBox="0 0 ${w} 70" aria-hidden="true">
    <rect x="1" y="1" width="${w - 2}" height="68" rx="4" fill="${C.deep}" stroke="${C.night}" stroke-opacity=".25"/>
    ${ticks}
    <text x="${w - 20}" y="60" text-anchor="end" ${M} font-size="10" letter-spacing="2" fill="${C.bur}">TFM · MEASURE TWICE, RAISE ONCE</text>
  </svg>`;
}

/** Studio microphone sticker. */
export function mic() {
  return `<svg viewBox="0 0 160 260" aria-hidden="true">
    <rect x="42" y="10" width="76" height="130" rx="38" fill="${C.night}"/>
    <g stroke="#3a3a3a" stroke-width="3">${Array.from({ length: 7 }, (_, i) => `<path d="M50 ${36 + i * 14}h60"/>`).join('')}</g>
    <rect x="42" y="96" width="76" height="12" fill="${C.bur}"/>
    <path d="M24 100q0 64 56 64q56 0 56-64" fill="none" stroke="${C.night}" stroke-width="10" stroke-linecap="round"/>
    <rect x="74" y="164" width="12" height="60" fill="${C.night}"/>
    <rect x="40" y="222" width="80" height="16" rx="8" fill="${C.night}"/>
    <path d="M58 30q0-14 14-16" fill="none" stroke="#555" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

/** Rose, for the lapel. */
export function rose() {
  return `<svg viewBox="0 0 120 200" aria-hidden="true">
    <path d="M60 80q6 60-4 116" stroke="#2f4a2a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M58 130q-34-6-40-30q30 0 40 24zM62 154q30-10 40-34q-30 2-40 28z" fill="#3c5e35"/>
    <path d="M60 20q34 4 36 34q2 30-36 34q-38-4-36-34q2-30 36-34z" fill="${C.bur}"/>
    <path d="M60 30q18 4 20 22q0 18-20 22q-20-4-20-22q2-18 20-22z" fill="${C.wine}"/>
    <path d="M52 46q8-10 18-2q-2 12-12 10" fill="none" stroke="#c84a64" stroke-width="3"/>
  </svg>`;
}

/** Polaroid with a small scene inside. */
const SCENES = {
  table: `<rect width="200" height="170" fill="${C.night}"/><path d="M80 0h40l60 170H20z" fill="${C.sand}" opacity=".16"/>
    <ellipse cx="100" cy="132" rx="84" ry="18" fill="${C.wine}"/><rect x="96" y="132" width="8" height="38" fill="${C.wine}"/>
    <rect x="50" y="94" width="10" height="34" fill="${C.sand}" opacity=".85"/><rect x="140" y="94" width="10" height="34" fill="${C.sand}" opacity=".85"/>
    <rect x="44" y="84" width="22" height="16" rx="8" fill="${C.sand}"/><rect x="134" y="84" width="22" height="16" rx="8" fill="${C.sand}"/>
    <path d="M90 0v14M84 14h12l6 10H78z" fill="${C.sand}" stroke="${C.sand}"/>`,
  lamp: `<rect width="200" height="170" fill="${C.wine}"/><path d="M100 0v40" stroke="${C.night}" stroke-width="3"/>
    <path d="M70 40h60l20 34H50z" fill="${C.night}"/><ellipse cx="100" cy="74" rx="50" ry="7" fill="${C.sand}"/>
    <path d="M52 76h96l40 94H12z" fill="${C.sand}" opacity=".25"/>`,
  cards: `<rect width="200" height="170" fill="${C.bur}"/>
    <g transform="rotate(-14 100 100)"><rect x="58" y="44" width="54" height="78" rx="6" fill="${C.sand}"/><text x="85" y="94" text-anchor="middle" font-size="34" fill="${C.night}">♠</text></g>
    <g transform="rotate(8 100 100)"><rect x="88" y="40" width="54" height="78" rx="6" fill="${C.sand}"/><text x="115" y="90" text-anchor="middle" font-size="34" fill="${C.bur}">♥</text></g>
    <circle cx="44" cy="140" r="14" fill="${C.night}"/><circle cx="44" cy="140" r="9" fill="none" stroke="${C.sand}" stroke-dasharray="3 3"/>
    <circle cx="160" cy="146" r="14" fill="${C.night}"/><circle cx="160" cy="146" r="9" fill="none" stroke="${C.sand}" stroke-dasharray="3 3"/>`,
  door: `<rect width="200" height="170" fill="${C.night}"/><path d="M60 170V60a40 40 0 0 1 80 0v110z" fill="${C.sand}"/>
    <path d="M60 170V60a40 40 0 0 1 80 0v110z" fill="none" stroke="${C.bur}" stroke-width="6"/>
    <circle cx="100" cy="120" r="9" fill="${C.night}"/><path d="M84 170q16-40 32 0z" fill="${C.night}"/>
    <rect x="40" y="20" width="120" height="22" fill="${C.bur}"/><text x="100" y="37" text-anchor="middle" ${D} font-size="10" letter-spacing="1" fill="${C.sand}">THE FOUNDER MAFIA</text>`,
};
export function polaroid(scene, caption) {
  return `<svg viewBox="0 0 230 270" aria-hidden="true">
    <rect width="230" height="270" rx="3" fill="#fbf6ea"/>
    <svg x="15" y="15" width="200" height="170" viewBox="0 0 200 170">${SCENES[scene]}</svg>
    <text x="115" y="230" text-anchor="middle" font-family="Archivo,sans-serif" font-style="italic" font-size="19" fill="${C.night}">${caption}</text>
  </svg>`;
}

/** Mugshot-style placard for the "who you sit with" lineup. */
export function lineup(name, role, n) {
  const heights = Array.from({ length: 7 }, (_, i) => `<path d="M0 ${40 + i * 40}h${i % 2 ? 24 : 40}" stroke="${C.sand}" stroke-opacity=".5" stroke-width="2"/><text x="46" y="${45 + i * 40}" ${M} font-size="11" fill="${C.sand}" fill-opacity=".55">${7 - i}'</text>`).join('');
  const filled = !!name;
  return `<svg viewBox="0 0 300 360" role="img" aria-label="${filled ? name : 'Reserved seat'}, ${role}">
    <rect width="300" height="360" fill="${C.night}"/>
    <g>${heights}</g>
    <g transform="translate(150 0)" fill="${filled ? C.bur : '#2a2a2a'}">
      <ellipse cx="0" cy="134" rx="34" ry="40"/>
      <path d="M-82 360c4-96 40-124 82-128c42 4 78 32 82 128z"/>
      <rect x="-14" y="166" width="28" height="30"/>
      <ellipse cx="0" cy="104" rx="64" ry="12" fill="${C.night}"/>
      <path d="M-38 104q-4-48 16-58q12-6 22 4q10-10 22-4q20 10 16 58q-38-8-76 0z" fill="${C.night}"/>
      <path d="M-38 92q38-8 76 0l1 12q-38-8-78 0z" fill="${C.bur}"/>
    </g>
    ${filled ? '' : `<text x="150" y="150" text-anchor="middle" ${D} font-size="44" fill="${C.sand}" fill-opacity=".85">?</text>`}
    <rect x="40" y="262" width="220" height="74" fill="${C.sand}"/>
    <text x="150" y="292" text-anchor="middle" ${D} font-size="17" fill="${C.night}">${(name || 'Seat reserved').toUpperCase()}</text>
    <text x="150" y="318" text-anchor="middle" ${M} font-size="12" letter-spacing="2" fill="${C.bur}">${role.toUpperCase()} · TFM-${String(n).padStart(3, '0')}</text>
  </svg>`;
}

/** Old TV for the trailer. */
export function tv() {
  return `<svg viewBox="0 0 420 340" aria-hidden="true">
    <path d="M150 40l60 40 60-40" stroke="${C.night}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="10" y="80" width="400" height="240" rx="26" fill="${C.wine}"/>
    <rect x="10" y="80" width="400" height="240" rx="26" fill="none" stroke="${C.night}" stroke-width="4"/>
    <rect x="34" y="102" width="290" height="196" rx="30" fill="${C.night}"/>
    <rect x="50" y="116" width="258" height="168" rx="22" fill="#262626" class="tv-screen"/>
    <path d="M60 130q60-16 120-6" stroke="${C.sand}" stroke-opacity=".12" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="179" cy="200" r="36" fill="${C.bur}"/><path d="M168 182l30 18-30 18z" fill="${C.sand}"/>
    <circle cx="366" cy="140" r="20" fill="${C.night}"/><circle cx="366" cy="196" r="20" fill="${C.night}"/>
    <path d="M366 124v14M366 180v14" stroke="${C.sand}" stroke-width="3"/>
    <g fill="${C.night}">${Array.from({ length: 5 }, (_, i) => `<rect x="346" y="${236 + i * 10}" width="40" height="4" rx="2"/>`).join('')}</g>
    <rect x="70" y="320" width="20" height="16" fill="${C.night}"/><rect x="330" y="320" width="20" height="16" fill="${C.night}"/>
  </svg>`;
}

/** Paperclip. */
export function paperclip() {
  return `<svg viewBox="0 0 60 150" aria-hidden="true">
    <path d="M40 40V118a14 14 0 0 1-28 0V26a20 20 0 0 1 40 0v86a8 8 0 0 1-16 0V44" fill="none" stroke="${C.sand}" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 40V118a14 14 0 0 1-28 0V26a20 20 0 0 1 40 0v86" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" transform="translate(-1.5 -1)"/>
  </svg>`;
}

/** Push pin, seen from the side, tilted. */
export function pin(color = C.sand) {
  return `<svg viewBox="0 0 70 110" aria-hidden="true">
    <path d="M35 58l-14 46" stroke="${C.night}" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 12h42l-8 8v18l14 16H8l14-16V20z" fill="${color}"/>
    <path d="M14 12h42l-8 8v18l14 16H8l14-16V20z" fill="none" stroke="${C.night}" stroke-opacity=".25" stroke-width="1.5"/>
    <path d="M24 20v18" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

/** Oval sticker with text on the rim, like a cigar-box label. */
export function oval(big, top, bottom, { fill = C.night, ink = C.sand } = {}) {
  return `<svg viewBox="0 0 420 260" aria-hidden="true">
    <defs>
      <path id="ov-top" d="M70 150a140 100 0 0 1 280 0" fill="none"/>
      <path id="ov-bot" d="M58 120a152 104 0 0 0 304 0" fill="none"/>
    </defs>
    <ellipse cx="210" cy="130" rx="204" ry="124" fill="${fill}"/>
    <ellipse cx="210" cy="130" rx="186" ry="108" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="2"/>
    <text ${M} font-size="13" letter-spacing="2.5" fill="${ink}" text-anchor="middle"><textPath href="#ov-top" startOffset="50%">${top}</textPath></text>
    <text x="210" y="148" text-anchor="middle" ${D} font-size="50" fill="${ink}">${big}</text>
    <text ${M} font-size="13" letter-spacing="2.5" fill="${ink}" text-anchor="middle"><textPath href="#ov-bot" startOffset="50%">${bottom}</textPath></text>
  </svg>`;
}
