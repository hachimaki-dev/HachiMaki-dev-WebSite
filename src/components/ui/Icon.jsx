/**
 * Reusable Icon component using pixelarticons
 * 
 * @param {Object} props
 * @param {string} props.name - The name of the pixelarticon (e.g. 'home', 'user')
 * @param {string} [props.className] - Optional extra CSS classes
 * @param {number|string} [props.size] - Optional size (defaults to 24)
 * @returns {JSX.Element}
 */
export default function Icon({ name, className = '', size = 24, style = {}, ...props }) {
  return (
    <i
      className={`pixelart-icons-font-${name} ${className}`}
      style={{ fontSize: size, fontStyle: 'normal', ...style }}
      {...props}
    />
  );
}
