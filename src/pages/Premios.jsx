import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Gift, Award, CheckCircle, AlertTriangle, Coins, X, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import QRCode from 'qrcode';

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
  const [userClaims, setUserClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimQrUrl, setClaimQrUrl] = useState('');
  const [expandedDesc, setExpandedDesc] = useState({});

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const active = await pointsService.getActiveRewards();
      setRewardsList(active);

      const claims = await pointsService.getUserClaims(user.uid);
      setUserClaims(claims);
      const claimed = claims.map(c => c.rewardId);
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

  useEffect(() => {
    if (selectedClaim?.id) {
      QRCode.toDataURL(selectedClaim.id, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#0e0a34'
        }
      })
      .then(url => {
        setClaimQrUrl(url);
      })
      .catch(err => {
        console.error("Error al generar QR de canje:", err);
      });
    } else {
      setClaimQrUrl('');
    }
  }, [selectedClaim]);

  const handleRedeem = async (reward) => {
    if (!user?.uid) return;
    
    if (claimedRewards.includes(reward.id)) {
      toast.warning('Premio ya Canjeado: Ya has reclamado este premio anteriormente.');
      return;
    }

    if (user.puntos < reward.cost) {
      toast.error(`Puntos Insuficientes: Necesitas ${reward.cost} PTS, tu saldo actual es de ${user.puntos} PTS.`);
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
      toast.success(`¡Premio Canjeado! Has canjeado "${reward.title}" con éxito.`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al procesar el canje.');
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header local */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-white">Catálogo de Premios</h1>
            <p className="text-secondary text-sm">Canjea tus puntos por merchandising exclusivo del evento.</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-purple-900/20 border border-purple-500/20 text-sm font-bold text-white shadow-lg shadow-purple-900/20 flex items-center gap-2">
          <Coins className="w-4 h-4 text-accent" />
          Balance: <span className="text-accent font-black">{(user?.puntos || 0).toLocaleString()} PTS</span>
        </div>
      </div>

      {/* Banner Motivacional */}
      <section className="glass rounded-[2rem] p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/10 shadow-lg bg-black/20">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-900/20 to-transparent pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center shrink-0 glow-purple">
          <Award className="w-8 h-8 text-accent animate-pulse-glow" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-heading font-black text-white mb-3 tracking-wide">
            Premios Estelares
          </h2>
          <p className="text-secondary text-sm max-w-2xl leading-relaxed tracking-wide">
            Acumula puntos estelares participando en charlas, resolviendo retos en los stands y asistiendo a los workshops. Canjea tus puntos acumulados en tiempo real por beneficios exclusivos.
          </p>
        </div>
      </section>

      {/* Feedback alerts */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3 backdrop-blur-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Carga del Catálogo */}
      {isLoading ? (
        <div className="py-24 text-center text-secondary text-sm flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <p className="font-heading text-xs tracking-[0.2em] uppercase font-bold text-secondary/60">Cargando Catálogo...</p>
        </div>
      ) : (
        /* Grid de Premios */
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rewardsList.map((reward) => {
            const canAfford = (user?.puntos || 0) >= reward.cost;
            const isClaimed = claimedRewards.includes(reward.id);
            const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;
            
            return (
              <div 
                key={reward.id} 
                className={`glass p-6 sm:p-8 rounded-[1.5rem] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden
                  ${isClaimed 
                    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                    : isOutOfStock
                      ? 'border-red-500/20 bg-red-500/5 opacity-70'
                      : 'border-white/10 bg-black/20 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(156,58,237,0.15)]'
                  }`}
              >
                {/* Decoration Overlay */}
                {!isClaimed && !isOutOfStock && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10 transition-colors z-0" />}

                {/* Badges */}
                {isClaimed && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-heading text-[10px] font-bold tracking-widest uppercase border border-emerald-500/30 z-20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-3 h-3" /> Canjeado
                  </div>
                )}
                {!isClaimed && isOutOfStock && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-heading text-[10px] font-bold tracking-widest uppercase border border-red-500/30 z-20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-3 h-3" /> Agotado
                  </div>
                )}

                {/* Reward Image */}
                <div className={`w-full h-40 sm:h-48 rounded-2xl mb-6 overflow-hidden relative border shrink-0 z-10 transition-all duration-300
                  ${isClaimed ? 'border-emerald-500/20 opacity-80' : isOutOfStock ? 'border-red-500/20 opacity-50' : 'border-white/10 bg-black/40 group-hover:border-white/20'}
                `}>
                  {reward.imageUrl || reward.imagen ? (
                    <img 
                      src={reward.imageUrl || reward.imagen} 
                      alt={reward.title} 
                      className={`w-full h-full object-contain p-2 transition-transform duration-700 ${!isClaimed && !isOutOfStock ? 'group-hover:scale-110' : ''}`} 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-secondary/30 bg-white/5">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Sin Imagen</span>
                    </div>
                  )}
                  {/* Gradient Overlay for better text blending if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div className="space-y-4 relative z-10 mt-6 sm:mt-8">
                  <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <h3 className={`font-heading font-black text-xl transition-colors
                      ${isClaimed 
                        ? 'text-emerald-400' 
                        : 'text-white group-hover:text-purple-300'
                      }`}
                    >
                      {reward.title}
                    </h3>
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-accent font-heading font-black text-sm shrink-0 shadow-inner">
                      {reward.cost.toLocaleString()} PTS
                    </div>
                  </div>
                  <div className="text-sm text-secondary leading-relaxed tracking-wide">
                    {reward.desc?.length > 80 ? (
                      <>
                        {expandedDesc[reward.id] ? reward.desc : `${reward.desc.substring(0, 80)}... `}
                        <button 
                          onClick={() => toggleDesc(reward.id)}
                          className="text-accent hover:text-purple-300 font-bold ml-1 inline-flex items-center gap-1 transition-colors outline-none"
                        >
                          {expandedDesc[reward.id] ? (
                            <>Ver menos <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Ver más <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      </>
                    ) : (
                      reward.desc
                    )}
                  </div>

                  {reward.stock !== undefined && (
                    <div className="pt-2 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest font-mono">
                      <span className="text-secondary/60">Disponibles:</span>
                      <span className={reward.stock > 0 ? 'text-accent' : 'text-red-400'}>
                        {reward.stock > 0 ? `${reward.stock} uds` : 'Agotado'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                  <button
                    onClick={() => {
                      if (isClaimed) {
                        const claim = userClaims.find(c => c.rewardId === reward.id);
                        if (claim) {
                          setSelectedClaim(claim);
                          setShowClaimModal(true);
                        }
                      } else {
                        handleRedeem(reward);
                      }
                    }}
                    disabled={isRedeeming !== null || (isOutOfStock && !isClaimed) || (!canAfford && !isClaimed)}
                    className={`w-full py-3.5 rounded-full font-heading text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                      ${isClaimed
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                        : isOutOfStock
                          ? 'bg-white/5 text-secondary/40 border border-white/5 cursor-not-allowed'
                          : canAfford 
                            ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]' 
                            : 'bg-black/40 text-secondary/40 border border-white/10 cursor-not-allowed'
                      }`}
                  >
                    {isRedeeming === reward.id ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>
                          {isClaimed 
                            ? 'Ver Ticket QR' 
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

      {/* Modal del Ticket QR de Canje */}
      {showClaimModal && selectedClaim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm overflow-hidden border border-white/10 rounded-[2.5rem] bg-black/90 text-white shadow-2xl p-8 flex flex-col items-center">
            {/* Cabecera */}
            <div className="w-full flex justify-between items-center mb-8">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-accent">Ticket de Canje</span>
              <button 
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedClaim(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detalles del Premio */}
            <h4 className="text-xl font-heading font-black text-white text-center mb-3">
              {selectedClaim.premio}
            </h4>
            <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 font-heading text-[10px] font-bold rounded-full uppercase tracking-widest mb-8 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-3.5 h-3.5" />
              {selectedClaim.estado === 'pendiente' ? 'Pendiente de Entrega' : 'Entregado'}
            </div>

            {/* Imagen del Código QR */}
            <div className="p-5 bg-white border border-white/10 rounded-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] glow-purple flex items-center justify-center">
              {claimQrUrl ? (
                <img 
                  src={claimQrUrl} 
                  alt="Código QR de Canje" 
                  className="w-48 h-48 object-contain rounded-xl" 
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-black font-mono tracking-widest uppercase animate-pulse">
                  Generando...
                </div>
              )}
            </div>

            {/* Información adicional del ticket */}
            <div className="w-full space-y-3 border-t border-white/10 pt-6 text-[10px] font-mono tracking-wider">
              <div className="flex justify-between items-center">
                <span className="text-secondary/70">CÓDIGO ÚNICO</span>
                <span className="text-white font-bold">{selectedClaim.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary/70">COSTO</span>
                <span className="text-accent font-bold text-xs">{selectedClaim.costo} PTS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary/70">FECHA</span>
                <span className="text-white">{new Date(selectedClaim.fecha).toLocaleString()}</span>
              </div>
            </div>

            <p className="mt-8 text-[10px] text-center text-secondary/60 leading-relaxed font-semibold uppercase tracking-widest">
              Muestra este código al staff del evento para reclamar tu premio físico.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
