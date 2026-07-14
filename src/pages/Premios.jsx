import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Gift, Award, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import UserNav from '../components/UserNav/UserNav';
import Swal from 'sweetalert2';

// Configuración de SweetAlert2 con temática espacial
const themedSwal = Swal.mixin({
  background: '#0e0a34',
  color: '#e2e8f0',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#30227f',
  customClass: {
    popup: 'border border-purple-500/25 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'font-heading font-bold text-white text-md tracking-wide',
    htmlContainer: 'text-secondary font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:opacity-90 transition-opacity outline-none ring-0',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/5 transition-colors outline-none ring-0'
  }
});

export default function Premios() {
  const { user } = useAuth();
  const [rewardsList, setRewardsList] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(null); // ID del premio canjeándose

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const active = await pointsService.getActiveRewards();
      setRewardsList(active);

      const history = await pointsService.getTransactionHistory(user.uid);
      const claimed = history
        .filter(t => t.code && t.code.startsWith('CANJE_'))
        .map(t => t.code.replace('CANJE_', ''));
      setClaimedRewards(claimed);
    } catch (err) {
      console.error("Error al cargar premios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRedeem = async (reward) => {
    if (!user?.uid) return;
    
    if (claimedRewards.includes(reward.id)) {
      themedSwal.fire({
        icon: 'warning',
        title: 'Premio ya Canjeado',
        text: 'Ya has reclamado este premio anteriormente y solo se permite un canje por persona.'
      });
      return;
    }

    if (user.puntos < reward.cost) {
      themedSwal.fire({
        icon: 'error',
        title: 'Puntos Insuficientes',
        text: `Necesitas ${reward.cost} PTS para canjear este premio, tu saldo actual es de ${user.puntos} PTS.`
      });
      return;
    }

    const confirmResult = await themedSwal.fire({
      title: '¿Confirmar Canje?',
      text: `¿Deseas canjear "${reward.title}" por ${reward.cost.toLocaleString()} puntos estelares?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Canjear',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    setIsRedeeming(reward.id);
    setError('');
    setSuccess('');

    try {
      await pointsService.redeemReward(user.uid, reward.id, reward.cost, reward.title);
      themedSwal.fire({
        icon: 'success',
        title: '¡Premio Canjeado!',
        text: `Has canjeado "${reward.title}" con éxito.`
      });
      // Actualizar estado local de reclamados
      setClaimedRewards(prev => [...prev, reward.id]);
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error al procesar el canje.'
      });
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Fondos */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Catálogo de Premios</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Canjes del Evento</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 border border-muted/10 text-xs font-semibold">
            <Coins className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Balance: <span className="text-white font-mono">{(user?.puntos || 0).toLocaleString()} PTS</span></span>
          </div>
        </div>
      </header>

      <UserNav />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6 z-20">
        {/* Banner Motivacional */}
        <section className="glass rounded-3xl p-6 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(156,58,237,0.08)' }}>
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/15 to-transparent pointer-events-none"></div>
          <h2 className="text-xl font-heading font-extrabold text-white mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent animate-pulse-glow" />
            Premios Estelares SAIO-XV
          </h2>
          <p className="text-secondary text-xs max-w-2xl leading-relaxed">
            Acumula puntos estelares participando en charlas, resolviendo retos en los stands y asistiendo a los workshops de Entropix. Canjea tus puntos acumulados en tiempo real por merchandising exclusivo del evento.
          </p>
        </section>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Carga del Catálogo */}
        {isLoading ? (
          <div className="py-16 text-center text-secondary text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-heading text-xs tracking-wider uppercase">Cargando Premios de la Base de Datos...</p>
          </div>
        ) : (
          /* Grid de Premios */
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardsList.map((reward) => {
              const canAfford = (user?.puntos || 0) >= reward.cost;
              const isClaimed = claimedRewards.includes(reward.id);
              const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;
              
              return (
                <div 
                  key={reward.id} 
                  className={`glass-light p-6 rounded-2xl border flex flex-col justify-between hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 relative group
                    ${isClaimed 
                      ? 'border-emerald-500/15 opacity-70 bg-emerald-500/[0.02]' 
                      : isOutOfStock
                        ? 'border-red-500/15 opacity-60 bg-red-500/[0.01]'
                        : 'border-muted/15 hover:border-accent/30'
                    }`}
                >
                  {isClaimed && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-heading text-[9px] font-bold tracking-widest uppercase border border-emerald-500/35 z-10">
                      Canjeado
                    </div>
                  )}
                  {!isClaimed && isOutOfStock && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-heading text-[9px] font-bold tracking-widest uppercase border border-red-500/35 z-10">
                      Agotado
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`font-heading font-bold text-sm transition-colors
                        ${isClaimed 
                          ? 'text-emerald-400' 
                          : 'text-white group-hover:text-accent'
                        }`}
                      >
                        {reward.title}
                      </h3>
                      <div className="p-2 rounded-xl bg-primary/20 text-accent font-heading font-extrabold text-xs shrink-0 font-mono">
                        {reward.cost.toLocaleString()} PTS
                      </div>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                      {reward.desc}
                    </p>

                    {reward.stock !== undefined && (
                      <div className="pt-2 flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider">
                        <span className="text-secondary">Disponibles:</span>
                        <span className={reward.stock > 0 ? 'text-accent font-mono font-bold' : 'text-red-400 font-mono font-bold'}>
                          {reward.stock > 0 ? `${reward.stock} uds` : 'Agotado'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-muted/10">
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={isRedeeming !== null || isClaimed || isOutOfStock || !canAfford}
                      className={`w-full py-2 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                        ${isClaimed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                          : isOutOfStock
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                            : canAfford 
                              ? 'bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white hover:shadow-[0_0_15px_rgba(156,58,237,0.3)]' 
                              : 'bg-muted/10 text-secondary/40 border border-muted/10 cursor-not-allowed'
                        }`}
                    >
                      {isRedeeming === reward.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>
                            {isClaimed 
                              ? 'Premio Reclamado' 
                              : isOutOfStock 
                                ? 'Agotado' 
                                : canAfford 
                                  ? 'Canjear Premio' 
                                  : 'Puntos Insuficientes'
                            }
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
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
