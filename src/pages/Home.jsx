import Navbar from '../components/Navbar/Navbar'
import Hero from '../components/Hero/Hero'
import SponsorsMarquee from '../components/SponsorsCarousel/SponsorsMarquee'
import Features from '../components/Features/Features'
import Metrics from '../components/Metrics/Metrics.jsx'

import Timeline from '../components/Timeline/Timeline'
import Tickets from '../components/Tickets/Tickets'
import CTA from '../components/CTA/CTA'
import Footer from '../components/Footer/Footer'
import WhatsAppButton from '../components/WhatsAppButton/WhatsAppButton'
import SEO from '../components/SEO/SEO'

export default function Home() {
  return (
    <main className="relative bg-[#050507] snap-container">
      <SEO 
        title="SAIO XV - ENTROPIX 2026 | El Evento de Inteligencia Artificial & Datos"
        description="Transformando datos en infinitas posibilidades. Asiste a SAIO XV Entropix en Medellín: talleres prácticos, ponentes internacionales, networking VIP y conferencias sobre Inteligencia Artificial y Ciencia de Datos."
        path="/"
      />
      <WhatsAppButton />
      <Navbar />
      <Hero />

      {/* Sponsors marquee — below the fold */}
      <SponsorsMarquee />

      {/* Section separators */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      {/* 1. APRENDE CON LOS MEJORES */}
      <Features />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      {/* 2. SAIO EN NÚMEROS */}
      <Metrics />

      {/* 4. CRONOGRAMA (Oculto temporalmente) */}
      {/* <Timeline /> */}

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.4), transparent)' }} />

      <Tickets />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.4), transparent)' }} />

      <CTA />

      <Footer />
    </main>
  )
}
