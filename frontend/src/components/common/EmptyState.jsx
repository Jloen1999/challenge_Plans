import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';

const EmptyState = ({
  message = 'No hay elementos para mostrar',
  icon = <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />,
  buttonText,
  buttonLink,
  buttonAction,
  paperProps = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 4, 
          backgroundColor: 'rgba(0,0,0,0.02)',
          ...paperProps
        }}
      >
        <Box sx={{ mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {message}
        </Typography>
        {(buttonText && (buttonLink || buttonAction)) && (
          <Button 
            component={buttonLink ? Link : 'button'}
            to={buttonLink}
            onClick={buttonAction}
            variant="contained" 
            sx={{ mt: 2 }}
          >
            {buttonText}
          </Button>
        )}
      </Paper>
    </motion.div>
  );
};

export default EmptyState;
