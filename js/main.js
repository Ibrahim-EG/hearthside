'use strict';
(function () {
  const CFG = window.CONFIG;
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const boot = document.getElementById('boot');
  const ART = {}, CLOUDS = [];
  let SCALE = 1, OX = 0, OY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    SCALE = Math.max(canvas.width / CFG.VW, canvas.height / CFG.VH);
    OX = (canvas.width - CFG.VW * SCALE) / 2;
    OY = (canvas.height - CFG.VH * SCALE) / 2;
  }
  addEventListener('resize', resize);

  function px(im) {
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    c.getContext('2d').drawImage(im, 0, 0);
    return c;
  }
  // chroma-key the magenta backing out, with soft edges + despill
  function keyMagenta(im) {
    const c = px(im), x = c.getContext('2d');
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], g = p[i + 1], b = p[i + 2];
      const m = Math.min(r, b) - g;
      if (m > 24) { const s = Math.min(m, 90) * 0.5; p[i] = Math.max(0, r - s); p[i + 2] = Math.max(0, b - s); }
      if (m > 60) p[i + 3] = 0;
      else if (m > 28) p[i + 3] = Math.round(p[i + 3] * (1 - (m - 28) / 32));
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  // crop transparent margins so config rects refer to painted content only
  function trim(c) {
    const x = c.getContext('2d');
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
      if (d[(y * c.width + xx) * 4 + 3] > 8) {
        if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return c;
    const t = document.createElement('canvas');
    t.width = x1 - x0 + 1; t.height = y1 - y0 + 1;
    t.getContext('2d').drawImage(c, x0, y0, t.width, t.height, 0, 0, t.width, t.height);
    return t;
  }
  function sliceRows(c, n) {
    const out = [], h = Math.floor(c.height / n);
    for (let i = 0; i < n; i++) {
      const r = document.createElement('canvas');
      r.width = c.width; r.height = h;
      r.getContext('2d').drawImage(c, 0, i * h, c.width, h, 0, 0, c.width, h);
      out.push(trim(r));
    }
    return out;
  }
  function sliceHalf(c, side) {
    const w = Math.floor(c.width / 2);
    const r = document.createElement('canvas');
    r.width = w; r.height = c.height;
    r.getContext('2d').drawImage(c, side * w, 0, w, c.height, 0, 0, w, c.height);
    return trim(r);
  }

  const missing = [];
  function load(name) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => {
        const c = CFG.MAGENTA.includes(name) ? keyMagenta(im) : px(im);
        if (name === 'clouds') sliceRows(c, 3).forEach((r, i) => CLOUDS[i] = r);
        else if (name === 'sun_moon') { ART.sun = sliceHalf(c, 0); ART.moon = sliceHalf(c, 1); }
        else if (name === 'wood') { ART.wood_pile = sliceHalf(c, 0); ART.wood_log = sliceHalf(c, 1); }
        else ART[name] = trim(c);
        res();
      };
      im.onerror = () => { missing.push(CFG.FILES[name]); res(); };
      im.src = CFG.ASSET_DIR + CFG.FILES[name];
    });
  }

  function drawArt(a, r, alpha, add) {
    if (!a) return;
    const h = r.w * a.height / a.width;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    ctx.drawImage(a, r.x, r.y, r.w, h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  function render() {
    ctx.setTransform(SCALE, 0, 0, SCALE, OX, OY);
    const vx0 = -OX / SCALE, vy0 = -OY / SCALE, vw = canvas.width / SCALE, vh = canvas.height / SCALE;
    // LIGHT (code's job): sky
    const g = ctx.createLinearGradient(0, vy0, 0, vy0 + vh);
    for (const s of CFG.SKY) g.addColorStop(s[0], s[1]);
    ctx.fillStyle = g; ctx.fillRect(vx0, vy0, vw, vh);
    // LIGHT: sun glow, then painted sun disc
    const S = CFG.SUN, cx = S.x + S.w / 2, cy = S.y + S.w / 2;
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(cx, cy, 4, cx, cy, S.glowR);
    rg.addColorStop(0, 'rgba(255,214,140,' + S.glowA + ')');
    rg.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = rg; ctx.fillRect(cx - S.glowR, cy - S.glowR, S.glowR * 2, S.glowR * 2);
    ctx.globalCompositeOperation = 'source-over';
    drawArt(ART.sun, S, 1, false);
    for (const c of CFG.CLOUDS) drawArt(CLOUDS[c.row], c, c.alpha, false);
    // PAINT (the contract): every object is a painted layer
    for (const L of CFG.LAYERS) drawArt(ART[L.art], L, L.alpha, L.add);
    // LIGHT: warm grade + vignette
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = CFG.GRADE.warm; ctx.fillRect(vx0, vy0, vw, vh);
    ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(CFG.VW / 2, CFG.VH * 0.55, CFG.VH * 0.35, CFG.VW / 2, CFG.VH * 0.55, CFG.VH * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, CFG.GRADE.vignette);
    ctx.fillStyle = vg; ctx.fillRect(vx0, vy0, vw, vh);
  }

  // 24 fps cap: the painted, stop-motion pulse + battery saver
  let last = 0, acc = 0;
  const FRAME = 1000 / CFG.FPS;
  function tick(t) {
    requestAnimationFrame(tick);
    if (!last) last = t;
    acc += t - last; last = t;
    if (acc < FRAME) return;
    acc %= FRAME;
    render();
  }

  resize();
  Promise.all(Object.keys(CFG.FILES).map(load)).then(() => {
    if (missing.length) { boot.textContent = 'missing files: ' + missing.join(', '); return; }
    boot.classList.add('gone');
    requestAnimationFrame(tick);
  });
})();
