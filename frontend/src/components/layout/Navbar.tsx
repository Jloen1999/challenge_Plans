import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/layout/Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
            Inicio
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/acerca" className={({isActive}) => isActive ? 'active' : ''}>
            Acerca De
          </NavLink>
        </li>
        
        {isAuthenticated && (
          <>
            <li className="nav-item">
              <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/retos?visibilidad=publica" className={({isActive}) => isActive ? 'active' : ''}>
                Retos
              </NavLink>
            </li>
            <li className="nav-item">
              <button onClick={logout} className="nav-button">
                Cerrar Sesión
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
