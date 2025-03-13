import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Rating,
  Chip,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  EventNote as EventNoteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { getApunteByIdMock, getComentariosByEntidadMock } from '../../mock/data';
import MarkdownView from '../../components/apuntes/MarkdownView';
import CommentSection from '../../components/common/CommentSection';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const ApunteDetail = () => {
  const { apunteId } = useParams();
  const { currentUser } = useAuth();
  const [apunte, setApunte] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchApunteDetails = async () => {
      try {
        setLoading(true);
        const apunteData = await getApunteByIdMock(apunteId);
        
        if (!apunteData) {
          setError('Apunte no encontrado');
          setLoading(false);
          return;
        }
        
        setApunte(apunteData);
        
        // Cargar comentarios
        const comentariosData = await getComentariosByEntidadMock('apunte', apunteId);
        setComentarios(comentariosData);
        
        // Simular calificación del usuario
        setUserRating(Math.random() > 0.5 ? 4 : 0);
        
        // Simular si el apunte está guardado
        setBookmarked(Math.random() > 0.5);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles del apunte:", err);
        setError('Error al cargar los detalles del apunte');
        setLoading(false);
      }
    };

    fetchApunteDetails();
  }, [apunteId]);

  const handleRate = (event, newValue) => {
    setUserRating(newValue);
    toast.success('¡Gracias por tu calificación!');
  };

  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Apunte eliminado de favoritos' : 'Apunte guardado en favoritos');
  };

  const handleDownload = () => {
    toast.success('Descargando apunte...');
  };

  const handleShare = () => {
    // En una aplicación real, aquí se implementaría la funcionalidad para compartir
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleAddComment = (comment) => {
    const newComment = {
      id: `com-${Date.now()}`,
      entidad: 'apunte',
      entidad_id: apunteId,
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

  if (loading) {
    return <LoadingState message="Cargando apunte..." />;
  }

  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="Volver a apuntes"
        buttonLink="/apuntes"
      />
    );
  }

  if (!apunte) {
    return (
      <EmptyState
        message="Apunte no encontrado"
        buttonText="Volver a apuntes"
        buttonLink="/apuntes"
      />
    );
  }

  const fechaCreacion = format(new Date(apunte.fecha_creacion), 'dd MMM yyyy', { locale: es });
  const isOwner = currentUser?.id === apunte.usuario_id;

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
          to="/apuntes"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver a apuntes
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Cabecera del apunte */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Chip
                label={apunte.formato.toUpperCase()}
                color="primary"
                size="small"
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNoteIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {fechaCreacion}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {apunte.titulo}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={apunte.usuario_avatar}
                alt={apunte.usuario_nombre}
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                <PersonIcon />
              </Avatar>
              <Typography variant="body2">
                {apunte.usuario_nombre}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={apunte.calificacion_promedio} 
                precision={0.5} 
                readOnly 
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({apunte.calificaciones_count} calificaciones)
              </Typography>
            </Box>

            {isOwner && (
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  component={Link}
                  to={`/apuntes/${apunteId}/edit`}
                  size="small"
                >
                  Editar
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => toast.error('Función no implementada en la versión de demostración')}
                >
                  Eliminar
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Cuerpo del apunte */}
            <Box sx={{ mt: 2 }}>
              <MarkdownView content={apunte.contenido} />
            </Box>
          </Paper>

          {/* Sección de comentarios */}
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
              Comentarios ({comentarios.length})
            </Typography>
            <CommentSection 
              comments={comentarios} 
              onAddComment={handleAddComment} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Acciones y calificación */}
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
              Califica este apunte
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Rating
                name="user-rating"
                value={userRating}
                onChange={handleRate}
                size="large"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {userRating > 0 ? 'Tu calificación' : 'Sin calificar'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Acciones
            </Typography>
            <Stack spacing={2}>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                fullWidth
                onClick={handleDownload}
              >
                Descargar apunte
              </Button>
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
                fullWidth
                onClick={handleShare}
              >
                Compartir apunte
              </Button>
              <Button
                startIcon={bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                variant="outlined"
                fullWidth
                onClick={handleToggleBookmark}
              >
                {bookmarked ? 'Guardado en favoritos' : 'Guardar en favoritos'}
              </Button>
            </Stack>
          </Paper>

          {/* Información adicional */}
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
              Información del apunte
            </Typography>
            <Box sx={{ '& > div': { mb: 2 } }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de creación
                </Typography>
                <Typography variant="body2">
                  {fechaCreacion}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Formato
                </Typography>
                <Typography variant="body2" textTransform="uppercase">
                  {apunte.formato}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Visibilidad
                </Typography>
                <Typography variant="body2">
                  {apunte.es_publico ? 'Público' : 'Privado'}
                </Typography>
              </Box>
              {apunte.reto_id && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Asociado al reto
                  </Typography>
                  <Button 
                    component={Link}
                    to={`/retos/${apunte.reto_id}`}
                    size="small"
                    variant="text"
                    sx={{ p: 0, mt: 0.5 }}
                  >
                    Ver reto
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default ApunteDetail;
