// Vice Heat Cover Studio — deterministic screenshot scenes (app/src/shots.js).
// Headless captures drive the app through ?shot= parameters, the way the
// house apps do: ?shot=cover draws a finished exported cover full-frame,
// ?shot=editor shows the editor with a photo loaded, ?shot=export shows the
// export panel with a real export behind it. No other code path uses these.

import { SIZES, drawCover } from './cover.js';

function waitForApp() {
  return new Promise((resolve) => {
    const tick = () => (window.__cover && window.__cover.ready ? resolve(window.__cover) : setTimeout(tick, 50));
    tick();
  });
}

function param(name, fallback) {
  const v = new URLSearchParams(location.search).get(name);
  return v == null || v === '' ? fallback : v;
}

async function shotCover(app) {
  document.body.classList.add('shot-cover');
  const layout = param('layout', 'loading-screen');
  const grade = param('grade', 'vice-sunset');
  const sizeKey = param('size', '16:9');
  app.setState({
    layout,
    grade,
    title: param('caption', 'VICE HEAT'),
    subtitle: param('subtitle', 'a Vice City story'),
    size: sizeKey,
  });
  await document.fonts.ready;
  const canvas = document.getElementById('preview');
  const off = document.createElement('canvas');
  const size = SIZES[sizeKey];
  drawCover(off, app.state, app.photos.map((p) => p.img));
  const vw = window.innerWidth, vh = window.innerHeight;
  canvas.width = vw; canvas.height = vh;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, vw, vh);
  const scale = Math.max(vw / size.w, vh / size.h);
  const dw = size.w * scale, dh = size.h * scale;
  ctx.drawImage(off, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
  document.title = 'cover';
}

async function shotEditor(app) {
  app.setState({
    layout: param('layout', 'hero-strip'),
    grade: param('grade', 'neon-nights'),
    title: param('caption', 'VICE HEAT'),
    subtitle: param('subtitle', 'a Vice City story'),
    size: param('size', '16:9'),
  });
  await document.fonts.ready;
  app.renderPreview();
  document.title = 'editor';
}

async function shotExport(app) {
  await shotEditor(app);
  const blob = await app.exportPNG('1:1');
  const status = document.getElementById('exportStatus');
  if (status) status.textContent = `Exported Square 1080 x 1080 — ${(blob.size / 1024).toFixed(0)} KiB PNG. All four sizes ready in one click.`;
  document.title = 'export';
}

async function runShotScene() {
  const shot = param('shot', '');
  if (!shot) return;
  const app = await waitForApp();
  if (shot === 'cover') await shotCover(app);
  else if (shot === 'editor') await shotEditor(app);
  else if (shot === 'export') await shotExport(app);
}

runShotScene();
