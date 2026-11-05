import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

// EduOrbit y el tríptico se descargan solo al entrar a ellos: así el home, que es
// lo que ve casi todo el mundo, carga menos código.
const EduOrbitPage = lazy(() => import('./pages/EduOrbitPage').then((m) => ({ default: m.EduOrbitPage })));
const TripticoPage = lazy(() => import('./pages/TripticoPage').then((m) => ({ default: m.TripticoPage })));

export function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0E0E10' }} />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/eduorbit" element={<EduOrbitPage />} />
        <Route path="/eduorbit-360" element={<EduOrbitPage />} />
        <Route path="/en-1-minuto" element={<TripticoPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
