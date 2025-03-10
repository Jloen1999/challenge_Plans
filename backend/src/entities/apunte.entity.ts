import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidad Apunte
 * 
 * Representa un documento o nota de estudio que los usuarios pueden
 * compartir en la plataforma. Los apuntes pueden contener texto directamente
 * o estar asociados a archivos externos mediante la tabla archivos_genericos.
 * 
 * Los apuntes pueden ser públicos o privados y pueden estar asociados a
 * un reto o a un plan de estudio, o ser independientes.
 */
@Entity('apuntes')
export class Apunte {
  /** Identificador único del apunte */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario que creó el apunte */
  @Column('uuid')
  usuario_id: string;

  /** ID del reto al que está asociado (opcional) */
  @Column('uuid', { nullable: true })
  reto_id: string;

  /** ID del plan de estudio al que está asociado (opcional) */
  @Column('uuid', { nullable: true })
  plan_estudio_id: string;

  /** Título descriptivo del apunte */
  @Column()
  titulo: string;

  /** 
   * Contenido textual del apunte (opcional)
   * Puede ser nulo si el apunte consiste sólo en archivos adjuntos
   */
  @Column({ nullable: true }) 
  contenido: string;

  /** 
   * Formato del contenido: pdf, md (markdown), docx
   * Indica cómo debe interpretarse o renderizarse el contenido
   */
  @Column({ nullable: true })
  formato: string;

  /** Fecha en que se subió el apunte */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_subida: Date;

  /** 
   * Promedio de calificaciones recibidas por el apunte
   * Calculado automáticamente mediante un trigger
   */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  calificacion_promedio: number;

  /** Indica si el apunte es visible para todos los usuarios */
  @Column({ default: false })
  es_publico: boolean;

  /** Fecha de creación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;
}
