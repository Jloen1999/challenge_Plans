import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { challengesService } from '../services/api';
import '../assets/styles/pages/CreateChallenge.css';

interface Tarea {
  id?: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  tipo: 'lectura' | 'ejercicio' | 'proyecto';
  fecha_limite?: string;
}

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el reto
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [dificultad, setDificultad] = useState<'principiante' | 'intermedio' | 'avanzado'>('principiante');
  
  // Estado para las tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [tareaActual, setTareaActual] = useState<Tarea>({
    titulo: '',
    descripcion: '',
    puntos: 10,
    tipo: 'lectura',
    fecha_limite: ''
  });

  // Manejar cambios en los campos de tarea actual
  const handleTareaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTareaActual(prev => ({
      ...prev,
      [name]: name === 'puntos' ? parseInt(value) : value
    }));
  };

  // Añadir tarea a la lista
  const agregarTarea = () => {
    if (!tareaActual.titulo) {
      setError('La tarea debe tener un título');
      return;
    }
    
    setTareas([...tareas, { ...tareaActual, id: `temp-${Date.now()}` }]);
    setTareaActual({
      titulo: '',
      descripcion: '',
      puntos: 10,
      tipo: 'lectura',
      fecha_limite: ''
    });
    setError(null);
  };

  // Eliminar tarea de la lista
  const eliminarTarea = (idTarea: string) => {
    setTareas(tareas.filter(tarea => tarea.id !== idTarea));
  };

  // Enviar el formulario para crear el reto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !fechaInicio || !fechaFin) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Preparar datos del reto
      const retoData = {
        reto: {
          titulo,
          descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          dificultad
        },
        tareas: tareas.map(({ id, ...rest }) => rest) // Eliminar IDs temporales
      };
      
      console.log('Enviando datos:', retoData);
      
      // Enviar al servidor
      await challengesService.create(retoData);
      
      // Redireccionar a la lista de retos
      navigate('/retos');
      
    } catch (error: any) {
      console.error('Error al crear reto:', error);
      setError(error.response?.data?.message || 'Error al crear el reto. Verifica tu conexión o inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="create-challenge-page">
        <h1>Crear Nuevo Reto</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="challenge-form">
          <div className="form-section">
            <h2>Información del Reto</h2>
            
            <div className="form-group">
              <label htmlFor="titulo">Título del Reto *</label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fechaInicio">Fecha de Inicio *</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fechaFin">Fecha de Fin *</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="dificultad">Dificultad *</label>
              <select
                id="dificultad"
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value as 'principiante' | 'intermedio' | 'avanzado')}
                required
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Tareas del Reto</h2>
            
            <div className="tareas-list">
              {tareas.length > 0 ? (
                tareas.map((tarea) => (
                  <div key={tarea.id} className="tarea-item">
                    <div className="tarea-header">
                      <h3>{tarea.titulo}</h3>
                      <button 
                        type="button" 
                        className="btn-remove" 
                        onClick={() => eliminarTarea(tarea.id!)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <p><strong>Tipo:</strong> {tarea.tipo}</p>
                    <p><strong>Puntos:</strong> {tarea.puntos}</p>
                    {tarea.fecha_limite && (
                      <p><strong>Fecha límite:</strong> {new Date(tarea.fecha_limite).toLocaleDateString()}</p>
                    )}
                    {tarea.descripcion && <p>{tarea.descripcion}</p>}
                  </div>
                ))
              ) : (
                <p className="no-tareas">No has añadido tareas todavía.</p>
              )}
            </div>
            
            <div className="nueva-tarea">
              <h3>Añadir Nueva Tarea</h3>
              
              <div className="form-group">
                <label htmlFor="tareaTitulo">Título de la Tarea *</label>
                <input
                  type="text"
                  id="tareaTitulo"
                  name="titulo"
                  value={tareaActual.titulo}
                  onChange={handleTareaChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tareaDescripcion">Descripción</label>
                <textarea
                  id="tareaDescripcion"
                  name="descripcion"
                  value={tareaActual.descripcion}
                  onChange={handleTareaChange}
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tareaPuntos">Puntos *</label>
                  <input
                    type="number"
                    id="tareaPuntos"
                    name="puntos"
                    min="1"
                    value={tareaActual.puntos}
                    onChange={handleTareaChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tareaTipo">Tipo *</label>
                  <select
                    id="tareaTipo"
                    name="tipo"
                    value={tareaActual.tipo}
                    onChange={handleTareaChange}
                  >
                    <option value="lectura">Lectura</option>
                    <option value="ejercicio">Ejercicio</option>
                    <option value="proyecto">Proyecto</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="tareaFechaLimite">Fecha Límite</label>
                <input
                  type="date"
                  id="tareaFechaLimite"
                  name="fecha_limite"
                  value={tareaActual.fecha_limite}
                  onChange={handleTareaChange}
                />
              </div>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={agregarTarea}
              >
                Añadir Tarea
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/retos')}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Reto'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateChallenge;
