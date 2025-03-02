import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  unirseAReto, 
  actualizarProgreso,
  obtenerParticipacionesUsuario,
  obtenerParticipantesReto,
  abandonarReto,
  verificarParticipacion,
  obtenerRetosParticipando
} from '../controllers/participacionController';

const router = express.Router();

/**
 * Rutas para gestión de participación en retos
 * Todas requieren autenticación
 */

// Obtener participaciones del usuario autenticado
router.get('/mis-participaciones', verificarToken, obtenerParticipacionesUsuario);

// Obtener participantes de un reto específico
router.get('/retos/:id/participantes', verificarToken, obtenerParticipantesReto);

// Unirse a un reto
router.post('/retos/:id/unirse', verificarToken, unirseAReto);

// Actualizar progreso en un reto
router.patch('/retos/:id/progreso', verificarToken, actualizarProgreso);

// Abandonar un reto
router.delete('/retos/:id/abandonar', verificarToken, abandonarReto);

// Rutas protegidas
router.get('/retos', verificarToken, obtenerRetosParticipando);
router.get('/verificar/:reto_id', verificarToken, verificarParticipacion);

export default router;
