import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './RetoCard.css';

interface RetoCardProps {
  reto: any;
  index: number;
}

const RetoCard: React.FC<RetoCardProps> = ({ reto, index }) => {
  // Formatear fecha en formato local
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  // Renderizar las categorías del reto
  const renderCategorias = () => {
    if (!reto.categorias) {
      return <span className="reto-category">General</span>;
    }
    
    if (typeof reto.categorias === 'string') {
      return reto.categorias.split(',').map((categoria: string, idx: number) => (
        <span key={idx} className="reto-category">
          {categoria.trim()}
        </span>
      ));
    }
    
    if (Array.isArray(reto.categorias) && reto.categorias.length === 0) {
      return <span className="reto-category">General</span>;
    }
    
    if (Array.isArray(reto.categorias)) {
      return reto.categorias.map((categoria: any, idx: number) => (
        <span key={idx} className="reto-category">
          {typeof categoria === 'string' ? categoria : categoria.nombre || 'Categoría'}
        </span>
      ));
    }
    
    return <span className="reto-category">General</span>;
  };

  // Determinar el porcentaje de días restantes para el reto
  const calcularPorcentajeTiempoRestante = () => {
    try {
      const fechaInicio = new Date(reto.fecha_inicio);
      const fechaFin = new Date(reto.fecha_fin);
      const ahora = new Date();
      
      // Si el reto ya terminó
      if (ahora > fechaFin) return 100;
      
      // Si el reto todavía no comienza
      if (ahora < fechaInicio) return 0;
      
      // Calcular porcentaje de tiempo transcurrido
      const totalDuration = fechaFin.getTime() - fechaInicio.getTime();
      const transcurrido = ahora.getTime() - fechaInicio.getTime();
      
      return Math.min(100, Math.round((transcurrido / totalDuration) * 100));
    } catch (e) {
      return 0;
    }
  };

  // Obtener días restantes
  const getDiasRestantes = () => {
    try {
      const fechaFin = new Date(reto.fecha_fin);
      const ahora = new Date();
      
      // Si el reto ya terminó
      if (ahora > fechaFin) return "Finalizado";
      
      const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes === 1) return "1 día restante";
      return `${diasRestantes} días restantes`;
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  // Variable para determinar el porcentaje de tiempo restante
  const porcentajeTiempo = calcularPorcentajeTiempoRestante();

  return (
    <motion.div
      className={`reto-card ${reto.dificultad || 'principiante'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="reto-header">
        <div className={`dificultad-badge ${reto.dificultad || 'principiante'}`}>
          {reto.dificultad || 'Principiante'}
        </div>
        <div className="reto-puntos">
          <span className="puntos-icono">⭐</span>
          <span>{reto.puntos_totales || 0} puntos</span>
        </div>
      </div>
      
      <h3 className="reto-titulo">{reto.titulo}</h3>
      
      <div className="reto-categories">
        {renderCategorias()}
      </div>
      
      <p className="reto-descripcion">
        {reto.descripcion?.length > 120 
          ? `${reto.descripcion.substring(0, 120)}...` 
          : reto.descripcion || 'Sin descripción disponible'}
      </p>
      
      <div className="reto-participantes">
        <span className="participantes-icono">👥</span>
        <span>{reto.participaciones || 0} participantes</span>
      </div>
      
      <div className="reto-tiempo">
        <div className="tiempo-info">
          <span className="tiempo-restante">{getDiasRestantes()}</span>
          <span className="fecha-fin">Hasta {formatDate(reto.fecha_fin)}</span>
        </div>
        <div className="tiempo-barra-container">
          <div 
            className="tiempo-barra-progreso" 
            style={{ width: `${porcentajeTiempo}%` }}
          ></div>
        </div>
      </div>
      
      <div className="reto-creador">
        Creado por {reto.creador?.nombre || 'Usuario'}
      </div>
      
      <Link to={`/retos/${reto.id}`} className="ver-reto-button">
        Ver Detalles
      </Link>
    </motion.div>
  );
};

export default RetoCard;
