// Vice Heat Cover Studio — the entry program (main.ts, Node 22, stdlib only).
// It hands the app in: copies app/ and screenshots/ from beside this file
// into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, exactly as the
// gate rebuilds it. The app itself is plain static files under app/ —
// index.html plus its scripts, styles, fonts and sample photos — with no
// build step and no network request.
//
// Run it locally to check the handoff before entering:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's caps (reference/gate.json): the dossier text cap shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, more than 993 files in app/ or 48 MiB
// of app files, or a path under app/ over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
