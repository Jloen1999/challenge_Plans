import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  obtenerLogrosUsuario, 
  obtenerUltimosLogros 
} from '../controllers/logroController';

const router = express.Router();

// Rutas protegidas
router.get('/mis-logros', verificarToken, obtenerLogrosUsuario);

// Rutas públicas
router.get('/ultimos', obtenerUltimosLogros);

export default router;
