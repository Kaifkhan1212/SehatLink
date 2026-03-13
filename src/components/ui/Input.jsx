import React from 'react';
import './Input.css';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`input-container ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
