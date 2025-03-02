import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import '../assets/styles/pages/ApunteDetail.css';
import PDFViewer from '../components/common/PDFViewer';

// Corregir la interfaz para ser compatible con useParams de React Router v6
interface Params {
  [key: string]: string | undefined;
  id: string;
}

// Modificar la interfaz para alinearse mejor con la base de datos
interface Apunte {
  id: string;
  titulo: string;
  contenido?: string; // Marcar como opcional porque puede ser null
  formato: 'pdf' | 'md' | 'docx'; // Restringir a los formatos permitidos
  fecha_subida: string;
  calificacion_promedio: number;
  usuario_id: string;
  reto_id: string | null;
  plan_estudio_id: string | null;
  nombre_creador?: string; // Opcional porque viene de JOIN
  titulo_reto?: string | null; // Opcional porque viene de JOIN
  titulo_plan?: string | null; // Opcional porque viene de JOIN
  documento_url: string | null;
  visibilidad: 'publico' | 'privado'; // Añadir este campo
}

const ApunteDetail: React.FC = () => {
  // Usar el tipo correcto para useParams
  const { id } = useParams<Params>();
  const { isAuthenticated, user } = useAuth();
  const [apunte, setApunte] = useState<Apunte | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isRating, setIsRating] = useState<boolean>(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchApunte = async () => {
      // Verificar que id existe antes de hacer la petición
      if (!id) {
        setError('ID de apunte no válido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/apuntes/${id}`);
        
        // Mejorar el logging para debug
        console.log('Respuesta completa del API:', response);
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && response.data.apunte) {
          setApunte(response.data.apunte);
          setError(null);
        } else {
          console.error('Estructura de respuesta inesperada:', response.data);
          setError('La respuesta del servidor no tiene el formato esperado');
        }
      } catch (err: any) {
        console.error("Error detallado al cargar apunte:", err);
        setError(err.response?.data?.message || 'No se pudo cargar el apunte');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApunte();
    }
  }, [id, API_URL]);

  // Función para manejar la calificación del apunte
  const handleRate = async (rating: number) => {
    if (!isAuthenticated) return;
    
    setUserRating(rating);
    setIsRating(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      const response = await axios.post(`${API_URL}/apuntes/${id}/calificar`, 
        { calificacion: rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (apunte) {
        setApunte({
          ...apunte,
          calificacion_promedio: response.data.calificacionPromedio
        });
      }
      
    } catch (err: any) {
      console.error("Error rating apunte:", err);
      alert(err.response?.data?.message || 'Error al calificar el apunte');
    } finally {
      setIsRating(false);
    }
  };

  // Generar estrellas para calificación
  const renderRatingStars = (editable = false) => {
    const stars = [];
    const rating = apunte ? Math.round(apunte.calificacion_promedio) : 0;
    
    for (let i = 1; i <= 5; i++) {
      if (editable) {
        stars.push(
          <span 
            key={i} 
            className={`estrella ${i <= userRating ? 'llena' : 'vacia'} clickable`}
            onClick={() => handleRate(i)}
            onMouseEnter={() => setUserRating(i)}
            onMouseLeave={() => setUserRating(0)}
          >
            {i <= userRating ? '★' : '☆'}
          </span>
        );
      } else {
        stars.push(
          <span key={i} className={`estrella ${i <= rating ? 'llena' : 'vacia'}`}>
            {i <= rating ? '★' : '☆'}
          </span>
        );
      }
    }
    
    return stars;
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Mejorar la función para renderizar contenido para manejar mejor los diferentes casos
  const renderContent = () => {
    // Si no hay apunte, no renderizar nada
    if (!apunte) return null;
    
    // Verificar si hay una URL de documento
    const hasDocumentUrl = Boolean(apunte.documento_url && apunte.documento_url.trim());
    
    // Verificar si hay contenido textual
    const hasContent = Boolean(apunte.contenido && apunte.contenido.trim());
    
    // Si no hay contenido ni documento, mostrar mensaje
    if (!hasContent && !hasDocumentUrl) {
      return <p className="empty-message">No hay contenido disponible para este apunte.</p>;
    }
    
    // Preparar URL del documento limpia (sin tokens caducados)
    let cleanDocumentUrl = apunte.documento_url || '';
    
    // Si la URL contiene un token, intentar obtener solo la parte base de la URL
    if (hasDocumentUrl && cleanDocumentUrl.includes('token=')) {
      try {
        // Extraer la URL base sin el token de query
        const urlParts = cleanDocumentUrl.split('?');
        if (urlParts.length > 0) {
          // Usar solo la parte de la URL antes del ?
          cleanDocumentUrl = urlParts[0];
          console.log('URL sin token:', cleanDocumentUrl);
        }
      } catch (e) {
        console.warn('No se pudo limpiar la URL del documento:', e);
      }
    }

    // Mostrar contenido según formato
    switch (apunte.formato) {
      case 'md':
        return (
          <div className="contenido-completo">
            {hasContent && <MarkdownRenderer content={apunte.contenido || ''} />}
            
            {hasDocumentUrl && (
              <div className="documento-adicional">
                <h3>Documento adicional</h3>
                <a 
                  href={cleanDocumentUrl} 
                  className="btn btn-outline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Ver documento completo
                </a>
                <a 
                  href={cleanDocumentUrl} 
                  download={`${apunte.titulo}.md`}
                  className="btn btn-secondary"
                >
                  Descargar
                </a>
              </div>
            )}
          </div>
        );
        
      case 'pdf':
        return (
          <div className="pdf-container">
            {hasDocumentUrl ? (
  <>
    <div className="pdf-viewer">
      <PDFViewer 
        url={cleanDocumentUrl}
        title={apunte.titulo}
        fallbackMessage="El visor de PDF no pudo cargar el documento. Por favor, descárgalo para verlo."
      />
    </div>
    <div className="pdf-actions">
      <a 
        href={cleanDocumentUrl} 
        className="btn btn-outline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        Abrir en nueva pestaña
      </a>
      <a 
        href={cleanDocumentUrl} 
        download={`${apunte.titulo}.pdf`}
        className="btn btn-secondary"
      >
        Descargar PDF
      </a>
    </div>
  </>
) : (
              <>
                {hasContent ? (
                  <div className="contenido-texto">
                    <h3>Descripción del PDF</h3>
                    <div className="contenido-wrapper">{apunte.contenido}</div>
                  </div>
                ) : (
                  <p className="error-message">El enlace al documento PDF no está disponible.</p>
                )}
              </>
            )}
          </div>
        );
        
      case 'docx':
        return (
          <div className="docx-container">
            {hasDocumentUrl ? (
              <>
                <div className="docx-preview">
                  <div className="docx-icon">📄</div>
                  <p>Documento DOCX: {apunte.titulo}</p>
                </div>
                <div className="docx-actions">
                  <a 
                    href={cleanDocumentUrl} 
                    download={`${apunte.titulo}.docx`}
                    className="btn btn-primary"
                  >
                    Descargar DOCX
                  </a>
                </div>
                {hasContent && (
                  <div className="docx-descripcion">
                    <h3>Descripción del documento</h3>
                    <p>{apunte.contenido}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {hasContent ? (
                  <div className="contenido-texto">
                    <h3>Contenido del documento</h3>
                    <div className="contenido-wrapper">{apunte.contenido}</div>
                  </div>
                ) : (
                  <p className="error-message">El enlace al documento DOCX no está disponible.</p>
                )}
              </>
            )}
          </div>
        );
        
      default:
        return (
          <div className="contenido-texto">
            {hasContent ? (
              <pre className="contenido-pre">{apunte.contenido}</pre>
            ) : (
              <p className="empty-message">Este apunte no tiene contenido textual.</p>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <h2>Cargando apunte...</h2>
          <div className="loader"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Error al cargar el apunte</h2>
          <p>{error}</p>
          <Link to="/apuntes" className="btn btn-primary">Volver a Apuntes</Link>
        </div>
      </MainLayout>
    );
  }

  if (!apunte) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Apunte no encontrado</h2>
          <p>El apunte solicitado no existe o ha sido eliminado.</p>
          <Link to="/apuntes" className="btn btn-primary">Volver a Apuntes</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="apunte-detail-page">
        <header className="apunte-header">
          <h1>{apunte.titulo}</h1>
          <div className="formato-icon">
            {apunte.formato === 'pdf' && '📄'}
            {apunte.formato === 'md' && '📝'}
            {apunte.formato === 'docx' && '📋'}
          </div>
          <div className="apunte-meta">
            <span className="creator">Creado por: {apunte.nombre_creador}</span>
            <span className="formato">Formato: {apunte.formato.toUpperCase()}</span>
            <span className="fecha">Subido el: {formatDate(apunte.fecha_subida)}</span>
          </div>
        </header>

        <div className="apunte-calificacion">
          <h2>Valoraciones</h2>
          <div className="calificacion-container">
            <div className="estrellas">
              {renderRatingStars()}
            </div>
            <span className="promedio">
              ({apunte.calificacion_promedio.toFixed(1)})
            </span>
            
            {isAuthenticated ? (
              <div className="user-rating">
                <p>Tu valoración:</p>
                <div className="estrellas">
                  {renderRatingStars(true)}
                </div>
                {isRating && <span className="calificando">Enviando...</span>}
              </div>
            ) : (
              <span className="login-msg">Inicia sesión para valorar</span>
            )}
          </div>
        </div>

        {(apunte.titulo_reto || apunte.titulo_plan) && (
          <div className="apunte-relacion">
            <h2>Relacionado con</h2>
            <div className="relacion-container">
              {apunte.titulo_reto && (
                <Link to={`/retos/${apunte.reto_id}`} className="relacion reto">
                  Reto: {apunte.titulo_reto}
                </Link>
              )}
              {apunte.titulo_plan && (
                <Link to={`/planes/${apunte.plan_estudio_id}`} className="relacion plan">
                  Plan de estudio: {apunte.titulo_plan}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="apunte-contenido">
          <h2>Contenido</h2>
          <div className="contenido-vista">
            {renderContent()}
          </div>
        </div>

        <div className="apunte-actions">
          <Link to="/apuntes" className="btn btn-outline">Volver a Apuntes</Link>
          {isAuthenticated && user?.id === apunte.usuario_id && (
            <Link to={`/apuntes/editar/${apunte.id}`} className="btn btn-primary">
              Editar Apunte
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ApunteDetail;
