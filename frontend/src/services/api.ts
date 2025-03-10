/**
 * Servicio base para realizar peticiones HTTP a la API
 */

const API_URL = '/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestOptions {
  headers?: Record<string, string>;
  token?: string;
}

/**
 * Realiza una petición GET a la API
 * @param endpoint - Endpoint relativo al API_URL
 * @param options - Opciones de la petición
 */
export async function get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return await request<T>('GET', endpoint, undefined, options);
}

/**
 * Realiza una petición POST a la API
 * @param endpoint - Endpoint relativo al API_URL
 * @param body - Cuerpo de la petición
 * @param options - Opciones de la petición
 */
export async function post<T = any>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return await request<T>('POST', endpoint, body, options);
}

/**
 * Realiza una petición PUT a la API
 * @param endpoint - Endpoint relativo al API_URL
 * @param body - Cuerpo de la petición
 * @param options - Opciones de la petición
 */
export async function put<T = any>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return await request<T>('PUT', endpoint, body, options);
}

/**
 * Realiza una petición DELETE a la API
 * @param endpoint - Endpoint relativo al API_URL
 * @param options - Opciones de la petición
 */
export async function del<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return await request<T>('DELETE', endpoint, undefined, options);
}

/**
 * Función base para realizar peticiones HTTP
 */
async function request<T = any>(
  method: string,
  endpoint: string,
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  // Construir headers básicos
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Añadir token de autenticación si existe
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  } else {
    // Intentar obtener el token del localStorage
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  console.log(`API Request: ${method} ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    console.log(`API Response: ${response.status} from ${url}`);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('Response data:', data);
    } else {
      data = await response.text();
      console.log('Response text:', data);
    }
    
    if (!response.ok) {
      console.error('API Error:', data);
      return {
        error: data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }
    
    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('API Request failed:', error);
    
    return {
      error: error.message || 'Error en la comunicación con el servidor',
      status: 0,
    };
  }
}

export default { get, post, put, del };
