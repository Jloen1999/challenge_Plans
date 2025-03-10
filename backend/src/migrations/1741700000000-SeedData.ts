import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1741700000000 implements MigrationInterface {
    name = 'SeedData1741700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insertar roles
        await queryRunner.query(`
            INSERT INTO roles (id, nombre, descripcion) VALUES
            (gen_random_uuid(), 'Administrador', 'Rol con todos los permisos'),
            (gen_random_uuid(), 'Moderador', 'Rol para moderar contenido'),
            (gen_random_uuid(), 'Estudiante', 'Rol para usuarios estudiantes'),
            (gen_random_uuid(), 'Profesor', 'Rol para usuarios profesores'),
            (gen_random_uuid(), 'Invitado', 'Rol para usuarios invitados')
            ON CONFLICT (nombre) DO NOTHING;
        `);

        // Insertar permisos detallados para el sistema
        await queryRunner.query(`
            -- Permisos de gestión de usuarios
            INSERT INTO permisos (id, nombre, descripcion)
            VALUES
            (gen_random_uuid(), 'crear_usuario', 'Puede crear nuevos usuarios en el sistema'),
            (gen_random_uuid(), 'editar_usuario', 'Puede modificar información de usuarios'),
            (gen_random_uuid(), 'eliminar_usuario', 'Puede eliminar usuarios del sistema'),
            (gen_random_uuid(), 'ver_usuarios', 'Puede ver la lista de usuarios'),
            (gen_random_uuid(), 'asignar_roles', 'Puede asignar roles a usuarios'),
            (gen_random_uuid(), 'gestionar_usuarios', 'Permite gestionar usuarios y restablecer contraseñas'),
            
            -- Permisos de gestión de retos
            (gen_random_uuid(), 'crear_reto', 'Puede crear nuevos retos'),
            (gen_random_uuid(), 'editar_reto', 'Puede modificar retos existentes'),
            (gen_random_uuid(), 'eliminar_reto', 'Puede eliminar retos'),
            (gen_random_uuid(), 'ver_retos', 'Puede ver todos los retos'),
            (gen_random_uuid(), 'ver_retos_publicos', 'Puede ver solo retos públicos'),
            (gen_random_uuid(), 'participar_reto', 'Puede unirse y participar en retos'),
            (gen_random_uuid(), 'finalizar_reto', 'Puede marcar retos como finalizados'),
            
            -- Permisos de gestión de planes de estudio
            (gen_random_uuid(), 'crear_plan', 'Puede crear planes de estudio'),
            (gen_random_uuid(), 'editar_plan', 'Puede modificar planes de estudio'),
            (gen_random_uuid(), 'eliminar_plan', 'Puede eliminar planes de estudio'),
            (gen_random_uuid(), 'ver_planes', 'Puede ver todos los planes de estudio'),
            (gen_random_uuid(), 'ver_planes_publicos', 'Puede ver solo planes públicos'),
            (gen_random_uuid(), 'asociar_reto_plan', 'Puede asociar retos a planes'),
            
            -- Permisos de gestión de tareas
            (gen_random_uuid(), 'crear_tarea', 'Puede crear tareas'),
            (gen_random_uuid(), 'editar_tarea', 'Puede modificar tareas'),
            (gen_random_uuid(), 'eliminar_tarea', 'Puede eliminar tareas'),
            (gen_random_uuid(), 'asignar_tarea', 'Puede asignar tareas a usuarios'),
            (gen_random_uuid(), 'completar_tarea', 'Puede marcar tareas como completadas'),
            (gen_random_uuid(), 'ver_tareas', 'Puede ver tareas asignadas'),
            
            -- Permisos de gestión de apuntes
            (gen_random_uuid(), 'subir_apunte', 'Puede subir apuntes'),
            (gen_random_uuid(), 'editar_apunte', 'Puede modificar apuntes propios'),
            (gen_random_uuid(), 'eliminar_apunte', 'Puede eliminar apuntes propios'),
            (gen_random_uuid(), 'ver_apuntes', 'Puede ver todos los apuntes'),
            (gen_random_uuid(), 'ver_apuntes_publicos', 'Puede ver solo apuntes públicos'),
            (gen_random_uuid(), 'calificar_apunte', 'Puede calificar apuntes'),
            
            -- Permisos de gestión de recompensas
            (gen_random_uuid(), 'crear_recompensa', 'Puede crear nuevas recompensas'),
            (gen_random_uuid(), 'asignar_recompensa', 'Puede asignar recompensas a usuarios'),
            (gen_random_uuid(), 'ver_recompensas', 'Puede ver recompensas disponibles'),
            
            -- Permisos de moderación
            (gen_random_uuid(), 'moderar_comentarios', 'Puede aprobar/rechazar comentarios'),
            (gen_random_uuid(), 'moderar_apuntes', 'Puede aprobar/rechazar apuntes'),
            (gen_random_uuid(), 'reportar_contenido', 'Puede reportar contenido inapropiado'),
            (gen_random_uuid(), 'bloquear_usuario', 'Puede bloquear usuarios temporalmente'),
            
            -- Permisos de acceso
            (gen_random_uuid(), 'acceso_total', 'Acceso completo al sistema'),
            (gen_random_uuid(), 'acceso_lectura', 'Acceso de solo lectura'),
            (gen_random_uuid(), 'acceso_escritura', 'Acceso de lectura y escritura')
            ON CONFLICT (nombre) DO NOTHING;
        `);

        // Asignación de permisos a roles usando subconsultas para obtener los IDs
        await queryRunner.query(`
            -- Asignar TODOS los permisos al rol Administrador
            INSERT INTO rol_permisos (rol_id, permiso_id)
            SELECT r.id, p.id
            FROM roles r, permisos p
            WHERE r.nombre = 'Administrador'
            ON CONFLICT DO NOTHING;

            -- Asignar permisos al rol Profesor
            INSERT INTO rol_permisos (rol_id, permiso_id)
            SELECT r.id, p.id
            FROM roles r, permisos p
            WHERE r.nombre = 'Profesor' AND p.nombre IN (
                'crear_reto', 'editar_reto', 'eliminar_reto', 'ver_retos', 'finalizar_reto',
                'crear_plan', 'editar_plan', 'eliminar_plan', 'ver_planes', 'asociar_reto_plan',
                'crear_tarea', 'editar_tarea', 'eliminar_tarea', 'asignar_tarea', 'ver_tareas', 'completar_tarea',
                'subir_apunte', 'editar_apunte', 'eliminar_apunte', 'ver_apuntes', 'calificar_apunte',
                'ver_usuarios', 'reportar_contenido',
                'acceso_lectura', 'acceso_escritura'
            )
            ON CONFLICT DO NOTHING;

            -- Asignar permisos al rol Estudiante
            INSERT INTO rol_permisos (rol_id, permiso_id)
            SELECT r.id, p.id
            FROM roles r, permisos p
            WHERE r.nombre = 'Estudiante' AND p.nombre IN (
                'ver_retos', 'participar_reto', 'ver_planes',
                'completar_tarea', 'ver_tareas',
                'subir_apunte', 'editar_apunte', 'eliminar_apunte', 'ver_apuntes', 'calificar_apunte',
                'reportar_contenido', 'ver_recompensas',
                'acceso_lectura', 'acceso_escritura'
            )
            ON CONFLICT DO NOTHING;

            -- Asignar permisos al rol Moderador
            INSERT INTO rol_permisos (rol_id, permiso_id)
            SELECT r.id, p.id
            FROM roles r, permisos p
            WHERE r.nombre = 'Moderador' AND p.nombre IN (
                'ver_usuarios', 'moderar_comentarios', 'moderar_apuntes',
                'reportar_contenido', 'bloquear_usuario',
                'ver_retos', 'ver_planes', 'ver_tareas', 'ver_apuntes',
                'acceso_lectura'
            )
            ON CONFLICT DO NOTHING;

            -- Asignar permisos al rol Invitado
            INSERT INTO rol_permisos (rol_id, permiso_id)
            SELECT r.id, p.id
            FROM roles r, permisos p
            WHERE r.nombre = 'Invitado' AND p.nombre IN (
                'ver_retos_publicos', 'ver_planes_publicos', 'ver_apuntes_publicos',
                'acceso_lectura'
            )
            ON CONFLICT DO NOTHING;
        `);

        // Insertar usuarios (5 usuarios con roles variados)
        await queryRunner.query(`
            INSERT INTO usuarios (id, email, hash_contraseña, nombre, puntaje, nivel) VALUES
            (gen_random_uuid(), 'admin@example.com', 'hash_admin123', 'Admin User', 1000, 10),
            (gen_random_uuid(), 'moderador@example.com', 'hash_mod456', 'Moderador User', 500, 5),
            (gen_random_uuid(), 'estudiante1@example.com', 'hash_est789', 'Estudiante Uno', 200, 2),
            (gen_random_uuid(), 'profesor@example.com', 'hash_prof012', 'Profesor User', 800, 8),
            (gen_random_uuid(), 'invitado@example.com', 'hash_inv345', 'Invitado User', 0, 1)
            ON CONFLICT (email) DO NOTHING;
        `);

        // Asignar roles a usuarios en usuario_roles
        await queryRunner.query(`
            INSERT INTO usuario_roles (usuario_id, rol_id, fecha_asignacion) VALUES
            ((SELECT id FROM usuarios WHERE email = 'admin@example.com'), (SELECT id FROM roles WHERE nombre = 'Administrador'), CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'moderador@example.com'), (SELECT id FROM roles WHERE nombre = 'Moderador'), CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), (SELECT id FROM roles WHERE nombre = 'Estudiante'), CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'profesor@example.com'), (SELECT id FROM roles WHERE nombre = 'Profesor'), CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'invitado@example.com'), (SELECT id FROM roles WHERE nombre = 'Invitado'), CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, rol_id) DO NOTHING;
        `);

        // Insertar categorías (múltiples categorías para retos y planes)
        await queryRunner.query(`
            INSERT INTO categorias (id, nombre, descripcion, icono) VALUES
            (gen_random_uuid(), 'Matemáticas', 'Retos y planes sobre matemáticas', 'math_icon'),
            (gen_random_uuid(), 'Programación', 'Retos y planes sobre programación', 'code_icon'),
            (gen_random_uuid(), 'Ciencias', 'Retos y planes sobre ciencias', 'science_icon')
            ON CONFLICT (nombre) DO NOTHING;
        `);

        // Insertar planes de estudio (3 planes vinculados a usuarios)
        await queryRunner.query(`
            INSERT INTO planes_estudio (id, usuario_id, titulo, descripcion, fecha_inicio, duracion_dias, es_publico) VALUES
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'Plan Matemáticas Básicas', 'Plan para aprender matemáticas', '2023-01-01', 30, TRUE),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), 'Plan Programación Avanzada', 'Plan para expertos en código', '2023-02-01', 60, FALSE),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'Plan Ciencias Naturales', 'Plan introductorio a ciencias', '2023-03-01', 45, TRUE)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Insertar retos (3 retos con tareas asociadas)
        await queryRunner.query(`
            INSERT INTO retos (id, creador_id, es_publico, estado, fecha_estado, plan_estudio_id, titulo, descripcion, fecha_inicio, fecha_fin, dificultad, puntos_totales, participaciones) VALUES
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), TRUE, 'activo', CURRENT_TIMESTAMP, (SELECT id FROM planes_estudio WHERE titulo = 'Plan Matemáticas Básicas'), 'Reto de Matemáticas', 'Resolver problemas matemáticos', '2023-01-15', '2023-02-15', 'intermedio', 100, 5),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), FALSE, 'borrador', CURRENT_TIMESTAMP, NULL, 'Reto de Programación', 'Crear un programa simple', '2023-03-01', '2023-04-01', 'avanzado', 200, 0),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'moderador@example.com'), TRUE, 'activo', CURRENT_TIMESTAMP, (SELECT id FROM planes_estudio WHERE titulo = 'Plan Ciencias Naturales'), 'Reto de Ciencias', 'Experimentos básicos', '2023-02-01', '2023-03-01', 'principiante', 50, 10)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Asignar categorías a retos en reto_categorias
        await queryRunner.query(`
            INSERT INTO reto_categorias (reto_id, categoria_id) VALUES
            ((SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), (SELECT id FROM categorias WHERE nombre = 'Matemáticas')),
            ((SELECT id FROM retos WHERE titulo = 'Reto de Programación'), (SELECT id FROM categorias WHERE nombre = 'Programación')),
            ((SELECT id FROM retos WHERE titulo = 'Reto de Ciencias'), (SELECT id FROM categorias WHERE nombre = 'Ciencias'))
            ON CONFLICT (reto_id, categoria_id) DO NOTHING;
        `);

        // Insertar tareas para los retos
        await queryRunner.query(`
            INSERT INTO tareas (id, reto_id, asignado_a, titulo, descripcion, puntos, fecha_limite, tipo, completado) VALUES
            (gen_random_uuid(), (SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'Resolver Ecuaciones', 'Resolver 10 ecuaciones', 20, '2023-01-20', 'ejercicio', FALSE),
            (gen_random_uuid(), (SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), NULL, 'Leer Teoría', 'Leer capítulo 1', 30, '2023-01-25', 'lectura', FALSE),
            (gen_random_uuid(), (SELECT id FROM retos WHERE titulo = 'Reto de Programación'), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'Programar Calculadora', 'Crear una calculadora básica', 50, '2023-03-10', 'proyecto', FALSE)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Insertar participaciones en retos
        await queryRunner.query(`
            INSERT INTO participacion_retos (usuario_id, reto_id, fecha_union, progreso, estado, fecha_completado) VALUES
            ((SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), (SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), CURRENT_TIMESTAMP, 50, 'activo', NULL),
            ((SELECT id FROM usuarios WHERE email = 'profesor@example.com'), (SELECT id FROM retos WHERE titulo = 'Reto de Ciencias'), CURRENT_TIMESTAMP, 100, 'completado', CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'moderador@example.com'), (SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), CURRENT_TIMESTAMP, 75, 'activo', NULL)
            ON CONFLICT (usuario_id, reto_id) DO NOTHING;
        `);

        // Insertar recompensas
        await queryRunner.query(`
            INSERT INTO recompensas (id, nombre, tipo, valor, criterio_obtencion) VALUES
            (gen_random_uuid(), 'Insignia de Participación', 'insignia', 1, 'Participar en un reto'),
            (gen_random_uuid(), 'Puntos por Completar Reto', 'puntos', 100, 'Completar un reto'),
            (gen_random_uuid(), 'Nivel Avanzado', 'nivel', 5, 'Alcanzar nivel 5')
            ON CONFLICT (nombre) DO NOTHING;
        `);

        // Asignar recompensas a usuarios
        await queryRunner.query(`
            INSERT INTO usuario_recompensas (usuario_id, recompensa_id, fecha_obtencion) VALUES
            ((SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), (SELECT id FROM recompensas WHERE nombre = 'Insignia de Participación'), CURRENT_TIMESTAMP),
            ((SELECT id FROM usuarios WHERE email = 'profesor@example.com'), (SELECT id FROM recompensas WHERE nombre = 'Puntos por Completar Reto'), CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, recompensa_id) DO NOTHING;
        `);

        // Insertar apuntes
        await queryRunner.query(`
            INSERT INTO apuntes (id, usuario_id, reto_id, plan_estudio_id, titulo, contenido, formato, es_publico) VALUES
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), (SELECT id FROM retos WHERE titulo = 'Reto de Matemáticas'), NULL, 'Notas Matemáticas', 'Ecuaciones básicas', 'pdf', TRUE),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), NULL, (SELECT id FROM planes_estudio WHERE titulo = 'Plan Programación Avanzada'), 'Guía de Código', 'Conceptos avanzados', 'md', FALSE)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Insertar calificaciones para apuntes
        await queryRunner.query(`
            INSERT INTO calificaciones_apuntes (apunte_id, usuario_id, calificacion, comentario, fecha_calificacion) VALUES
            ((SELECT id FROM apuntes WHERE titulo = 'Notas Matemáticas'), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), 4.5, 'Muy útil', CURRENT_TIMESTAMP),
            ((SELECT id FROM apuntes WHERE titulo = 'Guía de Código'), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 5.0, 'Excelente guía', CURRENT_TIMESTAMP)
            ON CONFLICT (apunte_id, usuario_id) DO NOTHING;
        `);

        // Insertar logros
        await queryRunner.query(`
            INSERT INTO logros (id, usuario_id, tipo, descripcion, fecha) VALUES
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'unirse_reto', 'Se unió al Reto de Matemáticas', CURRENT_TIMESTAMP),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), 'completar_reto', 'Completó el Reto de Ciencias', CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Insertar notificaciones
        await queryRunner.query(`
            INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, tipo, entidad, entidad_id, leida) VALUES
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'estudiante1@example.com'), 'Tarea Asignada', 'Tienes una nueva tarea en el Reto de Matemáticas', 'tarea_asignada', 'tarea', (SELECT id FROM tareas WHERE titulo = 'Resolver Ecuaciones'), FALSE),
            (gen_random_uuid(), (SELECT id FROM usuarios WHERE email = 'profesor@example.com'), 'Reto Completado', 'Has completado el Reto de Ciencias', 'reto_completado', 'reto', (SELECT id FROM retos WHERE titulo = 'Reto de Ciencias'), TRUE)
            ON CONFLICT (id) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar datos en orden inverso para respetar las dependencias
        await queryRunner.query(`DELETE FROM notificaciones;`);
        await queryRunner.query(`DELETE FROM logros;`);
        await queryRunner.query(`DELETE FROM calificaciones_apuntes;`);
        await queryRunner.query(`DELETE FROM apuntes;`);
        await queryRunner.query(`DELETE FROM usuario_recompensas;`);
        await queryRunner.query(`DELETE FROM recompensas;`);
        await queryRunner.query(`DELETE FROM participacion_retos;`);
        await queryRunner.query(`DELETE FROM tareas;`);
        await queryRunner.query(`DELETE FROM reto_categorias;`);
        await queryRunner.query(`DELETE FROM retos;`);
        await queryRunner.query(`DELETE FROM planes_estudio;`);
        await queryRunner.query(`DELETE FROM categorias;`);
        await queryRunner.query(`DELETE FROM usuario_roles;`);
        await queryRunner.query(`DELETE FROM usuarios;`);
        await queryRunner.query(`DELETE FROM roles;`);
    }
}