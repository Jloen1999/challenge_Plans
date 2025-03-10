import { AppDataSource } from '../data-source';
import { InitialMigration1741400000000 } from '../migrations/1741400000000-InitialMigration';

/**
 * Script para ejecutar la migración inicial que crea la estructura básica de tablas
 * Esta migración debe ejecutarse después de limpiar la base de datos o al iniciar por primera vez
 */
async function runInitialMigration() {
  console.log('🔄 Inicializando conexión a la base de datos...');
  
  try {
    // Inicializar datasource
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Instanciar la migración
    const initialMigration = new InitialMigration1741400000000();
    
    console.log('🏗️ Ejecutando migración inicial para crear tablas base...');
    
    // Ejecutar la migración
    await initialMigration.up(AppDataSource.createQueryRunner());
    
    console.log('✅ Migración inicial aplicada correctamente. Se han creado todas las tablas base del sistema.');
    
  } catch (error) {
    console.error('❌ Error al ejecutar la migración inicial:', error);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔄 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
runInitialMigration();
