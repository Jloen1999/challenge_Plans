import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Avatar,
  Card,
  CardContent,
  TextField,
  Alert,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  StarOutline as StarOutlineIcon,
  CloudUpload as UploadIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { getTareaByIdMock } from '../../mock/mockApi';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import CommentSection from '../../components/common/CommentSection';
import toast from 'react-hot-toast';

const TareaDetail = () => {
  const { tareaId } = useParams();
  const { currentUser } = useAuth();
  const [tarea, setTarea] = useState(null);
  const [reto, setReto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionComment, setCompletionComment] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  useEffect(() => {
    const fetchTareaDetails = async () => {
      try {
        setLoading(true);
        const tareaData = await getTareaByIdMock(tareaId);
        
        if (!tareaData) {
          setError('Tarea no encontrada');
          setLoading(false);
          return;
        }
        
        setTarea(tareaData);
        setReto(tareaData.reto);
        
        // Comentarios simulados
        setComentarios([
          {
            id: 'com-1',
            entidad: 'tarea',
            entidad_id: tareaId,
            contenido: 'Esta tarea fue muy interesante, aprendí mucho sobre este tema.',
            fecha_creacion: '2023-04-15T14:30:00Z',
            usuario_id: 'user-2',
            usuario_nombre: 'María López',
            usuario_avatar: '/assets/avatars/avatar2.jpg',
            comentario_padre_id: null
          },
          {
            id: 'com-2',
            entidad: 'tarea',
            entidad_id: tareaId,
            contenido: 'Tuve algunas dificultades con la parte final, pero logré resolverlo.',
            fecha_creacion: '2023-04-16T10:15:00Z',
            usuario_id: 'user-3',
            usuario_nombre: 'Carlos Rodríguez',
            usuario_avatar: '/assets/avatars/avatar3.jpg',
            comentario_padre_id: null
          },
          {
            id: 'com-3',
            entidad: 'tarea',
            entidad_id: tareaId,
            contenido: '¿Alguien más tuvo problemas con el paso 3?',
            fecha_creacion: '2023-04-17T09:20:00Z',
            usuario_id: 'user-4',
            usuario_nombre: 'Ana Martínez',
            usuario_avatar: '/assets/avatars/avatar4.jpg',
            comentario_padre_id: null
          },
          {
            id: 'com-4',
            entidad: 'tarea',
            entidad_id: tareaId,
            contenido: 'Sí, yo también. La solución es usar el método alternativo mencionado en los recursos.',
            fecha_creacion: '2023-04-17T10:05:00Z',
            usuario_id: 'user-2',
            usuario_nombre: 'María López',
            usuario_avatar: '/assets/avatars/avatar2.jpg',
            comentario_padre_id: 'com-3'
          }
        ]);
        
        // Estado de completado simulado (aleatorio para demo)
        setIsCompleted(Math.random() > 0.6);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles de la tarea:", err);
        setError('Error al cargar los detalles de la tarea');
        setLoading(false);
      }
    };

    fetchTareaDetails();
  }, [tareaId]);

  const handleAddComment = (comment) => {
    const newComment = {
      id: `com-${Date.now()}`,
      entidad: 'tarea',
      entidad_id: tareaId,
      contenido: comment,
      fecha_creacion: new Date().toISOString(),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      usuario_avatar: currentUser.avatar,
      comentario_padre_id: null
    };
    
    setComentarios([...comentarios, newComment]);
    toast.success('Comentario añadido');
  };

  const handleCompleteTask = () => {
    setIsCompleted(true);
    toast.success('¡Tarea completada con éxito!');
    setShowCompletionForm(false);
  };

  const handleUncompleteTask = () => {
    setIsCompleted(false);
    toast.success('Tarea marcada como no completada');
  };

  if (loading) {
    return <LoadingState message="Cargando detalles de la tarea..." />;
  }

  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="Volver al reto"
        buttonLink={reto ? `/retos/${reto.id}` : '/retos'}
      />
    );
  }

  if (!tarea) {
    return (
      <EmptyState
        message="Tarea no encontrada"
        buttonText="Volver a retos"
        buttonLink="/retos"
      />
    );
  }

  const fechaLimite = tarea.fecha_limite ? 
    format(new Date(tarea.fecha_limite), 'dd MMMM yyyy', { locale: es }) : 
    'Sin fecha límite';

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
          to={`/retos/${reto?.id || ''}`}
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al reto
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3,
              position: 'relative'
            }}
          >
            {isCompleted && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Completada"
                color="success"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16
                }}
              />
            )}

            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {tarea.titulo}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip
                icon={<CalendarIcon fontSize="small" />}
                label={fechaLimite}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<StarIcon fontSize="small" />}
                label={`${tarea.puntos} puntos`}
                variant="outlined"
                color="primary"
                size="small"
              />
              {reto && (
                <Chip
                  icon={<AssignmentIcon fontSize="small" />}
                  label={`Reto: ${reto.titulo}`}
                  component={Link}
                  to={`/retos/${reto.id}`}
                  clickable
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {tarea.descripcion}
            </Typography>

            {tarea.instrucciones && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Instrucciones
                </Typography>
                <Typography component="div" variant="body2">
                  <div dangerouslySetInnerHTML={{ __html: tarea.instrucciones }} />
                </Typography>
              </Box>
            )}

            {tarea.recursos && tarea.recursos.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Recursos
                </Typography>
                <Stack spacing={1}>
                  {tarea.recursos.map((recurso, index) => (
                    <Button 
                      key={index}
                      variant="outlined"
                      component="a"
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<StarOutlineIcon />}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {recurso.nombre}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {!isCompleted ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setShowCompletionForm(true)}
                >
                  Marcar como completada
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleUncompleteTask}
                >
                  Marcar como no completada
                </Button>
              )}
            </Box>

            {showCompletionForm && (
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Comentarios sobre la tarea (opcional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe cómo resolviste la tarea, qué aprendiste..."
                  value={completionComment}
                  onChange={(e) => setCompletionComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => setShowCompletionForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleCompleteTask}
                  >
                    Completar tarea
                  </Button>
                </Box>
              </Paper>
            )}
          </Paper>

          {/* Sección de entregables - simulado para la demo */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Entregables
            </Typography>
            <Typography variant="body2" paragraph>
              Sube archivos o comparte enlaces relacionados con tu resolución de la tarea.
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
                accept="*/*"
                id="archivo-entregable"
                type="file"
                hidden
                multiple
              />
              <label htmlFor="archivo-entregable">
                <Button
                  component="span"
                  startIcon={<UploadIcon />}
                  variant="outlined"
                >
                  Subir archivo
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Arrastra archivos aquí o haz clic para seleccionarlos
              </Typography>
            </Box>

            <TextField
              label="Enlaces (URLs)"
              placeholder="https://ejemplo.com/mi-proyecto"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={() => toast.success('Entregables guardados correctamente')}
            >
              Guardar entregables
            </Button>
          </Paper>

          {/* Sección de comentarios */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Comentarios ({comentarios.length})
            </Typography>
            <CommentSection 
              comments={comentarios}
              onAddComment={handleAddComment}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Tarjeta de información del reto */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Información del reto
            </Typography>
            {reto ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={reto.imagen}
                    alt={reto.titulo}
                    variant="rounded"
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {reto.titulo}
                    </Typography>
                    <Chip
                      label={reto.dificultad}
                      size="small"
                      color={
                        reto.dificultad === 'principiante' ? 'success' : 
                        reto.dificultad === 'intermedio' ? 'warning' : 'error'
                      }
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {reto.descripcion.substring(0, 120)}...
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to={`/retos/${reto.id}`}
                >
                  Ver reto completo
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay información disponible sobre el reto
              </Typography>
            )}
          </Paper>

          {/* Tarjeta de progreso */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tu progreso en este reto
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="primary" align="center" sx={{ my: 2 }}>
              75%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={75} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }} 
            />
            <Typography variant="body2" paragraph>
              Has completado 3 de 4 tareas en este reto
            </Typography>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to={reto ? `/retos/${reto.id}` : '/retos'}
            >
              Continuar con el reto
            </Button>
          </Paper>

          {/* Acciones adicionales */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Otras acciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => toast.info('Función no implementada en la demo')}
              >
                Solicitar ayuda
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to={`/apuntes/create?tareaId=${tareaId}`}
              >
                Crear apunte relacionado
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default TareaDetail;
