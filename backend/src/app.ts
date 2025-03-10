import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de Express
const app = express();

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging de solicitudes HTTP

// Directorio estático para subidas temporales
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Challenge Plans',
    version: '1.0.0',
    estado: '✅ Funcionando correctamente',
    documentacion: '/api/docs'
  });
});

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para manejo de errores
// La forma correcta de registrar un middleware de error es después de definir todas las rutas
// El middleware de error debe tener exactamente 4 parámetros para que Express lo reconozca como tal
const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

app.use(errorHandler);

export default app;
