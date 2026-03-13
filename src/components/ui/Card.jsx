import React from 'react';
import './Card.css';

const Card = ({ children, className = '', onClick, ...props }) => {
  const isClickable = !!onClick;
  return (
    <div 
      className={`card ${isClickable ? 'card-clickable' : ''} ${className}`} 
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
