import jwt, { SignOptions, JwtPayload, VerifyOptions } from 'jsonwebtoken';
import env from '../config/env.config';

/**
 * Interfaz para el payload del token JWT
 */
interface TokenPayload {
  id: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Genera un token JWT de acceso
 * @param payload Datos a incluir en el token
 * @returns Token JWT generado
 */
export function generateToken(payload: TokenPayload): string {
  // Asegurarnos de que jwtSecret sea tratado como un string
  const secret: string = env.jwtSecret || '';
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: env.jwtExpiration
  } as SignOptions);
}

/**
 * Genera un token JWT de refresco con duración extendida
 * @param payload Datos mínimos para identificar al usuario
 * @returns Token de refresco
 */
export function generateRefreshToken(payload: { id: string }): string {
  // El refresh token dura más tiempo (30 días)
  const secret: string = env.jwtSecret || '';
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: '30d'
  } as SignOptions);
}

/**
 * Verifica y decodifica un token JWT
 * @param token Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret: string = env.jwtSecret || '';
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    const options: VerifyOptions = {
      algorithms: ['HS256'] // Especificar algoritmo explícitamente por seguridad
    };
    
    return jwt.verify(token, secret, options) as TokenPayload;
  } catch (error) {
    // Log más específico según el tipo de error (opcional)
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Token inválido');
    }
    return null;
  }
}

/**
 * Refresca un token de acceso usando un token de refresco válido
 * @param refreshToken Token de refresco
 * @returns Nuevo token de acceso o null si el token de refresco es inválido
 */
export function refreshAccessToken(refreshToken: string): string | null {
  try {
    const secret: string = env.jwtSecret || '';
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    const decoded = jwt.verify(refreshToken, secret, {
      algorithms: ['HS256']
    }) as JwtPayload;
    
    if (!decoded.id) {
      return null;
    }
    
    // Genera un nuevo token de acceso con información limitada
    return generateToken({ id: decoded.id });
  } catch (error) {
    return null;
  }
}
