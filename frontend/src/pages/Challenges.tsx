import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/Challenges.css';
import { useAuth } from '../contexts/AuthContext';

// Interfaz para los retos
interface Challenge {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activo' | 'completado' | 'cancelado';
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
  creador_id: string;
  nombre_creador?: string;
  num_participantes: number;
  participando?: boolean; // Nueva propiedad para saber si participa
  es_creador?: boolean; // Para identificar si el usuario creó este reto
}

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtroTitulo, setFiltroTitulo] = useState<string>('');
  const [filtroDificultad, setFiltroDificultad] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('activo');
  const [filtroVisibilidad, setFiltroVisibilidad] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<string>('explorar');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Importar estado de autenticación

  // Obtener parámetros de consulta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const dificultad = params.get('dificultad');
    const estado = params.get('estado');
    const visibilidad = params.get('visibilidad');
    
    if (tab) setActiveTab(tab);
    if (dificultad) setFiltroDificultad(dificultad);
    if (estado) setFiltroEstado(estado);
    
    // Asegurar que el parámetro visibilidad tenga efecto
    if (visibilidad) {
      console.log(`Estableciendo visibilidad a: ${visibilidad}`);
      setFiltroVisibilidad(visibilidad);
    }
  }, [location]);

// Cargar retos según la pestaña activa y visibilidad
useEffect(() => {
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      // Indicador visual para el usuario
      console.log(`Cambiando a tab ${activeTab} - Cargando datos...`);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      let endpoint = '/retos';
      console.log(`Tab activa: ${activeTab}`);
      
      if (activeTab === 'populares') {
        endpoint = '/retos/populares';
        console.log("Usando endpoint de retos populares");
      } else if (activeTab === 'mis-retos') {
        endpoint = '/retos/mis-retos';
        console.log("Usando endpoint de mis retos");
      } else {
        console.log("Usando endpoint de explorar retos");
      }
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      if (filtroEstado !== 'todos') {
        queryParams.append('estado', filtroEstado);
      }
      
      if (filtroVisibilidad !== 'todos') {
        queryParams.append('visibilidad', filtroVisibilidad);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      console.log(`Realizando petición a: ${API_URL}${endpoint}${queryString}`);
      
      // Para cualquier petición autenticada necesitamos incluir el token
      let config = {};
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        config = {
          headers: { Authorization: `Bearer ${token}` }
        };
      }
      
      const response = await axios.get(`${API_URL}${endpoint}${queryString}`, config);
      console.log('Respuesta recibida:', response.data);
      
      // Procesar la respuesta según el endpoint
      let challengesData;
      
      if (activeTab === 'populares' || activeTab === 'explorar') {
        // Ahora los datos ya vienen con la información de participación
        challengesData = response.data.retos || [];
        
        // Ya no necesitamos hacer la verificación adicional porque el backend ya incluye
        // la información de si el usuario está participando en cada reto
      } else if (activeTab === 'mis-retos') {
        challengesData = Array.isArray(response.data) ? response.data : 
                        response.data.retos || response.data.misRetos || [];
        
        // Para "mis-retos", todos tienen participación
        challengesData = challengesData.map((reto: Challenge) => ({
          ...reto,
          participando: true
        }));
      }
      
      console.log(`Tab: ${activeTab} - Se encontraron ${challengesData.length} retos`);
      setChallenges(challengesData);
      setError(null);
    } catch (err) {
      console.error(`Error al cargar retos para tab '${activeTab}':`, err);
      setError('No se pudieron cargar los retos');
      setChallenges([]); // Limpiar retos anteriores en caso de error
    } finally {
      setLoading(false);
    }
  };

  console.log(`Tab activo cambiado a: ${activeTab}, iniciando fetch de datos`);
  fetchChallenges();
}, [activeTab, filtroEstado, filtroVisibilidad, isAuthenticated]);

  // Función para calcular los días restantes
  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filtrar retos basado en los criterios
  const challengesFiltrados = challenges.filter(challenge => {
    const tituloCoincide = challenge.titulo.toLowerCase().includes(filtroTitulo.toLowerCase());
    
    if (filtroDificultad === 'todos') return tituloCoincide;
    return tituloCoincide && challenge.dificultad === filtroDificultad;
  });

  // Cambiar pestaña activa - Implementación simplificada
  const handleTabChange = (tab: string) => {
    console.log(`Intentando cambiar al tab: ${tab}`);
    
    // Actualizar primero el estado local para respuesta inmediata
    setActiveTab(tab);
    
    // Construir los parámetros de URL
    const params = new URLSearchParams();
    
    // Preservar parámetro de visibilidad si existe
    if (filtroVisibilidad !== 'todos') {
      params.set('visibilidad', filtroVisibilidad);
    }
    
    // Establecer el nuevo tab
    params.set('tab', tab);
    
    // Navegar con los nuevos parámetros
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
    
    console.log(`Tab cambiado a: ${tab}`);
    
    // Restablecer filtros al cambiar de tab
    setFiltroTitulo('');
    setFiltroDificultad('todos');
    setFiltroEstado('activo');
  };

  // Actualizar filtros
  const actualizarFiltros = (key: string, value: string) => {
    const params = new URLSearchParams(location.search);
    params.set(key, value);
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });

    // Actualizar estado local
    if (key === 'dificultad') setFiltroDificultad(value);
    if (key === 'estado') setFiltroEstado(value);
  };

  // Función para manejar el clic en "Unirse"
  const handleUnirseClick = async (challengeId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/retos/${challengeId}`);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.post( // No asignamos a 'response' ya que no lo usamos directamente
        `${API_URL}/retos/unirse`, 
        { reto_id: challengeId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      alert('¡Te has unido al reto exitosamente!');
      
      // Actualizar el estado local
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === challengeId 
            ? { 
                ...challenge, 
                participando: true,
                num_participantes: challenge.num_participantes + 1
              } 
            : challenge
        )
      );
      
    } catch (error: any) {
      console.error('Error al unirse al reto:', error);
      alert(error.response?.data?.message || 'Error al unirse al reto');
    }
  };
  
  // Nueva función para manejar el clic en "Abandonar"
  const handleAbandonarClick = async (challengeId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      if (!confirm('¿Estás seguro que deseas abandonar este reto?')) {
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.delete( // No asignamos a 'response' ya que no lo usamos directamente
        `${API_URL}/retos/abandonar`, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          data: { reto_id: challengeId }
        }
      );
      
      alert('Has abandonado el reto exitosamente');
      
      // En la pestaña mis retos, eliminar el reto de la lista
      if (activeTab === 'mis-retos') {
        setChallenges(prevChallenges => 
          prevChallenges.filter(challenge => challenge.id !== challengeId)
        );
      } else {
        // En otras pestañas, actualizar el estado local
        setChallenges(prevChallenges => 
          prevChallenges.map(challenge => 
            challenge.id === challengeId 
              ? { 
                  ...challenge, 
                  participando: false,
                  num_participantes: Math.max(0, challenge.num_participantes - 1)
                } 
              : challenge
          )
        );
      }
      
    } catch (error: any) {
      console.error('Error al abandonar el reto:', error);
      alert(error.response?.data?.message || 'Error al abandonar el reto');
    }
  };

  // Agregar función faltante para manejar click en "Crear nuevo reto"
  const handleCrearRetoClick = () => {
    if (isAuthenticated) {
      navigate('/crear-reto');
    } else {
      navigate('/login?redirect=/crear-reto');
    }
  };

  return (
    <MainLayout>
      <div className="challenges-page">
        <header className="page-header">
          <h1>Retos</h1>
          <p>Únete a retos para mejorar tus habilidades o crea los tuyos propios.</p>
        </header>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              type="button"
              className={`tab ${activeTab === 'explorar' ? 'active' : ''}`}
              onClick={() => handleTabChange('explorar')}
              aria-selected={activeTab === 'explorar'}
            >
              Explorar
            </button>
            <button 
              type="button"
              className={`tab ${activeTab === 'populares' ? 'active' : ''}`}
              onClick={() => handleTabChange('populares')}
              aria-selected={activeTab === 'populares'}
            >
              Populares
            </button>
            <button 
              type="button"
              className={`tab ${activeTab === 'mis-retos' ? 'active' : ''}`}
              onClick={() => handleTabChange('mis-retos')}
              aria-selected={activeTab === 'mis-retos'}
            >
              Mis Retos
            </button>
          </div>
        </div>

        <section className="filtros-container">
          <div className="filtro-grupo">
            <label htmlFor="busqueda">Buscar por título:</label>
            <input
              id="busqueda"
              type="text"
              placeholder="Buscar retos..."
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              className="filtro-input"
            />
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="dificultad">Dificultad:</label>
            <select
              id="dificultad"
              value={filtroDificultad}
              onChange={(e) => actualizarFiltros('dificultad', e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              value={filtroEstado}
              onChange={(e) => actualizarFiltros('estado', e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </section>

        <section className="challenges-grid">
          {loading ? (
            <div className="loading-message">Cargando retos...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : challengesFiltrados.length === 0 ? (
            <div className="empty-message">
              <p>No se encontraron retos que coincidan con los filtros.</p>
              <button onClick={() => {
                setFiltroTitulo('');
                setFiltroDificultad('todos');
                setFiltroEstado('activo');
              }} className="btn btn-primary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            challengesFiltrados.map(challenge => (
              <div key={challenge.id} className="challenge-card">
                <div className={`challenge-status ${challenge.estado}`}>
                  {challenge.estado === 'activo' ? 'En curso' : challenge.estado}
                </div>
                <h3>{challenge.titulo}</h3>
                <div className="challenge-meta">
                  <span className={`difficulty ${challenge.dificultad}`}>
                    {challenge.dificultad === 'principiante' ? 'Principiante' : 
                     challenge.dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                  </span>
                  <span className="participants">{challenge.num_participantes || 0} participantes</span>
                  <span className="time-left">{calculateDaysLeft(challenge.fecha_fin)} días restantes</span>
                </div>
                <p className="descripcion">{challenge.descripcion || "Sin descripción"}</p>
                {challenge.nombre_creador && (
                  <div className="creator">Creado por: {challenge.nombre_creador}</div>
                )}
                <div className="challenge-actions">
                  <Link to={`/retos/${challenge.id}`} className="btn btn-outline">Ver detalles</Link>
                  
                  {isAuthenticated && !challenge.es_creador && (
                    challenge.participando ? (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleAbandonarClick(challenge.id)}
                      >
                        Abandonar
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleUnirseClick(challenge.id)}
                      >
                        Unirse
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </section>
        
        <div className="challenges-actions">
          {/* Solo mostrar botón de crear si está autenticado */}
          {isAuthenticated ? (
            <button onClick={handleCrearRetoClick} className="btn btn-primary">
              Crear nuevo reto
            </button>
          ) : (
            <Link to="/login?redirect=/crear-reto" className="btn btn-primary">
              Inicia sesión para crear retos
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Challenges;
