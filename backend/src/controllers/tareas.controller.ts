import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TareasService } from '../services/tareas.service';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/custom-errors';
import { AuthService } from '../services/auth.service';

export class TareasController {
  private tareaService: TareasService;
  private authService: AuthService;

  constructor() {
    this.tareaService = new TareasService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todas las tareas con filtros opcionales
   * @route GET /api/tareas
   */
  getAllTareas = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar si hay filtro por retoId
      const retoId = req.query.retoId as string;
      
      let tareas;
      if (retoId) {
        tareas = await this.tareaService.getTareasByReto(retoId);
      } else {
        // Si no hay filtro, el usuario obtiene sus tareas asignadas
        tareas = await this.tareaService.getTareasByUsuario(userId);
      }

      res.status(200).json({ tareas });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene todas las tareas completadas por el usuario
   * @route GET /api/tareas/user/completed
   */
  getUserCompletedTareas = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const tareasCompletadas = await this.tareaService.getTareasCompletadasByUsuario(userId);
      res.status(200).json({ tareasCompletadas });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene una tarea por su ID
   * @route GET /api/tareas/:id
   */
  getTareaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Obtener la tarea
      const tarea = await this.tareaService.getTareaById(id);
      
      // Verificar si el usuario tiene acceso a esta tarea
      const userTareas = await this.tareaService.getTareasByUsuario(userId);
      const userHasAccess = userTareas.some(t => t.id === tarea.id);
      
      // Si no tiene acceso directo, verificar si tiene permiso especial
      if (!userHasAccess) {
        const hasSpecialPermission = await this.authService.hasPermissions(userId, ['ver_todas_tareas']);
        
        if (!hasSpecialPermission) {
          throw new ForbiddenError('No tienes permiso para ver esta tarea');
        }
      }
      
      // Obtener información adicional
      const asignaciones = await this.tareaService.getAsignacionesTarea(id);
      const completada = await this.tareaService.getTareaCompletadaDetalle(id, userId);
      
      // Enriquecer la respuesta con información adicional
      const tareaCompleta = {
        ...tarea,
        asignaciones,
        completada_por_usuario: completada !== null,
        detalles_completado: completada
      };
      
      res.status(200).json({ tarea: tareaCompleta });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea una nueva tarea
   * @route POST /api/tareas
   */
  createTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar permiso para crear tareas
      let hasPermission = await this.authService.hasPermissions(userId, ['crear_tarea']);
      
      // Si no tiene el permiso general pero está creando una tarea para un reto propio
      if (!hasPermission && req.body.reto_id) {
        const reto = await this.tareaService.getTareaReto(req.body.reto_id);
        if (reto && reto.creador_id === userId) {
          hasPermission = true;
        }
      }
      
      if (!hasPermission) {
        throw new ForbiddenError('No tienes permiso para crear tareas');
      }
      
      const tareaData = req.body;
      
      // Crear la tarea básica primero
      const nuevaTarea = await this.tareaService.createTarea(tareaData);
      
      // Procesar asignaciones
      if (tareaData.asignaciones_ids && Array.isArray(tareaData.asignaciones_ids)) {
        for (const asignadoId of tareaData.asignaciones_ids) {
          await this.tareaService.asignarTarea(nuevaTarea.id, asignadoId);
        }
      }
      // Si se especificó un usuario asignado en el campo principal
      else if (tareaData.asignado_a) {
        await this.tareaService.asignarTarea(nuevaTarea.id, tareaData.asignado_a);
      }
      
      // Obtener la tarea con todas sus asignaciones
      const tareaCompleta = await this.tareaService.getTareaById(nuevaTarea.id);
      const asignaciones = await this.tareaService.getAsignacionesTarea(nuevaTarea.id);
      
      res.status(201).json({
        message: 'Tarea creada correctamente',
        tarea: {
          ...tareaCompleta,
          asignaciones
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza una tarea existente
   * @route PUT /api/tareas/:id
   */
  updateTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar que la tarea existe
      const tarea = await this.tareaService.getTareaById(id);
      
      // Verificar permiso para editar
      let hasPermission = await this.authService.hasPermissions(userId, ['editar_tarea']);
      
      // Si no tiene el permiso general, verificar si es el creador del reto
      if (!hasPermission && tarea.reto_id) {
        const reto = await this.tareaService.getTareaReto(tarea.reto_id);
        if (reto && reto.creador_id === userId) {
          hasPermission = true;
        }
      }
      
      if (!hasPermission) {
        throw new ForbiddenError('No tienes permiso para editar esta tarea');
      }
      
      const tareaData = req.body;
      
      // Actualizar la tarea básica
      await this.tareaService.updateTarea(id, tareaData);
      
      // Si se especificaron asignaciones múltiples, actualizarlas
      if (tareaData.asignaciones_ids && Array.isArray(tareaData.asignaciones_ids)) {
        // Obtener asignaciones actuales
        const asignacionesActuales = await this.tareaService.getAsignacionesTarea(id);
        
        // Eliminar asignaciones que ya no están en la lista
        for (const asignacion of asignacionesActuales) {
          if (!tareaData.asignaciones_ids.includes(asignacion.usuario_id)) {
            await this.tareaService.eliminarAsignacion(id, asignacion.usuario_id);
          }
        }
        
        // Añadir nuevas asignaciones
        for (const usuarioId of tareaData.asignaciones_ids) {
          await this.tareaService.asignarTarea(id, usuarioId);
        }
      }
      
      // Obtener la tarea actualizada con sus asignaciones
      const tareaActualizada = await this.tareaService.getTareaById(id);
      const asignaciones = await this.tareaService.getAsignacionesTarea(id);
      
      res.status(200).json({
        message: 'Tarea actualizada correctamente',
        tarea: {
          ...tareaActualizada,
          asignaciones
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina una tarea
   * @route DELETE /api/tareas/:id
   */
  deleteTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar que la tarea existe
      const tarea = await this.tareaService.getTareaById(id);
      
      // Verificar permiso para eliminar
      let hasPermission = await this.authService.hasPermissions(userId, ['eliminar_tarea']);
      
      // Si no tiene el permiso general, verificar si es el creador del reto
      if (!hasPermission && tarea.reto_id) {
        const reto = await this.tareaService.getTareaReto(tarea.reto_id);
        if (reto && reto.creador_id === userId) {
          hasPermission = true;
        }
      }
      
      if (!hasPermission) {
        throw new ForbiddenError('No tienes permiso para eliminar esta tarea');
      }
      
      const result = await this.tareaService.deleteTarea(id);
      
      if (!result) {
        throw new BadRequestError('Error al eliminar la tarea');
      }
      
      res.status(200).json({
        message: 'Tarea eliminada correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Marca una tarea como completada
   * @route POST /api/tareas/:id/complete
   */
  completeTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar que la tarea existe
      const tarea = await this.tareaService.getTareaById(id);
      
      // Verificar si el usuario está asignado a esta tarea
      const userTareas = await this.tareaService.getTareasByUsuario(userId);
      const userIsAssigned = userTareas.some(t => t.id === tarea.id);
      
      if (!userIsAssigned) {
        throw new ForbiddenError('No estás asignado a esta tarea');
      }
      
      // Obtener datos adicionales del request
      const { progreso = 100, comentario } = req.body;
      
      // Marcar la tarea como completada
      const tareaCompletada = await this.tareaService.marcarTareaCompletada(
        id, userId, progreso, comentario
      );
      
      res.status(200).json({
        message: 'Tarea marcada como completada',
        tareaCompletada
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Desmarca una tarea como completada
   * @route DELETE /api/tareas/:id/complete
   */
  uncompleteTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar que la tarea existe
      const tarea = await this.tareaService.getTareaById(id);
      
      // Desmarcar la tarea como completada
      const result = await this.tareaService.desmarcarTareaCompletada(id, userId);
      
      res.status(200).json({
        message: result 
          ? 'Tarea desmarcada como completada' 
          : 'No se encontró registro de tarea completada'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Verifica si una tarea ha sido completada por el usuario
   * @route GET /api/tareas/:id/completed
   */
  checkTareaCompleted = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar si la tarea existe
      const tarea = await this.tareaService.getTareaById(id);
      
      // Verificar si la tarea está completada por el usuario
      const isCompleted = await this.tareaService.isTareaCompletadaByUsuario(id, userId);
      const completionDetails = isCompleted 
        ? await this.tareaService.getTareaCompletadaDetalle(id, userId) 
        : null;
      
      res.status(200).json({
        completed: isCompleted,
        completionInfo: completionDetails
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en TareasController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof ForbiddenError) {
      res.status(403).json({ message: error.message });
    } else if (error instanceof BadRequestError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}
