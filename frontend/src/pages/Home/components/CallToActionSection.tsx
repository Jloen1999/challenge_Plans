import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CallToActionSection.css';

const CallToActionSection: React.FC = () => {
  return (
    <section className="section cta-section">
      <div className="section-container">
        <div className="cta-content">
          <motion.h2 
            className="cta-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            ¡Comienza tu viaje de aprendizaje hoy!
          </motion.h2>
          
          <motion.p 
            className="cta-description"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Únete a miles de estudiantes que están transformando su forma de aprender, 
            compartiendo conocimientos y superando desafíos juntos en nuestra plataforma.
          </motion.p>
          
          <motion.div 
            className="cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link to="/register" className="cta-button main-button">
              Crear Cuenta Gratuita
            </Link>
            <Link to="/about" className="cta-button secondary-button">
              Conoce Más
            </Link>
          </motion.div>
        </div>
        
        <div className="cta-features">
          <motion.div 
            className="cta-feature-item"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <span className="cta-feature-icon">✨</span>
            </div>
            <div className="feature-text">
              <h4>Retos Personalizables</h4>
              <p>Adapta cada desafío a tus necesidades de aprendizaje</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="cta-feature-item"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="feature-icon-wrapper">
              <span className="cta-feature-icon">🔒</span>
            </div>
            <div className="feature-text">
              <h4>Entorno Seguro</h4>
              <p>Tu información y contenido siempre protegidos</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="cta-feature-item"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="feature-icon-wrapper">
              <span className="cta-feature-icon">💯</span>
            </div>
            <div className="feature-text">
              <h4>100% Gratuito</h4>
              <p>Accede a todas las funciones sin costo</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="cta-background-decoration"></div>
    </section>
  );
};

export default CallToActionSection;
