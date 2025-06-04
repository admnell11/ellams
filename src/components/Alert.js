import React, { useState, useEffect } from 'react';
import './Alert.css'; // We'll create this CSS file next
import Button from './Button'; // Reusing Button for close action

const Alert = ({
  message,
  type = 'info', // 'success', 'error', 'info', 'warning'
  duration = 5000, // Auto-dismiss duration in ms. 0 or null for persistent.
  onClose, // Callback when alert is closed (either by button or auto-dismiss)
  isDismissible = true,
  title,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible || !message) {
    return null;
  }

  return (
    <div className={`alert alert-${type} ${isDismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      {title && <h4 className="alert-heading">{title}</h4>}
      <div className="alert-message">{message}</div>
      {isDismissible && (
        <Button
          onClick={handleClose}
          variant="link"
          className="alert-close-button"
          aria-label="Close alert"
        >
          &times;
        </Button>
      )}
    </div>
  );
};

export default Alert;