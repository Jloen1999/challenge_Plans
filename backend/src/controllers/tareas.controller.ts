import { Request, Response } from 'express';
import { TareasService } from '../services/tareas.service';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class TareasController {
  private tareasService: TareasService;
  private authService: AuthService;

  constructor() {
    this.tareasService = new TareasService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todas las tareas con filtros opcionales
   * @route GET /api/tareas
   */
  getAllTareas = async (req: Request, res: Response): Promise<void> => {
    try {
      const retoId = req.query.retoId as string | undefined;
      const userId = req.user?.id;

      // Si se especifica un reto_id, validar que sea un UUID
      if (retoId && !this.isValidUUID(retoId)) {
        res.status(400).json({ message: 'El ID del reto no es válido' });
        return;
      }

      const tareas = await this.tareasService.findAll(retoId, userId);
      res.status(200).json({ tareas });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene una tarea específica por su ID
   * @route GET /api/tareas/:id
   */
  getTareaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tarea = await this.tareasService.findById(id);
      res.status(200).json({ tarea });
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
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Verificar que el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar permiso para crear tareas
      const hasPermission = await this.authService.hasPermissions(userId, ['crear_tarea']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para crear tareas' });
        return;
      }

      const tareaData = req.body;
      const newTarea = await this.tareasService.create(tareaData, userId);

      res.status(201).json({
        message: 'Tarea creada correctamente',
        tarea: newTarea
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

      // Verificar permiso para editar tareas
      const hasPermission = await this.authService.hasPermissions(userId, ['editar_tarea']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para editar tareas' });
        return;
      }

      const tareaData = req.body;
      const updatedTarea = await this.tareasService.update(id, tareaData, userId);

      res.status(200).json({
        message: 'Tarea actualizada correctamente',
        tarea: updatedTarea
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

      // Verificar permiso para eliminar tareas
      const hasPermission = await this.authService.hasPermissions(userId, ['eliminar_tarea']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para eliminar tareas' });
        return;
      }

      await this.tareasService.delete(id, userId);

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

      const result = await this.tareasService.completeTarea(id, userId);

      res.status(200).json({
        message: 'Tarea completada correctamente',
        result
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

      await this.tareasService.uncompleteTarea(id, userId);

      res.status(200).json({
        message: 'Tarea desmarcada como completada correctamente'
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

      const isCompleted = await this.tareasService.isCompleted(id, userId);

      res.status(200).json({
        isCompleted
      });
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

      const tareasCompletadas = await this.tareasService.getTareasCompletadasByUserId(userId);

      res.status(200).json({
        tareasCompletadas
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
    } else if (error instanceof ConflictError) {
      res.status(409).json({ message: error.message });
    } else if (error instanceof BadRequestError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Valida si una cadena es un UUID válido
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
