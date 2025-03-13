import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Button,
  CardActionArea,
  CardActions,
  Rating,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Visibility as VisibilityIcon,
  StarRate as StarRateIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ApunteCard = ({ apunte }) => {
  // Verificar si hay fecha de creación para formatear
  const fechaCreacion = apunte.fecha_creacion ? 
    format(new Date(apunte.fecha_creacion), 'dd MMM yyyy', { locale: es }) : 
    'Sin fecha';

  // Imagen por defecto si el apunte no tiene una
  const imagenApunte = apunte.imagen || '/assets/images/apuntes/default.jpg';

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardActionArea component={Link} to={`/apuntes/${apunte.id}`}>
        <CardMedia
          component="img"
          height="140"
          image={imagenApunte}
          alt={apunte.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={apunte.formato.toUpperCase()}
              color="primary"
              size="small"
              sx={{ height: 24, minWidth: 40 }}
            />
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
              <EventNoteIcon fontSize="inherit" sx={{ mr: 0.5 }} />
              {fechaCreacion}
            </Typography>
          </Box>
          
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              height: '2.6em'
            }}
          >
            {apunte.titulo}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            <Avatar 
              src={apunte.usuario_avatar}
              alt={apunte.usuario_nombre}
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {apunte.usuario_nombre}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Rating
              value={apunte.calificacion_promedio}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({apunte.calificaciones_count})
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          component={Link} 
          to={`/apuntes/${apunte.id}`} 
          fullWidth
          variant="contained"
          size="small"
        >
          Ver apunte
        </Button>
      </CardActions>
    </Card>
  );
};

export default ApunteCard;
