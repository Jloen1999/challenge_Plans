import { Request, Response } from 'express';
import { RetosService } from '../services/retos.service';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class RetosController {
  private retosService: RetosService;
  private authService: AuthService;

  constructor() {
    this.retosService = new RetosService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todos los retos públicos o todos si el usuario es admin
   * @route GET /api/retos
   */
  getAllRetos = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar si el usuario es administrador
      const userId = req.user?.id;
      let isAdmin = false;

      if (userId) {
        isAdmin = await this.authService.hasPermissions(userId, ['ver_retos']);
      }

      const retos = await this.retosService.findAll(isAdmin);
      res.status(200).json({ retos });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene un reto por su ID con opción para modo público o autenticado
   * @route GET /api/retos/:id
   */
  getRetoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Si hay un usuario autenticado, verificar si tiene permisos especiales
      let tienePermisosEspeciales = false;
      if (userId) {
        tienePermisosEspeciales = await this.authService.hasPermissions(userId, ['ver_retos']);
      }
      
      // Añadir información sobre si se está accediendo como admin/creador para la respuesta
      const reto = await this.retosService.findById(id, userId);
      const isCreator = userId && reto.creador_id === userId;
      
      res.status(200).json({
        reto,
        metadata: {
          isCreator,
          tienePermisosEspeciales,
          esPublico: reto.es_publico
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };
  

  /**
   * Crea un nuevo reto
   * @route POST /api/retos
   */
  createReto = async (req: Request, res: Response): Promise<void> => {
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
      
      // Verificar permiso para crear retos
      const hasPermission = await this.authService.hasPermissions(userId, ['crear_reto']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para crear retos' });
        return;
      }
      
      const retoData = req.body;
      const newReto = await this.retosService.create(retoData, userId);
      
      res.status(201).json({ 
        message: 'Reto creado correctamente',
        reto: newReto 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza un reto existente
   * @route PUT /api/retos/:id
   */
  updateReto = async (req: Request, res: Response): Promise<void> => {
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
      
      // Verificar permiso para editar retos (propios)
      const hasPermission = await this.authService.hasPermissions(userId, ['editar_reto']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para editar retos' });
        return;
      }
      
      const retoData = req.body;
      const updatedReto = await this.retosService.update(id, retoData, userId);
      
      res.status(200).json({ 
        message: 'Reto actualizado correctamente',
        reto: updatedReto 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un reto
   * @route DELETE /api/retos/:id
   */
  deleteReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar permiso para eliminar retos
      const hasPermission = await this.authService.hasPermissions(userId, ['eliminar_reto']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para eliminar retos' });
        return;
      }
      
      await this.retosService.delete(id, userId);
      
      res.status(200).json({ 
        message: 'Reto eliminado correctamente' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Permite a un usuario unirse a un reto
   * @route POST /api/retos/:id/join
   */
  joinReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar permiso para participar en retos
      const hasPermission = await this.authService.hasPermissions(userId, ['participar_reto']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para unirte a retos' });
        return;
      }
      
      const participation = await this.retosService.joinReto(id, userId);
      
      res.status(200).json({ 
        message: 'Te has unido al reto correctamente',
        participation 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Permite a un usuario abandonar un reto
   * @route DELETE /api/retos/:id/leave
   */
  leaveReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar primero que el usuario participa en el reto
      const isParticipating = await this.retosService.isParticipant(id, userId);
      
      if (!isParticipating) {
        res.status(403).json({ message: 'No puedes abandonar un reto en el que no participas' });
        return;
      }
      
      await this.retosService.leaveReto(id, userId);
      
      res.status(200).json({ 
        message: 'Has abandonado el reto correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Verifica si un usuario está participando en un reto específico
   * @route GET /api/retos/:id/participation
   */
  checkUserParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const isParticipating = await this.retosService.isParticipant(id, userId);
      
      res.status(200).json({ 
        isParticipating
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza el progreso de un usuario en un reto
   * @route PATCH /api/retos/:id/progress
   */
  updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      const { id } = req.params;
      const { progreso } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const updatedParticipation = await this.retosService.updateProgress(id, userId, progreso);
      
      // Respuesta enriquecida con información sobre los triggers automáticos
      const respuesta = {
        message: 'Progreso actualizado correctamente',
        participation: updatedParticipation,
        notes: progreso === 100 
          ? 'El reto ha sido marcado como completado automáticamente' 
          : undefined
      };
      
      res.status(200).json(respuesta);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el progreso detallado de un usuario en un reto específico
   * @route GET /api/retos/:id/progress
   */
  getUserProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const progress = await this.retosService.getUserProgress(id, userId);
      
      res.status(200).json({ 
        message: 'Progreso obtenido correctamente',
        progress
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Marca una tarea como completada
   * @route POST /api/retos/tareas/:id/complete
   */
  completeTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const result = await this.retosService.completeTarea(id, userId);
      
      res.status(200).json({ 
        message: 'Tarea completada correctamente',
        result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los retos en los que participa un usuario
   * @route GET /api/retos/user/participations
   */
  getUserParticipations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const participations = await this.retosService.getUserParticipations(userId);
      
      res.status(200).json({ participations });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los retos más populares basados en participaciones
   * @route GET /api/retos/stats/popular
   */
  getPopularRetos = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar parámetros de consulta
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      // Obtener y validar el límite de resultados
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Obtener retos populares del servicio
      const popularRetos = await this.retosService.getPopularRetos(limit);
      
      // Enviar respuesta
      res.status(200).json({ 
        popularRetos,
        metadata: {
          count: popularRetos.length,
          limit
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene todas las tareas de un reto específico
   * @route GET /api/retos/:id/tareas
   */
  getTareasReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const tareas = await this.retosService.getTareasReto(id, userId);
      
      res.status(200).json({ 
        message: 'Tareas obtenidas correctamente',
        tareas 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los retos completados por un usuario
   * @route GET /api/retos/user/completed
   */
  getCompletedRetos = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const completedRetos = await this.retosService.getCompletedRetos(userId);
      
      res.status(200).json({ 
        message: 'Retos completados obtenidos correctamente',
        completedRetos 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los badges del usuario en todos los retos
   * @route GET /api/retos/user/badges
   */
  getUserBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const badges = await this.retosService.getUserBadges(userId);
      
      res.status(200).json({ 
        message: 'Badges obtenidos correctamente',
        badges 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Desmarca una tarea como completada
   * @route DELETE /api/retos/tareas/:id/complete
   */
  uncompleteTarea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const result = await this.retosService.uncompleteTarea(id, userId);
      
      res.status(200).json({ 
        message: 'Tarea desmarcada correctamente',
        result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en RetosController:', error);

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
}
