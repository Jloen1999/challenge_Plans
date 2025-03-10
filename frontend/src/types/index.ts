export interface User {
  id: string;
  email: string;
  nombre: string;
  puntaje: number;
  nivel: number;
  fecha_registro: string;
  roles?: string[];
}

export interface Plan {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  duracion_dias: number;
  es_publico: boolean;
  usuario_id: string;
  usuario?: {
    nombre: string;
    avatar?: string;
  };
  participantes?: number;
  retos?: number;
  categorias?: string[];
}

export interface Reto {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
  puntos_totales: number;
  es_publico: boolean;
  estado: 'borrador' | 'activo' | 'finalizado';
  creador_id: string;
  creador?: {
    nombre: string;
    avatar?: string;
  };
  participaciones?: number;
}

export interface Testimonio {
  id: number;
  content: string;
  author: string;
  role: string;
  avatar: string;
}

export interface Caracteristica {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Estadistica {
  id: number;
  value: number;
  label: string;
  icon: string;
}
