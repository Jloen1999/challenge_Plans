import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Reto } from "./Reto";

@Entity({ name: "participacion_retos" })
export class ParticipacionReto {
  @PrimaryColumn({ name: "usuario_id" })
  usuarioId: string;

  @PrimaryColumn({ name: "reto_id" })
  retoId: string;

  @CreateDateColumn({ name: "fecha_union" })
  fechaUnion: Date;

  @Column({ default: 0 })
  progreso: number;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.participaciones)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @ManyToOne(() => Reto, reto => reto.participaciones)
  @JoinColumn({ name: "reto_id" })
  reto: Reto;
}
