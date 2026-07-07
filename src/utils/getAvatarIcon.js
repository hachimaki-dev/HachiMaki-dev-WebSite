/**
 * Deterministically maps a string ID to a living creature, human, or robot icon from pixelarticons.
 * 
 * @param {string} id - The unique visitor ID or peer ID.
 * @returns {string} The icon name.
 */
export function getAvatarIcon(id) {
  if (!id) return 'user'
  
  const icons = [
    'bug',
    'fish',
    'human',
    'robot',
    'robot-face',
    'skull',
    'user',
    'users',
    'avatar-circle',
    'avatar-square',
    'smile',
    'meh',
    'frown',
    'angry',
    'annoyed',
    'laugh',
    'heart',
    'star'
  ]
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % icons.length
  return icons[index]
}
