import { AppDataSource } from '../data-source';
import * as cron from 'node-cron';

export default class RetosJob {
  /**
   * Programa la ejecución automática de finalización de retos vencidos
   * Utiliza la función finalizar_retos_vencidos definida en los triggers
   */
  static programarFinalizacionRetos(): void {
    // Se ejecuta todos los días a la 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      try {
        console.log('⏱️ Ejecutando finalización de retos vencidos...');
        await AppDataSource.query('SELECT finalizar_retos_vencidos()');
        console.log('✅ Finalización de retos vencidos completada');
      } catch (error) {
        console.error('❌ Error al finalizar retos vencidos:', error);
      }
    });
    console.log('📅 Job de finalización de retos programado para la 1:00 AM diariamente');
  }
}
