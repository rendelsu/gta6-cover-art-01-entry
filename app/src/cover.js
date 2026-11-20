// Vice Heat Cover Studio — cover rendering engine (app/src/cover.js).
// Draws a GTA-style multi-panel poster onto a canvas from any photos, a
// caption, a grade and a layout. Everything runs in the browser, offline:
// no network, no library, plain 2D canvas. Fonts are Anton (display) and
// Pacifico (neon script), both vendored under the SIL Open Font License.

export const SIZES = {
  '1:1': { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  '4:5': { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  '9:16': { label: 'Story 1080 x 1920', w: 1080, h: 1920 },
  '16:9': { label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
};

export const GRADES = [
  { id: 'vice-sunset', name: 'Vice Sunset', top: '#ff9a3d', bottom: '#c62b7e', tint: '#ff5e3a', glow: '#ffd166' },
  { id: 'neon-nights', name: 'Neon Nights', top: '#2de2ff', bottom: '#ff2e88', tint: '#7a2bff', glow: '#2de2ff' },
  { id: 'heatwave', name: 'Heatwave', top: '#ffe259', bottom: '#ff7518', tint: '#ff8c00', glow: '#fff3b0' },
  { id: 'coral-heat', name: 'Coral Heat', top: '#ff7e5f', bottom: '#b03060', tint: '#ff6b6b', glow: '#ffc2d1' },
  { id: 'midnight-drive', name: 'Midnight Drive', top: '#3a7bd5', bottom: '#1a1033', tint: '#2b2d5c', glow: '#8ec5ff' },
  { id: 'golden-hour', name: 'Golden Hour', top: '#f6d365', bottom: '#fda085', tint: '#e8a33d', glow: '#fff0c2' },
  { id: 'bubblegum', name: 'Bubblegum', top: '#ff8fd1', bottom: '#7b2ff7', tint: '#ff6ec7', glow: '#ffd6f2' },
  { id: 'teal-noir', name: 'Teal Noir', top: '#11998e', bottom: '#0f2027', tint: '#0e5f56', glow: '#7ef0e0' },
  { id: 'afterglow', name: 'Afterglow', top: '#ff9966', bottom: '#5f2c82', tint: '#c94b7c', glow: '#ffd9a0' },
];

// Each layout returns panels in fractions of the cover (x, y, w, h in 0..1),
// the hero panel index (drawn popping out over its neighbours), and where
// the title block sits: 'top' or 'bottom'.
export const LAYOUTS = [
  { id: 'vice-grid', name: 'Vice Grid', panels: 9, hero: 4, title: 'top',
    cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]].map(([c, r]) => ({ x: c / 3, y: 0.16 + r * 0.28, w: 1 / 3, h: 0.28 })) },
  { id: 'hero-strip', name: 'Hero + Strip', panels: 4, hero: 0, title: 'bottom',
    cells: [{ x: 0, y: 0, w: 0.62, h: 1 }, { x: 0.62, y: 0, w: 0.38, h: 1 / 3 },
            { x: 0.62, y: 1 / 3, w: 0.38, h: 1 / 3 }, { x: 0.62, y: 2 / 3, w: 0.38, h: 1 / 3 }] },
  { id: 'loading-screen', name: 'Loading Screen', panels: 4, hero: 0, title: 'bottom',
    cells: [{ x: 0, y: 0, w: 1, h: 0.64 }, { x: 0, y: 0.64, w: 1 / 3, h: 0.36 },
            { x: 1 / 3, y: 0.64, w: 1 / 3, h: 0.36 }, { x: 2 / 3, y: 0.64, w: 1 / 3, h: 0.36 }] },
  { id: 'triptych', name: 'Triptych', panels: 3, hero: 1, title: 'top',
    cells: [{ x: 0, y: 0.16, w: 1 / 3, h: 0.84 }, { x: 1 / 3, y: 0.16, w: 1 / 3, h: 0.84 },
            { x: 2 / 3, y: 0.16, w: 1 / 3, h: 0.84 }] },
  { id: 'quad-split', name: 'Quad Split', panels: 4, hero: -1, title: 'top',
    cells: [{ x: 0, y: 0.16, w: 0.5, h: 0.42 }, { x: 0.5, y: 0.16, w: 0.5, h: 0.42 },
            { x: 0, y: 0.58, w: 0.5, h: 0.42 }, { x: 0.5, y: 0.58, w: 0.5, h: 0.42 }] },
  { id: 'sunset-sleeve', name: 'Sunset Sleeve', panels: 4, hero: 0, title: 'top',
    cells: [{ x: 0, y: 0, w: 1, h: 1 }, { x: 0.04, y: 0.72, w: 0.29, h: 0.24 },
            { x: 0.355, y: 0.72, w: 0.29, h: 0.24 }, { x: 0.67, y: 0.72, w: 0.29, h: 0.24 }] },
  { id: 'tilted-snapshots', name: 'Tilted Snapshots', panels: 3, hero: 1, title: 'bottom',
    cells: [{ x: 0, y: 0, w: 1, h: 1 }, { x: 0.05, y: 0.10, w: 0.42, h: 0.5, tilt: -4 },
            { x: 0.53, y: 0.38, w: 0.42, h: 0.5, tilt: 3 }] },
  { id: 'nine-lives', name: 'Nine Lives', panels: 8, hero: 0, title: 'center',
    cells: [{ x: 0, y: 0, w: 1 / 3, h: 1 / 3 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
            { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 }, { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
            { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 }, { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
            { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }, { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }] },
  { id: 'drive-by', name: 'Drive By', panels: 3, hero: 0, title: 'top',
    cells: [{ x: 0, y: 0.16, w: 0.58, h: 0.84 }, { x: 0.58, y: 0.16, w: 0.42, h: 0.42 },
            { x: 0.58, y: 0.58, w: 0.42, h: 0.42 }] },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// --- face-aware crop ------------------------------------------------------
// A light skin-tone heuristic: downsample the photo, score skin-like pixels,
// return their centroid in 0..1 image coordinates, or null when no face-like
// region is found. It never uploads anything; it runs on the local canvas.
export function detectFacePoint(img) {
  const sw = 96, sh = Math.max(24, Math.round(96 * (img.naturalHeight / img.naturalWidth)));
  const c = document.createElement('canvas');
  c.width = sw; c.height = sh;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, sw, sh);
  let sx = 0, sy = 0, n = 0;
  const d = x.getImageData(0, 0, sw, sh).data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const skin = r > 90 && r > g + 12 && r > b + 18 && g > b + 4 && r < 250 && Math.abs(r - g) < 90;
    if (!skin) continue;
    const p = i / 4;
    sx += p % sw; sy += Math.floor(p / sw); n++;
  }
  if (n < sw * sh * 0.004) return null;
  return { x: sx / n / sw, y: sy / n / sh, weight: Math.min(1, n / (sw * sh * 0.12)) };
}

// Cover-fit source rect for a panel, honouring zoom, pan and the face point.
export function coverSourceRect(img, pw, ph, panel) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const zoom = Math.max(0.5, panel.zoom || 1);
  const base = Math.max(pw / iw, ph / ih) / zoom;
  let sw = pw / base, sh = ph / base;
  if (sw > iw) { sw = iw; sh = iw * (ph / pw); }
  if (sh > ih) { sh = ih; sw = ih * (pw / ph); }
  let cx = iw / 2 + (panel.ox || 0) * iw * 0.4;
  let cy = ih / 2 + (panel.oy || 0) * ih * 0.4;
  if (panel.faceAware && panel.face) {
    const f = panel.face;
    cx = cx * (1 - 0.65 * f.weight) + iw * f.x * 0.65 * f.weight;
    cy = cy * (1 - 0.65 * f.weight) + ih * f.y * 0.65 * f.weight;
  }
  const sx = Math.max(0, Math.min(iw - sw, cx - sw / 2));
  const sy = Math.max(0, Math.min(ih - sh, cy - sh / 2));
  return { sx, sy, sw, sh };
}

// --- drawing helpers ------------------------------------------------------
function fitFont(ctx, text, maxWidth, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

function drawPanelPhoto(ctx, img, rect, panel, grade, intensity) {
  const { sx, sy, sw, sh } = coverSourceRect(img, rect.w, rect.h, panel);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = `saturate(${1 + 0.25 * intensity}) contrast(${1 + 0.08 * intensity})`;
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
  ctx.filter = 'none';
  ctx.restore();
}

function applyGrade(ctx, W, H, grade, intensity) {
  if (intensity <= 0.01) return;
  const g = ctx.createLinearGradient(0, 0, W * 0.25, H);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalAlpha = 0.34 * intensity;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.30 * intensity;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawHalftone(ctx, W, H, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const step = Math.max(14, W / 90);
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const edge = Math.min(x / W, (W - x) / W, y / H, (H - y) / H);
      if (edge < 0.10) ctx.beginPath(), ctx.arc(x, y, step * 0.16, 0, 7), ctx.fill();
    }
  }
  ctx.restore();
}

function drawGrain(ctx, W, H, rnd) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 900; i++) ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 900; i++) ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,4,20,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Retro-chrome display title: dark offset, gradient fill, top highlight.
function drawChromeTitle(ctx, text, cx, y, maxWidth, px, grade) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const size = fitFont(ctx, text, maxWidth, px, 'Anton, sans-serif', 400);
  const grad = ctx.createLinearGradient(0, y - size, 0, y + size * 0.18);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, grade.glow);
  grad.addColorStop(0.75, '#ff5e8a');
  grad.addColorStop(1, '#7b2ff7');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, y);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = size * 0.02;
  ctx.strokeText(text, cx, y - size * 0.06);
  ctx.restore();
  return size;
}

function drawNeonSubtitle(ctx, text, cx, y, maxWidth, px, grade) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const size = fitFont(ctx, text, maxWidth, px, 'Pacifico, cursive', 400);
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, y);
  ctx.shadowBlur = size * 0.18;
  ctx.fillStyle = grade.glow;
  ctx.fillText(text, cx, y);
  ctx.restore();
  return size;
}

function drawCastTag(ctx, tag, x, y, w) {
  if (!tag || (!tag.role && !tag.name)) return;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  const pad = Math.max(8, w * 0.02);
  const roleSize = Math.max(11, w * 0.028);
  const nameSize = Math.max(13, w * 0.042);
  ctx.font = `400 ${nameSize}px Anton, sans-serif`;
  const nameW = ctx.measureText((tag.name || '').toUpperCase()).width;
  ctx.font = `400 ${roleSize}px Anton, sans-serif`;
  const roleW = ctx.measureText((tag.role || '').toUpperCase()).width;
  const bw = Math.max(nameW, roleW) + pad * 2;
  const bh = pad * 2 + roleSize + nameSize * 1.15;
  ctx.fillStyle = 'rgba(12,4,24,0.82)';
  ctx.fillRect(x, y - bh, bw, bh);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x, y - bh, 4, bh);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff8fd1';
  ctx.font = `400 ${roleSize}px Anton, sans-serif`;
  ctx.fillText((tag.role || '').toUpperCase(), x + pad + 4, y - bh + pad + roleSize);
  ctx.fillStyle = '#ffffff';
  ctx.font = `400 ${nameSize}px Anton, sans-serif`;
  ctx.fillText((tag.name || '').toUpperCase(), x + pad + 4, y - pad * 0.6);
  ctx.restore();
}

function drawBillingBlock(ctx, text, W, y) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const size = Math.max(10, W * 0.011);
  ctx.font = `400 ${size}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, size * 0.18)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillText(text.toUpperCase(), W / 2, y);
  ctx.restore();
}

function drawSealStamp(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = '#ffe9a8';
  ctx.fillStyle = 'rgba(20,6,32,0.55)';
  ctx.lineWidth = Math.max(2, r * 0.045);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 7); ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = 'VICE CITY \u2605 EST. 2026 \u2605 ';
  const step = (Math.PI * 2) / label.length;
  ctx.font = `400 ${Math.max(9, r * 0.20)}px Anton, sans-serif`;
  for (let i = 0; i < label.length; i++) {
    ctx.save();
    ctx.rotate(i * step - Math.PI / 2);
    ctx.translate(0, -r * 0.89);
    ctx.fillText(label[i], 0, 0);
    ctx.restore();
  }
  ctx.font = `${Math.max(10, r * 0.42)}px serif`;
  ctx.fillText('\u2605', 0, r * 0.02);
  ctx.restore();
}

function drawHeatMeter(ctx, cx, y, size, filled, grade) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px serif`;
  const gap = size * 1.25;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < filled ? grade.glow : 'rgba(255,255,255,0.28)';
    ctx.fillText('\u2605', cx + (i - 2) * gap, y);
  }
  ctx.restore();
}

// --- the cover ------------------------------------------------------------
export function drawCover(canvas, state, photos) {
  const size = SIZES[state.size] || SIZES['1:1'];
  const W = size.w, H = size.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  const intensity = state.gradeIntensity == null ? 0.7 : state.gradeIntensity;
  const gap = Math.max(4, W * 0.006);
  const rnd = mulberry32(20261120);

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, W, H);

  const cells = layout.cells.filter((c) => !c.ghost);
  const rects = cells.map((c) => ({
    x: c.x * W + gap / 2, y: c.y * H + gap / 2,
    w: c.w * W - gap, h: c.h * H - gap, tilt: c.tilt || 0,
  }));
  const heroIdx = layout.hero >= 0 ? layout.hero : -1;

  // Panel photos (hero last, so it can pop out over its neighbours).
  const order = rects.map((_, i) => i).sort((a, b) => (a === heroIdx ? 1 : b === heroIdx ? -1 : 0));
  for (const i of order) {
    const panel = state.panels[i] || {};
    const img = photos[panel.photo || 0] || photos[0];
    if (!img) continue;
    const rect = rects[i];
    if (i === heroIdx && state.popout !== false) {
      const pad = Math.min(rect.w, rect.h) * 0.10;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = W * 0.03;
      ctx.shadowOffsetY = W * 0.012;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rect.x - pad, rect.y - pad, rect.w + pad * 2, rect.h + pad * 2);
      ctx.restore();
      drawPanelPhoto(ctx, img, { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }, panel, grade, intensity);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = Math.max(2, W * 0.003);
      ctx.strokeRect(rect.x - pad, rect.y - pad, rect.w + pad * 2, rect.h + pad * 2);
      ctx.restore();
    } else if (rect.tilt) {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-W * 0.008, -W * 0.008, rect.w + W * 0.016, rect.h + W * 0.016);
      drawPanelPhoto(ctx, img, { x: 0, y: 0, w: rect.w, h: rect.h }, panel, grade, intensity);
      ctx.restore();
    } else {
      drawPanelPhoto(ctx, img, rect, panel, grade, intensity);
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  applyGrade(ctx, W, H, grade, intensity);
  if (state.halftone !== false) drawHalftone(ctx, W, H, '#ffffff', 0.10 * intensity + 0.04);
  drawVignette(ctx, W, H);

  // Title block: top, bottom, or the centre cell of the nine-lives grid.
  // Size is capped by height as well as width, so a wide 16:9 cover never
  // clips its title at the top edge.
  const title = (state.title || 'VICE HEAT').toUpperCase();
  const subtitle = state.subtitle || '';
  const maxTitleW = layout.title === 'center' ? W / 3 - gap * 4 : W * 0.92;
  const startPx = layout.title === 'center'
    ? Math.min(W * 0.09, H * 0.09)
    : Math.min(W * 0.115, H * 0.20);
  const titleSize = fitFont(ctx, title, maxTitleW, startPx, 'Anton, sans-serif', 400);
  let titleY, subY, heatY;
  if (layout.title === 'center') {
    ctx.fillStyle = 'rgba(12,4,24,0.88)';
    ctx.fillRect(W / 3 + gap, H / 3 + gap, W / 3 - gap * 2, H / 3 - gap * 2);
    ctx.strokeStyle = grade.glow;
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(W / 3 + gap, H / 3 + gap, W / 3 - gap * 2, H / 3 - gap * 2);
    titleY = H * 0.5 - titleSize * 0.10;
    subY = H * 0.5 + titleSize * 0.38;
    heatY = H * 0.5 + titleSize * 0.85;
  } else if (layout.title === 'top') {
    titleY = titleSize * 0.95;
    subY = titleY + titleSize * 0.48;
    heatY = subY + titleSize * 0.45;
  } else {
    // Bottom title: sit the block on the hero art above the bottom strip,
    // so the subtitle and billing never fight the strip's cast tags.
    titleY = H * 0.60;
    subY = titleY + titleSize * 0.48;
    heatY = titleY - titleSize * 0.85;
  }
  drawChromeTitle(ctx, title, W / 2, titleY, maxTitleW, titleSize, grade);
  if (subtitle) drawNeonSubtitle(ctx, subtitle, W / 2, subY, W * 0.8, Math.max(20, titleSize * 0.32), grade);
  drawHeatMeter(ctx, W / 2, heatY, Math.max(14, W * 0.022), state.heat == null ? 4 : state.heat, grade);

  // Cast tags on the panels that carry one.
  for (let i = 0; i < rects.length; i++) {
    const tag = (state.cast || [])[i];
    if (!tag) continue;
    const r = rects[i];
    drawCastTag(ctx, tag, r.x + r.w * 0.04, r.y + r.h - r.h * 0.05, r.w * 0.9);
  }

  // Seal stamp, top-right clear of the title.
  if (state.seal !== false) {
    const r = Math.max(34, W * 0.052);
    drawSealStamp(ctx, W - r * 1.25, r * 1.35, r, grade);
  }

  // Billing block along the bottom edge.
  if (state.billing !== false) {
    drawBillingBlock(ctx, state.billingText || 'VICE HEAT PICTURES  presents  A VICE CITY STORY  \u2022  STARRING THE CREW  \u2022  SHOT ON LOCATION', W, H - H * 0.012);
  }

  drawGrain(ctx, W, H, rnd);
  return { w: W, h: H };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Export one size as a PNG blob, and every size in one step.
export function exportCoverPNG(state, photos, sizeKey) {
  const canvas = document.createElement('canvas');
  drawCover(canvas, { ...state, size: sizeKey }, photos);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
