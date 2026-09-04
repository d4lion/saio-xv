import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Ticket } from 'lucide-react';
import QRCode from 'qrcode';

export default function MiEntrada() {
  const { user } = useAuth();
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (user?.uid) {
      QRCode.toDataURL(user.uid, { 
        width: 250, 
        margin: 2,
        color: {
          dark: '#040b0f',
          light: '#ffffff'
        }
      })
        .then(url => setQrSrc(url))
        .catch(err => console.error("Error generating native QR code:", err));
    }
  }, [user]);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-black text-white">Tu Entrada Digital</h1>
          <p className="text-secondary text-sm">Presenta este código para acceder al evento.</p>
        </div>
      </div>

      <div className="flex-1 max-w-lg w-full mx-auto flex flex-col items-center justify-center">
        {/* Credencial Digital (Glow / Glassmorphism) */}
        <div 
          className="w-full glass rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center border-t border-purple-400/30 bg-black/40"
          style={{ boxShadow: '0 15px 40px rgba(156,58,237,0.15), 0 0 60px rgba(76,41,182,0.1)' }}
        >
          {/* Subtle bg texture inside card */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

          {/* Cabecera del Pase */}
          <div className="w-full border-b border-white/10 pb-6 mb-8 flex flex-col items-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/25 mb-4 shadow-lg shadow-accent/10">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 animate-pulse-glow" />
              PASE CONFIRMADO
            </div>
            <h2 className="text-2xl font-heading font-black tracking-widest text-white">SAIO-XV ENTROPIX</h2>
            <p className="text-xs text-secondary font-mono tracking-[0.2em] uppercase mt-2">Décimo Quinto Aniversario</p>
          </div>

          {/* Código QR Dinámico */}
          <div className="relative p-5 bg-white rounded-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] glow-purple z-10 transition-transform duration-500 hover:scale-[1.02]">
            {qrSrc ? (
              <img 
                src={qrSrc} 
                alt="Ticket QR Code" 
                className="w-52 h-52 rounded-2xl block object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-secondary-dark text-xs font-mono uppercase tracking-widest">
                Cargando...
              </div>
            )}
          </div>

          {/* Información del Titular */}
          <div className="w-full space-y-4 text-left bg-black/40 p-6 rounded-2xl border border-white/5 relative z-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">Asistente</span>
                <span className="text-sm font-bold text-white block truncate">{user?.nombre || 'Explorador'}</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">Cédula</span>
                <span className="text-sm font-mono text-white block truncate">{user?.cedula || '1029384756'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">Fecha</span>
                <span className="text-xs text-white block font-mono">15-16 OCT, 2026</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">Sede</span>
                <span className="text-xs text-white block">Medellín, CO</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-secondary font-mono truncate">
              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>UID: {user?.uid}</span>
            </div>
          </div>

          {/* Indicaciones del evento */}
          <p className="text-[10px] text-secondary mt-8 leading-relaxed tracking-wider font-medium max-w-sm relative z-10">
            Presenta esta credencial digital en el stand de ingreso para realizar la validación de tu entrada.
          </p>
        </div>
      </div>
    </div>
  );
}
