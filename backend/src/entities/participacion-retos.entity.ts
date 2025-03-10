import { Entity, Column } from 'typeorm';

@Entity('participacion_retos')
export class ParticipacionRetos {
  @Column('uuid', { primary: true })
  usuario_id: string;

  @Column('uuid', { primary: true })
  reto_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_union: Date;

  @Column({ default: 0 })
  progreso: number;

  @Column({ default: 'activo' })
  estado: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado: Date;
}
