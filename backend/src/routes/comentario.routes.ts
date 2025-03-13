import { Router } from 'express';
import { ComentarioController } from '../controllers/comentario.controller';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const comentarioController = new ComentarioController();

// Middleware de validación para comentario
const validateComentario = [
  body('contenido').notEmpty().withMessage('El contenido es obligatorio'),
  body('entidad').isIn(['reto', 'tarea', 'apunte', 'plan_estudio']).withMessage('Tipo de entidad inválido'),
  body('entidadId').isUUID().withMessage('ID de entidad inválido')
];

/**
 * @route GET /api/comentarios/:entidad/:entidadId
 * @desc Obtiene comentarios por entidad y su ID
 * @access Public
 */
router.get('/:entidad/:entidadId', comentarioController.getComentariosByEntidad);

/**
 * @route GET /api/comentarios/:id/respuestas
 * @desc Obtiene respuestas a un comentario específico
 * @access Public
 */
router.get('/:id/respuestas', comentarioController.getRespuestas);

/**
 * @route GET /api/comentarios/:entidad/:entidadId/count
 * @desc Obtiene el conteo de comentarios por entidad
 * @access Public
 */
router.get('/:entidad/:entidadId/count', comentarioController.getComentariosCount);

/**
 * @route POST /api/comentarios
 * @desc Crea un nuevo comentario
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('entidad').isIn(['reto', 'tarea', 'apunte', 'plan_estudio']).withMessage('Tipo de entidad inválido'),
    body('entidadId').isUUID().withMessage('ID de entidad inválido'),
    body('contenido').notEmpty().withMessage('El contenido es obligatorio'),
    body('comentarioPadreId').optional().isUUID().withMessage('ID de comentario padre inválido')
  ],
  comentarioController.createComentario
);

/**
 * @route PUT /api/comentarios/:id
 * @desc Actualiza un comentario existente
 * @access Private (dueño del comentario)
 */
router.put(
  '/:id',
  authenticate,
  [
    body('contenido').notEmpty().withMessage('El contenido es obligatorio')
  ],
  comentarioController.updateComentario
);

/**
 * @route DELETE /api/comentarios/:id
 * @desc Elimina un comentario
 * @access Private (dueño del comentario o admin)
 */
router.delete('/:id', authenticate, comentarioController.deleteComentario);

export default router;
