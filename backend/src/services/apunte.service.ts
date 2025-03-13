import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Apunte } from '../entities/apunte.entity';
import { CalificacionApunte } from '../entities/calificacion-apunte.entity';
import { ArchivoGenerico } from '../entities/archivo-generico.entity';

export class ApunteService {
  private apunteRepository: Repository<Apunte>;
  private calificacionRepository: Repository<CalificacionApunte>;
  private archivoRepository: Repository<ArchivoGenerico>;

  constructor() {
    this.apunteRepository = AppDataSource.getRepository(Apunte);
    this.calificacionRepository = AppDataSource.getRepository(CalificacionApunte);
    this.archivoRepository = AppDataSource.getRepository(ArchivoGenerico);
  }

  async getAllApuntes(includePrivate: boolean = false): Promise<Apunte[]> {
    let query = this.apunteRepository.createQueryBuilder('apunte');
    
    if (!includePrivate) {
      query.where('apunte.es_publico = :esPublico', { esPublico: true });
    }

    return query.getMany();
  }

  async getApunteById(id: string): Promise<Apunte | null> {
    return this.apunteRepository.findOne({
      where: { id }
    });
  }

  async getApuntesByUsuario(usuarioId: string, includePrivate: boolean = false): Promise<Apunte[]> {
    let query = this.apunteRepository.createQueryBuilder('apunte')
      .where('apunte.usuario_id = :usuarioId', { usuarioId });
    
    if (!includePrivate) {
      query.andWhere('apunte.es_publico = :esPublico', { esPublico: true });
    }
    
    return query.getMany();
  }

  async getApuntesByReto(retoId: string): Promise<Apunte[]> {
    return this.apunteRepository.find({
      where: { 
        reto_id: retoId, 
        es_publico: true 
      }
    });
  }

  async getApuntesByPlanEstudio(planId: string): Promise<Apunte[]> {
    return this.apunteRepository.find({
      where: { 
        plan_estudio_id: planId, 
        es_publico: true 
      }
    });
  }

  async createApunte(apunteData: Partial<Apunte>): Promise<Apunte> {
    const apunte = this.apunteRepository.create(apunteData);
    return this.apunteRepository.save(apunte);
  }

  async updateApunte(id: string, apunteData: Partial<Apunte>): Promise<Apunte | null> {
    await this.apunteRepository.update(id, apunteData);
    return this.getApunteById(id);
  }

  async deleteApunte(id: string): Promise<boolean> {
    const result = await this.apunteRepository.delete(id);
    return result.affected !== 0;
  }

  async calificarApunte(apunteId: string, usuarioId: string, calificacion: number, comentario?: string): Promise<CalificacionApunte> {
    // Comprobar si ya existe una calificación del usuario
    let calificacionExistente = await this.calificacionRepository.findOne({
      where: { 
        apunte_id: apunteId, 
        usuario_id: usuarioId 
      }
    });
    
    if (calificacionExistente) {
      calificacionExistente.calificacion = calificacion;
      calificacionExistente.comentario = comentario ?? "";
      return this.calificacionRepository.save(calificacionExistente);
    } else {
      const nuevaCalificacion = this.calificacionRepository.create({
        apunte_id: apunteId,
        usuario_id: usuarioId,
        calificacion,
        comentario,
      });
      return this.calificacionRepository.save(nuevaCalificacion);
    }
  }

  async getCalificacionesApunte(apunteId: string): Promise<CalificacionApunte[]> {
    return this.calificacionRepository.find({
      where: { apunte_id: apunteId }
    });
  }

  async adjuntarArchivo(apunteId: string, archivoData: Partial<ArchivoGenerico>): Promise<ArchivoGenerico> {
    const archivo = this.archivoRepository.create({
      ...archivoData,
      entidad: 'apunte',
      entidad_id: apunteId,
    });
    return this.archivoRepository.save(archivo);
  }

  async getArchivosApunte(apunteId: string): Promise<ArchivoGenerico[]> {
    return this.archivoRepository.find({
      where: { 
        entidad: 'apunte', 
        entidad_id: apunteId 
      }
    });
  }
}
