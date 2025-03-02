import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

/**
 * Middleware para manejar errores globales de la aplicación
 */
const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Error de servidor';

  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`);
  console.error(err);
  
  // Enviar respuesta al cliente
  res.status(status).json({
    status: 'error',
    message,
    // Solo incluir stack trace en desarrollo
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

export default errorHandler;
