import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Zap, ChevronRight, Gift, History, Sparkles, LogOut, ArrowLeft } from 'lucide-react';

export default function Puntos() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(15420);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  }

  // Lista de recompensas mockeadas
  const rewards = [
    { id: 1, title: 'Acceso VIP SAIO-XV', cost: 8000, desc: 'Pase prioritario a los talleres interactivos de Entropix.', claimed: false },
    { id: 2, title: 'NFC Badge Personalizado', cost: 12000, desc: 'Credencial física con chip NFC de edición especial.', claimed: false },
    { id: 3, title: 'NFT Conmemorativo', cost: 5000, desc: 'Coleccionable digital verificado del decimoquinto aniversario.', claimed: true },
  ];

  // Historial de puntos mockeado
  const history = [
    { id: 1, event: 'Registro Completo en el Portal', amount: 500, type: 'plus', date: 'Hace 5 min' },
    { id: 2, event: 'Asistencia al Taller Space Telemetry', amount: 3500, type: 'plus', date: 'Ayer' },
    { id: 3, event: 'Redención NFT Conmemorativo', amount: -5000, type: 'minus', date: 'Ayer' },
    { id: 4, event: 'Suscripción Temprana SAIO-XV', amount: 16420, type: 'plus', date: '04 Jul 2026' },
  ];

  const handleRedeem = (id, cost, title) => {
    if (points < cost) {
      alert('Puntos estelares insuficientes para canjear esta recompensa.');
      return;
    }
    setPoints(points - cost);
    alert(`¡Felicidades! Has canjeado: ${title}`);
  };

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-accent/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 hover:bg-white/5 rounded-xl transition-colors duration-200 cursor-pointer group"
            >
              <ArrowLeft className="w-5 h-5 text-secondary group-hover:text-white transition-colors" />
            </button>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Puntos Estelares</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">SAIO-XV Rewards</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-200 hover:text-white font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300"
              disabled={isLoggingOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 z-20">
        {/* Panel General de Puntos */}
        <section className="glass rounded-3xl p-8 relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(156,58,237,0.12)' }}>
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold border border-accent/30 tracking-wider uppercase animate-pulse">
                <Sparkles className="w-3 h-3" />
                Explorador Estelar
              </span>
              <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-widest block">Tu Balance Actual</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white glow-text">{points.toLocaleString()}</span>
                <span className="text-md font-heading font-semibold text-accent">PUNTOS</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-muted/10 w-full md:w-auto">
              <div className="p-3 rounded-xl bg-primary-light/20 text-primary-light glow-purple">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-secondary">Siguiente Rango: Comandante</p>
                <div className="w-40 h-2 bg-muted/30 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-light to-accent" style={{ width: '77%' }}></div>
                </div>
                <p className="text-[10px] text-accent mt-1">4,580 pts restantes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dos Columnas */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listado de Canjeo (Col 1 y 2) */}
          <div className="glass rounded-2xl p-6 border border-muted/20 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-muted/10 pb-3">
              <Gift className="w-5 h-5 text-accent animate-float" />
              <h3 className="font-heading font-bold text-md">Catálogo de Recompensas</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => (
                <div key={r.id} className="glass-light p-5 rounded-2xl border border-muted/10 flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-heading font-bold text-sm text-white">{r.title}</h4>
                      {r.claimed && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                          Canjeado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{r.desc}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-muted/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent font-heading">{r.cost} PTS</span>
                    {!r.claimed && (
                      <button
                        onClick={() => handleRedeem(r.id, r.cost, r.title)}
                        className="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-light text-white text-[11px] font-semibold transition-all duration-200 cursor-pointer"
                      >
                        Canjear
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Transacciones (Col 3) */}
          <div className="glass rounded-2xl p-6 border border-muted/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-muted/10 pb-3">
              <History className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold text-md">Historial de Puntos</h3>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-primary-light/5 border border-muted/5 hover:bg-primary-light/10 transition-colors duration-200">
                  <div className="space-y-1">
                    <p className="text-xs text-white font-medium">{h.event}</p>
                    <p className="text-[10px] text-secondary">{h.date}</p>
                  </div>
                  <span className={`text-xs font-heading font-bold ${h.type === 'plus' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {h.type === 'plus' ? `+${h.amount}` : `${h.amount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV Rewards Console. Todos los derechos reservados.
      </footer>
    </div>
  );
}
