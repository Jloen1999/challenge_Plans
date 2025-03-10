import { MigrationInterface, QueryRunner } from "typeorm";

export class DropDatabase1741600000000 implements MigrationInterface {
    name = 'DropDatabase1741600000000';
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Guardar las extensiones instaladas antes de eliminar el esquema
        await queryRunner.query(`
            CREATE TEMPORARY TABLE IF NOT EXISTS temp_extensions AS
            SELECT extname FROM pg_extension WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
        `);
        
        // Eliminar todo el esquema de una sola vez
        await queryRunner.query(`DROP SCHEMA public CASCADE;`);
        
        // Recrear el esquema
        await queryRunner.query(`CREATE SCHEMA public;`);
        
        // Restaurar permisos básicos
        await queryRunner.query(`GRANT ALL ON SCHEMA public TO postgres;`);
        await queryRunner.query(`GRANT ALL ON SCHEMA public TO PUBLIC;`);
        
        // Reinstalar extensiones que estaban presentes (si es necesario)
        await queryRunner.query(`
            DO $$
            DECLARE
                ext_name text;
            BEGIN
                FOR ext_name IN (SELECT extname FROM temp_extensions)
                LOOP
                    BEGIN
                        EXECUTE 'CREATE EXTENSION IF NOT EXISTS ' || ext_name;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'No se pudo reinstalar la extensión %: %', ext_name, SQLERRM;
                    END;
                END LOOP;
                
                -- Mensaje de notificación (movido dentro del bloque DO para evitar error)
                RAISE NOTICE 'La base de datos ha sido completamente reiniciada. Ejecute las migraciones para recrearla.';
            END $$;
            
            DROP TABLE IF EXISTS temp_extensions;
        `);
        
        // Mensaje informativo en consola (no en la base de datos)
        console.log('✅ La base de datos ha sido completamente reiniciada');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No podemos restaurar la base de datos fácilmente después de eliminarla
        await queryRunner.query(`
            DO $$
            BEGIN
                RAISE EXCEPTION 'Esta operación no se puede revertir automáticamente. Ejecute todas las migraciones para recrear la base de datos.';
            END $$;
        `);
    }
}
