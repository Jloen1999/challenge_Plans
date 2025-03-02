import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuario.routes';
import retoRoutes from './routes/reto.routes';
import planRoutes from './routes/planEstudio.routes';
import apunteRoutes from './routes/apunteRoutes'; // Importar rutas de apuntes
import participacionRoutes from './routes/participacion.routes'; // Importar rutas de participación

const app = express();

// Configuraciones
app.set('port', process.env.PORT || 5000);

// Middlewares - asegurar que estén configurados correctamente
app.use(morgan('dev'));
app.use(cors());

// Aumentar límite de tamaño para JSON y formularios
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directorio de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/retos', retoRoutes);
app.use('/api/planes', planRoutes);
app.use('/api/apuntes', apunteRoutes); // Registrar rutas de apuntes
app.use('/api/participacion', participacionRoutes); // Registrar rutas de participación

// Ruta de verificación de estado
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'API funcionando correctamente' 
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
