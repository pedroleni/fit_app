# FitApp

<div align="center">

![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Aplicación de fitness con inteligencia artificial integrada en el núcleo del producto.**  
Coach personal, generación de rutinas y contenido visual — todo impulsado por Google Gemini.

</div>

---

## ¿Qué papel juega la IA?

La inteligencia artificial no es un añadido en FitApp — **es la pieza central** que diferencia la app de un simple registro de entrenamientos. Gemini está integrado en cuatro áreas clave:

### 🤖 Coach IA personal
Un chat en tiempo real con Gemini que actúa como entrenador personal. El usuario puede preguntar sobre técnica de ejercicios, nutrición, recuperación o planificación del entrenamiento y recibe respuestas contextualizadas y personalizadas.

### 📋 Generación de rutinas personalizadas
El usuario describe su nivel, objetivos y equipamiento disponible. Gemini genera una rutina completa con ejercicios, series, repeticiones y tiempos de descanso adaptados a su perfil. No es una plantilla fija — cada rutina es única.

### 🖼️ Imágenes de ejercicios generadas por IA
En lugar de usar una base de datos de imágenes estática, FitApp usa Gemini para generar imágenes descriptivas de cada ejercicio bajo demanda. Las imágenes se cachean en MongoDB para no repetir llamadas innecesarias a la API.

### 🔍 Búsqueda inteligente de ejercicios
El motor de búsqueda de ejercicios usa Gemini para interpretar consultas en lenguaje natural. El usuario puede buscar por músculo, movimiento o descripción libre y obtener resultados relevantes con explicaciones detalladas.

---

## Características

- **Autenticación** con Google OAuth 2.0
- **Registro de entrenamientos** — crea, visualiza y elimina sesiones con historial completo
- **Tracking de hidratación** — controla tu ingesta de agua diaria con objetivo configurable
- **Coach IA** — chat con Gemini para resolver dudas de fitness y nutrición
- **Generación de rutinas** — rutinas personalizadas generadas por IA según tu nivel y objetivos
- **Directorio de ejercicios** — busca ejercicios por grupo muscular con imágenes generadas por IA
- **Evolución de ejercicios** — sigue la progresión de cada ejercicio a lo largo del tiempo
- **Vídeos de demostración** — modal con vídeo explicativo de cada ejercicio

---

## Stack

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Passport.js (Google OAuth 2.0)
- JWT para autenticación
- **Google Gemini API** — chat, generación de rutinas, imágenes y búsqueda

**Frontend**
- React + TypeScript
- Vite
- React Router v6
- Axios

---

## Arquitectura

El backend sigue **Clean Architecture** con separación clara de capas:

```
fit_app/
├── backend/
│   └── src/
│       ├── api/              # Controllers, routes, middleware
│       ├── application/      # Use cases (lógica de negocio)
│       │   └── usecases/
│       │       ├── ai/       # AskGemini, GenerateRoutine, FetchExercises, GenerateImage
│       │       ├── auth/     # GoogleAuth
│       │       ├── workout/  # Create, Get, Delete
│       │       └── water/    # Log, Get
│       ├── domain/           # Entidades e interfaces de repositorio
│       └── infrastructure/   # DB, modelos Mongoose, Google Strategy
└── frontend/
    └── src/
        ├── components/       # Navbar, ExerciseImage, VideoModal
        ├── contexts/         # AuthContext
        ├── hooks/            # useExerciseImage
        ├── pages/            # Todas las vistas
        ├── services/         # Capa de API (axios)
        └── types/            # Tipos TypeScript compartidos
```

---

## Instalación

### Requisitos

- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com) para OAuth
- API Key de [Google Gemini](https://aistudio.google.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/pedroleni/fit_app.git
cd fit_app
```

### 2. Configurar el backend

```bash
cd backend
cp .env.template .env
npm install
```

Edita el `.env` con tus credenciales:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/fit_app
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5174/api/v1/auth/google/callback

FRONTEND_URL=http://localhost:5174

GEMINI_API_KEY=tu_api_key
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar Google OAuth

En [Google Cloud Console](https://console.cloud.google.com):

1. Crea un proyecto y habilita la **Google+ API**
2. Ve a **Credenciales → Crear credenciales → ID de cliente OAuth**
3. Tipo de aplicación: **Aplicación web**
4. Añade en **Orígenes autorizados**: `http://localhost:5174`
5. Añade en **URIs de redirección**: `http://localhost:5174/api/v1/auth/google/callback`

### 5. Arrancar la aplicación

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

La app estará disponible en `http://localhost:5174`

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca en modo desarrollo |
| `npm run build` | Compila para producción |

## Ramas

| Rama | Descripción |
|------|-------------|
| `main` | Código estable |
| `develop` | Rama de integración |
| `feature/*` | Desarrollo de funcionalidades |
| `fix/*` | Corrección de bugs |
