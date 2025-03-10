import { Router } from 'express';
import authRoutes from './auth.routes';
import retosRoutes from './retos.routes';
import planesEstudioRoutes from './planes-estudio.routes';
import tareasRoutes from './tareas.routes';
// Importar otras rutas según sea necesario

const router = Router();

// Logging middleware para depuración
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Definición de rutas
router.use('/auth', authRoutes);
router.use('/retos', retosRoutes);
router.use('/planes-estudio', planesEstudioRoutes);
router.use('/tareas', tareasRoutes); // Asegurarse que esta ruta esté correctamente importada y configurada
// Añadir otras rutas según sea necesario

export default router;
