// Pre-renderiza las páginas: deja su HTML ya armado dentro de dist/, para que el
// teléfono muestre el contenido sin esperar a que cargue el JavaScript.
//   /             → dist/index.html
//   /eduorbit     → dist/eduorbit.html
//   /en-1-minuto  → dist/en-1-minuto.html
// El .htaccess sirve /eduorbit y /en-1-minuto desde sus archivos. Las demás rutas
// usan dist/app.html (la página vacía de siempre).
//
// Se corre después de `vite build` y `vite build --ssr src/entry-server.jsx`
// (ver el script "build" de package.json).
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const shell = readFileSync(path.join(dist, 'index.html'), 'utf-8');
const placeholder = '<div id="root"></div>';
if (!shell.includes(placeholder)) {
  throw new Error(`No se encontró ${placeholder} en dist/index.html`);
}

// Título y descripción propios de cada página interior (el home usa los de index.html)
const PAGINAS = [
  { url: '/', archivo: 'index.html' },
  {
    url: '/eduorbit',
    archivo: 'eduorbit.html',
    titulo: 'EduOrbit 360 | DataOrbit',
    descripcion:
      'Plataforma centralizada de Business Intelligence para colegios e instituciones educativas. Integra datos académicos, asistencia, finanzas y matrícula en dashboards automatizados.',
  },
  {
    url: '/en-1-minuto',
    archivo: 'en-1-minuto.html',
    titulo: 'DataOrbit en 1 minuto',
    descripcion: 'Lo esencial de DataOrbit en tres paneles: qué hacemos, cómo trabajamos y por qué nosotros.',
  },
];

const conMetadatos = (html, { url, titulo, descripcion }) => {
  if (!titulo) return html;
  const reemplazar = (texto, patron, valor) => {
    if (!patron.test(texto)) throw new Error(`No se encontró ${patron} en dist/index.html`);
    return texto.replace(patron, valor);
  };
  let salida = reemplazar(html, /<title>[^<]*<\/title>/, `<title>${titulo}</title>`);
  for (const nombre of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    salida = reemplazar(salida, new RegExp(`(<meta ${nombre} content=")[^"]*"`), `$1${descripcion}"`);
  }
  for (const nombre of ['property="og:title"', 'name="twitter:title"']) {
    salida = reemplazar(salida, new RegExp(`(<meta ${nombre} content=")[^"]*"`), `$1${titulo}"`);
  }
  return reemplazar(salida, /(<meta property="og:url" content=")[^"]*"/, `$1https://dataorbit.cl${url}"`);
};

const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);

writeFileSync(path.join(dist, 'app.html'), shell);
for (const pagina of PAGINAS) {
  const html = await render(pagina.url);
  if (html.length < 2000) throw new Error(`${pagina.url} salió casi vacío (${html.length} caracteres)`);
  writeFileSync(path.join(dist, pagina.archivo), conMetadatos(shell, pagina).replace(placeholder, `<div id="root">${html}</div>`));
  console.log(`${pagina.url} pre-renderizado en ${pagina.archivo} (${Math.round(html.length / 1024)} KB de HTML)`);
}
rmSync('dist-ssr', { recursive: true, force: true });
console.log('app.html queda para las demás rutas');
