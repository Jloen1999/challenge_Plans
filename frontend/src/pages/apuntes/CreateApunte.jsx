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
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { generateId, getRetosMock, getPlanesMock } from '../../mock/data';
import { useAuth } from '../../context/AuthContext';
import MarkdownView from '../../components/apuntes/MarkdownView';
import LoadingState from '../../components/common/LoadingState';
import toast from 'react-hot-toast';

const CreateApunte = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retoId = searchParams.get('retoId');
  const planId = searchParams.get('planId');
  
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [retos, setRetos] = useState([]);
  const [planes, setPlanes] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    formato: 'md',
    es_publico: true,
    reto_id: retoId || '',
    plan_id: planId || '',
    tags: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Obtener retos y planes para las opciones de asociación
        const retosData = await getRetosMock();
        const planesData = await getPlanesMock();
        
        setRetos(retosData);
        setPlanes(planesData);
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos necesarios');
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    if (value.trim()) {
      const tagsArray = value.split(',').map(tag => tag.trim());
      setFormData(prev => ({ ...prev, tags: tagsArray }));
    } else {
      setFormData(prev => ({ ...prev, tags: [] }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.titulo) newErrors.titulo = 'El título es obligatorio';
    if (!formData.contenido) newErrors.contenido = 'El contenido es obligatorio';
    
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
      
      // Simular creación de apunte con un ID generado
      const newApunteId = generateId("apunte");
      
      toast.success('¡Apunte creado exitosamente!');
      setTimeout(() => {
        navigate(`/apuntes/${newApunteId}`);
      }, 1500);
    } catch (error) {
      console.error('Error al crear apunte:', error);
      toast.error('Error al crear el apunte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatoOptions = [
    { value: 'md', label: 'Markdown' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'Texto plano' }
  ];

  const markdown = `# Este es un título

## Subtítulo

Esto es un párrafo con **texto en negrita** y *texto en cursiva*.

### Lista de elementos:
- Elemento 1
- Elemento 2
- Elemento 3

### Código de ejemplo:
\`\`\`javascript
function hola() {
  console.log("Hola mundo");
}
\`\`\`

> Este es un bloque de cita.

[Enlace de ejemplo](https://github.com)

![Imagen de ejemplo](https://via.placeholder.com/150)
`;

  if (loadingData) {
    return <LoadingState message="Cargando datos..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Button
          component={Link}
          to="/apuntes"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Volver a apuntes
        </Button>

        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Crear Nuevo Apunte
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Crea y comparte tus apuntes con la comunidad
        </Typography>

        <Grid container spacing={3}>
          {/* Columna de formulario */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 3
              }}
            >
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Información del Apunte
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Título"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.titulo}
                      helperText={errors.titulo}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Formato</InputLabel>
                      <Select
                        name="formato"
                        value={formData.formato}
                        onChange={handleChange}
                        label="Formato"
                      >
                        {formatoOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.es_publico}
                          onChange={handleSwitchChange}
                          name="es_publico"
                        />
                      }
                      label="Público"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Los apuntes públicos serán visibles para todos los usuarios
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Asociar con (Opcional)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Reto</InputLabel>
                          <Select
                            name="reto_id"
                            value={formData.reto_id}
                            onChange={handleChange}
                            label="Reto"
                          >
                            <MenuItem value="">Ninguno</MenuItem>
                            {retos.map(reto => (
                              <MenuItem key={reto.id} value={reto.id}>
                                {reto.titulo}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Plan de estudio</InputLabel>
                          <Select
                            name="plan_id"
                            value={formData.plan_id}
                            onChange={handleChange}
                            label="Plan de estudio"
                          >
                            <MenuItem value="">Ninguno</MenuItem>
                            {planes.map(plan => (
                              <MenuItem key={plan.id} value={plan.id}>
                                {plan.titulo}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Etiquetas (separadas por comas)"
                      onChange={handleTagsChange}
                      fullWidth
                      placeholder="javascript, react, tutorial"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Contenido
                    </Typography>
                    <Box sx={{ mb: 0.5 }}>
                      <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab label="Editar" />
                        <Tab label="Vista previa" />
                      </Tabs>
                      
                      <Box hidden={tabValue !== 0}>
                        <TextField
                          name="contenido"
                          value={formData.contenido}
                          onChange={handleChange}
                          fullWidth
                          required
                          multiline
                          rows={18}
                          error={!!errors.contenido}
                          helperText={errors.contenido || 'Utiliza Markdown para dar formato a tu apunte'}
                          variant="outlined"
                          placeholder={markdown}
                        />
                      </Box>
                      
                      <Box hidden={tabValue !== 1} sx={{ minHeight: 400 }}>
                        {formData.contenido ? (
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              minHeight: 400
                            }}
                          >
                            <MarkdownView content={formData.contenido} />
                          </Paper>
                        ) : (
                          <Box 
                            sx={{ 
                              p: 3, 
                              borderRadius: 2, 
                              bgcolor: 'action.hover', 
                              textAlign: 'center',
                              height: '100%',
                              minHeight: 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography color="text.secondary">
                              Aún no has añadido contenido para previsualizar
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        component={Link}
                        to="/apuntes"
                        variant="outlined"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? 'Guardando...' : 'Publicar apunte'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Columna de vista previa */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 3,
                position: 'sticky',
                top: 20,
                height: 'fit-content'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Vista previa del apunte
                </Typography>
                <VisibilityIcon color="action" />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {formData.titulo || 'Título del apunte'}
              </Typography>
              
              {formData.tags.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip key={index} size="small" label={tag} />
                  ))}
                </Box>
              )}
              
              <Box sx={{ mb: 3, bgcolor: 'background.default', borderRadius: 2, p: 3, maxHeight: 500, overflow: 'auto' }}>
                {formData.contenido ? (
                  <MarkdownView content={formData.contenido} />
                ) : (
                  <Typography color="text.secondary" align="center">
                    El contenido se mostrará aquí
                  </Typography>
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Autor: {currentUser?.nombre || 'Usuario'} • Formato: {
                  formatoOptions.find(opt => opt.value === formData.formato)?.label
                } • {formData.es_publico ? 'Público' : 'Privado'}
              </Typography>
              
              {(formData.reto_id || formData.plan_id) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Asociado a:
                  </Typography>
                  {formData.reto_id && (
                    <Chip 
                      size="small" 
                      label={retos.find(r => r.id === formData.reto_id)?.titulo || 'Reto'} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {formData.plan_id && (
                    <Chip 
                      size="small" 
                      label={planes.find(p => p.id === formData.plan_id)?.titulo || 'Plan'} 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              )}
            </Paper>
            
            {/* Información de ayuda */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Consejos para escribir buenos apuntes
              </Typography>
              <Typography variant="body2" component="div" paragraph>
                <ul>
                  <li>Utiliza títulos y subtítulos para organizar el contenido</li>
                  <li>Incluye ejemplos prácticos para ilustrar conceptos</li>
                  <li>Usa listas y tablas para presentar información de manera clara</li>
                  <li>Añade código cuando sea relevante</li>
                  <li>Incluye enlaces a recursos adicionales</li>
                </ul>
              </Typography>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Guía básica de Markdown
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {`# Título h1
## Título h2
**negrita** or __negrita__
*cursiva* or _cursiva_
[texto del enlace](url)
![texto alternativo](url-imagen)
> Cita en bloque
- Lista item
1. Lista numerada
\`código\`
\`\`\`
Bloque de código
\`\`\``}
                </pre>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default CreateApunte;
