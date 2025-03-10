# 🚀 Challenge Plans - Plataforma de Aprendizaje Colaborativo

![Version](https://img.shields.io/badge/version-1.0\.0-blue)
![Node](https://img.shields.io/badge/node-v16+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![TypeORM](https://img.shields.io/badge/TypeORM-^0.3\.17-orange)

Una plataforma web diseñada para estudiantes que buscan un entorno interactivo y seguro para el aprendizaje colaborativo. Facilita la creación y participación en retos académicos personalizables, la organización de planes de estudio, la gestión de tareas, el intercambio de apuntes y ofrece un sistema de recompensas gamificado.

---

## 📋 Índice

- [Objetivos](#-objetivos)
- [Requisitos](#-requisitos)
- [Tecnologías](#-tecnologías)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
- [Arquitectura y Componentes](#-arquitectura-y-componentes)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [Desarrollo](#-desarrollo)
- [API Endpoints](#-api-endpoints)
- [Ejecutar el Proyecto](#-ejecutar-el-proyecto)
- [Pruebas](#-pruebas)

---

## 🎯 Objetivos

* **Fomentar el aprendizaje colaborativo:** Facilitar la creación y participación en retos académicos.
* **Organización eficiente:** Permitir la creación y gestión de planes de estudio con tareas y plazos.
* **Repositorio colaborativo:** Ofrecer un espacio para compartir y acceder a apuntes digitales.
* **Motivación:** Implementar un sistema de gamificación con recompensas por logros.
* **Rendimiento y seguridad:** Garantizar la escalabilidad y seguridad en el manejo de datos.

---

## 📝 Requisitos

### 1. Requisitos Funcionales

| ID   | Descripción                                                         | Prioridad |
|:-----|:--------------------------------------------------------------------|:----------|
| RF01 | Autenticación de usuarios (registro/inicio sesión)                  | Alta      |
| RF02 | Creación/edición de retos con tareas y plazos                       | Alta      |
| RF03 | Unirse a retos existentes                                           | Alta      |
| RF04 | Gestión de planes de estudio (CRUD)                                 | Media     |
| RF05 | Subida/descarga de apuntes (PDF, imágenes, texto)                   | Media     |
| RF06 | Sistema de recompensas (insignias, puntos)                          | Baja      |
| RF07 | Seguimiento de progreso en retos y planes                           | Media     |
| RF08 | Buscar retos y apuntes por categorías o etiquetas                   | Baja      |
| RF09 | Permitir interacción social (comentarios o valoraciones en apuntes) | Baja      |

### 2. Requisitos No Funcionales

- **🔍 Rendimiento:** Respuesta < 2 segundos para el 95% de solicitudes.
- **🔐 Seguridad:** JWT con refresh tokens y encriptación AES-256 para contraseñas.
- **📈 Escalabilidad:** Arquitectura modular para expansión futura.
- **💻 Compatibilidad:** Soporte para navegadores modernos y dispositivos móviles.
- **⏱️ Disponibilidad:** Garantía de 99.9% de tiempo de actividad.

---

## 💻 Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Redux](https://img.shields.io/badge/Redux_Toolkit-1.9-purple) |
| **Backend** | ![Express](https://img.shields.io/badge/Express-4.18-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TypeORM](https://img.shields.io/badge/TypeORM-0.3.17-orange) |
| **Base de Datos** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue) |
| **Autenticación** | JWT con refresh tokens |
| **Almacenamiento** | Supabase Storage |
| **Comunicación** | Socket.io para notificaciones en tiempo real |

---

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18 o superior
- npm 8 o superior
- PostgreSQL 14 o superior
- Git

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/challenge_Plans.git
   cd challenge_Plans
   ```

2. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instalar dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configurar variables de entorno (ver sección siguiente).

---

## 🗄️ Configuración de la Base de Datos

La aplicación utiliza PostgreSQL con TypeORM para la gestión de migraciones y datos.

### Variables de Entorno

Crea un archivo `.env` en el directorio `/backend`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=challenge_plans
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:5173
```

### Verificación de Conexión

```bash
cd backend
npm run verify-conn
```

### 🔄 Sistema de Migraciones

El proyecto utiliza TypeORM para gestionar migraciones que configuran el esquema de base de datos.

#### Componentes Principales

| Migración | Descripción | Script |
|-----------|-------------|--------|
| 🏗️ **Initial Migration** | Crea todas las tablas base del sistema | `npm run migration:initial` |
| ⚙️ **Triggers and Functions** | Añade triggers, funciones e índices | `npm run migration:triggers` |
| 🔔 **Notifications and Audit** | Configura sistema de notificaciones y auditoría | `npm run migration:notifications` |
| 🗑️ **Drop Database** | Elimina completamente el esquema | `npm run migration:dropdb` |

#### Estrategias de Ejecución

##### 1️⃣ Ejecución Automática (todas las migraciones)

```bash
npm run migration:run
```

> ⚠️ **Advertencia**: Este método puede causar errores si las migraciones no están diseñadas para ejecutarse secuencialmente sin intervención manual.

##### 2️⃣ Ejecución Manual Controlada (Recomendada)

```bash
# Paso 1: Limpiar la base de datos (si es necesario)
npm run migration:dropdb

# Paso 2: Crear tablas base
npm run migration:initial

# Paso 3: Añadir triggers y funciones
npm run migration:triggers

# Paso 4: Configurar sistema de notificaciones y auditoría
npm run migration:notifications
```

#### 🔍 Verificación del Esquema

```bash
npm run verify-db
```

#### 🔙 Revertir una Migración

```bash
npm run migration:revert
```

#### Flujo de Trabajo Recomendado

1. **📥 Configuración inicial**:
   ```bash
   npm run migration:dropdb
   npm run migration:initial
   npm run migration:triggers
   npm run migration:notifications
   ```

2. **🔄 Desarrollo iterativo**:
   - Modifica entidades en `src/entities`
   - Genera una migración: `npm run migration:generate -- MiCambio`
   - Ejecuta la migración: `npm run migration:run`

3. **🔄 Reinicio completo** (cuando sea necesario):
   - Vuelve al paso 1

### ▶️ Ejecutando la Aplicación

```bash
# En el directorio backend
npm run dev
```

La API estará disponible en [http://localhost:5000](http://localhost:5000)

---

## 🏗️ Arquitectura y Componentes

*[Sección pendiente de completar]*

## 🔧 Servicios, Controladores y Rutas

La aplicación sigue una arquitectura por capas donde cada componente tiene una responsabilidad específica:

### Servicios (Services)

Los servicios encapsulan la lógica de negocio y realizan operaciones con la base de datos a través de los repositorios.

| Servicio | Descripción | Funcionalidades principales |
|----------|-------------|----------------------------|
| **AuthService** | Gestiona la autenticación y autorización de usuarios | - Registro de usuarios<br>- Login y generación de tokens<br>- Obtención de perfiles<br>- Verificación de permisos |

### Controladores (Controllers)

Los controladores manejan las peticiones HTTP, validan los datos de entrada y utilizan los servicios para procesar la lógica de negocio.

| Controlador | Descripción | Endpoints principales |
|-------------|-------------|----------------------|
| **AuthController** | Gestiona las operaciones de autenticación | - `POST /register`: Registra nuevos usuarios<br>- `POST /login`: Inicia sesión<br>- `GET /profile`: Obtiene perfil del usuario<br>- `POST /refresh-token`: Actualiza el token de acceso |

### Rutas (Routes)

Las rutas definen los endpoints de la API y conectan las URL con los métodos correspondientes en los controladores.

| Grupo de Rutas | Ruta base | Descripción |
|----------------|-----------|-------------|
| **authRoutes** | `/api/auth` | Rutas para autenticación y gestión de usuarios |

### Middlewares

Componentes que procesan las peticiones antes de llegar a los controladores.

| Middleware | Descripción |
|------------|-------------|
| **authenticate** | Verifica que el usuario esté autenticado mediante el token JWT |
| **authorize** | Comprueba que el usuario tenga los permisos necesarios para acceder a un recurso |
| **notFoundHandler** | Maneja las rutas no encontradas (404) |
| **errorHandler** | Procesa y formatea los errores de la aplicación |

### Utilidades (Utils)

Funciones de ayuda utilizadas en diferentes partes de la aplicación.

| Utilidad | Descripción |
|----------|-------------|
| **jwt.ts** | Funciones para generar y verificar tokens JWT |
| **custom-errors.ts** | Clases de error personalizadas para mejorar el manejo de excepciones |

A medida que el proyecto evolucione, se añadirán nuevos servicios, controladores y rutas para manejar otras funcionalidades como retos, planes de estudio, tareas, etc.

---

## Modelo de Base de Datos

Esta base de datos está diseñada para soportar una plataforma de aprendizaje colaborativo donde los usuarios pueden crear y participar en retos, subir apuntes, completar tareas, obtener recompensas y logros, y colaborar en un entorno gamificado. A continuación, se describe el esquema de la base de datos, los índices, la vista materializada, y los triggers y funciones que automatizan y optimizan los procesos.

### Esquema de la Base de Datos

### Tablas Principales

#### Usuarios
- **usuarios**: Almacena la información básica de los usuarios, como su email, nombre, contraseña cifrada (hash_contraseña), puntaje y nivel. Cada usuario tiene un identificador único (UUID), y su fecha de registro se guarda automáticamente. Los roles, como "administrador" o "estudiante", no están en esta tabla, sino que se manejan en otra para mayor flexibilidad.

#### Categorías
- **categorias**: Sirve para clasificar los retos en grupos como "Matemáticas" o "Programación". Cada categoría tiene un nombre único, una descripción opcional y un icono para identificarla visualmente.

#### Planes de Estudio
- **planes_estudio**: Permite a los usuarios organizar su aprendizaje creando planes con un título, descripción, fecha de inicio y duración en días. Pueden ser públicos o privados, y cada plan está vinculado al usuario que lo creó.

#### Retos
- **retos**: Son desafíos o proyectos que los usuarios pueden crear o unirse. Incluyen un título, descripción, fechas de inicio y fin, nivel de dificultad (principiante, intermedio o avanzado), puntos totales y un estado (borrador, activo o finalizado). También registran quién los creó y si son públicos.

#### Relaciones entre Retos y Otras Entidades
- **reto_planes_estudio**: Conecta retos con planes de estudio, permitiendo que un reto forme parte de varios planes. Registra la fecha en que se asociaron.
- **reto_categorias**: Vincula retos con categorías, de modo que un reto puede pertenecer a varias categorías (por ejemplo, "Programación" y "Proyectos").

#### Participación en Retos
- **participacion_retos**: Registra cuándo un usuario se une a un reto, su progreso (de 0 a 100%), y su estado (activo, completado o cancelado). También guarda la fecha de unión y, si aplica, la de finalización.

#### Tareas
- **tareas**: Son actividades específicas dentro de un reto, como leer un texto o resolver un ejercicio. Tienen un título, descripción, puntos, fecha límite y tipo (lectura, ejercicio o proyecto). Pueden estar asignadas a un usuario, aunque esto es opcional.
- **tarea_asignaciones**: Permite asignar una misma tarea a varios usuarios, cada uno con un rol como "responsable" o "colaborador". Registra la fecha de asignación.
- **tareas_completadas**: Guarda cuándo un usuario completa una tarea, con su progreso (puede ser parcial) y comentarios opcionales.

#### Apuntes
- **apuntes**: Permite a los usuarios subir notas o documentos, con un título, contenido opcional (puede ser solo un archivo), y formato (pdf, md, docx). Pueden estar vinculados a un reto o plan de estudio, y ser públicos o privados. También tienen una calificación promedio.
- **archivos_genericos**: Almacena archivos adjuntos a diferentes elementos de la plataforma (apuntes, tareas, retos, etc.), con detalles como nombre, URL, formato y tamaño.
- **calificaciones_apuntes**: Registra las calificaciones (de 0 a 5) y comentarios que los usuarios dan a los apuntes, junto con la fecha.

#### Recompensas y Logros
- **recompensas**: Define las recompensas que los usuarios pueden ganar, como insignias, puntos o niveles. Incluye un nombre, tipo, valor y criterio para obtenerlas.
- **usuario_recompensas**: Conecta a los usuarios con las recompensas que han conseguido, registrando la fecha de obtención.
- **logros**: Guarda acciones destacadas de los usuarios, como completar una tarea o unirse a un reto, con una descripción y fecha.

#### Auditoría
- **auditoria**: Lleva un registro de cambios importantes en la base de datos (inserciones, actualizaciones o eliminaciones), con detalles como quién lo hizo, qué cambió y cuándo.

#### Reglas de Recompensas
- **reglas_recompensas**: Establece condiciones para otorgar recompensas, como "completar un reto" o "subir un apunte". Usa un formato flexible (JSONB) para definir reglas complejas.

#### Notificaciones
- **notificaciones**: Envía mensajes a los usuarios sobre eventos como tareas asignadas o retos completados. Incluye título, mensaje, tipo y si es grupal. Registra si fue leída y cuándo.
- **notificaciones_lecturas**: Rastrea si los usuarios han leído las notificaciones grupales, con la fecha de lectura.

#### Roles y Permisos
- **roles**: Define roles como "administrador" o "moderador", con una descripción opcional.
- **permisos**: Establece acciones específicas, como "editar reto" o "ver estadísticas".
- **rol_permisos**: Asocia permisos a roles, para definir qué puede hacer cada rol.
- **usuario_roles**: Asigna roles a los usuarios, con la fecha de asignación.

#### Historial y Comentarios
- **historial_progreso**: Registra cómo cambia el progreso de un usuario en un reto, con el progreso anterior y nuevo, la fecha y el evento que lo causó (como completar una tarea).
- **comentarios**: Permite dejar comentarios en retos, tareas, apuntes o planes de estudio. Incluye el contenido, la fecha y la posibilidad de responder a otros comentarios (anidamiento).

---

### Relaciones Clave

- Un **usuario** puede crear múltiples **retos** y **planes de estudio**.
- Un **reto** puede estar asociado a varios **planes de estudio** y **categorías**.
- Un **usuario** puede participar en varios **retos**, y cada participación tiene un progreso.
- Una **tarea** pertenece a un **reto** y puede ser asignada a varios **usuarios**.
- Los **apuntes** pueden estar vinculados a un **reto** o **plan de estudio** y recibir **calificaciones**.
- Las **recompensas** se otorgan a **usuarios** según las **reglas de recompensas**.
- Las **notificaciones** se envían a **usuarios** y pueden estar relacionadas con **retos**, **tareas**, etc.

---

### Notas Adicionales

- **Fechas y Horarios**: La base de datos usa `TIMESTAMP WITH TIME ZONE` para registrar fechas y horas, asegurando que las diferencias horarias se manejen correctamente.
- **Particionamiento**: Hay un ejemplo comentado para dividir la tabla de **notificaciones** en partes más pequeñas (por mes). Esto es útil si la tabla crece mucho y se necesita optimizar el rendimiento.

Este README ofrece una visión clara y accesible de la base de datos, explicando cada tabla y sus relaciones sin tecnicismos innecesarios. Si necesitas más detalles o tienes preguntas, ¡siéntete libre de preguntar!

---

## Triggers, Funciones e Índices en la Base de Datos

### Sistema de Notificaciones y Auditoría ([triggers y funciones](/backend/src/migrations/1741440000000-TriggersAndFunctions.ts))

Este archivo se enfoca en gestionar notificaciones y registrar cambios en la base de datos (auditoría).

#### Funciones

- **`limpiar_notificaciones_antiguas()`**
  - **Qué hace**: Borra las notificaciones que ya fueron leídas y tienen más de 30 días.
  - **Para qué sirve**: Evita que la tabla de notificaciones se llene de información vieja, manteniendo el sistema más ligero y rápido.

- **`registrar_auditoria()`**
  - **Qué hace**: Guarda un registro cada vez que se agrega, modifica o elimina algo en ciertas tablas (como `retos` o `usuarios`).
  - **Para qué sirve**: Permite rastrear quién hizo qué y cuándo, útil para seguimiento o solución de problemas. Actualmente, el usuario que realiza la acción se registra como `NULL` (esto se mejorará desde la aplicación).

- **`programar_limpieza_notificaciones()`**
  - **Qué hace**: Llama a la función `limpiar_notificaciones_antiguas()` cuando se programa su ejecución.
  - **Para qué sirve**: Facilita programar limpiezas automáticas (por ejemplo, con un job diario) para mantener las notificaciones organizadas.

#### Triggers

- **`audit_retos_trigger`** (en la tabla `retos`)
  - **Cuándo se activa**: Después de agregar (`INSERT`), modificar (`UPDATE`) o eliminar (`DELETE`) un registro en `retos`.
  - **Qué hace**: Registra automáticamente el cambio en la tabla `auditoria`.

- **`audit_usuarios_trigger`** (en la tabla `usuarios`)
  - **Cuándo se activa**: Después de modificar (`UPDATE`) o eliminar (`DELETE`) un registro en `usuarios`.
  - **Qué hace**: Registra el cambio en la tabla `auditoria`.

#### Índices

- **`idx_auditoria_usuario`**, **`idx_auditoria_tabla`**, **`idx_auditoria_fecha`**
  - **Qué son**: Índices en las columnas `usuario_id`, `tabla` y `fecha` de la tabla `auditoria`.
  - **Para qué sirven**: Hacen que las búsquedas por usuario, tabla o fecha sean más rápidas, como si fueran marcadores en un libro.

---

### Triggers y Funciones Generales ([triggers y funciones](/backend/src/migrations/1741440000000-TriggersAndFunctions.ts))

#### Índices

- **Índices Simples y Compuestos**
  - **Ejemplos**: 
    - `idx_usuarios_email` (en `usuarios.email`): Buscar usuarios por email.
    - `idx_retos_titulo` (en `retos.titulo`): Buscar retos por título.
    - `idx_participacion_usuario_reto` (en `participacion_retos(usuario_id, reto_id)`): Consultas combinadas de usuario y reto.
  - **Para qué sirven**: Aceleran las búsquedas más comunes en la plataforma, como encontrar un usuario o un reto específico.

- **Índice de Texto Completo**
  - **`idx_titulo_retos_text`**
    - **Qué es**: Un índice especial en la columna `titulo` de `retos` para búsquedas avanzadas.
    - **Para qué sirve**: Permite buscar palabras dentro de los títulos de los retos de forma rápida y eficiente.

#### Vista Materializada

- **`vista_progreso_reto_mat`**
  - **Qué es**: Una tabla precalculada que muestra el progreso de los usuarios en los retos, combinando datos de `participacion_retos`, `usuarios` y `retos`.
  - **Para qué sirve**: Ofrece una forma rápida de consultar el progreso sin recalcular todo cada vez.
  - **Índices adicionales**: 
    - `idx_vista_progreso_usuario` (en `nombre`): Búsquedas por nombre de usuario.
    - `idx_vista_progreso_reto` (en `titulo`): Búsquedas por título de reto.

#### Funciones y Triggers

- **Actualización de Nivel de Usuario**
  - **Función**: `actualizar_nivel_usuario()`
  - **Trigger**: `trigger_nivel_usuario`
  - **Qué hace**: Calcula el nivel de un usuario según su puntaje (1 nivel por cada 100 puntos) al actualizar el puntaje.
  - **Para qué sirve**: Automatiza la gamificación para que los niveles suban sin intervención manual.

- **Gestión de Tareas Completadas**
  - **Función**: `gestionar_tarea_completada()`
  - **Trigger**: `trigger_tarea_completada`
  - **Qué hace**: Actualiza la tabla `tareas_completadas` cuando una tarea se marca como completada o se reasigna.
  - **Para qué sirve**: Mantiene un registro exacto de quién completó qué tarea.

- **Gestión de Estado de Participación en Retos**
  - **Función**: `gestionar_estado_participacion()`
  - **Trigger**: `trigger_actualizar_estado`
  - **Qué hace**: Cambia el estado a "completado" cuando el progreso llega al 100%, otorga recompensas y registra logros; revierte si el progreso baja.
  - **Para qué sirve**: Automatiza la finalización de retos y la entrega de premios.

- **Actualización de Puntos Totales en Retos**
  - **Función**: `actualizar_puntos_totales()`
  - **Trigger**: `trigger_actualizar_puntos_totales`
  - **Qué hace**: Recalcula los puntos totales de un reto al agregar, modificar o eliminar tareas.
  - **Para qué sirve**: Mantiene los puntos de los retos actualizados automáticamente.

- **Registro de Logros**
  - **Funciones**: 
    - `registrar_logro_usuario_nuevo()`: Registra un logro al crear un usuario.
    - `gestionar_logro_participacion()`: Registra o elimina logros al unirse o abandonar un reto.
  - **Triggers**: 
    - `trigger_logro_registro_usuario`
    - `trigger_logro_participacion`
  - **Para qué sirven**: Automatizan la gamificación para motivar a los usuarios.

- **Actualización de Fecha de Modificación**
  - **Función**: `actualizar_fecha_modificacion()`
  - **Triggers**: En tablas como `usuarios`, `retos`, `tareas`, `apuntes`, `planes_estudio`.
  - **Qué hace**: Actualiza la columna `fecha_modificacion` al modificar un registro.
  - **Para qué sirve**: Lleva un control de cuándo se editaron los datos.

- **Gestión de Puntaje de Usuario**
  - **Función**: `gestionar_puntaje_usuario()`
  - **Trigger**: `trigger_actualizar_puntaje`
  - **Qué hace**: Suma o resta puntos al usuario al ganar o perder recompensas de tipo "puntos".
  - **Para qué sirve**: Asegura que el puntaje refleje las recompensas obtenidas.

- **Finalización de Retos Vencidos**
  - **Función**: `finalizar_retos_vencidos()`
  - **Qué hace**: Cambia el estado de los retos a "finalizado" si su fecha de fin ya pasó.
  - **Para qué sirve**: Automatiza la clausura de retos viejos (puede programarse con herramientas como `pg_cron`).

- **Actualización de Participaciones en Retos**
  - **Función**: `actualizar_participaciones_reto()`
  - **Trigger**: `trigger_actualizar_participaciones`
  - **Qué hace**: Aumenta o disminuye el contador de participaciones en un reto al unirse o abandonarlo.
  - **Para qué sirve**: Mantiene un conteo exacto de participantes.

- **Cálculo de Promedio de Calificaciones en Apuntes**
  - **Función**: `actualizar_calificacion_promedio()`
  - **Trigger**: `trigger_actualizar_promedio`
  - **Qué hace**: Recalcula el promedio de calificaciones de un apunte al agregar, modificar o eliminar calificaciones.
  - **Para qué sirve**: Muestra una calificación promedio actualizada en todo momento.

- **Registro de Cambios de Progreso**
  - **Función**: `registrar_cambio_progreso()`
  - **Trigger**: `trigger_registrar_cambio_progreso`
  - **Qué hace**: Guarda un historial de los cambios en el progreso de un usuario en un reto.
  - **Para qué sirve**: Permite rastrear cómo avanzan los usuarios en los retos.

- **Notificaciones**
  - **Funciones**:
    - `notificar_tarea_asignada()`: Notifica al asignar una tarea.
    - `notificar_reto_completado()`: Notifica al completar un reto.
    - `notificar_recompensa_obtenida()`: Notifica al ganar una recompensa.
  - **Triggers**: 
    - `trigger_notificar_tarea_asignada`
    - `trigger_notificar_reto_completado`
    - `trigger_notificar_recompensa`
  - **Para qué sirven**: Mantienen a los usuarios informados sobre eventos importantes.

- **Otorgamiento Genérico de Recompensas**
  - **Función**: `otorgar_recompensa_generica()`
  - **Triggers**: 
    - `trigger_recompensa_completar_reto`
    - `trigger_recompensa_subir_apunte`
    - `trigger_recompensa_crear_plan`
  - **Qué hace**: Otorga recompensas según eventos (como completar retos o subir apuntes públicos) y condiciones definidas.
  - **Para qué sirve**: Automatiza la entrega de premios para incentivar a los usuarios.

- **Validación de Integridad Referencial**
  - **Función**: `validar_entidad_id()`
  - **Triggers**: 
    - `trigger_validar_entidad_id` (en `comentarios`)
    - `trigger_validar_entidad_id_archivos` (en `archivos_genericos`)
  - **Qué hace**: Verifica que los IDs en estas tablas apunten a registros válidos (ej. un comentario sobre un reto existente).
  - **Para qué sirve**: Evita errores y datos inconsistentes.

- **Actualización de Fecha de Estado en Retos**
  - **Función**: `actualizar_fecha_estado_reto()`
  - **Trigger**: `trigger_actualizar_fecha_estado`
  - **Qué hace**: Actualiza `fecha_estado` cuando cambia el estado de un reto.
  - **Para qué sirve**: Registra cuándo cambió el estado de un reto.

- **Sincronización de Tareas Completadas**
  - **Función**: `sincronizar_tareas_completadas()`
  - **Trigger**: `trigger_sincronizar_tareas_completadas`
  - **Qué hace**: Asegura que si una tarea completada se asigna a un nuevo usuario, se registre en `tareas_completadas`.
  - **Para qué sirve**: Mantiene la coherencia entre asignaciones y completitud.

- **Notificación de Asignación Múltiple**
  - **Función**: `notificar_asignacion_multiple()`
  - **Trigger**: `trigger_notificar_asignacion_multiple`
  - **Qué hace**: Notifica a todos los usuarios asignados a una tarea a través de `tarea_asignaciones`.
  - **Para qué sirve**: Mejora la comunicación cuando varias personas trabajan en una tarea.

---

## Configuración de la Base de Datos

### Supabase
## Configuración de Supabase

### 1. Crear una cuenta en Supabase

1. Visita [https://supabase.com/](https://supabase.com/) y haz clic en "Start your project"
2. Regístrate usando tu cuenta de GitHub, Google o email
3. Confirma tu correo electrónico si es necesario

### 2. Crear un nuevo proyecto

1. En el dashboard de Supabase, haz clic en "New Project"
2. Asigna un nombre a tu proyecto (por ejemplo, "challenge-plans")
3. Establece una contraseña segura para la base de datos
4. Selecciona la región más cercana para optimizar la latencia
5. Haz clic en "Create new project" y espera a que se complete (puede tomar unos minutos)

### 3. Configurar la base de datos

1. En el menú lateral de tu proyecto, ve a "Database" → "Connection Pooling"
2. Copia la cadena de conexión y guárdala para utilizarla en tu archivo `.env`
3. Ve a "Storage" → "Buckets" y crea un nuevo bucket llamado `apuntes` para almacenar archivos
4. Configura los permisos del bucket según tus necesidades (puedes comenzar con "Public" durante desarrollo)

### 4. Obtener credenciales

1. Ve a "Settings" → "API" en el menú lateral
2. Copia los siguientes valores:
    - **URL**: Es tu endpoint de API
    - **anon public**: Clave para operaciones públicas
    - **service_role**: Clave para operaciones privilegiadas (¡mantén esta segura!)
    - 2.1. **Encuentra las credenciales de conexión**
      - En el menú lateral izquierdo, busca la sección "Configuración" (Settings)
      - Haz clic en "Database" (Base de datos)
      - Desplázate hacia abajo hasta la sección "Connection Info" o "Connection Pooling"
      - Aquí encontrarás toda la información necesaria:
         - **Host**: Aparece como "Host" o en la cadena de conexión (termina con `.supabase.co`)
         - **Port**: Generalmente 5432 (puerto estándar de PostgreSQL) o 6543 para conexiones directas
         - **Database name**: Normalmente "postgres"
         - **User**: "postgres" por defecto
         - **Password**: Haz clic en "Show Password" para ver tu contraseña
  
### 5. Configurar variables de entorno

Añade estas variables a tu archivo `.env` del backend:

```
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=tu-clave-anon-public
SUPABASE_SERVICE_KEY=tu-clave-service-role
SUPABASE_BUCKET=apuntes
```

### 6. Probar la conexión

Ejecuta el siguiente comando para verificar que tu aplicación puede conectarse a Supabase:

```bash
cd backend
npm run verify-supabase
```

> **Nota**: Asegúrate de que la opción "Row Level Security (RLS)" esté habilitada para tus tablas en producción para mayor seguridad.

### Migraciones

Para crear la base de datos inicial y aplicar las migraciones, ejecuta:

```bash
cd backend
npm run migration:create:initial
npm run migration:run
```

### Variables de Entorno

Crea un archivo `.env` en el directorio `/backend` con las siguientes variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=challenge_plans

# URL de proyecto Supabase
# Otras variables de entorno
PORT=5000
JWT_SECRET=tu_secreto_jwt

# Modo de ambiente
NODE_ENV=development

SUPABASE_BUCKET=nombre_bucket
SUPABASE_SECRET_KEY=tu_supabase_key
SUPABASE_URL=postgres://usuario:contraseña@localhost:5432/nombre_base_datos
```

### Verificación de la conexión a la base de datos

Para verificar que la conexión a la base de datos funciona correctamente, ejecuta:

```bash
cd backend
npm run verify-conn
```

### Sistema de Migraciones

El proyecto utiliza TypeORM para gestionar migraciones que configuran el esquema de base de datos. Las migraciones están organizadas en cuatro componentes principales:

| Migración | Descripción | Script |
| --- | --- | --- |
| Initial Migration | Crea todas las tablas base del sistema | `migration:initial` |
| Triggers and Functions | Añade triggers, funciones e índices para optimización | `migration:triggers` |
| Notifications and Audit | Configura el sistema de notificaciones y auditoría | `migration:notifications` |
| Drop Database | Elimina completamente el esquema (¡usar con precaución!) | `migration:dropdb` |
| Seed Database | Añade registros iniciales para pruebas y desarrollo | `migration:seed` |

#### Estrategias de Ejecución de Migraciones

Existen dos formas de ejecutar las migraciones:

1. **Ejecución Automática de Todas las Migraciones**:

```bash
npm run migration:run
```

Este comando ejecuta **todas** las migraciones en el orden especificado en los nombres de archivo (por ejemplo, 1741400000000-InitialMigration.ts se ejecutará antes que 1741500000000-NotificationsAndAuditSystem.ts).
 
> ⚠️ **Advertencia**: Este método puede causar errores si las migraciones no están diseñadas para ejecutarse secuencialmente sin intervención manual.

2. **Ejecución Manual Controlada** (Recomendada para desarrollo):

```bash
# Paso 1: Limpiar la base de datos (si es necesario)
npm run migration:dropdb

# Paso 2: Crear tablas base
npm run migration:initial

# Paso 3: Añadir triggers y funciones
npm run migration:triggers

# Paso 4: Configurar sistema de notificaciones y auditoría
npm run migration:notifications

# Paso 5: Añadir registros
npm run migration:seed
```

Este enfoque te da control total sobre el proceso y permite verificar el resultado después de cada paso.

#### Verificación del Esquema

Para verificar el estado actual de la base de datos:

```bash
npm run verify-db
```

Este comando muestra información detallada sobre todas las tablas, triggers, funciones e índices existentes en la base de datos.

#### Revertir una Migración

Si necesitas revertir la última migración ejecutada:

```bash
npm run migration:revert
```

#### Flujo de Trabajo Recomendado para Desarrollo

1. **Configuración inicial**:

```bash
npm run migration:dropdb
npm run migration:initial
npm run migration:triggers
npm run migration:notifications
npm run migration:seed
```

2. **Desarrollo iterativo**:

    - Modifica entidades en `src/entities`
    - Genera una migración específica: `npm run migration:generate -- MiCambio`
    - Ejecuta solo esa migración manualmente
3. **Reinicio completo** (cuando sea necesario):

    - Volver al paso 1

### Descripción de las Migraciones

- **InitialMigration**: Crea la estructura básica de tablas y relaciones.
- **TriggersAndFunctions**: Implementa optimizaciones como índices, triggers para actualización automática y funciones especializadas.
- **NotificationsAndAuditSystem**: Configura el sistema de notificaciones en tiempo real y el registro de auditoría para cambios importantes.
- **Migración de Datos Semilla**: Inserta datos de ejemplo para roles, usuarios, retos, categorías, etc.
- **DropDatabase**: Migración especial que elimina y recrea todo el esquema para desarrollo.


# Desarrollo 
## 1. BackEnd

## 2. FrontEnd

## 🔌 API Endpoints

La aplicación expone los siguientes endpoints RESTful organizados por módulos:

### 🔐 Autenticación y Usuarios (`/api/auth`)

| Método | Endpoint | Descripción | Acceso | Body/Params |
|--------|----------|-------------|--------|-------------|
| `POST` | `/api/auth/register` | Registra un nuevo usuario | Público | `{ email, password, nombre }` |
| `POST` | `/api/auth/login` | Inicia sesión y obtiene tokens | Público | `{ email, password }` |
| `GET` | `/api/auth/profile` | Obtiene perfil del usuario | Privado | Header: `Authorization: Bearer {token}` |
| `POST` | `/api/auth/refresh-token` | Refresca el token de acceso | Público | `{ refreshToken }` |
| `POST` | `/api/auth/reset-password` | Restablece contraseña de un usuario | Admin | `{ userId, newPassword }` |

#### Guía para obtener el perfil de usuario

Para acceder al perfil de usuario necesitas seguir estos pasos:

1. **Iniciar sesión para obtener el token de acceso**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "estudiante1@example.com", "password": "hash_est789"}'
   ```
   Guarda el `accessToken` de la respuesta.

2. **Acceder al endpoint de perfil usando el token**
   ```bash
   curl -X GET http://localhost:5000/api/auth/profile \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Usando Postman**
   - Crea una colección nueva para "Challenge Plans API"
   - Configura un entorno con las variables:
     - `base_url`: `http://localhost:5000/api`
     - `token`: (déjalo vacío inicialmente)
   - Crea una petición POST para login:
     - URL: `{{base_url}}/auth/login`
     - Body (JSON): `{"email": "estudiante1@example.com", "password": "hash_est789"}`
     - En la pestaña "Tests", añade:
       ```javascript
       if (pm.response.code === 200) {
           var jsonData = pm.response.json();
           pm.environment.set("token", jsonData.accessToken);
       }
       ```
   - Crea una petición GET para el perfil:
     - URL: `{{base_url}}/auth/profile`
     - Headers: `Authorization: Bearer {{token}}`

4. **Respuesta esperada**
   ```json
   {
     "user": {
       "id": "uuid-del-usuario",
       "email": "estudiante1@example.com",
       "nombre": "Estudiante Uno",
       "fecha_registro": "2023-07-25T15:30:00.000Z",
       "puntaje": 200,
       "nivel": 2,
       "fecha_creacion": "2023-07-25T15:30:00.000Z",
       "fecha_modificacion": "2023-07-25T15:30:00.000Z",
       "roles": ["Estudiante"],
       "permisos": ["ver_retos", "participar_reto", "subir_apunte", ...]
     }
   }
   ```

#### Guía para restablecer contraseña de usuario (Administradores)

Para utilizar el endpoint de restablecimiento de contraseña, debes seguir estos pasos:

1. **Obtener un token de administrador**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "hash_admin123"}'
   ```
   Guarda el `accessToken` devuelto.

2. **Utilizar el endpoint para restablecer la contraseña**
   ```bash
   curl -X POST http://localhost:5000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {accessToken}" \
     -d '{
       "userId": "uuid-del-usuario-objetivo",
       "newPassword": "nueva_contraseña"
     }'
   ```

3. **Usando Postman**
   - Obtén primero el token como administrador con el endpoint de login
   - Crea una nueva petición POST a `{{base_url}}/auth/reset-password`
   - En la pestaña "Headers":
     - Key: `Authorization`
     - Value: `Bearer {{token}}`
   - En la pestaña "Body", selecciona "raw" y "JSON":
     ```json
     {
       "userId": "uuid-del-usuario-objetivo",
       "newPassword": "nueva_contraseña123"
     }
     ```

4. **Respuestas posibles**

   | Código | Descripción | Respuesta |
   |--------|-------------|-----------|
   | 200 | Éxito | `{ message: "Contraseña restablecida correctamente" }` |
   | 401 | No autenticado | `{ message: "No autenticado" }` |
   | 403 | Sin permisos | `{ message: "No tiene permisos para esta acción" }` |
   | 404 | No encontrado | `{ message: "Usuario no encontrado" }` |

> **Nota**: Este endpoint solo está disponible para usuarios con el rol de Administrador o que tengan el permiso específico `editar_usuario`.

#### Ejemplos de Uso

**Registro de Usuario:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "password": "contraseña123", "nombre": "Usuario Ejemplo"}'
```

**Inicio de Sesión:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "password": "contraseña123"}'
```

**Obtener Perfil:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 🎯 Retos (Desafíos)

| Método | Ruta                          | Descripción                            | Autenticación | Permisos          |
|--------|-------------------------------|-----------------------------------------|--------------|-------------------|
| GET    | /api/retos                    | Obtiene lista de retos públicos o todos | Opcional     | ver_retos         |
| GET    | /api/retos/:id                | Obtiene un reto específico por ID       | Opcional     | -                 |
| GET    | /api/retos/user/participations| Obtiene los retos del usuario actual    | Requerida    | -                 |
| GET    | /api/retos/stats/popular      | Obtiene los retos más populares         | No requerida | -                 |
| POST   | /api/retos                    | Crea un nuevo reto                      | Requerida    | crear_reto        |
| PUT    | /api/retos/:id                | Actualiza un reto existente             | Requerida    | editar_reto       |
| DELETE | /api/retos/:id                | Elimina un reto existente               | Requerida    | eliminar_reto     |
| POST   | /api/retos/:id/join           | Permite unirse a un reto                | Requerida    | participar_reto   |
| PATCH  | /api/retos/:id/progress       | Actualiza el progreso en un reto        | Requerida    | -                 |

## Guía de uso de la API de Retos

### Obtener lista de retos

#### Como usuario no autenticado (solo retos públicos)
```bash
GET /api/retos
```

Solo retornará retos públicos y en estado activo.

#### Como administrador (todos los retos)
```bash
GET /api/retos
Authorization: Bearer [token_admin]
```

Para obtener todos los retos (tanto públicos como privados) como administrador:

1. **Autenticarse como administrador:**

### Planes de Estudio

| Método | Ruta                                      | Descripción                               | Autenticación | Permisos          |
|--------|-------------------------------------------|------------------------------------------|--------------|-------------------|
| GET    | /api/planes-estudio                       | Obtiene todos los planes públicos o todos | Opcional     | ver_planes        |
| GET    | /api/planes-estudio/:id                   | Obtiene un plan específico por ID         | Opcional     | -                 |
| GET    | /api/planes-estudio/search                | Busca planes por término                  | Opcional     | -                 |
| GET    | /api/planes-estudio/stats/popular         | Obtiene los planes más populares          | No requerida | -                 |
| GET    | /api/planes-estudio/user/me               | Obtiene planes del usuario autenticado    | Requerida    | -                 |
| GET    | /api/planes-estudio/user/:userId          | Obtiene planes de un usuario específico   | Opcional     | -                 |
| GET    | /api/planes-estudio/:id/retos             | Obtiene retos asociados a un plan         | Opcional     | -                 |
| POST   | /api/planes-estudio                       | Crea un nuevo plan de estudios            | Requerida    | crear_plan        |
| POST   | /api/planes-estudio/:id/retos             | Asigna retos a un plan                    | Requerida    | asociar_reto_plan |
| PUT    | /api/planes-estudio/:id                   | Actualiza un plan existente               | Requerida    | editar_plan       |
| DELETE | /api/planes-estudio/:id                   | Elimina un plan existente                 | Requerida    | eliminar_plan     |
| DELETE | /api/planes-estudio/:id/retos/:retoId     | Elimina un reto de un plan                | Requerida    | editar_plan       |

#### Obtener todos los planes de estudio


