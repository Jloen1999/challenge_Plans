import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Comentario } from '../entities/comentario.entity';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

export class ComentarioService {
  private comentarioRepository: Repository<Comentario>;

  constructor() {
    this.comentarioRepository = AppDataSource.getRepository(Comentario);
  }

  /**
   * Obtiene comentarios por entidad y su ID
   */
  async getByEntidad(entidad: string, entidadId: string): Promise<Comentario[]> {
    // Validar que el tipo de entidad sea válido
    if (!['reto', 'tarea', 'apunte', 'plan_estudio'].includes(entidad)) {
      throw new BadRequestError('Tipo de entidad inválido');
    }

    return this.comentarioRepository.find({
      where: {
        entidad,
        entidad_id: entidadId,
        comentario_padre_id: IsNull() // Solo comentarios raíz, no respuestas
      },
      relations: ['usuario'],
      order: {
        fecha_creacion: 'DESC'
      }
    });
  }

  /**
   * Obtiene respuestas a un comentario específico
   */
  async getRespuestas(comentarioId: string): Promise<Comentario[]> {
    return this.comentarioRepository.find({
      where: {
        comentario_padre_id: comentarioId
      },
      relations: ['usuario'],
      order: {
        fecha_creacion: 'ASC'
      }
    });
  }

  /**
   * Crea un nuevo comentario
   */
  async create(comentarioData: {
    usuario_id: string;
    entidad: string;
    entidad_id: string;
    contenido: string;
    comentario_padre_id?: string;
  }): Promise<Comentario> {
    // Validar que el tipo de entidad sea válido
    if (!['reto', 'tarea', 'apunte', 'plan_estudio'].includes(comentarioData.entidad)) {
      throw new BadRequestError('Tipo de entidad inválido');
    }

    // Validar que la entidad existe
    const entidadExiste = await this.validarEntidadExiste(
      comentarioData.entidad,
      comentarioData.entidad_id
    );

    if (!entidadExiste) {
      throw new NotFoundError(`La entidad ${comentarioData.entidad} con ID ${comentarioData.entidad_id} no existe`);
    }

    // Si es una respuesta, validar que el comentario padre existe
    if (comentarioData.comentario_padre_id) {
      const comentarioPadre = await this.comentarioRepository.findOne({
        where: { id: comentarioData.comentario_padre_id }
      });

      if (!comentarioPadre) {
        throw new NotFoundError('El comentario padre no existe');
      }

      // Validar que el comentario padre está en la misma entidad
      if (comentarioPadre.entidad !== comentarioData.entidad || 
          comentarioPadre.entidad_id !== comentarioData.entidad_id) {
        throw new BadRequestError('El comentario padre no pertenece a la misma entidad');
      }
    }

    const comentario = this.comentarioRepository.create(comentarioData);
    return this.comentarioRepository.save(comentario);
  }

  /**
   * Actualiza un comentario existente
   */
  async update(id: string, usuarioId: string, contenido: string): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id }
    });

    if (!comentario) {
      throw new NotFoundError('Comentario no encontrado');
    }

    // Solo el autor puede editar su comentario
    if (comentario.usuario_id !== usuarioId) {
      throw new BadRequestError('No tienes permiso para editar este comentario');
    }

    comentario.contenido = contenido;
    comentario.fecha_modificacion = new Date();

    return this.comentarioRepository.save(comentario);
  }

  /**
   * Elimina un comentario
   */
  async delete(id: string, usuarioId: string, isAdmin: boolean = false): Promise<boolean> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id }
    });

    if (!comentario) {
      throw new NotFoundError('Comentario no encontrado');
    }

    // Solo el autor o un administrador puede eliminar un comentario
    if (!isAdmin && comentario.usuario_id !== usuarioId) {
      throw new BadRequestError('No tienes permiso para eliminar este comentario');
    }

    const result = await this.comentarioRepository.delete(id);
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
    }

    const result = await AppDataSource.query(query, [entidadId]);
    return parseInt(result[0].count) > 0;
  }

  /**
   * Obtiene el conteo de comentarios por entidad
   */
  async getComentariosCount(entidad: string, entidadId: string): Promise<number> {
    const result = await this.comentarioRepository.count({
      where: {
        entidad,
        entidad_id: entidadId
      }
    });
    
    return result;
  }
}
