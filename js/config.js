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
  "Orgánicos":                    "organicos@palnortesas.com",
  "Laboratorio de orgánicos":     "investigaciondesarrolloeinnovacion@palnortesas.com",
  "Casa hotel":                   "archivo@palnortesas.com",
  "Edificio de sostenibilidad":   "servicioalproveedor@palnortesas.com",
  "Garita":                       "analistaplantafisica@palnortesas.com",
  "Containers":                   "analistaplantafisica@palnortesas.com",
  "Báscula":                      "logistica@palnortesas.com",
  "Operaciones":                  "jefeoperaciones@palnortesas.com",
  "Producción":                   "jefeoperaciones@palnortesas.com",
  "Cuarto control de motores":    "coordinadorccm@palnortesas.com",
  "Laboratorio de calidad":       "lidermetodologico@palnortesas.com",
  "TIC's":                        "soporte@palnortesas.com",
  "Talento humano":               "directoradministrativo@palnortesas.com",
  "Archivo":                      "compras@palnortesas.com",
  "Calidad":                      "calidad@palnortesas.com",
  "Comunicaciones":               "comunicaciones@palnortesas.com",
  "SST":                          "lidersst@palnortesas.com",
  "Mantenimiento":                "lidermantenimiento@palnortesas.com",
  "Cuarto herramientas":          "lidermantenimiento@palnortesas.com",
  "Taller mecánico":              "lidermantenimiento@palnortesas.com",
  "Taller eléctrico":             "lidermantenimiento@palnortesas.com",
  "Almacén":                      "almacenplanta@palnortesas.com",
  "Lagunas":                      "jefeoperaciones@palnortesas.com",
  "Contratistas Metalcat-Ofensi": "",
  "Oficina administrativa Cúcuta":"directoradministrativo@palnortesas.com"
};

// Inicializar Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
