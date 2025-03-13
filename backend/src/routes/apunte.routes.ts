import { Router } from 'express';
import { ApunteController } from '../controllers/apunte.controller';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const apunteController = new ApunteController();

// Middleware de validación para apunte
const validateApunte = [
  body('titulo').notEmpty().withMessage('El título es obligatorio'),
  body('contenido').optional(),
  body('formato').optional().isIn(['pdf', 'md', 'docx']).withMessage('Formato inválido'),
  body('es_publico').optional().isBoolean().withMessage('Es público debe ser un valor booleano'),
  body('reto_id').optional().isUUID().withMessage('ID de reto inválido'),
  body('plan_estudio_id').optional().isUUID().withMessage('ID de plan de estudio inválido')
];

/**
 * @route GET /api/apuntes
 * @desc Obtiene todos los apuntes públicos
 * @access Public
 */
router.get('/', apunteController.getAllApuntes);

/**
 * @route GET /api/apuntes/:id
 * @desc Obtiene un apunte por su ID
 * @access Public/Private (dependiendo si es público o privado)
 */
router.get('/:id', apunteController.getApunteById);

/**
 * @route GET /api/apuntes/usuario/:userId
 * @desc Obtiene apuntes de un usuario específico
 * @access Public/Private (los privados solo para el dueño)
 */
router.get('/usuario/:userId', apunteController.getApuntesByUsuario);

/**
 * @route GET /api/apuntes/reto/:retoId
 * @desc Obtiene apuntes asociados a un reto
 * @access Public (solo los públicos)
 */
router.get('/reto/:retoId', apunteController.getApuntesByReto);

/**
 * @route GET /api/apuntes/plan/:planId
 * @desc Obtiene apuntes asociados a un plan de estudio
 * @access Public (solo los públicos)
 */
router.get('/plan/:planId', apunteController.getApuntesByPlan);

/**
 * @route POST /api/apuntes
 * @desc Crea un nuevo apunte
 * @access Private
 */
router.post(
  '/',
  authenticate,
  validateApunte,
  apunteController.createApunte
);

/**
 * @route PUT /api/apuntes/:id
 * @desc Actualiza un apunte existente
 * @access Private (dueño del apunte)
 */
router.put(
  '/:id',
  authenticate,
  validateApunte,
  apunteController.updateApunte
);

/**
 * @route DELETE /api/apuntes/:id
 * @desc Elimina un apunte
 * @access Private (dueño del apunte)
 */
router.delete('/:id', authenticate, apunteController.deleteApunte);

/**
 * @route POST /api/apuntes/:id/calificar
 * @desc Califica un apunte
 * @access Private
 */
router.post(
  '/:id/calificar',
  authenticate,
  [
    body('calificacion').isFloat({ min: 0, max: 5 }).withMessage('La calificación debe ser un número entre 0 y 5'),
    body('comentario').optional()
  ],
  apunteController.calificarApunte
);

/**
 * @route GET /api/apuntes/:id/calificaciones
 * @desc Obtiene las calificaciones de un apunte
 * @access Public
 */
router.get('/:id/calificaciones', apunteController.getCalificacionesApunte);

/**
 * @route POST /api/apuntes/:id/archivos
 * @desc Adjunta un archivo a un apunte
 * @access Private (dueño del apunte)
 */
router.post('/:id/archivos', authenticate, apunteController.adjuntarArchivo);

/**
 * @route GET /api/apuntes/:id/archivos
 * @desc Obtiene los archivos adjuntos a un apunte
 * @access Public/Private (dependiendo si el apunte es público o privado)
 */
router.get('/:id/archivos', apunteController.getArchivosApunte);

export default router;
