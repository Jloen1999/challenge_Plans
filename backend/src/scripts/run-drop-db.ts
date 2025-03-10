import { AppDataSource } from '../data-source';
import { DropDatabase1741600000000 } from '../1741600000000-DropDatabase';

/**
 * Script para ejecutar la migración de eliminación de base de datos directamente
 * Esto permite una forma sencilla de resetear la base de datos durante el desarrollo
 */
async function runDropDatabaseMigration() {
  console.log('🔄 Inicializando conexión a la base de datos...');
  
  try {
    // Inicializar datasource sin sincronización para evitar problemas
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Instanciar la migración
    const dropMigration = new DropDatabase1741600000000();
    
    console.log('⚠️ ADVERTENCIA: Se van a eliminar todos los datos del esquema. Esta acción es irreversible.');
    console.log('Ejecutando migración de eliminación de base de datos...');
    
    // Ejecutar la migración
    await dropMigration.up(AppDataSource.createQueryRunner());
    
    console.log('✅ Base de datos eliminada correctamente. El esquema ha sido reiniciado.');
    console.log('En caso de que se haya hecho modificaciones en el esquema, se recomienda inicializarlo nuevamente con el siguiente comando:');
    console.log('npm run migration:create:initial');
    console.log('Ejecutando migración de inicialización...');   
    console.log('Para recrear todas las tablas, ejecute: npm run migration:run');
    
  } catch (error) {
    console.error('❌ Error al ejecutar la migración de eliminación:', error);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔄 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
runDropDatabaseMigration();
