import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext, useAuth } from '../contexts/AuthContext'; // Importar también useAuth
import LogrosWidget from '../components/dashboard/LogrosWidget';
import axios from 'axios';
import '../assets/styles/pages/Dashboard.css';

interface ParticipacionReto {
  reto_id: string;
  titulo_reto: string;
  progreso: number;
  fecha_inicio: string;
  fecha_fin: string;
  dificultad: string;
  estado: string;
  nombre_creador: string;
}

const Dashboard: React.FC = () => {
  // Opción 1: Usando useContext (ahora que AuthContext está exportado)
  const authContext = useContext(AuthContext);

  // Opción 2: Usando el hook useAuth (recomendado)
  const { user } = useAuth();

  const [participaciones, setParticipaciones] = useState<ParticipacionReto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipaciones = async () => {
      // Solo hacemos la petición si existe un usuario autenticado
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/participacion/mis-participaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setParticipaciones(response.data.participaciones || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching participaciones:', err);
        setError(err.response?.data?.message || 'No se pudieron cargar tus participaciones en retos');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipaciones();
  }, [user]);

  // Función para calcular días restantes
  const calcularDiasRestantes = (fechaFin: string): number => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
  };

  // Calcular el promedio de progreso de forma segura
  const calcularProgresoPromedio = (): number => {
    if (!participaciones.length) return 0;
    
    const totalProgreso = participaciones.reduce((sum, p) => sum + (p.progreso || 0), 0);
    return Math.round(totalProgreso / participaciones.length);
  };

  // Contar retos activos de forma segura
  const contarRetosActivos = (): number => {
    return participaciones.filter(p => p.estado === 'activo').length;
  };

  // Añadir función de navegación para las acciones rápidas
  const navigateToCrearReto = () => navigate('/crear-reto');
  const navigateToCrearApunte = () => navigate('/apuntes/crear');
  const navigateToCrearPlan = () => navigate('/crear-plan');

  return (
    <MainLayout>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Mi Dashboard</h1>
          <p>Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}. Aquí tienes un resumen de tu actividad.</p>
        </header>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Puntuación</h3>
            <p className="stat-value">{user?.puntaje || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Retos Activos</h3>
            <p className="stat-value">{contarRetosActivos()}</p>
          </div>
          <div className="stat-card">
            <h3>Progreso Total</h3>
            <p className="stat-value">{calcularProgresoPromedio()}%</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-column">
            <section className="dashboard-section retos-section">
              <h2>Mis Retos Activos</h2>
              
              {loading ? (
                <p className="loading">Cargando tus retos...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : participaciones.length === 0 ? (
                <p className="empty-state">No estás participando en ningún reto actualmente</p>
              ) : (
                <div className="retos-list">
                  {participaciones
                    .filter(p => p.estado === 'activo')
                    .sort((a, b) => new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime())
                    .map(p => (
                      <div key={p.reto_id} className="reto-card">
                        <h3>{p.titulo_reto}</h3>
                        <div className="reto-meta">
                          <span className={`dificultad ${p.dificultad}`}>
                            {p.dificultad === 'principiante' ? 'Básico' : 
                            p.dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                          </span>
                          <span className="dias-restantes">
                            {calcularDiasRestantes(p.fecha_fin)} días restantes
                          </span>
                        </div>
                        <div className="progreso-container">
                          <div className="progreso-bar">
                            <div 
                              className="progreso-fill"
                              style={{ width: `${p.progreso}%` }}
                            ></div>
                          </div>
                          <span className="progreso-text">{p.progreso}%</span>
                        </div>
                        <Link to={`/retos/${p.reto_id}`} className="btn btn-outline">Ver reto</Link>
                      </div>
                    ))
                  }
                </div>
              )}
            </section>
          </div>
          
          <div className="dashboard-column">
            {user?.id && (
              <LogrosWidget userId={user.id} />
            )}
            
            <section className="dashboard-section acciones-rapidas">
              <h2>Acciones Rápidas</h2>
              <div className="acciones-grid">
                <div 
                  onClick={navigateToCrearReto}
                  className="accion-card"
                >
                  <span className="accion-icon">🚀</span>
                  <span className="accion-text">Crear Reto</span>
                </div>
                <div 
                  onClick={navigateToCrearApunte}
                  className="accion-card"
                >
                  <span className="accion-icon">📝</span>
                  <span className="accion-text">Subir Apunte</span>
                </div>
                <div 
                  onClick={navigateToCrearPlan}
                  className="accion-card"
                >
                  <span className="accion-icon">📅</span>
                  <span className="accion-text">Crear Plan</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
