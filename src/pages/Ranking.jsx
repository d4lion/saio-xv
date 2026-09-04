import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsService } from '../services/pointsService';
import { Trophy, Crown, Coins, RefreshCw } from 'lucide-react';

export default function Ranking() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRanking = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      // Cargamos el top 100 para computar también el ranking exacto del usuario
      const topUsers = await pointsService.getLeaderboard(100);
      setLeaderboard(topUsers.slice(0, 10));
      
      const index = topUsers.findIndex(u => u.uid === user.uid);
      if (index !== -1) {
        setUserRank(index + 1);
      } else {
        setUserRank(null);
      }
    } catch (err) {
      console.error("Error al cargar ranking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [user]);

  // Auxiliar para reorganizar el podio en orden visual: 2do (izquierda), 1ro (centro), 3ro (derecha)
  const getPodiumList = () => {
    const podium = [];
    if (leaderboard[1]) podium.push({ ...leaderboard[1], position: 2 });
    if (leaderboard[0]) podium.push({ ...leaderboard[0], position: 1 });
    if (leaderboard[2]) podium.push({ ...leaderboard[2], position: 3 });
    return podium;
  };

  const podiumUsers = getPodiumList();
  const remainingUsers = leaderboard.slice(3);

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'EX';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header local */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black text-white">Tabla de Posiciones</h1>
            <p className="text-secondary text-sm">Podio de los mejores exploradores del evento.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadRanking} 
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl text-white transition-colors cursor-pointer shadow-sm"
            disabled={isLoading}
            title="Refrescar ranking"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-4 py-2.5 rounded-xl bg-purple-900/20 border border-purple-500/20 text-sm font-bold text-white shadow-lg shadow-purple-900/20 flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent" />
            <span className="text-accent font-black">{Number(user?.puntos || 0).toLocaleString()} PTS</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center">
        {/* Cargando */}
        {isLoading ? (
          <div className="py-24 text-center text-secondary text-sm flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <p className="font-heading text-xs tracking-[0.2em] uppercase font-bold text-secondary/60">Ordenando el Podio Estelar...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-24 text-center text-secondary font-mono tracking-widest text-sm leading-relaxed uppercase">
            No se han registrado usuarios con puntos en el evento aún.
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-12">
            {/* Sección del Podio (Top 3) */}
            <section className="relative pt-12 pb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent blur-3xl pointer-events-none rounded-3xl"></div>
              
              <div className="flex items-end justify-center gap-4 sm:gap-8 max-w-lg mx-auto relative z-10">
                {podiumUsers.map((pUser) => {
                  const isGold = pUser.position === 1;
                  const isSilver = pUser.position === 2;
                  const isBronze = pUser.position === 3;
                  const isSelf = pUser.uid === user?.uid;

                  return (
                    <div 
                      key={pUser.uid} 
                      className={`flex flex-col items-center w-28 sm:w-36 transition-transform duration-500 hover:-translate-y-2
                        ${isGold ? 'order-2 z-20 scale-110 sm:scale-125' : isSilver ? 'order-1 z-10' : 'order-3 z-10'}`}
                    >
                      {/* Avatar del Podio */}
                      <div className="relative mb-4 flex flex-col items-center">
                        {isGold && <Crown className="w-8 h-8 text-yellow-400 absolute -top-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse-glow" />}
                        
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-heading font-black text-lg border-2 shadow-2xl backdrop-blur-md
                          ${isGold 
                            ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.3)]' 
                            : isSilver 
                              ? 'bg-slate-400/20 border-slate-300 text-slate-200 shadow-[0_0_20px_rgba(148,163,184,0.2)]' 
                              : 'bg-amber-700/20 border-amber-600 text-amber-200 shadow-[0_0_20px_rgba(180,83,9,0.2)]'
                          } ${isSelf ? 'ring-4 ring-accent ring-offset-4 ring-offset-[#050507]' : ''}`}
                        >
                          {getInitials(pUser.nombre)}
                        </div>

                        {/* Medalla de posición */}
                        <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-lg
                          ${isGold 
                            ? 'bg-yellow-400 border-yellow-200 text-[#050507]' 
                            : isSilver 
                              ? 'bg-slate-300 border-slate-100 text-[#050507]' 
                              : 'bg-amber-600 border-amber-400 text-white'
                          }`}
                        >
                          {pUser.position}
                        </div>
                      </div>

                      {/* Info del usuario */}
                      <div className="text-center w-full mb-3 bg-black/40 rounded-xl py-2 px-1 border border-white/5 backdrop-blur-sm">
                        <p className={`text-[10px] sm:text-xs font-bold truncate px-2 ${isSelf ? 'text-accent' : 'text-white'}`}>
                          {pUser.nombre}
                        </p>
                        <p className={`text-[10px] font-black font-mono mt-1 tracking-widest
                          ${isGold ? 'text-yellow-400' : isSilver ? 'text-slate-300' : 'text-amber-500'}`}>
                          {Number(pUser.puntos || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Pedestal */}
                      <div 
                        className={`w-full rounded-t-3xl border-t border-x relative overflow-hidden flex flex-col justify-end items-center pb-3 shadow-[inset_0_-20px_50px_rgba(0,0,0,0.5)]
                          ${isGold 
                            ? 'h-32 sm:h-40 bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' 
                            : isSilver 
                              ? 'h-24 sm:h-28 bg-gradient-to-b from-slate-400/20 to-slate-400/5 border-slate-400/30' 
                              : 'h-16 sm:h-20 bg-gradient-to-b from-amber-700/20 to-amber-700/5 border-amber-700/30'}`}
                      >
                        <span className={`font-heading font-black text-xl sm:text-2xl opacity-30 drop-shadow-md
                          ${isGold ? 'text-yellow-400' : isSilver ? 'text-slate-300' : 'text-amber-500'}`}>
                          {isGold ? '1' : isSilver ? '2' : '3'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Listado del Resto del Top (Puestos 4 a 10) */}
            {remainingUsers.length > 0 && (
              <section className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-xs uppercase text-secondary tracking-widest">Resto del Top 10</h3>
                </div>

                <div className="space-y-3">
                  {remainingUsers.map((item, index) => {
                    const rank = index + 4;
                    const isSelf = item.uid === user?.uid;

                    return (
                      <div 
                        key={item.uid}
                        className={`glass p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 border transition-all duration-300 group
                          ${isSelf 
                            ? 'border-accent/50 bg-accent/10 shadow-[0_0_20px_rgba(156,58,237,0.15)]' 
                            : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          {/* Rank */}
                          <span className="font-heading font-black text-sm sm:text-base text-secondary/50 w-8 text-center group-hover:text-white transition-colors">
                            #{rank}
                          </span>

                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-sm border
                            ${isSelf 
                              ? 'border-accent text-accent bg-accent/20' 
                              : 'bg-white/5 text-white/70 border-white/10 group-hover:border-white/30'}`}
                          >
                            {getInitials(item.nombre)}
                          </div>

                          {/* Nombre */}
                          <div>
                            <span className={`text-sm font-bold block mb-0.5 flex items-center gap-2 ${isSelf ? 'text-accent' : 'text-white'}`}>
                              {item.nombre} 
                              {isSelf && <span className="text-[9px] font-heading font-black uppercase bg-accent text-white px-1.5 py-0.5 rounded tracking-widest shadow-lg shadow-accent/50">Tú</span>}
                            </span>
                            <span className="text-[10px] text-secondary tracking-widest uppercase font-mono">Explorador</span>
                          </div>
                        </div>

                        {/* Puntos */}
                        <div className="text-right">
                          <span className={`font-mono text-base font-black ${isSelf ? 'text-white' : 'text-secondary group-hover:text-white transition-colors'}`}>
                            {Number(item.puntos || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-secondary uppercase font-bold tracking-widest block">PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Ficha Exclusiva de Tu Posición (Si no estás en el podio superior o en el top 10) */}
            {userRank !== null && userRank > 10 && (
              <section className="max-w-2xl mx-auto pt-8">
                <div className="glass p-6 sm:p-8 rounded-[2rem] border border-accent/40 bg-accent/10 flex items-center justify-between shadow-[0_0_40px_rgba(156,58,237,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-accent border border-accent/50 flex items-center justify-center text-white shadow-lg shadow-accent/40">
                      <Trophy className="w-7 h-7 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-lg text-white">Tu Posición Actual</h4>
                      <p className="text-secondary text-xs mt-1 max-w-[200px] leading-relaxed">Sigue reclamando códigos y participando para escalar posiciones.</p>
                    </div>
                  </div>

                  <div className="text-right relative z-10">
                    <p className="text-4xl font-heading font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">#{userRank}</p>
                    <p className="text-[10px] text-accent uppercase font-bold tracking-widest font-mono mt-1">Ranking</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
