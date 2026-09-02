import { useEffect } from 'react'

const DOMAIN = 'https://saio.adamind.cloud'
const DEFAULT_IMAGE = `${DOMAIN}/og-image.png`
const DEFAULT_DESCRIPTION = 'SAIO XV - ENTROPIX: Transformando datos en infinitas posibilidades. Asiste a la conferencia más grande de Inteligencia Artificial, analítica avanzada y automatización en Medellín.'
const DEFAULT_KEYWORDS = 'SAIO XV, Entropix, Inteligencia Artificial, AI Colombia, Analítica de Datos, Data Science, Automatización, Tecnología Medellín, Conferencia IA 2026, Machine Learning'

export default function SEO({
  title = 'SAIO XV - ENTROPIX 2026 | El Evento de Inteligencia Artificial & Datos',
  description = DEFAULT_DESCRIPTION,
  path = '',
  ogImage = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  type = 'website',
  schemaJson = null
}) {
  const url = `${DOMAIN}${path}`

  useEffect(() => {
    // 1. Título de la pestaña
    document.title = title

    // Helper para crear o actualizar un selector meta
    const setMetaTag = (selector, key, value) => {
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        if (selector.startsWith('meta[name=')) {
          element.setAttribute('name', selector.match(/name="([^"]+)"/)[1])
        } else if (selector.startsWith('meta[property=')) {
          element.setAttribute('property', selector.match(/property="([^"]+)"/)[1])
        }
        document.head.appendChild(element)
      }
      element.setAttribute(key, value)
    }

    // 2. Meta Tags Primarios
    setMetaTag('meta[name="description"]', 'content', description)
    setMetaTag('meta[name="keywords"]', 'content', keywords)

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'content', title)
    setMetaTag('meta[property="og:description"]', 'content', description)
    setMetaTag('meta[property="og:url"]', 'content', url)
    setMetaTag('meta[property="og:image"]', 'content', ogImage)
    setMetaTag('meta[property="og:type"]', 'content', type)

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'content', title)
    setMetaTag('meta[name="twitter:description"]', 'content', description)
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage)

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', url)

    // 6. Schema.org Dynamic JSON-LD (opcional)
    let scriptTag = document.getElementById('dynamic-page-schema')
    if (schemaJson) {
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.setAttribute('id', 'dynamic-page-schema')
        scriptTag.setAttribute('type', 'application/ld+json')
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(schemaJson)
    } else if (scriptTag) {
      scriptTag.remove()
    }
  }, [title, description, url, ogImage, keywords, type, schemaJson])

  return null
}
