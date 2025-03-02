import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RetoCategoria } from "./RetoCategoria";

@Entity({ name: "categorias" })
export class Categoria {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  nombre: string;

  // Relaciones
  @OneToMany(() => RetoCategoria, retoCategoria => retoCategoria.categoria)
  retoCategorias: RetoCategoria[];
}
