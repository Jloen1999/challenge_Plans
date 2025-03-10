import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { RetoPlanEstudio } from './reto-planes-estudio.entity';

/**
 * Entidad Plan de Estudio
 * 
 * Representa un plan de aprendizaje estructurado que puede contener
 * múltiples retos agrupados de forma lógica. Permite a los usuarios
 * organizar su camino de aprendizaje de manera coherente y progresiva.
 * 
 * Los planes pueden ser públicos o privados y tienen una duración determinada.
 */
@Entity('planes_estudio')
export class PlanEstudio {
  /** Identificador único del plan de estudio */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario que creó el plan de estudio */
  @Column('uuid')
  usuario_id: string;

  /** Título descriptivo del plan */
  @Column()
  titulo: string;

  /** Descripción detallada del plan y sus objetivos */
  @Column({ nullable: true })
  descripcion: string;

  /** Fecha de inicio del plan */
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_inicio: string;

  /** 
   * Duración prevista en días para completar el plan
   * Debe ser un valor positivo
   */
  @Column({ nullable: true })
  duracion_dias: number;

  /** Indica si el plan es visible para todos los usuarios */
  @Column({ default: false })
  es_publico: boolean;

  /** Fecha de creación del registro */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del registro */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  /**
   * Usuario creador del plan de estudio
   */
  @ManyToOne(() => Usuario, usuario => usuario.planes)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /**
   * Relaciones con retos incluidos en este plan
   * Con cascade para mantener consistencia en las relaciones
   */
  @OneToMany(() => RetoPlanEstudio, rpe => rpe.plan_estudio, { cascade: ['insert', 'update', 'remove'] })
  retosRelaciones: RetoPlanEstudio[];
}
