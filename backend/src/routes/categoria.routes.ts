import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const categoriaController = new CategoriaController();

// Middleware de validación para categoría
const validateCategoria = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').optional(),
  body('icono').optional()
];

/**
 * @route GET /api/categorias
 * @desc Obtiene todas las categorías
 * @access Public
 */
router.get('/', categoriaController.getAllCategorias);

/**
 * @route GET /api/categorias/stats
 * @desc Obtiene todas las categorías con conteo de retos
 * @access Public
 */
router.get('/stats', categoriaController.getAllWithRetosCount);

/**
 * @route GET /api/categorias/search
 * @desc Busca categorías por término
 * @access Public
 */
router.get('/search', categoriaController.searchCategorias);

/**
 * @route GET /api/categorias/:id
 * @desc Obtiene una categoría por su ID
 * @access Public
 */
router.get('/:id', categoriaController.getCategoriaById);

/**
 * @route POST /api/categorias
 * @desc Crea una nueva categoría
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticate, 
  authorize(['editar_categoria']),
  validateCategoria,
  categoriaController.createCategoria
);

/**
 * @route PUT /api/categorias/:id
 * @desc Actualiza una categoría existente
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['editar_categoria']),
  validateCategoria,
  categoriaController.updateCategoria
);

/**
 * @route DELETE /api/categorias/:id
 * @desc Elimina una categoría
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['editar_categoria']),
  categoriaController.deleteCategoria
);

export default router;
