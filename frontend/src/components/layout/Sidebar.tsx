import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/layout/Sidebar.css';

const Sidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <aside className="sidebar">
      {!isAuthenticated ? (
        <div className="sidebar-section">
          <h3>Únete a Challenge Plans</h3>
          <p>Regístrate para participar en retos de programación y mejorar tus habilidades.</p>
          <div className="sidebar-cta">
            <Link to="/registro" className="btn btn-primary btn-block">Registrarse</Link>
            <Link to="/login" className="btn btn-secondary btn-block mt-2">Iniciar Sesión</Link>
          </div>
        </div>
      ) : (
        <div className="sidebar-section">
          <h3>Perfil de Usuario</h3>
          <div className="user-profile">
            <h4>{user?.nombre}</h4>
            <p>Puntuación: {user?.puntaje || 0} pts</p>
            <Link to="/perfil" className="btn btn-secondary btn-sm">Ver perfil</Link>
          </div>
        </div>
      )}
      
      <div className="sidebar-section">
        <h3>Próximos Retos</h3>
        <ul className="upcoming-challenges">
          <li>Challenge React - 15 Jun</li>
          <li>TypeScript Pro - 22 Jun</li>
          <li>Node.js Master - 01 Jul</li>
        </ul>
      </div>
      
      {isAuthenticated && (
        <div className="sidebar-section">
          <h3>Ver</h3>
          <ul className="quick-actions">
            <li><Link to="/retos?visibilidad=publica">Mis Retos</Link></li>
            <li><Link to="/apuntes/mis-apuntes">Mis apuntes</Link></li>
            <li><Link to="/planes/mis-planes">Mis planes de estudio</Link></li>
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
