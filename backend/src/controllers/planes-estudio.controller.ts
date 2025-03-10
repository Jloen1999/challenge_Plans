import { Request, Response } from 'express';
import { PlanesEstudioService } from '../services/planes-estudio.service';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class PlanesEstudioController {
  private planesEstudioService: PlanesEstudioService;
  private authService: AuthService;

  constructor() {
    this.planesEstudioService = new PlanesEstudioService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todos los planes de estudio públicos o todos si el usuario es admin
   * @route GET /api/planes-estudio
   */
  getAllPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar si el usuario es administrador
      const userId = req.user?.id;
      let isAdmin = false;

      if (userId) {
        isAdmin = await this.authService.hasPermissions(userId, ['ver_planes']);
      }

      const planes = await this.planesEstudioService.findAll(isAdmin, userId);
      res.status(200).json({ planes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene un plan de estudio por su ID
   * @route GET /api/planes-estudio/:id
   */
  getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const plan = await this.planesEstudioService.findById(id, userId);
      
      // Determinar si el usuario es el creador
      const isCreator = userId && plan.usuario_id === userId;
      
      res.status(200).json({
        plan,
        metadata: {
          isCreator,
          esPublico: plan.es_publico
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea un nuevo plan de estudio
   * @route POST /api/planes-estudio
   */
  createPlan = async (req: Request, res: Response): Promise<void> => {
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
      
      // Verificar permiso para crear planes
      const hasPermission = await this.authService.hasPermissions(userId, ['crear_plan']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para crear planes de estudio' });
        return;
      }
      
      const planData = req.body;
      const newPlan = await this.planesEstudioService.create(planData, userId);
      
      res.status(201).json({ 
        message: 'Plan de estudio creado correctamente',
        plan: newPlan 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza un plan de estudio existente
   * @route PUT /api/planes-estudio/:id
   */
  updatePlan = async (req: Request, res: Response): Promise<void> => {
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
      
      // Verificar permiso para editar planes
      const hasPermission = await this.authService.hasPermissions(userId, ['editar_plan']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para editar planes de estudio' });
        return;
      }
      
      const planData = req.body;
      const updatedPlan = await this.planesEstudioService.update(id, planData, userId);
      
      res.status(200).json({ 
        message: 'Plan de estudio actualizado correctamente',
        plan: updatedPlan 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un plan de estudio
   * @route DELETE /api/planes-estudio/:id
   */
  deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar permiso para eliminar planes
      const hasPermission = await this.authService.hasPermissions(userId, ['eliminar_plan']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para eliminar planes de estudio' });
        return;
      }
      
      await this.planesEstudioService.delete(id, userId);
      
      res.status(200).json({ 
        message: 'Plan de estudio eliminado correctamente' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los retos asociados a un plan de estudio
   * @route GET /api/planes-estudio/:id/retos
   */
  getRetosByPlanId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const retos = await this.planesEstudioService.getRetosByPlanId(id, userId);
      
      res.status(200).json({ retos });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Asigna un reto a un plan de estudio
   * @route POST /api/planes-estudio/:id/retos
   */
  asignarRetos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { retos_ids } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      if (!retos_ids || !Array.isArray(retos_ids)) {
        res.status(400).json({ message: 'Se requiere un array de IDs de retos' });
        return;
      }
      
      // Verificar permiso
      const hasPermission = await this.authService.hasPermissions(userId, ['asociar_reto_plan']);
      if (!hasPermission) {
        res.status(403).json({ message: 'No tienes permiso para asignar retos a planes' });
        return;
      }
      
      // Validar primero que el usuario es propietario del plan
      const plan = await this.planesEstudioService.findById(id);
      if (plan.usuario_id !== userId) {
        res.status(403).json({ message: 'No tienes permiso para modificar este plan' });
        return;
      }
      
      await this.planesEstudioService.asignarRetos(id, retos_ids);
      
      res.status(200).json({ 
        message: 'Retos asignados correctamente al plan de estudio' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un reto de un plan de estudio
   * @route DELETE /api/planes-estudio/:id/retos/:retoId
   */
  eliminarReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, retoId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      await this.planesEstudioService.eliminarReto(id, retoId, userId);
      
      res.status(200).json({ 
        message: 'Reto eliminado correctamente del plan de estudio' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Busca planes de estudio por término
   * @route GET /api/planes-estudio/search
   */
  searchPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term } = req.query;
      const userId = req.user?.id;
      
      if (!term || typeof term !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
      }
      
      const planes = await this.planesEstudioService.search(term, userId);
      
      res.status(200).json({ planes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene planes de estudio populares
   * @route GET /api/planes-estudio/stats/popular
   */
  getPopularPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const popularPlanes = await this.planesEstudioService.getPopularPlanes(limit);
      
      res.status(200).json({ 
        popularPlanes,
        metadata: {
          count: popularPlanes.length,
          limit
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene planes de estudio creados por un usuario
   * @route GET /api/planes-estudio/user/:userId
   */
  getPlanesByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;
      
      const planes = await this.planesEstudioService.getPlanesByUserId(userId, requesterId);
      
      res.status(200).json({ planes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene planes de estudio del usuario autenticado
   * @route GET /api/planes-estudio/user/me
   */
  getMyPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      const planes = await this.planesEstudioService.getPlanesByUserId(userId, userId);
      
      res.status(200).json({ planes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en PlanesEstudioController:', error);

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
