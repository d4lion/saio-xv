import hero_poster from '../../assets/hero_poster.webp'

export default function UniverseBackground({ opacity = 0.2, overlay = "bg-gradient-to-b from-[#040b0f] via-[#040b0f]/80 to-[#040b0f]", nebulaColor = "rgba(156,58,237,0.15)" }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src={hero_poster}
        alt=""
        className="w-full h-full object-cover"
        style={{ opacity }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
      
      {/* Floating particles/stars */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle bg-white"
          style={{
            width: `${(i % 3) + 1}px`,
            height: `${(i % 3) + 1}px`,
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 31 + 7) % 100}%`,
            background: i % 2 === 0 ? '#9c3aed' : '#c3abdc',
            animationDelay: `${(i * 0.3) % 4}s`,
            animationDuration: `${2 + (i % 3)}s`,
            opacity: 0.5,
          }}
        />
      ))}
      
      {/* Nebula glow */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${nebulaColor} 0%, transparent 70%)` }}
      />
    </div>
  )
}
