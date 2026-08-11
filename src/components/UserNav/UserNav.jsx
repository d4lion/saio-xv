import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, QrCode, Ticket, Gift, Trophy, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export default function UserNav() {
  const { user } = useAuth();
  const userRole = user?.rol ? String(user.rol).toLowerCase() : '';
  const canAccessDashboard = userRole === ROLES.ADMIN || userRole === ROLES.COORDINADOR;

  const tabs = [
    { label: 'Mi Entrada', to: '/mi-entrada', icon: Ticket },
    { label: 'Mis Puntos', to: '/mis-puntos', icon: QrCode },
    { label: 'Premios', to: '/premios', icon: Gift },
    { label: 'Ranking', to: '/ranking', icon: Trophy },
    { label: 'Perfil', to: '/perfil', icon: User },
  ];

  return (
    <nav className="w-full border-b border-muted/10 py-3 bg-black/10 backdrop-blur-sm z-20">
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none max-w-7xl mx-auto w-full px-6 justify-start sm:justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer shrink-0 select-none
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-light to-accent border-accent/40 text-white shadow-lg shadow-accent/15 scale-105' 
                  : 'glass-light border-muted/15 text-secondary hover:text-white hover:border-accent/30'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}

        {canAccessDashboard && (
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 border border-purple-400/40 bg-gradient-to-r from-purple-900/60 to-purple-600/60 text-purple-100 hover:text-white hover:from-purple-800/80 hover:to-purple-500/80 cursor-pointer shrink-0 select-none shadow-lg shadow-purple-950/40"
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-purple-300" />
            <span>Ir al Dashboard</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
