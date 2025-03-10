import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Tarea } from './tarea.entity';

/**
 * Entidad de Asignaciones Múltiples de Tareas
 * 
 * Permite asignar una misma tarea a múltiples usuarios con diferentes roles,
 * superando la limitación del campo asignado_a en la tabla de tareas que
 * solo permite un usuario principal.
 * 
 * Facilita el trabajo colaborativo donde diferentes usuarios pueden tener
 * distintas responsabilidades en una misma tarea.
 */
@Entity('tarea_asignaciones')
export class TareaAsignaciones {
  /** ID de la tarea en la asignación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  tarea_id: string;

  /** ID del usuario asignado (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  usuario_id: string;

  /** Fecha en que se creó la asignación */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;

  /** 
   * Rol del usuario en esta tarea específica
   * Ejemplos: responsable, colaborador, revisor
   */
  @Column({ default: 'responsable' })
  rol_asignacion: string;

  /** Relación con la entidad Tarea */
  @ManyToOne(() => Tarea, tarea => tarea.asignaciones)
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
