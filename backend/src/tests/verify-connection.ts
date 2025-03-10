import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';

dotenv.config();

async function testConnection() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
}

testConnection();
