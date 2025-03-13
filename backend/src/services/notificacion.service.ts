import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Notificacion } from '../entities/notificacion.entity';
import { NotificacionLectura } from '../entities/notificacion-lectura.entity';
import { NotFoundError } from '../utils/custom-errors';

export class NotificacionService {
  private notificacionRepository: Repository<Notificacion>;
  private notificacionLecturaRepository: Repository<NotificacionLectura>;

  constructor() {
    this.notificacionRepository = AppDataSource.getRepository(Notificacion);
    this.notificacionLecturaRepository = AppDataSource.getRepository(NotificacionLectura);
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   */
  async getNotificaciones(usuarioId: string, limit: number = 20, offset: number = 0): Promise<Notificacion[]> {
    // Obtener notificaciones específicas del usuario y grupales
    return this.notificacionRepository.createQueryBuilder('notificacion')
      .where('notificacion.usuario_id = :usuarioId', { usuarioId })
      .orWhere('notificacion.es_grupal = true')
      .orderBy('notificacion.fecha_creacion', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Obtiene el conteo de notificaciones no leídas de un usuario
   */
  async getNoLeidasCount(usuarioId: string): Promise<number> {
    // Contar las notificaciones específicas del usuario que no han sido leídas
    const propias = await this.notificacionRepository.count({
      where: {
        usuario_id: usuarioId,
        leida: false
      }
    });

    // Contar las notificaciones grupales que no han sido marcadas como leídas por el usuario
    const grupalesNoLeidas = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM notificaciones n
      WHERE n.es_grupal = true
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones_lecturas nl
        WHERE nl.notificacion_id = n.id AND nl.usuario_id = $1
      )
    `, [usuarioId]);

    return propias + parseInt(grupalesNoLeidas[0].count);
  }

  /**
   * Marca una notificación como leída
   */
  async marcarLeida(notificacionId: string, usuarioId: string): Promise<boolean> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id: notificacionId }
    });

    if (!notificacion) {
      throw new NotFoundError('Notificación no encontrada');
    }

    // Si la notificación es específica del usuario, actualizarla directamente
    if (notificacion.usuario_id === usuarioId) {
      notificacion.leida = true;
      notificacion.fecha_lectura = new Date();
      await this.notificacionRepository.save(notificacion);
      return true;
    }
    // Si es grupal, marcarla como leída para este usuario
    else if (notificacion.es_grupal) {
      try {
        await this.notificacionLecturaRepository.save({
          notificacion_id: notificacionId,
          usuario_id: usuarioId,
          fecha_lectura: new Date()
        });
        return true;
      } catch (error) {
        // Si ya estaba marcada como leída (clave duplicada), ignorar el error
        return true;
      }
    }

    return false;
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async marcarTodasLeidas(usuarioId: string): Promise<boolean> {
    // Marcar notificaciones específicas del usuario como leídas
    await this.notificacionRepository.update(
      { usuario_id: usuarioId, leida: false },
      { leida: true, fecha_lectura: new Date() }
    );

    // Obtener IDs de notificaciones grupales no leídas
    const grupalesNoLeidas = await AppDataSource.query(`
      SELECT n.id
      FROM notificaciones n
      WHERE n.es_grupal = true
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones_lecturas nl
        WHERE nl.notificacion_id = n.id AND nl.usuario_id = $1
      )
    `, [usuarioId]);

    // Marcar notificaciones grupales como leídas para este usuario
    if (grupalesNoLeidas.length > 0) {
      const notificacionIds = grupalesNoLeidas.map((n: any) => n.id);
      
      for (const id of notificacionIds) {
        try {
          await this.notificacionLecturaRepository.save({
            notificacion_id: id,
            usuario_id: usuarioId,
            fecha_lectura: new Date()
          });
        } catch (error) {
          // Ignorar errores de clave duplicada
        }
      }
    }

    return true;
  }

  /**
   * Crea una nueva notificación para un usuario específico
   */
  async crearNotificacion(notificacionData: {
    usuario_id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    entidad?: string;
    entidad_id?: string;
  }): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      ...notificacionData,
      es_grupal: false,
      leida: false,
      fecha_creacion: new Date()
    });
    
    return this.notificacionRepository.save(notificacion);
  }

  /**
   * Crea una notificación grupal
   */
  async crearNotificacionGrupal(notificacionData: {
    titulo: string;
    mensaje: string;
    tipo: string;
    entidad?: string;
    entidad_id?: string;
    grupo_id?: string;
  }): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      ...notificacionData,
      es_grupal: true,
      leida: false,
      fecha_creacion: new Date()
    });
    
    return this.notificacionRepository.save(notificacion);
  }

  /**
   * Elimina una notificación
   */
  async eliminarNotificacion(notificacionId: string, usuarioId: string): Promise<boolean> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id: notificacionId }
    });

    if (!notificacion) {
      throw new NotFoundError('Notificación no encontrada');
    }

    // Si es una notificación específica del usuario, eliminarla
    if (notificacion.usuario_id === usuarioId) {
      const result = await this.notificacionRepository.delete(notificacionId);
      return result.affected !== 0;
    }
    // Si es grupal, solo marcarla como leída para este usuario
    else if (notificacion.es_grupal) {
      try {
        await this.notificacionLecturaRepository.save({
          notificacion_id: notificacionId,
          usuario_id: usuarioId
        });
        return true;
      } catch (error) {
        // Si ya estaba marcada como leída, ignorar el error
        return true;
      }
    }

    return false;
  }
}
