import { Entity, Column } from 'typeorm';

@Entity('usuario_recompensas')
export class UsuarioRecompensas {
  @Column('uuid', { primary: true })
  usuario_id: string;

  @Column('uuid', { primary: true })
  recompensa_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_obtencion: Date;
}
