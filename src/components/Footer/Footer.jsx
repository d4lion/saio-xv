import { GitBranch, AtSign, Share2, Radio } from 'lucide-react'
import logo from '../../assets/logo.png'

const socials = [
  { icon: AtSign, href: '#', label: 'Twitter / X' },
  { icon: Share2, href: '#', label: 'LinkedIn' },
  { icon: GitBranch, href: '#', label: 'GitHub' },
  { icon: Radio, href: '#', label: 'Instagram' },
]

const links = [
  { section: 'Evento', items: ['Talleres', 'Ponentes', 'Agenda', 'Boletas'] },
  { section: 'ANIAP', items: ['Sobre nosotros', 'Ediciones anteriores', 'Voluntarios', 'Contacto'] },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-purple-500/15 overflow-hidden snap-end">
      {/* Gradient top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.5), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="SAIO XV Entropix"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Evento estudiantil organizado por ANIAP donde aprender, conectar y crecer con la industria tecnológica.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full glass border border-purple-500/20 flex items-center justify-center text-secondary hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {links.map((col) => (
            <div key={col.section}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{col.section}</h4>
              <ul className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-secondary text-sm hover:text-secondary-light transition-colors duration-300">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-xs">
            © {year} Hecho con ❤️ por <a href="https://www.adamind.cloud" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-light transition-colors duration-300">Adamind Technologies</a> para Saio XV · Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {['Privacidad', 'Términos', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-muted text-xs hover:text-secondary transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
