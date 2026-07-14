import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, User, Shield, CreditCard, Sparkles } from 'lucide-react';
import UserNav from '../components/UserNav/UserNav';

export default function MiEntrada() {
  const { user } = useAuth();

  // Generar QR a través del API público qrserver.com
  const qrUrl = user?.uid 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${user.uid}&color=040b0f&bgcolor=ffffff&margin=10`
    : null;

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Nebulosas */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Tu Entrada Digital</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Pase de Acceso</span>
            </div>
          </div>
        </div>
      </header>

      <UserNav />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col items-center justify-center z-20">
        {/* Credencial Digital (Glow / Glassmorphism) */}
        <div 
          className="w-full glass rounded-[32px] p-6 relative overflow-hidden flex flex-col items-center text-center border-t border-purple-400/30"
          style={{ boxShadow: '0 15px 40px rgba(156,58,237,0.15), 0 0 60px rgba(76,41,182,0.1)' }}
        >
          {/* Cabecera del Pase */}
          <div className="w-full border-b border-muted/20 pb-4 mb-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/25 mb-3">
              <Sparkles className="w-3 h-3 text-accent shrink-0 animate-pulse-glow" />
              PASE CONFIRMADO
            </div>
            <h2 className="text-xl font-heading font-extrabold tracking-wide text-white">SAIO XV ENTROPIX</h2>
            <p className="text-[10px] text-secondary tracking-widest uppercase mt-0.5">Décimo Quinto Aniversario</p>
          </div>

          {/* Código QR Dinámico */}
          <div className="relative p-4 bg-white rounded-3xl mb-6 shadow-inner glow-purple">
            {qrUrl ? (
              <img 
                src={qrUrl} 
                alt="Ticket QR Code" 
                className="w-48 h-48 rounded-2xl block object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-secondary-dark text-xs">
                Cargando código...
              </div>
            )}
          </div>

          {/* Información del Titular */}
          <div className="w-full space-y-4 text-left bg-black/30 p-5 rounded-2xl border border-muted/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Asistente</span>
                <span className="text-sm font-semibold text-white block truncate">{user?.nombre || 'Explorador'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Cédula</span>
                <span className="text-sm font-mono text-white block truncate">{user?.cedula || '1029384756'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-muted/10">
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Fecha del Evento</span>
                <span className="text-xs text-white block">Julio 10-12, 2026</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Ubicación</span>
                <span className="text-xs text-white block">Auditorio Principal</span>
              </div>
            </div>

            <div className="pt-3 border-t border-muted/10 flex items-center gap-2 text-[10px] text-secondary font-mono truncate">
              <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>UID: {user?.uid}</span>
            </div>
          </div>

          {/* Indicaciones del evento */}
          <p className="text-[10px] text-secondary mt-6 leading-relaxed">
            Presenta esta credencial digital en el stand de ingreso para realizar la validación de tu entrada.
          </p>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV. Creado por{' '}
        <a 
          href="https://www.adamind.cloud" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-secondary hover:text-white underline transition-colors duration-200"
        >
          Adamind Technologies
        </a>
      </footer>
    </div>
  );
}
