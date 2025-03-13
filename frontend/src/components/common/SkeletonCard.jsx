import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const SkeletonCard = ({ variant = 'reto' }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        height: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Imagen del card */}
      <Skeleton 
        variant="rectangular" 
        height={variant === 'apunte' ? 120 : 140} 
        sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} 
      />
      
      <CardContent sx={{ p: 2 }}>
        {/* Chip y fecha */}
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        
        {/* Título */}
        <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
        
        {/* Descripción */}
        <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
        
        {/* Avatar y nombre */}
        <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block', mr: 1, verticalAlign: 'middle' }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ display: 'inline-block', verticalAlign: 'middle' }} />
        
        {/* Botones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="rounded" width="45%" height={36} />
          <Skeleton variant="rounded" width="45%" height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
