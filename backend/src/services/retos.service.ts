import { AppDataSource } from '../data-source';
import { Reto } from '../entities/reto.entity';
import { ParticipacionRetos } from '../entities/participacion-retos.entity';
import { RetoCategoria } from '../entities/reto-categorias.entity';
import { Categoria } from '../entities/categoria.entity';
import { HistorialProgreso } from '../entities/historial-progreso.entity';
import { Recompensa } from '../entities/recompensa.entity';
import { UsuarioRecompensas } from '../entities/usuario-recompensas.entity';
import { Notificacion } from '../entities/notificacion.entity';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { In, DeepPartial } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

export class RetosService {
  private retoRepository = AppDataSource.getRepository(Reto);
  private participacionRepository = AppDataSource.getRepository(ParticipacionRetos);
  private retoCategoriaRepository = AppDataSource.getRepository(RetoCategoria);
  private categoriaRepository = AppDataSource.getRepository(Categoria);
  private usuarioRepository = AppDataSource.getRepository(Usuario);

  /**
   * Obtiene todos los retos públicos o todos los retos si es administrador
   * @param isAdmin Indica si el usuario es administrador
   * @returns Lista de retos
   */
  async findAll(isAdmin: boolean = false): Promise<Reto[]> {
    try {
      // En lugar de usar el queryBuilder y cargar manualmente las relaciones,
      // usamos una consulta SQL directa para obtener todos los datos de una vez
      const query = `
        SELECT 
          r.*,
          u.nombre as creador_nombre,
          (
            SELECT STRING_AGG(c.nombre, ', ')
            FROM reto_categorias rc
            JOIN categorias c ON rc.categoria_id = c.id
            WHERE rc.reto_id = r.id
          ) as categorias
        FROM retos r
        LEFT JOIN usuarios u ON r.creador_id = u.id
        WHERE ${isAdmin ? '1=1' : 'r.es_publico = true AND r.estado = \'activo\''}
        ORDER BY r.fecha_creacion DESC
      `;
      
      // Ejecutamos la consulta SQL
      const retos = await AppDataSource.query(query);
      
      // Transformamos los resultados para mantener la misma estructura que getPopularRetos
      return retos.map((reto: any) => ({
        ...reto,
        creador: {
          id: reto.creador_id,
          nombre: reto.creador_nombre || 'Usuario anónimo'
        }
      }));
    } catch (error) {
      console.error('Error al obtener retos en findAll:', error);
      throw new BadRequestError('Error al obtener los retos');
    }
  }

  /**
   * Obtiene un reto específico por su ID
   * @param id ID del reto
   * @param userId ID del usuario que hace la petición (opcional)
   * @returns Detalles del reto
   */
  async findById(id: string, userId?: string): Promise<any> {
    try {
      // En lugar de usar relaciones que causan el error, usamos una consulta SQL directa
      // similar a getPopularRetos() y findAll()
      const query = `
        SELECT 
          r.*,
          u.nombre as creador_nombre,
          (
            SELECT STRING_AGG(c.nombre, ', ')
            FROM reto_categorias rc
            JOIN categorias c ON rc.categoria_id = c.id
            WHERE rc.reto_id = r.id
          ) as categorias
        FROM retos r
        LEFT JOIN usuarios u ON r.creador_id = u.id
        WHERE r.id = $1
      `;
      
      const retos = await AppDataSource.query(query, [id]);
      
      if (retos.length === 0) {
        throw new NotFoundError('Reto no encontrado');
      }
      
      const reto = retos[0];
      
      // Verificar acceso: retos privados solo visibles para el creador o participantes
      if (!reto.es_publico && (!userId || (userId !== reto.creador_id && !await this.isParticipant(id, userId)))) {
        throw new ForbiddenError('No tienes acceso a este reto');
      }

      // Obtenemos las tareas del reto en una consulta separada
      // CORRECCIÓN: Removemos "posicion" que no existe en la tabla tareas
      const tareas = await AppDataSource.query(`
        SELECT *
        FROM tareas
        WHERE reto_id = $1
        ORDER BY id ASC
      `, [id]);
      
      // Formateamos el resultado similar a getPopularRetos()
      return {
        ...reto,
        tareas,
        creador: {
          id: reto.creador_id,
          nombre: reto.creador_nombre || 'Usuario anónimo'
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al obtener reto en findById:', error);
      throw new BadRequestError('Error al obtener el reto');
    }
  }

  /**
   * Crea un nuevo reto
   * @param retoData Datos del reto a crear
   * @param userId ID del usuario creador
   * @returns Reto creado
   */
  async create(retoData: {
    titulo: string;
    descripcion?: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    dificultad?: string;
    es_publico?: boolean;
    plan_estudio_id?: string;
    categorias_ids?: string[];
  }, userId: string): Promise<Reto> {
    // Convertir fechas a objetos Date si son strings
    const fechaInicio = retoData.fecha_inicio instanceof Date 
      ? retoData.fecha_inicio 
      : new Date(retoData.fecha_inicio);
    
    const fechaFin = retoData.fecha_fin instanceof Date 
      ? retoData.fecha_fin 
      : new Date(retoData.fecha_fin);
    
    // Validación de fechas
    if (fechaInicio >= fechaFin) {
      throw new BadRequestError('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Verificar dificultad válida
    if (retoData.dificultad && !['principiante', 'intermedio', 'avanzado'].includes(retoData.dificultad)) {
      throw new BadRequestError('La dificultad debe ser principiante, intermedio o avanzado');
    }

    // Crear objeto base con los datos del reto
    const newRetoData: any = {
      titulo: retoData.titulo,
      descripcion: retoData.descripcion,
      // Convertir fechas a string en formato ISO para el tipo esperado en la entidad
      fecha_inicio: fechaInicio.toISOString().split('T')[0],  // Solo la fecha YYYY-MM-DD
      fecha_fin: fechaFin.toISOString().split('T')[0],        // Solo la fecha YYYY-MM-DD
      dificultad: retoData.dificultad,
      es_publico: retoData.es_publico ?? false,
      creador_id: userId,
      estado: 'borrador',
      plan_estudio_id: retoData.plan_estudio_id
    };

    // Crear y guardar el reto - usando tipado correcto
    const newReto = this.retoRepository.create(newRetoData);
    const result = await this.retoRepository.save(newReto);
    
    // Manejar el caso donde save() podría devolver un array o un objeto único
    const savedReto = Array.isArray(result) ? result[0] : result;
    // Asignar categorías si se proporcionan
    if (retoData.categorias_ids && retoData.categorias_ids.length > 0) {
      await this.asignarCategorias(savedReto.id, retoData.categorias_ids);
    }

    // Retornar con relaciones cargadas
    return this.findById(savedReto.id);
  }

  /**
   * Actualiza un reto existente
   * @param id ID del reto
   * @param retoData Datos a actualizar
   * @param userId ID del usuario que hace la actualización
   * @returns Reto actualizado
   */
  async update(id: string, retoData: any, userId: string): Promise<Reto> {
    const reto = await this.retoRepository.findOne({
      where: { id }
    });

    if (!reto) {
      throw new NotFoundError('Reto no encontrado');
    }

    // Verificar permisos: solo el creador puede editar
    if (reto.creador_id !== userId) {
      throw new ForbiddenError('No tienes permiso para editar este reto');
    }

    // Validaciones específicas si se cambian fechas
    if (retoData.fecha_inicio || retoData.fecha_fin) {
      const fechaInicio = retoData.fecha_inicio 
        ? new Date(retoData.fecha_inicio) 
        : new Date(reto.fecha_inicio);
        
      const fechaFin = retoData.fecha_fin 
        ? new Date(retoData.fecha_fin) 
        : new Date(reto.fecha_fin);
      
      if (fechaInicio >= fechaFin) {
        throw new BadRequestError('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      // Actualizar formato de fecha para la base de datos
      if (retoData.fecha_inicio) retoData.fecha_inicio = fechaInicio;
      if (retoData.fecha_fin) retoData.fecha_fin = fechaFin;
    }

    // Validar dificultad si se proporciona
    if (retoData.dificultad && !['principiante', 'intermedio', 'avanzado'].includes(retoData.dificultad)) {
      throw new BadRequestError('La dificultad debe ser principiante, intermedio o avanzado');
    }
    
    // Validar estado si se proporciona
    if (retoData.estado && !['borrador', 'activo', 'finalizado'].includes(retoData.estado)) {
      throw new BadRequestError('El estado debe ser borrador, activo o finalizado');
    }

    // Si está cambiando el estado a 'activo', validar que tenga al menos una tarea
    if (retoData.estado === 'activo' && reto.estado !== 'activo') {
      const tareaCount = await AppDataSource.query(
        `SELECT COUNT(*) FROM tareas WHERE reto_id = $1`, 
        [id]
      );
      
      if (parseInt(tareaCount[0].count) === 0) {
        throw new BadRequestError('El reto debe tener al menos una tarea para activarlo');
      }
    }

    // Extraer categorias_ids antes de actualizar (no es un campo de la tabla)
    const categorias_ids = retoData.categorias_ids;
    delete retoData.categorias_ids;

    // Actualizar el reto con los campos permitidos
    await this.retoRepository.update(id, {
      ...retoData,
      // No permitir actualizar estos campos manualmente:
      creador_id: undefined,
      puntos_totales: undefined, // Manejado por trigger actualizar_puntos_totales
      participaciones: undefined, // Manejado por trigger actualizar_participaciones_reto
      fecha_creacion: undefined,
      fecha_modificacion: undefined
    });
    
    // Actualizar categorías si se proporcionan
    if (categorias_ids && Array.isArray(categorias_ids)) {
      await this.retoCategoriaRepository.delete({ reto_id: id });
      await this.asignarCategorias(id, categorias_ids);
    }
    
    // Obtener el reto actualizado con sus relaciones
    return await this.findById(id);
  }

  /**
   * Elimina un reto
   * @param id ID del reto
   * @param userId ID del usuario que solicita la eliminación
   * @returns Resultado de la operación
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const reto = await this.retoRepository.findOne({
      where: { id }
    });

    if (!reto) {
      throw new NotFoundError('Reto no encontrado');
    }

    if (reto.creador_id !== userId) {
      throw new ForbiddenError('No tienes permiso para eliminar este reto');
    }

    // Verificar si hay participantes activos
    const participantesActivos = await this.participacionRepository.countBy({
      reto_id: id,
      estado: 'activo'
    });

    if (participantesActivos > 0) {
      throw new ConflictError('No se puede eliminar un reto con participantes activos');
    }

    // Eliminar el reto (las relaciones se eliminan automáticamente por CASCADE)
    await this.retoRepository.delete(id);
    return true;
  }

  /**
   * Permite a un usuario unirse a un reto
   * @param retoId ID del reto
   * @param userId ID del usuario
   * @returns Datos de la participación creada
   */
  async joinReto(retoId: string, userId: string): Promise<ParticipacionRetos> {
    // Verificar que el reto existe y está activo
    const reto = await this.retoRepository.findOne({
      where: { 
        id: retoId,
        estado: 'activo'
      }
    });

    if (!reto) {
      throw new NotFoundError('Reto no encontrado o no está activo');
    }

    // Verificar si el usuario ya está participando
    const existingParticipation = await this.participacionRepository.findOne({
      where: {
        reto_id: retoId,
        usuario_id: userId
      }
    });

    if (existingParticipation) {
      throw new ConflictError('Ya estás participando en este reto');
    }

    // Crear nueva participación
    const newParticipation = this.participacionRepository.create({
      reto_id: retoId,
      usuario_id: userId,
      progreso: 0,
      estado: 'activo',
      fecha_union: new Date()
      // fecha_completado se deja como NULL
    });

    return await this.participacionRepository.save(newParticipation);
  }

  /**
   * Permite a un usuario abandonar un reto
   * @param retoId ID del reto
   * @param userId ID del usuario
   * @returns Resultado de la operación
   */
  async leaveReto(retoId: string, userId: string): Promise<boolean> {
    try {
      // Verificar que el reto existe
      const reto = await this.retoRepository.findOne({
        where: { id: retoId }
      });
  
      if (!reto) {
        throw new NotFoundError('El reto no existe');
      }
  
      // Verificar si el usuario está participando
      const participacion = await this.participacionRepository.findOne({
        where: {
          reto_id: retoId,
          usuario_id: userId
        }
      });
  
      if (!participacion) {
        throw new NotFoundError('No estás participando en este reto');
      }
  
      // El creador no puede abandonar su propio reto
      if (reto.creador_id === userId) {
        throw new ForbiddenError('No puedes abandonar tu propio reto. Si deseas eliminarlo, usa la función de eliminar.');
      }
  
      console.log(`Usuario ${userId} abandonando reto ${retoId}`);
  
      // Eliminar la participación
      const resultado = await this.participacionRepository.delete({
        reto_id: retoId,
        usuario_id: userId
      });
  
      console.log(`Participación eliminada: ${resultado.affected} registros`);
  
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al abandonar reto:', error);
      throw new BadRequestError('Error al abandonar el reto');
    }
  }

  /**
   * Actualiza el progreso de un usuario en un reto
   * @param retoId ID del reto
   * @param userId ID del usuario
   * @param progreso Nuevo progreso (0-100)
   * @returns Datos de participación actualizados
   */
 /*  async updateProgress(retoId: string, userId: string, progreso: number): Promise<ParticipacionRetos> {
    if (progreso < 0 || progreso > 100) {
      throw new BadRequestError('El progreso debe estar entre 0 y 100');
    }

    const participacion = await this.participacionRepository.findOne({
      where: {
        reto_id: retoId,
        usuario_id: userId
      }
    });

    if (!participacion) {
      throw new NotFoundError('No estás participando en este reto');
    }

    // Los triggers gestionar_estado_participacion y registrar_cambio_progreso
    // manejarán automáticamente:
    // - Actualización de estado (activo/completado)
    // - Fecha de completado
    // - Registro en historial_progreso
    // - Otorgamiento de recompensas
    // - Envío de notificaciones
    participacion.progreso = progreso;
    
    
    return await this.participacionRepository.save(participacion);
  }
 */
  /**
   * Obtiene la lista de participaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de participaciones con datos del reto
   */
  async getUserParticipations(userId: string): Promise<any[]> {
    // Consulta optimizada con columnas correctas según el esquema
    return await AppDataSource.query(`
      SELECT 
        pr.usuario_id, pr.reto_id, pr.fecha_union, pr.progreso, pr.estado, pr.fecha_completado,
        r.titulo as reto_titulo,
        r.descripcion as reto_descripcion,
        r.fecha_inicio,
        r.fecha_fin,
        r.dificultad,
        r.puntos_totales,
        COUNT(t.id) as total_tareas,
        COUNT(DISTINCT tc.tarea_id) as tareas_completadas
      FROM participacion_retos pr
      JOIN retos r ON pr.reto_id = r.id
      LEFT JOIN tareas t ON t.reto_id = r.id
      LEFT JOIN tareas_completadas tc ON tc.tarea_id = t.id AND tc.usuario_id = pr.usuario_id
      WHERE pr.usuario_id = $1
      GROUP BY pr.usuario_id, pr.reto_id, pr.fecha_union, pr.progreso, pr.estado, 
               pr.fecha_completado, r.titulo, r.descripcion, r.fecha_inicio, 
               r.fecha_fin, r.dificultad, r.puntos_totales
      ORDER BY 
        CASE pr.estado
          WHEN 'activo' THEN 1
          WHEN 'completado' THEN 2
          ELSE 3
        END,
        r.fecha_fin ASC
    `, [userId]);
  }

  /**
   * Verifica si un usuario es participante de un reto
   * @param retoId ID del reto
   * @param userId ID del usuario
   * @returns true si es participante, false en caso contrario
   */
  async isParticipant(retoId: string, userId: string): Promise<boolean> {
    // Método más eficiente usando exist/existsBy
    return await this.participacionRepository.existsBy({
      reto_id: retoId,
      usuario_id: userId
    });
  }



  /**
   * Asigna categorías a un reto
   * @param retoId ID del reto
   * @param categoriasIds IDs de las categorías
   */
  private async asignarCategorias(retoId: string, categoriasIds: string[]): Promise<void> {
    // Verificar que las categorías existen en un solo paso
    const categorias = await this.categoriaRepository.findBy({
      id: In(categoriasIds)
    });
    
    // Validar que todas las categorías existen
    if (categorias.length !== categoriasIds.length) {
      throw new NotFoundError('Una o más categorías no fueron encontradas');
    }
    
    // Crear todas las relaciones de una vez
    const retoCategoriasToInsert = categoriasIds.map(categoriaId => ({
      reto_id: retoId,
      categoria_id: categoriaId
    }));
    
    await this.retoCategoriaRepository.insert(retoCategoriasToInsert);
  }

  /**
   * Obtiene los retos más populares basados en el número de participaciones
   * @param limit Número máximo de retos a devolver
   * @returns Lista de retos populares con estadísticas
   */
  async getPopularRetos(limit: number = 10): Promise<any[]> {
    // Validar el límite para evitar consultas excesivamente grandes
    if (limit > 50) limit = 50;
    
    // Consulta optimizada que obtiene retos con sus participaciones y estadísticas básicas
    const popularRetos = await AppDataSource.query(`
      SELECT 
        r.id,
        r.titulo,
        r.descripcion,
        r.fecha_inicio,
        r.fecha_fin,
        r.dificultad,
        r.es_publico,
        r.estado,
        r.puntos_totales,
        r.participaciones,
        u.nombre as creador_nombre,
        COUNT(DISTINCT tc.usuario_id) as usuarios_completados,
        ROUND(AVG(pr.progreso), 2) as progreso_promedio,
        (
          SELECT STRING_AGG(c.nombre, ', ')
          FROM reto_categorias rc
          JOIN categorias c ON rc.categoria_id = c.id
          WHERE rc.reto_id = r.id
        ) as categorias
      FROM retos r
      LEFT JOIN usuarios u ON r.creador_id = u.id
      LEFT JOIN participacion_retos pr ON r.id = pr.reto_id
      LEFT JOIN tareas t ON r.id = t.reto_id
      LEFT JOIN tareas_completadas tc ON t.id = tc.tarea_id
      WHERE r.es_publico = true AND r.estado = 'activo'
      GROUP BY r.id, u.nombre
      ORDER BY r.participaciones DESC, usuarios_completados DESC
      LIMIT $1
    `, [limit]);
    
    return popularRetos.map((reto: { creador_id: any; creador_nombre: any; }) => ({
      ...reto,
      creador: {
        id: reto.creador_id,
        nombre: reto.creador_nombre
      }
    }));
  }

  /**
   * Obtiene información detallada del progreso de un usuario en un reto específico
   * @param retoId ID del reto
   * @param userId ID del usuario
   * @returns Detalles del progreso del usuario en el reto
   */
  async getUserProgress(retoId: string, userId: string): Promise<any> {
    try {
      // 1. Verificar si el usuario está participando en el reto
      const participacion = await this.participacionRepository.findOne({
        where: {
          reto_id: retoId,
          usuario_id: userId
        }
      });

      if (!participacion) {
        throw new NotFoundError('No estás participando en este reto');
      }

      // 2. Obtener datos del reto
      const reto = await this.findById(retoId, userId);

      // 3. Obtener las tareas completadas vs total
      const tareasStats = await AppDataSource.query(`
        SELECT
          COUNT(t.id) as tareas_totales,
          COUNT(tc.tarea_id) as tareas_completadas,
          SUM(t.puntos) as puntos_totales,
          COALESCE(SUM(CASE WHEN tc.tarea_id IS NOT NULL THEN t.puntos ELSE 0 END), 0) as puntos_obtenidos
        FROM tareas t
        LEFT JOIN tareas_completadas tc ON 
          tc.tarea_id = t.id AND tc.usuario_id = $1
        WHERE t.reto_id = $2
      `, [userId, retoId]);

      // 4. Obtener detalle de cada tarea y su estado de completado
      const tareasConEstado = await this.getTareasReto(retoId, userId);

      // 5. Obtener historial de progreso si existe
      const historialProgreso = await AppDataSource.query(`
        SELECT fecha, progreso_anterior, progreso_nuevo
        FROM historial_progreso
        WHERE usuario_id = $1 AND reto_id = $2
        ORDER BY fecha ASC
      `, [userId, retoId]);

      

      // 7. Construir respuesta completa
      return {
        participacion: {
          fecha_union: participacion.fecha_union,
          progreso: participacion.progreso,
          estado: participacion.estado,
          fecha_completado: participacion.fecha_completado
        },
        reto: {
          id: reto.id,
          titulo: reto.titulo,
          descripcion: reto.descripcion,
          fecha_inicio: reto.fecha_inicio,
          fecha_fin: reto.fecha_fin,
          puntos_totales: reto.puntos_totales,
          dificultad: reto.dificultad
        },
        estadisticas: {
          tareas_totales: parseInt(tareasStats[0].tareas_totales),
          tareas_completadas: parseInt(tareasStats[0].tareas_completadas),
          puntos_totales: parseInt(tareasStats[0].puntos_totales || 0),
          puntos_obtenidos: parseInt(tareasStats[0].puntos_obtenidos || 0),
          porcentaje_completado: tareasStats[0].tareas_totales > 0 
            ? Math.round((parseInt(tareasStats[0].tareas_completadas) / parseInt(tareasStats[0].tareas_totales)) * 100) 
            : 0
        },
        tareas: tareasConEstado,
        historial_progreso: historialProgreso
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error al obtener progreso del usuario:', error);
      throw new BadRequestError('Error al obtener el progreso');
    }
  }

  /**
   * Marca una tarea como completada para un usuario
   * @param tareaId ID de la tarea
   * @param userId ID del usuario
   * @returns Resultado de la operación
   */
  async completeTarea(tareaId: string, userId: string): Promise<any> {
    try {
      // Verificar que la tarea existe
      const tarea = await AppDataSource.query(`
        SELECT t.*, r.id as reto_id
        FROM tareas t
        JOIN retos r ON t.reto_id = r.id
        WHERE t.id = $1
      `, [tareaId]);

      if (tarea.length === 0) {
        throw new NotFoundError('Tarea no encontrada');
      }

      // Verificar que el usuario participa en el reto
      const participacion = await this.participacionRepository.findOne({
        where: {
          reto_id: tarea[0].reto_id,
          usuario_id: userId
        }
      });

      if (!participacion) {
        throw new ForbiddenError('No estás participando en este reto');
      }

      // Verificar si la tarea ya fue completada
      const tareaCompletada = await AppDataSource.query(`
        SELECT * FROM tareas_completadas
        WHERE tarea_id = $1 AND usuario_id = $2
      `, [tareaId, userId]);

      if (tareaCompletada.length > 0) {
        throw new ConflictError('Esta tarea ya fue completada');
      }

      // Marcar la tarea como completada
      const fechaCompletado = new Date();
      await AppDataSource.query(`
        INSERT INTO tareas_completadas (tarea_id, usuario_id, fecha_completado)
        VALUES ($1, $2, $3)
      `, [tareaId, userId, fechaCompletado]);

      // Actualizar el progreso del usuario en el reto - esto es manejado por el trigger actualizar_progreso_usuario
      // Pero necesitamos obtener el nuevo progreso para la respuesta
      const tareasStats = await AppDataSource.query(`
        SELECT
          COUNT(t.id) as tareas_totales,
          COUNT(tc.tarea_id) as tareas_completadas
        FROM tareas t
        LEFT JOIN tareas_completadas tc ON 
          tc.tarea_id = t.id AND tc.usuario_id = $1
        WHERE t.reto_id = $2
      `, [userId, tarea[0].reto_id]);

      const nuevoProgreso = tareasStats[0].tareas_totales > 0
        ? Math.round((parseInt(tareasStats[0].tareas_completadas) / parseInt(tareasStats[0].tareas_totales)) * 100)
        : 0;

      // Verificar y otorgar recompensas/badges si corresponde
      // El trigger check_badge_completion manejará la asignación automática de insignias por completar tareas
      
      // Actualizar historial_progreso - Esto también es manejado por el trigger registrar_cambio_progreso
      
      // Comprobar si todas las tareas están completadas para marcar el reto como completado
      // El trigger gestionar_estado_participacion se encarga de esto

      return {
        completada: true,
        tarea_id: tareaId,
        fecha_completado: fechaCompletado,
        nuevo_progreso: nuevoProgreso,
        tarea_puntos: tarea[0].puntos
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof ConflictError) {
        throw error;
      }
      console.error('Error al completar tarea:', error);
      throw new BadRequestError('Error al completar la tarea');
    }
  }

  /**
   * Desmarca una tarea como completada para un usuario
   * @param tareaId ID de la tarea
   * @param userId ID del usuario
   * @returns Resultado de la operación
   */
  async uncompleteTarea(tareaId: string, userId: string): Promise<any> {
    try {
      // Verificar que la tarea existe
      const tarea = await AppDataSource.query(`
        SELECT t.*, r.id as reto_id
        FROM tareas t
        JOIN retos r ON t.reto_id = r.id
        WHERE t.id = $1
      `, [tareaId]);

      if (tarea.length === 0) {
        throw new NotFoundError('Tarea no encontrada');
      }

      // Verificar que el usuario participa en el reto
      const participacion = await this.participacionRepository.findOne({
        where: {
          reto_id: tarea[0].reto_id,
          usuario_id: userId
        }
      });

      if (!participacion) {
        throw new ForbiddenError('No estás participando en este reto');
      }

      // Verificar si la tarea fue completada por el usuario
      const tareaCompletada = await AppDataSource.query(`
        SELECT * FROM tareas_completadas
        WHERE tarea_id = $1 AND usuario_id = $2
      `, [tareaId, userId]);

      if (tareaCompletada.length === 0) {
        throw new NotFoundError('Esta tarea no ha sido completada todavía');
      }

      // Desmarcar la tarea (eliminar registro de tareas_completadas)
      await AppDataSource.query(`
        DELETE FROM tareas_completadas
        WHERE tarea_id = $1 AND usuario_id = $2
      `, [tareaId, userId]);

      // Obtener el nuevo progreso después de eliminar la tarea completada
      // Los triggers manejarán la actualización del progreso, pero necesitamos calcular el nuevo valor para la respuesta
      const tareasStats = await AppDataSource.query(`
        SELECT
          COUNT(t.id) as tareas_totales,
          COUNT(tc.tarea_id) as tareas_completadas
        FROM tareas t
        LEFT JOIN tareas_completadas tc ON 
          tc.tarea_id = t.id AND tc.usuario_id = $1
        WHERE t.reto_id = $2
      `, [userId, tarea[0].reto_id]);

      const nuevoProgreso = tareasStats[0].tareas_totales > 0
        ? Math.round((parseInt(tareasStats[0].tareas_completadas) / parseInt(tareasStats[0].tareas_totales)) * 100)
        : 0;

      return {
        completada: false,
        tarea_id: tareaId,
        nuevo_progreso: nuevoProgreso,
        tarea_puntos: tarea[0].puntos
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error al desmarcar tarea como completada:', error);
      throw new BadRequestError('Error al desmarcar la tarea como completada');
    }
  }

  /**
   * Obtiene todas las tareas de un reto con su estado de completado para un usuario
   * @param retoId ID del reto
   * @param userId ID del usuario (opcional)
   * @returns Lista de tareas con estado de completado
   */
  async getTareasReto(retoId: string, userId?: string): Promise<any[]> {
    try {
      // Validar que el reto existe
      const reto = await this.retoRepository.findOne({
        where: { id: retoId }
      });

      if (!reto) {
        throw new NotFoundError('Reto no encontrado');
      }

      // Obtener tareas con estado de completado si hay usuario
      if (userId) {
        return await AppDataSource.query(`
          SELECT 
            t.*,
            CASE WHEN tc.tarea_id IS NOT NULL THEN true ELSE false END as completada,
            tc.fecha_completado
          FROM tareas t
          LEFT JOIN tareas_completadas tc ON 
            tc.tarea_id = t.id AND tc.usuario_id = $1
          WHERE t.reto_id = $2
          ORDER BY t.id ASC
        `, [userId, retoId]);
      } else {
        // Si no hay usuario, solo devolver las tareas
        return await AppDataSource.query(`
          SELECT t.*
          FROM tareas t
          WHERE t.reto_id = $1
          ORDER BY t.id ASC
        `, [retoId]);
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error al obtener tareas del reto:', error);
      throw new BadRequestError('Error al obtener las tareas del reto');
    }
  }

  /**
   * Obtiene los retos completados por un usuario
   * @param userId ID del usuario
   * @returns Lista de retos completados con estadísticas
   */
  async getCompletedRetos(userId: string): Promise<any[]> {
    try {
      return await AppDataSource.query(`
        SELECT 
          r.id, r.titulo, r.descripcion, r.dificultad, r.puntos_totales,
          pr.progreso, pr.fecha_completado,
          COUNT(t.id) as total_tareas,
          COUNT(tc.tarea_id) as tareas_completadas,
          (
            SELECT STRING_AGG(c.nombre, ', ')
            FROM reto_categorias rc
            JOIN categorias c ON rc.categoria_id = c.id
            WHERE rc.reto_id = r.id
          ) as categorias,
          (
            SELECT COUNT(*) 
            FROM usuario_badges ub
            WHERE ub.usuario_id = $1 AND ub.reto_id = r.id
          ) as badges_obtenidos
        FROM participacion_retos pr
        JOIN retos r ON pr.reto_id = r.id
        LEFT JOIN tareas t ON t.reto_id = r.id
        LEFT JOIN tareas_completadas tc ON tc.tarea_id = t.id AND tc.usuario_id = $1
        WHERE pr.usuario_id = $1 AND pr.estado = 'completado'
        GROUP BY r.id, r.titulo, r.descripcion, r.dificultad, r.puntos_totales, pr.progreso, pr.fecha_completado
        ORDER BY pr.fecha_completado DESC
      `, [userId]);
    } catch (error) {
      console.error('Error al obtener retos completados:', error);
      throw new BadRequestError('Error al obtener los retos completados');
    }
  }

  /**
   * Obtiene los badges del usuario en todos los retos
   * @param userId ID del usuario
   * @returns Lista de badges obtenidos
   */
  async getUserBadges(userId: string): Promise<any[]> {
    try {
      return await AppDataSource.query(`
        SELECT 
          b.*, 
          ub.fecha_obtencion,
          r.id as reto_id,
          r.titulo as reto_titulo
        FROM usuario_badges ub
        JOIN badges b ON ub.badge_id = b.id
        LEFT JOIN retos r ON ub.reto_id = r.id
        WHERE ub.usuario_id = $1
        ORDER BY ub.fecha_obtencion DESC
      `, [userId]);
    } catch (error) {
      console.error('Error al obtener badges del usuario:', error);
      throw new BadRequestError('Error al obtener los badges');
    }
  }

  /**
 * Actualiza el progreso del usuario en un reto
 * @param retoId ID del reto
 * @param userId ID del usuario
 * @param progreso Nuevo valor de progreso (0-100)
 * @returns Datos del progreso actualizado
 */
async updateProgress(retoId: string, userId: string, progreso: number): Promise<any> {
  // Iniciar transacción para garantizar consistencia
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // Verificar que el usuario está participando en el reto
    const participacion = await queryRunner.manager.findOne(ParticipacionRetos, {
      where: { reto_id: retoId, usuario_id: userId }
    });

    if (!participacion) {
      throw new NotFoundError('No estás participando en este reto');
    }

    // Obtener el progreso anterior y los puntos del reto para cálculos posteriores
    const progresoAnterior = participacion.progreso;
    const reto = await queryRunner.manager.findOne(Reto, { where: { id: retoId } });

    if (!reto) {
      throw new NotFoundError('Reto no encontrado');
    }

    // Actualizar el progreso
    await queryRunner.manager.update(ParticipacionRetos, 
      { reto_id: retoId, usuario_id: userId },
      { progreso }
    );

    // Registrar cambio de progreso en historial
    await queryRunner.manager.insert(HistorialProgreso, {
      usuario_id: userId,
      reto_id: retoId,
      progreso_anterior: progresoAnterior,
      progreso_nuevo: progreso,
      fecha: new Date(),
      evento: progreso === 100 ? 'reto_completado' : 'actualizacion_progreso'
    });

    // GESTIÓN DE PUNTOS
    // 1. Si el progreso llegó a 100% (completado) y antes era menor
    if (progreso === 100 && progresoAnterior < 100) {
      // Marcar como completado
      await queryRunner.manager.update(ParticipacionRetos,
        { reto_id: retoId, usuario_id: userId },
        { estado: 'completado', fecha_completado: new Date() }
      );

      // Otorgar puntos directamente al usuario por completar el reto
      await queryRunner.manager.query(`
        UPDATE usuarios 
        SET puntaje = puntaje + $1 
        WHERE id = $2
      `, [reto.puntos_totales, userId]);

      // Registrar los puntos en usuario_puntos para historial
      /* await queryRunner.manager.insert(UsuarioPuntos, {
        usuario_id: userId,
        puntos: reto.puntos_totales,
        concepto: `Completar Reto: ${reto.titulo}`,
        fecha: new Date()
      }); */

      // Otorgar recompensa por completar reto si existe
      const recompensa = await queryRunner.manager.findOne(Recompensa, {
        where: { tipo: 'puntos' }
      });

      if (recompensa) {
        try {
          await queryRunner.manager.insert(UsuarioRecompensas, {
            usuario_id: userId,
            recompensa_id: recompensa.id,
            fecha_obtencion: new Date()
          });
          
          // No es necesario actualizar manualmente los puntos aquí, el trigger se encarga
        } catch (err) {
          // Ignorar errores de duplicado (CONFLICT)
          console.log('Recompensa ya otorgada previamente o error al otorgar:', err);
        }
      }

      // Enviar notificación
      await queryRunner.manager.insert(Notificacion, {
        usuario_id: userId,
        tipo: 'logro',
        titulo: '¡Reto completado!',
        mensaje: `Has completado el reto "${reto.titulo}" y has ganado ${reto.puntos_totales} puntos.`,
        leida: false,
        fecha_creacion: new Date()
      });
    } 
    // 2. Si el progreso bajó de 100% (reversión de completado)
    else if (progreso < 100 && progresoAnterior === 100) {
      // Cambiar estado de nuevo a activo
      await queryRunner.manager.update(ParticipacionRetos,
        { reto_id: retoId, usuario_id: userId },
        { estado: 'activo', fecha_completado: undefined }
      );

      // Restar los puntos otorgados previamente
      await queryRunner.manager.query(`
        UPDATE usuarios 
        SET puntaje = GREATEST(0, puntaje - $1)
        WHERE id = $2
      `, [reto.puntos_totales, userId]);

     /*  // Registrar los puntos negativos en usuario_puntos para historial
      await queryRunner.manager.insert(UsuarioPuntos, {
        usuario_id: userId,
        puntos: -reto.puntos_totales,
        concepto: `Reversión de reto completado: ${reto.titulo}`,
        fecha: new Date()
      }); */

      // Nota: Las recompensas permanecen, no las eliminamos
    }

    // Confirmar la transacción
    await queryRunner.commitTransaction();

    // Obtener el progreso actualizado para la respuesta
    const progressData = await this.getUserProgress(retoId, userId);
    
    return progressData;
  } catch (error) {
    // Revertir cambios si hay error
    await queryRunner.rollbackTransaction();
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error('Error al actualizar progreso:', error);
    throw new BadRequestError('Error al actualizar el progreso');
  } finally {
    // Liberar el queryRunner
    await queryRunner.release();
  }
}
}
