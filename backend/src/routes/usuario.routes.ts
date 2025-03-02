import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  obtenerPerfil, 
  actualizarPerfil, 
  obtenerEstadisticas,
  obtenerParticipaciones
} from '../controllers/usuarioController';

const router = express.Router();

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.get('/estadisticas', verificarToken, obtenerEstadisticas);
router.get('/participaciones', verificarToken, obtenerParticipaciones); // Nueva ruta

export default router;
