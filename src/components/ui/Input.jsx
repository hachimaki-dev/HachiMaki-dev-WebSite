import './Input.css'

/**
 * Input — Form input component with label and error
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.hint]
 * @param {boolean} [props.textarea=false]
 * @param {number} [props.rows=4]
 * @param {string} [props.className]
 */
export function Input({
  label,
  error,
  hint,
  textarea = false,
  rows = 4,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const Component = textarea ? 'textarea' : 'input'

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <Component
        id={inputId}
        className={`input-field ${textarea ? 'input-field--textarea' : ''}`}
        rows={textarea ? rows : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {hint && !error && (
        <p className="input-hint" id={`${inputId}-hint`}>{hint}</p>
      )}
      {error && (
        <p className="input-error" id={`${inputId}-error`} role="alert">{error}</p>
      )}
    </div>
  )
}
