/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  Square,
  DollarSign,
  TrendingDown,
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundFx } from '../../lib/sound';

export const TempoModule: React.FC = () => {
  const {
    store,
    focusTimer,
    startFocusTimer,
    pauseFocusTimer,
    finishFocusTimer
  } = useApp();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    'Trabalho' | 'Venda' | 'Estudo' | 'Celular' | 'Descanso' | 'Casa'
  >('Trabalho');

  // Pomodoro Mode state
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60); // 25 min
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoType, setPomoType] = useState<'focus' | 'break'>('focus');

  // Pomodoro tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => {
        setPomoSeconds(prev => {
          if (prev === 1) {
            soundFx.finishChime();
            if (pomoType === 'focus') {
              setPomoType('break');
              return 5 * 60; // 5 min break
            } else {
              setPomoType('focus');
              return 25 * 60; // 25 min focus
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoRunning, pomoSeconds, pomoType]);

  interface CategoriaItem {
    nome: 'Trabalho' | 'Venda' | 'Estudo' | 'Celular' | 'Descanso' | 'Casa';
    desc: string;
    icon: string;
    rentavel?: boolean;
    perdido?: boolean;
  }

  const categorias: CategoriaItem[] = [
    { nome: 'Trabalho', desc: 'Foco profundo & Projetos', icon: '💻', rentavel: true },
    { nome: 'Venda', desc: 'Negociações & Fechamentos', icon: '💰', rentavel: true },
    { nome: 'Estudo', desc: 'Leitura, Cursos & Habilidades', icon: '📚', rentavel: false },
    { nome: 'Celular', desc: 'Redes sociais & Distração', icon: '📱', rentavel: false, perdido: true },
    { nome: 'Descanso', desc: 'Recuperação consciente', icon: '☕', rentavel: false },
    { nome: 'Casa', desc: 'Tarefas domésticas & Organização', icon: '🏠', rentavel: false },
  ];

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Relatório do Dia: Tempo por categoria + Conversão em R$
  const todayStr = new Date().toISOString().split('T')[0];
  const logsHoje = store.tempo_logs.filter(l => l.data === todayStr);

  const tempoPorCat: Record<string, number> = {};
  logsHoje.forEach(l => {
    tempoPorCat[l.categoria] = (tempoPorCat[l.categoria] || 0) + l.duracao_segundos;
  });

  const totalSegundosHoje = logsHoje.reduce((acc, l) => acc + l.duracao_segundos, 0);
  const totalGanhosHoje = logsHoje.reduce((acc, l) => acc + (Number(l.valor_gerado_reais) || 0), 0);

  // Ranking semanal "Tempo Perdido" (ex: Celular)
  const segundosCelular = tempoPorCat['Celular'] || 0;
  const horasCelular = (segundosCelular / 3600).toFixed(1);

  return (
    <div className="space-y-5 pb-28">
      {/* HEADER ROXO #A855F7 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-tempo relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#A855F7] uppercase">
              LUME TEMPO
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">
            R$ {store.config.hourlyRate}/hora configurado
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Gestão de Foco & Valor da Hora
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Rastreamento em tempo real, técnica Pomodoro e conversão monetária do seu tempo.
        </p>

        {/* Toggle Normal vs Pomodoro */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222]">
          <button
            onClick={() => setPomodoroMode(false)}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              !pomodoroMode ? 'bg-[#A855F7] text-white glow-tempo' : 'text-[#888888] hover:text-white'
            }`}
          >
            Cronômetro Livre
          </button>
          <button
            onClick={() => setPomodoroMode(true)}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              pomodoroMode ? 'bg-[#A855F7] text-white glow-tempo' : 'text-[#888888] hover:text-white'
            }`}
          >
            Pomodoro 25/5
          </button>
        </div>
      </div>

      {/* CRONÔMETRO RODANDO ROXO */}
      {!pomodoroMode ? (
        <div className="p-6 rounded-[24px] bg-[#111111] border border-[#222222] text-center glow-tempo relative overflow-hidden">
          <span className="text-[11px] font-black tracking-widest text-[#A855F7] uppercase block mb-1">
            {focusTimer.isRunning ? `CRONÔMETRO ATIVO • ${focusTimer.categoria}` : `SELECIONE & INICIE • ${categoriaSelecionada}`}
          </span>

          {/* Big timer digits */}
          <div className="text-5xl sm:text-6xl font-black text-[#A855F7] tracking-tight my-2 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            {formatTimer(focusTimer.seconds)}
          </div>

          {/* Realtime generated value */}
          {(focusTimer.categoria === 'Trabalho' || focusTimer.categoria === 'Venda') && focusTimer.seconds > 0 && (
            <div className="text-sm font-bold text-[#00FF88] flex items-center justify-center gap-1">
              <span>Valor Gerado:</span>
              <span>
                R$ {((focusTimer.seconds / 3600) * store.config.hourlyRate).toFixed(2)}
              </span>
            </div>
          )}

          {/* Action buttons: INICIAR vira PAUSAR / FINALIZAR */}
          <div className="flex gap-2.5 mt-5">
            {!focusTimer.isRunning ? (
              <button
                onClick={() => startFocusTimer(categoriaSelecionada)}
                className="w-full h-[52px] rounded-[12px] bg-[#A855F7] hover:bg-[#A855F7]/90 text-white font-bold text-[16px] flex items-center justify-center gap-2 glow-tempo active:scale-95 transition-all cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>INICIAR FOCO ({categoriaSelecionada})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={pauseFocusTimer}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] border border-[#222222] hover:border-white text-white font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Pause size={17} />
                  <span>PAUSAR</span>
                </button>
                <button
                  onClick={finishFocusTimer}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-bold text-[15px] flex items-center justify-center gap-2 glow-finance cursor-pointer active:scale-95"
                >
                  <Square size={17} fill="currentColor" />
                  <span>FINALIZAR</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* POMODORO 25/5 */
        <div className="p-6 rounded-[24px] bg-[#111111] border border-[#222222] text-center glow-tempo">
          <span className="text-[11px] font-black tracking-widest text-[#A855F7] uppercase block mb-1">
            {pomoType === 'focus' ? 'BLOCO DE FOCO (25 MIN)' : 'PAUSA CURTA (5 MIN)'}
          </span>
          <div className="text-5xl sm:text-6xl font-black text-white tracking-tight my-2">
            {Math.floor(pomoSeconds / 60).toString().padStart(2, '0')}:{(pomoSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setPomoRunning(!pomoRunning)}
              className="flex-1 h-[52px] rounded-[12px] bg-[#A855F7] text-white font-bold text-[16px] glow-tempo"
            >
              {pomoRunning ? 'Pausar Pomodoro' : 'Iniciar Pomodoro'}
            </button>
            <button
              onClick={() => {
                setPomoRunning(false);
                setPomoSeconds(25 * 60);
                setPomoType('focus');
              }}
              className="w-14 h-[52px] rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-[#888888] hover:text-white flex items-center justify-center"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* BOTÕES GIGANTES: Trabalho, Venda, Estudo, Celular, Descanso, Casa */}
      <div>
        <div className="mb-2.5 px-1">
          <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
            CATEGORIAS DE ATIVIDADE
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categorias.map((cat) => {
            const isSelected = categoriaSelecionada === cat.nome;
            return (
              <button
                key={cat.nome}
                onClick={() => setCategoriaSelecionada(cat.nome)}
                className={`p-4 rounded-[16px] text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A1A1A] border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-[#111111] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.rentavel && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88]">
                      +R$/h
                    </span>
                  )}
                  {cat.perdido && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30]">
                      Distração
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-white">{cat.nome}</h4>
                <p className="text-[11px] text-[#888888] mt-0.5">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RELATÓRIO DO DIA COM CONVERSÃO EM R$ */}
      <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <PieIcon size={14} className="text-[#A855F7]" /> Relatório do Dia & Ganhos
          </span>
          <span className="text-xs font-black text-[#00FF88]">
            R$ {totalGanhosHoje.toFixed(2)} gerados
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {Object.entries(tempoPorCat).map(([cat, secs]) => {
            const horas = (secs / 3600).toFixed(1);
            const valor = (cat === 'Trabalho' || cat === 'Venda')
              ? (Number(horas) * store.config.hourlyRate).toFixed(0)
              : null;

            return (
              <div key={cat} className="flex items-center justify-between p-2 rounded-[8px] bg-[#161616]">
                <span className="font-bold text-white">{cat}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#888888]">{horas} horas</span>
                  {valor && (
                    <span className="text-[#00FF88] font-bold">+R$ {valor}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANKING SEMANAL TEMPO PERDIDO */}
      <div className="p-4 rounded-[16px] bg-[#111111] border border-[#FF3B30]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-[#FF3B30]" />
            <span className="text-xs font-bold text-white uppercase">Tempo Perdido (Celular / Distrações)</span>
          </div>
          <span className="text-xs font-black text-[#FF3B30]">{horasCelular}h hoje</span>
        </div>
        <p className="text-[11px] text-[#888888] mt-1.5">
          {Number(horasCelular) > 1
            ? `Atenção: ${horasCelular}h em celular equivale a R$ ${(Number(horasCelular) * store.config.hourlyRate).toFixed(0)} de oportunidade não capturada.`
            : 'Excelente autocontrole hoje! Menos de 1h em distrações.'}
        </p>
      </div>
    </div>
  );
};
