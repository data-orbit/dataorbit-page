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

  /* ---------- Hero ---------- */
  const h1 = $('.h1'), lineas = $$('.h1 .ln'), rot = $('#rot');
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
  const celdas = $$('.h1 .c');
  rot.dataset.txt = rot.textContent;
  if (!reducido) rot.classList.add('crudo');
  // Cada línea parte como dato crudo (Roboto Mono) y se compila a Montserrat letra por letra,
  // con una línea de lectura que la recorre. Los anchos se fijan antes para que nada salte.
  const compilarHero = () => {
    if (reducido) { h1.classList.add('listo'); return; }
    celdas.forEach((c) => c.classList.remove('cr'));
    const anchos = celdas.map((c) => c.getBoundingClientRect().width);
    celdas.forEach((c, i) => { c.style.width = `${anchos[i]}px`; c.classList.add('cr'); });
    lineas.forEach((l, i) => setTimeout(() => {
      if (l === rot) { rot.classList.remove('crudo'); decodificar(rot, undefined, { dura: 1500 }); return; }
      l.classList.add('compila');
      $$('.c', l).forEach((c, j) => setTimeout(() => c.classList.remove('cr'), j * 45));
    }, 400 + i * 420));
    setTimeout(() => { celdas.forEach((c) => { c.style.width = ''; }); h1.classList.add('listo'); }, 400 + lineas.length * 420 + 1400);
  };
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(compilarHero);
  if (!reducido) $$('.hero .key').forEach((k) => k.classList.add('dibuja'));
  if (!reducido && !tactil) {
    let pendiente = false, px = 0, py = 0;
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY;
      if (pendiente || !h1.classList.contains('listo') || scrollY > innerHeight * 0.8) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        celdas.forEach((c) => {
          const r = c.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
          c.style.setProperty('--w', Math.round(300 + 400 * Math.exp(-(d * d) / 30000)));
        });
      });
    }, { passive: true });
  }
  const PALABRAS = ['empresa', 'planta', 'área comercial', 'colegio'];
  let palabra = 0;
  if (!reducido) setTimeout(() => setInterval(() => {
    palabra = (palabra + 1) % PALABRAS.length;
    rot.dataset.txt = PALABRAS[palabra];
    decodificar(rot, PALABRAS[palabra], { dura: 1400 });
  }, 4600), 3600);

  // Frase que se enciende palabra por palabra con el scroll
  const scrub = $('#scrub');
  [['La IA ya escribe código.', false], ['Lo difícil es que funcione en tu empresa.', true]].forEach(([txt, sig]) => txt.split(' ').forEach((w) => {
    const s = document.createElement('span');
    s.className = sig ? 'w sig' : 'w';
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    scrub.append(s, ' ');
  }));
  const palabras = $$('.w', scrub);

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

  /* ---------- Comparador ---------- */
  const CMP = [
    { tema: 'Datos ordenados', sin: 'Sin datos ordenados', con: 'Con los datos ordenados', q: '¿Cuánto vendimos en septiembre?',
      sinR: 'USD 1.240.000', sinM: '[ ! ] Sin fuente. No cuadra con contabilidad.', conR: 'USD 982.400', conM: '[ ok ] Fuente: ERP, venta neta sin notas de crédito.',
      sinTxt: 'La IA se equivoca con total seguridad.', conTxt: 'La IA responde con los números correctos, porque sabe de dónde salen.', gana: 'Respuestas que puedes verificar' },
    { tema: 'Conexión con tus sistemas', sin: 'Sin conexión a tus sistemas', con: 'Conectada con resguardos', q: 'Repón el stock del producto A.',
      sinR: 'Te sugiero revisar el inventario y crear una orden de compra.', sinM: '[ ! ] No ejecutó nada.', conR: 'Orden de compra creada en borrador: 400 u.', conM: '[ .. ] Espera tu aprobación antes de enviarse.',
      sinTxt: 'La IA solo conversa: no puede hacer nada por ti.', conTxt: 'La IA ejecuta tareas dentro de tus sistemas, y pide aprobación cuando corresponde.', gana: 'Trabajo hecho, no sugerencias' },
    { tema: 'Tu equipo a bordo', sin: 'Sin tu equipo', con: 'Con el equipo a bordo', q: 'Uso del equipo, 4 semanas hábiles', dias: true,
      sinM: '[ ! ] Se dejó de usar la primera semana.', conM: '[ ok ] Se usa todos los días hábiles.',
      sinTxt: 'La IA queda instalada y nadie la usa.', conTxt: 'La IA se usa todos los días, porque se diseñó sobre cómo trabajan.', gana: 'Una herramienta que se usa todos los días' },
  ];
  const lado = (c, cual) => {
    const sin = cual === 'sin';
    const resp = sin ? c.sinR : c.conR;
    const pantalla = c.dias
      ? `<div class="dias">${Array.from({ length: 20 }, (_, k) => `<i class="${!sin || k < 3 ? 'on' : ''}"></i>`).join('')}</div>`
      : `<p class="r${resp.length > 22 ? ' largo' : ''}">${resp}</p>`;
    return `<div class="lado lado-${cual}">
      <p class="lado-tag label">${sin ? c.sin : c.con}</p>
      <div class="pant"><p class="q">${c.dias ? c.q : '> ' + c.q}</p>${pantalla}<p class="meta">${sin ? c.sinM : c.conM}</p></div>
      <p class="lado-txt">${sin ? c.sinTxt : c.conTxt}</p>
      ${sin ? '' : `<p class="gana"><span class="label">Lo que ganas</span><b>${c.gana}</b></p>`}
    </div>`;
  };
  $('#cmps').innerHTML = CMP.map((c, i) => `<li class="cmp" data-i="${i}"><div class="cmp-tema"><h3>${c.tema}</h3></div>${lado(c, 'sin')}${lado(c, 'con')}</li>`).join('');
  const jugarCmp = (li) => {
    const c = CMP[+li.dataset.i], sin = $('.lado-sin', li), con = $('.lado-con', li);
    li.classList.add('corre');
    if (c.dias) {
      const dS = $$('.dias i', sin), dC = $$('.dias i', con);
      [...dS, ...dC].forEach((d) => d.classList.remove('on'));
      dS.slice(0, 3).forEach((d, k) => setTimeout(() => d.classList.add('on'), 700 + k * 300));
      dC.forEach((d, k) => setTimeout(() => d.classList.add('on'), 2900 + k * 115));
      return;
    }
    const qS = $('.q', sin), qC = $('.q', con), rS = $('.r', sin), rC = $('.r', con);
    rS.textContent = ''; rC.textContent = ''; qC.textContent = '';
    escribir(qS, '> ' + c.q, 1100);
    setTimeout(() => (c.sinR.length > 22 ? escribir(rS, c.sinR, 1100) : decodificar(rS, c.sinR, { dura: 1000 })), 1200);
    setTimeout(() => escribir(qC, '> ' + c.q, 1100), 2700);
    setTimeout(() => (c.conR.length > 22 ? escribir(rC, c.conR, 1300) : decodificar(rC, c.conR, { dura: 1400 })), 3900);
  };
  const verCmp = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { jugarCmp(e.target); verCmp.unobserve(e.target); }
  }), { threshold: 0.35 });
  if (!reducido) $$('.cmp').forEach((li) => verCmp.observe(li));

  /* ---------- Etapas ---------- */
  const ETAPAS = [
    { n: 'Entender', cap: 'Cómo trabaja tu equipo de verdad, y qué conviene resolver primero', s: [['Diagnóstico y hoja de ruta de IA', 'Punto de partida']] },
    { n: 'Construir', cap: 'Los datos ordenados y la plataforma que la operación necesita', s: [['Datos listos para IA', 'Ingeniería de datos y BI'], ['Plataformas a la medida', 'Software y automatización']] },
    { n: 'Operar y medir', cap: 'Que la IA se use todos los días, y que el impacto quede demostrado', s: [['Agentes conectados, con resguardos', 'IA que ejecuta'], ['Operación continua y adopción', 'Acompañamiento'], ['Impacto medido', 'Valor verificado']] },
  ];
  const secEtapas = $('#soluciones'), datoEl = $('#etapa-dato');
  $('#tabs').innerHTML = ETAPAS.map((e, i) => `<button type="button" class="tab label" data-i="${i}">0${i + 1} ${e.n}</button>`).join('');
  const tabs = $$('.tab');
  let etapa = -1;
  function verEtapa(i) {
    if (i === etapa) return;
    const primera = etapa === -1;
    etapa = i;
    const e = ETAPAS[i];
    tabs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-pressed', k === i); });
    if (primera) $('#etapa-nom').textContent = e.n;
    else decodificar($('#etapa-nom'), e.n, { dura: 1300 });
    $('#etapa-cap').textContent = e.cap;
    $('#serv').innerHTML = e.s.map(([t, b], k) => `<li style="--i:${k}"><span class="t">${t}</span><span class="b label">${b}</span></li>`).join('');
  }
  verEtapa(0);
  const DESTINO_ETAPA = [0.12, 0.66, 0.95];
  tabs.forEach((t) => t.addEventListener('click', () => {
    const r = secEtapas.getBoundingClientRect(), recorre = r.height - innerHeight;
    scrollTo({ top: r.top + scrollY + recorre * DESTINO_ETAPA[+t.dataset.i], behavior: reducido ? 'auto' : 'smooth' });
  }));

  /* ---------- Mapa vivo: cada etapa en detalle ---------- */
  const ORDEN_SV = ['diagnostico', 'datos', 'plataformas', 'agentes', 'operacion', 'impacto'];
  const DUR_SV = 7500;
  const mapa = $('#mapa'), mapaVivo = $('#mapa-vivo'), nodosSv = $$('.nodo', mapa), barraSv = $('#cs-barra'), btnAuto = $('#cs-auto');
  let svActual = 0, svAuto = !reducido, svVisible = false, svIntervalo = null, svRelojes = [];
  const verServicio = (i, animar) => {
    svActual = i;
    const id = ORDEN_SV[i];
    nodosSv.forEach((n) => { const on = n.dataset.sv === id; n.classList.toggle('on', on); n.setAttribute('aria-pressed', String(on)); });
    $$('.sv').forEach((p) => { p.hidden = p.id !== `sv-${id}`; });
    const panelSv = $(`#sv-${id}`), lis = $$('.sv-pasos li', panelSv);
    svRelojes.forEach(clearTimeout);
    svRelojes = [];
    if (!animar || reducido) { lis.forEach((li) => { li.className = 'ok'; }); return; }
    decodificar($('h3', panelSv), undefined, { dura: 1100 });
    lis.forEach((li) => { li.className = ''; });
    let t = 600;
    lis.forEach((li) => {
      svRelojes.push(setTimeout(() => { li.className = 'run'; }, t));
      t += Math.min(800, 4200 / lis.length);
      svRelojes.push(setTimeout(() => { li.className = 'ok'; }, t));
    });
  };
  const correrBarra = () => {
    barraSv.style.transition = 'none';
    barraSv.style.transform = 'scaleX(0)';
    void barraSv.offsetWidth;
    if (!svAuto) return;
    barraSv.style.transition = `transform ${DUR_SV}ms linear`;
    barraSv.style.transform = 'scaleX(1)';
  };
  const recorrer = () => {
    clearInterval(svIntervalo);
    if (!svAuto || !svVisible) return;
    correrBarra();
    svIntervalo = setInterval(() => { verServicio((svActual + 1) % ORDEN_SV.length, true); correrBarra(); }, DUR_SV);
  };
  const rotularAuto = () => { $('span', btnAuto).textContent = svAuto ? 'Pausar recorrido' : 'Recorrer solo'; };
  nodosSv.forEach((n) => n.addEventListener('click', () => {
    svAuto = false;
    rotularAuto();
    recorrer();
    correrBarra();
    verServicio(ORDEN_SV.indexOf(n.dataset.sv), true);
  }));
  btnAuto.addEventListener('click', () => {
    svAuto = !svAuto && !reducido;
    rotularAuto();
    if (svAuto) verServicio((svActual + 1) % ORDEN_SV.length, true);
    recorrer();
  });
  if (reducido) btnAuto.hidden = true;
  verServicio(0, false);
  let svPrimera = true;
  new IntersectionObserver(([e]) => {
    svVisible = e.isIntersecting;
    if (svVisible && svPrimera) { svPrimera = false; verServicio(0, !reducido); }
    recorrer();
  }, { threshold: 0, rootMargin: '0px 0px -35% 0px' }).observe(mapaVivo);
  // Líneas del mapa: dos recorridos, uno por cada vía, que vuelven al punto de partida
  const trazarMapa = () => {
    const m = mapa.getBoundingClientRect();
    if (!m.width) return;
    const c = (sel) => { const r = $(sel).getBoundingClientRect(); return { x: r.left - m.left + r.width / 2, y: r.top - m.top + r.height / 2, top: r.top - m.top, bottom: r.bottom - m.top }; };
    const [n1, a1, a2, b1, b2, ag, , im] = ['#nd-diagnostico', '#nd-datos', '#nd-datos-2', '#nd-plataformas', '#nd-plataformas-2', '#nd-agentes', '#nd-operacion', '#nd-impacto'].map(c);
    const ySplit = Math.min(a1.top, b1.top) - 12, yMerge = (Math.max(a2.bottom, b2.bottom) + ag.top) / 2, xRet = m.width - 8;
    const via = (v1, v2) => `M${n1.x} ${n1.y}V${ySplit}H${v1.x}V${v2.y}V${yMerge}H${ag.x}V${im.y}H${xRet}V${n1.y}H${n1.x}`;
    $('.mapa-lineas').setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    $('#ml-base-a').setAttribute('d', via(a1, a2));
    $('#ml-luz-a').setAttribute('d', via(a1, a2));
    $('#ml-base-b').setAttribute('d', via(b1, b2));
    $('#ml-luz-b').setAttribute('d', via(b1, b2));
  };
  new ResizeObserver(trazarMapa).observe(mapa);
  trazarMapa();

  /* ---------- ¿Por qué nosotros? ---------- */
  const secNos = $('#nosotros'), histScrub = $('#hist-scrub');
  histScrub.textContent = '';
  histScrub.getAttribute('aria-label').split(' ').forEach((w) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    histScrub.append(s, ' ');
  });
  const palabrasHist = $$('.w', histScrub);
  /* ---------- ¿Por qué nosotros?: demostraciones que la persona maneja ---------- */
  const linea = (log, clase, texto, extra) => {
    const li = document.createElement('li');
    li.className = clase;
    const s = document.createElement('span');
    li.append(s);
    if (extra) li.append(extra);
    log.append(li);
    while (log.children.length > 4) log.firstElementChild.remove();
    escribir(s, texto, Math.min(900, texto.length * 20));
    return li;
  };
  const limpiar = (log) => { log.textContent = ''; };
  // Llamado a la acción de 07: cuenta las pruebas usadas y, con todas, invita a conversar
  const tocar = (pv) => {
    pv.classList.add('tocado');
    pv.closest('.prueba')?.classList.add('probada');
    const total = $$('.pv-int').length, hechas = $$('.pv-int.tocado').length;
    $('#probados-07').textContent = `${hechas}/${total}`;
    if (hechas === total) { $('#invita-07 .invita-fin').hidden = false; $('#invita-07').classList.add('completo'); }
  };
  const marcar07 = () => {
    // Titila una sola cosa: el próximo botón de la prueba en curso o, si no hay ninguna a
    // medias, la próxima prueba sin tocar
    const pruebas = $$('.pv-int');
    const aMedias = (pv) => pv.classList.contains('tocado') && $$('.mini', pv).some((b) => !b.classList.contains('hecho'));
    const enCurso = pruebas.find(aMedias);
    const pendiente = enCurso ? null : pruebas.find((pv) => !pv.classList.contains('tocado'));
    pruebas.forEach((pv) => {
      pv.classList.toggle('siguiente', pv === pendiente);
      const activa = pv === enCurso || pv === pendiente;
      const minis = $$('.mini', pv), proximo = minis.find((b) => !b.classList.contains('hecho'));
      minis.forEach((b) => b.classList.toggle('siguiente', activa && b === proximo));
    });
  };
  const nosPruebas = $('.nos-pruebas');
  nosPruebas.addEventListener('click', () => setTimeout(marcar07, 0));
  new MutationObserver(marcar07).observe(nosPruebas, { childList: true, subtree: true });
  marcar07();
  const esActivo = (el) => el.getAttribute('aria-checked') === 'true';
  const alternar = (el) => el.setAttribute('aria-checked', String(!esActivo(el)));

  // 1. Entender antes de programar: los pasos van en orden; saltarse la conversación avisa
  const pv1 = $('#pv-entender'), log1 = $('.log', pv1), botones1 = $$('[data-paso]', pv1);
  const PASOS1 = ['', 'En conjunto: el proceso completo.', 'Con cada persona: lo que en grupo no aparece.', 'Recién ahí, el sistema: sobre cómo se trabaja de verdad.'];
  let paso1 = 0;
  botones1.forEach((b) => b.addEventListener('click', () => {
    tocar(pv1);
    const n = +b.dataset.paso;
    if (n <= paso1) return;
    if (n !== paso1 + 1) {
      linea(log1, 'alerta', n === 3 ? 'Sin conversar primero, el sistema saldría de una plantilla estándar.' : 'Primero, en conjunto: el proceso completo.');
      return;
    }
    if (paso1 === 0) limpiar(log1);
    paso1 = n;
    b.classList.add('hecho');
    linea(log1, 'ok', PASOS1[n]);
  }));
  $('.reinicio', pv1).addEventListener('click', () => {
    paso1 = 0;
    botones1.forEach((b) => b.classList.remove('hecho'));
    limpiar(log1);
    linea(log1, 'info', 'Toca el primer paso, o intenta saltar directo al sistema.');
  });

  // 2. Datos ordenados y tuyos: ordenar, documentar y llevártelos
  const pv2 = $('#pv-datos'), log2 = $('.log', pv2), botones2 = $$('[data-accion]', pv2);
  const ACCIONES2 = { ordenar: 1, documentar: 2, llevar: 3 };
  const TEXTOS2 = ['', 'Unidos en un modelo de datos confiable.', 'Documentada, con las definiciones del negocio escritas.', 'Son tuyos: listos para lo que venga, con nosotros o con cualquier otra herramienta.'];
  let paso2 = 0;
  botones2.forEach((b) => b.addEventListener('click', () => {
    tocar(pv2);
    const n = ACCIONES2[b.dataset.accion];
    if (n <= paso2) return;
    if (n !== paso2 + 1) {
      linea(log2, 'alerta', paso2 === 0 ? 'Primero hay que ordenarlos.' : 'Primero, documentados.');
      return;
    }
    if (paso2 === 0) limpiar(log2);
    if (n === 3) {
      const c = $('.celdas', pv2).getBoundingClientRect(), k = $('.caja', pv2).getBoundingClientRect();
      pv2.style.setProperty('--lleva', `${k.left + k.width / 2 - (c.left + c.width / 2)}px`);
    }
    paso2 = n;
    pv2.classList.add(`e${n}`);
    b.classList.add('hecho');
    linea(log2, 'ok', TEXTOS2[n]);
  }));
  $('.reinicio', pv2).addEventListener('click', () => {
    paso2 = 0;
    pv2.classList.remove('e1', 'e2', 'e3');
    botones2.forEach((b) => b.classList.remove('hecho'));
    limpiar(log2);
    linea(log2, 'info', 'Hoy viven en planillas, sistemas y plataformas externas.');
  });

  // 3. Resguardos: los permisos deciden qué hace el agente con el mismo pedido
  const pv3 = $('#pv-resguardos'), log3 = $('.log', pv3), pedir = $('[data-accion="pedir"]', pv3);
  const permiso = (k) => esActivo($(`[data-perm="${k}"]`, pv3));
  let pidio = false, reloj3 = null;
  const ejecutar = () => {
    clearTimeout(reloj3);
    limpiar(log3);
    if (!permiso('ve')) { linea(log3, 'alerta', 'Sin acceso a la información, el agente no puede hacer nada por ti.'); return; }
    linea(log3, permiso('solo') ? 'ok' : 'espera', permiso('solo') ? 'Reporte actualizado: es de bajo riesgo, lo hace solo.' : 'Reporte listo: espera que una persona lo ejecute.');
    reloj3 = setTimeout(() => {
      if (!permiso('aprobacion')) { linea(log3, 'alerta', 'Sin este resguardo, la orden se enviaría sin que nadie la revise.'); return; }
      const ap = document.createElement('button');
      ap.type = 'button';
      ap.className = 'mini';
      ap.textContent = 'Aprobar';
      linea(log3, 'espera', 'Orden de compra en borrador: compromete dinero, espera tu aprobación.', ap);
      ap.addEventListener('click', () => { ap.remove(); linea(log3, 'ok', 'Aprobada por una persona: orden enviada.'); });
    }, reducido ? 0 : 1100);
  };
  $$('.perm', pv3).forEach((p) => p.addEventListener('click', () => { tocar(pv3); alternar(p); if (pidio) ejecutar(); }));
  pedir.addEventListener('click', () => { tocar(pv3); pidio = true; pedir.classList.add('hecho'); ejecutar(); });

  // 4. Medir antes y después: en orden, y si no se puede medir con rigor, se dice
  const pv4 = $('#pv-medir'), log4 = $('.log', pv4), botones4 = $$('[data-paso]', pv4), rigor = $('[data-perm="rigor"]', pv4);
  let paso4 = 0;
  const pintarBarras = () => { pv4.classList.toggle('m2', paso4 >= 2); pv4.classList.toggle('m3', paso4 >= 3 && esActivo(rigor)); };
  const cierre4 = () => linea(log4, esActivo(rigor) ? 'ok' : 'alerta', esActivo(rigor) ? 'Medición posterior: respondemos por el resultado.' : 'Si algo no se puede medir con rigor, lo decimos.');
  botones4.forEach((b) => b.addEventListener('click', () => {
    tocar(pv4);
    const n = +b.dataset.paso;
    if (n <= paso4) return;
    if (n !== paso4 + 1) {
      linea(log4, 'alerta', paso4 === 0 ? 'Primero acordamos las métricas contigo.' : 'Sin línea base no hay con qué comparar.');
      return;
    }
    if (paso4 === 0) limpiar(log4);
    paso4 = n;
    b.classList.add('hecho');
    if (n === 1) linea(log4, 'ok', 'Métricas acordadas contigo desde el inicio.');
    if (n === 2) linea(log4, 'ok', 'Línea base: medimos el proceso antes de tocarlo.');
    if (n === 3) cierre4();
    pintarBarras();
  }));
  rigor.addEventListener('click', () => { tocar(pv4); alternar(rigor); pintarBarras(); if (paso4 >= 3) cierre4(); });
  $('.reinicio', pv4).addEventListener('click', () => {
    paso4 = 0;
    botones4.forEach((b) => b.classList.remove('hecho'));
    pintarBarras();
    limpiar(log4);
    linea(log4, 'info', 'Sigue los pasos en orden.');
  });

  /* ---------- La IA en acción ---------- */
  const EJEMPLOS = [
    { l: 'Stock y compras', sis: 'Compras', p: '¿Qué productos se quedan sin stock este mes y cuánto hay que pedir?', pasos: ['Leyendo la proyección de ventas del mes', 'Cruzando con el stock y los tiempos de reposición', 'Preparando el borrador de la orden de compra'], filas: [['Producto A', 'Alcanza para 9 días', 'Pedir 400 u.'], ['Producto B', 'Alcanza para 12 días', 'Pedir 250 u.'], ['Producto C', 'Alcanza para 15 días', 'Pedir 180 u.']], fin: 'Resguardo: compromete dinero, necesita tu aprobación', aprobar: true },
    { l: 'Seguimiento comercial', sis: 'Clientes', p: '¿Qué clientes no hemos contactado en 30 días? Agéndame un recordatorio con cada uno.', pasos: ['Buscando la última interacción con cada cliente', 'Filtrando los que llevan más de 30 días sin contacto', 'Creando los recordatorios en tu agenda'], filas: [['Cliente Norte', '41 días sin contacto', 'Lunes'], ['Cliente Sur', '36 días sin contacto', 'Martes'], ['Cliente Centro', '33 días sin contacto', 'Miércoles']], fin: '3 recordatorios creados' },
    { l: 'Gestión de proyectos', sis: 'Proyectos', p: 'Crea las tareas para lanzar el nuevo módulo y asígnalas al equipo.', pasos: ['Revisando el proyecto y su fecha de término', 'Separando el trabajo en tareas', 'Asignando responsables y fechas'], filas: [['Cargar datos históricos', 'Ana', 'Vence el 6 oct'], ['Validar cifras con el área', 'Tomás', 'Vence el 9 oct'], ['Capacitar al equipo', 'Carla', 'Vence el 14 oct']], fin: '3 tareas creadas en el proyecto' },
  ];
  const consola = $('#consola');
  $('#opts').innerHTML = EJEMPLOS.map((e, i) => `<button type="button" class="opt label" role="tab" aria-selected="${i === 0}" data-i="${i}">${e.l}</button>`).join('');
  let relojes = [];
  let actual = 0;
  const vistos = new Set();
  function pintarEjemplo(i, animar) {
    actual = i;
    relojes.forEach(clearTimeout);
    relojes = [];
    const e = EJEMPLOS[i], pTxt = $('#p-txt'), res = $('#res-final');
    $$('.opt').forEach((o, k) => o.setAttribute('aria-selected', k === i));
    // Llamado a la acción de 04: marca los ejemplos vistos y, con los tres, invita a conversar
    vistos.add(i);
    $$('.opt').forEach((o, k) => o.classList.toggle('visto', vistos.has(k)));
    const sig = EJEMPLOS.map((_, k) => (i + 1 + k) % EJEMPLOS.length).find((k) => !vistos.has(k));
    $$('.opt').forEach((o, k) => o.classList.toggle('siguiente', k === sig));
    $('#vistos-04').textContent = `${vistos.size}/${EJEMPLOS.length}`;
    if (vistos.size === EJEMPLOS.length) { $('#invita-04 .invita-fin').hidden = false; $('#invita-04').classList.add('completo'); }
    $('#p-res').textContent = '> ' + e.p;
    $('#sis-nom').textContent = 'Tu sistema · ' + e.sis;
    $('#pasos').innerHTML = e.pasos.map((p) => `<li class="${animar ? '' : 'ok'}">${p}</li>`).join('');
    $('#filas').innerHTML = e.filas.map((f) => `<li><span>${f[0]}</span><span>${f[1]}</span><span>${f[2]}</span></li>`).join('');
    res.innerHTML = `<span>${e.fin}</span>` + (e.aprobar ? '<button type="button" class="key sm" id="aprobar"><span class="key-txt">Aprobar</span></button>' : '');
    res.classList.remove('aprobado');
    prepararLlaves(res);
    const ap = $('#aprobar');
    // Al aprobar, el agente envía la orden: cada fila pasa a «Enviada» y queda un mensaje de confirmación
    ap?.addEventListener('click', () => {
      const t = $('.key-txt', ap);
      cancelAnimationFrame(vivos.get(t));
      t.dataset.txt = 'Aprobada';
      t.textContent = 'Enviando…';
      ap.disabled = true;
      const filas = $$('#filas li');
      const unidades = e.filas.reduce((s, f) => s + (parseInt(f[2].replace(/\D/g, ''), 10) || 0), 0);
      const paso = reducido ? 0 : 450;
      filas.forEach((li, k) => relojes.push(setTimeout(() => {
        li.lastElementChild.textContent = 'Enviada · ' + e.filas[k][2].replace(/^Pedir /, '');
        li.classList.add('enviada');
      }, paso ? 350 + k * paso : 0)));
      relojes.push(setTimeout(() => {
        t.textContent = 'Aprobada';
        $('#pasos').insertAdjacentHTML('beforeend', '<li class="ok">Orden de compra enviada al proveedor</li>');
        $('span', res).textContent = `Aprobada por ti: ${filas.length} productos, ${unidades.toLocaleString('es-CL')} u. Te aviso cuando el proveedor confirme.`;
        res.classList.add('aprobado');
      }, paso ? 550 + filas.length * paso : 0));
    });
    if (!animar) { pTxt.textContent = '> ' + e.p; consola.classList.remove('cargando'); return; }
    consola.classList.add('cargando');
    pTxt.textContent = '';
    const texto = '> ' + e.p, porLetra = Math.max(18, 1700 / texto.length);
    for (let k = 1; k <= texto.length; k += 1) relojes.push(setTimeout(() => {
      pTxt.textContent = texto.slice(0, k);
      if (k < texto.length) { const c = document.createElement('i'); c.className = 'car'; pTxt.append(c); }
    }, 250 + k * porLetra));
    let t = 600 + texto.length * porLetra;
    $$('#pasos li').forEach((li) => {
      relojes.push(setTimeout(() => { li.className = 'run'; }, t));
      t += 950;
      relojes.push(setTimeout(() => { li.className = 'ok'; }, t));
    });
    relojes.push(setTimeout(() => consola.classList.remove('cargando'), t + 150));
  }

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
  pintarEjemplo(0, false);
  $$('.opt').forEach((o) => o.addEventListener('click', () => pintarEjemplo(+o.dataset.i, !reducido)));
  $('#otra-vez').addEventListener('click', () => pintarEjemplo(actual, !reducido));
  let corrio = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !corrio && !reducido) { corrio = true; pintarEjemplo(0, true); }
  }, { threshold: 0.45 }).observe(consola);
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
  // Direcciones antiguas (/contacto lleva a /#contacto): se llega con el panel de contacto abierto
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
        if (ok && d?.success) terminar("¡Mensaje enviado con éxito! Gracias por comunicarte con DataOrbit. Nuestro equipo revisará tu requerimiento y te contactará a la brevedad.", true);
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
  };

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
uniform float uMix,uT,uAsp,uFase,uOrb,uS,uPx,uAlpha,uCuboA,uCuboB,uDial,uMarcas,uBarrido,uFijo;
uniform vec2 uRot,uShift,uM;
out float vL; out float vH; out float vK; out float vCubo; out float vBrillo;
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
  p=ry(rx(p*uS,uRot.x),uRot.y);
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
  vL=clamp(.5+p.z*.55,.14,1.)*uAlpha*mix(.5+.5*aS.y,aS.y,uFijo)*(1.+llega*1.5+brillo*1.6);
  vH=aS.z; vK=aK.x; vCubo=uCuboB*m+uCuboA*(1.-m); vBrillo=brillo;
}`;
    const FS = `#version 300 es
precision mediump float;
uniform vec3 uSenal,uClaro,uBlanco;
uniform float uGan;
in float vL; in float vH; in float vK; in float vCubo; in float vBrillo;
out vec4 o;
void main(){
  vec2 c=gl_PointCoord-.5;
  float r=dot(c,c);
  if(r>.25)discard;
  float a=smoothstep(.25,.05,r)*min(vL,1.6);
  vec3 col=mix(uSenal,uClaro,step(.8,vH));
  col=mix(col,mix(uClaro,uSenal,smoothstep(.25,.8,vK)),clamp(vCubo,0.,1.));
  col=mix(col,uBlanco,clamp(vBrillo,0.,1.)*.55);
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
    ['uMix', 'uT', 'uAsp', 'uFase', 'uOrb', 'uS', 'uPx', 'uAlpha', 'uCuboA', 'uCuboB', 'uDial', 'uMarcas', 'uBarrido', 'uFijo', 'uRot', 'uShift', 'uM', 'uSenal', 'uClaro', 'uBlanco', 'uGan'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform3fv(U.uSenal, COLOR.senal);
    gl.uniform3fv(U.uClaro, COLOR.claro);
    gl.uniform3fv(U.uBlanco, COLOR.blanco);

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
    for (let i = 0; i < N; i += 1) { claves[i * 2] = (i % 27) / 26; claves[i * 2 + 1] = i % 10 >= 7 ? 1 : 0; }
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
    espiral: { s: 0.64, x: 0.42, y: 0.06, rx: 0.22, ry: -0.38, orb: 0, a: 0.95, sat: 1, casa: 0, dial: 0, giro: 0 },
    logo: { s: 0.64, x: 0.42, y: 0.06, rx: 0.22, ry: -0.38, orb: 0, a: 1, sat: 1, casa: 0, dial: 0, giro: 0 },
    dispersos: { s: 0.5, x: 0.14, y: 0, rx: 0.12, ry: 0.25, orb: 0, a: 0.62, sat: 0, casa: 0, dial: 0, giro: 0 },
    // Mismos datos dispersos pero tenues, para secciones con mucho texto encima («Tres condiciones…»)
    atenuados: { s: 0.5, x: 0.14, y: 0, rx: 0.12, ry: 0.25, orb: 0, a: 0.1, sat: 0, casa: 0, dial: 0, giro: 0 },
    cumulos: { s: 0.56, x: 0.42, y: 0, rx: 0.3, ry: 0.6, orb: 0, a: 0.85, sat: 0, casa: 0, dial: 0, giro: 0 },
    cubo: { s: 0.56, x: 0.44, y: -0.02, rx: 0.48, ry: 0.7, orb: 0, a: 1, sat: 0, casa: 0, dial: 0, giro: 1 },
    dial: { s: 0.48, x: 0.44, y: 0, rx: 0.62, ry: 0.08, orb: 1, a: 0.95, sat: 0, casa: 0, dial: 1, giro: 0 },
    tenue: { s: 0.62, x: 0.3, y: 0, rx: 1.15, ry: -0.2, orb: 1, a: 0.3, sat: 0, casa: 0, dial: 0.4, giro: 0 },
    inclinadas: { s: 0.54, x: 0.46, y: 0.08, rx: 0.78, ry: -0.42, orb: 1, a: 0.6, sat: 0, casa: 0, dial: 0.6, giro: 0 },
    final: { s: 0.6, x: 0.3, y: 0, rx: 0, ry: 0, orb: 0, a: 1, sat: 1, casa: 1, dial: 0, giro: 0 },
  };
  if (movil) {
    Object.values(CAM).forEach((c) => { c.s *= 0.8; c.x *= 0.4; c.y = 0.46; c.a *= 0.75; });
    CAM.dial.s = 0.26;
    CAM.final.x = 0; CAM.final.y = 0;
    CAM.logo.a = 1; CAM.espiral.a = 1; CAM.final.a = 1;
  }
  const CLAVES = Object.keys(CAM.logo);
  const FORMA = { espiral: 'espiral', logo: 'logo', dispersos: 'dispersos', atenuados: 'dispersos', cumulos: 'cumulos', cubo: 'cubo', dial: 'dial', tenue: 'dial', inclinadas: 'dial', final: 'logo' };

  // Cada hito dice qué forma toman las partículas y en qué tramo de scroll cambian hacia ella
  let hitos = [];
  const medir = () => {
    const vh = innerHeight, lista = [];
    $$('[data-estado], [data-pasos]').forEach((el) => {
      const top = el.getBoundingClientRect().top + scrollY;
      if (el.dataset.pasos) {
        const rango = el.offsetHeight - vh;
        JSON.parse(el.dataset.pasos).forEach(([e, desde, hasta]) => lista.push({ e, ini: top + desde * rango, fin: top + hasta * rango }));
      } else {
        const fin = top - vh * 0.1;
        lista.push({ e: el.dataset.estado, ini: fin - vh, fin });
      }
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

  const finW = $('#fin-w'), fin = $('#cierre'), pie = $('#pie'), bar = $('#bar'), secFrase = $('#ahora');
  const tRec = $('#t-rec'), tEsc = $('#t-esc'), tHora = $('#t-hora'), tPts = $('#t-pts'), tFps = $('#t-fps'), prog = $('#prog');
  const horaChile = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const nf = new Intl.NumberFormat('es-CL');
  const cam = { ...CAM.logo };
  let ys = scrollY, antes = performance.now(), fase = 0, barrido = 0, tSat = 0.9, giro = 0;
  let rotX = 0, rotY = 0, mx = 9, my = 9, tmx = 9, tmy = 9, velo = 0, yAntes = scrollY;
  let cuadros = 0, marca = antes, lentas = 0, ultimaY = -1, primera = true, etapaDato = '';

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

    // Frase
    const rf = secFrase.getBoundingClientRect();
    const pf = acotar(-rf.top / Math.max(1, rf.height - vh));
    palabras.forEach((w, i) => w.style.setProperty('--k', acotar(pf * 1.1 * palabras.length - i).toFixed(3)));

    // Tipografía cinética: las cintas avanzan con el scroll, se inclinan con la velocidad y engrosan al pasar por el centro
    velo += ((y - yAntes) / Math.max(dt, 0.016) - velo) * 0.12;
    yAntes = y;
    if (cineticaVisible) {
      const rc = secCinetica.getBoundingClientRect();
      const avance = (vh - rc.top) / (vh + rc.height);
      const sesgo = reducido ? 0 : acotar(-velo * 0.006, -10, 10);
      cintas.forEach((c, i) => {
        const dir = +c.dataset.dir;
        c.style.transform = `translateX(${reducido ? -20 : -20 - dir * (avance - 0.5) * 16}%) skewX(${sesgo}deg)`;
        if (reducido) return;
        palabrasCinta[i].forEach((w) => {
          const r = w.getBoundingClientRect();
          const d = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
          w.style.setProperty('--cw', Math.round(300 + 400 * Math.exp(-d * d * 18)));
        });
      });
    }

    // Historia: se enciende palabra por palabra mientras la sección cruza la pantalla
    const rn = secNos.getBoundingClientRect();
    const pn = acotar((vh * 0.8 - rn.top) / Math.max(1, rn.height * 0.4));
    palabrasHist.forEach((w, i) => w.style.setProperty('--k', acotar(pn * 1.15 * palabrasHist.length - i).toFixed(3)));

    // Etapas
    const re = secEtapas.getBoundingClientRect();
    const pe = acotar(-re.top / Math.max(1, re.height - vh));
    const etapaAhora = pe < 0.34 ? 0 : pe < 0.67 ? 1 : 2;
    verEtapa(etapaAhora);

    // Forma de las partículas y cámara
    let { a, b, m } = estadoEn(ys);
    const intro = reducido ? 1 : acotar(ti / 3800);
    let orbIntro = 0;
    if (intro < 1 && y < vh * 0.4) { a = 'espiral'; b = 'logo'; m = curva(intro); orbIntro = 1 - curva(intro); }
    m = acotar(m);
    const k = curva(m);
    const sigue = primera || reducido ? 1 : 1 - Math.exp(-dt * 2.4);
    for (const p of CLAVES) cam[p] += (mezclar(CAM[a][p], CAM[b][p], k) - cam[p]) * sigue;
    const orb = Math.max(cam.orb, orbIntro);
    if (!reducido) {
      fase += dt * orb;
      barrido = (barrido + dt * 0.5) % TAU;
      tSat += dt * 0.34;
      giro += dt * 0.12;
      mx += (tmx - mx) * (1 - Math.exp(-dt * 5));
      my += (tmy - my) * (1 - Math.exp(-dt * 5));
      rotY += ((tmx === 9 ? 0 : tmx * 0.14) - rotY) * (1 - Math.exp(-dt * 2));
      rotX += ((tmy === 9 ? 0 : -tmy * 0.09) - rotX) * (1 - Math.exp(-dt * 2));
    }
    const fa = FORMA[a], fb = FORMA[b];
    const visIntro = reducido ? 1 : curva(acotar((ti - 1300) / 1600));
    const casaIntro = reducido ? 0 : 1 - curva(acotar((ti - 3400) / 2000));
    const sat = cam.sat * visIntro, casa = Math.max(cam.casa, casaIntro);
    const pesoMarcas = fa === 'dial' && fb === 'dial' ? 1 : fa === 'dial' ? 1 - m : fb === 'dial' ? m : 0;
    const conExtras = sat > 0.01 || cam.dial > 0.01;
    if (pintarGL && (!reducido || Math.abs(y - ultimaY) > 0.5 || primera || redibujar)) {
      if (conExtras) calcularExtras(sat, casa, cam.dial, barrido, tSat);
      pintarGL({
        fa, fb, m, cam, t: ti / 1000, fase, orb, barrido, marcas: pesoMarcas, mx, my, extras: conExtras,
        rx: cam.rx + rotX,
        ry: cam.ry + rotY + giro * cam.giro + Math.sin(ti / 4000) * 0.12 * cam.sat,
      });
    }
    ultimaY = y;
    primera = false;
    redibujar = false;

    // Dato en vivo de la etapa: bloques puestos o ángulo del barrido
    const puestos = (v) => (v < 0.14 ? 0 : Math.min(27, Math.floor(((v - 0.14) / 0.86) * 26) + 1));
    const bloques = fa === 'cubo' && fb === 'cubo' ? 27 : fb === 'cubo' ? puestos(m) : fa === 'cubo' ? 27 - puestos(m) : 0;
    const dato = etapaAhora === 1 ? `Bloques ${String(bloques).padStart(2, '0')}/27`
      : etapaAhora === 2 ? `Barrido ${String(Math.round((barrido / TAU) * 360)).padStart(3, '0')}°`
      : 'En conjunto · con cada persona';
    if (dato !== etapaDato) { etapaDato = dato; datoEl.textContent = dato; }

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
