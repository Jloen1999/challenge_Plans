import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import MainLayout from '../components/layout/MainLayout';
import DocumentUploader from '../components/apuntes/DocumentUploader';
import '../assets/styles/pages/CreateApunte.css';
import { useAuth } from '../contexts/AuthContext';

// Configuración del cliente S3 para Supabase Storage
const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'eu-central-1',
  endpoint: 'https://rirdnwywjctumorueupm.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: '11154d2891254f349895b96d3a42f72b',
    secretAccessKey: 'f50bb4534a8a6b50767c09316f0d4c94aa3079d516c2d711c7a26a805f264387',
  }
});

// Los valores permitidos para visibilidad y formato según la DB
type Visibilidad = 'publico' | 'privado';
type Formato = 'pdf' | 'md' | 'docx';

interface ApunteFormData {
  titulo: string;
  contenido: string;
  formato: Formato; // Usar el tipo específico según la base de datos
  reto_id?: string;
  plan_estudio_id?: string;
  visibilidad: Visibilidad; // Usar el tipo específico según la base de datos
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateApunte: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Inicializar con valores válidos para los campos enumerados
  const [formData, setFormData] = useState<ApunteFormData>({
    titulo: '',
    contenido: '',
    formato: 'md', // Valor válido inicial
    visibilidad: 'publico' // Valor válido inicial
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retos, setRetos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  
  // Verificar autenticación al cargar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/apuntes/crear');
    }
  }, [isAuthenticated, navigate]);
  
  // Cargar datos de retos y planes
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error("No hay token de autenticación");
            return;
          }
          
          console.log("Obteniendo datos del usuario desde:", API_URL);
          
          // Cargar retos en paralelo
          try {
            const retosResponse = await axios.get(`${API_URL}/retos/mis-retos`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("Respuesta de retos:", retosResponse.data);
            setRetos(retosResponse.data?.retos || []);
          } catch (err) {
            console.error("Error al obtener retos:", err);
          }
          
          // Cargar planes por separado para mejor diagnóstico
          try {
            const planesResponse = await axios.get(`${API_URL}/planes/mis-planes`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("Respuesta de planes:", planesResponse.data);
            setPlanes(planesResponse.data?.planes || []);
          } catch (err) {
            console.error("Error al obtener planes:", err);
          }
        } catch (err) {
          console.error("Error general al cargar datos:", err);
        }
      };
      
      fetchUserData();
    }
  }, [isAuthenticated, API_URL]);
  
  // Handler para cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Actualizar visibilidad del editor según formato
    if (name === 'formato') {
      setShowEditor(['md', 'txt'].includes(value));
    }
  };
  
  // Handler para selección de archivo
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    console.log("Archivo seleccionado:", file);
    
    // Detectar formato por extensión
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt) {
      const formatMap: { [key: string]: Formato } = {
        'pdf': 'pdf',
        'md': 'md',
        'docx': 'docx',
        'doc': 'docx'
      };
      
      // Solo actualizar si la extensión es válida
      if (formatMap[fileExt]) {
        setFormData(prev => ({ ...prev, formato: formatMap[fileExt] }));
        setShowEditor(['md', 'txt'].includes(formatMap[fileExt]));
      }
    }
  };
  
  // Función para subir archivo a Supabase - Versión mejorada con retraso
const uploadFileToSupabase = async (file: File, userId: string): Promise<string> => {
  try {
    // Sanitizar título para nombre de archivo
    const sanitizedTitle = formData.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Crear nombre único
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${sanitizedTitle}_${uuidv4()}.${fileExtension}`;
    
    console.log(`Preparando para subir archivo a bucket 'apuntes' con key: ${fileName}`);
    console.log(`Tipo de archivo: ${file.type}, Tamaño: ${file.size} bytes`);
    
    // Crear array de bytes desde archivo (compatible con navegador)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Comando para subir
    const command = new PutObjectCommand({
      Bucket: 'apuntes',
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
      ACL: 'public-read'
    });
    
    // Subir archivo
    const result = await s3Client.send(command);
    console.log("Resultado de la subida:", result);
    
    // Construir la URL correcta
    const documentUrl = `https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/${fileName}`;
    
    // Añadir una pequeña espera para asegurar que el archivo está disponible
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que la URL es accesible
    try {
      const checkResponse = await fetch(documentUrl, { method: 'HEAD' });
      if (!checkResponse.ok) {
        console.warn(`La URL ${documentUrl} no parece estar disponible todavía (status: ${checkResponse.status})`);
      } else {
        console.log(`URL verificada y accesible: ${documentUrl}`);
      }
    } catch (checkErr) {
      console.warn("No se pudo verificar la URL, pero continuamos:", checkErr);
    }
    
    return documentUrl;
    
  } catch (error: any) {
    console.error('Error detallado al subir archivo:', error);
    throw new Error(`Error al subir el archivo: ${error.message}`);
  }
};

// Enviar formulario - Versión mejorada con reintento
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  // Validación extra en frontend
  if (!formData.titulo.trim()) {
    setError('El título es obligatorio');
    setLoading(false);
    return;
  }
  
  if (!formData.formato) {
    setError('El formato es obligatorio');
    setLoading(false);
    return;
  }
  
  if (!selectedFile) {
    setError('Debes seleccionar un archivo para subir');
    setLoading(false);
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No estás autenticado');
    }
    
    let documentoUrl = null;
    let retries = 0;
    const MAX_RETRIES = 2;
    
    // Intentar subir archivo con reintentos
    while (retries <= MAX_RETRIES) {
      try {
        if (selectedFile && user?.id) {
          console.log(`Intento ${retries + 1} de subida de archivo...`);
          documentoUrl = await uploadFileToSupabase(selectedFile, user.id);
          console.log("Archivo subido exitosamente a:", documentoUrl);
          break; // Salir del bucle si la subida es exitosa
        }
      } catch (uploadError) {
        console.error(`Error en intento ${retries + 1}:`, uploadError);
        if (retries === MAX_RETRIES) {
          throw new Error(`No se pudo subir el archivo después de ${MAX_RETRIES + 1} intentos`);
        }
        retries++;
        // Esperar antes del siguiente intento (backoff exponencial)
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
      }
    }
    
    if (!documentoUrl) {
      throw new Error('No se pudo obtener la URL del documento');
    }
    
    // En lugar de FormData, usar objeto JSON
    const apunteData = {
      titulo: formData.titulo,
      formato: formData.formato,
      visibilidad: formData.visibilidad,
      contenido: formData.contenido.trim() || undefined,
      reto_id: formData.reto_id || undefined,
      plan_estudio_id: formData.plan_estudio_id || undefined,
      documento_url: documentoUrl
    };
    
    console.log("Enviando datos del apunte al backend:", apunteData);
    
    // Espera adicional antes de crear el apunte para asegurar consistencia
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enviar request con formato JSON
    const response = await axios.post(
      `${API_URL}/apuntes`, 
      apunteData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Respuesta del servidor:", response.data);
    
    // Si llegamos aquí, todo fue exitoso
    setSuccess(true);
    setTimeout(() => {
      navigate(`/apuntes/${response.data.apunte.id}`);
    }, 1500);
    
  } catch (err: any) {
    console.error("Error detallado:", err);
    setError(err.response?.data?.message || err.message || 'Error al crear el apunte');
    
    // Intentar mostrar información más detallada del error
    if (err.response?.data?.debug) {
      console.error("Información de depuración:", err.response.data.debug);
    }
  } finally {
    setLoading(false);
  }
};
  
  // Calcular extensiones permitidas según formato
  const allowedExtensions = () => {
    switch (formData.formato) {
      case 'pdf': return ['.pdf'];
      case 'md': return ['.md', '.txt'];
      case 'docx': return ['.docx', '.doc'];
      default: return ['.pdf', '.md', '.txt', '.docx', '.doc'];
    }
  };
  
  return (
    <MainLayout>
      <div className="create-apunte-page">
        <div className="page-header">
          <h1>Nuevo Apunte</h1>
          <p>Comparte tus conocimientos con la comunidad</p>
        </div>
        
        {success ? (
          <div className="success-message">
            <h2>¡Apunte creado con éxito!</h2>
            <p>Redirigiendo a la página del apunte...</p>
          </div>
        ) : (
          <form className="apunte-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título del apunte"
                required
                className="form-control"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="formato">Formato *</label>
                <select
                  id="formato"
                  name="formato"
                  value={formData.formato}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="md">Markdown</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="visibilidad">Visibilidad *</label>
                <select
                  id="visibilidad"
                  name="visibilidad"
                  value={formData.visibilidad}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reto_id">Relacionado con Reto (opcional)</label>
                <select
                  id="reto_id"
                  name="reto_id"
                  value={formData.reto_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Ninguno</option>
                  {retos.map(reto => (
                    <option key={reto.id} value={reto.id}>{reto.titulo}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="plan_estudio_id">Relacionado con Plan (opcional)</label>
                <select
                  id="plan_estudio_id"
                  name="plan_estudio_id"
                  value={formData.plan_estudio_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Ninguno</option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.titulo}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="file-upload">Documento *</label>
              <DocumentUploader 
                onFileSelected={handleFileSelected}
                allowedExtensions={allowedExtensions()}
                maxSizeMB={10}
              />
              {selectedFile && (
                <div className="selected-file">
                  <p>Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</p>
                </div>
              )}
            </div>
            
            {showEditor && (
              <div className="form-group">
                <label htmlFor="contenido">Descripción o Notas (opcional)</label>
                <textarea
                  id="contenido"
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleInputChange}
                  placeholder="Puedes agregar notas o una descripción del documento"
                  className="form-control"
                  rows={5}
                />
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Subiendo...' : 'Crear Apunte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default CreateApunte;
