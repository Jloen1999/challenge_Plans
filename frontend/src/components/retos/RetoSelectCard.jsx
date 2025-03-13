import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapa de colores para dificultades
const difficultyColorMap = {
  principiante: 'success',
  intermedio: 'warning',
  avanzado: 'error'
};

const RetoSelectCard = ({ reto, selected, onSelect }) => {
  const difficultyColor = difficultyColorMap[reto.dificultad] || 'default';
  
  // Verificar si hay fechas válidas para formatear
  const fechaInicio = reto.fecha_inicio ? 
    format(new Date(reto.fecha_inicio), 'dd MMM yyyy', { locale: es }) : 
    'No definida';

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none',
        backgroundColor: selected ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Chip 
            label={reto.dificultad} 
            color={difficultyColor} 
            size="small" 
            sx={{ textTransform: 'capitalize' }}
          />
          <Typography variant="caption" color="text.secondary">
            {fechaInicio}
          </Typography>
        </Box>
        
        <Typography 
          variant="subtitle1" 
          component="h3"
          fontWeight="medium"
          sx={{ 
            mb: 1,
            pr: 4, // Espacio para el botón
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {reto.titulo}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={reto.creador_avatar}
            alt={reto.creador_nombre}
            sx={{ width: 20, height: 20, mr: 1 }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {reto.creador_nombre}
          </Typography>
        </Box>
      </CardContent>
      
      <IconButton
        size="small"
        color={selected ? "error" : "primary"}
        onClick={() => onSelect(reto)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: selected ? 'error.light' : 'primary.light',
          color: '#fff',
          width: 28,
          height: 28,
          '&:hover': {
            bgcolor: selected ? 'error.main' : 'primary.main',
          }
        }}
      >
        {selected ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
      </IconButton>
    </Card>
  );
};

export default RetoSelectCard;
