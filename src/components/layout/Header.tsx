/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Sparkles, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModuleType } from '../../types/database';

export const Header: React.FC = () => {
  const { activeModule, setActiveModule, store } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getFormattedDate = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }).format(now);
  };

  const moduleColors: Record<ModuleType, string> = {
    inicio: '#FFFFFF',
    finance: '#00FF88',
    casa: '#FF8A26',
    corpo: '#FF3B30',
    tempo: '#A855F7',
    garagem: '#FFCC00',
    docs: '#38BDF8',
    mente: '#E5E5E5',
    config: '#888888'
  };

  const moduleNames: Record<ModuleType, string> = {
    inicio: 'DASHBOARD OS',
    finance: 'LUME FINANCE',
    casa: 'LUME CASA',
    corpo: 'LUME CORPO',
    tempo: 'LUME TEMPO',
    garagem: 'LUME GARAGEM',
    docs: 'LUME DOCS',
    mente: 'LUME MENTE',
    config: 'CONFIGURAÇÕES'
  };

  const currentColor = moduleColors[activeModule] || '#FFFFFF';

  return (
    <header className="sticky top-0 z-30 bg-[#000000]/90 backdrop-blur-xl border-b border-[#222222] px-4 pt-3 pb-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & Greeting */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-widest text-[#888888] uppercase">
              LUME OS <span className="text-white/40">by Lume Labs</span>
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: currentColor, boxShadow: `0 0 6px ${currentColor}` }}
            />
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-lg font-black text-white tracking-tight">
              {getGreeting()}, {store.config.userName.split(' ')[0]}
            </h1>
            <span className="text-xs text-[#888888] capitalize">
              • {getFormattedDate()}
            </span>
          </div>
        </div>

        {/* Right action & connection pill */}
        <div className="flex items-center gap-2">
          {store.config.supabaseUrl ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#111111] border border-[#222222] text-[10px] text-[#00FF88] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              <span>SUPABASE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#111111] border border-[#222222] text-[10px] text-[#888888] font-bold">
              <Wifi size={11} className="text-[#888888]" />
              <span>LOCAL</span>
            </div>
          )}

          <button
            onClick={() => setActiveModule('config')}
            title="Configurações e Supabase"
            className="w-9 h-9 rounded-[10px] bg-[#111111] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>

      {/* Module Title Pill if not in Inicio */}
      {activeModule !== 'inicio' && (
        <div className="max-w-md mx-auto mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentColor, boxShadow: `0 0 8px ${currentColor}` }}
            />
            <span
              className="text-xs font-black tracking-wider uppercase"
              style={{ color: currentColor }}
            >
              {moduleNames[activeModule]}
            </span>
          </div>
          <button
            onClick={() => setActiveModule('inicio')}
            className="text-[11px] font-bold text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            ← Voltar ao Início
          </button>
        </div>
      )}
    </header>
  );
};
