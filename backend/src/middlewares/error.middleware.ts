import { Request, Response, NextFunction } from 'express';
import { 
  NotFoundError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  ConflictError 
} from '../utils/custom-errors';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error capturado:', err);

  // Manejar errores personalizados
  if (err instanceof NotFoundError) {
    res.status(404).json({ message: err.message });
  } else if (err instanceof BadRequestError) {
    res.status(400).json({ message: err.message });
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ message: err.message });
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({ message: err.message });
  } else if (err instanceof ConflictError) {
    res.status(409).json({ message: err.message });
  } else {
    // Errores no específicos
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
