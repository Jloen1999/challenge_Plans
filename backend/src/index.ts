import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import retoRoutes from './routes/reto.routes';
import planEstudioRoutes from './routes/planEstudio.routes';
import apunteRoutes from './routes/apunte.routes';
import participacionRoutes from './routes/participacion.routes';
import logroRoutes from './routes/logro.routes';
import notFoundHandler from './middlewares/notFoundHandler';
import errorHandler from './middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

// Configuración inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Asegurarse de que exista el directorio temporal para subidas
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/retos', retoRoutes);
app.use('/api/planes', planEstudioRoutes);
app.use('/api/apuntes', apunteRoutes);
app.use('/api/participacion', participacionRoutes);
app.use('/api/logros', logroRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Challenge Plans funcionando correctamente');
});

// Middleware para manejar rutas no encontradas (404)
// Debe ir después de todas las rutas válidas
app.use(notFoundHandler);

// Middleware para manejar errores (500)
// Debe ser el último middleware
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
