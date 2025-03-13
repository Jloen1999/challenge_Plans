import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Alert,
  Paper,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  AssignmentTurnedIn as CompletedIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Assignment as TareasIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as ProgressIcon,
  People as PeopleIcon,
  EmojiEvents as RetosIcon,
  School as ApuntesIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getRetoByIdMock,
  getProgresoRetoMock,
  getTareasByRetoIdMock,
  getApuntesMock
} from '../../mock/data';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import TareaCard from '../../components/tareas/TareaCard';
import ApunteCard from '../../components/apuntes/ApunteCard';
import toast from 'react-hot-toast';

// Mapa de colores para dificultades
const difficultyColorMap = {
  principiante: 'success',
  intermedio: 'warning',
  avanzado: 'error'
};

const RetoDetail = () => {
  const { retoId } = useParams();
  const { currentUser } = useAuth();
  const [reto, setReto] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [apuntes, setApuntes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    const fetchRetoDetails = async () => {
      try {
        setLoading(true);
        const retoData = await getRetoByIdMock(retoId);
        
        if (!retoData) {
          setError('Reto no encontrado');
          setLoading(false);
          return;
        }
        
        setReto(retoData);
        
        // Obtener el progreso del usuario en el reto
        if (currentUser) {
          const progresoData = await getProgresoRetoMock(currentUser.id, retoId);
          setProgreso(progresoData);
          setIsParticipating(progresoData.progreso !== undefined);
        }

        // Obtener las tareas del reto
        const tareasData = await getTareasByRetoIdMock(retoId);
        setTareas(tareasData);

        // Obtener apuntes relacionados con el reto
        const allApuntes = await getApuntesMock();
        const retoApuntes = allApuntes.filter(apunte => apunte.reto_id === retoId);
        setApuntes(retoApuntes);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles del reto:", err);
        setError('Error al cargar los detalles del reto');
        setLoading(false);
      }
    };

    fetchRetoDetails();
  }, [retoId, currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleJoinReto = () => {
    toast.success('Te has unido al reto exitosamente');
    setIsParticipating(true);
    setProgreso({ progreso: 0, tareas_completadas: [] });
  };

  const handleLeaveReto = () => {
    toast.success('Has abandonado el reto');
    setIsParticipating(false);
    setProgreso(null);
  };

  if (loading) {
    return <LoadingState message="Cargando detalles del reto..." />;
  }

  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="Volver a retos"
        buttonLink="/retos"
      />
    );
  }

  if (!reto) {
    return (
      <EmptyState
        message="Reto no encontrado"
        buttonText="Volver a retos"
        buttonLink="/retos"
      />
    );
  }

  const difficultyColor = difficultyColorMap[reto.dificultad] || 'default';
  const fechaInicio = format(new Date(reto.fecha_inicio), 'dd MMM yyyy', { locale: es });
  const fechaFin = format(new Date(reto.fecha_fin), 'dd MMM yyyy', { locale: es });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box>
        {/* Encabezado del Reto */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {reto.titulo}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label={reto.dificultad}
                color={difficultyColor}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip
                icon={<CalendarIcon fontSize="small" />}
                label={`${fechaInicio} - ${fechaFin}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<PeopleIcon fontSize="small" />}
                label={`${reto.participantes} participantes`}
                size="small"
                variant="outlined"
              />
            </Box>
            <Typography variant="body1" paragraph>
              {reto.descripcion}
            </Typography>

            {/* Acciones del Reto */}
            <Box sx={{ my: 3 }}>
              {!isParticipating ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleJoinReto}
                  sx={{ mr: 2 }}
                >
                  Unirse al Reto
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLeaveReto}
                  sx={{ mr: 2 }}
                >
                  Abandonar Reto
                </Button>
              )}

              {currentUser?.id === reto.creador_id && (
                <>
                  <Tooltip title="Editar reto">
                    <IconButton 
                      color="primary" 
                      component={Link} 
                      to={`/retos/${retoId}/edit`}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar reto">
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Grid>

          {/* Tarjeta de Progreso */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium">
                  Tu Progreso
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <ProgressIcon />
                </Avatar>
              </Box>
              
              {isParticipating ? (
                <>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {progreso?.progreso || 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progreso?.progreso || 0} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {progreso?.tareas_completadas?.length || 0} de {tareas.length} tareas completadas
                  </Typography>
                </>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Únete al reto para registrar tu progreso
                </Alert>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Información del creador */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    Creado por
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reto.creador_nombre}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Pestañas de Contenido */}
        <Box sx={{ mt: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 100
              }
            }}
          >
            <Tab icon={<TareasIcon />} label="Tareas" iconPosition="start" />
            <Tab icon={<ApuntesIcon />} label="Apuntes" iconPosition="start" />
            <Tab icon={<PeopleIcon />} label="Participantes" iconPosition="start" />
          </Tabs>
          
          {/* Panel de Tareas */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Tareas del Reto
                </Typography>
                {currentUser?.id === reto.creador_id && (
                  <Button 
                    variant="contained" 
                    size="small" 
                    component={Link} 
                    to={`/retos/${retoId}/tareas/create`}
                  >
                    Añadir Tarea
                  </Button>
                )}
              </Box>
              
              {tareas.length > 0 ? (
                <Grid container spacing={3}>
                  {tareas.map((tarea, index) => (
                    <Grid item xs={12} md={6} key={tarea.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TareaCard 
                          tarea={tarea} 
                          isCompleted={progreso?.tareas_completadas?.some(t => t.tarea_id === tarea.id)}
                          onComplete={() => toast.success(`Tarea "${tarea.titulo}" marcada como completada`)}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState 
                  message="Aún no hay tareas en este reto" 
                  icon={<TareasIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />}
                  buttonText={currentUser?.id === reto.creador_id ? "Añadir Tarea" : undefined}
                  buttonLink={currentUser?.id === reto.creador_id ? `/retos/${retoId}/tareas/create` : undefined}
                />
              )}
            </Box>
          )}
          
          {/* Panel de Apuntes */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Apuntes Compartidos
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  component={Link} 
                  to={`/apuntes/create?retoId=${retoId}`}
                >
                  Crear Apunte
                </Button>
              </Box>
              
              {apuntes.length > 0 ? (
                <Grid container spacing={3}>
                  {apuntes.map((apunte, index) => (
                    <Grid item xs={12} md={4} key={apunte.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ApunteCard apunte={apunte} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState 
                  message="Aún no hay apuntes compartidos en este reto" 
                  icon={<ApuntesIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />}
                  buttonText="Crear el primer apunte"
                  buttonLink={`/apuntes/create?retoId=${retoId}`}
                />
              )}
            </Box>
          )}
          
          {/* Panel de Participantes */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Participantes ({reto.participantes})
              </Typography>
              
              {/* Aquí iría la lista de participantes, pero como es mock, mostramos un estado vacío */}
              <EmptyState 
                message="La información detallada de participantes estará disponible próximamente" 
                icon={<PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />}
              />
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default RetoDetail;
