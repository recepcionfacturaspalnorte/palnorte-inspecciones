// ============================================================
//  DATOS: Categorías, preguntas y áreas
//  PALNORTE — Sistema de Inspecciones Ambientales
// ============================================================

const AREAS = [
  'Orgánicos','Laboratorio de orgánicos','Casa hotel',
  'Edificio de sostenibilidad','Garita','Containers','Báscula',
  'Operaciones','Producción','Cuarto control de motores',
  'Laboratorio de calidad',"TIC's",'Talento humano','Archivo',
  'Calidad','Comunicaciones','SST','Mantenimiento',
  'Cuarto herramientas','Taller mecánico','Taller eléctrico',
  'Almacén','Lagunas','Contratistas Metalcat-Ofensi',
  'Oficina administrativa Cúcuta'
];

const CATEGORIAS = [
  {
    id: 'residuos',
    name: 'Gestión integral de residuos',
    icon: 'ti-recycle',
    preguntas: [
      '¿El área realiza una correcta separación y clasificación de residuos?',
      '¿Los residuos son entregados al área de Gestión Ambiental?',
      '¿Se utilizan adecuadamente los recipientes o puntos ecológicos?',
      '¿Los recipientes se encuentran identificados correctamente?',
      '¿El volumen de residuos generados se mantiene controlado?',
      '¿Los residuos son entregados en los horarios establecidos?',
      '¿El área conoce los tipos de residuos que genera?',
      '¿El almacenamiento temporal de residuos se realiza adecuadamente?',
      '¿Se evidencia orden y limpieza en el manejo de residuos?'
    ]
  },
  {
    id: 'agua',
    name: 'Uso eficiente del recurso hídrico',
    icon: 'ti-droplet',
    preguntas: [
      '¿El área implementa acciones para optimizar el uso del agua?',
      '¿El personal cierra la llave mientras se jabona las manos?',
      '¿Se reportan oportunamente fugas o desperdicios de agua?',
      '¿Se reutiliza agua cuando las actividades lo permiten?',
      '¿Se promueve el uso racional del recurso hídrico?'
    ]
  },
  {
    id: 'conocimiento',
    name: 'Conocimiento ambiental',
    icon: 'ti-school',
    preguntas: [
      '¿El personal asiste a las capacitaciones ambientales programadas?',
      '¿El área conoce las prohibiciones ambientales establecidas por la organización?',
      '¿El personal aplica buenas prácticas ambientales en sus actividades?',
      '¿Se evidencia compromiso ambiental por parte del área inspeccionada?'
    ]
  },
  {
    id: 'subproductos',
    name: 'Manejo de subproductos',
    icon: 'ti-package',
    preguntas: [
      '¿El área realiza un adecuado manejo de subproductos?',
      '¿Los subproductos se almacenan correctamente?',
      '¿Se controla adecuadamente la disposición o aprovechamiento de subproductos?',
      '¿El manejo de subproductos evita riesgos de contaminación?'
    ]
  },
  {
    id: 'biodiversidad',
    name: 'Biodiversidad y reportes ambientales',
    icon: 'ti-plant',
    preguntas: [
      '¿El personal reporta avistamientos de fauna o flora?',
      '¿Se reportan oportunamente novedades o incidentes ambientales?',
      '¿El área cumple con los lineamientos ambientales establecidos?'
    ]
  },
  {
    id: 'energia',
    name: 'Uso eficiente de energía',
    icon: 'ti-bolt',
    preguntas: [
      '¿El personal apaga las luces al salir del área?',
      '¿Los equipos eléctricos permanecen apagados cuando no están en uso?',
      '¿El aire acondicionado se mantiene en una temperatura adecuada?',
      '¿Se promueven prácticas de ahorro energético?'
    ]
  },
  {
    id: 'contaminacion',
    name: 'Prevención de contaminación y derrames',
    icon: 'ti-alert-triangle',
    preguntas: [
      '¿El área implementa medidas para prevenir derrames?',
      '¿Se cuenta con elementos para la atención de contingencias o derrames?',
      '¿Se evidencia orden y limpieza en el área inspeccionada?',
      '¿Las sustancias o materiales se almacenan adecuadamente para prevenir contaminación?'
    ]
  }
];

// Calcula puntaje a partir del objeto answers { 'catIdx-qIdx': 'C'|'P'|'N'|'NA' }
function calcScore(answers) {
  const vals = Object.values(answers);
  const applicable = vals.filter(v => v !== 'NA');
  if (!applicable.length) return null;
  const pts = applicable.reduce((s, v) => s + (v === 'C' ? 1 : v === 'P' ? 0.5 : 0), 0);
  return parseFloat(((pts / applicable.length) * 100).toFixed(1));
}

// Calcula puntaje por categoría
function calcCatScores(answers) {
  return CATEGORIAS.map((cat, ci) => {
    const vals = cat.preguntas.map((_, qi) => answers[`${ci}-${qi}`]).filter(Boolean);
    const applicable = vals.filter(v => v !== 'NA');
    if (!applicable.length) return null;
    const pts = applicable.reduce((s, v) => s + (v === 'C' ? 1 : v === 'P' ? 0.5 : 0), 0);
    return parseFloat(((pts / applicable.length) * 100).toFixed(1));
  });
}

function scoreColor(s) {
  if (s === null || s === undefined) return '#9e9e97';
  if (s >= 90) return '#1D9E75';
  if (s >= 70) return '#BA7517';
  if (s >= 50) return '#E07B17';
  return '#A32D2D';
}

function scoreBadge(s) {
  if (s === null) return '<span class="badge badge-gray">Sin datos</span>';
  if (s >= 90) return '<span class="badge badge-green">Bueno</span>';
  if (s >= 70) return '<span class="badge badge-amber">Aceptable</span>';
  if (s >= 50) return '<span class="badge badge-amber">Bajo</span>';
  return '<span class="badge badge-red">Crítico</span>';
}

function scoreLabel(s) {
  if (s === null) return 'Sin datos';
  if (s >= 90) return 'Bueno';
  if (s >= 70) return 'Aceptable';
  if (s >= 50) return 'Bajo';
  return 'Crítico';
}

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}
