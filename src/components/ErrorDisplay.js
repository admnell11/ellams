import React from 'react';
import './ErrorDisplay.css'; // We'll create this CSS file next

const ErrorDisplay = ({ message, details }) => {
  if (!message) return null;

  return (
    <div className="error-display-container">
      <h4>Error</h4>
      <p className="error-message">{message}</p>
      {details && <pre className="error-details">{details}</pre>}
    </div>
  );
};

export default ErrorDisplay;