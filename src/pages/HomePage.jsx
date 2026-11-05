import React from 'react';
import { PaginaOrbita } from '../sitio/PaginaOrbita';
import marcado from '../sitio/portada/marcado.html?raw';
import estilos from '../sitio/portada/estilos.css?inline';
import { iniciar } from '../sitio/portada/guion.js';

export const HomePage = () => <PaginaOrbita nombre="portada" marcado={marcado} estilos={estilos} iniciar={iniciar} />;
