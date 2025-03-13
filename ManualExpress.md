# 📘 Express.js para Principiantes Absolutos
## Un manual amigable para aprender Express con la plataforma Challenge Plans

![Express.js Logo](/docs/express.png)

## 📋 Índice

- [📘 Express.js para Principiantes Absolutos](#-expressjs-para-principiantes-absolutos)
  - [Un manual amigable para aprender Express con la plataforma Challenge Plans](#un-manual-amigable-para-aprender-express-con-la-plataforma-challenge-plans)
  - [📋 Índice](#-índice)
  - [1. 👋 Bienvenida: ¿Qué es Express y por qué usarlo?](#1--bienvenida-qué-es-express-y-por-qué-usarlo)
    - [¿Qué es Express exactamente?](#qué-es-express-exactamente)
    - [¿Por qué la gente adora Express?](#por-qué-la-gente-adora-express)
  - [2. 🚶‍♀️ Primeros Pasos: Creando tu Servidor Web](#2-️-primeros-pasos-creando-tu-servidor-web)
    - [Instalación: Preparando el terreno](#instalación-preparando-el-terreno)
    - [Tu Primer Servidor Express: ¡Hola Mundo!](#tu-primer-servidor-express-hola-mundo)
    - [La Estructura Básica de un Proyecto](#la-estructura-básica-de-un-proyecto)
  - [3. 🧩 Conceptos Fundamentales: Las Piezas del Rompecabezas](#3--conceptos-fundamentales-las-piezas-del-rompecabezas)
    - [La Aplicación Express](#la-aplicación-express)
    - [Las Peticiones (Request o req)](#las-peticiones-request-o-req)
    - [Las Respuestas (Response o res)](#las-respuestas-response-o-res)
  - [4. 🛣️ Rutas: Los Caminos de tu Aplicación](#4-️-rutas-los-caminos-de-tu-aplicación)
    - [Métodos HTTP: Diferentes Verbos para Diferentes Acciones](#métodos-http-diferentes-verbos-para-diferentes-acciones)
    - [Parámetros en Rutas: Rutas Dinámicas](#parámetros-en-rutas-rutas-dinámicas)
    - [Query Strings: Información Extra en la URL](#query-strings-información-extra-en-la-url)
    - [Organizando Rutas: Mantén Tu Código Ordenado](#organizando-rutas-mantén-tu-código-ordenado)
  - [5. 🔄 Middlewares: Los Ayudantes de Express](#5--middlewares-los-ayudantes-de-express)
    - [¿Qué son los Middlewares?](#qué-son-los-middlewares)
    - [Middlewares Integrados y Populares](#middlewares-integrados-y-populares)
    - [Creando tu Propio Middleware](#creando-tu-propio-middleware)
    - [Middleware de Autenticación: Un Ejemplo Práctico](#middleware-de-autenticación-un-ejemplo-práctico)
  - [6. 🎮 Controladores: Donde Sucede la Acción](#6--controladores-donde-sucede-la-acción)
    - [¿Qué es un Controlador?](#qué-es-un-controlador)
    - [Estructura de un Controlador](#estructura-de-un-controlador)
    - [Ejemplo Práctico: Controlador de Retos](#ejemplo-práctico-controlador-de-retos)
  - [7. 🏭 Servicios: Separando la Lógica de Negocio](#7--servicios-separando-la-lógica-de-negocio)
    - [¿Por qué Necesitamos Servicios?](#por-qué-necesitamos-servicios)
    - [Ejemplo de un Servicio: RetosService](#ejemplo-de-un-servicio-retosservice)
  - [8. ❌ Manejo de Errores: Cuando las Cosas Salen Mal](#8--manejo-de-errores-cuando-las-cosas-salen-mal)
    - [Errores en Express](#errores-en-express)
    - [Middleware de Errores Personalizado](#middleware-de-errores-personalizado)
    - [Clases de Error Personalizadas](#clases-de-error-personalizadas)
  - [9. 🔌 Conectando con la Base de Datos](#9--conectando-con-la-base-de-datos)
    - [TypeORM: Un Puente Entre Express y la Base de Datos](#typeorm-un-puente-entre-express-y-la-base-de-datos)
    - [Configuración de la Conexión](#configuración-de-la-conexión)
  - [10. 🛡️ Autenticación y Seguridad](#10-️-autenticación-y-seguridad)
    - [Autenticación con JWT](#autenticación-con-jwt)
    - [Protegiendo Rutas con Middleware](#protegiendo-rutas-con-middleware)
    - [Buenas Prácticas de Seguridad](#buenas-prácticas-de-seguridad)
  - [11. 📦 Validación de Datos](#11--validación-de-datos)
    - [Por Qué Validar los Datos](#por-qué-validar-los-datos)
    - [Usando express-validator](#usando-express-validator)
    - [Validaciones Personalizadas](#validaciones-personalizadas)
  - [12. ✅ Pruebas y Depuración](#12--pruebas-y-depuración)
    - [Pruebas en Express](#pruebas-en-express)
    - [Depuración Efectiva](#depuración-efectiva)
  - [13. 🚀 Despliegue y Producción](#13--despliegue-y-producción)
    - [Preparando para Producción](#preparando-para-producción)
    - [Opciones de Despliegue](#opciones-de-despliegue)
  - [14. 📝 Glosario: Términos que Debes Conocer](#14--glosario-términos-que-debes-conocer)
  - [15. 📚 Recursos Adicionales](#15--recursos-adicionales)

## 1. 👋 Bienvenida: ¿Qué es Express y por qué usarlo?

### ¿Qué es Express exactamente?

Imagina que quieres construir una casa. Podrías empezar desde cero, fabricando cada ladrillo, mezclando el cemento, cortando la madera... ¡o podrías usar materiales prefabricados que hacen el trabajo mucho más rápido! **Express.js** es como ese conjunto de materiales prefabricados, pero para crear aplicaciones web con JavaScript.

En términos más técnicos, Express es un **framework** (un marco de trabajo) para Node.js que simplifica la creación de servidores web y APIs. Es como un ayudante que te proporciona herramientas y estructuras ya preparadas para que no tengas que escribir todo desde cero.

```javascript
// Así de simple es crear un servidor web con Express
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('¡Hola! Bienvenido a mi primera app con Express');
});

app.listen(3000, () => {
  console.log('Servidor funcionando en http://localhost:3000');
});
```

### ¿Por qué la gente adora Express?

1. **Es simple y no te complica la vida**: Express no te obliga a seguir reglas estrictas. Es como un lienzo en blanco donde tú decides cómo organizar tu código.

2. **Es rápido y ligero**: No viene con un montón de funciones que quizás nunca uses. Solo incluye lo esencial, y tú añades lo que necesites.

3. **Tiene una comunidad enorme**: Si te encuentras con un problema, es casi seguro que alguien ya lo ha solucionado antes.

4. **Es muy flexible**: Puedes usarlo para crear desde una pequeña API hasta una aplicación web compleja como nuestra plataforma Challenge Plans.

## 2. 🚶‍♀️ Primeros Pasos: Creando tu Servidor Web

### Instalación: Preparando el terreno

Para empezar a usar Express, necesitas tener Node.js instalado en tu computadora. Luego, crear un proyecto es tan sencillo como:

```bash
# Crear una carpeta para tu proyecto
mkdir mi-primera-app-express
cd mi-primera-app-express

# Inicializar un proyecto de Node.js
npm init -y

# Instalar Express
```bash
# Instalar Express y otros módulos recomendados
npm install express helmet morgan compression cors
```

### Tu Primer Servidor Express: ¡Hola Mundo!

Vamos a crear el ejemplo más básico posible. Crea un archivo llamado `app.js` con este contenido:

```javascript
// 1. Importamos Express
const express = require('express');

// 2. Creamos una "app" (aplicación) de Express
const app = express();

// 3. Definimos una ruta para la página principal
app.get('/', (req, res) => {
  res.send('¡Hola, mundo! Este es mi primer servidor con Express');
});

// 4. Iniciamos el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('¡Servidor encendido! Visita http://localhost:3000');
});
```

Para ejecutar este servidor, abre una terminal y escribe:

```bash
node app.js
```

Ahora, abre tu navegador y visita `http://localhost:3000`. ¡Deberías ver tu mensaje!

### La Estructura Básica de un Proyecto

En Challenge Plans, organizamos nuestro código de manera ordenada para que sea fácil de mantener. Así se ve una estructura típica:

```
mi-proyecto/
├── src/                  # Código fuente
│   ├── controllers/      # Controladores: manejan la lógica de las rutas
│   ├── routes/           # Definición de rutas: qué URLs acepta tu aplicación
│   ├── services/         # Servicios: lógica de negocio y acceso a datos
│   ├── middlewares/      # Middlewares: funciones que procesan las peticiones
│   ├── app.js            # Configuración principal de Express
│   └── index.js          # Punto de entrada de la aplicación
├── .env                  # Variables de entorno (configuraciones privadas)
└── package.json          # Dependencias y scripts
```

En proyectos pequeños, puedes empezar con una estructura más simple y expandirla cuando sea necesario.

## 3. 🧩 Conceptos Fundamentales: Las Piezas del Rompecabezas

### La Aplicación Express

Todo comienza con la creación de una aplicación Express. Piensa en ella como el "cerebro" de tu servidor:

```javascript
const express = require('express');
const app = express();
```

Esta `app` es el objeto principal que usarás para configurar todo tu servidor. Algunas cosas que puedes hacer con ella:

- Definir rutas (`app.get()`, `app.post()`, etc.)
- Configurar middlewares (`app.use()`)
- Iniciar el servidor (`app.listen()`)

En nuestro proyecto Challenge Plans, configuramos la app en `src/app.ts`:

```typescript
// src/app.ts simplificado
import express from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Crear la aplicación Express
const app = express();

// Configurar middlewares
app.use(express.json());  // Para entender JSON
app.use(cors());          // Para permitir peticiones desde otros dominios

// Configurar rutas
app.use('/api', routes);

// Middleware para manejar errores
app.use(errorMiddleware);

export default app;
```

### Las Peticiones (Request o req)

Cuando alguien visita tu sitio web o usa tu API, envía una **petición** (request) a tu servidor. Esta petición contiene mucha información útil:

- **req.params**: Parámetros en la URL (como `/usuarios/123`, donde `123` es un parámetro)
- **req.query**: Información en la query string (como `/buscar?nombre=Juan`)
- **req.body**: Datos enviados en el cuerpo de la petición (por ejemplo, desde un formulario)
- **req.headers**: Cabeceras HTTP con metadatos de la petición

```javascript
// Ejemplo: accediendo a la información de la petición
app.get('/saludo/:nombre', (req, res) => {
  const nombre = req.params.nombre;        // Viene de la URL
  const idioma = req.query.idioma || 'es'; // Viene de ?idioma=en
  
  if (idioma === 'en') {
    res.send(`Hello, ${nombre}!`);
  } else {
    res.send(`¡Hola, ${nombre}!`);
  }
});
```

### Las Respuestas (Response o res)

Después de procesar una petición, necesitas enviar una **respuesta** (response). Hay muchas formas de responder:

- **res.send()**: Envía una respuesta básica (texto, HTML, etc.)
- **res.json()**: Envía datos en formato JSON (ideal para APIs)
- **res.render()**: Renderiza una vista (para aplicaciones con frontend)
- **res.status()**: Establece el código de estado HTTP (200 para éxito, 404 para no encontrado, etc.)

```javascript
// Ejemplo: diferentes tipos de respuesta
app.get('/api/usuario', (req, res) => {
  const usuario = { nombre: 'Ana', edad: 28 };
  res.json(usuario);  // Envía el objeto como JSON
});

app.get('/bienvenida', (req, res) => {
  res.send('<h1>Bienvenido a mi sitio</h1>');  // Envía HTML
});

app.get('/no-existe', (req, res) => {
  res.status(404).send('Página no encontrada');  // Establece código 404
});
```

## 4. 🛣️ Rutas: Los Caminos de tu Aplicación

Las rutas son como las "direcciones" de tu aplicación. Definen qué debe hacer tu servidor cuando alguien visita una URL específica.

```javascript
// Estructura básica de una ruta
app.método('/ruta', (req, res) => {
  // Código que se ejecuta cuando alguien visita esta ruta
});
```

### Métodos HTTP: Diferentes Verbos para Diferentes Acciones

HTTP define varios "verbos" o métodos para interactuar con recursos:

- **GET**: Para obtener información (como leer un artículo)
- **POST**: Para crear nueva información (como publicar un comentario)
- **PUT/PATCH**: Para actualizar información existente (como editar tu perfil)
- **DELETE**: Para eliminar información (como borrar una cuenta)

```javascript
// Ejemplos de rutas con diferentes métodos
app.get('/usuarios', (req, res) => {
  // Código para obtener todos los usuarios
});

app.post('/usuarios', (req, res) => {
  // Código para crear un nuevo usuario
});

app.put('/usuarios/:id', (req, res) => {
  // Código para actualizar un usuario específico
});

app.delete('/usuarios/:id', (req, res) => {
  // Código para eliminar un usuario específico
});
```

### Parámetros en Rutas: Rutas Dinámicas

Los parámetros en rutas te permiten capturar valores variables de la URL. Se definen con dos puntos `:` seguidos del nombre del parámetro:

```javascript
// Ruta con un parámetro
app.get('/usuarios/:id', (req, res) => {
  const userId = req.params.id;  // Captura el valor de "id" de la URL
  res.send(`Mostrando información del usuario ${userId}`);
});
```

Si alguien visita `/usuarios/42`, el valor de `req.params.id` será `"42"`.

### Query Strings: Información Extra en la URL

Las query strings (cadenas de consulta) son pares clave-valor que aparecen después de un signo de interrogación `?` en la URL:

```javascript
// Ruta con query string
app.get('/productos', (req, res) => {
  const categoria = req.query.categoria;
  const ordenarPor = req.query.ordenar || 'precio';
  
  res.send(`Mostrando productos de ${categoria}, ordenados por ${ordenarPor}`);
});
```

Si alguien visita `/productos?categoria=electronica&ordenar=nombre`, tendrás:
- `req.query.categoria` = `"electronica"`
- `req.query.ordenar` = `"nombre"`

### Organizando Rutas: Mantén Tu Código Ordenado

En aplicaciones más grandes como Challenge Plans, es mejor organizar tus rutas en archivos separados usando `Router`:

```javascript
// archivo: routes/usuarios.js
const express = require('express');
const router = express.Router();

// Ahora usamos "router" en vez de "app"
router.get('/', (req, res) => {
  // GET /usuarios
});

router.post('/', (req, res) => {
  // POST /usuarios
});

router.get('/:id', (req, res) => {
  // GET /usuarios/:id
});

module.exports = router;
```

Luego, en tu archivo principal:

```javascript
// archivo: app.js
const express = require('express');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Todas las rutas en usuariosRoutes tendrán el prefijo "/usuarios"
app.use('/usuarios', usuariosRoutes);
```

Este enfoque es lo que seguimos en Challenge Plans con archivos como `/routes/retos.routes.ts`, `/routes/apuntes.routes.ts`, etc.

## 5. 🔄 Middlewares: Los Ayudantes de Express

### ¿Qué son los Middlewares?

Los middlewares son probablemente el concepto más importante para entender Express. **Un middleware es simplemente una función que se ejecuta entre la recepción de una petición y el envío de una respuesta**.

Imagina una fábrica donde un producto pasa por varias estaciones antes de estar completo. Cada estación añade o modifica algo. Los middlewares son como esas estaciones para las peticiones HTTP.

```javascript
// Estructura básica de un middleware
function miMiddleware(req, res, next) {
  // 1. Hacer algo con la petición (req)
  // 2. Hacer algo con la respuesta (res)
  // 3. Llamar a next() para pasar al siguiente middleware
  next();
}

// Usar el middleware en toda la aplicación
app.use(miMiddleware);
```

El parámetro `next` es crucial: es una función que, cuando se llama, pasa la petición al siguiente middleware en la cadena.

### Middlewares Integrados y Populares

Express incluye algunos middlewares útiles, y hay muchos más disponibles como paquetes npm:

```javascript
// Middleware para procesar JSON en las peticiones
app.use(express.json());

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (imágenes, CSS, etc.)
app.use(express.static('public'));
```

En Challenge Plans, usamos varios middlewares populares:

```typescript
// De src/app.ts
app.use(helmet());         // Añade cabeceras de seguridad
app.use(compression());    // Comprime respuestas para mejorar rendimiento
app.use(morgan('dev'));    // Registra peticiones para debugging
app.use(cors());           // Permite peticiones desde otros dominios
app.use(express.json());   // Procesa cuerpos JSON
```

### Creando tu Propio Middleware

Crear tu propio middleware es simple. Aquí hay un ejemplo de un middleware de registro que anota cuándo ocurre cada petición:

```javascript
// Middleware de registro
function loggerMiddleware(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // ¡No olvides llamar a next()!
}

// Usar el middleware
app.use(loggerMiddleware);
```

Los middlewares se pueden aplicar:
- A toda la aplicación: `app.use(middleware)`
- A una ruta específica: `app.use('/api', middleware)`
- A un método HTTP específico: `app.get('/api', middleware, controlador)`

### Middleware de Autenticación: Un Ejemplo Práctico

Un uso común de middlewares es verificar si un usuario está autenticado antes de permitirle acceder a ciertas rutas. En Challenge Plans, usamos JWT (JSON Web Tokens) para autenticación:

```typescript
// Versión simplificada de nuestro middleware de autenticación
export const authenticate = (req, res, next) => {
  try {
    // 1. Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No hay token' });
    }
    
    // 2. Extraer el token (viene como "Bearer [token]")
    const token = authHeader.split(' ')[1];
    
    // 3. Verificar el token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Añadir la información del usuario a la petición
    req.usuario = decodedToken;
    
    // 5. Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

Y luego lo usamos para proteger rutas:

```typescript
// Rutas públicas (no necesitan autenticación)
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/retos', authenticate, retosRoutes);
router.use('/planes', authenticate, planesRoutes);
```

## 6. 🎮 Controladores: Donde Sucede la Acción

### ¿Qué es un Controlador?

Un controlador es una función (o grupo de funciones) que maneja la lógica asociada a una ruta específica. Los controladores reciben la petición, procesan los datos necesarios, y envían una respuesta.

Si las rutas son como las direcciones de tu aplicación, los controladores son como las personas que atienden esas direcciones.

```javascript
// Ejemplo básico de un controlador
function obtenerUsuarios(req, res) {
  // Lógica para obtener usuarios de la base de datos
  const usuarios = [{ nombre: 'Ana' }, { nombre: 'Carlos' }];
  res.json(usuarios);
}

// Usar el controlador con una ruta
app.get('/usuarios', obtenerUsuarios);
```

### Estructura de un Controlador

En proyectos más grandes como Challenge Plans, organizamos los controladores en clases para agrupar funcionalidades relacionadas:

```typescript
// Estructura típica de un controlador en nuestro proyecto
export class UsuariosController {
  // GET /usuarios
  public obtenerTodos = async (req, res) => {
    try {
      const usuarios = await obtenerUsuariosDeBD();
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  };
  
  // GET /usuarios/:id
  public obtenerPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await obtenerUsuarioPorIdDeBD(id);
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener el usuario' });
    }
  };
  
  // Más métodos para crear, actualizar y eliminar usuarios...
}

// Crear una instancia para usar en las rutas
export const usuariosController = new UsuariosController();
```

### Ejemplo Práctico: Controlador de Retos

Veamos un ejemplo simplificado basado en nuestro controlador de retos en Challenge Plans:

```typescript
// Versión simplificada de controllers/retos.controller.ts
export class RetosController {
  private retosService = new RetosService();
  
  // Obtener todos los retos
  public obtenerTodos = async (req, res) => {
    try {
      // 1. Extraer parámetros de filtrado de la query string
      const filtros = req.query;
      
      // 2. Usar el servicio para obtener datos
      const retos = await this.retosService.obtenerTodos(filtros);
      
      // 3. Responder con los datos
      return res.status(200).json(retos);
    } catch (error) {
      // 4. Manejar posibles errores
      console.error('Error al obtener retos:', error);
      return res.status(500).json({ 
        message: 'Error al obtener los retos' 
      });
    }
  };
  
  // Crear un nuevo reto
  public crear = async (req, res) => {
    try {
      // 1. Obtener datos del cuerpo de la petición
      const datosReto = req.body;
      
      // 2. Añadir el ID del creador (viene del token de autenticación)
      datosReto.creador_id = req.usuario.id;
      
      // 3. Usar el servicio para crear el reto
      const nuevoReto = await this.retosService.crear(datosReto);
      
      // 4. Responder con el nuevo reto creado
      return res.status(201).json(nuevoReto);
    } catch (error) {
      console.error('Error al crear reto:', error);
      return res.status(500).json({ 
        message: 'Error al crear el reto' 
      });
    }
  };
  
  // Más métodos para actualizar, eliminar, etc.
}
```

## 7. 🏭 Servicios: Separando la Lógica de Negocio

### ¿Por qué Necesitamos Servicios?

Los servicios son una capa adicional que separa la lógica de negocio (las reglas de cómo funciona tu aplicación) de los controladores (que manejan las peticiones HTTP).

Imagina que tienes una tienda online. Los controladores serían como los vendedores que atienden a los clientes, mientras que los servicios serían como el equipo de almacén que realmente busca los productos, verifica el inventario, etc.

Beneficios de usar servicios:
1. **Reutilización**: La misma lógica puede usarse en diferentes controladores
2. **Pruebas más fáciles**: Puedes probar la lógica sin simular peticiones HTTP
3. **Código más limpio**: Los controladores solo se preocupan de manejar HTTP, no de las reglas de negocio

### Ejemplo de un Servicio: RetosService

Veamos un ejemplo simplificado del servicio de retos en Challenge Plans:

```typescript
// Versión simplificada de services/retos.service.ts
export class RetosService {
  // Repositorio para acceder a la base de datos
  private retoRepository = getRepository(Reto);
  
  // Obtener todos los retos con filtros opcionales
  async obtenerTodos(filtros = {}) {
    try {
      // Construir la consulta según los filtros
      const consulta = this.buildQuery(filtros);
      
      // Ejecutar la consulta y devolver resultados
      const retos = await this.retoRepository.find(consulta);
      return retos;
    } catch (error) {
      throw new Error(`Error al obtener retos: ${error.message}`);
    }
  }
  
  // Obtener un reto específico por ID
  async obtenerPorId(id: string) {
    try {
      const reto = await this.retoRepository.findOne({
        where: { id },
        relations: ['tareas', 'categorias'] // Incluir relaciones
      });
      
      if (!reto) {
        throw new Error('Reto no encontrado');
      }
      
      return reto;
    } catch (error) {
      throw new Error(`Error al obtener el reto: ${error.message}`);
    }
  }
  
  // Crear un nuevo reto
  async crear(datosReto) {
    try {
      // Validar datos (podrías usar una función separada)
      this.validarDatosReto(datosReto);
      
      // Crear entidad y guardar
      const nuevoReto = this.retoRepository.create(datosReto);
      await this.retoRepository.save(nuevoReto);
      return nuevoReto;
    }
  }
  
  // Actualizar un reto existente
  async actualizar(id: string, datosReto) {
    try {
      // Verificar que el reto existe
      const retoExistente = await this.obtenerPorId(id);
      
      // Actualizar los campos con los nuevos datos
      Object.assign(retoExistente, datosReto);
      
      // Guardar los cambios
      const retoActualizado = await this.retoRepository.save(retoExistente);
      return retoActualizado;
    } catch (error) {
      throw new Error(`Error al actualizar el reto: ${error.message}`);
    }
  }
  
  // Eliminar un reto
  async eliminar(id: string) {
    try {
      // Verificar que el reto existe
      const retoExistente = await this.obtenerPorId(id);
      
      // Eliminar el reto
      await this.retoRepository.remove(retoExistente);
      return { success: true, message: 'Reto eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar el reto: ${error.message}`);
    }
  }
}
```

## 8. ❌ Manejo de Errores: Cuando las Cosas Salen Mal

### Errores en Express

En toda aplicación, las cosas pueden salir mal. Una base de datos puede estar caída, un usuario puede enviar datos incorrectos, o simplemente podemos tener un error en nuestro código. Express facilita el manejo centralizado de estos errores.

En Express, los errores se manejan principalmente de dos formas:

1. **Try/Catch en controladores**: Para capturar errores en funciones asíncronas
2. **Middleware de errores**: Para procesar todos los errores de manera centralizada

```javascript
// Ejemplo de try/catch en un controlador
app.get('/usuarios/:id', async (req, res, next) => {
  try {
    // Esto podría fallar (por ejemplo, si la base de datos está caída)
    const usuario = await obtenerUsuario(req.params.id);
    
    // Si el usuario no existe, respondemos con un 404
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }
    
    // Si todo va bien, enviamos el usuario
    res.json(usuario);
  } catch (error) {
    // Si ocurre un error, lo pasamos al middleware de errores
    next(error);
  }
});
```

### Middleware de Errores Personalizado

El middleware de errores es como un "atrapador" que captura cualquier error que ocurra durante el procesamiento de una petición. Se define con 4 parámetros (en lugar de los 3 habituales):

```javascript
// Middleware de errores básico
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(500).json({
    mensaje: 'Algo salió mal',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});
```

En nuestro proyecto, usamos un middleware de errores más sofisticado que maneja diferentes tipos de errores:

```typescript
// middlewares/error.middleware.ts
export const errorMiddleware = (error, req, res, next) => {
  // Registrar el error para debugging interno
  console.error(`[ERROR] ${req.method} ${req.path}:`, error);
  
  // Diferentes respuestas según el tipo de error
  if (error instanceof NotFoundError) {
    // Errores 404 - Recurso no encontrado
    return res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
  
  if (error instanceof ValidationError) {
    // Errores 400 - Datos inválidos
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errors: error.errors
    });
  }
  
  if (error instanceof UnauthorizedError) {
    // Errores 401 - No autenticado o no autorizado
    return res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
  
  // Error genérico para cualquier otro caso
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    // Solo mostrar detalles técnicos en desarrollo
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
```

### Clases de Error Personalizadas

Para facilitar el manejo consistente de errores, es útil definir clases de error personalizadas:

```typescript
// utils/custom-errors.ts

// Error base para todos nuestros errores personalizados
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

// Error para recursos no encontrados (404)
export class NotFoundError extends CustomError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Error para problemas de autenticación/autorización (401)
export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No estás autorizado para realizar esta acción') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// Error para datos de entrada inválidos (400)
export class ValidationError extends CustomError {
  constructor(errors: any[]) {
    super('Error de validación', 400, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
```

En los servicios, podemos usar estas clases para lanzar errores específicos:

```typescript
// Ejemplo de uso en un servicio
async obtenerPorId(id: string) {
  const reto = await this.retoRepository.findOne({ where: { id } });
  
  if (!reto) {
    // Lanzamos un error específico para "no encontrado"
    throw new NotFoundError('Reto');
  }
  
  return reto;
}
```

## 9. 🔌 Conectando con la Base de Datos

### TypeORM: Un Puente Entre Express y la Base de Datos

En nuestro proyecto Challenge Plans, usamos TypeORM para interactuar con la base de datos PostgreSQL. TypeORM es un ORM (Object-Relational Mapping) que nos permite trabajar con la base de datos usando clases y objetos en lugar de SQL puro.

Imagina TypeORM como un traductor: nosotros hablamos en "JavaScript/TypeScript", y él traduce nuestras instrucciones a SQL para que la base de datos las entienda.

Las ventajas de usar TypeORM son:

1. **Código más limpio**: Trabajamos con objetos en lugar de SQL
2. **Mayor seguridad**: Previene ataques de inyección SQL
3. **Independencia del motor de BD**: Podemos cambiar de PostgreSQL a MySQL sin cambiar el código
4. **Migraciones automáticas**: Genera y ejecuta scripts para actualizar la estructura de la BD

### Configuración de la Conexión

La conexión a la base de datos se configura en el archivo `data-source.ts`:

```typescript
// src/data-source.ts
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Usuario } from "./entities/usuario.entity";
import { Reto } from "./entities/reto.entity";
import { Tarea } from "./entities/tarea.entity";
// Importar otras entidades...

// Cargar variables de entorno
config();

export const AppDataSource = new DataSource({
  // Tipo de base de datos
  type: "postgres",
  
  // Datos de conexión (desde variables de entorno)
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "challenge_plans",
  
  // ¿Sincronizar automáticamente las entidades con la BD? (Solo en desarrollo)
  synchronize: process.env.NODE_ENV === "development",
  
  // ¿Mostrar consultas SQL en la consola?
  logging: process.env.NODE_ENV === "development",
  
  // Lista de entidades (tablas) de la base de datos
  entities: [
    Usuario,
    Reto,
    Tarea,
    // Otras entidades...
  ],
  
  // Configuración de migraciones
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations_history",
  
  // Configurar SSL para bases de datos en la nube (como Heroku)
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
```

En nuestro archivo `index.ts`, inicializamos la conexión antes de iniciar el servidor:

```typescript
// src/index.ts
import "reflect-metadata"; // Necesario para TypeORM
import { AppDataSource } from "./data-source";
import app from "./app";

const PORT = process.env.PORT || 3000;

// Inicializar la conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexión a BD establecida");
    
    // Iniciar el servidor Express una vez conectada la BD
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a la BD:", error);
    process.exit(1); // Salir si no podemos conectar a la BD
  });
```

## 10. 🛡️ Autenticación y Seguridad

### Autenticación con JWT

Para proteger nuestras rutas en Challenge Plans, utilizamos JSON Web Tokens (JWT). Los JWT son como "tarjetas de identificación digitales" que el servidor emite cuando un usuario se autentica correctamente.

El flujo de autenticación funciona así:

1. El usuario envía sus credenciales (email y contraseña)
2. El servidor verifica las credenciales en la base de datos
3. Si son correctas, el servidor crea un token JWT y lo envía al cliente
4. El cliente guarda este token y lo envía en cada solicitud posterior
5. El servidor verifica el token para identificar al usuario

Veamos cómo implementamos esto:

```typescript
// services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(Usuario);
  
  // Método para autenticar usuario
  async login(email: string, password: string) {
    // Buscar el usuario por email
    const usuario = await this.userRepository.findOne({ where: { email } });
    
    // Si no existe el usuario o la contraseña es incorrecta
    if (!usuario || !(await bcrypt.compare(password, usuario.hash_contraseña))) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }
    
    // Generar token JWT
    const token = this.generateToken(usuario);
    
    // Devolver token y datos básicos del usuario
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      }
    };
  }
  
  // Método para registrar nuevo usuario
  async register(userData: any) {
    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new ValidationError([{ field: 'email', message: 'Este email ya está registrado' }]);
    }
    
    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Crear el nuevo usuario
    const newUser = this.userRepository.create({
      ...userData,
      hash_contraseña: hashedPassword
    });
    
    // Guardar en la base de datos
    const savedUser = await this.userRepository.save(newUser);
    
    // Generar token JWT
    const token = this.generateToken(savedUser);
    
    // Devolver token y datos básicos del usuario
    return {
      token,
      usuario: {
        id: savedUser.id,
        nombre: savedUser.nombre,
        email: savedUser.email,
      }
    };
  }
  
  // Método privado para generar tokens JWT
  private generateToken(usuario: Usuario) {
    return jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}
```

### Protegiendo Rutas con Middleware

Una vez que tenemos nuestro sistema de autenticación, necesitamos proteger las rutas que requieren autenticación. Para eso usamos el middleware de autenticación que vimos anteriormente:

```typescript
// routes/index.ts
const router = Router();

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes);
router.use('/categorias', categoriasRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/retos', authenticate, retosRoutes);
router.use('/planes', authenticate, planesRoutes);
router.use('/apuntes', authenticate, apuntesRoutes);
router.use('/tareas', authenticate, tareasRoutes);
router.use('/perfil', authenticate, perfilRoutes);
```

### Buenas Prácticas de Seguridad

Además de la autenticación JWT, implementamos varias prácticas de seguridad:

1. **Almacenamiento seguro de contraseñas**: Usamos bcrypt para cifrar las contraseñas antes de guardarlas.

2. **Headers de seguridad**: Utilizamos el middleware Helmet para establecer cabeceras HTTP de seguridad:

   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

3. **Limitación de intentos de login**: Para prevenir ataques de fuerza bruta, limitamos los intentos de login:

   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 5, // 5 intentos por IP
     message: 'Demasiados intentos de login, inténtalo de nuevo en 15 minutos'
   });
   
   router.post('/login', loginLimiter, authController.login);
   ```

4. **Validación de entradas**: Validamos todas las entradas del usuario para prevenir inyecciones y otros tipos de ataques.

5. **CORS configurado**: Configuramos CORS para permitir solo a orígenes conocidos acceder a nuestra API:

   ```typescript
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

## 11. 📦 Validación de Datos

### Por Qué Validar los Datos

La validación de datos es crucial para cualquier aplicación. Imagina que tienes un formulario donde los usuarios deben ingresar su email. Si no validas que realmente sea un email válido, podrías tener problemas más adelante (por ejemplo, al intentar enviarles un correo).

Los datos de entrada pueden ser inválidos por muchas razones:
- El usuario cometió un error al escribir
- Alguien está intentando hacer algo malicioso
- Hay un bug en el frontend

Por eso, siempre debemos validar los datos antes de procesarlos.

### Usando express-validator

En Challenge Plans, usamos `express-validator` para validar las entradas de usuario:

```typescript
// controllers/retos.controller.ts con validación
import { body, param, validationResult } from 'express-validator';

// Definir las reglas de validación
export const crearRetoValidation = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres'),
    
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no debe exceder 500 caracteres'),
    
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
    
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
    
  body('dificultad')
    .isIn(['principiante', 'intermedio', 'avanzado']).withMessage('La dificultad debe ser principiante, intermedio o avanzado'),
    
  // Middleware para verificar los errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Usar las reglas de validación en la ruta
router.post('/', crearRetoValidation, retosController.crear);
```

### Validaciones Personalizadas

A veces necesitamos validaciones más específicas que las que ofrece `express-validator`. Por ejemplo, verificar si un reto puede ser modificado:

```typescript
// Validación personalizada para verificar si un usuario puede editar un reto
async function puedeEditarReto(req, res, next) {
  try {
    const retoId = req.params.id;
    const usuarioId = req.usuario.id;
    
    // Obtener el reto de la base de datos
    const reto = await retosService.obtenerPorId(retoId);
    
    // Verificar si el reto existe
    if (!reto) {
      return res.status(404).json({ message: 'Reto no encontrado' });
    }
    
    // Verificar si el usuario es el creador del reto o un administrador
    if (reto.creador_id !== usuarioId && req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para editar este reto' 
      });
    }
    
    // Si todo está bien, continuar
    req.reto = reto; // Pasamos el reto para no tener que buscarlo de nuevo
    next();
  } catch (error) {
    next(error);
  }
}

// Usar la validación personalizada en la ruta
router.put('/:id', authenticate, puedeEditarReto, retosController.actualizar);
```

## 12. ✅ Pruebas y Depuración

### Pruebas en Express

Las pruebas son esenciales para cualquier aplicación. En Express, podemos probar diferentes niveles:

1. **Pruebas unitarias**: Prueban funciones individuales
2. **Pruebas de integración**: Prueban cómo interactúan diferentes componentes
3. **Pruebas de API**: Prueban los endpoints HTTP directamente

En Challenge Plans, usamos Jest y Supertest para nuestras pruebas:

```typescript
// tests/retos.test.ts - Prueba de API
import request from 'supertest';
import { AppDataSource } from '../src/data-source';
import app from '../src/app';
import { createToken } from './helpers';

describe('API de Retos', () => {
  let token: string;
  
  // Antes de todas las pruebas
  beforeAll(async () => {
    // Inicializar la conexión a la BD de pruebas
    await AppDataSource.initialize();
    
    // Crear un token para las pruebas
    token = createToken({ id: '123', email: 'test@example.com' });
  });
  
  // Después de todas las pruebas
  afterAll(async () => {
    // Cerrar la conexión a la BD
    await AppDataSource.destroy();
  });
  
  // Prueba: obtener todos los retos
  it('debería obtener la lista de retos', async () => {
    const response = await request(app)
      .get('/api/retos')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  // Prueba: crear un nuevo reto
  it('debería crear un nuevo reto', async () => {
    const retoData = {
      titulo: 'Reto de prueba',
      descripcion: 'Descripción del reto de prueba',
      fecha_inicio: '2023-01-01',
      fecha_fin: '2023-02-01',
      dificultad: 'principiante'
    };
    
    const response = await request(app)
      .post('/api/retos')
      .set('Authorization', `Bearer ${token}`)
      .send(retoData);
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.titulo).toBe(retoData.titulo);
  });
  
  // Más pruebas...
});
```

### Depuración Efectiva

La depuración es un arte esencial para cualquier desarrollador. En Express, tenemos varias herramientas:

1. **Console.log**: El clásico que nunca falla
   ```javascript
   console.log('Datos recibidos:', req.body);
   ```

2. **Morgan**: Registra automáticamente todas las solicitudes HTTP
   ```javascript
   import morgan from 'morgan';
   app.use(morgan('dev'));
   ```

3. **Debug**: Módulo para mensajes de depuración más controlados
   ```javascript
   import debug from 'debug';
   const log = debug('app:retos');
   
   // Usar
   log('Procesando reto:', reto.id);
   ```

4. **Extensión de VSCode para Node.js**: Para depuración paso a paso
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug API",
         "program": "${workspaceFolder}/src/index.ts",
         "preLaunchTask": "tsc: build - tsconfig.json",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"]
       }
     ]
   }
   ```

## 13. 🚀 Despliegue y Producción

### Preparando para Producción

Antes de desplegar nuestra aplicación Express, debemos asegurarnos de que está lista para producción:

1. **Variables de entorno**: Asegúrate de que toda la configuración sensible esté en variables de entorno
   ```typescript
   // Usa variables de entorno con valores por defecto seguros
   const PORT = process.env.PORT || 3000;
   const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
   ```

2. **Logging**: Configura un sistema de logging adecuado para producción
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   
   // En desarrollo, también log a la consola
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   ```

3. **Compilación TypeScript**: Si usas TypeScript, compila a JavaScript
   ```bash
   # En package.json
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

4. **Configuración de seguridad**: Asegúrate de que todas las configuraciones de seguridad estén activas
   ```typescript
   // Asegurar cabeceras HTTP
   app.use(helmet());
   
   // Limitar tamaño de las peticiones
   app.use(express.json({ limit: '10kb' }));
   
   // Protección contra ataques de fuerza bruta
   app.use('/api/auth/login', rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5
   }));
   ```

### Opciones de Despliegue

Existen muchas opciones para desplegar una aplicación Express:

1. **Heroku**
   - Simple para principiantes
   - Buena integración con GitHub
   - Escala automáticamente
   ```bash
   # Configuración para Heroku
   echo "web: node dist/index.js" > Procfile
   heroku create
   git push heroku main
   ```

2. **DigitalOcean App Platform**
   - Similar a Heroku pero con opciones más avanzadas
   - Buen equilibrio entre simplicidad y control
   - Buena documentación

3. **AWS Elastic Beanstalk**
   - Para aplicaciones más complejas
   - Parte del ecosistema AWS
   - Requiere más configuración

4. **Docker + cualquier proveedor**
   - Máxima portabilidad
   - Ejemplo de Dockerfile:
   ```dockerfile
   FROM node:16-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY dist/ ./dist/
   
   EXPOSE 3000
   
   CMD ["node", "dist/index.js"]
   ```

5. **VPS (Servidor Virtual Privado)**
   - Control total
   - Requiere configuración manual
   - Proceso típico:
     1. Configurar servidor (nginx, seguridad, etc.)
     2. Subir código
     3. Instalar dependencias
     4. Configurar PM2 para mantener la app corriendo
     5. Configurar nginx como proxy inverso

## 14. 📝 Glosario: Términos que Debes Conocer

- **API (Application Programming Interface)**: Conjunto de reglas que permite a diferentes software comunicarse entre sí.
  
- **REST (Representational State Transfer)**: Estilo de arquitectura de software para sistemas distribuidos como la World Wide Web.

- **Endpoint**: URL específica donde una API puede acceder a los recursos que necesita.

- **Middleware**: Función que tiene acceso al objeto de solicitud, al objeto de respuesta y a la siguiente función en el ciclo solicitud-respuesta.

- **Router**: Parte de Express que permite organizar rutas en archivos o módulos separados.
  
- **Controller**: Componente que maneja la lógica de las rutas, procesando solicitudes y enviando respuestas.

- **Service**: Capa que contiene la lógica de negocio, independiente de la capa de presentación (controladores).

- **ORM (Object-Relational Mapping)**: Técnica de programación para convertir datos entre sistemas de tipos incompatibles en lenguajes de programación orientados a objetos.

- **JWT (JSON Web Token)**: Estándar abierto que define una forma compacta y autónoma de transmitir información de forma segura entre las partes como un objeto JSON.

- **Middleware de error**: Función especial con cuatro argumentos (error, req, res, next) que maneja errores en Express.

- **Autenticación**: Proceso de verificar la identidad de un usuario.

- **Autorización**: Proceso de determinar si un usuario tiene permiso para acceder a un recurso específico.

## 15. 📚 Recursos Adicionales

Para seguir aprendiendo sobre Express y tecnologías relacionadas:

- [Documentación oficial de Express](https://expressjs.com/): La mejor referencia, con guías detalladas y ejemplos.

- [MDN Web Docs - Express/Node.js](https://developer.mozilla.org/es/docs/Learn/Server-side/Express_Nodejs): Excelente recurso para principiantes con explicaciones claras.

- [TypeORM Documentation](https://typeorm.io/): Documentación completa de TypeORM para bases de datos.

- [JWT.io](https://jwt.io/): Todo sobre JSON Web Tokens, incluyendo una herramienta para decodificar tokens.
