# Express.js: Framework para el Backend de Challenge Plans

![Express.js Logo](express.png)

## 📋 Índice
- [Express.js: Framework para el Backend de Challenge Plans](#expressjs-framework-para-el-backend-de-challenge-plans)
  - [📋 Índice](#-índice)
  - [Introducción](#introducción)
  - [Instalación y Recursos Necesarios](#instalación-y-recursos-necesarios)
    - [Prerrequisitos](#prerrequisitos)
    - [Instalación de Express](#instalación-de-express)
    - [Configuración](#configuración)
    - [Estructura de Archivos](#estructura-de-archivos)
  - [Manual de Uso](#manual-de-uso)
    - [Configuración Básica](#configuración-básica)
    - [Sistema de Rutas](#sistema-de-rutas)
      - [Estructura de Rutas](#estructura-de-rutas)
      - [Definición de Rutas Específicas](#definición-de-rutas-específicas)
    - [Middlewares](#middlewares)
      - [Middleware de Autenticación](#middleware-de-autenticación)
      - [Middleware de Manejo de Errores](#middleware-de-manejo-de-errores)
    - [Controladores](#controladores)
      - [Ejemplo de Controlador de Retos](#ejemplo-de-controlador-de-retos)
    - [Manejo de Errores](#manejo-de-errores)
      - [Utilidades para Errores Personalizados](#utilidades-para-errores-personalizados)
  - [Posibles Aplicaciones](#posibles-aplicaciones)
    - [1. APIs RESTful](#1-apis-restful)
    - [2. Aplicaciones Web Completas](#2-aplicaciones-web-completas)
    - [3. Microservicios](#3-microservicios)
    - [4. WebSockets y Aplicaciones en Tiempo Real](#4-websockets-y-aplicaciones-en-tiempo-real)
    - [5. Backend para Aplicaciones Móviles](#5-backend-para-aplicaciones-móviles)
  - [Compatibilidades y Plugins](#compatibilidades-y-plugins)
    - [Middlewares Esenciales](#middlewares-esenciales)
    - [Bibliotecas de Autenticación](#bibliotecas-de-autenticación)
    - [ORM y Bases de Datos](#orm-y-bases-de-datos)
    - [Utilidades](#utilidades)
    - [Escalando Express en Producción](#escalando-express-en-producción)
  - [Conclusión](#conclusión)
  - [Recursos Adicionales](#recursos-adicionales)

## Introducción

**Express.js** es como un compañero práctico y sencillo que te ayuda a crear sitios web y aplicaciones usando Node.js. No te complica la vida con cosas innecesarias y te da libertad para trabajar a tu manera. En nuestro proyecto **"Challenge Plans"**, lo elegimos porque hace que todo sea más rápido y fácil, y nos deja enfocarnos en lo importante sin enredarnos en configuraciones complicadas.

¿Por qué nos gusta tanto Express.js para este proyecto? Aquí van las razones principales:

- **Es ligero y rápido**: No agrega peso extra a Node.js, así que las cosas funcionan fluidas y sin retrasos.
- **Te da flexibilidad**: Puedes organizar tu aplicación como prefieras, sin reglas estrictas que te aten.
- **Tiene muchas herramientas útiles**: Viene con un montón de extras (como "middlewares") que te facilitan cosas como proteger la app, manejar datos o conectar con otros servicios.
- **Mucha gente lo usa**: Hay un montón de guías, ejemplos y personas dispuestas a ayudarte si algo se complica.
- **Funciona genial con nuestra base de datos**: Gracias a su compatibilidad con TypeORM, se lleva de maravilla con PostgreSQL, que usamos en el proyecto.

## Instalación y Recursos Necesarios

### Prerrequisitos

Antes de comenzar con Express, asegúrate de tener instalado:

- **Node.js** (versión 14.x o superior)
- **npm** (normalmente viene con Node.js)

### Instalación de Express

Para instalar Express en un proyecto Node.js:

```bash
# Inicializar un proyecto Node.js (si no existe)
npm init -y

# Instalar Express
npm install express
```

### Configuración

En nuestro proyecto, hemos instalado Express junto con otras dependencias esenciales:

```bash
npm install express cors helmet compression morgan typeorm pg reflect-metadata jsonwebtoken dotenv
```

Estas dependencias se encuentran en nuestro `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^6.1.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "pg": "^8.10.0",
    "typeorm": "^0.3.15",
    "reflect-metadata": "^0.1.13",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3"
  }
}
```

### Estructura de Archivos

La estructura básica de nuestro proyecto está organizada de la siguiente manera:
```text
backend/
├── src/
│   ├── controllers/     # Controladores para manejar lógica de negocio
│   ├── entities/        # Entidades de TypeORM para la base de datos
│   ├── middlewares/     # Middlewares personalizados
│   ├── routes/          # Definición de rutas API
│   ├── services/        # Servicios para interactuar con la base de datos
│   ├── app.ts           # Configuración de Express
│   ├── data-source.ts   # Configuración de TypeORM
│   └── index.ts         # Punto de entrada de la aplicación
├── .env                 # Variables de entorno
└── package.json         # Dependencias y scripts
```

## Manual de Uso

### Configuración Básica

Express se configura típicamente en un archivo central que define la aplicación, middlewares globales y rutas. En nuestro proyecto, esto se encuentra en `src/app.ts`:
```ts
// Configuración básica de Express en app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Crear la instancia de la aplicación
const app = express();

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(compression()); // Compresión de respuestas
app.use(morgan('dev')); // Logging de solicitudes HTTP
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parser para JSON
app.use(express.urlencoded({ extended: true })); // Parser para formularios

// Rutas de la API
app.use('/api', routes);

// Middleware para manejo de errores
app.use(errorMiddleware);

export default app;
```

Luego, en `index.ts`, inicializamos el servidor:

```ts
// Inicialización del servidor en index.ts
import 'dotenv/config';
import app from './app';
import { AppDataSource } from './data-source';

const PORT = process.env.PORT || 5000;

// Iniciar conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada correctamente');
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  });
  ```

  ### Sistema de Rutas

Express organiza las rutas de forma modular, permitiendo separarlas por funcionalidad. En nuestro proyecto, hemos implementado un sistema de rutas organizadas por dominio.
#### Estructura de Rutas
```ts
// routes/index.ts - Punto de entrada para todas las rutas
import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { retosRoutes } from './retos.routes';
import { planesRoutes } from './planes-estudio.routes';
import { tareasRoutes } from './tareas.routes';
import { apuntesRoutes } from './apuntes.routes';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/retos', authenticate, retosRoutes);
router.use('/tareas', authenticate, tareasRoutes);
router.use('/planes', authenticate, planesRoutes);
router.use('/apuntes', authenticate, apuntesRoutes);

export { router as routes };
```

#### Definición de Rutas Específicas

Cada dominio tiene su propio archivo de rutas, por ejemplo, para los retos:

```ts
// routes/retos.routes.ts
import { Router } from 'express';
import { retosController } from '../controllers/retos.controller';

const router = Router();

// Rutas GET para obtener datos
router.get('/', retosController.obtenerTodos);
router.get('/:id', retosController.obtenerPorId);
router.get('/:id/tareas', retosController.obtenerTareas);
router.get('/:id/progreso', retosController.obtenerProgreso);

// Rutas POST para crear datos
router.post('/', retosController.crear);

// Rutas PUT para actualizar datos
router.put('/:id', retosController.actualizar);

// Rutas DELETE para eliminar datos
router.delete('/:id', retosController.eliminar);

export { router as retosRoutes };
```

### Middlewares

Los middlewares son funciones que se ejecutan durante el ciclo de vida de una solicitud HTTP. Express permite insertar múltiples middlewares en la cadena de procesamiento de una solicitud.

#### Middleware de Autenticación

Uno de los middlewares más importantes en nuestro proyecto es el de autenticación:
```ts
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
    }
    
    // Verificar formato del token "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Añadir información del usuario a la solicitud
    req.usuario = decoded;
    
    // Continuar con el siguiente middleware
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
```

#### Middleware de Manejo de Errores

También hemos implementado un middleware centralizado para el manejo de errores:
```ts
// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/custom-errors';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Registrar el error en consola o en un servicio de logs
  console.error('Error:', error);
  
  // Manejar errores personalizados
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errors: error.errors
    });
  }
  
  // Errores de base de datos o errores generales
  return res.status(500).json({
    message: 'Error interno del servidor',
    // Solo mostrar detalles del error en desarrollo
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
```

### Controladores

Los controladores tienen la responsabilidad de procesar las solicitudes HTTP y enviar respuestas adecuadas. En nuestro proyecto, cada entidad tiene su propio controlador.

#### Ejemplo de Controlador de Retos
```ts
// controllers/retos.controller.ts
import { Request, Response, NextFunction } from 'express';
import { RetosService } from '../services/retos.service';

export class RetosController {
  private retosService: RetosService;
  
  constructor() {
    this.retosService = new RetosService();
  }
  
  // Obtener todos los retos
  public obtenerTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filtros = req.query;
      const retos = await this.retosService.obtenerTodos(filtros);
      return res.status(200).json(retos);
    } catch (error) {
      next(error);
    }
  };
  
  // Obtener un reto específico
  public obtenerPorId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const reto = await this.retosService.obtenerPorId(id);
      
      if (!reto) {
        return res.status(404).json({ message: 'Reto no encontrado' });
      }
      
      return res.status(200).json(reto);
    } catch (error) {
      next(error);
    }
  };
  
  // Crear un nuevo reto
  public crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = req.usuario.id;
      const retoData = { ...req.body, creador_id: usuarioId };
      
      const nuevoReto = await this.retosService.crear(retoData);
      return res.status(201).json(nuevoReto);
    } catch (error) {
      next(error);
    }
  };
  
  // Otros métodos del controlador...
}

export const retosController = new RetosController();
```

### Manejo de Errores

Express facilita el manejo de errores a través de middlewares, pero también es importante implementar una estrategia consistente para la generación de errores.

#### Utilidades para Errores Personalizados
```ts
// utils/custom-errors.ts
export class CustomError extends Error {
  statusCode: number;
  errors?: any[];
  
  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No estás autorizado para realizar esta acción') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ValidationError extends CustomError {
  constructor(errors: any[]) {
    super('Error de validación', 400, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
```

## Posibles Aplicaciones

Express es extremadamente versátil y puede utilizarse en múltiples tipos de aplicaciones:

### 1. APIs RESTful

Como en nuestro proyecto **Challenge Plans**, Express es perfecto para crear APIs RESTful que expongan recursos a través de endpoints HTTP. Su sistema de enrutamiento permite organizar fácilmente los endpoints por recurso y método.

### 2. Aplicaciones Web Completas

Express puede servir contenido estático y vistas renderizadas en el servidor, siendo adecuado para aplicaciones web tradicionales. Aunque nuestro proyecto usa React en el frontend, Express podría manejar tanto el backend como el frontend usando motores de plantillas como EJS, Pug o Handlebars.

### 3. Microservicios

La naturaleza ligera de Express lo hace ideal para arquitecturas de microservicios donde cada servicio debe ser lo más liviano posible. Los microservicios basados en Express pueden escalarse y desplegarse independientemente.

### 4. WebSockets y Aplicaciones en Tiempo Real

Express se integra fácilmente con bibliotecas como Socket.io para crear aplicaciones en tiempo real. En una futura versión de **Challenge Plans**, podríamos implementar notificaciones en tiempo real o chat colaborativo utilizando esta capacidad.

### 5. Backend para Aplicaciones Móviles

Las APIs de Express pueden servir como backend para aplicaciones móviles, proporcionando servicios como autenticación, almacenamiento y lógica de negocio.

## Compatibilidades y Plugins

Express cuenta con un ecosistema rico en middleware y extensiones que amplían su funcionalidad. En **Challenge Plans** utilizamos varios de estos:

### Middlewares Esenciales

| Middleware | Propósito | Uso en nuestro proyecto |
| --- | --- | --- |
| **cors** | Habilita el intercambio de recursos entre diferentes orígenes | Permite que nuestro frontend React se comunique con la API |
| **helmet** | Ayuda a proteger la aplicación configurando varios encabezados HTTP | Mejora la seguridad de la API contra ataques comunes |
| **morgan** | Registra solicitudes HTTP para depuración y monitoreo | Facilita la depuración en entorno de desarrollo |
| **compression** | Comprime las respuestas HTTP | Mejora el rendimiento reduciendo el tamaño de las respuestas |
| **express.json()** | Parsea solicitudes JSON | Permite recibir datos JSON en las solicitudes |
| **cookie-parser** | Parsea cookies en las solicitudes | Usado para manejar sesiones basadas en cookies |

### Bibliotecas de Autenticación

| Biblioteca | Propósito | Uso en nuestro proyecto |
| --- | --- | --- |
| **jsonwebtoken** | Implementa autenticación mediante JWT | Maneja la autenticación de usuarios |
| **bcrypt** | Hashea y verifica contraseñas | Protege las credenciales de los usuarios |

### ORM y Bases de Datos

| Biblioteca | Propósito | Uso en nuestro proyecto |
| --- | --- | --- |
| **TypeORM** | ORM para TypeScript | Nos permite interactuar con PostgreSQL usando clases y decoradores |
| **pg** | Driver para PostgreSQL | Permite la conexión con nuestra base de datos PostgreSQL |

### Utilidades

| Biblioteca | Propósito | Uso en nuestro proyecto |
| --- | --- | --- |
| **dotenv** | Carga variables de entorno desde .env | Gestiona configuraciones sensibles |
| **uuid** | Genera identificadores únicos | Crea IDs para nuestros recursos |
| **multer** | Maneja la subida de archivos | Permite a los usuarios subir imágenes y documentos |

### Escalando Express en Producción

Para entornos de producción, Express puede escalarse utilizando:

- **PM2**: Gestor de procesos que permite ejecutar múltiples instancias de la aplicación
- **Nginx**: Servidor web que puede funcionar como proxy inverso para balancear la carga
- **Docker**: Contenedoriza la aplicación para un despliegue consistente
- **Kubernetes**: Orquesta contenedores para alta disponibilidad y escalabilidad

## Conclusión

Express.js ha sido fundamental para construir el backend sólido y eficiente de **Challenge Plans**. Su enfoque minimalista pero potente nos ha permitido crear una API RESTful escalable que maneja toda la lógica de negocio de nuestra plataforma de aprendizaje colaborativo.

La combinación de Express con TypeORM y PostgreSQL nos proporciona un stack backend robusto, mientras que su sistema de middlewares nos permite implementar funcionalidades transversales como autenticación, logging y manejo de errores de forma elegante y modular.

Si estás construyendo una API web o una aplicación full-stack, Express es una excelente elección que te brinda el equilibrio perfecto entre simplicidad, flexibilidad y potencia.

## Recursos Adicionales

- [Documentación oficial de Express](vscode-file://vscode-app/c:/Users/JLOel/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- [Mejores prácticas de Express en producción](vscode-file://vscode-app/c:/Users/JLOel/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- [Tutorial de TypeORM con Express](vscode-file://vscode-app/c:/Users/JLOel/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- [Seguridad en aplicaciones Express](vscode-file://vscode-app/c:/Users/JLOel/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
