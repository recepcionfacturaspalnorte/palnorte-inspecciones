// ============================================================
//  APP PRINCIPAL — PALNORTE Inspecciones Ambientales
// ============================================================

let currentUser = null;
let inspecciones = [];
let answers = {};
let catChartInst = null;
let trendChartInst = null;
let unsubscribe = null;

// ─── LOGIN ───────────────────────────────────────────────────
function doLogin() {
  const user = document.getElementById('login-inspector').value;
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');

  if (!user) { err.textContent = 'Selecciona el inspector'; return; }
  if (!pass)  { err.textContent = 'Ingresa la contraseña'; return; }

  if (USUARIOS[user] !== pass) {
    err.textContent = 'Contraseña incorrecta';
    return;
  }

  currentUser = user;
  err.textContent = '';
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('current-user').textContent = user;
  document.getElementById('f-inspector').value = user;
  document.getElementById('f-fecha').value = new Date().toISOString().split('T')[0];

  updateTopbarDate();
  buildChecklist();
  startFirestoreListener();
}

function doLogout() {
  if (unsubscribe) unsubscribe();
  currentUser = null;
  inspecciones = [];
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').textContent = '';
}

function updateTopbarDate() {
  const d = new Date();
  document.getElementById('topbar-date').textContent =
    d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── FIRESTORE LISTENER (tiempo real) ────────────────────────
function startFirestoreListener() {
  setSyncStatus('loading');
  try {
    unsubscribe = db.collection('inspecciones')
      .orderBy('fecha', 'desc')
      .onSnapshot(snapshot => {
        inspecciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSyncStatus('ok');
        updateAlertBadge();
        // Refrescar la página activa
        const active = document.querySelector('.nav-item.active');
        if (active) {
          const page = active.dataset.page;
          if (page === 'dashboard') renderDashboard();
          if (page === 'historial') renderHistorial();
          if (page === 'alertas')   renderAlertas();
          if (page === 'areas')     renderAreas();
        }
      }, err => {
        console.error('Firestore error:', err);
        setSyncStatus('error');
      });
  } catch(e) {
    setSyncStatus('error');
    console.error(e);
  }
}

function setSyncStatus(state) {
  const el = document.getElementById('sync-status');
  if (state === 'ok') {
    el.className = 'sync-badge sync-ok';
    el.innerHTML = '<i class="ti ti-cloud-check"></i> Sincronizado';
  } else if (state === 'loading') {
    el.className = 'sync-badge sync-loading';
    el.innerHTML = '<i class="ti ti-cloud-upload"></i> Conectando...';
  } else {
    el.className = 'sync-badge sync-err';
    el.innerHTML = '<i class="ti ti-cloud-off"></i> Sin conexión';
  }
}

// ─── NAVEGACIÓN ──────────────────────────────────────────────
function switchPage(btn) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  btn.classList.add('active');
  const page = btn.dataset.page;
  const el = document.getElementById('page-' + page);
  el.classList.remove('hidden');
  el.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', nueva: 'Nueva inspección',
    historial: 'Historial', alertas: 'Alertas', areas: 'Estado áreas'
  };
  document.getElementById('page-title').textContent = titles[page] || '';

  if (page === 'dashboard') renderDashboard();
  if (page === 'historial') renderHistorial();
  if (page === 'alertas')   renderAlertas();
  if (page === 'areas')     renderAreas();

  // Cerrar sidebar en móvil
  document.querySelector('.sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ─── CHECKLIST ───────────────────────────────────────────────
function buildChecklist() {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';
  let qNum = 1;
  CATEGORIAS.forEach((cat, ci) => {
    const wrap = document.createElement('div');
    wrap.className = 'q-group';
    wrap.innerHTML = `
      <div class="q-group-header">
        <i class="ti ${cat.icon}"></i>
        <span>${cat.name}</span>
        <span class="badge badge-gray" id="cat-prog-${ci}">0/${cat.preguntas.length}</span>
      </div>
      <div class="q-group-body" id="cat-body-${ci}"></div>`;
    const body = wrap.querySelector(`#cat-body-${ci}`);
    cat.preguntas.forEach((q, qi) => {
      const key = `${ci}-${qi}`;
      const row = document.createElement('div');
      row.className = 'q-item';
      row.innerHTML = `
        <span class="q-num">${qNum}</span>
        <span class="q-text">${q}</span>
        <div class="q-opts">
          <button class="opt-btn" id="btn-${key}-C"  onclick="setAnswer('${key}','C')">Cumple</button>
          <button class="opt-btn" id="btn-${key}-P"  onclick="setAnswer('${key}','P')">Parcial</button>
          <button class="opt-btn" id="btn-${key}-N"  onclick="setAnswer('${key}','N')">No cumple</button>
          <button class="opt-btn" id="btn-${key}-NA" onclick="setAnswer('${key}','NA')">N/A</button>
        </div>`;
      body.appendChild(row);
      qNum++;
    });
    container.appendChild(wrap);
  });
}

function setAnswer(key, val) {
  answers[key] = val;
  const ci = parseInt(key.split('-')[0]);
  ['C','P','N','NA'].forEach(v => {
    const btn = document.getElementById(`btn-${key}-${v}`);
    if (btn) btn.className = 'opt-btn' + (v === val ? ` sel-${v}` : '');
  });
  updateProgress();
  updateCatProgress(ci);
}

function updateCatProgress(ci) {
  const cat = CATEGORIAS[ci];
  const answered = cat.preguntas.filter((_, qi) => answers[`${ci}-${qi}`]).length;
  const badge = document.getElementById(`cat-prog-${ci}`);
  if (badge) badge.textContent = `${answered}/${cat.preguntas.length}`;
}

function updateProgress() {
  const total = 33;
  const answered = Object.keys(answers).length;
  document.getElementById('prog-count').textContent = answered + ' / ' + total;
  document.getElementById('prog-bar').style.width = Math.round(answered / total * 100) + '%';
  const score = calcScore(answers);
  const el = document.getElementById('score-preview');
  if (score !== null) {
    el.textContent = score.toFixed(1) + '%';
    el.style.color = scoreColor(score);
  } else {
    el.textContent = '—';
    el.style.color = '';
  }
}

// ─── GUARDAR INSPECCIÓN ───────────────────────────────────────
async function guardarInspeccion() {
  const area       = document.getElementById('f-area').value;
  const responsable = document.getElementById('f-responsable').value.trim();
  const fecha      = document.getElementById('f-fecha').value;

  if (!area)       { showToast('Selecciona el área inspeccionada'); return; }
  if (!responsable){ showToast('Ingresa el responsable del área'); return; }
  if (!fecha)      { showToast('Selecciona la fecha de inspección'); return; }

  const score = calcScore(answers);
  if (score === null) { showToast('Responde al menos una pregunta del checklist'); return; }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Guardando...';

  const data = {
    area, responsable, fecha,
    inspector: currentUser,
    answers: { ...answers },
    score,
    catScores: calcCatScores(answers),
    obs:       document.getElementById('f-obs').value.trim(),
    hallazgos: document.getElementById('f-hallazgos').value.trim(),
    mejoras:   document.getElementById('f-mejoras').value.trim(),
    plan:      document.getElementById('f-plan').value.trim(),
    fotos:     document.getElementById('f-fotos').value.trim(),
    creadoEn:  firebase.firestore.FieldValue.serverTimestamp(),
    version:   'GAM-01-FO-15-v01'
  };

  try {
    const docRef = await db.collection('inspecciones').add(data);
    showToast('✓ Inspección guardada — Puntaje: ' + score.toFixed(1) + '%');
    document.getElementById('save-msg').textContent = '✓ Guardado correctamente';
    setTimeout(() => document.getElementById('save-msg').textContent = '', 4000);
    // Envío automático si hay correo registrado para el área
    envioAutomaticoCorreo(data, docRef.id);
    limpiarFormulario();
  } catch(e) {
    console.error(e);
    showToast('Error al guardar. Verifica la conexión.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-device-floppy"></i> Guardar inspección';
  }
}

function limpiarFormulario() {
  answers = {};
  document.getElementById('f-area').value = '';
  document.getElementById('f-responsable').value = '';
  document.getElementById('f-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('f-obs').value = '';
  document.getElementById('f-hallazgos').value = '';
  document.getElementById('f-mejoras').value = '';
  document.getElementById('f-plan').value = '';
  document.getElementById('f-fotos').value = '';
  document.querySelectorAll('.opt-btn').forEach(b => b.className = 'opt-btn');
  CATEGORIAS.forEach((_, ci) => {
    const badge = document.getElementById(`cat-prog-${ci}`);
    if (badge) badge.textContent = `0/${CATEGORIAS[ci].preguntas.length}`;
  });
  updateProgress();
}

// ─── DASHBOARD ───────────────────────────────────────────────
function refreshDashboard() { renderDashboard(); }

function renderDashboard() {
  if (!inspecciones.length) {
    document.getElementById('m-total').textContent = '0';
    document.getElementById('m-avg').textContent = '—';
    document.getElementById('m-crit').textContent = '0';
    document.getElementById('m-reinsp').textContent = '0';
    document.getElementById('area-scores-list').innerHTML =
      '<div class="empty"><i class="ti ti-clipboard-x"></i>Aún no hay inspecciones registradas</div>';
    if (catChartInst) { catChartInst.destroy(); catChartInst = null; }
    if (trendChartInst) { trendChartInst.destroy(); trendChartInst = null; }
    return;
  }

  document.getElementById('m-total').textContent = inspecciones.length;

  const avg = inspecciones.reduce((s, i) => s + i.score, 0) / inspecciones.length;
  document.getElementById('m-avg').textContent = avg.toFixed(1) + '%';

  // Última por área
  const latestByArea = {};
  [...inspecciones].reverse().forEach(i => latestByArea[i.area] = i);
  const latest = Object.values(latestByArea);

  const crit   = latest.filter(i => i.score < UMBRAL_CRITICO).length;
  const reinsp = latest.filter(i => i.score < UMBRAL_REINSPECCION).length;
  document.getElementById('m-crit').textContent = crit;
  document.getElementById('m-reinsp').textContent = reinsp;

  // Lista área scores
  const sorted = latest.sort((a, b) => a.score - b.score);
  document.getElementById('area-scores-list').innerHTML = sorted.map(i => `
    <div class="area-row">
      <span class="area-name" title="${i.area}">${i.area}</span>
      <div class="score-bar-wrap">
        <div class="score-bar-inner" style="width:${i.score}%;background:${scoreColor(i.score)}"></div>
      </div>
      <span class="score-num" style="color:${scoreColor(i.score)}">${i.score.toFixed(0)}%</span>
      ${scoreBadge(i.score)}
    </div>`).join('');

  renderCatChart();
  renderTrendChart();
}

function renderCatChart() {
  if (!inspecciones.length) return;
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const tc = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const gc = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  // Promedio por categoría
  const catAvgs = CATEGORIAS.map((cat, ci) => {
    const scores = inspecciones
      .map(i => i.catScores ? i.catScores[ci] : null)
      .filter(v => v !== null && v !== undefined);
    if (!scores.length) return 0;
    return scores.reduce((s, v) => s + v, 0) / scores.length;
  });

  if (catChartInst) catChartInst.destroy();
  catChartInst = new Chart(document.getElementById('cat-chart'), {
    type: 'bar',
    data: {
      labels: CATEGORIAS.map(c => c.name.length > 20 ? c.name.substring(0, 20) + '…' : c.name),
      datasets: [{
        label: '% Cumplimiento',
        data: catAvgs.map(v => parseFloat(v.toFixed(1))),
        backgroundColor: catAvgs.map(v => scoreColor(v) + 'cc'),
        borderColor:     catAvgs.map(v => scoreColor(v)),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } } },
      scales: {
        x: { ticks: { color: tc, font: { size: 10 }, maxRotation: 40, autoSkip: false }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, min: 0, max: 100 }
      }
    }
  });
}

function renderTrendChart() {
  if (inspecciones.length < 2) return;
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const tc = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const gc = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  const sorted = [...inspecciones].sort((a, b) => a.fecha > b.fecha ? 1 : -1).slice(-20);
  if (trendChartInst) trendChartInst.destroy();
  trendChartInst = new Chart(document.getElementById('trend-chart'), {
    type: 'line',
    data: {
      labels: sorted.map(i => formatDate(i.fecha)),
      datasets: [{
        label: 'Puntaje',
        data: sorted.map(i => i.score),
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.08)',
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: sorted.map(i => scoreColor(i.score)),
        fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } } },
      scales: {
        x: { ticks: { color: tc, font: { size: 10 }, maxRotation: 35, autoSkip: true }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, min: 0, max: 100 }
      }
    }
  });
}

// ─── HISTORIAL ───────────────────────────────────────────────
function renderHistorial() {
  const areaFilt  = document.getElementById('filter-area').value;
  const scoreFilt = document.getElementById('filter-score').value;
  const inspFilt  = document.getElementById('filter-inspector').value;

  let list = inspecciones.filter(i => {
    if (areaFilt && i.area !== areaFilt) return false;
    if (inspFilt && i.inspector !== inspFilt) return false;
    if (scoreFilt) {
      if (scoreFilt === 'critico'   && i.score >= 50)  return false;
      if (scoreFilt === 'bajo'      && (i.score < 50 || i.score >= 70)) return false;
      if (scoreFilt === 'aceptable' && (i.score < 70 || i.score >= 90)) return false;
      if (scoreFilt === 'bueno'     && i.score < 90)   return false;
    }
    return true;
  });

  const el = document.getElementById('historial-list');
  if (!list.length) {
    el.innerHTML = '<div class="empty"><i class="ti ti-search-off"></i>No hay registros con los filtros seleccionados</div>';
    return;
  }
  el.innerHTML = list.map(i => `
    <div class="insp-card">
      <div class="insp-card-header">
        <div>
          <div class="insp-area">${i.area}</div>
          <div class="insp-meta">
            <span><i class="ti ti-calendar"></i> ${formatDate(i.fecha)}</span>
            <span><i class="ti ti-user"></i> ${i.inspector}</span>
            <span><i class="ti ti-id-badge"></i> Resp: ${i.responsable}</span>
          </div>
        </div>
        <div class="insp-right">
          <span class="insp-score" style="color:${scoreColor(i.score)}">${i.score.toFixed(1)}%</span>
          ${scoreBadge(i.score)}
          <button class="btn-secondary sm" onclick="verDetalle('${i.id}')"><i class="ti ti-eye"></i> Ver</button>
          <button class="btn-secondary sm" onclick="abrirModalCorreo('${i.id}')" style="color:var(--blue-text);border-color:var(--blue-text)"><i class="ti ti-mail"></i> Enviar</button>
          <button class="btn-danger" onclick="eliminarInspeccion('${i.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      ${i.hallazgos ? `<div class="insp-hallazgos"><strong>Hallazgos:</strong> ${i.hallazgos}</div>` : ''}
    </div>`).join('');
}

// ─── DETALLE MODAL ───────────────────────────────────────────
function verDetalle(id) {
  const i = inspecciones.find(x => x.id === id);
  if (!i) return;
  const catS = i.catScores || calcCatScores(i.answers || {});

  document.getElementById('modal-title').textContent = i.area;
  document.getElementById('modal-meta').innerHTML =
    `<i class="ti ti-calendar"></i> ${formatDate(i.fecha)} &nbsp;·&nbsp; Inspector: ${i.inspector} &nbsp;·&nbsp; Resp: ${i.responsable}`;

  const catRows = CATEGORIAS.map((cat, ci) => {
    const s = catS[ci];
    return `<div class="cat-score-row">
      <span class="cat-score-name">${cat.name}</span>
      <div class="cat-score-bar"><div class="cat-score-fill" style="width:${s||0}%;background:${scoreColor(s)}"></div></div>
      <span class="cat-score-val">${s !== null && s !== undefined ? s.toFixed(0)+'%' : 'N/A'}</span>
    </div>`;
  }).join('');

  const field = (label, val) => val ? `
    <div class="modal-section">
      <div class="modal-section-title">${label}</div>
      <div class="modal-section-body">${val}</div>
    </div>` : '';

  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.25rem">
      <span style="font-size:32px;font-weight:600;font-family:var(--font-mono);color:${scoreColor(i.score)}">${i.score.toFixed(1)}%</span>
      ${scoreBadge(i.score)}
      <span style="font-size:12px;color:var(--text-muted)">${scoreLabel(i.score)}</span>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Puntaje por categoría</div>
      <div>${catRows}</div>
    </div>
    ${field('Observaciones generales', i.obs)}
    ${field('Hallazgos encontrados', i.hallazgos)}
    ${field('Oportunidades de mejora', i.mejoras)}
    ${field('Plan de acción y seguimiento', i.plan)}
    ${field('Evidencias fotográficas', i.fotos)}
    <div style="margin-top:1.25rem;border-top:1px solid var(--border);padding-top:1rem;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn-primary" onclick="generarInforme('${id}')"><i class="ti ti-file-text"></i> Generar informe formal</button>
      <button class="btn-secondary" onclick="abrirModalCorreo('${id}'); closeModal()"><i class="ti ti-mail"></i> Enviar por correo</button>
      <button class="btn-secondary" onclick="exportarPDF('${id}')"><i class="ti ti-download"></i> Descargar resumen</button>
    </div>`;

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function generarInforme(id) {
  const i = inspecciones.find(x => x.id === id);
  if (!i) return;
  const catS = i.catScores || calcCatScores(i.answers || {});
  const catLines = CATEGORIAS.map((cat, ci) => `• ${cat.name}: ${catS[ci] !== null ? catS[ci].toFixed(0)+'%' : 'N/A'}`).join('\n');
  closeModal();
  // Abrir Claude para generar el informe
  const prompt = `Por favor genera un informe formal de inspección ambiental en español con la siguiente información:\n\n**Encabezado:** PALNORTE S.A.S — Lista de chequeo inspecciones mensuales | Código: GAM-01-FO-15 | Versión: 01\n\n**Área inspeccionada:** ${i.area}\n**Fecha:** ${formatDate(i.fecha)}\n**Inspector(a):** ${i.inspector}\n**Responsable del área:** ${i.responsable}\n**Puntaje global:** ${i.score.toFixed(1)}% — ${scoreLabel(i.score)}\n\n**Puntaje por categoría:**\n${catLines}\n\n**Observaciones generales:** ${i.obs || 'N/A'}\n**Hallazgos encontrados:** ${i.hallazgos || 'N/A'}\n**Oportunidades de mejora:** ${i.mejoras || 'N/A'}\n**Plan de acción y seguimiento:** ${i.plan || 'N/A'}\n**Evidencias:** ${i.fotos || 'N/A'}\n\nEl informe debe ser formal, estructurado con secciones claras, listo para enviar por correo al líder del área. Incluye recomendaciones según el puntaje obtenido.`;
  window.parent.postMessage({ type: 'sendPrompt', text: prompt }, '*');
}

function exportarPDF(id) {
  const i = inspecciones.find(x => x.id === id);
  if (!i) return;
  const catS = i.catScores || calcCatScores(i.answers || {});
  const catLines = CATEGORIAS.map((cat, ci) =>
    `${cat.name}: ${catS[ci] !== null ? catS[ci].toFixed(0)+'%' : 'N/A'}`).join('\n');
  const txt = `INSPECCIÓN AMBIENTAL - PALNORTE S.A.S
GAM-01-FO-15 v01
${'='.repeat(50)}
Área: ${i.area}
Fecha: ${formatDate(i.fecha)}
Inspector: ${i.inspector}
Responsable: ${i.responsable}
Puntaje global: ${i.score.toFixed(1)}% (${scoreLabel(i.score)})
${'─'.repeat(50)}
PUNTAJE POR CATEGORÍA:
${catLines}
${'─'.repeat(50)}
OBSERVACIONES: ${i.obs || 'N/A'}
HALLAZGOS: ${i.hallazgos || 'N/A'}
OPORTUNIDADES DE MEJORA: ${i.mejoras || 'N/A'}
PLAN DE ACCIÓN: ${i.plan || 'N/A'}
EVIDENCIAS: ${i.fotos || 'N/A'}
${'='.repeat(50)}`;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
  a.download = `inspeccion_${i.area.replace(/\s+/g,'_')}_${i.fecha}.txt`;
  a.click();
}

// ─── ELIMINAR ─────────────────────────────────────────────────
async function eliminarInspeccion(id) {
  if (!confirm('¿Eliminar esta inspección? Esta acción no se puede deshacer.')) return;
  try {
    await db.collection('inspecciones').doc(id).delete();
    showToast('Inspección eliminada');
  } catch(e) {
    showToast('Error al eliminar');
  }
}

// ─── EXPORTAR CSV ─────────────────────────────────────────────
function exportarCSV() {
  const rows = [['ID','Área','Fecha','Inspector','Responsable','Puntaje (%)','Nivel','Hallazgos','Oportunidades de mejora','Plan de acción']];
  inspecciones.forEach(i => rows.push([
    i.id, i.area, i.fecha, i.inspector, i.responsable,
    i.score, scoreLabel(i.score),
    i.hallazgos || '', i.mejoras || '', i.plan || ''
  ]));
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
  a.download = 'inspecciones_ambientales_palnorte.csv';
  a.click();
}

// ─── ALERTAS ──────────────────────────────────────────────────
function renderAlertas() {
  const latestByArea = {};
  [...inspecciones].reverse().forEach(i => latestByArea[i.area] = i);

  const criticas = Object.values(latestByArea)
    .filter(i => i.score < UMBRAL_REINSPECCION)
    .sort((a, b) => a.score - b.score);

  const al = document.getElementById('alertas-list');
  if (!criticas.length) {
    al.innerHTML = '<div class="empty" style="color:var(--green)"><i class="ti ti-circle-check"></i>Todas las áreas están por encima del umbral</div>';
  } else {
    al.innerHTML = criticas.map(i => `
      <div class="alert-item ${i.score < UMBRAL_CRITICO ? 'alert-danger' : 'alert-warning'}">
        <i class="ti ${i.score < UMBRAL_CRITICO ? 'ti-alert-circle' : 'ti-alert-triangle'}"></i>
        <span class="alert-name">${i.area}</span>
        <span class="alert-score">${i.score.toFixed(1)}%</span>
        <span style="font-size:11px">${formatDate(i.fecha)}</span>
        <button class="btn-secondary sm" onclick="iniciarReinspeccion('${i.area}')">
          <i class="ti ti-clipboard-plus"></i> Reinspeccionar
        </button>
      </div>`).join('');
  }

  // Sin inspección reciente
  const sin30 = AREAS.filter(a => {
    const last = latestByArea[a];
    return !last || daysSince(last.fecha) > DIAS_ALERTA;
  });
  const nl = document.getElementById('no-inspect-list');
  if (!sin30.length) {
    nl.innerHTML = '<div class="empty" style="color:var(--green)"><i class="ti ti-circle-check"></i>Todas inspeccionadas recientemente</div>';
  } else {
    nl.innerHTML = sin30.map(a => {
      const last = latestByArea[a];
      return `<div class="alert-item alert-warning">
        <i class="ti ti-clock-exclamation"></i>
        <span class="alert-name">${a}</span>
        ${last ? `<span style="font-size:11px">${formatDate(last.fecha)}</span>` : '<span class="badge badge-red">Sin registro</span>'}
        <button class="btn-secondary sm" onclick="iniciarReinspeccion('${a}')">
          <i class="ti ti-clipboard-plus"></i> Inspeccionar
        </button>
      </div>`;
    }).join('');
  }
}

function iniciarReinspeccion(area) {
  document.getElementById('f-area').value = area;
  document.getElementById('f-fecha').value = new Date().toISOString().split('T')[0];
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('[data-page="nueva"]');
  btn.classList.add('active');
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  document.getElementById('page-nueva').classList.remove('hidden');
  document.getElementById('page-nueva').classList.add('active');
  document.getElementById('page-title').textContent = 'Nueva inspección';
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo(0, 0);
}

// ─── ESTADO ÁREAS ─────────────────────────────────────────────
function renderAreas() {
  const latestByArea = {};
  [...inspecciones].reverse().forEach(i => latestByArea[i.area] = i);

  const grid = document.getElementById('areas-grid');
  grid.innerHTML = AREAS.map(area => {
    const last = latestByArea[area];
    const score = last ? last.score : null;
    const color = scoreColor(score);
    const days = last ? daysSince(last.fecha) : null;
    return `
      <div class="area-state-card" style="border-top:3px solid ${color}">
        <div class="area-state-name">${area}</div>
        ${score !== null
          ? `<div class="area-state-score" style="color:${color}">${score.toFixed(0)}%</div>
             <div>${scoreBadge(score)}</div>
             <div class="area-state-date"><i class="ti ti-calendar" style="font-size:11px"></i> ${formatDate(last.fecha)} ${days > DIAS_ALERTA ? '<span class="badge badge-red" style="font-size:9px">Vencida</span>' : ''}</div>`
          : `<div class="area-state-score" style="color:var(--text-hint)">—</div>
             <span class="badge badge-gray">Sin inspección</span>`
        }
        ${last ? `<button class="btn-secondary sm" style="margin-top:.5rem;width:100%;justify-content:center" onclick="verDetalle('${last.id}')"><i class="ti ti-eye"></i> Ver última</button>` : ''}
      </div>`;
  }).join('');
}

// ─── ALERTA BADGE ─────────────────────────────────────────────
function updateAlertBadge() {
  const latestByArea = {};
  [...inspecciones].reverse().forEach(i => latestByArea[i.area] = i);
  const n = Object.values(latestByArea).filter(i => i.score < UMBRAL_REINSPECCION).length;
  const badge = document.getElementById('alert-count');
  if (n > 0) {
    badge.textContent = n;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ─── TOAST ────────────────────────────────────────────────────
function showToast(msg, duration = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), duration);
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateTopbarDate();
  setInterval(updateTopbarDate, 60000);
  emailjs.init(EMAILJS_PUBLIC_KEY);
});

// ─── EMAIL ────────────────────────────────────────────────────
let emailInspeccionId = null;

function abrirModalCorreo(id) {
  const i = inspecciones.find(x => x.id === id);
  if (!i) return;
  emailInspeccionId = id;
  document.getElementById('email-modal-meta').textContent = i.area + ' — ' + formatDate(i.fecha) + ' — ' + i.score.toFixed(1) + '%';
  // Pre-llenar si hay correo registrado
  const correoRegistrado = CORREOS_AREAS[i.area] || '';
  document.getElementById('email-to').value = correoRegistrado;
  document.getElementById('email-cc').value = '';
  document.getElementById('email-msg').value = '';
  document.getElementById('email-send-msg').textContent = '';
  document.getElementById('email-modal-overlay').classList.remove('hidden');
}

function closeEmailModal() {
  document.getElementById('email-modal-overlay').classList.add('hidden');
  emailInspeccionId = null;
}

async function confirmarEnvioCorreo() {
  const to = document.getElementById('email-to').value.trim();
  if (!to) { document.getElementById('email-send-msg').innerHTML = '<span style="color:var(--red)">Ingresa el correo del encargado</span>'; return; }

  const i = inspecciones.find(x => x.id === emailInspeccionId);
  if (!i) return;

  const btn = document.getElementById('btn-send-email');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Enviando...';

  const catS = i.catScores || calcCatScores(i.answers || {});
  const catLineas = CATEGORIAS.map((cat, ci) => {
    const s = catS[ci];
    return `• ${cat.name}: ${s !== null ? s.toFixed(0)+'%' : 'N/A'}`;
  }).join('\n');

  const msgExtra = document.getElementById('email-msg').value.trim();
  const cc = document.getElementById('email-cc').value.trim();

  const params = {
    to_email:    to,
    cc_email:    cc || to,
    area:        i.area,
    responsable: i.responsable,
    fecha:       formatDate(i.fecha),
    inspector:   i.inspector,
    score:       i.score.toFixed(1),
    nivel:       scoreLabel(i.score),
    categorias:  catLineas,
    obs:         i.obs         || 'Sin observaciones registradas.',
    hallazgos:   i.hallazgos   || 'Sin hallazgos registrados.',
    mejoras:     i.mejoras     || 'Sin oportunidades de mejora registradas.',
    plan:        i.plan        || 'Sin plan de acción registrado.',
    mensaje_extra: msgExtra    || ''
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    document.getElementById('email-send-msg').innerHTML = '<span style="color:var(--green)">✓ Informe enviado correctamente a ' + to + '</span>';
    // Guardar en Firestore que se envió correo
    await db.collection('inspecciones').doc(emailInspeccionId).update({
      correoEnviado: true,
      correoEnviadoA: to,
      correoEnviadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✓ Informe enviado a ' + to);
    setTimeout(() => closeEmailModal(), 2500);
  } catch(e) {
    console.error(e);
    document.getElementById('email-send-msg').innerHTML = '<span style="color:var(--red)">Error al enviar. Verifica el correo e intenta de nuevo.</span>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-send"></i> Enviar informe';
  }
}

// Envío automático al guardar (si hay correo registrado para el área)
async function envioAutomaticoCorreo(inspeccion, docId) {
  const correo = CORREOS_AREAS[inspeccion.area];
  if (!correo) return; // Sin correo registrado, no envía

  const catS = inspeccion.catScores || [];
  const catLineas = CATEGORIAS.map((cat, ci) => {
    const s = catS[ci];
    return `• ${cat.name}: ${s !== null && s !== undefined ? s.toFixed(0)+'%' : 'N/A'}`;
  }).join('\n');

  const params = {
    to_email:      correo,
    cc_email:      correo,
    area:          inspeccion.area,
    responsable:   inspeccion.responsable,
    fecha:         formatDate(inspeccion.fecha),
    inspector:     inspeccion.inspector,
    score:         inspeccion.score.toFixed(1),
    nivel:         scoreLabel(inspeccion.score),
    categorias:    catLineas,
    obs:           inspeccion.obs       || 'Sin observaciones.',
    hallazgos:     inspeccion.hallazgos || 'Sin hallazgos.',
    mejoras:       inspeccion.mejoras   || 'Sin oportunidades de mejora.',
    plan:          inspeccion.plan      || 'Sin plan de acción.',
    mensaje_extra: ''
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    await db.collection('inspecciones').doc(docId).update({
      correoEnviado: true, correoEnviadoA: correo,
      correoEnviadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✓ Informe enviado automáticamente a ' + correo);
  } catch(e) {
    console.error('Error envío automático:', e);
  }
}
