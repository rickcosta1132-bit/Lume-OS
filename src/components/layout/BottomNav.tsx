/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Wallet, Home as HouseIcon, Flame, Grid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModuleType } from '../../types/database';

interface BottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu, isMenuOpen }) => {
  const { activeModule, setActiveModule } = useApp();

  const navItems: Array<{
    id: ModuleType | 'menu';
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number; color?: string }>;
    color: string;
  }> = [
    { id: 'inicio', label: 'Início', icon: Home, color: '#FFFFFF' },
    { id: 'finance', label: 'Finance', icon: Wallet, color: '#00FF88' },
    { id: 'casa', label: 'Casa', icon: HouseIcon, color: '#FF8A26' },
    { id: 'corpo', label: 'Corpo', icon: Flame, color: '#FF3B30' },
    { id: 'menu', label: 'Menu', icon: Grid, color: '#A855F7' },
  ];

  const handleSelect = (id: ModuleType | 'menu') => {
    if (id === 'menu') {
      onOpenMenu();
    } else {
      setActiveModule(id);
    }
  };

  const isItemActive = (id: ModuleType | 'menu') => {
    if (id === 'menu') {
      return isMenuOpen || ['tempo', 'garagem', 'docs', 'mente', 'config'].includes(activeModule);
    }
    return activeModule === id && !isMenuOpen;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#000000]/95 backdrop-blur-xl border-t border-[#222222] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isItemActive(item.id);
          const Icon = item.icon;
          const activeColor = item.id === 'menu' && ['tempo', 'garagem', 'docs', 'mente', 'config'].includes(activeModule)
            ? (activeModule === 'tempo' ? '#A855F7' : activeModule === 'garagem' ? '#FFCC00' : activeModule === 'docs' ? '#38BDF8' : '#E5E5E5')
            : item.color;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="flex-1 flex flex-col items-center justify-center h-full relative transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div
                className="transition-transform duration-200"
                style={{
                  transform: active ? 'translateY(-2px)' : 'none',
                  filter: active ? `drop-shadow(0 0 10px ${activeColor}80)` : 'none'
                }}
              >
                <Icon
                  size={22}
                  color={active ? activeColor : '#888888'}
                  className={active ? 'stroke-[2.5]' : 'stroke-[1.8]'}
                />
              </div>

              <span
                className="text-[11px] font-bold mt-1 tracking-tight transition-colors"
                style={{ color: active ? activeColor : '#888888' }}
              >
                {item.label}
              </span>

              {/* Bolinha embaixo quando ativo */}
              {active && (
                <div
                  className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 animate-pulse"
                  style={{
                    backgroundColor: activeColor,
                    boxShadow: `0 0 8px ${activeColor}`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
