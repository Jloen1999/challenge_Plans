import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getPopularRetos, getPopularRetosAlternative, RetoPopular } from '../../../services/retoService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './PopularChallengesSection.css';

const PopularChallengesSection: React.FC = () => {
  const [challenges, setChallenges] = useState<RetoPopular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularRetos = async () => {
      try {
        setLoading(true);
        console.log("Iniciando fetch de retos populares...");
        
        // Intentar con el método principal primero
        let data = await getPopularRetos(4);
        console.log("Datos recibidos método 1:", data);
        
        // Si no hay datos, intentar con el método alternativo
        if (!data || data.length === 0) {
          console.log("Intentando con método alternativo...");
          data = await getPopularRetosAlternative(4);
          console.log("Datos recibidos método 2:", data);
        }
        
        // Usar datos de prueba si ambos métodos fallan
        if (!data || data.length === 0) {
          console.log("Usando datos de prueba locales");
          data = getMockRetos();
        }
        
        setChallenges(data);
        setError(null);
      } catch (err: any) {
        console.error("Error crítico al obtener retos:", err);
        setError('No se pudieron cargar los retos populares: ' + (err.message || 'Error desconocido'));
        
        // Usar datos de prueba en caso de error
        setChallenges(getMockRetos());
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRetos();
  }, []);

  // Función para formatear fecha en formato local
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  // Función para manejar la falta de categorías o diferentes formatos de datos
  const renderCategories = (challenge: RetoPopular) => {
    // Si categorias no existe 
    if (!challenge.categorias) {
      return <span className="challenge-category">General</span>;
    }
    
    // Si categorias es un string (separado por comas desde STRING_AGG del SQL)
    if (typeof challenge.categorias === 'string') {
      return challenge.categorias.split(',').map((categoria, idx) => (
        <span key={idx} className="challenge-category">
          {categoria.trim()}
        </span>
      ));
    }
    
    // Si es un array pero no tiene la estructura esperada
    if (Array.isArray(challenge.categorias) && challenge.categorias.length === 0) {
      return <span className="challenge-category">General</span>;
    }
    
    // Si es un array de objetos con estructura de categorías
    if (Array.isArray(challenge.categorias)) {
      return challenge.categorias.map((categoria, idx) => (
        <span key={categoria.id || idx} className="challenge-category">
          {typeof categoria === 'string' ? categoria : categoria.nombre || 'Categoría'}
        </span>
      ));
    }
    
    // Fallback para cualquier otro formato inesperado
    return <span className="challenge-category">General</span>;
  };

  return (
    <section className="section popular-challenges-section">
      <div className="section-container">
        <h2 className="section-title">Retos Destacados</h2>
        <p className="section-subtitle">
          Desafíos actuales que están inspirando a nuestra comunidad a crecer y aprender juntos
        </p>
        
        {loading && (
          <div className="challenges-loading">
            <LoadingSpinner size="medium" />
          </div>
        )}
        
        {error && (
          <div className="challenges-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Intentar de nuevo
            </button>
          </div>
        )}
        
        {!loading && !error && challenges.length === 0 && (
          <div className="no-challenges">
            <p>No hay retos disponibles en este momento.</p>
          </div>
        )}
        
        {!loading && !error && challenges.length > 0 && (
          <div className="challenges-container">
            {challenges.map((challenge, index) => (
              <motion.div 
                key={challenge.id} 
                className={`challenge-card ${challenge.dificultad}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`difficulty-badge ${challenge.dificultad}`}>
                  {challenge.dificultad}
                </div>
                
                <h3 className="challenge-title">{challenge.titulo}</h3>
                
                <div className="challenge-categories">
                  {renderCategories(challenge)}
                </div>
                
                <p className="challenge-description">
                  {challenge.descripcion || 'Sin descripción disponible.'}
                </p>
                
                <div className="challenge-stats">
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span>{challenge.participaciones} participantes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⭐</span>
                    <span>{challenge.puntos_totales} puntos</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📅</span>
                    <span>Hasta {formatDate(challenge.fecha_fin)}</span>
                  </div>
                </div>
                
                <div className="challenge-footer">
                  <div className="challenge-creator">
                    <img 
                      src={challenge.creador?.avatar || '/images/logo.webp'} 
                      alt={challenge.creador?.nombre || 'Creador'} 
                      className="creator-avatar" 
                      onError={(e) => {
                        // Si la imagen falla, usar imagen predeterminada
                        (e.target as HTMLImageElement).src = '/images/logo.webp';
                      }}
                    />
                    <span>Creado por {challenge.creador?.nombre || 'Usuario'}</span>
                  </div>
                  
                  <Link to={`/retos/${challenge.id}`} className="challenge-button">
                    Ver Reto
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div 
          className="see-all-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/retos" className="see-all-button">
            Explorar Todos los Retos
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Función que proporciona datos de prueba para mostrar cuando hay errores de API
function getMockRetos(): RetoPopular[] {
  return [
    {
      id: '1',
      titulo: 'Desarrollo Web Fullstack',
      descripcion: 'Crea una aplicación web completa utilizando React y Node.js',
      dificultad: 'intermedio',
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      puntos_totales: 1500,
      participaciones: 240,
      creador: {
        nombre: 'María López',
        avatar: '/images/logo.webp'
      },
      categorias: [{ id: '1', nombre: 'Desarrollo Web' }, { id: '2', nombre: 'JavaScript' }]
    },
    {
      id: '2',
      titulo: 'Machine Learning Básico',
      descripcion: 'Introducción a algoritmos de machine learning con Python',
      dificultad: 'principiante',
      fecha_fin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      puntos_totales: 1200,
      participaciones: 185,
      creador: {
        nombre: 'Carlos Ruiz',
        avatar: '/images/logo.webp'
      },
      categorias: [{ id: '3', nombre: 'Python' }, { id: '4', nombre: 'Data Science' }]
    },
    {
      id: '3',
      titulo: 'Diseño UX/UI Avanzado',
      descripcion: 'Mejora tus habilidades de diseño con este reto práctico',
      dificultad: 'avanzado',
      fecha_fin: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      puntos_totales: 2000,
      participaciones: 120,
      creador: {
        nombre: 'Ana Martínez',
        avatar: '/images/logo.webp'
      },
      categorias: [{ id: '5', nombre: 'Diseño' }, { id: '6', nombre: 'UX/UI' }]
    },
    {
      id: '4',
      titulo: 'Introducción a Blockchain',
      descripcion: 'Aprende los fundamentos de blockchain y criptomonedas',
      dificultad: 'principiante',
      fecha_fin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      puntos_totales: 900,
      participaciones: 210,
      creador: {
        nombre: 'Pedro Sánchez',
        avatar: '/images/logo.webp'
      },
      categorias: [{ id: '7', nombre: 'Blockchain' }, { id: '8', nombre: 'Tecnología' }]
    }
  ];
}

export default PopularChallengesSection;
