import api from './api'; // Usar el servicio api centralizado

export interface RetoPopular {
  id: string;
  titulo: string;
  descripcion?: string;
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
  fecha_fin: string;
  puntos_totales: number;
  participaciones: number;
  creador: {
    nombre: string;
    avatar?: string;
  };
  categorias?: {
    id: string;
    nombre: string;
  }[] | string; // Updated to support string format from STRING_AGG
}

// Actualizada para coincidir con la estructura real devuelta por el backend
export interface PopularRetosResponse {
  popularRetos: RetoPopular[];
  metadata: {
    count: number;
    limit: number;
  };
}

/**
 * Interfaz para los datos de progreso del usuario en un reto
 */
export interface RetoProgress {
  usuario_id: string;
  reto_id: string;
  progreso: number;
  estado: 'activo' | 'completado' | 'abandonado';
  fecha_union: string;
  fecha_completado?: string;
  tareas_completadas: number;
  total_tareas: number;
  historial_progreso?: {
    fecha: string;
    progreso: number;
  }[];
}

/**
 * Obtiene los retos más populares
 * @param limit Número máximo de retos a obtener
 */
export const getPopularRetos = async (limit: number = 4): Promise<RetoPopular[]> => {
  try {
    console.log(`Solicitando retos populares, limit=${limit}`);
    
    // Usar el servicio API centralizado en lugar de fetch directo
    const response = await api.get(`/retos/stats/popular?limit=${limit}`);
    
    console.log('Respuesta del servidor:', response);
    
    if (response.error) {
      console.error('Error en la respuesta:', response.error);
      throw new Error(response.error);
    }
    
    // Verificar la estructura de la respuesta
    const data = response.data;
    console.log('Datos recibidos:', data);
    
    if (data && data.popularRetos && Array.isArray(data.popularRetos)) {
      // Mapeo para asegurar la estructura esperada y manejar datos faltantes
      return data.popularRetos.map((reto: any) => ({
        id: reto.id,
        titulo: reto.titulo || 'Reto sin título',
        descripcion: reto.descripcion || 'Sin descripción disponible',
        dificultad: reto.dificultad || 'principiante',
        fecha_fin: reto.fecha_fin,
        puntos_totales: reto.puntos_totales || 0,
        participaciones: reto.participaciones || 0,
        creador: {
          nombre: reto.creador?.nombre || 'Usuario anónimo',
          avatar: reto.creador?.avatar || '/images/avatars/default.jpg'
        },
        categorias: reto.categorias || []
      }));
    }
    
    // Intentar manejar otros formatos comunes de respuesta
    if (data && Array.isArray(data.retos)) {
      console.log('Formato alternativo detectado, usando data.retos');
      return data.retos;
    }
    
    if (data && Array.isArray(data)) {
      console.log('Formato simple detectado, usando array directo');
      return data;
    }
    
    console.error('Formato de respuesta no reconocido:', data);
    throw new Error('Formato de respuesta inválido');
  } catch (error) {
    console.error('Error fetching popular retos:', error);
    // Devolver array vacío para evitar errores en cascada
    return [];
  }
};

/**
 * Obtiene todos los retos disponibles
 */
export const getAllRetos = async (): Promise<any[]> => {
  try {
    console.log('Solicitando todos los retos');
    
    const response = await api.get('/retos');
    
    console.log('Respuesta de getAllRetos:', response);
    
    if (response.error) {
      console.error('Error al obtener retos:', response.error);
      throw new Error(response.error);
    }
    
    // Verificar la estructura de la respuesta
    if (response.data && response.data.retos && Array.isArray(response.data.retos)) {
      return response.data.retos.map((reto: any) => ({
        ...reto,
        creador: reto.creador_nombre ? {
          id: reto.creador_id,
          nombre: reto.creador_nombre
        } : {
          nombre: 'Usuario'
        }
      }));
    }
    
    // Intentar otros formatos de respuesta
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.error('Formato de respuesta no reconocido:', response.data);
    throw new Error('Formato de respuesta inválido');
  } catch (error) {
    console.error('Error fetching all retos:', error);
    throw error;
  }
};

/**
 * Obtiene un reto específico por su ID
 * @param id El ID del reto a obtener
 */
export const getRetoById = async (id: string): Promise<any> => {
  try {
    console.log(`Solicitando detalles del reto ${id}`);
    
    const response = await api.get(`/retos/${id}`);
    console.log('Respuesta completa del servidor:', response);
    
    if (response.error) {
      console.error('Error en la respuesta del backend:', response.error);
      throw new Error(response.error);
    }
    
    // Verificamos si la respuesta tiene la estructura esperada
    if (response.data && response.data.reto) {
      return response.data.reto;
    } else if (response.data) {
      // Si no tiene la estructura esperada pero hay datos, los devolvemos
      console.log('Formato de respuesta no estándar, retornando datos directamente');
      return response.data;
    }
    
    console.error('Formato de respuesta no reconocido:', response);
    throw new Error('Formato de respuesta inválido');
  } catch (error: any) {
    console.error(`Error fetching reto with id ${id}:`, error);
    throw error;
  }
};

// Función alternativa con segundo método de conexión (por si el primero falla)
export const getPopularRetosAlternative = async (limit: number = 4): Promise<RetoPopular[]> => {
  try {
    console.log(`[Alt] Solicitando retos populares, limit=${limit}`);
    
    const fullUrl = `http://localhost:5000/api/retos/stats/popular?limit=${limit}`;
    console.log(`Usando URL completa: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Alt] Datos recibidos:', data);
    
    // Procesar los datos igual que en la función original
    if (data && data.popularRetos && Array.isArray(data.popularRetos)) {
      return data.popularRetos;
    }
    
    throw new Error('Formato de respuesta inválido en método alternativo');
  } catch (error) {
    console.error('[Alt] Error fetching popular retos:', error);
    return [];
  }
};

/**
 * Permite al usuario unirse a un reto
 * @param retoId ID del reto al que se quiere unir
 */
export const joinReto = async (retoId: string): Promise<any> => {
  try {
    console.log(`Solicitando unirse al reto ${retoId}`);
    
    const response = await api.post(`/retos/${retoId}/join`);
    
    if (response.error) {
      console.error('Error al unirse al reto:', response.error);
      throw new Error(response.error);
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Error joining reto with id ${retoId}:`, error);
    throw error;
  }
};

/**
 * Verifica si un usuario está participando en un reto específico
 * @param retoId ID del reto a verificar
 */
export const checkUserParticipation = async (retoId: string): Promise<boolean> => {
  try {
    if (!localStorage.getItem('accessToken')) {
      return false; // No hay token, el usuario no está autenticado
    }
    
    console.log(`Verificando participación en reto ${retoId}`);
    
    const response = await api.get(`/retos/${retoId}/participation`);
    
    if (response.error) {
      console.error('Error al verificar participación:', response.error);
      return false;
    }
    
    return response.data?.isParticipating || false;
  } catch (error: any) {
    console.error(`Error checking participation in reto ${retoId}:`, error);
    return false;
  }
};

/**
 * Permite al usuario abandonar un reto en el que participa
 * @param retoId ID del reto que se desea abandonar
 */
export const leaveReto = async (retoId: string): Promise<any> => {
  try {
    console.log(`Solicitando abandonar el reto ${retoId}`);
    
    const response = await api.del(`/retos/${retoId}/leave`);
    
    if (response.error) {
      console.error('Error al abandonar el reto:', response.error);
      throw new Error(response.error);
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Error leaving reto with id ${retoId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el progreso detallado del usuario en un reto específico
 * @param retoId ID del reto
 * @returns Información detallada del progreso del usuario
 */
export const getUserRetoProgress = async (retoId: string): Promise<any> => {
  try {
    console.log(`Obteniendo progreso detallado en el reto ${retoId}`);
    
    // Corregir la ruta - usar "progress" para la API del backend // Endpoint usa "progress" en inglés
    const response = await api.get(`/retos/${retoId}/progress`);
    
    if (response.error) {
      console.error('Error al obtener progreso:', response.error);
      throw new Error(response.error);
    }
    
    console.log('Datos de progreso recibidos:', response.data);
    
    // Corrección: asegurarnos que estamos devolviendo el objeto de progreso correctamente
    if (response.data && response.data.progress) {
      return response.data.progress;
    } else {
      console.warn('Datos de progreso recibidos en formato inesperado:', response.data);
      // Devolver los datos tal como están si no tienen la estructura esperada
      return response.data;
    }
  } catch (error: any) {
    console.error(`Error getting progress for reto ${retoId}:`, error);
    throw error;
  }
};

/**
 * Marca una tarea como completada
 * @param tareaId ID de la tarea a marcar como completada
 * @returns Resultados de la operación
 */
export const completeTarea = async (tareaId: string): Promise<any> => {
  try {
    console.log(`Marcando tarea ${tareaId} como completada`);
    
    const response = await api.post(`/retos/tareas/${tareaId}/complete`);
    
    if (response.error) {
      console.error('Error al completar la tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data.result;
  } catch (error: any) {
    console.error(`Error completing tarea ${tareaId}:`, error);
    throw error;
  }
};

/**
 * Desmarca una tarea como completada
 * @param tareaId ID de la tarea a desmarcar como completada
 * @returns Resultados de la operación
 */
export const uncompleteTarea = async (tareaId: string): Promise<any> => {
  try {
    console.log(`Desmarcando tarea ${tareaId} como completada`);
    
    const response = await api.del(`/tareas/${tareaId}/complete`);
    
    if (response.error) {
      console.error('Error al desmarcar la tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Error uncompleting tarea ${tareaId}:`, error);
    throw error;
  }
};