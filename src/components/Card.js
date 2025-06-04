import React from 'react';
import './Card.css'; // We'll create this CSS file next

const Card = ({ title, children, className, actions }) => {
  return (
    <div className={`card ${className || ''}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;