import React, { useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
  AccountCircle as UserIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error al modificar campos
    if (error) {
      setError('');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'password123'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 8
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/assets/logo.png"
              alt="Logo"
              sx={{ height: 60, mb: 2 }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Challenge Plans
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Inicia sesión para continuar
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
                <MuiLink 
                  component={Link} 
                  to="/forgot-password"
                  underline="hover"
                  variant="body2"
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ mt: 1, mb: 3 }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>

              <Divider sx={{ my: 3 }}>o</Divider>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                onClick={handleDemoLogin}
                sx={{ mb: 2 }}
              >
                Iniciar con cuenta demo
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" display="inline">
                  ¿No tienes una cuenta?{' '}
                </Typography>
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  variant="body2" 
                  underline="hover"
                  fontWeight="medium"
                >
                  Regístrate
                </MuiLink>
              </Box>
            </form>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;
