import Navbar from '../components/Navbar/Navbar'
import Hero from '../components/Hero/Hero'
import NewData from '../components/NewData/NewData'
import Features from '../components/Features/Features'
import Timeline from '../components/Timeline/Timeline'
import Metrics from '../components/Metrics/Metrics'
import Innovation from '../components/Innovation/Innovation'
import Tickets from '../components/Tickets/Tickets'
import CTA from '../components/CTA/CTA'
import Footer from '../components/Footer/Footer'
import WhatsAppButton from '../components/WhatsAppButton/WhatsAppButton'

export default function Home() {
  return (
    <main className="relative bg-[#040b0f] snap-container">
      <WhatsAppButton />
      <Navbar />
      <Hero />

      {/* Section separators */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      <NewData />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      <Features />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(48,34,127,0.4), transparent)' }} />

      <Timeline />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      <Metrics />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(48,34,127,0.4), transparent)' }} />

      <Innovation />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.4), transparent)' }} />

      <Tickets />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.4), transparent)' }} />

      <CTA />

      <Footer />
    </main>
  )
}
