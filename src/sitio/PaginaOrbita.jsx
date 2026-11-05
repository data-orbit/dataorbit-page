import React, { useEffect } from 'react';

// Páginas del refresh «Puesta en órbita» (portada y EduOrbit 360).
//
// Cada página trae su marcado, sus estilos y su guion (src/sitio/<página>/). El
// marcado y los estilos se dibujan aquí, así el pre-render (scripts/prerender.mjs)
// los deja en el HTML y la página se ve antes de que cargue el JavaScript. Los
// estilos van dentro de la página y no en un CSS global: así los de una página no
// pisan a los de la otra ni al tríptico.
//
// El guion maneja el DOM por su cuenta (partículas WebGL, escenas, demostraciones,
// formulario). React no vuelve a tocar ese marcado después del primer dibujo, así
// que no hay choque. Entre páginas se navega con recarga completa (el telón), por
// lo que el guion corre una sola vez por carga; el control evita que corra dos veces
// en desarrollo, donde StrictMode monta los efectos dos veces.
const iniciadas = new Set();

export const PaginaOrbita = ({ nombre, marcado, estilos, iniciar }) => {
  useEffect(() => {
    if (iniciadas.has(nombre)) return;
    iniciadas.add(nombre);
    iniciar();
  }, [nombre, iniciar]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: estilos }} />
      <div className="pagina-orbita" data-pagina={nombre} dangerouslySetInnerHTML={{ __html: marcado }} />
    </>
  );
};
