import { AppDataSource } from '../data-source';
import { Tarea } from '../entities/tarea.entity';
import { TareaAsignaciones } from '../entities/tarea-asignaciones.entity';
import { TareasCompletadas } from '../entities/tareas-completadas.entity';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { In } from 'typeorm';

export class TareasService {
  private tareaRepository = AppDataSource.getRepository(Tarea);
  private tareaAsignacionesRepository = AppDataSource.getRepository(TareaAsignaciones);
  private tareaCompletadaRepository = AppDataSource.getRepository(TareasCompletadas);

  /**
   * Obtiene todas las tareas con filtros opcionales
   * @param retoId Filtrar por reto específico
   * @param userId Filtrar por usuario asignado
   */
  async findAll(retoId?: string, userId?: string): Promise<Tarea[]> {
    try {
      let query = this.tareaRepository.createQueryBuilder('tarea')
        .leftJoinAndSelect('tarea.reto', 'reto');

      if (retoId) {
        query = query.where('tarea.reto_id = :retoId', { retoId });
      }

      if (userId) {
        query = query.leftJoin('tarea_asignaciones', 'asignacion', 
                            'asignacion.tarea_id = tarea.id')
                    .where('tarea.asignado_a = :userId OR asignacion.usuario_id = :userId', 
                          { userId });
      }

      return await query.getMany();
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      throw new BadRequestError('Error al obtener las tareas');
    }
  }

  /**
   * Obtiene una tarea específica por su ID
   * @param id ID de la tarea
   */
  async findById(id: string): Promise<Tarea> {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id },
        relations: ['reto', 'asignado', 'asignaciones', 'asignaciones.usuario']
      });

      if (!tarea) {
        throw new NotFoundError('Tarea no encontrada');
      }

      return tarea;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error al obtener tarea por ID:', error);
      throw new BadRequestError('Error al obtener la tarea');
    }
  }

  /**
   * Crea una nueva tarea
   * @param tareaData Datos de la tarea a crear
   * @param userId ID del usuario creador
   */
  async create(tareaData: {
    titulo: string;
    descripcion?: string;
    reto_id: string;
    puntos: number;
    fecha_limite?: string;
    tipo?: string;
    asignado_a?: string;
    asignaciones_ids?: string[];
  }, userId: string): Promise<Tarea> {
    try {
      // Validar puntos positivos
      if (tareaData.puntos <= 0) {
        throw new BadRequestError('Los puntos deben ser un valor positivo');
      }

      // Crear y guardar la tarea
      const newTarea = this.tareaRepository.create({
        titulo: tareaData.titulo,
        descripcion: tareaData.descripcion,
        reto_id: tareaData.reto_id,
        puntos: tareaData.puntos,
        fecha_limite: tareaData.fecha_limite,
        tipo: tareaData.tipo,
        asignado_a: tareaData.asignado_a
      });

      const savedTarea = await this.tareaRepository.save(newTarea);

      // Crear asignaciones si existen
      if (tareaData.asignaciones_ids && tareaData.asignaciones_ids.length > 0) {
        await this.asignarUsuarios(savedTarea.id, tareaData.asignaciones_ids);
      }

      return this.findById(savedTarea.id);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error al crear tarea:', error);
      throw new BadRequestError('Error al crear la tarea');
    }
  }

  /**
   * Actualiza una tarea existente
   * @param id ID de la tarea
   * @param tareaData Datos a actualizar
   * @param userId ID del usuario que realiza la actualización
   */
  async update(id: string, tareaData: any, userId: string): Promise<Tarea> {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id }
      });

      if (!tarea) {
        throw new NotFoundError('Tarea no encontrada');
      }

      // Validar puntos positivos si se actualizan
      if (tareaData.puntos !== undefined && tareaData.puntos <= 0) {
        throw new BadRequestError('Los puntos deben ser un valor positivo');
      }

      // Extraer asignaciones_ids para manejarlos separadamente
      const asignaciones_ids = tareaData.asignaciones_ids;
      delete tareaData.asignaciones_ids;

      // Actualizar la tarea
      await this.tareaRepository.update(id, {
        ...tareaData,
        fecha_modificacion: new Date()
      });

      // Actualizar asignaciones si se proporcionan
      if (asignaciones_ids) {
        await this.tareaAsignacionesRepository.delete({ tarea_id: id });
        if (asignaciones_ids.length > 0) {
          await this.asignarUsuarios(id, asignaciones_ids);
        }
      }

      return await this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error al actualizar tarea:', error);
      throw new BadRequestError('Error al actualizar la tarea');
    }
  }

  /**
   * Elimina una tarea
   * @param id ID de la tarea
   * @param userId ID del usuario que solicita la eliminación
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id },
        relations: ['reto']
      });

      if (!tarea) {
        throw new NotFoundError('Tarea no encontrada');
      }

      // Verificar si el usuario tiene permisos para eliminar la tarea
      // (lo ideal sería verificar si es el creador del reto o tiene permisos administrativos)

      await this.tareaRepository.remove(tarea);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al eliminar tarea:', error);
      throw new BadRequestError('Error al eliminar la tarea');
    }
  }

  /**
   * Marca una tarea como completada por un usuario
   * @param tareaId ID de la tarea
   * @param userId ID del usuario
   */
  async completeTarea(tareaId: string, userId: string): Promise<any> {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id: tareaId },
        relations: ['reto']
      });

      if (!tarea) {
        throw new NotFoundError('Tarea no encontrada');
      }

      // Verificar si la tarea ya fue completada por el usuario
      const tareaCompletada = await this.tareaCompletadaRepository.findOne({
        where: {
          tarea_id: tareaId,
          usuario_id: userId
        }
      });

      if (tareaCompletada) {
        throw new ConflictError('Esta tarea ya fue completada');
      }

      // Marcar como completada
      const nuevaTareaCompletada = this.tareaCompletadaRepository.create({
        tarea_id: tareaId,
        usuario_id: userId,
        fecha_completado: new Date()
      });

      await this.tareaCompletadaRepository.save(nuevaTareaCompletada);

      // El trigger actualizará automáticamente el progreso del usuario en el reto

      return {
        completada: true,
        tarea_id: tareaId,
        fecha_completado: nuevaTareaCompletada.fecha_completado
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('Error al completar tarea:', error);
      throw new BadRequestError('Error al completar la tarea');
    }
  }

  /**
   * Desmarca una tarea como completada por un usuario
   * @param tareaId ID de la tarea
   * @param userId ID del usuario
   */
  async uncompleteTarea(tareaId: string, userId: string): Promise<boolean> {
    try {
      const tareaCompletada = await this.tareaCompletadaRepository.findOne({
        where: {
          tarea_id: tareaId,
          usuario_id: userId
        }
      });

      if (!tareaCompletada) {
        throw new NotFoundError('Esta tarea no ha sido completada');
      }

      await this.tareaCompletadaRepository.remove(tareaCompletada);

      // El trigger actualizará automáticamente el progreso del usuario en el reto

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error al desmarcar tarea como completada:', error);
      throw new BadRequestError('Error al desmarcar la tarea como completada');
    }
  }

  /**
   * Verifica si una tarea ha sido completada por un usuario
   * @param tareaId ID de la tarea
   * @param userId ID del usuario
   */
  async isCompleted(tareaId: string, userId: string): Promise<boolean> {
    try {
      return await this.tareaCompletadaRepository.existsBy({
        tarea_id: tareaId,
        usuario_id: userId
      });
    } catch (error) {
      console.error('Error al verificar si la tarea está completada:', error);
      throw new BadRequestError('Error al verificar el estado de la tarea');
    }
  }

  /**
   * Asigna usuarios a una tarea
   * @param tareaId ID de la tarea
   * @param usuariosIds IDs de los usuarios a asignar
   */
  private async asignarUsuarios(tareaId: string, usuariosIds: string[]): Promise<void> {
    try {
      const asignaciones = usuariosIds.map(usuarioId => ({
        tarea_id: tareaId,
        usuario_id: usuarioId
      }));

      await this.tareaAsignacionesRepository.insert(asignaciones);
    } catch (error) {
      console.error('Error al asignar usuarios:', error);
      throw new BadRequestError('Error al asignar usuarios a la tarea');
    }
  }

  /**
   * Obtiene las tareas completadas por un usuario
   * @param userId ID del usuario
   */
  async getTareasCompletadasByUserId(userId: string): Promise<any[]> {
    try {
      return await AppDataSource.query(`
        SELECT 
          t.*,
          tc.fecha_completado,
          r.titulo as reto_titulo
        FROM tareas_completadas tc
        JOIN tareas t ON tc.tarea_id = t.id
        JOIN retos r ON t.reto_id = r.id
        WHERE tc.usuario_id = $1
        ORDER BY tc.fecha_completado DESC
      `, [userId]);
    } catch (error) {
      console.error('Error al obtener tareas completadas:', error);
      throw new BadRequestError('Error al obtener las tareas completadas');
    }
  }
}
