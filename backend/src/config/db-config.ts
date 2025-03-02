import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Obtener la cadena de conexión desde las variables de entorno
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: Variable de entorno DATABASE_URL no definida');
  process.exit(1);
}

// Crear el pool de conexiones
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Evento para loguear cuando se crea una nueva conexión
pool.on('connect', () => {
  console.log('Nueva conexión al pool de PostgreSQL');
});

// Evento para loguear errores
pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err);
});

// Comprobar la conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error verificando conexión a PostgreSQL:', err);
  } else {
    console.log(`Conexión a PostgreSQL establecida - Hora del servidor: ${res.rows[0].now}`);
  }
});

export default pool;
