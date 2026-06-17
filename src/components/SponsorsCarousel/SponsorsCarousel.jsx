

const sponsors = [
  'Partner 1', 'Partner 2', 'Partner 3', 'Partner 4',
  'Partner 5', 'Partner 6', 'Partner 7',
]

// Duplicate for infinite loop
const allSponsors = [...sponsors, ...sponsors, ...sponsors]

function SponsorCard({ name }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center px-8 py-3 mx-3 glass rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-colors duration-300 cursor-default">
      <span className="text-secondary text-sm font-medium tracking-wider whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export default function SponsorsCarousel() {
  return (
    <div className="w-full py-6 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #040b0f, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #040b0f, transparent)' }} />

      {/* Heading */}
      <p className="text-center text-xs tracking-[0.3em] text-muted uppercase mb-4 font-medium">
        Con el apoyo de
      </p>

      {/* Marquee track */}
      <div className="overflow-hidden">
        <div
          className="flex animate-marquee"
          style={{ width: 'max-content' }}
        >
          {allSponsors.map((name, i) => (
            <SponsorCard key={i} name={name} />
          ))}
        </div>
      </div>
    </div>
  )
}
