# Vice Coast Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rendelsu/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into a Vice City sunset poster — an offline web app that builds
multi-panel GTA-style cover art in your browser and exports it as a PNG to share.
Built for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01).

## What it does

Drop in your own photos (or use the built-in poster-art samples), pick one of
eight multi-panel layouts, choose a neon-sunset Vice grade, letter it with a
retro-chrome title and a neon script subtitle, add cast tags, a seal and a
billing block — then export a PNG in 1:1, 4:5, 9:16 or 16:9 with one click.
Everything runs on your machine; no photo is ever uploaded.

- **8 layouts** — Hero + Strip, Hero + Duo, Nine Panel, Tilted Snaps,
  Full Bleed, Diagonal Split, Pop-Out Hero (the hero photo bursts out of its
  frame, over the title), and Billboard.
- **8 Vice grades** — Vice Sunset, Neon Pink, Gold Hour, Teal Heat, Magenta
  Nights, Ocean Drive, Retro Chrome and Mono Noir, each with a glow slider.
- **Any photo** — drag and drop, or a file picker; click a panel to select it,
  drag to pan the photo inside it, scroll to zoom, or use the crop sliders.
  One photo can fill every panel, or each panel can hold a different photo.
- **Lettering** — a striped retro-chrome title, a glowing neon-script subtitle,
  STARRING / FEATURING cast tags, a circular Vice Coast seal, and a billing
  block along the bottom edge, all editable live.
- **Fast** — a live preview updates as you work; Undo / Redo (Ctrl+Z / Ctrl+Y);
  a Surprise-me button shuffles a fresh look; Export all sizes downloads every
  post size at once.

## Try it

Serve the `app/` folder with any static server and open `index.html`:

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests. The app is plain static files: HTML, CSS
and vanilla JavaScript on canvas 2D. Fonts Anton and Pacifico are vendored
under `app/fonts/` under the SIL Open Font License (see `app/fonts/OFL.txt`).

## How a cover is made

The renderer (`app/src/cover.js`) paints each layout from unit-coordinate
panels: flat panels first, then the pop-out hero with a hard shadow and a white
keyline so it leaps off the page. Photos are cover-fit per panel with their own
zoom and pan; empty slots fall back to a painted sunset skyline so a cover
never looks broken. A warm wash, a vignette and deterministic film grain finish
the grade, then the title is drawn in layers — drop shadow, gradient body,
chrome stripes clipped to the letters, and a crisp outline — with the subtitle
glowing beneath it in neon script.

The four sample photos under `app/samples/` are procedural poster art drawn
with code (a palm boulevard, a convertible at golden hour, a pier over the
ocean, a neon night street). No real person's photo and no Rockstar Games
artwork, logo or font is used anywhere in this project.

## Screenshots

`screenshots/` holds four frames taken from the app running in a browser:
the exported 16:9 cover first, then the editor with a photo loaded, the
export controls, and a second layout and grade.

## Notes

- The entry program is `main.ts` (Node 22, standard library only): it copies
  `app/` and `screenshots/` to the output directory and writes
  `dossier.json` with the vendored make.fun library in `vendor/`.
- This entry was built for make.fun — if you enter a bounty there too, my
  referral link is https://make.fun/r/rkkz4bh8 (code `rkkz4bh8`).
- License: MIT — see `LICENSE`.

Made with an offline-first mindset: your photos stay yours.
