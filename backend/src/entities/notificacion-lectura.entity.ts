import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Notificacion } from './notificacion.entity';

/**
 * Entidad Lectura de Notificación
 * 
 * Registra qué usuarios han leído una notificación grupal,
 * permitiendo un seguimiento individualizado de las lecturas
 * cuando una misma notificación es enviada a múltiples usuarios.
 * 
 * Esta tabla es especialmente útil para el sistema de notificaciones
 * grupales y para generar métricas de engagement.
 */
@Entity('notificaciones_lecturas')
export class NotificacionLectura {
  /** ID de la notificación leída (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  notificacion_id: string;

  /** ID del usuario que leyó la notificación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  usuario_id: string;

  /** Fecha exacta en que el usuario leyó la notificación */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_lectura: Date;

  /** Relación con la entidad Notificación */
  @ManyToOne(() => Notificacion, notificacion => notificacion.lecturas)
  @JoinColumn({ name: 'notificacion_id' })
  notificacion: Notificacion;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
