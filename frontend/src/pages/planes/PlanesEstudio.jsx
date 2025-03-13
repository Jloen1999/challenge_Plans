import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPlanesMock } from '../../mock/data';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import PlanCard from '../../components/planes/PlanCard';
import toast from 'react-hot-toast';

const PlanesEstudio = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [planes, setPlanes] = useState([]);
  const [filteredPlanes, setFilteredPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('recientes');

  useEffect(() => {
    const fetchPlanes = async () => {
      setLoading(true);
      try {
        const planesData = await getPlanesMock();
        
        // Si el filtro es 'mios', mostrar solo los planes creados por el usuario
        if (filter === 'mios' && currentUser) {
          const misPlanes = planesData.filter(plan => plan.usuario_id === currentUser.id);
          setPlanes(misPlanes);
        } else {
          setPlanes(planesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar planes:', error);
        toast.error('Error al cargar los planes de estudio');
        setLoading(false);
      }
    };

    fetchPlanes();
  }, [filter, currentUser]);

  useEffect(() => {
    // Aplicar filtros a los planes
    let result = [...planes];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        plan => plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
               plan.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenar los resultados
    switch(orderBy) {
      case 'recientes':
        result.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
        break;
      case 'antiguos':
        result.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
        break;
      case 'duracion_asc':
        result.sort((a, b) => a.duracion_dias - b.duracion_dias);
        break;
      case 'duracion_desc':
        result.sort((a, b) => b.duracion_dias - a.duracion_dias);
        break;
      default:
        break;
    }
    
    setFilteredPlanes(result);
  }, [planes, searchTerm, orderBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return <LoadingState message="Cargando planes de estudio..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Encabezado con título y botón de crear plan */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {filter === 'mios' ? 'Mis Planes de Estudio' : 'Planes de Estudio'}
        </Typography>
        <Button
          component={Link}
          to="/planes/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Crear Plan
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar planes de estudio..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="orderby-label">Ordenar por</InputLabel>
              <Select
                labelId="orderby-label"
                value={orderBy}
                label="Ordenar por"
                onChange={(e) => setOrderBy(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="recientes">Más recientes</MenuItem>
                <MenuItem value="antiguos">Más antiguos</MenuItem>
                <MenuItem value="duracion_asc">Duración ↑</MenuItem>
                <MenuItem value="duracion_desc">Duración ↓</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de planes con filtros aplicados */}
      {filteredPlanes.length === 0 ? (
        <EmptyState
          message={filter === 'mios' 
            ? "No has creado ningún plan de estudio aún" 
            : "No se encontraron planes de estudio"
          }
          buttonText={filter === 'mios' ? "Crear mi primer plan" : "Ver todos los planes"}
          buttonLink={filter === 'mios' ? "/planes/create" : "/planes"}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {filteredPlanes.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <motion.div variants={itemVariants}>
                  <PlanCard plan={plan} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlanesEstudio;
