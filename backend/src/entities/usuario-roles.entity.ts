import { Entity, Column } from 'typeorm';

@Entity('usuario_roles')
export class UsuarioRoles {
  @Column('uuid', { primary: true })
  usuario_id: string;

  @Column('uuid', { primary: true })
  rol_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;
}
