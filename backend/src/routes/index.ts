import { Router } from 'express';
import usuarioRoutes from './usuario.routes';
import categoriaRoutes from './categoria.routes';
import comentarioRoutes from './comentario.routes';
import notificacionRoutes from './notificacion.routes';
import archivoRoutes from './archivo.routes';
import planesEstudioRoutes from './planes-estudio.routes';
import retosRoutes from './retos.routes';
import apunteRoutes from './apunte.routes';
import tareasRoutes from './tareas.routes'; // Corregido: tareaRoutes → tareasRoutes
import authRoutes from './auth.routes';
import auditoriaRoutes from './auditoria.routes';

const router = Router();

// Configuración de las rutas principales
router.use('/usuarios', usuarioRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/archivos', archivoRoutes);
router.use('/planes-estudio', planesEstudioRoutes);
router.use('/retos', retosRoutes);
router.use('/apuntes', apunteRoutes);
router.use('/tareas', tareasRoutes); // Corregido: tareaRoutes → tareasRoutes
router.use('/auth', authRoutes);
router.use('/auditoria', auditoriaRoutes);

// Ruta de estado/versión API
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API de Challenge Plans funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date()
  });
});

export default router;
