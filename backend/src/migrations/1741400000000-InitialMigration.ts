import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1741400000000 implements MigrationInterface {
    name = 'InitialMigration1741400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuario_roles" ("usuario_id" uuid NOT NULL, "rol_id" uuid NOT NULL, "fecha_asignacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_43e0c343408b4c5c79be51e7202" PRIMARY KEY ("usuario_id", "rol_id"))`);
        await queryRunner.query(`CREATE TABLE "tarea_asignaciones" ("tarea_id" uuid NOT NULL, "usuario_id" uuid NOT NULL, "fecha_asignacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rol_asignacion" character varying NOT NULL DEFAULT 'responsable', CONSTRAINT "PK_7a9d22abe3d0d819e52c0930bee" PRIMARY KEY ("tarea_id", "usuario_id"))`);
        await queryRunner.query(`CREATE TABLE "tareas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reto_id" uuid NOT NULL, "asignado_a" uuid, "titulo" character varying NOT NULL, "descripcion" character varying, "puntos" integer NOT NULL, "fecha_limite" date, "tipo" character varying, "completado" boolean NOT NULL DEFAULT false, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9370ac1b0569cacf8cda6815c97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, "icono" character varying(50), CONSTRAINT "UQ_ccdf6cd1a34ea90a7233325063d" UNIQUE ("nombre"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reto_categorias" ("reto_id" uuid NOT NULL, "categoria_id" uuid NOT NULL, CONSTRAINT "PK_4e2c38cf13e2be373b0f9459f6b" PRIMARY KEY ("reto_id", "categoria_id"))`);
        await queryRunner.query(`CREATE TABLE "participacion_retos" ("usuario_id" uuid NOT NULL, "reto_id" uuid NOT NULL, "fecha_union" TIMESTAMP NOT NULL DEFAULT now(), "progreso" integer NOT NULL DEFAULT '0', "estado" character varying NOT NULL DEFAULT 'activo', "fecha_completado" TIMESTAMP, CONSTRAINT "PK_044afad0015b59d4e1dd47a62d0" PRIMARY KEY ("usuario_id", "reto_id"))`);
        await queryRunner.query(`CREATE TABLE "retos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creador_id" uuid NOT NULL, "es_publico" boolean NOT NULL DEFAULT false, "estado" character varying NOT NULL DEFAULT 'borrador', "fecha_estado" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "plan_estudio_id" uuid, "titulo" character varying NOT NULL, "descripcion" character varying, "fecha_inicio" date NOT NULL, "fecha_fin" date NOT NULL, "dificultad" character varying, "puntos_totales" integer NOT NULL DEFAULT '0', "participaciones" integer NOT NULL DEFAULT '0', "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_89e1ba0b7b8bd04fe7c4a1f6da3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reto_planes_estudio" ("reto_id" uuid NOT NULL, "plan_estudio_id" uuid NOT NULL, "fecha_asociacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5f30b260e4d4b506d25ac4a42a9" PRIMARY KEY ("reto_id", "plan_estudio_id"))`);
        await queryRunner.query(`CREATE TABLE "planes_estudio" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "titulo" character varying NOT NULL, "descripcion" character varying, "fecha_inicio" date NOT NULL DEFAULT ('now'::text)::date, "duracion_dias" integer, "es_publico" boolean NOT NULL DEFAULT false, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e65a81a94c8ad09cd05b38374d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "apuntes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "reto_id" uuid, "plan_estudio_id" uuid, "titulo" character varying NOT NULL, "contenido" character varying, "formato" character varying, "fecha_subida" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "calificacion_promedio" numeric(3,2) NOT NULL DEFAULT '0', "es_publico" boolean NOT NULL DEFAULT false, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0cbd585c64325e743ec072f8896" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "logros" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "tipo" character varying NOT NULL, "descripcion" character varying, "fecha" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd52f5cf67c45f813a1508f663b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "hash_contraseña" character varying NOT NULL, "nombre" character varying NOT NULL, "fecha_registro" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "puntaje" integer NOT NULL DEFAULT '0', "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "nivel" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tareas_completadas" ("usuario_id" uuid NOT NULL, "tarea_id" uuid NOT NULL, "fecha_completado" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "progreso" integer NOT NULL DEFAULT '100', "comentario" character varying, CONSTRAINT "PK_85a80919f27db0fdbb1e65eeab7" PRIMARY KEY ("usuario_id", "tarea_id"))`);
        await queryRunner.query(`CREATE TABLE "archivos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apunte_id" uuid, "url" character varying NOT NULL, "formato" character varying, "fecha_subida" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5609463cf53fb524304c926ad2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "calificaciones_apuntes" ("apunte_id" uuid NOT NULL, "usuario_id" uuid NOT NULL, "calificacion" numeric(3,2) NOT NULL, "comentario" character varying, "fecha_calificacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_532042108e627177f08da5bcc7a" PRIMARY KEY ("apunte_id", "usuario_id"))`);
        await queryRunner.query(`CREATE TABLE "recompensas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "tipo" character varying, "valor" integer NOT NULL, "criterio_obtencion" character varying NOT NULL, CONSTRAINT "UQ_0a7833754cfce18bba192ac21b4" UNIQUE ("nombre"), CONSTRAINT "PK_18c169430611e9359267e58f2bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuario_recompensas" ("usuario_id" uuid NOT NULL, "recompensa_id" uuid NOT NULL, "fecha_obtencion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e8544d4cddde63b9ab1fee43a0" PRIMARY KEY ("usuario_id", "recompensa_id"))`);
        await queryRunner.query(`CREATE TABLE "notificaciones_lecturas" ("notificacion_id" uuid NOT NULL, "usuario_id" uuid NOT NULL, "fecha_lectura" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_954332e87ee4323ec1faaeecc60" PRIMARY KEY ("notificacion_id", "usuario_id"))`);
        await queryRunner.query(`CREATE TABLE "notificaciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "titulo" character varying NOT NULL, "mensaje" character varying NOT NULL, "tipo" character varying NOT NULL, "entidad" character varying, "entidad_id" uuid, "leida" boolean NOT NULL DEFAULT false, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_lectura" TIMESTAMP WITH TIME ZONE, "es_grupal" boolean NOT NULL DEFAULT false, "grupo_id" uuid, CONSTRAINT "CHK_2bf540baf146ce22e5bd3231e0" CHECK (tipo IN ('tarea_asignada', 'reto_completado', 'recompensa_obtenida', 'sistema')), CONSTRAINT "CHK_0dee350df62597682f783043b6" CHECK (entidad IN ('reto', 'tarea', 'apunte', 'plan_estudio', 'recompensa', 'logro', 'sistema')), CONSTRAINT "PK_a9d32a419ff58b53a38b5ef85d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permisos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, CONSTRAINT "UQ_0fea7aa2110562d76c2bc927eae" UNIQUE ("nombre"), CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rol_permisos" ("rol_id" uuid NOT NULL, "permiso_id" uuid NOT NULL, CONSTRAINT "PK_d0cf98bfca05b7f290ea73bd734" PRIMARY KEY ("rol_id", "permiso_id"))`);
        await queryRunner.query(`CREATE TABLE "historial_progreso" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "reto_id" uuid NOT NULL, "progreso_anterior" integer NOT NULL, "progreso_nuevo" integer NOT NULL, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "evento" character varying(50) NOT NULL, CONSTRAINT "PK_c12d2adee8ad75b75e763ee6e9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comentarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "entidad" character varying(30) NOT NULL, "entidad_id" uuid NOT NULL, "contenido" text NOT NULL, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_modificacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "comentario_padre_id" uuid, CONSTRAINT "PK_b60b1468bb275db8d5e875c4a78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "archivos_genericos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entidad" character varying NOT NULL, "entidad_id" uuid NOT NULL, "nombre" character varying NOT NULL, "url" character varying NOT NULL, "formato" character varying NOT NULL, "tamaño_bytes" integer, "fecha_subida" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "subido_por" uuid, CONSTRAINT "CHK_0a7a872fe427047f1e0952b613" CHECK (entidad IN ('apunte', 'tarea', 'reto', 'plan_estudio', 'comentario')), CONSTRAINT "PK_c60335cad77cfed78e465b33e8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reglas_recompensas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "evento" character varying NOT NULL, "condicion" character varying, "recompensa_id" uuid NOT NULL, "puntos" integer, "activa" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8a2d6e298d3d72f723b139754d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auditoria" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid, "accion" character varying(50) NOT NULL, "tabla" character varying(50) NOT NULL, "registro_id" uuid NOT NULL, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "detalles" jsonb, CONSTRAINT "PK_135fe98308816fe3a2d458e6637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" DROP COLUMN "fecha_asociacion"`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" ADD "fecha_asociacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_b7f9fa6bffdd2a8d7d1fa0e572" ON "reto_planes_estudio" ("reto_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae07b2bbd9d32888ff5b5152d0" ON "reto_planes_estudio" ("plan_estudio_id") `);
        await queryRunner.query(`ALTER TABLE "tarea_asignaciones" ADD CONSTRAINT "FK_eda58a2040cdf6a752e43cdbb80" FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tarea_asignaciones" ADD CONSTRAINT "FK_1fb70ab81fa0ed1598790725f0a" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_51bc4a7baaf9c411236f7239f78" FOREIGN KEY ("reto_id") REFERENCES "retos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_61509a58db3d416cf447cfc10e2" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reto_categorias" ADD CONSTRAINT "FK_21449feeca391fa56f53a09bfcc" FOREIGN KEY ("reto_id") REFERENCES "retos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reto_categorias" ADD CONSTRAINT "FK_f59d5b4ed9f9825209dac2e0a8e" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" ADD CONSTRAINT "FK_b7f9fa6bffdd2a8d7d1fa0e5725" FOREIGN KEY ("reto_id") REFERENCES "retos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" ADD CONSTRAINT "FK_ae07b2bbd9d32888ff5b5152d00" FOREIGN KEY ("plan_estudio_id") REFERENCES "planes_estudio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "planes_estudio" ADD CONSTRAINT "FK_5bc676794f0e738e8ed2162779e" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas_completadas" ADD CONSTRAINT "FK_40e5e48263cc8ac9d6f0a3ffaa1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas_completadas" ADD CONSTRAINT "FK_8b12556932665b3ec66e7c0a59f" FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificaciones_lecturas" ADD CONSTRAINT "FK_bd586d950a3284f78018bd7701f" FOREIGN KEY ("notificacion_id") REFERENCES "notificaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificaciones_lecturas" ADD CONSTRAINT "FK_7cd304d0a47fac5536a776843e0" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificaciones" ADD CONSTRAINT "FK_2c6341d5bd206ff522b35aa6b69" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historial_progreso" ADD CONSTRAINT "FK_e451c0f0b4a270502f3a4054476" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historial_progreso" ADD CONSTRAINT "FK_264688b7a0ea3310862b2c592e0" FOREIGN KEY ("reto_id") REFERENCES "retos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_1281c1e3cb210b0b3d6d09ab2e7" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_4c60f13a000e00c927064871875" FOREIGN KEY ("comentario_padre_id") REFERENCES "comentarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_e3351946be53c7cd3286ed4c49d" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_e3351946be53c7cd3286ed4c49d"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_4c60f13a000e00c927064871875"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_1281c1e3cb210b0b3d6d09ab2e7"`);
        await queryRunner.query(`ALTER TABLE "historial_progreso" DROP CONSTRAINT "FK_264688b7a0ea3310862b2c592e0"`);
        await queryRunner.query(`ALTER TABLE "historial_progreso" DROP CONSTRAINT "FK_e451c0f0b4a270502f3a4054476"`);
        await queryRunner.query(`ALTER TABLE "notificaciones" DROP CONSTRAINT "FK_2c6341d5bd206ff522b35aa6b69"`);
        await queryRunner.query(`ALTER TABLE "notificaciones_lecturas" DROP CONSTRAINT "FK_7cd304d0a47fac5536a776843e0"`);
        await queryRunner.query(`ALTER TABLE "notificaciones_lecturas" DROP CONSTRAINT "FK_bd586d950a3284f78018bd7701f"`);
        await queryRunner.query(`ALTER TABLE "tareas_completadas" DROP CONSTRAINT "FK_8b12556932665b3ec66e7c0a59f"`);
        await queryRunner.query(`ALTER TABLE "tareas_completadas" DROP CONSTRAINT "FK_40e5e48263cc8ac9d6f0a3ffaa1"`);
        await queryRunner.query(`ALTER TABLE "planes_estudio" DROP CONSTRAINT "FK_5bc676794f0e738e8ed2162779e"`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" DROP CONSTRAINT "FK_ae07b2bbd9d32888ff5b5152d00"`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" DROP CONSTRAINT "FK_b7f9fa6bffdd2a8d7d1fa0e5725"`);
        await queryRunner.query(`ALTER TABLE "reto_categorias" DROP CONSTRAINT "FK_f59d5b4ed9f9825209dac2e0a8e"`);
        await queryRunner.query(`ALTER TABLE "reto_categorias" DROP CONSTRAINT "FK_21449feeca391fa56f53a09bfcc"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_61509a58db3d416cf447cfc10e2"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_51bc4a7baaf9c411236f7239f78"`);
        await queryRunner.query(`ALTER TABLE "tarea_asignaciones" DROP CONSTRAINT "FK_1fb70ab81fa0ed1598790725f0a"`);
        await queryRunner.query(`ALTER TABLE "tarea_asignaciones" DROP CONSTRAINT "FK_eda58a2040cdf6a752e43cdbb80"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae07b2bbd9d32888ff5b5152d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7f9fa6bffdd2a8d7d1fa0e572"`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" DROP COLUMN "fecha_asociacion"`);
        await queryRunner.query(`ALTER TABLE "reto_planes_estudio" ADD "fecha_asociacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP TABLE "reglas_recompensas"`);
        await queryRunner.query(`DROP TABLE "archivos_genericos"`);
        await queryRunner.query(`DROP TABLE "comentarios"`);
        await queryRunner.query(`DROP TABLE "historial_progreso"`);
        await queryRunner.query(`DROP TABLE "rol_permisos"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "notificaciones"`);
        await queryRunner.query(`DROP TABLE "notificaciones_lecturas"`);
        await queryRunner.query(`DROP TABLE "usuario_recompensas"`);
        await queryRunner.query(`DROP TABLE "recompensas"`);
        await queryRunner.query(`DROP TABLE "calificaciones_apuntes"`);
        await queryRunner.query(`DROP TABLE "archivos"`);
        await queryRunner.query(`DROP TABLE "tareas_completadas"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "logros"`);
        await queryRunner.query(`DROP TABLE "apuntes"`);
        await queryRunner.query(`DROP TABLE "planes_estudio"`);
        await queryRunner.query(`DROP TABLE "reto_planes_estudio"`);
        await queryRunner.query(`DROP TABLE "retos"`);
        await queryRunner.query(`DROP TABLE "participacion_retos"`);
        await queryRunner.query(`DROP TABLE "reto_categorias"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
        await queryRunner.query(`DROP TABLE "tareas"`);
        await queryRunner.query(`DROP TABLE "tarea_asignaciones"`);
        await queryRunner.query(`DROP TABLE "usuario_roles"`);
    }

}
