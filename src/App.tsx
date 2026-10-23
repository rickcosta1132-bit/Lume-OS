/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { MenuDrawer } from './components/layout/MenuDrawer';
import { InicioModule } from './components/modules/InicioModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { CasaModule } from './components/modules/CasaModule';
import { CorpoModule } from './components/modules/CorpoModule';
import { TempoModule } from './components/modules/TempoModule';
import { GaragemModule } from './components/modules/GaragemModule';
import { DocsModule } from './components/modules/DocsModule';
import { MenteModule } from './components/modules/MenteModule';
import { ConfigModule } from './components/modules/ConfigModule';

import { motion, AnimatePresence } from 'motion/react';

const MainShell: React.FC = () => {
  const { activeModule } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'inicio':
        return <InicioModule />;
      case 'finance':
        return <FinanceModule />;
      case 'casa':
        return <CasaModule />;
      case 'corpo':
        return <CorpoModule />;
      case 'tempo':
        return <TempoModule />;
      case 'garagem':
        return <GaragemModule />;
      case 'docs':
        return <DocsModule />;
      case 'mente':
        return <MenteModule />;
      case 'config':
        return <ConfigModule />;
      default:
        return <InicioModule />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col relative shadow-2xl border-x border-[#1a1a1a]">
      {/* Native App Top Header */}
      <Header />

      {/* Main Content Area with Smooth Module Switching Animation */}
      <main className="flex-1 px-4 pt-3 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
          >
            {renderActiveModule()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5-Item Fixed Bottom Navigation Bar */}
      <BottomNav onOpenMenu={() => setIsMenuOpen(true)} isMenuOpen={isMenuOpen} />

      {/* Slide-up Menu Drawer for other modules */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#050505] flex justify-center items-start">
        <MainShell />
      </div>
    </AppProvider>
  );
}
