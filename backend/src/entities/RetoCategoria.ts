import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Reto } from "./Reto";
import { Categoria } from "./Categoria";

@Entity({ name: "reto_categorias" })
export class RetoCategoria {
  @PrimaryColumn({ name: "reto_id" })
  retoId: string;

  @PrimaryColumn({ name: "categoria_id" })
  categoriaId: string;

  // Relaciones
  @ManyToOne(() => Reto, reto => reto.retoCategorias)
  @JoinColumn({ name: "reto_id" })
  reto: Reto;

  @ManyToOne(() => Categoria, categoria => categoria.retoCategorias)
  @JoinColumn({ name: "categoria_id" })
  categoria: Categoria;
}
