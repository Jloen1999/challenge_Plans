import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recompensas')
export class Recompensa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  tipo: string;

  @Column()
  valor: number;

  @Column()
  criterio_obtencion: string;
}
