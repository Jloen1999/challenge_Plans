import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const TaskListItem = ({ tarea, completed = false }) => {
  // Verificar si hay fecha límite para formatear
  const fechaLimite = tarea.fecha_limite ? 
    format(new Date(tarea.fecha_limite), 'dd MMM yyyy', { locale: es }) : 
    'Sin fecha límite';
  
  // Calcular si la tarea está próxima a vencerse (menos de 3 días)
  const isUpcoming = tarea.fecha_limite && 
    (new Date(tarea.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24) < 3;
  
  return (
    <ListItem 
      disablePadding
      sx={{
        mb: 1,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: completed ? 'action.selected' : isUpcoming ? 'warning.light' : 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <ListItemButton 
        component={Link} 
        to={`/tareas/${tarea.id}`}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {completed ? 
            <CheckCircleIcon color="success" /> : 
            <UncheckedIcon color={isUpcoming ? 'warning' : 'action'} />
          }
        </ListItemIcon>
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                variant="body1" 
                sx={{
                  textDecoration: completed ? 'line-through' : 'none',
                  color: completed ? 'text.secondary' : 'text.primary',
                  fontWeight: isUpcoming && !completed ? 600 : 400,
                }}
              >
                {tarea.titulo}
              </Typography>
              <Box>
                <Chip 
                  size="small"
                  label={`${tarea.reto_titulo || 'Reto'}`}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, maxWidth: 150, fontSize: '0.7rem' }}
                />
                <Chip 
                  size="small"
                  label={fechaLimite}
                  color={isUpcoming && !completed ? "warning" : "default"}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          }
          secondary={
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                textDecoration: completed ? 'line-through' : 'none',
              }}
            >
              {tarea.puntos} pts • {tarea.descripcion?.substring(0, 60)}...
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

export default TaskListItem;
