import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db-config';

interface UserCredentials {
  email: string;
  password: string;
}

interface UserRegistration extends UserCredentials {
  nombre: string;
}

interface User {
  id: string;
  email: string;
  nombre: string;
  puntaje?: number;
}

interface AuthResult {
  user: User;
  token: string;
}

class AuthService {
  // Registrar un nuevo usuario
  async register(userData: UserRegistration): Promise<AuthResult | null> {
    const { email, password, nombre } = userData;

    try {
      // Comprobar si el usuario ya existe
      const checkQuery = 'SELECT * FROM usuarios WHERE email = $1';
      const existingUser = await pool.query(checkQuery, [email]);

      if (existingUser.rows.length > 0) {
        return null; // Usuario ya existe
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Insertar nuevo usuario
      const insertQuery = `
        INSERT INTO usuarios (email, hash_contraseña, nombre)
        VALUES ($1, $2, $3)
        RETURNING id, email, nombre, puntaje
      `;
      
      const result = await pool.query(insertQuery, [email, hashPassword, nombre]);
      const newUser = result.rows[0];

      // Generar token JWT
      const token = this.generateToken(newUser);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          nombre: newUser.nombre,
          puntaje: newUser.puntaje || 0
        },
        token
      };
    } catch (error) {
      console.error('Error en servicio de registro:', error);
      throw error;
    }
  }

  // Login de usuario
  async login(credentials: UserCredentials): Promise<AuthResult | null> {
    const { email, password } = credentials;

    try {
      // Buscar usuario por email
      const query = `
        SELECT id, email, hash_contraseña, nombre, puntaje
        FROM usuarios
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return null; // Usuario no encontrado
      }

      const user = result.rows[0];

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.hash_contraseña);

      if (!isMatch) {
        return null; // Contraseña incorrecta
      }

      // Generar token JWT
      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          puntaje: user.puntaje || 0
        },
        token
      };
    } catch (error) {
      console.error('Error en servicio de login:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, nombre, puntaje
        FROM usuarios
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        puntaje: user.puntaje || 0
      };
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Generar token JWT
  private generateToken(user: any): string {
    const payload = {
      userId: user.id,
      email: user.email
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '12h' }
    );
  }
}

export default new AuthService();
