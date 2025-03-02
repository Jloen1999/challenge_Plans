import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, title, description, linkTo 
}) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={linkTo} className="feature-link">Saber más</Link>
    </div>
  );
};

export default FeatureCard;
