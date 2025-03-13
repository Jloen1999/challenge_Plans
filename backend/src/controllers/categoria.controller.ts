import { Request, Response } from 'express';
import { CategoriaService } from '../services/categoria.service';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/custom-errors';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class CategoriaController {
  private categoriaService: CategoriaService;
  private authService: AuthService;

  constructor() {
    this.categoriaService = new CategoriaService();
    this.authService = new AuthService();
  }

  /**
   * Obtiene todas las categorías
   * @route GET /api/categorias
   */
  getAllCategorias = async (req: Request, res: Response): Promise<void> => {
    try {
      const categorias = await this.categoriaService.findAll();
      res.status(200).json({ categorias });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene todas las categorías con conteo de retos
   * @route GET /api/categorias/stats
   */
  getAllWithRetosCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const categorias = await this.categoriaService.findAllWithRetosCount();
      res.status(200).json({ categorias });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene una categoría por su ID
   * @route GET /api/categorias/:id
   */
  getCategoriaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const categoria = await this.categoriaService.findById(id);
      res.status(200).json({ categoria });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Crea una nueva categoría
   * @route POST /api/categorias
   */
  createCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Verificar permisos
      const userId = req.user?.id;
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para crear categorías' });
        return;
      }

      const categoriaData = req.body;
      const nuevaCategoria = await this.categoriaService.create(categoriaData);

      res.status(201).json({
        message: 'Categoría creada correctamente',
        categoria: nuevaCategoria
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza una categoría existente
   * @route PUT /api/categorias/:id
   */
  updateCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      // Verificar permisos
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para editar categorías' });
        return;
      }

      const categoriaData = req.body;
      const updatedCategoria = await this.categoriaService.update(id, categoriaData);

      res.status(200).json({
        message: 'Categoría actualizada correctamente',
        categoria: updatedCategoria
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina una categoría
   * @route DELETE /api/categorias/:id
   */
  deleteCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verificar permisos
      if (!userId || !(await this.checkAdminPermission(userId))) {
        res.status(403).json({ message: 'No tienes permiso para eliminar categorías' });
        return;
      }

      await this.categoriaService.delete(id);

      res.status(200).json({
        message: 'Categoría eliminada correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Busca categorías por término
   * @route GET /api/categorias/search
   */
  searchCategorias = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
      }

      const categorias = await this.categoriaService.search(term);
      res.status(200).json({ categorias });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  private async checkAdminPermission(userId: string): Promise<boolean> {
    return this.authService.hasPermissions(userId, ['editar_categoria']);
  }

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en CategoriaController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof ConflictError) {
      res.status(409).json({ message: error.message });
    } else if (error instanceof BadRequestError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}
