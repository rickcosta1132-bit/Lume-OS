/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Dumbbell,
  Apple,
  HeartPulse,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Droplets,
  RotateCcw,
  Sparkles,
  Camera,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Zap,
  Moon,
  Scale,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundFx } from '../../lib/sound';
import { CorpoBibliotecaTreino, CorpoBibliotecaExercicio } from '../../types/database';

export const CorpoModule: React.FC = () => {
  const {
    store,
    addWaterQuick,
    toggleRemedio,
    addRemedio,
    addRefeicao,
    addSono,
    addPeso,
    addMedidas,
    saveWorkoutLog
  } = useApp();

  const [activeTab, setActiveTab] = useState<'treino' | 'nutri' | 'saude'>('treino');
  const [subTabTreino, setSubTabTreino] = useState<'biblioteca' | 'meus' | 'evolucao'>('biblioteca');

  // Treinando Focus Screen State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkoutData, setActiveWorkoutData] = useState<{
    nome: string;
    exercicios: CorpoBibliotecaExercicio[];
    currentExIndex: number;
    currentSerie: number;
    totalSeries: number;
    cargaFeita: string;
    repsFeitas: string;
    logExercicios: Array<{
      nome: string;
      series: Array<{ reps: number; carga_kg: number; check: boolean }>;
    }>;
  } | null>(null);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // Nutri Form
  const [modalRefeicao, setModalRefeicao] = useState(false);
  const [refNome, setRefNome] = useState('');
  const [refTags, setRefTags] = useState<string[]>(['#proteina']);
  const [refCals, setRefCals] = useState('');

  // Saúde Forms
  const [modalRemedio, setModalRemedio] = useState(false);
  const [remNome, setRemNome] = useState('');
  const [remHora, setRemHora] = useState('08:00');
  const [remDose, setRemDose] = useState('1 cápsula');

  const [modalSono, setModalSono] = useState(false);
  const [sonoDormiu, setSonoDormiu] = useState('23:00');
  const [sonoAcordou, setSonoAcordou] = useState('07:00');
  const [sonoQualidade, setSonoQualidade] = useState<'excelente' | 'boa' | 'regular' | 'ruim'>('boa');

  const [modalPeso, setModalPeso] = useState(false);
  const [pesoInput, setPesoInput] = useState('');

  const [humorSelecionado, setHumorSelecionado] = useState<string>('⚡');

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Water calculation
  const aguaHoje = store.corpo_agua
    .filter((a) => a.data === todayStr)
    .reduce((acc, a) => acc + a.quantidade_ml, 0);
  const metaAgua = store.config.dailyWaterGoal || 3000;
  const aguaPct = Math.min(100, Math.round((aguaHoje / metaAgua) * 100));

  // Rest timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            soundFx.beep(700, 0.08); // countdown beep
          } else if (prev === 1) {
            soundFx.finishChime(); // rest over!
            setIsResting(false);
          }
          return Math.max(0, prev - 1);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restSeconds]);

  // Start Workout function
  const iniciarTreino = (treino: CorpoBibliotecaTreino) => {
    const exs = treino.exercicios_ids
      .map((id) => store.corpo_biblioteca_exercicios.find((e) => e.id === id))
      .filter(Boolean) as CorpoBibliotecaExercicio[];

    if (exs.length === 0) return;

    soundFx.beep(880, 0.15);
    setActiveWorkoutData({
      nome: treino.nome,
      exercicios: exs,
      currentExIndex: 0,
      currentSerie: 1,
      totalSeries: exs[0].series_sugeridas || 4,
      cargaFeita: String(exs[0].carga_padrao_kg || 20),
      repsFeitas: '10',
      logExercicios: exs.map((e) => ({
        nome: e.nome,
        series: []
      }))
    });
    setIsWorkoutActive(true);
    setRestSeconds(0);
    setIsResting(false);
  };

  // Complete current set & trigger 60s rest
  const handleCheckSerie = () => {
    if (!activeWorkoutData) return;
    soundFx.beep(800, 0.1);

    const cargaNum = parseFloat(activeWorkoutData.cargaFeita) || 0;
    const repsNum = parseInt(activeWorkoutData.repsFeitas, 10) || 10;

    const updatedLog = [...activeWorkoutData.logExercicios];
    updatedLog[activeWorkoutData.currentExIndex].series.push({
      reps: repsNum,
      carga_kg: cargaNum,
      check: true
    });

    // Start 60s rest timer
    setRestSeconds(60);
    setIsResting(true);

    if (activeWorkoutData.currentSerie < activeWorkoutData.totalSeries) {
      setActiveWorkoutData({
        ...activeWorkoutData,
        currentSerie: activeWorkoutData.currentSerie + 1,
        logExercicios: updatedLog
      });
    } else {
      // Done with this exercise, prompt next or finish
      handleProximoExercicio(updatedLog);
    }
  };

  const handleProximoExercicio = (logs = activeWorkoutData?.logExercicios) => {
    if (!activeWorkoutData || !logs) return;
    const nextIdx = activeWorkoutData.currentExIndex + 1;

    if (nextIdx < activeWorkoutData.exercicios.length) {
      const nextEx = activeWorkoutData.exercicios[nextIdx];
      setActiveWorkoutData({
        ...activeWorkoutData,
        currentExIndex: nextIdx,
        currentSerie: 1,
        totalSeries: nextEx.series_sugeridas || 4,
        cargaFeita: String(nextEx.carga_padrao_kg || 20),
        repsFeitas: '10',
        logExercicios: logs
      });
    } else {
      // Finalizar treino!
      finalizarTreino(logs);
    }
  };

  const finalizarTreino = (logs = activeWorkoutData?.logExercicios) => {
    if (!activeWorkoutData || !logs) return;
    saveWorkoutLog({
      treino_nome: activeWorkoutData.nome,
      data: todayStr,
      duracao_minutos: 45,
      exercicios_realizados: logs
    });
    setIsWorkoutActive(false);
    setActiveWorkoutData(null);
    setIsResting(false);
  };

  const handleSalvarRefeicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNome) return;
    addRefeicao({
      data: todayStr,
      hora: nowTime,
      nome: refNome,
      tags: refTags,
      calorias_estimadas: refCals ? parseInt(refCals, 10) : undefined
    });
    setRefNome('');
    setRefCals('');
    setModalRefeicao(false);
  };

  const handleSalvarRemedio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remNome) return;
    addRemedio({
      nome: remNome,
      horario: remHora,
      dose: remDose,
      tomado_hoje: false
    });
    setRemNome('');
    setModalRemedio(false);
  };

  const handleSalvarSono = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate hours slept
    const [h1, m1] = sonoDormiu.split(':').map(Number);
    const [h2, m2] = sonoAcordou.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    const horas = Number((diff / 60).toFixed(1));

    addSono({
      data: todayStr,
      dormiu_as: sonoDormiu,
      acordou_as: sonoAcordou,
      horas_dormidas: horas,
      qualidade: sonoQualidade
    });
    setModalSono(false);
  };

  const handleSalvarPeso = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(pesoInput.replace(',', '.'));
    if (!p || isNaN(p)) return;
    addPeso(p);
    setPesoInput('');
    setModalPeso(false);
  };

  // TELA FOCO TREINANDO
  if (isWorkoutActive && activeWorkoutData) {
    const currentEx = activeWorkoutData.exercicios[activeWorkoutData.currentExIndex];

    return (
      <div className="fixed inset-0 z-50 bg-[#000000] p-4 flex flex-col justify-between overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#FF3B30] uppercase">
              MODO FOCO • TREINANDO
            </span>
            <h2 className="text-base font-extrabold text-white">{activeWorkoutData.nome}</h2>
          </div>
          <button
            onClick={() => {
              if (confirm('Deseja realmente sair do treino em andamento?')) {
                setIsWorkoutActive(false);
              }
            }}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Exercício Atual Grande */}
        <div className="my-auto py-6 text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FF3B30]/20 border border-[#FF3B30]/40 text-[#FF3B30] text-xs font-bold uppercase tracking-wider">
            Exercício {activeWorkoutData.currentExIndex + 1} de {activeWorkoutData.exercicios.length} • {currentEx.grupo_muscular}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {currentEx.nome}
          </h1>

          {currentEx.instrucoes && (
            <p className="text-xs text-[#888888] max-w-xs mx-auto">
              {currentEx.instrucoes}
            </p>
          )}

          {/* Série Counter */}
          <div className="text-sm font-black text-white/90">
            SÉRIE <span className="text-2xl text-[#FF3B30]">{activeWorkoutData.currentSerie}</span> / {activeWorkoutData.totalSeries}
          </div>

          {/* Inputs Carga e Reps */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-[#111111] p-3 rounded-[16px] border border-[#222222]">
              <label className="text-[10px] font-black text-[#888888] uppercase block mb-1">
                Carga (kg)
              </label>
              <input
                type="number"
                value={activeWorkoutData.cargaFeita}
                onChange={(e) =>
                  setActiveWorkoutData({ ...activeWorkoutData, cargaFeita: e.target.value })
                }
                className="w-full text-center text-2xl font-black text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-[16px] border border-[#222222]">
              <label className="text-[10px] font-black text-[#888888] uppercase block mb-1">
                Reps Feitas
              </label>
              <input
                type="number"
                value={activeWorkoutData.repsFeitas}
                onChange={(e) =>
                  setActiveWorkoutData({ ...activeWorkoutData, repsFeitas: e.target.value })
                }
                className="w-full text-center text-2xl font-black text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* TIMER DE DESCANSO 60S COM BIP */}
          {isResting && (
            <div className="p-4 rounded-[20px] bg-[#111111] border border-[#FF3B30]/50 max-w-xs mx-auto glow-corpo animate-pulse">
              <span className="text-[10px] font-black text-[#FF3B30] uppercase tracking-wider block">
                TEMPO DE DESCANSO
              </span>
              <div className="text-4xl font-black text-[#FF3B30] my-1">
                00:{restSeconds < 10 ? `0${restSeconds}` : restSeconds}
              </div>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => setRestSeconds((s) => s + 15)}
                  className="px-3 py-1 rounded-[8px] bg-[#1A1A1A] text-xs font-bold text-white border border-[#222222]"
                >
                  +15s
                </button>
                <button
                  onClick={() => {
                    setIsResting(false);
                    setRestSeconds(0);
                  }}
                  className="px-3 py-1 rounded-[8px] bg-[#FF3B30] text-xs font-bold text-black"
                >
                  Pular Descanso
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 max-w-sm mx-auto w-full pt-4">
          <button
            onClick={handleCheckSerie}
            className="w-full h-[52px] rounded-[12px] bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-bold text-[16px] flex items-center justify-center gap-2 glow-corpo active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 size={20} className="stroke-[2.5]" />
            <span>Confirmar Série {activeWorkoutData.currentSerie} & Descanso</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleProximoExercicio()}
              className="h-11 rounded-[10px] bg-[#1A1A1A] text-white border border-[#222222] text-xs font-bold flex items-center justify-center gap-1"
            >
              Próximo Exercício
            </button>
            <button
              onClick={() => finalizarTreino()}
              className="h-11 rounded-[10px] bg-[#1A1A1A] text-[#00FF88] border border-[#00FF88]/40 text-xs font-bold flex items-center justify-center gap-1"
            >
              Finalizar Treino
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      {/* HEADER VERMELHO #FF3B30 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-corpo relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#FF3B30] uppercase">
              LUME CORPO
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">Biohacking & Performance</span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Máxima Energia, Força & Longevidade
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Treinos periodizados, hidratação milimétrica, controle nutricional e biomarcadores.
        </p>

        {/* 3 Tabs Bar */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222] mt-4">
          <button
            onClick={() => setActiveTab('treino')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'treino' ? 'bg-[#FF3B30] text-white glow-corpo' : 'text-[#888888] hover:text-white'
            }`}
          >
            Treino
          </button>
          <button
            onClick={() => setActiveTab('nutri')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'nutri' ? 'bg-[#FF3B30] text-white glow-corpo' : 'text-[#888888] hover:text-white'
            }`}
          >
            Nutri & Água
          </button>
          <button
            onClick={() => setActiveTab('saude')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'saude' ? 'bg-[#FF3B30] text-white glow-corpo' : 'text-[#888888] hover:text-white'
            }`}
          >
            Saúde & Sono
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ABA 1: TREINO */}
        {activeTab === 'treino' && (
          <motion.div
            key="treino"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          {/* Sugestão Inteligente IA */}
          <div className="p-4 rounded-[16px] bg-[#161616] border border-[#FF3B30]/40 flex items-center justify-between gap-3 glow-corpo">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30]">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#FF3B30] uppercase tracking-wide">
                  SUGESTÃO LUME IA
                </h4>
                <p className="text-xs font-bold text-white mt-0.5">
                  "Faz 3 dias sem treinar perna, bora hoje? Ou HIIT de 15min?"
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const hiit = store.corpo_biblioteca_treinos.find((t) => t.id === 'tr-hiit');
                if (hiit) iniciarTreino(hiit);
              }}
              className="px-3 py-1.5 rounded-[8px] bg-[#FF3B30] text-white font-extrabold text-xs shrink-0 cursor-pointer active:scale-95"
            >
              Iniciar 15m
            </button>
          </div>

          {/* Sub-tabs: Biblioteca / Meus Treinos / Evolução */}
          <div className="flex gap-2">
            <button
              onClick={() => setSubTabTreino('biblioteca')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                subTabTreino === 'biblioteca'
                  ? 'border-[#FF3B30] bg-[#FF3B30]/20 text-white'
                  : 'border-[#222222] bg-[#111111] text-[#888888]'
              }`}
            >
              Biblioteca Pronta ({store.corpo_biblioteca_treinos.length})
            </button>
            <button
              onClick={() => setSubTabTreino('meus')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                subTabTreino === 'meus'
                  ? 'border-[#FF3B30] bg-[#FF3B30]/20 text-white'
                  : 'border-[#222222] bg-[#111111] text-[#888888]'
              }`}
            >
              Meus Treinos ({store.corpo_meus_treinos.length})
            </button>
            <button
              onClick={() => setSubTabTreino('evolucao')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                subTabTreino === 'evolucao'
                  ? 'border-[#FF3B30] bg-[#FF3B30]/20 text-white'
                  : 'border-[#222222] bg-[#111111] text-[#888888]'
              }`}
            >
              Evolução & Cargas
            </button>
          </div>

          {/* SUB-ABA: BIBLIOTECA PRONTA */}
          {subTabTreino === 'biblioteca' && (
            <div className="space-y-3">
              {store.corpo_biblioteca_treinos.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] hover:border-[#FF3B30]/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-extrabold text-white">{t.nome}</h4>
                    <span className="text-[11px] font-bold text-[#FF3B30] flex items-center gap-1">
                      <Clock size={12} /> {t.duracao_estimada_min} min
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] mb-3">{t.descricao}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                    <span className="text-[11px] text-[#888888]">
                      {t.exercicios_ids.length} exercícios estruturados
                    </span>
                    <button
                      onClick={() => iniciarTreino(t)}
                      className="h-10 px-4 rounded-[10px] bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white text-xs font-black flex items-center gap-1.5 glow-corpo active:scale-95 cursor-pointer"
                    >
                      <Play size={13} fill="currentColor" /> Iniciar Treino
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-ABA: MEUS TREINOS */}
          {subTabTreino === 'meus' && (
            <div className="space-y-3">
              {store.corpo_meus_treinos.map((mt) => (
                <div
                  key={mt.id}
                  className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{mt.nome}</h4>
                    <span className="text-xs text-[#888888]">{mt.dia_semana || 'Sem dia fixo'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const base = store.corpo_biblioteca_treinos[0];
                      if (base) iniciarTreino(base);
                    }}
                    className="h-9 px-3 rounded-[8px] bg-[#1A1A1A] border border-[#FF3B30]/40 text-[#FF3B30] text-xs font-bold flex items-center gap-1"
                  >
                    <Play size={12} fill="currentColor" /> Treinar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUB-ABA: EVOLUÇÃO & CARGAS */}
          {subTabTreino === 'evolucao' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
                <h4 className="text-xs font-bold text-white uppercase mb-2 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#FF3B30]" /> Gráfico de Carga por Exercício
                </h4>
                <div className="h-32 flex items-end gap-3 pt-4 border-b border-[#222222] pb-2">
                  {[
                    { data: '01/10', kg: 55 },
                    { data: '08/10', kg: 60 },
                    { data: '15/10', kg: 62 },
                    { data: '22/10', kg: 65 }
                  ].map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#FF3B30]">{p.kg}kg</span>
                      <div
                        className="w-full bg-[#FF3B30] rounded-t-[4px] glow-corpo transition-all"
                        style={{ height: `${(p.kg / 75) * 80}px` }}
                      />
                      <span className="text-[9px] text-[#888888]">{p.data}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#888888] mt-2">
                  Supino Reto com Barra: +10kg de progressão no último mês (+18%)
                </p>
              </div>

              {/* Medidas Corporais */}
              <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
                <h4 className="text-xs font-bold text-white uppercase mb-3">
                  Últimas Medidas Corporais
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-[10px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block">Braço</span>
                    <span className="text-sm font-black text-white">38.5 cm</span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block">Cintura</span>
                    <span className="text-sm font-black text-white">82.0 cm</span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block">Perna</span>
                    <span className="text-sm font-black text-white">58.5 cm</span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block">Peitoral</span>
                    <span className="text-sm font-black text-white">104 cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

        {/* ABA 2: NUTRI & ÁGUA */}
        {activeTab === 'nutri' && (
          <motion.div
            key="nutri"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          {/* CÍRCULO PROCESSO ÁGUA 0/3000ml */}
          <div className="p-5 rounded-[20px] bg-[#111111] border border-[#222222] text-center relative overflow-hidden">
            <span className="text-xs font-black tracking-widest text-[#FF3B30] uppercase block mb-3">
              CONTROLE DE HIDRATAÇÃO DIÁRIA
            </span>

            {/* Circular representation */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#222222"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#FF3B30"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * aguaPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <Droplets size={22} className="text-[#FF3B30] mb-0.5" />
                <span className="text-2xl font-black text-white">{aguaHoje}</span>
                <span className="text-[10px] text-[#888888]">/ {metaAgua} ml</span>
                <span className="text-[11px] font-bold text-[#FF3B30] mt-0.5">{aguaPct}%</span>
              </div>
            </div>

            {/* BOTÃO GIGANTE +250ml ÁGUA */}
            <button
              onClick={() => addWaterQuick(250)}
              className="mt-4 w-full h-[52px] rounded-[12px] bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-bold text-[16px] flex items-center justify-center gap-2 glow-corpo active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={20} className="stroke-[3]" />
              <span>+250ml de Água</span>
            </button>
          </div>

          {/* NUTRI REFEIÇÕES DO DIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                REFEIÇÕES DE HOJE ({store.corpo_refeicao.filter(r => r.data === todayStr).length})
              </h3>
              <button
                onClick={() => setModalRefeicao(true)}
                className="text-xs font-bold text-[#FF3B30] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Registrar Refeição
              </button>
            </div>

            {store.corpo_refeicao.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-[16px] bg-[#111111] border border-[#222222] flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{ref.nome}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-xs text-[#888888]">{ref.hora}</span>
                    {ref.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#FF3B30] border border-[#FF3B30]/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {ref.calorias_estimadas && (
                  <span className="text-xs font-black text-white shrink-0">
                    {ref.calorias_estimadas} kcal
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

        {/* ABA 3: SAÚDE & SONO */}
        {activeTab === 'saude' && (
          <motion.div
            key="saude"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          {/* REMÉDIOS (COM PULSO VERMELHO SE ATRASAR) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                REMÉDIOS & SUPLEMENTOS ({store.corpo_remedios.length})
              </h3>
              <button
                onClick={() => setModalRemedio(true)}
                className="text-xs font-bold text-[#FF3B30] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Novo Remédio
              </button>
            </div>

            {store.corpo_remedios.map((r) => {
              const isAtrasado = !r.tomado_hoje && r.horario <= nowTime;

              return (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-[16px] bg-[#111111] border flex items-center justify-between gap-3 transition-all ${
                    isAtrasado ? 'border-[#FF3B30] pulse-urgent' : 'border-[#222222]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{r.nome}</h4>
                      {isAtrasado && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FF3B30] text-black">
                          ATRASADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#888888] mt-0.5">
                      Horário: <strong className="text-white">{r.horario}</strong> • {r.dose}
                    </p>
                  </div>

                  {/* Toggle Tomado */}
                  <button
                    onClick={() => toggleRemedio(r.id)}
                    className={`h-9 px-3.5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      r.tomado_hoje
                        ? 'bg-[#00FF88]/20 border border-[#00FF88]/40 text-[#00FF88]'
                        : 'bg-[#FF3B30] text-white font-extrabold glow-corpo'
                    }`}
                  >
                    {r.tomado_hoje && <CheckCircle2 size={13} />}
                    <span>{r.tomado_hoje ? 'Tomado' : 'Tomar'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* SONO & QUALIDADE */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Moon size={15} className="text-[#38BDF8]" /> Registro de Sono
              </span>
              <button
                onClick={() => setModalSono(true)}
                className="text-xs font-bold text-[#FF3B30] hover:underline cursor-pointer"
              >
                + Registrar Noite
              </button>
            </div>

            {store.corpo_sono.length > 0 ? (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-bold">Última Noite</span>
                  <span className="text-lg font-black text-white">
                    {store.corpo_sono[0].horas_dormidas} horas
                  </span>
                  <span className="text-xs text-[#888888] block">
                    ({store.corpo_sono[0].dormiu_as} às {store.corpo_sono[0].acordou_as})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#888888] uppercase block font-bold">Qualidade</span>
                  <span className="text-sm font-bold text-[#00FF88] capitalize">
                    {store.corpo_sono[0].qualidade}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#888888]">Nenhum sono registrado hoje.</p>
            )}
          </div>

          {/* PESO DIÁRIO */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Scale size={15} className="text-[#00FF88]" /> Peso Corporal
              </span>
              <button
                onClick={() => setModalPeso(true)}
                className="text-xs font-bold text-[#FF3B30] hover:underline cursor-pointer"
              >
                + Registrar Peso
              </button>
            </div>
            {store.corpo_peso.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {store.corpo_peso[0].peso_kg}
                </span>
                <span className="text-xs text-[#888888]">kg atualizado</span>
              </div>
            )}
          </div>

          {/* HUMOR DO DIA EMOJI */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <span className="text-xs font-bold text-white block mb-2.5">
              Como está sua energia e humor hoje?
            </span>
            <div className="flex justify-between">
              {['⚡ Disposto', '😄 Alegre', '😐 Normal', '😴 Cansado', '😔 Estressado'].map((h) => {
                const isSelected = humorSelecionado === h.split(' ')[0];
                return (
                  <button
                    key={h}
                    onClick={() => {
                      setHumorSelecionado(h.split(' ')[0]);
                      soundFx.beep(600, 0.08);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[12px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF3B30]/20 border border-[#FF3B30] scale-105'
                        : 'bg-[#161616] border border-[#222222] opacity-70'
                    }`}
                  >
                    <span className="text-2xl">{h.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-[#888888]">{h.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL REFEIÇÃO */}
      {modalRefeicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Registrar Refeição</h3>
            <form onSubmit={handleSalvarRefeicao} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                  O que você comeu?
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 4 Ovos mexidos + 2 fatias pão integral"
                  value={refNome}
                  onChange={(e) => setRefNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Tags seletor */}
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                  Tags Rápidas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['#proteina', '#carbo', '#besteira', '#vegetais', '#jejum'].map((tag) => {
                    const active = refTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() =>
                          setRefTags((prev) =>
                            active ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-[8px] border transition-colors ${
                          active
                            ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                            : 'bg-[#1A1A1A] text-[#888888] border-[#222222]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                  Calorias aproximadas (opcional)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 450"
                  value={refCals}
                  onChange={(e) => setRefCals(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalRefeicao(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF3B30] text-white font-bold text-[16px] glow-corpo"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REMÉDIO */}
      {modalRemedio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Novo Remédio / Suplemento</h3>
            <form onSubmit={handleSalvarRemedio} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Creatina, Ômega 3, Vitamina D..."
                  value={remNome}
                  onChange={(e) => setRemNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={remHora}
                    onChange={(e) => setRemHora(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Dose</label>
                  <input
                    type="text"
                    required
                    placeholder="1 cápsula, 5g..."
                    value={remDose}
                    onChange={(e) => setRemDose(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalRemedio(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF3B30] text-white font-bold text-[16px] glow-corpo"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SONO */}
      {modalSono && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Registrar Noite de Sono</h3>
            <form onSubmit={handleSalvarSono} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Dormiu às</label>
                  <input
                    type="time"
                    required
                    value={sonoDormiu}
                    onChange={(e) => setSonoDormiu(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Acordou às</label>
                  <input
                    type="time"
                    required
                    value={sonoAcordou}
                    onChange={(e) => setSonoAcordou(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Qualidade do Sono</label>
                <select
                  value={sonoQualidade}
                  onChange={(e) => setSonoQualidade(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF3B30] focus:outline-none"
                >
                  <option value="excelente">Excelente (Acordou renovado)</option>
                  <option value="boa">Boa (Descanso suficiente)</option>
                  <option value="regular">Regular (Acordou algumas vezes)</option>
                  <option value="ruim">Ruim (Pouco sono ou agitado)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalSono(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF3B30] text-white font-bold text-[16px] glow-corpo"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PESO */}
      {modalPeso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Registrar Peso Hoje</h3>
            <form onSubmit={handleSalvarPeso} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ex: 77.5"
                  value={pesoInput}
                  onChange={(e) => setPesoInput(e.target.value)}
                  className="w-full h-12 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white font-black text-xl text-center focus:border-[#FF3B30] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalPeso(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF3B30] text-white font-bold text-[16px] glow-corpo"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
