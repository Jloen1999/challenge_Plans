import { Router } from 'express';
import { TareasController } from '../controllers/tareas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const tareasController = new TareasController();

/**
 * @route GET /api/tareas
 * @desc Obtiene todas las tareas con filtros opcionales
 * @access Private
 */
router.get(
  '/',
  authenticate,
  [
    query('retoId').optional().isUUID().withMessage('ID de reto inválido')
  ],
  tareasController.getAllTareas
);

/**
 * @route GET /api/tareas/user/completed
 * @desc Obtiene todas las tareas completadas por el usuario
 * @access Private
 */
router.get(
  '/user/completed',
  authenticate,
  tareasController.getUserCompletedTareas
);

/**
 * @route GET /api/tareas/:id
 * @desc Obtiene una tarea por su ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido')
  ],
  tareasController.getTareaById
);

/**
 * @route POST /api/tareas
 * @desc Crea una nueva tarea
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('reto_id').isUUID().withMessage('ID de reto inválido'),
    body('puntos').isInt({ min: 1 }).withMessage('Los puntos deben ser un número positivo'),
    body('fecha_limite').optional().isISO8601().withMessage('Fecha límite inválida'),
    body('asignado_a').optional().isUUID().withMessage('ID de usuario asignado inválido'),
    body('asignaciones_ids').optional().isArray().withMessage('asignaciones_ids debe ser un array'),
    body('asignaciones_ids.*').optional().isUUID().withMessage('ID de usuario asignado inválido')
  ],
  tareasController.createTarea
);

/**
 * @route PUT /api/tareas/:id
 * @desc Actualiza una tarea existente
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido'),
    body('titulo').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('puntos').optional().isInt({ min: 1 }).withMessage('Los puntos deben ser un número positivo'),
    body('fecha_limite').optional().isISO8601().withMessage('Fecha límite inválida'),
    body('asignado_a').optional().isUUID().withMessage('ID de usuario asignado inválido'),
    body('asignaciones_ids').optional().isArray().withMessage('asignaciones_ids debe ser un array'),
    body('asignaciones_ids.*').optional().isUUID().withMessage('ID de usuario asignado inválido')
  ],
  tareasController.updateTarea
);

/**
 * @route DELETE /api/tareas/:id
 * @desc Elimina una tarea existente
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido')
  ],
  tareasController.deleteTarea
);

/**
 * @route POST /api/tareas/:id/complete
 * @desc Marca una tarea como completada
 * @access Private
 */
router.post(
  '/:id/complete',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido'),
    body('progreso').optional().isInt({ min: 0, max: 100 }).withMessage('El progreso debe ser un número entre 0 y 100'),
    body('comentario').optional().isString().withMessage('El comentario debe ser texto')
  ],
  tareasController.completeTarea
);

/**
 * @route DELETE /api/tareas/:id/complete
 * @desc Desmarca una tarea como completada
 * @access Private
 */
router.delete(
  '/:id/complete',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido')
  ],
  tareasController.uncompleteTarea
);

/**
 * @route GET /api/tareas/:id/completed
 * @desc Verifica si una tarea ha sido completada por el usuario
 * @access Private
 */
router.get(
  '/:id/completed',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido')
  ],
  tareasController.checkTareaCompleted
);

export default router;
