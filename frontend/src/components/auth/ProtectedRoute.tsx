import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras verificamos autenticación, no renderizamos nada
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  // Si no está autenticado, redireccionamos
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Si está autenticado, renderizamos el contenido de la ruta
  return <Outlet />;
};

export default ProtectedRoute;
