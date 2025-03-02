# Guía para obtener credenciales de Supabase

## Acceder a las credenciales de conexión

1. **Inicia sesión en Supabase**
   - Ve a [https://app.supabase.io/](https://app.supabase.io/)
   - Inicia sesión con tu cuenta

2. **Selecciona tu proyecto**
   - En el dashboard, haz clic en el proyecto que estás utilizando

3. **Accede a la configuración de la base de datos**
   - En el menú lateral izquierdo, busca la sección "Configuración" (Settings)
   - Haz clic en "Database" (Base de datos)

4. **Encuentra las credenciales de conexión**
   - Desplázate hacia abajo hasta la sección "Connection Info" o "Connection Pooling"
   - Aquí encontrarás toda la información necesaria:
     - **Host**: Aparece como "Host" o en la cadena de conexión (termina con `.supabase.co`)
     - **Port**: Generalmente 5432 (puerto estándar de PostgreSQL) o 6543 para conexiones directas
     - **Database name**: Normalmente "postgres"
     - **User**: "postgres" por defecto
     - **Password**: Haz clic en "Show Password" para ver tu contraseña

5. **Habilitar conexiones directas** (si es necesario)
   - En la misma sección, asegúrate de que las conexiones directas estén habilitadas
   - Puede que necesites añadir tu dirección IP a la lista de permitidas

## Actualizar el archivo .env

Una vez que tengas toda la información, actualiza tu archivo .env con los valores correctos:

