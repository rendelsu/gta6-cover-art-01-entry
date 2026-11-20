// A tiny static file server for trying the app locally (Node 22, stdlib only).
// Serves the app/ folder on http://localhost:8080 by default:
//   node serve.ts [--port 8080]
// It only ever serves files from inside app/, and sends the MIME types a browser
// needs for HTML, CSS, JS, images and fonts. A development convenience, nothing more.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const wanted = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((req, res) => {
  const raw = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const rel = normalize(raw === '/' ? '/index.html' : raw).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, rel);
  if (!file.startsWith(root + sep) && file !== root) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  if (!stat.isFile()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log('Vice Coast Cover Studio at http://localhost:' + port);
});
