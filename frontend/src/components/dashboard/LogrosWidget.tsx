import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LogrosWidget.css';

interface Logro {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
}

interface LogrosWidgetProps {
  userId: string;
}

const LogrosWidget: React.FC<LogrosWidgetProps> = ({ userId }) => {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogros = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Obtener token del almacenamiento
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/logros/mis-logros`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setLogros(response.data.logros || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching logros:', err);
        setError('No se pudieron cargar los logros');
      } finally {
        setLoading(false);
      }
    };

    fetchLogros();
  }, [userId]);

  // Función para mapear tipos de logros a iconos y clases CSS
  const getLogroIcon = (tipo: string) => {
    switch (tipo) {
      case 'unirse_reto':
        return { icon: '🚀', className: 'logro-unirse' };
      case 'completar_tarea':
        return { icon: '✅', className: 'logro-tarea' };
      case 'completar_reto':
        return { icon: '🏆', className: 'logro-completar' };
      case 'crear_reto':
        return { icon: '🔨', className: 'logro-crear' };
      case 'subir_apunte':
        return { icon: '📝', className: 'logro-apunte' };
      case 'obtener_recompensa':
        return { icon: '🎁', className: 'logro-recompensa' };
      case 'alcanzar_nivel':
        return { icon: '⭐', className: 'logro-nivel' };
      default:
        return { icon: '🔔', className: 'logro-default' };
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return <div className="logros-widget loading">Cargando logros...</div>;
  }

  if (error) {
    return <div className="logros-widget error">{error}</div>;
  }

  return (
    <div className="logros-widget">
      <h3 className="widget-title">Mis Logros Recientes</h3>
      
      {logros.length === 0 ? (
        <p className="no-logros">No tienes logros recientes</p>
      ) : (
        <ul className="logros-list">
          {logros.slice(0, 5).map(logro => {
            const { icon, className } = getLogroIcon(logro.tipo);
            return (
              <li key={logro.id} className={`logro-item ${className}`}>
                <span className="logro-icon">{icon}</span>
                <div className="logro-content">
                  <p className="logro-desc">{logro.descripcion}</p>
                  <span className="logro-date">{formatDate(logro.fecha)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {logros.length > 5 && (
        <div className="ver-mas">
          <a href="/logros">Ver todos mis logros</a>
        </div>
      )}
    </div>
  );
};

export default LogrosWidget;
