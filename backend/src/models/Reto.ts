import { Pool } from 'pg';
import pool from '../config/db-config';

export interface Reto {
  id?: string;
  creador_id: string;
  visibilidad: string;  // Cambiado de 'tipo' a 'visibilidad'
  plan_estudio_id?: string | null;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado?: string;
  dificultad: string;
}

export interface Tarea {
  id?: string;
  reto_id?: string;
  asignado_a?: string;
  titulo: string;
  descripcion?: string;
  puntos: number;
  fecha_limite?: Date;
  tipo: string;
}

class RetoModel {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  async crear(reto: Reto, tareas: Tarea[] = []): Promise<Reto> {
    const client = await this.db.connect();
    
    try {
      // Iniciar transacción
      await client.query('BEGIN');
      
      // Insertar reto
      const retoQuery = `
        INSERT INTO retos (
          creador_id, visibilidad, plan_estudio_id, titulo, descripcion, 
          fecha_inicio, fecha_fin, estado, dificultad, creado_por
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const retoValues = [
        reto.creador_id,
        reto.visibilidad || 'publico',  // Usar visibilidad en lugar de tipo
        reto.plan_estudio_id || null,
        reto.titulo,
        reto.descripcion || null,
        reto.fecha_inicio,
        reto.fecha_fin,
        reto.estado || 'activo',
        reto.dificultad,
        reto.creador_id
      ];
      
      const retoResult = await client.query(retoQuery, retoValues);
      const nuevoReto = retoResult.rows[0];
      
      // Insertar tareas si hay
      if (tareas && tareas.length > 0) {
        for (const tarea of tareas) {
          const tareaQuery = `
            INSERT INTO tareas (
              reto_id, asignado_a, titulo, descripcion, 
              puntos, fecha_limite, tipo, creado_por
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          
          const tareaValues = [
            nuevoReto.id,
            tarea.asignado_a || null,
            tarea.titulo,
            tarea.descripcion || null,
            tarea.puntos,
            tarea.fecha_limite || null,
            tarea.tipo,
            reto.creador_id
          ];
          
          await client.query(tareaQuery, tareaValues);
        }
      }
      
      // Confirmar transacción
      await client.query('COMMIT');
      
      return nuevoReto;
    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async obtenerTodos(visibilidad: string = 'publico'): Promise<Reto[]> {
    // Añadir filtro de visibilidad
    const query = `
      SELECT r.*, u.nombre AS nombre_creador, COUNT(pr.usuario_id) AS num_participantes
      FROM retos r
      LEFT JOIN usuarios u ON r.creador_id = u.id
      LEFT JOIN participacion_retos pr ON r.id = pr.reto_id
      WHERE r.visibilidad = $1
      GROUP BY r.id, u.nombre
      ORDER BY r.fecha_inicio DESC
    `;
    
    const { rows } = await this.db.query(query, [visibilidad]);
    return rows;
  }

  async obtenerPorId(id: string): Promise<Reto | null> {
    const query = `
      SELECT * FROM retos
      WHERE id = $1
    `;
    
    const { rows } = await this.db.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async obtenerTareasPorReto(retoId: string): Promise<Tarea[]> {
    const query = `
      SELECT * FROM tareas
      WHERE reto_id = $1
      ORDER BY fecha_limite ASC
    `;
    
    const { rows } = await this.db.query(query, [retoId]);
    return rows;
  }

  async obtenerRetosPopulares(limite: number = 10, visibilidad: string = 'publico'): Promise<any[]> {
    const query = `
      SELECT r.id, r.titulo, r.descripcion, r.fecha_inicio, r.fecha_fin, 
             r.estado, r.dificultad, r.creador_id,
             COUNT(pr.usuario_id) AS num_participantes,
             u.nombre AS nombre_creador
      FROM retos r
      LEFT JOIN participacion_retos pr ON r.id = pr.reto_id
      LEFT JOIN usuarios u ON r.creador_id = u.id
      WHERE r.estado = 'activo' AND r.visibilidad = $1
      GROUP BY r.id, r.titulo, r.descripcion, r.fecha_inicio, 
               r.fecha_fin, r.estado, r.dificultad, r.creador_id, u.nombre
      ORDER BY num_participantes DESC
      LIMIT $2
    `;
    
    const { rows } = await this.db.query(query, [visibilidad, limite]);
    return rows;
  }
}

export default new RetoModel();
