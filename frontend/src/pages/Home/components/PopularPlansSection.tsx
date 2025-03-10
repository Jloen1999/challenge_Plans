import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './PopularPlansSection.css';

// Datos estáticos para los planes de estudio populares
const popularPlans = [
  {
    id: '1',
    titulo: 'Desarrollo Web Fullstack',
    descripcion: 'Un plan completo para convertirte en desarrollador web con React y Node.js',
    usuario: {
      nombre: 'María González',
      avatar: '/images/avatars/maria.jpg'
    },
    duracion_dias: 90,
    participantes: 345,
    retos: 12,
    categorias: ['Programación', 'Web']
  },
  {
    id: '2',
    titulo: 'Matemáticas Avanzadas',
    descripcion: 'Domina cálculo, álgebra lineal y estadística con ejercicios prácticos',
    usuario: {
      nombre: 'Carlos Pérez',
      avatar: '/images/avatars/carlos.jpg'
    },
    duracion_dias: 60,
    participantes: 213,
    retos: 8,
    categorias: ['Matemáticas', 'Ciencias']
  },
  {
    id: '3',
    titulo: 'Inglés Profesional',
    descripcion: 'Mejora tu nivel de inglés para contextos laborales y académicos',
    usuario: {
      nombre: 'Laura Torres',
      avatar: '/images/avatars/laura.jpg'
    },
    duracion_dias: 45,
    participantes: 528,
    retos: 15,
    categorias: ['Idiomas', 'Profesional']
  }
];

const PopularPlansSection: React.FC = () => {
  return (
    <section className="section popular-plans-section">
      <div className="section-container">
        <h2 className="section-title">Planes de Estudio Populares</h2>
        <p className="section-subtitle">
          Explora los planes de estudio mejor valorados por nuestra comunidad de estudiantes
        </p>
        
        <div className="plans-grid">
          {popularPlans.map((plan, index) => (
            <motion.div 
              key={plan.id} 
              className="plan-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="plan-header">
                <h3 className="plan-title">{plan.titulo}</h3>
                <div className="plan-categories">
                  {plan.categorias.map((categoria, idx) => (
                    <span key={idx} className="plan-category">{categoria}</span>
                  ))}
                </div>
              </div>
              
              <p className="plan-description">{plan.descripcion}</p>
              
              <div className="plan-details">
                <div className="plan-detail">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-text">{plan.duracion_dias} días</span>
                </div>
                <div className="plan-detail">
                  <span className="detail-icon">👥</span>
                  <span className="detail-text">{plan.participantes} participantes</span>
                </div>
                <div className="plan-detail">
                  <span className="detail-icon">🎯</span>
                  <span className="detail-text">{plan.retos} retos</span>
                </div>
              </div>
              
              <div className="plan-footer">
                <div className="plan-creator">
                  <img src={plan.usuario.avatar} alt={plan.usuario.nombre} className="creator-avatar" />
                  <span className="creator-name">{plan.usuario.nombre}</span>
                </div>
                
                <Link to={`/planes/${plan.id}`} className="plan-button">
                  Ver Plan
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="see-all-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/planes" className="see-all-button">
            Ver Todos los Planes
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularPlansSection;
