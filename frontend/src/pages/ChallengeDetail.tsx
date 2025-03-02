import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { challengesService } from '../services/api';
import '../assets/styles/pages/ChallengeDetail.css';

interface Reto {
  id: string;
  creador_id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activo' | 'completado' | 'cancelado';
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
}

interface Tarea {
  id: string;
  reto_id: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  fecha_limite: string;
  tipo: 'lectura' | 'ejercicio' | 'proyecto';
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reto, setReto] = useState<Reto | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('ID de reto no proporcionado');
        }
        
        const response = await challengesService.getById(id);
        setReto(response.data.reto);
        setTareas(response.data.tareas);
      } catch (err: any) {
        console.error('Error al obtener detalles del reto:', err);
        setError(err.response?.data?.message || 'Error al cargar el reto');
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleJoin = async () => {
    if (!id) return;
    
    try {
      await challengesService.join(id);
      alert('Te has unido al reto correctamente');
      // Recargar datos o actualizar UI según necesidad
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al unirse al reto');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando detalles del reto...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !reto) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'No se pudo cargar el reto'}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/retos')}
          >
            Volver a Retos
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="challenge-detail-page">
        <div className="challenge-header">
          <div className="challenge-title">
            <h1>{reto.titulo}</h1>
            <span className={`badge ${reto.dificultad}`}>{reto.dificultad}</span>
            <span className={`badge ${reto.estado}`}>{reto.estado}</span>
          </div>
          
          <div className="challenge-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/retos')}
            >
              Volver
            </button>
            
            {reto.estado === 'activo' && (
              <button 
                className="btn btn-primary"
                onClick={handleJoin}
              >
                Unirse al Reto
              </button>
            )}
          </div>
        </div>
        
        <div className="challenge-info">
          <div className="info-section">
            <h2>Descripción</h2>
            <p>{reto.descripcion || 'Sin descripción disponible'}</p>
          </div>
          
          <div className="info-card">
            <h3>Fechas del Reto</h3>
            <p><strong>Inicio:</strong> {formatDate(reto.fecha_inicio)}</p>
            <p><strong>Finalización:</strong> {formatDate(reto.fecha_fin)}</p>
          </div>
        </div>
        
        <div className="tasks-section">
          <h2>Tareas ({tareas.length})</h2>
          
          {tareas.length === 0 ? (
            <p className="no-tasks">Este reto no tiene tareas definidas.</p>
          ) : (
            <div className="tasks-list">
              {tareas.map((tarea) => (
                <div key={tarea.id} className="task-card">
                  <div className="task-header">
                    <h3>{tarea.titulo}</h3>
                    <span className={`task-type ${tarea.tipo}`}>{tarea.tipo}</span>
                  </div>
                  
                  <p className="task-description">{tarea.descripcion || 'Sin descripción'}</p>
                  
                  <div className="task-footer">
                    <span className="task-points">{tarea.puntos} puntos</span>
                    {tarea.fecha_limite && (
                      <span className="task-deadline">
                        Fecha límite: {formatDate(tarea.fecha_limite)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChallengeDetail;
