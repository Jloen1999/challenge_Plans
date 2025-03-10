import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getRetoById, 
  joinReto, 
  leaveReto, 
  checkUserParticipation, 
  completeTarea, 
  uncompleteTarea, 
  getUserRetoProgress 
} from '../../services/retoService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAppSelector } from '../../redux/hooks';
import toast from 'react-hot-toast';
import './DetalleRetoPage.css';

const DetalleRetoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reto, setReto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningReto, setJoiningReto] = useState(false);
  const [leavingReto, setLeavingReto] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [tareas, setTareas] = useState<any[]>([]);
  const [processingTareaId, setProcessingTareaId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  
  // Obtener estado de autenticación del usuario
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Cargar datos del reto y verificar participación del usuario
  useEffect(() => {
    const fetchRetoAndParticipation = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('Solicitando datos del reto con ID:', id);
        const data = await getRetoById(id);
        console.log('Datos del reto recibidos:', data);
        setReto(data);
        
        // Obtener tareas del reto
        if (data.tareas) {
          setTareas(data.tareas);
        }
        
        setError(null);
        
        // Verificar si el usuario está participando en este reto
        if (isAuthenticated) {
          const userParticipation = await checkUserParticipation(id);
          setIsParticipating(userParticipation);
          
          // Si está participando, obtenemos el estado de las tareas completadas
          if (userParticipation) {
            await fetchUserProgress();
          }
        }
      } catch (err: any) {
        console.error("Error al obtener detalle del reto:", err);
        setError(`No se pudo cargar el reto: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRetoAndParticipation();
  }, [id, isAuthenticated]);

  // Función para obtener el progreso del usuario y actualizar el estado de las tareas
  const fetchUserProgress = async () => {
    try {
      if (!id || !isAuthenticated) return;
      
      const progressData = await getUserRetoProgress(id);
      console.log('Progreso del usuario:', progressData);
      
      // Actualizar el progreso general
      setUserProgress(progressData.participacion.progreso);
      
      // Actualizar estado de tareas completadas
      if (progressData.tareas && progressData.tareas.length > 0) {
        setTareas(progressData.tareas);
      }
    } catch (err) {
      console.error("Error al obtener progreso del usuario:", err);
      // No mostramos este error al usuario para no interrumpir su experiencia
    }
  };

  // Unirse al reto
  const handleJoinReto = async () => {
    if (!id || !isAuthenticated) {
      toast.error('Debes iniciar sesión para unirte a este reto');
      return;
    }

    try {
      setJoiningReto(true);
      await joinReto(id);
      toast.success('¡Te has unido al reto con éxito!');
      setIsParticipating(true);
      
      // Recargar los datos del reto para actualizar la UI
      const updatedReto = await getRetoById(id);
      setReto(updatedReto);
      
      // Obtener estado inicial de progreso y tareas
      await fetchUserProgress();
    } catch (error: any) {
      toast.error(error.message || 'Error al unirse al reto');
    } finally {
      setJoiningReto(false);
    }
  };

  // Abandonar el reto
  const handleLeaveReto = async () => {
    if (!id || !isAuthenticated) {
      return;
    }

    try {
      setLeavingReto(true);
      await leaveReto(id);
      toast.success('Has abandonado el reto');
      setIsParticipating(false);
      
      // Recargar los datos del reto para actualizar la UI
      const updatedReto = await getRetoById(id);
      setReto(updatedReto);
      
      // Restablecer el progreso
      setUserProgress(0);
      
      // Restablecer el estado de las tareas completadas
      if (tareas.length > 0) {
        setTareas(tareas.map(tarea => ({
          ...tarea,
          completada: false
        })));
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al abandonar el reto');
    } finally {
      setLeavingReto(false);
    }
  };

  // Manejar cambio en estado de tarea (marcar/desmarcar)
  const handleTareaToggle = async (tarea: any) => {
    if (!isAuthenticated || !isParticipating) {
      toast.error('Debes estar participando en el reto para marcar tareas');
      return;
    }
    
    // Si ya estamos procesando esta tarea, no hacer nada
    if (processingTareaId === tarea.id) return;

    try {
      setProcessingTareaId(tarea.id);
      
      if (!tarea.completada) {
        // Marcar como completada
        await completeTarea(tarea.id);
        toast.success('Tarea completada con éxito');
      } else {
        // Desmarcar como completada
        await uncompleteTarea(tarea.id);
        toast.success('Tarea desmarcada');
      }
      
      // Actualizar el progreso y el estado de las tareas
      await fetchUserProgress();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la tarea');
    } finally {
      setProcessingTareaId(null);
    }
  };

  // Formatear fechas
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  // Renderizar categorías
  const renderCategorias = (categorias: any) => {
    if (!categorias) return null;
    
    if (typeof categorias === 'string') {
      return categorias.split(',').map((cat: string, idx: number) => (
        <span key={idx} className="categoria-tag">{cat.trim()}</span>
      ));
    }
    
    if (Array.isArray(categorias)) {
      return categorias.map((cat: any, idx: number) => (
        <span key={idx} className="categoria-tag">
          {typeof cat === 'string' ? cat : cat.nombre || cat.categoria?.nombre || 'Categoría'}
        </span>
      ));
    }
    
    return null;
  };

  // Calcular días restantes
  const calcularDiasRestantes = () => {
    if (!reto || !reto.fecha_fin) return "";
    
    try {
      const fechaFin = new Date(reto.fecha_fin);
      const ahora = new Date();
      
      if (ahora > fechaFin) return "Finalizado";
      
      const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      return diasRestantes === 1 ? "1 día restante" : `${diasRestantes} días restantes`;
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="detalle-reto-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-reto-error">
        <h2>Ocurrió un error</h2>
        <p>{error}</p>
        <div className="detalle-reto-actions">
          <button onClick={() => window.location.reload()} className="reload-button">
            Intentar de nuevo
          </button>
          <Link to="/retos" className="back-button">
            Volver a Retos
          </Link>
        </div>
      </div>
    );
  }

  if (!reto) {
    return (
      <div className="detalle-reto-not-found">
        <h2>Reto no encontrado</h2>
        <p>El reto que buscas no existe o ha sido eliminado.</p>
        <Link to="/retos" className="back-button">
          Volver a Retos
        </Link>
      </div>
    );
  }

  return (
    <div className="detalle-reto-page">
      <div className="detalle-reto-container">
        {/* Cabecera */}
        <motion.div 
          className="detalle-reto-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/retos" className="back-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver a Retos
          </Link>
          <div className={`dificultad-badge ${reto.dificultad || 'principiante'}`}>
            {reto.dificultad || 'Principiante'}
          </div>
        </motion.div>
        
        {/* Título del reto */}
        <motion.h1 
          className="detalle-reto-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {reto.titulo}
        </motion.h1>
        
        {/* Información principal */}
        <div className="reto-main-content">
          {/* Meta información */}
          <div className="reto-meta">
            <div className="reto-stats">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div className="stat-data">
                  <span className="stat-label">Fecha inicio</span>
                  <span className="stat-value">{formatDate(reto.fecha_inicio)}</span>
                </div>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">⏳</span>
                <div className="stat-data">
                  <span className="stat-label">Fecha fin</span>
                  <span className="stat-value">{formatDate(reto.fecha_fin)}</span>
                </div>
              </div>
              
              <div className="stat-item highlight">
                <span className="stat-icon">⭐</span>
                <div className="stat-data">
                  <span className="stat-label">Puntos</span>
                  <span className="stat-value">{reto.puntos_totales}</span>
                </div>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-data">
                  <span className="stat-label">Participantes</span>
                  <span className="stat-value">{reto.participaciones || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Tiempo restante */}
            <div className="tiempo-restante-container">
              <div className="tiempo-restante-header">
                <h3>Tiempo Restante</h3>
                <span className="dias-restantes">{calcularDiasRestantes()}</span>
              </div>
              <div className="progreso-barra-container">
                <div
                  className="progreso-barra-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, (() => {
                      try {
                        const inicio = new Date(reto.fecha_inicio).getTime();
                        const fin = new Date(reto.fecha_fin).getTime();
                        const ahora = new Date().getTime();
                        return ((ahora - inicio) / (fin - inicio)) * 100;
                      } catch {
                        return 0;
                      }
                    })()))}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Progreso del usuario si está participando */}
            {isParticipating && (
              <div className="progreso-usuario-container">
                <div className="progreso-usuario-header">
                  <h3>Tu Progreso</h3>
                  <span className="progreso-porcentaje">{userProgress}%</span>
                </div>
                <div className="progreso-barra-container">
                  <div
                    className="progreso-barra-fill user-progress"
                    style={{ width: `${userProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Creador del reto */}
            <div className="reto-creator">
              <div className="creator-avatar">
                <img 
                  src={reto.creador?.avatar || "/images/logo.svg"} 
                  alt={reto.creador?.nombre || "Creador"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/logo.svg";
                  }}
                />
              </div>
              <div className="creator-info">
                <span className="creator-label">Creado por</span>
                <span className="creator-name">{reto.creador?.nombre || "Usuario"}</span>
              </div>
            </div>
            
            {/* Categorías */}
            <div className="reto-categorias">
              <h3>Categorías</h3>
              <div className="categorias-container">
                {renderCategorias(reto.categorias) || <span className="categoria-tag">General</span>}
              </div>
            </div>
          </div>
          
          {/* Descripción y contenido principal */}
          <div className="reto-description-container">
            <h2>Descripción del Reto</h2>
            <div className="reto-description">
              {reto.descripcion ? (
                <p>{reto.descripcion}</p>
              ) : (
                <p className="no-description">Este reto no tiene una descripción detallada.</p>
              )}
            </div>
            
            {/* Tareas del reto como lista de tareas */}
            {tareas.length > 0 && (
              <div className="reto-tareas">
                <h2>Tareas del Reto</h2>
                <div className="tareas-todo-list">
                  {tareas.map((tarea: any) => (
                    <div key={tarea.id} className={`tarea-todo-item ${tarea.completada ? 'completed' : ''}`}>
                      <label className="tarea-checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={tarea.completada || false}
                          onChange={() => handleTareaToggle(tarea)}
                          disabled={!isParticipating || processingTareaId === tarea.id}
                          className="tarea-checkbox"
                        />
                        <span className="checkmark"></span>
                        <div className="tarea-info">
                          <span className="tarea-title">{tarea.titulo}</span>
                          <span className="tarea-points">{tarea.puntos} pts</span>
                        </div>
                      </label>
                      {tarea.descripcion && (
                        <div className="tarea-descripcion">{tarea.descripcion}</div>
                      )}
                      {processingTareaId === tarea.id && (
                        <span className="tarea-processing">Procesando...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="detalle-reto-actions">
          {isAuthenticated ? (
            isParticipating ? (
              <>
                <Link to={`/retos/${reto.id}/progress`} className="progress-button">
                  Ver Mi Progreso
                </Link>
                <button 
                  className="leave-button" 
                  onClick={handleLeaveReto}
                  disabled={leavingReto}
                >
                  {leavingReto ? 'Abandonando...' : 'Abandonar Reto'}
                </button>
              </>
            ) : (
              <button 
                className="join-button" 
                onClick={handleJoinReto}
                disabled={joiningReto}
              >
                {joiningReto ? 'Uniéndose...' : 'Unirse al Reto'}
              </button>
            )
          ) : (
            <Link to="/login" className="login-button">
              Inicia sesión para participar
            </Link>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default DetalleRetoPage;
