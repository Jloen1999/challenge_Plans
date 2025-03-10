import RetosJob from '../jobs/retos-job';
import NotificacionesJob from '../jobs/notificaciones-job';

export function configurarJobs(): void {
  // Programar todos los jobs automáticos
  RetosJob.programarFinalizacionRetos();
  NotificacionesJob.programarLimpiezaNotificaciones();
  
  console.log('✅ Todos los jobs han sido configurados correctamente');
}
