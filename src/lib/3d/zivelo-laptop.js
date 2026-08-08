/**
 * Zivelo 3D laptop — hero-ready, framework-agnostic.
 *
 *   import * as THREE from 'three';
 *   import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 *   import { createZiveloLaptop } from './zivelo-laptop.js';
 *
 *   const hero = createZiveloLaptop({
 *     THREE, OrbitControls,
 *     container: document.getElementById('hero-3d'),
 *     screenLogoUrl: '/assets/zivelo-bars-dark-full.png',
 *     lidMarkUrl:    '/assets/zivelo-wordmark-dark-compact.svg',
 *   });
 *   // hero.setOpen(false) | hero.toggle() | hero.dispose()
 *
 * Units are meters (real laptop: 325 x 225 x 14.2 mm).
 * Only `three` is required. No build-step assumptions, no globals.
 */

export function createZiveloLaptop({
  THREE,
  OrbitControls = null,
  container,
  screenLogoUrl,
  lidMarkUrl,
  background = null,        // null = transparent; or '#f3f2f2'
  autoRotate = true,
  autoRotateSpeed = 1.1,
  interactive = true,       // enable pointer hit testing
  userOrbit = true,         // allow pointer orbiting when controls are enabled
  closeOnClick = false,     // make a hit close the lid instead of toggling it
  openAngle = 110,          // degrees
  startOpen = true,
  cameraAzimuth = 38,       // degrees, horizontal start angle
  cameraElevation = 22,     // degrees above the desk
  fitScale = 1.18,          // >1 pulls the camera back (breathing room)
  pauseWhenOffscreen = true,
  maxPixelRatio = 2,
} = {}) {
  if (!THREE) throw new Error('createZiveloLaptop: pass the imported THREE namespace');
  if (!container) throw new Error('createZiveloLaptop: `container` element is required');

  const reduceMotion =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- scene */
  const scene = new THREE.Scene();
  if (background) scene.background = new THREE.Color(background);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: !background,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, maxPixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  container.appendChild(canvas);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 30);

  /* --------------------------------------------------------------- lights */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6d2, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(0.42, 0.68, 0.42);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.002;
  const sc = key.shadow.camera;
  sc.near = 0.05; sc.far = 3;
  sc.left = -0.35; sc.right = 0.35; sc.top = 0.35; sc.bottom = -0.35;
  sc.updateProjectionMatrix();
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.55);
  fill.position.set(-0.55, 0.32, 0.3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(-0.2, 0.35, -0.6);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.ShadowMaterial({ opacity: 0.14 })   // shadow only — bg stays clean
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.0025;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ------------------------------------------------------------ materials */
  const M = {
    shell: new THREE.MeshStandardMaterial({ name: 'aluminium_shell', color: 0xcfcecb, roughness: 0.42, metalness: 0.35 }),
    shellInner: new THREE.MeshStandardMaterial({ name: 'aluminium_deck', color: 0xc4c3c0, roughness: 0.5, metalness: 0.3 }),
    dark: new THREE.MeshStandardMaterial({ name: 'graphite', color: 0x2a2827, roughness: 0.55, metalness: 0.15 }),
    keySide: new THREE.MeshStandardMaterial({ name: 'keycap', color: 0x201e1d, roughness: 0.75, metalness: 0.05 }),
    rubber: new THREE.MeshStandardMaterial({ name: 'rubber', color: 0x141312, roughness: 0.95, metalness: 0 }),
    accent: new THREE.MeshStandardMaterial({ name: 'zivelo_red', color: 0xec3013, roughness: 0.4, metalness: 0.1 }),
  };
  const disposables = new Set(Object.values(M));
  const track = (x) => { disposables.add(x); return x; };

  /* screen: Zivelo logo on a light panel with a diagonal sheen */
  const screenTex = (() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 670;
    const g = c.getContext('2d');
    g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.name = 'zivelo_screen';
    tex.colorSpace = THREE.SRGBColorSpace;
    if (screenLogoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = c.width * 0.55, h = w * (img.height / img.width);
        g.drawImage(img, (c.width - w) / 2, (c.height - h) / 2 - 14, w, h);
        const sheen = g.createLinearGradient(0, 0, c.width * 0.6, c.height);
        sheen.addColorStop(0, 'rgba(255,255,255,0.55)');
        sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
        sheen.addColorStop(1, 'rgba(0,0,0,0.05)');
        g.fillStyle = sheen; g.fillRect(0, 0, c.width, c.height);
        tex.needsUpdate = true;
        requestRender();
      };
      img.src = screenLogoUrl;
    }
    return track(tex);
  })();
  M.screen = track(new THREE.MeshStandardMaterial({
    name: 'screen', map: screenTex, emissive: 0xffffff, emissiveMap: screenTex,
    emissiveIntensity: 0.32, roughness: 0.22, metalness: 0,
  }));

  /* lid wordmark, alpha-cut so the aluminium shows through */
  const markTex = (() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.name = 'zivelo_mark';
    tex.colorSpace = THREE.SRGBColorSpace;
    if (lidMarkUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const h = c.height * 0.86, w = h * (136.75 / 118.54);
        g.clearRect(0, 0, c.width, c.height);
        g.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
        tex.needsUpdate = true;
        requestRender();
      };
      img.src = lidMarkUrl;
    }
    return track(tex);
  })();
  M.mark = track(new THREE.MeshStandardMaterial({
    name: 'zivelo_mark', map: markTex, transparent: true, alphaTest: 0.35,
    color: 0x1c1b1a, roughness: 0.34, metalness: 0.2,
  }));

  /* -------------------------------------------------------------- helpers */
  function roundedSlab(w, d, t, r, mat, name) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
    s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2);
    s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    const b = 0.0012;
    const geo = track(new THREE.ExtrudeGeometry(s, {
      depth: t - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b,
      bevelSegments: 3, curveSegments: 12,
    }));
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, b, 0);
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    return m;
  }
  const box = (w, h, d, mat, name) => {
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat);
    m.name = name; return m;
  };

  /* ----------------------------------------------------------- dimensions */
  const W = 0.325, D = 0.225, T = 0.0142;   // base w / d / thickness
  const LD = 0.215, LT = 0.0062;            // lid depth / thickness

  const laptop = new THREE.Group();
  laptop.name = 'zivelo_laptop';

  /* --------------------------------------------------------------- base */
  const base = new THREE.Group(); base.name = 'base';
  base.add(roundedSlab(W, D, T, 0.006, M.shell, 'base_shell'));

  const deckW = W - 0.026, deckD = 0.118;
  const deck = box(deckW, 0.002, deckD, M.dark, 'keyboard_well');
  deck.position.set(0, T - 0.0012, -D / 2 + 0.014 + deckD / 2);
  base.add(deck);

  /* keycap legends: one 16x8 canvas atlas, one UV cell per key top */
  const COLS = 16, ROWS = 8, CELL = 128;
  const atlas = document.createElement('canvas');
  atlas.width = COLS * CELL; atlas.height = ROWS * CELL;
  const actx = atlas.getContext('2d');
  actx.fillStyle = '#242221'; actx.fillRect(0, 0, atlas.width, atlas.height);
  const atlasTex = track(new THREE.CanvasTexture(atlas));
  atlasTex.name = 'keycap_legends';
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = 4;

  let cellI = 0;
  const legendJobs = [];
  function legendCell(label, u, small, bg) {
    const i = cellI++;
    const draw = () => {
      const cx = (i % COLS) * CELL, cy = Math.floor(i / COLS) * CELL;
      actx.save();
      actx.beginPath(); actx.rect(cx, cy, CELL, CELL); actx.clip();
      actx.fillStyle = bg || '#242221'; actx.fillRect(cx, cy, CELL, CELL);
      if (label) {
        actx.fillStyle = bg ? '#f7eae7' : '#d6d3cf';
        actx.textBaseline = 'middle'; actx.textAlign = 'center';
        actx.translate(cx + CELL / 2, cy + CELL / 2);
        actx.scale(1 / u, 1);
        const size = small || label.length > 2 ? 32 : 52;
        actx.font = `500 ${size}px Archivo, system-ui, sans-serif`;
        actx.fillText(label, 0, 3);
      }
      actx.restore();
      atlasTex.needsUpdate = true;
    };
    draw();               // paint now (fallback font)
    legendJobs.push(draw); // repaint once Archivo is ready
    return i;
  }
  function setTopUV(geo, i) {
    const u0 = (i % COLS) / COLS, v1 = 1 - Math.floor(i / COLS) / ROWS;
    const du = 1 / COLS, dv = 1 / ROWS, uv = geo.attributes.uv;
    for (let k = 8; k < 12; k++) {
      uv.setXY(k, u0 + uv.getX(k) * du, v1 - (1 - uv.getY(k)) * dv);
    }
    uv.needsUpdate = true;
  }
  function taper(geo, f) {
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) {
      if (p.getY(k) > 0) { p.setX(k, p.getX(k) * f); p.setZ(k, p.getZ(k) * f); }
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  M.keyTop = track(new THREE.MeshStandardMaterial({ name: 'keycap_legend', map: atlasTex, roughness: 0.8, metalness: 0.04 }));
  M.keyTopAccent = track(new THREE.MeshStandardMaterial({ name: 'power_key', map: atlasTex, roughness: 0.5, metalness: 0.08 }));

  const keys = new THREE.Group(); keys.name = 'keys';
  const pitch = deckW / 14.6;
  const rows = [
    { h: 0.62, small: true, k: [['esc',1],['F1',1],['F2',1],['F3',1],['F4',1],['F5',1],['F6',1],['F7',1],['F8',1],['F9',1],['F10',1],['F11',1],['F12',1],['\u23FB',1]] },
    { h: 1, k: [['\u00b0',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['0',1],['?',1],['\u232B',2]] },
    { h: 1, k: [['\u21E5',1.5],['Q',1],['W',1],['E',1],['R',1],['T',1],['Y',1],['U',1],['I',1],['O',1],['P',1],['\u00b4',1],['+',1.5]] },
    { h: 1, k: [['\u21EA',1.75],['A',1],['S',1],['D',1],['F',1],['G',1],['H',1],['J',1],['K',1],['L',1],['\u00d1',1],['\u23CE',2.25]] },
    { h: 1, k: [['\u21E7',2.25],['Z',1],['X',1],['C',1],['V',1],['B',1],['N',1],['M',1],[',',1],['.',1],['-',1],['\u21E7',1.75]] },
    { h: 1, k: [['fn',1.25],['ctrl',1.25],['alt',1.25],['',5.5],['alt',1.25],['\u25C0',1.25],['\u25B2',1.25],['\u25B6',1]] },
  ];
  const gap = pitch * 0.16, rowPitch = pitch;
  let zCur = deck.position.z - deckD / 2 + rowPitch * 0.55;
  rows.forEach((row, ri) => {
    const kd = rowPitch * row.h - gap;
    let xCur = -deckW / 2 + gap;
    row.k.forEach(([label, u], ci) => {
      const kw = pitch * u - gap;
      const power = ri === 0 && ci === row.k.length - 1;
      const geo = track(new THREE.BoxGeometry(kw, 0.0027, kd));
      taper(geo, 0.9);
      setTopUV(geo, legendCell(label, u, row.small, power ? '#ec3013' : null));
      const side = power ? M.accent : M.keySide;
      const top = power ? M.keyTopAccent : M.keyTop;
      const k = new THREE.Mesh(geo, [side, side, top, side, side, side]);
      k.name = `key_${label || 'space'}_r${ri}c${ci}`;
      k.position.set(xCur + kw / 2, T + 0.0007, zCur + kd / 2);
      keys.add(k);
      xCur += pitch * u;
    });
    zCur += rowPitch * row.h;
  });
  base.add(keys);

  /* repaint legends with the real font once it loads (no layout dependency) */
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      legendJobs.forEach((fn) => fn());
      requestRender();
    });
  }

  const pad = box(0.108, 0.0016, 0.068, M.shellInner, 'trackpad');
  pad.position.set(0, T - 0.0002, D / 2 - 0.014 - 0.034);
  base.add(pad);
  const padLine = box(0.1104, 0.0012, 0.0704, M.dark, 'trackpad_inlay');
  padLine.position.set(0, T - 0.0009, pad.position.z);
  base.add(padLine);

  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    const f = new THREE.Mesh(track(new THREE.CylinderGeometry(0.0055, 0.0055, 0.0022, 24)), M.rubber);
    f.name = `foot_${sx > 0 ? 'r' : 'l'}${sz > 0 ? 'f' : 'b'}`;
    f.position.set(sx * (W / 2 - 0.022), -0.0011, sz * (D / 2 - 0.022));
    base.add(f);
  }));

  [[-1, -0.045], [-1, 0.012], [1, -0.03], [1, 0.028]].forEach(([sx, z], i) => {
    const p = box(0.0035, 0.004, sx === -1 ? 0.017 : 0.013, M.dark, `port_${i}`);
    p.position.set(sx * (W / 2 + 0.0010), T * 0.5, z);
    base.add(p);
  });

  const jack = new THREE.Mesh(track(new THREE.CylinderGeometry(0.0018, 0.0018, 0.003, 20)), M.dark);
  jack.name = 'headphone_jack';
  jack.rotation.z = Math.PI / 2;
  jack.position.set(-(W / 2 + 0.0012), T * 0.5, 0.055);
  base.add(jack);

  [-1, 1].forEach((sx) => {
    const sp = box(0.0022, 0.0022, 0.052, M.dark, `speaker_${sx > 0 ? 'r' : 'l'}`);
    sp.position.set(sx * (W / 2 + 0.0012), T * 0.62, D / 2 - 0.055);
    base.add(sp);
  });

  for (let i = 0; i < 5; i++) {
    const v = box(0.052, 0.0012, 0.0022, M.dark, `bottom_vent_${i}`);
    v.position.set(0, -0.0004, -D / 2 + 0.028 + i * 0.0065);
    base.add(v);
  }

  const lip = box(0.058, 0.0013, 0.0022, M.dark, 'open_lip');
  lip.position.set(0, T - 0.0007, D / 2 - 0.0011);
  base.add(lip);

  const grille = box(0.13, 0.0032, 0.0035, M.dark, 'vent');
  grille.position.set(0, T * 0.55, -D / 2 + 0.0014);
  base.add(grille);
  laptop.add(base);

  /* ------------------------------------------- lid (pivots at the hinge) */
  const lid = new THREE.Group(); lid.name = 'lid';
  lid.position.set(0, T - 0.001, -D / 2 + 0.008);

  const lidShell = roundedSlab(W, LD, LT, 0.006, M.shell, 'lid_shell');
  lidShell.geometry.translate(0, 0, LD / 2);   // extend forward from the hinge
  lid.add(lidShell);

  const bezel = box(W - 0.008, 0.0014, LD - 0.008, M.dark, 'bezel');
  bezel.position.set(0, 0.0003, LD / 2);
  lid.add(bezel);

  const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(W - 0.017, LD - 0.028)), M.screen);
  screen.name = 'screen_panel';
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.0009, LD / 2 + 0.005);
  lid.add(screen);

  const cam = new THREE.Mesh(track(new THREE.CylinderGeometry(0.0016, 0.0016, 0.0012, 20)), M.dark);
  cam.name = 'webcam';
  cam.position.set(0, -0.0009, LD - 0.0065);
  lid.add(cam);

  const led = new THREE.Mesh(track(new THREE.CylinderGeometry(0.0007, 0.0007, 0.0012, 12)), M.accent);
  led.name = 'camera_led';
  led.position.set(0.006, -0.0009, LD - 0.0065);
  lid.add(led);

  const mark = new THREE.Mesh(track(new THREE.PlaneGeometry(0.056, 0.0485)), M.mark);
  mark.name = 'lid_wordmark';
  mark.rotation.set(-Math.PI / 2, 0, Math.PI);
  mark.position.set(0, LT + 0.0004, LD * 0.54);
  lid.add(mark);
  laptop.add(lid);

  [-1, 1].forEach((sx) => {
    const h = new THREE.Mesh(track(new THREE.CylinderGeometry(0.0052, 0.0052, 0.07, 32)), M.dark);
    h.name = `hinge_${sx > 0 ? 'right' : 'left'}`;
    h.rotation.z = Math.PI / 2;
    h.position.set(sx * 0.088, T - 0.0012, -D / 2 + 0.008);
    laptop.add(h);
  });

  laptop.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  scene.add(laptop);

  /* ------------------------------------------------------ open / close */
  const OPEN = -openAngle * Math.PI / 180;
  const CLOSED = -0.9 * Math.PI / 180;
  let target = startOpen ? OPEN : CLOSED;
  let current = target;
  lid.rotation.x = current;

  /* -------------------------------------------------------------- camera */
  const pivot = new THREE.Object3D();   // orbit target = laptop centre
  const bounds = new THREE.Box3();
  let radius = 0.3;
  function frame() {
    const openBefore = lid.rotation.x;
    lid.rotation.x = OPEN;              // always frame for the open pose
    laptop.updateWorldMatrix(true, true);
    bounds.setFromObject(laptop);
    lid.rotation.x = openBefore;
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    pivot.position.copy(centre);
    radius = size.length() / 2;
    const fov = camera.fov * Math.PI / 180;
    const dist = (radius / Math.sin(fov / 2)) * fitScale;
    const az = cameraAzimuth * Math.PI / 180, el = cameraElevation * Math.PI / 180;
    camera.position.set(
      centre.x + dist * Math.cos(el) * Math.sin(az),
      centre.y + dist * Math.sin(el),
      centre.z + dist * Math.cos(el) * Math.cos(az)
    );
    camera.near = Math.max(dist - radius * 3, 0.01);
    camera.far = dist + radius * 6;
    camera.lookAt(centre);
    camera.updateProjectionMatrix();
    if (controls) { controls.target.copy(centre); controls.update(); }
  }

  let controls = null;
  if (OrbitControls && interactive) {
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableRotate = userOrbit;
    controls.enablePan = false;
    controls.enableZoom = false;                 // never hijack page scroll
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // stay above the desk
    controls.autoRotate = autoRotate && !reduceMotion;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.addEventListener('start', () => {
      if (userOrbit) controls.autoRotate = false;
    });
  }
  frame();

  /* ------------------------------------------------------- render loop */
  let raf = 0, visible = true, needsRender = true;
  const requestRender = () => { needsRender = true; };

  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let io = null;
  if (pauseWhenOffscreen && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; if (visible) requestRender(); },
      { threshold: 0 }
    );
    io.observe(container);
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    if (Math.abs(target - current) > 0.0008) {
      current += (target - current) * (reduceMotion ? 1 : 0.12);
      lid.rotation.x = current;
      requestRender();
    } else if (current !== target) {
      current = target; lid.rotation.x = current; requestRender();
    }
    if (controls) { controls.update(); if (controls.autoRotate) requestRender(); }
    if (!needsRender) return;
    needsRender = false;
    renderer.render(scene, camera);
  }
  loop();

  /* --------------------------------------------------- click to toggle */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let down = null;
  const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(laptop, true).length) {
      if (closeOnClick) api.setOpen(false);
      else api.toggle();
    }
  };
  if (interactive) {
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
  }

  /* ------------------------------------------------------------- public */
  const api = {
    scene, camera, renderer, controls, object: laptop, lid,
    get isOpen() { return target === OPEN; },
    setOpen(open) { target = open ? OPEN : CLOSED; requestRender(); return api; },
    toggle() { return api.setOpen(target !== OPEN); },
    setAutoRotate(on) { if (controls) { controls.autoRotate = !!on && !reduceMotion; requestRender(); } return api; },
    reframe() { frame(); requestRender(); return api; },
    requestRender,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect(); io?.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      controls?.dispose();
      disposables.forEach((d) => d.dispose?.());
      ground.geometry.dispose(); ground.material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
  return api;
}
