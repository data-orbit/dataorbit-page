// Movimiento e interacción de la página (partículas WebGL, títulos, escenas,
// demostraciones, panel de contacto y telón). Portado del boceto «Puesta en órbita».
// Se llama una vez, cuando React ya dejó el marcado en pantalla.
export function iniciar() {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = document.documentElement;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactil = matchMedia('(hover: none)').matches;
  const movil = innerWidth < 860;
  const acotar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const curva = (t) => t * t * (3 - 2 * t);
  const mezclar = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const T0 = performance.now();

  // Los colores de las partículas salen de los mismos tokens del sistema de diseño
  const css = getComputedStyle(raiz);
  const rgb = (token) => {
    const h = css.getPropertyValue(token).trim().replace('#', '');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  };
  const COLOR = { senal: rgb('--do-blue-orbit'), claro: rgb('--do-surface'), blanco: rgb('--do-white'), noche: rgb('--do-night') };

  /* ---------- Palabras ---------- */
  const GLIFOS = '01/\\<>[]{}=+*#_';
  const vivos = new WeakMap();

  // Descifra de izquierda a derecha. Cada letra ocupa su ancho final, así los símbolos
  // (en Roboto Mono) cambian sin mover el texto; cambian cada 80 ms para que se lea calmo.
  function decodificar(el, texto, { dura = 1300 } = {}) {
    if (el.dataset.txt === undefined) el.dataset.txt = el.textContent;
    const final = texto ?? el.dataset.txt;
    cancelAnimationFrame(vivos.get(el));
    if (reducido) { el.textContent = final; return; }
    el.textContent = '';
    const celdas = [...final].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      el.append(s);
      return s;
    });
    // Las letras no reciben el puntero: si un foco vuelve a descifrar un botón entre presionar y soltar,
    // el clic sigue cayendo sobre el mismo elemento
    const anchos = celdas.map((s) => s.getBoundingClientRect().width);
    celdas.forEach((s, i) => { s.style.cssText = `display:inline-block;width:${anchos[i]}px;text-align:center;white-space:pre;pointer-events:none`; });
    const ini = performance.now(), n = final.length;
    let tic = -1;
    const paso = (t) => {
      const k = acotar((t - ini) / dura), ahora = Math.floor((t - ini) / 80);
      if (ahora !== tic) {
        tic = ahora;
        const listo = Math.floor(curva(k) * n);
        celdas.forEach((s, i) => {
          if (i < listo || final[i] === ' ') {
            if (s.className) { s.className = ''; s.textContent = final[i]; }
          } else {
            s.className = 'g';
            s.textContent = GLIFOS[(Math.random() * GLIFOS.length) | 0];
          }
        });
      }
      if (k < 1) vivos.set(el, requestAnimationFrame(paso));
      else el.textContent = final;
    };
    vivos.set(el, requestAnimationFrame(paso));
  }

  function escribir(el, texto, dura) {
    cancelAnimationFrame(vivos.get(el));
    if (reducido) { el.textContent = texto; return; }
    const ini = performance.now();
    el.textContent = '';
    const paso = (t) => {
      const k = acotar((t - ini) / dura);
      el.textContent = texto.slice(0, Math.round(k * texto.length));
      if (k < 1) vivos.set(el, requestAnimationFrame(paso));
    };
    vivos.set(el, requestAnimationFrame(paso));
  }

  // Separa un título en palabras para que aparezcan una tras otra
  function separar(el) {
    let i = 0;
    const recorrer = (nodo) => {
      [...nodo.childNodes].forEach((h) => {
        if (h.nodeType === 3) {
          const frag = document.createDocumentFragment();
          h.textContent.split(/(\s+)/).forEach((parte) => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.append(' '); return; }
            const s = document.createElement('span');
            s.className = 'pal';
            s.style.setProperty('--i', i);
            i += 1;
            s.textContent = parte;
            frag.append(s);
          });
          h.replaceWith(frag);
        } else if (h.nodeType === 1) recorrer(h);
      });
    };
    recorrer(el);
  }
  $$('.rv').forEach(separar);
  const verRv = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visto'); verRv.unobserve(e.target); }
  }), { threshold: 0.35 });
  $$('.rv').forEach((el) => (reducido ? el.classList.add('visto') : verRv.observe(el)));

  const verDec = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { decodificar(e.target, undefined, { dura: 1500 }); verDec.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('[data-dec]').forEach((el) => { el.dataset.txt = el.textContent; verDec.observe(el); });
  $$('[data-hov]').forEach((el) => {
    el.dataset.txt = el.textContent;
    el.addEventListener('pointerenter', () => decodificar(el, undefined, { dura: 900 }));
    el.addEventListener('focus', () => decodificar(el, undefined, { dura: 900 }));
  });

  /* ---------- Hero: «EduOrbit» se compila a Montserrat y «360» llega contando, como un dial ---------- */
  const h1 = $('.h1'), lineas = $$('.h1 .ln');
  $$('.h1 [data-c]').forEach((ln) => {
    const t = ln.textContent;
    ln.textContent = '';
    [...t].forEach((ch) => {
      const s = document.createElement('span');
      s.className = reducido ? 'c' : 'c cr';
      s.textContent = ch;
      ln.append(s);
    });
  });
  const celdas = $$('.h1 .c'), cifras = $$('.h1 .fuerte .c');
  const contar = () => {
    const ini = performance.now();
    const paso = (t) => {
      const k = acotar((t - ini) / 1600), v = String(Math.round(curva(k) * 360)).padStart(3, '0');
      cifras.forEach((c, i) => { c.textContent = v[i]; });
      if (k < 1) requestAnimationFrame(paso);
      else cifras.forEach((c, j) => setTimeout(() => c.classList.remove('cr'), j * 110));
    };
    requestAnimationFrame(paso);
  };
  // Los anchos se fijan antes para que nada salte mientras cada letra cambia de fuente
  const compilarHero = () => {
    if (reducido) { h1.classList.add('listo'); return; }
    celdas.forEach((c) => c.classList.remove('cr'));
    const anchos = celdas.map((c) => c.getBoundingClientRect().width);
    celdas.forEach((c, i) => { c.style.width = `${anchos[i]}px`; c.classList.add('cr'); });
    lineas.forEach((l, i) => setTimeout(() => {
      l.classList.add('compila');
      if (l.classList.contains('fuerte')) contar();
      else $$('.c', l).forEach((c, j) => setTimeout(() => c.classList.remove('cr'), j * 45));
    }, 400 + i * 600));
    setTimeout(() => { celdas.forEach((c) => { c.style.width = ''; }); h1.classList.add('listo'); }, 400 + lineas.length * 600 + 2000);
  };
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(compilarHero);
  if (!reducido) $$('.hero .key').forEach((k) => k.classList.add('dibuja'));
  if (!reducido && !tactil) {
    const finas = celdas.filter((c) => !c.closest('.fuerte'));
    let pendiente = false, px = 0, py = 0;
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY;
      if (pendiente || !h1.classList.contains('listo') || scrollY > innerHeight * 0.8) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        finas.forEach((c) => {
          const r = c.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
          c.style.setProperty('--w', Math.round(300 + 400 * Math.exp(-(d * d) / 30000)));
        });
      });
    }, { passive: true });
  }

  /* ---------- Piezas comunes de EduOrbit ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const tocar = (el) => el.classList.add('tocado');
  // Muestra un panel de la pila: todos ocupan la misma celda, así la página no salta al cambiar
  const mostrarEnPila = (paneles, i) => paneles.forEach((p, k) => {
    const ver = k === i;
    p.classList.toggle('fuera', !ver);
    p.inert = !ver;
    if (ver) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; }
  });
  // Escribe una línea sin mover nada: una copia invisible reserva su lugar mientras se escribe encima
  const tipeo = (el) => {
    if (el.dataset.txt === undefined) {
      el.dataset.txt = el.textContent;
      el.classList.add('tipeo');
      const res = document.createElement('span'), vis = document.createElement('span');
      res.className = 'res';
      res.textContent = el.dataset.txt;
      vis.textContent = el.dataset.txt;
      el.textContent = '';
      el.append(res, vis);
    }
    return el.lastElementChild;
  };
  const vaciar = (el) => { const v = tipeo(el); cancelAnimationFrame(vivos.get(v)); v.textContent = ''; };
  const tipear = (el) => {
    const v = tipeo(el), li = el.closest('li');
    if (li) { li.style.animation = 'none'; void li.offsetWidth; li.style.animation = ''; }
    escribir(v, el.dataset.txt, Math.min(1300, el.dataset.txt.length * 18));
  };
  // Recorrido que avanza solo mientras se ve, con su barra. Elegir una opción lo detiene;
  // con alPasar, el cursor encima muestra la opción y pausa el recorrido hasta que sale.
  function recorrido({ zona, opciones, dura, mostrar, barra, boton, alPasar = false }) {
    const total = opciones.length;
    let actual = 0, auto = !reducido, visible = false, encima = false, intervalo = null, primera = true;
    const ir = (i, animar) => { actual = i; mostrar(i, animar); };
    const correrBarra = () => {
      if (!barra) return;
      barra.style.transition = 'none';
      barra.style.transform = 'scaleX(0)';
      void barra.offsetWidth;
      if (!auto || encima || !visible) return;
      barra.style.transition = `transform ${dura}ms linear`;
      barra.style.transform = 'scaleX(1)';
    };
    const seguir = () => {
      clearInterval(intervalo);
      correrBarra();
      if (!auto || encima || !visible) return;
      intervalo = setInterval(() => { ir((actual + 1) % total, true); correrBarra(); }, dura);
    };
    const rotular = () => { if (boton) $('span', boton).textContent = auto ? 'Pausar recorrido' : 'Recorrer solo'; };
    opciones.forEach((o, i) => {
      o.addEventListener('click', () => { auto = false; rotular(); seguir(); ir(i, !reducido); });
      if (alPasar && !tactil) o.addEventListener('pointerenter', () => { if (i !== actual) ir(i, !reducido); });
    });
    if (alPasar && !tactil) {
      zona.addEventListener('pointerenter', () => { encima = true; seguir(); });
      zona.addEventListener('pointerleave', () => { encima = false; seguir(); });
    }
    boton?.addEventListener('click', () => {
      auto = !auto && !reducido;
      rotular();
      if (auto) ir((actual + 1) % total, true);
      seguir();
    });
    if (reducido && boton) boton.hidden = true;
    ir(0, false);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && primera) { primera = false; ir(0, !reducido); }
      seguir();
    }, { threshold: 0, rootMargin: '0px 0px -35% 0px' }).observe(zona);
  }

  /* ---------- 01 El problema: un diagnóstico que rota solo, con una escena por tema ---------- */
  const diag = $('#diag'), temas = $$('.diag-temas .nodo', diag), dps = $$('.dp', diag);
  if (tactil) $('#diag-nota').textContent = 'Toca cada tema para ver qué hay detrás.';
  // Tareas manuales: la planilla se llena celda por celda mientras corre el reloj
  const celdasIl = $('#il-celdas');
  for (let i = 0; i < 20; i += 1) {
    const r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('class', 'il-celda');
    r.setAttribute('x', 28 + (i % 5) * 27);
    r.setAttribute('y', 26 + Math.floor(i / 5) * 22);
    r.setAttribute('width', 22);
    r.setAttribute('height', 14);
    r.setAttribute('opacity', reducido && i < 12 ? '.7' : '.08');
    if (!reducido) {
      const a = document.createElementNS(SVGNS, 'animate'), f = (i / 20) * 0.8;
      a.setAttribute('attributeName', 'opacity');
      a.setAttribute('values', '.08;.08;.7;.7;.08');
      a.setAttribute('keyTimes', `0;${f.toFixed(3)};${(f + 0.02).toFixed(3)};.92;1`);
      a.setAttribute('dur', '8s');
      a.setAttribute('repeatCount', 'indefinite');
      r.append(a);
    }
    celdasIl.append(r);
  }
  let relojesDiag = [];
  recorrido({
    zona: diag, opciones: temas, dura: 7000, barra: $('#diag-barra'), boton: $('#diag-auto'), alPasar: true,
    mostrar: (i, animar) => {
      temas.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-pressed', String(k === i)); });
      mostrarEnPila(dps, i);
      relojesDiag.forEach(clearTimeout);
      relojesDiag = [];
      if (!animar) return;
      decodificar($('h3', dps[i]), undefined, { dura: 1100 });
      const lineasDiag = $$('.log li > span', dps[i]);
      lineasDiag.forEach(vaciar);
      lineasDiag.forEach((s, k) => relojesDiag.push(setTimeout(() => tipear(s), 450 + k * 650)));
    },
  });

  /* ---------- La pregunta: se enciende palabra por palabra con el scroll ---------- */
  const scrub = $('#scrub');
  [['¿Cuánto tiempo invierten en', false], ['generar reportes y consolidar datos?', true]].forEach(([txt, sig]) => txt.split(' ').forEach((w) => {
    const s = document.createElement('span');
    s.className = sig ? 'w sig' : 'w';
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    scrub.append(s, ' ');
  }));
  const palabras = $$('.w', scrub);

  /* ---------- 02 Nuestra solución: cuatro pasos encadenados ---------- */
  const cadena = $('#cadena'), nodosCad = $$('.cadena-nodo', cadena), cps = $$('.cp', cadena), hecho = $('#cad-hecho');
  // Cada paso lista los anteriores: se ve en qué se apoya
  const titulosCad = nodosCad.map((n) => $('.nodo-t', n).textContent);
  cps.forEach((p, i) => { $('.cadena-log', p).innerHTML = titulosCad.slice(0, i + 1).map((t) => `<li class="ok">${t}</li>`).join(''); });
  let pasoCad = 0, largos = [0, 0, 0, 0], largoTotal = 0, relojesCad = [];
  const pintarHecho = (animar) => {
    if (!animar) hecho.style.transition = 'none';
    hecho.style.strokeDashoffset = String(largoTotal - largos[pasoCad]);
    if (!animar) { void hecho.getBoundingClientRect(); hecho.style.transition = ''; }
  };
  // La línea pasa por el centro de cada paso; el tramo hecho llega hasta el paso elegido
  const trazarCadena = () => {
    const m = cadena.getBoundingClientRect();
    if (!m.width) return;
    const pts = nodosCad.map((n) => { const r = n.getBoundingClientRect(); return [r.left - m.left + r.width / 2, r.top - m.top + r.height / 2]; });
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    $('.cadena-lineas', cadena).setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    ['#cad-base', '#cad-hecho', '#cad-luz'].forEach((s) => $(s).setAttribute('d', d));
    largos = pts.map((p, i) => (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
    for (let i = 1; i < largos.length; i += 1) largos[i] += largos[i - 1];
    largoTotal = largos[largos.length - 1];
    hecho.style.strokeDasharray = `${largoTotal} ${largoTotal}`;
    pintarHecho(false);
  };
  recorrido({
    zona: cadena, opciones: nodosCad, dura: 7000, barra: $('#cad-barra'), boton: $('#cad-auto'),
    mostrar: (i, animar) => {
      pasoCad = i;
      nodosCad.forEach((n, k) => { n.classList.toggle('on', k === i); n.classList.toggle('previo', k < i); n.setAttribute('aria-pressed', String(k === i)); });
      mostrarEnPila(cps, i);
      pintarHecho(animar);
      relojesCad.forEach(clearTimeout);
      relojesCad = [];
      const lis = $$('.cadena-log li', cps[i]);
      if (!animar) { lis.forEach((li) => { li.className = 'ok'; }); return; }
      decodificar($('h3', cps[i]), undefined, { dura: 1100 });
      lis.forEach((li) => { li.className = ''; });
      let t = 500;
      lis.forEach((li) => {
        relojesCad.push(setTimeout(() => { li.className = 'run'; }, t));
        t += 700;
        relojesCad.push(setTimeout(() => { li.className = 'ok'; }, t));
      });
    },
  });
  new ResizeObserver(trazarCadena).observe(cadena);

  /* ---------- 03 ¿Cómo funciona?: el mapa se enciende por partes ---------- */
  const rotF = $('#rot-fuente'), FUENTES = ['plataforma escolar', 'ERP', 'sistema de RRHH', 'planilla Excel'];
  let fuente = 0;
  rotF.dataset.txt = rotF.textContent;
  if (!reducido) setInterval(() => {
    fuente = (fuente + 1) % FUENTES.length;
    rotF.dataset.txt = FUENTES[fuente];
    decodificar(rotF, FUENTES[fuente], { dura: 1200 });
  }, 3800);
  const flujo = $('#flujo'), svgF = $('#flujo-svg'), nucleo = $('#flujo-nucleo');
  const conexiones = $$('.fnodo', flujo).map((n) => ({ n, paso: +n.dataset.paso, entra: !!n.closest('.ent') }));
  conexiones.forEach((c) => {
    c.base = document.createElementNS(SVGNS, 'path');
    c.base.setAttribute('class', 'ml-base');
    c.luz = document.createElementNS(SVGNS, 'path');
    c.luz.setAttribute('class', 'fl-luz');
    c.luz.setAttribute('pathLength', '100');
    c.luz.style.setProperty('--c', c.n.style.getPropertyValue('--c'));
    svgF.append(c.base, c.luz);
  });
  // Curvas de cada fuente al núcleo y del núcleo a cada salida; en el celular el mapa va de arriba hacia abajo
  const trazarFlujo = () => {
    const m = flujo.getBoundingClientRect();
    if (!m.width) return;
    svgF.setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    const rel = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - m.left, r: r.right - m.left, t: r.top - m.top, b: r.bottom - m.top, x: r.left - m.left + r.width / 2, y: r.top - m.top + r.height / 2 }; };
    const k = rel(nucleo), vertical = getComputedStyle(flujo).gridTemplateColumns.split(' ').length < 3;
    conexiones.forEach((c) => {
      const p = rel(c.n);
      let d;
      if (vertical) d = c.entra ? `M${p.x} ${p.b}C${p.x} ${k.t - 30} ${k.x} ${p.b + 20} ${k.x} ${k.t}` : `M${k.x} ${k.b}C${k.x} ${p.t - 20} ${p.x} ${k.b + 30} ${p.x} ${p.t}`;
      else d = c.entra ? `M${p.r} ${p.y}C${p.r + 60} ${p.y} ${k.l - 60} ${k.y} ${k.l} ${k.y}` : `M${k.r} ${k.y}C${k.r + 60} ${k.y} ${p.l - 60} ${p.y} ${p.l} ${p.y}`;
      c.base.setAttribute('d', d);
      c.luz.setAttribute('d', d);
    });
  };
  new ResizeObserver(trazarFlujo).observe(flujo);
  const fpasos = $('#funciona-pasos'), botonesF = $$('.pasos-edu .nodo', fpasos), pps = $$('.pp', fpasos);
  let relojesF = [];
  recorrido({
    zona: fpasos, opciones: botonesF, dura: 6500, barra: $('#fp-barra'), boton: $('#fp-auto'), alPasar: true,
    mostrar: (i, animar) => {
      botonesF.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
      fpasos.style.setProperty('--c', botonesF[i].style.getPropertyValue('--c'));
      mostrarEnPila(pps, i);
      conexiones.forEach((c) => { const on = c.paso === i; c.luz.classList.toggle('on', on); c.n.classList.toggle('on', on); });
      nucleo.classList.toggle('on', i === 1);
      relojesF.forEach(clearTimeout);
      relojesF = [];
      if (!animar) return;
      const textos = $$('.log li > span:last-child', pps[i]);
      textos.forEach(vaciar);
      textos.forEach((s, k) => relojesF.push(setTimeout(() => tipear(s), 350 + k * 900)));
    },
  });

  /* ---------- 04 Ocho módulos en órbita ---------- */
  const orbita = $('#orbita-mod'), nodosM = $$('.om-nodo', orbita), omT = $('#om-t'), omD = $('#om-d'), omN = $('#om-num'), omL = $('#om-linea');
  let modulo = 0;
  // Los cuatro arcos del logo rodean el centro, con un hueco arriba y otro abajo (grados: 0 a la derecha, 90 abajo)
  const ARCOS = [['verde', -80, -2], ['morado', 2, 80], ['rojo', 100, 178], ['amarillo', 182, 260]];
  const arcosM = $('#om-arcos');
  arcosM.innerHTML = ARCOS.map(([c]) => `<path class="om-arco" style="--c:var(--edu-${c})"></path>`).join('');
  const lineaModulo = () => {
    const m = orbita.getBoundingClientRect();
    if (!m.width) return;
    const r = nodosM[modulo].getBoundingClientRect(), cx = m.width / 2, cy = m.height / 2;
    const R = parseFloat(getComputedStyle(orbita).getPropertyValue('--R')) || 250;
    const punto = (g) => `${(cx + R * Math.cos((g * Math.PI) / 180)).toFixed(1)} ${(cy + R * Math.sin((g * Math.PI) / 180)).toFixed(1)}`;
    $('.om-lineas', orbita).setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    $$('.om-arco', arcosM).forEach((p, k) => p.setAttribute('d', `M${punto(ARCOS[k][1])}A${R} ${R} 0 0 1 ${punto(ARCOS[k][2])}`));
    omL.style.setProperty('--c', nodosM[modulo].style.getPropertyValue('--c'));
    omL.setAttribute('d', `M${cx.toFixed(1)} ${cy.toFixed(1)}L${(r.left - m.left + r.width / 2).toFixed(1)} ${(r.top - m.top + r.height / 2).toFixed(1)}`);
  };
  recorrido({
    zona: orbita, opciones: nodosM, dura: 3200, alPasar: true,
    mostrar: (i, animar) => {
      modulo = i;
      nodosM.forEach((n, k) => { n.classList.toggle('on', k === i); n.setAttribute('aria-pressed', String(k === i)); });
      const t = $('.nodo-t', nodosM[i]).textContent;
      omN.textContent = `Módulo ${String(i + 1).padStart(2, '0')} / ${String(nodosM.length).padStart(2, '0')}`;
      omD.textContent = $('.om-d', nodosM[i]).textContent;
      omT.dataset.txt = t;
      if (animar) decodificar(omT, t, { dura: 900 });
      else omT.textContent = t;
      lineaModulo();
    },
  });
  new ResizeObserver(lineaModulo).observe(orbita);

  /* ---------- 05 Tablero de muestra: datos ficticios, filtros y módulos que se ordenan ---------- */
  // Asistencia (%) y matrícula por curso, por semestre. No corresponden a ningún colegio real.
  const CURSOS = [
    ['1°B', 'basica', [94, 92], [36, 36]], ['2°B', 'basica', [92, 91], [38, 37]], ['3°B', 'basica', [90, 89], [35, 35]],
    ['4°B', 'basica', [91, 88], [37, 37]], ['5°B', 'basica', [88, 86], [36, 35]], ['6°B', 'basica', [87, 84], [34, 34]],
    ['7°B', 'basica', [89, 87], [38, 38]], ['8°B', 'basica', [86, 83], [35, 34]], ['I°M', 'media', [85, 83], [40, 39]],
    ['II°M', 'media', [84, 80], [38, 37]], ['III°M', 'media', [82, 79], [36, 35]], ['IV°M', 'media', [86, 84], [34, 34]],
  ];
  const MESES = [['Mar', 'Abr', 'May', 'Jun', 'Jul'], ['Ago', 'Sep', 'Oct', 'Nov', 'Dic']];
  const FORMA_MES = [[1.8, 0.9, -0.4, -1.6, -0.7], [0.6, 1.2, -0.3, -0.8, -0.7]];
  const UMBRAL = 85;
  const demo = $('#panel-demo'), barrasC = $('#barras-cursos'), tend = $('#tendencia'), listaA = $('#alertas-cursos');
  const kAsis = $('#kpi-asis'), kMat = $('#kpi-mat'), kAl = $('#kpi-alertas');
  const nfDec = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), nfEnt = new Intl.NumberFormat('es-CL');
  let nivel = 'todos', periodo = 0, nivelPintado = '';
  const datosTablero = () => {
    const cursos = CURSOS.filter((c) => nivel === 'todos' || c[1] === nivel).map((c) => ({ n: c[0], att: c[2][periodo], mat: c[3][periodo] }));
    const mat = cursos.reduce((s, c) => s + c.mat, 0), prom = cursos.reduce((s, c) => s + c.att * c.mat, 0) / mat;
    return { cursos, mat, prom, serie: FORMA_MES[periodo].map((d) => prom + d), alertas: cursos.filter((c) => c.att < UMBRAL).sort((a, b) => a.att - b.att) };
  };
  const ponerKpi = (el, txt, animar) => {
    if (el.dataset.txt === txt) return;
    el.dataset.txt = txt;
    if (animar && !reducido) decodificar(el, txt, { dura: 700 });
    else { cancelAnimationFrame(vivos.get(el)); el.textContent = txt; }
  };
  // Barras en una escala de 70% a 100%: el umbral de 85% queda justo a la mitad
  const pintarBarras = (cursos) => {
    if (nivelPintado !== nivel) {
      nivelPintado = nivel;
      barrasC.innerHTML = cursos.map((c) => `<span class="bc" style="--h:0%"><i></i><b>${c.n}</b></span>`).join('');
      void barrasC.offsetWidth;
    }
    $$('.bc', barrasC).forEach((b, i) => {
      const c = cursos[i];
      b.dataset.v = `${c.att}%`;
      b.classList.toggle('baja', c.att < UMBRAL);
      b.style.setProperty('--h', `${Math.max(0, ((c.att - 70) / 30) * 100).toFixed(1)}%`);
    });
    barrasC.setAttribute('aria-label', `Asistencia por curso: ${cursos.map((c) => `${c.n} ${c.att}%`).join(', ')}`);
  };
  // Tendencia: la línea viaja de un filtro al otro en vez de saltar
  const TW = 280, TH = 120, TMIN = 78, TMAX = 96;
  const tz = $('.tz', tend), tl = $('.tl', tend), puntosT = $$('circle', tend), mesesT = $$('text', tend);
  const xT = (i) => 12 + (i * (TW - 24)) / 4, yT = (v) => TH - 10 - ((v - TMIN) / (TMAX - TMIN)) * (TH - 20);
  let serieActual = null, relojT = 0;
  const dibujarSerie = (s) => {
    const d = s.map((v, i) => `${i ? 'L' : 'M'}${xT(i).toFixed(1)},${yT(v).toFixed(1)}`).join(' ');
    tl.setAttribute('d', d);
    tz.setAttribute('d', `${d} L${xT(4)},${TH} L${xT(0)},${TH} Z`);
    puntosT.forEach((c, i) => { c.setAttribute('cx', xT(i).toFixed(1)); c.setAttribute('cy', yT(s[i]).toFixed(1)); });
  };
  const moverSerie = (destino) => {
    cancelAnimationFrame(relojT);
    if (!serieActual || reducido) { serieActual = destino; dibujarSerie(destino); return; }
    const desde = serieActual.slice(), ini = performance.now();
    const paso = (t) => {
      const k = curva(acotar((t - ini) / 700));
      serieActual = desde.map((v, i) => mezclar(v, destino[i], k));
      dibujarSerie(serieActual);
      if (k < 1) relojT = requestAnimationFrame(paso);
    };
    relojT = requestAnimationFrame(paso);
  };
  const pintarAlertas = (alertas) => {
    listaA.innerHTML = alertas.length
      ? alertas.map((c, i) => `<li style="animation-delay:${i * 60}ms"><span>${c.n}</span><b>${c.att}%</b></li>`).join('')
      : '<li class="sin"><span>Ningún curso bajo el umbral en este filtro.</span></li>';
  };
  const pintarTablero = (animar) => {
    const d = datosTablero();
    ponerKpi(kAsis, `${nfDec.format(d.prom)}%`, animar);
    ponerKpi(kMat, `${nfEnt.format(d.mat)} est.`, animar);
    ponerKpi(kAl, String(d.alertas.length), animar);
    kAl.parentElement.classList.toggle('alerta', d.alertas.length > 0);
    pintarBarras(d.cursos);
    moverSerie(d.serie);
    mesesT.forEach((t, i) => { t.textContent = MESES[periodo][i]; t.setAttribute('x', xT(i).toFixed(1)); });
    pintarAlertas(d.alertas);
  };
  const filtro = (attr, poner) => $$(`[${attr}]`, demo).forEach((b, _, todos) => b.addEventListener('click', () => {
    poner(b.getAttribute(attr));
    todos.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    pintarTablero(true);
  }));
  filtro('data-nivel', (v) => { nivel = v; });
  filtro('data-periodo', (v) => { periodo = +v; });
  pintarTablero(false);
  let tableroVisto = false;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || tableroVisto) return;
    tableroVisto = true;
    nivelPintado = '';
    pintarBarras(datosTablero().cursos);
    if (!reducido) [kAsis, kMat, kAl].forEach((b) => decodificar(b, b.dataset.txt, { dura: 900 }));
  }, { threshold: 0.3 }).observe(demo);

  // Los módulos se toman desde el agarre (así en el celular no se roba el scroll) o se mueven con las flechas.
  // Al soltar uno sobre otro de la misma fila, intercambian lugar; todo se desliza a su nueva posición.
  const filasT = $$('.pd-fila', demo), ordenInicial = filasT.map((f) => [...f.children]);
  const deslizar = (fila, cambiar) => {
    const hijos = [...fila.children], antes = new Map(hijos.map((el) => [el, el.getBoundingClientRect()]));
    cambiar();
    hijos.forEach((el) => {
      el.style.transform = '';
      const a = antes.get(el), b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if ((dx || dy) && !reducido) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
  };
  const intercambiar = (a, b) => deslizar(a.parentElement, () => {
    const marca = document.createComment('');
    a.replaceWith(marca);
    b.replaceWith(a);
    marca.replaceWith(b);
  });
  let arrastre = null;
  $$('.agarre', demo).forEach((h) => {
    const w = h.closest('.wd');
    h.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY };
      w.classList.add('agarrado');
      tocar(demo);
    });
    h.addEventListener('pointermove', (e) => {
      if (arrastre?.id !== e.pointerId) return;
      w.style.transform = `translate(${e.clientX - arrastre.x}px, ${e.clientY - arrastre.y}px) scale(1.02)`;
    });
    const soltar = (e) => {
      if (arrastre?.id !== e.pointerId) return;
      arrastre = null;
      w.classList.remove('agarrado');
      const otro = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest('.wd')).find((el) => el && el !== w && el.parentElement === w.parentElement);
      if (otro) intercambiar(w, otro);
      else deslizar(w.parentElement, () => {});
    };
    h.addEventListener('pointerup', soltar);
    h.addEventListener('pointercancel', soltar);
    h.addEventListener('keydown', (e) => {
      const paso = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!paso) return;
      e.preventDefault();
      const hermanos = [...w.parentElement.children], j = hermanos.indexOf(w) + paso;
      if (j < 0 || j >= hermanos.length) return;
      tocar(demo);
      intercambiar(w, hermanos[j]);
      h.focus();
    });
  });
  $('#restablecer').addEventListener('click', () => filasT.forEach((f, k) => deslizar(f, () => f.append(...ordenInicial[k]))));

  /* ---------- 06 Caso real: el presupuesto que se arma solo ---------- */
  const caso = $('#caso-edu'), entradas = $$('.esq-entrada', caso), partidas = $$('.esq-linea', caso), estadoP = $('#esq-estado'), btnGenerar = $('#generar');
  let relojesP = [];
  const ponerEstado = (t) => {
    estadoP.dataset.txt = t;
    if (reducido) estadoP.textContent = t;
    else decodificar(estadoP, t, { dura: 700 });
  };
  const reiniciarCaso = () => {
    relojesP.forEach(clearTimeout);
    relojesP = [];
    caso.classList.remove('procesando', 'listo');
    entradas.forEach((el) => el.classList.remove('on'));
    partidas.forEach((el) => el.classList.remove('on'));
    ponerEstado('En espera');
    btnGenerar.textContent = 'Generar presupuesto';
    btnGenerar.classList.remove('hecho');
  };
  const terminarCaso = () => {
    caso.classList.remove('procesando');
    caso.classList.add('listo');
    ponerEstado('Generado');
    btnGenerar.textContent = 'Generar de nuevo';
  };
  const generarCaso = () => {
    reiniciarCaso();
    btnGenerar.classList.add('hecho');
    if (reducido) { entradas.concat(partidas).forEach((el) => el.classList.add('on')); terminarCaso(); return; }
    let t = 200;
    entradas.forEach((el) => { relojesP.push(setTimeout(() => el.classList.add('on'), t)); t += 260; });
    t += 300;
    relojesP.push(setTimeout(() => { caso.classList.add('procesando'); ponerEstado('Generando'); }, t));
    partidas.forEach((el) => { t += 650; relojesP.push(setTimeout(() => el.classList.add('on'), t)); });
    relojesP.push(setTimeout(terminarCaso, t + 900));
  };
  btnGenerar.addEventListener('click', () => { tocar(caso); generarCaso(); });
  $('#caso-reinicio').addEventListener('click', () => { tocar(caso); reiniciarCaso(); });
  let casoVisto = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !casoVisto) { casoVisto = true; generarCaso(); }
  }, { threshold: 0.4 }).observe(caso);

  /* ---------- Tipografía cinética ---------- */
  const cintas = $$('.cinta');
  cintas.forEach((c) => {
    const pal = c.dataset.txt.split(' ');
    c.innerHTML = Array.from({ length: 4 }, () => pal.map((w) => `<span class="cw">${w}</span>`).join(' ')).join(' ');
  });
  const palabrasCinta = cintas.map((c) => $$('.cw', c));
  const secCinetica = $('#cinetica');
  let cineticaVisible = false;
  new IntersectionObserver(([e]) => { cineticaVisible = e.isIntersecting; }, { rootMargin: '120px 0px' }).observe(secCinetica);
  // Cada cinta repite su texto 4 veces: se mide el largo de una repetición para que el bucle no se note
  const VEL_CINTA = 45; // px por segundo
  let tramos = [];
  const medirCintas = () => { tramos = cintas.map((c) => c.scrollWidth / 4); };
  medirCintas();
  addEventListener('resize', medirCintas);
  document.fonts?.ready.then(medirCintas);

  /* ---------- Botones ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function prepararLlaves(raizLlaves = document) {
    $$('.key', raizLlaves).forEach((b) => {
      if (b.dataset.lista) return;
      b.dataset.lista = '1';
      const c = parseFloat(getComputedStyle(b).getPropertyValue('--c')) || 12;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'marco');
      svg.setAttribute('aria-hidden', 'true');
      const base = document.createElementNS(NS, 'path'), orb = document.createElementNS(NS, 'path');
      base.setAttribute('class', 'base');
      orb.setAttribute('class', 'orb');
      base.setAttribute('pathLength', '100');
      orb.setAttribute('pathLength', '100');
      svg.append(base, orb);
      b.append(svg);
      const trazar = () => {
        const w = b.offsetWidth, h = b.offsetHeight;
        const d = `M.5 .5H${w - c}L${w - 0.5} ${c}V${h - 0.5}H${c}L.5 ${h - c}Z`;
        base.setAttribute('d', d);
        orb.setAttribute('d', d);
      };
      trazar();
      new ResizeObserver(trazar).observe(b);

      const txt = $('.key-txt', b), hora = $('.key-time', b);
      const original = hora?.textContent;
      let reloj = null;
      const entrar = (e) => {
        const r = b.getBoundingClientRect();
        if (e?.clientX) { b.style.setProperty('--x', `${e.clientX - r.left}px`); b.style.setProperty('--y', `${e.clientY - r.top}px`); }
        if (reducido || b.disabled) return;
        orb.getAnimations()[0]?.updatePlaybackRate(3.5);
        txt.dataset.txt = txt.dataset.txt || txt.textContent;
        decodificar(txt, undefined, { dura: 900 });
        if (hora && original === '20:00' && !reloj) {
          let s = 1200;
          reloj = setInterval(() => {
            s -= 1;
            hora.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
          }, 1000);
        }
      };
      const salir = () => {
        orb.getAnimations()[0]?.updatePlaybackRate(1);
        clearInterval(reloj);
        reloj = null;
        if (hora && !b.disabled) hora.textContent = original;
        b.style.transform = '';
      };
      b.addEventListener('pointerenter', entrar);
      b.addEventListener('focus', entrar);
      b.addEventListener('pointerleave', salir);
      b.addEventListener('blur', salir);
      if (!tactil && !reducido) b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.06}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
      });
    });
  }
  prepararLlaves();

  /* ---------- Navegación y panel ---------- */
  const irA = (el) => el.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
  const subir = () => scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
  const secciones = $$('[data-nombre]');
  const rail = $('#rail'), pt = $('#pt');
  secciones.forEach((s) => {
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.className = 'label';
    a.innerHTML = `<span>${s.dataset.nombre}</span>`;
    rail.append(a);
  });
  const marcas = $$('a', rail);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const destino = document.getElementById(a.getAttribute('href').slice(1));
    if (destino?.id === 'cierre') scrollTo({ top: $('#fin-w').getBoundingClientRect().top + scrollY + innerHeight, behavior: reducido ? 'auto' : 'smooth' });
    else if (destino?.id === 'inicio') subir();
    else if (destino) irA(destino);
  });
  $('#arriba').addEventListener('click', subir);
  $('#arriba2').addEventListener('click', subir);
  $('#anio').textContent = new Date().getFullYear();

  const panel = $('#panel'), fuera = [$('#main'), $('#bar'), $('#rail'), $('#dock'), $('#fin-w'), $('#pie')];
  let origen = null;
  const abrir = (e) => {
    origen = e.currentTarget;
    const r = origen.getBoundingClientRect(), ancho = Math.min(520, innerWidth), p = innerWidth - ancho;
    const ox = r.left + r.width / 2 - p, oy = r.top + r.height / 2;
    panel.style.setProperty('--ox', `${ox}px`);
    panel.style.setProperty('--oy', `${oy}px`);
    // El círculo llega hasta la esquina más lejana del panel: se abre completo aunque el botón quede lejos
    panel.style.setProperty('--or', `${Math.ceil(Math.max(Math.hypot(ox, oy), Math.hypot(ancho - ox, oy), Math.hypot(ox, innerHeight - oy), Math.hypot(ancho - ox, innerHeight - oy)))}px`);
    panel.hidden = false;
    void panel.offsetWidth;
    panel.classList.add('open');
    fuera.forEach((el) => { el.inert = true; });
    $('#f-nombre').focus({ preventScroll: true });
  };
  const cerrar = () => {
    panel.classList.remove('open');
    fuera.forEach((el) => { el.inert = false; });
    setTimeout(() => { if (!panel.classList.contains('open')) panel.hidden = true; }, reducido ? 0 : 850);
    origen?.focus({ preventScroll: true });
  };
  $$('[data-panel]').forEach((b) => b.addEventListener('click', abrir));
  // Llegando con #contacto en la dirección: el panel de contacto parte abierto
  if (location.hash === '#contacto') abrir({ currentTarget: $('#dock [data-panel]') });
  $('#cerrar').addEventListener('click', cerrar);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) cerrar(); });
  // Mientras responde /api/contacto.php, el isotipo rebota en el botón
  const CARGA = '<span class="carga" aria-hidden="true"><span class="carga-bola"><svg viewBox="0 0 77.1 77.1"><circle class="pupila" cx="52.6" cy="25" r="11.8"></circle><use href="#isotipo"></use></svg></span><span class="carga-sombra"></span></span>';
  const enviar = $('#form [type="submit"]'), txtEnviar = $('.key-txt', enviar), horaEnviar = $('.key-time', enviar);
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (enviar.disabled) return;
    const original = txtEnviar.dataset.txt || txtEnviar.textContent;
    enviar.disabled = true;
    cancelAnimationFrame(vivos.get(txtEnviar));
    txtEnviar.textContent = 'Enviando…';
    horaEnviar.classList.add('con-carga');
    horaEnviar.insertAdjacentHTML('beforeend', CARGA);
    $('#aviso').textContent = '';
    const datos = Object.fromEntries(new FormData($('#form')));
    const terminar = (mensaje, ok) => {
      enviar.disabled = false;
      txtEnviar.textContent = original;
      horaEnviar.classList.remove('con-carga');
      $('.carga', horaEnviar)?.remove();
      $('#aviso').textContent = mensaje;
      if (ok) $('#form').reset();
    };
    // Solo se da por enviado si el servidor lo confirma. Una respuesta que no es
    // JSON (por ejemplo, si el hosting no ejecuta el PHP) cuenta como error.
    fetch('/api/contacto.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos),
    })
      .then((r) => r.json().catch(() => null).then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d?.success) terminar("¡Solicitud para colegio recibida con éxito! Un especialista de EduOrbit 360 te contactará a la brevedad.", true);
        else terminar(d?.error || 'No se pudo enviar el mensaje. Inténtalo de nuevo.', false);
      })
      .catch(() => terminar('Error de conexión. Puedes escribirnos directamente a vicente@dataorbit.cl o al +56 9 8452 1190', false));
  });

  /* ---------- Cambio de página: la O se cierra sobre el enlace y se abre en la otra página ---------- */
  const telon = $('#telon');
  if (raiz.classList.contains('telon-cubre')) { telon.classList.add('quieto', 'cubre'); raiz.classList.remove('telon-cubre'); }
  try {
    // Llegando desde la otra página: el isotipo rebota hasta que la página y sus fuentes están listas
    if (sessionStorage.getItem('do-telon')) {
      sessionStorage.removeItem('do-telon');
      const abrirTelon = () => requestAnimationFrame(() => requestAnimationFrame(() => telon.classList.remove('quieto', 'cubre')));
      Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]).then(abrirTelon);
    }
  } catch (e) { telon.classList.remove('quieto', 'cubre'); }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-telon]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    try { sessionStorage.setItem('do-telon', '1'); } catch (err) { /* sin almacenamiento: igual se cambia de página */ }
    if (reducido) { location.href = a.href; return; }
    const r = a.getBoundingClientRect();
    telon.style.setProperty('--tx', `${e.clientX || r.left + r.width / 2}px`);
    telon.style.setProperty('--ty', `${e.clientY || r.top + r.height / 2}px`);
    telon.classList.add('cubre');
    setTimeout(() => { location.href = a.href; }, 650);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) telon.classList.remove('quieto', 'cubre'); });

  /* ---------- Partículas ---------- */
  const N = movil ? 14000 : 42000;
  const KB = movil ? 520 : 1400, KT = 150, KM = 110, M = KB + KT + KM;
  const azar = Math.random;
  const gauss = () => (azar() + azar() + azar() + azar() - 2) / 1.1;
  // Centro y radio del agujero de la O, medidos del logo del sistema de diseño
  const AGUJERO = [0.3646, 0.3513];
  let dibujar = 0, pintarGL = null;

  const generar = {
    // Arranque: una espiral que gira y se condensa en la O
    espiral(a) {
      for (let i = 0; i < N; i += 1) {
        const r = 0.15 + 2.1 * Math.sqrt(azar());
        const ang = ((i % 3) / 3) * TAU + r * 2.4 + gauss() * 0.22;
        a.set([Math.cos(ang) * r, Math.sin(ang) * r * 0.9, gauss() * 0.08], i * 3);
      }
    },
    // La O del logo, con su agujero
    logo(a) {
      for (let i = 0; i < N; i += 1) {
        let x, y;
        do { x = 2 * azar() - 1; y = 2 * azar() - 1; } while (x * x + y * y > 1 || (x - AGUJERO[0]) ** 2 + (y - AGUJERO[1]) ** 2 < 0.0907);
        a.set([x, y, (azar() - 0.5) * 0.2 * Math.sqrt(Math.max(0, 1 - x * x - y * y))], i * 3);
      }
    },
    dispersos(a) {
      const nubes = Array.from({ length: 9 }, () => [(azar() - 0.5) * 5, (azar() - 0.5) * 3, (azar() - 0.5) * 2]);
      for (let i = 0; i < N; i += 1) {
        const c = nubes[i % 9], e = 0.22 + (i % 7) * 0.09;
        a.set([c[0] + gauss() * e, c[1] + gauss() * e, c[2] + gauss() * e], i * 3);
      }
    },
    cumulos(a) {
      for (let i = 0; i < N; i += 1) {
        const ang = ((i % 5) / 5) * TAU;
        a.set([Math.cos(ang) * 1.05 + gauss() * 0.14, Math.sin(ang) * 1.05 + gauss() * 0.14, gauss() * 0.14], i * 3);
      }
    },
    // Construir: 27 bloques con aristas marcadas, de abajo hacia arriba
    cubo(a) {
      const lado = 0.5, paso = 0.62;
      for (let i = 0; i < N; i += 1) {
        const b = i % 27, bx = b % 3, bz = Math.floor(b / 3) % 3, by = Math.floor(b / 9);
        const ox = (bx - 1) * paso - lado / 2, oy = (by - 1) * paso - lado / 2, oz = (bz - 1) * paso - lado / 2;
        let x, y, z;
        if (azar() < 0.8) {
          const e = (azar() * 12) | 0, t = azar(), u = e & 1, v = (e >> 1) & 1;
          if (e < 4) { x = t; y = u; z = v; } else if (e < 8) { x = u; y = t; z = v; } else { x = u; y = v; z = t; }
        } else {
          const f = (azar() * 6) | 0, s = azar(), t = azar(), l = f & 1;
          if (f < 2) { x = l; y = s; z = t; } else if (f < 4) { x = s; y = l; z = t; } else { x = s; y = t; z = l; }
        }
        a.set([ox + x * lado, oy + y * lado, oz + z * lado], i * 3);
      }
    },
    // Operar y medir: órbitas en marcha dentro de un dial graduado que no se mueve
    dial(a) {
      for (let i = 0; i < N; i += 1) {
        const g = i % 10, j = Math.floor(i / 10);
        if (g >= 7) {
          const marca = j % 72, mayor = marca % 6 === 0, ang = (marca / 72) * TAU, r0 = mayor ? 1.46 : 1.55;
          const r = r0 + azar() * (1.68 - r0);
          a.set([Math.cos(ang) * r, Math.sin(ang) * r, 0], i * 3);
        } else if (g === 6) {
          const ang = azar() * TAU;
          a.set([Math.cos(ang) * 1.76, Math.sin(ang) * 1.76, 0], i * 3);
        } else if (g === 0 && j % 3 === 0) {
          a.set([gauss() * 0.09, gauss() * 0.09, gauss() * 0.09], i * 3);
        } else {
          const r = 0.36 + (j % 5) * 0.22, ang = azar() * TAU;
          a.set([Math.cos(ang) * r, Math.sin(ang) * r, (azar() - 0.5) * 0.02], i * 3);
        }
      }
    },
    // EduOrbit 360: el símbolo del logo en 3D. Un globo de paralelos y meridianos cada 15° y, alrededor,
    // los cuatro arcos: amarillo arriba a la izquierda, rojo abajo a la izquierda, verde arriba a la derecha
    // y morado abajo a la derecha (con la cámara inclinada, lo de atrás queda arriba en pantalla)
    esfera(a) {
      const R = 1.02, INICIO = [Math.PI + 0.05, Math.PI - 1.25, TAU - 1.25, 0.05];
      for (let i = 0; i < N; i += 1) {
        const g = i % 10, j = (i / 10) | 0, t = azar() * TAU;
        if (g < 4) {
          const lat = ((j % 9) - 4) * (Math.PI / 10);
          a.set([Math.cos(lat) * Math.cos(t) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(t) * R], i * 3);
        } else if (g < 8) {
          const lon = (j % 12) * (Math.PI / 12);
          a.set([Math.sin(t) * Math.cos(lon) * R, Math.cos(t) * R, Math.sin(t) * Math.sin(lon) * R], i * 3);
        } else {
          // Media luna: gruesa al centro del arco y en punta en los extremos
          const u = azar(), ang = INICIO[j % 4] + u * 1.2, r = 1.33 + azar() * 0.2 * Math.sin(Math.PI * u);
          a.set([Math.cos(ang) * r, gauss() * 0.02, Math.sin(ang) * r], i * 3);
        }
      }
    },
    // Todo en un solo lugar: una sola esfera, llena y con su borde marcado
    uno(a) {
      for (let i = 0; i < N; i += 1) {
        const u = 2 * azar() - 1, t = azar() * TAU, s = Math.sqrt(1 - u * u);
        const r = i % 3 ? 0.78 * Math.cbrt(azar()) : 0.78;
        a.set([s * Math.cos(t) * r, u * r, s * Math.sin(t) * r], i * 3);
      }
    },
  };
  // EduOrbit no usa los cúmulos ni el cubo de la portada
  delete generar.cumulos;
  delete generar.cubo;

  // Satélite (el punto del logo), su estela y la aguja del dial: posiciones que cambian en cada cuadro
  const bola = Array.from({ length: KB }, () => {
    let x, y;
    do { x = 2 * azar() - 1; y = 2 * azar() - 1; } while (x * x + y * y > 1);
    return [x, y, azar() - 0.5, azar()];
  });
  const posX = new Float32Array(M * 3), semX = new Float32Array(M * 4);
  const orbitaSat = (th) => [1.42 * Math.cos(th), 0.12 + 1.42 * 0.16 * Math.sin(th), 1.42 * Math.sin(th)];
  function calcularExtras(sat, casa, dial, barrido, th) {
    const o = orbitaSat(th);
    const cx = mezclar(o[0], AGUJERO[0], casa), cy = mezclar(o[1], AGUJERO[1], casa), cz = mezclar(o[2], 0, casa);
    const rad = mezclar(0.075, 0.3, casa), tras = mezclar(cz < -0.15 ? 0.4 : 1, 1, casa);
    for (let i = 0; i < KB; i += 1) {
      const b = bola[i];
      posX[i * 3] = cx + b[0] * rad; posX[i * 3 + 1] = cy + b[1] * rad; posX[i * 3 + 2] = cz + b[2] * rad * 0.4;
      semX[i * 4 + 1] = sat * tras * (0.7 + 0.5 * b[3]); semX[i * 4 + 2] = 0.9; semX[i * 4 + 3] = 0.4 + b[3] * 0.7;
    }
    for (let k = 0; k < KT; k += 1) {
      const p = orbitaSat(th - (k + 1) * 0.02), f = 1 - k / KT, j = KB + k;
      posX[j * 3] = p[0]; posX[j * 3 + 1] = p[1]; posX[j * 3 + 2] = p[2];
      semX[j * 4 + 1] = sat * (1 - casa) * f * f * (p[2] < -0.15 ? 0.4 : 1) * 1.2; semX[j * 4 + 2] = 0.9; semX[j * 4 + 3] = 0.5 + f * 1.1;
    }
    for (let k = 0; k < KM; k += 1) {
      const r = 0.05 + (k / (KM - 1)) * 1.7, j = KB + KT + k;
      posX[j * 3] = Math.cos(barrido) * r; posX[j * 3 + 1] = Math.sin(barrido) * r; posX[j * 3 + 2] = 0;
      semX[j * 4 + 1] = dial * 0.85; semX[j * 4 + 2] = 0.5; semX[j * 4 + 3] = k === KM - 1 ? 3 : 0.6;
    }
  }

  // Vista de las figuras: ASCII o puntos (la elección queda en este navegador)
  const vista = { ascii: true };
  try { vista.ascii = localStorage.getItem('do-vista') !== 'puntos'; } catch (e) { /* sin almacenamiento: queda ASCII */ }
  let redibujar = false;
  const btnVista = $('#vista');
  const rotularVista = () => {
    btnVista.textContent = vista.ascii ? 'ASCII' : 'Puntos';
    btnVista.setAttribute('aria-pressed', String(vista.ascii));
    btnVista.setAttribute('aria-label', vista.ascii ? 'Figuras en ASCII. Cambiar a puntos' : 'Figuras en puntos. Cambiar a ASCII');
  };
  btnVista.addEventListener('click', () => {
    vista.ascii = !vista.ascii;
    try { localStorage.setItem('do-vista', vista.ascii ? 'ascii' : 'puntos'); } catch (e) { /* sin almacenamiento */ }
    rotularVista();
    redibujar = true;
  });
  rotularVista();

  const lienzo = $('#gl');
  try {
    const gl = lienzo.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('Sin WebGL2');
    const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aA;
layout(location=1) in vec3 aB;
layout(location=2) in vec4 aS;
layout(location=3) in vec2 aK;
uniform float uMix,uT,uAsp,uFase,uOrb,uS,uPx,uAlpha,uCuboA,uCuboB,uDial,uMarcas,uBarrido,uFijo,uEje,uEdu;
uniform vec2 uRot,uShift,uM;
out float vL; out float vH; out float vK; out float vCubo; out float vBrillo; out float vArco; out float vEdu;
const float PI=3.14159265;
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
void main(){
  float orden=max(uCuboA,uCuboB);
  float k=uCuboB>.5?aK.x:1.-aK.x;
  float d=mix(aS.x*.4,k*.86,orden);
  float m=smoothstep(d,d+mix(.6,.14,orden),uMix);
  vec3 p=mix(aA,aB,m);
  float arco=sin(m*PI);
  p+=(aS.yzw-.5)*arco*.8*(1.-orden);
  if(uCuboB>.5){
    vec3 arriba=aB+vec3(0.,.85,0.);
    p=mix(mix(aA,arriba,smoothstep(0.,.6,m)),aB,smoothstep(.6,1.,m));
  }
  float brillo=0.;
  float r=length(p.xy);
  float a=uOrb*(1.-aK.y*uMarcas)*uFase*.24/(r+.3);
  float c=cos(a),s=sin(a);
  p.xy=mat2(c,s,-s,c)*p.xy;
  if(uFijo<.5){
    p+=.008*vec3(sin(uT*.5+aS.y*50.),cos(uT*.4+aS.z*50.),sin(uT*.35+aS.w*50.));
    brillo=uDial*exp(-mod(uBarrido-atan(p.y,p.x),2.*PI)*2.2);
  }
  float enAnillo=step(.1,aK.x);
  p=ry(rx(ry(p,uEje*(1.-enAnillo))*uS,uRot.x),uRot.y);
  float w=1./(1.-p.z*.34);
  vec2 q=p.xy*w;
  q.x/=uAsp;
  q+=uShift;
  if(uFijo<.5){
    vec2 dm=(q-uM)*vec2(uAsp,1.);
    float l=length(dm)+.0001;
    q+=(dm/l)*exp(-l*l*10.)*.08/vec2(uAsp,1.);
  }
  gl_Position=vec4(q,0.,1.);
  float llega=uCuboB*smoothstep(.7,.97,m)*(1.-smoothstep(.97,1.,m));
  gl_PointSize=uPx*(.75+aS.w*1.25)*w*(1.+llega*.8);
  vL=clamp(.5+p.z*.55,.14,1.)*uAlpha*mix(.5+.5*aS.y,aS.y,uFijo)*(1.+llega*1.5+brillo*1.6+uEdu*enAnillo*1.2);
  vH=aS.z; vK=aK.x; vCubo=uCuboB*m+uCuboA*(1.-m); vBrillo=brillo; vArco=aK.x; vEdu=uEdu*enAnillo;
}`;
    const FS = `#version 300 es
precision mediump float;
uniform vec3 uSenal,uClaro,uBlanco,uE1,uE2,uE3,uE4;
uniform float uGan;
in float vL; in float vH; in float vK; in float vCubo; in float vBrillo; in float vArco; in float vEdu;
out vec4 o;
void main(){
  vec2 c=gl_PointCoord-.5;
  float r=dot(c,c);
  if(r>.25)discard;
  float a=smoothstep(.25,.05,r)*min(vL,1.6);
  vec3 col=mix(uSenal,uClaro,step(.8,vH));
  col=mix(col,mix(uClaro,uSenal,smoothstep(.25,.8,vK)),clamp(vCubo,0.,1.));
  col=mix(col,uBlanco,clamp(vBrillo,0.,1.)*.55);
  col=mix(col,vArco<.375?uE1:vArco<.625?uE2:vArco<.875?uE3:uE4,clamp(vEdu,0.,1.));
  o=vec4(col*a*uGan,min(a*uGan,1.));
}`;
    const sombra = (tipo, src) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sombra(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sombra(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const U = {};
    ['uMix', 'uT', 'uAsp', 'uFase', 'uOrb', 'uS', 'uPx', 'uAlpha', 'uCuboA', 'uCuboB', 'uDial', 'uMarcas', 'uBarrido', 'uFijo', 'uEje', 'uEdu', 'uRot', 'uShift', 'uM', 'uSenal', 'uClaro', 'uBlanco', 'uE1', 'uE2', 'uE3', 'uE4', 'uGan'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform3fv(U.uSenal, COLOR.senal);
    gl.uniform3fv(U.uClaro, COLOR.claro);
    gl.uniform3fv(U.uBlanco, COLOR.blanco);
    // Los cuatro arcos del logo de EduOrbit, desde los tokens de la página
    ['--edu-amarillo', '--edu-rojo', '--edu-verde', '--edu-morado'].forEach((t, i) => gl.uniform3fv(U['uE' + (i + 1)], rgb(t)));

    const buffer = (datos, uso = gl.STATIC_DRAW) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, datos, uso);
      return b;
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const formas = {};
    Object.keys(generar).forEach((k) => {
      const a = new Float32Array(N * 3);
      generar[k](a);
      formas[k] = buffer(a);
    });
    const semillas = new Float32Array(N * 4);
    for (let i = 0; i < N * 4; i += 1) semillas[i] = azar();
    buffer(semillas);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    const claves = new Float32Array(N * 2);
    for (let i = 0; i < N; i += 1) { claves[i * 2] = i % 10 >= 8 ? ((((i / 10) | 0) % 4) + 1) / 4 : 0; claves[i * 2 + 1] = i % 10 >= 7 ? 1 : 0; }
    buffer(claves);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);

    const vaoX = gl.createVertexArray();
    gl.bindVertexArray(vaoX);
    const bufXP = buffer(posX, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    const bufXS = buffer(semX, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    const clavesX = new Float32Array(M * 2);
    for (let i = KB + KT; i < M; i += 1) clavesX[i * 2 + 1] = 1;
    buffer(clavesX);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

    let unido = '';
    const unir = (a, b) => {
      const id = a + '|' + b;
      if (id === unido) return;
      unido = id;
      gl.bindBuffer(gl.ARRAY_BUFFER, formas[a]);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, formas[b]);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    dibujar = N;

    // Vista ASCII: las partículas se dibujan en una grilla chica, una celda por carácter, y una
    // segunda pasada pone en cada celda el carácter de Roboto Mono que corresponde a su densidad.
    const RAMPA = ' .·:-=+*10#@';
    const VSQ = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
    const FSQ = `#version 300 es
precision highp float;
uniform sampler2D uEscena,uGlifos;
uniform vec2 uCelda;
uniform float uNG;
uniform vec3 uFondo;
out vec4 o;
void main(){
  vec2 p=gl_FragCoord.xy;
  vec4 e=texelFetch(uEscena,ivec2(floor(p/uCelda)),0);
  float a=pow(clamp(e.a,0.,1.),.55);
  float i=floor(a*(uNG-1.)+.5);
  vec2 f=fract(p/uCelda);
  float g=texture(uGlifos,vec2((i+f.x)/uNG,1.-f.y)).r;
  vec3 tono=e.a>.001?min(e.rgb/e.a,vec3(1.)):vec3(0.);
  o=vec4(mix(uFondo,tono*(.6+.4*a),g*smoothstep(.02,.08,a)),1.);
}`;
    const progQ = gl.createProgram();
    gl.attachShader(progQ, sombra(gl.VERTEX_SHADER, VSQ));
    gl.attachShader(progQ, sombra(gl.FRAGMENT_SHADER, FSQ));
    gl.linkProgram(progQ);
    if (!gl.getProgramParameter(progQ, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(progQ));
    const UQ = {};
    ['uEscena', 'uGlifos', 'uCelda', 'uNG', 'uFondo'].forEach((n) => { UQ[n] = gl.getUniformLocation(progQ, n); });
    const vaoQ = gl.createVertexArray();
    const texEscena = gl.createTexture(), texGlifos = gl.createTexture(), fbo = gl.createFramebuffer();
    let cols = 1, filas = 1, celdaW = 1, celdaH = 1, pxPuntos = 1.5;
    const textura = (tex) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    const prepararAscii = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5);
      cols = Math.max(1, Math.round(lienzo.width / ((movil ? 7 : 9) * d)));
      filas = Math.max(1, Math.round(lienzo.height / ((movil ? 12 : 16) * d)));
      celdaW = lienzo.width / cols;
      celdaH = lienzo.height / filas;
      textura(texEscena);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, filas, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texEscena, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // Atlas con un carácter por celda, dibujado en Roboto Mono (la fuente de datos del sistema)
      const w = Math.round(celdaW), h = Math.round(celdaH);
      const atlas = document.createElement('canvas');
      atlas.width = w * RAMPA.length;
      atlas.height = h;
      const c2 = atlas.getContext('2d');
      c2.fillStyle = 'black';
      c2.fillRect(0, 0, atlas.width, atlas.height);
      c2.fillStyle = 'white';
      c2.font = `400 ${Math.round(h * 0.8)}px "Roboto Mono", monospace`;
      c2.textAlign = 'center';
      c2.textBaseline = 'middle';
      [...RAMPA].forEach((ch, i) => c2.fillText(ch, w * (i + 0.5), h * 0.55));
      textura(texGlifos);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    };

    const ajustar = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5);
      lienzo.width = Math.round(innerWidth * d);
      lienzo.height = Math.round(innerHeight * d);
      pxPuntos = (movil ? 1.7 : 1.5) * d;
      gl.useProgram(prog);
      gl.uniform1f(U.uAsp, innerWidth / innerHeight);
      prepararAscii();
      redibujar = true;
    };
    addEventListener('resize', ajustar);
    ajustar();
    document.fonts?.load('400 20px "Roboto Mono"').then(() => { prepararAscii(); redibujar = true; });

    pintarGL = (p) => {
      const ascii = vista.ascii;
      gl.useProgram(prog);
      if (ascii) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, cols, filas);
        gl.clearColor(0, 0, 0, 0);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, lienzo.width, lienzo.height);
        gl.clearColor(COLOR.noche[0], COLOR.noche[1], COLOR.noche[2], 1);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uPx, ascii ? 1 : pxPuntos);
      gl.uniform1f(U.uGan, ascii ? (movil ? 0.1 : 0.05) : 1);
      gl.bindVertexArray(vao);
      unir(p.fa, p.fb);
      const iguales = p.fa === p.fb;
      gl.uniform1f(U.uMix, iguales ? 0 : p.m);
      gl.uniform1f(U.uCuboA, p.fa === 'cubo' ? 1 : 0);
      gl.uniform1f(U.uCuboB, p.fb === 'cubo' && !iguales ? 1 : 0);
      gl.uniform1f(U.uT, p.t);
      gl.uniform1f(U.uFase, p.fase);
      gl.uniform1f(U.uOrb, p.orb);
      gl.uniform1f(U.uS, p.cam.s);
      gl.uniform1f(U.uAlpha, p.cam.a);
      gl.uniform1f(U.uDial, p.cam.dial);
      gl.uniform1f(U.uMarcas, p.marcas);
      gl.uniform1f(U.uBarrido, p.barrido);
      gl.uniform1f(U.uFijo, 0);
      gl.uniform1f(U.uEje, p.eje);
      gl.uniform1f(U.uEdu, p.edu);
      gl.uniform2f(U.uRot, p.rx, p.ry);
      gl.uniform2f(U.uShift, p.cam.x, p.cam.y);
      gl.uniform2f(U.uM, p.mx, p.my);
      gl.drawArrays(gl.POINTS, 0, dibujar);
      if (p.extras) {
        gl.bindVertexArray(vaoX);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufXP);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, posX);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufXS);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, semX);
        gl.uniform1f(U.uMix, 0);
        gl.uniform1f(U.uCuboA, 0);
        gl.uniform1f(U.uCuboB, 0);
        gl.uniform1f(U.uFijo, 1);
        gl.uniform1f(U.uEje, 0);
        gl.uniform1f(U.uEdu, 0);
        gl.uniform1f(U.uAlpha, 1);
        gl.drawArrays(gl.POINTS, 0, M);
      }
      if (!ascii) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, lienzo.width, lienzo.height);
      gl.disable(gl.BLEND);
      gl.useProgram(progQ);
      gl.bindVertexArray(vaoQ);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texEscena);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texGlifos);
      gl.uniform1i(UQ.uEscena, 0);
      gl.uniform1i(UQ.uGlifos, 1);
      gl.uniform2f(UQ.uCelda, celdaW, celdaH);
      gl.uniform1f(UQ.uNG, RAMPA.length);
      gl.uniform3fv(UQ.uFondo, COLOR.noche);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
      gl.enable(gl.BLEND);
    };
  } catch (err) {
    console.warn(err);
    pintarGL = null;
    raiz.classList.add('sin-gl');
    btnVista.hidden = true;
  }

  /* ---------- Recorrido ---------- */
  const CAM = {
    espiral: { s: 0.62, x: 0.42, y: 0.04, rx: 0.22, ry: -0.38, orb: 0, a: 0.95, sat: 0, casa: 0, dial: 0, eje: 0 },
    esfera: { s: 0.6, x: 0.42, y: 0.04, rx: 0.4, ry: -0.25, orb: 0, a: 0.95, sat: 1, casa: 1, dial: 0, eje: 1 },
    dispersos: { s: 0.5, x: 0.14, y: 0, rx: 0.12, ry: 0.25, orb: 0, a: 0.62, sat: 0, casa: 0, dial: 0, eje: 0 },
    dial: { s: 0.48, x: 0.44, y: 0, rx: 0.62, ry: 0.08, orb: 1, a: 0.95, sat: 0, casa: 0, dial: 1, eje: 0 },
    uno: { s: 0.62, x: 0.44, y: 0, rx: 0.3, ry: 0.4, orb: 0, a: 0.9, sat: 0, casa: 0, dial: 0, eje: 0 },
    tenue: { s: 0.62, x: 0.3, y: 0, rx: 1.15, ry: -0.2, orb: 1, a: 0.3, sat: 0, casa: 0, dial: 0.4, eje: 0 },
    inclinadas: { s: 0.54, x: 0.46, y: 0.08, rx: 0.78, ry: -0.42, orb: 1, a: 0.6, sat: 0, casa: 0, dial: 0.6, eje: 0 },
    final: { s: 0.6, x: 0.3, y: 0, rx: 0, ry: 0, orb: 0, a: 1, sat: 1, casa: 1, dial: 0, eje: 0 },
  };
  if (movil) {
    Object.values(CAM).forEach((c) => { c.s *= 0.8; c.x *= 0.4; c.y = 0.46; c.a *= 0.75; });
    CAM.dial.s = 0.26;
    CAM.final.x = 0; CAM.final.y = 0;
    CAM.esfera.a = 0.95; CAM.espiral.a = 1; CAM.final.a = 1;
    // En el celular el globo queda centrado y más chico, para que no tape la cabecera ni el título
    CAM.esfera.s = 0.36; CAM.esfera.x = 0; CAM.esfera.y = 0.5;
  }
  const CLAVES = Object.keys(CAM.esfera);
  const FORMA = { espiral: 'espiral', esfera: 'esfera', dispersos: 'dispersos', dial: 'dial', uno: 'uno', tenue: 'dial', inclinadas: 'dial', final: 'logo' };

  // Cada hito dice qué forma toman las partículas y en qué tramo de scroll cambian hacia ella
  let hitos = [];
  const medir = () => {
    const vh = innerHeight, lista = [];
    $$('[data-estado]').forEach((el) => {
      const fin = el.getBoundingClientRect().top + scrollY - vh * 0.1;
      lista.push({ e: el.dataset.estado, ini: fin - vh, fin });
    });
    hitos = lista.sort((a, b) => a.fin - b.fin);
  };
  medir();
  addEventListener('resize', medir);
  addEventListener('load', medir);
  document.fonts?.ready.then(medir);
  const estadoEn = (y) => {
    for (let i = 0; i < hitos.length - 1; i += 1) {
      const sig = hitos[i + 1];
      if (y < sig.ini) return { a: hitos[i].e, b: hitos[i].e, m: 0 };
      if (y < sig.fin) return { a: hitos[i].e, b: sig.e, m: (y - sig.ini) / (sig.fin - sig.ini) };
    }
    const u = hitos[hitos.length - 1].e;
    return { a: u, b: u, m: 0 };
  };

  const finW = $('#fin-w'), fin = $('#cierre'), pie = $('#pie'), bar = $('#bar'), secFrase = $('#pregunta');
  const tRec = $('#t-rec'), tEsc = $('#t-esc'), tHora = $('#t-hora'), tPts = $('#t-pts'), tFps = $('#t-fps'), prog = $('#prog');
  const horaChile = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const nf = new Intl.NumberFormat('es-CL');
  const cam = { ...CAM.esfera };
  let ys = scrollY, antes = performance.now(), fase = 0, barrido = 0, tSat = 0.9, eje = 0;
  let rotX = 0, rotY = 0, mx = 9, my = 9, tmx = 9, tmy = 9, velo = 0, yAntes = scrollY;
  let cuadros = 0, marca = antes, lentas = 0, ultimaY = -1, primera = true;

  if (!reducido && !tactil) addEventListener('pointermove', (e) => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = 1 - (e.clientY / innerHeight) * 2; }, { passive: true });

  const bucle = (ahora) => {
    requestAnimationFrame(bucle);
    if (document.hidden) { antes = ahora; return; }
    const dt = Math.min((ahora - antes) / 1000, 0.05);
    antes = ahora;
    const y = scrollY, vh = innerHeight, total = Math.max(1, document.documentElement.scrollHeight - vh);
    const ti = ahora - T0;
    ys += (y - ys) * (reducido ? 1 : 1 - Math.exp(-dt * 3.4));
    cuadros += 1;
    bar.classList.toggle('lejos', y > 90);

    // La pregunta se enciende palabra por palabra mientras la escena queda fija
    const rf = secFrase.getBoundingClientRect();
    const pf = acotar(-rf.top / Math.max(1, rf.height - vh));
    palabras.forEach((w, i) => w.style.setProperty('--k', acotar(pf * 1.1 * palabras.length - i).toFixed(3)));

    // Tipografía cinética: las cintas corren solas y las palabras engrosan al pasar por el centro
    velo += ((y - yAntes) / Math.max(dt, 0.016) - velo) * 0.12;
    yAntes = y;
    if (cineticaVisible) {
      // Corren solas, a velocidad constante (no con el scroll), una hacia cada lado
      const seg = performance.now() / 1000;
      cintas.forEach((c, i) => {
        const dir = +c.dataset.dir, tramo = tramos[i], off = (seg * VEL_CINTA) % tramo;
        c.style.transform = `translateX(${reducido ? -tramo : dir > 0 ? -tramo - off : -2 * tramo + off}px)`;
        if (reducido) return;
        palabrasCinta[i].forEach((w) => {
          const r = w.getBoundingClientRect();
          const d = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
          w.style.setProperty('--cw', Math.round(300 + 400 * Math.exp(-d * d * 18)));
        });
      });
    }

    // Forma de las partículas y cámara
    let { a, b, m } = estadoEn(ys);
    const intro = reducido ? 1 : acotar(ti / 3800);
    let orbIntro = 0;
    if (intro < 1 && y < vh * 0.4) { a = 'espiral'; b = 'esfera'; m = curva(intro); orbIntro = 1 - curva(intro); }
    m = acotar(m);
    const k = curva(m);
    const sigue = primera || reducido ? 1 : 1 - Math.exp(-dt * 2.4);
    for (const p of CLAVES) cam[p] += (mezclar(CAM[a][p], CAM[b][p], k) - cam[p]) * sigue;
    const orb = Math.max(cam.orb, orbIntro);
    if (!reducido) {
      fase += dt * orb;
      barrido = (barrido + dt * 0.5) % TAU;
      tSat += dt * 0.34;
      // El globo gira sobre su propio eje solo cuando está entero; como sus meridianos van cada 15°,
      // al dar ese paso vuelve a cero sin que se note
      if (cam.eje > 0.995) eje = (eje + dt * 0.16) % (TAU / 24);
      mx += (tmx - mx) * (1 - Math.exp(-dt * 5));
      my += (tmy - my) * (1 - Math.exp(-dt * 5));
      rotY += ((tmx === 9 ? 0 : tmx * 0.14) - rotY) * (1 - Math.exp(-dt * 2));
      rotX += ((tmy === 9 ? 0 : -tmy * 0.09) - rotX) * (1 - Math.exp(-dt * 2));
    }
    const fa = FORMA[a], fb = FORMA[b];
    const pesoMarcas = fa === 'dial' && fb === 'dial' ? 1 : fa === 'dial' ? 1 - m : fb === 'dial' ? m : 0;
    const conExtras = cam.sat > 0.01 || cam.dial > 0.01;
    if (pintarGL && (!reducido || Math.abs(y - ultimaY) > 0.5 || primera || redibujar)) {
      if (conExtras) calcularExtras(cam.sat, cam.casa, cam.dial, barrido, tSat);
      pintarGL({
        fa, fb, m, cam, t: ti / 1000, fase, orb, barrido, marcas: pesoMarcas, mx, my, extras: conExtras, eje: eje * cam.eje, edu: cam.eje,
        rx: cam.rx + rotX,
        ry: cam.ry + rotY + Math.sin(ti / 4000) * 0.12 * cam.sat,
      });
    }
    ultimaY = y;
    primera = false;
    redibujar = false;

    // Cierre: la O crece hasta llenar la pantalla
    const rw = finW.getBoundingClientRect();
    const pc = acotar(-rw.top / vh);
    const rfin = fin.getBoundingClientRect();
    const cx = ((cam.x + 1) / 2) * innerWidth, cy = ((1 - cam.y) / 2) * vh;
    fin.style.setProperty('--r', `${Math.hypot(innerWidth, Math.max(vh, rfin.height)) * 1.1 * curva(pc)}px`);
    fin.style.setProperty('--cx', `${cx - rfin.left}px`);
    fin.style.setProperty('--cy', `${cy - rfin.top}px`);
    raiz.classList.toggle('en-fin', pc > 0.6);
    raiz.classList.toggle('en-azul', pc > 0.6 && pie.getBoundingClientRect().top > vh * 0.5);
    raiz.classList.toggle('tras-hero', y > vh * 0.4 && rw.top > vh * 0.35);

    // Riel y telemetría real
    let ind = 0;
    secciones.forEach((s, i) => { const t = (s === fin ? rw : s.getBoundingClientRect()).top; if (t <= vh * 0.5) ind = i; });
    marcas.forEach((el, i) => el.classList.toggle('on', i === ind));
    const pr = acotar(y / total);
    if (pt) pt.style.top = `${17 + pr * 34 * (marcas.length - 1)}px`;
    if (prog) prog.style.transform = `scaleX(${pr})`;
    if (ahora - marca > 400) {
      const lapso = ahora - marca, fps = Math.round((cuadros * 1000) / lapso);
      cuadros = 0;
      marca = ahora;
      if (lapso < 1000) lentas = fps < 28 ? lentas + 1 : 0;
      if (lentas >= 5 && dibujar > 12000) { dibujar = Math.max(12000, Math.round(dibujar * 0.7)); lentas = 0; }
      tFps.textContent = String(fps).padStart(2, '0');
      tPts.textContent = nf.format(dibujar);
      tRec.textContent = String(Math.round(pr * 100)).padStart(3, '0') + '%';
      tEsc.textContent = `${String(ind + 1).padStart(2, '0')}/${String(secciones.length).padStart(2, '0')}`;
      tHora.textContent = horaChile.format(new Date());
    }
  };
  requestAnimationFrame(bucle);
}
