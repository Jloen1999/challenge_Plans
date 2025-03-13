import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  InputAdornment, 
  Button, 
  Chip, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApuntesMock } from '../../mock/data';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ApunteCard from '../../components/apuntes/ApunteCard';
import toast from 'react-hot-toast';

const ApuntesList = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [apuntes, setApuntes] = useState([]);
  const [filteredApuntes, setFilteredApuntes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [formato, setFormato] = useState('');
  const [orderBy, setOrderBy] = useState('recientes');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    const fetchApuntes = async () => {
      setLoading(true);
      try {
        const apuntesData = await getApuntesMock();
        
        // Si el filtro es 'mios', mostrar solo los apuntes creados por el usuario
        if (filter === 'mios' && currentUser) {
          const misApuntes = apuntesData.filter(apunte => apunte.usuario_id === currentUser.id);
          setApuntes(misApuntes);
        } else {
          setApuntes(apuntesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar apuntes:', error);
        toast.error('Error al cargar los apuntes');
        setLoading(false);
      }
    };

    fetchApuntes();
  }, [filter, currentUser]);

  useEffect(() => {
    // Aplicar filtros a los apuntes
    let result = [...apuntes];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        apunte => apunte.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 apunte.contenido.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por formato
    if (formato) {
      result = result.filter(apunte => apunte.formato === formato);
    }
    
    // Filtrar por calificación mínima
    if (minRating) {
      const rating = parseFloat(minRating);
      result = result.filter(apunte => apunte.calificacion_promedio >= rating);
    }
    
    // Ordenar los resultados
    switch(orderBy) {
      case 'recientes':
        result.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        break;
      case 'antiguos':
        result.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
        break;
      case 'calificacion':
        result.sort((a, b) => b.calificacion_promedio - a.calificacion_promedio);
        break;
      case 'popularidad':
        result.sort((a, b) => b.calificaciones_count - a.calificaciones_count);
        break;
      default:
        break;
    }
    
    setFilteredApuntes(result);
  }, [apuntes, searchTerm, formato, minRating, orderBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFormato('');
    setMinRating('');
    setOrderBy('recientes');
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
    return <LoadingState message="Cargando apuntes..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Encabezado con título y botón de crear apunte */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {filter === 'mios' ? 'Mis Apuntes' : 'Biblioteca de Apuntes'}
        </Typography>
        <Button
          component={Link}
          to="/apuntes/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Crear Apunte
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar apuntes..."
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
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="formato-label">Formato</InputLabel>
              <Select
                labelId="formato-label"
                value={formato}
                label="Formato"
                onChange={(e) => setFormato(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="md">Markdown</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="doc">Word</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
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
                <MenuItem value="calificacion">Mejor calificados</MenuItem>
                <MenuItem value="popularidad">Más populares</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              startIcon={<FilterListIcon />}
            >
              Más filtros
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant="text"
              onClick={handleClearFilters}
              size="small"
              fullWidth
              startIcon={<CloseIcon fontSize="small" />}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>

        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="rating-label">Calificación mínima</InputLabel>
                  <Select
                    labelId="rating-label"
                    value={minRating}
                    label="Calificación mínima"
                    onChange={(e) => setMinRating(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="4.5">4.5 estrellas o más</MenuItem>
                    <MenuItem value="4">4 estrellas o más</MenuItem>
                    <MenuItem value="3">3 estrellas o más</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Lista de apuntes con filtros aplicados */}
      {filteredApuntes.length === 0 ? (
        <EmptyState
          message={filter === 'mios' 
            ? "No has creado ningún apunte aún" 
            : "No se encontraron apuntes con los filtros aplicados"
          }
          buttonText={filter === 'mios' ? "Crear mi primer apunte" : "Ver todos los apuntes"}
          buttonLink={filter === 'mios' ? "/apuntes/create" : "#"}
          buttonAction={filter === 'mios' ? null : handleClearFilters}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {filteredApuntes.map((apunte) => (
              <Grid item xs={12} sm={6} md={4} key={apunte.id}>
                <motion.div variants={itemVariants}>
                  <ApunteCard apunte={apunte} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ApuntesList;
