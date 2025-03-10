import { Entity, Column } from 'typeorm';

@Entity('rol_permisos')
export class RolPermisos {
  @Column('uuid', { primary: true })
  rol_id: string;

  @Column('uuid', { primary: true })
  permiso_id: string;
}
