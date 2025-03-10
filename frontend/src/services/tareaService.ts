import api from './api'; // Usar el servicio api centralizado

// Interfaces para tipar los datos
export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  reto_id: string;
  puntos: number;
  fecha_limite?: string;
  tipo?: string;
  asignado_a?: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface TareaCompletada extends Tarea {
  fecha_completado: string;
  reto_titulo?: string;
}

export interface TareaConEstado extends Tarea {
  completada: boolean;
  fecha_completado?: string;
}

export interface TareaCreacionDTO {
  titulo: string;
  descripcion?: string;
  reto_id: string;
  puntos: number;
  fecha_limite?: string;
  tipo?: string;
  asignado_a?: string;
  asignaciones_ids?: string[];
}

/**
 * Obtiene todas las tareas con filtros opcionales
 * @param retoId Filtrar tareas por un reto específico
 * @returns Lista de tareas
 */
export const getAllTareas = async (retoId?: string): Promise<Tarea[]> => {
  try {
    console.log(`Obteniendo tareas ${retoId ? `del reto ${retoId}` : ''}`);
    
    const endpoint = retoId ? `/tareas?retoId=${retoId}` : '/tareas';
    const response = await api.get(endpoint);
    
    if (response.error) {
      console.error('Error al obtener tareas:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.tareas || [];
  } catch (error: any) {
    console.error('Error fetching tareas:', error);
    throw error;
  }
};

/**
 * Obtiene una tarea específica por su ID
 * @param id ID de la tarea
 * @returns Detalles de la tarea
 */
export const getTareaById = async (id: string): Promise<Tarea> => {
  try {
    console.log(`Obteniendo detalles de la tarea ${id}`);
    
    const response = await api.get(`/tareas/${id}`);
    
    if (response.error) {
      console.error('Error al obtener tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.tarea;
  } catch (error: any) {
    console.error(`Error fetching tarea with id ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene las tareas completadas por el usuario
 * @returns Lista de tareas completadas
 */
export const getCompletedTareas = async (): Promise<TareaCompletada[]> => {
  try {
    console.log('Obteniendo tareas completadas');
    
    const response = await api.get('/tareas/user/completed');
    
    if (response.error) {
      console.error('Error al obtener tareas completadas:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.tareasCompletadas || [];
  } catch (error: any) {
    console.error('Error fetching completed tareas:', error);
    throw error;
  }
};

/**
 * Crea una nueva tarea
 * @param tareaData Datos de la tarea a crear
 * @returns Tarea creada
 */
export const createTarea = async (tareaData: TareaCreacionDTO): Promise<Tarea> => {
  try {
    console.log('Creando nueva tarea:', tareaData);
    
    const response = await api.post('/tareas', tareaData);
    
    if (response.error) {
      console.error('Error al crear tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.tarea;
  } catch (error: any) {
    console.error('Error creating tarea:', error);
    throw error;
  }
};

/**
 * Actualiza una tarea existente
 * @param id ID de la tarea
 * @param tareaData Datos a actualizar
 * @returns Tarea actualizada
 */
export const updateTarea = async (id: string, tareaData: Partial<TareaCreacionDTO>): Promise<Tarea> => {
  try {
    console.log(`Actualizando tarea ${id}:`, tareaData);
    
    const response = await api.put(`/tareas/${id}`, tareaData);
    
    if (response.error) {
      console.error('Error al actualizar tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.tarea;
  } catch (error: any) {
    console.error(`Error updating tarea ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una tarea
 * @param id ID de la tarea a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteTarea = async (id: string): Promise<boolean> => {
  try {
    console.log(`Eliminando tarea ${id}`);
    
    const response = await api.del(`/tareas/${id}`);
    
    if (response.error) {
      console.error('Error al eliminar tarea:', response.error);
      throw new Error(response.error);
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error deleting tarea ${id}:`, error);
    throw error;
  }
};

/**
 * Marca una tarea como completada
 * @param id ID de la tarea
 * @returns Resultados de la operación
 */
export const completeTarea = async (id: string): Promise<{ completada: boolean; tarea_id: string; fecha_completado: string }> => {
  try {
    console.log(`Marcando tarea ${id} como completada`);
    
    const response = await api.post(`/tareas/${id}/complete`);
    
    if (response.error) {
      console.error('Error al completar tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.result;
  } catch (error: any) {
    console.error(`Error completing tarea ${id}:`, error);
    throw error;
  }
};

/**
 * Desmarca una tarea como completada
 * @param id ID de la tarea
 * @returns true si se desmarcó correctamente
 */
export const uncompleteTarea = async (id: string): Promise<boolean> => {
  try {
    console.log(`Desmarcando tarea ${id}`);
    
    const response = await api.del(`/tareas/${id}/complete`);
    
    if (response.error) {
      console.error('Error al desmarcar tarea:', response.error);
      throw new Error(response.error);
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error uncompleting tarea ${id}:`, error);
    throw error;
  }
};

/**
 * Verifica si una tarea está completada
 * @param id ID de la tarea
 * @returns true si la tarea está completada, false en caso contrario
 */
export const checkTareaCompleted = async (id: string): Promise<boolean> => {
  try {
    console.log(`Verificando si la tarea ${id} está completada`);
    
    const response = await api.get(`/tareas/${id}/completed`);
    
    if (response.error) {
      console.error('Error al verificar estado de la tarea:', response.error);
      throw new Error(response.error);
    }
    
    return response.data?.isCompleted || false;
  } catch (error: any) {
    console.error(`Error checking if tarea ${id} is completed:`, error);
    throw error;
  }
};

export default {
  getAllTareas,
  getTareaById,
  getCompletedTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  completeTarea,
  uncompleteTarea,
  checkTareaCompleted
};
