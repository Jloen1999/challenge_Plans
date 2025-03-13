import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuditoriaService } from '../services/auditoria.service';
import { AuthService } from '../services/auth.service';
import { NotFoundError, ForbiddenError } from '../utils/custom-errors';

export class AuditoriaController {
  private auditoriaService: AuditoriaService;
  private authService: AuthService;

  constructor() {
    this.auditoriaService = new AuditoriaService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene el historial de auditoría por entidad
   * @route GET /api/auditoria/entidad/:tabla/:registroId
   */
  getHistorialPorEntidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      // Solo administradores pueden ver la auditoría
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para ver auditoría' });
        return;
      }

      const { tabla, registroId } = req.params;
      const historial = await this.auditoriaService.getHistorialPorEntidad(tabla, registroId);
      res.status(200).json({ historial });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el historial de acciones de un usuario
   * @route GET /api/auditoria/usuario/:usuarioId
   */
  getHistorialPorUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      // Solo administradores pueden ver la auditoría
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para ver auditoría' });
        return;
      }

      const { usuarioId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const historial = await this.auditoriaService.getHistorialPorUsuario(usuarioId, limit);
      res.status(200).json({ historial });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene todas las acciones registradas con opciones de filtrado
   * @route GET /api/auditoria
   */
  getAllAcciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      // Solo administradores pueden ver la auditoría
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para ver auditoría' });
        return;
      }

      const {
        desde,
        hasta,
        accion,
        tabla,
        usuarioId,
        limit,
        offset
      } = req.query;

      const opciones = {
        desde: desde ? new Date(desde as string) : undefined,
        hasta: hasta ? new Date(hasta as string) : undefined,
        accion: accion as string,
        tabla: tabla as string,
        usuarioId: usuarioId as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      };

      const resultado = await this.auditoriaService.getAll(opciones);
      res.status(200).json(resultado);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Registra manualmente una acción en la auditoría
   * @route POST /api/auditoria
   */
  registrarAccion = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      // Solo administradores pueden registrar auditoría
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para registrar auditoría' });
        return;
      }

      const { accion, tabla, registroId, detalles } = req.body;

      const registro = await this.auditoriaService.registrarAccion(
        accion, 
        tabla, 
        registroId, 
        userId,
        detalles
      );

      res.status(201).json({
        message: 'Acción registrada correctamente',
        registro
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  private async checkAdminPermission(userId: string): Promise<boolean> {
    try {
      return this.authService.hasPermissions(userId, ['ver_auditoria']);
    } catch {
      return false;
    }
  }

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en AuditoriaController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof ForbiddenError) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}
