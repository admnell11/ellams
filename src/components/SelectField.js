import React from 'react';
import './SelectField.css'; // We'll create this CSS file next

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options, // Expected to be an array of objects: [{ value: 'val', label: 'Label' }, ...] or [{ value: 'val', label: 'Label', disabled: true}, ...]
  placeholder, // Optional placeholder text for the default option
  required = false,
  disabled = false,
  error,
  className = '',
  name
}) => {
  return (
    <div className={`select-field-container ${className}`}>
      {label && <label htmlFor={id || name} className="select-label">{label}{required && <span className="required-asterisk">*</span>}</label>}
      <select
        id={id || name}
        name={name || id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`select-element ${error ? 'select-error' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options && options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="error-message-text">{error}</p>}
    </div>
  );
};

export default SelectField;