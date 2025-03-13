import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Avatar, 
  Button,
  CardActionArea,
  CardActions,
  Chip
} from '@mui/material';
import { 
  Person as PersonIcon,
  EmojiEvents as RetosIcon,
  MenuBook as ApuntesIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const PlanCard = ({ plan }) => {
  // Verificar si hay fechas válidas para formatear
  const fechaInicio = plan.fecha_inicio ? 
    format(new Date(plan.fecha_inicio), 'dd MMM yyyy', { locale: es }) : 
    'No definida';
  
  // Calcular fecha de finalización basada en la duración
  const fechaFin = plan.fecha_inicio && plan.duracion_dias ? 
    format(addDays(new Date(plan.fecha_inicio), plan.duracion_dias), 'dd MMM yyyy', { locale: es }) : 
    'No definida';
  
  // Imagen por defecto si el plan no tiene una
  const imagenPlan = plan.imagen || '/assets/images/planes/default.jpg';
  
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
      <CardActionArea component={Link} to={`/planes/${plan.id}`}>
        <CardMedia
          component="img"
          height="140"
          image={imagenPlan}
          alt={plan.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
            {plan.titulo}
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
            {plan.descripcion}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 'auto', 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={plan.usuario_avatar}
                alt={plan.usuario_nombre}
                sx={{ width: 24, height: 24, mr: 1 }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {plan.usuario_nombre}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<RetosIcon fontSize="small" />}
            label={`${plan.retos_count} retos`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<ApuntesIcon fontSize="small" />}
            label={`${plan.apuntes_count} apuntes`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Button 
          component={Link} 
          to={`/planes/${plan.id}`} 
          size="small" 
          variant="contained"
        >
          Ver plan
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlanCard;
