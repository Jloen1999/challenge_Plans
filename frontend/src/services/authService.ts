import api from './api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  nombre: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

class AuthService {
  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials - Email y contraseña del usuario
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data) {
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Error en el inicio de sesión');
  }
  
  /**
   * Registra un nuevo usuario
   * @param credentials - Datos del nuevo usuario
   */
  async register(credentials: RegisterCredentials) {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    
    if (response.data) {
      // Guardar tokens en localStorage después del registro exitoso
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Error en el registro');
  }
  
  /**
   * Cierra la sesión del usuario actual
   */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Opcional: notificar al servidor para invalidar el token
    return api.post('/auth/logout');
  }
  
  /**
   * Obtiene los datos del usuario actualmente autenticado
   */
  async getProfile() {
    const response = await api.get<{ user: User }>('/auth/profile');
    
    if (response.data) {
      return response.data.user;
    }
    
    throw new Error(response.error || 'Error al obtener el perfil');
  }
  
  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }
    
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
    
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Error al refrescar el token');
  }
  
  /**
   * Verifica si el usuario está autenticado actualmente
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
