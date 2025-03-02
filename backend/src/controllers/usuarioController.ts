import { Request, Response } from 'express';
import pool from '../config/db-config';

/**
 * Obtiene todas las participaciones en retos del usuario autenticado
 */
export const obtenerParticipaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    const query = `
      SELECT reto_id, progreso
      FROM participacion_retos
      WHERE usuario_id = $1
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    res.json({
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

/**
 * Obtener perfil del usuario
 */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    const query = `
      SELECT id, nombre, email, puntaje, fecha_registro
      FROM usuarios
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // No devolver información sensible
    const user = rows[0];
    
    res.json({
      user
    });
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas del usuario
 */
export const obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    // Retos creados
    const retosQuery = `
      SELECT COUNT(*) as total_retos
      FROM retos
      WHERE creador_id = $1
    `;
    
    // Retos en los que participa
    const participacionesQuery = `
      SELECT COUNT(*) as total_participaciones
      FROM participacion_retos
      WHERE usuario_id = $1
    `;
    
    // Apuntes subidos
    const apuntesQuery = `
      SELECT COUNT(*) as total_apuntes
      FROM apuntes
      WHERE usuario_id = $1
    `;
    
    const [retosResult, participacionesResult, apuntesResult] = await Promise.all([
      pool.query(retosQuery, [userId]),
      pool.query(participacionesQuery, [userId]),
      pool.query(apuntesQuery, [userId])
    ]);
    
    res.json({
      estadisticas: {
        retos_creados: parseInt(retosResult.rows[0]?.total_retos || '0'),
        participaciones: parseInt(participacionesResult.rows[0]?.total_participaciones || '0'),
        apuntes: parseInt(apuntesResult.rows[0]?.total_apuntes || '0')
      }
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener las estadísticas',
      error: error.message
    });
  }
};

/**
 * Actualizar perfil de usuario
 */
export const actualizarPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { nombre } = req.body;
    
    if (!nombre) {
      res.status(400).json({ message: 'El nombre es obligatorio' });
      return;
    }
    
    const query = `
      UPDATE usuarios
      SET nombre = $1, fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nombre, email, puntaje, fecha_registro
    `;
    
    const { rows } = await pool.query(query, [nombre, userId]);
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: rows[0]
    });
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      message: 'Error al actualizar el perfil',
      error: error.message
    });
  }
};