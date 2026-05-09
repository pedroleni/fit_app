# FitApp

Aplicación web de fitness con inteligencia artificial integrada. Permite registrar entrenamientos, controlar la hidratación diaria y obtener rutinas y consejos personalizados a través de un coach IA powered by Gemini.

## Características

- **Autenticación** con Google OAuth
- **Registro de entrenamientos** — crea, visualiza y elimina sesiones de entrenamiento con historial completo
- **Tracking de hidratación** — controla tu ingesta de agua diaria con objetivo configurable
- **Coach IA** — chat con Gemini para resolver dudas de fitness y nutrición
- **Generación de rutinas** — rutinas personalizadas generadas por IA según tu nivel y objetivos
- **Directorio de ejercicios** — busca ejercicios por grupo muscular con imágenes generadas por IA
- **Evolución de ejercicios** — sigue la progresión de cada ejercicio a lo largo del tiempo
- **Vídeos de demostración** — modal con vídeo explicativo de cada ejercicio

## Stack

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Passport.js (Google OAuth 2.0)
- JWT para autenticación
- Google Gemini API

**Frontend**
- React + TypeScript
- Vite
- React Router v6
- Axios

## Estructura del proyecto

```
fit_app/
├── backend/
│   └── src/
│       ├── api/              # Controllers, routes, middleware
│       ├── application/      # Use cases (lógica de negocio)
│       ├── domain/           # Entidades e interfaces de repositorio
│       └── infrastructure/   # DB, modelos Mongoose, auth
└── frontend/
    └── src/
        ├── components/       # Componentes reutilizables
        ├── contexts/         # AuthContext
        ├── hooks/            # Custom hooks
        ├── pages/            # Páginas de la app
        ├── services/         # Capa de API (axios)
        └── types/            # Tipos TypeScript
```

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

En dos terminales:

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

La app estará disponible en `http://localhost:5174`

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
