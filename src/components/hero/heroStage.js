/* Hero stage: device timeline (three.js), black-hole transition and the planetarium sky.
   Ported line for line from the hero-devices.html prototype, plus scroll parallax for the sky, an off-screen
   pause for the 3D loop and teardown. mountHero() starts everything and returns a function that undoes it. */
export function mountHero({ sceneEl, skyEl, images, ascii: ASCII }) {
  const IMG = images;
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const life = new AbortController(), signal = life.signal, cleanups = [], mountedAt = performance.now();
  // While the page is being scrolled, the sky holds its last frame and the 3D renders every other frame, leaving
  // the main thread and GPU to the scroll. Neither shows: both move with the page (the sky's drift is on the
  // compositor), only their slow inner motion pauses or halves for the length of the gesture.
  let scrollingUntil = 0;
  addEventListener("scroll", () => { scrollingUntil = performance.now() + 150; }, { passive: true, signal });
  const scrolling = () => performance.now() < scrollingUntil;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };

  // Background sky: a slow planetarium dome. The celestial sphere turns about a pole off the hero's top-left;
  // stars carry real colour temperatures and a steep magnitude curve; the Milky Way, three galaxies and a pulsar
  // ride with it. Nearer: a ringed gas giant with an orbiting moon and a few tumbling asteroids, lit by an
  // off-screen sun at the upper left, plus what crosses a real sky: the ISS, satellites, a Starlink train, and
  // now and then a comet whose ion tail points away from that sun. Dark theme: true colour. Light theme: an
  // observatory plate, the same sky printed as ink. Everything is small, slow and faint: the black hole stays
  // the brightest thing on the page, its surroundings are kept clear, and the copy keeps its contrast.
  //
  // Scrolling never redraws it. The sky is three depth planes (far: Milky Way + stars; mid: galaxies, pulsar and
  // what crosses the sky; near: the planet, its moon, asteroids), each its own canvas. The browser drifts them at
  // their own pace and fades the sky out with scroll-driven CSS animations on the compositor thread; the clear
  // zone around the black hole and the fade below the hero are static CSS masks. The canvases redraw only for
  // the sky's own slow motion: far at 15 fps, mid and near at 30, never more than one heavy draw per frame.
  (() => {
    const box = skyEl, TAU = Math.PI * 2, OMEGA = .0011;   // sky rotation, rad/s
    let W = 0, H = 0, HC = 0, raf = 0, last = 0, clock0 = 0, onScreen = true, built = {}, stars = [], sky = null;
    let planet = null, rocks = [], ev = null, ctx = null, tick = 0;
    const plane = (v) => {
      const c = document.createElement("canvas");
      c.className = "sky-plane";
      return { c, ctx: c.getContext("2d"), v };                       // v: apparent speed against the page
    };
    const far = plane(.34), mid = plane(.5), near = plane(.68), planes = [far, mid, near];
    const soft = document.createElement("div"), hard = document.createElement("div");
    soft.className = "sky-soft";                                       // clear zone fades in from r0 to r1
    hard.className = "sky-hard";                                       // bodies: cut at r0, as before
    soft.append(far.c, mid.c);
    hard.append(near.c);
    box.append(soft, hard);
    cleanups.push(() => { soft.remove(); hard.remove(); });

    function mulberry(a) {
      return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const gauss = (r) => (r() + r() + r() + r() - 2) * 1.732;          // ~N(0, 1)
    const layer = (w, h) => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
      return [c, c.getContext("2d")];
    };
    // stellar colour by temperature (O/B blue-white ... K/M orange), weighted like a real field
    const TINTS = [[155, 176, 255], [170, 191, 255], [202, 215, 255], [248, 247, 255], [255, 244, 234], [255, 210, 161], [255, 190, 120]];
    const TW = [.03, .07, .15, .3, .25, .13, .07];
    const TINT_CSS = TINTS.map((c) => `rgb(${c})`);
    const INK = [24, 24, 30], INK_CSS = "rgb(24,24,30)";
    const pickTint = (r) => { let x = r(), i = 0; while (i < TW.length - 1 && (x -= TW[i]) > 0) i++; return i; };
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

    // ---------------------------------------------------------------- layout (on resize)
    function layout() {
      const rect = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 1.5);
      W = rect.width; HC = rect.height; H = Math.min(HC, box.parentElement.getBoundingClientRect().height);
      for (const p of planes) {
        p.c.width = Math.round(W * dpr); p.c.height = Math.round(HC * dpr);
        p.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const rng = mulberry(20261027);
      const P = { x: -W * .35, y: -H * .6 };                             // celestial pole, off the top-left
      const ang = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.atan2(y - P.y, x - P.x));
      const a0 = Math.min(...ang) - .3, a1 = Math.max(...ang) + .3;
      const d0 = Math.hypot(P.x, P.y) * .97, d1 = Math.hypot(W - P.x, H - P.y) * 1.02;
      const area = .5 * (a1 - a0) * (d1 * d1 - d0 * d0);
      stars = Array.from({ length: Math.min(3200, Math.round(area / 950)) }, () => ({
        rho: Math.sqrt(d0 * d0 + rng() * (d1 * d1 - d0 * d0)),          // uniform per unit area
        th: a0 + rng() * (a1 - a0),
        m: Math.pow(rng(), 3.4),                                         // most stars faint, a few bright
        tint: pickTint(rng), tw: rng() * TAU, tf: .5 + rng() * 1.6,
      }));
      const toSky = (x, y) => ({ rho: Math.hypot(x - P.x, y - P.y), th: Math.atan2(y - P.y, x - P.x) });
      sky = {
        P, a0, span: a1 - a0, d1,
        objs: [
          { kind: "spiral", ...toSky(W * .4, H * .09), size: 54, rot: .6, tilt: .56 },
          { kind: "edge", ...toSky(W * .63, H * .93), size: 58, rot: -.32 },
          { kind: "elliptical", ...toSky(W * .07, H * .95), size: 26, rot: .4 },
          { kind: "pulsar", ...toSky(W * .56, H * .14) },
        ],
      };
      const r = Math.round(Math.min(120, Math.max(54, H * .13)));
      planet = { r, x: W - r * .5, y: H - r * .42, frame: null, key: "" };
      rocks = Array.from({ length: 7 }, (_, i) => ({
        x: rng() * (W - r * 2.6), y: H * (.78 + rng() * .16), vx: -(2 + rng() * 5), vy: (rng() - .5) * .6,   // their own lane, left of the planet
        rot: rng() * TAU, amp: .15 + rng() * .25, ph: rng() * TAU, sprite: i % 6, s: .55 + rng() * .6,
      }));
      ev = { iss: { next: 5 }, comet: { next: 11 }, train: { next: 34 }, sats: [{ next: 2 }, { next: 8 }, { next: 15 }, { next: 23 }] };
      built = {};
      placed = "";
      place();
    }

    // Geometry for the CSS side: the clear zone around the device, the fade below the hero, and the scroll
    // ranges for the drift and the fade-out (the hero is the top of the page, so scroll offset = scrollY).
    let placed = "";
    function place() {
      const br = box.getBoundingClientRect(), sr = sceneEl.getBoundingClientRect(), sh = sceneEl.offsetHeight;
      const range = H * 1.6, vars = {
        "--hx": sr.left + sr.width / 2 - br.left, "--hy": sr.top + sr.height / 2 - br.top,   // centre: scale-invariant
        "--r0": sh * .42, "--r1": sh * .74,
        "--hb": H, "--fl": (HC - H) * .92, "--range": range, "--fade-a": H * .2, "--fade-b": H * .95,
      };
      const key = Object.values(vars).map(Math.round).join();
      if (key === placed) return;                                     // unchanged: no style work
      placed = key;
      for (const k in vars) box.style.setProperty(k, `${Math.round(vars[k])}px`);
      for (const p of planes) p.c.style.setProperty("--drift", `${Math.round(range * (1 - p.v))}px`);
      if (!SDA) scrolled();
    }

    // Browsers without scroll-driven animations: the same mapping, written once per scrolled frame.
    const SDA = CSS.supports("animation-timeline: scroll()");
    function scrolled() {
      const s = Math.max(0, scrollY), d = Math.min(s, H * 1.6);
      if (!reduce) for (const p of planes) p.c.style.transform = `translate3d(0,${(d * (1 - p.v)).toFixed(1)}px,0)`;
      box.style.opacity = (1 - smooth((s - H * .2) / (H * .75))).toFixed(3);
    }
    if (!SDA) {
      let queued = 0;
      addEventListener("scroll", () => {
        if (!queued) queued = requestAnimationFrame(() => { queued = 0; if (sky) scrolled(); });
      }, { passive: true, signal });
      cleanups.push(() => cancelAnimationFrame(queued));
    }

    // ---------------------------------------------------------------- per-theme sprites (built once per theme)
    function sprites(light) {
      const key = light ? "l" : "d";
      if (built[key]) return built[key];
      const S = {};
      S.glow = TINTS.map((tint) => {
        const col = light ? INK : tint, [c, x] = layer(32, 32), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, `rgba(${col},${light ? .85 : 1})`); g.addColorStop(.16, `rgba(${col},${light ? .45 : .6})`);
        g.addColorStop(.42, `rgba(${col},.07)`); g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g; x.fillRect(0, 0, 32, 32);
        return c;
      });
      { // JWST-style diffraction spikes: six from the hexagonal mirror, a fainter horizontal pair from the strut
        const [c, x] = layer(96, 96), col = light ? INK : [236, 242, 255];
        x.translate(48, 48);
        const ray = (a, len, alpha, w) => {
          const g = x.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
          g.addColorStop(0, `rgba(${col},${alpha})`); g.addColorStop(1, `rgba(${col},0)`);
          x.strokeStyle = g; x.lineWidth = w;
          x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * len, Math.sin(a) * len); x.stroke();
        };
        for (let k = 0; k < 6; k++) ray(Math.PI / 2 + (k * Math.PI) / 3, 46, .6, .9);
        ray(0, 26, .3, .6); ray(Math.PI, 26, .3, .6);
        S.spike = c;
      }
      { // Milky Way: soft star clouds along a diagonal band, split by dark dust rifts (rotates with the sky)
        const R = sky.d1, sc = .22, [c, x] = layer(2 * R * sc, 2 * R * sc), rng = mulberry(77);
        x.scale(sc, sc); x.translate(R, R);
        const A = { x: W * 1.08 - sky.P.x, y: -H * .12 - sky.P.y }, B = { x: W * .22 - sky.P.x, y: H * 1.2 - sky.P.y };
        const len = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / len, uy = (B.y - A.y) / len, nx = -uy, ny = ux;
        const col = light ? INK : [255, 244, 228], cool = light ? INK : [190, 210, 255];
        for (let i = 0; i < 560; i++) {
          const s = (rng() * 3 - 1) * len, w = gauss(rng) * 125 * (1 + .35 * Math.sin(s * .0035)), rad = 45 + rng() * 150;
          const px = A.x + ux * s + nx * w, py = A.y + uy * s + ny * w;
          const edge = Math.max(0, 1 - Math.pow(Math.hypot(px, py) / (R * .92), 6));   // fade out before the texture's edge
          const a = (light ? .018 : .03) * Math.max(0, 1 - Math.abs(w) / 320) * edge, tone = Math.abs(w) > 150 ? cool : col;
          if (a <= 0) continue;
          const g = x.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(0, `rgba(${tone},${a})`); g.addColorStop(1, `rgba(${tone},0)`);
          x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
        }
        x.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 320; i++) {
          const s = (rng() * 3 - 1) * len, w = gauss(rng) * 42 + Math.sin(s * .006) * 30, rad = 18 + rng() * 55;
          const px = A.x + ux * s + nx * w, py = A.y + uy * s + ny * w;
          const g = x.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(0, "rgba(0,0,0,.32)"); g.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
        }
        S.milky = { c, R };
      }
      { // face-on spiral: two logarithmic arms of young blue stars around a warm bulge
        const [c, x] = layer(96, 96), rng = mulberry(5), core = light ? INK : [255, 232, 196], arm = light ? INK : [188, 208, 255];
        x.translate(48, 48);
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 13);
        g.addColorStop(0, `rgba(${core},${light ? .55 : .8})`); g.addColorStop(1, `rgba(${core},0)`);
        x.fillStyle = g; x.fillRect(-13, -13, 26, 26);
        for (let i = 0; i < 1600; i++) {
          const th = Math.pow(rng(), .8) * 3.6 * Math.PI, rr = 3 * Math.exp(.2 * th) + gauss(rng) * 1.8;
          const a = th + (i & 1) * Math.PI + gauss(rng) * .16;
          if (rr > 44 || rr < 2) continue;
          x.fillStyle = `rgba(${arm},${(light ? .2 : .26) * (1 - rr / 46)})`;
          x.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 1, 1);
        }
        S.spiral = c;
      }
      { // edge-on disk galaxy with its dust lane
        const [c, x] = layer(96, 24), col = light ? INK : [250, 236, 214];
        x.translate(48, 12); x.scale(1, .2);
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 46);
        g.addColorStop(0, `rgba(${col},${light ? .5 : .7})`); g.addColorStop(.35, `rgba(${col},.18)`); g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill();
        x.setTransform(1, 0, 0, 1, 0, 0);
        x.globalCompositeOperation = "destination-out";
        const lane = x.createLinearGradient(0, 11, 0, 13.6);
        lane.addColorStop(0, "rgba(0,0,0,0)"); lane.addColorStop(.5, "rgba(0,0,0,.7)"); lane.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = lane; x.fillRect(10, 10.5, 76, 3.6);
        S.edge = c;
      }
      { // giant elliptical: a smooth, warm, featureless glow
        const [c, x] = layer(48, 48), col = light ? INK : [255, 226, 190];
        const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
        g.addColorStop(0, `rgba(${col},${light ? .45 : .6})`); g.addColorStop(.3, `rgba(${col},.14)`); g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g; x.fillRect(0, 0, 48, 48);
        S.elliptical = c;
      }
      // asteroids: irregular, cratered, lit from the upper left
      S.rocks = Array.from({ length: 6 }, (_, i) => {
        const rng = mulberry(300 + i), s = 9 + rng() * 11, [c, x] = layer(s * 2 + 4, s * 2 + 4);
        x.translate(s + 2, s + 2);
        x.beginPath();
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * TAU, rr = s * (.6 + rng() * .4);
          k ? x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .78) : x.moveTo(Math.cos(a) * rr, Math.sin(a) * rr * .78);
        }
        x.closePath();
        const g = x.createRadialGradient(-s * .45, -s * .4, s * .08, 0, 0, s * 1.1);
        if (light) { g.addColorStop(0, "rgba(24,24,30,.1)"); g.addColorStop(1, "rgba(24,24,30,.5)"); }
        else { g.addColorStop(0, "rgb(156,146,132)"); g.addColorStop(.55, "rgb(72,66,60)"); g.addColorStop(1, "rgb(10,9,8)"); }
        x.fillStyle = g; x.fill();
        x.save(); x.clip();
        for (let k = 0; k < 3; k++) {
          x.fillStyle = light ? "rgba(24,24,30,.12)" : "rgba(0,0,0,.32)";
          x.beginPath(); x.arc((rng() - .5) * s, (rng() - .5) * s * .7, s * (.08 + rng() * .12), 0, TAU); x.fill();
        }
        x.restore();
        return c;
      });
      { // the ISS: integrated truss, eight solar-array wings, pressurised modules and radiators
        const [c, x] = layer(44, 22), metal = light ? "rgba(24,24,30,.8)" : "rgba(232,228,216,.95)";
        const wing = light ? "rgba(24,24,30,.55)" : "rgba(198,160,92,.95)";
        x.translate(22, 11);
        x.fillStyle = metal; x.fillRect(-18, -.6, 36, 1.2);
        x.fillStyle = wing;
        for (const sx of [-15, -10.5, 10.5, 15]) { x.fillRect(sx - 1.6, -9, 3.2, 7.4); x.fillRect(sx - 1.6, 1.6, 3.2, 7.4); }
        x.fillStyle = metal; x.fillRect(-2.6, -3.6, 5.2, 7.2); x.fillRect(-5.5, -1.1, 11, 2.2);
        x.fillStyle = light ? "rgba(24,24,30,.35)" : "rgba(255,255,255,.55)"; x.fillRect(-3, 4, 6, 1);
        S.iss = c;
      }
      { // moon: small lit sphere
        const [c, x] = layer(32, 32), g = x.createRadialGradient(10, 10, 1, 16, 16, 16);
        if (light) { g.addColorStop(0, "rgba(24,24,30,.08)"); g.addColorStop(.7, "rgba(24,24,30,.4)"); g.addColorStop(1, "rgba(24,24,30,.6)"); }
        else { g.addColorStop(0, "rgb(214,206,192)"); g.addColorStop(.6, "rgb(92,86,78)"); g.addColorStop(1, "rgb(14,13,12)"); }
        x.fillStyle = g; x.beginPath(); x.arc(16, 16, 15.5, 0, TAU); x.fill();
        S.moon = c;
      }
      return (built[key] = S);
    }

    // ---------------------------------------------------------------- ringed gas giant (re-shaded twice a second)
    // The rings never change, so they are drawn once per theme (back half, front half). The banded body turns
    // slowly; it is re-shaded twice a second a few rows per frame, so no single frame carries the whole job.
    const P_TILT = -.38, P_OPEN = .3, P_L = [-.62, -.5, .6], P_LL = Math.hypot(...P_L);
    function planetRings(light) {
      const r = planet.r, half = Math.ceil(r * 2.35);
      const half_ = (front) => {
        const [c, x] = layer(half * 2, half * 2);
        x.translate(half, half); x.rotate(P_TILT);
        x.beginPath(); x.rect(-half * 2, front ? 0 : -half * 2, half * 4, half * 2); x.clip();
        for (let k = 0; k < 110; k++) {
          const f = k / 110, rr = r * (1.28 + f * .92);
          let b = .5 + .25 * Math.sin(f * 61) * Math.sin(f * 23) + .2 * (1 - f);
          if (f > .6 && f < .655) b = .05;                                // Cassini division
          if (f < .1) b *= .35;                                            // faint inner C ring
          x.strokeStyle = light ? `rgba(24,24,30,${b * .32})` : `rgba(220,202,166,${b * .55})`;
          x.lineWidth = (r * .92) / 110 * 1.5;
          x.beginPath(); x.ellipse(0, 0, rr, rr * P_OPEN, 0, 0, TAU); x.stroke();
        }
        return c;
      };
      return { back: half_(false), front: half_(true), half, light };
    }
    function planetJob(light, spin, key) {
      const r = planet.r, [pc, px] = layer(2 * r, 2 * r);
      return { light, spin, key, pc, px, img: px.createImageData(2 * r, 2 * r), j: 0 };
    }
    function planetFinish(job) {
      const R = planet.rings, r = planet.r, [c, x] = layer(R.half * 2, R.half * 2);
      job.px.putImageData(job.img, 0, 0);
      x.drawImage(R.back, 0, 0); x.drawImage(job.pc, R.half - r, R.half - r); x.drawImage(R.front, 0, 0);
      return { c, half: R.half, light: job.light };
    }
    // Shade rows job.j .. job.j + n of the body; true once the whole disc is done.
    function planetRows(job, n) {
      const r = planet.r, d = job.img.data, light = job.light, spin = job.spin, L = P_L, ll = P_LL;
      const ct = Math.cos(P_TILT), st = Math.sin(P_TILT), end = Math.min(2 * r, job.j + n);
      for (let j = job.j; j < end; j++) {
        for (let i = 0; i < 2 * r; i++) {
          const nx = (i + .5 - r) / r, ny = (j + .5 - r) / r, q = nx * nx + ny * ny;
          if (q > 1) continue;
          const nz = Math.sqrt(1 - q), lat = -nx * st + ny * ct, lon = Math.atan2(nx * ct + ny * st, nz) + spin;
          let band = .5 + .22 * Math.sin(lat * 18 + Math.sin(lon * 2 + lat * 6) * .35) + .12 * Math.sin(lat * 41 + 1.3) + .05 * Math.sin(lat * 90 + lon);
          const oval = Math.exp(-(((lat - .3) / .05) ** 2) - ((wrapA(lon - 1) / .22) ** 2));   // storm oval
          band = band * (1 - .3 * oval) + .25 * oval;
          const lam = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / ll);
          let shade = (.025 + .975 * lam) * (.35 + .65 * Math.pow(nz, .45));                  // terminator + limb darkening
          if (Math.abs(lat - .16) < .022) shade *= .55;                                         // ring shadow on the cloud tops
          const edge = Math.min(1, (1 - Math.sqrt(q)) * r * 1.2), k = (j * 2 * r + i) * 4;
          if (light) {
            const ink = 1 - Math.min(1, shade * (.8 + .3 * band));
            d[k] = 24; d[k + 1] = 24; d[k + 2] = 30; d[k + 3] = 255 * (.06 + .5 * ink) * edge;
          } else {
            d[k] = (176 + 58 * band) * shade; d[k + 1] = (146 + 70 * band) * shade; d[k + 2] = (102 + 76 * band) * shade; d[k + 3] = 255 * edge;
          }
        }
      }
      job.j = end;
      return end >= 2 * r;
    }
    // Called every frame: keeps planet.frame current, a slice at a time (whole, at once, only when it has none yet
    // or the theme changed).
    function updatePlanet(t, light) {
      if (!planet.rings || planet.rings.light !== light) planet.rings = planetRings(light);
      const key = Math.floor(t * 2);
      if (!planet.frame || planet.frame.light !== light) {
        const job = planetJob(light, t * .05, key);
        planetRows(job, Infinity);
        planet.frame = planetFinish(job); planet.key = key; planet.job = null;
        return;
      }
      if (planet.key !== key && !planet.job) planet.job = planetJob(light, t * .05, key);
      if (planet.job && planetRows(planet.job, 24)) {
        planet.frame = planetFinish(planet.job); planet.key = planet.job.key; planet.job = null;
      }
    }

    // ---------------------------------------------------------------- planes
    const at = (o, rot) => {                                          // sky object -> canvas position
      const th = sky.a0 + ((((o.th + rot - sky.a0) % sky.span) + sky.span) % sky.span);
      return [sky.P.x + o.rho * Math.cos(th), sky.P.y + o.rho * Math.sin(th)];
    };
    // far: Milky Way + stars
    function drawFar(t, light, S) {
      const rot = t * OMEGA;
      ctx = far.ctx;
      ctx.clearRect(0, 0, W, HC);
      ctx.save();
      ctx.translate(sky.P.x, sky.P.y); ctx.rotate(rot);
      ctx.drawImage(S.milky.c, -S.milky.R, -S.milky.R, 2 * S.milky.R, 2 * S.milky.R);
      ctx.restore();
      for (const s of stars) {
        const [x, y] = at(s, rot);
        if (x < -24 || y < -24 || x > W + 24 || y > HC + 24) continue;
        const tw = 1 + .2 * Math.sin(t * s.tf + s.tw) * (s.m > .06 ? 1 : 0);
        if (s.m > .86) {
          const sz = 6 + 12 * s.m;
          ctx.globalAlpha = (light ? .5 : .85) * tw * (.5 + .5 * s.m);
          ctx.drawImage(S.glow[s.tint], x - sz / 2, y - sz / 2, sz, sz);
          if (s.m > .975) { ctx.globalAlpha = (light ? .22 : .32) * tw; ctx.drawImage(S.spike, x - 22, y - 22, 44, 44); }
        } else {
          const sz = s.m > .25 ? 1.4 : 1;
          ctx.globalAlpha = Math.min(1, (light ? .4 : .72) * (.12 + .88 * s.m) * tw);
          ctx.fillStyle = light ? INK_CSS : TINT_CSS[s.tint];
          ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    }
    // mid: galaxies, pulsar, and the ISS, satellites, Starlink and comets
    function drawMid(t, light, S) {
      const rot = t * OMEGA;
      ctx = mid.ctx;
      ctx.clearRect(0, 0, W, HC);
      for (const o of sky.objs) {
        const [x, y] = at(o, rot);
        ctx.save(); ctx.translate(x, y);
        if (o.kind === "pulsar") {
          const spin = t * 1.4, pulse = Math.pow(Math.abs(Math.cos(spin)), 18);
          ctx.rotate(spin);
          for (const side of [1, -1]) {                                   // lighthouse beams
            const g = ctx.createLinearGradient(0, 0, side * 34, 0);
            g.addColorStop(0, light ? "rgba(24,24,30,.16)" : "rgba(176,206,255,.22)"); g.addColorStop(1, "rgba(176,206,255,0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * 34, -2.6); ctx.lineTo(side * 34, 2.6); ctx.closePath(); ctx.fill();
          }
          const sz = 7 + pulse * 6;
          ctx.globalAlpha = (light ? .45 : .6) + .35 * pulse;
          ctx.drawImage(S.glow[0], -sz / 2, -sz / 2, sz, sz);
        } else {
          ctx.rotate(o.rot + rot);
          ctx.globalAlpha = light ? .55 : .7;
          if (o.kind === "spiral") { ctx.scale(1, o.tilt); ctx.drawImage(S.spiral, -o.size / 2, -o.size / 2, o.size, o.size); }
          else if (o.kind === "edge") ctx.drawImage(S.edge, -o.size / 2, -o.size * .125, o.size, o.size * .25);
          else ctx.drawImage(S.elliptical, -o.size / 2, -o.size * .35, o.size, o.size * .7);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      moving(t, light, S);
    }
    // near: the planet, its moon and the asteroids
    function drawNear(t, light, S) {
      ctx = near.ctx;
      ctx.clearRect(0, 0, W, HC);
      bodies(t, light, S);
    }
    function drawAll(t) {
      const light = !root.classList.contains("dark"), S = sprites(light);
      updatePlanet(t, light);
      drawFar(t, light, S); drawMid(t, light, S); drawNear(t, light, S);
    }

    function bodies(t, light, S) {
      const { c, half } = planet.frame, r = planet.r, tilt = -.38, open = .3, phi = t * .055;
      const mx = Math.cos(phi) * r * 3.1, my = Math.sin(phi) * r * 3.1 * open;
      const moon = [planet.x + mx * Math.cos(tilt) - my * Math.sin(tilt), planet.y + mx * Math.sin(tilt) + my * Math.cos(tilt)];
      const behind = Math.sin(phi) < 0, hidden = behind && Math.hypot(moon[0] - planet.x, moon[1] - planet.y) < r;
      const drawMoon = () => { if (!hidden) { const s = r * .24; ctx.globalAlpha = light ? .8 : .9; ctx.drawImage(S.moon, moon[0] - s / 2, moon[1] - s / 2, s, s); ctx.globalAlpha = 1; } };
      if (behind) drawMoon();
      ctx.globalAlpha = light ? .85 : .7;                                   // muted: the black hole stays the star
      ctx.drawImage(c, planet.x - half, planet.y - half);
      ctx.globalAlpha = 1;
      if (!behind) drawMoon();
      for (const k of rocks) {
        const sp = S.rocks[k.sprite], w = sp.width * k.s, h2 = sp.height * k.s;
        ctx.save();
        ctx.translate(k.x, k.y); ctx.rotate(k.rot + k.amp * Math.sin(t * .3 + k.ph));
        ctx.globalAlpha = light ? .7 : .8;
        ctx.drawImage(sp, -w / 2, -h2 / 2, w, h2);
        ctx.restore();
      }
    }

    // ISS, satellites, a Starlink train and comets: each runs on its own unhurried schedule
    const SUN = () => [-W * .4, -H * .5];
    function moving(t, light, S) {
      const rng = Math.random;
      // satellites: faint steady points, the odd sunlit glint
      for (const s of ev.sats) {
        if (!s.on && t >= s.next) {
          const side = rng() < .5, y0 = H * (.05 + rng() * .5);
          s.on = { x: side ? -10 : W + 10, y: y0, vx: (side ? 1 : -1) * (16 + rng() * 18), vy: (rng() - .3) * 9, glint: rng() < .25 ? t + 2 + rng() * 6 : -1 };
        }
        if (!s.on) continue;
        const o = s.on, dt = t - (o.t || t); o.t = t;
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (o.x < -20 || o.x > W + 20 || o.y < -20 || o.y > HC + 20) { s.on = null; s.next = t + 6 + rng() * 16; continue; }
        const g = o.glint > 0 ? Math.exp(-(((t - o.glint) / .35) ** 2)) : 0;
        ctx.globalAlpha = (light ? .4 : .5) + g * .45;
        ctx.fillStyle = light ? INK_CSS : "rgb(236,238,245)";
        ctx.fillRect(o.x - .7, o.y - .7, 1.4 + g * 1.2, 1.4 + g * 1.2);
      }
      // Starlink train: a string of beads crossing together, rarely
      const tr = ev.train;
      if (!tr.on && t >= tr.next) tr.on = { t0: t, x0: W * (.3 + rng() * .5), y0: -12, vx: -14 - rng() * 8, vy: 20 + rng() * 6 };
      if (tr.on) {
        const o = tr.on, k = t - o.t0;
        ctx.fillStyle = light ? INK_CSS : "rgb(232,236,248)";
        let any = false;
        for (let i = 0; i < 10; i++) {
          const x = o.x0 + o.vx * (k - i * .45), y = o.y0 + o.vy * (k - i * .45);
          if (k - i * .45 < 0 || y > HC + 10 || x < -10) continue;
          any = true;
          ctx.globalAlpha = light ? .32 : .38;
          ctx.fillRect(x - .6, y - .6, 1.2, 1.2);
        }
        if (!any && k > 2) { tr.on = null; tr.next = t + 55 + rng() * 45; }
      }
      // ISS: a bright, steady pass that swells to a peak and fades
      const is = ev.iss;
      if (!is.on && t >= is.next) {
        const y0 = H * (.13 + rng() * .1);
        is.on = { t0: t, x0: -30, y0, x1: W + 30, y1: y0 + H * (.05 + rng() * .1), dur: (W + 60) / 62 };
      }
      if (is.on) {
        const o = is.on, u = (t - o.t0) / o.dur;
        if (u >= 1) { is.on = null; is.next = t + 26 + rng() * 22; }
        else {
          const x = o.x0 + (o.x1 - o.x0) * u, y = o.y0 + (o.y1 - o.y0) * u, b = Math.pow(Math.sin(Math.PI * u), 1.4);
          if (!light) { ctx.globalAlpha = .3 * b; ctx.drawImage(S.glow[5], x - 7, y - 7, 14, 14); }
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(o.y1 - o.y0, o.x1 - o.x0) + .25);
          ctx.globalAlpha = (light ? .55 : .75) * (.35 + .65 * b);
          ctx.drawImage(S.iss, -11, -5.5, 22, 11);
          ctx.restore();
        }
      }
      // comet: ion tail straight away from the sun, dust tail curving along the path it left
      const cm = ev.comet;
      if (!cm.on && t >= cm.next) cm.on = { t: t, x: W * (.05 + rng() * .45), y: -30, vx: 34 + rng() * 22, vy: 22 + rng() * 14, trail: [], lastTrail: t };
      if (cm.on) {
        const o = cm.on, dt = t - o.t; o.t = t;
        o.vx += -o.vy * .012 * dt; o.vy += o.vx * .012 * dt;            // gentle curve
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (t - o.lastTrail > .09) { o.trail.unshift([o.x, o.y]); o.trail.length = Math.min(o.trail.length, 46); o.lastTrail = t; }
        if (o.x > W + 160 || o.y > HC + 160) { cm.on = null; cm.next = t + 30 + rng() * 32; }
        else {
          const dust = light ? "24,24,30" : "255,236,206";
          o.trail.forEach(([x, y], i) => {
            const f = 1 - i / o.trail.length;
            ctx.globalAlpha = (light ? .07 : .09) * f;
            ctx.fillStyle = `rgb(${dust})`;
            ctx.beginPath(); ctx.arc(x, y, 1.6 + i * .32, 0, TAU); ctx.fill();
          });
          const [sx, sy] = SUN(), ax = o.x - sx, ay = o.y - sy, al = Math.hypot(ax, ay), L2 = 130;
          const g = ctx.createLinearGradient(o.x, o.y, o.x + (ax / al) * L2, o.y + (ay / al) * L2);
          g.addColorStop(0, light ? "rgba(24,24,30,.3)" : "rgba(150,196,255,.42)"); g.addColorStop(1, "rgba(150,196,255,0)");
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + (ax / al) * L2, o.y + (ay / al) * L2); ctx.stroke();
          ctx.globalAlpha = light ? .6 : .8; ctx.drawImage(S.glow[2], o.x - 6, o.y - 6, 12, 12);
          ctx.globalAlpha = 1; ctx.fillStyle = light ? INK_CSS : "#fff"; ctx.fillRect(o.x - .7, o.y - .7, 1.4, 1.4);
        }
      }
      ctx.globalAlpha = 1;
    }

    // ---------------------------------------------------------------- loop
    // Even frames: mid + near (30 fps); every fourth odd frame: far (15 fps). One heavy draw per frame at most;
    // the planet's re-shading advances a slice every frame.
    function frame(ms) {
      if (!sky || scrolling()) { if (raf !== -1) raf = requestAnimationFrame(frame); return; }
      const t = ms / 1000 - clock0, dt = Math.min(.05, t - (last || t));
      last = t;
      for (const k of rocks) {
        k.x += k.vx * dt; k.y += k.vy * dt;
        if (k.x < -40) { k.x = W - planet.r * 2.6; k.y = H * (.78 + Math.random() * .16); }
      }
      const light = !root.classList.contains("dark"), S = sprites(light);
      updatePlanet(t, light);
      tick++;
      if (tick === 1 || tick % 2 === 0) { drawMid(t, light, S); drawNear(t, light, S); }
      if (tick % 4 === 1) drawFar(t, light, S);
      if (tick % 60 === 0) place();                                    // follow late layout shifts (fonts)
      if (raf !== -1) raf = onScreen ? requestAnimationFrame(frame) : 0;
    }
    function resize() { layout(); tick = 0; if (reduce) drawAll(0); }

    clock0 = performance.now() / 1000;
    const ro = new ResizeObserver(resize), ro2 = new ResizeObserver(() => { if (sky) place(); });
    const mo = new MutationObserver(() => { if (reduce && sky) drawAll(0); });   // theme can be set before layout
    ro.observe(box);
    ro2.observe(sceneEl);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    cleanups.push(() => { ro.disconnect(); ro2.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); raf = -1; });
    if (!reduce) {
      const io = new IntersectionObserver(([en]) => {
        onScreen = en.isIntersecting;
        if (onScreen && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      });
      io.observe(box);
      cleanups.push(() => io.disconnect());
    }
  })();

  let THREE, RoundedBoxGeometry, RoomEnvironment;

  /* ================= 2D: screen textures ================= */

  function loadImg(src) {
    return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
  }

  // Canvas-backed texture. tex.paint(draw) redraws it in place (used by the per-device flourishes).
  function canvasTex(w, h, radius, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.paint = (fn) => {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath(); ctx.roundRect(0, 0, w, h, radius); ctx.clip();
      fn(ctx, w, h);
      ctx.restore();
      t.needsUpdate = true;
    };
    t.paint(draw);
    return t;
  }
  // Offscreen layer, drawn once and composited by the animated textures.
  function layer(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    return c;
  }

  const font = (weight, px) => `${weight} ${px}px Inter, "Helvetica Neue", Arial, sans-serif`;
  function cover(c, img, w, h, fx = .5, fy = .5) {
    const s = Math.max(w / img.width, h / img.height), sw = w / s, sh = h / s;
    c.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, 0, 0, w, h);
  }
  function fade(c, x, y, w, h, a0, a1) {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgba(0,0,0,${a0})`); g.addColorStop(1, `rgba(0,0,0,${a1})`);
    c.fillStyle = g; c.fillRect(x, y, w, h);
  }
  function scanlines(c, w, h, a = .18, step = 3) {
    c.fillStyle = `rgba(0,0,0,${a})`;
    for (let y = 0; y < h; y += step) c.fillRect(0, y, w, 1);
  }
  function vignette(c, w, h, a = .5) {
    const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .72);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  function pill(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
  // Signal + wifi + battery, right-aligned at (x, y) = top-right corner.
  function statusIcons(c, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = "#fff"; c.strokeStyle = "#fff";
    c.lineWidth = 2.2; c.strokeRect(-46, 2, 38, 18); c.fillRect(-43, 5, 28, 12); c.fillRect(-6, 8, 3, 6);
    c.lineWidth = 3.2; c.lineCap = "round";
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-68, 22, 6 + i * 6, -Math.PI * .78, -Math.PI * .22); c.stroke(); }
    for (let i = 0; i < 4; i++) c.fillRect(-112 + i * 7, 20 - (5 + i * 4), 5, 5 + i * 4);
    c.restore();
  }

  // IBM 5151: types the command, prints the ASCII portrait line by line, rolls a CRT scan bar, blinks the cursor.
  function terminalScreen() {
    const W = 1024, H = 768, lh = 20, cmd = "type dp.txt", art = ASCII.split("\n"), rows = art.length + 2;
    let x0 = 0, y0 = 0, cw = 11.4;
    const base = layer(W, H, (c) => {
      const bg = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .6);
      bg.addColorStop(0, "#06240d"); bg.addColorStop(1, "#010a03");
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
    });
    const text = layer(W, H, (c) => {
      c.font = '19px "JetBrains Mono", ui-monospace, monospace';
      c.textBaseline = "top"; c.fillStyle = "#5dff8a";
      c.shadowColor = "rgba(60,255,120,.85)"; c.shadowBlur = 8;
      cw = c.measureText("M").width;
      x0 = (W - cw * 80) / 2; y0 = (H - rows * lh) / 2;
      ["A>" + cmd, ...art, "A>"].forEach((l, i) => c.fillText(l, x0, y0 + i * lh));
    });
    const glass = layer(W, H, (c) => { scanlines(c, W, H, .22); vignette(c, W, H, .6); });
    const tex = canvasTex(W, H, 70, () => {});
    // The scan bar is drawn by the screen's shader (crtScanBar), from this value: repainting and re-uploading the
    // whole texture ~20 times a second just to move it cost the page about 10 fps.
    tex.bar = { value: -1 };
    let last = "";
    tex.paintAt = (e) => {                                       // e: seconds since the monitor appeared
      const typed = Math.max(0, Math.min(cmd.length, Math.floor((e - .9) / .05)));
      const lines = Math.max(0, Math.min(art.length + 1, Math.floor((e - 1.55) / .035)));
      tex.bar.value = (e * .42) % 1.25 - .12;                     // scan bar, 0..1 down the tube
      const blink = Math.floor(e * 2.2) % 2 === 0;
      const key = `${typed}|${lines}|${blink}`;
      if (key === last) return;
      last = key;
      tex.paint((c) => {
        c.drawImage(base, 0, 0);
        const w0 = x0 + cw * (2 + typed);
        c.drawImage(text, 0, y0 - 3, w0, lh + 6, 0, y0 - 3, w0, lh + 6);
        if (lines) c.drawImage(text, 0, y0 + lh - 3, W, lines * lh + 3, 0, y0 + lh - 3, W, lines * lh + 3);
        let cx = -1, cy = y0;
        if (!lines) cx = w0;
        else if (lines > art.length) { cx = x0 + cw * 2; cy = y0 + (art.length + 1) * lh; }
        if (blink && cx >= 0) { c.fillStyle = "#5dff8a"; c.fillRect(cx, cy, cw, lh - 2); }
        c.drawImage(glass, 0, 0);
      });
    };
    tex.paintAt(99);                                             // fully printed until it is on stage
    return tex;
  }

  function g3Screen(img) {
    return canvasTex(800, 600, 36, (c, w, h) => {
      c.drawImage(img, 0, 0, w, h);
      scanlines(c, w, h, .12);
      vignette(c, w, h, .45);
    });
  }

  // Lock-screen frame: wallpaper with a slow "Ken Burns" drift, then the pre-drawn text layer. The screen wakes
  // as the device lands (e 0.9-1.6 s): it brightens, the wallpaper settles from a slight zoom and the text
  // fades up. e < 0 means a still, fully awake screen (first paint, reduced motion). Leaves globalAlpha = wake
  // so the caller's animated bits fade with the text.
  function lockFrame(c, img, over, w, h, e, fx, fy) {
    const wake = e < 0 ? 1 : smooth((e - .9) / .7), t = Math.max(0, e);
    const s = 1.06 + .025 * Math.sin(t * .13) + (1 - wake) * .05;
    c.save();
    c.translate(w / 2 + Math.sin(t * .07) * w * .012, h / 2 + Math.cos(t * .09) * h * .01);
    c.scale(s, s); c.translate(-w / 2, -h / 2);
    cover(c, img, w, h, fx, fy);
    c.restore();
    if (wake < 1) { c.fillStyle = `rgba(0,0,0,${(1 - wake) * .6})`; c.fillRect(0, 0, w, h); }
    c.globalAlpha = wake;
    c.drawImage(over, 0, (1 - wake) * h * .012);
  }
  const easeOut = (k) => 1 - Math.pow(1 - clamp01(k), 3);

  // iPad (10th gen) lock screen. Static text is drawn once; per frame it wakes, the wallpaper drifts, then
  // the padlock springs open (Touch ID on the top button) and the home indicator nudges up.
  function ipadLock(photo) {
    const W = 790, H = 1136, tex = canvasTex(W, H, 36, () => {});
    const over = layer(W, H, (c) => {
      fade(c, 0, 0, W, 480, .46, 0);
      fade(c, 0, H - 220, W, 220, 0, .3);
      statusIcons(c, W - 26, 18, 1);
      c.fillStyle = "#fff"; c.textAlign = "center";
      c.font = font(500, 27); c.fillText("Monday 26 October", W / 2, 128);
      c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 24;
      c.fillStyle = "rgba(255,255,255,.94)"; c.font = font(600, 158); c.fillText("9:41", W / 2, 270);
    });
    let last = -1;
    tex.paintAt = (e) => {
      // Each repaint re-uploads the whole texture. 15 fps while something visibly moves (wake-up, padlock, the
      // home-indicator nudge); otherwise only the drift moves, under a pixel a second on screen, so 2 fps.
      const p = ((e - 2.7) % 3) / .7;                               // home-indicator nudge, every 3 s
      const busy = e >= 0 && (e < 1.7 || (e > 2.15 && e < 2.65) || (e > 2.7 && p < 1));
      const key = busy ? Math.floor(e * 15) : `d${Math.floor(e * 2)}`;
      if (key === last) return;
      last = key;
      const open = easeOut((e - 2.2) / .35);                        // shackle lift, 0..1
      const nudge = e > 2.7 && p < 1 ? Math.sin(p * Math.PI) * 7 : 0;
      tex.paint((c) => {
        lockFrame(c, photo, over, W, H, e, .5, .3);
        const L = open * 6;                                         // padlock: shackle lifts, right leg clears the body
        c.save(); c.translate(W / 2, 46);
        c.fillStyle = "#fff"; c.strokeStyle = "#fff"; c.lineWidth = 3;
        c.beginPath(); c.moveTo(-7, 1); c.lineTo(-7, -6 - L);
        c.arc(0, -6 - L, 7, Math.PI, 0); c.lineTo(7, 1 - L * 1.5); c.stroke();
        pill(c, -11, 0, 22, 16, 4);
        c.restore();
        c.fillStyle = "rgba(255,255,255,.92)"; pill(c, W / 2 - 105, H - 26 - nudge, 210, 8, 4);
      });
    };
    tex.paintAt(-1);
    return tex;
  }

  // iMac lock screen (macOS): drifting wallpaper, date over a large clock, input source + Wi-Fi top right,
  // the user's picture, name and password field with a blinking caret, and the Touch ID hint.
  function macLock(wide, portrait) {
    const W = 1600, H = 900, tex = canvasTex(W, H, 0, () => {});
    const over = layer(W, H, (c) => {
      fade(c, 0, 0, W, 360, .42, 0);
      fade(c, 0, H - 340, W, 340, 0, .5);
      c.fillStyle = "rgba(255,255,255,.92)"; c.strokeStyle = "rgba(255,255,255,.92)";
      c.font = font(600, 15); c.textAlign = "right"; c.textBaseline = "middle"; c.fillText("ABC", W - 58, 30);
      c.lineWidth = 2.6; c.lineCap = "round";
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(W - 30, 40, 4 + i * 5, -Math.PI * .78, -Math.PI * .22); c.stroke(); }
      c.textAlign = "center"; c.textBaseline = "alphabetic";
      c.font = font(600, 28); c.fillText("Monday 26 October", W / 2, 112);
      c.save(); c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 24;
      c.fillStyle = "rgba(255,255,255,.94)"; c.font = font(700, 146); c.fillText("9:41", W / 2, 250);
      c.restore();
      c.save(); c.beginPath(); c.arc(W / 2, H - 214, 46, 0, Math.PI * 2); c.clip();
      c.drawImage(portrait, 265, 190, 260, 260, W / 2 - 46, H - 260, 92, 92);   // face crop from the portrait
      c.restore();
      c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1.5;
      c.beginPath(); c.arc(W / 2, H - 214, 46, 0, Math.PI * 2); c.stroke();
      c.fillStyle = "#fff"; c.font = font(600, 19); c.fillText("Debaprasad Paul", W / 2, H - 136);
      c.fillStyle = "rgba(255,255,255,.2)"; pill(c, W / 2 - 110, H - 118, 220, 34, 17);
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1;
      c.beginPath(); c.roundRect(W / 2 - 109.5, H - 117.5, 219, 33, 16.5); c.stroke();
      c.fillStyle = "rgba(255,255,255,.55)"; c.font = font(400, 15); c.textAlign = "left"; c.textBaseline = "middle";
      c.fillText("Enter Password", W / 2 - 88, H - 101);
      c.textAlign = "center"; c.fillStyle = "rgba(255,255,255,.62)"; c.font = font(400, 13);
      c.fillText("Touch ID or Enter Password", W / 2, H - 58);
    });
    let last = "";
    tex.paintAt = (e) => {
      // As on the iPad: 15 fps through the wake-up, then 2 fps for the drift, plus a repaint per caret blink.
      const blink = Math.floor(e * 1.9) % 2 === 0, busy = e >= 0 && e < 1.7;
      const key = (busy ? Math.floor(e * 15) : `d${Math.floor(e * 2)}`) + ":" + blink;
      if (key === last) return;
      last = key;
      tex.paint((c) => {
        lockFrame(c, wide, over, W, H, e, .5, 0);                   // top-anchored: eyes sit below the clock
        if (blink) { c.fillStyle = "#fff"; c.fillRect(W / 2 - 95, H - 109, 3, 16); }
      });
    };
    tex.paintAt(-1);
    return tex;
  }

  function foldInner(wide) {
    return canvasTex(1236, 928, 30, (c, w, h) => {
      cover(c, wide, w, h, .5, .4);
      fade(c, 0, 0, w, 140, .35, 0);
      c.fillStyle = "#fff"; c.textBaseline = "middle"; c.font = font(600, 26); c.fillText("9:41", 34, 34);
      statusIcons(c, w - 24, 22, 1.05);
      c.fillStyle = "#000"; c.beginPath(); c.arc(w * .75, 36, 13, 0, 7); c.fill();
    });
  }

  function foldCover(portrait) {
    return canvasTex(576, 920, 48, (c, w, h) => {
      cover(c, portrait, w, h, .5, .35);
      fade(c, 0, 0, w, 420, .45, 0);
      c.fillStyle = "#000"; c.beginPath(); c.arc(w / 2, 32, 12, 0, 7); c.fill();
      c.fillStyle = "#fff"; c.textAlign = "center";
      c.font = font(300, 150); c.fillText("9:41", w / 2, 250);
      c.font = font(500, 26); c.fillText("Mon, 26 October", w / 2, 300);
    });
  }

  // iPhone 18 Pro lock screen; paintAt(e) grows the (smaller) Dynamic Island into a live activity and back.
  function iphoneScreen(photo) {
    const W = 666, H = 1448;
    const base = layer(W, H, (c) => {
      cover(c, photo, W, H, .5, .3);
      fade(c, 0, 0, W, 560, .42, 0);
      fade(c, 0, H - 360, W, 360, 0, .45);
      statusIcons(c, W - 34, 30, 1);
      c.fillStyle = "#fff"; c.textAlign = "center";
      c.font = font(600, 34); c.fillText("Monday 26 October", W / 2, 210);
      c.save(); c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 24;
      c.fillStyle = "rgba(255,255,255,.92)"; c.font = font(700, 230); c.fillText("9:41", W / 2, 430);
      c.restore();
      for (const x of [110, W - 110]) {                                      // torch + camera buttons
        c.fillStyle = "rgba(30,30,32,.45)"; c.beginPath(); c.arc(x, H - 170, 50, 0, 7); c.fill();
        c.fillStyle = "#fff";
        if (x < W / 2) { pill(c, x - 9, H - 196, 18, 52, 6); }
        else { pill(c, x - 22, H - 186, 44, 32, 7); c.fillStyle = "rgba(30,30,32,.9)"; c.beginPath(); c.arc(x, H - 170, 9, 0, 7); c.fill(); }
      }
      c.fillStyle = "#fff"; pill(c, W / 2 - 120, H - 30, 240, 10, 5);
    });
    const tex = canvasTex(W, H, 96, () => {});
    let last = -1;
    tex.paintAt = (e) => {
      const k = Math.min(smooth((e - 2.3) / .4), 1 - smooth((e - 3.7) / .4));
      const q = Math.round(k * 80);
      if (q === last) return;
      last = q;
      tex.paint((c) => {
        c.drawImage(base, 0, 0);
        const w = 132 + 448 * k, hh = 40 + 100 * k, x = (W - w) / 2, y = 30, cy = y + hh / 2;
        c.fillStyle = "#000"; pill(c, x, y, w, hh, Math.min(hh / 2, 20 + 34 * k));
        if (k > .55) {
          c.globalAlpha = (k - .55) / .45;
          c.fillStyle = "#34d399"; c.beginPath(); c.arc(x + 62, cy, 30, 0, 7); c.fill();
          c.fillStyle = "#04110b"; c.font = font(700, 30); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("D", x + 62, cy + 1);
          c.textAlign = "left";
          c.fillStyle = "#fff"; c.font = font(600, 25); c.fillText("Debaprasad Paul", x + 108, cy - 15);
          c.fillStyle = "rgba(255,255,255,.6)"; c.font = font(500, 21); c.fillText("Portfolio · Live", x + 108, cy + 17);
          c.fillStyle = "#34d399";
          [18, 30, 22, 36, 16].forEach((bh, i) => pill(c, x + w - 112 + i * 15, cy - bh / 2, 8, bh, 4));
        }
      });
    };
    tex.paintAt(0);
    return tex;
  }

  // Galaxy Z Fold 8: iPhone Duo-style hand-off (after the empirical.health reconstruction of Apple's effect).
  // Every Fold screen samples ONE shared image fixed in space at the open inner-screen plane: each pixel shows the
  // point behind it along the ray from the eye, so the content holds still while the panels move over it like windows.
  const DUO_UNIFORMS = "uniform vec3 uImgC, uImgX, uImgY, uImgN, uHingeP, uHingeD; uniform float uPanelW, uBlur, uOpen, uMoving, uCover; uniform sampler2D uShared;";
  const DUO_GLSL = `#ifdef USE_EMISSIVEMAP
  {
    // ray from the eye (view-space origin) through this fragment, onto the shared image plane
    vec3 P = -vViewPosition, R = normalize(P);
    float den = dot(R, uImgN);
    vec3 q = R * (dot(uImgC, uImgN) / (abs(den) < 1e-5 ? 1e-5 : den)) - uImgC;
    vec2 iuv = vec2(dot(q, uImgX) / dot(uImgX, uImgX), dot(q, uImgY) / dot(uImgY, uImgY)) * 0.5 + 0.5;
    float inImg = step(0.0, iuv.x) * step(iuv.x, 1.0) * step(0.0, iuv.y) * step(iuv.y, 1.0);
    // sharp at the hinge, softening toward the moving edge (cubic), only while the hinge is in motion
    float d = uMoving * clamp(length(cross(P - uHingeP, uHingeD)) / uPanelW, 0.0, 1.0);
    float blur = uBlur * d * d * d;
    float lod = log2(1.0 + blur * 1236.0);
    vec2 o = vec2(blur * 0.5, 0.0);
    vec3 shared = (2.0 * textureLod(uShared, iuv, lod).rgb
                 + textureLod(uShared, iuv + o, lod).rgb + textureLod(uShared, iuv - o, lod).rgb
                 + textureLod(uShared, iuv + o.yx, lod).rgb + textureLod(uShared, iuv - o.yx, lod).rgb) / 6.0;
    // the inner panels start dark and brighten as they open; the moving one stays darker toward its free edge
    float dim = uCover > 0.5 ? 0.0 : pow(1.0 - uOpen, 1.5) * (0.45 + 0.5 * d);
    shared *= inImg * (1.0 - dim);
    // the cover's own wallpaper dissolves into the shared picture as soon as the phone starts to open
    vec3 own = texture2D(emissiveMap, vEmissiveMapUv).rgb;
    float hand = uCover > 0.5 ? smoothstep(0.0, 0.2, uOpen) : 1.0;
    totalEmissiveRadiance *= mix(own, shared, hand);
  }
#endif`;

  /* ================= 3D helpers (all models built in millimetres) ================= */

  // Rounded-rect outline from sampled corner arcs. Near-duplicate points (float error at arc joins)
  // are dropped because they wreck ExtrudeGeometry's bevel.
  function rrect(w, h, r, cx = 0, cy = 0) {
    const [tl, tr, br, bl] = (Array.isArray(r) ? r : [r, r, r, r]).map((v) => Math.max(v, .001));
    const pts = [];
    const corner = (x, y, rad, a0) => {
      for (let i = 0; i <= 16; i++) {
        const a = a0 + (i / 16) * (Math.PI / 2);
        pts.push(new THREE.Vector2(cx + x + rad * Math.cos(a), cy + y + rad * Math.sin(a)));
      }
    };
    corner(w / 2 - br, -h / 2 + br, br, -Math.PI / 2);
    corner(w / 2 - tr, h / 2 - tr, tr, 0);
    corner(-w / 2 + tl, h / 2 - tl, tl, Math.PI / 2);
    corner(-w / 2 + bl, -h / 2 + bl, bl, Math.PI);
    const clean = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 1e-4);
    if (clean.at(-1).distanceTo(clean[0]) < 1e-4) clean.pop();
    return new THREE.Shape(clean);
  }
  const radii = (r) => (Array.isArray(r) ? r : [r, r, r, r]);
  const put = (parent, obj, x = 0, y = 0, z = 0, rz = 0) => {
    obj.position.set(x, y, z); obj.rotation.z = rz; parent.add(obj); return obj;
  };
  const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2) * .999), mat);
  const panel = (w, h, r, mat) => new THREE.Mesh(new THREE.ShapeGeometry(rrect(w, h, r)), mat);
  const dot = (r, mat) => new THREE.Mesh(new THREE.CircleGeometry(r, 40), mat);
  const back = (obj) => { obj.rotation.y = Math.PI; return obj; };  // flip a front-facing part onto a back face

  // Extruded rounded rectangle with bevelled edges; front face at z = +d/2. Optional hole [w, h, r, cx, cy].
  function slab(w, h, d, r, mat, b, hole) {
    const shape = rrect(w - 2 * b, h - 2 * b, radii(r).map((v) => v - b));
    if (hole) shape.holes.push(rrect(hole[0] + 2 * b, hole[1] + 2 * b, hole[2] + b, hole[3] || 0, hole[4] || 0));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5,
    });
    g.translate(0, 0, -(d - 2 * b) / 2);
    return new THREE.Mesh(g, mat);
  }
  // Flat rounded-rect frame (border of thickness t), centred on z.
  function frame(w, h, r, t, d, mat) {
    const s = rrect(w, h, r);
    s.holes.push(rrect(w - 2 * t, h - 2 * t, radii(r).map((v) => Math.max(v - t, .5))));
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return new THREE.Mesh(g, mat);
  }
  // Lathe around the z axis; profile points are [radius, z].
  function latheZ(pts, mat) {
    const g = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), 64);
    g.rotateX(Math.PI / 2);
    return new THREE.Mesh(g, mat);
  }
  // Rounded box whose back end shrinks to factor k (CRT housings).
  function taper(geo, k) {
    geo.computeBoundingBox();
    const { min, max } = geo.boundingBox, p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const s = 1 - (1 - k) * (max.z - p.getZ(i)) / (max.z - min.z);
      p.setXY(i, p.getX(i) * s, p.getY(i) * s);
    }
    geo.computeVertexNormals();
    return geo;
  }
  // Many identical small parts (speaker holes, vents) in one draw call.
  function many(geo, mat, n, place) {
    const im = new THREE.InstancedMesh(geo, mat, n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); place(i, o); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    return im;
  }

  async function start() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.debug.checkShaderErrors = !import.meta.env?.PROD;           // error logs are synchronous GPU queries
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-3, 4, 5);
    const rim = new THREE.DirectionalLight(0xcfeeff, 1.4);
    rim.position.set(4, 2, -4);
    scene.add(key, rim);

    const OVER = 1.8;                                    // canvas size relative to the device column (see .scene canvas)
    const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * OVER)), 1, .1, 50);
    const CAM = new THREE.Vector3(0, .2, 7.6);
    camera.position.copy(CAM);
    camera.lookAt(0, -.05, 0);
    camera.updateMatrixWorld();

    await Promise.all(['19px "JetBrains Mono"', "300 40px Inter", "400 40px Inter", "500 40px Inter", "600 40px Inter", "700 40px Inter"]
      .map((f) => document.fonts.load(f)));
    const [g3Img, portrait, wide] = await Promise.all([IMG.g3, IMG.portrait, IMG.wide].map(loadImg));
    if (signal.aborted) { renderer.dispose(); return; }

    const tex = {
      ibm: terminalScreen(),
      g3: g3Screen(g3Img),
      ipad: ipadLock(portrait),
      m4: macLock(wide, portrait),
      foldIn: foldInner(wide),
      foldOut: foldCover(portrait),
      iphone: iphoneScreen(portrait),
    };

    /* ---------- materials ---------- */
    const phys = (o) => new THREE.MeshPhysicalMaterial(o);
    const plastic = (color, roughness = .5, extra) => phys({ color, roughness, clearcoat: .3, clearcoatRoughness: .5, envMapIntensity: .6, ...extra });
    const metal = (color, roughness = .34, extra) => phys({ color, metalness: 1, roughness, ...extra });
    const M = {
      pearl: plastic(0xcdc5b1, .55), pearlDark: plastic(0xafa794, .6), charcoal: plastic(0x2a2926, .75),
      knob: plastic(0x33312d, .45), plate: plastic(0x1c1b19, .45), vent: plastic(0x23211d, .9),
      bondi: phys({ color: 0x0aa3c9, roughness: .12, clearcoat: 1, clearcoatRoughness: .06, transparent: true, opacity: .6, envMapIntensity: .9 }),
      bondiDeep: phys({ color: 0x07809e, roughness: .18, clearcoat: 1, transparent: true, opacity: .82 }),
      g3Core: plastic(0xd4dcdf, .6), ice: phys({ color: 0xf2f6f7, roughness: .16, clearcoat: 1, clearcoatRoughness: .08 }),
      glass: phys({ color: 0x050506, roughness: .06, clearcoat: 1, clearcoatRoughness: .03 }),
      lensGlass: phys({ color: 0x0b0d14, roughness: .03, metalness: .2, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.8,
        iridescenceThicknessRange: [180, 520], transparent: true, opacity: .45 }),
      lensBlack: plastic(0x030304, .35), lensInner: metal(0x30333b, .22, { side: THREE.DoubleSide }),
      lensRing: metal(0x2a2d33, .24, { side: THREE.DoubleSide }), port: plastic(0x0b0b0c, .7),
      flash: phys({ color: 0xf3ead2, roughness: .35, emissive: 0x2a2416 }),
      ipad: metal(0xe8cc55, .42),
      m4Back: metal(0x3c8a5c, .38), m4Chin: metal(0xb5dac0, .42), m4Stand: metal(0x9ccbad, .36),
      m4Glass: phys({ color: 0xf2f4f2, roughness: .12, clearcoat: 1, clearcoatRoughness: .05 }),
      foldFrame: metal(0x3b414d, .3), foldBack: phys({ color: 0x1a2332, roughness: .42, clearcoat: .8, clearcoatRoughness: .3 }),
      hinge: metal(0x2a2e36, .32),
      burgundy: metal(0x5e1a29, .36),
      burgGlass: phys({ color: 0x4c1521, roughness: .5, clearcoat: .5, clearcoatRoughness: .4 }),
    };

    // Surface detail for the high-fidelity models: a fine grain in the plastic's roughness, and the G3's ribbed plastic.
    const grain = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const x = c.getContext("2d"), img = x.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 120 + Math.random() * 30;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      const tx = new THREE.CanvasTexture(c);
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(1 / 14, 1 / 14);           // UVs are in mm: ~14 mm tiles
      return tx;
    })();
    const ribs = (() => {
      const c = document.createElement("canvas");
      c.width = 64; c.height = 4;
      const x = c.getContext("2d");
      for (let i = 0; i < 64; i++) { const v = (i % 8) < 4 ? 255 : 228; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, 0, 1, 4); }
      const tx = new THREE.CanvasTexture(c);
      tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(1 / 20, 1);  // 2.5 mm ribs
      return tx;
    })();
    Object.assign(M, {
      pearl: phys({ color: 0xd8d1c0, roughness: 1, roughnessMap: grain, clearcoat: .12, clearcoatRoughness: .6, envMapIntensity: .6 }),
      pearlShade: phys({ color: 0xc2bba9, roughness: .75, envMapIntensity: .5, side: THREE.DoubleSide }),
      mask: plastic(0x0b0b0b, .8), seam: plastic(0x1e1c18, .9), index: plastic(0xf2f0ea, .5),
      badgeRim: metal(0xb9bcc0, .3), rubber: plastic(0x1a1a1a, .95),
      g3Funnel: phys({ color: 0x2b2f35, roughness: .45, metalness: .4, side: THREE.DoubleSide }),
      g3Steel: metal(0x8d949c, .4), g3Board: plastic(0x1e5a32, .6), g3Slot: plastic(0x0d2a33, .7),
      ice: phys({ color: 0xedf3f4, map: ribs, roughness: .3, clearcoat: .8, clearcoatRoughness: .2, transparent: true, opacity: .9 }),
      iceShade: phys({ color: 0xd9e3e6, roughness: .4, transparent: true, opacity: .95, side: THREE.DoubleSide }),
      bondiRib: phys({ map: ribs, roughness: .12, clearcoat: 1, clearcoatRoughness: .06, transparent: true, opacity: .6, envMapIntensity: .9 }),
      m4Port: metal(0x6b6f75, .35),
    });
    M.bondiRib.color = M.bondi.color;   // one shared colour object, so the flavour cycle tints both

    // Emissive screen behind glossy glass; alpha from the texture rounds its corners.
    function screen(w, h, map, bulge = 0, uv) {
      const g = new THREE.PlaneGeometry(w, h, 32, 24);
      if (bulge) {
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const nx = p.getX(i) / (w / 2), ny = p.getY(i) / (h / 2);
          p.setZ(i, bulge * (1 - nx * nx) * (1 - ny * ny));
        }
        g.computeVertexNormals();
      }
      if (uv) { const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setX(i, uv[0] + a.getX(i) * (uv[1] - uv[0])); }
      return new THREE.Mesh(g, phys({
        color: 0x000000, map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1.2,
        roughness: .15, clearcoat: 1, clearcoatRoughness: .04, alphaTest: .5,
      }));
    }
    // The IBM's CRT scan bar, composited in the screen's shader exactly as the canvas did it: a green band
    // (0 -> .12 alpha at 85% -> 0, 74 texture px tall) laid over the picture *under* the glass (scanlines + vignette),
    // in sRGB like the canvas. The texture already holds glass * picture, so: out = tex * (1 - a) + glass * green * a.
    function crtScanBar(mesh, bar) {
      mesh.material.userData.patch = (sh) => {
        sh.uniforms.uBar = bar;
        sh.fragmentShader = sh.fragmentShader
          .replace("void main() {", `uniform float uBar;
            vec3 crtToS(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
            vec3 crtToL(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
            void main() {`)
          .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
            {
              vec2 tp = vec2(vEmissiveMapUv.x, 1.0 - vEmissiveMapUv.y) * vec2(1024.0, 768.0);   // texture px, y down
              float t = (tp.y - (uBar * 768.0 - 64.0)) / 74.0;
              float a = t < 0.0 || t > 1.0 ? 0.0 : t < 0.85 ? 0.12 * t / 0.85 : 0.12 * (1.0 - t) / 0.15;
              if (a > 0.0) {
                // glass: 1 px scanline every 3 px at .22 (its mip-filtered average once minified) and the vignette
                float row = mod(floor(tp.y), 3.0) < 1.0 ? 0.78 : 1.0;
                row = mix(row, 1.0 - 0.22 / 3.0, clamp(fwidth(tp.y) - 0.5, 0.0, 1.0));
                float vig = 0.6 * clamp((length(tp - vec2(512.0, 384.0)) - 268.8) / (737.28 - 268.8), 0.0, 1.0);
                vec3 s = crtToS(emissiveColor.rgb) * (1.0 - a) + row * (1.0 - vig) * vec3(90.0, 255.0, 140.0) / 255.0 * a;
                totalEmissiveRadiance = emissive * crtToL(s);
              }
            }`);
      };
      mesh.material.customProgramCacheKey = () => "crt-scan-bar";        // its own shader program
      return mesh;
    }
    // Camera module: metal collar, dark barrel with inner rings, iridescent coated glass dome. Faces +z.
    function lens(R) {
      const g = new THREE.Group(), h = R * .32;
      g.add(latheZ([[R * .76, 0], [R, 0], [R, h * .55], [R * .96, h], [R * .8, h], [R * .76, h * .82]], M.lensRing));
      put(g, dot(R * .78, M.lensBlack), 0, 0, h * .25);
      for (const [k, z] of [[.6, .32], [.42, .38], [.26, .44]]) {
        put(g, new THREE.Mesh(new THREE.RingGeometry(R * (k - .04), R * k, 48), M.lensInner), 0, 0, h * z);
      }
      put(g, dot(R * .1, M.lensRing), 0, 0, h * .46);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.6, 48, 10, 0, Math.PI * 2, 0, Math.asin(.79 / 1.6)), M.lensGlass);
      cap.rotation.x = Math.PI / 2;
      put(g, cap, 0, 0, h * .9 - R * 1.6);
      return g;
    }

    /* ---------- models ---------- */

    /* ---------- shared detail helpers for the high-fidelity models ---------- */

    // Fixed-count rounded-rect outline (same point count for any size) so two outlines can be lofted together.
    function rrPts(w, h, r, seg = 10) {
      const pts = [];
      const corners = [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]];
      for (const [cx, cy, a0] of corners) {
        for (let i = 0; i <= seg; i++) {
          const a = a0 + (i / seg) * (Math.PI / 2);
          pts.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a)));
        }
      }
      return pts;
    }
    // Tapered tunnel between two outlines: the moulded draft that steps a CRT opening down to the tube.
    function tunnel(a, b, za, zb, mat) {
      const pos = [], n = a.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        pos.push(a[i].x, a[i].y, za, b[i].x, b[i].y, zb, a[j].x, a[j].y, za,
                 a[j].x, a[j].y, za, b[i].x, b[i].y, zb, b[j].x, b[j].y, zb);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return new THREE.Mesh(g, mat);
    }
    // Knurled control knob along +z: square-wave ridges around the rim.
    function knurledKnob(r, depth, ridges, mat) {
      const geo = new THREE.CylinderGeometry(r, r * 1.04, depth, ridges * 4, 1);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), zz = p.getZ(i), rr = Math.hypot(x, zz);
        if (rr > r * .9) {
          const k = 1 + .05 * Math.sign(Math.sin(Math.atan2(zz, x) * ridges));
          p.setX(i, x * k); p.setZ(i, zz * k);
        }
      }
      geo.computeVertexNormals();
      geo.rotateX(Math.PI / 2);
      return new THREE.Mesh(geo, mat);
    }
    // Rows of identical slots (vents, grilles) in one draw call.
    function slots(n, w, h, d, r, mat, place) { return many(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2, d / 2) * .99), mat, n, place); }

    /* ---------- IBM 5151 (1981): 380 W x 280 H x 360 D mm ---------- */
    function ibm5151() {
      const g = new THREE.Group(), W = 380, H = 280, F = 52, z = F / 2, sy = 16;
      const OW = 262, OH = 200;                                                     // screen opening in the face
      put(g, slab(W, H, F, 14, M.pearl, 6, [OW, OH, 24, 0, sy]));                  // moulded front face
      // draft tunnel stepping the opening down to the tube, then a black mask and the curved glass
      put(g, tunnel(rrPts(OW, OH, 24), rrPts(240, 182, 16), z - 6, z - 40, M.pearlShade), 0, sy, 0);
      put(g, frame(240, 182, 16, 6, 2, M.mask), 0, sy, z - 40);
      put(g, crtScanBar(screen(230, 172.5, tex.ibm, 10), tex.ibm.bar), 0, sy, z - 41);
      // rear housing tapers back; a dark parting line where it meets the face
      const housing = taper(new RoundedBoxGeometry(368, 268, 312, 8, 28), .76);
      put(g, new THREE.Mesh(housing, M.pearl), 0, -2, -z - 150);
      put(g, frame(372, 272, 16, 2.2, 3, M.seam), 0, -2, -z - 1);
      // vents: top rear and both sides
      const slope = Math.atan((134 * .24) / 312);
      put(g, slots(14, 150, 2.2, 7, 1, M.vent, (i, o) => {                          // two columns of 7 slots
        const t = (150 + (i % 7) * 12) / 312;
        o.position.set(i < 7 ? -82 : 82, -2 + 134 * (1 - .24 * t) + .3, -z + 6 - t * 312);
        o.rotation.x = -slope;
      }));
      for (const side of [-1, 1]) {
        put(g, slots(12, 2.2, 70, 7, 1, M.vent, (i, o) => {
          const t = (170 + (i % 6) * 12) / 312, hw = 184 * (1 - .24 * t);
          o.position.set(side * (hw + .3), (i < 6 ? 30 : -50), -z - 6 - t * 312);
          o.rotation.y = side * Math.atan((184 * .24) / 312);
        }));
      }
      // brightness + contrast knobs (knurled, white index), badge plate, rubber feet, rear cable
      for (const x of [W / 2 - 44, W / 2 - 80]) {
        put(g, new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 3, 40).rotateX(Math.PI / 2), M.pearlShade), x, -H / 2 + 26, z + .8);
        put(g, knurledKnob(10, 13, 18, M.knob), x, -H / 2 + 26, z + 7.5);
        put(g, rbox(1.6, 7, .8, .4, M.index), x, -H / 2 + 30, z + 14.1);
      }
      put(g, rbox(52, 15, 1.4, 1.2, M.badgeRim), -W / 2 + 52, -H / 2 + 26, z + .5);
      put(g, rbox(48, 11, 1.8, 1, M.plate), -W / 2 + 52, -H / 2 + 26, z + .6);
      for (const [x, zz] of [[-150, -20], [150, -20], [-115, -300], [115, -300]]) {
        const tt = Math.max(0, (-z + 6 - zz) / 312), floor = zz > -z ? -H / 2 : -2 - 134 * (1 - .24 * tt);   // housing narrows toward the back
        put(g, new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 5, 24), M.rubber), x, floor - 2, zz);
      }
      put(g, new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 40, 20).rotateX(Math.PI / 2), M.rubber), -60, -40, -z - 320);
      g.userData.update = (e) => tex.ibm.paintAt(reduce ? 99 : e);
      return g;
    }

    /* ---------- iMac G3 (1998, Bondi Blue): 386 W x 401 H x 447 D mm ---------- */
    function imacG3() {
      const g = new THREE.Group(), W = 386, H = 401, top = H / 2, chinH = 106, sy = 52;
      // what you see through the plastic: CRT funnel + neck, steel frame, logic board, speaker cans
      const funnel = new THREE.CylinderGeometry(30, 168, 230, 4, 1, true).rotateY(Math.PI / 4).rotateX(-Math.PI / 2);
      put(g, new THREE.Mesh(funnel, M.g3Funnel), 0, sy - 6, -170);
      put(g, new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 90, 24).rotateX(Math.PI / 2), M.g3Funnel), 0, sy - 6, -320);
      put(g, rbox(270, 6, 240, 3, M.g3Steel), 0, -118, -205);
      put(g, rbox(240, 4, 170, 2, M.g3Board), 0, -150, -200);
      for (const s of [-1, 1]) put(g, new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 36, 32).rotateX(Math.PI / 2), M.g3Steel), s * 115, -150, -75);
      // translucent Bondi shell: front block + the rounded rear dome
      // translucent Bondi shell: a squarish rounded pod (back half of a superellipsoid), full-size behind the face,
      // narrowing and dropping toward the back; 447 mm deep overall
      const pod = new THREE.SphereGeometry(1, 96, 64), pp = pod.attributes.position, y0 = -150;
      const sq = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
      for (let i = 0; i < pp.count; i++) {
        const zz = Math.min(0, sq(pp.getZ(i), .8)) * 410, s = 1 - .3 * (-zz / 410);
        pp.setXYZ(i, sq(pp.getX(i), .55) * 188 * s, y0 + (sq(pp.getY(i), .55) * 196 - y0) * s, zz - 40);
      }
      pod.computeVertexNormals();
      put(g, new THREE.Mesh(pod, M.bondi));
      // integrated carry handle at the top rear: a grip bar over a dark opening, sitting on the pod's top surface
      const hz = -300;
      let hy = 0;
      for (let i = 0; i < pp.count; i++) if (Math.abs(pp.getZ(i) - hz) < 14 && Math.abs(pp.getX(i)) < 60) hy = Math.max(hy, pp.getY(i));
      put(g, rbox(150, 6, 20, 3, M.g3Slot), 0, hy - 4, hz);
      put(g, rbox(176, 16, 26, 8, M.bondiRib), 0, hy + 8, hz);
      // front: frosted "ice" frame around the screen above the Bondi chin
      put(g, slab(W, H - chinH, 40, [86, 86, 0, 0], M.ice, 10, [292, 222, 20, 0, sy - (chinH / 2)]), 0, chinH / 2, -20);
      put(g, slab(W, chinH, 40, [0, 0, 98, 98], M.bondiRib, 10), 0, -top + chinH / 2, -20);
      put(g, rbox(W - 20, 1.6, 40, .5, M.g3Slot), 0, -top + chinH, -20);                                  // ice/Bondi parting line
      put(g, tunnel(rrPts(292, 222, 20), rrPts(276, 208, 14), -2, -26, M.iceShade), 0, sy, 0);
      put(g, frame(276, 208, 14, 7, 2, M.mask), 0, sy, -26);
      put(g, screen(266, 199.5, tex.g3, 9), 0, sy, -27);
      // chin details: CD tray slot with finger notch, speaker grilles (recessed, perforated), power button, IR window
      put(g, rbox(150, 5, 5, 2.2, M.g3Slot), 0, -top + chinH - 22, 0);
      put(g, new THREE.Mesh(new THREE.CircleGeometry(6, 24, Math.PI, Math.PI), M.g3Slot), 0, -top + chinH - 24.6, .4);
      const hole = new THREE.CylinderGeometry(1.5, 1.5, 3, 10).rotateX(Math.PI / 2);
      for (const s of [-1, 1]) {
        put(g, latheZ([[24, 0], [27, 0], [27, -1.5], [25.5, -3]], M.bondiDeep), s * 120, -top + 46, .2);
        const pts = [];
        for (let y = -22; y <= 22; y += 4.6) for (let x = -24; x <= 24; x += 5.3) {
          const xx = x + ((Math.round(y / 4.6) & 1) ? 2.65 : 0);
          if (Math.hypot(xx, y) < 22.5) pts.push([xx, y]);
        }
        put(g, many(hole, M.g3Slot, pts.length, (i, o) => o.position.set(s * 120 + pts[i][0], -top + 46 + pts[i][1], -1.4)));  // flush
      }
      put(g, latheZ([[0, 2.2], [6, 2.2], [7, 1], [7, -1]], M.bondiDeep), 158, -top + 50, 0);             // power button
      put(g, rbox(14, 7, 1, 1.5, M.g3Slot), -48, -top + 44, .4);                                            // IR window
      put(g, rbox(130, 14, 70, 6, M.bondiDeep), 0, -top - 5, -70);                                          // fold-out foot
      // the 1999 flavours: Bondi Blue, Strawberry, Lime, Grape, Tangerine, Blueberry
      const FLAVOURS = [0x0aa3c9, 0xe0457b, 0x7cc242, 0x6b4c9a, 0xf7941d, 0x1d6fb8].map((c) => new THREE.Color(c));
      g.userData.update = (e) => {
        if (reduce) return;
        const t = Math.max(0, e - 1) / 1.15, i = Math.floor(t), f = smooth((t - i) / .45), n = FLAVOURS.length;
        M.bondi.color.copy(FLAVOURS[i % n]).lerpHSL(FLAVOURS[(i + 1) % n], f);   // bondiRib shares this colour
        M.bondiDeep.color.copy(M.bondi.color).multiplyScalar(.8);
      };
      return g;
    }

    /* ---------- iMac M4 (2024, 24"): 547 W x 461 H x 147 D mm; 11.5 mm enclosure ---------- */
    function imacM4() {
      const g = new THREE.Group(), W = 547, D = 11.5, z = D / 2, border = 12.5, SW = 520, SH = 293, chin = 36;
      const H = border * 2 + SH + chin, top = H / 2, desk = -top - 107;                           // 354 mm head, 461 mm overall
      put(g, slab(W, H, D, 8, M.m4Back, 1.6));
      const glassH = H - chin;
      put(g, panel(W - 1, glassH, [7.5, 7.5, 0, 0], M.m4Glass), 0, top - glassH / 2, z + .04);                // white-bordered glass
      put(g, screen(SW, SH, tex.m4), 0, top - border - SH / 2, z + .1);
      put(g, panel(W - 1, chin, [0, 0, 7.5, 7.5], M.m4Chin), 0, -top + chin / 2, z + .03);                   // brushed chin
      put(g, rbox(W - 2, .7, .3, .1, M.g3Slot), 0, -top + chin, z + .08);                                   // glass/chin parting line
      put(g, dot(1.6, M.lensBlack), 0, top - border / 2, z + .1);                                          // camera
      // back: magnetic power connector and four USB-C ports
      put(g, back(latheZ([[0, .4], [8, .4], [9, -.2]], M.m4Port)), -40, -top + 70, -z);
      for (let i = 0; i < 4; i++) put(g, back(rbox(8.4, 3, .6, 1.4, M.port)), 150 + i * 14, -top + 38, -z - .1);
      // stand: one bent aluminium plate. Foot on the desk, a 20 mm bend, then an arm leaning up to the hinge.
      const R = 20, T = 6, beta = .2, hinge = new THREE.Vector2(-z - 14, -60);       // (z, y) of the hinge on the back
      const C = new THREE.Vector2(0, desk + T / 2 + R);
      const E = () => new THREE.Vector2(C.x - R * Math.cos(beta), C.y + R * Math.sin(beta));
      C.x = hinge.x - (hinge.y - E().y) * Math.tan(beta) + R * Math.cos(beta);         // solve so the arm meets the hinge
      const centre = [];
      for (let u = 95; u > C.x; u -= 10) centre.push(new THREE.Vector2(u, desk + T / 2));
      for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 - (i / 20) * (Math.PI / 2 + beta); centre.push(new THREE.Vector2(C.x + R * Math.cos(a), C.y + R * Math.sin(a))); }
      const e = E();
      for (let i = 1; i <= 8; i++) centre.push(e.clone().lerp(hinge, i / 8));
      const left = [], right = [];
      centre.forEach((p, i) => {
        const a = centre[Math.max(0, i - 1)], b = centre[Math.min(centre.length - 1, i + 1)];
        const n = new THREE.Vector2(-(b.y - a.y), b.x - a.x).normalize().multiplyScalar(T / 2);
        left.push(p.clone().add(n)); right.push(p.clone().sub(n));
      });
      const profile = new THREE.Shape([...left, ...right.reverse()]);
      const sg = new THREE.ExtrudeGeometry(profile, { depth: 136, bevelEnabled: true, bevelThickness: .8, bevelSize: .8, bevelSegments: 3, curveSegments: 4 });
      sg.translate(0, 0, -68);
      sg.rotateY(-Math.PI / 2);
      put(g, new THREE.Mesh(sg, M.m4Stand));
      put(g, new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 124, 32).rotateZ(Math.PI / 2), M.m4Stand), 0, hinge.y, hinge.x);
      // cycles through the 2024 colours: [back + stand, front chin]
      const COLOURS = [[0x3c8a5c, 0xb5dac0], [0x2f6db5, 0xb9cfee], [0x6b4fa8, 0xd3c6ec], [0xc0466e, 0xf4c4d4],
        [0xd5642b, 0xf7ceb5], [0xd9a92a, 0xf6e4a9], [0x9ea3a8, 0xe4e6e8]].map(([b, c]) => [new THREE.Color(b), new THREE.Color(c)]);
      g.userData.update = (e2) => {
        tex.m4.paintAt(reduce ? -1 : e2);                        // lock screen: wake, drift, caret
        if (reduce) return;
        const t = Math.max(0, e2 - 1), i = Math.floor(t), f = smooth((t - i) / .45), n = COLOURS.length;
        const [b0, c0] = COLOURS[i % n], [b1, c1] = COLOURS[(i + 1) % n];
        M.m4Back.color.copy(b0).lerp(b1, f);
        M.m4Chin.color.copy(c0).lerp(c1, f);
        M.m4Stand.color.copy(M.m4Back.color).lerp(M.m4Chin.color, .15);
      };
      return g;
    }

    function ipad10() {
      const g = new THREE.Group(), W = 179.5, H = 248.6, D = 7, z = D / 2;
      put(g, slab(W, H, D, 18, M.ipad, 1.1));
      put(g, panel(W - 1.8, H - 1.8, 17.1, M.glass), 0, 0, z + .02);
      put(g, screen(157.8, 227, tex.ipad), 0, 0, z + .06);
      put(g, dot(1.5, M.lensBlack), W / 2 - 5.4, 0, z + .08);                      // landscape FaceTime camera
      put(g, dot(.6, M.lensInner), W / 2 - 5.4, 0, z + .09);
      // top button + volume: kept off the rounded corners (straight edge ends at |x| = 71.75 mm), 0.5 mm proud
      for (const [x, len] of [[52, 32], [26, 13], [10, 13]]) put(g, rbox(len, 1.8, 3.4, .8, M.ipad), x, H / 2 - .4, 0);
      // speaker holes: flush with the edge (outer face of each 0.6 mm cylinder lies on the edge), clear of the corners
      put(g, many(new THREE.CylinderGeometry(.7, .7, .6, 10), M.port, 24, (i, o) => {
        const k = i % 8, grp = (i / 8) | 0;                                          // bottom-left, bottom-right, top-left
        o.position.set((grp === 1 ? 1 : -1) * (44 + k * 3.2), (grp === 2 ? 1 : -1) * (H / 2 - .29), 0);
      }));
      put(g, rbox(9, 1.6, 3.2, 1.2, M.port), 0, -H / 2 + .78, 0);                  // USB-C, flush
      for (let i = -1; i <= 1; i++) put(g, rbox(.8, 2.2, 2.2, .4, M.lensRing), -W / 2 - .1, i * 4, 0);  // Smart Connector
      put(g, back(lens(5.4)), W / 2 - 13, H / 2 - 13, -z);
      put(g, back(dot(2.4, M.flash)), W / 2 - 13, H / 2 - 25, -z - .05);
      g.userData.update = (e) => tex.ipad.paintAt(reduce ? -1 : e);
      return g;
    }

    function fold8() {
      const g = new THREE.Group(), body = new THREE.Group(), HW = 80.7, H = 123.9, D = 4.5, z = D / 2, r = 7;
      const left = new THREE.Group(), hinge = new THREE.Group(), right = new THREE.Group();
      const v3 = () => new THREE.Vector3();
      const DUO = {
        uImgC: { value: v3() }, uImgX: { value: v3() }, uImgY: { value: v3() }, uImgN: { value: v3() },
        uHingeP: { value: v3() }, uHingeD: { value: v3() }, uPanelW: { value: 1 },
        uBlur: { value: 0 }, uOpen: { value: 1 }, uShared: { value: tex.foldIn },
      };
      // moving: blur/dim measured from the hinge; cover: own wallpaper dissolves into the shared picture
      const duo = (mesh, moving, cover) => {
        mesh.material.userData.patch = (sh) => {
          Object.assign(sh.uniforms, DUO, { uMoving: { value: moving }, uCover: { value: cover } });
          sh.fragmentShader = sh.fragmentShader
            .replace("void main() {", DUO_UNIFORMS + "\nvoid main() {")
            .replace("#include <emissivemap_fragment>", DUO_GLSL);
        };
        mesh.material.customProgramCacheKey = () => "fold-duo";   // its own shader program
        return mesh;
      };
      // left half: inner screen on the front, cameras on the back
      put(left, slab(HW, H, D, [r, .6, .6, r], M.foldFrame, .7), -HW / 2, 0, 0);
      put(left, panel(HW - .7, H - 1.4, [r - .7, .01, .01, r - .7], M.glass), -(HW - .7) / 2, 0, z + .02);   // glass runs to the hinge: no seam
      put(left, duo(screen(77.2, 115.8, tex.foldIn, 0, [0, .5]), 0, 0), -38.6, 0, z + .06);
      put(left, back(panel(HW - 1.4, H - 1.4, [.3, r - .7, r - .7, .3], M.foldBack)), -HW / 2, 0, -z - .02);
      put(left, back(lens(5.2)), -13, 48, -z - .03);
      put(left, back(lens(5.2)), -13, 33.5, -z - .03);
      put(left, back(dot(1.6, M.flash)), -24, 48, -z - .05);
      // right half: inner screen on the front, cover screen on the back
      put(right, slab(HW, H, D, [.6, r, r, .6], M.foldFrame, .7), HW / 2, 0, 0);
      put(right, panel(HW - .7, H - 1.4, [.01, r - .7, r - .7, .01], M.glass), (HW - .7) / 2, 0, z + .02);
      put(right, duo(screen(77.2, 115.8, tex.foldIn, 0, [.5, 1]), 1, 0), 38.6, 0, z + .06);
      put(right, back(panel(HW - 1.4, H - 1.4, [r - .7, .3, .3, r - .7], M.glass)), HW / 2, 0, -z - .02);
      put(right, duo(back(screen(72, 115, tex.foldOut)), 1, 1), HW / 2 + 1.5, 0, -z - .06);
      put(right, rbox(1.4, 12, 2.6, .6, M.foldFrame), HW + .1, 22, 0);               // side key (fingerprint)
      put(right, rbox(1.4, 20, 2.6, .6, M.foldFrame), HW + .1, 42, 0);               // volume
      put(body, new THREE.Mesh(new THREE.CylinderGeometry(z - .5, z - .5, H - 3, 32), M.hinge));   // hinge stays inside the body
      hinge.position.z = z;                 // fold axis runs along the inner face
      right.position.z = -z;
      hinge.add(right);
      body.add(left, hinge);
      g.add(body);

      // Arrives folded on the cover screen, then opens like a book. Each frame the shared image is placed in view
      // space: the open inner screen's picture at true scale, its centre sliding from the cover to the hinge.
      const mv = new THREE.Matrix4(), tmp = v3();
      const at = (x, y, out) => out.set(x, y, z + .06).applyMatrix4(mv);
      g.userData.update = (e) => {
        const s = reduce ? 1 : smooth((e - 1.2) / 1.7);
        hinge.rotation.y = -Math.PI * (1 - s);
        body.position.x = (HW / 2) * (1 - s);
        g.updateWorldMatrix(true, true);
        camera.updateMatrixWorld();
        mv.multiplyMatrices(camera.matrixWorldInverse, left.matrixWorld);
        const cx = -(HW / 2 + 1.5) * (1 - smooth((s - .12) / .7));
        at(cx, 0, DUO.uImgC.value);
        DUO.uImgX.value.subVectors(at(cx + 77.2, 0, tmp), DUO.uImgC.value);   // half width = one panel
        DUO.uImgY.value.subVectors(at(cx, 57.9, tmp), DUO.uImgC.value);       // half height
        DUO.uImgN.value.crossVectors(DUO.uImgX.value, DUO.uImgY.value).normalize();
        DUO.uHingeP.value.set(0, 0, z).applyMatrix4(mv);                       // hinge axis, for blur / dimming
        DUO.uHingeD.value.copy(DUO.uImgY.value).normalize();
        DUO.uPanelW.value = DUO.uImgX.value.length();
        DUO.uBlur.value = .039 * smooth(s / .22) * (1 - smooth((s - .5) / .45));   // ~48 px at the free edge mid-swing, 0 at rest
        DUO.uOpen.value = s;
      };
      return g;
    }

    function iphone18Pro() {
      const g = new THREE.Group(), W = 71.9, H = 150, D = 8.75, z = D / 2;
      put(g, slab(W, H, D, 12.5, M.burgundy, 2.6));                                 // aluminium unibody
      put(g, panel(W - 1.8, H - 1.8, 11.6, M.glass), 0, 0, z + .02);
      put(g, screen(66.6, 144.8, tex.iphone), 0, 0, z + .06);
      // buttons: Action + volume (left), side button + Camera Control (right)
      for (const [y, len] of [[38, 6.5], [25, 11], [11.5, 11]]) put(g, rbox(1.6, len, 3.2, .7, M.burgundy), -W / 2 - .15, y, 0);
      put(g, rbox(1.6, 17, 3.2, .7, M.burgundy), W / 2 + .15, 22, 0);
      put(g, rbox(1.1, 18, 3.6, .5, M.glass), W / 2 + .05, -26, 0);
      // bottom: USB-C, speaker and mic holes
      put(g, rbox(9, 1.4, 3.2, 1.2, M.port), 0, -H / 2 + .68, 0);                  // flush with the edge
      put(g, many(new THREE.CylinderGeometry(.55, .55, .6, 10), M.port, 12, (i, o) => o.position.set((i < 6 ? -1 : 1) * (11 + (i % 6) * 2.2), -H / 2 + .29, 0)));
      // back: full-width camera plateau over a Ceramic Shield panel
      put(g, back(panel(W - 4.4, H - 43, [3, 3, 10.5, 10.5], M.burgGlass)), 0, -19.6, -z - .02);
      put(g, slab(W - 1.6, 37.5, 2, [11.5, 11.5, 3.5, 3.5], M.burgundy, .7), 0, H / 2 - 19.4, -z - .75);
      for (const [x, y] of [[18.6, 64.5], [18.6, 46.2], [4.6, 55.4]]) put(g, back(lens(7.3)), x, y, -z - 1.7);
      put(g, back(dot(3, M.flash)), -18.6, 64.5, -z - 1.76);
      put(g, back(dot(3.1, M.lensBlack)), -18.6, 46.2, -z - 1.76);
      put(g, back(dot(.6, M.port)), -8, 68.5, -z - 1.76);
      // a full turn to show off the camera plateau, then the Dynamic Island live activity
      g.userData.update = (e) => {
        tex.iphone.paintAt(reduce ? 0 : e);
        const k = reduce ? 0 : clamp01((e - 1) / 1.15);
        g.rotation.y = Math.PI * 2 * (k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
      };
      return g;
    }

    // Centre a model and scale it to a shared size; returns the pivot that gets animated.
    function fit(model, H = 2.65, W = 2.85) {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
      centre.z = box.max.z - Math.min(size.z / 2, size.x * .15);   // deep CRTs turn around their face, not their middle
      model.position.sub(centre);
      const pivot = new THREE.Group();
      pivot.add(model);
      pivot.userData.k = Math.min(H / size.y, W / size.x);
      pivot.userData.h = size.y * pivot.userData.k;                // fitted height, for the floor shadow
      pivot.userData.update = model.userData.update;
      return pivot;
    }

    const DEVICES = [
      { year: 1981, name: "IBM 5151", spec: "80×25 · green phosphor", build: ibm5151,
        alt: "ASCII-art portrait of Debaprasad on a green-phosphor IBM 5151 monitor" },
      { year: 1998, name: "iMac G3", spec: "15″ CRT · web-safe 216", build: imacG3,
        alt: "Portrait of Debaprasad in 216 web-safe colours on a Bondi Blue iMac G3" },
      { year: 2022, name: "iPad (10th gen)", spec: "10.9″ Liquid Retina", build: ipad10, scale: 1.3,
        alt: "Portrait of Debaprasad on the lock screen of a yellow iPad, 10th generation" },
      { year: 2024, name: "iMac M4", spec: "24″ 4.5K Retina", build: imacM4,
        alt: "Photo of Debaprasad on the lock screen of a 24-inch iMac M4" },
      { year: 2026, name: "Galaxy Z Fold 8", spec: "7.6″ 4:3 foldable", build: fold8, fold: true,
        alt: "Photo of Debaprasad on the unfolded screen of a Galaxy Z Fold 8" },
      { year: 2026, name: "iPhone 18 Pro", spec: "6.3″ Super Retina XDR", build: iphone18Pro, scale: 1.3,
        alt: "Portrait of Debaprasad on the lock screen of a Burgundy iPhone 18 Pro" },
    ];

    /* ---------- black-hole pull: vertex shader patch shared by every device material ---------- */
    const TILT = .12, ROLL = .38;   // near edge-on, disk rising to the right
    const SUCK = {
      uSuck: { value: 0 }, uBH: { value: new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorldInverse) },
      uRoll: { value: ROLL }, uFlat: { value: Math.sin(TILT) },
    };
    function patchSuck(shader) {
      Object.assign(shader.uniforms, SUCK);
      shader.vertexShader = shader.vertexShader
        .replace("void main() {", "uniform float uSuck; uniform vec3 uBH; uniform float uRoll; uniform float uFlat;\nvarying float vPull;\nvoid main() {\n  vPull = 0.0;")
        .replace("#include <project_vertex>", `#include <project_vertex>
          if (uSuck > 0.0) {
            vec3 d = mvPosition.xyz - uBH;
            float r = length(d.xy) + 1e-4;
            // inner parts fall first; outer parts trail behind as spiral arms
            float pull = clamp((uSuck * 1.2 - 0.1) * (1.0 + 0.7 / (r + 0.35)), 0.0, 1.0);
            pull = pull * pull * (3.0 - 2.0 * pull);
            float ang = uSuck * (3.0 + 8.0 * pull) / (0.3 + r);
            float c = cos(ang), s = sin(ang);
            d.xy = mat2(c, s, -s, c) * d.xy;
            // flatten into the (tilted, rolled) accretion-disk plane
            float cr = cos(uRoll), sr = sin(uRoll);
            mat2 R = mat2(cr, -sr, sr, cr);
            d.xy = R * d.xy; d.y *= mix(1.0, uFlat, pull); d.xy = transpose(R) * d.xy;
            d *= 1.0 - pull;
            vPull = pull;
            mvPosition.xyz = uBH + d;
            gl_Position = projectionMatrix * mvPosition;
          }`);
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "varying float vPull;\nvoid main() {")
        .replace("#include <dithering_fragment>", "gl_FragColor *= 1.0 - 0.97 * vPull;\n#include <dithering_fragment>");
    }

    for (const d of DEVICES) {
      d.model = fit(d.build());
      const grow = d.scale || 1;                                  // per-device size tweak on top of the shared fit
      d.model.userData.k *= grow;
      d.model.userData.h *= grow;
      d.model.traverse((o) => {
        if (o.material) o.material.onBeforeCompile = (sh) => { patchSuck(sh); o.material.userData.patch?.(sh); };
      });
      d.model.visible = false;
      scene.add(d.model);
    }

    // Soft blob under the floating device.
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sctx = sc.getContext("2d"), rg = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(0,0,0,.5)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = rg; sctx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.position.set(0, -1.68, -.3);
    scene.add(shadow);

    /* ---------- black hole: Schwarzschild geodesics + relativistic thin disk, composited over the scene ---------- */
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const centre = new THREE.Vector3(0, 0, 0).project(camera);
    const BH = {
      tScene: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(centre.x * .5 + .5, centre.y * .5 + .5) },
      uSize: { value: 0 }, uGlow: { value: 0 }, uTime: { value: 0 }, uRipple: { value: -1 },
      uTilt: { value: TILT }, uRoll: { value: ROLL }, uLight: { value: 0 }, uForm: { value: 0 },
      uSteps: { value: 440 }, uSS: { value: 4 },                      // loop bounds: see the shader
    };
    const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: BH, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene;
        uniform vec2 uRes, uCenter;
        uniform float uSize, uGlow, uTime, uRipple, uTilt, uRoll, uLight;   // uLight: 1 on the white (light-mode) page
        uniform float uForm;      // 0..1: how far out the disk has formed (grows outward, drains inward)
        // Loop bounds as uniforms (440 steps, 4 samples): with constant bounds the Direct3D shader compiler
        // unrolls the ray march into a huge program and compiles it for ~40 s on Windows.
        uniform int uSteps, uSS;
        varying vec2 vUv;

        // Units: Schwarzschild radius rs = 1. Light follows the exact Schwarzschild orbit equation
        // d2u/dphi2 + u = 1.5 u^2 (u = 1/r), integrated with RK4 in each ray's orbital plane.
        const float D = 60.0;         // observer distance (far: little perspective, like a long lens)
        const float RIN = 3.0;        // innermost stable circular orbit (6M): crisp inner edge
        const float ROUT = 18.0;      // long, thin disk that tapers to points
        const float BCRIT = 2.598;    // critical impact parameter 3*sqrt(3)/2: edge of the shadow
        const float LENS = 0.85;      // the scene is not at infinity, so bend it slightly less

        mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float noise(vec3 x) {
          vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }

        // Small, sparse stars; sampled at the deflected position so they are lensed too.
        float stars(vec2 p) {
          vec2 g = p / 0.008, id = floor(g), f = fract(g) - 0.5;
          float h = hash(vec3(id, 3.1));
          if (h < 0.95) return 0.0;
          vec2 o = vec2(hash(vec3(id, 7.7)), hash(vec3(id, 9.2))) - 0.5;
          return smoothstep(0.09, 0.0, length(f - o * 0.75)) * (h - 0.95) * 22.0;
        }

        vec2 orbit(vec2 s) { return vec2(s.y, 1.5 * s.x * s.x - s.x); }
        vec2 rk4(vec2 s, float h) {
          vec2 k1 = orbit(s), k2 = orbit(s + 0.5 * h * k1), k3 = orbit(s + 0.5 * h * k2), k4 = orbit(s + h * k3);
          return s + h / 6.0 * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
        }

        // Thin accretion disk in the y = 0 plane. k = direction from the emitting gas towards the observer.
        vec4 disk(vec3 p, vec3 k) {
          float r = length(p.xz);
          if (r < RIN || r > ROUT) return vec4(0.0);
          float x = r / RIN;
          float prof = pow(x, -0.75) * pow(max(1.0 - inversesqrt(x), 0.0), 0.25) / 0.488;  // Novikov-Thorne T(r) / Tpeak
          float beta = sqrt(0.5 / (r - 1.0));                                              // Keplerian speed, static frame
          float g = sqrt(1.0 - 1.0 / r) * sqrt(1.0 - beta * beta)
                    / (1.0 - beta * dot(normalize(vec3(p.z, 0.0, -p.x)), k));              // gravitational x Doppler shift
          float t = prof * mix(1.0, g, 0.55);                                              // beaming softened, cinematic
          // fine concentric striations sheared by Keplerian rotation, plus gentle large-scale variation
          float a = atan(p.z, p.x) + uTime * 1.6 * pow(RIN / r, 1.5), lr = log(r);       // Keplerian: inner gas laps outer gas
          vec2 c = vec2(cos(a), sin(a));
          float streak = fbm(vec3(c * 0.9, lr * 70.0));
          float fine = noise(vec3(c * 0.5, lr * 170.0));
          float soft = fbm(vec3(c * 2.2, lr * 6.0 + 5.0));
          float clump = fbm(vec3(c * 3.2, lr * 24.0) + vec3(0.0, 0.0, uTime * 0.12));      // flowing, slowly evolving clumps
          float dens = mix(0.22, 1.0, smoothstep(0.3, 0.72, streak)) * (0.7 + 0.3 * fine) * (0.75 + 0.5 * soft)
                     * (0.55 + 0.9 * clump);                                                  // thin rings, dark lanes, moving gas
          float reach = mix(RIN + 0.6, ROUT, uForm);
          float edge = smoothstep(RIN, RIN + 0.06, r) * (1.0 - smoothstep(ROUT * 0.3, ROUT, r)) * smoothstep(reach, reach - 2.0, r);
          float I = pow(t, 4.0) * dens * edge;
          vec3 col = mix(vec3(1.0, 0.52, 0.34), vec3(1.0, 0.95, 0.9), smoothstep(0.45, 1.05, t));  // warm peach -> white
          vec4 glow = vec4(col * I * 1.5, clamp(I * 1.25, 0.0, 1.0));
          // On a white page a white-hot disk would vanish: draw it as warm copper-to-gold ink instead.
          vec3 ink = mix(vec3(0.22, 0.09, 0.04), vec3(0.95, 0.55, 0.26), smoothstep(0.1, 1.1, I));
          float inkA = clamp(I * 1.8 + 0.4 * dens * edge, 0.0, 1.0);
          return mix(glow, vec4(ink * inkA, inkA), uLight);                                     // premultiplied
        }

        // Everything at one screen position (offset from the hole, in canvas-height units). Premultiplied RGBA.
        vec4 shade(vec2 px, float size) {
          float L = length(px);
          float kk = BCRIT / (size * D);            // screen offset -> ray slope; shadow edge lands on uSize
          vec2 off = px;
          vec4 acc = vec4(0.0);
          int state = 0;                            // 0 tracing, 1 horizon, 2 escaped, 3 opaque / lost

          if (L < size * 12.0) {
            float ct = cos(uTilt), st = sin(uTilt);
            vec3 ro = vec3(0.0, st, -ct) * D, fw = vec3(0.0, -st, ct), rt = vec3(1.0, 0.0, 0.0), up = vec3(0.0, ct, st);
            vec2 q = rot(uRoll) * px * kk;
            vec3 rd = normalize(fw + q.x * rt + q.y * up);
            vec3 e1 = ro / D, nrm = cross(e1, rd);
            float sinA = length(nrm);
            vec3 dir = rd;
            if (sinA < 1e-6) state = 1;
            else {
              vec3 e2 = normalize(cross(nrm, e1));
              vec2 s = vec2(1.0 / D, -dot(rd, e1) / (D * sinA));
              float phi = 0.0;
              vec3 prev = ro;
              for (int i = 0; i < uSteps; i++) {
                float h = mix(0.08, 0.007, smoothstep(0.03, 0.42, s.x));   // fine steps near the photon sphere
                vec2 ns = rk4(s, h);
                phi += h;
                if (ns.x >= 1.0) { state = 1; break; }
                vec3 radial = cos(phi) * e1 + sin(phi) * e2, tang = -sin(phi) * e1 + cos(phi) * e2;
                dir = normalize(tang * ns.x - radial * ns.y);
                if (ns.x <= 1e-4) { state = 2; break; }
                vec3 p = radial / ns.x;
                if (prev.y * p.y < 0.0) {
                  vec4 d = disk(mix(prev, p, prev.y / (prev.y - p.y)), -dir);
                  acc.rgb += (1.0 - acc.a) * d.rgb;
                  acc.a += (1.0 - acc.a) * d.a;
                  if (acc.a > 0.985) { state = 3; break; }
                }
                s = ns; prev = p;
                if (s.x < 1.0 / (D * 1.3) && s.y < 0.0) { state = 2; break; }
              }
              if (state == 0) state = 1;            // still circling the photon sphere: never reaches us
            }
            if (state == 2) {
              float fz = dot(dir, fw);
              vec2 so = transpose(rot(uRoll)) * (vec2(dot(dir, rt), dot(dir, up)) / max(fz, 0.05) / kk);
              off = mix(px, so, LENS);
              if (fz < 0.05) state = 3;             // bent behind the observer: nothing to sample
            }
          } else {
            float b = L * kk * D;                    // weak field: deflection 2 rs / b
            off = px - normalize(px) * (2.0 / b) / kk * LENS;
            state = 2;
          }
          if (uRipple >= 0.0) {                      // gravitational-wave ring after the swallow
            float k = L - uRipple * 0.9;
            off += normalize(px + 1e-5) * 0.01 * exp(-k * k * 300.0) * exp(-uRipple * 3.0);
          }

          vec2 asp = vec2(uRes.x / uRes.y, 1.0), suv = uCenter + off / asp;
          vec4 bg = vec4(0.0);
          if (state == 1) bg = vec4(0.0, 0.0, 0.0, 1.0);
          else if (state == 2 && suv == clamp(suv, 0.0, 1.0)) bg = texture2D(tScene, suv);
          // charcoal space with grey smoke and fine stars opens around the hole (lensed like everything else);
          // light mode: a faint pale-graphite haze that dissolves into the white page instead of a dark patch.
          // Outside the patch (sp = 0) it adds nothing, so its noise is not evaluated there (most of the canvas).
          float sp = mix(uGlow * smoothstep(1.0, 0.25, L / (size * 8.5)), uGlow * 0.5 * smoothstep(1.0, 0.0, L / (size * 7.0)), uLight);
          if (sp > 0.0) {
            float sky = state == 2 ? 1.0 : 0.0;     // rays that wrapped behind the hole see plain dark space
            float neb = fbm(vec3(off * 4.5, 1.3)), wisp = fbm(vec3(off * 13.0 + 3.0, 7.0));
            vec3 space = vec3(0.014, 0.016, 0.02) + sky * (vec3(0.12, 0.125, 0.135) * pow(neb, 3.0) * 1.5
                       + vec3(0.03) * wisp * neb + vec3(0.92, 0.94, 1.0) * stars(off));
            vec3 haze = vec3(0.56, 0.58, 0.62) - vec3(0.12) * pow(neb, 2.0) * sky;
            bg += vec4(mix(space, haze, uLight) * sp, sp) * (1.0 - bg.a);
          }
          acc *= uGlow;
          return vec4(acc.rgb + bg.rgb * (1.0 - acc.a), acc.a + bg.a * (1.0 - acc.a));
        }

        void main() {
          vec2 asp = vec2(uRes.x / uRes.y, 1.0);
          vec2 px = (vUv - uCenter) * asp;
          float size = max(uSize, 1e-5), L = length(px);
          // 4x rotated-grid supersampling near the hole keeps the thin rings crisp. One loop, so shade() is
          // compiled once, not four times.
          int n = L < size * 5.0 ? uSS : 1;
          float d = 1.0 / uRes.y;
          vec4 c = vec4(0.0);
          for (int k = 0; k < uSS; k++) {
            if (k >= n) break;
            vec2 o = n == 1 ? vec2(0.0) : k == 0 ? vec2(-0.125, -0.375) : k == 1 ? vec2(0.375, -0.125)
                   : k == 2 ? vec2(0.125, 0.375) : vec2(-0.375, 0.125);
            c += shade(px + o * d, size);
          }
          c /= float(n);
          float alpha = clamp(c.a, 0.0, 1.0);
          gl_FragColor = vec4(c.rgb / max(alpha, 1e-4), alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postScene.add(post);

    // Compile every shader program now, in the background (KHR_parallel_shader_compile), and never use one before
    // it is ready: a program's first use waits for its compile, which froze the page (for seconds on Windows/
    // Direct3D) at a device's first appearance and at the first black-hole transition. Three sets: every device as
    // drawn to the screen, the same drawn into the black hole's render target (its own variant: no tone mapping,
    // linear output), and the black-hole pass. The first device appears when the first set is ready; transitions
    // wait for the other two (the current device simply holds a little longer).
    for (const d of DEVICES) d.model.visible = true;
    const warmScreen = renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(rt);
    const warmRT = renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(null);
    const warmPost = renderer.compileAsync(postScene, postCam);
    for (const d of DEVICES) d.model.visible = false;
    let ready = false, bhReady = false;
    warmScreen.then(() => { if (signal.aborted) return; ready = true; show(cur); });
    // Then, in idle time, a few ms at a go, each program's first-use setup (uniform/attribute lookups, which are
    // synchronous GPU queries), so no device swap ever waits on one either.
    Promise.all([warmScreen, warmRT, warmPost]).then(() => {
      bhReady = true;
      const progs = [...renderer.info.programs], idle = window.requestIdleCallback || ((f) => setTimeout(f, 30));
      const step = () => {
        if (signal.aborted) return;
        const t0 = performance.now();
        while (progs.length && performance.now() - t0 < 4) { const p = progs.pop(); p.getUniforms(); p.getAttributes(); }
        if (progs.length) idle(step);
      };
      idle(step);
    });

    /* ---------- timeline ---------- */
    const HOLD = 3400, FOLD_HOLD = 4800, TRANS = 2000, PEAK = .0442;   // shadow radius, fraction of canvas height
    const clock = new THREE.Clock(), holds = new Set();
    let cur = 0, timer = 0, holdStart = 0, holdLeft = 0, busy = false, shownAt = 0, popping = true, trans = null;

    const holdFor = (i) => (DEVICES[i].fold ? FOLD_HOLD : HOLD);

    function show(i, viaHole = false) {
      DEVICES[cur].model.visible = false;
      DEVICES[i].model.visible = true;
      cur = i;
      shownAt = clock.getElapsedTime();
      popping = !viaHole;
      sceneEl.setAttribute("aria-label", `${DEVICES[i].alt}. Show the next device.`);
      if (!reduce && !viaHole) schedule(holdFor(i));
    }

    function schedule(ms) {
      clearTimeout(timer);
      holdStart = performance.now();
      holdLeft = ms;
      if (!holds.size) timer = setTimeout(next, ms);
    }
    const next = () => go((cur + 1) % DEVICES.length);

    // Pause while hovered, keyboard-focused or in a background tab; resume where it left off.
    function setHold(why, on) {
      if (reduce) return;
      const was = holds.size;
      on ? holds.add(why) : holds.delete(why);
      if (busy) return;                      // the transition re-checks holds when it ends
      if (!was && holds.size) {
        clearTimeout(timer);
        holdLeft -= performance.now() - holdStart;
      } else if (was && !holds.size) {
        holdStart = performance.now();
        timer = setTimeout(next, Math.max(0, holdLeft));
      }
    }

    function go(i) {
      if (busy || i === cur) return;
      clearTimeout(timer);
      if (reduce) return show(i);
      if (!bhReady) return schedule(holdFor(cur));                      // still compiling: hold this device longer
      if (scrolling()) return schedule(400);                            // mid-scroll: start once the scroll settles
      busy = true;
      trans = { t0: performance.now(), to: i, swapped: false };
    }

    // Advance the black-hole transition; returns true while it is running.
    function stepHole() {
      if (!trans) return false;
      const p = (performance.now() - trans.t0) / TRANS;
      BH.uLight.value = root.classList.contains("dark") ? 0 : 1;   // theme can change mid-transition
      const grow = 1 - (1 - clamp01(p / .26)) ** 3, shrink = clamp01((p - .72) / .28) ** 3;
      BH.uSize.value = (PEAK / OVER) * Math.min(grow, 1 - shrink);   // same on-screen size on the larger canvas
      BH.uGlow.value = Math.min(smooth((p - .02) / .2), 1 - smooth((p - .76) / .24));
      BH.uForm.value = Math.min(smooth((p - .04) / .42), 1 - smooth((p - .6) / .32));   // disk forms outward, drains inward
      BH.uTime.value = (performance.now() - trans.t0) / 1000 + 2;                      // fresh flow clock per transition
      BH.uRoll.value = SUCK.uRoll.value = ROLL + Math.sin(p * Math.PI) * .05;          // slow drifting roll
      if (!trans.swapped && p >= .5) { trans.swapped = true; show(trans.to, true); dispatchEvent(new CustomEvent("hole:swallow")); }
      SUCK.uSuck.value = trans.swapped ? 1 - smooth((p - .5) / .42) : smooth((p - .05) / .45);
      BH.uRipple.value = trans.swapped ? (p - .5) * TRANS / 1000 : -1;
      const kick = Math.exp(-(((p - .5) / .05) ** 2)) * .025;          // tiny camera jolt on the swallow
      camera.position.set(CAM.x + (Math.random() - .5) * kick, CAM.y + (Math.random() - .5) * kick, CAM.z);
      if (p < 1) return true;
      trans = null;
      busy = false;
      SUCK.uSuck.value = 0;
      BH.uSize.value = BH.uGlow.value = 0;
      camera.position.copy(CAM);
      if (holds.size) { holdLeft = holdFor(cur); holdStart = performance.now(); }
      else schedule(holdFor(cur));
      return false;
    }

    /* ---------- render loop ---------- */
    const pointer = { x: 0, y: 0 }, tilt = { x: 0, y: 0 }, buf = new THREE.Vector2();
    addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
    }, { signal });

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.setSize(width * OVER, height * OVER, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.getDrawingBufferSize(buf);
      rt.setSize(buf.x, buf.y);
      BH.uRes.value.copy(buf);
    });
    ro.observe(sceneEl);

    const motion = reduce ? 0 : 1;
    let skip = false;
    const loop = () => {
      if (!ready || (scrolling() && (skip = !skip))) return;          // not compiled yet / half rate while scrolling
      const t = clock.getElapsedTime(), holing = stepHole(), s = SUCK.uSuck.value;   // stepHole may swap devices,
      const e = Math.max(0, t - shownAt), m = DEVICES[cur].model;                  // so read the current one after it
      tilt.x += (pointer.x - tilt.x) * .05;
      tilt.y += (pointer.y - tilt.y) * .05;
      const pop = popping ? 1 - motion * .45 * Math.exp(-7 * e) * Math.cos(12 * e) : 1;   // springy scale-in
      const rise = popping ? -.3 * motion * Math.exp(-6 * e) : 0;
      const spin = popping ? -1.3 * Math.exp(-5 * e) : 0;
      const bob = motion * Math.sin(t * 1.4) * .06;
      m.scale.setScalar(m.userData.k * pop);
      m.position.set(0, bob + rise, 0);
      m.rotation.set(.06 + tilt.y * .15, -.32 + tilt.x * .35 + motion * (Math.sin(t * .55) * .2 + spin) + s * 2.4, s * .5);
      m.userData.update?.(e);
      shadow.position.y = Math.min(-1.68, -m.userData.h / 2 - .12);   // stays under taller devices
      shadow.scale.set(2.5 * (1 - bob * .6), .32, 1);
      shadow.material.opacity = Math.min(1, .9 - bob * 2) * (1 - s);
      if (holing) {
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCam);
      } else {
        renderer.render(scene, camera);
      }
    };
    renderer.setAnimationLoop(loop);

    // Off screen (scrolled past the hero): stop rendering and hold the device timeline where it is.
    const io = new IntersectionObserver(([en]) => {
      renderer.setAnimationLoop(en.isIntersecting ? loop : null);
      setHold("offscreen", !en.isIntersecting);
    }, { rootMargin: "25% 0px" });
    io.observe(sceneEl);
    cleanups.push(() => {
      io.disconnect(); ro.disconnect(); clearTimeout(timer);
      renderer.setAnimationLoop(null);
      renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
    });

    sceneEl.append(renderer.domElement);
    sceneEl.addEventListener("click", next, { signal });
    sceneEl.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && setHold("hover", true), { signal });
    sceneEl.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && setHold("hover", false), { signal });
    sceneEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); } }, { signal });
    sceneEl.addEventListener("focus", () => sceneEl.matches(":focus-visible") && setHold("focus", true), { signal });
    sceneEl.addEventListener("blur", () => setHold("focus", false), { signal });
    document.addEventListener("visibilitychange", () => setHold("tab", document.hidden), { signal });

    // (the first show(cur) runs when the first shaders are ready, above)
  }

  /* ================= Boot (last, so every helper above is initialised) ================= */
  (async () => {
  try {
    [THREE, { RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
      import("three"),
      import("three/addons/geometries/RoundedBoxGeometry.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]);
    // Build the 3D stage once the hero's entrance has played (~1.3 s), at the next idle moment: creating the WebGL
    // context and sizing it block the main thread for up to ~1.5 s on some machines (ANGLE/Direct3D), which
    // would stutter the entrance. After it, a block cannot touch scrolling (scroll and sky drift run on the
    // compositor).
    await new Promise((r) => setTimeout(r, Math.max(0, mountedAt + 1300 - performance.now())));
    await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 600 }) : setTimeout(r, 0)));
    if (!signal.aborted) await start();
  } catch (err) {
    // No WebGL: keep the hero usable with the plain photo.
    if (signal.aborted) return;
    console.error(err);
    sceneEl.classList.add("fallback");
    sceneEl.style.backgroundImage = `url(${IMG.portrait})`;
  }
  })();

  return () => { life.abort(); cleanups.forEach((f) => f()); };
}
