import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ArchivoGenerico } from '../entities/archivo-generico.entity';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

export class ArchivoService {
  private archivoRepository: Repository<ArchivoGenerico>;

  constructor() {
    this.archivoRepository = AppDataSource.getRepository(ArchivoGenerico);
  }

  /**
   * Obtiene archivos por entidad y su ID
   */
  async getByEntidad(entidad: string, entidadId: string): Promise<ArchivoGenerico[]> {
    // Validar que el tipo de entidad sea válido
    if (!['apunte', 'tarea', 'reto', 'plan_estudio', 'comentario'].includes(entidad)) {
      throw new BadRequestError('Tipo de entidad inválido');
    }

    return this.archivoRepository.find({
      where: {
        entidad,
        entidad_id: entidadId
      },
      order: {
        fecha_subida: 'DESC'
      }
    });
  }

  /**
   * Obtiene un archivo por su ID
   */
  async getById(id: string): Promise<ArchivoGenerico> {
    const archivo = await this.archivoRepository.findOne({
      where: { id }
    });

    if (!archivo) {
      throw new NotFoundError('Archivo no encontrado');
    }

    return archivo;
  }

  /**
   * Crea un nuevo registro de archivo
   */
  async create(archivoData: {
    entidad: string;
    entidad_id: string;
    nombre: string;
    url: string;
    formato: string;
    tamaño_bytes?: number;
    subido_por?: string;
  }): Promise<ArchivoGenerico> {
    // Validar que el tipo de entidad sea válido
    if (!['apunte', 'tarea', 'reto', 'plan_estudio', 'comentario'].includes(archivoData.entidad)) {
      throw new BadRequestError('Tipo de entidad inválido');
    }

    // Validar que la entidad existe
    const entidadExiste = await this.validarEntidadExiste(
      archivoData.entidad,
      archivoData.entidad_id
    );

    if (!entidadExiste) {
      throw new NotFoundError(`La entidad ${archivoData.entidad} con ID ${archivoData.entidad_id} no existe`);
    }

    const archivo = this.archivoRepository.create({
      entidad: archivoData.entidad,
      entidad_id: archivoData.entidad_id,
      nombre: archivoData.nombre,
      url: archivoData.url,
      formato: archivoData.formato,
      tamaño_bytes: archivoData.tamaño_bytes,
      subido_por: archivoData.subido_por,
      fecha_subida: new Date()
    });

    return this.archivoRepository.save(archivo);
  }

  /**
   * Actualiza un archivo existente
   */
  async update(id: string, archivoData: Partial<ArchivoGenerico>): Promise<ArchivoGenerico> {
    const archivo = await this.archivoRepository.findOne({
      where: { id }
    });

    if (!archivo) {
      throw new NotFoundError('Archivo no encontrado');
    }

    // No permitir cambiar la entidad o entidad_id
    delete archivoData.entidad;
    delete archivoData.entidad_id;

    // Actualizar otros campos
    await this.archivoRepository.update(id, archivoData);

    return this.getById(id);
  }

  /**
   * Elimina un archivo
   */
  async delete(id: string): Promise<boolean> {
    const archivo = await this.archivoRepository.findOne({
      where: { id }
    });

    if (!archivo) {
      throw new NotFoundError('Archivo no encontrado');
    }

    const result = await this.archivoRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Valida si una entidad existe en su tabla correspondiente
   */
  private async validarEntidadExiste(entidad: string, entidadId: string): Promise<boolean> {
    let query = '';
    
    switch (entidad) {
      case 'reto':
        query = 'SELECT COUNT(*) as count FROM retos WHERE id = $1';
        break;
      case 'tarea':
        query = 'SELECT COUNT(*) as count FROM tareas WHERE id = $1';
        break;
      case 'apunte':
        query = 'SELECT COUNT(*) as count FROM apuntes WHERE id = $1';
        break;
      case 'plan_estudio':
        query = 'SELECT COUNT(*) as count FROM planes_estudio WHERE id = $1';
        break;
      case 'comentario':
        query = 'SELECT COUNT(*) as count FROM comentarios WHERE id = $1';
        break;
      default:
        return false;
    }

    const result = await AppDataSource.query(query, [entidadId]);
    return parseInt(result[0].count) > 0;
  }
}
