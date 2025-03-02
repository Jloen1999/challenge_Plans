import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Validación para registro
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporciona un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .not()
    .isEmpty()
    .withMessage('El nombre es obligatorio')
];

// Validación para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporciona un email válido'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('La contraseña es obligatoria')
];

// Ruta para registro
router.post('/register', registerValidation, authController.register);

// Ruta para login
router.post('/login', loginValidation, authController.login);

// Ruta para obtener usuario actual (protegida) - Ahora usa verificarToken
router.get('/me', verificarToken, authController.getCurrentUser);

export default router;
