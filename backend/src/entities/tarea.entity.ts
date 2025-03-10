import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TareaAsignaciones } from './tarea-asignaciones.entity';
import { Reto } from './reto.entity';
import { Usuario } from './usuario.entity';

/**
 * Entidad Tarea
 * 
 * Representa una actividad específica dentro de un reto que debe ser
 * completada por los participantes. Las tareas tienen diferentes tipos
 * (lectura, ejercicio, proyecto) y un valor en puntos.
 * 
 * Una tarea puede tener un usuario principal asignado, pero también puede
 * asignarse a múltiples usuarios mediante la tabla de asignaciones múltiples.
 */
@Entity('tareas')
export class Tarea {
  /** Identificador único de la tarea */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del reto al que pertenece esta tarea */
  @Column('uuid')
  reto_id: string;

  /** 
   * ID del usuario principal asignado a la tarea (opcional) 
   * Se mantiene por compatibilidad, complementado con la tabla tarea_asignaciones
   */
  @Column('uuid', { nullable: true })
  asignado_a: string;

  /** Título descriptivo de la tarea */
  @Column()
  titulo: string;

  /** Descripción detallada de la tarea y sus objetivos */
  @Column({ nullable: true })
  descripcion: string;

  /** 
   * Valor en puntos de la tarea
   * Debe ser un valor positivo y contribuye a los puntos_totales del reto
   */
  @Column()
  puntos: number;

  /** Fecha límite para completar la tarea (opcional) */
  @Column({ type: 'date', nullable: true })
  fecha_limite: string;

  /** 
   * Tipo de tarea: lectura, ejercicio o proyecto
   * Define la naturaleza y complejidad de la actividad
   */
  @Column({ nullable: true })
  tipo: string;

  /** Indica si la tarea ha sido marcada como completada */
  @Column({ default: false })
  completado: boolean;

  /** Fecha de creación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  /** 
   * Relación con el reto al que pertenece esta tarea
   */
  @ManyToOne(() => Reto, reto => reto.tareas)
  @JoinColumn({ name: 'reto_id' })
  reto: Reto;

  /**
   * Usuario principal asignado (mantenido por compatibilidad)
   */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a' })
  asignado: Usuario;

  /** 
   * Relación con la tabla de asignaciones múltiples
   * Con cascade para eliminar automáticamente las asignaciones cuando se elimina la tarea
   */
  @OneToMany(() => TareaAsignaciones, asignacion => asignacion.tarea, { cascade: ['remove'] })
  asignaciones: TareaAsignaciones[];
}
