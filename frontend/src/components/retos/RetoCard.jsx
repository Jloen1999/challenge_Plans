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
  CardActions 
} from '@mui/material';
import { 
  Person as PersonIcon, 
  CheckCircle as CheckCircleIcon,
  StarRate as StarRateIcon 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapa de colores para dificultades
const difficultyColorMap = {
  principiante: 'success',
  intermedio: 'warning',
  avanzado: 'error'
};

const RetoCard = ({ reto }) => {
  const difficultyColor = difficultyColorMap[reto.dificultad] || 'default';
  
  // Verificar si hay fechas válidas para formatear
  const fechaInicio = reto.fecha_inicio ? 
    format(new Date(reto.fecha_inicio), 'dd MMM yyyy', { locale: es }) : 
    'No definida';
  
  const fechaFin = reto.fecha_fin ? 
    format(new Date(reto.fecha_fin), 'dd MMM yyyy', { locale: es }) : 
    'No definida';

  // Imagen por defecto si el reto no tiene una
  const imagenReto = reto.imagen || '/assets/images/retos/default.jpg';
  
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
      <CardActionArea component={Link} to={`/retos/${reto.id}`}>
        <CardMedia
          component="img"
          height="140"
          image={imagenReto}
          alt={reto.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Chip 
              label={reto.dificultad} 
              color={difficultyColor} 
              size="small" 
              sx={{ 
                textTransform: 'capitalize',
                height: 24,
                fontWeight: 500
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {fechaInicio} - {fechaFin}
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              height: '2.6em'
            }}
          >
            {reto.titulo}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 2,
              height: '4.5em'
            }}
          >
            {reto.descripcion}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 'auto', 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={reto.creador_avatar}
                alt={reto.creador_nombre}
                sx={{ width: 24, height: 24, mr: 1 }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {reto.creador_nombre}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<PersonIcon fontSize="small" />}
            label={`${reto.participantes}`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={`${reto.completado}`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Button 
          component={Link} 
          to={`/retos/${reto.id}`} 
          size="small" 
          variant="contained"
        >
          Ver reto
        </Button>
      </CardActions>
    </Card>
  );
};

export default RetoCard;
