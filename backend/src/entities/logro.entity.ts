import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('logros')
export class Logro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  usuario_id: string;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}
