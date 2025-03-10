import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { PlanEstudio } from './plan-estudio.entity';
import { Tarea } from './tarea.entity';
import { RetoPlanEstudio } from './reto-planes-estudio.entity';
import { RetoCategoria } from './reto-categorias.entity';
import { ParticipacionRetos } from './participacion-retos.entity';

/**
 * Entidad Reto
 * 
 * Representa un desafío académico que puede ser creado por un usuario
 * y completado por múltiples participantes. Los retos contienen tareas
 * y son el elemento central del aprendizaje colaborativo en la plataforma.
 * 
 * Un reto puede asociarse a uno o varios planes de estudio y puede
 * tener diferentes estados (borrador, activo, finalizado).
 */
@Entity('retos')
export class Reto {
  /** Identificador único del reto */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario que creó el reto */
  @Column('uuid')
  creador_id: string;

  /** Indica si el reto es visible para todos los usuarios */
  @Column({ default: false })
  es_publico: boolean;

  /** Estado actual del reto: borrador, activo o finalizado */
  @Column({ default: 'borrador' })
  estado: string;

  /** Timestamp que registra cuándo cambió el estado del reto */
  @Column({ name: 'fecha_estado', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_estado: Date;

  /** ID del plan de estudio principal al que está asociado (opcional) */
  @Column('uuid', { nullable: true })
  plan_estudio_id: string;

  /** Título descriptivo del reto */
  @Column()
  titulo: string;

  /** Descripción detallada del reto */
  @Column({ nullable: true })
  descripcion: string;

  /** Fecha en que inicia el reto */
  @Column({ type: 'date' })
  fecha_inicio: string;

  /** 
   * Fecha en que finaliza el reto
   * Esta fecha debe ser posterior a la fecha de inicio
   */
  @Column({ type: 'date' })
  fecha_fin: string;

  /** Nivel de dificultad del reto: principiante, intermedio o avanzado */
  @Column({ nullable: true })
  dificultad: string;

  /** 
   * Suma total de puntos que vale el reto
   * Se calcula automáticamente como la suma de los puntos de todas sus tareas
   */
  @Column({ default: 0 })
  puntos_totales: number;

  /** 
   * Número de usuarios participando en el reto
   * Se actualiza automáticamente por un trigger
   */
  @Column({ default: 0 })
  participaciones: number;

  /** Fecha de creación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  /** 
   * Planes de estudio asociados a este reto (relación M:M)
   * Permite que un reto pertenezca a múltiples planes de estudio
   */
  @ManyToMany(() => PlanEstudio)
  @JoinTable({
    name: "reto_planes_estudio",
    joinColumn: { name: "reto_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "plan_estudio_id", referencedColumnName: "id" }
  })
  planes_estudio: PlanEstudio[];

  /**
   * Tareas asociadas a este reto
   * Con cascade remove para eliminar automáticamente las tareas al eliminar el reto
   */
  @OneToMany(() => Tarea, tarea => tarea.reto, { cascade: ['remove'] })
  tareas: Tarea[];

  /**
   * Relación con planes de estudio
   * Solo cascade para operaciones de insert y update, no para remove
   */
  @OneToMany(() => RetoPlanEstudio, rpe => rpe.reto, { cascade: ['insert', 'update'] })
  planesRelaciones: RetoPlanEstudio[];
  
  /**
   * Relación con categorías
   * Con cascade para operaciones de insert y update
   */
  @OneToMany(() => RetoCategoria, rc => rc.reto_id, { cascade: ['insert', 'update'] })
  categorias: RetoCategoria[];
  
  /**
   * Participaciones de usuarios en este reto
   * Con cascade para operaciones de insert y update
   */
  @OneToMany(() => ParticipacionRetos, pr => pr.reto_id, { cascade: ['insert', 'update'] })
  participacionesUsuarios: ParticipacionRetos[];
}
