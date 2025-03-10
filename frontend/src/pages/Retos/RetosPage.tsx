import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllRetos } from '../../services/retoService';
import RetoCard from './components/RetoCard';
import RetosFilter from './components/RetosFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './RetosPage.css';

const RetosPage: React.FC = () => {
  const [retos, setRetos] = useState<any[]>([]);
  const [filteredRetos, setFilteredRetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    dificultad: '',
    categoria: '',
    ordenarPor: 'participaciones'
  });

  // Cargar todos los retos al montar el componente
  useEffect(() => {
    const fetchRetos = async () => {
      try {
        setLoading(true);
        const data = await getAllRetos();
        setRetos(data);
        setFilteredRetos(data);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener retos:", err);
        setError(`No se pudieron cargar los retos: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRetos();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...retos];
    
    // Filtrar por texto de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(reto => 
        reto.titulo.toLowerCase().includes(searchLower) || 
        (reto.descripcion && reto.descripcion.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por dificultad
    if (filters.dificultad) {
      result = result.filter(reto => reto.dificultad === filters.dificultad);
    }
    
    // Filtrar por categoría
    if (filters.categoria) {
      result = result.filter(reto => {
        // Manejar diferentes formatos de categorías
        if (typeof reto.categorias === 'string') {
          return reto.categorias.toLowerCase().includes(filters.categoria.toLowerCase());
        }
        if (Array.isArray(reto.categorias)) {
          return reto.categorias.some((cat: any) => 
            (typeof cat === 'string' && cat.toLowerCase() === filters.categoria.toLowerCase()) ||
            (cat.nombre && cat.nombre.toLowerCase() === filters.categoria.toLowerCase())
          );
        }
        return false;
      });
    }
    
    // Ordenar resultados
    switch (filters.ordenarPor) {
      case 'participaciones':
        result.sort((a, b) => b.participaciones - a.participaciones);
        break;
      case 'puntos':
        result.sort((a, b) => b.puntos_totales - a.puntos_totales);
        break;
      case 'fecha':
        result.sort((a, b) => new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime());
        break;
      case 'titulo':
        result.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      default:
        break;
    }
    
    setFilteredRetos(result);
  }, [retos, filters]);

  // Función para actualizar filtros
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Obtener categorías únicas para los filtros
  const getCategorias = () => {
    const categoriasSet = new Set<string>();
    
    retos.forEach(reto => {
      if (typeof reto.categorias === 'string') {
        reto.categorias.split(',').forEach((cat: string) => categoriasSet.add(cat.trim()));
      } else if (Array.isArray(reto.categorias)) {
        reto.categorias.forEach((cat: any) => {
          if (typeof cat === 'string') categoriasSet.add(cat);
          else if (cat.nombre) categoriasSet.add(cat.nombre);
        });
      }
    });
    
    return Array.from(categoriasSet);
  };

  return (
    <div className="retos-page">
      <motion.div 
        className="retos-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="retos-title">Explorar Retos</h1>
        <p className="retos-subtitle">
          Descubre desafíos académicos, mejora tus habilidades y compite con otros estudiantes
        </p>
      </motion.div>
      
      <RetosFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        categorias={getCategorias()}
      />
      
      {loading ? (
        <div className="retos-loading">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="retos-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      ) : filteredRetos.length === 0 ? (
        <div className="no-retos">
          <img 
            src="/images/illustrations/empty-state.svg" 
            alt="No hay resultados" 
            className="no-results-image" 
            width="250"
            height="200"
          />
          <h3>No se encontraron retos</h3>
          <p>Intenta con otros criterios de búsqueda</p>
        </div>
      ) : (
        <motion.div
          className="retos-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredRetos.map((reto, index) => (
            <RetoCard key={reto.id} reto={reto} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RetosPage;
