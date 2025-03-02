import { Request, Response } from 'express';
import pool from '../config/db-config';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los apuntes - Mejora de depuración y manejo de errores
export const obtenerApuntes = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Solicitud recibida para obtenerApuntes con query:', req.query);
    
    const { 
      ordenar = 'recientes',
      formato = '',
      calificacion_min = 0,
      visibilidad = 'publico' // Añadir parámetro de visibilidad
    } = req.query;
    
    let orderClause = '';
    // Usar el parámetro visibilidad en lugar de hardcodear
    let whereConditions = [`a.visibilidad = '${visibilidad}'`];
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    // Determinar la cláusula ORDER BY según el parámetro
    switch (ordenar) {
      case 'recientes':
        orderClause = 'ORDER BY a.fecha_subida DESC';
        break;
      case 'antiguos':
        orderClause = 'ORDER BY a.fecha_subida ASC';
        break;
      case 'calificacion':
        orderClause = 'ORDER BY a.calificacion_promedio DESC, a.fecha_subida DESC';
        break;
      case 'alfabetico':
        orderClause = 'ORDER BY a.titulo ASC';
        break;
      default:
        orderClause = 'ORDER BY a.fecha_subida DESC';
    }
    
    console.log('orderClause:', orderClause);
    
    // Filtrar por formato si se especifica
    if (formato && formato !== 'todos') {
      whereConditions.push(`a.formato = $${paramCounter}`);
      queryParams.push(formato);
      paramCounter++;
    }
    
    // Filtrar por calificación mínima
    if (calificacion_min && Number(calificacion_min) > 0) {
      whereConditions.push(`a.calificacion_promedio >= $${paramCounter}`);
      queryParams.push(Number(calificacion_min));
      paramCounter++;
    }
    
    // Construir WHERE
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    console.log('whereClause:', whereClause);
    console.log('queryParams:', queryParams);
    
    // Query con JOINs para obtener información relacionada
    const query = `
      SELECT 
        a.*,
        u.nombre AS nombre_creador,
        r.titulo AS titulo_reto,
        pe.titulo AS titulo_plan
      FROM 
        apuntes a
      JOIN 
        usuarios u ON a.usuario_id = u.id
      LEFT JOIN 
        retos r ON a.reto_id = r.id
      LEFT JOIN 
        planes_estudio pe ON a.plan_estudio_id = pe.id
      ${whereClause}
      ${orderClause}
    `;
    
    console.log('Query final:', query);
    
    const { rows } = await pool.query(query, queryParams);
    
    console.log(`Obtenidos ${rows.length} apuntes`);
    
    // Formatear fechas y números para asegurar compatibilidad con frontend
    const formattedRows = rows.map(row => ({
      ...row,
      calificacion_promedio: parseFloat(row.calificacion_promedio) || 0,
      fecha_subida: row.fecha_subida ? new Date(row.fecha_subida).toISOString() : new Date().toISOString()
    }));
    
    res.json({
      message: 'Apuntes obtenidos exitosamente',
      apuntes: formattedRows
    });
  } catch (error: any) {
    console.error('Error al obtener apuntes:', error);
    res.status(500).json({
      message: 'Error al obtener los apuntes',
      error: error.message
    });
  }
};

// Obtener un apunte por su ID - Versión corregida
export const obtenerApuntePorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log(`Solicitando apunte con ID: ${id}`);
    
    // Query mejorada para obtener el apunte con información relacionada
    const query = `
      SELECT 
        a.*,
        u.nombre AS nombre_creador,
        r.titulo AS titulo_reto,
        pe.titulo AS titulo_plan
      FROM 
        apuntes a
      LEFT JOIN 
        usuarios u ON a.usuario_id = u.id
      LEFT JOIN 
        retos r ON a.reto_id = r.id
      LEFT JOIN 
        planes_estudio pe ON a.plan_estudio_id = pe.id
      WHERE 
        a.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Apunte no encontrado' });
      return;
    }

    // Formatear los datos antes de enviarlos
    const apunte = {
      ...rows[0],
      calificacion_promedio: parseFloat(rows[0].calificacion_promedio) || 0,
      fecha_subida: rows[0].fecha_subida ? new Date(rows[0].fecha_subida).toISOString() : null
    };
    
    console.log('Apunte encontrado:', {
      id: apunte.id,
      titulo: apunte.titulo,
      formato: apunte.formato,
      tieneDocumento: Boolean(apunte.documento_url)
    });
    
    res.json({
      message: 'Apunte obtenido exitosamente',
      apunte
    });
  } catch (error: any) {
    console.error('Error al obtener apunte:', error);
    res.status(500).json({
      message: 'Error al obtener el apunte',
      error: error.message
    });
  }
};

// Crear un nuevo apunte - Con mejor manejo de errores y de URLs
export const crearApunte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    
    console.log("Recibida solicitud de creación de apunte - Timestamp:", new Date().toISOString());
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    console.log("File:", req.file ? `File present (${req.file.originalname})` : "No file uploaded");
    
    const { 
      titulo, 
      contenido, 
      formato, 
      reto_id = null, 
      plan_estudio_id = null,
      visibilidad = 'publico',
      documento_url = null
    } = req.body;
    
    // Log detallado para depuración
    console.log("Datos para el apunte:", {
      titulo,
      formato,
      contenido: contenido ? "Presente" : "No presente",
      visibilidad,
      documento_url,
      reto_id,
      plan_estudio_id
    });
    
    // Si el documento_url está presente pero parece no válido
    if (documento_url && !documento_url.startsWith('http')) {
      console.warn(`URL de documento potencialmente inválida: "${documento_url}"`);
      
      // Intentar corregir si es una ruta relativa
      if (documento_url.startsWith('/')) {
        const host = process.env.API_HOST || 'http://localhost:5000';
        const correctedUrl = `${host}${documento_url}`;
        console.log(`Intentando corregir a: ${correctedUrl}`);
        
        // Puedes decidir si corregir automáticamente
        // documento_url = correctedUrl;
      }
    }
    
    // Si el título falta o está vacío, enviamos un error más detallado
    if (!titulo) {
      console.log("Error: Falta título. Tipo de dato recibido:", typeof titulo);
      res.status(400).json({ 
        message: 'El título es obligatorio', 
        debug: { 
          bodyRecibido: typeof req.body,
          contentType: req.headers['content-type'],
          bodyKeys: Object.keys(req.body)
        }
      });
      return;
    }
    
    // Validar campos requeridos con más detalle
    if (!formato) {
      console.log("Error: Falta formato");
      res.status(400).json({ message: 'El formato es obligatorio' });
      return;
    }
    
    // Validar que el formato es válido según definición en DB
    if (!['pdf', 'md', 'docx'].includes(formato)) {
      console.log("Error: Formato inválido:", formato);
      res.status(400).json({ message: 'El formato debe ser pdf, md o docx' });
      return;
    }
    
    // Construir los valores para la consulta
    const insertFields = [
      'usuario_id', 
      'titulo', 
      'formato', 
      'visibilidad', 
      'creado_por'
    ];
    
    const insertValues = [
      userId,
      titulo,
      formato,
      visibilidad,
      userId
    ];
    
    const placeholders = ['$1', '$2', '$3', '$4', '$5'];
    let paramCount = 5; // Contador para parámetros adicionales
    
    // Agregar campos opcionales
    if (contenido) {
      insertFields.push('contenido');
      insertValues.push(contenido);
      placeholders.push(`$${++paramCount}`);
    }
    
    if (reto_id) {
      insertFields.push('reto_id');
      insertValues.push(reto_id);
      placeholders.push(`$${++paramCount}`);
    }
    
    if (plan_estudio_id) {
      insertFields.push('plan_estudio_id');
      insertValues.push(plan_estudio_id);
      placeholders.push(`$${++paramCount}`);
    }
    
    if (documento_url) {
      insertFields.push('documento_url');
      insertValues.push(documento_url);
      placeholders.push(`$${++paramCount}`);
    }
    
    // Insertar apunte con mejor manejo de errores
    try {
      const query = `
        INSERT INTO apuntes (${insertFields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
      console.log("Query SQL:", query);
      console.log("Params:", insertValues);
      
      const { rows } = await pool.query(query, insertValues);
      
      console.log("Apunte creado exitosamente:", rows[0]);
      
      // Crear logro por haber subido un apunte
      try {
        const logroQuery = `
          INSERT INTO logros (usuario_id, tipo, descripcion)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        
        await pool.query(
          logroQuery, 
          [userId, 'subir_apunte', `Subió un nuevo apunte: "${titulo}"`]
        );
        
        console.log("Logro registrado por subida de apunte");
      } catch (logroErr) {
        // No fallar todo por error al registrar logro
        console.error("Error al registrar logro:", logroErr);
      }
      
      res.status(201).json({
        message: 'Apunte creado exitosamente',
        apunte: rows[0]
      });
    } catch (dbError: any) {
      console.error("Error específico de BD al insertar apunte:", dbError);
      
      // Mostrar mensaje más detallado según el código de error
      if (dbError.code === '23505') {
        res.status(409).json({ 
          message: 'Ya existe un apunte con el mismo título de este usuario',
          error: dbError.message
        });
      } else {
        throw dbError; // Dejar que el catch general lo maneje
      }
    }
  } catch (error: any) {
    console.error('Error detallado al crear apunte:', error);
    res.status(500).json({
      message: 'Error al crear el apunte',
      error: error.message
    });
  }
};

// Calificar un apunte
export const calificarApunte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    const { calificacion } = req.body;
    
    // Validar que la calificación es un número entre 1 y 5
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      res.status(400).json({ message: 'La calificación debe ser un número entre 1 y 5' });
      return;
    }
    
    // Verificar si el apunte existe
    const checkQuery = 'SELECT id FROM apuntes WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: 'Apunte no encontrado' });
      return;
    }
    
    // Verificar si el usuario ya ha calificado este apunte
    // Para esto necesitaríamos una tabla de calificaciones, pero por ahora actualizamos directamente
    // En una implementación completa, deberíamos manejar calificaciones individuales
    
    // Actualizar la calificación promedio del apunte
    const updateQuery = `
      UPDATE apuntes 
      SET calificacion_promedio = 
        (calificacion_promedio * 
          (SELECT COUNT(*) FROM apuntes_calificaciones WHERE apunte_id = $1) + $2) / 
          ((SELECT COUNT(*) FROM apuntes_calificaciones WHERE apunte_id = $1) + 1)
      WHERE id = $1
      RETURNING calificacion_promedio
    `;
    
    const updateResult = await pool.query(updateQuery, [id, calificacion]);
    
    // Registrar la calificación del usuario
    const ratingQuery = `
      INSERT INTO apuntes_calificaciones (apunte_id, usuario_id, calificacion)
      VALUES ($1, $2, $3)
      ON CONFLICT (apunte_id, usuario_id) DO UPDATE
      SET calificacion = $3
    `;
    
    await pool.query(ratingQuery, [id, userId, calificacion]);
    
    res.json({
      message: 'Apunte calificado exitosamente',
      calificacionPromedio: updateResult.rows[0].calificacion_promedio
    });
  } catch (error: any) {
    console.error('Error al calificar apunte:', error);
    res.status(500).json({
      message: 'Error al calificar el apunte',
      error: error.message
    });
  }
};

// Obtener apuntes destacados - Versión corregida
export const obtenerApuntesDestacados = async (req: Request, res: Response): Promise<void> => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 3;
    
    // Query para obtener apuntes destacados (mejor calificados)
    // Versión mejorada con selección explícita de campos y conversión de tipos
    const query = `
      SELECT 
        a.id,
        a.titulo,
        a.formato,
        a.fecha_subida,
        CAST(a.calificacion_promedio AS FLOAT) as calificacion_promedio,
        u.nombre AS nombre_creador,
        r.titulo AS titulo_reto,
        pe.titulo AS titulo_plan
      FROM 
        apuntes a
      JOIN 
        usuarios u ON a.usuario_id = u.id
      LEFT JOIN 
        retos r ON a.reto_id = r.id
      LEFT JOIN 
        planes_estudio pe ON a.plan_estudio_id = pe.id
      WHERE 
        a.visibilidad = 'publico'
      ORDER BY 
        a.calificacion_promedio DESC,
        a.fecha_subida DESC
      LIMIT $1
    `;
    
    const { rows } = await pool.query(query, [limite]);
    
    // Formateamos las fechas y aseguramos tipos de datos correctos
    const formattedRows = rows.map(row => ({
      ...row,
      calificacion_promedio: parseFloat(row.calificacion_promedio) || 0,
      fecha_subida: row.fecha_subida ? new Date(row.fecha_subida).toISOString() : new Date().toISOString()
    }));
    
    res.json({
      message: 'Apuntes destacados obtenidos exitosamente',
      apuntes: formattedRows
    });
  } catch (error: any) {
    console.error('Error al obtener apuntes destacados:', error);
    res.status(500).json({
      message: 'Error al obtener los apuntes destacados',
      error: error.message
    });
  }
};

/**
 * Endpoint para subida de archivos directa al servidor
 * Alternativa si falla la subida a Supabase
 */
export const subirArchivo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se ha enviado ningún archivo' });
      return;
    }
    
    const { userId } = req.user!;
    
    // Crear directorio para el usuario si no existe
    const userDir = path.join(__dirname, '../../uploads/apuntes', userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // Generar nombre de archivo único
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
    const filePath = path.join(userDir, fileName);
    
    // Mover el archivo de temp a la ubicación final
    fs.copyFileSync(req.file.path, filePath);
    fs.unlinkSync(req.file.path); // Eliminar el archivo temporal
    
    // Construir URL para acceder al archivo
    const documentoUrl = `/uploads/apuntes/${userId}/${fileName}`;
    
    res.status(200).json({
      message: 'Archivo subido exitosamente',
      documentoUrl
    });
  } catch (error: any) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
};