import { Request, Response } from 'express';
import RetoModel, { Reto, Tarea } from '../models/Reto';
// Importar el pool de conexiones de la base de datos
import pool from '../config/db-config';

// Añadir tipo de retorno explícito Promise<void>
export const crearReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { reto, tareas } = req.body;
    
    // Validar campos requeridos del reto
    if (!reto.titulo || !reto.fecha_inicio || !reto.fecha_fin || !reto.dificultad) {
      res.status(400).json({ 
        message: 'Faltan campos requeridos para el reto' 
      });
      return; 
    }
    
    // Asignar el ID del usuario autenticado como creador
    reto.creador_id = userId;
    
    // Asegurar que se use el campo visibilidad correctamente
    if (!reto.visibilidad) {
      reto.visibilidad = 'publico'; // Valor por defecto
    }
    
    // Convertir fechas de string a objeto Date
    reto.fecha_inicio = new Date(reto.fecha_inicio);
    reto.fecha_fin = new Date(reto.fecha_fin);
    
    // Validar que la fecha de fin sea posterior a la de inicio
    if (reto.fecha_fin <= reto.fecha_inicio) {
      res.status(400).json({ 
        message: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      });
      return;
    }
    
    // Validar tareas
    if (tareas && tareas.length > 0) {
      for (const tarea of tareas) {
        if (!tarea.titulo || !tarea.puntos || !tarea.tipo) {
          res.status(400).json({
            message: 'Todas las tareas deben tener título, puntos y tipo'
          });
          return;
        }
        
        if (tarea.fecha_limite) {
          tarea.fecha_limite = new Date(tarea.fecha_limite);
        }
      }
    }
    
    // Crear reto con sus tareas
    const nuevoReto = await RetoModel.crear(reto, tareas || []);
    
    res.status(201).json({
      message: 'Reto creado exitosamente',
      reto: nuevoReto
    });
    
  } catch (error: any) {
    console.error('Error al crear reto:', error);
    res.status(500).json({ 
      message: 'Error al crear el reto',
      error: error.message 
    });
  }
};

// También añade tipo de retorno a las demás funciones
export const obtenerRetos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Solicitud recibida para obtenerRetos con query:', req.query);
    
    const { 
      estado = 'todos',
      dificultad = 'todos',
      visibilidad = 'publico', // Añadir parámetro de visibilidad
      ordenar = 'recientes'
    } = req.query;
    
    let whereConditions = [`r.visibilidad = '${visibilidad}'`];
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    // Estado
    if (estado !== 'todos') {
      whereConditions.push(`r.estado = $${paramCounter}`);
      queryParams.push(estado);
      paramCounter++;
    }
    
    // Dificultad
    if (dificultad !== 'todos') {
      whereConditions.push(`r.dificultad = $${paramCounter}`);
      queryParams.push(dificultad);
      paramCounter++;
    }
    
    // Construir la cláusula WHERE
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Determinar la cláusula ORDER BY según el parámetro
    let orderClause;
    switch (ordenar) {
      case 'recientes':
        orderClause = 'ORDER BY r.fecha_creacion DESC';
        break;
      case 'antiguos':
        orderClause = 'ORDER BY r.fecha_creacion ASC';
        break;
      case 'dificultad':
        orderClause = 'ORDER BY CASE r.dificultad ' +
                    'WHEN \'principiante\' THEN 1 ' +
                    'WHEN \'intermedio\' THEN 2 ' + 
                    'WHEN \'avanzado\' THEN 3 END';
        break;
      default:
        orderClause = 'ORDER BY r.fecha_creacion DESC';
    }
    
    // Obtenemos el ID del usuario si está autenticado
    const userId = req.user?.userId || null;
    
    // IMPORTANTE: Modificamos la query para incluir si el usuario está participando
    const query = `
      SELECT 
        r.*,
        u.nombre AS nombre_creador,
        (SELECT COUNT(*) FROM participacion_retos pr WHERE pr.reto_id = r.id) AS num_participantes,
        ${userId ? `(r.creador_id = '${userId}') AS es_creador,` : 'false AS es_creador,'}
        ${userId ? `(EXISTS (
            SELECT 1 FROM participacion_retos pr 
            WHERE pr.reto_id = r.id AND pr.usuario_id = '${userId}'
          )) AS participando` : 'false AS participando'}
      FROM 
        retos r
      LEFT JOIN 
        usuarios u ON r.creador_id = u.id
      ${whereClause}
      ${orderClause}
    `;
    
    console.log('Query final:', query);
    console.log('Params:', queryParams);
    
    const { rows } = await pool.query(query, queryParams);
    
    // Formatear las fechas y convertir los campos booleanos adecuadamente
    const formattedRows = rows.map((row: any) => ({
      ...row,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().slice(0, 10) : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().slice(0, 10) : null,
      es_creador: !!row.es_creador, // Convertir a booleano
      participando: !!row.participando // Convertir a booleano
    }));
    
    res.json({
      message: 'Retos obtenidos exitosamente',
      retos: formattedRows
    });
  } catch (error: any) {
    console.error('Error al obtener retos:', error);
    res.status(500).json({
      message: 'Error al obtener los retos',
      error: error.message
    });
  }
};

// La función obtenerRetoPorId ya tiene el tipo correcto, no es necesario cambiarla
export const obtenerRetoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar que el ID tiene formato UUID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) {
      res.status(400).json({ 
        message: 'Formato de ID inválido. Se requiere un UUID válido.' 
      });
      return;
    }
    
    const reto = await RetoModel.obtenerPorId(id);
    
    if (!reto) {
      res.status(404).json({ message: 'Reto no encontrado' });
      return;
    }
    
    const tareas = await RetoModel.obtenerTareasPorReto(id);
    
    res.json({
      reto,
      tareas
    });
  } catch (error: any) {
    console.error('Error al obtener reto:', error);
    res.status(500).json({ 
      message: 'Error al obtener el reto',
      error: error.message 
    });
  }
};

export const obtenerRetosPopulares = async (req: Request, res: Response): Promise<void> => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 10;
    
    // Obtenemos el ID del usuario si está autenticado
    const userId = req.user?.userId || null;
    
    // IMPORTANTE: Modificamos la query para incluir si el usuario está participando
    const query = `
      SELECT 
        r.*,
        u.nombre AS nombre_creador,
        (SELECT COUNT(*) FROM participacion_retos pr WHERE pr.reto_id = r.id) AS num_participantes,
        ${userId ? `(r.creador_id = '${userId}') AS es_creador,` : 'false AS es_creador,'}
        ${userId ? `(EXISTS (
            SELECT 1 FROM participacion_retos pr 
            WHERE pr.reto_id = r.id AND pr.usuario_id = '${userId}'
          )) AS participando` : 'false AS participando'}
      FROM 
        retos r
      JOIN 
        usuarios u ON r.creador_id = u.id
      WHERE 
        r.visibilidad = $1
      ORDER BY 
        num_participantes DESC,
        r.fecha_creacion DESC
      LIMIT $2
    `;
    
    const { rows } = await pool.query(query, ['publico', limite]);
    
    // Formatear datos con conversión adecuada de booleanos
    const retosPopulares = rows.map((row: any) => ({
      ...row,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().slice(0, 10) : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().slice(0, 10) : null,
      num_participantes: parseInt(row.num_participantes, 10) || 0,
      es_creador: !!row.es_creador, // Convertir a booleano
      participando: !!row.participando // Convertir a booleano
    }));
    
    res.json({
      message: 'Retos populares obtenidos exitosamente',
      retos: retosPopulares
    });
  } catch (error: any) {
    console.error('Error al obtener retos populares:', error);
    res.status(500).json({ 
      message: 'Error al obtener los retos populares',
      error: error.message 
    });
  }
};

// Función para permitir a un usuario unirse a un reto
export const unirseReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!; // userId del token JWT
    const { reto_id } = req.body;
    
    // Validar que se proporcionó el ID del reto
    if (!reto_id) {
      res.status(400).json({ message: 'El ID del reto es requerido' });
      return;
    }
    
    // Verificar que el reto existe y está activo
    const checkRetoQuery = `
      SELECT id, estado 
      FROM retos 
      WHERE id = $1
    `;
    
    const retoResult = await pool.query(checkRetoQuery, [reto_id]);
    
    if (retoResult.rows.length === 0) {
      res.status(404).json({ message: 'Reto no encontrado' });
      return;
    }
    
    const reto = retoResult.rows[0];
    
    if (reto.estado !== 'activo') {
      res.status(400).json({ 
        message: 'No es posible unirse a este reto porque no está activo' 
      });
      return;
    }
    
    // Verificar si el usuario ya está unido al reto
    const checkParticipacionQuery = `
      SELECT * FROM participacion_retos 
      WHERE usuario_id = $1 AND reto_id = $2
    `;
    
    const participacionResult = await pool.query(checkParticipacionQuery, [userId, reto_id]);
    
    if (participacionResult.rows.length > 0) {
      res.status(409).json({ message: 'Ya estás unido a este reto' });
      return;
    }
    
    // Registrar la participación del usuario en el reto
    const insertQuery = `
      INSERT INTO participacion_retos (usuario_id, reto_id, fecha_union, progreso) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, 0) 
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [userId, reto_id]);
    
    // Registrar logro de participación
    const logQuery = `
      INSERT INTO logros (usuario_id, tipo, descripcion)
      VALUES ($1, 'unirse_reto', $2)
    `;
    
    await pool.query(logQuery, [
      userId, 
      `Se unió al reto ID: ${reto_id}`
    ]);
    
    res.status(201).json({
      message: 'Te has unido al reto exitosamente',
      participacion: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al unirse al reto:', error);
    res.status(500).json({
      message: 'Error al procesar la solicitud para unirse al reto',
      error: error.message
    });
  }
};

/**
 * Permite a un usuario abandonar un reto en el que participa
 */
export const abandonarReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!; // userId extraído del token JWT
    const { reto_id } = req.body;
    
    if (!reto_id) {
      res.status(400).json({ message: 'El ID del reto es requerido' });
      return;
    }
    
    // Verificar que el usuario está participando en el reto
    const checkQuery = `
      SELECT * FROM participacion_retos 
      WHERE usuario_id = $1 AND reto_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [userId, reto_id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: 'No estás participando en este reto' });
      return;
    }
    
    // Eliminar la participación
    const deleteQuery = `
      DELETE FROM participacion_retos
      WHERE usuario_id = $1 AND reto_id = $2
      RETURNING *
    `;
    
    const deleteResult = await pool.query(deleteQuery, [userId, reto_id]);
    
    // Registrar el abandono en los logros
    const logQuery = `
      INSERT INTO logros (usuario_id, tipo, descripcion)
      VALUES ($1, 'abandonar_reto', $2)
    `;
    
    await pool.query(logQuery, [
      userId, 
      `Abandonó el reto ID: ${reto_id}`
    ]);
    
    res.json({
      message: 'Has abandonado el reto exitosamente',
      participacion: deleteResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error al abandonar reto:', error);
    res.status(500).json({
      message: 'Error al procesar la solicitud para abandonar el reto',
      error: error.message
    });
  }
};

/**
 * Obtener todos los retos en los que participa el usuario autenticado
 * Incluye tanto retos creados por el usuario como retos a los que se ha unido
 */
export const obtenerMisRetos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!; // userId extraído del token JWT
    
    console.log(`Buscando retos para el usuario con ID: ${userId}`);
    
    // Consulta optimizada que incluye:
    // 1. Retos creados por el usuario
    // 2. Retos en los que participa el usuario
    const query = `
      SELECT DISTINCT
        r.*,
        u.nombre AS nombre_creador,
        CASE 
          WHEN r.creador_id = $1 THEN true 
          ELSE false 
        END AS es_creador,
        (SELECT COUNT(*) FROM participacion_retos pr WHERE pr.reto_id = r.id) AS num_participantes,
        pr.progreso,
        CASE
          WHEN pr.usuario_id IS NOT NULL THEN true
          ELSE false
        END AS participando
      FROM 
        retos r
      LEFT JOIN 
        usuarios u ON r.creador_id = u.id
      LEFT JOIN 
        participacion_retos pr ON r.id = pr.reto_id AND pr.usuario_id = $1
      WHERE 
        r.creador_id = $1 
        OR pr.usuario_id = $1
      ORDER BY 
        r.fecha_creacion DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    // Formatear las fechas y asegurar tipos consistentes
    const formattedRows = rows.map((row: any) => ({
      ...row,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().slice(0, 10) : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().slice(0, 10) : null,
      es_creador: !!row.es_creador, // Convertir a booleano
      participando: !!row.participando, // Convertir a booleano
      num_participantes: parseInt(row.num_participantes || '0', 10),
      progreso: parseInt(row.progreso || '0', 10)
    }));
    
    console.log(`Se encontraron ${formattedRows.length} retos para el usuario`);
    
    res.json({
      message: 'Mis retos obtenidos exitosamente',
      retos: formattedRows
    });
  } catch (error: any) {
    console.error('Error al obtener mis retos:', error);
    res.status(500).json({
      message: 'Error al obtener tus retos',
      error: error.message
    });
  }
};
