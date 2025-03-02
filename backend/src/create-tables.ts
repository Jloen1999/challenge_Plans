import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// SQL para eliminar tablas en orden inverso para respetar las dependencias
const dropTablesSQL = `
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
`;

// SQL actualizado para crear todas las tablas con las nuevas funcionalidades (corrigiendo las columnas duplicadas)
const createTablesSQL = `
-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
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
    fecha_inicio DATE DEFAULT CURRENT_DATE, -- Cambiado de fecha_creacion a fecha_inicio
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
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    dificultad VARCHAR(15) CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')),
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
    progreso INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
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
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Apuntes
CREATE TABLE IF NOT EXISTS apuntes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos(id) ON DELETE SET NULL,
    plan_estudio_id UUID REFERENCES planes_estudio(id) ON DELETE SET NULL,
    documento_url VARCHAR(350) DEFAULT 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/sign/apuntes/dc985c50-12d8-4e3b-88a1-159896808903/cp.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHVudGVzL2RjOTg1YzUwLTEyZDgtNGUzYi04OGExLTE1OTg5NjgwODkwMy9jcC5wZGYiLCJpYXQiOjE3NDA5MzUzNDYsImV4cCI6MTc3MjQ3MTM0Nn0.W7xIp6wlVwoSuAPNv0PfwnI0evY4Lr-bLQwGc5zAnvE',
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    formato VARCHAR(10) CHECK (formato IN ('pdf', 'md', 'docx')),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Esta es distinta de fecha_creacion
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.0 CHECK (calificacion_promedio BETWEEN 0 AND 5),
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibilidad VARCHAR(10) DEFAULT 'privado' CHECK (visibilidad IN ('publico', 'privado'))
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

-- Vista para consultar el progreso en retos
CREATE OR REPLACE VIEW vista_progreso_reto AS
SELECT u.nombre, r.titulo, pr.progreso
FROM participacion_retos pr
JOIN usuarios u ON pr.usuario_id = u.id
JOIN retos r ON pr.reto_id = r.id;

-- Índice de texto completo para búsqueda avanzada en títulos de retos
CREATE INDEX IF NOT EXISTS idx_titulo_retos_text ON retos USING GIN (to_tsvector('spanish', titulo));
`;

// Crear pool de conexión a la base de datos
const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeOperation(operation: number) {
  try {
    // Obtener cliente de la pool
    const client = await pool.connect();
    
    switch(operation) {
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
      { usuario_id: usuariosIds.usuario_1, titulo: 'Plan de Matemáticas Avanzadas', descripcion: 'Estudio intensivo de cálculo y álgebra', duracion_dias: 30, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_2, titulo: 'Plan de Historia Universal', descripcion: 'Revisión de eventos históricos clave', duracion_dias: 45, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_3, titulo: 'Plan de Programación en Python', descripcion: 'Aprendizaje de Python desde cero', duracion_dias: 60, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_4, titulo: 'Plan de Literatura Clásica', descripcion: 'Lectura y análisis de obras clásicas', duracion_dias: 20, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_5, titulo: 'Plan de Ciencias Naturales', descripcion: 'Estudio de biología, física y química', duracion_dias: 40, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_6, titulo: 'Plan de Idiomas', descripcion: 'Mejora de inglés y francés', duracion_dias: 50, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_7, titulo: 'Plan de Arte Contemporáneo', descripcion: 'Exploración de arte moderno', duracion_dias: 25, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_8, titulo: 'Plan de Deportes', descripcion: 'Entrenamiento físico y teoría', duracion_dias: 35, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_9, titulo: 'Plan de Música', descripcion: 'Teoría musical y práctica instrumental', duracion_dias: 30, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_10, titulo: 'Plan de Tecnología', descripcion: 'Introducción a nuevas tecnologías', duracion_dias: 15, visibilidad: 'privado' }
    ];
    
    const planesIds: { [key: string]: string } = {};
    
    for (const [index, plan] of planesEstudio.entries()) {
      const result = await client.query(
        'INSERT INTO planes_estudio (usuario_id, titulo, descripcion, duracion_dias, visibilidad) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [plan.usuario_id, plan.titulo, plan.descripcion, plan.duracion_dias, plan.visibilidad]
      );
      planesIds[`plan_${index + 1}`] = result.rows[0].id;
    }
    
    // 4. Insertar retos y guardar sus IDs
    console.log('Insertando retos...');
    const retos = [
      { creador_id: usuariosIds.usuario_1, plan_estudio_id: planesIds.plan_1, titulo: 'Reto de Cálculo Diferencial', descripcion: 'Resolver problemas de derivadas', fecha_inicio: '2023-10-01', fecha_fin: '2023-10-15', estado: 'activo', dificultad: 'intermedio', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_2, plan_estudio_id: null, titulo: 'Reto de Historia Antigua', descripcion: 'Investigar sobre el Imperio Romano', fecha_inicio: '2023-09-15', fecha_fin: '2023-10-15', estado: 'activo', dificultad: 'principiante', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_3, plan_estudio_id: planesIds.plan_3, titulo: 'Reto de Python: Funciones', descripcion: 'Crear funciones en Python', fecha_inicio: '2023-10-05', fecha_fin: '2023-10-20', estado: 'activo', dificultad: 'principiante', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_4, plan_estudio_id: null, titulo: 'Reto de Literatura: Shakespeare', descripcion: 'Analizar obras de Shakespeare', fecha_inicio: '2023-10-10', fecha_fin: '2023-11-10', estado: 'activo', dificultad: 'avanzado', visibilidad: 'privado' },
      { creador_id: usuariosIds.usuario_5, plan_estudio_id: planesIds.plan_5, titulo: 'Reto de Biología: Ecosistemas', descripcion: 'Estudiar ecosistemas locales', fecha_inicio: '2023-09-20', fecha_fin: '2023-10-20', estado: 'activo', dificultad: 'intermedio', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_6, plan_estudio_id: null, titulo: 'Reto de Inglés: Conversación', descripcion: 'Practicar conversaciones en inglés', fecha_inicio: '2023-10-01', fecha_fin: '2023-10-31', estado: 'activo', dificultad: 'principiante', visibilidad: 'privado' },
      { creador_id: usuariosIds.usuario_7, plan_estudio_id: planesIds.plan_7, titulo: 'Reto de Pintura Moderna', descripcion: 'Crear una obra inspirada en Picasso', fecha_inicio: '2023-10-15', fecha_fin: '2023-11-15', estado: 'activo', dificultad: 'avanzado', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_8, plan_estudio_id: null, titulo: 'Reto de Deportes: Maratón', descripcion: 'Prepararse para correr una maratón', fecha_inicio: '2023-09-01', fecha_fin: '2023-12-01', estado: 'activo', dificultad: 'intermedio', visibilidad: 'privado' },
      { creador_id: usuariosIds.usuario_9, plan_estudio_id: planesIds.plan_9, titulo: 'Reto de Piano: Escalas', descripcion: 'Practicar escalas mayores y menores', fecha_inicio: '2023-10-05', fecha_fin: '2023-10-25', estado: 'activo', dificultad: 'principiante', visibilidad: 'publico' },
      { creador_id: usuariosIds.usuario_10, plan_estudio_id: null, titulo: 'Reto de Tecnología: IA', descripcion: 'Introducción a la inteligencia artificial', fecha_inicio: '2023-10-10', fecha_fin: '2023-11-10', estado: 'activo', dificultad: 'avanzado', visibilidad: 'privado' }
    ];
    
    const retosIds: { [key: string]: string } = {};
    
    for (const [index, reto] of retos.entries()) {
      const result = await client.query(
        'INSERT INTO retos (creador_id, plan_estudio_id, titulo, descripcion, fecha_inicio, fecha_fin, estado, dificultad, visibilidad) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [reto.creador_id, reto.plan_estudio_id, reto.titulo, reto.descripcion, reto.fecha_inicio, reto.fecha_fin, reto.estado, reto.dificultad, reto.visibilidad]
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
      { usuario_id: usuariosIds.usuario_2, reto_id: retosIds.reto_1, progreso: 50 },
      { usuario_id: usuariosIds.usuario_3, reto_id: retosIds.reto_2, progreso: 20 },
      { usuario_id: usuariosIds.usuario_4, reto_id: retosIds.reto_3, progreso: 80 },
      { usuario_id: usuariosIds.usuario_5, reto_id: retosIds.reto_4, progreso: 30 },
      { usuario_id: usuariosIds.usuario_6, reto_id: retosIds.reto_5, progreso: 60 },
      { usuario_id: usuariosIds.usuario_7, reto_id: retosIds.reto_6, progreso: 40 },
      { usuario_id: usuariosIds.usuario_8, reto_id: retosIds.reto_7, progreso: 70 },
      { usuario_id: usuariosIds.usuario_9, reto_id: retosIds.reto_8, progreso: 10 },
      { usuario_id: usuariosIds.usuario_10, reto_id: retosIds.reto_9, progreso: 90 },
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_10, progreso: 25 }
    ];
    
    for (const participacion of participaciones) {
      await client.query(
        'INSERT INTO participacion_retos (usuario_id, reto_id, progreso) VALUES ($1, $2, $3)',
        [participacion.usuario_id, participacion.reto_id, participacion.progreso]
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
      { usuario_id: usuariosIds.usuario_1, reto_id: retosIds.reto_1, plan_estudio_id: null, titulo: 'Apuntes de Derivadas', contenido: 'Contenido sobre derivadas...', formato: 'pdf', calificacion_promedio: 4.5, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_2, reto_id: null, plan_estudio_id: planesIds.plan_2, titulo: 'Resumen de Historia Antigua', contenido: 'Resumen de eventos históricos...', formato: 'md', calificacion_promedio: 3.8, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_3, reto_id: retosIds.reto_3, plan_estudio_id: null, titulo: 'Guía de Funciones en Python', contenido: 'Explicación de funciones...', formato: 'docx', calificacion_promedio: 4.2, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_4, reto_id: null, plan_estudio_id: planesIds.plan_4, titulo: 'Análisis de Obras Clásicas', contenido: 'Análisis detallado de Hamlet...', formato: 'pdf', calificacion_promedio: 4.7, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_5, reto_id: retosIds.reto_5, plan_estudio_id: null, titulo: 'Notas de Ecosistemas', contenido: 'Observaciones de campo...', formato: 'md', calificacion_promedio: 3.5, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_6, reto_id: null, plan_estudio_id: planesIds.plan_6, titulo: 'Vocabulario de Inglés', contenido: 'Lista de palabras y frases...', formato: 'docx', calificacion_promedio: 4.0, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_7, reto_id: retosIds.reto_7, plan_estudio_id: null, titulo: 'Técnicas de Pintura Moderna', contenido: 'Descripción de técnicas...', formato: 'pdf', calificacion_promedio: 4.3, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_8, reto_id: null, plan_estudio_id: planesIds.plan_8, titulo: 'Plan de Entrenamiento', contenido: 'Rutina de ejercicios...', formato: 'md', calificacion_promedio: 3.9, visibilidad: 'privado' },
      { usuario_id: usuariosIds.usuario_9, reto_id: retosIds.reto_9, plan_estudio_id: null, titulo: 'Partituras de Escalas', contenido: 'Partituras para practicar...', formato: 'pdf', calificacion_promedio: 4.1, visibilidad: 'publico' },
      { usuario_id: usuariosIds.usuario_10, reto_id: null, plan_estudio_id: planesIds.plan_10, titulo: 'Resumen de IA', contenido: 'Resumen de conceptos de IA...', formato: 'docx', calificacion_promedio: 4.6, visibilidad: 'privado' }
    ];
    
    for (const apunte of apuntes) {
      await client.query(
        'INSERT INTO apuntes (usuario_id, reto_id, plan_estudio_id, titulo, contenido, formato, calificacion_promedio, visibilidad) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [apunte.usuario_id, apunte.reto_id, apunte.plan_estudio_id, apunte.titulo, apunte.contenido, apunte.formato, apunte.calificacion_promedio, apunte.visibilidad]
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
