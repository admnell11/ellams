import React from 'react';
import './LoadingSpinner.css'; // We'll create this CSS file next

const LoadingSpinner = () => (
  <div className="loading-spinner-overlay">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

export default LoadingSpinner;