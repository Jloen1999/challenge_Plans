import { AppDataSource } from '../data-source';
import { NotificationsAndAuditSystem1741500000000 } from '../migrations/1741500000000-NotificationsAndAuditSystem';

/**
 * Script para ejecutar la migración del sistema de notificaciones y auditoría
 * Permite aplicar solo esta migración específica cuando sea necesario
 */
async function runNotificationsMigration() {
  console.log('🔄 Inicializando conexión a la base de datos...');
  
  try {
    // Inicializar datasource
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Instanciar la migración
    const notificationsMigration = new NotificationsAndAuditSystem1741500000000();
    
    console.log('🔔 Ejecutando migración del sistema de notificaciones y auditoría...');
    
    // Ejecutar la migración
    await notificationsMigration.up(AppDataSource.createQueryRunner());
    
    console.log('✅ Migración del sistema de notificaciones y auditoría aplicada correctamente.');
    
  } catch (error) {
    console.error('❌ Error al ejecutar la migración de notificaciones y auditoría:', error);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔄 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
runNotificationsMigration();
