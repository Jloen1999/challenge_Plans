import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Divider,
  Paper,
  IconButton,
  Collapse,
  Card
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AddCircle as AddCircleIcon,
  Sort as SortIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRetosMock, categorias } from '../../mock/data';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import RetoCard from '../../components/retos/RetoCard';
import toast from 'react-hot-toast';

const RetosList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [retos, setRetos] = useState([]);
  const [filteredRetos, setFilteredRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orderBy, setOrderBy] = useState('recientes');

  useEffect(() => {
    const fetchRetos = async () => {
      setLoading(true);
      try {
        const retosData = await getRetosMock();
        
        // Si el filtro es 'mios', mostrar solo los retos creados por el usuario
        if (filter === 'mios' && currentUser) {
          const misRetos = retosData.filter(reto => reto.creador_id === currentUser.id);
          setRetos(misRetos);
        } else {
          setRetos(retosData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar retos:', error);
        toast.error('Error al cargar los retos');
        setLoading(false);
      }
    };

    fetchRetos();
  }, [filter, currentUser]);

  useEffect(() => {
    // Aplicar filtros a los retos
    let result = [...retos];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        reto => reto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
               reto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por dificultad
    if (dificultad) {
      result = result.filter(reto => reto.dificultad === dificultad);
    }
    
    // Filtrar por categoría
    if (categoria) {
      result = result.filter(reto => reto.categorias.includes(categoria));
    }
    
    // Ordenar los resultados
    switch(orderBy) {
      case 'recientes':
        result.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
        break;
      case 'antiguos':
        result.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
        break;
      case 'populares':
        result.sort((a, b) => b.participantes - a.participantes);
        break;
      case 'dificultad_asc':
        const orden = { principiante: 1, intermedio: 2, avanzado: 3 };
        result.sort((a, b) => orden[a.dificultad] - orden[b.dificultad]);
        break;
      case 'dificultad_desc':
        const ordenDesc = { principiante: 3, intermedio: 2, avanzado: 1 };
        result.sort((a, b) => ordenDesc[a.dificultad] - ordenDesc[b.dificultad]);
        break;
      default:
        break;
    }
    
    setFilteredRetos(result);
  }, [retos, searchTerm, dificultad, categoria, orderBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDificultad('');
    setCategoria('');
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
    return <LoadingState message="Cargando retos..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Encabezado con título y botón de crear reto */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {filter === 'mios' ? 'Mis Retos' : 'Retos Disponibles'}
        </Typography>
        <Button
          component={Link}
          to="/retos/create"
          variant="contained"
          startIcon={<AddCircleIcon />}
          sx={{ borderRadius: 2 }}
        >
          Crear Reto
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar retos..."
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
          
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="dificultad-label">Dificultad</InputLabel>
              <Select
                labelId="dificultad-label"
                value={dificultad}
                label="Dificultad"
                onChange={(e) => setDificultad(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="principiante">Principiante</MenuItem>
                <MenuItem value="intermedio">Intermedio</MenuItem>
                <MenuItem value="avanzado">Avanzado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={3}>
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
                <MenuItem value="populares">Más populares</MenuItem>
                <MenuItem value="dificultad_asc">Dificultad ↑</MenuItem>
                <MenuItem value="dificultad_desc">Dificultad ↓</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              startIcon={<FilterListIcon />}
            >
              Más filtros
            </Button>
          </Grid>
          
          <Grid item xs={6} md={12}>
            <Button
              variant="text"
              onClick={handleClearFilters}
              size="small"
              sx={{ mt: { xs: 0, md: 1 }, display: 'flex', ml: 'auto' }}
              startIcon={<CloseIcon fontSize="small" />}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Categorías
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categorias.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.nombre}
                  clickable
                  color={categoria === cat.id ? 'primary' : 'default'}
                  onClick={() => setCategoria(categoria === cat.id ? '' : cat.id)}
                  variant={categoria === cat.id ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Lista de retos con filtros aplicados */}
      {filteredRetos.length === 0 ? (
        <EmptyState
          message="No se encontraron retos con los filtros aplicados"
          buttonText="Ver todos los retos"
          buttonAction={handleClearFilters}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {filteredRetos.map((reto, index) => (
              <Grid item xs={12} sm={6} md={4} key={reto.id}>
                <motion.div variants={itemVariants}>
                  <RetoCard reto={reto} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RetosList;
