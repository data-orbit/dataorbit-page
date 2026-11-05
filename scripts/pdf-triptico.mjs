// Genera public/dataorbit-en-1-minuto.pdf a partir de la página /en-1-minuto,
// imprimiéndola con Edge o Chrome en modo headless.
//
// El PDF es una sola página del ancho de un celular y tan alta como el
// tríptico (los tres paneles uno bajo el otro), para que en el teléfono llene
// la pantalla a lo ancho y se lea deslizando, sin zoom ni bordes grises.
//
// Requiere el servidor de desarrollo corriendo (npm run dev).
// Uso: npm run pdf:triptico                        (usa http://localhost:3000)
//      npm run pdf:triptico -- http://localhost:3002
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const base = process.argv[2] || 'http://localhost:3000';
const out = path.resolve('public/dataorbit-en-1-minuto.pdf');

// Ancho de la página en px CSS (un celular grande); el alto se mide
const PAGE_WIDTH = 420;
const PORT = 9333;

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const browserPath = candidates.find((p) => existsSync(p));
if (!browserPath) {
  console.error('No se encontró Edge ni Chrome. Indica la ruta con la variable CHROME_PATH.');
  process.exit(1);
}

const profile = mkdtempSync(path.join(os.tmpdir(), 'pdf-triptico-'));
const browser = spawn(
  browserPath,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Espera a que el navegador abra el puerto de depuración y devuelve la pestaña
async function getTarget() {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(200);
  }
  throw new Error('El navegador no respondió en el puerto de depuración.');
}

try {
  const target = await getTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));

  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: PAGE_WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await send('Page.navigate', { url: `${base}/en-1-minuto` });

  // Espera a que cargue el tríptico, sus fuentes y sus imágenes
  for (let i = 0; i < 50 && !(await evaluate("!!document.querySelector('.print-triptico')")); i++) await sleep(200);
  await evaluate(`(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; })));
  })()`);
  await sleep(500);

  const height = Math.ceil(await evaluate("document.querySelector('.print-triptico').getBoundingClientRect().height"));

  const { data } = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: false,
    paperWidth: PAGE_WIDTH / 96,
    paperHeight: height / 96,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    pageRanges: '1',
  });
  writeFileSync(out, Buffer.from(data, 'base64'));
  ws.close();
  console.log(`PDF generado (${PAGE_WIDTH} x ${height} px): ${out}`);
} finally {
  browser.kill();
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
