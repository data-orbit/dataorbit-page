import React from 'react';
import { PaginaOrbita } from '../sitio/PaginaOrbita';
import marcado from '../sitio/eduorbit/marcado.html?raw';
import estilos from '../sitio/eduorbit/estilos.css?inline';
import { iniciar } from '../sitio/eduorbit/guion.js';

export const EduOrbitPage = () => <PaginaOrbita nombre="eduorbit" marcado={marcado} estilos={estilos} iniciar={iniciar} />;
