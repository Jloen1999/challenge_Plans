import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = 'primary', 
  index = 0,
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ height: '100%' }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          height: '100%',
          borderRadius: 3,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          '&:hover': onClick ? {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
          } : {},
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body1" fontWeight="medium" color="text.secondary">
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 36, height: 36 }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h3" fontWeight="bold">
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            {subtitle}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

export default StatCard;
