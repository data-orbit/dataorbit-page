// Render del sitio fuera del navegador, al compilar. Lo usa scripts/prerender.mjs
// para dejar el HTML de cada página ya armado (home, EduOrbit y el tríptico).
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';

// A diferencia de renderToString, prerender espera a que carguen las páginas que
// App importa de forma diferida (EduOrbit, el tríptico): sin eso quedaban vacías.
export const render = async (url) => {
  const { prelude } = await prerenderToNodeStream(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );
  const partes = [];
  for await (const parte of prelude) partes.push(typeof parte === 'string' ? Buffer.from(parte) : parte);
  return Buffer.concat(partes).toString('utf-8');
};
