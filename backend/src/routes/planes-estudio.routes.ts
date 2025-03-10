import { Router } from 'express';
import { PlanesEstudioController } from '../controllers/planes-estudio.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body, param, query } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

const router = Router();
const planesEstudioController = new PlanesEstudioController();

// Middleware de autenticación opcional reutilizable
const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  // Intentar autenticar si hay token
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        req.user = { id: decoded.id };
      }
    } catch (error) {
      // No bloqueamos aquí, simplemente seguimos sin user
    }
  }
  next();
};

/**
 * @route GET /api/planes-estudio/search
 * @desc Busca planes de estudio por término
 * @access Public/Private (Autenticación opcional)
 */
router.get(
  '/search',
  [
    query('term').isString().notEmpty().withMessage('El término de búsqueda es requerido')
  ],
  optionalAuthenticate,
  planesEstudioController.searchPlanes
);

/**
 * @route GET /api/planes-estudio/stats/popular
 * @desc Obtiene planes de estudio populares
 * @access Public
 */
router.get(
  '/stats/popular',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit debe ser un número entre 1 y 50')
  ],
  planesEstudioController.getPopularPlanes
);

/**
 * @route GET /api/planes-estudio/user/me
 * @desc Obtiene planes de estudio del usuario autenticado
 * @access Private
 */
router.get(
  '/user/me',
  authenticate,
  planesEstudioController.getMyPlanes
);

/**
 * @route GET /api/planes-estudio/user/:userId
 * @desc Obtiene planes de estudio creados por un usuario específico
 * @access Public/Private (Autenticación opcional)
 */
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('ID de usuario inválido')
  ],
  optionalAuthenticate,
  planesEstudioController.getPlanesByUserId
);

/**
 * @route GET /api/planes-estudio
 * @desc Obtiene todos los planes de estudio (públicos o todos si es admin)
 * @access Public/Private (Autenticación opcional)
 */
router.get(
  '/',
  optionalAuthenticate,
  planesEstudioController.getAllPlanes
);

/**
 * @route GET /api/planes-estudio/:id
 * @desc Obtiene un plan de estudio por su ID
 * @access Public/Private (dependiendo si es público o privado)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de plan inválido')
  ],
  optionalAuthenticate,
  planesEstudioController.getPlanById
);

/**
 * @route POST /api/planes-estudio
 * @desc Crea un nuevo plan de estudio
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('fecha_inicio').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('duracion_dias').optional().isInt({ min: 1 }).withMessage('La duración debe ser un número positivo'),
    body('es_publico').optional().isBoolean().withMessage('es_publico debe ser un valor booleano'),
    body('retos_ids').optional().isArray().withMessage('retos_ids debe ser un array'),
    body('retos_ids.*').optional().isUUID().withMessage('ID de reto inválido')
  ],
  planesEstudioController.createPlan
);

/**
 * @route PUT /api/planes-estudio/:id
 * @desc Actualiza un plan de estudio existente
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de plan inválido'),
    body('titulo').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('fecha_inicio').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('duracion_dias').optional().isInt({ min: 1 }).withMessage('La duración debe ser un número positivo'),
    body('es_publico').optional().isBoolean().withMessage('es_publico debe ser un valor booleano'),
    body('retos_ids').optional().isArray().withMessage('retos_ids debe ser un array'),
    body('retos_ids.*').optional().isUUID().withMessage('ID de reto inválido')
  ],
  planesEstudioController.updatePlan
);

/**
 * @route DELETE /api/planes-estudio/:id
 * @desc Elimina un plan de estudio
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de plan inválido')
  ],
  planesEstudioController.deletePlan
);

/**
 * @route GET /api/planes-estudio/:id/retos
 * @desc Obtiene los retos asociados a un plan de estudio
 * @access Public/Private (dependiendo si el plan es público o privado)
 */
router.get(
  '/:id/retos',
  [
    param('id').isUUID().withMessage('ID de plan inválido')
  ],
  optionalAuthenticate,
  planesEstudioController.getRetosByPlanId
);

/**
 * @route POST /api/planes-estudio/:id/retos
 * @desc Asigna retos a un plan de estudio
 * @access Private
 */
router.post(
  '/:id/retos',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de plan inválido'),
    body('retos_ids').isArray().withMessage('retos_ids debe ser un array'),
    body('retos_ids.*').isUUID().withMessage('ID de reto inválido')
  ],
  planesEstudioController.asignarRetos
);

/**
 * @route DELETE /api/planes-estudio/:id/retos/:retoId
 * @desc Elimina un reto de un plan de estudio
 * @access Private
 */
router.delete(
  '/:id/retos/:retoId',
  authenticate,
  [
    param('id').isUUID().withMessage('ID de plan inválido'),
    param('retoId').isUUID().withMessage('ID de reto inválido')
  ],
  planesEstudioController.eliminarReto
);

export default router;
