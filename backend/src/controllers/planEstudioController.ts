import { Request, Response } from 'express';
import pool from '../config/db-config';

// Obtener todos los planes de estudio
export const obtenerPlanesEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ordenar = 'recientes' } = req.query;
    let orderClause = '';
    
    // Determinar la cláusula ORDER BY según el parámetro
    switch (ordenar) {
      case 'recientes':
        orderClause = 'ORDER BY pe.fecha_creacion DESC';
        break;
      case 'antiguos':
        orderClause = 'ORDER BY pe.fecha_creacion ASC';
        break;
      case 'duracion_asc':
        orderClause = 'ORDER BY pe.duracion_dias ASC';
        break;
      case 'duracion_desc':
        orderClause = 'ORDER BY pe.duracion_dias DESC';
        break;
      case 'alfabetico':
        orderClause = 'ORDER BY pe.titulo ASC';
        break;
      default:
        orderClause = 'ORDER BY pe.fecha_creacion DESC';
    }
    
    // Query con JOIN para obtener el nombre del creador
    const query = `
      SELECT 
        pe.*,
        u.nombre AS nombre_creador,
        COUNT(r.id) AS tareas_count
      FROM 
        planes_estudio pe
      JOIN 
        usuarios u ON pe.usuario_id = u.id
      LEFT JOIN 
        retos r ON r.plan_estudio_id = pe.id
      WHERE 
        pe.visibilidad = 'publico'
      GROUP BY 
        pe.id, u.nombre
      ${orderClause}
    `;
    
    const { rows } = await pool.query(query);
    
    res.json({
      message: 'Planes de estudio obtenidos exitosamente',
      planes: rows
    });
  } catch (error: any) {
    console.error('Error al obtener planes de estudio:', error);
    res.status(500).json({
      message: 'Error al obtener los planes de estudio',
      error: error.message
    });
  }
};

// Obtener un plan de estudio por su ID
export const obtenerPlanEstudioPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Query para obtener el plan de estudio
    const planQuery = `
      SELECT 
        pe.*,
        u.nombre AS nombre_creador
      FROM 
        planes_estudio pe
      JOIN 
        usuarios u ON pe.usuario_id = u.id
      WHERE 
        pe.id = $1
    `;
    
    const planResult = await pool.query(planQuery, [id]);
    
    if (planResult.rows.length === 0) {
      res.status(404).json({ message: 'Plan de estudio no encontrado' });
      return;
    }
    
    // Query para obtener los retos asociados
    const retosQuery = `
      SELECT 
        r.*,
        COUNT(pr.usuario_id) AS num_participantes
      FROM 
        retos r
      LEFT JOIN 
        participacion_retos pr ON r.id = pr.reto_id
      WHERE 
        r.plan_estudio_id = $1
      GROUP BY 
        r.id
    `;
    
    const retosResult = await pool.query(retosQuery, [id]);
    
    res.json({
      plan: planResult.rows[0],
      retos: retosResult.rows
    });
  } catch (error: any) {
    console.error('Error al obtener plan de estudio:', error);
    res.status(500).json({
      message: 'Error al obtener el plan de estudio',
      error: error.message
    });
  }
};

// Crear un nuevo plan de estudio
export const crearPlanEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { titulo, descripcion, duracion_dias, visibilidad = 'publico' } = req.body;
    
    // Validar campos requeridos
    if (!titulo || !duracion_dias) {
      res.status(400).json({ message: 'El título y la duración son obligatorios' });
      return;
    }
    
    // Insertar plan de estudio
    const query = `
      INSERT INTO planes_estudio (
        usuario_id, 
        titulo, 
        descripcion, 
        duracion_dias,
        visibilidad,
        creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      userId,
      titulo,
      descripcion || null,
      duracion_dias,
      visibilidad,
      userId
    ];
    
    const { rows } = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Plan de estudio creado exitosamente',
      plan: rows[0]
    });
  } catch (error: any) {
    console.error('Error al crear plan de estudio:', error);
    res.status(500).json({
      message: 'Error al crear el plan de estudio',
      error: error.message
    });
  }
};

// Obtener planes de estudio destacados
export const obtenerPlanesDestacados = async (req: Request, res: Response): Promise<void> => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 3;
    
    // Query para obtener planes de estudio destacados
    // Los destacados son aquellos con más retos asociados
    const query = `
      SELECT 
        pe.*,
        u.nombre AS nombre_creador,
        COUNT(r.id) AS tareas_count
      FROM 
        planes_estudio pe
      JOIN 
        usuarios u ON pe.usuario_id = u.id
      LEFT JOIN 
        retos r ON r.plan_estudio_id = pe.id
      WHERE 
        pe.visibilidad = 'publico'
      GROUP BY 
        pe.id, u.nombre
      ORDER BY 
        COUNT(r.id) DESC,
        pe.fecha_creacion DESC
      LIMIT $1
    `;
    
    const { rows } = await pool.query(query, [limite]);
    
    res.json({
      message: 'Planes de estudio destacados obtenidos exitosamente',
      planes: rows
    });
  } catch (error: any) {
    console.error('Error al obtener planes destacados:', error);
    res.status(500).json({
      message: 'Error al obtener los planes destacados',
      error: error.message
    });
  }
};

// Función para permitir a un usuario unirse a un plan
export const unirsePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!; // userId del token JWT
    const { plan_id } = req.body;
    
    // Validar que se proporcionó el ID del plan
    if (!plan_id) {
      res.status(400).json({ message: 'El ID del plan es requerido' });
      return;
    }
    
    // Verificar que el plan existe
    const checkPlanQuery = `
      SELECT id 
      FROM planes_estudio 
      WHERE id = $1
    `;
    
    const planResult = await pool.query(checkPlanQuery, [plan_id]);
    
    if (planResult.rows.length === 0) {
      res.status(404).json({ message: 'Plan de estudio no encontrado' });
      return;
    }
    
    // Verificar si el usuario ya está unido al plan
    const checkSuscripcionQuery = `
      SELECT * FROM suscripcion_planes 
      WHERE usuario_id = $1 AND plan_id = $2
    `;
    
    const suscripcionResult = await pool.query(checkSuscripcionQuery, [userId, plan_id]);
    
    if (suscripcionResult.rows.length > 0) {
      res.status(409).json({ message: 'Ya estás suscrito a este plan' });
      return;
    }
    
    // Registrar la suscripción del usuario al plan
    const insertQuery = `
      INSERT INTO suscripcion_planes (usuario_id, plan_id, fecha_suscripcion, progreso) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, 0) 
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [userId, plan_id]);
    
    // Registrar logro
    const logQuery = `
      INSERT INTO logros (usuario_id, tipo, descripcion)
      VALUES ($1, 'unirse_plan', $2)
    `;
    
    await pool.query(logQuery, [
      userId, 
      `Se suscribió al plan de estudio ID: ${plan_id}`
    ]);
    
    res.status(201).json({
      message: 'Te has suscrito al plan de estudio exitosamente',
      suscripcion: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al suscribirse al plan:', error);
    res.status(500).json({
      message: 'Error al procesar la solicitud para suscribirse al plan',
      error: error.message
    });
  }
};
