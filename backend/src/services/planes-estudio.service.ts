import { AppDataSource } from '../data-source';
import { PlanEstudio } from '../entities/plan-estudio.entity';
import { RetoPlanEstudio } from '../entities/reto-planes-estudio.entity';
import { Reto } from '../entities/reto.entity';
import { Categoria } from '../entities/categoria.entity';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { In, DeepPartial, Like } from 'typeorm';

export class PlanesEstudioService {
  private planEstudioRepository = AppDataSource.getRepository(PlanEstudio);
  private retoPlanEstudioRepository = AppDataSource.getRepository(RetoPlanEstudio);
  private retoRepository = AppDataSource.getRepository(Reto);

  /**
   * Obtiene todos los planes de estudio públicos o todos si es administrador
   * @param isAdmin Indica si el usuario es administrador
   * @param userId ID del usuario (opcional, para incluir planes privados del usuario)
   * @returns Lista de planes de estudio
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

      // Ejecutar consulta
      return await query.getMany();
    } catch (error) {
      console.error('Error al obtener planes de estudio:', error);
      throw error;
    }
  }

  /**
   * Obtiene un plan de estudio por su ID
   * @param id ID del plan de estudio
   * @param userId ID del usuario que solicita (opcional, para verificar acceso)
   * @returns Detalles del plan de estudio
   */
  async findById(id: string, userId?: string): Promise<PlanEstudio> {
    const planEstudio = await this.planEstudioRepository.findOne({
      where: { id },
      relations: ['usuario', 'retosRelaciones', 'retosRelaciones.reto']
    });

    if (!planEstudio) {
      throw new NotFoundError('Plan de estudio no encontrado');
    }

    // Verificar acceso: planes privados solo visibles para el creador o admin
    if (!planEstudio.es_publico && (!userId || planEstudio.usuario_id !== userId)) {
      throw new ForbiddenError('No tienes acceso a este plan de estudio');
    }

    return planEstudio;
  }

  /**
   * Crea un nuevo plan de estudio
   * @param planData Datos del plan a crear
   * @param userId ID del usuario creador
   * @returns Plan de estudio creado
   */
  async create(planData: {
    titulo: string;
    descripcion?: string;
    fecha_inicio?: Date;
    duracion_dias?: number;
    es_publico?: boolean;
    retos_ids?: string[];
  }, userId: string): Promise<PlanEstudio> {
    // Validaciones
    if (!planData.titulo || planData.titulo.trim() === '') {
      throw new BadRequestError('El título es obligatorio');
    }

    if (planData.duracion_dias && planData.duracion_dias <= 0) {
      throw new BadRequestError('La duración debe ser un número positivo de días');
    }

    // Crear objeto del plan de estudio
    const fechaInicio = planData.fecha_inicio ? new Date(planData.fecha_inicio) : new Date();

    const newPlanData: any = {
      usuario_id: userId,
      titulo: planData.titulo,
      descripcion: planData.descripcion,
      fecha_inicio: fechaInicio.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
      duracion_dias: planData.duracion_dias || null,
      es_publico: planData.es_publico ?? false,
    };

    // Crear y guardar el plan
    const newPlan = this.planEstudioRepository.create(newPlanData);
    const result = await this.planEstudioRepository.save(newPlan);

    // Manejar el caso donde save() podría devolver un array o un objeto único
    const savedPlan = Array.isArray(result) ? result[0] : result;

    // Asignar retos si se proporcionan
    const retos_ids = planData.retos_ids;
    if (retos_ids && Array.isArray(retos_ids) && retos_ids.length > 0) {
      await this.asignarRetos(savedPlan.id, retos_ids);
    }

    // Retornar plan con relaciones cargadas
    return this.findById(savedPlan.id);
  }

  /**
   * Actualiza un plan de estudio existente
   * @param id ID del plan de estudio
   * @param planData Datos a actualizar
   * @param userId ID del usuario que hace la actualización
   * @returns Plan de estudio actualizado
   */
  async update(id: string, planData: any, userId: string): Promise<PlanEstudio> {
    const planEstudio = await this.planEstudioRepository.findOne({
      where: { id }
    });

    if (!planEstudio) {
      throw new NotFoundError('Plan de estudio no encontrado');
    }

    // Verificar permisos: solo el creador puede editar
    if (planEstudio.usuario_id !== userId) {
      throw new ForbiddenError('No tienes permiso para editar este plan de estudio');
    }

    // Validaciones específicas
    if (planData.duracion_dias && planData.duracion_dias <= 0) {
      throw new BadRequestError('La duración debe ser un número positivo de días');
    }

    // Extraer retos_ids antes de actualizar (no es un campo de la tabla)
    const retos_ids = planData.retos_ids;
    delete planData.retos_ids;

    // Si fecha_inicio viene como string, convertir a formato adecuado
    if (planData.fecha_inicio && typeof planData.fecha_inicio === 'string') {
      planData.fecha_inicio = new Date(planData.fecha_inicio).toISOString().split('T')[0];
    }

    // Actualizar el plan con los campos permitidos
    await this.planEstudioRepository.update(id, {
      ...planData,
      // No permitir actualizar estos campos manualmente:
      usuario_id: undefined,
      fecha_creacion: undefined,
      fecha_modificacion: undefined
    });
    
    // Actualizar retos asociados si se proporcionan
    if (retos_ids && Array.isArray(retos_ids)) {
      await this.retoPlanEstudioRepository.delete({ plan_estudio_id: id });
      if (retos_ids.length > 0) {
        await this.asignarRetos(id, retos_ids);
      }
    }
    
    // Obtener el plan actualizado con sus relaciones
    return await this.findById(id);
  }

  /**
   * Elimina un plan de estudio
   * @param id ID del plan de estudio
   * @param userId ID del usuario que solicita la eliminación
   * @returns Resultado de la operación
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const planEstudio = await this.planEstudioRepository.findOne({
      where: { id }
    });

    if (!planEstudio) {
      throw new NotFoundError('Plan de estudio no encontrado');
    }

    if (planEstudio.usuario_id !== userId) {
      throw new ForbiddenError('No tienes permiso para eliminar este plan de estudio');
    }

    // Eliminar el plan (las relaciones se eliminan automáticamente por CASCADE)
    await this.planEstudioRepository.delete(id);
    return true;
  }

  /**
   * Obtiene todos los retos asociados a un plan de estudio
   * @param planId ID del plan de estudio
   * @param userId ID del usuario que solicita (opcional, para verificar acceso)
   * @returns Lista de retos asociados al plan
   */
  async getRetosByPlanId(planId: string, userId?: string): Promise<Reto[]> {
    // Primero verificar acceso al plan
    const planEstudio = await this.findById(planId, userId);
    
    // Consulta optimizada para obtener los retos con metadatos adicionales
    const retos = await AppDataSource.query(`
      SELECT 
        r.*,
        rpe.fecha_asociacion,
        (
          SELECT STRING_AGG(c.nombre, ', ')
          FROM reto_categorias rc
          JOIN categorias c ON rc.categoria_id = c.id
          WHERE rc.reto_id = r.id
        ) as categorias_nombres,
        COUNT(t.id) as total_tareas
      FROM retos r
      JOIN reto_planes_estudio rpe ON r.id = rpe.reto_id
      LEFT JOIN tareas t ON r.id = t.reto_id
      WHERE rpe.plan_estudio_id = $1
      GROUP BY r.id, rpe.fecha_asociacion
      ORDER BY rpe.fecha_asociacion ASC
    `, [planId]);
    
    return retos;
  }

  /**
   * Asigna retos a un plan de estudio
   * @param planId ID del plan de estudio
   * @param retosIds Lista de IDs de retos a asignar
   * @returns Resultado de la operación
   */
  async asignarRetos(planId: string, retosIds: string[]): Promise<void> {
    // Verificar que los retos existen
    const retos = await this.retoRepository.find({
      where: { id: In(retosIds) }
    });
    
    if (retos.length !== retosIds.length) {
      throw new NotFoundError('Uno o más retos no fueron encontrados');
    }
    
    // Crear las relaciones plan-reto
    const relaciones = retosIds.map(retoId => ({
      plan_estudio_id: planId,
      reto_id: retoId,
      fecha_asociacion: new Date()
    }));
    
    await this.retoPlanEstudioRepository.insert(relaciones);
  }

  /**
   * Elimina la asociación de un reto con un plan de estudio
   * @param planId ID del plan de estudio
   * @param retoId ID del reto a desasociar
   * @param userId ID del usuario que solicita la operación
   * @returns Resultado de la operación
   */
  async eliminarReto(planId: string, retoId: string, userId: string): Promise<boolean> {
    // Verificar que el usuario es el propietario del plan
    const planEstudio = await this.planEstudioRepository.findOne({
      where: { id: planId }
    });
    
    if (!planEstudio) {
      throw new NotFoundError('Plan de estudio no encontrado');
    }
    
    if (planEstudio.usuario_id !== userId) {
      throw new ForbiddenError('No tienes permiso para modificar este plan de estudio');
    }
    
    // Eliminar la relación
    const result = await this.retoPlanEstudioRepository.delete({
      plan_estudio_id: planId,
      reto_id: retoId
    });
    
    if (result.affected === 0) {
      throw new NotFoundError('El reto no está asociado a este plan de estudio');
    }
    
    return true;
  }

  /**
   * Busca planes de estudio por título, descripción o categorías
   * @param searchTerm Término de búsqueda
   * @param userId ID del usuario que realiza la búsqueda (para incluir planes privados propios)
   * @returns Lista de planes de estudio que coinciden con la búsqueda
   */
  async search(searchTerm: string, userId?: string): Promise<PlanEstudio[]> {
    // Buscar por título o descripción
    let query = this.planEstudioRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.usuario', 'usuario')
      .where(
        '(plan.titulo ILIKE :searchTerm OR plan.descripcion ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      );

    // Incluir planes públicos o planes propios del usuario si está autenticado
    if (userId) {
      query = query.andWhere('(plan.es_publico = :esPublico OR plan.usuario_id = :userId)', { 
        esPublico: true, userId 
      });
    } else {
      query = query.andWhere('plan.es_publico = :esPublico', { esPublico: true });
    }

    const planes = await query.getMany();

    // Para cada plan, cargar información adicional como los retos asociados
    for (const plan of planes) {
      // Cargar los retos asociados al plan
      const retosRelaciones = await this.retoPlanEstudioRepository.find({
        where: { plan_estudio_id: plan.id },
        relations: ['reto']
      });
      
      plan.retosRelaciones = retosRelaciones;
    }

    return planes;
  }

  /**
   * Obtiene planes de estudio populares basados en asociaciones con retos populares
   * @param limit Límite de resultados
   * @returns Lista de planes de estudio populares
   */
  async getPopularPlanes(limit: number = 10): Promise<any[]> {
    // Validar el límite
    if (limit > 50) limit = 50;
    
    // Consulta que encuentra planes populares basados en la popularidad de sus retos
    const popularPlanes = await AppDataSource.query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.fecha_inicio,
        p.duracion_dias,
        u.nombre as creador_nombre,
        COUNT(DISTINCT rpe.reto_id) as total_retos,
        SUM(r.puntos_totales) as puntos_totales,
        SUM(r.participaciones) as participaciones_retos,
        (
          SELECT STRING_AGG(DISTINCT c.nombre, ', ')
          FROM reto_categorias rc
          JOIN categorias c ON rc.categoria_id = c.id
          JOIN reto_planes_estudio rpe2 ON rc.reto_id = rpe2.reto_id
          WHERE rpe2.plan_estudio_id = p.id
        ) as categorias
      FROM planes_estudio p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN reto_planes_estudio rpe ON p.id = rpe.plan_estudio_id
      LEFT JOIN retos r ON rpe.reto_id = r.id
      WHERE p.es_publico = true
      GROUP BY p.id, u.nombre
      ORDER BY SUM(r.participaciones) DESC, COUNT(DISTINCT rpe.reto_id) DESC
      LIMIT $1
    `, [limit]);
    
    return popularPlanes;
  }

  /**
   * Obtiene los planes de estudio creados por un usuario específico
   * @param userId ID del usuario
   * @returns Lista de planes de estudio del usuario
   */
  async getPlanesByUserId(userId: string, requesterId?: string): Promise<PlanEstudio[]> {
    let query = this.planEstudioRepository
      .createQueryBuilder('plan')
      .where('plan.usuario_id = :userId', { userId });
    
    // Si el solicitante no es el propio usuario, mostrar solo planes públicos
    if (!requesterId || requesterId !== userId) {
      query = query.andWhere('plan.es_publico = :esPublico', { esPublico: true });
    }
    
    return await query.getMany();
  }
}
