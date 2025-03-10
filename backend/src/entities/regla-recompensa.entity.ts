import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reglas_recompensas')
export class ReglaRecompensa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  evento: string;

  @Column({ nullable: true })
  condicion: string;

  @Column('uuid')
  recompensa_id: string;

  @Column({ nullable: true })
  puntos: number;

  @Column({ default: true })
  activa: boolean;
}
