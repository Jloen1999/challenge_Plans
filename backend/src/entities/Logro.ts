import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity({ name: "logros" })
export class Logro {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "usuario_id" })
  usuarioId: string;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  descripcion: string;

  @CreateDateColumn()
  fecha: Date;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.logros)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;
}
