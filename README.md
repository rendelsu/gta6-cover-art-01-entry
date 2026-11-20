# Vice Heat Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo and a caption into GTA-style cover art — the multi-panel
poster look with bold retro-chrome lettering and a Vice City neon-sunset
grade — and export it as a PNG to share. An entry for the
[make.fun GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Any photo, several panels:** load your own photos (drag-drop or file
  picker) or use the four built-in sample scenes, and fill 3 to 9 panels
  with one photo or several. Click a panel to crop it, move it, zoom it,
  or switch its photo.
- **Face-aware crop:** a light on-device skin-tone heuristic finds the
  face-like region of each photo and keeps it in frame when you crop.
- **9 multi-panel layouts:** Vice Grid, Hero + Strip, Loading Screen,
  Triptych, Quad Split, Sunset Sleeve, Tilted Snapshots, Nine Lives and
  Drive By — each with a pop-out hero panel that breaks its frame.
- **9 Vice City grades:** Vice Sunset, Neon Nights, Heatwave, Coral Heat,
  Midnight Drive, Golden Hour, Bubblegum, Teal Noir and Afterglow, with an
  intensity slider, halftone dots, grain and a vignette.
- **Genre lettering:** a retro-chrome display title (Anton), a neon-script
  subtitle (Pacifico), per-panel cast role tags, a five-star heat meter, a
  Vice City seal stamp and a movie-poster billing block.
- **One-step export:** PNG in 1080&times;1080, 1080&times;1350,
  1080&times;1920 and 1920&times;1080 — one size at a time, or all four in
  one click. Undo and redo included.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. Everything runs in the browser from the
static files under `app/` — no network request, no upload, no account. Your
photos never leave your machine.

## How it is built

- `app/index.html` + `app/style.css` — the editor chrome.
- `app/src/cover.js` — the cover engine: layouts, grades, chrome title,
  neon subtitle, cast tags, seal, billing block, halftone, grain and the
  face-aware crop. Plain 2D canvas, no library.
- `app/src/main.js` — the editor: photo tray, pickers, panel inspector,
  undo/redo, drag-drop and export.
- `app/src/shots.js` — deterministic `?shot=` scenes for screenshots.
- `app/fonts/` — Anton and Pacifico, vendored under the SIL Open Font
  License (see `OFL.txt`).
- `app/samples/` — four sample scenes drawn from scratch in code
  (procedural art: sunset boulevard, coastal convertible, neon street,
  pier). No real people, no Rockstar artwork, no game assets.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.

## Screenshots

`screenshots/` holds four captures from the app running in desktop Chrome:

1. `1-cover.jpg` — a finished 16:9 cover the app exported.
2. `2-editor.jpg` — the editor with a photo loaded, panels and controls.
3. `3-export.jpg` — the export panel with all four post sizes.
4. `4-grade.jpg` — the same cover in another layout and grade.

## Why this one

The top of the board is crowded with strong poster makers, so this round
pushes where the art itself is decided: the hero panel pops out of its
frame with a hard shadow, the title is layered chrome instead of flat
type, and the face-aware crop means a portrait survives any panel shape.
Everything else — layouts, grades, cast tags, seal, billing, four sizes in
one click — is there to make the jump from a photo to a posted cover take
under a minute.

## Referral

Built for make.fun — if you enter a bounty there, my referral code is
`rkkz4bh8`: <https://make.fun/r/rkkz4bh8>

## License

MIT — see `LICENSE`. Fonts under the SIL Open Font License (`app/fonts/OFL.txt`).
