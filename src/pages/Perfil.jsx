import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Calendar, Award, Phone } from 'lucide-react';

export default function Perfil() {
  const { user } = useAuth();

  const handleReportIssue = (e) => {
    e.preventDefault();
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || "573000000000";
    const message = `Hola equipo SAIO, tengo una novedad con mis datos registrados en la plataforma. Mi documento es ${user?.cedula || 'No registrado'}.`;
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  };
  
  let parsedDate = null;
  if (user?.fechaCreacion) {
    if (typeof user.fechaCreacion.toDate === 'function') {
      parsedDate = user.fechaCreacion.toDate();
    } else {
      parsedDate = new Date(user.fechaCreacion);
    }
  }

  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No registrada';

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-black text-white">Tu Perfil</h1>
          <p className="text-secondary text-sm">Consulta tu información personal y credencial.</p>
        </div>
      </div>

      {/* Banner con Puntos */}
      <section className="glass rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10 shadow-[0_0_30px_rgba(156,58,237,0.1)] relative overflow-hidden bg-gradient-to-br from-purple-900/10 to-transparent">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
        <div className="space-y-1 text-center md:text-left relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight">
            {user?.nombre || 'Explorador Espacial'}
          </h2>
          <p className="text-secondary text-sm tracking-wide">
            Rol del Evento: <span className="text-accent font-bold uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20 ml-2 inline-block mt-2 md:mt-0">{user?.rol || 'Asistente'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 border border-white/10 py-4 px-6 rounded-2xl glow-purple relative z-10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-secondary tracking-[0.2em] uppercase font-bold mb-1">Puntos Acumulados</p>
            <p className="text-3xl font-heading font-black text-white leading-none">{(user?.puntos || 0).toLocaleString()} <span className="text-base text-accent">PTS</span></p>
          </div>
        </div>
      </section>

      {/* Panel de Datos y Formulario */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ficha Informativa (Col 1) */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/10 space-y-8 bg-black/20">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-heading font-black text-sm uppercase text-secondary tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Credencial Estelar
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent" /> Correo de Registro
              </p>
              <p className="text-white font-mono break-all bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors">
                {user?.correo || user?.email}
              </p>
            </div>

            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Miembro Desde
              </p>
              <p className="text-white font-sans bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors">
                {formattedDate}
              </p>
            </div>

            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent" /> UID de Identidad
              </p>
              <p className="text-white font-mono text-xs break-all bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors opacity-70">
                {user?.uid}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de Edición (Col 2 y 3) */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/10 lg:col-span-2 bg-black/20 flex flex-col">
          <div className="border-b border-white/5 pb-4 mb-8">
            <h3 className="font-heading font-black text-sm uppercase text-secondary tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Información Personal
            </h3>
            <p className="text-xs text-secondary mt-2">Tus datos registrados en la plataforma. Para solicitar un cambio, por favor contacta al equipo de soporte.</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                  Nombre Completo
                </label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                  <input
                    type="text"
                    value={user?.nombre || ''}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm text-secondary/40 font-sans outline-none cursor-not-allowed"
                    disabled={true}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                  Teléfono / Móvil
                </label>
                <div className="relative group/input">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                  <input
                    type="tel"
                    value={user?.telefono || ''}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm text-secondary/40 font-sans outline-none cursor-not-allowed"
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* Cédula */}
            <div className="space-y-2 max-w-md">
              <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                Identificación (Cédula)
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                <input
                  type="text"
                  value={user?.cedula || ''}
                  disabled={true}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm text-secondary/40 font-sans outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-6 mt-auto text-right">
              <button
                type="button"
                onClick={handleReportIssue}
                className="text-xs text-accent hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
              >
                Tengo una novedad con mis datos personales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
