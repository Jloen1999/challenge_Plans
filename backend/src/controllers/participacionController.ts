import { Request, Response } from 'express';
import pool from '../config/db-config';

// Unirse a un reto
export const unirseAReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: retoId } = req.params;
    const { userId } = req.user!;
    
    // Verificar que el reto existe y está activo
    const checkRetoQuery = `
      SELECT id, estado, visibilidad 
      FROM retos 
      WHERE id = $1
    `;
    
    const retoResult = await pool.query(checkRetoQuery, [retoId]);
    
    if (retoResult.rows.length === 0) {
      res.status(404).json({ message: 'Reto no encontrado' });
      return;
    }
    
    const reto = retoResult.rows[0];
    
    // Verificar que el reto está activo
    if (reto.estado !== 'activo') {
      res.status(400).json({ 
        message: 'No es posible unirse a un reto que no está activo' 
      });
      return;
    }
    
    // Si el reto es privado, verificar si el usuario tiene acceso
    if (reto.visibilidad === 'privado') {
      // Aquí podrías implementar lógica para verificar si el usuario ha sido invitado
      // Por ahora, simplemente permitimos que el creador acceda
      const checkCreadorQuery = `
        SELECT creador_id FROM retos WHERE id = $1
      `;
      
      const creadorResult = await pool.query(checkCreadorQuery, [retoId]);
      
      if (creadorResult.rows[0].creador_id !== userId) {
        res.status(403).json({ 
          message: 'No tienes acceso a este reto privado' 
        });
        return;
      }
    }
    
    // Verificar si el usuario ya está participando
    const checkParticipacionQuery = `
      SELECT * FROM participacion_retos 
      WHERE reto_id = $1 AND usuario_id = $2
    `;
    
    const participacionResult = await pool.query(checkParticipacionQuery, [retoId, userId]);
    
    if (participacionResult.rows.length > 0) {
      res.status(400).json({ message: 'Ya estás participando en este reto' });
      return;
    }
    
    // Registrar la participación
    const insertParticipacionQuery = `
      INSERT INTO participacion_retos (usuario_id, reto_id, progreso)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const insertResult = await pool.query(insertParticipacionQuery, [userId, retoId, 0]);
    
    // Registrar como logro la unión al reto
    const insertLogroQuery = `
      INSERT INTO logros (usuario_id, tipo, descripcion)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    // Obtener título del reto para el logro
    const tituloRetoQuery = `SELECT titulo FROM retos WHERE id = $1`;
    const tituloResult = await pool.query(tituloRetoQuery, [retoId]);
    const tituloReto = tituloResult.rows[0].titulo;
    
    await pool.query(
      insertLogroQuery, 
      [userId, 'unirse_reto', `Se unió al reto "${tituloReto}"`]
    );
    
    // Responder con la participación creada
    res.status(201).json({
      message: 'Te has unido al reto exitosamente',
      participacion: insertResult.rows[0]
    });
    
  } catch (error: any) {
    console.error('Error al unirse al reto:', error);
    res.status(500).json({
      message: 'Error al unirse al reto',
      error: error.message
    });
  }
};

// Actualizar progreso en un reto
export const actualizarProgreso = async (req: Request, res: Response): Promise<void> => {
  // ...existing code...
};

// Obtener todas las participaciones de un usuario
export const obtenerParticipacionesUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    const query = `
      SELECT 
        pr.reto_id, 
        pr.fecha_union, 
        pr.progreso,
        r.titulo as titulo_reto,
        r.descripcion as descripcion_reto,
        r.fecha_inicio,
        r.fecha_fin,
        r.estado,
        r.dificultad,
        u.nombre as nombre_creador
      FROM 
        participacion_retos pr
      JOIN 
        retos r ON pr.reto_id = r.id
      JOIN 
        usuarios u ON r.creador_id = u.id
      WHERE 
        pr.usuario_id = $1
      ORDER BY 
        r.fecha_fin ASC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    res.json({
      message: 'Participaciones obtenidas exitosamente',
      participaciones: rows
    });
  } catch (error: any) {
    console.error('Error al obtener participaciones:', error);
    res.status(500).json({
      message: 'Error al obtener las participaciones',
      error: error.message
    });
  }
};

// Obtener todos los participantes de un reto
export const obtenerParticipantesReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: retoId } = req.params;
    
    // Verificar primero que el reto existe
    const checkRetoQuery = 'SELECT id FROM retos WHERE id = $1';
    const retoResult = await pool.query(checkRetoQuery, [retoId]);
    
    if (retoResult.rows.length === 0) {
      res.status(404).json({ message: 'Reto no encontrado' });
      return;
    }
    
    // Consultar los participantes
    const query = `
      SELECT 
        u.id as usuario_id,
        u.nombre,
        pr.fecha_union,
        pr.progreso
      FROM 
        participacion_retos pr
      JOIN 
        usuarios u ON pr.usuario_id = u.id
      WHERE 
        pr.reto_id = $1
      ORDER BY 
        pr.progreso DESC, pr.fecha_union ASC
    `;
    
    const { rows } = await pool.query(query, [retoId]);
    
    res.json({
      message: 'Participantes obtenidos exitosamente',
      participantes: rows
    });
  } catch (error: any) {
    console.error('Error al obtener participantes:', error);
    res.status(500).json({
      message: 'Error al obtener los participantes',
      error: error.message
    });
  }
};

// Abandonar un reto
export const abandonarReto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: retoId } = req.params;
    const { userId } = req.user!;
    
    // Verificar que el usuario está participando en el reto
    const checkParticipacionQuery = `
      SELECT * FROM participacion_retos 
      WHERE reto_id = $1 AND usuario_id = $2
    `;
    
    const participacionResult = await pool.query(checkParticipacionQuery, [retoId, userId]);
    
    if (participacionResult.rows.length === 0) {
      res.status(404).json({ message: 'No estás participando en este reto' });
      return;
    }
    
    // Eliminar la participación
    const deleteQuery = `
      DELETE FROM participacion_retos
      WHERE reto_id = $1 AND usuario_id = $2
      RETURNING *
    `;
    
    await pool.query(deleteQuery, [retoId, userId]);
    
    // Obtener el título del reto para incluirlo en el mensaje
    const tituloQuery = `SELECT titulo FROM retos WHERE id = $1`;
    const tituloResult = await pool.query(tituloQuery, [retoId]);
    const tituloReto = tituloResult.rows[0].titulo;
    
    res.json({
      message: `Has abandonado el reto "${tituloReto}" exitosamente`
    });
  } catch (error: any) {
    console.error('Error al abandonar reto:', error);
    res.status(500).json({
      message: 'Error al abandonar el reto',
      error: error.message
    });
  }
};

/**
 * Verificar si un usuario está unido a un reto específico
 */
export const verificarParticipacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!; // ID del usuario autenticado
    const { reto_id } = req.params;  // ID del reto a verificar
    
    if (!reto_id) {
      res.status(400).json({ message: 'El ID del reto es requerido' });
      return;
    }
    
    // Verificar si existe el reto primero
    const checkRetoQuery = `
      SELECT id FROM retos WHERE id = $1
    `;
    
    const retoResult = await pool.query(checkRetoQuery, [reto_id]);
    
    if (retoResult.rows.length === 0) {
      res.status(404).json({ message: 'Reto no encontrado' });
      return;
    }
    
    // Verificar si el usuario es el creador del reto
    const checkCreadorQuery = `
      SELECT id FROM retos WHERE id = $1 AND creador_id = $2
    `;
    
    const creadorResult = await pool.query(checkCreadorQuery, [reto_id, userId]);
    const esCreador = creadorResult.rows.length > 0;
    
    // Verificar si el usuario participa en el reto
    const checkParticipacionQuery = `
      SELECT * FROM participacion_retos 
      WHERE usuario_id = $1 AND reto_id = $2
    `;
    
    const participacionResult = await pool.query(checkParticipacionQuery, [userId, reto_id]);
    const estaParticipando = participacionResult.rows.length > 0;
    
    // Devolver información con un poco más de detalle
    if (estaParticipando) {
      const { progreso } = participacionResult.rows[0];
      
      res.json({
        participando: true,
        es_creador: esCreador,
        progreso,
        message: 'El usuario está participando en este reto'
      });
    } else {
      res.json({
        participando: false,
        es_creador: esCreador,
        message: esCreador ? 'El usuario es el creador de este reto' : 'El usuario no está participando en este reto'
      });
    }
    
  } catch (error: any) {
    console.error('Error al verificar participación:', error);
    res.status(500).json({
      message: 'Error al verificar la participación en el reto',
      error: error.message
    });
  }
};

/**
 * Obtener todos los retos en los que participa un usuario
 */
export const obtenerRetosParticipando = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    const query = `
      SELECT 
        r.*,
        u.nombre AS nombre_creador,
        pr.progreso,
        CASE WHEN r.creador_id = $1 THEN true ELSE false END AS es_creador
      FROM 
        participacion_retos pr
      JOIN 
        retos r ON pr.reto_id = r.id
      JOIN 
        usuarios u ON r.creador_id = u.id
      WHERE 
        pr.usuario_id = $1
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
      participando: true // Todos estos retos tienen participación
    }));
    
    res.json({
      message: 'Retos con participación obtenidos exitosamente',
      retos: formattedRows
    });
  } catch (error: any) {
    console.error('Error al obtener retos con participación:', error);
    res.status(500).json({
      message: 'Error al obtener los retos en los que participas',
      error: error.message
    });
  }
};
