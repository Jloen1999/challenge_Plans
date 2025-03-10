import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';

// Mapa para manejar las conexiones de usuarios
const userSockets: Map<string, string[]> = new Map();

export function initializeSocketServer(server: HttpServer) {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware para autenticar conexiones
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Autenticación requerida'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Token inválido'));
      }

      // Guardar el ID de usuario en el socket para uso posterior
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Error de autenticación'));
    }
  });

  // Manejar conexiones
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`👤 Usuario ${userId} conectado`);

    // Registrar socket en el mapa de usuarios
    if (!userSockets.has(userId)) {
      userSockets.set(userId, []);
    }
    userSockets.get(userId)?.push(socket.id);

    // Unir al usuario a su sala personalizada
    socket.join(`user-${userId}`);

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`👋 Usuario ${userId} desconectado`);
      const userSocketList = userSockets.get(userId) || [];
      const updatedSockets = userSocketList.filter(id => id !== socket.id);
      
      if (updatedSockets.length === 0) {
        userSockets.delete(userId);
      } else {
        userSockets.set(userId, updatedSockets);
      }
    });
  });

  // Devuelve el servidor de sockets para uso en otras partes de la aplicación
  return io;
}

// Función para enviar notificación a un usuario específico
export function sendNotificationToUser(userId: string, notificationData: any) {
  const io = global.socketServer;
  if (!io) {
    console.error('El servidor de sockets no está inicializado');
    return;
  }

  // Enviar a la sala del usuario
  io.to(`user-${userId}`).emit('nueva-notificacion', notificationData);
}
