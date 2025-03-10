import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RetosFilter.css';

interface RetosFilterProps {
  filters: {
    search: string;
    dificultad: string;
    categoria: string;
    ordenarPor: string;
  };
  onFilterChange: (filters: any) => void;
  categorias: string[];
}

const RetosFilter: React.FC<RetosFilterProps> = ({ filters, onFilterChange, categorias }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleDificultadChange = (dificultad: string) => {
    onFilterChange({ dificultad: filters.dificultad === dificultad ? '' : dificultad });
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ categoria: e.target.value });
  };

  const handleOrdenarPorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ordenarPor: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      dificultad: '',
      categoria: '',
      ordenarPor: 'participaciones'
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className="filtros-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="filtros-row principal">
        <div className="busqueda-container">
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Buscar retos..."
            className="busqueda-input"
          />
          <svg className="busqueda-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="filtros-acciones">
          <button 
            className="boton-expandir"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls="filtros-expandidos"
          >
            {isExpanded ? 'Menos filtros' : 'Más filtros'}
            <svg 
              className={`icon-expandir ${isExpanded ? 'rotate' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button 
            className="boton-limpiar"
            onClick={handleClearFilters}
            disabled={!filters.search && !filters.dificultad && !filters.categoria && filters.ordenarPor === 'participaciones'}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            id="filtros-expandidos"
            className="filtros-row expandidos"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
          >
            <div className="filtro-grupo dificultad">
              <div className="filtro-titulo">Dificultad:</div>
              <div className="dificultad-botones">
                <button
                  className={`dificultad-boton principiante ${filters.dificultad === 'principiante' ? 'activo' : ''}`}
                  onClick={() => handleDificultadChange('principiante')}
                >
                  Principiante
                </button>
                <button
                  className={`dificultad-boton intermedio ${filters.dificultad === 'intermedio' ? 'activo' : ''}`}
                  onClick={() => handleDificultadChange('intermedio')}
                >
                  Intermedio
                </button>
                <button
                  className={`dificultad-boton avanzado ${filters.dificultad === 'avanzado' ? 'activo' : ''}`}
                  onClick={() => handleDificultadChange('avanzado')}
                >
                  Avanzado
                </button>
              </div>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="categoria" className="filtro-titulo">Categoría:</label>
              <select
                id="categoria"
                value={filters.categoria}
                onChange={handleCategoriaChange}
                className="filtro-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="ordenar" className="filtro-titulo">Ordenar por:</label>
              <select
                id="ordenar"
                value={filters.ordenarPor}
                onChange={handleOrdenarPorChange}
                className="filtro-select"
              >
                <option value="participaciones">Más populares</option>
                <option value="puntos">Mayor puntuación</option>
                <option value="fecha">Fecha límite cercana</option>
                <option value="titulo">Alfabético</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de filtros activos */}
      {(filters.dificultad || filters.categoria || filters.search || filters.ordenarPor !== 'participaciones') && (
        <div className="filtros-activos">
          <span className="filtros-activos-texto">Filtros activos:</span>
          
          {filters.search && (
            <motion.div 
              className="filtro-activo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span>Búsqueda: {filters.search}</span>
              <button onClick={() => onFilterChange({ search: '' })}>
                ✕
              </button>
            </motion.div>
          )}
          
          {filters.dificultad && (
            <motion.div 
              className={`filtro-activo filtro-${filters.dificultad}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span>Dificultad: {filters.dificultad}</span>
              <button onClick={() => onFilterChange({ dificultad: '' })}>
                ✕
              </button>
            </motion.div>
          )}
          
          {filters.categoria && (
            <motion.div 
              className="filtro-activo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span>Categoría: {filters.categoria}</span>
              <button onClick={() => onFilterChange({ categoria: '' })}>
                ✕
              </button>
            </motion.div>
          )}
          
          {filters.ordenarPor !== 'participaciones' && (
            <motion.div 
              className="filtro-activo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span>Ordenado por: {
                filters.ordenarPor === 'puntos' ? 'Mayor puntuación' :
                filters.ordenarPor === 'fecha' ? 'Fecha límite cercana' :
                filters.ordenarPor === 'titulo' ? 'Alfabético' : 'Más populares'
              }</span>
              <button onClick={() => onFilterChange({ ordenarPor: 'participaciones' })}>
                ✕
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RetosFilter;
