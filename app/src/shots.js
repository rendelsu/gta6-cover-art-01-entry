// Fixed scenes for screenshots: ?shot=cover shows the finished cover alone,
// ?shot=editor the editor with photos loaded, ?shot=export the export panel,
// ?shot=grade another layout with another grade. `photo` picks the sample and
// `caption` the title. window.__shotReady is set once painted.
import { GRADES, LAYOUTS } from './cover.js';

function setInputs(state) {
  const title = document.getElementById('titleInput');
  if (title) title.value = state.title;
  const subtitle = document.getElementById('subtitleInput');
  if (subtitle) subtitle.value = state.subtitle;
  const badge = document.getElementById('badgeInput');
  if (badge) badge.value = state.badge;
}

export async function runShot(shot, query, state, photos, renderPreview) {
  const caption = query.get('caption') ?? 'Sunset Heist';
  state.title = caption;
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('layout') && LAYOUTS[query.get('layout')]) state.layout = query.get('layout');
  if (query.get('grade') && GRADES[query.get('grade')]) state.grade = query.get('grade');
  const photoName = query.get('photo');
  if (photoName) {
    const idx = photos.findIndex((p) => p.name.startsWith(photoName));
    if (idx >= 0) {
      for (const layoutId of Object.keys(state.crops)) {
        state.crops[layoutId].forEach((c, i) => { c.photo = (idx + i) % photos.length; });
      }
    }
  }
  // Screenshot framing: show the top of each photo (faces) rather than the
  // vertical centre, and no extra zoom.
  for (const layoutId of Object.keys(state.crops)) {
    state.crops[layoutId].forEach((c) => { c.zoom = 1; c.ox = 0; c.oy = 0.7; });
  }
  setInputs(state);

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  } else if (shot === 'export') {
    document.body.classList.add('shot-export');
    document.getElementById('exportPanel').classList.add('flash');
    document.querySelector('button[data-size="4:5"]')?.click();
  } else if (shot === 'grade') {
    document.body.classList.add('shot-grade');
  }
  await document.fonts.ready;
  renderPreview();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
