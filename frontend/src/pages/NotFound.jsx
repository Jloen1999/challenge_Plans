import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh', 
          textAlign: 'center' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SadIcon 
            sx={{ fontSize: 120, color: 'text.secondary', mb: 3 }} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography variant="h1" component="h1" fontWeight="bold" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Página no encontrada
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            La página que estás buscando no existe o ha sido movida.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              component={Link} 
              to="/"
              variant="contained" 
              size="large"
            >
              Ir al Dashboard
            </Button>
            
            <Button 
              component={Link}
              to="/retos"
              variant="outlined" 
              size="large"
            >
              Explorar Retos
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
};

export default NotFound;
