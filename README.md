# Neon Coast Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/reward.svg)](https://make.fun/c/gta6-cover-art-01)

An offline browser app that turns any photo and a caption into GTA 6-style
cover art — the multi-panel poster look with bold lettering and a Vice City
neon-sunset grade — exported as a PNG to share. Built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/c/gta6-cover-art-01).

## How it works

1. **Drop in photos** — drag and drop or pick files; they never leave your
   machine. Three sample photos ship with the app so you can try it at once.
2. **Pick a layout** — six poster layouts: Hero + Strip, Nine-Panel Grid,
   Full Bleed, Tilted Snapshots, Duo Split, and Tall Hero.
3. **Place each photo** — click a photo, then a panel, to fill it. Click a
   panel to select it, drag it to pan, scroll to zoom, or use the crop sliders.
4. **Grade it** — six Vice City grades (Neon Sunset, Vice Pink, Teal Night,
   Golden Hour, Hot Magenta, Mono Noir) with an intensity slider.
5. **Letter it** — a bold Anton title with a sunset gradient, a Pacifico neon
   subtitle, a badge ribbon, and a five-star heat meter.
6. **Export** — one click writes every ticked size at once: 1:1 (1080×1080),
   4:5 (1080×1350), 9:16 (1080×1920), and 16:9 (1920×1080) PNGs.

Undo and redo cover every change. Everything runs in the browser from the
app's own static files — no server, no upload, no network request.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static server. The entry program hands the app in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What's inside

- `app/index.html` — the editor page
- `app/style.css` — the Vice City editor chrome
- `app/src/cover.js` — the cover engine: layouts, grades, lettering, grain
- `app/src/main.js` — the editor: photos, crop, undo/redo, export
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover|editor|export|grade`)
- `app/fonts/` — Anton and Pacifico under the SIL Open Font License
- `app/samples/` — sample photos: two made with an image model for make.fun,
  one drawn procedurally with code (no real person, no GTA artwork)
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library
- `screenshots/` — the cover and the app at work

## Credits

Original work by rendelsu, built for make.fun. Lettering uses Anton and
Pacifico (SIL Open Font License, texts in `app/fonts/`). An original fan-made
tool — not affiliated with Rockstar Games, and it uses no Rockstar logo,
artwork, or font.

Made with make.fun — [join with my referral](https://make.fun/r/rkkz4bh8)
(referral code: `rkkz4bh8`).
