import { Entity, Column } from 'typeorm';

@Entity('calificaciones_apuntes')
export class CalificacionApunte {
  @Column('uuid', { primary: true })
  apunte_id: string;

  @Column('uuid', { primary: true })
  usuario_id: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  calificacion: number;

  @Column({ nullable: true })
  comentario: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_calificacion: Date;
}
