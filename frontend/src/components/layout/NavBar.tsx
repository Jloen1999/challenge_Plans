import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './NavBar.css';

const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Detectar scroll para cambiar estilo de navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    // Verificar inmediatamente al montar el componente
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen && 
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen && window.innerWidth < 993) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className={`navbar-container ${isMenuOpen ? 'menu-active' : ''}`}>
          {/* Logo siempre visible */}
          <Link to="/" className="navbar-logo">
            <img src="/images/logo.webp" alt="Challenge Plans Logo" className="logo-image" />
            <span className="logo-text">Challenge Plans</span>
          </Link>
          
          {/* Navegación desktop que se oculta cuando el menú está activo */}
          <nav className="navbar-nav desktop-nav">
            <Link to="/planes" className="nav-link">Planes de Estudio</Link>
            <Link to="/retos" className="nav-link">Retos</Link>
            <Link to="/comunidad" className="nav-link">Comunidad</Link>
            <Link to="/aprende" className="nav-link">Recursos</Link>
          </nav>
          
          <div className="navbar-right">
            <div className="auth-buttons">
              <Link to="/login" className="nav-button secondary">Iniciar Sesión</Link>
              <Link to="/register" className="nav-button primary">Registrarse</Link>
            </div>
            
            <button 
              ref={buttonRef}
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              className="mobile-menu"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="mobile-nav">
                <Link to="/planes" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Planes de Estudio
                </Link>
                <Link to="/retos" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Retos
                </Link>
                <Link to="/comunidad" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Comunidad
                </Link>
                <Link to="/aprende" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Recursos
                </Link>
              </nav>
              
              <div className="mobile-auth">
                <Link to="/login" className="mobile-auth-button secondary" onClick={() => setIsMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="mobile-auth-button primary" onClick={() => setIsMenuOpen(false)}>
                  Registrarse
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div style={{ height: '80px' }}></div>
    </>
  );
};

export default NavBar;
