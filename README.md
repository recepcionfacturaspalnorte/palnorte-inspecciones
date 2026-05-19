# 🌿 PALNORTE — Sistema de Inspecciones Ambientales
**Código:** GAM-01-FO-15 · Versión 01 · 2026-01-05

Sistema web de lista de chequeo ambiental por áreas, con base de datos en tiempo real, dashboard, alertas y generación de informes.

---

## 📋 Funcionalidades

- ✅ Lista de chequeo con 33 preguntas en 7 categorías
- 📊 Dashboard con métricas, ranking de áreas y gráficas
- 🔔 Alertas automáticas para áreas con puntaje bajo o sin inspección
- 📁 Historial completo con filtros
- 🗂️ Estado de todas las 25 áreas en una vista
- 📄 Generación de informes formales
- 💾 Exportación a CSV
- ☁️ Base de datos en tiempo real (Firebase Firestore)
- 📱 Diseño responsive (funciona en móvil y PC)

---

## 🚀 Configuración paso a paso

### PASO 1 — Crear proyecto en Firebase

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clic en **"Agregar proyecto"**
3. Nombre: `palnorte-ambiental`
4. Desactiva Google Analytics (opcional)
5. Clic en **"Crear proyecto"**

### PASO 2 — Crear base de datos Firestore

1. En el menú lateral, clic en **"Firestore Database"**
2. Clic en **"Crear base de datos"**
3. Selecciona **"Modo producción"**
4. Región: **`us-central1`** (o la más cercana)
5. Clic en **"Listo"**

### PASO 3 — Configurar reglas de seguridad

1. En Firestore, clic en la pestaña **"Reglas"**
2. Borra el contenido actual y pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inspecciones/{docId} {
      allow read, write: if true;
    }
  }
}
```

3. Clic en **"Publicar"**

### PASO 4 — Obtener credenciales de la app web

1. En la consola de Firebase, clic en el ícono **⚙️ Configuración del proyecto**
2. En la sección **"Tus apps"**, clic en **"Agregar app"** → ícono Web (`</>`)
3. Nombre de la app: `palnorte-inspeccion`
4. **NO** actives Firebase Hosting (usaremos GitHub Pages)
5. Clic en **"Registrar app"**
6. Copia los valores del objeto `firebaseConfig` que aparece

### PASO 5 — Actualizar el archivo de configuración

Abre el archivo `js/config.js` y reemplaza los valores:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY_AQUI",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};
```

También puedes cambiar las contraseñas de acceso:

```javascript
const USUARIOS = {
  "Claudia Pabón":  "nueva_contraseña",
  "Neyla Durán":    "nueva_contraseña",
  "Administrador":  "admin_contraseña"
};
```

### PASO 6 — Publicar en GitHub Pages

1. Crea una cuenta en [https://github.com](https://github.com) si no tienes una
2. Crea un repositorio nuevo: **"palnorte-inspecciones"** (público)
3. Sube todos los archivos de esta carpeta al repositorio
4. Ve a **Settings → Pages**
5. En **Source**, selecciona **"Deploy from a branch"**
6. Branch: `main` / Folder: `/ (root)`
7. Clic en **Save**
8. En 2-3 minutos tu app estará en:
   `https://TU_USUARIO.github.io/palnorte-inspecciones/`

---

## 📁 Estructura de archivos

```
palnorte-inspecciones/
├── index.html          ← Aplicación principal
├── css/
│   └── style.css       ← Estilos
├── js/
│   ├── config.js       ← ⚠️ Configura Firebase aquí
│   ├── data.js         ← Preguntas, áreas y funciones de cálculo
│   └── app.js          ← Lógica principal
├── firestore.rules     ← Reglas de seguridad Firestore
└── README.md           ← Este archivo
```

---

## 🔐 Usuarios y contraseñas por defecto

| Usuario | Contraseña |
|---|---|
| Claudia Pabón | palnorte2026 |
| Neyla Durán | palnorte2026 |
| Administrador | admin2026 |

> **Importante:** Cambia las contraseñas en `js/config.js` antes de publicar.

---

## 📊 Sistema de calificación

| Respuesta | Valor |
|---|---|
| Cumple | 1.0 (100%) |
| Parcial | 0.5 (50%) |
| No cumple | 0.0 (0%) |
| No aplica | Excluida del cálculo |

**Niveles de cumplimiento:**
- 🟢 **Bueno** ≥ 90%
- 🟡 **Aceptable** 70–89%
- 🟠 **Bajo** 50–69% → Alerta de reinspección
- 🔴 **Crítico** < 50% → Alerta urgente

---

## ❓ Soporte

Para cambios en las preguntas o áreas, edita el archivo `js/data.js`.

Desarrollado para PALNORTE S.A.S — Área de Gestión Ambiental.
