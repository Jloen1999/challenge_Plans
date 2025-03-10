import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// SQL para eliminar todas las tablas 
const dropTablesSQL = `
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
`;

// SQL para eliminar tablas en orden inverso
const dropTablesSQL1 = `
-- Primero eliminar la vista
DROP VIEW IF EXISTS vista_progreso_reto;

-- Eliminar triggers
DROP TRIGGER IF EXISTS trigger_actualizar_estado ON participacion_retos;
DROP TRIGGER IF EXISTS trigger_tarea_completada ON tareas;
DROP TRIGGER IF EXISTS trigger_actualizar_puntos_totales ON tareas;
DROP TRIGGER IF EXISTS trigger_logro_registro_usuario ON usuarios;
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_usuarios ON usuarios;
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_planes ON planes_estudio;
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_retos ON retos;
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_tareas ON tareas;
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_apuntes ON apuntes;
DROP TRIGGER IF EXISTS trigger_logro_participacion ON participacion_retos;
DROP TRIGGER IF EXISTS trigger_actualizar_puntaje ON usuario_recompensas;
DROP TRIGGER IF EXISTS trigger_actualizar_participaciones ON participacion_retos;
DROP TRIGGER IF EXISTS trigger_actualizar_promedio ON calificaciones_apuntes;
DROP TRIGGER IF EXISTS trigger_recompensa_crear_plan ON planes_estudio;
DROP TRIGGER IF EXISTS trigger_recompensa_subir_apunte ON apuntes;
DROP TRIGGER IF EXISTS trigger_recompensa_completar_reto ON participacion_retos;

-- Eliminar funciones
DROP FUNCTION IF EXISTS actualizar_estado_participacion;
DROP FUNCTION IF EXISTS actualizar_puntos_totales;
DROP FUNCTION IF EXISTS registrar_logro_usuario_nuevo;
DROP FUNCTION IF EXISTS actualizar_fecha_modificacion;
DROP FUNCTION IF EXISTS registrar_logro_participacion;
DROP FUNCTION IF EXISTS actualizar_puntaje_usuario;
DROP FUNCTION IF EXISTS finalizar_retos_vencidos;
DROP FUNCTION IF EXISTS registrar_tarea_completada;
DROP FUNCTION IF EXISTS gestionar_tarea_completada;
DROP FUNCTION IF EXISTS gestionar_estado_participacion;
DROP FUNCTION IF EXISTS gestionar_logro_participacion;
DROP FUNCTION IF EXISTS gestionar_puntaje_usuario;
DROP FUNCTION IF EXISTS actualizar_participaciones_reto;
DROP FUNCTION IF EXISTS actualizar_calificacion_promedio;
DROP FUNCTION IF EXISTS otorgar_recompensa_generica;

-- Eliminar índices (algunos sistemas los eliminan automáticamente con las tablas)
DROP INDEX IF EXISTS idx_titulo_retos_text;
DROP INDEX IF EXISTS idx_participacion_retos_reto_id;
DROP INDEX IF EXISTS idx_participacion_retos_usuario_id;
DROP INDEX IF EXISTS idx_participacion_retos_estado;
DROP INDEX IF EXISTS idx_apuntes_fecha_subida;
DROP INDEX IF EXISTS idx_apuntes_titulo;
DROP INDEX IF EXISTS idx_tareas_fecha_limite;
DROP INDEX IF EXISTS idx_tareas_reto_id;
DROP INDEX IF EXISTS idx_retos_estado;
DROP INDEX IF EXISTS idx_retos_titulo;
DROP INDEX IF EXISTS idx_usuarios_email;
DROP INDEX IF EXISTS idx_participacion_usuario_reto;
DROP INDEX IF EXISTS idx_reto_categorias_reto_categoria;
DROP INDEX IF EXISTS idx_calificaciones_apunte_id;

-- Eliminar tablas en orden inverso a las dependencias
DROP TABLE IF EXISTS logros;
DROP TABLE IF EXISTS usuario_recompensas;
DROP TABLE IF EXISTS recompensas;
DROP TABLE IF EXISTS archivos;
DROP TABLE IF EXISTS apuntes;
DROP TABLE IF EXISTS tareas_completadas;
DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS participacion_retos;
DROP TABLE IF EXISTS reto_categorias;
DROP TABLE IF EXISTS retos;
DROP TABLE IF EXISTS planes_estudio;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS calificaciones_apuntes;
`;

// SQL actualizado para crear todas las tablas con las nuevas mejoras y optimizaciones
const createTablesSQL = `
-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    hash_contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'estudiante' CHECK (rol IN ('admin', 'profesor', 'estudiante', 'moderador')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntaje INT DEFAULT 0 CHECK (puntaje >= 0),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Retos (actualizada con campo participaciones)
CREATE TABLE IF NOT EXISTS retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    es_publico BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'finalizado')),
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
    dificultad VARCHAR(15) CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')),
    puntos_totales INT DEFAULT 0 CHECK (puntos_totales >= 0),
    participaciones INT DEFAULT 0 CHECK (participaciones >= 0),
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
    progreso INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    fecha_completado TIMESTAMP,
    PRIMARY KEY (usuario_id, reto_id)
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos INT NOT NULL CHECK (puntos > 0),
    fecha_limite DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('lectura', 'ejercicio', 'proyecto')),
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla para registrar tareas completadas por usuario
CREATE TABLE IF NOT EXISTS tareas_completadas (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    fecha_completado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, tarea_id)
);

-- Tabla de Apuntes
CREATE TABLE IF NOT EXISTS apuntes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE SET NULL,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.0 CHECK (calificacion_promedio BETWEEN 0 AND 5),
    es_publico BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla de archivos para apuntes
CREATE TABLE IF NOT EXISTS archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apunte_id UUID REFERENCES apuntes(id) ON DELETE CASCADE,
    url VARCHAR(350) NOT NULL,
    formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla de calificaciones para apuntes
CREATE TABLE IF NOT EXISTS calificaciones_apuntes (
    apunte_id UUID REFERENCES apuntes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion DECIMAL(3,2) NOT NULL CHECK (calificacion BETWEEN 0 AND 5),
    comentario TEXT DEFAULT NULL,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, recompensa_id)
);

-- Tabla de Logros (para gamificación)
CREATE TABLE IF NOT EXISTS logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,  -- Ejemplo: 'completar_tarea', 'unirse_reto'
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
CREATE INDEX IF NOT EXISTS idx_participacion_retos_estado ON participacion_retos(estado);
CREATE INDEX IF NOT EXISTS idx_calificaciones_apunte_id ON calificaciones_apuntes(apunte_id);

-- Nuevos índices compuestos
CREATE INDEX IF NOT EXISTS idx_participacion_usuario_reto ON participacion_retos(usuario_id, reto_id);
CREATE INDEX IF NOT EXISTS idx_reto_categorias_reto_categoria ON reto_categorias(reto_id, categoria_id);

-- Vista para consultar el progreso en retos
CREATE OR REPLACE VIEW vista_progreso_reto AS
SELECT u.nombre, r.titulo, pr.progreso, pr.fecha_completado
FROM participacion_retos pr
JOIN usuarios u ON pr.usuario_id = u.id
JOIN retos r ON pr.reto_id = r.id;

-- Índice de texto completo para búsqueda avanzada en títulos de retos
CREATE INDEX IF NOT EXISTS idx_titulo_retos_text ON retos USING GIN (to_tsvector('spanish', titulo));

-- 1. Trigger mejorado para tareas - Registrar y Eliminar en tareas_completadas
CREATE OR REPLACE FUNCTION gestionar_tarea_completada()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Completado cambia a TRUE (inserción inicial o actualización de FALSE a TRUE)
    IF (NEW.completado = TRUE AND (TG_OP = 'INSERT' OR OLD.completado = FALSE)) THEN
        INSERT INTO tareas_completadas (usuario_id, tarea_id, fecha_completado)
        VALUES (
            NEW.asignado_a,
            NEW.id,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (usuario_id, tarea_id) DO NOTHING;

    -- Caso 2: Completado cambia a FALSE (eliminación del registro)
    ELSIF (NEW.completado = FALSE AND OLD.completado = TRUE) THEN
        DELETE FROM tareas_completadas
        WHERE usuario_id = NEW.asignado_a AND tarea_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tarea_completada
BEFORE INSERT OR UPDATE OF completado ON tareas
FOR EACH ROW
EXECUTE FUNCTION gestionar_tarea_completada();

-- 2. Trigger mejorado para participacion_retos - Actualizar Estado y Gestionar Recompensas
CREATE OR REPLACE FUNCTION gestionar_estado_participacion()
RETURNS TRIGGER AS $$
DECLARE
    recompensa_id UUID;
    titulo_reto TEXT;
    puntos_obtenidos INT;
BEGIN
    -- Caso 1: Progreso llega a 100 (completar)
    IF NEW.progreso = 100 AND (OLD.progreso IS NULL OR OLD.progreso < 100) THEN
        NEW.estado := 'completado';
        NEW.fecha_completado := CURRENT_TIMESTAMP;

        -- Obtener información del reto
        SELECT r.titulo, r.puntos_totales INTO titulo_reto, puntos_obtenidos
        FROM retos r WHERE r.id = NEW.reto_id;

        -- Buscar recompensa específica
        SELECT id INTO recompensa_id 
        FROM recompensas 
        WHERE tipo = 'puntos' AND criterio_obtencion LIKE '%Completar%reto%'
        LIMIT 1;

        -- Insertar recompensa si existe
        IF recompensa_id IS NOT NULL THEN
            INSERT INTO usuario_recompensas (usuario_id, recompensa_id, fecha_obtencion)
            VALUES (NEW.usuario_id, recompensa_id, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, recompensa_id) DO NOTHING;
        END IF;

        -- Registrar logro
        INSERT INTO logros (usuario_id, tipo, descripcion)
        VALUES (
            NEW.usuario_id,
            'completar_reto',
            'Completó el reto: ' || COALESCE(titulo_reto, 'ID: ' || NEW.reto_id)
        );
        
        -- Registrar en historial_progreso
        INSERT INTO historial_progreso(
            usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento
        ) VALUES (
            NEW.usuario_id, NEW.reto_id, OLD.progreso, NEW.progreso, CURRENT_TIMESTAMP, 'reto_completado'
        );

        -- Actualizar puntaje del usuario
        UPDATE usuarios 
        SET puntaje = puntaje + puntos_obtenidos
        WHERE id = NEW.usuario_id;

    -- Caso 2: Progreso baja de 100 (revertir completado)
    ELSIF NEW.progreso < 100 AND OLD.progreso = 100 THEN
        NEW.estado := 'activo';
        NEW.fecha_completado := NULL;

        -- Obtener puntos del reto para restarlos
        SELECT puntos_totales INTO puntos_obtenidos
        FROM retos r WHERE r.id = NEW.reto_id;

        -- Eliminar recompensa asociada
        DELETE FROM usuario_recompensas
        WHERE usuario_id = NEW.usuario_id 
        AND recompensa_id IN (
            SELECT id 
            FROM recompensas 
            WHERE criterio_obtencion LIKE '%Completar%reto%'
        );

        -- Eliminar logro asociado
        DELETE FROM logros
        WHERE usuario_id = NEW.usuario_id 
        AND tipo = 'completar_reto' 
        AND descripcion LIKE '%' || NEW.reto_id || '%';

        -- Registrar en historial_progreso
        INSERT INTO historial_progreso(
            usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento
        ) VALUES (
            NEW.usuario_id, NEW.reto_id, OLD.progreso, NEW.progreso, CURRENT_TIMESTAMP, 'progreso_revertido'
        );

        -- Restar puntos al usuario
        UPDATE usuarios 
        SET puntaje = GREATEST(0, puntaje - puntos_obtenidos)
        WHERE id = NEW.usuario_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado
BEFORE UPDATE OF progreso ON participacion_retos
FOR EACH ROW
EXECUTE FUNCTION gestionar_estado_participacion();

-- 3. Trigger para tareas - Actualizar puntos_totales en retos
CREATE OR REPLACE FUNCTION actualizar_puntos_totales()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE retos
        SET puntos_totales = (
            SELECT COALESCE(SUM(puntos), 0)
            FROM tareas
            WHERE reto_id = NEW.reto_id
        )
        WHERE id = NEW.reto_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE retos
        SET puntos_totales = (
            SELECT COALESCE(SUM(puntos), 0)
            FROM tareas
            WHERE reto_id = OLD.reto_id
        )
        WHERE id = OLD.reto_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_puntos_totales
AFTER INSERT OR UPDATE OR DELETE ON tareas
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntos_totales();

-- 4. Trigger para usuarios - Registrar Logro de Registro
CREATE OR REPLACE FUNCTION registrar_logro_usuario_nuevo()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logros (usuario_id, tipo, descripcion, fecha)
    VALUES (NEW.id, 'registro_usuario', 'Se registró en la plataforma', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_logro_registro_usuario
AFTER INSERT ON usuarios
FOR EACH ROW
EXECUTE FUNCTION registrar_logro_usuario_nuevo();

-- 5. Triggers para actualizar fecha_modificacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_modificacion_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_modificacion_planes
BEFORE UPDATE ON planes_estudio
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_modificacion_retos
BEFORE UPDATE ON retos
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_modificacion_tareas
BEFORE UPDATE ON tareas
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_modificacion_apuntes
BEFORE UPDATE ON apuntes
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

-- 6. Trigger mejorado para participacion_retos - Registrar y Eliminar Logro de Participación
CREATE OR REPLACE FUNCTION gestionar_logro_participacion()
RETURNS TRIGGER AS $$
DECLARE
    titulo_reto TEXT;
BEGIN
    -- Caso 1: Inserción (unirse al reto)
    IF TG_OP = 'INSERT' THEN
        SELECT titulo INTO titulo_reto FROM retos WHERE id = NEW.reto_id;
        INSERT INTO logros (usuario_id, tipo, descripcion, fecha)
        VALUES (
            NEW.usuario_id,
            'unirse_reto',
            'Se unió al reto: ' || COALESCE(titulo_reto, 'ID: ' || NEW.reto_id),
            CURRENT_TIMESTAMP
        );
        RETURN NEW;

    -- Caso 2: Eliminación (abandonar el reto)
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM logros
        WHERE usuario_id = OLD.usuario_id 
        AND tipo = 'unirse_reto' 
        AND descripcion LIKE '%' || OLD.reto_id || '%';
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_logro_participacion
AFTER INSERT OR DELETE ON participacion_retos
FOR EACH ROW
EXECUTE FUNCTION gestionar_logro_participacion();

-- 7. Trigger mejorado para usuario_recompensas - Actualizar Puntaje
CREATE OR REPLACE FUNCTION gestionar_puntaje_usuario()
RETURNS TRIGGER AS $$
DECLARE
    valor_recompensa INT;
    tipo_recompensa TEXT;
BEGIN
    -- Caso 1: Inserción (ganar recompensa)
    IF TG_OP = 'INSERT' THEN
        SELECT valor, tipo INTO valor_recompensa, tipo_recompensa 
        FROM recompensas 
        WHERE id = NEW.recompensa_id;
        IF tipo_recompensa = 'puntos' THEN
            UPDATE usuarios
            SET puntaje = puntaje + valor_recompensa
            WHERE id = NEW.usuario_id;
        END IF;
        RETURN NEW;

    -- Caso 2: Eliminación (revertir recompensa)
    ELSIF TG_OP = 'DELETE' THEN
        SELECT valor, tipo INTO valor_recompensa, tipo_recompensa 
        FROM recompensas 
        WHERE id = OLD.recompensa_id;
        IF tipo_recompensa = 'puntos' THEN
            UPDATE usuarios
            SET puntaje = GREATEST(puntaje - valor_recompensa, 0) -- Evita puntajes negativos
            WHERE id = OLD.usuario_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_puntaje
AFTER INSERT OR DELETE ON usuario_recompensas
FOR EACH ROW
EXECUTE FUNCTION gestionar_puntaje_usuario();

-- 8. Función para finalizar retos basado en fecha_fin
CREATE OR REPLACE FUNCTION finalizar_retos_vencidos()
RETURNS VOID AS $$
BEGIN
    UPDATE retos
    SET estado = 'finalizado'
    WHERE estado = 'activo' AND fecha_fin < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el contador de participaciones en retos
CREATE OR REPLACE FUNCTION actualizar_participaciones_reto()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Nueva participación (incrementar)
    IF TG_OP = 'INSERT' THEN
        UPDATE retos
        SET participaciones = participaciones + 1
        WHERE id = NEW.reto_id;

    -- Caso 2: Eliminación de participación (decrementar)
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE retos
        SET participaciones = GREATEST(participaciones - 1, 0)
        WHERE id = OLD.reto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_participaciones
AFTER INSERT OR DELETE ON participacion_retos
FOR EACH ROW
EXECUTE FUNCTION actualizar_participaciones_reto();

-- 9. Función para actualizar el promedio de calificaciones en apuntes
CREATE OR REPLACE FUNCTION actualizar_calificacion_promedio()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el promedio en la tabla apuntes
    UPDATE apuntes
    SET calificacion_promedio = (
        SELECT COALESCE(AVG(calificacion), 0)
        FROM calificaciones_apuntes
        WHERE apunte_id = NEW.apunte_id
    )
    WHERE id = NEW.apunte_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_promedio
AFTER INSERT OR UPDATE OR DELETE ON calificaciones_apuntes
FOR EACH ROW
EXECUTE FUNCTION actualizar_calificacion_promedio();

-- Mejora en la gestión de archivos para hacerlos más genéricos
CREATE TABLE IF NOT EXISTS archivos_genericos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad VARCHAR(30) NOT NULL,  -- 'apunte', 'tarea', 'reto', 'plan_estudio'
    entidad_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    formato VARCHAR(20) NOT NULL,
    tamaño_bytes BIGINT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índice para mejorar búsquedas de archivos por entidad
CREATE INDEX IF NOT EXISTS idx_archivos_genericos_entidad ON archivos_genericos(entidad, entidad_id);

-- Tabla de reglas de recompensas para mejorar la gestión de la gamificación
CREATE TABLE IF NOT EXISTS reglas_recompensas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    evento VARCHAR(50) NOT NULL,  -- 'completar_reto', 'subir_apunte', 'crear_plan', etc.
    condicion TEXT,  -- Condición en formato JSON o SQL que determina cuándo se otorga
    recompensa_id UUID NOT NULL REFERENCES recompensas(id) ON DELETE CASCADE,
    puntos INT CHECK (puntos >= 0),
    activa BOOLEAN DEFAULT TRUE,
    UNIQUE(evento, recompensa_id)
);

-- Tabla de notificaciones para usuarios
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL,  -- 'tarea_asignada', 'reto_completado', 'recompensa_obtenida', etc.
    entidad VARCHAR(30),  -- 'reto', 'tarea', 'apunte', etc.
    entidad_id UUID,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP
);

-- Índices para optimizar consultas en notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas ON notificaciones(usuario_id, leida) WHERE leida = FALSE;

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
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, rol_id)
);

-- Historial de progreso para seguimiento detallado
CREATE TABLE IF NOT EXISTS historial_progreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID NOT NULL REFERENCES retos(id) ON DELETE CASCADE,
    progreso_anterior INT CHECK (progreso_anterior BETWEEN 0 AND 100),
    progreso_nuevo INT CHECK (progreso_nuevo BETWEEN 0 AND 100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evento VARCHAR(50)  -- 'tarea_completada', 'actualización_manual', etc.
);

-- Tabla de comentarios para diferentes entidades
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad VARCHAR(30) NOT NULL,  -- 'reto', 'tarea', 'apunte', 'plan_estudio'
    entidad_id UUID NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentario_padre_id UUID REFERENCES comentarios(id) ON DELETE SET NULL
);

-- Índices para optimizar consultas de comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_entidad ON comentarios(entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);

-- Índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_retos_creador ON retos(creador_id);
CREATE INDEX IF NOT EXISTS idx_apuntes_usuario ON apuntes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_planes_estudio_usuario ON planes_estudio(usuario_id);

-- Función y trigger para actualizar el historial de progreso
CREATE OR REPLACE FUNCTION registrar_cambio_progreso()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.progreso IS DISTINCT FROM NEW.progreso) THEN
        INSERT INTO historial_progreso(
            usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento
        ) VALUES (
            NEW.usuario_id, NEW.reto_id, OLD.progreso, NEW.progreso, CURRENT_TIMESTAMP, 
            CASE 
                WHEN NEW.progreso = 100 THEN 'reto_completado'
                ELSE 'actualizacion_progreso'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_cambio_progreso
AFTER UPDATE OF progreso ON participacion_retos
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_progreso();


-- Función para notificar tareas asignadas
CREATE OR REPLACE FUNCTION notificar_tarea_asignada()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.asignado_a IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.asignado_a IS DISTINCT FROM NEW.asignado_a)) THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id)
        VALUES (
            NEW.asignado_a,
            'Nueva tarea asignada',
            'Se te ha asignado una nueva tarea: ' || NEW.titulo,
            'tarea_asignada',
            'tarea',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_tarea_asignada
AFTER INSERT OR UPDATE OF asignado_a ON tareas
FOR EACH ROW
EXECUTE FUNCTION notificar_tarea_asignada();

CREATE OR REPLACE FUNCTION notificar_reto_completado()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.progreso = 100 AND OLD.progreso < 100) THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id)
        VALUES (
            NEW.usuario_id,
            '¡Reto completado!',
            'Has completado exitosamente un reto',
            'reto_completado',
            'reto',
            NEW.reto_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_reto_completado
AFTER UPDATE OF progreso ON participacion_retos
FOR EACH ROW
EXECUTE FUNCTION notificar_reto_completado();

-- Función para notificar recompensa obtenida
CREATE OR REPLACE FUNCTION notificar_recompensa_obtenida()
RETURNS TRIGGER AS $$
DECLARE
    nombre_recompensa VARCHAR(100);
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT nombre INTO nombre_recompensa FROM recompensas WHERE id = NEW.recompensa_id;
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id)
        VALUES (
            NEW.usuario_id,
            '¡Nueva recompensa obtenida!',
            'Has obtenido la recompensa: ' || nombre_recompensa,
            'recompensa_obtenida',
            'recompensa',
            NEW.recompensa_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_recompensa
AFTER INSERT ON usuario_recompensas
FOR EACH ROW
EXECUTE FUNCTION notificar_recompensa_obtenida();


-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion) 
VALUES 
    ('admin', 'Administrador con acceso completo al sistema'),
    ('moderador', 'Puede moderar contenido y usuarios'),
    ('profesor', 'Puede crear retos y evaluar participaciones'),
    ('estudiante', 'Usuario estándar que participa en retos')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar permisos básicos
INSERT INTO permisos (nombre, descripcion)
VALUES
    ('crear_reto', 'Puede crear nuevos retos'),
    ('editar_reto', 'Puede editar retos existentes'),
    ('eliminar_reto', 'Puede eliminar retos'),
    ('crear_plan', 'Puede crear planes de estudio'),
    ('moderar_apuntes', 'Puede moderar y eliminar apuntes'),
    ('gestionar_usuarios', 'Puede gestionar cuentas de usuario'),
    ('asignar_recompensas', 'Puede asignar recompensas manualmente')
ON CONFLICT (nombre) DO NOTHING;

-- Asignar permisos a roles
DO $$
DECLARE
    admin_id UUID;
    moderador_id UUID;
    profesor_id UUID;
    estudiante_id UUID;
    
    crear_reto_id UUID;
    editar_reto_id UUID;
    eliminar_reto_id UUID;
    crear_plan_id UUID;
    moderar_apuntes_id UUID;
    gestionar_usuarios_id UUID;
    asignar_recompensas_id UUID;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO admin_id FROM roles WHERE nombre = 'admin';
    SELECT id INTO moderador_id FROM roles WHERE nombre = 'moderador';
    SELECT id INTO profesor_id FROM roles WHERE nombre = 'profesor';
    SELECT id INTO estudiante_id FROM roles WHERE nombre = 'estudiante';
    
    -- Obtener IDs de permisos
    SELECT id INTO crear_reto_id FROM permisos WHERE nombre = 'crear_reto';
    SELECT id INTO editar_reto_id FROM permisos WHERE nombre = 'editar_reto';
    SELECT id INTO eliminar_reto_id FROM permisos WHERE nombre = 'eliminar_reto';
    SELECT id INTO crear_plan_id FROM permisos WHERE nombre = 'crear_plan';
    SELECT id INTO moderar_apuntes_id FROM permisos WHERE nombre = 'moderar_apuntes';
    SELECT id INTO gestionar_usuarios_id FROM permisos WHERE nombre = 'gestionar_usuarios';
    SELECT id INTO asignar_recompensas_id FROM permisos WHERE nombre = 'asignar_recompensas';
    
    -- Admin tiene todos los permisos
    IF admin_id IS NOT NULL THEN
        INSERT INTO rol_permisos (rol_id, permiso_id)
        VALUES
            (admin_id, crear_reto_id),
            (admin_id, editar_reto_id),
            (admin_id, eliminar_reto_id),
            (admin_id, crear_plan_id),
            (admin_id, moderar_apuntes_id),
            (admin_id, gestionar_usuarios_id),
            (admin_id, asignar_recompensas_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Moderador puede moderar contenido y usuarios
    IF moderador_id IS NOT NULL THEN
        INSERT INTO rol_permisos (rol_id, permiso_id)
        VALUES
            (moderador_id, moderar_apuntes_id),
            (moderador_id, gestionar_usuarios_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Profesor puede crear y gestionar retos y planes
    IF profesor_id IS NOT NULL THEN
        INSERT INTO rol_permisos (rol_id, permiso_id)
        VALUES
            (profesor_id, crear_reto_id),
            (profesor_id, editar_reto_id),
            (profesor_id, crear_plan_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Estudiante tiene permisos limitados (se manejan a nivel de aplicación)
END$$;

-- Actualizar el trigger para gestionar la tabla historial_progreso
CREATE OR REPLACE FUNCTION gestionar_estado_participacion()
RETURNS TRIGGER AS $$
DECLARE
    recompensa_id UUID;
    titulo_reto TEXT;
    puntos_obtenidos INT;
BEGIN
    -- Caso 1: Progreso llega a 100 (completar)
    IF NEW.progreso = 100 AND (OLD.progreso IS NULL OR OLD.progreso < 100) THEN
        NEW.estado := 'completado';
        NEW.fecha_completado := CURRENT_TIMESTAMP;

        -- Obtener información del reto
        SELECT r.titulo, r.puntos_totales INTO titulo_reto, puntos_obtenidos
        FROM retos r WHERE r.id = NEW.reto_id;

        -- Buscar recompensa específica
        SELECT id INTO recompensa_id 
        FROM recompensas 
        WHERE tipo = 'puntos' AND criterio_obtencion LIKE '%Completar%reto%'
        LIMIT 1;

        -- Insertar recompensa si existe
        IF recompensa_id IS NOT NULL THEN
            INSERT INTO usuario_recompensas (usuario_id, recompensa_id, fecha_obtencion)
            VALUES (NEW.usuario_id, recompensa_id, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, recompensa_id) DO NOTHING;
        END IF;

        -- Registrar logro
        INSERT INTO logros (usuario_id, tipo, descripcion)
        VALUES (
            NEW.usuario_id,
            'completar_reto',
            'Completó el reto: ' || COALESCE(titulo_reto, 'ID: ' || NEW.reto_id)
        );
        
        -- Registrar en historial_progreso
        INSERT INTO historial_progreso(
            usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento
        ) VALUES (
            NEW.usuario_id, NEW.reto_id, OLD.progreso, NEW.progreso, CURRENT_TIMESTAMP, 'reto_completado'
        );

        -- Actualizar puntaje del usuario
        UPDATE usuarios 
        SET puntaje = puntaje + puntos_obtenidos
        WHERE id = NEW.usuario_id;

    -- Caso 2: Progreso baja de 100 (revertir completado)
    ELSIF NEW.progreso < 100 AND OLD.progreso = 100 THEN
        NEW.estado := 'activo';
        NEW.fecha_completado := NULL;

        -- Obtener puntos del reto para restarlos
        SELECT puntos_totales INTO puntos_obtenidos
        FROM retos r WHERE r.id = NEW.reto_id;

        -- Eliminar recompensa asociada
        DELETE FROM usuario_recompensas
        WHERE usuario_id = NEW.usuario_id 
        AND recompensa_id IN (
            SELECT id 
            FROM recompensas 
            WHERE criterio_obtencion LIKE '%Completar%reto%'
        );

        -- Eliminar logro asociado
        DELETE FROM logros
        WHERE usuario_id = NEW.usuario_id 
        AND tipo = 'completar_reto' 
        AND descripcion LIKE '%' || NEW.reto_id || '%';

        -- Registrar en historial_progreso
        INSERT INTO historial_progreso(
            usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento
        ) VALUES (
            NEW.usuario_id, NEW.reto_id, OLD.progreso, NEW.progreso, CURRENT_TIMESTAMP, 'progreso_revertido'
        );

        -- Restar puntos al usuario
        UPDATE usuarios 
        SET puntaje = GREATEST(0, puntaje - puntos_obtenidos)
        WHERE id = NEW.usuario_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION otorgar_recompensa_generica()
RETURNS TRIGGER AS $$
DECLARE
    recompensa_id UUID;
    evento_actual VARCHAR(50);
    usuario_actual UUID;
BEGIN
    -- Determinar el evento y el usuario según la tabla que dispara el trigger
    IF TG_TABLE_NAME = 'participacion_retos' THEN
        evento_actual := 'completar_reto';
        usuario_actual := NEW.usuario_id;
    ELSIF TG_TABLE_NAME = 'apuntes' THEN
        evento_actual := 'subir_apunte';
        usuario_actual := NEW.usuario_id;
    ELSIF TG_TABLE_NAME = 'planes_estudio' THEN
        evento_actual := 'crear_plan';
        usuario_actual := NEW.usuario_id;
    ELSE
        RETURN NEW; -- Si no hay evento definido, salir
    END IF;

    -- Buscar recompensa asociada al evento
    SELECT rr.recompensa_id INTO recompensa_id
    FROM reglas_recompensas rr
    WHERE rr.evento = evento_actual AND rr.activa = TRUE
    LIMIT 1;

    -- Si existe una recompensa, insertarla en usuario_recompensas
    IF recompensa_id IS NOT NULL THEN
        INSERT INTO usuario_recompensas (usuario_id, recompensa_id, fecha_obtencion)
        VALUES (usuario_actual, recompensa_id, CURRENT_TIMESTAMP)
        ON CONFLICT (usuario_id, recompensa_id) DO NOTHING;

        -- Actualizar puntaje si la recompensa es de tipo 'puntos'
        IF (SELECT tipo FROM recompensas WHERE id = recompensa_id) = 'puntos' THEN
            UPDATE usuarios
            SET puntaje = puntaje + (SELECT valor FROM recompensas WHERE id = recompensa_id)
            WHERE id = usuario_actual;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para completar un reto
CREATE TRIGGER trigger_recompensa_completar_reto
AFTER UPDATE OF progreso ON participacion_retos
FOR EACH ROW
WHEN (NEW.progreso = 100 AND OLD.progreso < 100)
EXECUTE FUNCTION otorgar_recompensa_generica();

-- Trigger para subir un apunte público
CREATE TRIGGER trigger_recompensa_subir_apunte
AFTER INSERT ON apuntes
FOR EACH ROW
WHEN (NEW.es_publico = TRUE)
EXECUTE FUNCTION otorgar_recompensa_generica();

-- Trigger para crear un plan de estudio público
CREATE TRIGGER trigger_recompensa_crear_plan
AFTER INSERT ON planes_estudio
FOR EACH ROW
WHEN (NEW.es_publico = TRUE)
EXECUTE FUNCTION otorgar_recompensa_generica();

`;

// Crear pool de conexión a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeOperation(operation: number) {
  try {
    // Obtener cliente de la pool
    const client = await pool.connect();

    switch (operation) {
      case 1:
        // Eliminar tablas
        console.log('🗑️ Conectado a la base de datos, eliminando todas las tablas...');
        await client.query(dropTablesSQL);
        console.log('✅ Todas las tablas fueron eliminadas correctamente');
        break;

      case 2:
        // Crear tablas
        console.log('🔨 Conectado a la base de datos, creando tablas...');
        await client.query(createTablesSQL);
        console.log('✅ Tablas creadas correctamente con el nuevo esquema');
        break;

      case 3:
        // Insertar datos de ejemplo
        console.log('📊 Conectado a la base de datos, insertando datos de ejemplo...');
        await insertarDatosEjemplo(client);
        console.log('✅ Datos de ejemplo insertados correctamente');
        break;

      default:
        console.error('❌ Operación no válida. Use 1 para eliminar tablas, 2 para crearlas, o 3 para insertar datos de ejemplo');
    }

    // Liberar el cliente
    client.release();
  } catch (err) {
    console.error('❌ Error al ejecutar la operación en la base de datos:', err);
  } finally {
    // Cerrar pool
    await pool.end();
    console.log('🔄 Conexión a la base de datos cerrada');
  }
}

// Modificar la función insertarDatosEjemplo para adaptarla a los nuevos campos
async function insertarDatosEjemplo(client: any) {
  try {
    // Iniciar transacción para asegurar consistencia
    await client.query('BEGIN');

    // 1. Insertar usuarios y guardar sus IDs
    console.log('Insertando usuarios...');
    const usuarios = [
      { email: 'juan.perez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Juan Pérez', puntaje: 100 },
      { email: 'maria.garcia@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'María García', puntaje: 150 },
      { email: 'carlos.lopez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Carlos López', puntaje: 200 },
      { email: 'ana.martinez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Ana Martínez', puntaje: 50 },
      { email: 'luis.rodriguez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Luis Rodríguez', puntaje: 300 },
      { email: 'laura.fernandez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Laura Fernández', puntaje: 250 },
      { email: 'pedro.sanchez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Pedro Sánchez', puntaje: 180 },
      { email: 'sofia.gomez@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Sofía Gómez', puntaje: 220 },
      { email: 'javier.diaz@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Javier Díaz', puntaje: 90 },
      { email: 'elena.ruiz@example.com', hash_contraseña: '$2a$10$kJnKHr8BsJm0MnFxP3D0Me/5m2INL.ya1lHqWG0OlrH7raeoFdD5G', nombre: 'Elena Ruiz', puntaje: 130 }
    ];

    const usuariosIds: { [key: string]: string } = {};

    for (const [index, usuario] of usuarios.entries()) {
      const result = await client.query(
        'INSERT INTO usuarios (email, hash_contraseña, nombre, puntaje) VALUES ($1, $2, $3, $4) RETURNING id',
        [usuario.email, usuario.hash_contraseña, usuario.nombre, usuario.puntaje]
      );
      usuariosIds[`usuario_${index + 1}`] = result.rows[0].id;
    }

    // 2. Insertar categorías y guardar sus IDs
    console.log('Insertando categorías...');
    const categorias = [
      'Matemáticas', 'Ciencias', 'Historia', 'Literatura', 'Programación',
      'Idiomas', 'Arte', 'Deportes', 'Música', 'Tecnología'
    ];

    const categoriasIds: { [key: string]: string } = {};

    for (const [index, categoria] of categorias.entries()) {
      const result = await client.query(
        'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id',
        [categoria]
      );
      categoriasIds[`categoria_${index + 1}`] = result.rows[0].id;
    }

    // 3. Insertar planes de estudio y guardar sus IDs
    console.log('Insertando planes de estudio...');
    const planesEstudio = [
      { usuario_id: usuariosIds.usuario_1, titulo: 'Plan de Matemáticas Avanzadas', descripcion: 'Estudio intensivo de cálculo y álgebra', duracion_dias: 30, es_publico: true },
      { usuario_id: usuariosIds.usuario_2, titulo: 'Plan de Historia Universal', descripcion: 'Revisión de eventos históricos clave', duracion_dias: 45, es_publico: false },
      { usuario_id: usuariosIds.usuario_3, titulo: 'Plan de Programación en Python', descripcion: 'Aprendizaje de Python desde cero', duracion_dias: 60, es_publico: true },
      { usuario_id: usuariosIds.usuario_4, titulo: 'Plan de Literatura Clásica', descripcion: 'Lectura y análisis de obras clásicas', duracion_dias: 20, es_publico: false },
      { usuario_id: usuariosIds.usuario_5, titulo: 'Plan de Ciencias Naturales', descripcion: 'Estudio de biología, física y química', duracion_dias: 40, es_publico: true },
      { usuario_id: usuariosIds.usuario_6, titulo: 'Plan de Idiomas', descripcion: 'Mejora de inglés y francés', duracion_dias: 50, es_publico: false },
      { usuario_id: usuariosIds.usuario_7, titulo: 'Plan de Arte Contemporáneo', descripcion: 'Exploración de arte moderno', duracion_dias: 25, es_publico: true },
      { usuario_id: usuariosIds.usuario_8, titulo: 'Plan de Deportes', descripcion: 'Entrenamiento físico y teoría', duracion_dias: 35, es_publico: false },
      { usuario_id: usuariosIds.usuario_9, titulo: 'Plan de Música', descripcion: 'Teoría musical y práctica instrumental', duracion_dias: 30, es_publico: true },
      { usuario_id: usuariosIds.usuario_10, titulo: 'Plan de Tecnología', descripcion: 'Introducción a nuevas tecnologías', duracion_dias: 15, es_publico: false }
    ];

    const planesIds: { [key: string]: string } = {};

    for (const [index, plan] of planesEstudio.entries()) {
      const result = await client.query(
        'INSERT INTO planes_estudio (usuario_id, titulo, descripcion, duracion_dias, es_publico) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [plan.usuario_id, plan.titulo, plan.descripcion, plan.duracion_dias, plan.es_publico]
      );
      planesIds[`plan_${index + 1}`] = result.rows[0].id;
    }

    // 4. Insertar retos y guardar sus IDs
    console.log('Insertando retos...');
    const currentYear = new Date().getFullYear();
    const retos = [
      { creador_id: usuariosIds.usuario_1, plan_estudio_id: planesIds.plan_1, titulo: 'Reto de Cálculo Diferencial', descripcion: 'Resolver problemas de derivadas', fecha_inicio: `${currentYear}-10-01`, fecha_fin: `${currentYear}-10-15`, estado: 'activo', dificultad: 'intermedio', es_publico: true, puntos_totales: 50 },
      { creador_id: usuariosIds.usuario_2, plan_estudio_id: null, titulo: 'Reto de Historia Antigua', descripcion: 'Investigar sobre el Imperio Romano', fecha_inicio: `${currentYear}-09-15`, fecha_fin: `${currentYear + 1}-10-15`, estado: 'activo', dificultad: 'principiante', es_publico: true, puntos_totales: 100 },
      { creador_id: usuariosIds.usuario_3, plan_estudio_id: planesIds.plan_3, titulo: 'Reto de Python: Funciones', descripcion: 'Crear funciones en Python', fecha_inicio: `${currentYear}-10-05`, fecha_fin: `${currentYear}-10-20`, estado: 'activo', dificultad: 'principiante', es_publico: true, puntos_totales: 20 },
      { creador_id: usuariosIds.usuario_4, plan_estudio_id: null, titulo: 'Reto de Literatura: Shakespeare', descripcion: 'Analizar obras de Shakespeare', fecha_inicio: `${currentYear}-10-10`, fecha_fin: `${currentYear + 1}-11-10`, estado: 'activo', dificultad: 'avanzado', es_publico: false, puntos_totales: 80 },
      { creador_id: usuariosIds.usuario_5, plan_estudio_id: planesIds.plan_5, titulo: 'Reto de Biología: Ecosistemas', descripcion: 'Estudiar ecosistemas locales', fecha_inicio: `${currentYear}-09-20`, fecha_fin: `${currentYear}-10-20`, estado: 'activo', dificultad: 'intermedio', es_publico: true, puntos_totales: 60 },
      { creador_id: usuariosIds.usuario_6, plan_estudio_id: null, titulo: 'Reto de Inglés: Conversación', descripcion: 'Practicar conversaciones en inglés', fecha_inicio: `${currentYear}-10-01`, fecha_fin: `${currentYear}-10-31`, estado: 'activo', dificultad: 'principiante', es_publico: false, puntos_totales: 30 },
      { creador_id: usuariosIds.usuario_7, plan_estudio_id: planesIds.plan_7, titulo: 'Reto de Pintura Moderna', descripcion: 'Crear una obra inspirada en Picasso', fecha_inicio: `${currentYear}-10-15`, fecha_fin: `${currentYear + 2}-11-15`, estado: 'activo', dificultad: 'avanzado', es_publico: true, puntos_totales: 100 },
      { creador_id: usuariosIds.usuario_8, plan_estudio_id: null, titulo: 'Reto de Deportes: Maratón', descripcion: 'Prepararse para correr una maratón', fecha_inicio: `${currentYear}-09-01`, fecha_fin: `${currentYear + 1}-08-01`, estado: 'activo', dificultad: 'intermedio', es_publico: false, puntos_totales: 50 },
      { creador_id: usuariosIds.usuario_9, plan_estudio_id: planesIds.plan_9, titulo: 'Reto de Piano: Escalas', descripcion: 'Practicar escalas mayores y menores', fecha_inicio: `${currentYear}-10-05`, fecha_fin: `${currentYear + 2}-10-25`, estado: 'activo', dificultad: 'principiante', es_publico: true, puntos_totales: 40 },
      { creador_id: usuariosIds.usuario_10, plan_estudio_id: null, titulo: 'Reto de Tecnología: IA', descripcion: 'Introducción a la inteligencia artificial', fecha_inicio: `${currentYear}-10-10`, fecha_fin: `${currentYear + 1}-04-10`, estado: 'activo', dificultad: 'avanzado', es_publico: false, puntos_totales: 70 }
    ];

    const retosIds: { [key: string]: string } = {};

    for (const [index, reto] of retos.entries()) {
      const result = await client.query(
        'INSERT INTO retos (creador_id, plan_estudio_id, titulo, descripcion, fecha_inicio, fecha_fin, estado, dificultad, es_publico, puntos_totales) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
        [reto.creador_id, reto.plan_estudio_id, reto.titulo, reto.descripcion, reto.fecha_inicio, reto.fecha_fin, reto.estado, reto.dificultad, reto.es_publico, reto.puntos_totales]
      );
      retosIds[`reto_${index + 1}`] = result.rows[0].id;
    }

    // 5. Insertar relaciones reto-categoría
    console.log('Insertando relaciones reto-categoría...');
    const retoCategoria = [
      { reto_id: retosIds.reto_1, categoria_id: categoriasIds.categoria_1 },
      { reto_id: retosIds.reto_2, categoria_id: categoriasIds.categoria_3 },
      { reto_id: retosIds.reto_3, categoria_id: categoriasIds.categoria_5 },
      { reto_id: retosIds.reto_4, categoria_id: categoriasIds.categoria_4 },
      { reto_id: retosIds.reto_5, categoria_id: categoriasIds.categoria_2 },
      { reto_id: retosIds.reto_6, categoria_id: categoriasIds.categoria_6 },
      { reto_id: retosIds.reto_7, categoria_id: categoriasIds.categoria_7 },
      { reto_id: retosIds.reto_8, categoria_id: categoriasIds.categoria_8 },
      { reto_id: retosIds.reto_9, categoria_id: categoriasIds.categoria_9 },
      { reto_id: retosIds.reto_10, categoria_id: categoriasIds.categoria_10 }
    ];

    for (const relacion of retoCategoria) {
      await client.query(
        'INSERT INTO reto_categorias (reto_id, categoria_id) VALUES ($1, $2)',
        [relacion.reto_id, relacion.categoria_id]
      );
    }

    // 6. Insertar participaciones en retos
    console.log('Insertando participaciones en retos...');
    const participaciones = [
      { usuario_id: usuariosIds.usuario_2, reto_id: retosIds.reto_1, progreso: 50, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_3, reto_id: retosIds.reto_2, progreso: 20, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_4, reto_id: retosIds.reto_3, progreso: 80, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_5, reto_id: retosIds.reto_4, progreso: 30, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_6, reto_id: retosIds.reto_5, progreso: 60, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_7, reto_id: retosIds.reto_6, progreso: 40, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_8, reto_id: retosIds.reto_7, progreso: 70, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_9, reto_id: retosIds.reto_8, progreso: 10, estado: 'activo' },
      { usuario_id: usuariosIds.usuario_10, reto_id: retosIds.reto_9, progreso: 90, estado: 'completado' },
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_10, progreso: 25, estado: 'completado' },
    ];

    for (const participacion of participaciones) {
      await client.query(
        'INSERT INTO participacion_retos (usuario_id, reto_id, progreso, estado) VALUES ($1, $2, $3, $4)',
        [participacion.usuario_id, participacion.reto_id, participacion.progreso, participacion.estado]
      );
    }

    // 7. Insertar tareas
    console.log('Insertando tareas...');
    const tareas = [
      { reto_id: retosIds.reto_1, asignado_a: null, titulo: 'Resolver derivadas', descripcion: 'Resolver 10 problemas de derivadas', puntos: 50, fecha_limite: '2023-10-10', tipo: 'ejercicio' },
      { reto_id: retosIds.reto_2, asignado_a: usuariosIds.usuario_2, titulo: 'Investigar sobre Roma', descripcion: 'Escribir un ensayo sobre el Imperio Romano', puntos: 100, fecha_limite: '2023-10-05', tipo: 'proyecto' },
      { reto_id: retosIds.reto_3, asignado_a: null, titulo: 'Crear función suma', descripcion: 'Escribir una función que sume dos números', puntos: 20, fecha_limite: '2023-10-15', tipo: 'ejercicio' },
      { reto_id: retosIds.reto_4, asignado_a: usuariosIds.usuario_4, titulo: 'Análisis de Hamlet', descripcion: 'Analizar el personaje de Hamlet', puntos: 80, fecha_limite: '2023-10-20', tipo: 'lectura' },
      { reto_id: retosIds.reto_5, asignado_a: null, titulo: 'Estudio de ecosistemas', descripcion: 'Visitar un ecosistema local y tomar notas', puntos: 60, fecha_limite: '2023-10-10', tipo: 'proyecto' },
      { reto_id: retosIds.reto_6, asignado_a: usuariosIds.usuario_6, titulo: 'Práctica de conversación', descripcion: 'Grabar una conversación en inglés', puntos: 30, fecha_limite: '2023-10-25', tipo: 'ejercicio' },
      { reto_id: retosIds.reto_7, asignado_a: null, titulo: 'Crear obra inspirada en Picasso', descripcion: 'Pintar un cuadro al estilo cubista', puntos: 100, fecha_limite: '2023-11-01', tipo: 'proyecto' },
      { reto_id: retosIds.reto_8, asignado_a: usuariosIds.usuario_8, titulo: 'Correr 5 km', descripcion: 'Completar una carrera de 5 km', puntos: 50, fecha_limite: '2023-09-15', tipo: 'ejercicio' },
      { reto_id: retosIds.reto_9, asignado_a: null, titulo: 'Practicar escalas mayores', descripcion: 'Tocar escalas mayores en el piano', puntos: 40, fecha_limite: '2023-10-15', tipo: 'ejercicio' },
      { reto_id: retosIds.reto_10, asignado_a: usuariosIds.usuario_10, titulo: 'Introducción a IA', descripcion: 'Leer un artículo sobre IA y resumirlo', puntos: 70, fecha_limite: '2023-10-20', tipo: 'lectura' }
    ];

    for (const tarea of tareas) {
      await client.query(
        'INSERT INTO tareas (reto_id, asignado_a, titulo, descripcion, puntos, fecha_limite, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [tarea.reto_id, tarea.asignado_a, tarea.titulo, tarea.descripcion, tarea.puntos, tarea.fecha_limite, tarea.tipo]
      );
    }

    // 8. Insertar apuntes
    console.log('Insertando apuntes...');
    const apuntes = [
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_1, plan_estudio_id: null, titulo: 'Apuntes de Derivadas', contenido: 'Contenido sobre derivadas...', formato: 'pdf', calificacion_promedio: 4.5, es_publico: true },
      { usuario_id: usuariosIds.usuario_2, reto_id: null, plan_estudio_id: planesIds.plan_2, titulo: 'Resumen de Historia Antigua', contenido: 'Resumen de eventos históricos...', formato: 'md', calificacion_promedio: 3.8, es_publico: false },
      { usuario_id: usuariosIds.usuario_3, reto_id: retosIds.reto_3, plan_estudio_id: null, titulo: 'Guía de Funciones en Python', contenido: 'Explicación de funciones...', formato: 'docx', calificacion_promedio: 4.2, es_publico: true },
      { usuario_id: usuariosIds.usuario_4, reto_id: null, plan_estudio_id: planesIds.plan_4, titulo: 'Análisis de Obras Clásicas', contenido: 'Análisis detallado de Hamlet...', formato: 'pdf', calificacion_promedio: 4.7, es_publico: false },
      { usuario_id: usuariosIds.usuario_5, reto_id: retosIds.reto_5, plan_estudio_id: null, titulo: 'Notas de Ecosistemas', contenido: 'Observaciones de campo...', formato: 'md', calificacion_promedio: 3.5, es_publico: true },
      { usuario_id: usuariosIds.usuario_6, reto_id: null, plan_estudio_id: planesIds.plan_6, titulo: 'Vocabulario de Inglés', contenido: 'Lista de palabras y frases...', formato: 'docx', calificacion_promedio: 4.0, es_publico: false },
      { usuario_id: usuariosIds.usuario_7, reto_id: retosIds.reto_7, plan_estudio_id: null, titulo: 'Técnicas de Pintura Moderna', contenido: 'Descripción de técnicas...', formato: 'pdf', calificacion_promedio: 4.3, es_publico: true },
      { usuario_id: usuariosIds.usuario_8, reto_id: null, plan_estudio_id: planesIds.plan_8, titulo: 'Plan de Entrenamiento', contenido: 'Rutina de ejercicios...', formato: 'md', calificacion_promedio: 3.9, es_publico: false },
      { usuario_id: usuariosIds.usuario_9, reto_id: retosIds.reto_9, plan_estudio_id: null, titulo: 'Partituras de Escalas', contenido: 'Partituras para practicar...', formato: 'pdf', calificacion_promedio: 4.1, es_publico: true },
      { usuario_id: usuariosIds.usuario_10, reto_id: null, plan_estudio_id: planesIds.plan_10, titulo: 'Resumen de IA', contenido: 'Resumen de conceptos de IA...', formato: 'docx', calificacion_promedio: 4.6, es_publico: false }
    ];

    const apuntesIds: { [key: string]: string } = {};

    for (const [index, apunte] of apuntes.entries()) {
      const result = await client.query(
        'INSERT INTO apuntes (usuario_id, reto_id, plan_estudio_id, titulo, contenido, formato, calificacion_promedio, es_publico) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [apunte.usuario_id, apunte.reto_id, apunte.plan_estudio_id, apunte.titulo, apunte.contenido, apunte.formato, apunte.calificacion_promedio, apunte.es_publico]
      );
      apuntesIds[`apunte_${index + 1}`] = result.rows[0].id;
    }

    // 8.1 Insertar archivos asociados a apuntes
    console.log('Insertando archivos...');
    const archivos = [
      { apunte_id: apuntesIds.apunte_1, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf', formato: 'pdf' },
      { apunte_id: apuntesIds.apunte_2, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.md', formato: 'md' },
      { apunte_id: apuntesIds.apunte_3, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.docx', formato: 'docx' },
      { apunte_id: apuntesIds.apunte_4, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf', formato: 'pdf' },
      { apunte_id: apuntesIds.apunte_5, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.md', formato: 'md' },
      { apunte_id: apuntesIds.apunte_6, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.docx', formato: 'docx' },
      { apunte_id: apuntesIds.apunte_7, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf', formato: 'pdf' },
      { apunte_id: apuntesIds.apunte_8, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.md', formato: 'md' },
      { apunte_id: apuntesIds.apunte_9, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf', formato: 'pdf' },
      { apunte_id: apuntesIds.apunte_10, url: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.docx', formato: 'docx' }
    ];

    for (const archivo of archivos) {
      await client.query(
        'INSERT INTO archivos (apunte_id, url, formato) VALUES ($1, $2, $3)',
        [archivo.apunte_id, archivo.url, archivo.formato]
      );
    }

    // Insertar archivos genéricos
    console.log('Insertando archivos genéricos...');
    const archivosGenericos = [
      { entidad: 'reto', entidad_id: retosIds.reto_1, nombre: 'Guía de estudio', url: 'https://storage.example.com/files/reto1_guia.pdf', formato: 'pdf', subido_por: usuariosIds.usuario_1 },
      { entidad: 'tarea', entidad_id: await obtenerTareaId(client, retosIds.reto_2), nombre: 'Plantilla de informe', url: 'https://storage.example.com/files/tarea_plantilla.docx', formato: 'docx', subido_por: usuariosIds.usuario_2 },
      { entidad: 'plan_estudio', entidad_id: planesIds.plan_3, nombre: 'Calendario', url: 'https://storage.example.com/files/plan3_calendario.pdf', formato: 'pdf', subido_por: usuariosIds.usuario_3 },
      { entidad: 'reto', entidad_id: retosIds.reto_4, nombre: 'Material adicional', url: 'https://storage.example.com/files/reto4_material.pdf', formato: 'pdf', subido_por: usuariosIds.usuario_4 },
      { entidad: 'tarea', entidad_id: await obtenerTareaId(client, retosIds.reto_5), nombre: 'Ejemplo', url: 'https://storage.example.com/files/tarea_ejemplo.pdf', formato: 'pdf', subido_por: usuariosIds.usuario_5 }
    ];

    for (const archivo of archivosGenericos) {
      await client.query(
        'INSERT INTO archivos_genericos (entidad, entidad_id, nombre, url, formato, subido_por) VALUES ($1, $2, $3, $4, $5, $6)',
        [archivo.entidad, archivo.entidad_id, archivo.nombre, archivo.url, archivo.formato, archivo.subido_por]
      );
    }

    // 8.2 Insertar calificaciones para los apuntes (respetando la restricción de no auto-calificación)
    console.log('Insertando calificaciones de apuntes...');
    const calificaciones = [
      // usuario_2 califica el apunte de usuario_1
      { apunte_id: apuntesIds.apunte_1, usuario_id: usuariosIds.usuario_2, calificacion: 5.0, comentario: '¡Excelentes apuntes sobre derivadas!' },
      // usuario_3 califica el apunte de usuario_1
      { apunte_id: apuntesIds.apunte_1, usuario_id: usuariosIds.usuario_3, calificacion: 4.5, comentario: 'Muy útil, pero podría tener más ejemplos' },
      // usuario_1 califica el apunte de usuario_2
      { apunte_id: apuntesIds.apunte_2, usuario_id: usuariosIds.usuario_1, calificacion: 4.0, comentario: 'Buen resumen histórico' },
      // usuario_3 califica el apunte de usuario_2
      { apunte_id: apuntesIds.apunte_2, usuario_id: usuariosIds.usuario_3, calificacion: 3.5, comentario: 'Información interesante pero necesita más detalle' },
      // usuario_1 califica el apunte de usuario_3
      { apunte_id: apuntesIds.apunte_3, usuario_id: usuariosIds.usuario_1, calificacion: 4.5, comentario: 'Gran guía de Python' },
      // usuario_4 califica el apunte de usuario_3
      { apunte_id: apuntesIds.apunte_3, usuario_id: usuariosIds.usuario_4, calificacion: 4.0, comentario: 'Contenido claro y conciso' },
      // usuario_5 califica el apunte de usuario_4
      { apunte_id: apuntesIds.apunte_4, usuario_id: usuariosIds.usuario_5, calificacion: 5.0, comentario: 'Análisis literario profundo' },
      // usuario_6 califica el apunte de usuario_5
      { apunte_id: apuntesIds.apunte_5, usuario_id: usuariosIds.usuario_6, calificacion: 3.5, comentario: 'Observaciones interesantes sobre ecosistemas' },
      // usuario_7 califica el apunte de usuario_6
      { apunte_id: apuntesIds.apunte_6, usuario_id: usuariosIds.usuario_7, calificacion: 4.0, comentario: 'Vocabulario muy completo' },
      // usuario_8 califica el apunte de usuario_7
      { apunte_id: apuntesIds.apunte_7, usuario_id: usuariosIds.usuario_8, calificacion: 4.5, comentario: 'Técnicas explicadas con claridad' },
      // usuario_9 califica el apunte de usuario_8
      { apunte_id: apuntesIds.apunte_8, usuario_id: usuariosIds.usuario_9, calificacion: 3.8, comentario: 'Plan bien estructurado' },
      // usuario_10 califica el apunte de usuario_9
      { apunte_id: apuntesIds.apunte_9, usuario_id: usuariosIds.usuario_10, calificacion: 4.2, comentario: 'Partituras muy útiles para practicar' },
      // usuario_1 califica el apunte de usuario_10
      { apunte_id: apuntesIds.apunte_10, usuario_id: usuariosIds.usuario_1, calificacion: 4.8, comentario: 'Excelente resumen de IA' }
    ];

    // Insertar calificaciones y actualizar promedios
    for (const cal of calificaciones) {
      await client.query(
        'INSERT INTO calificaciones_apuntes (apunte_id, usuario_id, calificacion, comentario) VALUES ($1, $2, $3, $4)',
        [cal.apunte_id, cal.usuario_id, cal.calificacion, cal.comentario]
      );
    }

    // 9. Insertar recompensas y guardar sus IDs
    console.log('Insertando recompensas...');
    const recompensas = [
      { nombre: 'Insignia de Principiante', tipo: 'insignia', valor: 1, criterio_obtencion: 'Completar primer reto' },
      { nombre: 'Puntos Iniciales', tipo: 'puntos', valor: 50, criterio_obtencion: 'Registrarse en la plataforma' },
      { nombre: 'Nivel 1', tipo: 'nivel', valor: 1, criterio_obtencion: 'Alcanzar 100 puntos' },
      { nombre: 'Insignia de Intermedio', tipo: 'insignia', valor: 2, criterio_obtencion: 'Completar 5 retos' },
      { nombre: 'Puntos por Tarea', tipo: 'puntos', valor: 20, criterio_obtencion: 'Completar una tarea' },
      { nombre: 'Nivel 2', tipo: 'nivel', valor: 2, criterio_obtencion: 'Alcanzar 500 puntos' },
      { nombre: 'Insignia de Avanzado', tipo: 'insignia', valor: 3, criterio_obtencion: 'Completar 10 retos' },
      { nombre: 'Puntos por Plan', tipo: 'puntos', valor: 100, criterio_obtencion: 'Crear un plan de estudio' },
      { nombre: 'Nivel 3', tipo: 'nivel', valor: 3, criterio_obtencion: 'Alcanzar 1000 puntos' },
      { nombre: 'Insignia de Experto', tipo: 'insignia', valor: 4, criterio_obtencion: 'Completar 20 retos' }
    ];

    const recompensasIds: { [key: string]: string } = {};

    for (const [index, recompensa] of recompensas.entries()) {
      const result = await client.query(
        'INSERT INTO recompensas (nombre, tipo, valor, criterio_obtencion) VALUES ($1, $2, $3, $4) RETURNING id',
        [recompensa.nombre, recompensa.tipo, recompensa.valor, recompensa.criterio_obtencion]
      );
      recompensasIds[`recompensa_${index + 1}`] = result.rows[0].id;
    }

    // Insertar reglas de recompensas
    console.log('Insertando reglas de recompensas...');
    const reglasRecompensas = [
      { nombre: 'Primer reto completado', evento: 'completar_reto', condicion: 'count = 1', recompensa_id: recompensasIds.recompensa_1, puntos: 50 },
      { nombre: 'Registro completado', evento: 'registro_usuario', condicion: null, recompensa_id: recompensasIds.recompensa_2, puntos: 10 },
      { nombre: 'Nivel principiante', evento: 'alcanzar_puntaje', condicion: 'puntaje >= 100', recompensa_id: recompensasIds.recompensa_3, puntos: 0 },
      { nombre: '5 retos completados', evento: 'completar_reto', condicion: 'count = 5', recompensa_id: recompensasIds.recompensa_4, puntos: 200 },
      { nombre: 'Tarea completada', evento: 'completar_tarea', condicion: null, recompensa_id: recompensasIds.recompensa_5, puntos: 5 }
    ];

    for (const regla of reglasRecompensas) {
      await client.query(
        'INSERT INTO reglas_recompensas (nombre, evento, condicion, recompensa_id, puntos) VALUES ($1, $2, $3, $4, $5)',
        [regla.nombre, regla.evento, regla.condicion, regla.recompensa_id, regla.puntos]
      );
    }

    // 10. Insertar relaciones usuario-recompensa
    console.log('Insertando relaciones usuario-recompensa...');
    const usuarioRecompensas = [
      { usuario_id: usuariosIds.usuario_1, recompensa_id: recompensasIds.recompensa_1 },
      { usuario_id: usuariosIds.usuario_2, recompensa_id: recompensasIds.recompensa_2 },
      { usuario_id: usuariosIds.usuario_3, recompensa_id: recompensasIds.recompensa_3 },
      { usuario_id: usuariosIds.usuario_4, recompensa_id: recompensasIds.recompensa_4 },
      { usuario_id: usuariosIds.usuario_5, recompensa_id: recompensasIds.recompensa_5 },
      { usuario_id: usuariosIds.usuario_6, recompensa_id: recompensasIds.recompensa_6 },
      { usuario_id: usuariosIds.usuario_7, recompensa_id: recompensasIds.recompensa_7 },
      { usuario_id: usuariosIds.usuario_8, recompensa_id: recompensasIds.recompensa_8 },
      { usuario_id: usuariosIds.usuario_9, recompensa_id: recompensasIds.recompensa_9 },
      { usuario_id: usuariosIds.usuario_10, recompensa_id: recompensasIds.recompensa_10 }
    ];

    for (const relacion of usuarioRecompensas) {
      await client.query(
        'INSERT INTO usuario_recompensas (usuario_id, recompensa_id) VALUES ($1, $2)',
        [relacion.usuario_id, relacion.recompensa_id]
      );
    }

    // 11. Insertar logros
    console.log('Insertando logros...');
    const logros = [
      { usuario_id: usuariosIds.usuario_1, tipo: 'completar_tarea', descripcion: 'Completó la tarea "Resolver derivadas"' },
      { usuario_id: usuariosIds.usuario_2, tipo: 'unirse_reto', descripcion: 'Se unió al reto "Reto de Historia Antigua"' },
      { usuario_id: usuariosIds.usuario_3, tipo: 'crear_reto', descripcion: 'Creó el reto "Reto de Python: Funciones"' },
      { usuario_id: usuariosIds.usuario_4, tipo: 'completar_reto', descripcion: 'Completó el reto "Reto de Literatura: Shakespeare"' },
      { usuario_id: usuariosIds.usuario_5, tipo: 'subir_apunte', descripcion: 'Subió el apunte "Notas de Ecosistemas"' },
      { usuario_id: usuariosIds.usuario_6, tipo: 'obtener_recompensa', descripcion: 'Obtuvo la recompensa "Puntos Iniciales"' },
      { usuario_id: usuariosIds.usuario_7, tipo: 'alcanzar_nivel', descripcion: 'Alcanzó el nivel 2' },
      { usuario_id: usuariosIds.usuario_8, tipo: 'completar_plan', descripcion: 'Completó el plan de estudio "Plan de Deportes"' },
      { usuario_id: usuariosIds.usuario_9, tipo: 'participar_reto', descripcion: 'Participó en el reto "Reto de Piano: Escalas"' },
      { usuario_id: usuariosIds.usuario_10, tipo: 'crear_tarea', descripcion: 'Creó la tarea "Introducción a IA"' }
    ];

    for (const logro of logros) {
      await client.query(
        'INSERT INTO logros (usuario_id, tipo, descripcion) VALUES ($1, $2, $3)',
        [logro.usuario_id, logro.tipo, logro.descripcion]
      );
    }

    // Insertar notificaciones
    console.log('Insertando notificaciones...');
    const notificaciones = [
      { usuario_id: usuariosIds.usuario_1, titulo: 'Bienvenido a Challenge Plans', mensaje: '¡Gracias por registrarte! Explora los retos disponibles.', tipo: 'sistema' },
      { usuario_id: usuariosIds.usuario_2, titulo: 'Nuevo reto disponible', mensaje: 'Se ha creado un nuevo reto que podría interesarte.', tipo: 'reto_nuevo', entidad: 'reto', entidad_id: retosIds.reto_1 },
      { usuario_id: usuariosIds.usuario_3, titulo: 'Tarea asignada', mensaje: 'Se te ha asignado una nueva tarea.', tipo: 'tarea_asignada', entidad: 'tarea', entidad_id: await obtenerTareaId(client, retosIds.reto_3) },
      { usuario_id: usuariosIds.usuario_4, titulo: '¡Recompensa obtenida!', mensaje: 'Has obtenido la insignia de principiante.', tipo: 'recompensa_obtenida', entidad: 'recompensa', entidad_id: recompensasIds.recompensa_1 },
      { usuario_id: usuariosIds.usuario_5, titulo: 'Reto completado', mensaje: 'Has completado el reto de Biología: Ecosistemas.', tipo: 'reto_completado', entidad: 'reto', entidad_id: retosIds.reto_5, leida: true }
    ];

    for (const notif of notificaciones) {
      await client.query(
        'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id, leida) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [notif.usuario_id, notif.titulo, notif.mensaje, notif.tipo, notif.entidad || null, notif.entidad_id || null, notif.leida || false]
      );
    }

    // Asignar roles a usuarios
    console.log('Asignando roles a usuarios...');

    // Primero obtener los IDs de roles
    const rolesResult = await client.query('SELECT id, nombre FROM roles');
    const rolesMap: { [key: string]: string } = {};
    rolesResult.rows.forEach((rol: { nombre: string; id: string }) => {
      rolesMap[rol.nombre] = rol.id;
    });

    // Asignar roles
    const usuarioRoles = [
      { usuario_id: usuariosIds.usuario_1, rol_id: rolesMap['admin'] },
      { usuario_id: usuariosIds.usuario_2, rol_id: rolesMap['profesor'] },
      { usuario_id: usuariosIds.usuario_3, rol_id: rolesMap['estudiante'] },
      { usuario_id: usuariosIds.usuario_4, rol_id: rolesMap['estudiante'] },
      { usuario_id: usuariosIds.usuario_5, rol_id: rolesMap['moderador'] }
    ];

    for (const ur of usuarioRoles) {
      await client.query(
        'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)',
        [ur.usuario_id, ur.rol_id]
      );
    }

    // Insertar historial de progreso
    console.log('Insertando historial de progreso...');
    const historialesProgreso = [
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_10, progreso_anterior: 0, progreso_nuevo: 10, evento: 'tarea_completada' },
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_10, progreso_anterior: 10, progreso_nuevo: 25, evento: 'tarea_completada' },
      { usuario_id: usuariosIds.usuario_10, reto_id: retosIds.reto_9, progreso_anterior: 0, progreso_nuevo: 30, evento: 'tarea_completada' },
      { usuario_id: usuariosIds.usuario_10, reto_id: retosIds.reto_9, progreso_anterior: 30, progreso_nuevo: 60, evento: 'tarea_completada' },
      { usuario_id: usuariosIds.usuario_10, reto_id: retosIds.reto_9, progreso_anterior: 60, progreso_nuevo: 90, evento: 'tarea_completada' }
    ];

    for (const hp of historialesProgreso) {
      await client.query(
        'INSERT INTO historial_progreso (usuario_id, reto_id, progreso_anterior, progreso_nuevo, fecha, evento) VALUES ($1, $2, $3, $4, $5, $6)',
        [hp.usuario_id, hp.reto_id, hp.progreso_anterior, hp.progreso_nuevo, new Date(Date.now() - Math.floor(Math.random() * 1000000000)), hp.evento]
      );
    }

    // Actualizar categorías con descripciones e iconos
    console.log('Actualizando categorías con descripciones e iconos...');
    const categoriasActualizacion = [
      { id: categoriasIds.categoria_1, descripcion: 'Temas relacionados con álgebra, geometría, cálculo y estadística', icono: 'math-icon' },
      { id: categoriasIds.categoria_2, descripcion: 'Estudio de fenómenos naturales, física, química y biología', icono: 'science-icon' },
      { id: categoriasIds.categoria_3, descripcion: 'Eventos históricos, civilizaciones antiguas y moderna', icono: 'history-icon' },
      { id: categoriasIds.categoria_4, descripcion: 'Análisis de obras literarias, prosa, poesía y narrativa', icono: 'literature-icon' },
      { id: categoriasIds.categoria_5, descripcion: 'Desarrollo de software, algoritmos y lenguajes de programación', icono: 'programming-icon' },
      { id: categoriasIds.categoria_6, descripcion: 'Aprendizaje de idiomas extranjeros y lingüística', icono: 'language-icon' },
      { id: categoriasIds.categoria_7, descripcion: 'Técnicas artísticas, historia del arte y expresión creativa', icono: 'art-icon' },
      { id: categoriasIds.categoria_8, descripcion: 'Actividades físicas, entrenamiento y competencias deportivas', icono: 'sports-icon' },
      { id: categoriasIds.categoria_9, descripcion: 'Teoría musical, instrumentos y composición', icono: 'music-icon' },
      { id: categoriasIds.categoria_10, descripcion: 'Avances tecnológicos, informática y ciencias de la computación', icono: 'tech-icon' }
    ];

    for (const cat of categoriasActualizacion) {
      await client.query(
        'UPDATE categorias SET descripcion = $1, icono = $2 WHERE id = $3',
        [cat.descripcion, cat.icono, cat.id]
      );
    }

    // Confirmar transacción si todo ha ido bien
    await client.query('COMMIT');
    console.log('✅ Transacción completada: todos los datos de ejemplo han sido insertados correctamente');

  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('❌ Error al insertar datos de ejemplo, se ha revertido la transacción:', error);
    throw error;
  }
}

// Obtener el parámetro de la línea de comandos
const args = process.argv.slice(2);
const operation = args.length > 0 ? parseInt(args[0]) : 0;

// Ejecutar la operación
if (operation === 1 || operation === 2 || operation === 3) {
  executeOperation(operation);
} else {
  console.log('🔢 Por favor especifique una operación válida:');
  console.log('  - 1: Eliminar todas las tablas');
  console.log('  - 2: Crear todas las tablas con el nuevo esquema');
  console.log('  - 3: Insertar datos de ejemplo en las tablas');
  console.log('\nEjemplo: npx ts-node src/create-tables.ts 3');
}

async function obtenerTareaId(client: any, retoId: string): Promise<string> {
  const result = await client.query('SELECT id FROM tareas WHERE reto_id = $1 LIMIT 1', [retoId]);
  return result.rows[0].id;
}
