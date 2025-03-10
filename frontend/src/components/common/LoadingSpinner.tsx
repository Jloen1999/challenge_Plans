import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = '#2563eb'
}) => {
  const spinnerClasses = `loading-spinner spinner-${size}`;
  
  return (
    <div className="spinner-container">
      <div 
        className={spinnerClasses}
        style={{ borderTopColor: color }}
      ></div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
