import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/AuthPage.css';

const Register: React.FC = () => {
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
            <h1>Únete a Challenge Plans</h1>
            <p>Crea tu cuenta y comienza a mejorar tus habilidades con retos diarios y planes personalizados.</p>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <span className="benefit-icon">🚀</span>
                <span className="benefit-text">Mejora tus habilidades día a día</span>
              </div>
              <div className="auth-benefit">
                <span className="benefit-icon">👥</span>
                <span className="benefit-text">Conéctate con otros desarrolladores</span>
              </div>
              <div className="auth-benefit">
                <span className="benefit-icon">📝</span>
                <span className="benefit-text">Crea y comparte planes de estudio</span>
              </div>
              <div className="auth-benefit">
                <span className="benefit-icon">🏆</span>
                <span className="benefit-text">Gana puntos e insignias por completar retos</span>
              </div>
            </div>
          </div>
          <div className="auth-form-wrapper">
            <RegisterForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
