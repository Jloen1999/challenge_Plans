import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/PlanDetail.css';

interface PlanDetalle {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  duracion_dias: number;
  usuario_id: string;
  nombre_creador: string;
}

interface RetoAsociado {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  dificultad: string;
  num_participantes?: number;
}

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<PlanDetalle | null>(null);
  const [retos, setRetos] = useState<RetoAsociado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const response = await axios.get(`${API_URL}/planes/${id}`);
        
        setPlan(response.data.plan);
        setRetos(response.data.retos || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching plan details:', err);
        setError('No se pudo cargar los detalles del plan de estudio');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPlanDetails();
    }
  }, [id]);
  
  // Calcular la fecha estimada de finalización
  const calcularFechaFin = () => {
    if (!plan || !plan.fecha_inicio) return 'No disponible';
    
    const fechaInicio = new Date(plan.fecha_inicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias);
    
    return fechaFin.toLocaleDateString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <p>Cargando detalles del plan...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !plan) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'No se encontró el plan de estudio'}</p>
          <a href="/planes" className="btn btn-primary">Volver a Planes de Estudio</a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="plan-detail-page">
        <header className="plan-header">
          <h1>{plan.titulo}</h1>
          <div className="plan-meta">
            <span className="creator">Creado por: {plan.nombre_creador}</span>
            <span className="duracion">Duración: {plan.duracion_dias} días</span>
            <span className="fecha">Desde: {new Date(plan.fecha_inicio).toLocaleDateString()}</span>
            <span className="fecha">Hasta: {calcularFechaFin()}</span>
          </div>
        </header>
        
        <section className="plan-description">
          <h2>Descripción</h2>
          <p>{plan.descripcion || 'Este plan no tiene descripción.'}</p>
        </section>
        
        <section className="plan-retos">
          <h2>Retos Asociados</h2>
          {retos.length === 0 ? (
            <p className="empty-message">Este plan de estudio no tiene retos asociados.</p>
          ) : (
            <div className="retos-grid">
              {retos.map(reto => (
                <div key={reto.id} className="reto-card">
                  <h3>{reto.titulo}</h3>
                  <div className="reto-meta">
                    <span className={`dificultad ${reto.dificultad}`}>
                      {reto.dificultad === 'principiante' ? 'Principiante' : 
                       reto.dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                    </span>
                    <span className="estado">{reto.estado}</span>
                    <span className="participantes">{reto.num_participantes || 0} participantes</span>
                  </div>
                  <p>{reto.descripcion || 'Sin descripción'}</p>
                  <div className="fechas">
                    <span>Inicio: {new Date(reto.fecha_inicio).toLocaleDateString()}</span>
                    <span>Fin: {new Date(reto.fecha_fin).toLocaleDateString()}</span>
                  </div>
                  <div className="reto-actions">
                    <a href={`/retos/${reto.id}`} className="btn btn-outline">Ver detalles</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <div className="plan-actions">
          <button className="btn btn-primary">Unirse al Plan</button>
          <a href="/planes" className="btn btn-secondary">Volver a Planes de Estudio</a>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlanDetail;
