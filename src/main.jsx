import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Sin CSS global: cada página trae sus estilos (la portada y EduOrbit, los del
// refresh; el tríptico, los de Tailwind). Los saltos a secciones (#soluciones...)
// los maneja el guion de cada página.

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Las páginas llegan pre-renderizadas (index.html, eduorbit.html y en-1-minuto.html
// ya traen su HTML): React lo "hidrata", es decir, toma lo que ya está en pantalla y
// le agrega la interactividad. Las demás rutas llegan con app.html, que viene vacío,
// y se dibujan desde cero.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
