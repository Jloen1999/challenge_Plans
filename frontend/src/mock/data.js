import { v4 as uuidv4 } from 'uuid';

// Datos de prueba para la aplicación
export const data = {
  retos: [
    {
      id: 'reto-1',
      titulo: 'Fundamentos de React',
      descripcion: 'Aprende los conceptos básicos de React y construye tu primera aplicación.',
      fecha_inicio: '2023-09-01',
      fecha_fin: '2023-10-15',
      dificultad: 'principiante',
      puntos_totales: 500,
      es_publico: true,
      estado: 'activo',
      creador_id: 'user-1',
      imagen: "images/logo.webp",
      categorias: ['Frontend', 'React', 'JavaScript'],
      participaciones: 245
    },
    {
      id: "reto-001",
      titulo: "Desarrolla una API REST",
      descripcion: "Crea una API REST completa con autenticación y documentación usando Express y Swagger.",
      fecha_inicio: "2023-11-01",
      fecha_fin: "2023-12-01",
      dificultad: "intermedio",
      es_publico: true,
      creador_id: "usr-003",
      creador_nombre: "Admin User",
      categorias: ["cat-001", "cat-004"],
      participantes: 24,
      completado: 8,
      tareas_total: 5,
      imagen: "images/logo.webp"
    },
    {
      id: "reto-002",
      titulo: "Rediseña una aplicación móvil",
      descripcion: "Mejora la usabilidad de una aplicación móvil existente siguiendo principios de diseño UX/UI.",
      fecha_inicio: "2023-11-15",
      fecha_fin: "2023-12-15",
      dificultad: "avanzado",
      es_publico: true,
      creador_id: "usr-003",
      creador_nombre: "Admin User",
      categorias: ["cat-002"],
      participantes: 15,
      completado: 3,
      tareas_total: 4,
      imagen: "/assets/images/logo.webp"
    },
    {
      id: "reto-003",
      titulo: "Visualiza datos de COVID-19",
      descripcion: "Crea visualizaciones interactivas con datos reales de COVID-19 usando Python y bibliotecas de visualización.",
      fecha_inicio: "2023-10-20",
      fecha_fin: "2023-11-30",
      dificultad: "principiante",
      es_publico: true,
      creador_id: "usr-001",
      creador_nombre: "Ana García",
      categorias: ["cat-003"],
      participantes: 32,
      completado: 12,
      tareas_total: 3,
      imagen: "/assets/images/logo.webp"
    },
    {
      id: "reto-004",
      titulo: "Desarrolla un portfolio personal",
      descripcion: "Crea un sitio web portfolio personal con las mejores prácticas de desarrollo web y SEO.",
      fecha_inicio: "2023-11-10",
      fecha_fin: "2023-12-10",
      dificultad: "principiante",
      es_publico: true,
      creador_id: "usr-002",
      creador_nombre: "Carlos López",
      categorias: ["cat-004", "cat-002"],
      participantes: 45,
      completado: 18,
      tareas_total: 6,
      imagen: "/assets/images/logo.webp"
    },
    {
      id: "reto-005",
      titulo: "Realiza un test de penetración",
      descripcion: "Aprende a realizar un test de penetración ético en un entorno controlado.",
      fecha_inicio: "2023-11-20",
      fecha_fin: "2023-12-31",
      dificultad: "avanzado",
      es_publico: true,
      creador_id: "usr-003",
      creador_nombre: "Admin User",
      categorias: ["cat-005"],
      participantes: 12,
      completado: 2,
      tareas_total: 7,
      imagen: "/assets/images/logo.webp"
    }
  ],
  tareas: [
    {
      id: "tarea-001",
      reto_id: "reto-001",
      titulo: "Configuración del proyecto Node.js",
      descripcion: "Inicializa un proyecto Node.js e instala las dependencias necesarias para Express.",
      puntos: 100,
      fecha_creacion: "2023-11-01",
      fecha_limite: "2023-11-05",
      completado: false,
      asignado_a: null
    },
    {
      id: "tarea-002",
      reto_id: "reto-001",
      titulo: "Implementación de endpoints básicos",
      descripcion: "Crea los endpoints básicos para CRUD utilizando Express.",
      puntos: 150,
      fecha_creacion: "2023-11-01",
      fecha_limite: "2023-11-10",
      completado: false,
      asignado_a: null
    },
    {
      id: "tarea-003",
      reto_id: "reto-001",
      titulo: "Autenticación con JWT",
      descripcion: "Implementa un sistema de autenticación usando JSON Web Tokens.",
      puntos: 200,
      fecha_creacion: "2023-11-01",
      fecha_limite: "2023-11-15",
      completado: false,
      asignado_a: null
    },
    {
      id: "tarea-004",
      reto_id: "reto-001",
      titulo: "Middleware de validación",
      descripcion: "Crea middleware para validación de datos de entrada.",
      puntos: 125,
      fecha_creacion: "2023-11-01",
      fecha_limite: "2023-11-20",
      completado: false,
      asignado_a: null
    },
    {
      id: "tarea-005",
      reto_id: "reto-001",
      titulo: "Documentación con Swagger",
      descripcion: "Documenta tu API utilizando Swagger UI.",
      puntos: 175,
      fecha_creacion: "2023-11-01",
      fecha_limite: "2023-11-25",
      completado: false,
      asignado_a: null
    }
  ],
  planes: [
    {
      id: "plan-001",
      titulo: "Desarrollo Web Fullstack",
      descripcion: "Plan completo para convertirse en desarrollador fullstack en 12 semanas.",
      fecha_inicio: "2023-11-01",
      duracion_dias: 84,
      es_publico: true,
      usuario_id: "usr-003",
      usuario_nombre: "Admin User",
      retos_count: 5,
      apuntes_count: 12,
      imagen: "images/logo.webp"
    },
    {
      id: "plan-002",
      titulo: "Introducción a la Ciencia de Datos",
      descripcion: "Aprende los fundamentos de la ciencia de datos y el análisis estadístico.",
      fecha_inicio: "2023-10-15",
      duracion_dias: 60,
      es_publico: true,
      usuario_id: "usr-001",
      usuario_nombre: "Ana García",
      retos_count: 3,
      apuntes_count: 8,
      imagen: "images/logo.webp"
    },
    {
      id: "plan-003",
      titulo: "Diseño UX/UI Avanzado",
      descripcion: "Perfecciona tus habilidades de diseño con este plan para diseñadores experimentados.",
      fecha_inicio: "2023-11-10",
      duracion_dias: 45,
      es_publico: true,
      usuario_id: "usr-002",
      usuario_nombre: "Carlos López",
      retos_count: 4,
      apuntes_count: 6,
      imagen: "images/logo.webp"
    }
  ],
  apuntes: [
    {
      id: "apunte-001",
      titulo: "Introducción a Express.js",
      contenido: "Express es un framework para Node.js que facilita la creación de aplicaciones web y APIs...",
      formato: "md",
      es_publico: true,
      fecha_creacion: "2023-11-05",
      usuario_id: "usr-001",
      usuario_nombre: "Ana García",
      reto_id: "reto-001",
      calificacion_promedio: 4.5,
      calificaciones_count: 8,
      imagen: "images/logo.webp"
    },
    {
      id: "apunte-002",
      titulo: "Principios de Diseño UX",
      contenido: "El diseño UX se centra en la experiencia total del usuario al interactuar con un producto...",
      formato: "md",
      es_publico: true,
      fecha_creacion: "2023-11-08",
      usuario_id: "usr-002",
      usuario_nombre: "Carlos López",
      reto_id: "reto-002",
      calificacion_promedio: 4.8,
      calificaciones_count: 12,
      imagen: "images/logo.webp"
    },
    {
      id: "apunte-003",
      titulo: "Análisis de Datos con Python",
      contenido: "Python es uno de los lenguajes más populares para el análisis de datos gracias a bibliotecas como pandas...",
      formato: "md",
      es_publico: true,
      fecha_creacion: "2023-10-25",
      usuario_id: "usr-001",
      usuario_nombre: "Ana García",
      reto_id: "reto-003",
      calificacion_promedio: 4.2,
      calificaciones_count: 5,
      imagen: "images/logo.webp"
    }
  ],
  comentarios: [
    {
      id: "com-001",
      entidad: "reto",
      entidad_id: "reto-001",
      contenido: "Este reto está muy bien estructurado. Recomendado para quienes quieran aprender sobre APIs REST.",
      fecha_creacion: "2023-11-10",
      usuario_id: "usr-001",
      usuario_nombre: "Ana García",
      usuario_avatar: "/assets/images/avatars/ana.jpg",
      comentario_padre_id: null
    },
    {
      id: "com-002",
      entidad: "reto",
      entidad_id: "reto-001",
      contenido: "Gracias por el comentario, Ana. Me alegra que te parezca útil.",
      fecha_creacion: "2023-11-11",
      usuario_id: "usr-003",
      usuario_nombre: "Admin User",
      usuario_avatar: "/assets/images/avatars/admin.jpg",
      comentario_padre_id: "com-001"
    },
    {
      id: "com-003",
      entidad: "apunte",
      entidad_id: "apunte-001",
      contenido: "Excelente explicación sobre Express. Me ha ayudado mucho.",
      fecha_creacion: "2023-11-12",
      usuario_id: "usr-002",
      usuario_nombre: "Carlos López",
      usuario_avatar: "/assets/images/avatars/carlos.jpg",
      comentario_padre_id: null
    }
  ]
};

// Usuarios mock
export const usuarios = [
  {
    id: "usr-001",
    nombre: "Ana García",
    email: "ana@example.com",
    avatar: "/assets/images/avatars/ana.jpg",
    nivel: 4,
    puntaje: 2350,
    fecha_registro: "2023-05-15",
    rol: "usuario"
  },
  {
    id: "usr-002",
    nombre: "Carlos López",
    email: "carlos@example.com",
    avatar: "/assets/images/avatars/carlos.jpg",
    nivel: 3,
    puntaje: 1800,
    fecha_registro: "2023-06-20",
    rol: "usuario"
  },
  {
    id: "usr-003",
    nombre: "Admin User",
    email: "admin@example.com",
    avatar: "/assets/images/avatars/admin.jpg",
    nivel: 10,
    puntaje: 9999,
    fecha_registro: "2023-01-01",
    rol: "administrador"
  },
];

// Categorías mock
export const categorias = [
  {
    id: "cat-001",
    nombre: "Programación",
    descripcion: "Retos de programación en diferentes lenguajes",
    icono: "code"
  },
  {
    id: "cat-002",
    nombre: "Diseño UX/UI",
    descripcion: "Retos de diseño de experiencia e interfaz de usuario",
    icono: "brush"
  },
  {
    id: "cat-003",
    nombre: "Ciencia de Datos",
    descripcion: "Retos de análisis y visualización de datos",
    icono: "analytics"
  },
  {
    id: "cat-004",
    nombre: "Desarrollo Web",
    descripcion: "Retos de desarrollo de aplicaciones web",
    icono: "web"
  },
  {
    id: "cat-005",
    nombre: "Seguridad Informática",
    descripcion: "Retos de seguridad y hacking ético",
    icono: "security"
  },
];

// Retos mock
export const retos = [
  {
    id: "reto-001",
    titulo: "Desarrolla una API REST",
    descripcion: "Crea una API REST completa con autenticación y documentación usando Express y Swagger.",
    fecha_inicio: "2023-11-01",
    fecha_fin: "2023-12-01",
    dificultad: "intermedio",
    es_publico: true,
    creador_id: "usr-003",
    creador_nombre: "Admin User",
    categorias: ["cat-001", "cat-004"],
    participantes: 24,
    completado: 8,
    tareas_total: 5,
    imagen: "images/logo.webp"
  },
  {
    id: "reto-002",
    titulo: "Rediseña una aplicación móvil",
    descripcion: "Mejora la usabilidad de una aplicación móvil existente siguiendo principios de diseño UX/UI.",
    fecha_inicio: "2023-11-15",
    fecha_fin: "2023-12-15",
    dificultad: "avanzado",
    es_publico: true,
    creador_id: "usr-003",
    creador_nombre: "Admin User",
    categorias: ["cat-002"],
    participantes: 15,
    completado: 3,
    tareas_total: 4,
    imagen: "images/logo.webp"
  },
  {
    id: "reto-003",
    titulo: "Visualiza datos de COVID-19",
    descripcion: "Crea visualizaciones interactivas con datos reales de COVID-19 usando Python y bibliotecas de visualización.",
    fecha_inicio: "2023-10-20",
    fecha_fin: "2023-11-30",
    dificultad: "principiante",
    es_publico: true,
    creador_id: "usr-001",
    creador_nombre: "Ana García",
    categorias: ["cat-003"],
    participantes: 32,
    completado: 12,
    tareas_total: 3,
    imagen: "images/logo.webp"
  },
  {
    id: "reto-004",
    titulo: "Desarrolla un portfolio personal",
    descripcion: "Crea un sitio web portfolio personal con las mejores prácticas de desarrollo web y SEO.",
    fecha_inicio: "2023-11-10",
    fecha_fin: "2023-12-10",
    dificultad: "principiante",
    es_publico: true,
    creador_id: "usr-002",
    creador_nombre: "Carlos López",
    categorias: ["cat-004", "cat-002"],
    participantes: 45,
    completado: 18,
    tareas_total: 6,
    imagen: "images/logo.webp"
  },
  {
    id: "reto-005",
    titulo: "Realiza un test de penetración",
    descripcion: "Aprende a realizar un test de penetración ético en un entorno controlado.",
    fecha_inicio: "2023-11-20",
    fecha_fin: "2023-12-31",
    dificultad: "avanzado",
    es_publico: true,
    creador_id: "usr-003",
    creador_nombre: "Admin User",
    categorias: ["cat-005"],
    participantes: 12,
    completado: 2,
    tareas_total: 7,
    imagen: "images/logo.webp"
  }
];

// Tareas mock para el reto-001
export const tareas = [
  {
    id: "tarea-001",
    reto_id: "reto-001",
    titulo: "Configuración del proyecto Node.js",
    descripcion: "Inicializa un proyecto Node.js e instala las dependencias necesarias para Express.",
    puntos: 100,
    fecha_creacion: "2023-11-01",
    fecha_limite: "2023-11-05",
    completado: false,
    asignado_a: null
  },
  {
    id: "tarea-002",
    reto_id: "reto-001",
    titulo: "Implementación de endpoints básicos",
    descripcion: "Crea los endpoints básicos para CRUD utilizando Express.",
    puntos: 150,
    fecha_creacion: "2023-11-01",
    fecha_limite: "2023-11-10",
    completado: false,
    asignado_a: null
  },
  {
    id: "tarea-003",
    reto_id: "reto-001",
    titulo: "Autenticación con JWT",
    descripcion: "Implementa un sistema de autenticación usando JSON Web Tokens.",
    puntos: 200,
    fecha_creacion: "2023-11-01",
    fecha_limite: "2023-11-15",
    completado: false,
    asignado_a: null
  },
  {
    id: "tarea-004",
    reto_id: "reto-001",
    titulo: "Middleware de validación",
    descripcion: "Crea middleware para validación de datos de entrada.",
    puntos: 125,
    fecha_creacion: "2023-11-01",
    fecha_limite: "2023-11-20",
    completado: false,
    asignado_a: null
  },
  {
    id: "tarea-005",
    reto_id: "reto-001",
    titulo: "Documentación con Swagger",
    descripcion: "Documenta tu API utilizando Swagger UI.",
    puntos: 175,
    fecha_creacion: "2023-11-01",
    fecha_limite: "2023-11-25",
    completado: false,
    asignado_a: null
  }
];

// Planes de estudio mock
export const planesEstudio = [
  {
    id: "plan-001",
    titulo: "Desarrollo Web Fullstack",
    descripcion: "Plan completo para convertirse en desarrollador fullstack en 12 semanas.",
    fecha_inicio: "2023-11-01",
    duracion_dias: 84,
    es_publico: true,
    usuario_id: "usr-003",
    usuario_nombre: "Admin User",
    retos_count: 5,
    apuntes_count: 12,
    imagen: "images/logo.webp"
  },
  {
    id: "plan-002",
    titulo: "Introducción a la Ciencia de Datos",
    descripcion: "Aprende los fundamentos de la ciencia de datos y el análisis estadístico.",
    fecha_inicio: "2023-10-15",
    duracion_dias: 60,
    es_publico: true,
    usuario_id: "usr-001",
    usuario_nombre: "Ana García",
    retos_count: 3,
    apuntes_count: 8,
    imagen: "images/logo.webp"
  },
  {
    id: "plan-003",
    titulo: "Diseño UX/UI Avanzado",
    descripcion: "Perfecciona tus habilidades de diseño con este plan para diseñadores experimentados.",
    fecha_inicio: "2023-11-10",
    duracion_dias: 45,
    es_publico: true,
    usuario_id: "usr-002",
    usuario_nombre: "Carlos López",
    retos_count: 4,
    apuntes_count: 6,
    imagen: "images/logo.webp"
  }
];

// Apuntes mock
export const apuntes = [
  {
    id: "apunte-001",
    titulo: "Introducción a Express.js",
    contenido: "Express es un framework para Node.js que facilita la creación de aplicaciones web y APIs...",
    formato: "md",
    es_publico: true,
    fecha_creacion: "2023-11-05",
    usuario_id: "usr-001",
    usuario_nombre: "Ana García",
    reto_id: "reto-001",
    calificacion_promedio: 4.5,
    calificaciones_count: 8,
    imagen: "images/logo.webp"
  },
  {
    id: "apunte-002",
    titulo: "Principios de Diseño UX",
    contenido: "El diseño UX se centra en la experiencia total del usuario al interactuar con un producto...",
    formato: "md",
    es_publico: true,
    fecha_creacion: "2023-11-08",
    usuario_id: "usr-002",
    usuario_nombre: "Carlos López",
    reto_id: "reto-002",
    calificacion_promedio: 4.8,
    calificaciones_count: 12,
    imagen: "images/logo.webp"
  },
  {
    id: "apunte-003",
    titulo: "Análisis de Datos con Python",
    contenido: "Python es uno de los lenguajes más populares para el análisis de datos gracias a bibliotecas como pandas...",
    formato: "md",
    es_publico: true,
    fecha_creacion: "2023-10-25",
    usuario_id: "usr-001",
    usuario_nombre: "Ana García",
    reto_id: "reto-003",
    calificacion_promedio: 4.2,
    calificaciones_count: 5,
    imagen: "images/logo.webp"
  }
];

// Comentarios mock
export const comentarios = [
  {
    id: "com-001",
    entidad: "reto",
    entidad_id: "reto-001",
    contenido: "Este reto está muy bien estructurado. Recomendado para quienes quieran aprender sobre APIs REST.",
    fecha_creacion: "2023-11-10",
    usuario_id: "usr-001",
    usuario_nombre: "Ana García",
    usuario_avatar: "/assets/images/avatars/ana.jpg",
    comentario_padre_id: null
  },
  {
    id: "com-002",
    entidad: "reto",
    entidad_id: "reto-001",
    contenido: "Gracias por el comentario, Ana. Me alegra que te parezca útil.",
    fecha_creacion: "2023-11-11",
    usuario_id: "usr-003",
    usuario_nombre: "Admin User",
    usuario_avatar: "/assets/images/avatars/admin.jpg",
    comentario_padre_id: "com-001"
  },
  {
    id: "com-003",
    entidad: "apunte",
    entidad_id: "apunte-001",
    contenido: "Excelente explicación sobre Express. Me ha ayudado mucho.",
    fecha_creacion: "2023-11-12",
    usuario_id: "usr-002",
    usuario_nombre: "Carlos López",
    usuario_avatar: "/assets/images/avatars/carlos.jpg",
    comentario_padre_id: null
  }
];

// Notificaciones mock
export const notificaciones = [
  {
    id: "notif-001",
    usuario_id: "usr-001",
    titulo: "¡Nueva tarea disponible!",
    mensaje: "Se ha añadido una nueva tarea al reto 'Desarrolla una API REST'.",
    tipo: "tarea",
    entidad: "reto",
    entidad_id: "reto-001",
    fecha_creacion: "2023-11-15",
    leida: false
  },
  {
    id: "notif-002",
    usuario_id: "usr-001",
    titulo: "Comentario en tu apunte",
    mensaje: "Carlos ha comentado en tu apunte 'Introducción a Express.js'.",
    tipo: "comentario",
    entidad: "apunte",
    entidad_id: "apunte-001",
    fecha_creacion: "2023-11-12",
    leida: true
  },
  {
    id: "notif-003",
    usuario_id: "usr-001",
    titulo: "¡Felicitaciones!",
    mensaje: "Has completado el 50% del reto 'Desarrolla una API REST'.",
    tipo: "progreso",
    entidad: "reto",
    entidad_id: "reto-001",
    fecha_creacion: "2023-11-18",
    leida: false
  }
];

// Progreso de usuario en retos mock
export const progresoRetos = [
  {
    usuario_id: "usr-001",
    reto_id: "reto-001",
    progreso: 60,
    fecha_inicio: "2023-11-05",
    tareas_completadas: [
      {
        tarea_id: "tarea-001",
        fecha_completado: "2023-11-07",
        progreso: 100
      },
      {
        tarea_id: "tarea-002",
        fecha_completado: "2023-11-12",
        progreso: 100
      },
      {
        tarea_id: "tarea-003",
        fecha_completado: "2023-11-18",
        progreso: 100
      }
    ]
  },
  {
    usuario_id: "usr-001",
    reto_id: "reto-003",
    progreso: 33,
    fecha_inicio: "2023-10-22",
    tareas_completadas: [
      {
        tarea_id: "tarea-008", // ID ficticio
        fecha_completado: "2023-10-25",
        progreso: 100
      }
    ]
  },
  {
    usuario_id: "usr-002",
    reto_id: "reto-002",
    progreso: 75,
    fecha_inicio: "2023-11-16",
    tareas_completadas: [
      {
        tarea_id: "tarea-004", // ID ficticio
        fecha_completado: "2023-11-18",
        progreso: 100
      },
      {
        tarea_id: "tarea-005", // ID ficticio
        fecha_completado: "2023-11-20",
        progreso: 100
      },
      {
        tarea_id: "tarea-006", // ID ficticio
        fecha_completado: "2023-11-22",
        progreso: 100
      }
    ]
  }
];

// Función para generar un ID aleatorio
export const generateId = (prefix) => {
  return `${prefix}-${uuidv4().substring(0, 8)}`;
};

// Funciones auxiliares para simular API
export const mockApiCall = (data, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const getUsuarioMock = (id) => {
  return mockApiCall(usuarios.find(user => user.id === id));
};

export const getRetosMock = () => {
  return mockApiCall([...retos]);
};

export const getRetoByIdMock = (id) => {
  return mockApiCall(retos.find(reto => reto.id === id));
};

export const getTareasByRetoIdMock = (retoId) => {
  return mockApiCall(tareas.filter(tarea => tarea.reto_id === retoId));
};

export const getPlanesMock = () => {
  return mockApiCall([...planesEstudio]);
};

export const getPlanByIdMock = (id) => {
  return mockApiCall(planesEstudio.find(plan => plan.id === id));
};

export const getApuntesMock = () => {
  return mockApiCall([...apuntes]);
};

export const getApunteByIdMock = (id) => {
  return mockApiCall(apuntes.find(apunte => apunte.id === id));
};

export const getComentariosByEntidadMock = (entidad, entidadId) => {
  return mockApiCall(
    comentarios.filter(c => c.entidad === entidad && c.entidad_id === entidadId && !c.comentario_padre_id)
  );
};

export const getNotificacionesMock = (usuarioId) => {
  return mockApiCall(notificaciones.filter(n => n.usuario_id === usuarioId));
};

export const getProgresoRetoMock = (usuarioId, retoId) => {
  return mockApiCall(
    progresoRetos.find(p => p.usuario_id === usuarioId && p.reto_id === retoId) || { progreso: 0, tareas_completadas: [] }
  );
};

// Añadimos las funciones de mock para tareas que están faltando
export const getTareasMock = async () => {
  return data.tareas;
};

export const getTareaByIdMock = async (tareaId) => {
  const tarea = data.tareas.find(t => t.id === tareaId);
  if (tarea) {
    // Añadir información del reto al que pertenece la tarea
    const reto = data.retos.find(r => r.id === tarea.reto_id);
    return { ...tarea, reto };
  }
  return null;
};

// Función para simular login
export const loginMock = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = usuarios.find(u => u.email === email);
      if (user) {
        resolve({
          user,
          token: "mock-jwt-token-" + Math.random().toString(36).substring(2)
        });
      } else {
        reject({ message: "Credenciales inválidas" });
      }
    }, 800);
  });
};

// Función para simular registro
export const registerMock = (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        id: generateId("usr"),
        ...userData,
        nivel: 1,
        puntaje: 0,
        fecha_registro: new Date().toISOString().split('T')[0],
        rol: "usuario",
        avatar: "/assets/images/avatars/default.jpg"
      };
      resolve({
        user: newUser,
        token: "mock-jwt-token-" + Math.random().toString(36).substring(2)
      });
    }, 800);
  });
};

// Exportación por defecto por si es necesaria
export default { data, categorias, generateId };
