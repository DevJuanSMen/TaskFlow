# ⚡ TaskFlow - Plataforma de Gestión de Tareas

Aplicación web de gestión colaborativa de tareas y proyectos con tableros Kanban, desarrollada con la metodología **MEAN** (MongoDB, Express, Angular, Node.js), orquestada con **Docker** e implementando **5 patrones de diseño creacionales**.

---

## 📋 Tabla de Contenidos

- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Patrones de Diseño Creacionales](#-patrones-de-diseño-creacionales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API REST - Endpoints](#-api-rest---endpoints)
- [Frontend - Componentes Angular](#-frontend---componentes-angular)
- [Docker - Servicios](#-docker---servicios)

---

## 🏗️ Arquitectura del Proyecto

TaskFlow utiliza una arquitectura **cliente-servidor** de 3 capas, orquestada con Docker Compose:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │     │    Backend       │     │    Base de Datos │
│    Angular 18    │────▶│    Express.js    │────▶│    MongoDB 7.0   │
│    Puerto: 4200  │     │    Puerto: 3000  │     │    Puerto: 27017 │
│    (Nginx)       │     │    (Node.js 20)  │     │                  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Flujo de comunicación:
1. El **frontend** (Angular) se sirve estáticamente a través de **Nginx**
2. Las peticiones a `/api/*` se redirigen al **backend** vía proxy reverso de Nginx
3. El **backend** (Express) procesa las solicitudes y se comunica con **MongoDB**
4. La autenticación se maneja con **JWT** (JSON Web Tokens)

---

## 🎨 Patrones de Diseño Creacionales

### 1. 🔷 Singleton — Conexión a Base de Datos

**Archivo:** `backend/src/config/database.js`

**Problema que resuelve:** Evitar crear múltiples conexiones a MongoDB, lo cual desperdiciaría recursos del servidor.

**Implementación:**

```javascript
class Database {
  static instance = null;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
      console.log('🔧 [Singleton] Nueva instancia de Database creada');
    } else {
      console.log('♻️  [Singleton] Reutilizando instancia existente');
    }
    return Database.instance;
  }

  async connect(uri) {
    if (this.isConnected) {
      return this.connection; // Reutilizar conexión existente
    }
    // ... conectar a MongoDB
  }
}
```

**Uso en el proyecto** (`server.js`):
```javascript
const db = Database.getInstance();   // Crea la instancia
await db.connect(config.mongoUri);

const db2 = Database.getInstance();  // Reutiliza la misma
console.log(db === db2);             // true ✅
```

**Verificación en consola:**
```
🔧 [Singleton] Nueva instancia de Database creada
✅ [Singleton] MongoDB conectado: mongo
♻️  [Singleton] Reutilizando instancia existente de Database
🔍 [Singleton] ¿Misma instancia? true
```

---

### 2. 🏭 Factory Method — Creación de Tareas por Tipo

**Archivo:** `backend/src/patterns/TaskFactory.js`

**Problema que resuelve:** Crear tareas de distintos tipos (BUG, FEATURE, TASK, IMPROVEMENT) con configuraciones por defecto diferentes, sin lógica condicional compleja.

**Estructura del patrón:**

```
         TaskCreator (abstracto)
        ┌──────────────────────────┐
        │ + createTask(data)       │  ← Factory Method
        │ + create(data)           │  ← Template Method
        └──────────┬───────────────┘
                   │
     ┌─────────────┼─────────────────┐──────────────────┐
     ▼             ▼                 ▼                  ▼
BugTaskCreator  FeatureTaskCreator  GeneralTaskCreator  ImprovementTaskCreator
(🐛 ALTA)       (✨ MEDIA)          (📌 MEDIA)          (🔧 BAJA)
(Rojo #EF4444)  (Morado #8B5CF6)   (Azul #3B82F6)     (Verde #10B981)
```

**Implementación:**
```javascript
class BugTaskCreator extends TaskCreator {
  createTask(data) {
    return {
      ...data,
      type: 'BUG',
      priority: data.priority || 'ALTA',         // Bugs → prioridad alta
      labels: [{ name: 'Bug', color: '#EF4444' }] // Etiqueta roja
    };
  }
}
```

**Uso:**
```javascript
const creator = getTaskCreator('BUG');  // Selecciona BugTaskCreator
const task = creator.create(taskData);  // Crea tarea con defaults de Bug
```

**Endpoint:** `POST /api/tasks` — Recibe el campo `type` y selecciona el creator automáticamente.

---

### 3. 🔨 Builder — Creación Avanzada de Tareas

**Archivo:** `backend/src/patterns/TaskBuilder.js`

**Problema que resuelve:** Construir tareas complejas con muchos campos opcionales (etiquetas, subtareas, asignados, fechas), paso a paso, sin constructores con demasiados parámetros.

**Implementación con API fluida (method chaining):**
```javascript
const builder = new TaskBuilder();
const task = builder
  .setTitle('Corregir bug de login')
  .setDescription('El botón no responde en móvil')
  .setType('BUG')
  .setPriority('URGENTE')
  .addLabel('Bug Urgente', '#DC2626')
  .addLabel('Producción', '#F59E0B')
  .addSubtask('Reproducir el error')
  .addSubtask('Implementar corrección')
  .addSubtask('Escribir tests')
  .setDueDate('2026-04-01')
  .setEstimation(8)
  .setBoard(boardId)
  .setProject(projectId)
  .setCreatedBy(userId)
  .build();  // ← Valida y retorna el objeto final
```

**Director (configuraciones predefinidas):**
```javascript
// Construye un bug urgente con configuración estándar
TaskDirector.buildUrgentBug(builder, title, desc, boardId, projectId, userId);

// Construye un feature con subtareas comunes
TaskDirector.buildStandardFeature(builder, title, desc, boardId, projectId, userId);
```

**Endpoint:** `POST /api/tasks/build` — Ruta separada que demuestra el uso del Builder.

---

### 4. 📋 Prototype — Clonación de Proyectos y Tareas

**Archivo:** `backend/src/patterns/Prototype.js`

**Problema que resuelve:** Crear nuevos proyectos o tareas copiando uno existente, sin tener que configurar todo desde cero. Útil para usar proyectos como plantillas.

**Estructura:**

```
        Prototype (abstracto)
        ┌──────────────────┐
        │ + clone()        │
        └──────┬───────────┘
               │
     ┌─────────┴──────────┐
     ▼                    ▼
ProjectPrototype      TaskPrototype
 - Copia nombre,       - Copia título,
   descripción           descripción,
 - Resetea fechas        prioridad, tipo
 - NO copia tareas     - Resetea subtareas
                        - NO copia comentarios
                          ni adjuntos
```

**Implementación:**
```javascript
class ProjectPrototype extends Prototype {
  clone(newOwnerId) {
    return {
      name: `${this.data.name} (Copia)`,
      description: this.data.description,
      startDate: new Date(),
      owner: newOwnerId,
      members: [],
      status: 'PLANIFICADO',
    };
  }
}
```

**Uso en el controller:**
```javascript
// Clonar proyecto
const prototype = new ProjectPrototype(originalProject.toObject());
const clonedData = prototype.clone(req.user._id);
const clonedProject = await Project.create(clonedData);

// Se clonan los tableros (estructura) pero NO las tareas
```

**Endpoints:**
- `POST /api/projects/:id/clone` — Clona proyecto con tableros (sin tareas)
- `POST /api/tasks/:id/clone` — Clona tarea individual

---

### 5. 🎨 Abstract Factory — Temas Visuales (Claro/Oscuro)

**Archivo:** `frontend/src/app/patterns/theme-factory.ts`

**Problema que resuelve:** Crear familias completas de estilos (colores, fondos, bordes) de forma coherente, garantizando que todos los componentes cambien de tema simultáneamente.

**Estructura:**

```
      ThemeFactory (abstracta)
      ┌───────────────────────┐
      │ + createTheme()       │
      └───────────┬───────────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
LightThemeFactory       DarkThemeFactory
 - background: #F8FAFC    - background: #0F172A
 - surface: #FFFFFF        - surface: #1E293B
 - text: #0F172A           - text: #F1F5F9
 - primary: #6366F1        - primary: #818CF8
 - ...22 colores            - ...22 colores
```

**Implementación:**
```typescript
class DarkThemeFactory extends ThemeFactory {
  createTheme(): ThemeConfig {
    return {
      name: 'dark',
      isDark: true,
      colors: {
        primary: '#818CF8',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        // ... 22 colores en total
      }
    };
  }
}
```

**El servicio aplica el tema como CSS Custom Properties:**
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  setTheme(themeName: string): void {
    const factory = this.factories.get(themeName);  // Obtener fábrica
    const theme = factory.createTheme();             // Crear tema
    this.applyTheme(theme);                          // Aplicar CSS variables
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);  // → --primary: #818CF8
    });
  }
}
```

**En la UI:** El botón ☀️/🌙 en la barra de navegación invoca `themeService.toggleTheme()`.

---

## 📦 Requisitos Previos

- **Docker Desktop** (con Docker Compose)
- **Node.js 18+** (solo si deseas ejecutar sin Docker)
- **Git** (opcional, para control de versiones)

---

## 🚀 Instalación y Ejecución

### Con Docker (recomendado)

```bash
# 1. Navegar al directorio del proyecto
cd taskflow

# 2. Construir y levantar todos los servicios
docker-compose up --build -d

# 3. Verificar que los contenedores estén corriendo
docker-compose ps

# 4. Ver los logs del backend (para ver los patrones en acción)
docker-compose logs -f backend
```

**Servicios disponibles:**

| Servicio   | URL                          | Descripción              |
|------------|------------------------------|--------------------------|
| Frontend   | http://localhost:4200        | Aplicación Angular       |
| Backend    | http://localhost:3000        | API REST Express         |
| MongoDB    | localhost:27017              | Base de datos             |
| Health     | http://localhost:3000/api/health | Verificación del API  |

### Sin Docker (desarrollo local)

```bash
# Terminal 1: MongoDB (debe estar instalado localmente)
mongod

# Terminal 2: Backend
cd taskflow/backend
npm install
npm run dev

# Terminal 3: Frontend
cd taskflow/frontend
npm install
ng serve
```

### Detener servicios

```bash
docker-compose down          # Detener contenedores
docker-compose down -v       # Detener y eliminar volúmenes (borra la BD)
```

---

## 📁 Estructura del Proyecto

```
taskflow/
├── docker-compose.yml                 # Orquestación de contenedores
│
├── backend/
│   ├── Dockerfile                     # Imagen Node.js 20 Alpine
│   ├── package.json
│   └── src/
│       ├── server.js                  # Entry point Express
│       ├── config/
│       │   ├── database.js            # 🔷 PATRÓN SINGLETON
│       │   └── env.js                 # Variables de entorno
│       ├── models/
│       │   ├── User.js                # Usuarios (roles, auth)
│       │   ├── Project.js             # Proyectos (miembros, estado)
│       │   ├── Board.js               # Tableros Kanban (columnas)
│       │   └── Task.js                # Tareas (subtareas, comentarios, historial)
│       ├── patterns/
│       │   ├── TaskFactory.js         # 🔷 PATRÓN FACTORY METHOD
│       │   ├── TaskBuilder.js         # 🔷 PATRÓN BUILDER
│       │   └── Prototype.js           # 🔷 PATRÓN PROTOTYPE
│       ├── middleware/
│       │   └── auth.js                # JWT Authentication + Roles
│       ├── controllers/
│       │   ├── auth.controller.js     # Registro, Login, Perfil
│       │   ├── project.controller.js  # CRUD + Clonar + Archivar
│       │   ├── board.controller.js    # CRUD + Columnas + WIP
│       │   └── task.controller.js     # CRUD + Factory + Builder + Clonar
│       └── routes/
│           ├── auth.routes.js
│           ├── project.routes.js
│           ├── board.routes.js
│           └── task.routes.js
│
└── frontend/
    ├── Dockerfile                     # Multi-stage: ng build → Nginx
    ├── nginx.conf                     # Proxy reverso al backend
    └── src/
        ├── index.html
        ├── styles.css                 # Estilos globales con CSS Variables
        └── app/
            ├── app.component.ts       # Componente raíz
            ├── app.config.ts          # Configuración (HTTP interceptor)
            ├── app.routes.ts          # Rutas lazy-loaded
            ├── models/
            │   └── interfaces.ts      # Interfaces TypeScript
            ├── patterns/
            │   └── theme-factory.ts   # 🔷 PATRÓN ABSTRACT FACTORY
            ├── services/
            │   ├── auth.service.ts    # Autenticación + JWT
            │   ├── auth.interceptor.ts # Interceptor HTTP (Bearer token)
            │   ├── project.service.ts
            │   ├── board.service.ts
            │   └── task.service.ts
            ├── guards/
            │   └── auth.guard.ts      # Protección de rutas
            └── components/
                ├── auth/
                │   ├── login.component.ts
                │   └── register.component.ts
                ├── dashboard/
                │   └── dashboard.component.ts
                ├── project/
                │   └── project-detail.component.ts
                ├── board/
                │   └── board.component.ts        # Vista Kanban
                ├── task/
                │   └── task-dialog.component.ts   # Crear/editar tareas
                └── shared/
                    └── navbar.component.ts        # Navegación + tema
```

---

## 🔌 API REST - Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta             | Descripción                    | Acceso   |
|--------|------------------|--------------------------------|----------|
| POST   | `/register`      | Registrar usuario              | Público  |
| POST   | `/login`         | Iniciar sesión (retorna JWT)   | Público  |
| GET    | `/me`            | Obtener perfil actual          | Privado  |
| PUT    | `/profile`       | Actualizar perfil              | Privado  |
| POST   | `/logout`        | Cerrar sesión                  | Privado  |
| GET    | `/users`         | Listar usuarios activos        | Privado  |

### Proyectos (`/api/projects`)

| Método | Ruta                      | Descripción                              | Patrón         |
|--------|---------------------------|------------------------------------------|----------------|
| GET    | `/`                       | Listar proyectos del usuario             |                |
| POST   | `/`                       | Crear proyecto (+ tablero por defecto)   |                |
| GET    | `/:id`                    | Obtener proyecto con progreso            |                |
| PUT    | `/:id`                    | Actualizar proyecto                      |                |
| DELETE | `/:id`                    | Eliminar proyecto                        |                |
| POST   | `/:id/clone`              | Clonar proyecto como plantilla           | **Prototype**  |
| PUT    | `/:id/archive`            | Archivar/desarchivar proyecto            |                |
| POST   | `/:id/members`            | Agregar miembro por email                |                |
| DELETE | `/:id/members/:userId`    | Eliminar miembro                         |                |

### Tableros (`/api/boards`)

| Método | Ruta                               | Descripción                    |
|--------|-------------------------------------|-------------------------------|
| GET    | `/project/:projectId`               | Tableros de un proyecto       |
| POST   | `/`                                 | Crear tablero                 |
| GET    | `/:id`                              | Tablero con tareas agrupadas  |
| PUT    | `/:id`                              | Renombrar tablero             |
| DELETE | `/:id`                              | Eliminar tablero              |
| POST   | `/:id/columns`                      | Agregar columna               |
| PUT    | `/:id/columns/:columnId`            | Renombrar columna / WIP limit |
| DELETE | `/:id/columns/:columnId`            | Eliminar columna              |
| PUT    | `/:id/columns/reorder`              | Reordenar columnas            |

### Tareas (`/api/tasks`)

| Método | Ruta                               | Descripción                      | Patrón              |
|--------|-------------------------------------|----------------------------------|----------------------|
| POST   | `/`                                 | Crear tarea por tipo             | **Factory Method**   |
| POST   | `/build`                            | Crear tarea avanzada             | **Builder**          |
| GET    | `/board/:boardId`                   | Tareas de un tablero (+ filtros) |                      |
| GET    | `/:id`                              | Detalle de tarea completo        |                      |
| PUT    | `/:id`                              | Actualizar tarea                 |                      |
| PUT    | `/:id/move`                         | Mover tarea entre columnas       |                      |
| DELETE | `/:id`                              | Eliminar tarea                   |                      |
| POST   | `/:id/clone`                        | Clonar tarea                     | **Prototype**        |
| POST   | `/:id/subtasks`                     | Agregar subtarea                 |                      |
| PUT    | `/:id/subtasks/:subtaskId`          | Completar/reabrir subtarea       |                      |
| POST   | `/:id/comments`                     | Agregar comentario               |                      |
| DELETE | `/:id/comments/:commentId`          | Eliminar comentario              |                      |
| POST   | `/:id/attachments`                  | Subir archivo adjunto (max 10MB) |                      |
| POST   | `/:id/time`                         | Registrar horas trabajadas       |                      |

---

## 🖥️ Frontend - Componentes Angular

| Componente             | Ruta             | Descripción                                              |
|------------------------|------------------|----------------------------------------------------------|
| `LoginComponent`       | `/login`         | Formulario de inicio de sesión                           |
| `RegisterComponent`    | `/register`      | Formulario de registro con selector de rol               |
| `DashboardComponent`   | `/dashboard`     | Listado de proyectos con stats y progreso                |
| `ProjectDetailComponent` | `/projects/:id` | Detalle del proyecto, miembros, tableros                |
| `BoardComponent`       | `/boards/:id`    | Vista Kanban con columnas, tarjetas y filtros            |
| `TaskDialogComponent`  | (modal)          | Crear/editar tareas con tabs, toggle Factory/Builder     |
| `NavbarComponent`      | (global)         | Navegación, selector de tema ☀️/🌙, menú de usuario    |

### Características de la UI:
- **Tema oscuro/claro** (Abstract Factory) con transición suave
- **Tarjetas Kanban** con badges de prioridad y tipo coloreados
- **Indicador visual de tareas vencidas** (borde rojo)
- **Progreso de subtareas** con barra visual
- **Filtros** por prioridad, tipo y búsqueda de texto
- **Botones de movimiento** entre columnas al hacer hover

---

## 🐳 Docker - Servicios

El archivo `docker-compose.yml` define 3 servicios:

### `mongo` - Base de Datos
- **Imagen:** `mongo:7.0`
- **Puerto:** `27017`
- **Volumen:** `mongo_data` (persistencia de datos)

### `backend` - API REST
- **Imagen:** Node.js 20 Alpine (build desde `backend/Dockerfile`)
- **Puerto:** `3000`
- **Volúmenes:** El código src se monta para hot-reload en desarrollo
- **Variables de entorno:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, etc.

### `frontend` - Aplicación Web
- **Imagen:** Multi-stage build (Angular → Nginx)
- **Puerto:** `4200`
- **Nginx:** Sirve los archivos estáticos y hace proxy reverso al backend

### Red
Todos los servicios están conectados a la red `taskflow-network` para comunicación interna.

---

## 🧪 Pruebas Rápidas con la API

```bash
# Health check
curl http://localhost:3000/api/health

# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","role":"ADMIN"}'

# Login (copiar el token de la respuesta)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Crear proyecto (reemplazar TOKEN)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Mi Proyecto","description":"Descripción"}'

# Crear tarea con Factory Method (reemplazar IDs)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Fix login","type":"BUG","boardId":"BOARD_ID"}'

# Crear tarea con Builder
curl -X POST http://localhost:3000/api/tasks/build \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Nueva feature","type":"FEATURE","boardId":"BOARD_ID","subtasks":[{"title":"Diseño"},{"title":"Tests"}]}'
```

---

## 📊 Resumen de Patrones Creacionales

| Patrón             | Archivo                          | Uso en la Aplicación                              |
|--------------------|----------------------------------|---------------------------------------------------|
| **Singleton**      | `backend/config/database.js`     | Una sola conexión a MongoDB en toda la app        |
| **Factory Method** | `backend/patterns/TaskFactory.js`| Crear tareas con defaults según tipo (BUG, etc.)  |
| **Builder**        | `backend/patterns/TaskBuilder.js`| Construir tareas complejas paso a paso            |
| **Prototype**      | `backend/patterns/Prototype.js`  | Clonar proyectos y tareas existentes              |
| **Abstract Factory**| `frontend/patterns/theme-factory.ts` | Familias de estilos para temas claro/oscuro  |

---

*Desarrollado como proyecto de Arquitectura de Software — MEAN Stack + Patrones Creacionales*
