// Vice Coast Cover Studio — the editor UI.
// Owns the studio state (photos, layout, grade, lettering), the live preview,
// drag-to-pan and scroll-to-zoom on panels, one-click PNG export in the four
// common post sizes, undo/redo, and a ?shot= mode the maker uses to frame
// screenshots. The painting itself lives in cover.js.

import { SIZES, LAYOUTS, GRADES, renderCover, renderCoverCanvas } from './cover.js';

const SAMPLES = ['samples/boulevard.jpg', 'samples/convertible.jpg', 'samples/pier.jpg', 'samples/neon.jpg'];
const TITLES = ['VICE COAST', 'SUNSET HEIST', 'NEON SHORE', 'PALM ROYALE', 'NIGHT SHIFT', 'OCEAN DRIVE'];

const state = {
  layout: 'hero-strip',
  grade: 'sunset',
  intensity: 0.85,
  title: 'VICE COAST',
  subtitle: 'a sunset heist in Vice City',
  star: 'MARA VOSS',
  feat: 'DANTE REYES',
  seal: true,
  billing: true,
  size: '16:9',
  photos: [null, null, null, null],
  selectedSlot: 0,
};

const preview = document.getElementById('preview');
const pctx = preview.getContext('2d');
let history = [];
let historyAt = -1;

function slotState(i) {
  const p = state.photos[i];
  return p ? { img: p.img, zoom: p.zoom, ox: p.ox, oy: p.oy } : null;
}

function coverState() {
  return {
    layout: state.layout,
    grade: state.grade,
    intensity: state.intensity,
    title: state.title,
    subtitle: state.subtitle,
    star: state.star,
    feat: state.feat,
    seal: state.seal,
    billing: state.billing,
    photos: [0, 1, 2, 3].map(slotState),
  };
}

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, intensity: state.intensity,
    title: state.title, subtitle: state.subtitle, star: state.star, feat: state.feat,
    seal: state.seal, billing: state.billing, size: state.size,
    transforms: state.photos.map((p) => (p ? { zoom: p.zoom, ox: p.ox, oy: p.oy } : null)),
  });
}

function pushHistory() {
  history = history.slice(0, historyAt + 1);
  history.push(snapshot());
  if (history.length > 60) history.shift();
  historyAt = history.length - 1;
}

function restoreHistory(json) {
  const s = JSON.parse(json);
  state.layout = s.layout; state.grade = s.grade; state.intensity = s.intensity;
  state.title = s.title; state.subtitle = s.subtitle; state.star = s.star; state.feat = s.feat;
  state.seal = s.seal; state.billing = s.billing; state.size = s.size;
  s.transforms.forEach((t, i) => {
    if (t && state.photos[i]) Object.assign(state.photos[i], t);
  });
  syncInputs();
  renderAll();
}

function undo() {
  if (historyAt > 0) {
    historyAt -= 1;
    restoreHistory(history[historyAt]);
  }
}

function redo() {
  if (historyAt < history.length - 1) {
    historyAt += 1;
    restoreHistory(history[historyAt]);
  }
}

function renderPreview() {
  const dims = SIZES[state.size];
  const ratio = dims[0] / dims[1];
  const maxW = ratio >= 1 ? 960 : 720;
  const w = Math.round(maxW);
  const h = Math.round(maxW / ratio);
  if (preview.width !== w || preview.height !== h) {
    preview.width = w;
    preview.height = h;
  }
  renderCover(pctx, w, h, coverState());
  document.getElementById('stageSizeLabel').textContent =
    dims[0] + ' × ' + dims[1] + ' · ' + state.size;
}

function renderSlots() {
  const wrap = document.getElementById('slots');
  wrap.innerHTML = '';
  state.photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (p ? '' : ' empty') + (state.selectedSlot === i ? ' selected' : '');
    b.title = p ? 'Slot ' + (i + 1) + ': ' + p.name + ' — click to crop it' : 'Slot ' + (i + 1) + ' — click to load a photo';
    b.innerHTML = '<span class="slot-num">' + (i + 1) + '</span>' + (p ? '' : '');
    if (p) {
      const img = document.createElement('img');
      img.src = p.img.src;
      img.alt = 'Photo slot ' + (i + 1);
      b.appendChild(img);
    }
    b.addEventListener('click', () => {
      state.selectedSlot = i;
      if (!state.photos[i]) document.getElementById('slotFileInput').click();
      else { renderSlots(); syncCrop(); }
    });
    wrap.appendChild(b);
  });
}

function renderLayoutButtons() {
  const wrap = document.getElementById('layouts');
  wrap.innerHTML = '';
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn' + (state.layout === l.id ? ' active' : '');
    const mini = document.createElement('span');
    mini.className = 'mini';
    mini.style.background =
      'linear-gradient(135deg,#ff2e88 0%,#ff9a3d 45%,#2de2c5 100%)';
    mini.style.opacity = '0.85';
    b.appendChild(mini);
    b.appendChild(document.createTextNode(l.name));
    b.addEventListener('click', () => {
      state.layout = l.id;
      pushHistory();
      renderAll();
    });
    wrap.appendChild(b);
  });
}

function renderGradeButtons() {
  const wrap = document.getElementById('grades');
  wrap.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn' + (state.grade === g.id ? ' active' : '');
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = g.swatch;
    b.appendChild(sw);
    b.appendChild(document.createTextNode(g.name));
    b.addEventListener('click', () => {
      state.grade = g.id;
      pushHistory();
      renderAll();
    });
    wrap.appendChild(b);
  });
}

function syncCrop() {
  const p = state.photos[state.selectedSlot];
  document.getElementById('cropTitle').textContent =
    'Panel ' + (state.selectedSlot + 1) + (p ? ' · ' + p.name : ' · empty slot');
  document.getElementById('zoomRange').value = p ? p.zoom : 1.2;
  document.getElementById('panXRange').value = p ? p.ox : 0;
  document.getElementById('panYRange').value = p ? p.oy : 0;
}

function syncInputs() {
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('starInput').value = state.star;
  document.getElementById('featInput').value = state.feat;
  document.getElementById('sealCheck').checked = state.seal;
  document.getElementById('billingCheck').checked = state.billing;
  document.getElementById('gradeRange').value = state.intensity;
  document.querySelectorAll('#sizeRow button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
  renderLayoutButtons();
  renderGradeButtons();
  renderSlots();
  syncCrop();
}

function renderAll() {
  renderPreview();
  renderLayoutButtons();
  renderGradeButtons();
  renderSlots();
  syncCrop();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function loadSamples() {
  for (let i = 0; i < SAMPLES.length; i++) {
    try {
      const img = await loadImage(SAMPLES[i]);
      // The neon street is dark at the top, so frame its glowing signs.
      const framing = SAMPLES[i].endsWith('neon.jpg')
        ? { zoom: 1.6, ox: 0, oy: -0.85 }
        : { zoom: 1.15, ox: 0, oy: 0 };
      state.photos[i] = { img, ...framing, name: SAMPLES[i].split('/').pop() };
    } catch (e) {
      console.warn(e.message);
    }
  }
  pushHistory();
  renderAll();
}

function addFiles(files) {
  const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
  if (!list.length) return;
  let slot = state.selectedSlot;
  const readers = list.slice(0, 4).map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ file, img });
      img.onerror = () => resolve(null);
      img.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  }));
  Promise.all(readers).then((loaded) => {
    loaded.forEach((item) => {
      if (!item) return;
      while (slot < 4 && state.photos[slot]) slot += 1;
      if (slot > 3) slot = state.selectedSlot;
      state.photos[slot] = { img: item.img, zoom: 1.15, ox: 0, oy: 0, name: item.file.name };
      slot += 1;
    });
    pushHistory();
    renderAll();
  });
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve(true);
    }, 'image/png');
  });
}

function slugTitle() {
  return (state.title || 'vice-coast').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'vice-coast';
}

async function exportPng(sizeKey) {
  const canvas = renderCoverCanvas(sizeKey, coverState());
  const ok = await downloadCanvas(canvas, slugTitle() + '-' + sizeKey.replace(':', 'x') + '.png');
  return { ok, width: canvas.width, height: canvas.height };
}

async function exportAllSizes() {
  for (const key of Object.keys(SIZES)) {
    await exportPng(key);
    await new Promise((r) => setTimeout(r, 350));
  }
}

// Click a panel on the preview to select its photo slot; drag to pan, wheel to zoom.
function panelAt(clientX, clientY) {
  const rect = preview.getBoundingClientRect();
  const ux = (clientX - rect.left) / rect.width;
  const uy = (clientY - rect.top) / rect.height;
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (ux >= p.x && ux <= p.x + p.w && uy >= p.y && uy <= p.y + p.h) return p;
  }
  return null;
}

let dragging = null;
preview.addEventListener('pointerdown', (e) => {
  const p = panelAt(e.clientX, e.clientY);
  if (!p) return;
  state.selectedSlot = p.slot;
  syncCrop();
  renderSlots();
  dragging = { slot: p.slot, x: e.clientX, y: e.clientY, ox: state.photos[p.slot]?.ox || 0, oy: state.photos[p.slot]?.oy || 0 };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const photo = state.photos[dragging.slot];
  if (!photo) return;
  const rect = preview.getBoundingClientRect();
  const p = (LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0]).panels.find((q) => q.slot === dragging.slot);
  const pw = (p ? p.w : 0.5) * rect.width;
  const ph = (p ? p.h : 0.5) * rect.height;
  photo.ox = Math.max(-1, Math.min(1, dragging.ox + ((e.clientX - dragging.x) / pw) * 2));
  photo.oy = Math.max(-1, Math.min(1, dragging.oy + ((e.clientY - dragging.y) / ph) * 2));
  renderPreview();
  syncCrop();
});
preview.addEventListener('pointerup', () => {
  if (dragging) { pushHistory(); dragging = null; }
});
preview.addEventListener('wheel', (e) => {
  const p = panelAt(e.clientX, e.clientY);
  if (!p) return;
  e.preventDefault();
  const photo = state.photos[p.slot];
  if (!photo) return;
  photo.zoom = Math.max(1, Math.min(3, photo.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  state.selectedSlot = p.slot;
  renderPreview();
  syncCrop();
}, { passive: false });

function bindInputs() {
  document.getElementById('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value; renderPreview();
  });
  document.getElementById('titleInput').addEventListener('change', pushHistory);
  document.getElementById('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value; renderPreview();
  });
  document.getElementById('subtitleInput').addEventListener('change', pushHistory);
  document.getElementById('starInput').addEventListener('input', (e) => {
    state.star = e.target.value; renderPreview();
  });
  document.getElementById('starInput').addEventListener('change', pushHistory);
  document.getElementById('featInput').addEventListener('input', (e) => {
    state.feat = e.target.value; renderPreview();
  });
  document.getElementById('featInput').addEventListener('change', pushHistory);
  document.getElementById('sealCheck').addEventListener('change', (e) => {
    state.seal = e.target.checked; pushHistory(); renderPreview();
  });
  document.getElementById('billingCheck').addEventListener('change', (e) => {
    state.billing = e.target.checked; pushHistory(); renderPreview();
  });
  document.getElementById('gradeRange').addEventListener('input', (e) => {
    state.intensity = Number(e.target.value); renderPreview();
  });
  document.getElementById('gradeRange').addEventListener('change', pushHistory);
  document.getElementById('zoomRange').addEventListener('input', (e) => {
    const p = state.photos[state.selectedSlot];
    if (p) { p.zoom = Number(e.target.value); renderPreview(); }
  });
  document.getElementById('zoomRange').addEventListener('change', pushHistory);
  document.getElementById('panXRange').addEventListener('input', (e) => {
    const p = state.photos[state.selectedSlot];
    if (p) { p.ox = Number(e.target.value); renderPreview(); }
  });
  document.getElementById('panXRange').addEventListener('change', pushHistory);
  document.getElementById('panYRange').addEventListener('input', (e) => {
    const p = state.photos[state.selectedSlot];
    if (p) { p.oy = Number(e.target.value); renderPreview(); }
  });
  document.getElementById('panYRange').addEventListener('change', pushHistory);
  document.getElementById('btnFillPanel').addEventListener('click', () => {
    const src = state.photos[state.selectedSlot];
    if (!src) return;
    state.photos = state.photos.map(() => ({ img: src.img, zoom: 1.15, ox: 0, oy: 0, name: src.name }));
    pushHistory();
    renderAll();
  });
  document.querySelectorAll('#sizeRow button').forEach((b) => {
    b.addEventListener('click', () => {
      state.size = b.dataset.size;
      pushHistory();
      renderAll();
    });
  });
  document.getElementById('btnExport').addEventListener('click', () => exportPng(state.size));
  document.getElementById('btnExportAll').addEventListener('click', exportAllSizes);
  document.getElementById('btnSamples').addEventListener('click', loadSamples);
  document.getElementById('btnUndo').addEventListener('click', undo);
  document.getElementById('btnRedo').addEventListener('click', redo);
  document.getElementById('btnRandom').addEventListener('click', () => {
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.title = TITLES[Math.floor(Math.random() * TITLES.length)];
    pushHistory();
    syncInputs();
    renderAll();
  });
  document.getElementById('fileInput').addEventListener('change', (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  });
  document.getElementById('slotFileInput').addEventListener('change', (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });
  const stage = document.getElementById('stage');
  ['dragenter', 'dragover'].forEach((ev) => stage.addEventListener(ev, (e) => {
    e.preventDefault();
    stage.classList.add('drag-over');
  }));
  ['dragleave', 'drop'].forEach((ev) => stage.addEventListener(ev, (e) => {
    e.preventDefault();
    stage.classList.remove('drag-over');
  }));
  stage.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
}

// Screenshot mode: ?shot=editor|export|grade|cover&layout=..&grade=..&size=..&title=..
// Pre-configures the studio so the maker can frame a shot of the real app.
async function applyShotMode() {
  const q = new URLSearchParams(location.search);
  if (!q.has('shot')) return;
  if (q.get('layout')) state.layout = q.get('layout');
  if (q.get('grade')) state.grade = q.get('grade');
  if (q.get('size')) state.size = q.get('size');
  if (q.get('title')) state.title = q.get('title');
  if (q.get('subtitle')) state.subtitle = q.get('subtitle');
  if (q.get('star')) state.star = q.get('star');
  if (q.get('feat')) state.feat = q.get('feat');
  await loadSamples();
  if (q.get('shot') === 'export') {
    document.getElementById('btnExport').focus();
  }
  window.__shotReady = true;
}

async function init() {
  bindInputs();
  try {
    await Promise.all([
      document.fonts.load('400 100px "Anton"'),
      document.fonts.load('400 60px "Pacifico"'),
    ]);
  } catch (e) {
    console.warn('font preload failed', e);
  }
  await loadSamples();
  pushHistory();
  await applyShotMode();
  renderAll();
  window.__shotReady = true;
}

// Test and screenshot hook: the maker drives the real app through these.
window.__studio = {
  state,
  loadSamples,
  exportPng,
  exportAllSizes,
  renderPreview,
  setLayout(id) { state.layout = id; renderAll(); },
  setGrade(id) { state.grade = id; renderAll(); },
  setSize(key) { state.size = key; renderAll(); },
  photoCount() { return state.photos.filter(Boolean).length; },
  shotReady() { return window.__shotReady === true; },
};

init();
