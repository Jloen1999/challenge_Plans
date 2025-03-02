import { Request, Response } from 'express';
import pool from '../config/db-config';

// Obtener todos los logros del usuario actual
export const obtenerLogrosUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    const query = `
      SELECT 
        l.*
      FROM 
        logros l
      WHERE 
        l.usuario_id = $1
      ORDER BY 
        l.fecha DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    res.json({
      message: 'Logros obtenidos exitosamente',
      logros: rows
    });
  } catch (error: any) {
    console.error('Error al obtener logros del usuario:', error);
    res.status(500).json({
      message: 'Error al obtener los logros',
      error: error.message
    });
  }
};

// Crear un nuevo logro para un usuario (generalmente se llama desde otros controladores)
export const crearLogro = async (
  userId: string, 
  tipo: string, 
  descripcion: string
): Promise<any> => {
  try {
    const query = `
      INSERT INTO logros (usuario_id, tipo, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [userId, tipo, descripcion]);
    
    // También actualizar puntaje del usuario según el tipo de logro
    await actualizarPuntajeUsuario(userId, tipo);
    
    return rows[0];
  } catch (error) {
    console.error('Error al crear logro:', error);
    throw error;
  }
};

// Actualizar el puntaje del usuario basado en el tipo de logro
const actualizarPuntajeUsuario = async (userId: string, tipoLogro: string): Promise<void> => {
  try {
    let puntosASumar = 0;
    
    // Determinar puntos a sumar según el tipo de logro
    switch (tipoLogro) {
      case 'unirse_reto':
        puntosASumar = 10;
        break;
      case 'completar_tarea':
        puntosASumar = 15;
        break;
      case 'completar_reto':
        puntosASumar = 50;
        break;
      case 'crear_reto':
        puntosASumar = 20;
        break;
      case 'subir_apunte':
        puntosASumar = 25;
        break;
      case 'participar_reto':
        puntosASumar = 5;
        break;
      case 'crear_plan_estudio':
        puntosASumar = 30;
        break;
      default:
        puntosASumar = 5;
    }
    
    if (puntosASumar > 0) {
      const query = `
        UPDATE usuarios
        SET puntaje = puntaje + $1
        WHERE id = $2
      `;
      
      await pool.query(query, [puntosASumar, userId]);
    }
  } catch (error) {
    console.error('Error al actualizar puntaje:', error);
    throw error;
  }
};

// Obtener los últimos logros (para la sección de actividad reciente)
export const obtenerUltimosLogros = async (req: Request, res: Response): Promise<void> => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 10;
    
    const query = `
      SELECT 
        l.*,
        u.nombre AS nombre_usuario
      FROM 
        logros l
      JOIN 
        usuarios u ON l.usuario_id = u.id
      ORDER BY 
        l.fecha DESC
      LIMIT $1
    `;
    
    const { rows } = await pool.query(query, [limite]);
    
    res.json({
      message: 'Últimos logros obtenidos exitosamente',
      logros: rows
    });
  } catch (error: any) {
    console.error('Error al obtener últimos logros:', error);
    res.status(500).json({
      message: 'Error al obtener los logros',
      error: error.message
    });
  }
};
