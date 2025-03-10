import { Router } from 'express';
import { RetosController } from '../controllers/retos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body, param, query } from 'express-validator';
import { verifyToken } from '../utils/jwt';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const retosController = new RetosController();

// Middleware de autenticación opcional
const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        req.user = { id: decoded.id };
      }
    } catch (error) {
      // No bloqueamos, simplemente seguimos sin user
      console.log('Error in optional authentication:', error);
    }
  }
  next();
};

// Ruta para obtener estadísticas populares - esta debe ir ANTES de la ruta con parámetro :id
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
router.get(
  '/user/participations',
  authenticate, // Autenticación obligatoria
  retosController.getUserParticipations
);

/**
 * @route GET /api/retos
 * @desc Obtiene todos los retos públicos o todos si es admin
 * @access Public/Private (Autenticación opcional)
 */
router.get(
  '/',
  optionalAuthenticate, // Autenticación opcional para mostrar más retos si es admin
  retosController.getAllRetos
);

/**
 * @route GET /api/retos/:id
 * @desc Obtiene un reto por su ID (público o privado según permisos)
 * @access Mixed - Retos públicos: Public / Retos privados: Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  optionalAuthenticate, // Usar el middleware reutilizable
  retosController.getRetoById
);

/**
 * @route POST /api/retos
 * @desc Crea un nuevo reto
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
    body('fecha_fin').isISO8601().withMessage('Fecha de finalización inválida'),
    body('dificultad').optional().isIn(['principiante', 'intermedio', 'avanzado']).withMessage('Dificultad inválida'),
    body('es_publico').optional().isBoolean().withMessage('es_publico debe ser un valor booleano'),
    body('categorias_ids').optional().isArray().withMessage('categorias_ids debe ser un array'),
    body('categorias_ids.*').optional().isUUID().withMessage('ID de categoría inválido'),
  ],
  retosController.createReto
);

/**
 * @route PUT /api/retos/:id
 * @desc Actualiza un reto existente
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido'),
    body('titulo').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('fecha_inicio').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('fecha_fin').optional().isISO8601().withMessage('Fecha de finalización inválida'),
    body('dificultad').optional().isIn(['principiante', 'intermedio', 'avanzado']).withMessage('Dificultad inválida'),
    body('estado').optional().isIn(['borrador', 'activo', 'finalizado']).withMessage('Estado inválido'),
    body('es_publico').optional().isBoolean().withMessage('es_publico debe ser un valor booleano'),
    body('categorias_ids').optional().isArray().withMessage('categorias_ids debe ser un array'),
    body('categorias_ids.*').optional().isUUID().withMessage('ID de categoría inválido'),
  ],
  retosController.updateReto
);

/**
 * @route DELETE /api/retos/:id
 * @desc Elimina un reto existente
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
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
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  retosController.joinReto
);

/**
 * @route DELETE /api/retos/:id/leave
 * @desc Permite a un usuario abandonar un reto
 * @access Private (solo usuarios participantes)
 */
router.delete(
  '/:id/leave',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  retosController.leaveReto
);

/**
 * @route GET /api/retos/:id/participation
 * @desc Verifica si un usuario está participando en un reto
 * @access Private
 */
router.get(
  '/:id/participation',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  retosController.checkUserParticipation
);

/**
 * @route PATCH /api/retos/:id/progress
 * @desc Actualiza el progreso de un usuario en un reto
 * @access Private
 */
router.patch(
  '/:id/progress',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido'),
    body('progreso').isInt({ min: 0, max: 100 }).withMessage('Progreso debe ser un número entre 0 y 100')
  ],
  retosController.updateProgress
);

/**
 * @route GET /api/retos/:id/progress
 * @desc Obtiene el progreso detallado del usuario en un reto
 * @access Private
 */
router.get(
  '/:id/progress',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de reto inválido')
  ],
  retosController.getUserProgress
);

/**
 * @route POST /api/retos/tareas/:id/complete
 * @desc Marca una tarea como completada
 * @access Private
 */
router.post(
  '/tareas/:id/complete',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de tarea inválido')
  ],
  retosController.completeTarea
);

export default router;
