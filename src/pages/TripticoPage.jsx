import React, { useEffect } from 'react';
// Estilos de Tailwind solo para esta página: la portada y EduOrbit traen los suyos
import estilosTailwind from '../index.css?inline';
import {
  ArrowLeft,
  FileText,
  Database,
  Plug,
  Users,
  Compass,
  Layers,
  Gauge,
  MessagesSquare,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

/**
 * DataOrbit en 1 minuto: un tríptico (tres paneles) que explica rápido qué
 * hacemos. No lleva logos de clientes (decisión de Vicente); esos viven en el
 * carrusel del home. En pantalla grande los paneles van lado a lado; en el
 * celular y en el PDF van uno bajo el otro, en una sola página del ancho de un
 * teléfono, para que se lea sin zoom y sin bordes grises.
 *
 * Todo el texto sale del home: misma promesa, mismas etapas y servicios.
 *
 * El PDF (public/dataorbit-en-1-minuto.pdf), que se abre en el navegador, se genera desde esta
 * página con `npm run pdf:triptico`, con el servidor de desarrollo corriendo.
 * Si cambia el contenido, hay que volver a generarlo.
 */

const PDF_PATH = '/dataorbit-en-1-minuto.pdf?v=6';

// Lo que la IA no resuelve sola (sección "Por qué ahora" del home)
const whyNow = [
  { title: 'Datos ordenados', caption: 'Sin ellos, la IA se equivoca con total seguridad.', icon: Database },
  { title: 'Conexión con tus sistemas', caption: 'Sin ella, la IA solo conversa.', icon: Plug },
  { title: 'Tu equipo a bordo', caption: 'Sin él, la IA queda instalada y nadie la usa.', icon: Users },
];

// Las mismas etapas y servicios del catálogo del home
const stages = [
  {
    num: '01',
    title: 'Entender',
    caption: 'Cómo trabaja tu equipo de verdad, y qué conviene resolver primero',
    icon: Compass,
    services: ['Diagnóstico y hoja de ruta de IA'],
  },
  {
    num: '02',
    title: 'Construir',
    caption: 'Los datos ordenados y la plataforma que la operación necesita',
    icon: Layers,
    services: ['Datos listos para IA', 'Plataformas a la medida'],
  },
  {
    num: '03',
    title: 'Operar y medir',
    caption: 'Que la IA se use todos los días, y que el impacto quede demostrado',
    icon: Gauge,
    services: ['Agentes conectados, con resguardos', 'Operación continua y adopción', 'Impacto medido'],
  },
];

// Versión corta de "Nos diferenciamos en" (sección ¿Por qué nosotros? del home)
const differentiators = [
  { title: 'Entendemos tu negocio antes de programar', text: 'El sistema se diseña sobre cómo trabaja tu equipo.', icon: MessagesSquare },
  { title: 'Tus datos quedan ordenados y son tuyos', text: 'Documentados y listos para lo que venga.', icon: Database },
  { title: 'La IA opera con resguardos', text: 'Qué ve, qué ejecuta sola y qué requiere aprobación.', icon: ShieldCheck },
  { title: 'Medimos el antes y el después', text: 'Con métricas acordadas, y respondemos por el resultado.', icon: Gauge },
];

const contact = [
  { icon: Mail, text: 'vicente@dataorbit.cl' },
  { icon: Phone, text: '+56 9 8452 1190' },
  { icon: MapPin, text: 'Santiago & Puerto Montt, Chile' },
  { icon: Globe, text: 'dataorbit.cl' },
];

/** Rótulo de panel: número y título. */
const PanelTag = ({ num, children }) => (
  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orbit-blue-glow">
    <span className="font-mono text-slate-500">{num}</span>
    {children}
    <span className="h-px flex-1 bg-gradient-to-r from-orbit-blue/40 to-transparent" />
  </p>
);

export const TripticoPage = () => {
  // Al abrir la página se parte desde arriba, salvo que se haya llegado a una sección con #
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: estilosTailwind }} />
    {/* Tipografía propia del tríptico (React la sube al <head>) */}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" precedence="default" />
    <div className="min-h-screen bg-[#05070D] text-white font-sans print:min-h-0 print:bg-[#070A12]">
      {/* Barra superior (no se imprime) */}
      <header className="print:hidden border-b border-white/5 bg-[#070A12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          {/* Enlace normal (recarga): la portada arranca su animación al cargar */}
          <a
            href="/"
            className="group inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-white transition hover:text-orbit-blue-glow sm:gap-2"
          >
            <ArrowLeft className="h-4 w-4 text-orbit-blue-glow transition-transform group-hover:-translate-x-1" />
            <span>Volver a</span>
            <img src="/logos/l_do_blanco_2.svg" alt="DataOrbit" className="h-4 w-auto sm:h-5" />
          </a>
          <a
            href={PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-orbit-blue to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50 sm:px-5 sm:text-sm"
          >
            <FileText className="h-4 w-4" />
            Abrir PDF
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 print:m-0 print:max-w-none print:p-0">
        <div className="mb-8 text-center print:hidden">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            DataOrbit en{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              1 minuto
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Lo esencial en tres paneles. Ábrelo en PDF para compartirlo.
          </p>
        </div>

        {/* La hoja: A4 horizontal con tres paneles */}
        <article className="print-triptico relative grid overflow-hidden rounded-3xl border border-white/10 bg-[#070A12] shadow-[0_40px_120px_-40px_rgba(37,99,235,0.55)] lg:aspect-[297/210] lg:grid-cols-3 print:rounded-none print:border-0 print:shadow-none">
          {/* Fondo técnico común a los tres paneles. Las manchas difuminadas no van en el
              PDF: el visor del iPhone las dibuja como cuadrados (ver .print-triptico en index.css) */}
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orbit-blue/25 blur-[110px] print:hidden" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orbit-accent/20 blur-[110px] print:hidden" />
          <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-500/15 blur-[110px] print:hidden" />

          {/* Panel 1: quiénes somos */}
          <section className="relative flex flex-col gap-6 p-7 lg:p-8">
            <img src="/logos/l_do_blanco_2.svg" alt="DataOrbit" className="h-8 w-auto self-start" />

            <div>
              <PanelTag num="01">Qué hacemos</PanelTag>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight lg:text-[28px]">
                Preparamos tu empresa para{' '}
                <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent print:bg-none print:text-sky-400">operar con IA</span>
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                Ordenamos tus datos, conectamos tus sistemas y construimos la plataforma que tu operación
                necesita. Te acompañamos hasta que la IA trabaja en el día a día, medimos el antes y el después,
                y respondemos por el resultado.
              </p>
            </div>

            <div className="mt-auto">
              <p className="mb-3 text-[11px] font-bold uppercase leading-snug tracking-widest text-slate-500">
                La IA ya escribe código. Lo difícil es que funcione en tu empresa. Para eso hace falta:
              </p>
              <ul className="space-y-2.5">
                {whyNow.map(({ title, caption, icon: Icon }) => (
                  <li key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-orbit-blue/30 bg-orbit-blue/15 text-orbit-blue-glow">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold leading-tight">{title}</span>
                      <span className="block text-[11px] text-slate-400">{caption}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Panel 2: cómo trabajamos */}
          <section className="relative flex flex-col border-t border-white/10 p-7 lg:border-l lg:border-t-0 lg:p-8">
            <PanelTag num="02">Cómo trabajamos</PanelTag>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
              Partimos conversando con el equipo, construimos sobre tus datos y nos quedamos hasta que la
              IA se usa en el día a día.
            </p>

            {/* Línea de tiempo: las tres etapas conectadas */}
            <ol className="relative mt-6 flex flex-1 flex-col justify-between gap-5">
              <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-orbit-blue-glow via-orbit-accent to-cyan-400" aria-hidden="true" />
              {stages.map(({ num, title, caption, icon: Icon, services }) => (
                <li key={num} className="relative flex gap-4">
                  <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-orbit-blue-glow/60 bg-[#0B1430] text-orbit-blue-glow shadow-[0_0_18px_rgba(96,165,250,0.45)] print:shadow-none">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-slate-500">{num}</p>
                    <p className="text-base font-extrabold leading-tight">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{caption}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {services.map((s) => (
                        <li key={s} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-medium text-slate-200">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Panel 3: por qué nosotros, EduOrbit y contacto */}
          <section className="relative flex flex-col gap-6 border-t border-white/10 p-7 lg:border-l lg:border-t-0 lg:p-8">
            <div>
              <PanelTag num="03">Por qué nosotros</PanelTag>
              <ul className="mt-4 space-y-3">
                {differentiators.map(({ title, text, icon: Icon }) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-orbit-blue/30 bg-orbit-blue/15 text-sky-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold leading-tight">{title}</span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-400">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-4">
              <img src="/logos/logo-eduorbit_blanco.png" alt="EduOrbit 360" className="h-6 w-auto" />
              <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
                Visión integral para una educación más eficiente: Business Intelligence para colegios e
                instituciones educativas.
              </p>
            </div>

            <div className="mt-auto">
              <p className="text-lg font-extrabold leading-tight">
                Conversemos{' '}
                <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent print:bg-none print:text-sky-400">20 minutos</span>
              </p>
              <ul className="mt-3 space-y-2">
                {contact.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-200">
                    <Icon className="h-4 w-4 flex-shrink-0 text-orbit-blue-glow" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </main>
    </div>
    </>
  );
};
