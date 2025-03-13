import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ProgressCircle = ({ 
  value = 0, 
  size = 100, 
  thickness = 8, 
  color = 'primary',
  label,
  animate = true
}) => {
  // Asegurar que el valor esté entre 0-100
  const progress = Math.min(100, Math.max(0, value));
  
  // Calcular los parámetros del círculo
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: size, 
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg width={size} height={size}>
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={thickness}
        />
        
        {/* Círculo de progreso */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`var(--mui-palette-${color}-main)`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          initial={animate ? { strokeDashoffset: circumference } : {}}
          animate={animate ? { strokeDashoffset } : {}}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Texto central */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant={size > 100 ? "h4" : "h6"} component="div" fontWeight="bold">
          {progress}%
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgressCircle;
