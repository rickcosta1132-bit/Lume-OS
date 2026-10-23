/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Droplets,
  Plus,
  Play,
  Fuel,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  FileText,
  DollarSign,
  ArrowUpRight,
  Layers,
  Sparkles,
  Wallet,
  Home as HouseIcon,
  Car,
  Brain,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModuleType } from '../../types/database';
import { soundFx } from '../../lib/sound';

export const InicioModule: React.FC = () => {
  const {
    patrimonioTotal,
    totalGuardado,
    totalInvestimentos,
    totalDividas,
    possoGastarHoje,
    store,
    setActiveModule,
    addWaterQuick,
    addIdeiaQuick,
    startFocusTimer,
    toggleRemedio,
    renovarManutencao
  } = useApp();

  const [inicioTab, setInicioTab] = useState<'visao_geral' | 'hub_modulos'>('visao_geral');
  const [showValues, setShowValues] = useState(true);
  const [ideiaModalOpen, setIdeiaModalOpen] = useState(false);
  const [ideiaText, setIdeiaText] = useState('');

  // 1. Contas que vencem hoje
  const todayStr = new Date().toISOString().split('T')[0];
  const contasHoje = store.casa_contas.filter(
    (c) => c.status !== 'pago' && c.vencimento <= todayStr
  );
  const valorContasHoje = contasHoje.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  // 2. Docs vencendo (próximos 45 dias)
  const docsVencendo = store.docs_cofre.filter((d) => {
    if (!d.vencimento) return false;
    const diffDays = Math.ceil(
      (new Date(d.vencimento).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    return diffDays >= 0 && diffDays <= 45;
  });

  // 3. Score Corpo semanal (0-100%)
  const aguaHoje = store.corpo_agua
    .filter((a) => a.data === todayStr)
    .reduce((acc, a) => acc + a.quantidade_ml, 0);
  const waterScore = Math.min(1, aguaHoje / store.config.dailyWaterGoal) * 30;

  const totalRemedios = store.corpo_remedios.length;
  const remediosTomados = store.corpo_remedios.filter((r) => r.tomado_hoje).length;
  const remediosScore = totalRemedios > 0 ? (remediosTomados / totalRemedios) * 30 : 30;

  const treinosRealizados = store.corpo_log_treino.length;
  const treinoScore = Math.min(1, treinosRealizados / store.config.weeklyWorkoutGoal) * 40;
  const scoreCorpo = Math.round(waterScore + remediosScore + treinoScore);

  // 4. Foco hoje (horas totais)
  const segundosFocoHoje = store.tempo_logs
    .filter((l) => l.data === todayStr)
    .reduce((acc, l) => acc + l.duracao_segundos, 0);
  const horasFocoHoje = (segundosFocoHoje / 3600).toFixed(1);

  // Lista Alertas do dia
  const alertas: Array<{
    id: string;
    titulo: string;
    subtitulo: string;
    tipo: 'casa' | 'corpo' | 'finance' | 'garagem';
    cor: string;
    acaoTexto: string;
    onAcao: () => void;
  }> = [];

  // Alerta 1: Despensa vencendo
  const despensaVencendo = store.casa_despensa.filter((d) => d.validade <= todayStr && d.quantidade > 0);
  if (despensaVencendo.length > 0) {
    alertas.push({
      id: 'alt-despensa',
      titulo: `${despensaVencendo[0].item} vence hoje!`,
      subtitulo: `${despensaVencendo[0].quantidade} ${despensaVencendo[0].unidade} na ${despensaVencendo[0].local}`,
      tipo: 'casa',
      cor: '#FF3B30',
      acaoTexto: 'Ver Despensa',
      onAcao: () => setActiveModule('casa')
    });
  }

  // Alerta 2: Remédio pendente
  const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const remedioAtrasado = store.corpo_remedios.find((r) => !r.tomado_hoje && r.horario <= nowTime);
  if (remedioAtrasado) {
    alertas.push({
      id: 'alt-rem-' + remedioAtrasado.id,
      titulo: `Remédio pendente: ${remedioAtrasado.nome}`,
      subtitulo: `Horário: ${remedioAtrasado.horario} • ${remedioAtrasado.dose}`,
      tipo: 'corpo',
      cor: '#FF3B30',
      acaoTexto: 'Marcar Tomado',
      onAcao: () => toggleRemedio(remedioAtrasado.id)
    });
  }

  // Alerta 3: Manutenção Casa (ex: Gás vence em 3 dias)
  store.casa_manutencao.forEach((m) => {
    const diffDays = Math.ceil(
      (new Date(m.proxima_troca).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays <= 3 && diffDays >= -10) {
      alertas.push({
        id: 'alt-manut-' + m.id,
        titulo: `${m.nome} ${diffDays <= 0 ? 'venceu!' : `vence em ${diffDays} dias`}`,
        subtitulo: `Última troca: ${m.ultima_troca} (Ciclo ${m.intervalo_dias}d)`,
        tipo: 'casa',
        cor: '#FF8A26',
        acaoTexto: 'Renovar',
        onAcao: () => renovarManutencao(m.id)
      });
    }
  });

  // Alerta 4: Conta vencendo hoje
  if (contasHoje.length > 0) {
    alertas.push({
      id: 'alt-conta-hoje',
      titulo: `${contasHoje.length} conta(s) vencem hoje!`,
      subtitulo: `Total: R$ ${valorContasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      tipo: 'finance',
      cor: '#FF8A26',
      acaoTexto: 'Ver Contas',
      onAcao: () => setActiveModule('casa')
    });
  }

  // 7 Módulos para o Hub Deluxe
  const todosModulosInfo: Array<{
    id: ModuleType;
    nome: string;
    subtitulo: string;
    cor: string;
    icon: React.ComponentType<{ className?: string; size?: number; color?: string }>;
    metricHighlight: string;
    metricLabel: string;
    badgeStatus: string;
  }> = [
    {
      id: 'finance',
      nome: 'LUME FINANCE',
      subtitulo: 'Patrimônio, Metas & Dívidas',
      cor: '#00FF88',
      icon: Wallet,
      metricHighlight: showValues ? `R$ ${(patrimonioTotal / 1000).toFixed(1)}k` : 'R$ •••',
      metricLabel: 'Patrimônio Líquido',
      badgeStatus: `Gastar hoje: R$ ${possoGastarHoje.valorPorDia.toFixed(0)}/dia`
    },
    {
      id: 'casa',
      nome: 'LUME CASA',
      subtitulo: 'Contas, Despensa & Manutenção',
      cor: '#FF8A26',
      icon: HouseIcon,
      metricHighlight: `${contasHoje.length} hoje`,
      metricLabel: 'Contas Pendentes',
      badgeStatus: `${store.casa_despensa.length} itens despensa`
    },
    {
      id: 'corpo',
      nome: 'LUME CORPO',
      subtitulo: 'Treino, Nutrição & Saúde',
      cor: '#FF3B30',
      icon: Flame,
      metricHighlight: `${scoreCorpo}%`,
      metricLabel: 'Score Semanal',
      badgeStatus: `${aguaHoje}/${store.config.dailyWaterGoal} ml água`
    },
    {
      id: 'tempo',
      nome: 'LUME TEMPO',
      subtitulo: 'Foco, Pomodoro & Ganhos R$',
      cor: '#A855F7',
      icon: Clock,
      metricHighlight: `${horasFocoHoje}h`,
      metricLabel: 'Foco Hoje',
      badgeStatus: Number(horasFocoHoje) > 0 ? `+R$ ${(Number(horasFocoHoje) * store.config.hourlyRate).toFixed(0)}` : 'Cronômetro pronto'
    },
    {
      id: 'garagem',
      nome: 'LUME GARAGEM',
      subtitulo: 'Abastecimento, Km/l & Revisão',
      cor: '#FFCC00',
      icon: Car,
      metricHighlight: `${(store.garagem_abastecimento[0]?.km_atual || 50400).toLocaleString('pt-BR')} km`,
      metricLabel: 'Quilometragem',
      badgeStatus: `${store.garagem_abastecimento[0]?.km_por_litro || 13} km/l rendimento`
    },
    {
      id: 'docs',
      nome: 'LUME DOCS',
      subtitulo: 'Cofre & Marca d\'Água',
      cor: '#38BDF8',
      icon: FileText,
      metricHighlight: `${store.docs_cofre.length} docs`,
      metricLabel: 'Cofre Protegido',
      badgeStatus: docsVencendo.length > 0 ? `${docsVencendo.length} a renovar` : '100% em dia'
    },
    {
      id: 'mente',
      nome: 'LUME MENTE',
      subtitulo: 'Feed, Voz & Ações Finance',
      cor: '#E5E5E5',
      icon: Brain,
      metricHighlight: `${store.mente_notas.length} notas`,
      metricLabel: 'Memória Ativa',
      badgeStatus: 'Feed estilo WhatsApp'
    }
  ];

  const handleIdeiaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideiaText.trim()) return;
    addIdeiaQuick(ideiaText.trim());
    setIdeiaText('');
    setIdeiaModalOpen(false);
  };

  const handleModuleClick = (id: ModuleType) => {
    soundFx.beep(650, 0.08);
    setActiveModule(id);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* CARD GIGANTE PATRIMÔNIO TOTAL */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[24px] bg-[#111111] border border-[#222222] p-6 glow-finance transition-all"
      >
        {/* Glow neon upper edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-80" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-[11px] font-black tracking-widest text-[#00FF88] uppercase">
              PATRIMÔNIO LÍQUIDO TOTAL
            </span>
          </div>
          <button
            onClick={() => setShowValues(!showValues)}
            className="text-[#888888] hover:text-white transition-colors p-1 cursor-pointer"
          >
            {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Large Value with Modern Tight Typo */}
        <div className="my-1.5">
          <div className="text-4xl sm:text-5xl font-black text-[#00FF88] tracking-tight drop-shadow-[0_0_20px_rgba(0,255,136,0.35)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {showValues
              ? `R$ ${patrimonioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'R$ ••••••••'}
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-[#222222]/80 text-xs">
          <div>
            <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">Guardado</span>
            <span className="font-extrabold text-white text-sm">
              {showValues ? `R$ ${(totalGuardado / 1000).toFixed(1)}k` : '•••'}
            </span>
          </div>
          <div>
            <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">Investido</span>
            <span className="font-extrabold text-white text-sm">
              {showValues ? `R$ ${(totalInvestimentos / 1000).toFixed(1)}k` : '•••'}
            </span>
          </div>
          <div>
            <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">Dívidas</span>
            <span className="font-extrabold text-[#FF3B30] text-sm">
              {showValues ? `- R$ ${(totalDividas / 1000).toFixed(1)}k` : '•••'}
            </span>
          </div>
        </div>

        {/* Quick action button to finance */}
        <button
          onClick={() => handleModuleClick('finance')}
          className="mt-4 w-full h-[52px] rounded-[12px] bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-extrabold text-[16px] flex items-center justify-center gap-2 glow-finance transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Gerenciar Lume Finance</span>
          <ArrowUpRight size={18} className="stroke-[3]" />
        </button>
      </motion.div>

      {/* ELEGANTE SELETOR DE MODO DO INÍCIO */}
      <div className="flex items-center justify-between p-1 bg-[#161616] rounded-[14px] border border-[#222222]">
        <button
          onClick={() => {
            soundFx.beep(700, 0.05);
            setInicioTab('visao_geral');
          }}
          className={`flex-1 py-2 text-xs font-black rounded-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            inicioTab === 'visao_geral'
              ? 'bg-white text-black shadow-md'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <Activity size={14} />
          <span>Visão Geral OS</span>
        </button>
        <button
          onClick={() => {
            soundFx.beep(850, 0.05);
            setInicioTab('hub_modulos');
          }}
          className={`flex-1 py-2 text-xs font-black rounded-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            inicioTab === 'hub_modulos'
              ? 'bg-gradient-to-r from-[#00FF88] via-[#38BDF8] to-[#A855F7] text-black font-extrabold shadow-md'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <Sparkles size={14} className="stroke-[2.5]" />
          <span>Hub dos 7 Módulos</span>
        </button>
      </div>

      {/* ANIMAÇÃO DE TROCA ENTRE VISÃO GERAL E HUB */}
      <AnimatePresence mode="wait">
        {inicioTab === 'visao_geral' ? (
          <motion.div
            key="visao_geral"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* GRID 2x2 OS METRICS */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Contas vencem hoje (Laranja) */}
              <button
                onClick={() => handleModuleClick('casa')}
                className="bg-[#111111] border border-[#222222] p-4 rounded-[18px] text-left hover:border-[#FF8A26]/60 transition-all active:scale-95 cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF8A26]">
                    CONTAS HOJE
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FF8A26]/10 flex items-center justify-center border border-[#FF8A26]/20">
                    <Calendar size={15} className="text-[#FF8A26]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {contasHoje.length} <span className="text-xs font-semibold text-[#888888]">contas</span>
                </div>
                <p className="text-xs font-extrabold text-[#FF8A26] mt-0.5">
                  R$ {valorContasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </button>

              {/* 2. Docs vencem (Azul) */}
              <button
                onClick={() => handleModuleClick('docs')}
                className="bg-[#111111] border border-[#222222] p-4 rounded-[18px] text-left hover:border-[#38BDF8]/60 transition-all active:scale-95 cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#38BDF8]">
                    DOCS VENCENDO
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#38BDF8]/10 flex items-center justify-center border border-[#38BDF8]/20">
                    <FileText size={15} className="text-[#38BDF8]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {docsVencendo.length} <span className="text-xs font-semibold text-[#888888]">docs</span>
                </div>
                <p className="text-xs font-extrabold text-[#38BDF8] mt-0.5">
                  {docsVencendo.length > 0 ? 'Atenção renovação' : 'Tudo em dia'}
                </p>
              </button>

              {/* 3. Score Corpo semanal (Vermelho) 0-100% */}
              <button
                onClick={() => handleModuleClick('corpo')}
                className="bg-[#111111] border border-[#222222] p-4 rounded-[18px] text-left hover:border-[#FF3B30]/60 transition-all active:scale-95 cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF3B30]">
                    SCORE CORPO
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center border border-[#FF3B30]/20">
                    <Flame size={15} className="text-[#FF3B30]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {scoreCorpo}%
                </div>
                <div className="w-full bg-[#222222] h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-[#FF3B30] h-full rounded-full transition-all duration-500"
                    style={{ width: `${scoreCorpo}%`, boxShadow: '0 0 8px #FF3B30' }}
                  />
                </div>
              </button>

              {/* 4. Foco hoje (Roxo) */}
              <button
                onClick={() => handleModuleClick('tempo')}
                className="bg-[#111111] border border-[#222222] p-4 rounded-[18px] text-left hover:border-[#A855F7]/60 transition-all active:scale-95 cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A855F7]">
                    FOCO HOJE
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/20">
                    <Clock size={15} className="text-[#A855F7]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {horasFocoHoje} <span className="text-xs font-semibold text-[#888888]">horas</span>
                </div>
                <p className="text-xs font-extrabold text-[#A855F7] mt-0.5">
                  {Number(horasFocoHoje) > 0
                    ? `R$ ${(Number(horasFocoHoje) * store.config.hourlyRate).toFixed(0)} gerados`
                    : 'Iniciar cronômetro'}
                </p>
              </button>
            </div>

            {/* LISTA ALERTAS DO DIA */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-black tracking-widest text-[#888888] uppercase flex items-center gap-2">
                  <AlertTriangle size={13} className="text-[#FF8A26]" />
                  <span>ALERTAS DO DIA ({alertas.length})</span>
                </h2>
                <span className="text-[10px] text-[#888888]">Ações Rápidas</span>
              </div>

              {alertas.length === 0 ? (
                <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] text-center text-xs text-[#888888] flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00FF88]" />
                  <span>Tudo limpo! Nenhum alerta crítico para hoje.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertas.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] flex items-center justify-between gap-3 hover:border-[#333333] transition-all"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: alt.cor
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-white truncate">{alt.titulo}</h4>
                        <p className="text-xs text-[#888888] truncate mt-0.5">{alt.subtitulo}</p>
                      </div>
                      <button
                        onClick={alt.onAcao}
                        className="px-3 py-1.5 rounded-[10px] text-xs font-black text-black shrink-0 transition-transform active:scale-95 cursor-pointer"
                        style={{ backgroundColor: alt.cor }}
                      >
                        {alt.acaoTexto}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTÕES RÁPIDOS FLUTUANTES / QUICK ACTION STRIP */}
            <div>
              <div className="mb-2.5 px-1">
                <h2 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                  AÇÕES RÁPIDAS DE 1 TOQUE
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* +250ml Água (Vermelho #FF3B30) */}
                <button
                  onClick={() => addWaterQuick(250)}
                  className="h-[52px] rounded-[12px] bg-[#111111] border border-[#FF3B30]/40 hover:border-[#FF3B30] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 glow-corpo active:scale-95 transition-all cursor-pointer"
                >
                  <Droplets size={18} className="text-[#FF3B30]" />
                  <span className="text-[#FF3B30]">+250ml Água</span>
                </button>

                {/* +Ideia (Branco #E5E5E5) */}
                <button
                  onClick={() => setIdeiaModalOpen(true)}
                  className="h-[52px] rounded-[12px] bg-[#111111] border border-[#E5E5E5]/40 hover:border-white text-white font-extrabold text-[15px] flex items-center justify-center gap-2 glow-mente active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={18} className="text-[#E5E5E5]" />
                  <span className="text-[#E5E5E5]">+Ideia Rápida</span>
                </button>

                {/* Iniciar Foco (Roxo #A855F7) */}
                <button
                  onClick={() => {
                    startFocusTimer('Trabalho');
                    setActiveModule('tempo');
                  }}
                  className="h-[52px] rounded-[12px] bg-[#111111] border border-[#A855F7]/40 hover:border-[#A855F7] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 glow-tempo active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={17} className="text-[#A855F7] fill-[#A855F7]" />
                  <span className="text-[#A855F7]">Iniciar Foco</span>
                </button>

                {/* Abastecer (Amarelo #FFCC00) */}
                <button
                  onClick={() => handleModuleClick('garagem')}
                  className="h-[52px] rounded-[12px] bg-[#111111] border border-[#FFCC00]/40 hover:border-[#FFCC00] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 glow-garagem active:scale-95 transition-all cursor-pointer"
                >
                  <Fuel size={18} className="text-[#FFCC00]" />
                  <span className="text-[#FFCC00]">Abastecer</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* HUB DE TODOS OS 7 MÓDULOS (BENTO LUXO) */
          <motion.div
            key="hub_modulos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-black tracking-widest text-[#888888] uppercase">
                ECOSSISTEMA COMPLETO (7 MÓDULOS)
              </span>
              <span className="text-[10px] text-[#00FF88] font-bold">100% Sincronizado</span>
            </div>

            {todosModulosInfo.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleModuleClick(mod.id)}
                  className="w-full p-4 rounded-[20px] bg-[#111111] border border-[#222222] hover:border-[#333333] transition-all flex items-center justify-between text-left active:scale-[0.98] group cursor-pointer shadow-lg relative overflow-hidden"
                  style={{
                    borderColor: `${mod.cor}25`
                  }}
                >
                  {/* Subtle module ambient light */}
                  <div
                    className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
                    style={{ backgroundColor: mod.cor }}
                  />

                  <div className="flex items-center gap-3.5 relative z-10">
                    <div
                      className="w-13 h-13 rounded-[14px] flex items-center justify-center border transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${mod.cor}15`,
                        borderColor: `${mod.cor}45`,
                        boxShadow: `0 0 16px ${mod.cor}20`
                      }}
                    >
                      <Icon size={24} color={mod.cor} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white tracking-tight">
                          {mod.nome}
                        </span>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: mod.cor, boxShadow: `0 0 6px ${mod.cor}` }}
                        />
                      </div>
                      <p className="text-xs text-[#888888] line-clamp-1 mt-0.5">
                        {mod.subtitulo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            color: mod.cor,
                            backgroundColor: `${mod.cor}10`,
                            borderColor: `${mod.cor}30`
                          }}
                        >
                          {mod.badgeStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 relative z-10">
                    <span className="text-base font-black text-white block" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {mod.metricHighlight}
                    </span>
                    <span className="text-[10px] text-[#888888] font-semibold block">
                      {mod.metricLabel}
                    </span>
                    <div className="mt-1 flex justify-end">
                      <ChevronRight size={16} className="text-[#888888] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL QUICK IDEIA */}
      {ideiaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">+ Ideia / Nota Rápida</h3>
            <p className="text-xs text-[#888888] mb-4">
              Digite qualquer pensamento. Se contiver termos como "pagar", o Lume OS sugerirá transformar em conta no Finance.
            </p>
            <form onSubmit={handleIdeiaSubmit} className="space-y-4">
              <textarea
                value={ideiaText}
                onChange={(e) => setIdeiaText(e.target.value)}
                placeholder="Ex: Comprar suplemento ou Pagar fatura R$ 250..."
                className="w-full h-24 p-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-sm focus:border-white focus:outline-none resize-none font-medium"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIdeiaModalOpen(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-white text-black font-extrabold text-[15px] glow-mente"
                >
                  Salvar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
