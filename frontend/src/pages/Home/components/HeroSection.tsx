import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Challenge Plans
        </motion.h1>
        
        <motion.h2 
          className="hero-subtitle"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Plataforma de Aprendizaje Colaborativo
        </motion.h2>
        
        <motion.p 
          className="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Crea, participa y comparte retos académicos, planes de estudio y apuntes en un entorno gamificado diseñado para potenciar tu aprendizaje colaborativo.
        </motion.p>
        
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link to="/register" className="button button-primary">
            Únete Ahora
          </Link>
          <Link to="/challenges" className="button button-secondary">
            Explorar Retos
          </Link>
        </motion.div>
      </div>
      
      <motion.div 
        className="hero-image"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="hero-image-container">
          <div className="floating-element element-1">
            <span className="icon">🎯</span>
            <span className="text">Retos</span>
          </div>
          <div className="floating-element element-2">
            <span className="icon">📚</span>
            <span className="text">Planes de Estudio</span>
          </div>
          <div className="floating-element element-3">
            <span className="icon">🏆</span>
            <span className="text">Recompensas</span>
          </div>
          <div className="floating-element element-4">
            <span className="icon">📝</span>
            <span className="text">Apuntes</span>
          </div>
          <img src="/images/hero-illustration.svg" alt="Colaboración y Aprendizaje" className="main-illustration" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
