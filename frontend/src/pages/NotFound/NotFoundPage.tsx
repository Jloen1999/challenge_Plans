import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      <motion.div 
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="error-code"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.div>
        
        <h1 className="not-found-title">¡Página no encontrada!</h1>
        
        <p className="not-found-description">
          La página que estás buscando no existe o ha sido movida.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="back-home-button">
            Volver al Inicio
          </Link>
          
          <Link to="/contacto" className="contact-button">
            Contactar Soporte
          </Link>
        </div>
        
        <div className="illustration-container">
          <img 
            src="/images/404-illustration.svg" 
            alt="Página no encontrada" 
            className="not-found-illustration"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
