import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuración de instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios de autenticación
export const authService = {
  // Corregido: Asegura que los endpoints coincidan con las rutas del backend
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (nombre: string, email: string, password: string) =>
    api.post('/auth/register', { nombre, email, password }),
  
  verifyToken: () => 
    api.get('/auth/me'), // Corregido: Usa la ruta correcta para verificar el token
  
  // Añadido: Método para cerrar sesión (si es necesario en el backend)
  logout: () => api.post('/auth/logout')
};

// Servicios de retos
export const challengesService = {
  getAll: () => api.get('/retos'),
  getById: (id: string) => api.get(`/retos/${id}`),
  create: (data: any) => api.post('/retos', data),
  join: (id: string) => api.post(`/retos/${id}/join`),
};

// Servicios de planes de estudio
export const studyPlansService = {
  getAll: () => api.get('/planes'),
  getById: (id: string) => api.get(`/planes/${id}`),
  create: (data: any) => api.post('/planes', data),
};
