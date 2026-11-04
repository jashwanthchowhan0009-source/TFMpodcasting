import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// The 3D room: one table, two microphones, a pendant lamp you can knock.
// The camera moves between shots as the page scrolls past `anchors`.

/* ════════════════════════════════════════════════════════════
   The room
   ════════════════════════════════════════════════════════════ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = () => window.innerWidth <= 760;
const lowPower = isSmall() || (navigator.hardwareConcurrency || 8) <= 4;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch { return false; }
}

/* ── procedural textures ─────────────────────────────── */

function canvasTexture(size, draw, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  return t;
}

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const tableTex = () => canvasTexture(1024, (g, n) => {
  const r = rand(7);
  g.fillStyle = '#35190d';
  g.fillRect(0, 0, n, n);
  const cx = n / 2;
  for (let i = 0; i < 140; i++) {
    const rad = (i / 140) * n * 0.72 + r() * 6;
    g.strokeStyle = `rgba(${r() > 0.5 ? '20,8,3' : '78,42,22'},${0.12 + r() * 0.22})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
      const wob = Math.sin(a * 3 + i) * 3 + Math.sin(a * 7 + i * 0.3) * 1.5;
      const x = cx + Math.cos(a) * (rad + wob);
      const y = cx + Math.sin(a) * (rad + wob);
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
});

const floorTex = () => canvasTexture(1024, (g, n) => {
  const r = rand(3);
  const plank = n / 8;
  for (let i = 0; i < 8; i++) {
    const shade = 18 + Math.floor(r() * 10);
    g.fillStyle = `rgb(${shade + 10},${shade - 4},${shade - 8})`;
    g.fillRect(i * plank, 0, plank, n);
    for (let k = 0; k < 26; k++) {
      g.strokeStyle = `rgba(0,0,0,${0.12 + r() * 0.2})`;
      g.lineWidth = 0.5 + r() * 1.5;
      const x = i * plank + r() * plank;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 0; y <= n; y += 32) g.lineTo(x + Math.sin(y * 0.01 + k) * 3, y);
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(i * plank, 0, 2, n);
    const seam = r() * n;
    g.fillRect(i * plank, seam, plank, 2);
  }
}, 4);

const rugTex = () => canvasTexture(1024, (g, n) => {
  const c = n / 2;
  g.fillStyle = '#3a0f15';
  g.fillRect(0, 0, n, n);
  const ring = (rad, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(c, c, rad, 0, Math.PI * 2); g.stroke(); };
  ring(c * 0.96, 18, '#6b2a22');
  ring(c * 0.9, 3, '#a8803f');
  ring(c * 0.86, 10, '#2a0a0f');
  ring(c * 0.5, 2, '#8e6a36');
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    g.fillStyle = i % 2 ? '#8e6a36' : '#5a1a22';
    g.beginPath();
    g.arc(c + Math.cos(a) * c * 0.73, c + Math.sin(a) * c * 0.73, 9, 0, Math.PI * 2);
    g.fill();
  }
  const r = rand(11);
  const img = g.getImageData(0, 0, n, n);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (r() - 0.5) * 22;
    img.data[i] += v; img.data[i + 1] += v * 0.6; img.data[i + 2] += v * 0.6;
  }
  g.putImageData(img, 0, 0);
});

const onAirTex = () => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#ff3b2f';
  g.font = '900 112px "Big Shoulders Display", "Arial Narrow", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('ON AIR', 256, 86);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, canvas: c, redraw: () => { g.clearRect(0, 0, 512, 160); g.fillStyle = '#ff3b2f'; g.fillText('ON AIR', 256, 86); t.needsUpdate = true; } };
};

const dotTex = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

/* ── scene ───────────────────────────────────────────── */

function initRoom({ canvas, shots, anchors, zones }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.4 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120507);
  scene.fog = new THREE.FogExp2(0x170609, 0.075);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 60);

  /* materials */
  const M = {
    wood: new THREE.MeshStandardMaterial({ map: tableTex(), roughness: 0.38, metalness: 0.05 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x2a140c, roughness: 0.5 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x5a1a22, roughness: 0.48, metalness: 0.02 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.28, metalness: 0.92 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: 0x111012, roughness: 0.32, metalness: 0.7 }),
    foam: new THREE.MeshStandardMaterial({ color: 0x151314, roughness: 1 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x2a0e12, roughness: 0.92 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x220a0e, roughness: 0.75 }),
    paper: new THREE.MeshStandardMaterial({ color: 0x75684f, roughness: 0.95 }),
    folder: new THREE.MeshStandardMaterial({ color: 0x5e4428, roughness: 0.8 }),
  };

  /* room shell */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.62 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.7, 96), new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.006;
  rug.receiveShadow = true;
  scene.add(rug);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), M.wall);
  back.position.set(0, 4, -5.2);
  back.receiveShadow = true;
  scene.add(back);
  const left = back.clone();
  left.rotation.y = Math.PI / 2;
  left.position.set(-6.5, 4, 0);
  scene.add(left);

  // wainscot panels on the back wall
  for (let i = -6; i <= 6; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.04), M.panel);
    p.position.set(i * 1.1, 0.8, -5.17);
    p.receiveShadow = true;
    scene.add(p);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.06, 0.08), M.brass);
  rail.position.set(0, 1.55, -5.15);
  scene.add(rail);

  // framed pictures
  [[-2.6, 3.0, 1.0, 1.3], [-1.1, 3.25, 0.8, 0.8], [3.6, 3.0, 1.2, 0.9]].forEach(([x, y, w, h]) => {
    const frame = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.06, 2, 0.01), M.brass);
    frame.position.set(x, y, -5.14);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.12), new THREE.MeshStandardMaterial({ color: 0x1a0b0c, roughness: 0.6 }));
    inner.position.set(x, y, -5.105);
    scene.add(frame, inner);
  });

  // ON AIR sign
  const onAir = onAirTex();
  const signMat = new THREE.MeshBasicMaterial({ map: onAir.tex, transparent: true, color: 0x220404, toneMapped: false });
  const signBox = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.46, 0.08, 3, 0.03), new THREE.MeshStandardMaterial({ color: 0x0c0606, roughness: 0.4 }));
  signBox.position.set(2.5, 2.4, -5.12);
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.375), signMat);
  signFace.position.set(2.5, 2.4, -5.075);
  const signGlow = new THREE.PointLight(0xff3b2f, 0, 3, 2);
  signGlow.position.set(2.5, 2.4, -4.7);
  scene.add(signBox, signFace, signGlow);
  if (document.fonts) document.fonts.ready.then(onAir.redraw);

  /* table */
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.07, 96), M.wood);
  top.position.y = 0.76;
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 12, 120), M.darkWood);
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 0.76;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.7, 32), M.darkWood);
  stem.position.y = 0.39;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.06, 64), M.darkWood);
  foot.position.y = 0.03;
  const brassBand = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 40), M.brass);
  brassBand.rotation.x = Math.PI / 2;
  brassBand.position.y = 0.62;
  table.add(top, edge, stem, foot, brassBand);
  table.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(table);

  /* chairs */
  function makeChair() {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.12, 0.62, 4, 0.05), M.leather);
    seat.position.y = 0.5;
    const backRest = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.78, 0.12, 4, 0.05), M.leather);
    backRest.position.set(0, 0.92, -0.28);
    backRest.rotation.x = -0.14;
    const armGeo = new RoundedBoxGeometry(0.08, 0.3, 0.56, 3, 0.03);
    const armL = new THREE.Mesh(armGeo, M.leather); armL.position.set(-0.33, 0.66, -0.02);
    const armR = armL.clone(); armR.position.x = 0.33;
    g.add(seat, backRest, armL, armR);
    const legGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.46, 12);
    [[-0.27, -0.24], [0.27, -0.24], [-0.27, 0.24], [0.27, 0.24]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, M.brass);
      leg.position.set(x, 0.23, z);
      g.add(leg);
    });
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }
  const chairR = makeChair();
  chairR.position.set(1.62, 0, 0);
  chairR.rotation.y = -Math.PI / 2;
  const chairL = makeChair();
  chairL.position.set(-1.66, 0, 0.08);
  chairL.rotation.y = Math.PI / 2 + 0.12; // the empty chair, pulled out a little
  scene.add(chairR, chairL);

  /* microphones — broadcast dynamics on short desk stands, pointing at each chair */
  function makeMic() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.022, 32), M.blackMetal);
    base.position.y = 0.011;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 12), M.blackMetal);
    post.position.y = 0.11;
    const head = new THREE.Group();
    head.position.y = 0.23;
    head.rotation.z = -Math.PI / 2 + 0.32; // aim toward +x, tilted up
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.043, 0.13, 8, 24), M.blackMetal);
    const grille = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.05, 8, 24), M.foam);
    grille.position.y = 0.1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.007, 8, 32), M.brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.045;
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.007, 8, 32, Math.PI), M.blackMetal);
    yoke.rotation.y = Math.PI / 2;
    yoke.rotation.z = Math.PI;
    head.add(body, grille, ring, yoke);
    g.add(base, post, head);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  const micR = makeMic();
  micR.position.set(0.55, 0.795, 0.08);
  const micL = makeMic();
  micL.position.set(-0.55, 0.795, -0.06);
  micL.rotation.y = Math.PI;
  scene.add(micR, micL);

  /* whiskey glasses + dossier */
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1 });
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0xb4641c, roughness: 0.15, transparent: true, opacity: 0.85, emissive: 0x3a1500 });
  function makeGlass() {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 32, 1, true), glassMat);
    glass.position.y = 0.045;
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 32), glassMat);
    bottom.position.y = 0.006;
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.038, 0.035, 32), liquidMat);
    liquid.position.y = 0.03;
    g.add(glass, bottom, liquid);
    return g;
  }
  const g1 = makeGlass(); g1.position.set(0.72, 0.795, -0.42);
  const g2 = makeGlass(); g2.position.set(-0.78, 0.795, 0.38);
  scene.add(g1, g2);

  const dossier = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.46), M.folder);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.008, 0.44), M.paper);
  pages.position.set(0.01, 0.009, 0);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.03), M.brass);
  clip.position.set(0, 0.016, -0.2);
  dossier.add(cover, pages, clip);
  dossier.position.set(-0.05, 0.8, 0.45);
  dossier.rotation.y = 0.35;
  dossier.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(dossier);

  /* the lamp — a pendant on a 2.5 m cord, free to swing */
  const CORD = 2.5;
  const pivot = new THREE.Group();
  pivot.position.set(0, 5.3, 0);
  scene.add(pivot);

  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, CORD, 8), M.blackMetal);
  cord.position.y = -CORD / 2;
  pivot.add(cord);

  const lamp = new THREE.Group();
  lamp.position.y = -CORD;
  pivot.add(lamp);

  const shadeOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.52, 0.44, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.3, metalness: 0.9, side: THREE.FrontSide }));
  const shadeInnerMat = new THREE.MeshStandardMaterial({ color: 0xf3dcab, emissive: 0xffcf86, emissiveIntensity: 0, roughness: 0.6, side: THREE.BackSide });
  const shadeInner = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.515, 0.435, 64, 1, true), shadeInnerMat);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.08, 32), M.brass);
  cap.position.y = 0.24;
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.012, 8, 96), M.brass);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = -0.22;
  shadeOuter.castShadow = true;
  lamp.add(shadeOuter, shadeInner, cap, lip);

  const bulbMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 16), bulbMat);
  bulb.position.y = -0.1;
  lamp.add(bulb);

  const SPOT_MAX = 46;
  const SPOT_ANGLE = 0.76;
  const spot = new THREE.SpotLight(0xffc98a, 0, 10, SPOT_ANGLE, 0.6, 1.7);
  spot.position.y = -0.1;
  spot.castShadow = true;
  spot.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.02;
  spot.shadow.camera.near = 0.3;
  spot.shadow.camera.far = 8;
  const spotTarget = new THREE.Object3D();
  spotTarget.position.y = -3;
  lamp.add(spot, spotTarget);
  spot.target = spotTarget;

  const glow = new THREE.PointLight(0xffb766, 0, 3.2, 2);
  glow.position.y = -0.18;
  lamp.add(glow);

  // light cone through the haze
  const CONE_H = 2.75;
  const coneGeo = new THREE.ConeGeometry(Math.tan(SPOT_ANGLE) * CONE_H * 0.82, CONE_H, 64, 1, true);
  coneGeo.translate(0, -CONE_H / 2, 0);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xffc98a) }, uPower: { value: 0 } },
    vertexShader: /* glsl */`
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        vY = position.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uPower;
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        float along = clamp(-vY / ${CONE_H.toFixed(2)}, 0.0, 1.0);
        float fall = pow(1.0 - along, 1.4) * smoothstep(0.0, 0.08, along);
        float edge = pow(abs(dot(vN, vV)), 2.2);
        float a = fall * edge * 0.2 * uPower;
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = -0.12;
  lamp.add(cone);

  // dust drifting through the beam
  const DUST = lowPower ? 380 : 900;
  const dustGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(DUST * 3);
  const dPhase = new Float32Array(DUST);
  const rr = rand(42);
  for (let i = 0; i < DUST; i++) {
    const a = rr() * Math.PI * 2;
    const rad = Math.sqrt(rr()) * 1.7;
    dPos[i * 3] = Math.cos(a) * rad;
    dPos[i * 3 + 1] = 0.9 + rr() * 1.9;
    dPos[i * 3 + 2] = Math.sin(a) * rad;
    dPhase[i] = rr() * 100;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute('phase', new THREE.BufferAttribute(dPhase, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 0 },
      uLamp: { value: new THREE.Vector3() },
      uDir: { value: new THREE.Vector3(0, -1, 0) },
      uTan: { value: Math.tan(SPOT_ANGLE) * 0.82 },
      uScale: { value: renderer.getPixelRatio() },
      uMap: { value: dotTex() },
    },
    vertexShader: /* glsl */`
      uniform float uTime, uPower, uTan, uScale; uniform vec3 uLamp, uDir;
      attribute float phase;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.13 + phase * 2.0) * 0.14;
        p.z += cos(uTime * 0.11 + phase * 3.0) * 0.14;
        p.y += sin(uTime * 0.09 + phase) * 0.22;
        vec3 d = p - uLamp;
        float along = dot(d, uDir);
        float radial = length(d - uDir * along);
        float coneR = max(along, 0.0) * uTan;
        float inside = smoothstep(coneR, coneR * 0.45, radial) * step(0.0, along);
        float twinkle = 0.55 + 0.45 * sin(uTime * 1.3 + phase * 7.0);
        vA = inside * twinkle * uPower;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float depth = -mv.z;
        vA *= smoothstep(0.35, 1.4, depth);
        gl_PointSize = min(0.016 * uScale * 900.0 / depth, 7.0 * uScale);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; varying float vA;
      void main() {
        float m = texture2D(uMap, gl_PointCoord).r;
        gl_FragColor = vec4(vec3(1.0, 0.86, 0.62) * m * vA, m * vA);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* fill lights */
  scene.add(new THREE.HemisphereLight(0x6a3038, 0x080304, 0.75));
  const windowLight = new THREE.DirectionalLight(0x6d8f96, 1.1); // cold street light from off-screen left
  windowLight.position.set(-6, 4, 3);
  scene.add(windowLight);
  // a low warm kicker so the empty chair reads in the dark
  const chairKick = new THREE.SpotLight(0xd98a5a, 6, 6, 0.5, 0.8, 1.5);
  chairKick.position.set(-1.2, 2.6, 2.6);
  chairKick.target = chairL;
  scene.add(chairKick);

  /* post */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.5, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ── camera shots ──────────────────────────────────── */
  const v = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const SHOTS = shots.map((s) => ({ pos: v(s.pos), look: v(s.look) }));
  const MOBILE_PULLBACK = 1.12;

  let sectionTops = [];
  function measure() { sectionTops = anchors(); }

  function shotProgress() {
    const y = window.scrollY;
    if (y <= sectionTops[0]) return 0;
    for (let i = 0; i < sectionTops.length - 1; i++) {
      if (y < sectionTops[i + 1]) return i + (y - sectionTops[i]) / (sectionTops[i + 1] - sectionTops[i]);
    }
    return sectionTops.length - 1;
  }

  const ease = (t) => t * t * (3 - 2 * t);
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  function targetShot(s) {
    const i = Math.min(Math.floor(s), SHOTS.length - 1);
    const j = Math.min(i + 1, SHOTS.length - 1);
    const f = ease(s - i);
    tmpPos.lerpVectors(SHOTS[i].pos, SHOTS[j].pos, f);
    tmpLook.lerpVectors(SHOTS[i].look, SHOTS[j].look, f);
    if (isSmall()) tmpPos.sub(tmpLook).multiplyScalar(MOBILE_PULLBACK).add(tmpLook);
  }

  targetShot(0);
  const camPos = tmpPos.clone();
  const camLook = tmpLook.clone();
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  /* ── sizing ────────────────────────────────────────── */
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w * 0.5, h * 0.5);
    camera.aspect = w / h;
    camera.fov = isSmall() ? 54 : 36; // phones: wider lens to undo the taller view offset below
    // On wide screens text sits left, so frame the room to the right.
    // On phones text sits at the bottom, so frame the room in the upper half.
    if (!isSmall()) camera.setViewOffset(w * 1.34, h, 0, 0, w, h);
    else camera.setViewOffset(w, h * 1.5, 0, h * 0.42, w, h);
    camera.updateProjectionMatrix();
    dustMat.uniforms.uScale.value = renderer.getPixelRatio() * (h / 900);
    measure();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('load', measure);
  resize();

  /* ── pointer: parallax + a lamp you can knock ──────── */
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, lastX: null, lastY: null, lastT: 0 };
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    const now = performance.now();
    if (pointer.lastX !== null) {
      const dt = Math.max(16, now - pointer.lastT) / 1000;
      pointer.vx = THREE.MathUtils.clamp((nx - pointer.lastX) / dt, -6, 6);
      pointer.vy = THREE.MathUtils.clamp((ny - pointer.lastY) / dt, -6, 6);
    }
    pointer.x = nx; pointer.y = ny;
    pointer.lastX = nx; pointer.lastY = ny; pointer.lastT = now;
  }, { passive: true });

  const swing = { ax: 0, az: 0, vx: 0, vz: 0 };
  // turning a card over knocks the lamp, just a little
  window.addEventListener('tfm:nudge', () => { swing.vz += 0.35; });
  const G_OVER_L = 9.81 / CORD;

  /* ── lamp switch-on ────────────────────────────────── */
  // [time s, power] — a tungsten bulb catching, twice, then holding.
  const FLICKER = [[0, 0], [0.05, 0.55], [0.12, 0.05], [0.3, 0.05], [0.34, 0.85], [0.4, 0.2], [0.46, 0.95], [0.52, 0.6], [0.7, 1]];
  function flicker(t) {
    if (t <= 0) return 0;
    for (let i = 0; i < FLICKER.length - 1; i++) {
      const [t0, p0] = FLICKER[i];
      const [t1, p1] = FLICKER[i + 1];
      if (t < t1) return p0 + (p1 - p0) * ((t - t0) / (t1 - t0));
    }
    return 1;
  }
  const START_DELAY = 0.45;
  let onAirOn = false;

  /* ── only render while the room is on screen ───────── */
  const bulbWorld = new THREE.Vector3();
  let onScreen = false;
  let litAt = -1; // the lamp switches on the first time you walk into the room
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) en.target._roomVisible = en.isIntersecting;
    onScreen = zones.some((z) => z._roomVisible);
    canvas.classList.toggle('is-active', onScreen);
  }, { rootMargin: '10% 0px' });
  zones.forEach((z) => io.observe(z));

  /* ── loop ──────────────────────────────────────────── */
  const t0 = performance.now();
  let last = t0;
  let elapsed = 0;
  const lampDir = new THREE.Vector3();
  const lampQuat = new THREE.Quaternion();

  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1); // physics step, clamped
    last = now;
    elapsed = (now - t0) / 1000;
    if (!onScreen) return;
    if (litAt < 0) litAt = elapsed;

    // power
    const power = reduceMotion ? 1 : flicker(elapsed - litAt - START_DELAY);
    spot.intensity = SPOT_MAX * power;
    glow.intensity = 2.2 * power;
    shadeInnerMat.emissiveIntensity = 0.55 * power;
    bulbMat.color.setRGB(1.6 * power, 1.25 * power, 0.8 * power);
    coneMat.uniforms.uPower.value = power;
    dustMat.uniforms.uPower.value = power;
    if (!onAirOn && elapsed - litAt > START_DELAY + 1.4) {
      onAirOn = true;
      signMat.color.set(0xffffff);
      signGlow.intensity = 1.6;
    }

    // pendulum
    if (!reduceMotion) {
      const breeze = Math.sin(elapsed * 0.35) * 0.004;
      const pushZ = -pointer.vx * 0.18; // sideways flick swings the lamp sideways
      const pushX = pointer.vy * 0.12;
      swing.vz += (-G_OVER_L * Math.sin(swing.az) - 0.55 * swing.vz + pushZ + breeze) * dt;
      swing.vx += (-G_OVER_L * Math.sin(swing.ax) - 0.55 * swing.vx + pushX) * dt;
      swing.az = THREE.MathUtils.clamp(swing.az + swing.vz * dt, -0.32, 0.32);
      swing.ax = THREE.MathUtils.clamp(swing.ax + swing.vx * dt, -0.25, 0.25);
      pivot.rotation.set(swing.ax, 0, swing.az);
      pointer.vx *= Math.exp(-dt * 10);
      pointer.vy *= Math.exp(-dt * 10);
      dustMat.uniforms.uTime.value = elapsed;
    }

    // lamp position/direction for the dust shader
    bulb.getWorldPosition(bulbWorld);
    dustMat.uniforms.uLamp.value.copy(bulbWorld);
    lamp.getWorldQuaternion(lampQuat);
    lampDir.set(0, -1, 0).applyQuaternion(lampQuat);
    dustMat.uniforms.uDir.value.copy(lampDir);

    // camera follows scroll, eased; pointer adds a little parallax
    targetShot(shotProgress());
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    camPos.lerp(tmpPos, k);
    camLook.lerp(tmpLook, k);
    const par = reduceMotion ? 0 : 0.16;
    camera.position.set(camPos.x + pointer.x * par, camPos.y - pointer.y * par * 0.6, camPos.z);
    camera.lookAt(camLook);

    composer.render();
  }

  requestAnimationFrame(frame);
}

/* ── boot ─────────────────────────────────────────────── */

export function startRoom(opts) {
  if (!opts.canvas) return;
  if (!webglAvailable()) { document.body.classList.add('no-webgl'); return; }
  try { initRoom(opts); }
  catch (err) { console.error(err); document.body.classList.add('no-webgl'); }
}
