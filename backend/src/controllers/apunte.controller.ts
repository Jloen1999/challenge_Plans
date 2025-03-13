import { Request, Response } from 'express';
import { ApunteService } from '../services/apunte.service';
import { validationResult } from 'express-validator';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/custom-errors';

export class ApunteController {
  private apunteService: ApunteService;

  constructor() {
    this.apunteService = new ApunteService();
  }

  /**
   * Obtiene todos los apuntes públicos
   * @route GET /api/apuntes
   */
  getAllApuntes = async (req: Request, res: Response): Promise<void> => {
    try {
      const isAdmin = false; // TODO: Implementar verificación real de admin
      const apuntes = await this.apunteService.getAllApuntes(isAdmin);
      res.status(200).json({ apuntes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene un apunte por su ID
   * @route GET /api/apuntes/:id
   */
  getApunteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const apunte = await this.apunteService.getApunteById(id);
      
      if (!apunte) {
        throw new NotFoundError('Apunte no encontrado');
      }
      
      // Verificar acceso a apuntes privados
      if (!apunte.es_publico) {
        const userId = req.user?.id;
        if (!userId || apunte.usuario_id !== userId) {
          throw new ForbiddenError('No tienes acceso a este apunte');
        }
      }
      
      res.status(200).json({ apunte });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene apuntes de un usuario específico
   * @route GET /api/apuntes/usuario/:userId
   */
  getApuntesByUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;
      
      // Si el solicitante es el mismo usuario, incluir también privados
      const includePrivate = requesterId === userId;
      
      const apuntes = await this.apunteService.getApuntesByUsuario(userId, includePrivate);
      res.status(200).json({ apuntes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene apuntes asociados a un reto
   * @route GET /api/apuntes/reto/:retoId
   */
  getApuntesByReto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { retoId } = req.params;
      const apuntes = await this.apunteService.getApuntesByReto(retoId);
      res.status(200).json({ apuntes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene apuntes asociados a un plan de estudio
   * @route GET /api/apuntes/plan/:planId
   */
  getApuntesByPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;
      const apuntes = await this.apunteService.getApuntesByPlanEstudio(planId);
      res.status(200).json({ apuntes });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea un nuevo apunte
   * @route POST /api/apuntes
   */
  createApunte = async (req: Request, res: Response): Promise<void> => {
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

      const apunteData = {
        ...req.body,
        usuario_id: userId
      };
      
      const nuevoApunte = await this.apunteService.createApunte(apunteData);
      
      res.status(201).json({
        message: 'Apunte creado correctamente',
        apunte: nuevoApunte
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza un apunte existente
   * @route PUT /api/apuntes/:id
   */
  updateApunte = async (req: Request, res: Response): Promise<void> => {
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

      // Verificar propiedad del apunte
      const apunte = await this.apunteService.getApunteById(id);
      if (!apunte) {
        throw new NotFoundError('Apunte no encontrado');
      }
      
      if (apunte.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para modificar este apunte');
      }
      
      const updatedApunte = await this.apunteService.updateApunte(id, req.body);
      
      res.status(200).json({
        message: 'Apunte actualizado correctamente',
        apunte: updatedApunte
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un apunte
   * @route DELETE /api/apuntes/:id
   */
  deleteApunte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar propiedad del apunte
      const apunte = await this.apunteService.getApunteById(id);
      if (!apunte) {
        throw new NotFoundError('Apunte no encontrado');
      }
      
      if (apunte.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para eliminar este apunte');
      }

      await this.apunteService.deleteApunte(id);
      
      res.status(200).json({
        message: 'Apunte eliminado correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Califica un apunte
   * @route POST /api/apuntes/:id/calificar
   */
  calificarApunte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { calificacion, comentario } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 5) {
        throw new BadRequestError('La calificación debe ser un número entre 0 y 5');
      }
      
      const result = await this.apunteService.calificarApunte(
        id, userId, calificacion, comentario
      );
      
      res.status(200).json({
        message: 'Apunte calificado correctamente',
        calificacion: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene las calificaciones de un apunte
   * @route GET /api/apuntes/:id/calificaciones
   */
  getCalificacionesApunte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const calificaciones = await this.apunteService.getCalificacionesApunte(id);
      
      res.status(200).json({ calificaciones });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Adjunta un archivo a un apunte
   * @route POST /api/apuntes/:id/archivos
   */
  adjuntarArchivo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Verificar propiedad del apunte
      const apunte = await this.apunteService.getApunteById(id);
      if (!apunte) {
        throw new NotFoundError('Apunte no encontrado');
      }
      
      if (apunte.usuario_id !== userId) {
        throw new ForbiddenError('No tienes permiso para modificar este apunte');
      }
      
      // Verificar si hay archivo subido
      if (!req.file) {
        throw new BadRequestError('No se ha subido ningún archivo');
      }
      
      // Obtener la URL del archivo según el middleware de carga
      let fileUrl = '';
      if (req.file.path) {
        fileUrl = req.file.path;
      } else if (req.file.filename) {
        fileUrl = `/uploads/${req.file.filename}`;
      } else {
        fileUrl = req.file.destination ? 
          `${req.file.destination}/${req.file.filename}` : 
          '/archivo-sin-ruta';
      }
      
      const archivoData = {
        nombre: req.body.nombre || req.file.originalname,
        url: fileUrl,
        formato: this.getFileFormat(req.file.mimetype || req.file.originalname),
        tamaño_bytes: req.file.size,
        subido_por: userId
      };
      
      const archivo = await this.apunteService.adjuntarArchivo(id, archivoData);
      
      res.status(201).json({
        message: 'Archivo adjuntado correctamente',
        archivo
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los archivos adjuntos a un apunte
   * @route GET /api/apuntes/:id/archivos
   */
  getArchivosApunte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const archivos = await this.apunteService.getArchivosApunte(id);
      
      res.status(200).json({ archivos });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el formato del archivo a partir del tipo MIME o nombre
   */
  private getFileFormat(mimeOrName: string): string {
    if (mimeOrName.includes('/')) {
      // Es un MIME type
      const parts = mimeOrName.split('/');
      return parts[parts.length - 1];
    } else {
      // Es un nombre de archivo
      const parts = mimeOrName.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
    }
  }

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en ApunteController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof BadRequestError) {
      res.status(400).json({ message: error.message });
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
