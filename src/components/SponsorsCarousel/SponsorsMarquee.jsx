import { sponsors } from "./data"

const allSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors]

function SponsorCard({ logo, name, src }) {
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
      <div className="flex items-center justify-center px-6 sm:px-12 py-3 sm:py-4 transition-all duration-500 cursor-pointer group">
        <img 
          src={logo} 
          alt={`Logo de ${name}`} 
          className="h-7 sm:h-10 w-auto object-contain opacity-40 grayscale brightness-150 group-hover:opacity-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
        />
      </div>
    </a>
  )
}

export default function SponsorsMarquee() {
  return (
    <section className="relative w-full py-8 sm:py-14 border-t border-b border-white/[0.06]" style={{ background: '#050507' }}>
      {/* Title */}
      <p
        className="text-center text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] text-white/25 uppercase mb-6 sm:mb-10 px-4"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        EMPRESAS QUE LO HACEN POSIBLE
      </p>

      {/* Marquee */}
      <div
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          className="flex animate-marquee"
          style={{ width: 'max-content' }}
        >
          {allSponsors.map((sponsor, i) => (
            <SponsorCard key={`${sponsor.id}-${i}`} logo={sponsor.logo} name={sponsor.name} src={sponsor.src} />
          ))}
        </div>
      </div>
    </section>
  )
}
