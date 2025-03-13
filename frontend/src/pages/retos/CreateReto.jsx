import React, { useState } from 'react';
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
  Chip,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { categorias, generateId } from '../../mock/data';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CreateReto = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    dificultad: 'intermedio',
    fecha_inicio: new Date(),
    fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    es_publico: true,
    categorias_ids: [],
    imagen: null,
    tareas: [{ titulo: '', descripcion: '', puntos: 100, fecha_limite: null }]
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoriaToggle = (categoriaId) => {
    const currentCategorias = [...formData.categorias_ids];
    const index = currentCategorias.indexOf(categoriaId);
    
    if (index === -1) {
      // Añadir categoría
      currentCategorias.push(categoriaId);
    } else {
      // Quitar categoría
      currentCategorias.splice(index, 1);
    }
    
    setFormData(prev => ({ ...prev, categorias_ids: currentCategorias }));
    
    if (errors.categorias_ids) {
      setErrors(prev => ({ ...prev, categorias_ids: null }));
    }
  };

  const handleTareaChange = (index, field, value) => {
    const updatedTareas = [...formData.tareas];
    updatedTareas[index] = { ...updatedTareas[index], [field]: value };
    
    setFormData(prev => ({ ...prev, tareas: updatedTareas }));

    // Limpiar errores de tareas
    if (errors.tareas && errors.tareas[index] && errors.tareas[index][field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors.tareas[index][field];
      if (Object.keys(updatedErrors.tareas[index]).length === 0) {
        delete updatedErrors.tareas[index];
      }
      if (Object.keys(updatedErrors.tareas).length === 0) {
        delete updatedErrors.tareas;
      }
      setErrors(updatedErrors);
    }
  };

  const handleAddTarea = () => {
    setFormData(prev => ({
      ...prev,
      tareas: [
        ...prev.tareas,
        { titulo: '', descripcion: '', puntos: 100, fecha_limite: null }
      ]
    }));
  };

  const handleRemoveTarea = (index) => {
    const tareas = [...formData.tareas];
    tareas.splice(index, 1);
    setFormData(prev => ({ ...prev, tareas }));

    // Limpiar errores de la tarea eliminada
    if (errors.tareas && errors.tareas[index]) {
      const updatedErrors = { ...errors };
      delete updatedErrors.tareas[index];
      if (Object.keys(updatedErrors.tareas).length === 0) {
        delete updatedErrors.tareas;
      }
      setErrors(updatedErrors);
    }
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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.titulo) newErrors.titulo = 'El título es obligatorio';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es obligatoria';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!formData.fecha_fin) newErrors.fecha_fin = 'La fecha de fin es obligatoria';
    
    if (formData.fecha_fin < formData.fecha_inicio) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    if (formData.categorias_ids.length === 0) {
      newErrors.categorias_ids = 'Selecciona al menos una categoría';
    }

    // Validar tareas
    const tareasErrors = {};
    formData.tareas.forEach((tarea, index) => {
      const tareaErrors = {};
      if (!tarea.titulo) tareaErrors.titulo = 'El título es obligatorio';
      if (!tarea.puntos) tareaErrors.puntos = 'Los puntos son obligatorios';
      
      if (Object.keys(tareaErrors).length > 0) {
        tareasErrors[index] = tareaErrors;
      }
    });
    
    if (Object.keys(tareasErrors).length > 0) {
      newErrors.tareas = tareasErrors;
    }
    
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
      
      // Simular creación de reto con un ID generado
      const newRetoId = generateId("reto");
      
      toast.success('¡Reto creado exitosamente!');
      setTimeout(() => {
        navigate('/retos');
      }, 1500);
    } catch (error) {
      console.error('Error al crear reto:', error);
      toast.error('Error al crear el reto. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Button
            component={Link}
            to="/retos"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Volver a retos
          </Button>

          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Crear Nuevo Reto
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Completa el formulario para crear un nuevo reto en la plataforma
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
                {/* Datos básicos del reto */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    Información básica
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Título del reto"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.titulo}
                    helperText={errors.titulo}
                    variant="outlined"
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
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Fecha de inicio"
                    value={formData.fecha_inicio}
                    onChange={(newValue) => handleDateChange('fecha_inicio', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.fecha_inicio}
                        helperText={errors.fecha_inicio}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Fecha de finalización"
                    value={formData.fecha_fin}
                    onChange={(newValue) => handleDateChange('fecha_fin', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.fecha_fin}
                        helperText={errors.fecha_fin}
                      />
                    )}
                    minDate={formData.fecha_inicio}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Dificultad</InputLabel>
                    <Select
                      name="dificultad"
                      value={formData.dificultad}
                      onChange={handleChange}
                      label="Dificultad"
                    >
                      <MenuItem value="principiante">Principiante</MenuItem>
                      <MenuItem value="intermedio">Intermedio</MenuItem>
                      <MenuItem value="avanzado">Avanzado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.es_publico}
                        onChange={(e) => setFormData(prev => ({ ...prev, es_publico: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="Reto público"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Los retos públicos son visibles para todos los usuarios
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Categorías
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {categorias.map((cat) => (
                      <Chip
                        key={cat.id}
                        label={cat.nombre}
                        onClick={() => handleCategoriaToggle(cat.id)}
                        color={formData.categorias_ids.includes(cat.id) ? 'primary' : 'default'}
                        variant={formData.categorias_ids.includes(cat.id) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                  {errors.categorias_ids && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {errors.categorias_ids}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Imagen del reto (opcional)
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
                      id="imagen-reto"
                      type="file"
                      hidden
                      onChange={handleImageChange}
                    />
                    <label htmlFor="imagen-reto">
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
                    Tareas del Reto
                  </Typography>
                </Grid>
                
                {formData.tareas.map((tarea, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Tarea {index + 1}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Título de la tarea"
                            value={tarea.titulo}
                            onChange={(e) => handleTareaChange(index, 'titulo', e.target.value)}
                            fullWidth
                            required
                            error={!!errors.tareas?.[index]?.titulo}
                            helperText={errors.tareas?.[index]?.titulo}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="Descripción"
                            value={tarea.descripcion}
                            onChange={(e) => handleTareaChange(index, 'descripcion', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                          <TextField
                            label="Puntos"
                            type="number"
                            value={tarea.puntos}
                            onChange={(e) => handleTareaChange(index, 'puntos', parseInt(e.target.value) || 0)}
                            fullWidth
                            required
                            InputProps={{ inputProps: { min: 1 } }}
                            error={!!errors.tareas?.[index]?.puntos}
                            helperText={errors.tareas?.[index]?.puntos}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={6} sm={8}>
                          <DatePicker
                            label="Fecha límite (opcional)"
                            value={tarea.fecha_limite}
                            onChange={(newValue) => handleTareaChange(index, 'fecha_limite', newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                size="small"
                              />
                            )}
                            minDate={formData.fecha_inicio}
                            maxDate={formData.fecha_fin}
                          />
                        </Grid>
                      </Grid>
                      
                      {formData.tareas.length > 1 && (
                        <IconButton
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => handleRemoveTarea(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Paper>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddTarea}
                    variant="outlined"
                    fullWidth
                  >
                    Añadir Tarea
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Esta es una versión de demostración. Los datos no se guardarán en el servidor.
                  </Alert>
                  
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      component={Link}
                      to="/retos"
                      variant="outlined"
                      size="large"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                    >
                      {loading ? 'Creando...' : 'Crear Reto'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
};

export default CreateReto;
