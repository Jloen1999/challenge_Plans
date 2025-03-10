import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  image?: string;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No se encontraron elementos",
  message = "No hay elementos para mostrar en este momento.",
  image = "/images/illustrations/empty-state.svg",
  width = 250,
  height = 200,
  children
}) => {
  return (
    <div className="empty-state">
      <img 
        src={image} 
        alt={title} 
        className="empty-state-image" 
        width={width}
        height={height}
      />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {children}
    </div>
  );
};

export default EmptyState;
