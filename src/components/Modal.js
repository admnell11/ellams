import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css'; // We'll create this CSS file next
import Button from './Button'; // Assuming Button component is in the same directory

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent, // Optional: ReactNode for custom footer content
  size = 'medium', // 'small', 'medium', 'large', 'xlarge'
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-size-${size}`}>
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <Button onClick={onClose} variant="link" className="modal-close-button" aria-label="Close modal">
              &times; {/* Unicode X character */}
            </Button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
        {(footerContent || showCloseButton) && ( // Show footer if there's content or if default close button is needed
          <div className="modal-footer">
            {footerContent ? footerContent : (
              showCloseButton && <Button onClick={onClose} variant="secondary">Close</Button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root') // Assumes a div with id="modal-root" in your public/index.html
  );
};

export default Modal;