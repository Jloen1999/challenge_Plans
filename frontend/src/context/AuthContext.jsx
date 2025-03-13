import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const user = authService.getCurrentUser();
        
        // Si no hay usuario en localStorage, crear uno de prueba
        if (!user) {
          const mockUser = {
            id: 'user-1',
            nombre: 'Usuario Demo',
            email: 'usuario@example.com',
            avatar: '/assets/avatars/avatar1.jpg',
            nivel: 3,
            puntaje: 1250,
            biografia: 'Usuario de demostración para la aplicación Challenge Plans.',
            fecha_registro: '2023-01-15'
          };
          
          // Guardar en localStorage
          localStorage.setItem('user', JSON.stringify(mockUser));
          setCurrentUser(mockUser);
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      // En una implementación real, esto se conectaría con el backend
      // Simulamos un login exitoso
      const mockUser = {
        id: 'user-1',
        nombre: 'Usuario Demo',
        email: email,
        avatar: '/assets/avatars/avatar1.jpg',
        nivel: 3,
        puntaje: 1250,
        biografia: 'Usuario de demostración para la aplicación Challenge Plans.',
        fecha_registro: '2023-01-15'
      };

      // Guardar en localStorage
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setCurrentUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    setLoading(true);
    try {
      // En una implementación real, esto se conectaría con el backend
      // Simulamos un registro exitoso
      const mockUser = {
        id: 'user-' + Date.now(),
        nombre: userData.nombre,
        email: userData.email,
        avatar: '/assets/avatars/avatar1.jpg',
        nivel: 1,
        puntaje: 0,
        biografia: '',
        fecha_registro: new Date().toISOString().split('T')[0]
      };

      // Guardar en localStorage
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setCurrentUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Función para actualizar el perfil del usuario
  const updateUserProfile = async (profileData) => {
    setLoading(true);
    try {
      // En una implementación real, esto se conectaría con el backend
      // Simulamos una actualización exitosa
      const updatedUser = {
        ...currentUser,
        ...profileData
      };

      // Actualizar en localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valores a compartir en el contexto
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
