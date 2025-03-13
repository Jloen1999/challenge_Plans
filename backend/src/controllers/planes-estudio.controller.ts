import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PlanesEstudioService } from '../services/planes-estudio.service';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/custom-errors';

export class PlanesEstudioController {
  private planesEstudioService: PlanesEstudioService;

  constructor() {
    this.planesEstudioService = new PlanesEstudioService();
  }

  /**
   * Obtiene todos los planes de estudio (públicos o todos si es admin)
   * @route GET /api/planes-estudio
   */
  getAllPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      // Aquí se podría verificar si es admin, pero para simplificar lo manejamos solo con userId
      const isAdmin = false; // TODO: Implementar verificación de admin
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
      res.status(200).json({ plan });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene planes de estudio creados por un usuario específico
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
   * Busca planes de estudio por término
   * @route GET /api/planes-estudio/search
   */
  searchPlanes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        res.status(400).json({ message: 'El término de búsqueda es requerido' });
        return;
      }
      
      const userId = req.user?.id;
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
      const planes = await this.planesEstudioService.getPopularPlanes(limit);
      
      res.status(200).json({ planes });
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

      const planData = req.body;
      const nuevoPlan = await this.planesEstudioService.create(planData, userId);

      res.status(201).json({
        message: 'Plan de estudio creado correctamente',
        plan: nuevoPlan
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
   * Asigna retos a un plan de estudio
   * @route POST /api/planes-estudio/:id/retos
   */
  asignarRetos = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { retos_ids } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Primero verificar si el usuario es dueño del plan
      const plan = await this.planesEstudioService.findById(id, userId);
      
      if (plan.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para modificar este plan');
      }

      await this.planesEstudioService.asignarRetos(id, retos_ids);

      res.status(200).json({
        message: 'Retos asignados correctamente al plan'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un reto de un plan de estudio
   * @route DELETE /api/planes-estudio/:planId/retos/:retoId
   */
  eliminarRetoDelPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId, retoId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const result = await this.planesEstudioService.eliminarReto(planId, retoId, userId);

      res.status(200).json({
        message: result 
          ? 'Reto eliminado correctamente del plan' 
          : 'No se encontró el reto en el plan'
      });
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
