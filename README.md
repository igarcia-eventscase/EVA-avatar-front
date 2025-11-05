# EVA Avatar - Frontend

Aplicación frontend para el sistema de avatares virtuales EVA. Interfaz de usuario React para controlar avatares virtuales en eventos en vivo.

## 🎯 Características

- **Panel de Control Intuitivo**: Gestión completa del avatar desde UI
- **Avatar Virtual HeyGen**: Visualización en tiempo real con sincronización de labios
- **3 Modos de Entrada**:
  - 📝 **Texto Manual**: Escribe mensajes directamente
  - ⚡ **Transcripción Rápida**: Voz a texto (~1-2s latencia)
  - 🚀 **IA Tiempo Real**: Conversaciones con GPT Realtime API (~300-500ms latencia)
- **Formatos de Video Adaptables**: 16:9, 9:16, 4:3, 1:1, 4:5
- **Configuración Dinámica**: Avatar ID, Voice ID, system prompt personalizables desde UI
- **Persistencia LocalStorage**: Todas las configuraciones se guardan automáticamente

## 🏗️ Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Gestión de Estado**: React Hooks
- **Estilos**: CSS-in-JS (inline styles separados)
- **WebRTC**: Comunicación directa con OpenAI Realtime API
- **SDK**: HeyGen Streaming Avatar SDK

## 📋 Requisitos Previos

- **Node.js** 18+ y npm
- **Backend EVA Avatar** corriendo en `http://localhost:3001`
- Cuenta de HeyGen con Avatar ID

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_AVATAR_ID=tu_avatar_id_de_heygen  # Valor por defecto
```

**Nota**: El Avatar ID y Voice ID son configurables desde la UI sin necesidad de reiniciar.

### 3. Iniciar aplicación

```bash
# Desarrollo (con hot-reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 🎮 Uso

1. **Conectar Avatar**: Click en botón "Conectar Avatar"
2. **Seleccionar Modo de Entrada**:
   - Escribe texto manualmente
   - Usa micrófono para transcripción
   - Usa micrófono con IA para conversaciones
3. **Configuración** (⚙️):
   - Cambiar Avatar ID y Voice ID
   - Ajustar formato de video
   - Personalizar system prompt (modo IA)
   - Activar/desactivar auto-envío

## ⚙️ Panel de Configuración

### Modo de Micrófono
- **⚡ Solo Transcribir**: Transcripción rápida sin IA
- **🚀 IA en Tiempo Real**: Respuestas inteligentes con GPT Realtime API

### System Prompt (modo IA)
- Personaliza comportamiento de la IA
- Botón "Restaurar por defecto"

### Comportamiento de Respuesta (modo IA)
- **Auto-envío desactivado** (✏️): Revisión manual
- **Auto-envío activado** (⚡): Conversaciones fluidas

### Avatar y Voz
- **Avatar ID**: ID del avatar de HeyGen
- **Voice ID**: ID de voz (por defecto: español)

### Formato de Video
- 16:9 - Horizontal (widescreen)
- 9:16 - Vertical (stories)
- 4:5 - Vertical corto
- 1:1 - Cuadrado
- 4:3 - Clásico

## 🛠️ Scripts Disponibles

```bash
npm run dev        # Modo desarrollo con hot-reload
npm run build      # Compilar para producción (TypeScript + Vite)
npm run preview    # Previsualizar build de producción
npm run type-check # Verificar tipos TypeScript
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/           # Componentes React
│   │   ├── AvatarViewer.tsx
│   │   ├── TextInput.tsx
│   │   ├── UnifiedVoiceInput.tsx
│   │   ├── SettingsModal.tsx
│   │   └── styles/          # Estilos separados
│   ├── hooks/               # Custom hooks
│   │   ├── useHeyGen.ts
│   │   ├── useTranscription.ts
│   │   ├── useRealtimeAI.ts
│   │   └── useSettings.ts
│   ├── lib/                 # Librerías y utilidades
│   │   └── heygen-client.ts
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Punto de entrada
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🌐 Deployment

### Vercel

```bash
npm install -g vercel
vercel deploy
```

### Netlify

1. Conecta tu repositorio en Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Cloudflare Pages

1. Conecta tu repositorio
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

**Importante**: Configurar variables de entorno en la plataforma:
- `VITE_API_URL`: URL del backend en producción

## 🔧 Arquitectura de Componentes

### Hooks Principales

- **useHeyGen**: Gestión de conexión con HeyGen Avatar SDK
- **useRealtimeAI**: WebRTC con OpenAI Realtime API
- **useTranscription**: Transcripción de voz con Whisper
- **useSettings**: Persistencia en localStorage

### Flujo de Datos

```
Usuario → Input Component → Hook → Backend API → HeyGen/OpenAI
                                ↓
                         LocalStorage (config)
```

## 🐛 Troubleshooting

### Avatar no aparece
- Verificar que backend esté corriendo
- Verificar API Key de HeyGen en backend
- Verificar Avatar ID en configuración

### Error de CORS
- Verificar que `VITE_API_URL` apunte al backend correcto
- Verificar configuración CORS en backend

### Modo IA no funciona
- Verificar OpenAI API Key en backend
- Verificar permisos de micrófono en navegador
- Usar Chrome o Safari (mejor soporte WebRTC)

### WebRTC no conecta
- Requiere HTTPS en producción
- Verificar firewall/red no bloquea WebRTC
- Probar en navegador diferente

## 📝 Convenciones de Código

- **Componentes**: PascalCase (ej: `AvatarViewer.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useHeyGen.ts`)
- **Estilos**: Archivos separados en `components/styles/`
- **TypeScript estricto**: Tipos explícitos en todas las interfaces

## 📧 Soporte

Repositorio backend: [EVA-avatar-back](https://github.com/igarcia-eventscase/EVA-avatar-back.git)

---

Desarrollado con ❤️ para eventos virtuales
