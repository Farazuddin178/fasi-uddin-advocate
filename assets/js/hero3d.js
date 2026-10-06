/* Hero centrepiece: procedural gold scales of justice on a navy plinth.
   Reacts to pointer (parallax), drag (spin) and scroll (window.__heroProgress).
   Falls back to the static image already in the markup if WebGL is missing. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.querySelector('[data-hero-stage]');
if (stage) {
  try { init(stage); } catch (err) { console.warn('3D hero disabled:', err); }
}

function init(stage) {
  const canvas = stage.querySelector('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 720px)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  /* ---------- Materials (brand navy + gold) ---------- */
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xc9a96e, metalness: 1, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.18
  });
  const goldSatin = gold.clone();
  goldSatin.roughness = 0.36;
  const navy = new THREE.MeshPhysicalMaterial({
    color: 0x1a2332, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12
  });

  const seg = small ? 48 : 96;
  const lathe = (pts, mat) => new THREE.Mesh(
    new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), mat
  );
  const rod = (a, b, r, mat) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 12), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  };

  const model = new THREE.Group();
  scene.add(model);

  /* Plinth */
  const plinth = lathe([[0, 0], [1.75, 0], [1.75, 0.14], [1.6, 0.2], [1.6, 0.46], [1.4, 0.54], [0, 0.54]], navy);
  plinth.position.y = -3.15;
  model.add(plinth);
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.605, 0.022, 12, seg * 2), gold);
  band.rotation.x = Math.PI / 2;
  band.position.y = -3.15 + 0.33;
  model.add(band);

  /* Foot + column */
  const foot = lathe([[0, 0], [0.95, 0], [0.95, 0.06], [0.75, 0.14], [0.46, 0.3], [0.28, 0.52], [0.2, 0.72], [0, 0.72]], gold);
  foot.position.y = -2.61;
  model.add(foot);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.1, 3.75, 32), gold);
  column.position.y = -0.03;
  model.add(column);
  [[-1.25, 0.17, 0.62], [0.35, 0.13, 0.8], [1.25, 0.11, 0.8]].forEach(([y, r, sy]) => {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), goldSatin);
    knob.scale.y = sy;
    knob.position.y = y;
    model.add(knob);
  });
  [-1.45, -1.05, 0.15, 0.55].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 10, 40), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    model.add(ring);
  });

  /* Finial */
  const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 24), gold);
  finialBall.position.y = 1.98;
  model.add(finialBall);
  const flame = lathe([[0, 0], [0.1, 0.08], [0.11, 0.18], [0.06, 0.34], [0, 0.48]], gold);
  flame.position.y = 2.06;
  model.add(flame);

  /* Beam (gull-wing curve, like the brand mark) */
  const beam = new THREE.Group();
  beam.position.y = 1.72;
  model.add(beam);
  const beamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.15, 0.16, 0), new THREE.Vector3(-1.3, -0.04, 0), new THREE.Vector3(-0.45, 0.12, 0),
    new THREE.Vector3(0, 0.04, 0),
    new THREE.Vector3(0.45, 0.12, 0), new THREE.Vector3(1.3, -0.04, 0), new THREE.Vector3(2.15, 0.16, 0)
  ]);
  beam.add(new THREE.Mesh(new THREE.TubeGeometry(beamCurve, 160, 0.045, 14, false), gold));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 40), goldSatin);
  hub.rotation.x = Math.PI / 2;
  beam.add(hub);

  /* Hangers: chains + pans, kept upright while the beam tips */
  const hangers = [-1, 1].map((side) => {
    const end = new THREE.Vector3(2.15 * side, 0.16, 0);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), gold);
    cap.position.copy(end);
    beam.add(cap);

    const hanger = new THREE.Group();
    hanger.position.copy(end);
    beam.add(hanger);

    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 10, 32), gold);
    hook.position.y = -0.1;
    hanger.add(hook);

    const drop = 2.05;
    const rim = 0.66;
    const top = new THREE.Vector3(0, -0.16, 0);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      const p = new THREE.Vector3(Math.cos(a) * rim, -drop, Math.sin(a) * rim);
      hanger.add(rod(top, p, 0.011, goldSatin));
    }
    const pan = lathe([[0, -0.24], [0.28, -0.22], [0.52, -0.13], [0.66, -0.02], [0.7, 0.01], [0.69, 0.02], [0.64, -0.01], [0.5, -0.11], [0.27, -0.19], [0, -0.21]], gold);
    pan.position.y = -drop;
    hanger.add(pan);
    const panRim = new THREE.Mesh(new THREE.TorusGeometry(0.695, 0.02, 10, seg), gold);
    panRim.rotation.x = Math.PI / 2;
    panRim.position.y = -drop + 0.012;
    hanger.add(panRim);
    return hanger;
  });

  /* Soft contact shadow */
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(26,35,50,0.55)');
    grd.addColorStop(1, 'rgba(26,35,50,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -3.16;
  model.add(shadow);

  /* Gold dust */
  const dustCount = small ? 90 : 180;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2.2 + Math.random() * 2.6;
    const t = Math.random() * Math.PI * 2;
    dustPos[i * 3] = Math.cos(t) * r;
    dustPos[i * 3 + 1] = -2.8 + Math.random() * 5.6;
    dustPos[i * 3 + 2] = Math.sin(t) * r;
  }
  const dotTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  })();
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xc9a96e, size: 0.07, map: dotTex, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true
  }));
  scene.add(dust);

  /* Lights: warm key + brand-blue rim for depth */
  const key = new THREE.DirectionalLight(0xfff0d4, 1.7);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6d8fe0, 2.4);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  const applyTheme = () => {
    const dark = (window.Site && window.Site.currentTheme ? window.Site.currentTheme() : 'light') === 'dark';
    shadow.material.opacity = dark ? 0.9 : 0.55;
    dust.material.opacity = dark ? 0.9 : 0.6;
    renderer.toneMappingExposure = dark ? 1.15 : 1.05;
  };
  applyTheme();
  window.addEventListener('themechange', applyTheme);

  /* ---------- Sizing ---------- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitH = 3.35 / half;              // model is ~6.1 units tall
    const fitW = 3.2 / (half * camera.aspect);
    camera.position.set(0, 0.15, Math.max(fitH, fitW));
    camera.lookAt(0, -0.25, 0);
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  };

  /* ---------- Interaction ---------- */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let spin = 0;
  let spinVel = 0;
  let dragging = false;
  let lastX = 0;

  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
      if (dragging) {
        spinVel = (e.clientX - lastX) * 0.0045;
        spin += spinVel;
        lastX = e.clientX;
      }
    }, { passive: true });
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      lastX = e.clientX;
    });
    window.addEventListener('pointerup', () => { dragging = false; });
  }

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  let running = false;
  let visible = true;

  const frame = () => {
    const t = clock.getElapsedTime();
    const intro = reduce ? 1 : easeOut(Math.min(1, Math.max(0, (t - 0.5) / 2.4)));
    const progress = window.__heroProgress || 0;

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    if (!dragging) { spinVel *= 0.94; spin += spinVel; }

    const idle = reduce ? 0 : Math.sin(t * 0.22) * 0.45;
    model.rotation.y = -0.35 + idle + spin + pointer.sx * 0.7 + progress * 1.6 - (1 - intro) * 2.4;
    model.rotation.x = pointer.sy * 0.12 + progress * 0.18;
    model.position.y = (reduce ? 0 : Math.sin(t * 0.8) * 0.06) - (1 - intro) * 0.6 + progress * 0.4;
    model.scale.setScalar((0.82 + 0.18 * intro) * (1 - progress * 0.12));

    beam.rotation.z = (reduce ? 0.04 : Math.sin(t * 0.65) * 0.075) - pointer.sx * 0.14;
    hangers.forEach((h, i) => {
      h.rotation.z = -beam.rotation.z + (reduce ? 0 : Math.sin(t * 1.4 + i * 1.7) * 0.018);
    });
    dust.rotation.y = t * 0.025;
    dust.position.y = reduce ? 0 : Math.sin(t * 0.3) * 0.1;

    renderer.render(scene, camera);
  };

  const sync = () => {
    const shouldRun = visible && !document.hidden && !reduce;
    if (shouldRun === running) return;
    running = shouldRun;
    renderer.setAnimationLoop(running ? frame : null);
  };

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; sync(); }).observe(stage);
  document.addEventListener('visibilitychange', sync);

  resize();
  frame();
  sync();
  stage.classList.add('is-ready');
}
