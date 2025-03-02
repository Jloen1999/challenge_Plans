import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interfaz ampliada para soportar ambas estructuras de token
interface DecodedToken {
  userId?: string;
  id?: string;
  email: string;
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// Cambiar el nombre de la función a authenticateJWT y exportarla correctamente
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'No se proporcionó token de autenticación' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as DecodedToken;
    
    // Normalizar userId para manejar ambos formatos de token
    req.user = {
      userId: decoded.userId || decoded.id || '',
      email: decoded.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
    return;
  }
};

// Conservamos la función original para compatibilidad
export const verificarToken = authenticateJWT;
