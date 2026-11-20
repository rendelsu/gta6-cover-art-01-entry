// Vice Heat Cover Studio — editor UI (app/src/main.js).
// Wires the photo tray, layout and grade pickers, panel inspector, caption
// fields and export buttons to the cover engine in cover.js. The preview
// canvas re-renders on every state change; every photo stays on the machine.

import { SIZES, GRADES, LAYOUTS, layoutById, gradeById, drawCover, exportCoverPNG, downloadBlob, detectFacePoint } from './cover.js';

const SAMPLES = [
  { src: 'samples/boulevard.jpg', name: 'Boulevard' },
  { src: 'samples/convertible.jpg', name: 'Convertible' },
  { src: 'samples/neon.jpg', name: 'Neon Street' },
  { src: 'samples/pier.jpg', name: 'Pier' },
];

const DEFAULT_CAST = [
  { role: 'THE DRIVER', name: 'LUCIA' },
  { role: 'THE FIXER', name: 'MARCO' },
  { role: 'THE LOOKOUT', name: 'NIA' },
  { role: 'THE WHEELS', name: 'DRE' },
];

function defaultState() {
  return {
    layout: 'vice-grid',
    grade: 'vice-sunset',
    gradeIntensity: 0.7,
    title: 'VICE HEAT',
    subtitle: 'a Vice City story',
    panels: Array.from({ length: 9 }, (_, i) => ({ photo: i % 4, zoom: 1.15, ox: 0, oy: 0, faceAware: true })),
    cast: DEFAULT_CAST.map((c) => ({ ...c })),
    seal: true,
    billing: true,
    billingText: 'VICE HEAT PICTURES  presents  A VICE CITY STORY  \u2022  STARRING THE CREW  \u2022  SHOT ON LOCATION',
    halftone: true,
    heat: 4,
    size: '1:1',
    selectedPanel: 4,
  };
}

const state = defaultState();
const photos = []; // { img, name, face } — samples first, uploads appended
let undoStack = [];
let redoStack = [];
let renderTimer = 0;

const $ = (sel) => document.querySelector(sel);
const preview = $('#preview');
const pctx = preview.getContext('2d');

function snapshotState() {
  const { selectedPanel, ...rest } = state;
  return JSON.stringify(rest);
}

function pushHistory() {
  undoStack.push(snapshotState());
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function restoreSnapshot(json) {
  const saved = JSON.parse(json);
  const selected = state.selectedPanel;
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, saved, { selectedPanel: selected });
  syncControls();
  renderPreview();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshotState());
  restoreSnapshot(undoStack.pop());
  updateUndoButtons();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshotState());
  restoreSnapshot(redoStack.pop());
  updateUndoButtons();
}

function updateUndoButtons() {
  $('#undoBtn').disabled = !undoStack.length;
  $('#redoBtn').disabled = !redoStack.length;
}

// --- photos ---------------------------------------------------------------
async function loadSamplePhotos() {
  for (const s of SAMPLES) {
    const img = new Image();
    img.src = s.src;
    try { await img.decode(); } catch (e) { await new Promise((r) => { img.onload = r; img.onerror = r; }); }
    photos.push({ img, name: s.name, face: detectFacePoint(img) });
  }
  state.panels.forEach((p) => { p.face = photos[p.photo] ? photos[p.photo].face : null; });
}

function addUploadedPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        photos.push({ img, name: file.name.replace(/\.[^.]+$/, ''), face: detectFacePoint(img) });
        buildPhotoTray();
        resolve(photos.length - 1);
      };
      img.onerror = () => resolve(-1);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- preview --------------------------------------------------------------
function renderPreview() {
  const size = SIZES[state.size];
  const scale = Math.min(1, 880 / size.w, 880 / size.h);
  preview.width = Math.round(size.w * scale);
  preview.height = Math.round(size.h * scale);
  const off = document.createElement('canvas');
  drawCover(off, state, photos.map((p) => p.img));
  pctx.clearRect(0, 0, preview.width, preview.height);
  pctx.drawImage(off, 0, 0, preview.width, preview.height);
  drawSelectionOutline();
  $('#sizeLabel').textContent = `${size.label} — preview ${preview.width} x ${preview.height}`;
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, 60);
}

function previewPanelAt(mx, my) {
  const rect = preview.getBoundingClientRect();
  const fx = (mx - rect.left) / rect.width, fy = (my - rect.top) / rect.height;
  const layout = layoutById(state.layout);
  const cells = layout.cells.filter((c) => !c.ghost);
  for (let i = cells.length - 1; i >= 0; i--) {
    const c = cells[i];
    if (fx >= c.x && fx < c.x + c.w && fy >= c.y && fy < c.y + c.h) return i;
  }
  return -1;
}

function drawSelectionOutline() {
  const layout = layoutById(state.layout);
  const cells = layout.cells.filter((c) => !c.ghost);
  const i = state.selectedPanel;
  if (i < 0 || i >= cells.length) return;
  const c = cells[i];
  pctx.save();
  pctx.strokeStyle = '#ffd166';
  pctx.lineWidth = 3;
  pctx.setLineDash([10, 6]);
  pctx.strokeRect(c.x * preview.width + 2, c.y * preview.height + 2, c.w * preview.width - 4, c.h * preview.height - 4);
  pctx.restore();
}

// --- controls -------------------------------------------------------------
function buildPhotoTray() {
  const tray = $('#photoTray');
  tray.innerHTML = '';
  photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'thumb';
    b.type = 'button';
    b.innerHTML = `<img alt=""><span></span>`;
    b.querySelector('img').src = p.img.src;
    b.querySelector('span').textContent = p.name;
    b.title = `Use ${p.name} in the selected panel`;
    b.addEventListener('click', () => {
      pushHistory();
      const panel = state.panels[state.selectedPanel];
      panel.photo = i;
      panel.face = p.face;
      renderPreview();
    });
    tray.appendChild(b);
  });
  const up = document.createElement('button');
  up.className = 'thumb upload';
  up.type = 'button';
  up.innerHTML = '<span class="plus">+</span><span>Add your photo</span>';
  up.addEventListener('click', () => $('#fileInput').click());
  tray.appendChild(up);
}

function buildLayoutPicker() {
  const wrap = $('#layoutPicker');
  wrap.innerHTML = '';
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.className = 'pick layout-pick' + (l.id === state.layout ? ' active' : '');
    b.type = 'button';
    b.dataset.id = l.id;
    b.innerHTML = `<span class="mini-grid">${l.cells.filter((c) => !c.ghost).map((c) =>
      `<i style="left:${c.x * 100}%;top:${c.y * 100}%;width:${c.w * 100}%;height:${c.h * 100}%"></i>`).join('')}</span><span>${l.name}</span><em>${l.panels} panels${l.hero >= 0 ? ' \u2022 pop-out hero' : ''}</em>`;
    b.addEventListener('click', () => {
      if (l.id === state.layout) return;
      pushHistory();
      state.layout = l.id;
      state.selectedPanel = l.hero >= 0 ? l.hero : 0;
      buildLayoutPicker();
      syncPanelInspector();
      renderPreview();
    });
    wrap.appendChild(b);
  });
}

function buildGradePicker() {
  const wrap = $('#gradePicker');
  wrap.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.className = 'pick grade-pick' + (g.id === state.grade ? ' active' : '');
    b.type = 'button';
    b.dataset.id = g.id;
    b.innerHTML = `<span class="swatch" style="background:linear-gradient(135deg,${g.top},${g.bottom})"></span><span>${g.name}</span>`;
    b.addEventListener('click', () => {
      if (g.id === state.grade) return;
      pushHistory();
      state.grade = g.id;
      buildGradePicker();
      renderPreview();
    });
    wrap.appendChild(b);
  });
}

function buildSizePicker() {
  const wrap = $('#sizePicker');
  wrap.innerHTML = '';
  Object.entries(SIZES).forEach(([key, s]) => {
    const b = document.createElement('button');
    b.className = 'pick size-pick' + (key === state.size ? ' active' : '');
    b.type = 'button';
    b.textContent = `${key}  ${s.w} x ${s.h}`;
    b.addEventListener('click', () => {
      state.size = key;
      buildSizePicker();
      renderPreview();
    });
    wrap.appendChild(b);
  });
}

function syncPanelInspector() {
  const layout = layoutById(state.layout);
  const cells = layout.cells.filter((c) => !c.ghost);
  const i = Math.min(state.selectedPanel, cells.length - 1);
  state.selectedPanel = Math.max(0, i);
  const panel = state.panels[state.selectedPanel];
  $('#panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${cells.length} — ${layout.name}`;
  $('#panelPhoto').value = String(panel.photo || 0);
  $('#panelZoom').value = panel.zoom || 1;
  $('#panelZoomVal').textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
  $('#panelOx').value = panel.ox || 0;
  $('#panelOy').value = panel.oy || 0;
  $('#panelFace').checked = panel.faceAware !== false;
  const tag = state.cast[state.selectedPanel] || { role: '', name: '' };
  $('#castRole').value = tag.role || '';
  $('#castName').value = tag.name || '';
}

function syncControls() {
  $('#titleInput').value = state.title;
  $('#subtitleInput').value = state.subtitle;
  $('#gradeSlider').value = state.gradeIntensity;
  $('#gradeVal').textContent = `${Math.round(state.gradeIntensity * 100)}%`;
  $('#sealToggle').checked = state.seal !== false;
  $('#billingToggle').checked = state.billing !== false;
  $('#heatInput').value = state.heat == null ? 4 : state.heat;
  buildLayoutPicker();
  buildGradePicker();
  buildSizePicker();
  syncPanelInspector();
}

function bindControls() {
  $('#titleInput').addEventListener('input', (e) => { state.title = e.target.value; scheduleRender(); });
  $('#titleInput').addEventListener('change', pushHistory);
  $('#subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; scheduleRender(); });
  $('#subtitleInput').addEventListener('change', pushHistory);
  $('#gradeSlider').addEventListener('input', (e) => {
    state.gradeIntensity = Number(e.target.value);
    $('#gradeVal').textContent = `${Math.round(state.gradeIntensity * 100)}%`;
    scheduleRender();
  });
  $('#gradeSlider').addEventListener('change', pushHistory);
  $('#sealToggle').addEventListener('change', (e) => { pushHistory(); state.seal = e.target.checked; renderPreview(); });
  $('#billingToggle').addEventListener('change', (e) => { pushHistory(); state.billing = e.target.checked; renderPreview(); });
  $('#heatInput').addEventListener('change', (e) => { pushHistory(); state.heat = Number(e.target.value); renderPreview(); });

  $('#panelPhoto').addEventListener('change', (e) => {
    pushHistory();
    const panel = state.panels[state.selectedPanel];
    panel.photo = Number(e.target.value);
    panel.face = photos[panel.photo] ? photos[panel.photo].face : null;
    renderPreview();
  });
  $('#panelZoom').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].zoom = Number(e.target.value);
    $('#panelZoomVal').textContent = `${Math.round(Number(e.target.value) * 100)}%`;
    scheduleRender();
  });
  $('#panelZoom').addEventListener('change', pushHistory);
  $('#panelOx').addEventListener('input', (e) => { state.panels[state.selectedPanel].ox = Number(e.target.value); scheduleRender(); });
  $('#panelOx').addEventListener('change', pushHistory);
  $('#panelOy').addEventListener('input', (e) => { state.panels[state.selectedPanel].oy = Number(e.target.value); scheduleRender(); });
  $('#panelOy').addEventListener('change', pushHistory);
  $('#panelFace').addEventListener('change', (e) => { pushHistory(); state.panels[state.selectedPanel].faceAware = e.target.checked; renderPreview(); });
  $('#castRole').addEventListener('input', (e) => {
    state.cast[state.selectedPanel] = state.cast[state.selectedPanel] || {};
    state.cast[state.selectedPanel].role = e.target.value;
    scheduleRender();
  });
  $('#castRole').addEventListener('change', pushHistory);
  $('#castName').addEventListener('input', (e) => {
    state.cast[state.selectedPanel] = state.cast[state.selectedPanel] || {};
    state.cast[state.selectedPanel].name = e.target.value;
    scheduleRender();
  });
  $('#castName').addEventListener('change', pushHistory);

  preview.addEventListener('click', (e) => {
    const i = previewPanelAt(e.clientX, e.clientY);
    if (i >= 0) {
      state.selectedPanel = i;
      syncPanelInspector();
      renderPreview();
    }
  });

  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);
  $('#shuffleBtn').addEventListener('click', () => {
    pushHistory();
    const layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    const grade = GRADES[Math.floor(Math.random() * GRADES.length)];
    state.layout = layout.id;
    state.grade = grade.id;
    state.selectedPanel = layout.hero >= 0 ? layout.hero : 0;
    buildLayoutPicker();
    buildGradePicker();
    syncPanelInspector();
    renderPreview();
  });

  $('#exportBtn').addEventListener('click', async () => {
    setExportStatus('Exporting PNG\u2026');
    const blob = await exportCoverPNG(state, photos.map((p) => p.img), state.size);
    downloadBlob(blob, `vice-heat-cover-${state.size.replace(':', 'x')}.png`);
    setExportStatus(`Exported ${SIZES[state.size].label} — ${(blob.size / 1024).toFixed(0)} KiB PNG.`);
  });
  $('#exportAllBtn').addEventListener('click', async () => {
    setExportStatus('Exporting all four sizes\u2026');
    for (const key of Object.keys(SIZES)) {
      const blob = await exportCoverPNG(state, photos.map((p) => p.img), key);
      downloadBlob(blob, `vice-heat-cover-${key.replace(':', 'x')}.png`);
    }
    setExportStatus('Exported all four sizes — 1:1, 4:5, 9:16 and 16:9 PNGs.');
  });

  const fileInput = $('#fileInput');
  fileInput.addEventListener('change', async () => {
    for (const f of fileInput.files) {
      const idx = await addUploadedPhoto(f);
      if (idx >= 0) {
        pushHistory();
        state.panels[state.selectedPanel].photo = idx;
        state.panels[state.selectedPanel].face = photos[idx].face;
      }
    }
    fileInput.value = '';
    syncPanelInspector();
    renderPreview();
  });

  const drop = $('#dropZone');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', async (e) => {
    for (const f of e.dataTransfer.files) {
      if (!f.type.startsWith('image/')) continue;
      const idx = await addUploadedPhoto(f);
      if (idx >= 0) {
        pushHistory();
        state.panels[state.selectedPanel].photo = idx;
        state.panels[state.selectedPanel].face = photos[idx].face;
      }
    }
    syncPanelInspector();
    renderPreview();
  });
}

function setExportStatus(text) {
  $('#exportStatus').textContent = text;
}

// --- boot -----------------------------------------------------------------
async function boot() {
  bindControls();
  buildPhotoTray();
  syncControls();
  await document.fonts.load('400 80px Anton');
  await document.fonts.load('400 40px Pacifico');
  await document.fonts.ready;
  await loadSamplePhotos();
  buildPhotoTray();
  const sel = $('#panelPhoto');
  sel.innerHTML = photos.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
  syncPanelInspector();
  renderPreview();
  window.__cover = {
    state, photos,
    renderPreview,
    exportPNG: (sizeKey) => exportCoverPNG(state, photos.map((p) => p.img), sizeKey),
    setState: (patch) => { Object.assign(state, patch); syncControls(); renderPreview(); },
    ready: true,
  };
}

document.addEventListener('DOMContentLoaded', boot);
