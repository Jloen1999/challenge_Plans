import { data as mockData } from './data';

// Función para simular una llamada API asíncrona
const simulateApiCall = (data, delay = 500, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API call failed'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// Mock para obtener todos los retos
export const getRetosMock = async () => {
  return simulateApiCall(mockData.retos);
};

// Mock para obtener un reto específico por ID
export const getRetoByIdMock = async (retoId) => {
  const reto = mockData.retos.find(r => r.id === retoId);
  return simulateApiCall(reto);
};

// Mock para obtener el progreso de un usuario en un reto
export const getProgresoRetoMock = async (userId, retoId) => {
  // Simular un progreso aleatorio entre 0-100%
  const progreso = Math.floor(Math.random() * 101);
  
  // Obtener las tareas del reto
  const tareas = mockData.tareas.filter(t => t.reto_id === retoId);
  
  // Determinar aleatoriamente cuáles están completadas basado en el progreso
  const tareasCompletasCount = Math.floor((progreso / 100) * tareas.length);
  const tareasCompletadas = tareas
    .slice(0, tareasCompletasCount)
    .map(tarea => ({ 
      tarea_id: tarea.id, 
      fecha_completado: new Date().toISOString() 
    }));
  
  return simulateApiCall({
    usuario_id: userId,
    reto_id: retoId,
    progreso,
    tareas_completadas: tareasCompletadas
  });
};

// Mock para obtener las tareas de un reto específico
export const getTareasByRetoIdMock = async (retoId) => {
  const tareas = mockData.tareas.filter(t => t.reto_id === retoId);
  return simulateApiCall(tareas);
};

// Mock para obtener una tarea específica por ID
export const getTareaByIdMock = async (tareaId) => {
  const tarea = mockData.tareas.find(t => t.id === tareaId);
  
  if (tarea) {
    // Añadir el reto al que pertenece
    const reto = mockData.retos.find(r => r.id === tarea.reto_id);
    return simulateApiCall({ ...tarea, reto });
  }
  
  return simulateApiCall(null, 500, true);
};

// Mock para obtener todos los planes de estudio
export const getPlanesMock = async () => {
  return simulateApiCall(mockData.planes);
};

// Mock para obtener un plan específico por ID
export const getPlanByIdMock = async (planId) => {
  const plan = mockData.planes.find(p => p.id === planId);
  return simulateApiCall(plan);
};

// Mock para obtener todos los apuntes
export const getApuntesMock = async () => {
  return simulateApiCall(mockData.apuntes);
};

// Mock para obtener un apunte específico por ID
export const getApunteByIdMock = async (apunteId) => {
  const apunte = mockData.apuntes.find(a => a.id === apunteId);
  return simulateApiCall(apunte);
};

// Mock para obtener comentarios por entidad (reto, tarea, apunte)
export const getComentariosByEntidadMock = async (tipoEntidad, entidadId) => {
  const comentarios = mockData.comentarios.filter(
    c => c.entidad === tipoEntidad && c.entidad_id === entidadId
  );
  return simulateApiCall(comentarios);
};

// Mock para crear un nuevo elemento con ID generado
export const createElementMock = async (tipo, datos) => {
  const newId = `${tipo}-${Date.now()}`;
  const newElement = { 
    ...datos, 
    id: newId,
    fecha_creacion: new Date().toISOString()
  };
  
  return simulateApiCall(newElement);
};

// Mock para actualizar un elemento existente
export const updateElementMock = async (tipo, id, datos) => {
  // En una implementación real, aquí se actualizaría en la base de datos
  return simulateApiCall({ ...datos, id });
};

// Mock para eliminar un elemento
export const deleteElementMock = async (tipo, id) => {
  // En una implementación real, aquí se eliminaría de la base de datos
  return simulateApiCall({ success: true, message: `${tipo} eliminado correctamente` });
};
