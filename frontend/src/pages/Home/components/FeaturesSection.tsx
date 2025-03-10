import React from 'react';
import { motion } from 'framer-motion';
import './FeaturesSection.css';

const features = [
  {
    id: 1,
    icon: "🎯",
    title: "Retos Personalizables",
    description: "Crea y participa en desafíos académicos adaptados a tus necesidades de aprendizaje."
  },
  {
    id: 2,
    icon: "📚",
    title: "Planes de Estudio",
    description: "Organiza tu aprendizaje con planes estructurados que incluyen tareas y plazos definidos."
  },
  {
    id: 3,
    icon: "📝",
    title: "Apuntes Compartidos",
    description: "Accede a un repositorio colaborativo de apuntes digitales compartidos por la comunidad."
  },
  {
    id: 4,
    icon: "👥",
    title: "Aprendizaje Colaborativo",
    description: "Interactúa con otros estudiantes mediante comentarios, valoraciones y participación en retos."
  },
  {
    id: 5,
    icon: "🏆",
    title: "Sistema de Recompensas",
    description: "Gana insignias, puntos y niveles a medida que alcanzas logros en la plataforma."
  },
  {
    id: 6,
    icon: "📊",
    title: "Seguimiento de Progreso",
    description: "Visualiza tu avance en retos y planes de estudio con estadísticas detalladas."
  }
];

const FeaturesSection: React.FC = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="section features-section" id="features">
      <div className="section-container">
        <h2 className="section-title">Características Destacadas</h2>
        <p className="section-subtitle">
          Descubre todas las herramientas y funcionalidades que Challenge Plans ofrece para potenciar tu aprendizaje.
        </p>
        
        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map(feature => (
            <motion.div 
              key={feature.id} 
              className="feature-card"
              variants={itemVariants}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
