import { AppDataSource } from '../data-source';
import * as cron from 'node-cron';

export default class NotificacionesJob {
  /**
   * Programa la ejecución automática de limpieza de notificaciones antiguas
   */
  static programarLimpiezaNotificaciones(): void {
    // Se ejecuta todos los días a las 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        console.log('🧹 Ejecutando limpieza de notificaciones antiguas...');
        await AppDataSource.query('SELECT programar_limpieza_notificaciones()');
        console.log('✅ Limpieza de notificaciones completada');
      } catch (error) {
        console.error('❌ Error al limpiar notificaciones antiguas:', error);
      }
    });
    console.log('📅 Job de limpieza de notificaciones programado para las 3:00 AM diariamente');
  }
}
