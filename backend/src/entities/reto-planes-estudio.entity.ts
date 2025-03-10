import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reto } from './reto.entity';
import { PlanEstudio } from './plan-estudio.entity';

/**
 * Entidad de Relación Reto - Plan de Estudio
 * 
 * Establece una relación muchos a muchos entre retos y planes de estudio,
 * permitiendo que un reto forme parte de múltiples planes y que un plan
 * contenga múltiples retos.
 * 
 * Esta tabla de unión registra también la fecha en que se creó la asociación.
 */
@Entity('reto_planes_estudio')
export class RetoPlanEstudio {
  /** ID del reto en la relación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  reto_id: string;

  /** ID del plan de estudio en la relación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  plan_estudio_id: string;

  /** Fecha en que se asoció el reto al plan de estudio */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asociacion: Date;

  /** Relación con la entidad Reto */
  @ManyToOne(() => Reto, reto => reto.id)
  @JoinColumn({ name: 'reto_id' })
  reto: Reto;

  /** Relación con la entidad Plan de Estudio */
  @ManyToOne(() => PlanEstudio, planEstudio => planEstudio.id)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;
}
