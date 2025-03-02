import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';

class AuthController {
  // Registrar usuario
  async register(req: Request, res: Response): Promise<void> {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, nombre } = req.body;

    try {
      const result = await authService.register({ email, password, nombre });

      if (!result) {
        res.status(400).json({ message: 'El usuario ya existe' });
        return;
      }

      res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error en controlador de registro:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }

  // Login usuario
  async login(req: Request, res: Response): Promise<void> {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const result = await authService.login({ email, password });

      if (!result) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error en controlador de login:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }

  // Obtener usuario actual
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      // Asegúrate que devuelve el formato que espera el frontend
      res.status(200).json({ 
        user: {
          id: user.id,        // Asegura que hay un campo id
          userId: user.id,    // Para compatibilidad
          nombre: user.nombre,
          email: user.email,
          puntaje: user.puntaje || 0
        }
      });
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }
}

export default new AuthController();
