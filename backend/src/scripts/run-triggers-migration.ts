import { AppDataSource } from '../data-source';
import { TriggersAndFunctions1741440000000 } from '../migrations/1741440000000-TriggersAndFunctions';

/**
 * Script para ejecutar la migración de triggers y funciones directamente
 * Esto permite aplicar solo esta migración específica cuando sea necesario
 */
async function runTriggersMigration() {
  console.log('🔄 Inicializando conexión a la base de datos...');
  
  try {
    // Inicializar datasource
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Instanciar la migración
    const triggersMigration = new TriggersAndFunctions1741440000000();
    
    console.log('⚙️ Ejecutando migración de triggers y funciones...');
    
    // Ejecutar la migración
    await triggersMigration.up(AppDataSource.createQueryRunner());
    
    console.log('✅ Migración de triggers y funciones aplicada correctamente.');
    
  } catch (error) {
    console.error('❌ Error al ejecutar la migración de triggers y funciones:', error);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔄 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
runTriggersMigration();
