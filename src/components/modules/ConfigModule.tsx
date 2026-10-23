/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Copy,
  Check,
  Download,
  Phone,
  Droplets,
  Flame,
  DollarSign,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { soundFx } from '../../lib/sound';

export const ConfigModule: React.FC = () => {
  const { store, updateConfig, testAndSaveSupabase } = useApp();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Local Form state
  const [userName, setUserName] = useState(store.config.userName);
  const [hourlyRate, setHourlyRate] = useState(String(store.config.hourlyRate));
  const [waterGoal, setWaterGoal] = useState(String(store.config.dailyWaterGoal));
  const [workoutGoal, setWorkoutGoal] = useState(String(store.config.weeklyWorkoutGoal));
  const [whatsapp, setWhatsapp] = useState(store.config.whatsappNumber);

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(store.config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(store.config.supabaseAnonKey || '');
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      userName,
      hourlyRate: parseFloat(hourlyRate) || 65,
      dailyWaterGoal: parseInt(waterGoal, 10) || 3000,
      weeklyWorkoutGoal: parseInt(workoutGoal, 10) || 5,
      whatsappNumber: whatsapp
    });
    soundFx.success();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestarSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseStatus('Por favor preencha a URL e a Anon Key do Supabase.');
      return;
    }
    setIsTestingSupabase(true);
    setSupabaseStatus(null);

    const res = await testAndSaveSupabase(supabaseUrl.trim(), supabaseKey.trim());
    setIsTestingSupabase(false);
    setSupabaseStatus(res.message);
  };

  const handleCopiarSQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    soundFx.beep(750, 0.1);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div className="space-y-5 pb-32">
      {/* HEADER CONFIG */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-black tracking-widest text-white uppercase">
              CONFIGURAÇÕES DO SISTEMA
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">LUME OS v1.0</span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Parâmetros Pessoais & Banco de Dados
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Personalize as taxas por hora, metas corporais e conecte seu projeto Supabase com 25 tabelas.
        </p>
      </div>

      {/* PWA INSTALL BANNER */}
      {!isInstalled && (
        <div className="p-4 rounded-[16px] bg-[#111111] border border-[#00FF88]/40 glow-finance flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88]">
              <Download size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Instalar App no Celular</h4>
              <p className="text-xs text-[#888888]">
                {isIOS
                  ? 'Toque em Compartilhar e "Adicionar à Tela de Início"'
                  : 'Experiência nativa em tela cheia e offline'}
              </p>
            </div>
          </div>

          {isInstallable && (
            <button
              onClick={install}
              className="px-4 py-2 rounded-[10px] bg-[#00FF88] text-black font-extrabold text-xs shrink-0 cursor-pointer active:scale-95 glow-finance"
            >
              Instalar
            </button>
          )}
        </div>
      )}

      {/* FORM CONFIGURAÇÕES PESSOAIS */}
      <form onSubmit={handleSalvarConfig} className="space-y-4">
        <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] space-y-3">
          <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase mb-1">
            PARÂMETROS DE VIDA & METAS
          </h3>

          <div>
            <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                Valor da Hora (R$)
              </label>
              <input
                type="number"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#A855F7] focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                Meta Água Diária (ml)
              </label>
              <input
                type="number"
                required
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                Meta Treinos / Semana
              </label>
              <input
                type="number"
                required
                value={workoutGoal}
                onChange={(e) => setWorkoutGoal(e.target.value)}
                className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                WhatsApp de Alerta
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#25D366] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[52px] rounded-[12px] bg-white text-black font-bold text-[16px] glow-mente active:scale-[0.98] transition-all cursor-pointer"
          >
            {saveSuccess ? '✓ Configurações Salvas!' : 'Salvar Preferências'}
          </button>
        </div>
      </form>

      {/* CONEXÃO BANCO SUPABASE (CRIAR TODAS AS 25 TABELAS) */}
      <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#00FF88]" />
            <h3 className="text-xs font-black tracking-widest text-[#00FF88] uppercase">
              BANCO SUPABASE (25 TABELAS)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888888]">
            PostgreSQL Real
          </span>
        </div>

        <p className="text-xs text-[#888888]">
          Cole a URL e Anon Key do seu projeto Supabase. Os dados salvos localmente sincronizam automaticamente na nuvem.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs font-mono focus:border-[#00FF88] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
              Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs font-mono focus:border-[#00FF88] focus:outline-none"
            />
          </div>

          {supabaseStatus && (
            <div className="p-3 rounded-[10px] bg-[#1A1A1A] border border-[#222222] text-xs text-white">
              {supabaseStatus}
            </div>
          )}

          <button
            type="button"
            onClick={handleTestarSupabase}
            disabled={isTestingSupabase}
            className="w-full h-[52px] rounded-[12px] bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-bold text-[16px] glow-finance flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldCheck size={18} />
            <span>{isTestingSupabase ? 'Conectando...' : 'Testar e Salvar Conexão Supabase'}</span>
          </button>
        </div>

        {/* 1-Click Copiar Script SQL Completo */}
        <div className="pt-3 border-t border-[#222222]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-white">Script SQL das 25 Tabelas</h4>
              <p className="text-[11px] text-[#888888]">
                Copie e cole no SQL Editor do painel Supabase para criar as 25 tabelas em 1 segundo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopiarSQL}
            className="w-full h-11 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {sqlCopied ? <Check size={14} className="text-[#00FF88]" /> : <Copy size={14} />}
            <span>{sqlCopied ? 'Script SQL Copiado para a Área de Transferência!' : 'Copiar Script SQL das 25 Tabelas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
