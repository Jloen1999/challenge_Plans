import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import MainLayout from '../layout/MainLayout';
import DocumentUploader from './DocumentUploader'; // Ajustado para una ruta relativa más probable
import '../../assets/styles/pages/CreateApunte.css';
import { useAuth } from '../../contexts/AuthContext';

// Definir API_URL que faltaba
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

interface ApunteFormData {
  titulo: string;
  contenido: string;
  formato: string;
  reto_id?: string;
  plan_estudio_id?: string;
  visibilidad: 'publico' | 'privado';
}

const CreateApunte: React.FC = () => {
  const [formData, setFormData] = useState<ApunteFormData>({
    titulo: '',
    contenido: '',
    formato: '',
    visibilidad: 'publico',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Función para subir archivo a Supabase Storage
  const uploadFileToSupabase = async (file: File, userId: string): Promise<string> => {
    try {
      // Sanitizar el título para usarlo como parte del nombre del archivo
      const sanitizedTitle = formData.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Crear un nombre único para el archivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${sanitizedTitle}_${uuidv4()}.${fileExtension}`;
      
      // Crear un buffer desde el archivo
      const arrayBuffer = await file.arrayBuffer();
      
      // Configurar el comando para subir el archivo
      const command = new PutObjectCommand({
        Bucket: 'apuntes',
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type
      });
      
      // Ejecutar el comando para subir el archivo
      await s3Client.send(command);
      
      // Construir y devolver la URL del documento
      return `https://rirdnwywjctumorueupm.supabase.co/storage/v1/object/public/apuntes/${fileName}`;
    } catch (error) {
      console.error('Error al subir archivo a Supabase:', error);
      throw new Error('Error al subir el archivo');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      let documentUrl = null;
      
      // Si hay un archivo seleccionado, subirlo a Supabase
      if (selectedFile && user?.id) {
        documentUrl = await uploadFileToSupabase(selectedFile, user.id);
      }
      
      // Crear objeto de datos para enviar al backend
      const apunteData = {
        ...formData,
        documento_url: documentUrl
      };
      
      // Enviar datos al backend
      const response = await axios.post(
        `${API_URL}/apuntes`, 
        apunteData,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/apuntes/${response.data.apunte.id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error("Error al crear apunte:", err);
      setError(err.response?.data?.message || err.message || 'Hubo un error al crear el apunte');
    } finally {
      setLoading(false);
    }
  };

  // Corregir el error de tipo para visibilidad
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Asegurar que el valor es uno de los tipos permitidos
    const value = e.target.value as 'publico' | 'privado';
    setFormData({ ...formData, visibilidad: value });
  };

  return (
    <MainLayout>
      <div className="create-apunte-container">
        <h1>Crear Apunte</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="formato">Formato</label>
            <input
              type="text"
              id="formato"
              value={formData.formato}
              onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="visibilidad">Visibilidad</label>
            <select
              id="visibilidad"
              value={formData.visibilidad}
              onChange={handleVisibilityChange} // Usar la función corregida
              required
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="documento">Documento</label>
            {/* Corregir la prop para que coincida con lo esperado */}
            <DocumentUploader 
              onFileSelected={(file) => setSelectedFile(file)} 
              allowedExtensions={['pdf', 'docx', 'md']} 
              maxSizeMB={10} 
            />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Apunte creado con éxito</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Apunte'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateApunte;
