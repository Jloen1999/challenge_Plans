# Plataforma de Aprendizaje Colaborativo para Estudiantes

## Descripción General

Plataforma web diseñada para estudiantes que buscan un entorno interactivo y seguro para el aprendizaje colaborativo. Facilita la creación y participación en retos académicos personalizables, la organización de planes de estudio, la gestión de tareas, el intercambio de apuntes y ofrece un sistema de recompensas gamificado.

## Índice

- [Plataforma de Aprendizaje Colaborativo para Estudiantes](#plataforma-de-aprendizaje-colaborativo-para-estudiantes)
  - [Descripción General](#descripción-general)
  - [Índice](#índice)
  - [Objetivos](#objetivos)
  - [Requisitos](#requisitos)
    - [1. Requisitos Funcionales](#1-requisitos-funcionales)
    - [2. Requisitos No Funcionales](#2-requisitos-no-funcionales)
  - [Casos de Uso](#casos-de-uso)
    - [CU02: Crear un Reto](#cu02-crear-un-reto)
    - [CU03: Unirse a un Reto](#cu03-unirse-a-un-reto)
    - [CU04: Gestionar Planes de Estudio](#cu04-gestionar-planes-de-estudio)
    - [CU05: Subir Apuntes](#cu05-subir-apuntes)
    - [CU06: Gestionar Tareas de un Reto](#cu06-gestionar-tareas-de-un-reto)
    - [CU07: Actualizar Progreso en un Reto](#cu07-actualizar-progreso-en-un-reto)
    - [CU08: Obtener Recompensas](#cu08-obtener-recompensas)
    - [CU09: Registrar Logros](#cu09-registrar-logros)
    - [CU10: Categorizar Retos](#cu10-categorizar-retos)
      - [CU11: Subir y Descargar Apuntes](#cu11-subir-y-descargar-apuntes)
  - [Tecnologías](#tecnologías)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Configuración Inicial](#configuración-inicial)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Versión 1: Modelo de Base de Datos](#versión-1-modelo-de-base-de-datos)
  - [Versión 2: Modelo de bases de datos (Normalizado)](#versión-2-modelo-de-bases-de-datos-normalizado)
    - [SQL Completo con Mejoras](#sql-completo-con-mejoras)
    - [Explicación de las Mejoras Implementadas](#explicación-de-las-mejoras-implementadas)
  - [**Explicación de Atributos por Tabla**](#explicación-de-atributos-por-tabla)
    - [**1. usuarios**](#1-usuarios)
    - [**2. categorias**](#2-categorias)
    - [**3. retos**](#3-retos)
    - [**4. reto\_categorias**](#4-reto_categorias)
    - [**5. participacion\_retos**](#5-participacion_retos)
    - [**6. tareas**](#6-tareas)
    - [**7. planes\_estudio**](#7-planes_estudio)
    - [**8. apuntes**](#8-apuntes)
    - [**9. recompensas**](#9-recompensas)
    - [**10. usuario\_recompensas**](#10-usuario_recompensas)
    - [**11. logros**](#11-logros)
  - [**Relaciones entre Tablas**](#relaciones-entre-tablas)
    - [**Relaciones Principales**](#relaciones-principales)
- [Registrarse en Supabase](#registrarse-en-supabase)
- [Obtener las credenciales de conexión a supabase y almacenarlas en un .env](#obtener-las-credenciales-de-conexión-a-supabase-y-almacenarlas-en-un-env)
- [Cómo comprobar la conexión a la base de datos en Supabase](#cómo-comprobar-la-conexión-a-la-base-de-datos-en-supabase)
  - [1. Ejecutar el script de prueba typescript](#1-ejecutar-el-script-de-prueba-typescript)
  - [3. Interpretar los resultados](#3-interpretar-los-resultados)
    - [Si la conexión es exitosa, verás:](#si-la-conexión-es-exitosa-verás)
    - [Si hay un error de conexión, verás:](#si-hay-un-error-de-conexión-verás)
  - [Posibles problemas y soluciones:](#posibles-problemas-y-soluciones)
- [Formas de ejecutar el script de creación de las tablas e inserción de registros](#formas-de-ejecutar-el-script-de-creación-de-las-tablas-e-inserción-de-registros)
  - [1. Ejecutar el script en el editor de Supabase](#1-ejecutar-el-script-en-el-editor-de-supabase)
  - [2. Ejecutar el typescript en el terminal con el comando ``npx ts-node src/create-tables.ts``](#2-ejecutar-el-typescript-en-el-terminal-con-el-comando-npx-ts-node-srccreate-tablests)
- [Guía para ejecutar la aplicación web Challenge Plans](#guía-para-ejecutar-la-aplicación-web-challenge-plans)
  - [1. Preparar y ejecutar el Backend](#1-preparar-y-ejecutar-el-backend)
  - [Verificar la conexión a la base de datos](#verificar-la-conexión-a-la-base-de-datos)
  - [Ejecutar el servidor backend](#ejecutar-el-servidor-backend)
  - [Inicia el servidor](#inicia-el-servidor)
  - [O puedes usar](#o-puedes-usar)
  - [Ejecutar la aplicación React](#ejecutar-la-aplicación-react)
  - [Ver la aplicación en el navegador](#ver-la-aplicación-en-el-navegador)

## Objetivos

* **Fomentar el aprendizaje colaborativo:** Facilitando la creación y participación en retos académicos.
* **Organización eficiente:** Permitir la creación y gestión de planes de estudio con tareas y plazos definidos.
* **Repositorio colaborativo:** Ofrecer un espacio para compartir y acceder a apuntes digitales.
* **Motivación:** Implementar un sistema de gamificación con recompensas por logros.
* **Rendimiento y seguridad:** Garantizar la escalabilidad y seguridad en el manejo de datos.

## Requisitos

### 1. Requisitos Funcionales
Los **requisitos funcionales** describen las capacidades que la plataforma debe ofrecer a los usuarios.
| ID   | Descripción                                                         | Prioridad |
| :--- | :------------------------------------------------------------------ | :-------- |
| RF01 | Autenticación de usuarios (registro/inicio sesión)                  | Alta      |
| RF02 | Creación/edición de retos con tareas y plazos                       | Alta      |
| RF03 | Unirse a retos existentes                                           | Alta      |
| RF04 | Gestión de planes de estudio (CRUD)                                 | Media     |
| RF05 | Subida/descarga de apuntes (PDF, imágenes, texto)                   | Media     |
| RF06 | Sistema de recompensas (insignias, puntos)                          | Baja      |
| RF07 | Seguimiento de progreso en retos y planes                           | Media     |
| RF08 | Buscar retos y apuntes por categorías o etiquetas                   | Baja      |
| RF09 | Permitir interacción social (comentarios o valoraciones en apuntes) | Baja      |

**Notas:**

- Los requisitos de alta prioridad (RF01 a RF03) son esenciales para la funcionalidad básica de la plataforma.
  
- RF04 a RF07 amplían las capacidades y mejoran la experiencia del usuario.
  
- RF08 y RF09 son funcionalidades adicionales que podrían implementarse en fases posteriores

### 2. Requisitos No Funcionales
Los **requisitos no funcionales** aseguran que la plataforma sea eficiente, segura y escalable.

- **Rendimiento:** La plataforma debe responder en menos de 2 segundos para el 95% de las solicitudes.
  
- **Seguridad:**
    - Encriptación AES-256 para contraseñas.
  
    - Uso de JWT (JSON Web Tokens) con *refresh tokens* para la gestión de sesiones.
  
- **Escalabilidad:** Diseño modular que permita añadir nuevas funcionalidades sin afectar las existentes.
  
- **Compatibilidad:** Soporte para las últimas dos versiones de navegadores como Chrome, Firefox, Safari y Edge.
  
- **Disponibilidad:** Garantizar un 99.9% de tiempo de actividad mediante balanceo de carga y redundancia.
  
- **Usabilidad:** Interfaz intuitiva y responsiva, adaptable a dispositivos móviles y de escritorio.

## Casos de Uso

### CU02: Crear un Reto

- **Actor:** Usuario (Estudiante)
  
- **Descripción:** Crear un nuevo reto académico con tareas y plazos definidos.
  
- **Precondiciones:** El usuario está autenticado.
  
- **Flujo Principal:**
    1. El usuario selecciona "Crear Reto" desde el *dashboard*.
  
    2. Rellena un formulario con título, descripción, categoría, fechas límite y tareas (título, descripción, puntos).
  
    3. El sistema valida que las fechas sean correctas (fecha fin &gt; fecha inicio).
  
    4. El reto se publica y queda disponible para que otros usuarios se unan.
  
- **Excepciones:**
    - Fechas inválidas o título duplicado: Mostrar mensaje de error.

* * *

### CU03: Unirse a un Reto

- **Actor:** Usuario (Estudiante)
  
- **Descripción:** Participar en un reto creado por otro usuario.
  
- **Precondiciones:** El usuario está autenticado y el reto está disponible.
  
- **Flujo Principal:**
    1. El usuario busca retos en la sección "Explorar".
  
    2. Visualiza detalles del reto (tareas, participantes, plazo).
  
    3. Selecciona "Unirse al Reto" y recibe confirmación.
  
- **Excepciones:**
    - Reto no disponible o ya completado: Mostrar mensaje de error.

* * *

### CU04: Gestionar Planes de Estudio

- **Actor:** Usuario (Estudiante)
  
- **Descripción:** Crear, editar o eliminar un plan de estudio.
  
- **Precondiciones:** El usuario está autenticado.
  
- **Flujo Principal:**
    1. El usuario selecciona "Crear Plan de Estudio" desde el *dashboard*.
  
    2. Rellena un formulario con título, descripción, fecha de inicio y duración en días.
  
    3. El sistema guarda el plan y lo asocia al usuario.
  
- **Excepciones:**
    - Duración inválida (menor o igual a 0): Mostrar mensaje de error.

* * *

### CU05: Subir Apuntes

- **Actor:** Usuario (Estudiante)
  
- **Descripción:** Subir apuntes en formato PDF, Markdown o DOCX.
  
- **Precondiciones:** El usuario está autenticado.
  
- **Flujo Principal:**
    1. El usuario selecciona "Subir Apunte" desde el *dashboard*.
  
    2. Ingresa título, selecciona formato y opcionalmente lo asocia a un reto o plan de estudio.
  
    3. El sistema guarda el apunte y lo hace disponible para descarga.
  
- **Excepciones:**
    - Formato no permitido: Mostrar mensaje de error.

* * *

### CU06: Gestionar Tareas de un Reto

- **Actor:** Usuario (Creador del Reto)
  
- **Descripción:** Añadir, editar o eliminar tareas dentro de un reto.
  
- **Precondiciones:** El usuario está autenticado y es el creador del reto.
  
- **Flujo Principal:**
    1. El usuario accede al panel de gestión del reto.
  
    2. Selecciona "Añadir Tarea" y rellena título, descripción, puntos y tipo.
  
    3. El sistema guarda la tarea y la asocia al reto.
  
- **Excepciones:**
    - Puntos inválidos (menor o igual a 0): Mostrar mensaje de error.

* * *

### CU07: Actualizar Progreso en un Reto

- **Actor:** Usuario (Participante del Reto)
  
- **Descripción:** Actualizar el progreso personal en un reto.
  
- **Precondiciones:** El usuario está autenticado y participa en el reto.
  
- **Flujo Principal:**
    1. El usuario accede al panel del reto.
  
    2. Marca tareas como completadas o actualiza el porcentaje de progreso.
  
    3. El sistema registra el nuevo progreso.
  
- **Excepciones:**
    - Progreso fuera de rango (0-100): Mostrar mensaje de error.

* * *

### CU08: Obtener Recompensas

- **Actor:** Usuario (Estudiante)
  
- **Descripción:** Obtener recompensas automáticamente al cumplir ciertos criterios.
  
- **Precondiciones:** El usuario está autenticado y cumple con los criterios de obtención.
  
- **Flujo Principal:**
    1. El sistema verifica si el usuario ha cumplido con un criterio (ej., completar un reto).
  
    2. Si se cumple, el sistema asigna la recompensa correspondiente.
  
    3. El usuario puede ver sus recompensas en su perfil.
  
- **Excepciones:**
    - Criterio no cumplido: No se asigna recompensa.

* * *

### CU09: Registrar Logros

- **Actor:** Sistema (automático)
  
- **Descripción:** Registrar logros del usuario, como completar tareas o unirse a retos.
  
- **Precondiciones:** El usuario realiza una acción que genera un logro.
  
- **Flujo Principal:**
    1. El usuario realiza una acción (ej., completar una tarea).
  
    2. El sistema registra el logro en la base de datos.
  
    3. El logro se asocia al usuario y a la acción realizada.
  
- **Excepciones:**
    - Acción no válida: No se registra logro.

* * *

### CU10: Categorizar Retos

- **Actor:** Usuario (Creador del Reto)
  
- **Descripción:** Asignar una o más categorías a un reto.
  
- **Precondiciones:** El usuario está autenticado y es el creador del reto.
  
- **Flujo Principal:**
    1. Durante la creación o edición del reto, el usuario selecciona categorías.
  
    2. El sistema asocia el reto a las categorías seleccionadas.
  
    3. Las categorías aparecen en la descripción del reto.
  
- **Excepciones:**
    - Categoría no existente: Mostrar mensaje de error.

#### CU11: Subir y Descargar Apuntes

- **Actor:** Estudiante
  
- **Descripción:** Compartir y acceder a apuntes.
  
- **Flujo Principal:**
    1. Selecciona "Subir Apunte" desde el *dashboard*.
  
    2. Ingresa título, selecciona formato (PDF, imagen, texto) y asocia opcionalmente a un reto o plan.
  
    3. Otros usuarios pueden descargar el apunte desde la sección correspondiente.


## Tecnologías

* **Frontend:** React + TypeScript, Redux Toolkit, React Router, Axios.
* **Backend:** Express.js + TypeScript, PostgreSQL (Supabase), TypeORM.
* **Autenticación:** JWT con refresh tokens.
* **Almacenamiento:** Supabase Storage para archivos.
* **Extra:** Socket.io para notificaciones en tiempo real.

## Estructura del Proyecto

```text
/backend
  ├── src/
  │   ├── controllers/ # Lógica de endpoints
  │   ├── models/      # Entidades de DB
  │   └── config/      # Variables de entorno
  ├── package.json
  └── tsconfig.json

/frontend
  ├── src/
  │   ├── components/  # Componentes reutilizables
  │   ├── pages/       # Vistas principales
  │   ├── hooks/       # Custom hooks
  │   ├── services/    # Conexión a APIs
  │   └── assets/      # Imágenes/fuentes
  ├── package.json
  └── vite.config.ts
```

## Configuración Inicial

### Backend

```bash
npm init -y
npm install express typescript ts-node @types/express pg typeorm reflect-metadata dotenv
npx tsc --init # Configurar outDir como "./dist"
npm install cors
npm install @types/cors
npm install pg fs path
npm install jsonwebtoken bcryptjs express-validator --save
npm i --save-dev @types/jsonwebtoken
# Instala multer y sus tipos
npm install multer
npm install @types/multer --save-dev

# Instala otras dependencias necesarias para el controlador de apuntes
npm install @supabase/supabase-js uuid
npm install @types/uuid --save-dev
npm install @types/morgan --save-dev

```

### Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @reduxjs/toolkit react-router-dom axios socket.io-client
npm install react-icons
npm install marked @types/marked
npm install dompurify
npm install --save-dev @types/dompurify
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install uuid
```

## Versión 1: Modelo de Base de Datos

```sql
-- Tabla de Usuarios (sin cambios)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    hash_contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntaje INT DEFAULT 0 CHECK (puntaje >= 0)
);

-- Tabla de Retos (añadida relación con planes_estudio)
CREATE TABLE retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado')),
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    dificultad VARCHAR(15) CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado'))
);

-- Tabla de Participación en Retos (sin cambios)
CREATE TABLE participacion_retos (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE CASCADE,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progreso INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    PRIMARY KEY (usuario_id, reto_id)
);

-- Tabla de Tareas (añadida relación con usuarios para asignación)
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos INT NOT NULL CHECK (puntos > 0),
    fecha_limite DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('lectura', 'ejercicio', 'proyecto'))
);

-- Tabla de Planes de Estudio (sin cambios)
CREATE TABLE planes_estudio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    duracion_dias INT CHECK (duracion_dias > 0),
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado'))
);

-- Tabla de Apuntes (añadida relación con planes_estudio)
CREATE TABLE apuntes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE SET NULL,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.0 CHECK (calificacion_promedio BETWEEN 0 AND 5),
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado'))
);

-- Tabla de Recompensas (sin cambios)
CREATE TABLE recompensas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('insignia', 'puntos', 'nivel')),
    valor INT NOT NULL CHECK (valor > 0),
    criterio_obtencion TEXT NOT NULL
);

-- Tabla de Relación Usuario-Recompensas (sin cambios)
CREATE TABLE usuario_recompensas (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    recompensa_id UUID REFERENCES recompensas(id) ON DELETE CASCADE,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, recompensa_id)
);
```

## Versión 2: Modelo de bases de datos (Normalizado)
Este diseño incluye optimizaciones en la estructura, índices para consultas rápidas, campos de auditoría, soporte para gamificación y otras mejoras que facilitan el uso y la integración con APIs.

### SQL Completo con Mejoras

```sql
-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    hash_contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntaje INT DEFAULT 0 CHECK (puntaje >= 0),
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL
);
-- Tabla de Planes de Estudio (debe crearse antes que retos debido a la referencia)
CREATE TABLE IF NOT EXISTS planes_estudio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    -- Cambiado de fecha_creacion a fecha_inicio
    duracion_dias INT CHECK (duracion_dias > 0),
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Retos
CREATE TABLE IF NOT EXISTS retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE
    SET NULL,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
        estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
        dificultad VARCHAR(15) CHECK (
            dificultad IN ('principiante', 'intermedio', 'avanzado')
        ),
        creado_por UUID REFERENCES usuarios(id),
        modificado_por UUID REFERENCES usuarios(id),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Relación Retos-Categorías (N:M)
CREATE TABLE IF NOT EXISTS reto_categorias (
    reto_id UUID REFERENCES retos(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (reto_id, categoria_id)
);
-- Tabla de Participación en Retos
CREATE TABLE IF NOT EXISTS participacion_retos (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE CASCADE,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progreso INT DEFAULT 0 CHECK (
        progreso BETWEEN 0 AND 100
    ),
    PRIMARY KEY (usuario_id, reto_id)
);
-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    asignado_a UUID REFERENCES usuarios(id) ON DELETE
    SET NULL,
        titulo VARCHAR(100) NOT NULL,
        descripcion TEXT,
        puntos INT NOT NULL CHECK (puntos > 0),
        fecha_limite DATE,
        tipo VARCHAR(20) CHECK (tipo IN ('lectura', 'ejercicio', 'proyecto')),
        creado_por UUID REFERENCES usuarios(id),
        modificado_por UUID REFERENCES usuarios(id),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Apuntes
CREATE TABLE IF NOT EXISTS apuntes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE
    SET NULL,
        documento_url VARCHAR DEFAULT 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/sign/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHVudGVzL2RjOTg1YzUwLTEyZDgtNGUzYi04OGExLTE1OTg5NjgwODkwMy9jcC5wZGYiLCJpYXQiOjE3NDA5MzUzNDYsImV4cCI6MTc3MjQ3MTM0Nn0.W7xIp6wlVwoSuAPNv0PfwnI0evY4Lr-bLQwGc5zAnvE'
    SET NULL,
        plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE
    SET NULL,
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT,
        formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
        fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Esta es distinta de fecha_creacion
        calificacion_promedio DECIMAL(3, 2) DEFAULT 0.0 CHECK (
            calificacion_promedio BETWEEN 0 AND 5
        ),
        creado_por UUID REFERENCES usuarios(id),
        modificado_por UUID REFERENCES usuarios(id),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Recompensas
CREATE TABLE IF NOT EXISTS recompensas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('insignia', 'puntos', 'nivel')),
    valor INT NOT NULL CHECK (valor > 0),
    criterio_obtencion TEXT NOT NULL
);
-- Tabla de Relación Usuario-Recompensas (N:M)
CREATE TABLE IF NOT EXISTS usuario_recompensas (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    recompensa_id UUID REFERENCES recompensas(id) ON DELETE CASCADE,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, recompensa_id)
);
-- Tabla de Logros (para gamificación)
CREATE TABLE IF NOT EXISTS logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    -- Ejemplo: 'completar_tarea', 'unirse_reto'
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_retos_titulo ON retos(titulo);
CREATE INDEX IF NOT EXISTS idx_retos_estado ON retos(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_reto_id ON tareas(reto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON tareas(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_apuntes_titulo ON apuntes(titulo);
CREATE INDEX IF NOT EXISTS idx_apuntes_fecha_subida ON apuntes(fecha_subida);
CREATE INDEX IF NOT EXISTS idx_participacion_retos_usuario_id ON participacion_retos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_participacion_retos_reto_id ON participacion_retos(reto_id);
-- Vista para consultar el progreso en retos
CREATE OR REPLACE VIEW vista_progreso_reto AS
SELECT u.nombre,
    r.titulo,
    pr.progreso
FROM participacion_retos pr
    JOIN usuarios u ON pr.usuario_id = u.id
    JOIN retos r ON pr.reto_id = r.id;
-- Índice de texto completo para búsqueda avanzada en títulos de retos
CREATE INDEX IF NOT EXISTS idx_titulo_retos_text ON retos USING GIN (to_tsvector('spanish', titulo));
```

---

### Explicación de las Mejoras Implementadas

1. **Normalización y Relaciones:**
   - Se incluyó la tabla `reto_categorias` para manejar relaciones N:M entre `retos` y `categorias`.
   - La tabla `usuario_recompensas` permite asignar múltiples recompensas a usuarios.

2. **Optimización de Consultas:**
   - Se añadieron índices en campos frecuentemente consultados como `email`, `titulo`, `estado`, y claves foráneas.
   - Un índice de texto completo (`idx_titulo_retos_text`) permite búsquedas avanzadas en los títulos de los retos.

3. **Tipos de Datos:**
   - Se usaron tipos como `UUID` para identificadores únicos y restricciones (`CHECK`) para garantizar integridad de datos.

4. **Auditoría:**
   - Campos como `creado_por`, `modificado_por`, `fecha_creacion` y `fecha_modificacion` se añadieron a las tablas principales para rastrear cambios.

5. **Soporte a Gamificación:**
   - La tabla `logros` registra eventos como completar tareas o unirse a retos.
   - La tabla `recompensas` y su relación con `usuarios` permite gestionar insignias y puntos.

6. **Facilitar APIs:**
   - La vista `vista_progreso_reto` simplifica consultas complejas para mostrar el progreso de los usuarios en retos.

7. **Experiencia del Usuario:**
   - La estructura soporta búsqueda avanzada y categorización de retos para una mejor navegación.

## **Explicación de Atributos por Tabla**

### **1. usuarios**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único del usuario, generado automáticamente.
  
- **email**: VARCHAR(255) UNIQUE NOT NULL  
Correo electrónico único para autenticación.
  
- **hash\_contraseña**: VARCHAR(255) NOT NULL  
Contraseña encriptada del usuario.
  
- **nombre**: VARCHAR(100) NOT NULL  
Nombre completo del usuario.
  
- **fecha\_registro**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora del registro del usuario.
  
- **puntaje**: INT DEFAULT 0 CHECK (puntaje &gt;= 0)  
Puntos acumulados por el usuario en el sistema de gamificación.
  
- **creado\_por**: UUID REFERENCES usuarios(id)  
ID del usuario que creó este registro (para auditoría).
  
- **modificado\_por**: UUID REFERENCES usuarios(id)  
ID del usuario que modificó este registro por última vez.
  
- **fecha\_creacion**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora de creación del registro.
  
- **fecha\_modificacion**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora de la última modificación del registro.

### **2. categorias**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único de la categoría.
  
- **nombre**: VARCHAR(50) UNIQUE NOT NULL  
Nombre único de la categoría (ej., "Matemáticas", "Historia").

### **3. retos**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único del reto.
  
- **creador\_id**: UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que creó el reto.
  
- **plan\_estudio\_id**: UUID REFERENCES planes\_estudio(id) ON DELETE SET NULL  
ID del plan de estudio al que pertenece el reto (opcional).
  
- **titulo**: VARCHAR(150) NOT NULL  
Título del reto.
  
- **descripcion**: TEXT  
Descripción detallada del reto.
  
- **fecha\_inicio**: DATE NOT NULL  
Fecha de inicio del reto.
  
- **fecha\_fin**: DATE NOT NULL CHECK (fecha\_fin &gt; fecha\_inicio)  
Fecha de finalización del reto.
  
- **estado**: VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado'))  
Estado actual del reto.
  
- **dificultad**: VARCHAR(15) CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado'))  
Nivel de dificultad del reto.
  
- **creado\_por**, **modificado\_por**, **fecha\_creacion**, **fecha\_modificacion**:  
Campos de auditoría similares a los de usuarios.

### **4. reto\_categorias**

- **reto\_id**: UUID REFERENCES retos(id) ON DELETE CASCADE  
ID del reto.
  
- **categoria\_id**: UUID REFERENCES categorias(id) ON DELETE CASCADE  
ID de la categoría asociada al reto.
  
- **PRIMARY KEY (reto\_id, categoria\_id)**  
Clave primaria compuesta para la relación muchos a muchos.

### **5. participacion\_retos**

- **usuario\_id**: UUID REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que participa en el reto.
  
- **reto\_id**: UUID REFERENCES retos(id) ON DELETE CASCADE  
ID del reto en el que participa el usuario.
  
- **fecha\_union**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora en que el usuario se unió al reto.
  
- **progreso**: INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100)  
Porcentaje de progreso del usuario en el reto.
  
- **PRIMARY KEY (usuario\_id, reto\_id)**  
Clave primaria compuesta para la relación muchos a muchos.

### **6. tareas**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único de la tarea.
  
- **reto\_id**: UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE  
ID del reto al que pertenece la tarea.
  
- **asignado\_a**: UUID REFERENCES usuarios(id) ON DELETE SET NULL  
ID del usuario al que se asigna la tarea (opcional).
  
- **titulo**: VARCHAR(100) NOT NULL  
Título de la tarea.
  
- **descripcion**: TEXT  
Descripción detallada de la tarea.
  
- **puntos**: INT NOT NULL CHECK (puntos &gt; 0)  
Puntos otorgados al completar la tarea.
  
- **fecha\_limite**: DATE  
Fecha límite para completar la tarea.
  
- **tipo**: VARCHAR(20) CHECK (tipo IN ('lectura', 'ejercicio', 'proyecto'))  
Tipo de tarea.
  
- **creado\_por**, **modificado\_por**, **fecha\_creacion**, **fecha\_modificacion**:  
Campos de auditoría.

### **7. planes\_estudio**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único del plan de estudio.
  
- **usuario\_id**: UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que creó el plan de estudio.
  
- **titulo**: VARCHAR(150) NOT NULL  
Título del plan de estudio.
  
- **descripcion**: TEXT  
Descripción del plan de estudio.
  
- **fecha\_creacion**: DATE DEFAULT CURRENT\_DATE  
Fecha de creación del plan.
  
- **duracion\_dias**: INT CHECK (duracion\_dias &gt; 0)  
Duración estimada del plan en días.
  
- **creado\_por**, **modificado\_por**, **fecha\_creacion**, **fecha\_modificacion**:  
Campos de auditoría.

### **8. apuntes**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único del apunte.
  
- **usuario\_id**: UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que subió el apunte.
  
- **reto\_id**: UUID REFERENCES retos(id) ON DELETE SET NULL  
ID del reto al que está asociado el apunte (opcional).
  
- **plan\_estudio\_id**: UUID REFERENCES planes\_estudio(id) ON DELETE SET NULL  
ID del plan de estudio al que está asociado el apunte (opcional).
  
- **titulo**: VARCHAR(200) NOT NULL  
Título del apunte.
  
- **contenido**: TEXT  
Contenido del apunte (puede ser texto o referencia a un archivo).
  
- **formato**: VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx'))  
Formato del archivo del apunte.
  
- **fecha\_subida**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora de subida del apunte.
  
- **calificacion\_promedio**: DECIMAL(3,2) DEFAULT 0.0 CHECK (calificacion\_promedio BETWEEN 0 AND 5)  
Calificación promedio dada por otros usuarios.
  
- **creado\_por**, **modificado\_por**, **fecha\_creacion**, **fecha\_modificacion**:  
Campos de auditoría.

### **9. recompensas**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único de la recompensa.
  
- **nombre**: VARCHAR(100) UNIQUE NOT NULL  
Nombre único de la recompensa.
  
- **tipo**: VARCHAR(20) CHECK (tipo IN ('insignia', 'puntos', 'nivel'))  
Tipo de recompensa.
  
- **valor**: INT NOT NULL CHECK (valor &gt; 0)  
Valor numérico de la recompensa.
  
- **criterio\_obtencion**: TEXT NOT NULL  
Descripción del criterio para obtener la recompensa.

### **10. usuario\_recompensas**

- **usuario\_id**: UUID REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que obtuvo la recompensa.
  
- **recompensa\_id**: UUID REFERENCES recompensas(id) ON DELETE CASCADE  
ID de la recompensa obtenida.
  
- **fecha\_obtencion**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora en que se obtuvo la recompensa.
  
- **PRIMARY KEY (usuario\_id, recompensa\_id)**  
Clave primaria compuesta para la relación muchos a muchos.

### **11. logros**

- **id**: UUID PRIMARY KEY DEFAULT gen\_random\_uuid()  
Identificador único del logro.
  
- **usuario\_id**: UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE  
ID del usuario que realizó el logro.
  
- **tipo**: VARCHAR(50) NOT NULL  
Tipo de logro (ej., "completar\_tarea", "unirse\_reto").
  
- **descripcion**: TEXT  
Descripción detallada del logro.
  
- **fecha**: TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
Fecha y hora en que se registró el logro.

* * *

## **Relaciones entre Tablas**

### **Relaciones Principales**

- **usuarios** ↔ **retos**:  

    - **Creador** (1:N): Un usuario puede crear múltiples retos (creador\_id en retos).
  
    - **Participación** (N:M): Un usuario puede participar en múltiples retos y un reto puede tener múltiples participantes (a través de participacion\_retos).
  
- **usuarios** ↔ **planes\_estudio**:  

    - Relación 1:N: Un usuario puede crear múltiples planes de estudio (usuario\_id en planes\_estudio).
  
- **usuarios** ↔ **apuntes**:  

    - Relación 1:N: Un usuario puede subir múltiples apuntes (usuario\_id en apuntes).
  
- **usuarios** ↔ **recompensas**:  

    - Relación N:M: Un usuario puede obtener múltiples recompensas y una recompensa puede ser obtenida por múltiples usuarios (a través de usuario\_recompensas).
  
- **retos** ↔ **tareas**:  

    - Relación 1:N: Un reto puede tener múltiples tareas (reto\_id en tareas).
  
- **retos** ↔ **categorias**:  

    - Relación N:M: Un reto puede pertenecer a múltiples categorías y una categoría puede estar asociada a múltiples retos (a través de reto\_categorias).
  
- **planes\_estudio** ↔ **retos**:  

    - Relación 1:N (opcional): Un plan de estudio puede contener múltiples retos (plan\_estudio\_id en retos).
  
- **tareas** ↔ **usuarios**:  

    - Relación N:1 (opcional): Una tarea puede ser asignada a un usuario (asignado\_a en tareas).
  
- **apuntes** ↔ **retos / planes\_estudio**:  

    - Relación N:1 (opcional): Un apunte puede estar asociado a un reto o plan de estudio (reto\_id o plan\_estudio\_id en apuntes).
  
- **logros** ↔ **usuarios**:  

    - Relación N:1: Un logro es realizado por un usuario (usuario\_id en logros).

# Registrarse en Supabase
1. **Accede a la consola de Supabase**
   - Ve a [https://app.supabase.com/](https://app.supabase.com/)
   - Inicia sesión con tus credenciales
   - Selecciona tu proyecto

# Obtener las credenciales de conexión a supabase y almacenarlas en un .env
[Mirar](/docs/supabase-credentials.md)

# Cómo comprobar la conexión a la base de datos en Supabase
Para verificar que la conexión a tu base de datos Supabase funciona correctamente después de modificar el archivo .env, puedes seguir estos pasos:

## 1. Ejecutar el script de prueba [typescript](/backend/src/test-connection.ts)

Abre una terminal en la carpeta del backend y ejecuta:

<textarea data-mprt="7" class="inputarea monaco-mouse-cursor-text" wrap="off" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="No se puede acceder al editor en este momento. Para habilitar el modo optimizado para lectores de pantalla, use Mayús+Alt+F1" aria-required="false" tabindex="0" role="textbox" aria-roledescription="editor" aria-multiline="true" aria-autocomplete="none"></textarea>

npx ts-node src/test-connection.ts

<canvas width="0" height="66"></canvas><canvas class="minimap-decorations-layer" width="0" height="66"></canvas>

## 3. Interpretar los resultados

### Si la conexión es exitosa, verás:

<textarea data-mprt="7" class="inputarea monaco-mouse-cursor-text" wrap="off" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="No se puede acceder al editor en este momento. Para habilitar el modo optimizado para lectores de pantalla, use Mayús+Alt+F1" aria-required="false" tabindex="0" role="textbox" aria-roledescription="editor" aria-multiline="true" aria-autocomplete="none"></textarea>

✅ Conexión a la base de datos en Supabase establecida correctamente

✅ Consulta de prueba exitosa: [fecha y hora actual]

✅ Conexión cerrada correctamente

✅ Proceso de prueba de conexión completado

<canvas width="0" height="156"></canvas><canvas class="minimap-decorations-layer" width="0" height="156"></canvas>

### Si hay un error de conexión, verás:

<textarea data-mprt="7" class="inputarea monaco-mouse-cursor-text" wrap="off" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="No se puede acceder al editor en este momento. Para habilitar el modo optimizado para lectores de pantalla, use Mayús+Alt+F1" aria-required="false" tabindex="0" role="textbox" aria-roledescription="editor" aria-multiline="true" aria-autocomplete="none"></textarea>

❌ Error al conectar con la base de datos: [detalles del error]

<canvas width="0" height="66"></canvas><canvas class="minimap-decorations-layer" width="0" height="66"></canvas>

## Posibles problemas y soluciones:

1. **Credenciales incorrectas**: Verifica que tu URL, contraseña y usuario de Supabase sean correctos.
2. **Problema con SSL**: Supabase requiere SSL. Si ves errores relacionados con esto, asegúrate de que la opción `ssl` esté configurada correctamente en `data-source.ts`.
3. **Restricciones de dirección IP**: Algunas configuraciones de Supabase pueden tener restricciones de IP. Verifica en tu panel de Supabase si hay restricciones activas.
4. **Firewall o antivirus**: Si utilizas un firewall o antivirus, verifica que no esté bloqueando la conexión.
5. **Tabla de proyección en Supabase**: Asegúrate de que tu base de datos en Supabase esté correctamente configurada y accesible para conexiones desde aplicaciones externas.


# Formas de ejecutar el script de creación de las tablas e inserción de registros
## 1. Ejecutar el [script](/backend/createDB.sql) en el editor de Supabase
[Mirar](/docs/supabase-instructions.md)

## 2. Ejecutar el [typescript](/backend/src/create-tables.ts) en el terminal con el comando ``npx ts-node src/create-tables.ts``
El script ``create-tables.ts`` acepta tres operaciones diferentes:

1. Eliminar todas las tablas
2. Crear todas las tablas según el esquema
3. Insertar datos de ejemplo
Puedes ejecutar las operaciones en secuencia si necesitas recrear la base de datos desde cero:
```bash
npx ts-node src/create-tables.ts 1  # Primero elimina todas las tablas
npx ts-node src/create-tables.ts 2  # Luego crea las tablas nuevamente
npx ts-node src/create-tables.ts 3  # Finalmente inserta datos de ejemplo
```
![MER](/backend/assets/MER.png)

# Guía para ejecutar la aplicación web Challenge Plans

Para visualizar la página web que hemos estado desarrollando, necesitarás ejecutar tanto el backend como el frontend del proyecto. Voy a explicarte paso a paso cómo hacerlo:

## 1. Preparar y ejecutar el Backend

## Verificar la conexión a la base de datos

Puedes comprobar que la conexión a Supabase funciona correctamente ejecutando:

```bash
npx ts-node src/test-connection.ts
```

Si ves el mensaje "✅ Conexión a la base de datos en Supabase establecida correctamente", todo está bien.

## Ejecutar el servidor backend

Para iniciar el servidor backend en modo desarrollo:
```bash
# Inicia el servidor con nodemon para recargar automáticamente cuando hay cambios
npm run dev

# O puedes usar
npx ts-node src/index.ts
```

## Inicia el servidor 
Inicia el servidor con nodemon para recargar automáticamente cuando hay cambios

```bash
npm run dev
```
## O puedes usar

```bash
npx ts-node src/index.ts
```


El servidor debería iniciarse en [localhost](http://localhost:5000) (o el puerto especificado en tu archivo .env)

## Ejecutar la aplicación React

Para iniciar la aplicación de React en modo desarrollo:

```bash
npm run dev
```


La aplicación debería iniciarse y estar disponible en: [localhost](http://localhost:3000) (Vite suele usar este puerto por defecto)

## Ver la aplicación en el navegador
- En caso de error sobre la versión de las dependencias, ejecutar el [bat](/frontend/reinstall-deps.bat)