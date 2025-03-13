import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Tarea } from '../entities/tarea.entity';
import { TareasCompletadas } from '../entities/tareas-completadas.entity';
import { TareaAsignaciones } from '../entities/tarea-asignaciones.entity';
import { Reto } from '../entities/reto.entity';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/custom-errors';
import { Usuario } from '../entities/usuario.entity';

export class TareasService {
  private tareaRepository: Repository<Tarea>;
  private tareasCompletadasRepository: Repository<TareasCompletadas>;
  private tareaAsignacionesRepository: Repository<TareaAsignaciones>;
  private retoRepository: Repository<Reto>;
  private usuarioRepository: Repository<Usuario>;

  constructor() {
    this.tareaRepository = AppDataSource.getRepository(Tarea);
    this.tareasCompletadasRepository = AppDataSource.getRepository(TareasCompletadas);
    this.tareaAsignacionesRepository = AppDataSource.getRepository(TareaAsignaciones);
    this.retoRepository = AppDataSource.getRepository(Reto);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
  }

  /**
   * Obtiene todas las tareas (con filtros opcionales)
   */
  async getAllTareas(filtros?: { retoId?: string }): Promise<Tarea[]> {
    const query = this.tareaRepository.createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.reto', 'reto');
    
    if (filtros?.retoId) {
      query.where('tarea.reto_id = :retoId', { retoId: filtros.retoId });
    }
    
    return query.getMany();
  }

  /**
   * Obtiene una tarea por su ID
   */
  async getTareaById(id: string): Promise<Tarea> {
    const tarea = await this.tareaRepository.findOne({
      where: { id },
      relations: ['reto']
    });

    if (!tarea) {
      throw new NotFoundError('Tarea no encontrada');
    }

    return tarea;
  }

  /**
   * Obtiene las tareas asociadas a un reto específico
   */
  async getTareasByReto(retoId: string): Promise<Tarea[]> {
    const reto = await this.retoRepository.findOne({
      where: { id: retoId }
    });

    if (!reto) {
      throw new NotFoundError('Reto no encontrado');
    }

    return this.tareaRepository.find({
      where: { reto_id: retoId },
      order: { fecha_creacion: 'ASC' }
    });
  }

  /**
   * Obtiene las tareas asignadas a un usuario específico
   */
  async getTareasByUsuario(usuarioId: string): Promise<Tarea[]> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Primero, obtener tareas donde el usuario es el asignado principal
    const tareasDirectas = await this.tareaRepository.find({
      where: { asignado_a: usuarioId },
      relations: ['reto']
    });

    // Segundo, obtener tareas donde el usuario está en la tabla de asignaciones
    const asignaciones = await this.tareaAsignacionesRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['tarea', 'tarea.reto']
    });

    // Combinar ambos resultados evitando duplicados
    const idsTareasDirectas = new Set(tareasDirectas.map(t => t.id));
    const tareasDesdeAsignaciones = asignaciones
      .map(a => a.tarea)
      .filter(t => t && !idsTareasDirectas.has(t.id));

    return [...tareasDirectas, ...tareasDesdeAsignaciones];
  }

  /**
   * Crea una nueva tarea
   */
  async createTarea(tareaData: Partial<Tarea>): Promise<Tarea> {
    // Verificar que el reto existe
    if (tareaData.reto_id) {
      const reto = await this.retoRepository.findOne({
        where: { id: tareaData.reto_id }
      });

      if (!reto) {
        throw new NotFoundError('Reto no encontrado');
      }
    }

    // Si se especifica un usuario asignado, verificar que existe
    if (tareaData.asignado_a) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: tareaData.asignado_a }
      });

      if (!usuario) {
        throw new NotFoundError('Usuario asignado no encontrado');
      }
    }

    // Crear y guardar la tarea
    const tarea = this.tareaRepository.create({
      ...tareaData,
      fecha_creacion: new Date()
    });

    return this.tareaRepository.save(tarea);
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTarea(id: string, tareaData: Partial<Tarea>): Promise<Tarea> {
    // Verificar que la tarea existe
    const tarea = await this.getTareaById(id);

    // Si se cambia el reto, verificar que existe
    if (tareaData.reto_id && tareaData.reto_id !== tarea.reto_id) {
      const reto = await this.retoRepository.findOne({
        where: { id: tareaData.reto_id }
      });

      if (!reto) {
        throw new NotFoundError('Reto no encontrado');
      }
    }

    // Si se cambia el usuario asignado, verificar que existe
    if (tareaData.asignado_a && tareaData.asignado_a !== tarea.asignado_a) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: tareaData.asignado_a }
      });

      if (!usuario) {
        throw new NotFoundError('Usuario asignado no encontrado');
      }
    }

    // Actualizar la tarea
    await this.tareaRepository.update(id, {
      ...tareaData,
      fecha_modificacion: new Date()
    });

    // Devolver la tarea actualizada
    return this.getTareaById(id);
  }

  /**
   * Elimina una tarea
   */
  async deleteTarea(id: string): Promise<boolean> {
    // Verificar que la tarea existe
    const tarea = await this.getTareaById(id);

    // Primero eliminar registros relacionados para mantener la integridad referencial
    await this.tareaAsignacionesRepository.delete({ tarea_id: id });
    await this.tareasCompletadasRepository.delete({ tarea_id: id });

    // Finalmente eliminar la tarea
    const result = await this.tareaRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Asigna una tarea a un usuario
   */
  async asignarTarea(tareaId: string, usuarioId: string, rolAsignacion: string = 'responsable'): Promise<TareaAsignaciones> {
    // Verificar que la tarea existe
    await this.getTareaById(tareaId);

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar si ya existe la asignación
    const asignacionExistente = await this.tareaAsignacionesRepository.findOne({
      where: {
        tarea_id: tareaId,
        usuario_id: usuarioId
      }
    });

    if (asignacionExistente) {
      // Actualizar el rol si es diferente
      if (asignacionExistente.rol_asignacion !== rolAsignacion) {
        asignacionExistente.rol_asignacion = rolAsignacion;
        return this.tareaAsignacionesRepository.save(asignacionExistente);
      }
      return asignacionExistente;
    }

    // Crear una nueva asignación
    const asignacion = this.tareaAsignacionesRepository.create({
      tarea_id: tareaId,
      usuario_id: usuarioId,
      rol_asignacion: rolAsignacion,
      fecha_asignacion: new Date()
    });

    return this.tareaAsignacionesRepository.save(asignacion);
  }

  /**
   * Elimina la asignación de una tarea a un usuario
   */
  async eliminarAsignacion(tareaId: string, usuarioId: string): Promise<boolean> {
    const result = await this.tareaAsignacionesRepository.delete({
      tarea_id: tareaId,
      usuario_id: usuarioId
    });

    return result.affected !== 0;
  }

  /**
   * Obtiene todas las asignaciones de una tarea
   */
  async getAsignacionesTarea(tareaId: string): Promise<TareaAsignaciones[]> {
    return this.tareaAsignacionesRepository.find({
      where: { tarea_id: tareaId },
      relations: ['usuario']
    });
  }

  /**
   * Marca una tarea como completada por un usuario
   */
  async marcarTareaCompletada(
    tareaId: string,
    usuarioId: string,
    progreso: number = 100,
    comentario?: string
  ): Promise<TareasCompletadas> {
    // Verificar que la tarea existe
    const tarea = await this.getTareaById(tareaId);

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar si la tarea ya está completada por este usuario
    const tareaCompletadaExistente = await this.tareasCompletadasRepository.findOne({
      where: {
        tarea_id: tareaId,
        usuario_id: usuarioId
      }
    });

    if (tareaCompletadaExistente) {
      // Actualizar el registro existente
      tareaCompletadaExistente.progreso = progreso;
      tareaCompletadaExistente.comentario = comentario || tareaCompletadaExistente.comentario;
      tareaCompletadaExistente.fecha_completado = new Date();
      
      await this.tareasCompletadasRepository.save(tareaCompletadaExistente);
      
      // Si este usuario es el asignado principal, actualizar el estado de la tarea
      if (tarea.asignado_a === usuarioId) {
        await this.tareaRepository.update(tareaId, {
          completado: progreso >= 100,
          // Corregido: usar el nombre correcto del campo según la entidad Tarea
          fecha_modificacion: new Date() // Usamos fecha_modificacion en lugar de fecha_completado
        });
      }
      
      return tareaCompletadaExistente;
    }

    // Crear un nuevo registro de tarea completada
    const tareaCompletada = this.tareasCompletadasRepository.create({
      tarea_id: tareaId,
      usuario_id: usuarioId,
      progreso,
      comentario,
      fecha_completado: new Date()
    });

    await this.tareasCompletadasRepository.save(tareaCompletada);
    
    // Si este usuario es el asignado principal, actualizar el estado de la tarea
    if (tarea.asignado_a === usuarioId) {
      await this.tareaRepository.update(tareaId, {
        completado: progreso >= 100,
        // Corregido: usar el nombre correcto del campo según la entidad Tarea
        fecha_modificacion: new Date() // Usamos fecha_modificacion en lugar de fecha_completado
      });
    }
    
    return tareaCompletada;
  }

  /**
   * Desmarca una tarea como completada
   */
  async desmarcarTareaCompletada(tareaId: string, usuarioId: string): Promise<boolean> {
    // Verificar que la tarea existe
    const tarea = await this.getTareaById(tareaId);

    // Eliminar el registro de tarea completada
    const result = await this.tareasCompletadasRepository.delete({
      tarea_id: tareaId,
      usuario_id: usuarioId
    });

    // Si este usuario es el asignado principal, actualizar el estado de la tarea
    if (tarea.asignado_a === usuarioId) {
      await this.tareaRepository.update(tareaId, {
        completado: false,
        // Corregido: eliminado el campo fecha_completado que no existe en la entidad
        fecha_modificacion: new Date() // Agregamos fecha de modificación para registrar el cambio
      });
    }

    return result.affected !== 0;
  }

  /**
   * Obtiene todas las tareas completadas por un usuario
   */
  async getTareasCompletadasByUsuario(usuarioId: string): Promise<TareasCompletadas[]> {
    return this.tareasCompletadasRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['tarea', 'tarea.reto'],
      order: { fecha_completado: 'DESC' }
    });
  }

  /**
   * Obtiene el detalle de una tarea completada
   */
  async getTareaCompletadaDetalle(tareaId: string, usuarioId: string): Promise<TareasCompletadas | null> {
    return this.tareasCompletadasRepository.findOne({
      where: {
        tarea_id: tareaId,
        usuario_id: usuarioId
      },
      relations: ['tarea', 'usuario']
    });
  }

  /**
   * Verifica si una tarea está completada por un usuario
   */
  async isTareaCompletadaByUsuario(tareaId: string, usuarioId: string): Promise<boolean> {
    const count = await this.tareasCompletadasRepository.count({
      where: {
        tarea_id: tareaId,
        usuario_id: usuarioId,
        progreso: 100
      }
    });

    return count > 0;
  }

  /**
   * Obtiene las estadísticas de progreso de un reto
   */
  async getEstadisticasProgresoReto(retoId: string, usuarioId: string): Promise<any> {
    const tareas = await this.getTareasByReto(retoId);
    
    if (tareas.length === 0) {
      return {
        total_tareas: 0,
        tareas_completadas: 0,
        porcentaje_completado: 0
      };
    }

    const completadas = await Promise.all(
      tareas.map(tarea => this.isTareaCompletadaByUsuario(tarea.id, usuarioId))
    );

    const tareasCompletadas = completadas.filter(Boolean).length;

    return {
      total_tareas: tareas.length,
      tareas_completadas: tareasCompletadas,
      porcentaje_completado: Math.round((tareasCompletadas / tareas.length) * 100)
    };
  }

  /**
   * Obtiene el reto al que pertenece una tarea
   */
  async getTareaReto(retoId: string): Promise<Reto | null> {
    return this.retoRepository.findOne({
      where: { id: retoId }
    });
  }
}
