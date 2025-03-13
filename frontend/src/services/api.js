import axios from 'axios';

// Base URL para las peticiones API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración predeterminada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación a todas las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  response => response,
  error => {
    // Manejo de errores de autenticación
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido - redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Servicio de retos
export const retosService = {
  getAll: async () => {
    const response = await api.get('/retos');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/retos/${id}`);
    return response.data;
  },
  
  create: async (retoData) => {
    const response = await api.post('/retos', retoData);
    return response.data;
  },
  
  update: async (id, retoData) => {
    const response = await api.put(`/retos/${id}`, retoData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/retos/${id}`);
    return response.data;
  },
  
  getProgreso: async (retoId) => {
    const response = await api.get(`/retos/${retoId}/progreso`);
    return response.data;
  }
};

// Servicio de planes de estudio
export const planesService = {
  getAll: async () => {
    const response = await api.get('/planes');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/planes/${id}`);
    return response.data;
  },
  
  create: async (planData) => {
    const response = await api.post('/planes', planData);
    return response.data;
  },
  
  update: async (id, planData) => {
    const response = await api.put(`/planes/${id}`, planData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/planes/${id}`);
    return response.data;
  }
};

// Servicio de apuntes
export const apuntesService = {
  getAll: async () => {
    const response = await api.get('/apuntes');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/apuntes/${id}`);
    return response.data;
  },
  
  create: async (apunteData) => {
    const response = await api.post('/apuntes', apunteData);
    return response.data;
  },
  
  update: async (id, apunteData) => {
    const response = await api.put(`/apuntes/${id}`, apunteData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/apuntes/${id}`);
    return response.data;
  }
};

// Servicio de tareas
export const tareasService = {
  getByRetoId: async (retoId) => {
    const response = await api.get(`/retos/${retoId}/tareas`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tareas/${id}`);
    return response.data;
  },
  
  create: async (tareaData) => {
    const response = await api.post('/tareas', tareaData);
    return response.data;
  },
  
  update: async (id, tareaData) => {
    const response = await api.put(`/tareas/${id}`, tareaData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/tareas/${id}`);
    return response.data;
  },
  
  completar: async (id, comentario) => {
    const response = await api.post(`/tareas/${id}/completar`, { comentario });
    return response.data;
  }
};

// Servicio de comentarios
export const comentariosService = {
  getByEntidad: async (tipoEntidad, entidadId) => {
    const response = await api.get(`/comentarios/${tipoEntidad}/${entidadId}`);
    return response.data;
  },
  
  crear: async (comentarioData) => {
    const response = await api.post('/comentarios', comentarioData);
    return response.data;
  },
  
  responder: async (comentarioPadreId, contenido) => {
    const response = await api.post(`/comentarios/${comentarioPadreId}/responder`, { contenido });
    return response.data;
  }
};

// Servicio de usuario
export const usuarioService = {
  getProfile: async () => {
    const response = await api.get('/usuario/perfil');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/usuario/perfil', profileData);
    return response.data;
  }
};

export default api;
