import { Request, Response } from 'express';
import { NotificacionService } from '../services/notificacion.service';
import { NotFoundError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class NotificacionController {
  private notificacionService: NotificacionService;
  private authService: AuthService;

  constructor() {
    this.notificacionService = new NotificacionService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   * @route GET /api/notificaciones
   */
  getNotificaciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const notificaciones = await this.notificacionService.getNotificaciones(userId, limit, offset);
      const noLeidasCount = await this.notificacionService.getNoLeidasCount(userId);
      
      res.status(200).json({ 
        notificaciones,
        metadata: {
          no_leidas: noLeidasCount
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el conteo de notificaciones no leídas de un usuario
   * @route GET /api/notificaciones/no-leidas
   */
  getNoLeidasCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const count = await this.notificacionService.getNoLeidasCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Marca una notificación como leída
   * @route PUT /api/notificaciones/:id/marcar-leida
   */
  marcarLeida = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const result = await this.notificacionService.marcarLeida(id, userId);
      
      res.status(200).json({ 
        message: result ? 'Notificación marcada como leída' : 'No se pudo marcar la notificación' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @route PUT /api/notificaciones/marcar-todas-leidas
   */
  marcarTodasLeidas = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      await this.notificacionService.marcarTodasLeidas(userId);
      
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea una nueva notificación para un usuario específico
   * @route POST /api/notificaciones
   */
  crearNotificacion = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar permisos (solo administradores o el sistema pueden crear notificaciones)
      const userId = req.user?.id;
      if (!userId || !(await this.authService.hasPermissions(userId, ['crear_notificacion']))) {
        res.status(403).json({ message: 'No tienes permiso para crear notificaciones' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { usuario_id, titulo, mensaje, tipo, entidad, entidad_id } = req.body;
      
      const notificacion = await this.notificacionService.crearNotificacion({
        usuario_id,
        titulo,
        mensaje,
        tipo,
        entidad,
        entidad_id
      });
      
      res.status(201).json({ 
        message: 'Notificación creada correctamente',
        notificacion 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea una notificación grupal
   * @route POST /api/notificaciones/grupal
   */
  crearNotificacionGrupal = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar permisos (solo administradores o el sistema pueden crear notificaciones)
      const userId = req.user?.id;
      if (!userId || !(await this.authService.hasPermissions(userId, ['crear_notificacion']))) {
        res.status(403).json({ message: 'No tienes permiso para crear notificaciones' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { titulo, mensaje, tipo, entidad, entidad_id, grupo_id } = req.body;
      
      const notificacion = await this.notificacionService.crearNotificacionGrupal({
        titulo,
        mensaje,
        tipo,
        entidad,
        entidad_id,
        grupo_id
      });
      
      res.status(201).json({ 
        message: 'Notificación grupal creada correctamente',
        notificacion 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina una notificación
   * @route DELETE /api/notificaciones/:id
   */
  eliminarNotificacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const result = await this.notificacionService.eliminarNotificacion(id, userId);
      
      res.status(200).json({ 
        message: result ? 'Notificación eliminada correctamente' : 'No se pudo eliminar la notificación' 
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en NotificacionController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}
