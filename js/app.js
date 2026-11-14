/* AdminVV Taller · demo solo front. Todo vive en memoria: al recargar vuelve al inicio. */
(function () {
  "use strict";
  const C = window.CONFIG;
  const EST = { espera: "En espera", reparacion: "En reparación", listo: "Listo" };
  let seq = 1038;
  const S = {
    rol: "taller", vista: "tablero", id: null, factura: false, guia: true, vioAviso: false, borrador: { fotos: [] },
    ordenes: C.ordenes.map(o => ({ id: seq++, fotos: [], propia: false, ...o, lineas: o.lineas.map(l => [...l]) }))
  };

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => C.moneda + n.toFixed(2).replace(".", ",");
  const total = o => o.lineas.reduce((a, l) => a + l[1], 0);
  const orden = () => S.ordenes.find(o => o.id === S.id);
  const propia = () => S.ordenes.find(o => o.propia);
  const waLink = () => "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(C.mensaje);

  function toast(t) {
    const e = $("#toast"); e.textContent = t; e.classList.add("on");
    clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2600);
  }
  function ir(vista, id) { S.vista = vista; if (id !== undefined) S.id = id; S.factura = false; render(); window.scrollTo(0, 0); }

  /* ---------- guía paso a paso ---------- */
  const PASOS = ["Abre una orden", "Arma el presupuesto", "Envíalo al cliente", "Apruébalo como cliente", "Márcalo como listo", "Mira el aviso"];
  function pasoActual() {
    const o = propia();
    if (!o) return 0;
    if (o.pres === "borrador" || o.pres === "rechazado") return o.lineas.length ? 2 : 1;
    if (o.pres === "enviado") return 3;
    if (o.estado !== "listo") return 4;
    return S.vioAviso ? 6 : 5;
  }
  function guiaHTML() {
    if (!S.guia) return "";
    const p = pasoActual(), o = propia();
    if (p >= 6) return `<section class="guia fin"><h3>Eso es todo: cero llamadas.</h3>
      <p>Así trabajaría tu taller. ¿Lo quieres con tu nombre, tus precios y tus clientes?</p>
      <a class="btn wa" href="${waLink()}" target="_blank" rel="noopener">Lo quiero en mi taller</a>
      <button class="btn ghost" data-act="reiniciar">Reiniciar la demo</button></section>`;
    const txt = [
      "Empieza como en recepción: registra el carro que acaba de llegar.",
      "Agrega repuestos y mano de obra con un toque. El total se calcula solo.",
      "El presupuesto está listo. Mándaselo al cliente.",
      "Ahora ponte en el lugar del cliente y apruébalo desde su celular.",
      "El cliente aprobó. Cuando termines la reparación, márcalo como listo.",
      "Mira lo que recibe el cliente: el aviso y su factura."
    ][p];
    const enSitio = (p === 0 && S.rol === "taller" && S.vista === "nueva") ||
      ((p === 1 || p === 2 || p === 4) && S.rol === "taller" && S.vista === "orden" && o && S.id === o.id) ||
      ((p === 3 || p === 5) && S.rol === "cliente" && o && S.id === o.id);
    return `<section class="guia" aria-label="Guía de la demo">
      <div class="dots" aria-hidden="true">${PASOS.map((_, i) => `<i class="${i < p ? "ok" : i === p ? "now" : ""}"></i>`).join("")}</div>
      <div class="gt"><b>Paso ${p + 1} de ${PASOS.length} · ${PASOS[p]}</b><span>${txt}</span></div>
      <div class="ga">${enSitio ? "" : `<button class="btn sm" data-act="guiar">Ir</button>`}<button class="x" data-act="cerrarguia" aria-label="Cerrar la guía">×</button></div>
    </section>`;
  }
  function guiar() {
    const p = pasoActual(), o = propia();
    if (p === 0) { S.rol = "taller"; S.borrador = { fotos: [] }; return ir("nueva"); }
    if (p === 3 || p === 5) { S.rol = "cliente"; return ir(S.vista, o.id); }
    S.rol = "taller"; ir("orden", o.id);
  }

  /* ---------- piezas comunes ---------- */
  function chipPres(o) {
    return { borrador: '<span class="chip">Sin presupuesto</span>', enviado: '<span class="chip warn">Esperando aprobación</span>',
      aprobado: '<span class="chip ok">Aprobado</span>', rechazado: '<span class="chip red">Rechazado</span>' }[o.pres];
  }
  function fotosHTML(o, editable) {
    let h = '<div class="fotos">';
    for (let i = 0; i < 3; i++) {
      const f = o.fotos[i];
      h += `<div class="foto ${f ? "has" : ""}" ${f ? `style="background-image:url(${f})"` : ""}>${f ? "" : (editable ? "＋" : "🚗")}` +
        (editable ? `<input type="file" accept="image/*" capture="environment" data-foto="${i}" aria-label="Agregar foto ${i + 1}">` : "") + "</div>";
    }
    return h + "</div>";
  }
  function pasosOrden(o) {
    const p = [["Recibido", true], ["Presupuesto enviado", o.pres !== "borrador"], ["Aprobado por el cliente", o.pres === "aprobado"],
      ["En reparación", o.pres === "aprobado" && o.estado !== "espera"], ["Listo para retirar", o.estado === "listo"]];
    return '<ul class="steps">' + p.map(x => `<li class="${x[1] ? "done" : ""}">${x[0]}</li>`).join("") + "</ul>";
  }
  function lineasHTML(o, editable) {
    return o.lineas.map((l, i) => `<div class="li"><span>${esc(l[0])}</span><span class="row"><span class="num">${money(l[1])}</span>` +
      (editable ? `<button data-del="${i}" aria-label="Quitar ${esc(l[0])}">×</button>` : "") + "</span></div>").join("");
  }
  function mensajeHTML(o) {
    const link = `${C.dominioEjemplo}/o/${o.id}`;
    const t = o.estado === "listo"
      ? `Hola ${esc(o.cliente.split(" ")[0])}, tu ${esc(o.vehiculo)} ya está listo. Total: ${money(total(o))}. Tu factura: ${link}`
      : `Hola ${esc(o.cliente.split(" ")[0])}, ya tenemos el presupuesto de tu ${esc(o.vehiculo)}: ${money(total(o))}. Míralo con fotos y apruébalo aquí: ${link}`;
    return `<h2>MENSAJE QUE RECIBE EL CLIENTE</h2><div class="burbuja"><b>${esc(C.taller)}</b>${t}<small>Enlace de ejemplo · se envía solo</small></div>`;
  }

  /* ---------- vistas del taller ---------- */
  function vTablero() {
    let h = `<h1>Tablero de ${esc(C.taller)}</h1><p class="sub">Cada carro, en su estado. Toca una orden para abrirla.</p>
      <button class="btn" data-go="nueva">＋ Nueva orden</button><div class="kanban">`;
    for (const k in EST) {
      const l = S.ordenes.filter(o => o.estado === k);
      h += `<section><h2>${EST[k].toUpperCase()}<span>${l.length}</span></h2>` +
        (l.length ? l.map(o => `<button class="card ${o.propia ? "mia" : ""}" data-orden="${o.id}"><div class="row"><span class="placa">${esc(o.placa)}</span>${chipPres(o)}</div>
          <div class="muted">${esc(o.vehiculo)} · ${esc(o.cliente)}</div><div class="muted">${esc(o.motivo)}</div></button>`).join("")
          : '<div class="empty">Sin carros aquí</div>') + "</section>";
    }
    return h + "</div>";
  }
  function vNueva() {
    return `<button class="back" data-go="tablero">← Tablero</button><h1>Nueva orden</h1><p class="sub">Placa y fotos de cómo llegó el carro.</p>
      <form id="form" novalidate>
      <label for="f-placa">PLACA</label><input type="text" id="f-placa" maxlength="8" autocomplete="off" placeholder="AB123CD" required>
      <label for="f-veh">VEHÍCULO</label><input type="text" id="f-veh" placeholder="Marca, modelo y año" required>
      <label for="f-cli">CLIENTE</label><input type="text" id="f-cli" placeholder="Nombre del cliente" required>
      <label for="f-mot">MOTIVO</label><input type="text" id="f-mot" placeholder="¿Qué le pasa al carro?">
      <label>FOTOS DE ENTRADA (opcional)</label>${fotosHTML(S.borrador, true)}
      <button class="btn" type="submit">Abrir orden</button></form>`;
  }
  function vOrden() {
    const o = orden(), ed = o.pres === "borrador" || o.pres === "rechazado";
    let h = `<button class="back" data-go="tablero">← Tablero</button><h1>Orden #${o.id} · ${esc(o.placa)}</h1>
      <p class="sub">${esc(o.vehiculo)} · ${esc(o.cliente)} · ${esc(o.motivo)}</p>
      <div class="row chips"><span class="chip">${EST[o.estado]}</span>${chipPres(o)}</div>${fotosHTML(o, true)}<h2>PRESUPUESTO</h2>`;
    if (ed) h += `<div class="cat">${C.catalogo.map((c, i) => `<button data-add="${i}">＋ ${esc(c[0])} · ${money(c[1])}</button>`).join("")}</div>
      <div class="otro"><input type="text" id="o-nom" placeholder="Otro concepto" aria-label="Otro concepto">
      <input type="text" id="o-pre" inputmode="decimal" placeholder="Precio" aria-label="Precio"><button class="btn sm sec" data-act="otro">Agregar</button></div>`;
    h += `<div class="card mt">${o.lineas.length ? lineasHTML(o, ed) : '<div class="muted">Agrega repuestos o mano de obra con los botones de arriba.</div>'}
      <div class="total"><span>Total</span><b>${money(total(o))}</b></div></div>`;
    if (ed) h += `<button class="btn" data-act="enviar" ${o.lineas.length ? "" : "disabled"}>Enviar al cliente</button>`;
    if (o.pres === "enviado") h += mensajeHTML(o) + `<button class="btn sec" data-act="vercliente">Ver como cliente</button>`;
    if (o.pres === "aprobado" && o.estado === "espera") h += `<button class="btn" data-act="reparar">Pasar a reparación</button>`;
    if (o.pres === "aprobado" && o.estado === "reparacion") h += `<button class="btn ok" data-act="listo">Marcar como listo y avisar</button>`;
    if (o.estado === "listo") h += mensajeHTML(o) + `<button class="btn sec" data-act="vercliente">Ver como cliente</button>`;
    return h;
  }

  /* ---------- vista del cliente ---------- */
  function vCliente() {
    const o = orden() || propia() || S.ordenes[0]; S.id = o.id;
    let h = `<h1>Así lo ve tu cliente</h1><p class="sub">Le llega un enlace a su celular. No instala nada ni tiene que llamarte.</p>
      <label for="sel">ESTÁS VIENDO EL CARRO DE</label><select id="sel">${S.ordenes.map(x => `<option value="${x.id}" ${x.id === o.id ? "selected" : ""}>${esc(x.cliente)} · ${esc(x.placa)}</option>`).join("")}</select>
      <div class="telefono"><h2>${esc(C.taller).toUpperCase()} · ORDEN #${o.id}</h2>`;
    if (o.estado === "listo") h += `<div class="aviso"><div class="big">🚗</div><h3>Tu carro está listo</h3><div>${esc(o.vehiculo)} · ${esc(o.placa)}</div><b>${money(total(o))}</b></div>
      <button class="btn sec" data-act="factura">${S.factura ? "Ocultar factura" : "Ver factura"}</button>`;
    if (S.factura && o.estado === "listo") h += `<div class="card mt"><div class="row"><b>Factura #F-${o.id}</b><span class="muted">${new Date().toLocaleDateString("es")}</span></div>
      <div class="muted">${esc(C.taller)} · ${esc(o.cliente)}</div>${lineasHTML(o, false)}<div class="total"><span>Total</span><b>${money(total(o))}</b></div></div>`;
    h += `<div class="card mt"><div class="row"><span class="placa">${esc(o.placa)}</span><span class="chip">${EST[o.estado]}</span></div>
      <div class="muted mb">${esc(o.vehiculo)}</div>${pasosOrden(o)}</div>`;
    if (o.pres === "enviado") h += `<h2>PRESUPUESTO PARA APROBAR</h2>${fotosHTML(o, false)}<div class="card mt">${lineasHTML(o, false)}
      <div class="total"><span>Total</span><b>${money(total(o))}</b></div></div>
      <button class="btn ok" data-act="aprobar">Aprobar presupuesto</button><button class="btn ghost" data-act="rechazar">Rechazar</button>`;
    if (o.pres === "borrador") h += `<div class="empty">El taller todavía está preparando tu presupuesto.</div>`;
    if (o.pres === "rechazado") h += `<div class="empty">Rechazaste el presupuesto. El taller te enviará uno nuevo.</div>`;
    return h + "</div>";
  }

  function render() {
    $("#r-taller").setAttribute("aria-pressed", S.rol === "taller");
    $("#r-cliente").setAttribute("aria-pressed", S.rol === "cliente");
    const cuerpo = S.rol === "cliente" ? vCliente() : S.vista === "nueva" ? vNueva() : S.vista === "orden" && orden() ? vOrden() : vTablero();
    $("#app").className = "wrap " + (S.rol === "taller" && cuerpo.includes("kanban") ? "ancho" : "");
    $("#app").innerHTML = guiaHTML() + cuerpo + (S.guia ? "" : `<button class="btn ghost" data-act="verguia">Mostrar la guía paso a paso</button>`);
  }

  /* ---------- acciones ---------- */
  const ACC = {
    enviar(o) { o.pres = "enviado"; toast("Presupuesto enviado al cliente"); },
    aprobar(o) { o.pres = "aprobado"; o.estado = "reparacion"; toast("Aprobado. El taller ya fue avisado"); },
    rechazar(o) { o.pres = "rechazado"; toast("Presupuesto rechazado"); },
    reparar(o) { o.estado = "reparacion"; toast("El carro pasó a reparación"); },
    listo(o) { o.estado = "listo"; toast("Carro listo. Aviso y factura enviados"); },
    factura(o) { S.factura = !S.factura; if (o.propia) S.vioAviso = true; },
    vercliente() { S.rol = "cliente"; window.scrollTo(0, 0); },
    cerrarguia() { S.guia = false; }, verguia() { S.guia = true; window.scrollTo(0, 0); },
    reiniciar() { location.reload(); },
    otro(o) {
      const n = $("#o-nom").value.trim(), p = parseFloat($("#o-pre").value.replace(",", "."));
      if (!n || !(p > 0)) { toast("Escribe el concepto y un precio mayor que cero"); (!n ? $("#o-nom") : $("#o-pre")).focus(); return false; }
      o.lineas.push([n, Math.round(p * 100) / 100]);
    }
  };
  document.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.id === "r-taller") { S.rol = "taller"; if (S.vista === "orden" && !orden()) S.vista = "tablero"; S.factura = false; render(); return; }
    if (t.id === "r-cliente") { S.rol = "cliente"; S.factura = false; render(); window.scrollTo(0, 0); return; }
    if (t.dataset.go) { if (t.dataset.go === "nueva") S.borrador = { fotos: [] }; ir(t.dataset.go); return; }
    if (t.dataset.orden) { ir("orden", +t.dataset.orden); return; }
    const o = orden();
    if (t.dataset.add !== undefined) { o.lineas.push([...C.catalogo[+t.dataset.add]]); render(); return; }
    if (t.dataset.del !== undefined) { o.lineas.splice(+t.dataset.del, 1); render(); return; }
    if (t.dataset.act === "guiar") { guiar(); return; }
    if (t.dataset.act && ACC[t.dataset.act](o) !== false) render();
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.id === "sel") { S.id = +t.value; S.factura = false; render(); return; }
    if (t.dataset.foto !== undefined && t.files[0]) {
      const nueva = S.rol === "taller" && S.vista === "nueva", dest = nueva ? S.borrador : orden(), i = +t.dataset.foto, r = new FileReader();
      r.onload = () => {
        dest.fotos[i] = r.result;
        if (nueva) { const d = t.parentElement; d.classList.add("has"); d.style.backgroundImage = `url(${r.result})`; d.firstChild.textContent = ""; }
        else render();
      };
      r.readAsDataURL(t.files[0]);
    }
  });
  document.addEventListener("submit", e => {
    e.preventDefault();
    const placa = $("#f-placa").value.trim().toUpperCase(), veh = $("#f-veh").value.trim(), cli = $("#f-cli").value.trim();
    if (!placa || !veh || !cli) { toast("Completa placa, vehículo y cliente"); (!placa ? $("#f-placa") : !veh ? $("#f-veh") : $("#f-cli")).focus(); return; }
    const o = { id: seq++, placa, vehiculo: veh, cliente: cli, motivo: $("#f-mot").value.trim() || "Revisión", fotos: S.borrador.fotos,
      lineas: [], estado: "espera", pres: "borrador", propia: !propia() };
    S.ordenes.push(o); toast("Orden #" + o.id + " abierta"); ir("orden", o.id);
  });

  $("#wa").href = waLink();
  render();
})();
