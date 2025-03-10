import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserRetoProgress, completeTarea } from '../../services/retoService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAppSelector } from '../../redux/hooks';
import toast from 'react-hot-toast';
import './RetoProgresoPage.css';

const RetoProgresoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  
  // Obtener estado de autenticación del usuario
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Cargar datos de progreso
  useEffect(() => {
    const fetchProgress = async () => {
      if (!id || !isAuthenticated) return;

      try {
        setLoading(true);
        const data = await getUserRetoProgress(id);
        console.log("Datos de progreso recibidos en el componente:", data);
        setProgressData(data);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener progreso:", err);
        setError(`No se pudo cargar el progreso: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [id, isAuthenticated]);

  // Marcar una tarea como completada
  const handleCompleteTask = async (tareaId: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para marcar tareas como completadas');
      return;
    }

    try {
      setCompletingTask(tareaId);
      const result = await completeTarea(tareaId);
      toast.success('¡Tarea completada con éxito!');
      
      // Actualizar datos localmente para evitar otra llamada a la API
      setProgressData((prevData: any) => {
        if (!prevData) return null;
        
        return {
          ...prevData,
          estadisticas: {
            ...prevData.estadisticas,
            tareas_completadas: prevData.estadisticas.tareas_completadas + 1,
            porcentaje_completado: result.nuevo_progreso
          },
          participacion: {
            ...prevData.participacion,
            progreso: result.nuevo_progreso
          },
          tareas: prevData.tareas.map((tarea: any) => 
            tarea.id === tareaId 
              ? { ...tarea, completada: true, fecha_completado: new Date().toISOString() } 
              : tarea
          )
        };
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al completar la tarea');
    } finally {
      setCompletingTask(null);
    }
  };

  // Formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
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

  // Calcular días restantes
  const calcularDiasRestantes = () => {
    if (!progressData?.reto?.fecha_fin) return "";
    
    try {
      const fechaFin = new Date(progressData.reto.fecha_fin);
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
      <div className="progreso-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="progreso-error">
        <h2>Ocurrió un error</h2>
        <p>{error || "No se pudo cargar la información de progreso"}</p>
        <div className="progreso-actions">
          <button onClick={() => window.location.reload()} className="reload-button">
            Intentar de nuevo
          </button>
          <Link to={`/retos/${id}`} className="back-button">
            Volver al Reto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="progreso-page">
      <div className="progreso-container">
        {/* Encabezado */}
        <motion.div 
          className="progreso-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to={`/retos/${id}`} className="back-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver al Reto
          </Link>
          <div className={`dificultad-badge ${progressData.reto.dificultad || 'principiante'}`}>
            {progressData.reto.dificultad || 'Principiante'}
          </div>
        </motion.div>
        
        {/* Título del reto */}
        <motion.div 
          className="progreso-title-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="progreso-title">
            Mi Progreso: {progressData.reto.titulo}
          </h1>
          <span className="progreso-status">
            Estado: <span className={`status-badge ${progressData.participacion.estado}`}>
              {progressData.participacion.estado === 'completado' ? 'Completado' : 
               progressData.participacion.estado === 'activo' ? 'En progreso' : 'Abandonado'}
            </span>
          </span>
        </motion.div>
        
        {/* Resumen de progreso */}
        <div className="progreso-summary-section">
          <div className="progreso-card">
            <h2 className="section-title">Resumen de Progreso</h2>
            
            <div className="progreso-stats">
              <div className="stat-item">
                <span className="stat-label">Fecha de unión</span>
                <span className="stat-value">{formatDate(progressData.participacion.fecha_union)}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Fecha límite</span>
                <span className="stat-value">{formatDate(progressData.reto.fecha_fin)}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Tiempo restante</span>
                <span className="stat-value">{calcularDiasRestantes()}</span>
              </div>
              
              {progressData.participacion.fecha_completado && (
                <div className="stat-item">
                  <span className="stat-label">Fecha de completado</span>
                  <span className="stat-value">{formatDate(progressData.participacion.fecha_completado)}</span>
                </div>
              )}
            </div>
            
            <div className="progreso-bar-section">
              <div className="progreso-header">
                <span className="progreso-percent">{progressData.participacion.progreso}% completado</span>
                <span className="progreso-fraction">
                  {progressData.estadisticas.tareas_completadas} de {progressData.estadisticas.tareas_totales} tareas
                </span>
              </div>
              <div className="progreso-bar-container">
                <div 
                  className="progreso-bar-fill"
                  style={{ width: `${progressData.participacion.progreso}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de tareas */}
        <div className="progreso-tareas-section">
          <h2 className="section-title">Tareas del Reto</h2>
          
          {progressData.tareas.length === 0 ? (
            <EmptyState 
              title="Sin tareas disponibles" 
              message="Este reto no tiene tareas asignadas."
            />
          ) : (
            <ul className="tareas-list">
              {progressData.tareas.map((tarea: any) => (
                <li key={tarea.id} className={`tarea-item ${tarea.completada ? 'completed' : ''}`}>
                  <div className="tarea-content">
                    <div className="tarea-header">
                      <h3 className="tarea-title">{tarea.titulo}</h3>
                      <span className="puntos-tarea">{tarea.puntos} pts</span>
                    </div>
                    
                    {tarea.descripcion && (
                      <p className="tarea-descripcion">{tarea.descripcion}</p>
                    )}
                    
                    {tarea.completada && (
                      <div className="tarea-completion-info">
                        <span className="completion-icon">✓</span>
                        <span className="completion-date">Completada el {formatDate(tarea.fecha_completado)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="tarea-actions">
                    {!tarea.completada ? (
                      <button
                        className="complete-button"
                        onClick={() => handleCompleteTask(tarea.id)}
                        disabled={!!completingTask}
                      >
                        {completingTask === tarea.id ? 'Completando...' : 'Marcar como completada'}
                      </button>
                    ) : (
                      <span className="tarea-completed-badge">Completada</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Historial de progreso si existe */}
        {progressData.historial_progreso && progressData.historial_progreso.length > 0 && (
          <div className="progreso-historial-section">
            <h2 className="section-title">Historial de Progreso</h2>
            <div className="historial-container">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.historial_progreso.map((entry: any, index: number) => (
                    <tr key={index}>
                      <td>{formatDate(entry.fecha)}</td>
                      <td>{entry.progreso}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetoProgresoPage;
