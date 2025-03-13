import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Divider,
  TextField,
  LinearProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  EmojiEvents as RetosIcon,
  MenuBook as ApuntesIcon,
  TrendingUp as StatsIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getRetosMock, getPlanesMock, getApuntesMock, getProgresoRetoMock } from '../mock/data';
import toast from 'react-hot-toast';
import LoadingState from '../components/common/LoadingState';
import RetoCard from '../components/retos/RetoCard';
import PlanCard from '../components/planes/PlanCard';
import ApunteCard from '../components/apuntes/ApunteCard';
import EmptyState from '../components/common/EmptyState';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userStats, setUserStats] = useState({
    retosCompletados: 0,
    apuntesCreados: 0,
    retosCreados: 0,
    planesCreados: 0
  });
  
  const [userContent, setUserContent] = useState({
    misRetos: [],
    misRetosCreados: [],
    misPlanes: [],
    misApuntes: []
  });
  
  const [profileData, setProfileData] = useState({
    nombre: currentUser?.nombre || '',
    email: currentUser?.email || '',
    biografia: currentUser?.biografia || '',
    nivel: currentUser?.nivel || 1,
    puntaje: currentUser?.puntaje || 0,
    avatar: currentUser?.avatar || null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          console.error("No hay usuario autenticado");
          return;
        }
        
        const retosData = await getRetosMock();
        const planesData = await getPlanesMock();
        const apuntesData = await getApuntesMock();
        
        // Retos en los que participa el usuario
        const retosParticipados = retosData.filter((_, index) => index < 3);
        const retosConProgreso = await Promise.all(
          retosParticipados.map(async (reto) => {
            const progreso = await getProgresoRetoMock(currentUser.id, reto.id);
            return { ...reto, progreso: progreso.progreso || 0 };
          })
        );
        
        // Retos creados por el usuario
        const retosCreados = retosData.filter(reto => reto.creador_id === currentUser.id);
        
        // Planes creados por el usuario
        const planesCreados = planesData.filter(plan => plan.usuario_id === currentUser.id);
        
        // Apuntes creados por el usuario
        const apuntesCreados = apuntesData.filter(apunte => apunte.usuario_id === currentUser.id);
        
        // Actualizar contenido
        setUserContent({
          misRetos: retosConProgreso,
          misRetosCreados: retosCreados,
          misPlanes: planesCreados,
          misApuntes: apuntesCreados
        });
        
        // Actualizar estadísticas
        setUserStats({
          retosCompletados: retosConProgreso.filter(r => r.progreso === 100).length,
          apuntesCreados: apuntesCreados.length,
          retosCreados: retosCreados.length,
          planesCreados: planesCreados.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        toast.error('Error al cargar datos del perfil');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setProfileData(prev => ({ ...prev, avatar: file }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // En una implementación real, aquí se enviarían los datos al servidor
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular tiempo de carga
      
      // Actualizar perfil en contexto
      await updateUserProfile({
        ...profileData,
        avatar: avatarPreview || currentUser.avatar
      });
      
      toast.success('Perfil actualizado correctamente');
      setEditMode(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setProfileData({
      nombre: currentUser?.nombre || '',
      email: currentUser?.email || '',
      biografia: currentUser?.biografia || '',
      nivel: currentUser?.nivel || 1,
      puntaje: currentUser?.puntaje || 0,
      avatar: currentUser?.avatar || null
    });
    setAvatarPreview(null);
    setEditMode(false);
  };

  if (loading) {
    return <LoadingState message="Cargando perfil..." />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Grid container spacing={3}>
        {/* Columna izquierda - Información del perfil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  src={avatarPreview || currentUser?.avatar || undefined} 
                  alt={currentUser?.nombre}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                {editMode && (
                  <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                    <input
                      accept="image/*"
                      id="avatar-upload"
                      type="file"
                      hidden
                      onChange={handleAvatarChange}
                    />
                    <IconButton
                      component="label"
                      htmlFor="avatar-upload"
                      sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              {editMode ? (
                <TextField
                  name="nombre"
                  value={profileData.nombre}
                  onChange={handleInputChange}
                  variant="standard"
                  inputProps={{ style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' } }}
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h5" fontWeight="bold" align="center">
                  {currentUser?.nombre}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={`Nivel ${currentUser?.nivel || 1}`} 
                  color="primary" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.puntaje || 0} puntos
                </Typography>
              </Box>

              {!editMode && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Editar perfil
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {editMode ? (
              <>
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Email
                </Typography>
                <TextField
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Biografía
                </Typography>
                <TextField
                  name="biografia"
                  value={profileData.biografia}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Cuéntanos sobre ti..."
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Guardar cambios
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body2" paragraph>
                  {currentUser?.email}
                </Typography>
                
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Biografía
                </Typography>
                <Typography variant="body2" paragraph>
                  {currentUser?.biografia || 'No hay biografía disponible'}
                </Typography>
                
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Miembro desde
                </Typography>
                <Typography variant="body2">
                  {currentUser?.fecha_registro || 'No disponible'}
                </Typography>
              </>
            )}
          </Paper>
          
          {/* Estadísticas */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
              mt: 3 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StatsIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6" fontWeight="medium">
                Estadísticas
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Retos completados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {userStats.retosCompletados}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Apuntes creados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {userStats.apuntesCreados}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Retos creados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {userStats.retosCreados}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Planes creados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {userStats.planesCreados}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Columna derecha - Contenido del usuario */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<RetosIcon />} label="Mis retos" iconPosition="start" />
              <Tab icon={<RetosIcon />} label="Retos creados" iconPosition="start" />
              <Tab icon={<MenuBook />} label="Mis planes" iconPosition="start" />
              <Tab icon={<ApuntesIcon />} label="Mis apuntes" iconPosition="start" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {/* Mis retos */}
              {tabValue === 0 && (
                <Box>
                  {userContent.misRetos.length > 0 ? (
                    <Grid container spacing={3}>
                      {userContent.misRetos.map((reto) => (
                        <Grid item xs={12} md={6} key={reto.id}>
                          <RetoCard reto={reto} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState 
                      message="No estás participando en ningún reto actualmente" 
                      buttonText="Explorar retos"
                      buttonLink="/retos"
                    />
                  )}
                </Box>
              )}
              
              {/* Retos creados */}
              {tabValue === 1 && (
                <Box>
                  {userContent.misRetosCreados.length > 0 ? (
                    <Grid container spacing={3}>
                      {userContent.misRetosCreados.map((reto) => (
                        <Grid item xs={12} md={6} key={reto.id}>
                          <RetoCard reto={reto} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState 
                      message="Aún no has creado ningún reto" 
                      buttonText="Crear mi primer reto"
                      buttonLink="/retos/create"
                    />
                  )}
                </Box>
              )}
              
              {/* Mis planes */}
              {tabValue === 2 && (
                <Box>
                  {userContent.misPlanes.length > 0 ? (
                    <Grid container spacing={3}>
                      {userContent.misPlanes.map((plan) => (
                        <Grid item xs={12} md={6} key={plan.id}>
                          <PlanCard plan={plan} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState 
                      message="Aún no has creado ningún plan de estudio" 
                      buttonText="Crear mi primer plan"
                      buttonLink="/planes/create"
                    />
                  )}
                </Box>
              )}
              
              {/* Mis apuntes */}
              {tabValue === 3 && (
                <Box>
                  {userContent.misApuntes.length > 0 ? (
                    <Grid container spacing={3}>
                      {userContent.misApuntes.map((apunte) => (
                        <Grid item xs={12} md={6} key={apunte.id}>
                          <ApunteCard apunte={apunte} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <EmptyState 
                      message="Aún no has creado ningún apunte" 
                      buttonText="Crear mi primer apunte"
                      buttonLink="/apuntes/create"
                    />
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Profile;
