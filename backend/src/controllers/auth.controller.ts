import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { NotFoundError, UnauthorizedError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { refreshAccessToken } from '../utils/jwt';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

export class AuthController {
  private authService = new AuthService();

  /**
   * Registra un nuevo usuario
   * @route POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, nombre } = req.body;

      // Validación adicional
      if (!email || !password || !nombre) {
        res.status(400).json({ message: 'Se requieren email, password y nombre' });
        return;
      }

      // Procesar registro mediante el servicio
      const newUser = await this.authService.register({
        email,
        password,
        nombre
      });

      // Responder con el usuario creado (sin contraseña)
      res.status(201).json({
        message: 'Usuario registrado correctamente',
        user: newUser
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Inicia sesión de usuario
   * @route POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Se requieren email y password' });
        return;
      }

      // Iniciar sesión mediante el servicio
      const { user, accessToken, refreshToken } = await this.authService.login(email, password);

      // Responder con el usuario y tokens
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user,
        accessToken,
        refreshToken
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el perfil del usuario autenticado
   * @route GET /api/auth/profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // El middleware de autenticación ya habrá validado el token
      // y añadido el ID del usuario a req.user
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Obtener perfil mediante el servicio
      const userProfile = await this.authService.getUserProfile(userId);

      // Responder con el perfil
      res.status(200).json({
        user: userProfile
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Refresca el token de acceso usando un token de refresco
   * @route POST /api/auth/refresh-token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Se requiere refreshToken' });
        return;
      }

      // Generar nuevo token de acceso
      const newAccessToken = refreshAccessToken(refreshToken);

      if (!newAccessToken) {
        res.status(401).json({ message: 'Token de refresco inválido o expirado' });
        return;
      }

      // Responder con el nuevo token
      res.status(200).json({
        accessToken: newAccessToken
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Restablece la contraseña de un usuario (solo administradores)
   * @route POST /api/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, newPassword } = req.body;
      
      // Verificar permisos de administrador
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      
      // Usar permisos que sí existen en los datos semilla
      const hasAdminPerms = await this.authService.hasPermissions(adminUserId, ['editar_usuario']);
      if (!hasAdminPerms) {
        res.status(403).json({ message: 'No tiene permisos para esta acción' });
        return;
      }
      
      // Cambiar la contraseña
      await this.authService.resetPassword(userId, newPassword);
      
      res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en AuthController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
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
