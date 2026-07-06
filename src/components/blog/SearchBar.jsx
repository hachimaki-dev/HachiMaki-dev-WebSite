import { useState, useEffect, useRef } from 'react'
import './SearchBar.css'
import Icon from '../ui/Icon'

/**
 * SearchBar — Debounced search input
 * @param {{ value: string, onChange: function, placeholder?: string }} props
 */
export function SearchBar({ value, onChange, placeholder = 'Buscar posts...' }) {
  const [internal, setInternal] = useState(value || '')
  const timerRef = useRef(null)

  // Sync external value changes
  useEffect(() => {
    setInternal(value || '')
  }, [value])

  const handleChange = (e) => {
    const val = e.target.value
    setInternal(val)

    // Debounce: wait 400ms after last keystroke
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(val)
    }, 400)
  }

  const handleClear = () => {
    setInternal('')
    onChange('')
  }

  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true"><Icon name="search" /></span>
      <input
        type="text"
        className="search-bar__input"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Buscar posts"
      />
      {internal && (
        <button
          className="search-bar__clear"
          onClick={handleClear}
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  )
}
