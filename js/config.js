// ============================================================
//  CONFIGURACIÓN FIREBASE — PALNORTE Inspecciones Ambientales
//  GAM-01-FO-15 v01
// ============================================================
//
//  INSTRUCCIONES:
//  1. Ve a https://console.firebase.google.com
//  2. Crea un proyecto (ej: "palnorte-ambiental")
//  3. Agrega una app web (</> ícono)
//  4. Copia los valores de firebaseConfig aquí abajo
//  5. En Firebase Console → Firestore Database → Crear base de datos
//     → Modo producción → Región us-central1
//  6. En Firestore → Reglas, pega las reglas del archivo
//     firestore.rules que está en este proyecto
//
// ============================================================

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDppVczkxhCQ0b7ojKdGfzgPU7AZuSiwIg",
  authDomain:        "palnorte-ambiental.firebaseapp.com",
  databaseURL:       "https://palnorte-ambiental-default-rtdb.firebaseio.com",
  projectId:         "palnorte-ambiental",
  storageBucket:     "palnorte-ambiental.firebasestorage.app",
  messagingSenderId: "15143049818",
  appId:             "1:15143049818:web:51317bca615c842e445663",
  measurementId:     "G-07FX43JRSH"
};

// Contraseñas de acceso (puedes cambiarlas)
// Para mayor seguridad en producción usar Firebase Authentication
const USUARIOS = {
  "Claudia Pabón":  "palnorte2026",
  "Neyla Durán":    "palnorte2026",
  "Administrador":  "admin2026"
};

// Umbral de alerta para reinspección (%)
const UMBRAL_CRITICO = 50;
const UMBRAL_REINSPECCION = 70;

// Días sin inspección para generar alerta
const DIAS_ALERTA = 30;

// ============================================================
//  EMAILJS — Envío de informes por correo
// ============================================================
const EMAILJS_SERVICE_ID  = "service_kcjovdj";
const EMAILJS_TEMPLATE_ID = "template_5np455p";
const EMAILJS_PUBLIC_KEY  = "WO3XZiinDHnsXOQwK";

// Correos de encargados por área
// Agrega o actualiza los correos aquí cuando los tengas
const CORREOS_AREAS = {
  "Orgánicos":                    "",
  "Laboratorio de orgánicos":     "",
  "Casa hotel":                   "",
  "Edificio de sostenibilidad":   "",
  "Garita":                       "",
  "Containers":                   "",
  "Báscula":                      "",
  "Operaciones":                  "",
  "Producción":                   "",
  "Cuarto control de motores":    "",
  "Laboratorio de calidad":       "",
  "TIC's":                        "",
  "Talento humano":               "",
  "Archivo":                      "",
  "Calidad":                      "",
  "Comunicaciones":               "",
  "SST":                          "",
  "Mantenimiento":                "",
  "Cuarto herramientas":          "",
  "Taller mecánico":              "",
  "Taller eléctrico":             "",
  "Almacén":                      "",
  "Lagunas":                      "",
  "Contratistas Metalcat-Ofensi": "",
  "Oficina administrativa Cúcuta":""
};

// Inicializar Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
