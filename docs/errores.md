1. Error 1
```text
   Type 'Response<any, Record<string, any>> | undefined' is not assignable to type 'void | Promise<void>'.
          Type 'Response<any, Record<string, any>>' is not assignable to type 'void | Promise<void>'.

40 router.get('/me', authMiddleware, authController.getCurrentUser);
```
- Solución: El error que estás experimentando es común en TypeScript con Express y está relacionado con los tipos de retorno en los controladores y middlewares. Express espera que estas funciones no devuelvan un valor (o devuelvan Promise&lt;void&gt;), pero tus funciones actuales parecen estar devolviendo objetos Response.Para ello hew tenido que agregar `:Promise<void>` o `:void` a las firmas de las funciones y asegurándonos de que no se retornen valores después de llamar a `res.json()` o `res.send()`

2. Error 2
Error: self-signed certificate in certificate chain at TLSSocket.onConnectSecure (node:_tls_wrap:1659:34) at TLSSocket.emit (node:events:517:28) at TLSSocket.emit (node:domain:489:12) at TLSSocket._finishInit (node:_tls_wrap:1070:8) at TLSWrap.ssl.onhandshakedone (node:_tls_wrap:856:12) {
code: 'SELF_SIGNED_CERT_IN_CHAIN' } [nodemon] clean exit - waiting for changes before restart

- Solucion: El error "self-signed certificate in certificate chain" indica que hay un problema al verificar el certificado SSL de la conexión a la base de datos. Esto es común cuando te conectas a una base de datos Supabase desde un entorno de desarrollo. 
  - Para ello modificar la configuración de la conexión a la base de datos
    ```javascript
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones a Supabase
    }
    ```
-  o bien iniciar la aplicación con una variable de entorno que desactiva la verificación de certificados.


1. Error 3
src/entities/Usuario.ts:5:4 - error TS1240: Unable to resolve signature of property decorator when called as an expression. Argument of type 'undefined' is not assignable to parameter of type 'Object'.

5 @PrimaryGeneratedColumn("uuid") ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ src/entities/Usuario.ts:6:3 - error TS2564: Property 'id' has no initializer and is not definitely assigned in the constructor.
- Solución: El problema que estás experimentando es común cuando se trabaja con TypeORM y TypeScript, y hay dos soluciones principales:
  - Sol1: Modificar la entidad Usuario
  El operador `!` después de cada propiedad le indica a TypeScript que aunque no haya inicializador, estas propiedades serán asignadas (por TypeORM en este caso).
  - Sol2: Ajustar la configuración de Typescript.
    Los cambios clave son:

      - `"experimentalDecorators": true`: Habilita el uso de decoradores
      - `"emitDecoratorMetadata": true`: Necesario para TypeORM
      - `"strictPropertyInitialization": false`: Desactiva la comprobación estricta de inicialización de propiedades