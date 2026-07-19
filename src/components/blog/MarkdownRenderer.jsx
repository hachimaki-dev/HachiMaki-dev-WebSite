import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { useState } from 'react'
import './MarkdownRenderer.css'
import Icon from '../ui/Icon'

/**
 * MarkdownRenderer — Renders Markdown or HTML content with syntax highlighting
 * @param {{ content: string, format?: 'markdown'|'html' }} props
 */
export function MarkdownRenderer({ content, format = 'markdown' }) {
  if (!content) return null

  // Fallback to HTML for legacy content
  if (format === 'html') {
    return (
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="prose">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          // Custom code block with copy button and language label
          pre({ children, ...props }) {
            return <PreBlock {...props}>{children}</PreBlock>
          },
          // External links open in new tab
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...props}
              >
                {children}
              </a>
            )
          },
          // Images with layout support
          img({ src, alt, title, ...props }) {
            let className = 'blog-image'
            if (title && title.includes('layout:small')) {
              className += ' blog-image--small'
            }
            return <img src={src} alt={alt || ''} title={title} loading="lazy" className={className} {...props} />
          },
          // Paragraphs: Group multiple images into a gallery
          p({ children, ...props }) {
            const childArray = Array.isArray(children) ? children : [children]
            
            // Check if ALL non-whitespace string children are images
            const imageElements = childArray.filter(child => child?.type === 'img')
            const stringElements = childArray.filter(child => typeof child === 'string' && child.trim() !== '')
            const otherElements = childArray.filter(child => child?.type !== 'img' && typeof child !== 'string')

            if (imageElements.length > 1 && stringElements.length === 0 && otherElements.length === 0) {
              return <div className="blog-gallery">{children}</div>
            }

            return <p {...props}>{children}</p>
          }
        }}
      />
    </div>
  )
}

/**
 * PreBlock — Code block wrapper with language label and copy button
 */
function PreBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false)

  // Extract language from className on the <code> element
  const codeEl = children?.props
  const className = codeEl?.className || ''
  const langMatch = className.match(/language-(\w+)/)
  const language = langMatch ? langMatch[1] : ''

  const handleCopy = async () => {
    const text = extractText(children)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="prose__code-block">
      {(language || true) && (
        <div className="prose__code-header">
          <span className="prose__code-lang">{language || 'code'}</span>
          <button
            className="prose__code-copy"
            onClick={handleCopy}
            type="button"
            aria-label="Copiar código"
          >
            {copied ? <><Icon name="check" /> Copiado</> : 'Copiar'}
          </button>
        </div>
      )}
      <pre {...props}>{children}</pre>
    </div>
  )
}

/**
 * Extract plain text from React children (for copy button)
 */
function extractText(node) {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node?.props?.children) return extractText(node.props.children)
  return ''
}
