import React from 'react';
import './Button.css'; // We'll create this CSS file next

const Button = ({
  children,
  onClick,
  type = 'button', // 'button', 'submit', 'reset'
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'link'
  disabled = false,
  className = '',
  size = 'medium', // 'small', 'medium', 'large'
  isLoading = false, // If true, shows a loading state
  iconLeft, // ReactNode for an icon on the left
  iconRight, // ReactNode for an icon on the right
  ...props // Spread any other native button props
}) => {
  const buttonClasses = `
    btn
    btn-${variant}
    btn-size-${size}
    ${isLoading ? 'btn-loading' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {isLoading ? (
        <span className="btn-loader"></span>
      ) : (
        <>
          {iconLeft && <span className="btn-icon btn-icon-left">{iconLeft}</span>}
          {children}
          {iconRight && <span className="btn-icon btn-icon-right">{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;