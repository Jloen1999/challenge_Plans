import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  obtenerPlanesEstudio, 
  obtenerPlanEstudioPorId, 
  crearPlanEstudio,
  obtenerPlanesDestacados
} from '../controllers/planEstudioController';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerPlanesEstudio);
router.get('/destacados', obtenerPlanesDestacados);
router.get('/:id', obtenerPlanEstudioPorId);

// Rutas protegidas
router.post('/', verificarToken, crearPlanEstudio);

export default router;
