import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

/**
 * Entidad Auditoría
 * 
 * Registra todas las acciones importantes realizadas en el sistema,
 * creando un historial de cambios para fines de seguridad y trazabilidad.
 * 
 * Esta entidad es esencial para la gobernanza de datos, permitiendo
 * rastrear quién hizo qué cambios, cuándo y a qué registros específicos.
 */
@Entity('auditoria')
export class Auditoria {
  /** Identificador único del registro de auditoría */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario que realizó la acción (puede ser nulo para acciones del sistema) */
  @Column('uuid', { nullable: true })
  usuario_id: string;

  /** 
   * Tipo de acción realizada
   * Valores típicos: INSERT, UPDATE, DELETE
   */
  @Column({ length: 50 })
  accion: string;

  /** Nombre de la tabla afectada por la acción */
  @Column({ length: 50 })
  tabla: string;

  /** ID del registro específico afectado */
  @Column('uuid')
  registro_id: string;

  /** Fecha y hora exacta en que se realizó la acción */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  /** 
   * Detalles adicionales sobre la acción
   * Almacenados como JSON para flexibilidad
   */
  @Column({ type: 'jsonb', nullable: true })
  detalles: Record<string, any>;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
