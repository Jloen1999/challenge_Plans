import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  EmojiEvents as RetosIcon,
  MenuBook as PlanesIcon,
  School as ApuntesIcon,
  Assignment as TareasIcon,
  CalendarMonth as CalendarIcon,
  Group as UsersIcon,
  Star as StarIcon,
  Task as TaskIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRetosMock, getPlanesMock, getApuntesMock } from '../mock/data';
import { getTareasByRetoIdMock } from '../mock/mockApi';
import toast from 'react-hot-toast';
import RetoCard from '../components/retos/RetoCard';
import PlanCard from '../components/planes/PlanCard';
import ApunteCard from '../components/apuntes/ApunteCard';
import LoadingState from '../components/common/LoadingState';
import TaskListItem from '../components/tareas/TaskListItem';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [retosActivos, setRetosActivos] = useState([]);
  const [planesRecientes, setPlanesRecientes] = useState([]);
  const [apuntesRecientes, setApuntesRecientes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [tareasProximas, setTareasProximas] = useState([]);
  const [stats, setStats] = useState({
    retosCompletados: 0,
    retosActivos: 0,
    apuntesCreados: 0,
    nivelActual: 1,
    experiencia: 75, // porcentaje para el siguiente nivel
    puntosTotales: 750
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Obtener datos para el dashboard
        const [retos, planes, apuntes, tareas] = await Promise.all([
          getRetosMock(),
          getPlanesMock(),
          getApuntesMock(),
          getTareasByRetoIdMock()
        ]);

        // Filtrar datos relevantes para el usuario
        const retosDelUsuario = retos.filter((_, index) => index < 3);
        const planesDelUsuario = planes.filter((_, index) => index < 2);
        const apuntesDelUsuario = apuntes.filter((_, index) => index < 4);
        const tareasDelUsuario = tareas.filter((_, index) => index < 5);

        // Actualizar estados
        setRetosActivos(retosDelUsuario);
        setPlanesRecientes(planesDelUsuario);
        setApuntesRecientes(apuntesDelUsuario);
        setTareasPendientes(tareasDelUsuario);
        setTareasProximas(tareasDelUsuario); // Simulación de próximas tareas

        // Actualizar estadísticas (simuladas)
        setStats({
          retosCompletados: 5,
          retosActivos: 3,
          apuntesCreados: 12,
          nivelActual: currentUser?.nivel || 1,
          experiencia: 75, // porcentaje para el siguiente nivel
          puntosTotales: currentUser?.puntaje || 750
        });

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        toast.error('Error al cargar el dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return <LoadingState message="Cargando dashboard..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Bienvenido{currentUser ? `, ${currentUser.nombre}` : ''}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu resumen de actividades y progreso
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium" color="text.secondary">
                Nivel Actual
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                <StarIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.nivelActual}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Progreso hacia nivel {stats.nivelActual + 1}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={stats.experiencia} 
              sx={{ height: 6, borderRadius: 3, mt: 'auto' }} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium" color="text.secondary">
                Puntos Totales
              </Typography>
              <Avatar sx={{ bgcolor: 'warning.main', width: 36, height: 36 }}>
                <TrendingUpIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.puntosTotales}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
              Obtenidos en diferentes actividades
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium" color="text.secondary">
                Retos Activos
              </Typography>
              <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                <RetosIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.retosActivos}
            </Typography>
            <Box sx={{ display: 'flex', mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                {stats.retosCompletados} retos completados
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" component={Link} to="/retos" color="primary" sx={{ textDecoration: 'none' }}>
                Ver todos
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium" color="text.secondary">
                Apuntes Creados
              </Typography>
              <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36 }}>
                <ApuntesIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.apuntesCreados}
            </Typography>
            <Box sx={{ display: 'flex', mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                Compartiendo conocimiento
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" component={Link} to="/apuntes" color="primary" sx={{ textDecoration: 'none' }}>
                Ver todos
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={8}>
          {/* Retos en progreso */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Retos en Progreso
              </Typography>
              <Button 
                component={Link} 
                to="/retos?filter=mios"
                variant="text"
              >
                Ver todos
              </Button>
            </Box>
            <Grid container spacing={3}>
              {retosActivos.map((reto) => (
                <Grid item xs={12} sm={6} key={reto.id}>
                  <RetoCard reto={reto} />
                </Grid>
              ))}
              {retosActivos.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="body1" color="text.secondary">
                      No tienes retos activos. ¡Únete a un reto para comenzar!
                    </Typography>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/retos"
                      sx={{ mt: 2 }}
                    >
                      Explorar retos
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Planes de estudio recientes */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Planes de Estudio Recientes
              </Typography>
              <Button 
                component={Link} 
                to="/planes"
                variant="text"
              >
                Ver todos
              </Button>
            </Box>
            <Grid container spacing={3}>
              {planesRecientes.map((plan) => (
                <Grid item xs={12} sm={6} key={plan.id}>
                  <PlanCard plan={plan} />
                </Grid>
              ))}
              {planesRecientes.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="body1" color="text.secondary">
                      No tienes planes de estudio. ¡Crea uno nuevo!
                    </Typography>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/planes/create"
                      sx={{ mt: 2 }}
                    >
                      Crear plan
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={4}>
          {/* Tareas pendientes */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Tareas Pendientes
              </Typography>
              <TareasIcon color="action" />
            </Box>
            {tareasPendientes.length > 0 ? (
              <List disablePadding>
                {tareasPendientes.map((tarea, index) => (
                  <React.Fragment key={tarea.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      disablePadding
                      sx={{ py: 2 }}
                      component={Link}
                      to={`/tareas/${tarea.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={tarea.titulo}
                        secondary={
                          <React.Fragment>
                            <Typography variant="caption" component="span" color="text.primary">
                              {tarea.reto?.titulo} • 
                            </Typography>
                            {` ${tarea.puntos} pts`}
                          </React.Fragment>
                        }
                      />
                      <Chip 
                        label={tarea.fecha_limite ? `Vence: ${new Date(tarea.fecha_limite).toLocaleDateString()}` : 'Sin fecha'} 
                        size="small" 
                        color="default" 
                        variant="outlined"
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay tareas pendientes
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/retos"
                  sx={{ mt: 2 }}
                >
                  Explorar retos
                </Button>
              </Box>
            )}
          </Paper>

          {/* Últimos apuntes */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Últimos Apuntes
              </Typography>
              <Button 
                component={Link} 
                to="/apuntes/create"
                variant="contained"
                size="small"
              >
                Crear Nuevo
              </Button>
            </Box>
            {apuntesRecientes.length > 0 ? (
              <Grid container spacing={2}>
                {apuntesRecientes.slice(0, 2).map((apunte) => (
                  <Grid item xs={12} key={apunte.id}>
                    <ApunteCard apunte={apunte} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No has creado ningún apunte todavía
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/apuntes/create"
                  sx={{ mt: 2 }}
                >
                  Crear apunte
                </Button>
              </Box>
            )}
          </Paper>

          {/* Calendario o eventos próximos */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Próximos Eventos
              </Typography>
              <CalendarIcon color="action" />
            </Box>
            <List disablePadding>
              <ListItem disablePadding sx={{ pb: 2 }}>
                <ListItemText 
                  primary="Fecha límite: Reto JavaScript Avanzado"
                  secondary="En 3 días"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disablePadding sx={{ py: 2 }}>
                <ListItemText 
                  primary="Nuevo reto: Desarrollo con React"
                  secondary="Comienza en 5 días"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disablePadding sx={{ pt: 2 }}>
                <ListItemText 
                  primary="Evaluación: Algoritmos y Estructuras de Datos"
                  secondary="En 1 semana"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Sección de próximas tareas */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TaskIcon sx={{ mr: 1 }} color="primary" />
                  Próximas tareas
                </Box>
              </Typography>
              <Button component={Link} to="/retos" size="small">
                Ver todos
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {tareasProximas.length > 0 ? (
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {tareasProximas.map((tarea, index) => (
                  <TaskListItem 
                    key={tarea.id}
                    tarea={tarea}
                    completed={index % 3 === 0} // Simular algunas tareas completadas
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No tienes tareas pendientes
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Dashboard;
