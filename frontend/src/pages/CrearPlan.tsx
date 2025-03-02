import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/pages/CrearPlan.css';

interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  completada: boolean;
  prioridad: 'baja' | 'media' | 'alta';
}

const CrearPlan: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Estados para el plan
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duracionDias, setDuracionDias] = useState<number>(30);
  const [visibilidad, setVisibilidad] = useState<string>('privado');
  
  // Estado para las tareas del plan
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState<Tarea>({
    titulo: '',
    descripcion: '',
    fecha_limite: '',
    completada: false,
    prioridad: 'media'
  });
  
  // Estados para manejo de carga y error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/crear-plan');
    }
  }, [isAuthenticated, navigate]);

  // Manejar la adición de una nueva tarea
  const handleAgregarTarea = () => {
    if (!nuevaTarea.titulo.trim()) {
      setError('La tarea debe tener un título');
      return;
    }
    
    // Añadir la tarea a la lista con un ID temporal
    setTareas([...tareas, {
      ...nuevaTarea,
      id: `temp-${Date.now()}`
    }]);
    
    // Limpiar el formulario de nueva tarea
    setNuevaTarea({
      titulo: '',
      descripcion: '',
      fecha_limite: '',
      completada: false,
      prioridad: 'media'
    });
    
    setError(null);
  };

  // Eliminar una tarea
  const handleEliminarTarea = (idTarea: string | undefined) => {
    if (!idTarea) return;
    setTareas(tareas.filter(t => t.id !== idTarea));
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      setError('El título del plan es obligatorio');
      return;
    }
    
    if (duracionDias < 1) {
      setError('La duración debe ser de al menos 1 día');
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      // Preparar datos para enviar
      const planData = {
        plan: {
          titulo,
          descripcion,
          fecha_inicio: fechaInicio,
          duracion_dias: duracionDias,
          visibilidad
        },
        tareas: tareas.map(({ id, ...tarea }) => tarea) // Eliminar IDs temporales
      };
      
      // Enviar solicitud para crear plan
      const response = await axios.post(`${API_URL}/planes`, planData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('¡Plan de estudio creado exitosamente!');
      
      // Redirigir al detalle del plan creado
      if (response.data && response.data.plan && response.data.plan.id) {
        navigate(`/planes/${response.data.plan.id}`);
      } else {
        navigate('/planes');
      }
      
    } catch (err: any) {
      console.error('Error al crear plan:', err);
      setError(err.response?.data?.message || 'Error al crear el plan de estudio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="crear-plan-container">
        <header className="page-header">
          <h1>Crear Nuevo Plan de Estudio</h1>
          <p>Organiza tus actividades de aprendizaje y mantén un seguimiento de tu progreso</p>
        </header>
        
        <form className="plan-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-section">
            <h2>Información del Plan</h2>
            
            <div className="form-group">
              <label htmlFor="titulo">Título del Plan</label>
              <input
                id="titulo"
                type="text"
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Plan de Estudio para Álgebra"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha_inicio">Fecha de Inicio</label>
                <input
                  id="fecha_inicio"
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duracion">Duración (días)</label>
                <input
                  id="duracion"
                  type="number"
                  className="form-control"
                  value={duracionDias}
                  onChange={(e) => setDuracionDias(Number(e.target.value))}
                  min="1"
                  max="365"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="visibilidad">Visibilidad</label>
                <select
                  id="visibilidad"
                  className="form-control"
                  value={visibilidad}
                  onChange={(e) => setVisibilidad(e.target.value)}
                >
                  <option value="privado">Privado</option>
                  <option value="publico">Público</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                className="form-control"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Describe los objetivos y alcance de este plan de estudio..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Tareas del Plan</h2>
            
            <div className="tareas-container">
              {tareas.length === 0 ? (
                <div className="tareas-empty">
                  <p>No has añadido tareas a este plan todavía.</p>
                </div>
              ) : (
                <div className="tareas-list">
                  {tareas.map((tarea, index) => (
                    <div key={tarea.id} className="tarea-item">
                      <div className="tarea-header">
                        <h3>{index + 1}. {tarea.titulo}</h3>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEliminarTarea(tarea.id)}
                          aria-label="Eliminar tarea"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      
                      <div className="tarea-meta">
                        <span className={`prioridad ${tarea.prioridad}`}>
                          {tarea.prioridad === 'alta' ? 'Alta' : 
                           tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                        </span>
                        {tarea.fecha_limite && (
                          <span className="fecha-limite">
                            Para el {new Date(tarea.fecha_limite).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {tarea.descripcion && (
                        <p className="tarea-descripcion">{tarea.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="nueva-tarea">
                <h3>Añadir Nueva Tarea</h3>
                
                <div className="form-group">
                  <label htmlFor="tarea_titulo">Título</label>
                  <input
                    id="tarea_titulo"
                    type="text"
                    className="form-control"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                    placeholder="Ej: Leer capítulo 3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tarea_fecha">Fecha Límite (opcional)</label>
                    <input
                      id="tarea_fecha"
                      type="date"
                      className="form-control"
                      value={nuevaTarea.fecha_limite}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_limite: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tarea_prioridad">Prioridad</label>
                    <select
                      id="tarea_prioridad"
                      className="form-control"
                      value={nuevaTarea.prioridad}
                      onChange={(e) => setNuevaTarea({
                        ...nuevaTarea, 
                        prioridad: e.target.value as 'baja' | 'media' | 'alta'
                      })}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tarea_descripcion">Descripción (opcional)</label>
                  <textarea
                    id="tarea_descripcion"
                    className="form-control"
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    rows={3}
                    placeholder="Describe los detalles de esta tarea..."
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAgregarTarea}
                  >
                    Añadir Tarea
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!titulo)}
            >
              {loading ? 'Guardando...' : 'Crear Plan de Estudio'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CrearPlan;