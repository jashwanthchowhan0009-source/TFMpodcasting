// Original illustrations for The Founder Mafia, drawn as SVG so every piece can move.
// Palette: dusk wine, amber, brass, oxblood. All coordinates are in each SVG's viewBox.

const BRASS = '#c9a24b';

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const f = (n) => n.toFixed(1);

/* ════════════════════════════════════════════════════════════
   HERO — a city street at dusk, outside the club
   Five layers, back to front. Each is its own <svg> so it can
   parallax and zoom separately.
   ════════════════════════════════════════════════════════════ */

const VB = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"';

function heroSky() {
  const r = rand(5);
  let stars = '';
  for (let i = 0; i < 70; i++) {
    stars += `<circle cx="${f(r() * 1600)}" cy="${f(r() * 260)}" r="${f(0.6 + r() * 1.2)}" opacity="${f(0.25 + r() * 0.6)}"/>`;
  }
  const bird = (x, y, s) => `<path d="M${x} ${y}q${6 * s} ${-6 * s} ${12 * s} 0q${6 * s} ${-6 * s} ${12 * s} 0" />`;
  return `
  <svg ${VB} aria-hidden="true">
    <defs>
      <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1c0a24"/>
        <stop offset="0.3" stop-color="#4a1236"/>
        <stop offset="0.55" stop-color="#9c2f48"/>
        <stop offset="0.72" stop-color="#e06a4c"/>
        <stop offset="0.86" stop-color="#f7b36e"/>
        <stop offset="1" stop-color="#fbd38c"/>
      </linearGradient>
      <radialGradient id="hs-sun">
        <stop offset="0" stop-color="#fff4d2"/>
        <stop offset="0.45" stop-color="#ffd38a"/>
        <stop offset="0.75" stop-color="#ff9d5c" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ff7a50" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#hs-sky)"/>
    <g fill="#ffe9c9" class="hs-stars">${stars}</g>
    <circle cx="1080" cy="640" r="460" fill="url(#hs-sun)" opacity="0.55"/>
    <circle cx="1080" cy="640" r="150" fill="#ffe2a8"/>
    <circle cx="1080" cy="640" r="150" fill="url(#hs-sun)"/>
    <g class="hs-clouds">
      <g fill="#ff9a72" opacity="0.38">
        <rect x="120" y="402" width="520" height="16" rx="8"/>
        <rect x="260" y="426" width="380" height="10" rx="5"/>
        <rect x="860" y="470" width="640" height="18" rx="9"/>
        <rect x="980" y="498" width="420" height="10" rx="5"/>
      </g>
      <g fill="#7a2345" opacity="0.55">
        <rect x="-40" y="330" width="460" height="20" rx="10"/>
        <rect x="60" y="356" width="300" height="11" rx="6"/>
        <rect x="1180" y="300" width="520" height="22" rx="11"/>
        <rect x="1260" y="330" width="320" height="12" rx="6"/>
        <rect x="620" y="250" width="380" height="14" rx="7"/>
      </g>
      <g fill="#ffd6a0" opacity="0.5">
        <rect x="900" y="560" width="300" height="6" rx="3"/>
        <rect x="1150" y="590" width="220" height="5" rx="3"/>
      </g>
    </g>
    <g class="hs-birds" fill="none" stroke="#2a0a1c" stroke-width="2.2" stroke-linecap="round">
      ${bird(0, 0, 1)}${bird(30, 14, 0.8)}${bird(-26, 18, 0.75)}${bird(58, 30, 0.6)}${bird(-50, 36, 0.55)}
    </g>
  </svg>`;
}

function skyline(r, o) {
  let body = '';
  let win = '';
  let flick = '';
  let x = o.x0;
  while (x < o.x1) {
    const w = o.minW + r() * (o.maxW - o.minW);
    const h = o.minH + r() * (o.maxH - o.minH);
    const top = o.base - h;
    body += `<rect x="${f(x)}" y="${f(top)}" width="${f(w + 1)}" height="${f(h + 4)}"/>`;
    let roofY = top;
    let roofX = x;
    let roofW = w;
    if (o.deco && r() < 0.6) {
      const tiers = 1 + Math.floor(r() * 3);
      for (let t = 0; t < tiers; t++) {
        roofW *= 0.66;
        roofX = x + (w - roofW) / 2;
        const th = 12 + r() * 26;
        roofY -= th;
        body += `<rect x="${f(roofX)}" y="${f(roofY)}" width="${f(roofW)}" height="${f(th + 1)}"/>`;
      }
      if (r() < 0.45) {
        const cx = roofX + roofW / 2;
        body += `<path d="M${f(cx - 3)} ${f(roofY)}L${f(cx)} ${f(roofY - 30 - r() * 60)}L${f(cx + 3)} ${f(roofY)}Z"/>`;
      }
    }
    if (o.tanks && r() < 0.4 && w > 50) {
      const tx = x + 8 + r() * (w - 44);
      body += `<rect x="${f(tx + 3)}" y="${f(top - 16)}" width="2" height="16"/><rect x="${f(tx + 23)}" y="${f(top - 16)}" width="2" height="16"/>`
        + `<rect x="${f(tx)}" y="${f(top - 44)}" width="28" height="30" rx="2"/><path d="M${f(tx - 2)} ${f(top - 44)}L${f(tx + 14)} ${f(top - 58)}L${f(tx + 30)} ${f(top - 44)}Z"/>`;
      if (o.steam && r() < 0.6) o.vents.push([tx + 14, top - 60]);
    }
    for (let wy = top + 12; wy < o.base - 14; wy += o.rowH) {
      for (let wx = x + 6; wx < x + w - 8; wx += o.colW) {
        if (r() < o.winP) {
          if (o.flicker && r() < 0.12) flick += `<rect class="hs-win" x="${f(wx)}" y="${f(wy)}" width="${o.ww}" height="${o.wh}"/>`;
          else win += `M${f(wx)} ${f(wy)}h${o.ww}v${o.wh}h-${o.ww}z`;
        }
      }
    }
    x += w + (r() < 0.3 ? r() * 14 : -1);
  }
  return { body, win, flick };
}

function heroFar() {
  const r = rand(21);
  const s = skyline(r, { x0: -40, x1: 1660, base: 900, minH: 230, maxH: 430, minW: 44, maxW: 110, deco: true, winP: 0.07, rowH: 16, colW: 12, ww: 4, wh: 7 });
  return `
  <svg ${VB} aria-hidden="true">
    <defs>
      <linearGradient id="hf-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f28a5e" stop-opacity="0"/>
        <stop offset="1" stop-color="#f28a5e" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <g fill="#9a3a55">
      ${s.body}
      <rect x="1150" y="300" width="70" height="600"/>
      <rect x="1162" y="262" width="46" height="40"/><rect x="1172" y="232" width="26" height="32"/>
      <path d="M1180 232L1185 140L1190 232Z"/>
      <path d="M1162 262a23 23 0 0 1 46 0z"/>
    </g>
    <path d="${s.win}" fill="#ffd296" opacity="0.5"/>
    <rect y="620" width="1600" height="280" fill="url(#hf-haze)"/>
  </svg>`;
}

function heroMid() {
  const r = rand(77);
  const vents = [];
  const s = skyline(r, { x0: 760, x1: 1660, base: 900, minH: 150, maxH: 300, minW: 60, maxW: 140, deco: false, tanks: true, steam: true, vents, winP: 0.16, rowH: 22, colW: 16, ww: 7, wh: 11, flicker: true });
  const l = skyline(r, { x0: -60, x1: 160, base: 900, minH: 260, maxH: 380, minW: 70, maxW: 120, tanks: true, steam: true, vents, winP: 0.16, rowH: 22, colW: 16, ww: 7, wh: 11, flicker: true });
  const steam = vents.slice(0, 4).map(([x, y], i) => `
    <g class="hs-steam" style="--d:${i * 1.7}s">
      <path d="M${f(x)} ${f(y)}c-10 -18 12 -30 0 -50c-12 -20 10 -32 2 -54" fill="none" stroke="#ffd9c0" stroke-opacity="0.35" stroke-width="7" stroke-linecap="round"/>
    </g>`).join('');
  return `
  <svg ${VB} aria-hidden="true">
    <g fill="#4a1330">${s.body}${l.body}</g>
    <path d="${s.win}${l.win}" fill="#ffb766" opacity="0.82"/>
    <g fill="#ffcf86">${s.flick}${l.flick}</g>
    ${steam}
  </svg>`;
}

function heroClub() {
  // the club, its neighbour, the car and the street lamp
  let dentils = '';
  for (let x = 140; x < 712; x += 14) dentils += `<rect x="${x}" y="306" width="7" height="8"/>`;
  const arched = (x, y, lit, i) => {
    const d = `M${x} ${y + 84}V${y + 30}a30 30 0 0 1 60 0V${y + 84}z`;
    return `<path d="${d}" fill="${lit ? 'url(#hc-lit)' : '#1a0610'}"/>`
      + (lit && i === 2 ? `<g class="hc-shadow"><circle cx="${x + 30}" cy="${y + 46}" r="9" fill="#5a1d14"/><path d="M${x + 14} ${y + 84}q16 -28 32 0z" fill="#5a1d14"/></g>` : '')
      + (lit && i === 4 ? `<rect x="${x}" y="${y + 10}" width="14" height="74" fill="#6a1a26"/><rect x="${x + 46}" y="${y + 10}" width="14" height="74" fill="#6a1a26"/>` : '')
      + `<path d="${d}M${x + 30} ${y}V${y + 84}M${x} ${y + 50}H${x + 60}" fill="none" stroke="#7a4a2a" stroke-width="3"/>`
      + `<rect x="${x - 6}" y="${y + 84}" width="72" height="7" fill="#5a1e2c"/>`;
  };
  let windows = '';
  const litMap = [1, 0, 1, 1, 0, 1, 1, 0, 1, 1];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 5; i++) windows += arched(178 + i * 106, 340 + row * 108, litMap[row * 5 + i], row * 5 + i);
  }
  let scallops = '';
  for (let x = 160; x < 520; x += 24) scallops += `<circle cx="${x + 12}" cy="626" r="12" fill="${(x / 24) % 2 < 1 ? '#7a1f2e' : '#ead3a6'}"/>`;
  let stripes = '';
  for (let x = 160; x < 520; x += 24) stripes += `<rect x="${x}" y="588" width="12" height="38" fill="#ead3a6"/>`;
  let fire = '';
  for (const y of [470, 590, 710]) {
    fire += `<rect x="780" y="${y}" width="190" height="5"/><path d="M780 ${y}v-26M970 ${y}v-26M780 ${y - 26}h190" fill="none" stroke="#14040b" stroke-width="3"/>`;
    for (let x = 790; x < 970; x += 14) fire += `<rect x="${x}" y="${y - 26}" width="2" height="26"/>`;
  }
  fire += `<path d="M800 475L950 590M800 595L950 710" stroke="#14040b" stroke-width="5"/>`;
  return `
  <svg ${VB} aria-hidden="true">
    <defs>
      <pattern id="hc-brick" width="40" height="18" patternUnits="userSpaceOnUse">
        <rect width="40" height="18" fill="#3a1020"/>
        <path d="M0 .5H40M0 9.5H40M10 0V9M30 9V18" stroke="#250810" stroke-width="1.6"/>
      </pattern>
      <linearGradient id="hc-lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffd38a"/><stop offset="1" stop-color="#d4643a"/>
      </linearGradient>
      <linearGradient id="hc-door" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe3a8"/><stop offset="1" stop-color="#ff9e57"/>
      </linearGradient>
      <linearGradient id="hc-spill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffc77a" stop-opacity="0.6"/><stop offset="1" stop-color="#ffc77a" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="hc-rim" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stop-color="#ff8a5c" stop-opacity="0.35"/><stop offset="0.4" stop-color="#ff8a5c" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="hc-halo"><stop offset="0" stop-color="#ffe2a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
      <filter id="hc-neon" x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- neighbour on the right, with a fire escape -->
    <rect x="720" y="390" width="280" height="520" fill="#24101c"/>
    <rect x="712" y="380" width="296" height="14" fill="#3a1a26"/>
    <g fill="#1a0812">${[0, 1, 2, 3].map((i) => `<rect x="${745 + i * 64}" y="420" width="36" height="46"/><rect x="${745 + i * 64}" y="540" width="36" height="46"/><rect x="${745 + i * 64}" y="660" width="36" height="46"/>`).join('')}</g>
    <rect x="809" y="540" width="36" height="46" fill="url(#hc-lit)"/><rect x="937" y="420" width="36" height="46" fill="url(#hc-lit)" class="hs-win"/>
    <g fill="#14040b">${fire}</g>

    <!-- the club -->
    <rect x="140" y="300" width="580" height="610" fill="url(#hc-brick)"/>
    <rect x="140" y="300" width="580" height="610" fill="url(#hc-rim)"/>
    <rect x="128" y="284" width="604" height="22" fill="#5a1e2c"/>
    <rect x="128" y="280" width="604" height="5" fill="${BRASS}" opacity="0.7"/>
    <g fill="#4a1824">${dentils}</g>
    <text x="430" y="300" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="13" fill="${BRASS}">established for founders</text>
    ${windows}

    <!-- shopfront -->
    <rect x="166" y="640" width="180" height="170" fill="#ffb35c"/>
    <rect x="166" y="640" width="180" height="170" fill="url(#hc-lit)" opacity="0.7"/>
    <g fill="#3a120e" class="hc-bar">
      <circle cx="214" cy="732" r="13"/><path d="M190 792q24 -54 48 0z"/><ellipse cx="214" cy="719" rx="22" ry="4"/><path d="M200 719q14 -20 28 0z"/>
      <circle cx="290" cy="738" r="12"/><path d="M268 796q22 -50 44 0z"/>
    </g>
    <rect x="166" y="770" width="180" height="40" fill="#5a2414"/>
    <path d="M166 640h180v170h-180zM256 640v170" fill="none" stroke="#7a4a2a" stroke-width="4"/>
    <text x="256" y="676" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="15" fill="#6a2a10">Members &amp; guests</text>

    <!-- door -->
    <path d="M380 860V680a50 50 0 0 1 100 0V860z" fill="url(#hc-door)"/>
    <path d="M380 860V680a50 50 0 0 1 100 0V860z" fill="none" stroke="${BRASS}" stroke-width="4"/>
    <g fill="#5a2414" class="hc-doorman"><circle cx="452" cy="760" r="10"/><path d="M436 860q0 -84 16 -88q16 4 16 88z"/><ellipse cx="452" cy="750" rx="16" ry="3.5"/><path d="M443 750q9 -15 18 0z"/></g>
    <path d="M380 860h100l60 40H320z" fill="url(#hc-spill)"/>
    <rect x="370" y="856" width="120" height="8" fill="#5a1e2c"/>

    <!-- awning -->
    <rect x="160" y="588" width="360" height="38" fill="#7a1f2e"/>
    ${stripes}
    ${scallops}
    <rect x="156" y="582" width="368" height="8" fill="#4a1018"/>

    <!-- neon sign -->
    <rect x="186" y="532" width="478" height="44" rx="4" fill="#12040a" stroke="${BRASS}" stroke-width="2"/>
    <g font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="30" letter-spacing="4" filter="url(#hc-neon)">
      <text x="208" y="565" fill="#ffd9a0" class="hc-neon-a">THE FOUNDER</text>
      <text x="520" y="565" fill="#ff5a5f" class="hc-neon-b">MAFIA</text>
    </g>

    <!-- poster on the side wall -->
    <g transform="rotate(-3 610 712)">
      <rect x="560" y="650" width="104" height="132" fill="#e8d6b0"/>
      <path d="M664 650l-16 0l16 16z" fill="#c9b48c"/>
      <text x="612" y="676" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="19" fill="#5a1a22">FOUNDERS</text>
      <text x="612" y="697" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="19" fill="#5a1a22">WANTED</text>
      <ellipse cx="612" cy="728" rx="24" ry="5" fill="#2a0e12"/><path d="M598 728q2 -20 14 -20q12 0 14 20z" fill="#2a0e12"/>
      <rect x="578" y="746" width="68" height="3" fill="#5a1a22" opacity="0.5"/><rect x="584" y="754" width="56" height="3" fill="#5a1a22" opacity="0.5"/><rect x="590" y="762" width="44" height="3" fill="#5a1a22" opacity="0.5"/>
    </g>

    <!-- blade sign on the corner -->
    <path d="M720 430h40M720 520h40" stroke="#14040b" stroke-width="4"/>
    <rect x="748" y="420" width="44" height="130" rx="4" fill="#12040a" stroke="${BRASS}" stroke-width="2"/>
    <g font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="28" fill="#ff5a5f" text-anchor="middle" filter="url(#hc-neon)" class="hc-neon-c">
      <text x="770" y="458">T</text><text x="770" y="492">F</text><text x="770" y="526">M</text>
    </g>

    <!-- street lamp -->
    <g class="hc-lamp" transform="translate(110 96)">
      <circle cx="1000" cy="520" r="90" fill="url(#hc-halo)" class="hc-halo"/>
      <rect x="996" y="540" width="8" height="330" fill="#14040b"/>
      <rect x="986" y="860" width="28" height="14" fill="#14040b"/>
      <path d="M984 512h32l-6 34h-20z" fill="#ffe2a0"/>
      <path d="M980 512h40l-8 -14h-24z" fill="#14040b"/><rect x="996" y="490" width="8" height="10" fill="#14040b"/>
      <g class="hc-moths" fill="#ffe9c0"><circle cx="1000" cy="500" r="1.6"/><circle cx="1000" cy="500" r="1.3"/><circle cx="1000" cy="500" r="1.1"/></g>
    </g>

    <!-- 1930s sedan -->
    <g class="hc-car">
      <path d="M900 812l260 -40v80z" fill="#ffe8b0" opacity="0.14"/>
      <path d="M538 846V814q6 -20 40 -22l66 -3q20 -32 62 -38l92 -1q42 3 60 40l36 6q14 5 14 22v28z" fill="#1b0712"/>
      <path d="M668 790q16 -26 44 -30h46v30zM768 760h32q30 4 46 30h-78z" fill="#3a1a2a"/>
      <path d="M676 786q14 -20 36 -22h40v22z" fill="#ffb37a" opacity="0.35"/>
      <path d="M560 846q0 -40 42 -40q42 0 46 40zM800 846q4 -40 46 -40q40 0 44 40z" fill="#260a18"/>
      <path d="M560 822h338" stroke="${BRASS}" stroke-width="1.6" opacity="0.8"/>
      <path d="M644 790q22 -34 62 -38l92 -1q42 3 60 40" fill="none" stroke="#ff9a6a" stroke-opacity="0.45" stroke-width="2"/>
      <rect x="890" y="802" width="14" height="30" rx="3" fill="#2a1020"/><path d="M893 806v22M897 806v22M901 806v22" stroke="${BRASS}" stroke-width="1"/>
      <circle cx="896" cy="798" r="9" fill="#fff0c8"/><circle cx="896" cy="798" r="20" fill="url(#hc-halo)"/>
      ${[603, 845].map((cx) => `<circle cx="${cx}" cy="848" r="26" fill="#0b0306"/><circle cx="${cx}" cy="848" r="17" fill="none" stroke="#dccbb0" stroke-width="5"/><circle cx="${cx}" cy="848" r="7" fill="${BRASS}"/>`).join('')}
      <rect x="650" y="836" width="150" height="5" fill="#2a0e18"/>
    </g>

    <!-- string lights from the neighbour's roof, swaying -->
    <g class="hc-string">
      <path d="M1000 596Q1300 690 1640 600" fill="none" stroke="#14040b" stroke-width="2"/>
      ${Array.from({ length: 15 }, (_, i) => {
        const t = (i + 0.5) / 15;
        const x = (1 - t) * (1 - t) * 1000 + 2 * (1 - t) * t * 1300 + t * t * 1640;
        const y = (1 - t) * (1 - t) * 596 + 2 * (1 - t) * t * 690 + t * t * 600;
        return `<circle cx="${f(x)}" cy="${f(y + 8)}" r="14" fill="url(#hc-halo)" opacity="0.7"/><circle cx="${f(x)}" cy="${f(y + 8)}" r="4.5" fill="#ffe7b0" class="hc-bulb" style="--i:${i}"/>`;
      }).join('')}
    </g>
  </svg>`;
}

function heroFore() {
  return `
  <svg ${VB} aria-hidden="true">
    <defs>
      <linearGradient id="hf-street" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a0a16"/><stop offset="1" stop-color="#0e0307"/>
      </linearGradient>
      <radialGradient id="hf-match"><stop offset="0" stop-color="#fff0b8"/><stop offset="0.3" stop-color="#ffb24a" stop-opacity="0.8"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
      <filter id="hf-blur"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <rect y="862" width="1600" height="40" fill="url(#hf-street)"/>
    <rect y="860" width="1600" height="4" fill="#5a1e2c"/>
    <g filter="url(#hf-blur)" class="hf-puddles">
      <rect x="380" y="868" width="100" height="26" fill="#ffc77a" opacity="0.4"/>
      <rect x="208" y="868" width="160" height="14" fill="#ffd9a0" opacity="0.28"/>
      <rect x="520" y="868" width="60" height="18" fill="#ff5a5f" opacity="0.35"/>
      <rect x="980" y="866" width="40" height="30" fill="#ffe2a0" opacity="0.4"/>
      <rect x="1100" y="870" width="420" height="10" fill="#ff8a5c" opacity="0.25"/>
    </g>

    <!-- a man lighting a match under the lamp -->
    <g class="hf-man">
      <ellipse cx="1262" cy="884" rx="90" ry="8" fill="#0a0205" opacity="0.7"/>
      <path d="M1238 884l-4 -70h14l2 70zM1258 884l2 -70h14l-2 70z" fill="#0b0306"/>
      <path d="M1228 884h26v-8h-22zM1256 884h28l-4 -8h-24z" fill="#050102"/>
      <path d="M1222 650q36 -16 72 0l14 170q-50 14 -100 0z" fill="#120408"/>
      <path d="M1222 650l-6 52 22 -8zM1294 650l8 50 -24 -10z" fill="#1d0710"/>
      <rect x="1214" y="742" width="90" height="8" fill="#0a0205"/>
      <path d="M1210 820q50 14 100 0l4 10q-54 16 -108 0z" fill="#0e0306"/>
      <path d="M1222 656q-4 70 4 162" fill="none" stroke="#ff9a5c" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="1258" cy="624" r="15" fill="#0e0306"/>
      <path d="M1232 616q26 -6 52 0l-6 10h-40z" fill="#0b0205"/>
      <ellipse cx="1258" cy="610" rx="36" ry="6.5" fill="#0b0205"/>
      <path d="M1240 610q2 -26 18 -28q16 2 18 28z" fill="#0b0205"/>
      <path d="M1222 611q36 -9 72 0" fill="none" stroke="#ff9a5c" stroke-opacity="0.5" stroke-width="1.5"/>
      <path d="M1294 660q14 -6 6 -30l-10 -6" fill="none" stroke="#120408" stroke-width="12" stroke-linecap="round"/>
      <g class="hf-flame">
        <circle cx="1280" cy="626" r="30" fill="url(#hf-match)"/>
        <path d="M1280 628q-4 -6 0 -14q4 8 0 14z" fill="#fff4c8"/>
      </g>
    </g>

    <!-- newspaper caught in the wind -->
    <g class="hf-paper">
      <g transform="translate(0 0)">
        <rect x="-18" y="-12" width="36" height="24" fill="#e8d6b0"/>
        <path d="M-14 -6h28M-14 0h20M-14 6h24" stroke="#7a6a50" stroke-width="2"/>
      </g>
    </g>

    <!-- near building edge -->
    <rect x="1480" y="0" width="140" height="900" fill="#0e0307"/>
    <path d="M1480 0v900" stroke="#ff8a5c" stroke-opacity="0.25" stroke-width="2"/>
    <g fill="#0e0307">
      <rect x="1440" y="300" width="50" height="5"/><rect x="1440" y="520" width="50" height="5"/>
      <path d="M1440 300v-30M1440 520v-30M1440 270h50M1440 490h50" stroke="#0e0307" stroke-width="3"/>
    </g>
  </svg>`;
}

export const heroLayers = () => [
  { name: 'sky', depth: 0.1, svg: heroSky() },
  { name: 'far', depth: 0.25, svg: heroFar() },
  { name: 'mid', depth: 0.45, svg: heroMid() },
  { name: 'club', depth: 0.7, svg: heroClub() },
  { name: 'fore', depth: 1, svg: heroFore() },
];

/* ════════════════════════════════════════════════════════════
   THE DON — seated at his table, candles, cards, the lamp
   ════════════════════════════════════════════════════════════ */

function candle(x, base, h, w, i) {
  const top = base - h;
  return `
    <g class="ds-candle" style="--i:${i}">
      <circle cx="${x}" cy="${top - 14}" r="${w * 2.6}" fill="url(#ds-glow)" class="ds-candle-glow"/>
      <rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="3" fill="url(#ds-wax)"/>
      <path d="M${x - w / 2} ${top + 4}q${w * 0.2} 14 ${w * 0.3} 4q${w * 0.1} 18 ${w * 0.25} 6q${w * 0.2} 10 ${w * 0.45} -6V${top}H${x - w / 2}z" fill="#fff6e0"/>
      <ellipse cx="${x}" cy="${top + 1}" rx="${w / 2}" ry="3" fill="#f4e3c0"/>
      <path d="M${x} ${top}v-6" stroke="#2a1410" stroke-width="1.5"/>
      <g class="ds-flame"><path d="M${x} ${top - 32}q${w * 0.32} 14 ${w * 0.18} 24q-${w * 0.06} 6 -${w * 0.18} 2q-${w * 0.24} -8 0 -26z" fill="#ffcf6a"/><path d="M${x} ${top - 22}q5 8 2 14q-4 3 -5 -1q-1 -6 3 -13z" fill="#fff6d8"/></g>
      <path class="ds-wisp" d="M${x} ${top - 36}c-6 -14 8 -24 0 -40c-8 -16 6 -26 0 -42" fill="none" stroke="#e8d2c0" stroke-opacity="0.22" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
}

function card(rot, face, i) {
  return `
    <g transform="rotate(${rot} 535 790)" class="${face ? 'ds-card-face' : ''}">
      <rect x="499" y="650" width="72" height="104" rx="6" fill="${face ? 'url(#ds-gold)' : '#5a1a22'}" stroke="${face ? '#fff0c0' : BRASS}" stroke-width="1.6"/>
      ${face
        ? `<text x="535" y="710" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="24" fill="#3a1408">TFM</text><path d="M535 668l8 8-8 8-8-8z" fill="#3a1408"/>`
        : `<rect x="505" y="656" width="60" height="92" rx="3" fill="none" stroke="${BRASS}" stroke-opacity="0.6"/><path d="M535 680l18 22-18 22-18-22z" fill="none" stroke="${BRASS}" stroke-width="1.4"/>`}
    </g>`;
}

export function donScene() {
  let blinds = '';
  for (let i = 0; i < 9; i++) blinds += `<path d="M${-40 + i * 36} 60l${520 - i * 4} ${420}l20 -6l-${516 - i * 4} -418z"/>`;
  let slats = '';
  for (let y = 84; y < 300; y += 12) slats += `<rect x="44" y="${y}" width="172" height="4"/>`;
  const tick = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<rect x="-1" y="-27" width="2" height="5" transform="rotate(${(i * 30)})" />`; }).join('');
  let grain = '';
  const r = rand(9);
  for (let i = 0; i < 26; i++) {
    const y = 618 + r() * 170;
    grain += `<path d="M0 ${f(y)}C300 ${f(y + (r() - 0.5) * 14)} 700 ${f(y + (r() - 0.5) * 14)} 1000 ${f(y + (r() - 0.5) * 10)}" />`;
  }
  return `
  <svg class="don-art" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: a boss in a fedora at a candlelit table, laying down cards">
    <defs>
      <linearGradient id="ds-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e1020"/><stop offset="1" stop-color="#160610"/></linearGradient>
      <radialGradient id="ds-lamp" cx="56%" cy="18%" r="62%"><stop offset="0" stop-color="#ffc27a" stop-opacity="0.42"/><stop offset="0.5" stop-color="#c4553a" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <radialGradient id="ds-glow"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.8"/><stop offset="0.35" stop-color="#ff9c4a" stop-opacity="0.32"/><stop offset="1" stop-color="#ff7a3a" stop-opacity="0"/></radialGradient>
      <linearGradient id="ds-wax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c29a"/><stop offset="0.4" stop-color="#fbeed0"/><stop offset="1" stop-color="#b89a70"/></linearGradient>
      <linearGradient id="ds-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="0.5" stop-color="#e8bd5a"/><stop offset="1" stop-color="#b8862e"/></linearGradient>
      <linearGradient id="ds-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a878"/><stop offset="1" stop-color="#9a5a3c"/></linearGradient>
      <linearGradient id="ds-hand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b282"/><stop offset="1" stop-color="#b87050"/></linearGradient>
      <linearGradient id="ds-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a2c18"/><stop offset="1" stop-color="#2a0d08"/></linearGradient>
      <linearGradient id="ds-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd38a" stop-opacity="0.34"/><stop offset="1" stop-color="#ffd38a" stop-opacity="0"/></linearGradient>
      <linearGradient id="ds-city" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a1838"/><stop offset="1" stop-color="#e0704a"/></linearGradient>
      <pattern id="ds-pin" width="11" height="11" patternUnits="userSpaceOnUse"><rect width="11" height="11" fill="#1e1724"/><rect width="1" height="11" fill="#3e3448"/></pattern>
      <linearGradient id="ds-rimL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a5c" stop-opacity="0.38"/><stop offset="0.25" stop-color="#ff8a5c" stop-opacity="0"/></linearGradient>
    </defs>

    <g class="ds-wall">
      <rect width="1000" height="800" fill="url(#ds-wall)"/>
      <!-- window with blinds and the city glowing behind -->
      <rect x="30" y="66" width="200" height="246" fill="url(#ds-city)"/>
      <g fill="#3a1226" opacity="0.9">
        <rect x="40" y="200" width="30" height="112"/><rect x="72" y="170" width="40" height="142"/><rect x="116" y="220" width="26" height="92"/><rect x="146" y="150" width="34" height="162"/><rect x="184" y="210" width="40" height="102"/>
      </g>
      <g fill="#ffcf86">${[[50, 230], [84, 190], [96, 240], [154, 172], [162, 220], [196, 236], [80, 280]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="7"/>`).join('')}</g>
      <g fill="#1a0812">${slats}</g>
      <rect x="30" y="66" width="200" height="246" fill="none" stroke="#4a1e1a" stroke-width="10"/>
      <rect x="18" y="312" width="224" height="14" fill="#4a1e1a"/>
      <!-- the cat on the sill -->
      <g class="ds-cat" fill="#0a0306">
        <ellipse cx="168" cy="296" rx="22" ry="18"/>
        <circle cx="150" cy="270" r="12"/>
        <path d="M141 262l2 -12 7 8zM151 259l7 -10 3 12z"/>
        <path class="ds-tail" d="M188 306q30 4 24 -30q-2 -10 6 -14" fill="none" stroke="#0a0306" stroke-width="6" stroke-linecap="round"/>
        <circle cx="146" cy="270" r="1.6" fill="#ffcf5a" class="ds-cat-eye"/><circle cx="153" cy="270" r="1.6" fill="#ffcf5a" class="ds-cat-eye"/>
      </g>
      <g fill="#ffb86b" opacity="0.07">${blinds}</g>

      <!-- old boss portrait -->
      <rect x="296" y="120" width="96" height="120" fill="#120408" stroke="${BRASS}" stroke-width="5"/>
      <rect x="306" y="130" width="76" height="100" fill="#3a2a28"/>
      <g fill="#1a1010"><circle cx="344" cy="178" r="15"/><path d="M314 230q30 -50 60 0z"/><ellipse cx="344" cy="166" rx="24" ry="5"/><path d="M332 166q12 -22 24 0z"/></g>

      <!-- clock with a ticking second hand -->
      <g transform="translate(690 140)">
        <circle r="38" fill="#120408" stroke="${BRASS}" stroke-width="4"/>
        <circle r="32" fill="#e8d6b0"/>
        <g fill="#2a0e12">${tick}</g>
        <rect x="-1.5" y="-20" width="3" height="22" fill="#2a0e12" transform="rotate(-50)"/>
        <rect x="-1.2" y="-26" width="2.4" height="28" fill="#2a0e12" transform="rotate(60)"/>
        <g class="ds-second"><rect x="-0.6" y="-28" width="1.2" height="32" fill="#8f1d2c"/></g>
        <circle r="2.5" fill="${BRASS}"/>
      </g>

      <!-- gramophone on a cabinet -->
      <rect x="850" y="470" width="150" height="150" fill="#2a0d10"/>
      <rect x="842" y="462" width="166" height="12" fill="#4a1a14"/>
      <rect x="868" y="440" width="80" height="22" fill="#3a1410"/>
      <ellipse cx="908" cy="440" rx="40" ry="5" fill="#0a0305"/>
      <path d="M920 436l20 -60" stroke="${BRASS}" stroke-width="5"/>
      <path d="M936 384q-10 -80 60 -120q30 40 4 120z" fill="${BRASS}"/>
      <path d="M936 384q-10 -80 60 -120q14 20 10 56" fill="none" stroke="#fff0c0" stroke-opacity="0.5" stroke-width="2"/>
      <g class="ds-notes" fill="${BRASS}">
        <g style="--i:0"><circle cx="972" cy="250" r="5"/><rect x="976" y="226" width="2" height="24"/></g>
        <g style="--i:1"><circle cx="952" cy="244" r="5"/><rect x="956" y="220" width="2" height="24"/><rect x="956" y="220" width="12" height="3"/></g>
        <g style="--i:2"><circle cx="985" cy="240" r="4"/><rect x="988" y="220" width="2" height="20"/></g>
      </g>
      <rect width="1000" height="800" fill="url(#ds-lamp)"/>
    </g>

    <!-- hanging lamp -->
    <g class="ds-lamp">
      <path d="M560 0v96" stroke="#0a0305" stroke-width="3"/>
      <path d="M500 200L620 200L900 800L220 800Z" fill="url(#ds-beam)" class="ds-beam"/>
      <path d="M526 98h68l30 60h-128z" fill="${BRASS}"/>
      <path d="M526 98h68l30 60h-128z" fill="none" stroke="#fff0c0" stroke-opacity="0.4" stroke-width="2"/>
      <ellipse cx="560" cy="158" rx="64" ry="9" fill="#ffe7b0"/>
      <circle cx="560" cy="160" r="70" fill="url(#ds-glow)" opacity="0.75"/>
    </g>

    <!-- the Don -->
    <g class="ds-don">
      <g class="ds-breathe">
        <path d="M346 640q4 -150 70 -196q54 -30 144 -34q90 4 144 34q66 46 70 196z" fill="url(#ds-pin)"/>
        <path d="M346 640q4 -150 70 -196q54 -30 144 -34" fill="none" stroke="#ff8a5c" stroke-opacity="0.4" stroke-width="3"/>
        <path d="M346 640q4 -150 70 -196q54 -30 144 -34q90 4 144 34q66 46 70 196z" fill="url(#ds-rimL)"/>
        <path d="M520 410l-46 44 30 10 -18 20 70 120zM600 410l46 44 -30 10 18 20 -70 120z" fill="#120d16"/>
        <path d="M528 404h64l-32 92z" fill="#ead9c0"/>
        <path d="M552 412h16l-3 10 10 96 -15 18 -15 -18 10 -96z" fill="#8f1d2c"/>
        <path d="M554 412h12l-2 8h-8z" fill="#6a1220"/>
        <path d="M644 468l26 -6 2 16 -24 4z" fill="#f2e8d6"/>
        <g transform="translate(476 470)"><circle r="7" fill="#b3202e"/><circle r="3.5" fill="#d8404a"/><path d="M0 7l-3 12" stroke="#2a4a20" stroke-width="2"/></g>
        <circle cx="560" cy="540" r="3" fill="#0e0a10"/><circle cx="560" cy="572" r="3" fill="#0e0a10"/>

        <!-- head -->
        <rect x="536" y="346" width="48" height="66" rx="10" fill="#8f5236"/>
        <path d="M506 300q0 -52 54 -54q54 2 54 54q0 50 -24 74q-14 14 -30 14q-16 0 -30 -14q-24 -24 -24 -74z" fill="url(#ds-skin)"/>
        <path d="M506 300q-12 2 -10 20q2 18 14 18zM614 300q12 2 10 20q-2 18 -14 18z" fill="#b8754e"/>
        <path d="M508 288q-2 22 4 36l6 -40zM612 288q2 22 -4 36l-6 -40z" fill="#6a5a56"/>
        <path d="M520 360q40 30 80 0q-6 28 -40 30q-34 -2 -40 -30z" fill="#7a4428" opacity="0.4"/>
        <path d="M560 318q-6 16 -10 28q10 6 20 0" fill="none" stroke="#7a4428" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M536 360q24 -10 48 0q-10 8 -24 6q-14 2 -24 -6z" fill="#2a1510"/>
        <path d="M542 374q18 8 38 -2" fill="none" stroke="#5a2818" stroke-width="3" stroke-linecap="round"/>
        <path d="M506 290q54 -20 108 0v22q-54 -16 -108 0z" fill="#1a0e10" opacity="0.88"/>
        <g class="ds-eyes" fill="#ffcf7a"><ellipse cx="538" cy="306" rx="4" ry="2.2"/><ellipse cx="582" cy="306" rx="4" ry="2.2"/></g>

        <!-- fedora -->
        <ellipse cx="560" cy="272" rx="128" ry="22" fill="#151018"/>
        <path d="M434 270q126 -40 252 0" fill="none" stroke="#ff9a6a" stroke-opacity="0.35" stroke-width="2.5"/>
        <path d="M478 268q-6 -76 24 -92q30 -14 58 6q28 -20 58 -6q30 16 24 92q-82 -18 -164 0z" fill="#1d141f"/>
        <path d="M560 182q-6 30 0 66" fill="none" stroke="#0a0608" stroke-width="5" stroke-linecap="round"/>
        <path d="M480 246q80 -16 160 0l2 22q-82 -18 -164 0z" fill="#6a1a24"/>
        <path d="M488 214q10 -30 34 -38" fill="none" stroke="#ff9a6a" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>
      </g>

      <!-- arms and hands -->
      <path d="M416 452q-60 40 -66 170l68 10q8 -80 40 -120z" fill="url(#ds-pin)"/>
      <path d="M704 452q60 40 66 170l-68 10q-8 -80 -40 -120z" fill="url(#ds-pin)"/>
    </g>

    <!-- the table -->
    <g class="ds-table">
      <path d="M-20 612H1020V900H-20z" fill="url(#ds-wood)"/>
      <g fill="none" stroke="#1a0604" stroke-opacity="0.45" stroke-width="1.4">${grain}</g>
      <path d="M-20 612H1020" stroke="#ffb27a" stroke-opacity="0.45" stroke-width="3"/>
      <ellipse cx="560" cy="700" rx="380" ry="80" fill="#ffc27a" opacity="0.12"/>

      <!-- rotary phone -->
      <g transform="translate(70 640)">
        <path d="M-10 70q4 -46 60 -50q56 4 60 50z" fill="#120408"/>
        <circle cx="50" cy="52" r="22" fill="#2a0e12" stroke="${BRASS}" stroke-width="2"/>
        ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 1.6 + 0.7; return `<circle cx="${f(50 + Math.cos(a) * 14)}" cy="${f(52 + Math.sin(a) * 14)}" r="3" fill="#e8d6b0"/>`; }).join('')}
        <path d="M-4 18q54 -30 108 0q4 8 -8 10q-46 -18 -92 0q-12 -2 -8 -10z" fill="#1a060c"/>
        <path d="M8 14q42 -22 84 0" fill="none" stroke="#ff9a6a" stroke-opacity="0.4" stroke-width="2"/>
      </g>

      ${candle(222, 650, 120, 26, 0)}${candle(256, 660, 78, 22, 1)}${candle(196, 668, 56, 20, 2)}

      <!-- term sheet and fountain pen -->
      <g transform="rotate(-9 340 700)">
        <rect x="270" y="640" width="150" height="120" fill="#efe2c4"/>
        <text x="345" y="664" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="800" font-size="15" letter-spacing="2" fill="#3a1408">TERM SHEET</text>
        <g fill="#7a6a50" opacity="0.55">${[676, 686, 696, 706, 716, 726].map((y, i) => `<rect x="284" y="${y}" width="${i % 3 === 2 ? 70 : 122}" height="3"/>`).join('')}</g>
        <path d="M290 746q16 -10 30 0q10 6 24 -6" fill="none" stroke="#1a2a5a" stroke-width="2"/>
      </g>
      <g transform="rotate(-32 380 716)"><rect x="310" y="712" width="120" height="9" rx="4.5" fill="#0e0a10"/><rect x="398" y="711" width="14" height="11" fill="${BRASS}"/><path d="M430 716l16 -4v8z" fill="${BRASS}"/></g>

      <!-- cards fanned out -->
      <g class="ds-cards">${[-28, -14, 14, 28].map((a, i) => card(a, false, i)).join('')}${card(0, true, 9)}</g>
      <circle cx="535" cy="702" r="70" fill="url(#ds-glow)" class="ds-card-glow"/>

      <!-- forearms resting on the table -->
      <g class="ds-arms">
        <path d="M398 674q40 10 90 4l-4 8q-50 6 -92 -4z" fill="#0a070c" opacity="0.55"/>
        <path d="M402 612h70l26 30-18 34q-40 2 -82 -8z" fill="url(#ds-pin)"/>
        <path d="M402 612h70l26 30" fill="none" stroke="#ff8a5c" stroke-opacity="0.4" stroke-width="2.5"/>
        <path d="M718 612h-70l-26 30 18 34q40 2 82 -8z" fill="url(#ds-pin)"/>
        <!-- left hand: flat on the table, pinky ring -->
        <path d="M470 640l20 -8 10 36 -22 8z" fill="#f2e8d6"/>
        <circle cx="486" cy="662" r="2.6" fill="${BRASS}"/>
        <path d="M496 634q24 -10 48 -4q10 3 12 10q3 8 0 16q-2 9 -8 13q-22 8 -44 2z" fill="url(#ds-hand)"/>
        <path d="M498 634q10 -14 26 -10q4 6 -6 10" fill="url(#ds-hand)"/>
        <path d="M544 632q6 2 8 8M548 644q5 2 6 7M547 656q4 2 4 6" fill="none" stroke="#8a4a30" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M512 642q16 -4 30 0" fill="none" stroke="#c98a62" stroke-width="1.4" opacity="0.8"/>
        <rect x="532" y="660" width="11" height="6" rx="2.5" fill="${BRASS}" transform="rotate(-12 537 663)"/>
        <circle cx="540" cy="660" r="3" fill="#fff6d0" class="ds-glint"/>
        <!-- right hand: laying a card down -->
        <g transform="rotate(14 640 664)">
          <rect x="584" y="640" width="70" height="46" rx="5" fill="#5a1a22" stroke="${BRASS}" stroke-width="1.4"/>
          <path d="M594 646l50 0M594 680h50" stroke="${BRASS}" stroke-opacity="0.5"/>
        </g>
        <path d="M650 640l-20 -8 -10 36 22 8z" fill="#f2e8d6"/>
        <circle cx="634" cy="662" r="2.6" fill="${BRASS}"/>
        <path d="M624 634q-24 -10 -48 -4q-10 3 -12 10q-3 8 0 16q2 9 8 13q22 8 44 2z" fill="url(#ds-hand)"/>
        <path d="M576 632q-6 2 -8 8M572 644q-5 2 -6 7M573 656q-4 2 -4 6" fill="none" stroke="#8a4a30" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M608 642q-16 -4 -30 0" fill="none" stroke="#c98a62" stroke-width="1.4" opacity="0.8"/>
      </g>

      <!-- whiskey -->
      <g transform="translate(760 640)">
        <ellipse cx="22" cy="54" rx="26" ry="5" fill="#0a0305" opacity="0.5"/>
        <path d="M0 0h44l-4 54h-36z" fill="#ffffff" opacity="0.12"/>
        <path d="M2 24h40l-2 30h-36z" fill="#c26a1e" opacity="0.9"/>
        <rect x="10" y="18" width="14" height="13" rx="2" fill="#fff" opacity="0.35" transform="rotate(12 17 24)"/>
        <path d="M0 0h44l-4 54h-36z" fill="none" stroke="#fff0e0" stroke-opacity="0.5" stroke-width="1.5"/>
        <path d="M6 6v40" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      </g>

      ${candle(890, 660, 100, 26, 3)}${candle(930, 672, 64, 22, 4)}
    </g>
  </svg>`;
}

/* ════════════════════════════════════════════════════════════
   THE RESERVED SEAT — guest card art
   ════════════════════════════════════════════════════════════ */

export function seatCard() {
  const fan = (cx, cy, rot) => `
    <g transform="translate(${cx} ${cy}) rotate(${rot})" stroke="${BRASS}" fill="none">
      <path d="M0 0h46M0 0v46M0 0l32 32" stroke-width="1.6"/>
      <path d="M46 0a46 46 0 0 1 -46 46" stroke-width="2"/>
      <path d="M30 0a30 30 0 0 1 -30 30" stroke-opacity="0.6"/>
    </g>`;
  let tufts = '';
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) tufts += `<circle cx="${158 + col * 28 + (row % 2) * 14}" cy="${232 + row * 30}" r="2.6" fill="#2a0609"/>`;
  return `
  <svg class="seat-art" viewBox="0 0 400 580" role="img" aria-label="Illustration: an empty leather chair under a spotlight, a fedora on the seat and a reserved sign">
    <defs>
      <linearGradient id="sc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0c18"/><stop offset="1" stop-color="#100307"/></linearGradient>
      <linearGradient id="sc-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd38a" stop-opacity="0.5"/><stop offset="1" stop-color="#ffd38a" stop-opacity="0.04"/></linearGradient>
      <radialGradient id="sc-pool"><stop offset="0" stop-color="#ffcf86" stop-opacity="0.55"/><stop offset="1" stop-color="#ffcf86" stop-opacity="0"/></radialGradient>
      <linearGradient id="sc-leather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b03040"/><stop offset="0.5" stop-color="#7a1a26"/><stop offset="1" stop-color="#3a0a12"/></linearGradient>
      <linearGradient id="sc-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d68a"/><stop offset="0.5" stop-color="#c9a24b"/><stop offset="1" stop-color="#7a5a22"/></linearGradient>
      <clipPath id="sc-clip"><rect x="26" y="26" width="348" height="528" rx="6"/></clipPath>
    </defs>
    <rect width="400" height="580" rx="18" fill="#140608"/>
    <g clip-path="url(#sc-clip)">
      <rect width="400" height="580" fill="url(#sc-bg)"/>
      <g stroke="#ffffff" stroke-opacity="0.03">${Array.from({ length: 14 }, (_, i) => `<path d="M${26 + i * 26} 26V400"/>`).join('')}</g>
      <rect x="26" y="400" width="348" height="160" fill="#1c0710"/>
      <path d="M26 400H374" stroke="#3a1420" stroke-width="2"/>
      <path d="M170 26h60l120 400H50z" fill="url(#sc-beam)" class="sc-beam"/>
      <ellipse cx="200" cy="430" rx="150" ry="34" fill="url(#sc-pool)"/>
      <ellipse cx="204" cy="436" rx="110" ry="14" fill="#0a0204" opacity="0.6"/>

      <!-- wingback chair -->
      <path d="M128 432l-6 22M272 432l6 22M150 440l-2 18M250 440l2 18" stroke="#2a0a0e" stroke-width="7" stroke-linecap="round"/>
      <path d="M132 330q-6 -140 68 -148q74 8 68 148z" fill="url(#sc-leather)"/>
      <path d="M140 316q0 -118 60 -124" fill="none" stroke="#ff9a8a" stroke-opacity="0.35" stroke-width="3"/>
      ${tufts}
      <path d="M106 326q-10 -40 18 -56q22 -4 26 40v94h-40z" fill="url(#sc-leather)"/>
      <path d="M294 326q10 -40 -18 -56q-22 -4 -26 40v94h40z" fill="#5a121c"/>
      <path d="M126 350h148v56q-74 18 -148 0z" fill="#8e2230"/>
      <path d="M128 340q72 -18 144 0v24q-72 -14 -144 0z" fill="#a62c3a"/>
      <path d="M104 336q-6 -54 20 -64" fill="none" stroke="#ff9a8a" stroke-opacity="0.45" stroke-width="2.5"/>
      <path d="M126 406q74 18 148 0v14q-74 18 -148 0z" fill="#3a0a12"/>
      <g fill="${BRASS}">${Array.from({ length: 9 }, (_, i) => `<circle cx="${112 + i * 0}" cy="${296 + i * 13}" r="1.6"/>`).join('')}</g>

      <!-- fedora on the seat -->
      <ellipse cx="206" cy="346" rx="46" ry="9" fill="#151018"/>
      <path d="M182 344q-2 -28 10 -34q12 -6 14 2q2 -8 14 -2q12 6 10 34q-24 -6 -48 0z" fill="#1d141f"/>
      <path d="M182 336q24 -6 48 0l1 8q-24 -6 -50 0z" fill="#6a1a24"/>
      <path d="M162 344q44 -12 88 0" fill="none" stroke="#ffd38a" stroke-opacity="0.5" stroke-width="1.5"/>

      <!-- a rose on the arm -->
      <g transform="translate(280 318) rotate(18)">
        <path d="M0 0l26 22" stroke="#2a4a20" stroke-width="2.5"/>
        <path d="M10 8q8 -6 10 4z" fill="#2a4a20"/>
        <circle r="8" fill="#b3202e"/><path d="M-4 -2q4 -6 8 0q-4 4 -8 0z" fill="#e04a54"/>
      </g>

      <!-- reserved sign -->
      <g transform="translate(286 396)">
        <rect x="-2" y="16" width="4" height="36" fill="${BRASS}"/>
        <ellipse cy="52" rx="16" ry="4" fill="${BRASS}"/>
        <rect x="-44" y="-12" width="88" height="30" rx="3" fill="#efe2c4" stroke="${BRASS}" stroke-width="2"/>
        <text y="8" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="16" letter-spacing="2" fill="#5a1a22">RESERVED</text>
      </g>

      <!-- spotlight housing -->
      <path d="M180 26h40l-6 14h-28z" fill="#0a0305"/>
      <ellipse cx="200" cy="40" rx="16" ry="3" fill="#fff0c0"/>
    </g>

    <!-- art deco frame -->
    <rect x="12" y="12" width="376" height="556" rx="12" fill="none" stroke="url(#sc-frame)" stroke-width="4"/>
    <rect x="24" y="24" width="352" height="532" rx="7" fill="none" stroke="${BRASS}" stroke-opacity="0.6" stroke-width="1.5"/>
    ${fan(24, 24, 0)}${fan(376, 24, 90)}${fan(376, 556, 180)}${fan(24, 556, 270)}
    <path d="M200 4l12 12-12 12-12-12z" fill="url(#sc-frame)"/>
    <path d="M200 552l12 12-12 12-12-12z" fill="url(#sc-frame)"/>
    <rect x="96" y="488" width="208" height="46" rx="4" fill="#140608" stroke="url(#sc-frame)" stroke-width="2"/>
    <text x="200" y="519" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="24" letter-spacing="3" fill="${BRASS}">YOUR SEAT</text>
  </svg>`;
}
