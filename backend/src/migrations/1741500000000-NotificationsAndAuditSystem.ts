import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationsAndAuditSystem1741500000000 implements MigrationInterface {
    name = 'NotificationsAndAuditSystem1741500000000';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Función para limpiar notificaciones antiguas
            CREATE OR REPLACE FUNCTION limpiar_notificaciones_antiguas()
            RETURNS VOID AS $$
            BEGIN
                DELETE FROM notificaciones WHERE fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '30 days' AND leida = TRUE;
            END;
            $$ LANGUAGE plpgsql;
            
            -- Índice para optimizar búsquedas en la tabla de auditoría
            CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
            CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);
            CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha);
            
            -- Función genérica para auditoría
            CREATE OR REPLACE FUNCTION registrar_auditoria()
            RETURNS TRIGGER AS $$
            DECLARE
                usuario_actual UUID;
                detalles_json JSONB;
            BEGIN
                -- Intentar obtener el ID del usuario desde el contexto de la aplicación
                -- En un entorno real, esto se pasaría como una variable de sesión
                -- Por ahora, usamos NULL (se implementará a nivel de aplicación)
                usuario_actual := NULL;
                
                IF (TG_OP = 'DELETE') THEN
                    detalles_json := to_jsonb(OLD);
                    INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, detalles)
                    VALUES (usuario_actual, TG_OP, TG_TABLE_NAME, OLD.id, detalles_json);
                    RETURN OLD;
                ELSE
                    detalles_json := to_jsonb(NEW);
                    INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, detalles)
                    VALUES (usuario_actual, TG_OP, TG_TABLE_NAME, NEW.id, detalles_json);
                    RETURN NEW;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
            
            -- Trigger de auditoría para tabla retos (como ejemplo)
            DROP TRIGGER IF EXISTS audit_retos_trigger ON retos;
            CREATE TRIGGER audit_retos_trigger
            AFTER INSERT OR UPDATE OR DELETE ON retos
            FOR EACH ROW
            EXECUTE FUNCTION registrar_auditoria();
            
            -- Trigger de auditoría para tabla usuarios
            DROP TRIGGER IF EXISTS audit_usuarios_trigger ON usuarios;
            CREATE TRIGGER audit_usuarios_trigger
            AFTER UPDATE OR DELETE ON usuarios
            FOR EACH ROW
            EXECUTE FUNCTION registrar_auditoria();
            
            -- Función para programar una limpieza periódica de notificaciones
            -- (Esta será llamada por un job programado)
            CREATE OR REPLACE FUNCTION programar_limpieza_notificaciones()
            RETURNS VOID AS $$
            BEGIN
                PERFORM limpiar_notificaciones_antiguas();
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Eliminar triggers de auditoría
            DROP TRIGGER IF EXISTS audit_retos_trigger ON retos;
            DROP TRIGGER IF EXISTS audit_usuarios_trigger ON usuarios;
            
            -- Eliminar funciones
            DROP FUNCTION IF EXISTS registrar_auditoria();
            DROP FUNCTION IF EXISTS limpiar_notificaciones_antiguas();
            DROP FUNCTION IF EXISTS programar_limpieza_notificaciones();
            
            -- Eliminar índices
            DROP INDEX IF EXISTS idx_auditoria_usuario;
            DROP INDEX IF EXISTS idx_auditoria_tabla;
            DROP INDEX IF EXISTS idx_auditoria_fecha;
            
            -- Eliminar tabla de auditoría
            DROP TABLE IF EXISTS auditoria;
        `);
    }
}
