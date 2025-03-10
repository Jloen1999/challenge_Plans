import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('archivos')
export class Archivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  apunte_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  formato: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_subida: Date;
}
