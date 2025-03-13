import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const usuarioController = new UsuarioController();

// Middleware de validación para actualización de usuario
const validateUpdateUser = [
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('hash_contraseña').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

/**
 * @route GET /api/usuarios
 * @desc Obtiene todos los usuarios
 * @access Private (Admin)
 */
router.get('/', authenticate, authorize(['ver_usuario']), usuarioController.getAllUsuarios);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtiene un usuario por su ID
 * @access Private (Admin o propio usuario)
 */
router.get('/:id', authenticate, usuarioController.getUsuarioById);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualiza un usuario existente
 * @access Private (Admin o propio usuario)
 */
router.put('/:id', authenticate, validateUpdateUser, usuarioController.updateUsuario);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Elimina un usuario
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, authorize(['eliminar_usuario']), usuarioController.deleteUsuario);

/**
 * @route GET /api/usuarios/:id/roles
 * @desc Obtiene los roles de un usuario
 * @access Private (Admin o propio usuario)
 */
router.get('/:id/roles', authenticate, usuarioController.getUsuarioRoles);

/**
 * @route GET /api/usuarios/:id/permisos
 * @desc Obtiene los permisos de un usuario
 * @access Private (Admin o propio usuario)
 */
router.get('/:id/permisos', authenticate, usuarioController.getUsuarioPermisos);

/**
 * @route POST /api/usuarios/:id/roles
 * @desc Añade un rol a un usuario
 * @access Private (Admin)
 */
router.post('/:id/roles', authenticate, authorize(['editar_usuario']), usuarioController.addRol);

/**
 * @route DELETE /api/usuarios/:id/roles/:rolName
 * @desc Elimina un rol de un usuario
 * @access Private (Admin)
 */
router.delete(
  '/:id/roles/:rolName',
  authenticate,
  authorize(['editar_usuario']),
  usuarioController.removeRol
);

/**
 * @route GET /api/usuarios/:id/recompensas
 * @desc Obtiene las recompensas de un usuario
 * @access Private (Admin o propio usuario)
 */
router.get('/:id/recompensas', authenticate, usuarioController.getUsuarioRecompensas);

export default router;
