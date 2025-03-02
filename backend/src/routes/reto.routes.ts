import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  obtenerRetos,
  obtenerRetoPorId,
  crearReto,
  obtenerRetosPopulares,
  unirseReto,
  obtenerMisRetos,
  abandonarReto
} from '../controllers/retoController';

const router = express.Router();

// IMPORTANTE: El orden de las rutas es crucial en Express
// Las rutas específicas deben ir ANTES de las rutas con parámetros
router.get('/populares', obtenerRetosPopulares);
router.get('/mis-retos', verificarToken, obtenerMisRetos); // Esta ruta debe ir ANTES de /:id
router.get('/', obtenerRetos);
router.post('/unirse', verificarToken, unirseReto);
router.delete('/abandonar', verificarToken, abandonarReto); // Nueva ruta
router.post('/', verificarToken, crearReto);

// La ruta con parámetro :id debe ir DESPUÉS de todas las rutas específicas
router.get('/:id', obtenerRetoPorId);

export default router;
