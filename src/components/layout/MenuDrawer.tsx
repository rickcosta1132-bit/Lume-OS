/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Wallet,
  Home as HouseIcon,
  Flame,
  Clock,
  Car,
  FileText,
  Brain,
  Settings,
  X,
  ChevronRight,
  ShieldCheck,
  Database,
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModuleType } from '../../types/database';
import { soundFx } from '../../lib/sound';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const { setActiveModule, store } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const allModules: Array<{
    id: ModuleType;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string; size?: number; color?: string }>;
    color: string;
    badge?: string;
  }> = [
    {
      id: 'inicio',
      title: 'DASHBOARD OS',
      subtitle: 'Visão executiva, alertas e patrimônio',
      icon: Home,
      color: '#FFFFFF',
      badge: 'Principal'
    },
    {
      id: 'finance',
      title: 'LUME FINANCE',
      subtitle: 'Patrimônio, investimentos, metas e dívidas',
      icon: Wallet,
      color: '#00FF88',
      badge: 'R$ ' + (store.finance_guardado.reduce((a, b) => a + Number(b.valor_atual), 0) / 1000).toFixed(0) + 'k'
    },
    {
      id: 'casa',
      title: 'LUME CASA',
      subtitle: 'Contas, despensa inteligente e manutenção',
      icon: HouseIcon,
      color: '#FF8A26',
      badge: `${store.casa_contas.length} contas`
    },
    {
      id: 'corpo',
      title: 'LUME CORPO',
      subtitle: 'Biblioteca de treinos, nutrição e biomarcadores',
      icon: Flame,
      color: '#FF3B30',
      badge: 'Treino & Água'
    },
    {
      id: 'tempo',
      title: 'LUME TEMPO',
      subtitle: 'Cronômetro com valor em R$/h e Pomodoro',
      icon: Clock,
      color: '#A855F7',
      badge: `${store.tempo_logs.length} logs`
    },
    {
      id: 'garagem',
      title: 'LUME GARAGEM',
      subtitle: 'Abastecimentos (km/l), custos e revisões',
      icon: Car,
      color: '#FFCC00',
      badge: 'Veículo Ativo'
    },
    {
      id: 'docs',
      title: 'LUME DOCS',
      subtitle: 'Cofre digital com marca d\'água de segurança',
      icon: FileText,
      color: '#38BDF8',
      badge: `${store.docs_cofre.length} docs`
    },
    {
      id: 'mente',
      title: 'LUME MENTE',
      subtitle: 'Feed estilo WhatsApp com transcrição de voz',
      icon: Brain,
      color: '#E5E5E5',
      badge: `${store.mente_notas.length} notas`
    },
    {
      id: 'config',
      title: 'CONFIGURAÇÕES',
      subtitle: 'Supabase PostgreSQL, metas e dados PWA',
      icon: Settings,
      color: '#888888',
      badge: store.config.supabaseUrl ? 'Supabase Conectado' : 'Local Storage'
    }
  ];

  const filtered = allModules.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: ModuleType) => {
    soundFx.beep(700, 0.08);
    setActiveModule(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#111111] border-t border-[#222222] rounded-t-[28px] p-5 pb-10 z-10 max-h-[88vh] overflow-y-auto shadow-2xl"
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-[#333333] rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>CENTRAL DE MÓDULOS</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#222222] text-[#00FF88] border border-[#00FF88]/30">
                    7 MÓDULOS
                  </span>
                </h3>
                <p className="text-xs text-[#888888]">LUME OS — Ecossistema Black Premium</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                placeholder="Filtrar módulos do sistema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-[#161616] border border-[#222222] text-white text-xs focus:border-white focus:outline-none placeholder:text-[#888888]"
              />
            </div>

            {/* List of modules */}
            <div className="space-y-2.5">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[16px] bg-[#161616] border border-[#222222] hover:border-[#333333] transition-all text-left active:scale-[0.98] group cursor-pointer"
                    style={{
                      borderColor: `${item.color}30`
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-[12px] flex items-center justify-center border transition-transform group-hover:scale-105 shrink-0"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}45`,
                          boxShadow: `0 0 12px ${item.color}20`
                        }}
                      >
                        <Icon size={22} color={item.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[15px] text-white tracking-wide truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className="text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0"
                              style={{
                                color: item.color,
                                backgroundColor: `${item.color}10`,
                                borderColor: `${item.color}30`
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#888888] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#888888] group-hover:text-white transition-colors shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* Supabase status footer */}
            <div className="mt-5 p-3 rounded-[14px] bg-[#161616] border border-[#222222] flex items-center justify-between text-xs text-[#888888]">
              <div className="flex items-center gap-2">
                <Database size={15} color={store.config.supabaseUrl ? '#00FF88' : '#888888'} />
                <span>
                  {store.config.supabaseUrl ? 'Supabase Sincronizado' : 'Modo Local Ativo'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#00FF88] font-bold">
                <ShieldCheck size={14} />
                <span>25 Tabelas Prontas</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
