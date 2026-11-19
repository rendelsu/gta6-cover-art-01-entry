// Neon Coast Cover Studio — the editor UI.
// Wires the cover engine to the page: photo loading (picker + drag and drop),
// layout and grade pickers, caption editing, per-panel crop and position,
// undo/redo, and one-click PNG export in every post size. No network: every
// file the page loads lives under app/.

import { EXPORT_SIZES, GRADES, LAYOUTS, defaultState, panelAt, renderCover } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const state = defaultState();
const photos = []; // { img, name }
let selectedPhoto = 0;
let selectedPanel = 0;
let exportSize = '1:1';
let dragging = null;

const preview = $('preview');
const pctx = preview.getContext('2d');
const history = [];
let historyIndex = -1;

function snapshotState() {
  return JSON.stringify({
    layout: state.layout,
    grade: state.grade,
    gradeIntensity: state.gradeIntensity,
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    stars: state.stars,
    titleScale: state.titleScale,
    crops: state.crops,
  });
}

function restoreState(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
  renderPreview();
}

function pushHistory() {
  history.splice(historyIndex + 1);
  history.push(snapshotState());
  if (history.length > 60) history.shift();
  historyIndex = history.length - 1;
  $('undo').disabled = historyIndex <= 0;
  $('redo').disabled = true;
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  restoreState(history[historyIndex]);
  $('undo').disabled = historyIndex <= 0;
  $('redo').disabled = false;
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex += 1;
  restoreState(history[historyIndex]);
  $('undo').disabled = historyIndex <= 0;
  $('redo').disabled = historyIndex >= history.length - 1;
}

function currentCrop() {
  return state.crops[state.layout][selectedPanel];
}

function renderPreview() {
  const [w, h] = EXPORT_SIZES[exportSize];
  if (preview.width !== w || preview.height !== h) {
    preview.width = w;
    preview.height = h;
  }
  renderCover(pctx, w, h, state, photos.map((p) => p.img), selectedPanel);
  $('sizeLabel').textContent = `${exportSize} — ${w} x ${h}`;
  syncCropControls();
}

function syncCropControls() {
  const crop = currentCrop();
  $('zoom').value = crop.zoom;
  $('panX').value = crop.ox;
  $('panY').value = crop.oy;
  $('zoomVal').textContent = `${Math.round(crop.zoom * 100)}%`;
  $('panelLabel').textContent = `Panel ${selectedPanel + 1} of ${LAYOUTS[state.layout].panels.length}`;
}

function syncControls() {
  document.querySelectorAll('#layoutGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('#gradeGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  $('gradeIntensity').value = state.gradeIntensity;
  $('gradeVal').textContent = `${Math.round(state.gradeIntensity * 100)}%`;
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('badgeInput').value = state.badge;
  $('titleScale').value = state.titleScale;
  document.querySelectorAll('#sizeGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === exportSize);
  });
  document.querySelectorAll('#stars button').forEach((b) => {
    b.classList.toggle('lit', Number(b.dataset.star) <= state.stars);
  });
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    // The object URL stays alive for the session: the thumbnail uses the
    // same URL, so revoking it here would break the thumbnail.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, name: file.name });
    img.onerror = () => reject(new Error(`Could not load ${file.name}`));
    img.src = url;
  });
}

function loadImageUrl(url, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, name });
    img.onerror = () => reject(new Error(`Could not load ${name}`));
    img.src = url;
  });
}

async function addPhotos(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  if (!list.length) return;
  for (const file of list) {
    try {
      photos.push(await loadImageFile(file));
    } catch (err) {
      setStatus(err.message);
    }
  }
  selectedPhoto = photos.length - 1;
  renderThumbs();
  pushHistory();
  renderPreview();
  setStatus(`${photos.length} photo${photos.length === 1 ? '' : 's'} loaded. Click a photo, then a panel, to place it.`);
}

function renderThumbs() {
  const strip = $('thumbs');
  strip.innerHTML = '';
  photos.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `thumb${i === selectedPhoto ? ' active' : ''}`;
    btn.title = p.name;
    const thumb = document.createElement('img');
    thumb.src = p.img.src;
    thumb.alt = p.name;
    btn.appendChild(thumb);
    btn.addEventListener('click', () => {
      selectedPhoto = i;
      renderThumbs();
      setStatus(`Photo ${i + 1} selected — click a panel on the cover to place it.`);
    });
    strip.appendChild(btn);
  });
}

function setStatus(text) {
  $('status').textContent = text;
}

function renderCoverToCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas.getContext('2d'), w, h, state, photos.map((p) => p.img), -1);
  return canvas;
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve(blob.size);
    }, 'image/png');
  });
}

async function exportOne(size) {
  const [w, h] = EXPORT_SIZES[size];
  const canvas = renderCoverToCanvas(w, h);
  const bytes = await downloadCanvas(canvas, `neon-coast-cover-${size.replace(':', 'x')}.png`);
  setStatus(`Exported ${size} (${w} x ${h}) — ${Math.round(bytes / 1024)} KiB PNG.`);
  return bytes;
}

async function exportAll() {
  const sizes = [...document.querySelectorAll('#exportSizes input:checked')].map((c) => c.value);
  if (!sizes.length) {
    setStatus('Tick at least one size to export.');
    return;
  }
  for (const size of sizes) await exportOne(size);
  setStatus(`Exported ${sizes.length} cover${sizes.length === 1 ? '' : 's'}: ${sizes.join(', ')}.`);
}

// Exposed for screenshots and playtests: export any size as a PNG data URL.
window.__coverApp = {
  state,
  photos,
  renderPreview,
  exportPNG(size) {
    return new Promise((resolve) => {
      const [w, h] = EXPORT_SIZES[size];
      renderCoverToCanvas(w, h).toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }, 'image/png');
    });
  },
};

function buildPickers() {
  const layoutGrid = $('layoutGrid');
  for (const [id, layout] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = id;
    b.innerHTML = `<strong>${layout.label}</strong><span>${layout.hint}</span>`;
    b.addEventListener('click', () => {
      state.layout = id;
      selectedPanel = 0;
      pushHistory();
      renderPreview();
    });
    layoutGrid.appendChild(b);
  }
  const gradeGrid = $('gradeGrid');
  for (const [id, grade] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = id;
    b.style.setProperty('--swatch', grade.tint);
    b.innerHTML = `<i></i><span>${grade.label}</span>`;
    b.addEventListener('click', () => {
      state.grade = id;
      pushHistory();
      renderPreview();
    });
    gradeGrid.appendChild(b);
  }
  const sizeGrid = $('sizeGrid');
  for (const size of Object.keys(EXPORT_SIZES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.size = size;
    b.textContent = size;
    b.addEventListener('click', () => {
      exportSize = size;
      pushHistory();
      renderPreview();
    });
    sizeGrid.appendChild(b);
  }
  const stars = $('stars');
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.star = i;
    b.textContent = '★';
    b.setAttribute('aria-label', `${i} stars`);
    b.addEventListener('click', () => {
      state.stars = i;
      pushHistory();
      syncControls();
      renderPreview();
    });
    stars.appendChild(b);
  }
}

function bindControls() {
  $('photoInput').addEventListener('change', (e) => addPhotos(e.target.files));
  const drop = $('dropzone');
  drop.addEventListener('click', () => $('photoInput').click());
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    addPhotos(e.dataTransfer.files);
  });
  $('gradeIntensity').addEventListener('input', (e) => {
    state.gradeIntensity = Number(e.target.value);
    syncControls();
    renderPreview();
  });
  $('gradeIntensity').addEventListener('change', pushHistory);
  $('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value;
    renderPreview();
  });
  $('titleInput').addEventListener('change', pushHistory);
  $('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    renderPreview();
  });
  $('subtitleInput').addEventListener('change', pushHistory);
  $('badgeInput').addEventListener('input', (e) => {
    state.badge = e.target.value;
    renderPreview();
  });
  $('badgeInput').addEventListener('change', pushHistory);
  $('titleScale').addEventListener('input', (e) => {
    state.titleScale = Number(e.target.value);
    renderPreview();
  });
  $('titleScale').addEventListener('change', pushHistory);
  $('zoom').addEventListener('input', (e) => {
    currentCrop().zoom = Number(e.target.value);
    renderPreview();
  });
  $('zoom').addEventListener('change', pushHistory);
  $('panX').addEventListener('input', (e) => {
    currentCrop().ox = Number(e.target.value);
    renderPreview();
  });
  $('panX').addEventListener('change', pushHistory);
  $('panY').addEventListener('input', (e) => {
    currentCrop().oy = Number(e.target.value);
    renderPreview();
  });
  $('panY').addEventListener('change', pushHistory);
  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  $('exportAll').addEventListener('click', exportAll);
  $('exportOne').addEventListener('click', () => exportOne(exportSize));

  // Canvas: click a panel to select (and place the chosen photo), drag to
  // pan it, scroll to zoom it.
  const toCanvas = (e) => {
    const rect = preview.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * preview.width,
      y: ((e.clientY - rect.top) / rect.height) * preview.height,
    };
  };
  preview.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const hit = panelAt(state, p.x, p.y, preview.width, preview.height);
    if (hit < 0) return;
    selectedPanel = hit;
    currentCrop().photo = selectedPhoto;
    dragging = { x: p.x, y: p.y, ox: currentCrop().ox, oy: currentCrop().oy };
    preview.setPointerCapture(e.pointerId);
    pushHistory();
    renderPreview();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = toCanvas(e);
    const layout = LAYOUTS[state.layout].panels[selectedPanel];
    const w = layout.w * preview.width;
    const h = layout.h * preview.height;
    currentCrop().ox = Math.max(-1, Math.min(1, dragging.ox + ((p.x - dragging.x) / Math.max(1, w)) * 2));
    currentCrop().oy = Math.max(-1, Math.min(1, dragging.oy + ((p.y - dragging.y) / Math.max(1, h)) * 2));
    renderPreview();
  });
  preview.addEventListener('pointerup', () => {
    if (dragging) pushHistory();
    dragging = null;
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toCanvas(e);
    const hit = panelAt(state, p.x, p.y, preview.width, preview.height);
    if (hit < 0) return;
    selectedPanel = hit;
    const crop = currentCrop();
    crop.zoom = Math.max(1, Math.min(3, crop.zoom - Math.sign(e.deltaY) * 0.12));
    renderPreview();
  }, { passive: false });
}

async function loadSamples() {
  const samples = [
    ['samples/boulevard.jpg', 'boulevard.jpg'],
    ['samples/pier.jpg', 'pier.jpg'],
    ['samples/neon.jpg', 'neon.jpg'],
  ];
  for (const [url, name] of samples) {
    try {
      photos.push(await loadImageUrl(url, name));
    } catch (err) {
      console.warn(err.message);
    }
  }
  renderThumbs();
  setStatus(`${photos.length} sample photo${photos.length === 1 ? '' : 's'} loaded — drop your own photos, or pick a layout and export.`);
}

async function boot() {
  buildPickers();
  bindControls();
  await loadSamples();
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) {
    await runShot(query.get('shot'), query, state, photos, renderPreview);
  }
  await document.fonts.ready;
  pushHistory();
  renderPreview();
  window.__shotReady = true;
}

boot().catch((err) => {
  console.error(err);
  setStatus(`Could not start: ${err.message}`);
});
