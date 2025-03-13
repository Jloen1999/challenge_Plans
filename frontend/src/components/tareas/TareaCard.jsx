import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Checkbox,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const TareaCard = ({ tarea, isCompleted = false, onComplete, onUncomplete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [comentario, setComentario] = useState('');

  const fechaLimite = tarea.fecha_limite
    ? format(new Date(tarea.fecha_limite), 'dd MMM yyyy', { locale: es })
    : 'Sin fecha límite';

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setComentario('');
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(tarea.id, comentario);
    }
    handleCloseDialog();
  };

  const handleUncomplete = () => {
    if (onUncomplete) {
      onUncomplete(tarea.id);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      {isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            transform: 'translate(30%, -30%)',
            zIndex: 1
          }}
        >
          <Tooltip title="Tarea completada">
            <CheckCircleOutlineIcon
              color="success"
              fontSize="large"
              sx={{
                backgroundColor: 'white',
                borderRadius: '50%'
              }}
            />
          </Tooltip>
        </Box>
      )}
      
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ 
              fontWeight: 600,
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'text.secondary' : 'text.primary'
            }}
          >
            {tarea.titulo}
          </Typography>
          <Box>
            <Chip
              icon={<StarIcon fontSize="small" />}
              label={`${tarea.puntos} pts`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color={isCompleted ? 'text.disabled' : 'text.secondary'}
          sx={{ 
            mt: 1, 
            mb: 2,
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {tarea.descripcion}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Fecha límite">
            <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          </Tooltip>
          <Typography variant="caption" color="text.secondary">
            {fechaLimite}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Tooltip title="Ver detalles">
              <Button
                component={Link}
                to={`/tareas/${tarea.id}`}
                size="small"
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Detalles
              </Button>
            </Tooltip>
          </Box>
          
          <Box>
            {!isCompleted ? (
              <Button
                size="small"
                color="success"
                variant="contained"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={handleOpenDialog}
              >
                Completar
              </Button>
            ) : (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<RemoveCircleOutlineIcon />}
                onClick={handleUncomplete}
              >
                Desmarcar
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Diálogo para completar tarea */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Completar tarea</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Has completado la tarea "{tarea.titulo}"? Puedes añadir un comentario opcional.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comentario"
            label="Comentario (opcional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleComplete} variant="contained" color="success">
            Completar tarea
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TareaCard;
