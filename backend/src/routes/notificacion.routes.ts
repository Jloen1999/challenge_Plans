import { Router } from 'express';
import { NotificacionController } from '../controllers/notificacion.controller';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const notificacionController = new NotificacionController();

/**
 * @route GET /api/notificaciones
 * @desc Obtiene todas las notificaciones del usuario autenticado
 * @access Private
 */
router.get('/', authenticate, notificacionController.getNotificaciones);

/**
 * @route GET /api/notificaciones/no-leidas
 * @desc Obtiene el conteo de notificaciones no leídas del usuario
 * @access Private
 */
router.get('/no-leidas', authenticate, notificacionController.getNoLeidasCount);

/**
 * @route PUT /api/notificaciones/:id/marcar-leida
 * @desc Marca una notificación como leída
 * @access Private
 */
router.put(
  '/:id/marcar-leida',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de notificación inválido')
  ],
  notificacionController.marcarLeida
);

/**
 * @route PUT /api/notificaciones/marcar-todas-leidas
 * @desc Marca todas las notificaciones del usuario como leídas
 * @access Private
 */
router.put('/marcar-todas-leidas', authenticate, notificacionController.marcarTodasLeidas);

/**
 * @route POST /api/notificaciones
 * @desc Crea una nueva notificación para un usuario específico
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(['crear_notificacion']),
  [
    body('usuario_id').isUUID().withMessage('ID de usuario inválido'),
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('mensaje').notEmpty().withMessage('El mensaje es obligatorio'),
    body('tipo').notEmpty().withMessage('El tipo es obligatorio')
  ],
  notificacionController.crearNotificacion
);

/**
 * @route POST /api/notificaciones/grupal
 * @desc Crea una notificación grupal
 * @access Private (Admin)
 */
router.post(
  '/grupal',
  authenticate,
  authorize(['crear_notificacion']),
  [
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('mensaje').notEmpty().withMessage('El mensaje es obligatorio'),
    body('tipo').notEmpty().withMessage('El tipo es obligatorio')
  ],
  notificacionController.crearNotificacionGrupal
);

/**
 * @route DELETE /api/notificaciones/:id
 * @desc Elimina una notificación
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de notificación inválido')
  ],
  notificacionController.eliminarNotificacion
);

export default router;
