import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Categoria } from '../entities/categoria.entity';
import { NotFoundError, ConflictError } from '../utils/custom-errors';

export class CategoriaService {
  private categoriaRepository: Repository<Categoria>;

  constructor() {
    this.categoriaRepository = AppDataSource.getRepository(Categoria);
  }

  /**
   * Obtiene todas las categorías
   */
  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  /**
   * Obtiene una categoría por su ID
   */
  async findById(id: string): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id }
    });

    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    return categoria;
  }

  /**
   * Crea una nueva categoría
   */
  async create(categoriaData: {
    nombre: string;
    descripcion?: string;
    icono?: string;
  }): Promise<Categoria> {
    // Verificar si ya existe una categoría con el mismo nombre
    const existing = await this.categoriaRepository.findOne({
      where: { nombre: categoriaData.nombre }
    });

    if (existing) {
      throw new ConflictError('Ya existe una categoría con ese nombre');
    }

    const categoria = this.categoriaRepository.create(categoriaData);
    return this.categoriaRepository.save(categoria);
  }

  /**
   * Actualiza una categoría existente
   */
  async update(id: string, categoriaData: Partial<Categoria>): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id }
    });

    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    // Si se cambia el nombre, verificar que no exista otra con ese nombre
    if (categoriaData.nombre && categoriaData.nombre !== categoria.nombre) {
      const existing = await this.categoriaRepository.findOne({
        where: { nombre: categoriaData.nombre }
      });

      if (existing) {
        throw new ConflictError('Ya existe otra categoría con ese nombre');
      }
    }

    await this.categoriaRepository.update(id, categoriaData);
    return this.findById(id);
  }

  /**
   * Elimina una categoría
   */
  async delete(id: string): Promise<boolean> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id }
    });

    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    // Verificar si hay retos que usen esta categoría
    const retosConCategoria = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM reto_categorias
      WHERE categoria_id = $1
    `, [id]);

    if (parseInt(retosConCategoria[0].count) > 0) {
      throw new ConflictError('No se puede eliminar la categoría porque está siendo utilizada en retos');
    }

    const result = await this.categoriaRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Obtiene todas las categorías con el conteo de retos asociados
   */
  async findAllWithRetosCount(): Promise<any[]> {
    return AppDataSource.query(`
      SELECT c.*, COUNT(rc.reto_id) as retos_count
      FROM categorias c
      LEFT JOIN reto_categorias rc ON c.id = rc.categoria_id
      GROUP BY c.id
      ORDER BY c.nombre
    `);
  }

  /**
   * Obtiene categorías por sus nombres
   */
  async findByNames(nombres: string[]): Promise<Categoria[]> {
    if (!nombres || nombres.length === 0) {
      return [];
    }
    
    return this.categoriaRepository.createQueryBuilder('categoria')
      .where('categoria.nombre IN (:...nombres)', { nombres })
      .getMany();
  }

  /**
   * Busca categorías que contengan un texto en su nombre o descripción
   */
  async search(searchTerm: string): Promise<Categoria[]> {
    return this.categoriaRepository.createQueryBuilder('categoria')
      .where('categoria.nombre ILIKE :searchTerm OR categoria.descripcion ILIKE :searchTerm', 
        { searchTerm: `%${searchTerm}%` })
      .getMany();
  }
}
