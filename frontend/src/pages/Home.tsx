import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import axios from 'axios';
import '../assets/styles/pages/Home.css';
import { useAuth } from '../contexts/AuthContext'; // Importar el hook de autenticación

// Interfaces para los tipos de datos
interface PopularChallenge {
  id: string;
  titulo: string;
  dificultad: string;
  num_participantes: number;
  fecha_fin: string;
  descripcion?: string;
  nombre_creador?: string;
  participando?: boolean; // Nueva propiedad para saber si el usuario está participando
}

interface FeaturedStudyPlan {
  id: string;
  titulo: string;
  duracion_dias: number;
  descripcion?: string;
  nombre_creador?: string;
  tareas_count: number;
}

interface FeaturedNote {
  id: string;
  titulo: string;
  formato: string;
  calificacion_promedio: number;
  nombre_creador?: string;
  fecha_subida: string;
}

// Componentes auxiliares
const FeatureCard: React.FC<{
  icon: React.ReactNode,
  title: string,
  description: string,
  linkTo: string,
  onTitleClick: () => void
}> = ({ icon, title, description, linkTo, onTitleClick }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 onClick={onTitleClick} className="feature-title">{title}</h3>
    <p>{description}</p>
    <Link to={linkTo} className="feature-link">Saber más</Link>
  </div>
);

// Modificar el componente ChallengePreview para incluir el botón Unirse
const ChallengePreview: React.FC<{
  id: string,
  title: string,
  difficulty: string,
  participants: number,
  daysLeft: number,
  creator?: string,
  isAuthenticated: boolean, // Nueva prop para verificar autenticación
  isParticipating?: boolean, // Nueva prop para saber si el usuario está participando
  onJoin: (id: string) => void, // Nueva prop para manejar la acción de unirse
  onLeave: (id: string) => void // Nueva función para manejar abandono
}> = ({ id, title, difficulty, participants, daysLeft, creator, isAuthenticated, isParticipating, onJoin, onLeave }) => (
  <div className="challenge-card">
    <h3>{title}</h3>
    <div className="challenge-meta">
      <span className={`difficulty ${difficulty.toLowerCase()}`}>
        {difficulty}
      </span>
      <span className="participants">{participants} participantes</span>
      <span className="time-left">{daysLeft} días restantes</span>
      {creator && <span className="creator">Por: {creator}</span>}
    </div>
    <div className="challenge-actions">
      <Link to={`/retos/${id}`} className="btn btn-outline">Ver detalles</Link>
      {isAuthenticated && (
        isParticipating ? (
          <button 
            onClick={() => onLeave(id)} 
            className="btn btn-danger"
          >
            Abandonar
          </button>
        ) : (
          <button 
            onClick={() => onJoin(id)} 
            className="btn btn-secondary"
          >
            Unirse
          </button>
        )
      )}
    </div>
  </div>
);

// Modificar el componente StudyPlanPreview para incluir el botón Unirse
const StudyPlanPreview: React.FC<{
  id: string,
  title: string,
  duration: string,
  tasksCount: number,
  creator?: string,
  isAuthenticated: boolean, // Nueva prop para verificar autenticación
  onJoin: (id: string) => void // Nueva prop para manejar la acción de unirse
}> = ({ id, title, duration, tasksCount, creator, isAuthenticated, onJoin }) => (
  <div className="study-plan-card">
    <h3>{title}</h3>
    <div className="plan-meta">
      <span className="duration">{duration}</span>
      <span className="tasks-count">{tasksCount}</span>
      {creator && <span className="creator">Por: {creator}</span>}
    </div>
    <div className="plan-actions">
      <Link to={`/planes/${id}`} className="btn btn-outline">Ver plan</Link>
      {isAuthenticated && (
        <button 
          onClick={() => onJoin(id)} 
          className="btn btn-secondary"
        >
          Unirse
        </button>
      )}
    </div>
  </div>
);

// Componente mejorado para manejar valores potencialmente problemáticos
const NotePreview: React.FC<{
  id: string,
  title: string,
  format: string,
  rating: number | string,  // Puede venir como number o string
  creator?: string,
  date: string
}> = ({ id, title, format, rating, creator, date }) => {
  // Convertir rating a número si viene como string
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  // Depuración: Mostrar el ID en consola
  console.log(`Renderizando apunte con ID: ${id}`);
  
  // Manejar fechas inválidas
  const formattedDate = () => {
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      console.warn("Fecha inválida:", date);
      return "Fecha no disponible";
    }
  };

  // Asegurar que el id no sea vacío
  const isValidId = (id: string) => {
    if (!id) return false;
    // Si usas UUID v4, podrías usar una expresión regular para validar
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // return uuidRegex.test(id);
    
    // Para verificación simple
    return id.length > 0;
  };

  const validId = isValidId(id);
  const apunteUrl = validId ? `/apuntes/${encodeURIComponent(id)}` : '/apuntes';

  return (
    <div className="note-card">
      {/* Añadir indicador visual para depuración */}
      {!validId && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'red',
          color: 'white',
          padding: '2px 5px',
          fontSize: '10px'
        }}>
          ID inválido
        </div>
      )}
      <h3>{title || "Sin título"}</h3>
      <div className="note-meta">
        <span className={`format ${(format || 'otro').toLowerCase()}`}>
          {(format || 'OTRO').toUpperCase()}
        </span>
        <span className="rating">
          {Array(5).fill(null).map((_, index) => (
            <span key={index} className={index < Math.round(numericRating || 0) ? "star filled" : "star"}>
              ★
            </span>
          ))}
          <span className="rating-value">({numericRating?.toFixed(1) || '0.0'})</span>
        </span>
        {creator && <span className="creator">Por: {creator}</span>}
      </div>
      <span className="date">Subido el {formattedDate()}</span>
      <Link 
        to={apunteUrl} 
        className="btn btn-outline"
        onClick={(e) => {
          // Mejorar el logging
          console.log(`Apunte clickeado:`, { id, validId, title });
          if (!validId) {
            e.preventDefault(); 
            console.error(`Error: ID "${id}" no válido`);
            alert(`Este apunte tiene un ID no válido: "${id}"`);
          } else {
            console.log(`Navegando a: ${apunteUrl} (ID: ${id})`);
          }
        }}
      >
        Ver apunte {validId ? '' : '(ID inválido)'}
      </Link>
    </div>
  );
};

// Iconos simulados
const FaTrophy = () => <span>🏆</span>;
const FaClipboardList = () => <span>📋</span>;
const FaBook = () => <span>📚</span>;
const FaUsers = () => <span>👥</span>;

const Home: React.FC = () => {
  const [popularChallenges, setPopularChallenges] = useState<PopularChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [errorChallenges, setErrorChallenges] = useState<string | null>(null);
  
  const [featuredPlans, setFeaturedPlans] = useState<FeaturedStudyPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  
  const [featuredNotes, setFeaturedNotes] = useState<FeaturedNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState<boolean>(true);
  const [errorNotes, setErrorNotes] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Obtener estado de autenticación

  // Función para calcular días restantes
  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Efectos para cargar datos
  useEffect(() => {
    const fetchPopularChallenges = async () => {
      try {
        setLoadingChallenges(true);
        // Añadir configuración para autenticación si el usuario está autenticado
        let config = {};
        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          config = {
            headers: { Authorization: `Bearer ${token}` }
          };
        }
        
        // Realizar la solicitud con la configuración adecuada
        const response = await axios.get(`${API_URL}/retos/populares?limite=3`, config);
        
        console.log('Respuesta de retos populares:', response.data);
        
        // Verificar que la respuesta contiene la propiedad retos
        if (response.data && Array.isArray(response.data.retos)) {
          setPopularChallenges(response.data.retos);
        } else {
          throw new Error('Formato de respuesta inesperado: no se encontraron retos');
        }
        
        setErrorChallenges(null);
      } catch (err) {
        console.error('Error fetching popular challenges:', err);
        setErrorChallenges('No se pudieron cargar los retos populares');
        setPopularChallenges([]); // Inicializar con array vacío en caso de error
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchPopularChallenges();
  }, [API_URL, isAuthenticated]);
  
  useEffect(() => {
    const fetchFeaturedPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await axios.get(`${API_URL}/planes/destacados?limite=3`);
        setFeaturedPlans(response.data.planes || []);
        setErrorPlans(null);
      } catch (err) {
        console.error('Error fetching featured plans:', err);
        setErrorPlans('No se pudieron cargar los planes destacados');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchFeaturedPlans();
  }, [API_URL]);
  
  // Cargar apuntes destacados con mejor manejo de errores
  useEffect(() => {
    const fetchFeaturedNotes = async () => {
      try {
        setLoadingNotes(true);
        const response = await axios.get(`${API_URL}/apuntes/destacados?limite=3`);
        console.log('Respuesta completa de apuntes destacados:', response);
        
        // Verificar que la respuesta tiene la estructura esperada
        if (response.data && Array.isArray(response.data.apuntes)) {
          const notesWithValidation = response.data.apuntes.map((note: any) => {
            // Validar explícitamente cada campo
            if (!note.id) {
              console.warn('Apunte sin ID encontrado:', note);
            }
            return {
              id: note.id || '',
              titulo: note.titulo || 'Sin título',
              formato: note.formato || 'otro',
              calificacion_promedio: parseFloat(note.calificacion_promedio) || 0,
              nombre_creador: note.nombre_creador || 'Anónimo',
              fecha_subida: note.fecha_subida || new Date().toISOString()
            };
          });
          
          setFeaturedNotes(notesWithValidation);
          setErrorNotes(null);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error fetching featured notes:', err);
        setErrorNotes('No se pudieron cargar los apuntes destacados');
        // En caso de error, inicializar con array vacío
        setFeaturedNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchFeaturedNotes();
  }, [API_URL]);

  // Funciones de navegación
  const navigateToRetos = () => navigate('/retos?visibilidad=publico');
  const navigateToPlanes = () => navigate('/planes?visibilidad=publico');
  const navigateToApuntes = () => navigate('/apuntes?formato=todos');
  const navigateToSocial = () => navigate('/gamificacion');

  // Función para unirse a un reto
  const handleJoinChallenge = async (retoId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/retos/${retoId}`);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      // Mostrar feedback visual
      console.log(`Intentando unirse al reto: ${retoId}`);
      
      const response = await axios.post(
        `${API_URL}/retos/unirse`, 
        { reto_id: retoId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Respuesta:', response.data);
      
      // Mostrar mensaje de éxito al usuario
      alert('¡Te has unido al reto exitosamente!');
      
      // Opcional: actualizar el número de participantes localmente
      setPopularChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === retoId 
            ? { ...challenge, num_participantes: challenge.num_participantes + 1, participando: true } 
            : challenge
        )
      );
      
    } catch (error: any) {
      console.error('Error al unirse al reto:', error);
      alert(error.response?.data?.message || 'Error al unirse al reto');
    }
  };

  // Nueva función para abandonar un reto
  const handleLeaveChallenge = async (retoId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Mostrar confirmación antes de abandonar
      if (!confirm('¿Estás seguro que deseas abandonar este reto?')) {
        return;
      }
      
      // Mostrar feedback visual
      console.log(`Intentando abandonar el reto: ${retoId}`);
      
      const response = await axios.delete(
        `${API_URL}/retos/abandonar`, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          data: { reto_id: retoId }
        }
      );
      
      console.log('Respuesta:', response.data);
      
      // Mostrar mensaje de éxito al usuario
      alert('Has abandonado el reto exitosamente');
      
      // Actualizar el estado local
      setPopularChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === retoId 
            ? { 
                ...challenge, 
                participando: false,
                num_participantes: Math.max(0, challenge.num_participantes - 1)
              } 
            : challenge
        )
      );
      
    } catch (error: any) {
      console.error('Error al abandonar el reto:', error);
      alert(error.response?.data?.message || 'Error al abandonar el reto');
    }
  };

  // Función para unirse a un plan de estudio
  const handleJoinPlan = async (planId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/planes/${planId}`);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      // Mostrar feedback visual
      console.log(`Intentando unirse al plan: ${planId}`);
      
      const response = await axios.post(
        `${API_URL}/planes/unirse`, 
        { plan_id: planId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Respuesta:', response.data);
      
      // Mostrar mensaje de éxito al usuario
      alert('¡Te has unido al plan de estudio exitosamente!');
      
      // Opcional: redirigir al usuario al plan de estudio
      navigate(`/planes/${planId}`);
      
    } catch (error: any) {
      console.error('Error al unirse al plan:', error);
      alert(error.response?.data?.message || 'Error al unirse al plan de estudio');
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="home-page">
        {/* Sección Hero - Corregida apertura y cierre de etiquetas */}
        <section className="hero-section">
          <h1>Mejora tus habilidades con retos diarios</h1>
          <p>Aprende, practica y compite con otros desarrolladores en Challenge Plans</p>
          <div className="hero-buttons">
            <Link to="/registro" className="btn btn-primary">Comenzar Gratis</Link>
            <Link to="/acerca" className="btn btn-secondary">Saber Más</Link>
          </div>
        </section>

        {/* Sección de estadísticas */}
        <section className="stats-section">
          <div className="stat-item">
            <h3>5,000+</h3>
            <p>Estudiantes activos</p>
          </div>
          <div className="stat-item">
            <h3>1,200+</h3>
            <p>Retos completados</p>
          </div>
          <div className="stat-item">
            <h3>8,500+</h3>
            <p>Apuntes compartidos</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Satisfacción</p>
          </div>
        </section>

        {/* Sección de características */}
        <section className="features-section">
          <h2>Tu aprendizaje, a otro nivel</h2>
          <p className="section-subtitle">Herramientas diseñadas específicamente para mejorar tu experiencia de estudio</p>
          
          <div className="features-grid">
            <FeatureCard 
              icon={<FaTrophy />}
              title="Retos Académicos" 
              description="Crea o únete a retos con tareas específicas y fechas límite para mantener tu motivación"
              linkTo="/retos?tab=explorar"
              onTitleClick={navigateToRetos}
            />
            
            <FeatureCard 
              icon={<FaClipboardList />}
              title="Planes de Estudio" 
              description="Organiza tu tiempo con planes personalizados y sigue tu progreso día a día"
              linkTo="/planes?ordenar=recientes"
              onTitleClick={navigateToPlanes}
            />
            
            <FeatureCard 
              icon={<FaBook />}
              title="Biblioteca de Apuntes" 
              description="Comparte tus mejores apuntes y accede a los de otros estudiantes"
              linkTo="/apuntes?formato=todos"
              onTitleClick={navigateToApuntes}
            />
            
            <FeatureCard 
              icon={<FaUsers />}
              title="Aprendizaje Social" 
              description="Gana puntos, insignias y reconocimiento por ayudar a otros"
              linkTo="/gamificacion"
              onTitleClick={navigateToSocial}
            />
          </div>
        </section>

        {/* Sección de retos populares */}
        <section className="challenges-section">
          <h2>Retos populares</h2>
          <p className="section-subtitle">Únete a estos retos y mejora tus habilidades colaborando con otros estudiantes</p>
          
          <div className="challenges-container">
            {loadingChallenges ? (
              <p className="loading-message">Cargando retos populares...</p>
            ) : errorChallenges ? (
              <p className="error-message">{errorChallenges}</p>
            ) : popularChallenges.length === 0 ? (
              <p className="empty-message">No hay retos populares disponibles actualmente</p>
            ) : (
              popularChallenges.map(challenge => (
                <ChallengePreview 
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.titulo}
                  difficulty={challenge.dificultad === 'principiante' ? 'Básico' : 
                              challenge.dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                  participants={challenge.num_participantes}
                  daysLeft={calculateDaysLeft(challenge.fecha_fin)}
                  creator={challenge.nombre_creador}
                  isAuthenticated={isAuthenticated}
                  isParticipating={challenge.participando}
                  onJoin={handleJoinChallenge}
                  onLeave={handleLeaveChallenge}
                />
              ))
            )}
          </div>
          
          <div className="section-cta">
            <Link 
              to="/retos?visibilidad=publico&tab=explorar" // Asegurarse de especificar la tab
              className="btn btn-secondary link-button"
              style={{ 
                cursor: 'pointer',
                display: 'inline-block',
                textDecoration: 'none'
              }}
            >
              Ver todos los retos
            </Link>
          </div>
        </section>

        {/* Sección de planes de estudio */}
        <section className="study-plans-section">
          <h2>Planes de estudio destacados</h2>
          <p className="section-subtitle">Organiza tu tiempo y maximiza tu rendimiento con estos planes</p>
          
          <div className="study-plans-container">
            {loadingPlans ? (
              <p className="loading-message">Cargando planes destacados...</p>
            ) : errorPlans ? (
              <p className="error-message">{errorPlans}</p>
            ) : featuredPlans.length === 0 ? (
              <p className="empty-message">No hay planes de estudio destacados disponibles</p>
            ) : (
              featuredPlans.map(plan => (
                <StudyPlanPreview 
                  key={plan.id}
                  id={plan.id}
                  title={plan.titulo}
                  duration={`${plan.duracion_dias} días`}
                  tasksCount={plan.tareas_count || 0}
                  creator={plan.nombre_creador}
                  isAuthenticated={isAuthenticated}
                  onJoin={handleJoinPlan}
                />
              ))
            )}
          </div>
          
          <div className="section-cta">
            <Link 
              to="/planes?visibilidad=publico"
              className="btn btn-secondary"
              onClick={() => console.log("Navegando a /planes con visibilidad=publico")}
            >
              Explorar planes
            </Link>
          </div>
        </section>
        
        {/* Sección de apuntes destacados - Corregida la estructura HTML */}
        <section className="notes-section">
          <h2>Apuntes destacados</h2>
          <p className="section-subtitle">Accede a los mejores apuntes compartidos por la comunidad</p>
          
          <div className="notes-container">
            {loadingNotes ? (
              <p className="loading-message">Cargando apuntes destacados...</p>
            ) : errorNotes ? (
              <p className="error-message">{errorNotes}</p>
            ) : featuredNotes.length === 0 ? (
              <p className="empty-message">No hay apuntes destacados disponibles</p>
            ) : (
              featuredNotes.map(note => (
                <NotePreview 
                  key={note.id || Math.random().toString()}
                  id={note.id || ''}
                  title={note.titulo || ''}
                  format={note.formato || 'otro'}
                  rating={note.calificacion_promedio || 0}
                  creator={note.nombre_creador}
                  date={note.fecha_subida || ''}
                />
              ))
            )}
          </div>
          
          <div className="section-cta">
            {/* Añadir un onClick para loguear la acción para depuración */}
            <Link 
              to="/apuntes?ordenar=calificacion" 
              className="btn btn-secondary"
              onClick={() => console.log("Navegando a /apuntes con ordenar=calificacion")}
            >
              Explorar apuntes
            </Link>
          </div>
        </section>

        {/* Call to Action final */}
        <section className="cta-section">
          <h2>¿Listo para mejorar tu forma de estudiar?</h2>
          <p>Únete a miles de estudiantes que ya están aprovechando nuestra plataforma</p>
          <Link to="/registro" className="btn btn-primary btn-large">Crear mi cuenta gratuita</Link>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
