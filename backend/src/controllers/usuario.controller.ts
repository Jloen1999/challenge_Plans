import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  /**
   * Obtiene todos los usuarios
   * @route GET /api/usuarios
   */
  getAllUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioService.findAll();
      res.status(200).json({ usuarios });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene un usuario por su ID
   * @route GET /api/usuarios/:id
   */
  getUsuarioById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioService.findById(id);
      res.status(200).json({ usuario });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza un usuario existente
   * @route PUT /api/usuarios/:id
   */
  updateUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      // Solo el propio usuario o un admin pueden actualizar el perfil
      if (!userId || (id !== userId && !(await this.checkAdminPermission(userId)))) {
        res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
        return;
      }

      const userData = req.body;
      const updatedUsuario = await this.usuarioService.update(id, userData);

      res.status(200).json({
        message: 'Usuario actualizado correctamente',
        usuario: updatedUsuario
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un usuario
   * @route DELETE /api/usuarios/:id
   */
  deleteUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Solo un admin puede eliminar usuarios
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para eliminar usuarios' });
        return;
      }

      await this.usuarioService.delete(id);

      res.status(200).json({
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los roles de un usuario
   * @route GET /api/usuarios/:id/roles
   */
  getUsuarioRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const roles = await this.usuarioService.getRoles(id);

      res.status(200).json({ roles });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene los permisos de un usuario
   * @route GET /api/usuarios/:id/permisos
   */
  getUsuarioPermisos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permisos = await this.usuarioService.getPermisos(id);

      res.status(200).json({ permisos });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Añade un rol a un usuario
   * @route POST /api/usuarios/:id/roles
   */
  addRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rolName } = req.body;
      const userId = req.user?.id;

      // Solo un admin puede añadir roles
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para asignar roles' });
        return;
      }

      if (!rolName) {
        res.status(400).json({ message: 'Nombre de rol requerido' });
        return;
      }

      const result = await this.usuarioService.addRol(id, rolName);

      if (result) {
        res.status(200).json({ message: 'Rol añadido correctamente' });
      } else {
        res.status(200).json({ message: 'El usuario ya tiene este rol' });
      }
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un rol de un usuario
   * @route DELETE /api/usuarios/:id/roles/:rolName
   */
  removeRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, rolName } = req.params;
      const userId = req.user?.id;

      // Solo un admin puede eliminar roles
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para eliminar roles' });
        return;
      }

      const result = await this.usuarioService.removeRol(id, rolName);

      if (result) {
        res.status(200).json({ message: 'Rol eliminado correctamente' });
      } else {
        res.status(404).json({ message: 'El usuario no tiene ese rol' });
      }
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene las recompensas de un usuario
   * @route GET /api/usuarios/:id/recompensas
   */
  getUsuarioRecompensas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const recompensas = await this.usuarioService.getRecompensas(id);

      res.status(200).json({ recompensas });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Verifica si un usuario tiene permisos de administrador
   */
  private async checkAdminPermission(userId: string): Promise<boolean> {
    const permisos = await this.usuarioService.getPermisos(userId);
    return permisos.includes('editar_usuario');
  }

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en UsuarioController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
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
