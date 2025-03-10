import { Entity, PrimaryGeneratedColumn, Column, Check, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { NotificacionLectura } from './notificacion-lectura.entity';
import { Usuario } from './usuario.entity';

/**
 * Entidad Notificación
 * 
 * Representa una alerta o mensaje enviado a un usuario o grupo de usuarios
 * para informarles sobre eventos relevantes en la plataforma, como tareas
 * asignadas, retos completados o recompensas obtenidas.
 * 
 * Soporta notificaciones individuales y grupales, con un sistema de 
 * seguimiento de lecturas para las notificaciones grupales.
 */
@Entity('notificaciones')
export class Notificacion {
  /** Identificador único de la notificación */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario destinatario de la notificación */
  @Column('uuid')
  usuario_id: string;

  /**
   * Usuario destinatario de la notificación
   */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** Título breve de la notificación */
  @Column()
  titulo: string;

  /** Contenido detallado de la notificación */
  @Column()
  mensaje: string;

  /** 
   * Tipo de notificación que define su naturaleza
   * Permite tratamientos específicos según el tipo
   */
  @Column()
  @Check("tipo IN ('tarea_asignada', 'reto_completado', 'recompensa_obtenida', 'sistema')")
  tipo: string;

  /** 
   * Tipo de entidad relacionada con la notificación (opcional)
   * Facilita la navegación directa a la entidad desde la notificación
   */
  @Column({ nullable: true })
  @Check("entidad IN ('reto', 'tarea', 'apunte', 'plan_estudio', 'recompensa', 'logro', 'sistema')")
  entidad: string;

  /** ID de la entidad relacionada con la notificación */
  @Column('uuid', { nullable: true })
  entidad_id: string;

  /** Indica si la notificación ha sido leída por el usuario */
  @Column({ default: false })
  leida: boolean;

  /** Fecha en que se creó la notificación */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha en que el usuario leyó la notificación (si aplica) */
  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_lectura: Date;

  /** Indica si es una notificación grupal o individual */
  @Column({ default: false })
  es_grupal: boolean;

  /** ID del grupo destinatario (si es una notificación grupal) */
  @Column('uuid', { nullable: true })
  grupo_id: string;

  /** 
   * Registros de lectura para notificaciones grupales
   * Con cascade remove para eliminar las lecturas al eliminar la notificación
   */
  @OneToMany(() => NotificacionLectura, lectura => lectura.notificacion, { cascade: ['remove'] })
  lecturas: NotificacionLectura[];
}
