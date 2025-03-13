import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Tarea } from '../entities/tarea.entity';
import { TareasCompletadas } from '../entities/tareas-completadas.entity';
import { TareaAsignaciones } from '../entities/tarea-asignaciones.entity';
import { Usuario } from '../entities/usuario.entity';
import { Reto } from '../entities/reto.entity';

export class TareaService {
  private tareaRepository: Repository<Tarea>;
  private tareasCompletadasRepository: Repository<TareasCompletadas>;
  private tareaAsignacionesRepository: Repository<TareaAsignaciones>;
  private usuarioRepository: Repository<Usuario>;
  private retoRepository: Repository<Reto>;

  constructor() {
    this.tareaRepository = AppDataSource.getRepository(Tarea);
    this.tareasCompletadasRepository = AppDataSource.getRepository(TareasCompletadas);
    this.tareaAsignacionesRepository = AppDataSource.getRepository(TareaAsignaciones);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.retoRepository = AppDataSource.getRepository(Reto);
  }

  async getAllTareas(): Promise<Tarea[]> {
    return this.tareaRepository.find();
  }

  async getTareaById(id: string): Promise<Tarea | null> {
    return this.tareaRepository.findOne({
      where: { id }
    });
  }

  async getTareasByReto(retoId: string): Promise<Tarea[]> {
    return this.tareaRepository.find({
      where: { reto_id: retoId }
    });
  }

  async getTareasByUsuario(usuarioId: string): Promise<Tarea[]> {
    // Buscar tareas donde el usuario es el asignado principal
    const tareasDirectas = await this.tareaRepository.find({
      where: { asignado_a: usuarioId }
    });

    // Buscar tareas donde el usuario está en tarea_asignaciones
    const asignaciones = await this.tareaAsignacionesRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['tarea']
    });

    const tareasAsignadas = asignaciones.map(asignacion => asignacion.tarea);
    
    // Combinar ambos resultados eliminando duplicados
    const todasTareas = [...tareasDirectas];
    tareasAsignadas.forEach(tarea => {
      if (!todasTareas.some(t => t.id === tarea.id)) {
        todasTareas.push(tarea);
      }
    });
    
    return todasTareas;
  }

  async createTarea(tareaData: Partial<Tarea>): Promise<Tarea> {
    const tarea = this.tareaRepository.create(tareaData);
    return this.tareaRepository.save(tarea);
  }

  async updateTarea(id: string, tareaData: Partial<Tarea>): Promise<Tarea | null> {
    await this.tareaRepository.update(id, tareaData);
    return this.getTareaById(id);
  }

  async deleteTarea(id: string): Promise<boolean> {
    const result = await this.tareaRepository.delete(id);
    return result.affected !== 0;
  }

  async marcarTareaCompletada(tareaId: string, usuarioId: string, progreso: number = 100, comentario?: string): Promise<TareasCompletadas> {
    const tareaCompletada = this.tareasCompletadasRepository.create({
      tarea_id: tareaId,
      usuario_id: usuarioId,
      progreso,
      comentario,
      fecha_completado: new Date()
    });
    
    // También actualiza el estado de la tarea si es el asignado principal
    const tarea = await this.tareaRepository.findOne({
      where: { 
        id: tareaId, 
        asignado_a: usuarioId 
      }
    });
    
    if (tarea) {
      tarea.completado = progreso === 100;
      await this.tareaRepository.save(tarea);
    }
    
    return this.tareasCompletadasRepository.save(tareaCompletada);
  }

  async asignarTarea(tareaId: string, usuarioId: string, rolAsignacion: string = 'responsable'): Promise<TareaAsignaciones> {
    const asignacion = this.tareaAsignacionesRepository.create({
      tarea_id: tareaId,
      usuario_id: usuarioId,
      fecha_asignacion: new Date(),
      rol_asignacion: rolAsignacion
    });
    
    return this.tareaAsignacionesRepository.save(asignacion);
  }

  async getAsignacionesTarea(tareaId: string): Promise<TareaAsignaciones[]> {
    return this.tareaAsignacionesRepository.find({
      where: { tarea_id: tareaId }
    });
  }

  async getTareasCompletadasByUsuario(usuarioId: string): Promise<TareasCompletadas[]> {
    return this.tareasCompletadasRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['tarea']
    });
  }
}
