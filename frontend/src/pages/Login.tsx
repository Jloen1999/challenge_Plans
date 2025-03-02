import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/AuthPage.css';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redireccionar si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <MainLayout showSidebar={false}>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-info">
            <h1>Bienvenido de nuevo</h1>
            <p>Inicia sesión para acceder a tu cuenta y continuar mejorando tus habilidades con Challenge Plans.</p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">Acceso seguro a tu cuenta</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🏆</span>
                <span className="feature-text">Continúa tus retos y progreso</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Visualiza tus estadísticas</span>
              </div>
            </div>
          </div>
          <div className="auth-form-wrapper">
            <LoginForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
