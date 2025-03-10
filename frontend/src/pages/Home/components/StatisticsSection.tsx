import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import './StatisticsSection.css';

const StatisticsSection: React.FC = () => {
  const [viewPortEntered, setViewPortEntered] = useState(false);
  
  const statistics = [
    {
      id: 1,
      value: 15000,
      label: 'Estudiantes Activos',
      icon: '👥'
    },
    {
      id: 2,
      value: 2500,
      label: 'Retos Completados',
      icon: '🎯'
    },
    {
      id: 3,
      value: 1800,
      label: 'Planes de Estudio',
      icon: '📚'
    },
    {
      id: 4,
      value: 8500,
      label: 'Apuntes Compartidos',
      icon: '📝'
    }
  ];

  const onVisibilityChange = (isVisible: boolean) => {
    if (isVisible) {
      setViewPortEntered(true);
    }
  };

  return (
    <section className="section statistics-section">
      <div className="section-container">
        <h2 className="section-title">Nuestro Impacto</h2>
        <p className="section-subtitle">
          Conoce el alcance de nuestra plataforma y cómo estamos transformando el aprendizaje colaborativo
        </p>
        
        <VisibilitySensor 
          onChange={onVisibilityChange} 
          offset={{ top: 10 }} 
          delayedCall
        >
          <div className="statistics-grid">
            {statistics.map((stat) => (
              <motion.div 
                key={stat.id} 
                className="statistic-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.id * 0.1 }}
              >
                <div className="statistic-icon">{stat.icon}</div>
                <div className="statistic-value">
                  <CountUp 
                    start={0} 
                    end={viewPortEntered ? stat.value : 0}
                    duration={2.5}
                    separator=","
                  />
                </div>
                <div className="statistic-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </VisibilitySensor>
      </div>
    </section>
  );
};

export default StatisticsSection;
