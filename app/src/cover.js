// Vice Coast Cover Studio — the cover renderer.
// Draws a multi-panel GTA-style poster on any canvas: panels, sunset grades,
// retro-chrome lettering, cast tags, a billing block and a seal. Pure canvas 2D,
// no dependencies. main.js owns the UI state; this file only paints.

export const SIZES = {
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
  '9:16': [1080, 1920],
  '16:9': [1920, 1080],
};

// Every layout is a list of panels in unit coordinates (0..1 of the cover) plus a
// title zone. slot picks which photo slot fills the panel. pop panels are drawn
// last, larger than their neighbours, with a hard shadow — the pop-out hero.
export const LAYOUTS = [
  {
    id: 'hero-strip', name: 'Hero + Strip',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1, slot: 0, pop: true },
      { x: 0.64, y: 0, w: 0.36, h: 0.32, slot: 1 },
      { x: 0.64, y: 0.34, w: 0.36, h: 0.32, slot: 2 },
      { x: 0.64, y: 0.68, w: 0.36, h: 0.32, slot: 3 },
    ],
    title: { x: 0.03, y: 0.60, w: 0.58, h: 0.36, align: 'left' },
  },
  {
    id: 'hero-duo', name: 'Hero + Duo',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 1, slot: 0, pop: true },
      { x: 0.60, y: 0, w: 0.40, h: 0.49, slot: 1 },
      { x: 0.60, y: 0.51, w: 0.40, h: 0.49, slot: 2 },
    ],
    title: { x: 0.03, y: 0.63, w: 0.55, h: 0.33, align: 'left' },
  },
  {
    id: 'grid9', name: 'Nine Panel',
    panels: [
      { x: 0.005, y: 0.005, w: 0.326, h: 0.326, slot: 0 },
      { x: 0.337, y: 0.005, w: 0.326, h: 0.326, slot: 1 },
      { x: 0.669, y: 0.005, w: 0.326, h: 0.326, slot: 2 },
      { x: 0.005, y: 0.337, w: 0.326, h: 0.326, slot: 3 },
      { x: 0.337, y: 0.337, w: 0.326, h: 0.326, slot: 0 },
      { x: 0.669, y: 0.337, w: 0.326, h: 0.326, slot: 1 },
      { x: 0.005, y: 0.669, w: 0.326, h: 0.326, slot: 2 },
      { x: 0.337, y: 0.669, w: 0.326, h: 0.326, slot: 3 },
      { x: 0.669, y: 0.669, w: 0.326, h: 0.326, slot: 0, pop: true },
    ],
    title: { x: 0.05, y: 0.40, w: 0.90, h: 0.22, align: 'center' },
  },
  {
    id: 'tilted', name: 'Tilted Snaps',
    panels: [
      { x: 0.06, y: 0.10, w: 0.34, h: 0.62, slot: 1, rot: -6 },
      { x: 0.33, y: 0.06, w: 0.34, h: 0.68, slot: 0, rot: 0, pop: true },
      { x: 0.60, y: 0.10, w: 0.34, h: 0.62, slot: 2, rot: 6 },
    ],
    title: { x: 0.05, y: 0.76, w: 0.90, h: 0.20, align: 'center' },
  },
  {
    id: 'fullbleed', name: 'Full Bleed',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.72, slot: 0 },
      { x: 0.01, y: 0.74, w: 0.32, h: 0.25, slot: 1 },
      { x: 0.34, y: 0.74, w: 0.32, h: 0.25, slot: 2 },
      { x: 0.67, y: 0.74, w: 0.32, h: 0.25, slot: 3 },
    ],
    title: { x: 0.03, y: 0.40, w: 0.94, h: 0.28, align: 'left' },
  },
  {
    id: 'diagonal', name: 'Diagonal Split',
    panels: [
      { x: 0, y: 0, w: 1, h: 1, slot: 0, clip: [[0, 0], [1, 0], [0.42, 1], [0, 1]] },
      { x: 0, y: 0, w: 1, h: 1, slot: 1, clip: [[1, 0], [1, 1], [0.42, 1]] },
      { x: 0.62, y: 0.66, w: 0.34, h: 0.30, slot: 2, pop: true },
    ],
    title: { x: 0.03, y: 0.70, w: 0.58, h: 0.26, align: 'left' },
  },
  {
    id: 'popout', name: 'Pop-Out Hero',
    panels: [
      { x: 0.01, y: 0.05, w: 0.30, h: 0.62, slot: 1, rot: -3 },
      { x: 0.69, y: 0.05, w: 0.30, h: 0.62, slot: 2, rot: 3 },
      { x: 0.24, y: 0.02, w: 0.52, h: 0.78, slot: 0, pop: true },
      { x: 0.01, y: 0.70, w: 0.48, h: 0.28, slot: 3 },
      { x: 0.51, y: 0.70, w: 0.48, h: 0.28, slot: 1 },
    ],
    title: { x: 0.05, y: 0.74, w: 0.90, h: 0.20, align: 'center' },
  },
  {
    id: 'billboard', name: 'Billboard',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.56, slot: 0, pop: true },
      { x: 0.01, y: 0.58, w: 0.485, h: 0.41, slot: 1 },
      { x: 0.505, y: 0.58, w: 0.485, h: 0.41, slot: 2 },
    ],
    title: { x: 0.03, y: 0.28, w: 0.94, h: 0.26, align: 'left' },
  },
];

// Neon-sunset Vice City grades. sky paints the backdrop, tint is washed over the
// photos, glow lights the sky behind the title, and the title gradient is the
// retro-chrome lettering.
export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', sky: ['#2b0a4d', '#ff2e88', '#ff9a3d', '#ffd166'], tint: '#ff5e3a', glow: '#ff9a3d', top: '#fff3c4', bottom: '#ff7a3d', accent: '#2de2c5', swatch: 'linear-gradient(135deg,#2b0a4d,#ff2e88,#ff9a3d)' },
  { id: 'neon', name: 'Neon Pink', sky: ['#12002e', '#ff2e88', '#b537f2', '#ff7ad9'], tint: '#ff2e88', glow: '#ff2e88', top: '#ffe3f2', bottom: '#ff2e88', accent: '#2de2c5', swatch: 'linear-gradient(135deg,#12002e,#ff2e88,#ff7ad9)' },
  { id: 'gold', name: 'Gold Hour', sky: ['#3a1c00', '#ff7a18', '#ffb347', '#ffe9a8'], tint: '#ff9a3d', glow: '#ffd166', top: '#fffbe0', bottom: '#ff9a3d', accent: '#ff2e88', swatch: 'linear-gradient(135deg,#3a1c00,#ff7a18,#ffd166)' },
  { id: 'teal', name: 'Teal Heat', sky: ['#02222b', '#0e7c86', '#2de2c5', '#ffd166'], tint: '#2de2c5', glow: '#2de2c5', top: '#e0fff8', bottom: '#19b8a6', accent: '#ff2e88', swatch: 'linear-gradient(135deg,#02222b,#0e7c86,#2de2c5)' },
  { id: 'magenta', name: 'Magenta Nights', sky: ['#1c0033', '#7b2fff', '#ff2e88', '#ff5e8a'], tint: '#b537f2', glow: '#b537f2', top: '#f3e4ff', bottom: '#b537f2', accent: '#ffd166', swatch: 'linear-gradient(135deg,#1c0033,#7b2fff,#ff2e88)' },
  { id: 'ocean', name: 'Ocean Drive', sky: ['#02182b', '#0b5e7a', '#2de2c5', '#a5f3e0'], tint: '#2d9de2', glow: '#2de2c5', top: '#eafcff', bottom: '#2d9de2', accent: '#ff9a3d', swatch: 'linear-gradient(135deg,#02182b,#0b5e7a,#2de2c5)' },
  { id: 'chrome', name: 'Retro Chrome', sky: ['#1a1a24', '#4d4d66', '#9a9ab0', '#e8e8f0'], tint: '#9a9ab0', glow: '#e8e8f0', top: '#ffffff', bottom: '#8a8aa0', accent: '#ff2e88', swatch: 'linear-gradient(135deg,#1a1a24,#9a9ab0,#e8e8f0)' },
  { id: 'noir', name: 'Mono Noir', sky: ['#000000', '#1c1c22', '#55555f', '#c9c9d1'], tint: '#888888', glow: '#c9c9d1', top: '#ffffff', bottom: '#777777', accent: '#ffd166', swatch: 'linear-gradient(135deg,#000,#555,#c9c9d1)' },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function coverFit(ctx, img, x, y, w, h, zoom, ox, oy) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih) * (zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2 + (ox || 0) * Math.max(0, (dw - w) / 2);
  const dy = y + (h - dh) / 2 + (oy || 0) * Math.max(0, (dh - h) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// A painted sunset stand-in for an empty photo slot, so a cover never looks broken.
function paintFallback(ctx, x, y, w, h, seed, grade) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, grade.sky[1]);
  g.addColorStop(0.55, grade.sky[2]);
  g.addColorStop(1, grade.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const rnd = mulberry32(seed * 7919 + 13);
  ctx.fillStyle = 'rgba(255,255,240,0.9)';
  ctx.beginPath();
  ctx.arc(x + w * (0.3 + rnd() * 0.4), y + h * 0.32, Math.min(w, h) * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,8,32,0.92)';
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.08 + rnd() * 0.12);
    const bh = h * (0.18 + rnd() * 0.3);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    bx += bw + w * 0.015;
  }
  ctx.fillStyle = 'rgba(20,8,32,0.95)';
  ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '700 ' + Math.round(Math.min(w, h) * 0.055) + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DROP A PHOTO', x + w / 2, y + h * 0.92);
}

function panelPath(ctx, p, W, H) {
  const px = p.x * W;
  const py = p.y * H;
  const pw = p.w * W;
  const ph = p.h * H;
  ctx.beginPath();
  if (p.clip) {
    p.clip.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt[0] * W, pt[1] * H);
      else ctx.lineTo(pt[0] * W, pt[1] * H);
    });
    ctx.closePath();
  } else if (p.rot) {
    ctx.rect(px, py, pw, ph);
  } else {
    ctx.rect(px, py, pw, ph);
  }
}

function drawPanel(ctx, p, W, H, photo, grade, seed) {
  const px = p.x * W;
  const py = p.y * H;
  const pw = p.w * W;
  const ph = p.h * H;
  ctx.save();
  if (p.pop) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = Math.round(W * 0.02);
    ctx.shadowOffsetY = Math.round(W * 0.008);
  }
  if (p.rot) {
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
    ctx.beginPath();
    ctx.rect(0, 0, pw, ph);
    ctx.clip();
    if (photo && photo.img) coverFit(ctx, photo.img, 0, 0, pw, ph, photo.zoom, photo.ox, photo.oy);
    else paintFallback(ctx, 0, 0, pw, ph, seed, grade);
    ctx.restore();
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
  } else if (p.clip) {
    panelPath(ctx, p, W, H);
    ctx.clip();
    if (photo && photo.img) coverFit(ctx, photo.img, px, py, pw, ph, photo.zoom, photo.ox, photo.oy);
    else paintFallback(ctx, px, py, pw, ph, seed, grade);
  } else {
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (photo && photo.img) coverFit(ctx, photo.img, px, py, pw, ph, photo.zoom, photo.ox, photo.oy);
    else paintFallback(ctx, px, py, pw, ph, seed, grade);
  }
  // Keyline frame around the panel.
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = Math.max(2, Math.round(W * 0.004));
  ctx.strokeStyle = p.pop ? '#ffffff' : 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  if (p.rot) ctx.rect(0, 0, pw, ph);
  else ctx.rect(px, py, pw, ph);
  ctx.stroke();
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startSize, family, weight) {
  let size = startSize;
  ctx.font = weight + ' ' + size + 'px ' + family;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size *= 0.92;
    ctx.font = weight + ' ' + size + 'px ' + family;
  }
  return size;
}

function drawChromeTitle(ctx, text, cx, cy, maxWidth, maxSize, grade, align) {
  const size = fitFont(ctx, text, maxWidth, maxSize, '"Anton", sans-serif', '400');
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const tx = align === 'center' ? cx : cx;
  // Drop shadow.
  ctx.font = '400 ' + size + 'px "Anton", sans-serif';
  ctx.fillStyle = 'rgba(10,2,20,0.85)';
  ctx.fillText(text, tx + size * 0.05, cy + size * 0.06);
  // Gradient body.
  const grad = ctx.createLinearGradient(0, cy - size * 0.55, 0, cy + size * 0.55);
  grad.addColorStop(0, grade.top);
  grad.addColorStop(0.55, '#ffffff');
  grad.addColorStop(0.56, grade.bottom);
  grad.addColorStop(1, grade.bottom);
  ctx.fillStyle = grad;
  ctx.fillText(text, tx, cy);
  // Retro-chrome stripes clipped to the letters.
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const stripeH = size * 0.09;
  for (let yy = cy - size * 0.55; yy < cy + size * 0.55; yy += stripeH * 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(tx - (align === 'center' ? maxWidth / 2 : 0), yy, maxWidth, stripeH);
  }
  ctx.restore();
  // Crisp outline + top highlight.
  ctx.lineWidth = Math.max(1.5, size * 0.02);
  ctx.strokeStyle = 'rgba(20,4,30,0.9)';
  ctx.strokeText(text, tx, cy);
  ctx.lineWidth = Math.max(1, size * 0.008);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.strokeText(text, tx, cy - size * 0.012);
  ctx.restore();
  return size;
}

function drawSeal(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.fillStyle = 'rgba(10,2,20,0.72)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = grade.accent;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.035);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  const word = 'VICE COAST • EST. 2026 • ';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 ' + Math.round(r * 0.24) + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < word.length; i++) {
    const a = (i / word.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.85);
    ctx.fillText(word[i], 0, 0);
    ctx.restore();
  }
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const a2 = a + Math.PI / 5;
    const x1 = Math.cos(a) * r * 0.5;
    const y1 = Math.sin(a) * r * 0.5;
    const x2 = Math.cos(a2) * r * 0.2;
    const y2 = Math.sin(a2) * r * 0.2;
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// The main entry point: paint the whole cover onto ctx at W x H.
export function renderCover(ctx, W, H, state) {
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const k = state.intensity == null ? 0.85 : state.intensity;
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // Backdrop sky.
  const sky = ctx.createLinearGradient(0, 0, W * 0.3, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.5, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sky glow behind the title zone.
  const tz = layout.title;
  const glow = ctx.createRadialGradient(
    (tz.x + tz.w / 2) * W, (tz.y + tz.h / 2) * H, 0,
    (tz.x + tz.w / 2) * W, (tz.y + tz.h / 2) * H, Math.max(W, H) * 0.55,
  );
  glow.addColorStop(0, grade.glow + '');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35 + 0.45 * k;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Panels: flat ones first, pop-out heroes last so they overlap.
  const flat = layout.panels.filter((p) => !p.pop);
  const pops = layout.panels.filter((p) => p.pop);
  flat.forEach((p, i) => drawPanel(ctx, p, W, H, state.photos[p.slot], grade, i + 1));
  pops.forEach((p, i) => drawPanel(ctx, p, W, H, state.photos[p.slot], grade, i + 11));

  // Warm wash over everything, then a vignette.
  ctx.globalAlpha = 0.22 * k;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(8,2,16,' + (0.28 + 0.2 * k) + ')');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Lettering: title, subtitle, cast tags.
  const zx = tz.x * W;
  const zy = tz.y * H;
  const zw = tz.w * W;
  const zh = tz.h * H;
  const align = tz.align === 'center' ? 'center' : 'left';
  const titleCx = align === 'center' ? zx + zw / 2 : zx;
  const titleSize = drawChromeTitle(
    ctx, (state.title || 'VICE COAST').toUpperCase(), titleCx, zy + zh * 0.30,
    zw, Math.min(W * 0.115, zh * 0.52), grade, align,
  );
  if (state.subtitle) {
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = Math.round(Math.min(W * 0.038, zh * 0.16)) + 'px "Pacifico", cursive';
    ctx.shadowColor = grade.accent;
    ctx.shadowBlur = Math.round(W * 0.012);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.subtitle, titleCx, zy + zh * 0.30 + titleSize * 0.72);
    ctx.restore();
  }
  // Cast tags row.
  const tagY = zy + zh * 0.30 + titleSize * 0.72 + Math.min(W * 0.038, zh * 0.16) * 1.1;
  const tagH = Math.round(W * 0.032);
  const tags = [];
  if (state.star) tags.push(['STARRING', state.star]);
  if (state.feat) tags.push(['FEATURING', state.feat]);
  if (tags.length) {
    ctx.save();
    ctx.font = '700 ' + Math.round(W * 0.016) + 'px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    let tx = align === 'center' ? zx + zw / 2 - tags.reduce((a, t) => a + ctx.measureText(t[0] + '  ' + t[1]).width + W * 0.03, 0) / 2 : zx;
    tags.forEach((t) => {
      const label = t[0] + '  ';
      const name = t[1].toUpperCase();
      const wLabel = ctx.measureText(label).width;
      const wName = ctx.measureText(name).width;
      const tw = wLabel + wName + W * 0.02;
      ctx.fillStyle = 'rgba(10,2,20,0.72)';
      ctx.fillRect(tx, tagY, tw, tagH);
      ctx.strokeStyle = grade.accent;
      ctx.lineWidth = Math.max(1, W * 0.0015);
      ctx.strokeRect(tx, tagY, tw, tagH);
      ctx.fillStyle = grade.accent;
      ctx.textAlign = 'left';
      ctx.fillText(label, tx + W * 0.008, tagY + tagH / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, tx + W * 0.008 + wLabel, tagY + tagH / 2);
      tx += tw + W * 0.015;
    });
    ctx.restore();
  }

  // Seal, top-right corner of the cover.
  if (state.seal) {
    drawSeal(ctx, W * 0.90, H * 0.10, Math.min(W, H) * 0.065, grade);
  }

  // Billing block along the bottom edge — only when the tags leave room for it.
  const tagsBottom = tags.length ? tagY + tagH : zy + zh;
  if (state.billing && tagsBottom < H * 0.93) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 ' + Math.round(W * 0.0115) + 'px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const line = 'VICE COAST PICTURES  PRESENTS  ' + (state.star || '').toUpperCase() +
      '  IN  "' + (state.title || 'VICE COAST').toUpperCase() + '"  ·  FEATURING  ' +
      (state.feat || '').toUpperCase() + '  ·  A SUNSET HEIST  ·  VICE CITY';
    ctx.fillText(line, W / 2, H - Math.round(H * 0.018), W * 0.96);
    ctx.restore();
  }

  // Film grain, deterministic per render.
  const rnd = mulberry32(20261120);
  const dots = Math.round((W * H) / 2600);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < dots; i++) {
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
  ctx.restore();
  ctx.restore();
}

// Render a fresh canvas at the named export size and return it.
export function renderCoverCanvas(sizeKey, state) {
  const dims = SIZES[sizeKey] || SIZES['16:9'];
  const canvas = document.createElement('canvas');
  canvas.width = dims[0];
  canvas.height = dims[1];
  renderCover(canvas.getContext('2d'), dims[0], dims[1], state);
  return canvas;
}
