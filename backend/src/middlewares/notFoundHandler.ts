import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
};

export default notFoundHandler;
