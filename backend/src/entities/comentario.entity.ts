import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

/**
 * Entidad Comentario
 * 
 * Representa un comentario que los usuarios pueden hacer sobre diferentes
 * elementos de la plataforma (retos, tareas, apuntes, planes de estudio).
 * 
 * La estructura flexible permite asociar comentarios a cualquier entidad
 * mediante los campos entidad y entidad_id, facilitando la implementación
 * de funcionalidades sociales.
 * 
 * Soporta comentarios anidados mediante la relación comentario_padre_id.
 */
@Entity('comentarios')
export class Comentario {
  /** Identificador único del comentario */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario que creó el comentario */
  @Column('uuid')
  usuario_id: string;

  /** 
   * Tipo de entidad a la que pertenece el comentario
   * Puede ser: reto, tarea, apunte o plan_estudio
   */
  @Column({ length: 30 })
  entidad: string;

  /** ID del registro en la entidad asociada */
  @Column('uuid')
  entidad_id: string;

  /** Contenido textual del comentario */
  @Column('text')
  contenido: string;

  /** Fecha en que se creó el comentario */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del comentario */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  /** ID del comentario padre (para comentarios anidados) */
  @Column('uuid', { nullable: true })
  comentario_padre_id: string;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** Relación con el comentario padre (auto-referencia) */
  @ManyToOne(() => Comentario)
  @JoinColumn({ name: 'comentario_padre_id' })
  comentario_padre: Comentario;
}
