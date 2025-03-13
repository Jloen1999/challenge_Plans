import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
  Avatar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as RetosIcon,
  MenuBook as ApuntesIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { getPlanByIdMock, getRetosMock, getApuntesMock } from '../../mock/data';
import RetoCard from '../../components/retos/RetoCard';
import ApunteCard from '../../components/apuntes/ApunteCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const PlanDetail = () => {
  const { planId } = useParams();
  const { currentUser } = useAuth();
  const [plan, setPlan] = useState(null);
  const [retos, setRetos] = useState([]);
  const [apuntes, setApuntes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const planData = await getPlanByIdMock(planId);

        if (!planData) {
          setError('Plan de estudio no encontrado');
          setLoading(false);
          return;
        }

        setPlan(planData);

        // Simular carga de retos asociados al plan
        const allRetos = await getRetosMock();
        const planRetos = allRetos.filter((_, index) => index % 2 === 0).slice(0, 3);
        setRetos(planRetos);

        // Simular carga de apuntes asociados al plan
        const allApuntes = await getApuntesMock();
        const planApuntes = allApuntes.filter((_, index) => index % 2 === 1).slice(0, 2);
        setApuntes(planApuntes);

        // Calcular progreso simulado
        const progresoSimulado = Math.floor(Math.random() * 100);
        setProgreso(progresoSimulado);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles del plan:", err);
        setError('Error al cargar los detalles del plan');
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingState message="Cargando detalles del plan..." />;
  }

  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="Volver a planes de estudio"
        buttonLink="/planes"
      />
    );
  }

  if (!plan) {
    return (
      <EmptyState
        message="Plan de estudio no encontrado"
        buttonText="Volver a planes de estudio"
        buttonLink="/planes"
      />
    );
  }

  const fechaInicio = format(new Date(plan.fecha_inicio), 'dd MMM yyyy', { locale: es });
  const fechaFin = plan.fecha_inicio && plan.duracion_dias ? 
    format(addDays(new Date(plan.fecha_inicio), plan.duracion_dias), 'dd MMM yyyy', { locale: es }) : 
    'No definida';

  const isOwner = currentUser?.id === plan.usuario_id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box mb={2}>
        <Button
          component={Link}
          to="/planes"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver a planes de estudio
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {plan.titulo}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<EventIcon fontSize="small" />}
              label={`${fechaInicio} - ${fechaFin}`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<TimeIcon fontSize="small" />}
              label={`${plan.duracion_dias} días`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<RetosIcon fontSize="small" />}
              label={`${plan.retos_count} retos`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<ApuntesIcon fontSize="small" />}
              label={`${plan.apuntes_count} apuntes`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {plan.descripcion}
          </Typography>

          {/* Acciones del plan */}
          <Box sx={{ mb: 4 }}>
            {isOwner && (
              <Box>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to={`/planes/${planId}/edit`}
                  startIcon={<EditIcon />}
                  sx={{ mr: 2 }}
                >
                  Editar Plan
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => toast.error('Función no implementada en la versión de demostración')}
                >
                  Eliminar Plan
                </Button>
              </Box>
            )}
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  py: 1.5
                }
              }}
            >
              <Tab icon={<RetosIcon />} label="Retos" iconPosition="start" />
              <Tab icon={<ApuntesIcon />} label="Apuntes" iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Retos incluidos
                    </Typography>
                    {isOwner && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<AddIcon />}
                        onClick={() => toast.error('Función no implementada en la versión de demostración')}
                      >
                        Añadir Reto
                      </Button>
                    )}
                  </Box>

                  {retos.length > 0 ? (
                    <Grid container spacing={3}>
                      {retos.map((reto, index) => (
                        <Grid item xs={12} md={6} key={reto.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <RetoCard reto={reto} />
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState 
                      message="Este plan de estudio aún no tiene retos asignados" 
                      icon={<RetosIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />}
                      buttonText={isOwner ? "Añadir Reto" : undefined}
                      buttonAction={isOwner ? () => toast.error('Función no implementada en la versión de demostración') : undefined}
                    />
                  )}
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Apuntes recomendados
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      component={Link} 
                      to={`/apuntes/create?planId=${planId}`}
                      startIcon={<AddIcon />}
                    >
                      Crear Apunte
                    </Button>
                  </Box>

                  {apuntes.length > 0 ? (
                    <Grid container spacing={3}>
                      {apuntes.map((apunte, index) => (
                        <Grid item xs={12} md={6} key={apunte.id}>
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
                      message="Aún no hay apuntes en este plan de estudio" 
                      icon={<ApuntesIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />}
                      buttonText="Crear el primer apunte"
                      buttonLink={`/apuntes/create?planId=${planId}`}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Tarjeta de información del creador */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              mb: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Acerca del creador
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={plan.usuario_avatar || undefined}
                alt={plan.usuario_nombre}
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {plan.usuario_nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Creador del plan
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" paragraph>
              Este plan ha sido creado para guiarte a través de un proceso de aprendizaje estructurado.
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              onClick={() => toast.error('Función no implementada en la versión de demostración')}
            >
              Ver perfil
            </Button>
          </Paper>

          {/* Tarjeta de progreso */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Progreso del plan
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', my: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 150,
                }}
              >
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle
                    cx="75"
                    cy="75"
                    r="65"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r="65"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 65}
                    strokeDashoffset={2 * Math.PI * 65 * (1 - progreso / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3f51b5" />
                      <stop offset="100%" stopColor="#ff4081" />
                    </linearGradient>
                  </defs>
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {`${progreso}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ py: 1 }}>
                <RetosIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText 
                  primary={`${retos.length} de ${plan.retos_count} retos completados`} 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ApuntesIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <ListItemText 
                  primary={`${apuntes.length} de ${plan.apuntes_count} apuntes explorados`}
                  primaryTypographyProps={{ variant: 'body2' }} 
                />
              </ListItem>
            </List>
            
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => toast.success('¡Continúa tu aprendizaje!')}
            >
              Continuar aprendizaje
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default PlanDetail;
