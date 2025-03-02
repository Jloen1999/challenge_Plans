import express from 'express';
import multer from 'multer';
import path from 'path';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  obtenerApuntes, 
  obtenerApuntePorId, 
  crearApunte,
  calificarApunte,
  obtenerApuntesDestacados
} from '../controllers/apunteController';

const router = express.Router();

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Rutas públicas
router.get('/', obtenerApuntes);
router.get('/destacados', obtenerApuntesDestacados);
router.get('/:id', obtenerApuntePorId);

// Rutas protegidas - sin middleware de upload ya que no es parte del controlador
router.post('/', verificarToken, crearApunte);
router.post('/:id/calificar', verificarToken, calificarApunte);

export default router;
