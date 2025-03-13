import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/register
 * @desc Registra un nuevo usuario
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio')
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Inicia sesión de un usuario
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  authController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Obtiene el perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresca el token de acceso usando un token de refresco
 * @access Public
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('El token de refresco es obligatorio')
  ],
  authController.refreshToken
);

/**
 * @route POST /api/auth/reset-password
 * @desc Restablece la contraseña de un usuario (admin)
 * @access Private (Admin)
 */
router.post(
  '/reset-password',
  authenticate,
  authorize(['editar_usuario']),
  [
    body('userId').isUUID().withMessage('ID de usuario inválido'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ],
  authController.resetPassword
);

export default router;
