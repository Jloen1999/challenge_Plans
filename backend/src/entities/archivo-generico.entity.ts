import { Entity, PrimaryGeneratedColumn, Column, Check } from 'typeorm';

/**
 * Entidad Archivo Genérico
 * 
 * Representa un archivo adjunto que puede estar asociado a diferentes
 * entidades en el sistema (apuntes, tareas, retos, planes de estudio, etc.).
 * 
 * Esta entidad permite una estructura flexible donde cualquier entidad 
 * puede tener archivos asociados sin necesidad de tablas específicas
 * para cada tipo de relación.
 */
@Entity('archivos_genericos')
export class ArchivoGenerico {
  /** Identificador único del archivo */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 
   * Tipo de entidad a la que está asociado el archivo
   * Define la tabla de origen a la que pertenece
   */
  @Column()
  @Check("entidad IN ('apunte', 'tarea', 'reto', 'plan_estudio', 'comentario')")
  entidad: string;

  /** ID del registro específico en la entidad asociada */
  @Column('uuid')
  entidad_id: string;

  /** Nombre original del archivo */
  @Column()
  nombre: string;

  /** URL donde se encuentra almacenado el archivo */
  @Column()
  url: string;

  /** Formato/extensión del archivo */
  @Column()
  formato: string;

  /** Tamaño del archivo en bytes */
  @Column({ nullable: true })
  tamaño_bytes: number;

  /** Fecha en que se subió el archivo */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_subida: Date;

  /** ID del usuario que subió el archivo */
  @Column('uuid', { nullable: true })
  subido_por: string;
}
