import React from 'react';
import './InputField.css'; // We'll create this CSS file next

const InputField = ({
  id,
  label,
  type = 'text', // Default to text
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  name,
  min, // For number, date types
  max, // For number, date types
  step // For number types
}) => {
  return (
    <div className={`input-field-container ${className}`}>
      {label && <label htmlFor={id || name} className="input-label">{label}{required && <span className="required-asterisk">*</span>}</label>}
      <input
        type={type}
        id={id || name}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`input-element ${error ? 'input-error' : ''}`}
      />
      {error && <p className="error-message-text">{error}</p>}
    </div>
  );
};

export default InputField;