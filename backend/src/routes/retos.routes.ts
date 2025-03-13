import { Router } from 'express';
import { RetosController } from '../controllers/retos.controller';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const retosController = new RetosController();

// Middleware de validación para reto
const validateReto = [
  body('titulo').notEmpty().withMessage('El título es obligatorio'),
  body('descripcion').optional(),
  body('fecha_inicio').isDate().withMessage('Fecha de inicio inválida'),
  body('fecha_fin').isDate().withMessage('Fecha de fin inválida'),
  body('dificultad').optional().isIn(['principiante', 'intermedio', 'avanzado']).withMessage('Dificultad inválida'),
  body('es_publico').optional().isBoolean().withMessage('Es público debe ser un valor booleano')
];

/**
 * @route GET /api/retos
 * @desc Obtiene todos los retos públicos o todos si el usuario es admin
 * @access Public/Private (Autenticación opcional)
 */
router.get('/', retosController.getAllRetos);

/**
 * @route GET /api/retos/stats/popular
 * @desc Obtiene los retos más populares basados en participaciones
 * @access Public
 */
router.get(
  '/stats/popular',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit debe ser un número entre 1 y 50')
  ],
  retosController.getPopularRetos
);

/**
 * @route GET /api/retos/user/participations
 * @desc Obtiene los retos en los que participa un usuario
 * @access Private
 */
router.get('/user/participations', authenticate, retosController.getUserParticipations);

/**
 * @route GET /api/retos/user/completed
 * @desc Obtiene los retos completados por un usuario
 * @access Private
 */
router.get('/user/completed', authenticate, retosController.getCompletedRetos);

/**
 * @route GET /api/retos/user/badges
 * @desc Obtiene los badges del usuario en todos los retos
 * @access Private
 */
router.get('/user/badges', authenticate, retosController.getUserBadges);

/**
 * @route GET /api/retos/:id
 * @desc Obtiene un reto por su ID
 * @access Public/Private (dependiendo si es público o privado)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  retosController.getRetoById
);

/**
 * @route GET /api/retos/:id/tareas
 * @desc Obtiene todas las tareas de un reto específico
 * @access Public/Private (dependiendo si el reto es público o privado)
 */
router.get('/:id/tareas', retosController.getTareasReto);

/**
 * @route GET /api/retos/:id/participation
 * @desc Verifica si un usuario está participando en un reto específico
 * @access Private
 */
router.get('/:id/participation', authenticate, retosController.checkUserParticipation);

/**
 * @route GET /api/retos/:id/progress
 * @desc Obtiene el progreso detallado de un usuario en un reto específico
 * @access Private
 */
router.get('/:id/progress', authenticate, retosController.getUserProgress);

/**
 * @route POST /api/retos
 * @desc Crea un nuevo reto
 * @access Private
 */
router.post(
  '/',
  authenticate,
  authorize(['crear_reto']),
  validateReto,
  retosController.createReto
);

/**
 * @route PUT /api/retos/:id
 * @desc Actualiza un reto existente
 * @access Private (dueño del reto)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['editar_reto']),
  validateReto,
  retosController.updateReto
);

/**
 * @route DELETE /api/retos/:id
 * @desc Elimina un reto
 * @access Private (dueño del reto o admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['eliminar_reto']),
  retosController.deleteReto
);

/**
 * @route POST /api/retos/:id/join
 * @desc Permite a un usuario unirse a un reto
 * @access Private
 */
router.post(
  '/:id/join',
  authenticate,
  authorize(['participar_reto']),
  retosController.joinReto
);

/**
 * @route DELETE /api/retos/:id/leave
 * @desc Permite a un usuario abandonar un reto
 * @access Private (solo participantes)
 */
router.delete('/:id/leave', authenticate, retosController.leaveReto);

/**
 * @route PATCH /api/retos/:id/progress
 * @desc Actualiza el progreso de un usuario en un reto
 * @access Private (solo participantes)
 */
router.patch(
  '/:id/progress',
  authenticate,
  [
    body('progreso').isInt({ min: 0, max: 100 }).withMessage('El progreso debe ser un número entre 0 y 100')
  ],
  retosController.updateProgress
);

/**
 * @route POST /api/retos/tareas/:id/complete
 * @desc Marca una tarea como completada
 * @access Private
 */
router.post('/tareas/:id/complete', authenticate, retosController.completeTarea);

/**
 * @route DELETE /api/retos/tareas/:id/complete
 * @desc Desmarca una tarea como completada
 * @access Private
 */
router.delete('/tareas/:id/complete', authenticate, retosController.uncompleteTarea);

export default router;
