import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ArchivoService } from '../services/archivo.service';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

export class ArchivoController {
  private archivoService: ArchivoService;

  constructor() {
    this.archivoService = new ArchivoService();
  }

  /**
   * Obtiene archivos por entidad y su ID
   * @route GET /api/archivos/:entidad/:entidadId
   */
  getArchivosByEntidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entidad, entidadId } = req.params;
      const archivos = await this.archivoService.getByEntidad(entidad, entidadId);
      res.status(200).json({ archivos });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene un archivo por su ID
   * @route GET /api/archivos/:id
   */
  getArchivoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const archivo = await this.archivoService.getById(id);
      res.status(200).json({ archivo });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Sube un nuevo archivo
   * @route POST /api/archivos
   */
  uploadArchivo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Verificar autenticación
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Aquí se asumiría que hay un middleware de carga de archivos
      // como multer que procesa el archivo y lo guarda en algún lugar

      // req.file contendría la información del archivo subido
      if (!req.file) {
        res.status(400).json({ message: 'No se ha subido ningún archivo' });
        return;
      }

      const { entidad, entidad_id, nombre = req.file.originalname } = req.body;

      // Obtener la URL de donde se haya guardado el archivo
      // Según la configuración podría estar en diferentes propiedades
      let fileUrl = '';
      if (req.file.path) {
        fileUrl = req.file.path;
      } else if (req.file.filename) {
        // Si se usa diskStorage de multer, puede estar en filename
        fileUrl = `/uploads/${req.file.filename}`;
      } else {
        // Para situaciones donde la URL viene en otra propiedad o formato
        fileUrl = req.file.destination ? 
          `${req.file.destination}/${req.file.filename}` : 
          '/archivo-sin-ruta';
      }

      // Crear registro en la base de datos
      const archivo = await this.archivoService.create({
        entidad,
        entidad_id,
        nombre,
        url: fileUrl,
        formato: this.getFileFormat(req.file.mimetype || req.file.originalname),
        tamaño_bytes: req.file.size,
        subido_por: userId
      });

      res.status(201).json({
        message: 'Archivo subido correctamente',
        archivo
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Actualiza información de un archivo
   * @route PUT /api/archivos/:id
   */
  updateArchivo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const archivoData = req.body;

      const updatedArchivo = await this.archivoService.update(id, archivoData);

      res.status(200).json({
        message: 'Archivo actualizado correctamente',
        archivo: updatedArchivo
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Elimina un archivo
   * @route DELETE /api/archivos/:id
   */
  deleteArchivo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.archivoService.delete(id);

      res.status(200).json({
        message: 'Archivo eliminado correctamente'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Obtiene el formato del archivo a partir del tipo MIME o nombre
   */
  private getFileFormat(mimeOrName: string): string {
    if (mimeOrName.includes('/')) {
      // Es un MIME type
      const parts = mimeOrName.split('/');
      return parts[parts.length - 1];
    } else {
      // Es un nombre de archivo
      const parts = mimeOrName.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
    }
  }

  /**
   * Manejador unificado de errores para el controlador
   */
  private handleError = (error: any, res: Response): void => {
    console.error('Error en ArchivoController:', error);

    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
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
