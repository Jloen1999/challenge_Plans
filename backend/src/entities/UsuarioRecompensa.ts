import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Recompensa } from "./Recompensa";

@Entity({ name: "usuario_recompensas" })
export class UsuarioRecompensa {
  @PrimaryColumn({ name: "usuario_id" })
  usuarioId: string;

  @PrimaryColumn({ name: "recompensa_id" })
  recompensaId: string;

  @CreateDateColumn({ name: "fecha_obtencion" })
  fechaObtencion: Date;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.recompensas)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @ManyToOne(() => Recompensa, recompensa => recompensa.usuariosRecompensas)
  @JoinColumn({ name: "recompensa_id" })
  recompensa: Recompensa;
}
