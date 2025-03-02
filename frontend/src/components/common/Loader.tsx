import React from 'react';
import '../../assets/styles/components/Loader.css';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
};

export default Loader;
