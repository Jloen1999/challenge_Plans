import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoria.controller';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const auditoriaController = new AuditoriaController();

/**
 * @route GET /api/auditoria
 * @desc Obtiene todas las acciones registradas con opciones de filtrado
 * @access Private (Admin)
 */
router.get(
  '/',
  authenticate,
  authorize(['ver_auditoria']),
  auditoriaController.getAllAcciones
);

/**
 * @route GET /api/auditoria/entidad/:tabla/:registroId
 * @desc Obtiene el historial de auditoría por entidad
 * @access Private (Admin)
 */
router.get(
  '/entidad/:tabla/:registroId',
  authenticate,
  authorize(['ver_auditoria']),
  auditoriaController.getHistorialPorEntidad
);

/**
 * @route GET /api/auditoria/usuario/:usuarioId
 * @desc Obtiene el historial de acciones de un usuario
 * @access Private (Admin)
 */
router.get(
  '/usuario/:usuarioId',
  authenticate,
  authorize(['ver_auditoria']),
  auditoriaController.getHistorialPorUsuario
);

/**
 * @route POST /api/auditoria
 * @desc Registra manualmente una acción en la auditoría
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(['ver_auditoria']),
  [
    body('accion').notEmpty().withMessage('La acción es obligatoria'),
    body('tabla').notEmpty().withMessage('La tabla es obligatoria'),
    body('registroId').isUUID().withMessage('ID de registro inválido'),
    body('detalles').optional()
  ],
  auditoriaController.registrarAccion
);

export default router;
