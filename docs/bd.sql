-- Tabla de Usuarios (eliminado campo rol redundante)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    hash_contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    -- Campo rol eliminado ya que se gestiona a través de la relación usuario_roles
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    puntaje INT DEFAULT 0 CHECK (puntaje >= 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nivel INT DEFAULT 1 CHECK (nivel >= 1)
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50)
);

-- Tabla de Planes de Estudio (debe crearse antes que retos debido a la referencia)
CREATE TABLE IF NOT EXISTS planes_estudio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    duracion_dias INT CHECK (duracion_dias > 0),
    es_publico BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Retos (agregado campo fecha_estado)
CREATE TABLE IF NOT EXISTS retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    es_publico BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'finalizado')),
    fecha_estado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Nuevo: rastrear cambios de estado
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
    dificultad VARCHAR(15) CHECK (
        dificultad IN ('principiante', 'intermedio', 'avanzado')
    ),
    puntos_totales INT DEFAULT 0 CHECK (puntos_totales >= 0),
    participaciones INT DEFAULT 0 CHECK (participaciones >= 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla para relación N:M entre retos y planes de estudio
CREATE TABLE IF NOT EXISTS reto_planes_estudio (
    reto_id UUID REFERENCES retos(id) ON DELETE CASCADE,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE CASCADE,
    fecha_asociacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reto_id, plan_estudio_id)
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
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    fecha_completado TIMESTAMP,
    PRIMARY KEY (usuario_id, reto_id)
);

-- Tabla de Tareas (se mantiene asignado_a como referencia principal)
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- Se mantiene para compatibilidad
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos INT NOT NULL CHECK (puntos > 0),
    fecha_limite DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('lectura', 'ejercicio', 'proyecto')),
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla para asignaciones múltiples de tareas
CREATE TABLE IF NOT EXISTS tarea_asignaciones (
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rol_asignacion VARCHAR(30) DEFAULT 'responsable', -- Ejemplo: 'responsable', 'colaborador', 'revisor'
    PRIMARY KEY (tarea_id, usuario_id)
);

-- Nueva tabla para registrar tareas completadas por usuario (agregado campo progreso)
CREATE TABLE IF NOT EXISTS tareas_completadas (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    fecha_completado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progreso INT DEFAULT 100 CHECK (progreso BETWEEN 0 AND 100), -- Nuevo: permite seguimiento parcial
    comentario TEXT, -- Nuevo: permite añadir comentarios sobre el progreso
    PRIMARY KEY (usuario_id, tarea_id)
);

-- Tabla de Apuntes (mantenemos contenido para compatibilidad pero hacemos opcional)
CREATE TABLE IF NOT EXISTS apuntes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE SET NULL,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NULL, -- Ahora opcional, ya que puede existir solo como archivo adjunto
    formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calificacion_promedio DECIMAL(3, 2) DEFAULT 0.0 CHECK (
        calificacion_promedio BETWEEN 0 AND 5
    ),
    es_publico BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla de archivos generalizados (reemplaza la tabla archivos específica)
CREATE TABLE IF NOT EXISTS archivos_genericos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad VARCHAR(30) NOT NULL,  -- 'apunte', 'tarea', 'reto', 'plan_estudio'
    entidad_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    formato VARCHAR(20) NOT NULL,
    tamaño_bytes BIGINT,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    -- Constraint para validar la entidad
    CONSTRAINT check_entidad_valida CHECK (
        entidad IN ('apunte', 'tarea', 'reto', 'plan_estudio', 'comentario')
    )
);

-- Nueva tabla de calificaciones para apuntes
CREATE TABLE IF NOT EXISTS calificaciones_apuntes (
    apunte_id UUID REFERENCES apuntes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion DECIMAL(3, 2) NOT NULL CHECK (
        calificacion BETWEEN 0 AND 5
    ),
    comentario TEXT DEFAULT NULL,
    fecha_calificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (apunte_id, usuario_id)
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
    fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, recompensa_id)
);

-- Tabla de Logros (para gamificación)
CREATE TABLE IF NOT EXISTS logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    -- Ejemplo: 'completar_tarea', 'unirse_reto'
    descripcion TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de auditoría para registrar cambios importantes
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(50),
    -- 'INSERT', 'UPDATE', 'DELETE'
    tabla VARCHAR(50),
    registro_id UUID,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB
);

-- Tabla de reglas de recompensas para mejorar la gestión de la gamificación
CREATE TABLE IF NOT EXISTS reglas_recompensas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    evento VARCHAR(50) NOT NULL,
    -- 'completar_reto', 'subir_apunte', 'crear_plan', etc.
    condicion JSONB,  -- Cambiado a JSONB para mejor manejo de condiciones complejas
    recompensa_id UUID NOT NULL REFERENCES recompensas(id) ON DELETE CASCADE,
    puntos INT CHECK (puntos >= 0),
    activa BOOLEAN DEFAULT TRUE,
    UNIQUE(evento, recompensa_id)
);

-- Tabla de notificaciones para usuarios (mejorada para notificaciones grupales)
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    -- 'tarea_asignada', 'reto_completado', 'recompensa_obtenida', etc.
    entidad VARCHAR(30),
    -- 'reto', 'tarea', 'apunte', etc.
    entidad_id UUID,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP WITH TIME ZONE,
    es_grupal BOOLEAN DEFAULT FALSE, -- Indica si la notificación es para un grupo
    grupo_id UUID,  -- ID del grupo si es grupal (podría referenciar a una tabla de grupos)
    CONSTRAINT check_entidad_notificacion CHECK (
        entidad IN ('reto', 'tarea', 'apunte', 'plan_estudio', 'recompensa', 'logro', 'sistema')
    )
);

-- Nueva tabla para rastrear lecturas de notificaciones grupales
CREATE TABLE IF NOT EXISTS notificaciones_lecturas (
    notificacion_id UUID REFERENCES notificaciones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_lectura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notificacion_id, usuario_id)
);

-- Sistema de roles y permisos más granular
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id UUID REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, rol_id)
);

-- Historial de progreso para seguimiento detallado
CREATE TABLE IF NOT EXISTS historial_progreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    progreso_anterior INT CHECK (
        progreso_anterior BETWEEN 0 AND 100
    ),
    progreso_nuevo INT CHECK (
        progreso_nuevo BETWEEN 0 AND 100
    ),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    evento VARCHAR(50) -- 'tarea_completada', 'actualización_manual', etc.
);

-- Tabla de comentarios para diferentes entidades (con validación mejorada)
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad VARCHAR(30) NOT NULL CHECK (
        entidad IN ('reto', 'tarea', 'apunte', 'plan_estudio')
    ),
    entidad_id UUID NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comentario_padre_id UUID REFERENCES comentarios(id) ON DELETE SET NULL
);


-- Comentario sobre particionamiento para tablas de gran crecimiento
/*
 -- Ejemplo de particionamiento para tabla de notificaciones (a implementar cuando sea necesario):
 
 CREATE TABLE notificaciones_particionada (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
 titulo VARCHAR(100) NOT NULL,
 mensaje TEXT NOT NULL,
 tipo VARCHAR(30) NOT NULL,
 entidad VARCHAR(30),
 entidad_id UUID,
 leida BOOLEAN DEFAULT FALSE,
 fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 fecha_lectura TIMESTAMP
 ) PARTITION BY RANGE (fecha_creacion);
 
 -- Crear particiones por mes
 CREATE TABLE notificaciones_2024_01 PARTITION OF notificaciones_particionada
 FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
 
 CREATE TABLE notificaciones_2024_02 PARTITION OF notificaciones_particionada
 FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
 
 -- Índices para la tabla particionada
 CREATE INDEX idx_notificaciones_part_usuario ON notificaciones_particionada(usuario_id);
 CREATE INDEX idx_notificaciones_part_fecha ON notificaciones_particionada(fecha_creacion);
 */

 