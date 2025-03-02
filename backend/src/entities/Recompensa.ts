import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UsuarioRecompensa } from "./UsuarioRecompensa";

@Entity({ name: "recompensas" })
export class Recompensa {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  tipo: "insignia" | "puntos" | "nivel";

  @Column()
  valor: number;

  @Column({ name: "criterio_obtencion" })
  criterioObtencion: string;

  // Relaciones
  @OneToMany(() => UsuarioRecompensa, usuarioRecompensa => usuarioRecompensa.recompensa)
  usuariosRecompensas: UsuarioRecompensa[];
}
