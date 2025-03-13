import { Request, Response } from 'express';
import { ComentarioService } from '../services/comentario.service';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class ComentarioController {
  private comentarioService: ComentarioService;
  private authService: AuthService;

  constructor() {
    this.comentarioService = new ComentarioService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene comentarios por entidad y su ID
   * @route GET /api/comentarios/:entidad/:entidadId
   */
  getComentariosByEntidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entidad, entidadId } = req.params;
      const comentarios = await this.comentarioService.getByEntidad(entidad, entidadId);
      res.status(200).json({ comentarios });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene respuestas a un comentario específico
   * @route GET /api/comentarios/:id/respuestas
   */
  getRespuestas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const respuestas = await this.comentarioService.getRespuestas(id);
      res.status(200).json({ respuestas });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea un nuevo comentario
   * @route POST /api/comentarios
   */
  createComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada
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

      const { entidad, entidadId, contenido, comentarioPadreId } = req.body;
      
      const nuevoComentario = await this.comentarioService.create({
        usuario_id: userId,
        entidad,
        entidad_id: entidadId,
        contenido,
        comentario_padre_id: comentarioPadreId
      });

      res.status(201).json({
        message: 'Comentario creado correctamente',
        comentario: nuevoComentario
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza un comentario existente
   * @route PUT /api/comentarios/:id
   */
  updateComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { contenido } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const updatedComentario = await this.comentarioService.update(id, userId, contenido);

      res.status(200).json({
        message: 'Comentario actualizado correctamente',
        comentario: updatedComentario
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un comentario
   * @route DELETE /api/comentarios/:id
   */
  deleteComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar si es admin para determinar si puede borrar cualquier comentario
      const isAdmin = await this.authService.hasPermissions(userId, ['eliminar_comentario']);
      await this.comentarioService.delete(id, userId, isAdmin);

      res.status(200).json({
        message: 'Comentario eliminado correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el conteo de comentarios por entidad
   * @route GET /api/comentarios/:entidad/:entidadId/count
   */
  getComentariosCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entidad, entidadId } = req.params;
      const count = await this.comentarioService.getComentariosCount(entidad, entidadId);
      res.status(200).json({ count });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en ComentarioController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
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
