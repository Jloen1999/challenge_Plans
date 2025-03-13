import { Router } from 'express';
import { ArchivoController } from '../controllers/archivo.controller';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const archivoController = new ArchivoController();

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

/**
 * @route GET /api/archivos/:entidad/:entidadId
 * @desc Obtiene archivos por entidad y su ID
 * @access Public
 */
router.get('/:entidad/:entidadId', archivoController.getArchivosByEntidad);

/**
 * @route GET /api/archivos/:id
 * @desc Obtiene un archivo por su ID
 * @access Public
 */
router.get('/:id', archivoController.getArchivoById);

/**
 * @route POST /api/archivos
 * @desc Sube un nuevo archivo
 * @access Private
 */
router.post(
  '/',
  authenticate,
  upload.single('archivo'),
  [
    body('entidad').isIn(['apunte', 'tarea', 'reto', 'plan_estudio', 'comentario']).withMessage('Tipo de entidad inválido'),
    body('entidad_id').isUUID().withMessage('ID de entidad inválido')
  ],
  archivoController.uploadArchivo
);

/**
 * @route PUT /api/archivos/:id
 * @desc Actualiza información de un archivo
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío')
  ],
  archivoController.updateArchivo
);

/**
 * @route DELETE /api/archivos/:id
 * @desc Elimina un archivo
 * @access Private
 */
router.delete('/:id', authenticate, archivoController.deleteArchivo);

export default router;
