import { MigrationInterface, QueryRunner } from "typeorm";

export class TriggersAndFunctions1741440000000 implements MigrationInterface {
    name = 'TriggersAndFunctions1741440000000'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
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

            -- Índices compuestos
            CREATE INDEX IF NOT EXISTS idx_participacion_usuario_reto ON participacion_retos(usuario_id, reto_id);
            CREATE INDEX IF NOT EXISTS idx_reto_categorias_reto_categoria ON reto_categorias(reto_id, categoria_id);
            CREATE INDEX IF NOT EXISTS idx_archivos_genericos_entidad ON archivos_genericos(entidad, entidad_id);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas ON notificaciones(usuario_id, leida) WHERE leida = FALSE;
            CREATE INDEX IF NOT EXISTS idx_comentarios_entidad ON comentarios(entidad, entidad_id);
            CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);
            CREATE INDEX IF NOT EXISTS idx_retos_creador ON retos(creador_id);
            CREATE INDEX IF NOT EXISTS idx_apuntes_usuario ON apuntes(usuario_id);
            CREATE INDEX IF NOT EXISTS idx_planes_estudio_usuario ON planes_estudio(usuario_id);

            -- Nuevos índices para optimización adicional
            CREATE INDEX IF NOT EXISTS idx_tareas_reto_fecha ON tareas(reto_id, fecha_limite);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
            
            -- Índices adicionales para mejorar rendimiento de consultas frecuentes
            CREATE INDEX IF NOT EXISTS idx_historial_usuario_fecha ON historial_progreso(usuario_id, fecha);
            CREATE INDEX IF NOT EXISTS idx_comentarios_padre ON comentarios(comentario_padre_id);

            -- Índice de texto completo
            CREATE INDEX IF NOT EXISTS idx_titulo_retos_text ON retos USING GIN (to_tsvector('spanish', titulo));

            -- Vista para consultar el progreso en retos (convertida a vista materializada)
            DROP VIEW IF EXISTS vista_progreso_reto;
            CREATE MATERIALIZED VIEW vista_progreso_reto_mat AS
            SELECT u.nombre, r.titulo, pr.progreso, pr.fecha_completado
            FROM participacion_retos pr
            JOIN usuarios u ON pr.usuario_id = u.id
            JOIN retos r ON pr.reto_id = r.id;
            
            -- Añadir índices a la vista materializada para mejorar rendimiento
            CREATE INDEX IF NOT EXISTS idx_vista_progreso_usuario ON vista_progreso_reto_mat(nombre);
            CREATE INDEX IF NOT EXISTS idx_vista_progreso_reto ON vista_progreso_reto_mat(titulo);

            -- Función para actualizar automáticamente el nivel de usuario basado en puntaje
            CREATE OR REPLACE FUNCTION actualizar_nivel_usuario()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.nivel := FLOOR(NEW.puntaje / 100) + 1; -- 1 nivel por cada 100 puntos
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            DROP TRIGGER IF EXISTS trigger_nivel_usuario ON usuarios;
            CREATE TRIGGER trigger_nivel_usuario
            BEFORE UPDATE OF puntaje ON usuarios
            FOR EACH ROW EXECUTE FUNCTION actualizar_nivel_usuario();
            
            -- Mejoras para gestión de zonas horarias en nuevas tablas
            -- Nota: esto no modifica tablas existentes para evitar problemas con datos actuales
            -- pero es una recomendación para futuras tablas
            
            -- 1. Trigger mejorado para tareas - Registrar y Eliminar en tareas_completadas
            CREATE OR REPLACE FUNCTION gestionar_tarea_completada()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (NEW.completado = TRUE AND (TG_OP = 'INSERT' OR OLD.completado = FALSE OR OLD.asignado_a IS DISTINCT FROM NEW.asignado_a)) THEN
                    -- Si la tarea se reasignó, eliminar registros antiguos
                    DELETE FROM tareas_completadas WHERE tarea_id = NEW.id AND usuario_id != NEW.asignado_a;
                    
                    -- Insertar nuevo registro para el usuario actual
                    INSERT INTO tareas_completadas (usuario_id, tarea_id, fecha_completado)
                    VALUES (NEW.asignado_a, NEW.id, CURRENT_TIMESTAMP)
                    ON CONFLICT (usuario_id, tarea_id) DO NOTHING;
                ELSIF (NEW.completado = FALSE AND OLD.completado = TRUE) THEN
                    DELETE FROM tareas_completadas WHERE usuario_id = NEW.asignado_a AND tarea_id = NEW.id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_tarea_completada ON tareas;
            CREATE TRIGGER trigger_tarea_completada
            BEFORE INSERT OR UPDATE OF completado, asignado_a ON tareas
            FOR EACH ROW
            EXECUTE FUNCTION gestionar_tarea_completada();

            -- 2. Trigger optimizado para participacion_retos - Actualizar Estado y Gestionar Recompensas
            CREATE OR REPLACE FUNCTION gestionar_estado_participacion()
            RETURNS TRIGGER AS $$
            DECLARE
                recompensa_record RECORD;
            BEGIN
                -- Si el progreso llega a 100, marcar como completado y registrar fecha
                IF NEW.progreso = 100 AND (OLD.progreso < 100 OR OLD.progreso IS NULL) THEN
                    NEW.estado := 'completado';
                    NEW.fecha_completado := CURRENT_TIMESTAMP;
                    
                    -- Otorgar puntos al usuario por completar el reto
                    INSERT INTO usuario_puntos (usuario_id, puntos, concepto, fecha)
                    VALUES (
                        NEW.usuario_id, 
                        (SELECT puntos_totales FROM retos WHERE id = NEW.reto_id), 
                        'Completar Reto', 
                        CURRENT_TIMESTAMP
                    );
                    
                    -- Otorgar recompensa "Completar Reto" si existe
                    FOR recompensa_record IN 
                        SELECT id FROM recompensas 
                        WHERE tipo = 'completar_reto' 
                        LIMIT 1
                    LOOP
                        INSERT INTO usuario_recompensas (usuario_id, recompensa_id, fecha_obtencion)
                        VALUES (NEW.usuario_id, recompensa_record.id, CURRENT_TIMESTAMP)
                        ON CONFLICT (usuario_id, recompensa_id) DO NOTHING;
                    END LOOP;
                    
                    -- Enviar notificación de reto completado
                    INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido, leido, fecha_creacion)
                    VALUES (
                        NEW.usuario_id,
                        'logro',
                        '¡Reto completado!',
                        'Has completado el reto ' || (SELECT titulo FROM retos WHERE id = NEW.reto_id) || ' con éxito.',
                        false,
                        CURRENT_TIMESTAMP
                    );
                END IF;
                
                -- Si bajó de 100%, volver a estado activo
                IF NEW.progreso < 100 AND OLD.progreso = 100 THEN
                    NEW.estado := 'activo';
                    NEW.fecha_completado := NULL;
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_actualizar_estado ON participacion_retos;
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

            DROP TRIGGER IF EXISTS trigger_actualizar_puntos_totales ON tareas;
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

            DROP TRIGGER IF EXISTS trigger_logro_registro_usuario ON usuarios;
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

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_usuarios ON usuarios;
            CREATE TRIGGER trigger_actualizar_fecha_modificacion_usuarios
            BEFORE UPDATE ON usuarios
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_modificacion();

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_planes ON planes_estudio;
            CREATE TRIGGER trigger_actualizar_fecha_modificacion_planes
            BEFORE UPDATE ON planes_estudio
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_modificacion();

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_retos ON retos;
            CREATE TRIGGER trigger_actualizar_fecha_modificacion_retos
            BEFORE UPDATE ON retos
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_modificacion();

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_tareas ON tareas;
            CREATE TRIGGER trigger_actualizar_fecha_modificacion_tareas
            BEFORE UPDATE ON tareas
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_modificacion();

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_apuntes ON apuntes;
            CREATE TRIGGER trigger_actualizar_fecha_modificacion_apuntes
            BEFORE UPDATE ON apuntes
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_modificacion();

            -- 6. Trigger para participacion_retos - Registrar y Eliminar Logro de Participación
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

            DROP TRIGGER IF EXISTS trigger_logro_participacion ON participacion_retos;
            CREATE TRIGGER trigger_logro_participacion
            AFTER INSERT OR DELETE ON participacion_retos
            FOR EACH ROW
            EXECUTE FUNCTION gestionar_logro_participacion();

            -- 7. Trigger para usuario_recompensas - Actualizar Puntaje
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

            DROP TRIGGER IF EXISTS trigger_actualizar_puntaje ON usuario_recompensas;
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

            -- Configuración para ejecutar automáticamente la finalización de retos
            -- Usando pg_cron si está disponible (requiere extensión pg_cron)
            DO $$
            BEGIN
                -- Verificar si pg_cron está disponible e instalada
                IF EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
                ) THEN
                    -- Programar la tarea para ejecutarse diariamente a medianoche
                    PERFORM cron.schedule('finalizar-retos-diario', '0 0 * * *', 'SELECT finalizar_retos_vencidos()');
                END IF;
                -- Si no está disponible, este código no fallará, simplemente no programa el job
            EXCEPTION WHEN OTHERS THEN
                -- Captura cualquier error (por ejemplo, si cron.schedule no existe)
                RAISE NOTICE 'pg_cron no está disponible, la tarea debe programarse externamente';
            END
            $$;

            -- 9. Trigger para actualizar el contador de participaciones en retos
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

            DROP TRIGGER IF EXISTS trigger_actualizar_participaciones ON participacion_retos;
            CREATE TRIGGER trigger_actualizar_participaciones
            AFTER INSERT OR DELETE ON participacion_retos
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_participaciones_reto();

            -- 10. Función para actualizar el promedio de calificaciones en apuntes
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

            DROP TRIGGER IF EXISTS trigger_actualizar_promedio ON calificaciones_apuntes;
            CREATE TRIGGER trigger_actualizar_promedio
            AFTER INSERT OR UPDATE OR DELETE ON calificaciones_apuntes
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_calificacion_promedio();

            -- 11. Función para registrar cambios de progreso
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

            DROP TRIGGER IF EXISTS trigger_registrar_cambio_progreso ON participacion_retos;
            CREATE TRIGGER trigger_registrar_cambio_progreso
            AFTER UPDATE OF progreso ON participacion_retos
            FOR EACH ROW
            EXECUTE FUNCTION registrar_cambio_progreso();

            -- 12. Función para notificaciones de tareas asignadas (mejorada para múltiples asignados)
            CREATE OR REPLACE FUNCTION notificar_tarea_asignada()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Si la tarea tiene un asignado principal
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
                
                -- Adicionalmente notificar a todos los usuarios en tarea_asignaciones
                IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
                    INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id)
                    SELECT 
                        ta.usuario_id, 
                        'Nueva tarea asignada', 
                        'Se te ha asignado la tarea ' || NEW.titulo || ' como ' || ta.rol_asignacion,
                        'tarea_asignada',
                        'tarea',
                        NEW.id
                    FROM tarea_asignaciones ta
                    WHERE ta.tarea_id = NEW.id
                    AND (NEW.asignado_a IS NULL OR ta.usuario_id <> NEW.asignado_a); -- Evita duplicar notificación al asignado principal
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_notificar_tarea_asignada ON tareas;
            CREATE TRIGGER trigger_notificar_tarea_asignada
            AFTER INSERT OR UPDATE OF asignado_a ON tareas
            FOR EACH ROW
            EXECUTE FUNCTION notificar_tarea_asignada();

            -- 13. Función para notificaciones de retos completados
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

            DROP TRIGGER IF EXISTS trigger_notificar_reto_completado ON participacion_retos;
            CREATE TRIGGER trigger_notificar_reto_completado
            AFTER UPDATE OF progreso ON participacion_retos
            FOR EACH ROW
            EXECUTE FUNCTION notificar_reto_completado();

            -- 14. Función para notificaciones de recompensas obtenidas
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

            DROP TRIGGER IF EXISTS trigger_notificar_recompensa ON usuario_recompensas;
            CREATE TRIGGER trigger_notificar_recompensa
            AFTER INSERT ON usuario_recompensas
            FOR EACH ROW
            EXECUTE FUNCTION notificar_recompensa_obtenida();

            -- 15. Función para sistema de recompensas genérico
            -- Mejorada para manejar condiciones más complejas y validar JSON
            CREATE OR REPLACE FUNCTION otorgar_recompensa_generica()
            RETURNS TRIGGER AS $$
            DECLARE
                recompensa_id UUID;
                evento_actual VARCHAR(50);
                usuario_actual UUID;
                condicion_json JSONB;
                cumple_condicion BOOLEAN;
                es_json_valido BOOLEAN;
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

                -- Buscar recompensas asociadas al evento (ahora puede haber múltiples)
                FOR recompensa_id, condicion_json IN 
                    SELECT rr.recompensa_id, (CASE WHEN rr.condicion IS NOT NULL THEN rr.condicion::jsonb ELSE NULL END)
                    FROM reglas_recompensas rr
                    WHERE rr.evento = evento_actual AND rr.activa = TRUE
                LOOP
                    -- Validar que el JSON de condición sea válido antes de procesarlo
                    IF condicion_json IS NOT NULL THEN
                        -- Verificar si es un JSON válido
                        BEGIN
                            es_json_valido := TRUE;
                            PERFORM jsonb_typeof(condicion_json);
                        EXCEPTION WHEN OTHERS THEN
                            es_json_valido := FALSE;
                            RAISE NOTICE 'Condición JSON inválida para recompensa %', recompensa_id;
                            CONTINUE; -- Saltar esta recompensa si el JSON no es válido
                        END;
                        
                        -- Solo continuar si el JSON es válido
                        IF NOT es_json_valido THEN
                            CONTINUE;
                        END IF;
                    END IF;
                    
                    cumple_condicion := TRUE;
                    
                    -- Verificar condiciones si existen (formato JSON: {campo: valor, min_value: X, etc})
                    IF condicion_json IS NOT NULL THEN
                        -- Ejemplo: verificar nivel mínimo
                        IF condicion_json ? 'min_nivel' THEN
                            IF (SELECT nivel FROM usuarios WHERE id = usuario_actual) < 
                               (condicion_json->>'min_nivel')::int THEN
                                cumple_condicion := FALSE;
                            END IF;
                        END IF;
                        
                        -- Ejemplo: verificar puntaje mínimo
                        IF condicion_json ? 'min_puntaje' THEN
                            IF (SELECT puntaje FROM usuarios WHERE id = usuario_actual) < 
                               (condicion_json->>'min_puntaje')::int THEN
                                cumple_condicion := FALSE;
                            END IF;
                        END IF;
                    END IF;
                    
                    -- Solo otorgar si cumple todas las condiciones
                    IF cumple_condicion THEN
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
                END LOOP;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- 16. Trigger para recompensas al completar un reto
            DROP TRIGGER IF EXISTS trigger_recompensa_completar_reto ON participacion_retos;
            CREATE TRIGGER trigger_recompensa_completar_reto
            AFTER UPDATE OF progreso ON participacion_retos
            FOR EACH ROW
            WHEN (NEW.progreso = 100 AND OLD.progreso < 100)
            EXECUTE FUNCTION otorgar_recompensa_generica();

            -- 17. Trigger para recompensas al subir un apunte público
            DROP TRIGGER IF EXISTS trigger_recompensa_subir_apunte ON apuntes;
            CREATE TRIGGER trigger_recompensa_subir_apunte
            AFTER INSERT ON apuntes
            FOR EACH ROW
            WHEN (NEW.es_publico = TRUE)
            EXECUTE FUNCTION otorgar_recompensa_generica();

            -- 18. Trigger para recompensas al crear un plan de estudio público
            DROP TRIGGER IF EXISTS trigger_recompensa_crear_plan ON planes_estudio;
            CREATE TRIGGER trigger_recompensa_crear_plan
            AFTER INSERT ON planes_estudio
            FOR EACH ROW
            WHEN (NEW.es_publico = TRUE)
            EXECUTE FUNCTION otorgar_recompensa_generica();
            
            -- Triggers para validación de integridad referencial en comentarios
            CREATE OR REPLACE FUNCTION validar_entidad_id()
            RETURNS TRIGGER AS $$
            DECLARE
                existe BOOLEAN;
            BEGIN
                -- Verificar que el ID de la entidad existe en la tabla correspondiente
                IF NEW.entidad = 'reto' THEN
                    SELECT EXISTS(SELECT 1 FROM retos WHERE id = NEW.entidad_id) INTO existe;
                ELSIF NEW.entidad = 'tarea' THEN
                    SELECT EXISTS(SELECT 1 FROM tareas WHERE id = NEW.entidad_id) INTO existe;
                ELSIF NEW.entidad = 'apunte' THEN
                    SELECT EXISTS(SELECT 1 FROM apuntes WHERE id = NEW.entidad_id) INTO existe;
                ELSIF NEW.entidad = 'plan_estudio' THEN
                    SELECT EXISTS(SELECT 1 FROM planes_estudio WHERE id = NEW.entidad_id) INTO existe;
                END IF;

                IF NOT existe THEN
                    RAISE EXCEPTION 'El ID % no existe en la entidad %', NEW.entidad_id, NEW.entidad;
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Trigger para validar entidad_id en comentarios
            DROP TRIGGER IF EXISTS trigger_validar_entidad_id ON comentarios;
            CREATE TRIGGER trigger_validar_entidad_id
            BEFORE INSERT OR UPDATE ON comentarios
            FOR EACH ROW
            EXECUTE FUNCTION validar_entidad_id();

            -- Trigger para validar entidad_id en archivos_genericos
            DROP TRIGGER IF EXISTS trigger_validar_entidad_id_archivos ON archivos_genericos;
            CREATE TRIGGER trigger_validar_entidad_id_archivos
            BEFORE INSERT OR UPDATE ON archivos_genericos
            FOR EACH ROW
            EXECUTE FUNCTION validar_entidad_id();

            -- Trigger para actualizar fecha_estado cuando cambia el estado de un reto
            CREATE OR REPLACE FUNCTION actualizar_fecha_estado_reto()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
                    NEW.fecha_estado := CURRENT_TIMESTAMP;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_estado ON retos;
            CREATE TRIGGER trigger_actualizar_fecha_estado
            BEFORE UPDATE OF estado ON retos
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_fecha_estado_reto();

            -- Trigger para sincronizar la tabla tareas_completadas con tarea_asignaciones
            CREATE OR REPLACE FUNCTION sincronizar_tareas_completadas()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Cuando se asigna una tarea a múltiples usuarios, verificar si ya estaba marcada como completada
                IF (TG_OP = 'INSERT') THEN
                    -- Si la tarea está completada, crear registro en tareas_completadas para el nuevo asignado
                    IF EXISTS (SELECT 1 FROM tareas WHERE id = NEW.tarea_id AND completado = TRUE) THEN
                        INSERT INTO tareas_completadas (usuario_id, tarea_id, fecha_completado, progreso)
                        VALUES (NEW.usuario_id, NEW.tarea_id, CURRENT_TIMESTAMP, 100)
                        ON CONFLICT (usuario_id, tarea_id) DO NOTHING;
                    END IF;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_sincronizar_tareas_completadas ON tarea_asignaciones;
            CREATE TRIGGER trigger_sincronizar_tareas_completadas
            AFTER INSERT ON tarea_asignaciones
            FOR EACH ROW
            EXECUTE FUNCTION sincronizar_tareas_completadas();

            -- Trigger para notificar a todos los usuarios asignados a una tarea
            CREATE OR REPLACE FUNCTION notificar_asignacion_multiple()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id)
                VALUES (
                    NEW.usuario_id,
                    'Nueva tarea asignada',
                    'Se te ha asignado la tarea como ' || NEW.rol_asignacion,
                    'tarea_asignada',
                    'tarea',
                    NEW.tarea_id
                );
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_notificar_asignacion_multiple ON tarea_asignaciones;
            CREATE TRIGGER trigger_notificar_asignacion_multiple
            AFTER INSERT ON tarea_asignaciones
            FOR EACH ROW
            EXECUTE FUNCTION notificar_asignacion_multiple();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Eliminar programación cron si existe
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
                ) THEN
                    PERFORM cron.unschedule('finalizar-retos-diario');
                END IF;
            EXCEPTION WHEN OTHERS THEN
                -- Ignorar errores
            END
            $$;
        
            -- Eliminar trigger de nivel de usuario
            DROP TRIGGER IF EXISTS trigger_nivel_usuario ON usuarios;
            
            -- Eliminar función de actualización de nivel
            DROP FUNCTION IF EXISTS actualizar_nivel_usuario();
            
            -- Eliminar vista materializada
            DROP MATERIALIZED VIEW IF EXISTS vista_progreso_reto_mat;
            
            -- Recrear la vista normal para mantener compatibilidad con código existente
            CREATE OR REPLACE VIEW vista_progreso_reto AS
            SELECT u.nombre, r.titulo, pr.progreso, pr.fecha_completado
            FROM participacion_retos pr
            JOIN usuarios u ON pr.usuario_id = u.id
            JOIN retos r ON pr.reto_id = r.id;
            
            -- Primero eliminar la vista
            DROP VIEW IF EXISTS vista_progreso_reto;

            -- Eliminar índices adicionales
            DROP INDEX IF EXISTS idx_historial_usuario_fecha;
            DROP INDEX IF EXISTS idx_comentarios_padre;

            -- Eliminar triggers adicionales
            DROP TRIGGER IF EXISTS trigger_notificar_asignacion_multiple ON tarea_asignaciones;
            DROP FUNCTION IF EXISTS notificar_asignacion_multiple();

            -- Eliminar triggers en orden inverso
            DROP TRIGGER IF EXISTS trigger_recompensa_crear_plan ON planes_estudio;
            DROP TRIGGER IF EXISTS trigger_recompensa_subir_apunte ON apuntes;
            DROP TRIGGER IF EXISTS trigger_recompensa_completar_reto ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_notificar_recompensa ON usuario_recompensas;
            DROP TRIGGER IF EXISTS trigger_notificar_reto_completado ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_notificar_tarea_asignada ON tareas;
            DROP TRIGGER IF EXISTS trigger_registrar_cambio_progreso ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_actualizar_promedio ON calificaciones_apuntes;
            DROP TRIGGER IF EXISTS trigger_actualizar_participaciones ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_actualizar_puntaje ON usuario_recompensas;
            DROP TRIGGER IF EXISTS trigger_logro_participacion ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_apuntes ON apuntes;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_tareas ON tareas;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_retos ON retos;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_planes ON planes_estudio;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion_usuarios ON usuarios;
            DROP TRIGGER IF EXISTS trigger_logro_registro_usuario ON usuarios;
            DROP TRIGGER IF EXISTS trigger_actualizar_puntos_totales ON tareas;
            DROP TRIGGER IF EXISTS trigger_actualizar_estado ON participacion_retos;
            DROP TRIGGER IF EXISTS trigger_tarea_completada ON tareas;

            -- Eliminar funciones
            DROP FUNCTION IF EXISTS otorgar_recompensa_generica();
            DROP FUNCTION IF EXISTS notificar_recompensa_obtenida();
            DROP FUNCTION IF EXISTS notificar_reto_completado();
            DROP FUNCTION IF EXISTS notificar_tarea_asignada();
            DROP FUNCTION IF EXISTS registrar_cambio_progreso();
            DROP FUNCTION IF EXISTS actualizar_calificacion_promedio();
            DROP FUNCTION IF EXISTS actualizar_participaciones_reto();
            DROP FUNCTION IF EXISTS finalizar_retos_vencidos();
            DROP FUNCTION IF EXISTS gestionar_puntaje_usuario();
            DROP FUNCTION IF EXISTS gestionar_logro_participacion();
            DROP FUNCTION IF EXISTS actualizar_fecha_modificacion();
            DROP FUNCTION IF EXISTS registrar_logro_usuario_nuevo();
            DROP FUNCTION IF EXISTS actualizar_puntos_totales();
            DROP FUNCTION IF EXISTS gestionar_estado_participacion();
            DROP FUNCTION IF EXISTS gestionar_tarea_completada();

            -- Eliminar índices personalizados
            DROP INDEX IF NOT EXISTS idx_tareas_reto_fecha;
            DROP INDEX IF NOT EXISTS idx_notificaciones_tipo;
            DROP INDEX IF NOT EXISTS idx_archivos_genericos_entidad;
            DROP INDEX IF NOT EXISTS idx_notificaciones_usuario;
            DROP INDEX IF NOT EXISTS idx_notificaciones_no_leidas;
            DROP INDEX IF NOT EXISTS idx_comentarios_entidad;
            DROP INDEX IF NOT EXISTS idx_comentarios_usuario;
            DROP INDEX IF NOT EXISTS idx_retos_creador;
            DROP INDEX IF NOT EXISTS idx_apuntes_usuario;
            DROP INDEX IF NOT EXISTS idx_planes_estudio_usuario;
            DROP INDEX IF NOT EXISTS idx_titulo_retos_text;
            DROP INDEX IF NOT EXISTS idx_reto_categorias_reto_categoria;
            DROP INDEX IF NOT EXISTS idx_participacion_usuario_reto;

            -- Eliminar triggers de validación adicionales
            DROP TRIGGER IF EXISTS trigger_sincronizar_tareas_completadas ON tarea_asignaciones;
            DROP TRIGGER IF EXISTS trigger_actualizar_fecha_estado ON retos;
            DROP TRIGGER IF EXISTS trigger_validar_entidad_id_archivos ON archivos_genericos;
            DROP TRIGGER IF EXISTS trigger_validar_entidad_id ON comentarios;
            
            -- Eliminar funciones de validación adicionales
            DROP FUNCTION IF EXISTS sincronizar_tareas_completadas();
            DROP FUNCTION IF EXISTS actualizar_fecha_estado_reto();
            DROP FUNCTION IF EXISTS validar_entidad_id();
        `);
    }
}
