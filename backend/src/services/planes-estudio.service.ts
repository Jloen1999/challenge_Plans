import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { PlanEstudio } from '../entities/plan-estudio.entity';
import { RetoPlanEstudio } from '../entities/reto-planes-estudio.entity';
import { Reto } from '../entities/reto.entity';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';

export class PlanesEstudioService {
  private planEstudioRepository: Repository<PlanEstudio>;
  private retoPlanEstudioRepository: Repository<RetoPlanEstudio>;
  private retoRepository: Repository<Reto>;

  constructor() {
    this.planEstudioRepository = AppDataSource.getRepository(PlanEstudio);
    this.retoPlanEstudioRepository = AppDataSource.getRepository(RetoPlanEstudio);
    this.retoRepository = AppDataSource.getRepository(Reto);
  }

  /**
   * Obtiene todos los planes de estudio (públicos o todos si es admin)
   */
  async findAll(isAdmin: boolean = false, userId?: string): Promise<PlanEstudio[]> {
    try {
      let query = this.planEstudioRepository.createQueryBuilder('plan')
        .leftJoinAndSelect('plan.usuario', 'usuario')
        .select([
          'plan.id', 'plan.titulo', 'plan.descripcion', 'plan.fecha_inicio', 
          'plan.duracion_dias', 'plan.es_publico', 'plan.fecha_creacion',
          'usuario.id', 'usuario.nombre'
        ]);

      // Si no es admin, mostrar solo planes públicos o propios del usuario
      if (!isAdmin) {
        if (userId) {
          query = query.where('(plan.es_publico = :esPublico OR plan.usuario_id = :userId)', { 
            esPublico: true, userId 
          });
        } else {
          query = query.where('plan.es_publico = :esPublico', { esPublico: true });
        }
      }

      return query.getMany();
    } catch (error) {
      console.error('Error al obtener planes de estudio:', error);
      throw new BadRequestError('Error al obtener los planes de estudio');
    }
  }

  /**
   * Obtiene un plan de estudio por su ID
   */
  async findById(id: string, userId?: string): Promise<PlanEstudio> {
    try {
      const plan = await this.planEstudioRepository.findOne({
        where: { id },
        relations: ['usuario']
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      // Verificar acceso: planes privados solo visibles para el creador
      if (!plan.es_publico && (!userId || userId !== plan.usuario_id)) {
        throw new ForbiddenError('No tienes acceso a este plan de estudio');
      }

      return plan;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al obtener plan de estudio:', error);
      throw new BadRequestError('Error al obtener el plan de estudio');
    }
  }

  /**
   * Crea un nuevo plan de estudio
   */
  async create(planData: {
    titulo: string;
    descripcion?: string;
    fecha_inicio?: Date;
    duracion_dias?: number;
    es_publico?: boolean;
    retos_ids?: string[];
  }, userId: string): Promise<PlanEstudio> {
    try {
      // Validar datos
      if (!planData.titulo) {
        throw new BadRequestError('El título es obligatorio');
      }

      // Preparar datos para crear plan
      const newPlanData: any = {
        titulo: planData.titulo,
        descripcion: planData.descripcion,
        fecha_inicio: planData.fecha_inicio || new Date(),
        duracion_dias: planData.duracion_dias,
        es_publico: planData.es_publico ?? false,
        usuario_id: userId
      };

      // Crear y guardar plan
      const newPlan = this.planEstudioRepository.create(newPlanData);
      const savedPlan = await this.planEstudioRepository.save(newPlan);

      // Asegurarse de que savedPlan es un objeto único, no un array
      const plan = Array.isArray(savedPlan) ? savedPlan[0] : savedPlan;

      // Asignar retos si se proporcionan
      if (planData.retos_ids && planData.retos_ids.length > 0) {
        await this.asignarRetos(plan.id, planData.retos_ids);
      }

      return this.findById(plan.id, userId);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error al crear plan de estudio:', error);
      throw new BadRequestError('Error al crear el plan de estudio');
    }
  }

  /**
   * Actualiza un plan de estudio existente
   */
  async update(id: string, planData: any, userId: string): Promise<PlanEstudio> {
    try {
      const plan = await this.planEstudioRepository.findOne({
        where: { id }
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      // Verificar permisos: solo el creador puede editar
      if (plan.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para editar este plan de estudio');
      }

      // Extraer retos_ids antes de actualizar
      const retos_ids = planData.retos_ids;
      delete planData.retos_ids;

      // Actualizar plan
      await this.planEstudioRepository.update(id, {
        titulo: planData.titulo,
        descripcion: planData.descripcion,
        fecha_inicio: planData.fecha_inicio,
        duracion_dias: planData.duracion_dias,
        es_publico: planData.es_publico
      });

      // Actualizar retos asociados si se proporcionan
      if (retos_ids && Array.isArray(retos_ids)) {
        await this.retoPlanEstudioRepository.delete({ plan_estudio_id: id });
        if (retos_ids.length > 0) {
          await this.asignarRetos(id, retos_ids);
        }
      }

      return this.findById(id, userId);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error al actualizar plan de estudio:', error);
      throw new BadRequestError('Error al actualizar el plan de estudio');
    }
  }

  /**
   * Elimina un plan de estudio
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const plan = await this.planEstudioRepository.findOne({
        where: { id }
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      // Verificar permisos: solo el creador puede eliminar
      if (plan.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para eliminar este plan de estudio');
      }

      await this.planEstudioRepository.delete(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al eliminar plan de estudio:', error);
      throw new BadRequestError('Error al eliminar el plan de estudio');
    }
  }

  /**
   * Obtiene los retos asociados a un plan de estudio
   */
  async getRetosByPlanId(planId: string, userId?: string): Promise<any[]> {
    try {
      const plan = await this.planEstudioRepository.findOne({
        where: { id: planId }
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      // Verificar acceso: planes privados solo visibles para el creador
      if (!plan.es_publico && (!userId || userId !== plan.usuario_id)) {
        throw new ForbiddenError('No tienes acceso a este plan de estudio');
      }

      // Obtener retos asociados
      return AppDataSource.query(`
        SELECT r.*, rpe.fecha_asociacion
        FROM retos r
        JOIN reto_planes_estudio rpe ON r.id = rpe.reto_id
        WHERE rpe.plan_estudio_id = $1
        ORDER BY rpe.fecha_asociacion ASC
      `, [planId]);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al obtener retos del plan:', error);
      throw new BadRequestError('Error al obtener los retos del plan de estudio');
    }
  }

  /**
   * Asigna retos a un plan de estudio
   */
  async asignarRetos(planId: string, retosIds: string[]): Promise<void> {
    try {
      // Verificar que el plan existe
      const plan = await this.planEstudioRepository.findOne({
        where: { id: planId }
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      // Verificar que los retos existen
      for (const retoId of retosIds) {
        const retoExists = await this.retoRepository.findOne({
          where: { id: retoId }
        });

        if (!retoExists) {
          throw new NotFoundError(`Reto con ID ${retoId} no encontrado`);
        }
      }

      // Crear relaciones
      for (const retoId of retosIds) {
        await this.retoPlanEstudioRepository.save({
          reto_id: retoId,
          plan_estudio_id: planId,
          fecha_asociacion: new Date()
        });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error al asignar retos al plan:', error);
      throw new BadRequestError('Error al asignar retos al plan de estudio');
    }
  }

  /**
   * Elimina un reto de un plan de estudio
   */
  async eliminarReto(planId: string, retoId: string, userId: string): Promise<boolean> {
    try {
      // Verificar que el plan existe y el usuario es el creador
      const plan = await this.planEstudioRepository.findOne({
        where: { id: planId }
      });

      if (!plan) {
        throw new NotFoundError('Plan de estudio no encontrado');
      }

      if (plan.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para modificar este plan');
      }

      // Eliminar la relación
      const result = await this.retoPlanEstudioRepository.delete({
        reto_id: retoId,
        plan_estudio_id: planId
      });

      return result.affected !== 0;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al eliminar reto del plan:', error);
      throw new BadRequestError('Error al eliminar el reto del plan de estudio');
    }
  }

  /**
   * Busca planes de estudio por término
   */
  async search(term: string, userId?: string): Promise<PlanEstudio[]> {
    try {
      let query = this.planEstudioRepository.createQueryBuilder('plan')
        .leftJoinAndSelect('plan.usuario', 'usuario')
        .where('(plan.titulo ILIKE :term OR plan.descripcion ILIKE :term)', { term: `%${term}%` });

      // Filtrar por planes públicos o propios del usuario
      if (userId) {
        query = query.andWhere('(plan.es_publico = :esPublico OR plan.usuario_id = :userId)', {
          esPublico: true, userId
        });
      } else {
        query = query.andWhere('plan.es_publico = :esPublico', { esPublico: true });
      }

      return query.getMany();
    } catch (error) {
      console.error('Error al buscar planes de estudio:', error);
      throw new BadRequestError('Error al buscar planes de estudio');
    }
  }

  /**
   * Obtiene planes de estudio populares
   */
  async getPopularPlanes(limit: number = 10): Promise<any[]> {
    try {
      // Obtener planes de estudio con estadísticas de uso
      return AppDataSource.query(`
        SELECT 
          pe.*,
          u.nombre as creador_nombre,
          COUNT(DISTINCT rpe.reto_id) as retos_count,
          (
            SELECT COUNT(*)
            FROM apuntes a 
            WHERE a.plan_estudio_id = pe.id
          ) as apuntes_count
        FROM planes_estudio pe
        LEFT JOIN usuarios u ON pe.usuario_id = u.id
        LEFT JOIN reto_planes_estudio rpe ON pe.id = rpe.plan_estudio_id
        WHERE pe.es_publico = true
        GROUP BY pe.id, u.nombre
        ORDER BY apuntes_count DESC, retos_count DESC
        LIMIT $1
      `, [limit]);
    } catch (error) {
      console.error('Error al obtener planes populares:', error);
      throw new BadRequestError('Error al obtener los planes de estudio populares');
    }
  }

  /**
   * Obtiene planes de estudio creados por un usuario específico
   */
  async getPlanesByUserId(userId: string, requesterId?: string): Promise<PlanEstudio[]> {
    try {
      let query = this.planEstudioRepository.createQueryBuilder('plan')
        .leftJoinAndSelect('plan.usuario', 'usuario')
        .where('plan.usuario_id = :userId', { userId });

      // Si quien solicita no es el creador, mostrar solo planes públicos
      if (!requesterId || requesterId !== userId) {
        query = query.andWhere('plan.es_publico = :esPublico', { esPublico: true });
      }

      return query.getMany();
    } catch (error) {
      console.error('Error al obtener planes del usuario:', error);
      throw new BadRequestError('Error al obtener los planes de estudio del usuario');
    }
  }
}
