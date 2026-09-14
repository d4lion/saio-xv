import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import {
  Gift, Award, CheckCircle, AlertTriangle, Coins,
  X, Sparkles, ArrowRight, Lock, ChevronDown, ChevronUp
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import QRCode from 'qrcode';

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

const CARD_ACCENTS = [
  { border: 'rgba(156,58,237,0.55)', glow: 'rgba(156,58,237,0.15)', badge: '#9c3aed', gradFrom: 'rgba(156,58,237,0.6)', tag: 'bg-purple-500/15 border-purple-500/30 text-purple-300', num: '#9c3aed' },
  { border: 'rgba(76,41,182,0.6)',   glow: 'rgba(76,41,182,0.15)',  badge: '#4c29b6', gradFrom: 'rgba(76,41,182,0.7)',  tag: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',  num: '#4c29b6' },
  { border: 'rgba(99,102,241,0.55)', glow: 'rgba(99,102,241,0.15)', badge: '#6366f1', gradFrom: 'rgba(99,102,241,0.65)',tag: 'bg-violet-500/15 border-violet-500/30 text-violet-300',  num: '#6366f1' },
  { border: 'rgba(168,85,247,0.55)', glow: 'rgba(168,85,247,0.15)', badge: '#a855f7', gradFrom: 'rgba(168,85,247,0.6)',tag: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300',num: '#a855f7' },
];

export default function Premios() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogo');
  const [rewardsList, setRewardsList] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(null);
  const [userClaims, setUserClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimQrUrl, setClaimQrUrl] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
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
      setClaimedRewards(claims.map(c => c.rewardId));
    } catch (err) {
      console.error('Error al cargar premios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    if (selectedClaim?.id) {
      QRCode.toDataURL(selectedClaim.id, {
        width: 300, margin: 2,
        color: { dark: '#ffffff', light: '#0e0a34' }
      }).then(url => setClaimQrUrl(url)).catch(console.error);
    } else {
      setClaimQrUrl('');
    }
  }, [selectedClaim]);

  const handleRedeem = async (reward) => {
    if (!user?.uid) return;
    if (claimedRewards.includes(reward.id)) { toast.warning('Ya has reclamado este premio anteriormente.'); return; }
    if (user.puntos < reward.cost) { toast.error(`Necesitas ${reward.cost} PTS. Tu saldo: ${user.puntos} PTS.`); return; }

    const confirmResult = await themedSwal.fire({
      title: '¿Confirmar Canje?',
      text: `¿Deseas canjear "${reward.title}" por ${reward.cost.toLocaleString()} puntos?`,
      icon: 'question', showCancelButton: true,
      confirmButtonText: 'Sí, Canjear', cancelButtonText: 'Cancelar'
    });
    if (!confirmResult.isConfirmed) return;

    setIsRedeeming(reward.id);
    try {
      await pointsService.redeemReward(user.uid, reward.id, reward.cost, reward.title);
      toast.success(`¡Premio Canjeado! Has canjeado "${reward.title}".`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Error al procesar el canje.');
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">

      {/* ══ HERO HEADER ══ */}
      <div className="relative rounded-[1.75rem] overflow-hidden bg-black/30 border border-white/8 px-6 py-8 sm:px-12 sm:py-14">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-purple-600/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-8 right-8 w-48 h-48 bg-indigo-600/15 rounded-full blur-[50px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black text-white leading-[1.05] tracking-tight">
              Premios<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Estelares
              </span>
            </h1>
            <p className="text-secondary text-sm mt-3 max-w-sm leading-relaxed">
              Acumula puntos en charlas, retos y workshops. Canjéalos por beneficios exclusivos.
            </p>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm self-start sm:self-auto">
            <Coins className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 leading-none mb-0.5">Tu saldo</div>
              <div className="text-xl font-black font-heading text-white tabular-nums leading-none">
                {(user?.puntos || 0).toLocaleString()} <span className="text-xs text-purple-400">PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="flex border-b border-white/10">
        {[
          { key: 'catalogo', label: 'Catálogo', icon: <Gift className="w-4 h-4" /> },
          { key: 'mis-premios', label: 'Mis Canjes', icon: <Award className="w-4 h-4" /> }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 pb-4 flex items-center justify-center gap-2 font-heading text-sm font-bold uppercase tracking-widest relative cursor-pointer transition-all duration-300
              ${activeTab === tab.key ? 'text-white' : 'text-secondary/50 hover:text-secondary'}`}
          >
            {tab.icon}{tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(156,58,237,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3"><AlertTriangle className="w-5 h-5 shrink-0 text-red-400" /><span>{error}</span></div>}
      {success && <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3"><CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" /><span>{success}</span></div>}

      {/* ══ LOADING ══ */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
          </div>
          <p className="font-heading text-[10px] tracking-[0.3em] uppercase font-bold text-secondary/50">Cargando Catálogo...</p>
        </div>

      ) : activeTab === 'catalogo' ? (

        /* ══════════════════════════════════════════════
           CATÁLOGO — Mobile-first Awwwards card layout
           ════════════════════════════════════════════ */
        <section className="flex flex-col gap-4 sm:gap-5">
          {rewardsList.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Gift className="w-8 h-8 text-secondary/30" />
              </div>
              <p className="text-secondary/50 font-mono text-xs uppercase tracking-widest">No hay premios disponibles en este momento.</p>
            </div>
          ) : (
            rewardsList.map((reward, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const canAfford = (user?.puntos || 0) >= reward.cost;
              const isClaimed = claimedRewards.includes(reward.id);
              const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;
              const isHovered = hoveredId === reward.id;

              return (
                <div
                  key={reward.id}
                  onMouseEnter={() => setHoveredId(reward.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderColor: isClaimed
                      ? 'rgba(16,185,129,0.4)'
                      : isHovered
                        ? accent.border
                        : 'rgba(255,255,255,0.07)',
                    boxShadow: isHovered && !isClaimed && !isOutOfStock
                      ? `0 0 50px ${accent.glow}, 0 16px 50px rgba(0,0,0,0.35)`
                      : isClaimed
                        ? '0 0 30px rgba(16,185,129,0.08)'
                        : '0 4px 20px rgba(0,0,0,0.25)',
                  }}
                  className={`group relative rounded-[1.75rem] border overflow-hidden transition-all duration-500
                    ${isClaimed ? 'bg-emerald-950/25' : isOutOfStock ? 'opacity-60 bg-black/20' : 'bg-black/35'}`}
                >
                  {/* ─── MOBILE LAYOUT: image top + content bottom ─── */}
                  {/* ─── DESKTOP (sm+): image left + content right ─── */}
                  <div className="flex flex-col sm:flex-row">

                    {/* IMAGE PANEL */}
                    <div className="relative w-full h-56 sm:h-auto sm:w-56 md:w-64 shrink-0 overflow-hidden">

                      {/* Ordinal number — top-right on mobile, top-left on desktop */}
                      <div
                        className="absolute top-3 right-4 sm:top-4 sm:left-4 sm:right-auto z-20 font-heading font-black text-4xl sm:text-5xl leading-none select-none pointer-events-none opacity-50"
                        style={{ color: isClaimed ? '#10b981' : '#ffffff', textShadow: `0 0 20px ${isClaimed ? 'rgba(16,185,129,0.6)' : accent.glow}` }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>



                      {/* Image itself */}
                      {reward.imageUrl || reward.imagen ? (
                        <img
                          src={reward.imageUrl || reward.imagen}
                          alt={reward.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered && !isClaimed && !isOutOfStock ? 'scale-110' : 'scale-100'} ${isClaimed ? 'opacity-75' : ''}`}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center gap-3"
                          style={{ background: `linear-gradient(135deg, ${accent.gradFrom.replace(/[\d.]+\)$/, '0.3)')} 0%, rgba(5,5,20,0.8) 100%)` }}
                        >
                          <Gift className="w-12 h-12 opacity-20" style={{ color: accent.badge }} />
                        </div>
                      )}

                      {/* Mobile: strong scrim — bottom 65% covers most images */}
                      <div className="sm:hidden absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)' }} />

                      {/* Mobile: title text overlaid on image */}
                      <div className="sm:hidden absolute bottom-0 left-0 right-0 z-20 p-4 pb-5">
                        {/* Status pill with blur bg */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1.5 backdrop-blur-sm ${
                            isClaimed
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : isOutOfStock
                              ? 'bg-red-500/25 text-red-300 border border-red-500/40'
                              : 'bg-purple-500/25 text-purple-200 border border-purple-500/35'
                          }`}
                        >
                          {isClaimed ? (
                            <><CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> Canjeado</>
                          ) : isOutOfStock ? (
                            <><AlertTriangle className="w-2.5 h-2.5 text-red-400" /> Agotado</>
                          ) : (
                            <><Sparkles className="w-2.5 h-2.5" /> Disponible</>
                          )}
                        </span>
                        {/* Title with strong text-shadow so it pops over any image */}
                        <h3
                          className="text-xl font-heading font-black text-white leading-tight tracking-tight"
                          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7)' }}
                        >
                          {reward.title}
                        </h3>
                      </div>

                      {/* Desktop: right gradient fade — stronger */}
                      <div className="hidden sm:block absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
                    </div>

                    {/* CONTENT PANEL */}
                    <div className="flex flex-col justify-between flex-1 p-5 sm:p-7">

                      {/* Desktop-only title (hidden on mobile, shown on image overlay) */}
                      <div className="hidden sm:block mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${
                            isClaimed
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                              : isOutOfStock
                              ? 'bg-red-500/10 border-red-500/25 text-red-400'
                              : accent.tag
                          }`}
                        >
                          {isClaimed ? (
                            <><CheckCircle className="w-2.5 h-2.5" /> Canjeado</>
                          ) : isOutOfStock ? (
                            <><AlertTriangle className="w-2.5 h-2.5" /> Agotado</>
                          ) : (
                            <><Sparkles className="w-2.5 h-2.5" /> Disponible</>
                          )}
                        </span>
                        <h3 className={`text-2xl md:text-3xl font-heading font-black leading-tight tracking-tight transition-colors duration-300
                          ${isClaimed ? 'text-emerald-400' : 'text-white'}`}
                        >
                          {reward.title}
                        </h3>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between mb-4 sm:mb-0">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-secondary/50 mb-0.5 sm:mb-1">Costo</div>
                          <div
                            className="text-2xl sm:text-3xl font-black font-heading tabular-nums leading-none"
                            style={{ color: isClaimed ? '#10b981' : accent.badge }}
                          >
                            {reward.cost.toLocaleString()}
                            <span className="text-xs ml-1 font-bold" style={{ color: isClaimed ? '#10b981' : accent.badge }}>PTS</span>
                          </div>
                        </div>

                        {/* Stock pill — visible on mobile next to price */}
                        {reward.stock !== undefined && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${reward.stock > 0 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-red-400'}`} />
                            <span className="text-[10px] font-mono font-bold text-secondary/70 uppercase tracking-wider">
                              {reward.stock > 0 ? `${reward.stock} uds` : 'Agotado'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description — hidden on mobile to keep it clean */}
                      {reward.desc && (
                        <p className="hidden sm:block text-secondary text-sm leading-relaxed mb-5 line-clamp-2">
                          {reward.desc}
                        </p>
                      )}

                      {/* Mobile description — expandable with Ver más / Ver menos */}
                      {reward.desc && (
                        <div className="sm:hidden mb-4">
                          <p className={`text-secondary/70 text-xs leading-relaxed ${!expandedDesc[reward.id] && reward.desc.length > 80 ? 'line-clamp-2' : ''}`}>
                            {reward.desc}
                          </p>
                          {reward.desc.length > 80 && (
                            <button
                              type="button"
                              onClick={() => toggleDesc(reward.id)}
                              className="text-[11px] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1 transition-opacity hover:opacity-80 outline-none"
                              style={{ color: isClaimed ? '#10b981' : accent.badge }}
                            >
                              {expandedDesc[reward.id] ? (
                                <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</>
                              ) : (
                                <><ChevronDown className="w-3.5 h-3.5" /> Ver más</>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* CTA ROW */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-white/8">

                        {/* Affordability status (desktop only) */}
                        <div className="hidden sm:flex items-center gap-2">
                          {!isClaimed && !isOutOfStock && (
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${canAfford ? 'text-purple-400' : 'text-secondary/40'}`}>
                              {canAfford ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {canAfford ? 'Puedes canjear' : 'Sin fondos'}
                            </span>
                          )}
                        </div>

                        {/* CTA Button — full width on mobile */}
                        <button
                          onClick={() => {
                            if (isClaimed) {
                              const claim = userClaims.find(c => c.rewardId === reward.id);
                              if (claim) { setSelectedClaim(claim); setShowClaimModal(true); }
                            } else {
                              handleRedeem(reward);
                            }
                          }}
                          disabled={isRedeeming !== null || (isOutOfStock && !isClaimed) || (!canAfford && !isClaimed)}
                          className={`group/btn relative w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-3 rounded-2xl font-heading text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden
                            ${isClaimed
                              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 cursor-pointer'
                              : isOutOfStock
                                ? 'bg-white/5 text-secondary/30 border border-white/5 cursor-not-allowed'
                                : canAfford
                                  ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl cursor-pointer'
                                  : 'bg-white/5 text-secondary/30 border border-white/8 cursor-not-allowed'
                            }`}
                        >
                          {/* Shimmer on hover */}
                          {canAfford && !isClaimed && !isOutOfStock && (
                            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                          )}

                          {isRedeeming === reward.id ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <>
                              {isClaimed ? <Gift className="w-4 h-4" />
                                : canAfford && !isOutOfStock ? <Sparkles className="w-4 h-4" />
                                : <Lock className="w-4 h-4" />}
                              <span>
                                {isClaimed ? 'Ver Ticket QR'
                                  : isOutOfStock ? 'Agotado'
                                  : canAfford ? 'Canjear Ahora'
                                  : 'Sin puntos'}
                              </span>
                              {canAfford && !isClaimed && !isOutOfStock && (
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

      ) : (

        /* ══ MIS CANJES ══ */
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {userClaims.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Gift className="w-8 h-8 text-secondary/30" />
              </div>
              <p className="text-secondary/50 font-mono text-xs uppercase tracking-widest">No has canjeado ningún premio aún.</p>
            </div>
          ) : (
            userClaims.map((claim, index) => (
              <div key={claim.id}
                className="relative group flex flex-col justify-between p-6 rounded-[1.75rem] border border-emerald-500/25 bg-emerald-950/20 overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/8 transition-colors" />
                <div className="absolute top-4 right-5 font-heading font-black text-[4rem] leading-none select-none pointer-events-none opacity-[0.05] text-emerald-400">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${claim.estado === 'entregado' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${claim.estado === 'entregado' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {claim.estado === 'pendiente' ? 'Pendiente de Entrega' : 'Entregado'}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-black text-white leading-tight">{claim.premio}</h3>
                  <div className="space-y-2 pt-2 border-t border-white/8">
                    <div className="flex justify-between text-[11px] font-mono tracking-wider">
                      <span className="text-secondary/60 uppercase">Costo</span>
                      <span className="text-white font-bold">{claim.costo} PTS</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono tracking-wider">
                      <span className="text-secondary/60 uppercase">Fecha</span>
                      <span className="text-white">{new Date(claim.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/8 relative z-10">
                  <button
                    onClick={() => { setSelectedClaim(claim); setShowClaimModal(true); }}
                    className="w-full py-3 rounded-xl font-heading text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 transition-all duration-300"
                  >
                    <Gift className="w-4 h-4" /> Ver Ticket QR
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* ══ MODAL TICKET QR ══ */}
      {showClaimModal && selectedClaim && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm max-h-[90dvh] flex flex-col border border-white/10 rounded-[2.5rem] bg-black/90 text-white shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 sm:p-8 pb-4 border-b border-white/10 shrink-0">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-accent">Ticket de Canje</span>
              <button onClick={() => { setShowClaimModal(false); setSelectedClaim(null); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-6 flex flex-col items-center">
              <h4 className="text-xl font-heading font-black text-white text-center mb-3">{selectedClaim.premio}</h4>
              <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 font-heading text-[10px] font-bold rounded-full uppercase tracking-widest mb-8 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {selectedClaim.estado === 'pendiente' ? 'Pendiente de Entrega' : 'Entregado'}
              </div>

              <div className="p-5 bg-white rounded-3xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center">
                {claimQrUrl
                  ? <img src={claimQrUrl} alt="Código QR de Canje" className="w-48 h-48 object-contain rounded-xl" />
                  : <div className="w-48 h-48 flex items-center justify-center text-xs text-black font-mono tracking-widest uppercase animate-pulse">Generando...</div>
                }
              </div>

              <div className="w-full space-y-3 border-t border-white/10 pt-6 text-[10px] font-mono tracking-wider">
                <div className="flex justify-between items-center">
                  <span className="text-secondary/70">CÓDIGO ÚNICO</span>
                  <span className="text-white font-bold truncate max-w-[150px] text-right" title={selectedClaim.id}>{selectedClaim.id}</span>
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
        </div>,
        document.body
      )}
    </div>
  );
}
