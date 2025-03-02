import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/layout/Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Challenge Plans</h3>
          <p>Mejora tus habilidades a través de retos diarios de programación y planes de estudio personalizados.</p>
        </div>
        
        <div className="footer-section">
          <h3>Enlaces</h3>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/acerca">Acerca De</Link></li>
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/registro">Registrarse</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contáctanos</h3>
          <p>support@challengeplans.com</p>
          <p>+34 123 456 789</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Challenge Plans. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
