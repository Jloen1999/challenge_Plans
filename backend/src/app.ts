import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource } from './data-source';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api', apiRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Base de datos conectada');

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
initializeApp();

export default app;
