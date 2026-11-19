// Neon Coast Cover Studio — the cover engine.
// Draws a GTA-style multi-panel poster on any 2D canvas: panels filled with the
// user's photos (crop and position per panel), a Vice City neon-sunset grade,
// bold Anton title lettering with a Pacifico neon subtitle, a badge ribbon, a
// heat meter and poster grain. Every layout is fractions of the canvas, so the
// same state renders at any export size (1:1, 4:5, 9:16, 16:9).

export const EXPORT_SIZES = {
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
  '9:16': [1080, 1920],
  '16:9': [1920, 1080],
};

// Each layout: panels as fractions of the canvas plus a title zone. `tilt` is
// degrees of rotation for snapshot-style panels; `gutter` is the white gap.
export const LAYOUTS = {
  'hero-strip': {
    label: 'Hero + Strip',
    hint: 'One big hero photo over three small panels',
    panels: [
      { x: 0.03, y: 0.03, w: 0.94, h: 0.56 },
      { x: 0.03, y: 0.62, w: 0.30, h: 0.24 },
      { x: 0.35, y: 0.62, w: 0.30, h: 0.24 },
      { x: 0.67, y: 0.62, w: 0.30, h: 0.24 },
    ],
    title: { x: 0.05, y: 0.86, w: 0.90, h: 0.12, align: 'center' },
    gutter: 0.012,
  },
  'grid-nine': {
    label: 'Nine-Panel Grid',
    hint: 'A 3 x 3 grid with the title in the middle',
    panels: [
      { x: 0.03, y: 0.03, w: 0.30, h: 0.29 },
      { x: 0.35, y: 0.03, w: 0.30, h: 0.29 },
      { x: 0.67, y: 0.03, w: 0.30, h: 0.29 },
      { x: 0.03, y: 0.35, w: 0.30, h: 0.29 },
      { x: 0.67, y: 0.35, w: 0.30, h: 0.29 },
      { x: 0.03, y: 0.67, w: 0.30, h: 0.29 },
      { x: 0.35, y: 0.67, w: 0.30, h: 0.29 },
      { x: 0.67, y: 0.67, w: 0.30, h: 0.29 },
    ],
    title: { x: 0.35, y: 0.35, w: 0.30, h: 0.29, align: 'center' },
    gutter: 0.012,
  },
  'full-bleed': {
    label: 'Full Bleed',
    hint: 'One photo edge to edge, title band at the bottom',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
    title: { x: 0.05, y: 0.80, w: 0.90, h: 0.17, align: 'left' },
    gutter: 0,
  },
  'tilted-snaps': {
    label: 'Tilted Snapshots',
    hint: 'Three tilted snapshots on a neon gradient',
    panels: [
      { x: 0.08, y: 0.20, w: 0.52, h: 0.38, tilt: -5 },
      { x: 0.44, y: 0.40, w: 0.52, h: 0.38, tilt: 4 },
      { x: 0.16, y: 0.60, w: 0.52, h: 0.36, tilt: -2 },
    ],
    title: { x: 0.05, y: 0.02, w: 0.90, h: 0.16, align: 'center' },
    gutter: 0.012,
  },
  'duo-split': {
    label: 'Duo Split',
    hint: 'Two tall halves side by side',
    panels: [
      { x: 0.03, y: 0.03, w: 0.455, h: 0.72 },
      { x: 0.515, y: 0.03, w: 0.455, h: 0.72 },
    ],
    title: { x: 0.05, y: 0.77, w: 0.90, h: 0.20, align: 'center' },
    gutter: 0.012,
  },
  'strip-vertical': {
    label: 'Tall Hero',
    hint: 'A tall hero on the left, two panels on the right',
    panels: [
      { x: 0.03, y: 0.03, w: 0.55, h: 0.94 },
      { x: 0.61, y: 0.03, w: 0.36, h: 0.455 },
      { x: 0.61, y: 0.515, w: 0.36, h: 0.455 },
    ],
    title: { x: 0.61, y: 0.44, w: 0.36, h: 0.06, align: 'center' },
    gutter: 0.012,
  },
};

// Each grade: colours the whole cover is washed with. `tint` is laid over the
// photos, `wash` is a sunset gradient from the top, `glow` lights the title.
export const GRADES = {
  'neon-sunset': {
    label: 'Neon Sunset', tint: '#ff7a3d', wash: '#ff2e88', glow: '#ffd166',
    accent: '#ff2e88', sky: '#2b1055',
  },
  'vice-pink': {
    label: 'Vice Pink', tint: '#ff5da2', wash: '#b5179e', glow: '#ff8fd1',
    accent: '#ff5da2', sky: '#3d0c4f',
  },
  'teal-night': {
    label: 'Teal Night', tint: '#2de1c2', wash: '#0f4c81', glow: '#7df9e8',
    accent: '#2de1c2', sky: '#062a3a',
  },
  'golden-hour': {
    label: 'Golden Hour', tint: '#ffb347', wash: '#ff7b00', glow: '#fff3b0',
    accent: '#ff9f1c', sky: '#4a2405',
  },
  'hot-magenta': {
    label: 'Hot Magenta', tint: '#ff2975', wash: '#7b2ff7', glow: '#ff9de2',
    accent: '#ff2975', sky: '#2a0a4a',
  },
  'mono-noir': {
    label: 'Mono Noir', tint: '#9aa0b5', wash: '#1c1c28', glow: '#f2f2f2',
    accent: '#e8e8e8', sky: '#101014',
  },
};

export function defaultState() {
  const crops = {};
  for (const id of Object.keys(LAYOUTS)) {
    crops[id] = LAYOUTS[id].panels.map((p, i) => ({
      photo: i % 3, zoom: 1.12, ox: 0, oy: 0,
    }));
  }
  return {
    layout: 'hero-strip',
    grade: 'neon-sunset',
    gradeIntensity: 0.85,
    title: 'SUNSET HEIST',
    subtitle: 'Vice City nights',
    badge: 'NEON COAST',
    stars: 4,
    titleScale: 1,
    crops,
  };
}

// Draw one photo into a rectangle, cover-fit, with the panel's crop applied.
export function drawPhotoCover(ctx, img, x, y, w, h, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = crop?.zoom ?? 1;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const slackX = Math.max(0, dw - w) / 2;
  const slackY = Math.max(0, dh - h) / 2;
  const dx = x + (w - dw) / 2 + (crop?.ox ?? 0) * slackX;
  const dy = y + (h - dh) / 2 + (crop?.oy ?? 0) * slackY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundedRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

let grainTile = null;
function grainPattern(ctx) {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainTile = ctx.createPattern(tile, 'repeat');
  return grainTile;
}

function fitFont(ctx, text, maxWidth, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

// The title block: badge ribbon, big gradient title, neon script subtitle,
// heat-meter stars. `zone` is fractions of the canvas.
function drawTitleBlock(ctx, W, H, state, zone) {
  const grade = GRADES[state.grade];
  const zx = zone.x * W;
  const zy = zone.y * H;
  const zw = zone.w * W;
  const zh = zone.h * H;
  const unit = Math.min(W, H) / 100;
  const title = (state.title || 'UNTITLED').toUpperCase();
  const align = zone.align || 'center';
  const cx = align === 'left' ? zx : align === 'right' ? zx + zw : zx + zw / 2;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  // Badge ribbon above the title.
  const badgeH = Math.max(16, zh * 0.16);
  const badgeText = (state.badge || '').toUpperCase();
  if (badgeText) {
    ctx.save();
    ctx.translate(cx, zy + badgeH / 2);
    ctx.rotate(-0.03);
    ctx.font = `700 ${Math.max(11, badgeH * 0.55)}px Anton, sans-serif`;
    const bw = ctx.measureText(badgeText).width + badgeH * 1.6;
    ctx.fillStyle = grade.accent;
    roundedRect(ctx, -bw / 2, -badgeH / 2, bw, badgeH, badgeH / 2);
    ctx.fill();
    ctx.fillStyle = '#14060f';
    ctx.fillText(badgeText, 0, 1);
    ctx.restore();
  }

  // Big title with a sunset gradient fill and a dark ink outline.
  const titleY = zy + zh * 0.52;
  const maxTitleW = zw * 0.98;
  const startPx = zh * 0.52 * state.titleScale;
  const px = fitFont(ctx, title, maxTitleW, startPx, 'Anton, sans-serif', '400');
  const grad = ctx.createLinearGradient(0, titleY - px * 0.55, 0, titleY + px * 0.55);
  grad.addColorStop(0, '#fff7d6');
  grad.addColorStop(0.45, grade.glow);
  grad.addColorStop(1, grade.wash);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(16, 4, 18, 0.92)';
  ctx.lineWidth = Math.max(2, px * 0.09);
  ctx.strokeText(title, cx, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, titleY);
  ctx.restore();

  // Neon script subtitle.
  if (state.subtitle) {
    const subPx = Math.max(13, px * 0.30);
    ctx.font = `${subPx}px Pacifico, cursive`;
    const subY = titleY + px * 0.62;
    ctx.save();
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = subPx * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.subtitle, cx, subY);
    ctx.restore();
  }

  // Heat meter: five stars under the subtitle.
  const starR = Math.max(6, unit * 0.9);
  const starY = zy + zh * 0.96;
  const totalW = 5 * starR * 2.4;
  const startX = align === 'left' ? zx : align === 'right' ? zx + zw - totalW : cx - totalW / 2;
  for (let i = 0; i < 5; i++) {
    const sx = startX + i * starR * 2.4 + starR;
    drawStar(ctx, sx, starY, starR, i < state.stars ? '#ffd166' : 'rgba(255,255,255,0.28)');
  }
}

// Wash the whole cover with the chosen grade: tint, sunset gradient, glow.
function applyGrade(ctx, W, H, grade, intensity) {
  const k = Math.max(0, Math.min(1, intensity));
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.38 * k;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55 * k;
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.sky);
  wash.addColorStop(0.55, 'rgba(0,0,0,0)');
  wash.addColorStop(1, grade.wash);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.20 * k;
  const glow = ctx.createRadialGradient(W / 2, H * 0.08, 0, W / 2, H * 0.08, Math.max(W, H) * 0.55);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function applyFinish(ctx, W, H) {
  // Vignette: darken the corners like a poster print.
  const vig = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,16,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  // Film grain.
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Render the full cover. `photos` is an array of loaded images. `selected`
// is a panel index to outline for the editor preview (never in exports).
export function renderCover(ctx, W, H, state, photos, selected = -1) {
  const layout = LAYOUTS[state.layout];
  const grade = GRADES[state.grade];
  const unit = Math.min(W, H) / 100;
  ctx.save();
  ctx.fillStyle = grade.sky;
  ctx.fillRect(0, 0, W, H);
  const crops = state.crops[state.layout] || [];

  for (let i = 0; i < layout.panels.length; i++) {
    const p = layout.panels[i];
    const x = p.x * W;
    const y = p.y * H;
    const w = p.w * W;
    const h = p.h * H;
    const crop = crops[i] || { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const img = photos[crop.photo];
    ctx.save();
    if (p.tilt) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    } else {
      ctx.translate(x, y);
    }
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    if (img) drawPhotoCover(ctx, img, 0, 0, w, h, crop);
    else {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#3a2b5c');
      g.addColorStop(1, '#120a24');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    // White poster gutter + dark ink edge around every panel.
    const gx = layout.gutter * Math.min(W, H);
    ctx.save();
    if (p.tilt) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    } else ctx.translate(x, y);
    ctx.lineWidth = Math.max(2, gx);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(0, 0, w, h);
    ctx.lineWidth = Math.max(1, gx * 0.45);
    ctx.strokeStyle = 'rgba(12,4,18,0.85)';
    ctx.strokeRect(gx * 0.5, gx * 0.5, w - gx, h - gx);
    if (i === selected) {
      ctx.lineWidth = Math.max(3, unit * 0.5);
      ctx.strokeStyle = '#ffd166';
      ctx.setLineDash([unit * 1.2, unit * 0.8]);
      ctx.strokeRect(-gx, -gx, w + gx * 2, h + gx * 2);
    }
    ctx.restore();
  }

  applyGrade(ctx, W, H, grade, state.gradeIntensity);
  drawTitleBlock(ctx, W, H, state, layout.title);
  applyFinish(ctx, W, H);
  ctx.restore();
}

// Hit-test a point (canvas pixels) against the layout's panels.
export function panelAt(state, px, py, W, H) {
  const layout = LAYOUTS[state.layout];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (px >= p.x * W && px <= (p.x + p.w) * W && py >= p.y * H && py <= (p.y + p.h) * H) return i;
  }
  return -1;
}
