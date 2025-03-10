import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo correspondiente
const environment = process.env.NODE_ENV || 'development';
dotenv.config({
  path: `.env.${environment}`
});

export default {
  port: process.env.PORT || 5000,
  dbHost: process.env.DB_HOST,
  dbPort: parseInt(process.env.DB_PORT || '5432'),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  jwtSecret: process.env.JWT_SECRET || 'clave_secreta_por_defecto',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: environment,
  isProd: environment === 'production',
};
