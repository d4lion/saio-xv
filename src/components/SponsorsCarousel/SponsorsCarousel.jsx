
import { sponsors } from "./data"

const allSponsors = [...sponsors, ...sponsors, ...sponsors]

function SponsorCard({ logo, name, src }) {
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
    <div 
      className="flex-shrink-0 flex items-center justify-center px-8 py-2 mx-4 transition-all duration-300 opacity-50 hover:opacity-100 cursor-pointer"
    
      >
      <img 
        src={logo} 
        alt={`Logo de ${name}`} 
        className="h-10 md:h-14 w-auto object-contain filter hover:grayscale-0 transition-all duration-300"
      />
    </div>
    </a>
  )
}

export default function SponsorsCarousel() {
  return (
    <div className="w-full py-6 relative">
      <p className="text-center text-xs tracking-[0.3em] text-muted uppercase mb-4 font-medium">
        Con el apoyo de
      </p>

      <div 
        className="overflow-hidden"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
      >
        <div
          className="flex animate-marquee"
          style={{ width: 'max-content' }}
        >
          {allSponsors.map((sponsor, i) => (
            <SponsorCard key={`${sponsor.id}-${i}`} logo={sponsor.logo} name={sponsor.name} src={sponsor.src}/>
          ))}
        </div>
      </div>
    </div>
  )
}
