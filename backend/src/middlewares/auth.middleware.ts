import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppDataSource } from '../data-source';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Se requiere autenticación' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'No autorizado' });
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      // Verificar si el usuario tiene los permisos requeridos
      const userPermissions = await AppDataSource.query(`
        SELECT p.nombre FROM permisos p
        JOIN rol_permisos rp ON p.id = rp.permiso_id
        JOIN usuario_roles ur ON rp.rol_id = ur.rol_id
        WHERE ur.usuario_id = $1
      `, [userId]);
      
      const permissions = userPermissions.map((p: any) => p.nombre);
      
      const hasPermission = requiredPermissions.every(permission => 
        permissions.includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};
