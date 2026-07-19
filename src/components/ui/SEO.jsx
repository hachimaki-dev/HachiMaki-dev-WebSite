import { Helmet } from 'react-helmet-async'

export function SEO({ 
  title, 
  description, 
  type = 'website', 
  image = 'https://hachimaki.dev/hachimaki-dev/logo.png', // Fallback default image
  url = 'https://hachimaki.dev/hachimaki-dev'
}) {
  const fullTitle = title ? `${title} | Hachimaki Dev` : 'Hachimaki Dev — Developer & Creator'
  const defaultDescription = 'Desarrollador de software y creador de contenido. Explora mis cursos, proyectos y artículos técnicos sobre inteligencia artificial, programación y más.'
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph tags for social media */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
