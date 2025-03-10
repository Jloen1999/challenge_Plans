import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Tarea } from './tarea.entity';

/**
 * Entidad Tareas Completadas
 * 
 * Registra las tareas que han sido completadas por cada usuario,
 * permitiendo un seguimiento detallado del progreso individual
 * en las tareas de los retos.
 * 
 * Soporta también progreso parcial y permite a los usuarios añadir
 * comentarios sobre la realización de la tarea.
 */
@Entity('tareas_completadas')
export class TareasCompletadas {
  /** ID del usuario que completó la tarea (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  usuario_id: string;

  /** ID de la tarea completada (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  tarea_id: string;

  /** Fecha en que se completó la tarea */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_completado: Date;

  /** 
   * Porcentaje de progreso en la tarea (0-100)
   * Permite registrar completado parcial de tareas
   */
  @Column({ default: 100 })
  progreso: number;

  /** Comentarios adicionales sobre la realización de la tarea */
  @Column({ nullable: true })
  comentario: string;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** Relación con la entidad Tarea */
  @ManyToOne(() => Tarea)
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;
}
