'use strict';
(function () {
  const CFG = window.CONFIG;
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const boot = document.getElementById('boot');
  const ART = {}, CLOUDS = [];
  let SCALE = 1, OX = 0, OY = 0, T = 0;
  const STATE = { fire: 'dead', satchel: 'closed', logs: 0, thrown: null };
  const LOG_SLOTS = [
    { dx: -35, dy: 6, rot: -0.45 }, { dx: 30, dy: -2, rot: 0.4 }, { dx: -2, dy: 16, rot: 0.08 }
  ];

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
    c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
    c.getContext('2d').drawImage(im, 0, 0);
    return c;
  }
  function crop(c, f) {
    const x = Math.floor(c.width * f[0]), y = Math.floor(c.height * f[1]);
    const w = Math.floor(c.width * (1 - f[0] - f[2])), h = Math.floor(c.height * (1 - f[1] - f[3]));
    const r = document.createElement('canvas'); r.width = w; r.height = h;
    r.getContext('2d').drawImage(c, x, y, w, h, 0, 0, w, h);
    return r;
  }
  // operates ON a canvas (fixed: no re-wrapping)
  function keyMagenta(c) {
    const x = c.getContext('2d');
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], g = p[i + 1], b = p[i + 2];
      const m = Math.min(r, b) - g;
      if (m > 0) { p[i] = Math.max(0, r - m); p[i + 2] = Math.max(0, b - m); }
      if (m > 55) p[i + 3] = 0;
      else if (m > 25) p[i + 3] = Math.round(p[i + 3] * (1 - (m - 25) / 30));
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function keyBlack(c) {
    const x = c.getContext('2d');
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) p[i + 3] = Math.max(p[i], p[i + 1], p[i + 2]);
    x.putImageData(d, 0, 0);
    return c;
  }
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

  function load(name) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => {
        try {
          let c = px(im);
          if (CFG.CROPS[name]) c = crop(c, CFG.CROPS[name]);
          if (CFG.MAGENTA.includes(name)) c = keyMagenta(c);
          if (CFG.BLACK.includes(name)) c = keyBlack(c);
          if (name === 'clouds') sliceRows(c, 3).forEach((r, i) => CLOUDS[i] = r);
          else if (name === 'sun_moon') { ART.sun = sliceHalf(c, 0); ART.moon = sliceHalf(c, 1); }
          else if (name === 'wood') { ART.wood_pile = sliceHalf(c, 0); ART.wood_log = sliceHalf(c, 1); }
          else ART[name] = trim(c);
        } catch (err) { boot.textContent = 'engine error in ' + name + ': ' + err.message; }
        res();
      };
      im.onerror = () => { boot.textContent = 'missing file: ' + CFG.FILES[name]; res(); };
      im.src = CFG.ASSET_DIR + CFG.FILES[name];
    });
  }

  function drawArt(a, r, alpha, comp) {
    if (!a) return;
    const h = r.w * a.height / a.width;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.globalCompositeOperation = comp || 'source-over';
    ctx.drawImage(a, r.x, r.y, r.w, h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawLog(x, y, w, rot) {
    const a = ART.wood_log; if (!a) return;
    const h = w * a.height / a.width;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.drawImage(a, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(SCALE, 0, 0, SCALE, OX, OY);
    const vx0 = -OX / SCALE, vy0 = -OY / SCALE, vw = canvas.width / SCALE, vh = canvas.height / SCALE;

    const g = ctx.createLinearGradient(0, vy0, 0, vy0 + vh);
    for (const s of CFG.SKY) g.addColorStop(s[0], s[1]);
    ctx.fillStyle = g; ctx.fillRect(vx0, vy0, vw, vh);

    for (const L of CFG.LAYERS) {
      if (L.state) {
        if (L.state === 'fire_dead' && STATE.fire !== 'dead') continue;
        if (L.state === 'fire_small' && STATE.fire !== 'small') continue;
        if (L.state === 'fire_ember' && STATE.fire !== 'ember') continue;
        if (L.state === 'satchel_closed' && STATE.satchel !== 'closed') continue;
        if (L.state === 'satchel_open' && STATE.satchel !== 'open') continue;
      }
      if (L.art === 'mountains') {
        drawArt(ART.mountains, L);
        const S = CFG.SUN, cx = S.x + S.w / 2, cy = S.y + S.w / 2;
        ctx.globalCompositeOperation = 'lighter';
        const rg = ctx.createRadialGradient(cx, cy, 4, cx, cy, S.glowR);
        rg.addColorStop(0, 'rgba(255,214,140,' + S.glowA + ')');
        rg.addColorStop(1, 'rgba(255,160,60,0)');
        ctx.fillStyle = rg; ctx.fillRect(cx - S.glowR, cy - S.glowR, S.glowR * 2, S.glowR * 2);
        ctx.globalCompositeOperation = 'source-over';
        drawArt(ART.sun, S, 1);
        for (const c of CFG.CLOUDS) drawArt(CLOUDS[c.row], c, c.alpha);
        continue;
      }
      drawArt(ART[L.art], L, L.alpha);
      if (L.art === 'ring_dead' && STATE.fire === 'dead') {
        for (let i = 0; i < STATE.logs; i++) {
          const s = LOG_SLOTS[i];
          drawLog(L.x + L.w / 2 + s.dx, L.y + 120 + s.dy, 150, s.rot);
        }
        if (STATE.thrown) {
          const t = Math.min(1, (T - STATE.thrown.t0) / 0.6);
          const fx = STATE.thrown.fx, fy = STATE.thrown.fy;
          const tx = L.x + L.w / 2, ty = L.y + 100;
          const mx = (fx + tx) / 2, my = Math.min(fy, ty) - 220;
          const u = 1 - t;
          drawLog(u * u * fx + 2 * u * t * mx + t * t * tx,
                  u * u * fy + 2 * u * t * my + t * t * ty, 150, -1.2 + t * 1.6);
        }
      }
      if ((L.art === 'ring_small' && STATE.fire === 'small') ||
          (L.art === 'ring_ember' && STATE.fire === 'ember')) {
        const base = STATE.fire === 'small' ? 0.28 : 0.14;
        const fl = base * (0.85 + 0.12 * Math.sin(T * 9) + 0.05 * Math.sin(T * 23));
        const cx = L.x + L.w / 2, cy = L.y + 110;
        ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 420);
        fg.addColorStop(0, 'rgba(255,170,70,' + fl + ')');
        fg.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = fg; ctx.fillRect(cx - 420, cy - 420, 840, 840);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = CFG.GRADE.warm; ctx.fillRect(vx0, vy0, vw, vh);
    ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(CFG.VW / 2, CFG.VH * 0.55, CFG.VH * 0.35, CFG.VW / 2, CFG.VH * 0.55, CFG.VH * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, CFG.GRADE.vignette);
    ctx.fillStyle = vg; ctx.fillRect(vx0, vy0, vw, vh);
  }

  let last = 0, acc = 0;
  const FRAME = 1000 / CFG.FPS;
  function tick(t) {
    requestAnimationFrame(tick);
    if (!last) { last = t; return; }
    const dt = Math.min((t - last) / 1000, 0.1);
    acc += t - last; last = t; T += dt;
    for (const c of CFG.CLOUDS) { c.x += (c.speed || 5) * dt; if (c.x > CFG.VW) c.x = -c.w; }
    if (STATE.thrown && T - STATE.thrown.t0 > 0.6) {
      STATE.logs = Math.min(3, STATE.logs + 1); STATE.thrown = null;
    }
    if (acc < FRAME) return;
    acc %= FRAME;
    render();
  }

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width * canvas.width - OX) / SCALE;
    const vy = ((e.clientY - rect.top) / rect.height * canvas.height - OY) / SCALE;
    for (const h of CFG.HITBOXES) {
      if (vx < h.x || vx > h.x + h.w || vy < h.y || vy > h.y + h.h) continue;
      if (h.id === 'wood') {
        if (STATE.logs < 3 && !STATE.thrown && STATE.fire === 'dead')
          STATE.thrown = { t0: T, fx: h.x + h.w / 2, fy: h.y + 60 };
      } else if (h.id === 'ring') {
        if (STATE.fire === 'dead' && STATE.logs > 0) STATE.fire = 'small';
        else if (STATE.fire === 'small') STATE.fire = 'ember';
        else if (STATE.fire === 'ember') { STATE.fire = 'dead'; STATE.logs = 0; }
      } else if (h.id === 'satchel') {
        STATE.satchel = STATE.satchel === 'closed' ? 'open' : 'closed';
      }
      break;
    }
  });

  resize();
  Promise.all(Object.keys(CFG.FILES).map(load)).then(() => {
    if (boot.textContent.indexOf('error') < 0 && boot.textContent.indexOf('missing') < 0)
      boot.classList.add('gone');
    requestAnimationFrame(tick);
  });
})();
