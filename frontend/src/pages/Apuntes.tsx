import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import axios from 'axios';
import '../assets/styles/pages/Apuntes.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Apunte {
  id: string;
  titulo: string;
  formato: string;
  contenido?: string;
  calificacion_promedio: number;
  nombre_creador?: string;
  fecha_subida: string;
  titulo_reto?: string;
  titulo_plan?: string;
}

const Apuntes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apuntes, setApuntes] = useState<Apunte[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Valores de los filtros
  const ordenActual = searchParams.get('ordenar') || 'recientes';
  const formatoActual = searchParams.get('formato') || 'todos';
  const calificacionMinima = searchParams.get('calificacion_min') || '0';
  
  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Configuración de opciones de filtrado
  const opcionesOrden = [
    { valor: 'recientes', texto: 'Más recientes' },
    { valor: 'antiguos', texto: 'Más antiguos' },
    { valor: 'calificacion', texto: 'Mejor calificados' },
    { valor: 'alfabetico', texto: 'Alfabético' }
  ];
  
  const opcionesFormato = [
    { valor: 'todos', texto: 'Todos los formatos' },
    { valor: 'pdf', texto: 'PDF' },
    { valor: 'md', texto: 'Markdown' },
    { valor: 'docx', texto: 'Word (DOCX)' }
  ];
  
  const opcionesCalificacion = [
    { valor: '0', texto: 'Todas las calificaciones' },
    { valor: '2', texto: 'Al menos 2 estrellas' },
    { valor: '3', texto: 'Al menos 3 estrellas' },
    { valor: '4', texto: 'Al menos 4 estrellas' }
  ];
  
  // Función para actualizar filtros
  const actualizarFiltro = (tipo: string, valor: string) => {
    const nuevoParams = new URLSearchParams(searchParams.toString());
    nuevoParams.set(tipo, valor);
    setSearchParams(nuevoParams);
  };
  
  // Cargar apuntes según filtros
  useEffect(() => {
    const fetchApuntes = async () => {
      try {
        setLoading(true);
        console.log(`Solicitando apuntes con filtros: ${searchParams.toString()}`);
        
        const queryParams = {
          ordenar: ordenActual,
          formato: formatoActual !== 'todos' ? formatoActual : '',
          calificacion_min: calificacionMinima !== '0' ? calificacionMinima : ''
        };
        
        const response = await axios.get(`${API_URL}/apuntes`, { params: queryParams });
        console.log('Respuesta de apuntes:', response.data);
        
        if (response.data && Array.isArray(response.data.apuntes)) {
          setApuntes(response.data.apuntes);
          setError(null);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err: any) {
        console.error('Error al obtener apuntes:', err);
        setError(err.response?.data?.message || 'No se pudieron cargar los apuntes');
        setApuntes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApuntes();
  }, [API_URL, ordenActual, formatoActual, calificacionMinima]);
  
  // Función para formatear la fecha
  const formatearFecha = (fechaStr: string): string => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString();
    } catch (e) {
      console.warn("Fecha inválida:", fechaStr);
      return "Fecha no disponible";
    }
  };
  
  // Función para manejar el clic en "Subir Apunte"
  const handleSubirApunteClick = () => {
    if (isAuthenticated) {
      navigate('/apuntes/crear');
    } else {
      // Redirigir al login con parámetro de redirección
      navigate('/login?redirect=/apuntes/crear');
    }
  };

  return (
    <MainLayout>
      <div className="apuntes-page">
        <header className="apuntes-header">
          <h1>Biblioteca de Apuntes</h1>
          <p>Explora y comparte apuntes con la comunidad</p>
        </header>
        
        <section className="filtros-section">
          <div className="filtros-container">
            <div className="filtro-grupo">
              <label>Ordenar por:</label>
              <select 
                value={ordenActual} 
                onChange={(e) => actualizarFiltro('ordenar', e.target.value)}
              >
                {opcionesOrden.map(opcion => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label>Formato:</label>
              <select 
                value={formatoActual} 
                onChange={(e) => actualizarFiltro('formato', e.target.value)}
              >
                {opcionesFormato.map(opcion => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label>Calificación:</label>
              <select 
                value={calificacionMinima} 
                onChange={(e) => actualizarFiltro('calificacion_min', e.target.value)}
              >
                {opcionesCalificacion.map(opcion => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleSubirApunteClick} 
              className="btn btn-primary"
            >
              Subir Apunte
            </button>
          </div>
        </section>
        
        <section className="apuntes-section">
          {loading ? (
            <div className="loading-container">
              <p className="loading-message">Cargando apuntes...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          ) : apuntes.length === 0 ? (
            <div className="empty-container">
              <p className="empty-message">No se encontraron apuntes con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="apuntes-grid">
              {apuntes.map(apunte => (
                <div key={apunte.id} className="apunte-card">
                  <div className="apunte-header">
                    <span className={`formato ${apunte.formato}`}>
                      {apunte.formato?.toUpperCase() || 'OTRO'}
                    </span>
                    <h3 className="apunte-titulo">{apunte.titulo}</h3>
                  </div>
                  
                  <div className="apunte-meta">
                    {apunte.nombre_creador && (
                      <div className="meta-item">
                        <span className="meta-label">Autor:</span>
                        <span className="meta-value">{apunte.nombre_creador}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">Subido:</span>
                      <span className="meta-value">{formatearFecha(apunte.fecha_subida)}</span>
                    </div>
                    <div className="meta-item calificacion">
                      <span className="meta-label">Calificación:</span>
                      <span className="meta-value stars">
                        {Array(5).fill(null).map((_, index) => (
                          <span key={index} 
                            className={index < Math.round(apunte.calificacion_promedio || 0) ? "star filled" : "star"}
                          >★</span>
                        ))}
                        <span className="rating-value">({apunte.calificacion_promedio?.toFixed(1) || '0.0'})</span>
                      </span>
                    </div>
                    {apunte.titulo_reto && (
                      <div className="meta-item">
                        <span className="meta-label">Reto:</span>
                        <span className="meta-value">{apunte.titulo_reto}</span>
                      </div>
                    )}
                    {apunte.titulo_plan && (
                      <div className="meta-item">
                        <span className="meta-label">Plan:</span>
                        <span className="meta-value">{apunte.titulo_plan}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="apunte-actions">
                    <Link to={`/apuntes/${apunte.id}`} className="btn btn-outline">
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Apuntes;
