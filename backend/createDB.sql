-- Primero eliminar la vista
DROP VIEW IF EXISTS vista_progreso_reto;
-- Eliminar índices (algunos sistemas los eliminan automáticamente con las tablas)
DROP INDEX IF EXISTS idx_titulo_retos_text;
DROP INDEX IF EXISTS idx_participacion_retos_reto_id;
DROP INDEX IF EXISTS idx_participacion_retos_usuario_id;
DROP INDEX IF EXISTS idx_apuntes_fecha_subida;
DROP INDEX IF EXISTS idx_apuntes_titulo;
DROP INDEX IF EXISTS idx_tareas_fecha_limite;
DROP INDEX IF EXISTS idx_tareas_reto_id;
DROP INDEX IF EXISTS idx_retos_estado;
DROP INDEX IF EXISTS idx_retos_titulo;
DROP INDEX IF EXISTS idx_usuarios_email;
-- Eliminar tablas en orden inverso a las dependencias
DROP TABLE IF EXISTS logros;
DROP TABLE IF EXISTS usuario_recompensas;
DROP TABLE IF EXISTS recompensas;
DROP TABLE IF EXISTS apuntes;
DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS participacion_retos;
DROP TABLE IF EXISTS reto_categorias;
DROP TABLE IF EXISTS retos;
DROP TABLE IF EXISTS planes_estudio;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
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
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de Retos
CREATE TABLE IF NOT EXISTS retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado')),
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
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado')),
    documento_url VARCHAR(350) DEFAULT 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/sign/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHVudGVzL2RjOTg1YzUwLTEyZDgtNGUzYi04OGExLTE1OTg5NjgwODkwMy9jcC5wZGYiLCJpYXQiOjE3NDA5MzUzNDYsImV4cCI6MTc3MjQ3MTM0Nn0.W7xIp6wlVwoSuAPNv0PfwnI0evY4Lr-bLQwGc5zAnvE',
    reto_id UUID REFERENCES retos(id) ON DELETE
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
-- INSERTS DE PRUEBA
-- Usuarios
INSERT INTO usuarios (email, hash_contraseña, nombre, puntaje)
VALUES (
        'juan.perez@example.com',
        'hash123',
        'Juan Pérez',
        100
    ),
    (
        'maria.garcia@example.com',
        'hash456',
        'María García',
        150
    ),
    (
        'carlos.lopez@example.com',
        'hash789',
        'Carlos López',
        200
    ),
    (
        'ana.martinez@example.com',
        'hashabc',
        'Ana Martínez',
        50
    ),
    (
        'luis.rodriguez@example.com',
        'hashdef',
        'Luis Rodríguez',
        300
    ),
    (
        'laura.fernandez@example.com',
        'hashghi',
        'Laura Fernández',
        250
    ),
    (
        'pedro.sanchez@example.com',
        'hashjkl',
        'Pedro Sánchez',
        180
    ),
    (
        'sofia.gomez@example.com',
        'hashmno',
        'Sofía Gómez',
        220
    ),
    (
        'javier.diaz@example.com',
        'hashpqr',
        'Javier Díaz',
        90
    ),
    (
        'elena.ruiz@example.com',
        'hashstu',
        'Elena Ruiz',
        130
    );
-- Categorías
INSERT INTO categorias (nombre)
VALUES ('Matemáticas'),
    ('Ciencias'),
    ('Historia'),
    ('Literatura'),
    ('Programación'),
    ('Idiomas'),
    ('Arte'),
    ('Deportes'),
    ('Música'),
    ('Tecnología');
-- Planes de Estudio
INSERT INTO planes_estudio (
        usuario_id,
        titulo,
        descripcion,
        duracion_dias,
        visibilidad
    )
VALUES (
        'uuid_de_juan',
        'Plan de Matemáticas Avanzadas',
        'Estudio intensivo de cálculo y álgebra',
        30,
        'publico'
    ),
    (
        'uuid_de_maria',
        'Plan de Historia Universal',
        'Revisión de eventos históricos clave',
        45,
        'publico'
    ),
    (
        'uuid_de_carlos',
        'Plan de Programación en Python',
        'Aprendizaje de Python desde cero',
        60,
        'publico'
    ),
    (
        'uuid_de_ana',
        'Plan de Literatura Clásica',
        'Lectura y análisis de obras clásicas',
        20,
        'publico'
    ),
    (
        'uuid_de_luis',
        'Plan de Ciencias Naturales',
        'Estudio de biología, física y química',
        40,
        'publico'
    ),
    (
        'uuid_de_laura',
        'Plan de Idiomas',
        'Mejora de inglés y francés',
        50,
        'publico'
    ),
    (
        'uuid_de_pedro',
        'Plan de Arte Contemporáneo',
        'Exploración de arte moderno',
        25,
        'publico'
    ),
    (
        'uuid_de_sofia',
        'Plan de Deportes',
        'Entrenamiento físico y teoría',
        35,
        'publico'
    ),
    (
        'uuid_de_javier',
        'Plan de Música',
        'Teoría musical y práctica instrumental',
        30,
        'publico'
    ),
    (
        'uuid_de_elena',
        'Plan de Tecnología',
        'Introducción a nuevas tecnologías',
        15,
        'privado'
    );
-- Retos
INSERT INTO retos (
        creador_id,
        visibilidad,
        plan_estudio_id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        dificultad
    )
VALUES (
        'uuid_de_juan',
        'publico',
        'uuid_plan_matematicas',
        'Reto de Cálculo Diferencial',
        'Resolver problemas de derivadas',
        '2023-10-01',
        '2023-10-15',
        'activo',
        'intermedio'
    ),
    (
        'uuid_de_maria',
        'publico',
        NULL,
        'Reto de Historia Antigua',
        'Investigar sobre el Imperio Romano',
        '2023-09-15',
        '2023-10-15',
        'activo',
        'principiante'
    ),
    (
        'uuid_de_carlos',
        'publico',
        'uuid_plan_programacion',
        'Reto de Python: Funciones',
        'Crear funciones en Python',
        '2023-10-05',
        '2023-10-20',
        'activo',
        'principiante'
    ),
    (
        'uuid_de_ana',
        'publico',
        NULL,
        'Reto de Literatura: Shakespeare',
        'Analizar obras de Shakespeare',
        '2023-10-10',
        '2023-11-10',
        'activo',
        'avanzado'
    ),
    (
        'uuid_de_luis',
        'privado',
        'uuid_plan_ciencias',
        'Reto de Biología: Ecosistemas',
        'Estudiar ecosistemas locales',
        '2023-09-20',
        '2023-10-20',
        'activo',
        'intermedio'
    ),
    (
        'uuid_de_laura',
        'privado',
        NULL,
        'Reto de Inglés: Conversación',
        'Practicar conversaciones en inglés',
        '2023-10-01',
        '2023-10-31',
        'activo',
        'principiante'
    ),
    (
        'uuid_de_pedro',
        'privado',
        'uuid_plan_arte',
        'Reto de Pintura Moderna',
        'Crear una obra inspirada en Picasso',
        '2023-10-15',
        '2023-11-15',
        'activo',
        'avanzado'
    ),
    (
        'uuid_de_sofia',
        'privado',
        NULL,
        'Reto de Deportes: Maratón',
        'Prepararse para correr una maratón',
        '2023-09-01',
        '2023-12-01',
        'activo',
        'intermedio'
    ),
    (
        'uuid_de_javier',
        'privado',
        'uuid_plan_musica',
        'Reto de Piano: Escalas',
        'Practicar escalas mayores y menores',
        '2023-10-05',
        '2023-10-25',
        'activo',
        'principiante'
    ),
    (
        'uuid_de_elena',
        'privado',
        NULL,
        'Reto de Tecnología: IA',
        'Introducción a la inteligencia artificial',
        '2023-10-10',
        '2023-11-10',
        'activo',
        'avanzado'
    );
-- Relación Reto-Categorías
INSERT INTO reto_categorias (reto_id, categoria_id)
VALUES (
        'uuid_reto_calculo',
        'uuid_categoria_matematicas'
    ),
    ('uuid_reto_historia', 'uuid_categoria_historia'),
    (
        'uuid_reto_python',
        'uuid_categoria_programacion'
    ),
    (
        'uuid_reto_literatura',
        'uuid_categoria_literatura'
    ),
    ('uuid_reto_biologia', 'uuid_categoria_ciencias'),
    ('uuid_reto_ingles', 'uuid_categoria_idiomas'),
    ('uuid_reto_pintura', 'uuid_categoria_arte'),
    ('uuid_reto_maraton', 'uuid_categoria_deportes'),
    ('uuid_reto_piano', 'uuid_categoria_musica'),
    ('uuid_reto_ia', 'uuid_categoria_tecnologia');
-- Participación en Retos
INSERT INTO participacion_retos (usuario_id, reto_id, progreso)
VALUES ('uuid_de_maria', 'uuid_reto_calculo', 50),
    ('uuid_de_carlos', 'uuid_reto_historia', 20),
    ('uuid_de_ana', 'uuid_reto_python', 80),
    ('uuid_de_luis', 'uuid_reto_literatura', 30),
    ('uuid_de_laura', 'uuid_reto_biologia', 60),
    ('uuid_de_pedro', 'uuid_reto_ingles', 40),
    ('uuid_de_sofia', 'uuid_reto_pintura', 70),
    ('uuid_de_javier', 'uuid_reto_maraton', 10),
    ('uuid_de_elena', 'uuid_reto_piano', 90),
    ('uuid_de_juan', 'uuid_reto_ia', 25);
-- Tareas
INSERT INTO tareas (
        reto_id,
        asignado_a,
        titulo,
        descripcion,
        puntos,
        fecha_limite,
        tipo
    )
VALUES (
        'uuid_reto_calculo',
        NULL,
        'Resolver derivadas',
        'Resolver 10 problemas de derivadas',
        50,
        '2023-10-10',
        'ejercicio'
    ),
    (
        'uuid_reto_historia',
        'uuid_de_maria',
        'Investigar sobre Roma',
        'Escribir un ensayo sobre el Imperio Romano',
        100,
        '2023-10-05',
        'proyecto'
    ),
    (
        'uuid_reto_python',
        NULL,
        'Crear función suma',
        'Escribir una función que sume dos números',
        20,
        '2023-10-15',
        'ejercicio'
    ),
    (
        'uuid_reto_literatura',
        'uuid_de_ana',
        'Análisis de Hamlet',
        'Analizar el personaje de Hamlet',
        80,
        '2023-10-20',
        'lectura'
    ),
    (
        'uuid_reto_biologia',
        NULL,
        'Estudio de ecosistemas',
        'Visitar un ecosistema local y tomar notas',
        60,
        '2023-10-10',
        'proyecto'
    ),
    (
        'uuid_reto_ingles',
        'uuid_de_laura',
        'Práctica de conversación',
        'Grabar una conversación en inglés',
        30,
        '2023-10-25',
        'ejercicio'
    ),
    (
        'uuid_reto_pintura',
        NULL,
        'Crear obra inspirada en Picasso',
        'Pintar un cuadro al estilo cubista',
        100,
        '2023-11-01',
        'proyecto'
    ),
    (
        'uuid_reto_maraton',
        'uuid_de_sofia',
        'Correr 5 km',
        'Completar una carrera de 5 km',
        50,
        '2023-09-15',
        'ejercicio'
    ),
    (
        'uuid_reto_piano',
        NULL,
        'Practicar escalas mayores',
        'Tocar escalas mayores en el piano',
        40,
        '2023-10-15',
        'ejercicio'
    ),
    (
        'uuid_reto_ia',
        'uuid_de_elena',
        'Introducción a IA',
        'Leer un artículo sobre IA y resumirlo',
        70,
        '2023-10-20',
        'lectura'
    );
-- Apuntes
INSERT INTO apuntes (
        usuario_id,
        reto_id,
        plan_estudio_id,
        titulo,
        contenido,
        formato,
        calificacion_promedio,
        visibilidad
    )
VALUES (
        'uuid_de_juan',
        'uuid_reto_calculo',
        NULL,
        'Apuntes de Derivadas',
        'Contenido sobre derivadas...',
        'pdf',
        4.5,
        'publico'
    ),
    (
        'uuid_de_maria',
        NULL,
        'uuid_plan_historia',
        'Resumen de Historia Antigua',
        'Resumen de eventos históricos...',
        'md',
        3.8,
        'publico'
    ),
    (
        'uuid_de_carlos',
        'uuid_reto_python',
        NULL,
        'Guía de Funciones en Python',
        'Explicación de funciones...',
        'docx',
        4.2,
        'publico'
    ),
    (
        'uuid_de_ana',
        NULL,
        'uuid_plan_literatura',
        'Análisis de Obras Clásicas',
        'Análisis detallado de Hamlet...',
        'pdf',
        4.7,
        'privado'
    ),
    (
        'uuid_de_luis',
        'uuid_reto_biologia',
        NULL,
        'Notas de Ecosistemas',
        'Observaciones de campo...',
        'md',
        3.5,
        'privado'
    ),
    (
        'uuid_de_laura',
        NULL,
        'uuid_plan_idiomas',
        'Vocabulario de Inglés',
        'Lista de palabras y frases...',
        'docx',
        4.0,
        'privado'
    ),
    (
        'uuid_de_pedro',
        'uuid_reto_pintura',
        NULL,
        'Técnicas de Pintura Moderna',
        'Descripción de técnicas...',
        'pdf',
        4.3,
        'privado'
    ),
    (
        'uuid_de_sofia',
        NULL,
        'uuid_plan_deportes',
        'Plan de Entrenamiento',
        'Rutina de ejercicios...',
        'md',
        3.9,
        'publico'
    ),
    (
        'uuid_de_javier',
        'uuid_reto_piano',
        NULL,
        'Partituras de Escalas',
        'Partituras para practicar...',
        'pdf',
        4.1,
        'publico'
    ),
    (
        'uuid_de_elena',
        NULL,
        'uuid_plan_tecnologia',
        'Resumen de IA',
        'Resumen de conceptos de IA...',
        'docx',
        4.6,
        'privado'
    );
-- Recompensas
INSERT INTO recompensas (nombre, tipo, valor, criterio_obtencion)
VALUES (
        'Insignia de Principiante',
        'insignia',
        1,
        'Completar primer reto'
    ),
    (
        'Puntos Iniciales',
        'puntos',
        50,
        'Registrarse en la plataforma'
    ),
    ('Nivel 1', 'nivel', 1, 'Alcanzar 100 puntos'),
    (
        'Insignia de Intermedio',
        'insignia',
        2,
        'Completar 5 retos'
    ),
    (
        'Puntos por Tarea',
        'puntos',
        20,
        'Completar una tarea'
    ),
    ('Nivel 2', 'nivel', 2, 'Alcanzar 500 puntos'),
    (
        'Insignia de Avanzado',
        'insignia',
        3,
        'Completar 10 retos'
    ),
    (
        'Puntos por Plan',
        'puntos',
        100,
        'Crear un plan de estudio'
    ),
    ('Nivel 3', 'nivel', 3, 'Alcanzar 1000 puntos'),
    (
        'Insignia de Experto',
        'insignia',
        4,
        'Completar 20 retos'
    );
-- Usuario-Recompensas
INSERT INTO usuario_recompensas (usuario_id, recompensa_id)
VALUES ('uuid_de_juan', 'uuid_recompensa_principiante'),
    (
        'uuid_de_maria',
        'uuid_recompensa_puntos_iniciales'
    ),
    ('uuid_de_carlos', 'uuid_recompensa_nivel1'),
    ('uuid_de_ana', 'uuid_recompensa_intermedio'),
    ('uuid_de_luis', 'uuid_recompensa_puntos_tarea'),
    ('uuid_de_laura', 'uuid_recompensa_nivel2'),
    ('uuid_de_pedro', 'uuid_recompensa_avanzado'),
    ('uuid_de_sofia', 'uuid_recompensa_puntos_plan'),
    ('uuid_de_javier', 'uuid_recompensa_nivel3'),
    ('uuid_de_elena', 'uuid_recompensa_experto');
-- Logros
INSERT INTO logros (usuario_id, tipo, descripcion)
VALUES (
        'uuid_de_juan',
        'completar_tarea',
        'Completó la tarea "Resolver derivadas"'
    ),
    (
        'uuid_de_maria',
        'unirse_reto',
        'Se unió al reto "Reto de Historia Antigua"'
    ),
    (
        'uuid_de_carlos',
        'crear_reto',
        'Creó el reto "Reto de Python: Funciones"'
    ),
    (
        'uuid_de_ana',
        'completar_reto',
        'Completó el reto "Reto de Literatura: Shakespeare"'
    ),
    (
        'uuid_de_luis',
        'subir_apunte',
        'Subió el apunte "Notas de Ecosistemas"'
    ),
    (
        'uuid_de_laura',
        'obtener_recompensa',
        'Obtuvo la recompensa "Puntos Iniciales"'
    ),
    (
        'uuid_de_pedro',
        'alcanzar_nivel',
        'Alcanzó el nivel 2'
    ),
    (
        'uuid_de_sofia',
        'completar_plan',
        'Completó el plan de estudio "Plan de Deportes"'
    ),
    (
        'uuid_de_javier',
        'participar_reto',
        'Participó en el reto "Reto de Piano: Escalas"'
    ),
    (
        'uuid_de_elena',
        'crear_tarea',
        'Creó la tarea "Introducción a IA"'
    );