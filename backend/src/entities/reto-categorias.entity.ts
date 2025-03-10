import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reto } from './reto.entity';
import { Categoria } from './categoria.entity';

/**
 * Entidad de Relación Reto - Categoría
 * 
 * Establece una relación muchos a muchos entre retos y categorías,
 * permitiendo clasificar los retos en múltiples categorías.
 */
@Entity('reto_categorias')
export class RetoCategoria {
  /** ID del reto en la relación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  reto_id: string;

  /** ID de la categoría en la relación (clave primaria compuesta) */
  @PrimaryColumn('uuid')
  categoria_id: string;

  /** Relación con la entidad Reto */
  @ManyToOne(() => Reto, reto => reto.categorias)
  @JoinColumn({ name: 'reto_id' })
  reto: Reto;

  /** Relación con la entidad Categoría */
  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}