import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/PlanesEstudio.css';
import { useAuth } from '../contexts/AuthContext';

// Interfaz para los planes de estudio
interface PlanEstudio {
  id: string;
  titulo: string;
  descripcion: string;
  duracion_dias: number;
  fecha_inicio: string;
  usuario_id: string;
  nombre_creador?: string;
  tareas_count?: number;
}

const PlanesEstudio: React.FC = () => {
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtroTitulo, setFiltroTitulo] = useState<string>('');
  const [filtroDuracion, setFiltroDuracion] = useState<string>('todos');
  const [ordenamiento, setOrdenamiento] = useState<string>('recientes');
  const [filtroVisibilidad, setFiltroVisibilidad] = useState<string>('todos');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Importar estado de autenticación

  // Obtener parámetros de consulta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orden = params.get('ordenar');
    const destacados = params.get('destacados');
    const visibilidad = params.get('visibilidad');
    
    if (orden) setOrdenamiento(orden);
    if (destacados === 'true') {
      // Lógica para mostrar planes destacados si es necesario
    }
    if (visibilidad) {
      console.log(`Estableciendo visibilidad a: ${visibilidad}`);
      setFiltroVisibilidad(visibilidad);
    }
  }, [location]);

  // Cargar planes de estudio
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Construir los parámetros de consulta para los filtros
        const queryParams = new URLSearchParams();
        queryParams.append('ordenar', ordenamiento);
        
        if (filtroVisibilidad !== 'todos') {
          queryParams.append('visibilidad', filtroVisibilidad);
        }
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        const response = await axios.get(`${API_URL}/planes${queryString}`);
        setPlanes(response.data.planes || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching study plans:', err);
        setError('No se pudieron cargar los planes de estudio');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, [ordenamiento, filtroVisibilidad]);

  // Filtrar planes basado en los criterios
  const planesFiltrados = planes.filter(plan => {
    const tituloCoincide = plan.titulo.toLowerCase().includes(filtroTitulo.toLowerCase());
    
    if (filtroDuracion === 'todos') return tituloCoincide;
    else if (filtroDuracion === 'corto' && plan.duracion_dias <= 30) return tituloCoincide;
    else if (filtroDuracion === 'medio' && plan.duracion_dias > 30 && plan.duracion_dias <= 90) return tituloCoincide;
    else if (filtroDuracion === 'largo' && plan.duracion_dias > 90) return tituloCoincide;
    
    return false;
  });

  // Actualizar URL con filtros
  const actualizarFiltros = (key: string, value: string) => {
    const params = new URLSearchParams(location.search);
    params.set(key, value);
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });

    // Actualizar estado local
    if (key === 'ordenar') setOrdenamiento(value);
    if (key === 'duracion') setFiltroDuracion(value);
  };

  // Función para manejar el clic en "Unirse"
  const handleUnirsePlanClick = (planId: string) => {
    if (isAuthenticated) {
      // Lógica para unirse al plan
      console.log(`Unirse al plan ${planId}`);
    } else {
      // Redirigir al login con parámetro de redirección
      navigate(`/login?redirect=/planes/${planId}`);
    }
  };

  // Función para manejar el clic en "Crear nuevo plan"
  const handleCrearPlanClick = () => {
    if (isAuthenticated) {
      navigate('/planes/crear');
    } else {
      navigate('/login?redirect=/planes/crear');
    }
  };

  return (
    <MainLayout>
      <div className="planes-estudio-page">
        <header className="page-header">
          <h1>Planes de Estudio</h1>
          <p>Explora y únete a planes de estudio creados por la comunidad o crea los tuyos propios.</p>
        </header>

        <section className="filtros-container">
          <div className="filtro-grupo">
            <label htmlFor="busqueda">Buscar por título:</label>
            <input
              id="busqueda"
              type="text"
              placeholder="Buscar planes..."
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              className="filtro-input"
            />
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="duracion">Duración:</label>
            <select
              id="duracion"
              value={filtroDuracion}
              onChange={(e) => actualizarFiltros('duracion', e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              <option value="corto">Corto (≤ 30 días)</option>
              <option value="medio">Medio (31-90 días)</option>
              <option value="largo">Largo (&gt; 90 días)</option>
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="ordenar">Ordenar por:</label>
            <select
              id="ordenar"
              value={ordenamiento}
              onChange={(e) => actualizarFiltros('ordenar', e.target.value)}
              className="filtro-select"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="duracion_asc">Duración (menor a mayor)</option>
              <option value="duracion_desc">Duración (mayor a menor)</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>
        </section>

        <section className="planes-grid">
          {loading ? (
            <div className="loading-message">Cargando planes de estudio...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : planesFiltrados.length === 0 ? (
            <div className="empty-message">
              <p>No se encontraron planes de estudio que coincidan con los filtros.</p>
              <button onClick={() => {
                setFiltroTitulo('');
                setFiltroDuracion('todos');
                setOrdenamiento('recientes');
              }} className="btn btn-primary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            planesFiltrados.map(plan => (
              <div key={plan.id} className="plan-card">
                <h3>{plan.titulo}</h3>
                <div className="plan-meta">
                  <span className="duracion">{plan.duracion_dias} días</span>
                  {plan.tareas_count && <span className="tareas">{plan.tareas_count} tareas</span>}
                  {plan.nombre_creador && <span className="creador">Por: {plan.nombre_creador}</span>}
                </div>
                <p className="descripcion">{plan.descripcion || "Sin descripción"}</p>
                <div className="plan-actions">
                  <a href={`/planes/${plan.id}`} className="btn btn-outline">Ver detalles</a>
                  {/* Solo mostrar botón de unirse si está autenticado */}
                  {isAuthenticated && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleUnirsePlanClick(plan.id)}
                    >
                      Unirse
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
        
        <div className="planes-actions">
          {/* Solo mostrar botón de crear si está autenticado */}
          {isAuthenticated ? (
            <button onClick={handleCrearPlanClick} className="btn btn-primary">
              Crear nuevo plan
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login?redirect=/planes/crear')}
              className="btn btn-primary"
            >
              Inicia sesión para crear planes
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PlanesEstudio;
