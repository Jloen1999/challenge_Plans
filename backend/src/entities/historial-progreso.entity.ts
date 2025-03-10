import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Reto } from './reto.entity';

/**
 * Entidad Historial de Progreso
 * 
 * Registra los cambios en el progreso de los usuarios en los retos,
 * permitiendo un seguimiento detallado de su avance a lo largo del tiempo.
 * 
 * Esta entidad es fundamental para el análisis de datos y la generación
 * de estadísticas sobre el rendimiento y la participación de los usuarios.
 */
@Entity('historial_progreso')
export class HistorialProgreso {
  /** Identificador único del registro de historial */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID del usuario cuyo progreso se está registrando */
  @Column('uuid')
  usuario_id: string;

  /** ID del reto al que pertenece este progreso */
  @Column('uuid')
  reto_id: string;

  /** Porcentaje de progreso antes del cambio (0-100) */
  @Column()
  progreso_anterior: number;

  /** Porcentaje de progreso después del cambio (0-100) */
  @Column()
  progreso_nuevo: number;

  /** Fecha y hora exacta en que se registró el cambio */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  /** 
   * Tipo de evento que causó el cambio de progreso
   * Ejemplos: tarea_completada, actualizacion_manual, reto_completado
   */
  @Column({ length: 50 })
  evento: string;

  /** Relación con la entidad Usuario */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** Relación con la entidad Reto */
  @ManyToOne(() => Reto)
  @JoinColumn({ name: 'reto_id' })
  reto: Reto;
}
