import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { AppDataSource } from './data-source';
import apiRoutes from './routes';
import env from './config/env.config';
import { configurarJobs } from './config/job-config';
import { initializeSocketServer } from './websockets/notification-socket';

// Declaración para la variable global de socketServer
declare global {
  var socketServer: any;
}

// Inicializar Express
const app = express();

// Middleware
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas API
app.use('/api', apiRoutes);

// Ruta de estado para health checks
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date(),
    environment: env.nodeEnv
  });
});

// Middleware para manejo de rutas no encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error no manejado:', err);
  
  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
    error: env.isProd ? undefined : err.stack
  });
});

// Función para iniciar el servidor
async function bootstrap() {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Crear servidor HTTP
    const server = http.createServer(app);
    
    // Inicializar Socket.IO para notificaciones en tiempo real
    const io = initializeSocketServer(server);
    global.socketServer = io;
    
    // Configurar jobs programados
    configurarJobs();

    // Iniciar el servidor
    const PORT = env.port;
    server.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`🌎 Entorno: ${env.nodeEnv}`);
      console.log(`🔌 Socket.IO inicializado para notificaciones en tiempo real`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
bootstrap();

// Manejo de señales para cierre correcto
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  await AppDataSource.destroy();
  process.exit(0);
});

export default app; // Exportamos app para pruebas
