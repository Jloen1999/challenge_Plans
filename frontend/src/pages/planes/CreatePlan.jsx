import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
  Stack,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRetosMock } from '../../mock/mockApi';
import toast from 'react-hot-toast';
import RetoSelectCard from '../../components/retos/RetoSelectCard';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const isEditing = Boolean(planId);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [availableRetos, setAvailableRetos] = useState([]);
  const [selectedRetos, setSelectedRetos] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: new Date(),
    duracion_dias: 30,
    es_publico: true,
    retos_ids: [],
    imagen: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRetos = async () => {
      try {
        const retosData = await getRetosMock();
        setAvailableRetos(retosData);
        
        // Si estamos editando, simular cargar datos del plan
        if (isEditing) {
          // En una aplicación real, aquí cargaríamos los datos del plan
          setFormData({
            titulo: 'Plan de Estudio de Ejemplo',
            descripcion: 'Descripción de ejemplo del plan de estudio',
            fecha_inicio: new Date(),
            duracion_dias: 45,
            es_publico: true,
            retos_ids: [retosData[0].id, retosData[2].id],
            imagen: null
          });
          
          // Establecer los retos seleccionados
          setSelectedRetos([retosData[0], retosData[2]]);
          setImagePreview('/assets/images/planes/default.jpg');
        }
      } catch (error) {
        console.error('Error al cargar retos:', error);
        toast.error('Error al cargar los retos disponibles');
      }
    };
    
    fetchRetos();
  }, [isEditing, planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (newValue) => {
    setFormData(prev => ({ ...prev, fecha_inicio: newValue }));
    
    if (errors.fecha_inicio) {
      setErrors(prev => ({ ...prev, fecha_inicio: null }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imagen: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetoToggle = (reto) => {
    const isSelected = selectedRetos.some(r => r.id === reto.id);
    
    if (isSelected) {
      // Quitar el reto
      setSelectedRetos(prev => prev.filter(r => r.id !== reto.id));
      setFormData(prev => ({ 
        ...prev, 
        retos_ids: prev.retos_ids.filter(id => id !== reto.id) 
      }));
    } else {
      // Añadir el reto
      setSelectedRetos(prev => [...prev, reto]);
      setFormData(prev => ({ 
        ...prev, 
        retos_ids: [...prev.retos_ids, reto.id] 
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.titulo) newErrors.titulo = 'El título es obligatorio';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es obligatoria';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!formData.duracion_dias) newErrors.duracion_dias = 'La duración es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      // En una aplicación real, aquí se enviarían los datos al backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular tiempo de carga
      
      if (isEditing) {
        toast.success('¡Plan actualizado exitosamente!');
      } else {
        // Simular creación con un ID generado
        const newPlanId = `plan-${Date.now()}`;
        toast.success('¡Plan creado exitosamente!');
      }
      
      setTimeout(() => {
        navigate('/planes');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar plan:', error);
      toast.error('Error al guardar el plan. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Button
          component={Link}
          to="/planes"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Volver a planes de estudio
        </Button>

        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {isEditing ? 'Editar Plan de Estudio' : 'Crear Nuevo Plan de Estudio'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {isEditing 
            ? 'Modifica los detalles de tu plan de estudio' 
            : 'Define un nuevo plan de estudio personalizado'
          }
        </Typography>

        <Paper 
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            mb: 4
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Datos básicos del plan */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Información básica
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Título del plan"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.titulo}
                  helperText={errors.titulo}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  error={!!errors.descripcion}
                  helperText={errors.descripcion}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha de inicio"
                  value={formData.fecha_inicio}
                  onChange={handleDateChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duración en días"
                  name="duracion_dias"
                  type="number"
                  value={formData.duracion_dias}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  error={!!errors.duracion_dias}
                  helperText={errors.duracion_dias}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.es_publico}
                      onChange={handleSwitchChange}
                      name="es_publico"
                      color="primary"
                    />
                  }
                  label="Plan público"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Los planes públicos son visibles para todos los usuarios
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen del plan (opcional)
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    mb: 2
                  }}
                >
                  <input
                    accept="image/*"
                    id="imagen-plan"
                    type="file"
                    hidden
                    onChange={handleImageChange}
                  />
                  <label htmlFor="imagen-plan">
                    {imagePreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: '8px'
                          }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper'
                          }}
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, imagen: null }));
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        variant="outlined"
                      >
                        Subir Imagen
                      </Button>
                    )}
                  </label>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Retos incluidos en el plan
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Selecciona los retos que deseas incluir en este plan de estudio.
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Retos seleccionados ({selectedRetos.length})
                  </Typography>
                  
                  {selectedRetos.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      No has seleccionado ningún reto todavía
                    </Alert>
                  ) : (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {selectedRetos.map(reto => (
                        <Grid item xs={12} sm={6} md={4} key={reto.id}>
                          <RetoSelectCard
                            reto={reto}
                            selected={true}
                            onSelect={handleRetoToggle}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Retos disponibles
                  </Typography>
                  <Grid container spacing={2}>
                    {availableRetos
                      .filter(reto => !selectedRetos.some(r => r.id === reto.id))
                      .map(reto => (
                        <Grid item xs={12} sm={6} md={4} key={reto.id}>
                          <RetoSelectCard
                            reto={reto}
                            selected={false}
                            onSelect={handleRetoToggle}
                          />
                        </Grid>
                      ))
                    }
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" sx={{ mb: 3 }}>
                  Esta es una versión de demostración. Los datos no se guardarán permanentemente.
                </Alert>
                
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    component={Link}
                    to="/planes"
                    variant="outlined"
                    size="large"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                    disabled={loading}
                  >
                    {loading
                      ? isEditing ? 'Guardando...' : 'Creando...'
                      : isEditing ? 'Guardar cambios' : 'Crear plan'
                    }
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default CreatePlan;
