import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidad Categoría
 * 
 * Representa las distintas clasificaciones que pueden tener los retos.
 * Permite organizar y filtrar retos por temáticas como matemáticas,
 * ciencias, programación, idiomas, etc.
 */
@Entity('categorias')
export class Categoria {
  /** Identificador único de la categoría */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nombre único de la categoría */
  @Column({ unique: true })
  nombre: string;

  /** Descripción detallada de la categoría */
  @Column({ nullable: true })
  descripcion: string;

  /** 
   * Icono representativo de la categoría
   * Almacena un identificador del icono (no la imagen en sí)
   */
  @Column({ length: 50, nullable: true })
  icono: string;
}
