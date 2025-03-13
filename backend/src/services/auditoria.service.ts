import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Auditoria } from '../entities/auditoria.entity';

export class AuditoriaService {
  private auditoriaRepository: Repository<Auditoria>;

  constructor() {
    this.auditoriaRepository = AppDataSource.getRepository(Auditoria);
  }

  /**
   * Registra una acción para auditoría
   */
  async registrarAccion(
    accion: string,
    tabla: string,
    registroId: string,
    usuarioId?: string,
    detalles?: Record<string, any>
  ): Promise<Auditoria | null> {
    try {
      const registro = this.auditoriaRepository.create({
        accion,
        tabla,
        registro_id: registroId,
        usuario_id: usuarioId,
        fecha: new Date(),
        detalles
      });

      return this.auditoriaRepository.save(registro);
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      // En caso de error en la auditoría, loggear pero no interrumpir la operación principal
      return null;
    }
  }

  /**
   * Obtiene el historial de auditoría por entidad
   */
  async getHistorialPorEntidad(tabla: string, registroId: string): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: {
        tabla,
        registro_id: registroId
      },
      relations: ['usuario'],
      order: {
        fecha: 'DESC'
      }
    });
  }

  /**
   * Obtiene el historial de acciones de un usuario
   */
  async getHistorialPorUsuario(usuarioId: string, limit: number = 100): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: {
        usuario_id: usuarioId
      },
      order: {
        fecha: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Obtiene todas las acciones registradas con opciones de filtrado
   */
  async getAll(
    opciones: {
      desde?: Date;
      hasta?: Date;
      accion?: string;
      tabla?: string;
      usuarioId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ registros: Auditoria[], total: number }> {
    const { desde, hasta, accion, tabla, usuarioId, limit = 50, offset = 0 } = opciones;
    
    const query = this.auditoriaRepository.createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario');
    
    if (desde) {
      query.andWhere('auditoria.fecha >= :desde', { desde });
    }

    if (hasta) {
      query.andWhere('auditoria.fecha <= :hasta', { hasta });
    }

    if (accion) {
      query.andWhere('auditoria.accion = :accion', { accion });
    }

    if (tabla) {
      query.andWhere('auditoria.tabla = :tabla', { tabla });
    }

    if (usuarioId) {
      query.andWhere('auditoria.usuario_id = :usuarioId', { usuarioId });
    }

    query.orderBy('auditoria.fecha', 'DESC')
      .limit(limit)
      .offset(offset);

    const [registros, total] = await query.getManyAndCount();

    return { registros, total };
  }
}
