import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../components/layouts/MainLayout';

// Páginas públicas
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Páginas privadas
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

// Retos
import RetosList from '../pages/retos/RetosList';
import RetoDetail from '../pages/retos/RetoDetail';
import CreateReto from '../pages/retos/CreateReto';

// Tareas
import TareaDetail from '../pages/tareas/TareaDetail';

// Planes de estudio
import PlanesEstudio from '../pages/planes/PlanesEstudio';
import PlanDetail from '../pages/planes/PlanDetail';
import CreatePlan from '../pages/planes/CreatePlan';

// Apuntes
import ApuntesList from '../pages/apuntes/ApuntesList';
import ApunteDetail from '../pages/apuntes/ApunteDetail';
import CreateApunte from '../pages/apuntes/CreateApunte';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Componente para redireccionar si ya está autenticado
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return !currentUser ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Rutas privadas */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Rutas de Retos */}
        <Route path="retos">
          <Route index element={<RetosList />} />
          <Route path=":retoId" element={<RetoDetail />} />
          <Route path="create" element={<CreateReto />} />
          <Route path=":retoId/edit" element={<CreateReto />} />
        </Route>
        
        {/* Rutas de Tareas */}
        <Route path="tareas">
          <Route path=":tareaId" element={<TareaDetail />} />
        </Route>
        
        {/* Rutas de Planes de Estudio */}
        <Route path="planes">
          <Route index element={<PlanesEstudio />} />
          <Route path=":planId" element={<PlanDetail />} />
          <Route path="create" element={<CreatePlan />} />
          <Route path=":planId/edit" element={<CreatePlan />} />
        </Route>
        
        {/* Rutas de Apuntes */}
        <Route path="apuntes">
          <Route index element={<ApuntesList />} />
          <Route path=":apunteId" element={<ApunteDetail />} />
          <Route path="create" element={<CreateApunte />} />
          <Route path=":apunteId/edit" element={<CreateApunte />} />
        </Route>
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
