/**
 * Utilidad para probar directamente las llamadas a la API
 * Ejecutar desde la consola del navegador:
 * 
 * import { testGetApunteById } from './utils/apiTests';
 * testGetApunteById('id-del-apunte-aqui');
 */

import axios from 'axios';

export const testGetApunteById = async (id: string) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log(`Probando obtención de apunte con ID: ${id}`);
  console.log(`URL: ${API_URL}/apuntes/${id}`);
  
  try {
    const response = await axios.get(`${API_URL}/apuntes/${id}`);
    console.log('Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en la prueba:', error);
    throw error;
  }
};
