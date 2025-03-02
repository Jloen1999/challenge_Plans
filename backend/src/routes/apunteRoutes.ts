import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as apunteController from '../controllers/apunteController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown', 'text/plain'];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido. Se permiten PDF, DOCX, MD y TXT') as any);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// Rutas públicas
router.get('/', apunteController.obtenerApuntes);
router.get('/destacados', apunteController.obtenerApuntesDestacados);
router.get('/:id', apunteController.obtenerApuntePorId);

// Rutas protegidas
router.post('/', authenticateJWT, (req, res, next) => {
  console.log("Procesando solicitud POST /apuntes");
  console.log("Content-Type:", req.headers['content-type']);
  
  // Si es multipart form data, usar multer
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    console.log("Procesando como multipart/form-data");
    return upload.single('documento')(req, res, next);
  }
  
  // Si es JSON, continuar directamente
  console.log("Procesando como application/json");
  next();
}, apunteController.crearApunte);

router.post('/:id/calificar', authenticateJWT, apunteController.calificarApunte);
router.post('/:id/documento', authenticateJWT, upload.single('documento'), (req, res) => {
  // Implementar manejo de actualización de documento
  res.status(501).json({ message: 'Funcionalidad en desarrollo' });
});

// Ruta para subir archivos (alternativa a Supabase)
router.post('/upload', authenticateJWT, upload.single('documento'), apunteController.subirArchivo);

export default router;
