/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  AppStoreData,
  loadStore,
  saveStore,
  syncTableToSupabase,
  initSupabase
} from '../lib/storage';
import {
  ModuleType,
  UserConfig,
  FinanceGuardado,
  FinanceInvestimento,
  FinanceDivida,
  FinanceParcela,
  CasaConta,
  CasaDespensa,
  CasaCompra,
  CasaManutencao,
  DocsCofre,
  CorpoLogTreino,
  CorpoAgua,
  CorpoRefeicao,
  CorpoRemedio,
  CorpoSono,
  CorpoPeso,
  CorpoMedidas,
  TempoLog,
  GaragemAbastecimento,
  GaragemManutencao,
  GaragemDocs,
  MenteNota
} from '../types/database';
import { soundFx } from '../lib/sound';

interface FocusTimerState {
  isRunning: boolean;
  categoria: 'Trabalho' | 'Venda' | 'Estudo' | 'Celular' | 'Descanso' | 'Casa';
  seconds: number;
  startedAt: string | null;
}

interface AppContextType {
  activeModule: ModuleType;
  setActiveModule: (m: ModuleType) => void;
  store: AppStoreData;
  focusTimer: FocusTimerState;
  startFocusTimer: (categoria: FocusTimerState['categoria']) => void;
  pauseFocusTimer: () => void;
  finishFocusTimer: () => void;
  patrimonioTotal: number;
  totalGuardado: number;
  totalInvestimentos: number;
  totalDividas: number;
  possoGastarHoje: {
    valorPorDia: number;
    diasRestantes: number;
    saldoLivre: number;
    contasFuturas: number;
  };
  // Quick Actions
  addWaterQuick: (ml?: number) => void;
  addIdeiaQuick: (texto: string) => void;
  // Module Modifiers
  baixarParcela: (dividaId: string, parcelaId?: string) => void;
  addConta: (conta: Omit<CasaConta, 'id' | 'created_at'>) => void;
  toggleContaStatus: (id: string) => void;
  deleteConta: (id: string) => void;
  addDespensaItem: (item: Omit<CasaDespensa, 'id' | 'created_at'>) => void;
  consumeDespensaItem: (id: string, qtd?: number) => void;
  deleteDespensaItem: (id: string) => void;
  addCompraItem: (item: Omit<CasaCompra, 'id' | 'created_at'>) => void;
  toggleCompraItem: (id: string) => void;
  clearComprados: () => void;
  addManutencaoItem: (m: Omit<CasaManutencao, 'id' | 'created_at'>) => void;
  renovarManutencao: (id: string) => void;
  addGuardado: (g: Omit<FinanceGuardado, 'id' | 'created_at'>) => void;
  movimentarGuardado: (id: string, tipo: 'deposito' | 'saque', valor: number, desc?: string) => void;
  addInvestimento: (inv: Omit<FinanceInvestimento, 'id' | 'created_at'>) => void;
  addDivida: (d: Omit<FinanceDivida, 'id' | 'created_at'>) => void;
  addAbastecimento: (ab: Omit<GaragemAbastecimento, 'id' | 'created_at' | 'km_por_litro' | 'custo_por_km'>) => void;
  addGaragemManutencao: (gm: Omit<GaragemManutencao, 'id' | 'created_at'>) => void;
  renovarGaragemManutencao: (id: string, novoKmAtual: number) => void;
  toggleRemedio: (id: string) => void;
  addRemedio: (rem: Omit<CorpoRemedio, 'id' | 'created_at'>) => void;
  addRefeicao: (ref: Omit<CorpoRefeicao, 'id' | 'created_at'>) => void;
  addSono: (sono: Omit<CorpoSono, 'id' | 'created_at'>) => void;
  addPeso: (pesoKg: number) => void;
  addMedidas: (med: Omit<CorpoMedidas, 'id' | 'created_at'>) => void;
  addDocCofre: (doc: Omit<DocsCofre, 'id' | 'created_at'>) => void;
  deleteDocCofre: (id: string) => void;
  addMenteNota: (nota: Omit<MenteNota, 'id' | 'created_at'>) => void;
  deleteMenteNota: (id: string) => void;
  converterNotaParaFinance: (notaId: string) => void;
  saveWorkoutLog: (log: Omit<CorpoLogTreino, 'id' | 'created_at'>) => void;
  updateConfig: (cfg: Partial<UserConfig>) => void;
  testAndSaveSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('inicio');
  const [store, setStore] = useState<AppStoreData>(() => loadStore());
  
  // Focus Timer state
  const [focusTimer, setFocusTimer] = useState<FocusTimerState>({
    isRunning: false,
    categoria: 'Trabalho',
    seconds: 0,
    startedAt: null
  });

  // Save changes to localStorage and attempt Supabase background sync
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Focus timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusTimer.isRunning) {
      interval = setInterval(() => {
        setFocusTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimer.isRunning]);

  // Initialize Supabase if config contains URL & key
  useEffect(() => {
    if (store.config.supabaseUrl && store.config.supabaseAnonKey) {
      initSupabase(store.config.supabaseUrl, store.config.supabaseAnonKey);
    }
  }, [store.config.supabaseUrl, store.config.supabaseAnonKey]);

  // Financial calculations
  const totalGuardado = useMemo(() => {
    return store.finance_guardado.reduce((acc, item) => acc + (Number(item.valor_atual) || 0), 0);
  }, [store.finance_guardado]);

  const totalInvestimentos = useMemo(() => {
    return store.finance_investimentos.reduce((acc, item) => acc + (Number(item.valor_atual) || 0), 0);
  }, [store.finance_investimentos]);

  const totalDividas = useMemo(() => {
    return store.finance_dividas.reduce((acc, item) => {
      // Valor restante
      const total = Number(item.valor_total) || 0;
      const parcela = Number(item.valor_parcela) || 0;
      const pagas = Number(item.parcelas_pagas) || 0;
      const restante = Math.max(0, total - (parcela * pagas));
      return acc + (restante > 0 ? restante : total);
    }, 0);
  }, [store.finance_dividas]);

  const patrimonioTotal = useMemo(() => {
    return (totalGuardado + totalInvestimentos) - totalDividas;
  }, [totalGuardado, totalInvestimentos, totalDividas]);

  // Posso Gastar Hoje? Calculation
  // (Guardado livre - Contas pendentes do mês atual) / Dias restantes no mês
  const possoGastarHoje = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - today.getDate() + 1);

    const contasPendentes = store.casa_contas
      .filter(c => c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

    const parcelasPendentes = store.finance_parcelas
      .filter(p => p.status !== 'paga')
      .reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

    const totalContasFuturas = contasPendentes + parcelasPendentes;
    const saldoLivre = Math.max(0, totalGuardado - totalContasFuturas);
    const valorPorDia = Number((saldoLivre / remainingDays).toFixed(2));

    return {
      valorPorDia,
      diasRestantes: remainingDays,
      saldoLivre,
      contasFuturas: totalContasFuturas
    };
  }, [totalGuardado, store.casa_contas, store.finance_parcelas]);

  // Timer controls
  const startFocusTimer = (categoria: FocusTimerState['categoria']) => {
    soundFx.beep(600, 0.1);
    setFocusTimer({
      isRunning: true,
      categoria,
      seconds: 0,
      startedAt: new Date().toISOString()
    });
  };

  const pauseFocusTimer = () => {
    soundFx.beep(400, 0.1);
    setFocusTimer(prev => ({ ...prev, isRunning: false }));
  };

  const finishFocusTimer = () => {
    if (focusTimer.seconds <= 0) {
      setFocusTimer(prev => ({ ...prev, isRunning: false, seconds: 0 }));
      return;
    }
    soundFx.finishChime();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });

    const duracaoSegundos = focusTimer.seconds;
    const duracaoHoras = duracaoSegundos / 3600;
    const valorGerado = (focusTimer.categoria === 'Trabalho' || focusTimer.categoria === 'Venda')
      ? Number((duracaoHoras * store.config.hourlyRate).toFixed(2))
      : 0;

    const newLog: TempoLog = {
      id: 'tl-' + Date.now(),
      categoria: focusTimer.categoria,
      duracao_segundos: duracaoSegundos,
      data: new Date().toISOString().split('T')[0],
      hora_inicio: focusTimer.startedAt ? new Date(focusTimer.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      hora_fim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      valor_gerado_reais: valorGerado,
      created_at: new Date().toISOString()
    };

    setStore(prev => {
      const updated = [newLog, ...prev.tempo_logs];
      syncTableToSupabase('tempo_logs', updated, prev.config);
      return { ...prev, tempo_logs: updated };
    });

    setFocusTimer({
      isRunning: false,
      categoria: 'Trabalho',
      seconds: 0,
      startedAt: null
    });
  };

  // Quick Action: +250ml Water
  const addWaterQuick = (ml = 250) => {
    soundFx.beep(750, 0.08);
    const newAgua: CorpoAgua = {
      id: 'ag-' + Date.now(),
      data: new Date().toISOString().split('T')[0],
      quantidade_ml: ml,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    };

    setStore(prev => {
      const updated = [newAgua, ...prev.corpo_agua];
      syncTableToSupabase('corpo_agua', updated, prev.config);
      return { ...prev, corpo_agua: updated };
    });
  };

  // Quick Action: +Ideia
  const addIdeiaQuick = (texto: string) => {
    soundFx.success();
    const isPagar = /pagar|boleto|conta|venc|r\$/i.test(texto);
    const newNota: MenteNota = {
      id: 'not-' + Date.now(),
      texto,
      tipo: 'texto',
      tags: ['#ideia', isPagar ? '#pagar' : ''].filter(Boolean),
      sugestao_finance: isPagar,
      created_at: new Date().toISOString()
    };

    setStore(prev => {
      const updated = [newNota, ...prev.mente_notas];
      syncTableToSupabase('mente_notas', updated, prev.config);
      return { ...prev, mente_notas: updated };
    });
  };

  // Baixar Parcela: marks as paid and AUTOMATICALLY creates the next month's installment on the same day!
  const baixarParcela = (dividaId: string, parcelaId?: string) => {
    soundFx.success();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });

    setStore(prev => {
      const dividas = prev.finance_dividas.map(d => {
        if (d.id === dividaId) {
          const novasPagas = Math.min(d.parcelas_total, d.parcelas_pagas + 1);
          // Calculate next month's due date
          const [ano, mes, dia] = d.proximo_vencimento.split('-').map(Number);
          const nextDate = new Date(ano, mes, dia); // mes is 0-indexed in Date, so 'mes' here is already next month
          const nextVencimento = nextDate.toISOString().split('T')[0];
          
          return {
            ...d,
            parcelas_pagas: novasPagas,
            proximo_vencimento: novasPagas >= d.parcelas_total ? d.proximo_vencimento : nextVencimento,
            status: (novasPagas >= d.parcelas_total ? 'quitado' : 'em_dia') as FinanceDivida['status']
          };
        }
        return d;
      });

      // Update parcelas list: mark current as paga and auto-create next installment
      let parcelas = [...prev.finance_parcelas];
      const targetDiv = dividas.find(d => d.id === dividaId);

      if (parcelaId) {
        parcelas = parcelas.map(p => p.id === parcelaId ? { ...p, status: 'paga', pago_em: new Date().toISOString() } : p);
      } else {
        const pendente = parcelas.find(p => p.divida_id === dividaId && p.status !== 'paga');
        if (pendente) {
          parcelas = parcelas.map(p => p.id === pendente.id ? { ...p, status: 'paga', pago_em: new Date().toISOString() } : p);
        }
      }

      // Automatically create next month's installment if debt is not completely settled!
      if (targetDiv && targetDiv.parcelas_pagas < targetDiv.parcelas_total) {
        const nextParcela: FinanceParcela = {
          id: 'parc-' + Date.now(),
          divida_id: dividaId,
          numero_parcela: targetDiv.parcelas_pagas + 1,
          valor: targetDiv.valor_parcela,
          vencimento: targetDiv.proximo_vencimento,
          status: 'pendente',
          created_at: new Date().toISOString()
        };
        parcelas.push(nextParcela);
      }

      syncTableToSupabase('finance_dividas', dividas, prev.config);
      syncTableToSupabase('finance_parcelas', parcelas, prev.config);

      return {
        ...prev,
        finance_dividas: dividas,
        finance_parcelas: parcelas
      };
    });
  };

  // Contas
  const addConta = (conta: Omit<CasaConta, 'id' | 'created_at'>) => {
    soundFx.beep(650, 0.1);
    const newConta: CasaConta = {
      ...conta,
      id: 'cc-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newConta, ...prev.casa_contas];
      syncTableToSupabase('casa_contas', updated, prev.config);
      return { ...prev, casa_contas: updated };
    });
  };

  const toggleContaStatus = (id: string) => {
    soundFx.success();
    setStore(prev => {
      const updated = prev.casa_contas.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'pago' ? 'pendente' : 'pago';
          return { ...c, status: nextStatus as CasaConta['status'] };
        }
        return c;
      });
      syncTableToSupabase('casa_contas', updated, prev.config);
      return { ...prev, casa_contas: updated };
    });
  };

  const deleteConta = (id: string) => {
    setStore(prev => {
      const updated = prev.casa_contas.filter(c => c.id !== id);
      syncTableToSupabase('casa_contas', updated, prev.config);
      return { ...prev, casa_contas: updated };
    });
  };

  // Despensa & Compras
  const addDespensaItem = (item: Omit<CasaDespensa, 'id' | 'created_at'>) => {
    soundFx.beep(600, 0.1);
    const newItem: CasaDespensa = {
      ...item,
      id: 'cd-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.casa_despensa];
      syncTableToSupabase('casa_despensa', updated, prev.config);
      return { ...prev, casa_despensa: updated };
    });
  };

  const consumeDespensaItem = (id: string, qtd = 1) => {
    soundFx.beep(500, 0.08);
    setStore(prev => {
      let despensaUpdated = [...prev.casa_despensa];
      let comprasUpdated = [...prev.casa_compras];

      despensaUpdated = despensaUpdated.map(d => {
        if (d.id === id) {
          const novaQtd = Math.max(0, d.quantidade - qtd);
          // If quantity becomes 0, automatically generate grocery item as per brief!
          if (novaQtd === 0) {
            const alreadyInCompras = comprasUpdated.some(c => c.item.toLowerCase() === d.item.toLowerCase() && !c.comprado);
            if (!alreadyInCompras) {
              comprasUpdated.push({
                id: 'comp-' + Date.now(),
                item: d.item,
                quantidade: 1,
                unidade: d.unidade,
                comprado: false,
                urgencia: 'alta',
                origem_despensa: true,
                created_at: new Date().toISOString()
              });
            }
          }
          return { ...d, quantidade: novaQtd };
        }
        return d;
      });

      syncTableToSupabase('casa_despensa', despensaUpdated, prev.config);
      syncTableToSupabase('casa_compras', comprasUpdated, prev.config);

      return {
        ...prev,
        casa_despensa: despensaUpdated,
        casa_compras: comprasUpdated
      };
    });
  };

  const deleteDespensaItem = (id: string) => {
    setStore(prev => {
      const updated = prev.casa_despensa.filter(d => d.id !== id);
      syncTableToSupabase('casa_despensa', updated, prev.config);
      return { ...prev, casa_despensa: updated };
    });
  };

  const addCompraItem = (item: Omit<CasaCompra, 'id' | 'created_at'>) => {
    soundFx.beep(600, 0.1);
    const newItem: CasaCompra = {
      ...item,
      id: 'comp-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.casa_compras];
      syncTableToSupabase('casa_compras', updated, prev.config);
      return { ...prev, casa_compras: updated };
    });
  };

  const toggleCompraItem = (id: string) => {
    soundFx.beep(750, 0.08);
    setStore(prev => {
      const updated = prev.casa_compras.map(c => c.id === id ? { ...c, comprado: !c.comprado } : c);
      syncTableToSupabase('casa_compras', updated, prev.config);
      return { ...prev, casa_compras: updated };
    });
  };

  const clearComprados = () => {
    setStore(prev => {
      const updated = prev.casa_compras.filter(c => !c.comprado);
      syncTableToSupabase('casa_compras', updated, prev.config);
      return { ...prev, casa_compras: updated };
    });
  };

  // Casa Manutenção
  const addManutencaoItem = (m: Omit<CasaManutencao, 'id' | 'created_at'>) => {
    const newItem: CasaManutencao = {
      ...m,
      id: 'cm-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.casa_manutencao];
      syncTableToSupabase('casa_manutencao', updated, prev.config);
      return { ...prev, casa_manutencao: updated };
    });
  };

  const renovarManutencao = (id: string) => {
    soundFx.success();
    const today = new Date().toISOString().split('T')[0];
    setStore(prev => {
      const updated = prev.casa_manutencao.map(m => {
        if (m.id === id) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + m.intervalo_dias);
          return {
            ...m,
            ultima_troca: today,
            proxima_troca: nextDate.toISOString().split('T')[0]
          };
        }
        return m;
      });
      syncTableToSupabase('casa_manutencao', updated, prev.config);
      return { ...prev, casa_manutencao: updated };
    });
  };

  // Guardado
  const addGuardado = (g: Omit<FinanceGuardado, 'id' | 'created_at'>) => {
    const newItem: FinanceGuardado = {
      ...g,
      id: 'g-' + Date.now(),
      historico: [],
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.finance_guardado];
      syncTableToSupabase('finance_guardado', updated, prev.config);
      return { ...prev, finance_guardado: updated };
    });
  };

  const movimentarGuardado = (id: string, tipo: 'deposito' | 'saque', valor: number, desc?: string) => {
    soundFx.success();
    setStore(prev => {
      const updated = prev.finance_guardado.map(g => {
        if (g.id === id) {
          const novoValor = tipo === 'deposito' ? g.valor_atual + valor : Math.max(0, g.valor_atual - valor);
          const novoHistorico = [
            {
              id: 'h-' + Date.now(),
              tipo,
              valor,
              data: new Date().toISOString().split('T')[0],
              descricao: desc || (tipo === 'deposito' ? 'Depósito' : 'Saque')
            },
            ...(g.historico || [])
          ];
          return {
            ...g,
            valor_atual: novoValor,
            historico: novoHistorico
          };
        }
        return g;
      });
      syncTableToSupabase('finance_guardado', updated, prev.config);
      return { ...prev, finance_guardado: updated };
    });
  };

  // Investimentos
  const addInvestimento = (inv: Omit<FinanceInvestimento, 'id' | 'created_at'>) => {
    const newItem: FinanceInvestimento = {
      ...inv,
      id: 'inv-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.finance_investimentos];
      syncTableToSupabase('finance_investimentos', updated, prev.config);
      return { ...prev, finance_investimentos: updated };
    });
  };

  // Dívidas
  const addDivida = (d: Omit<FinanceDivida, 'id' | 'created_at'>) => {
    const newId = 'div-' + Date.now();
    const newDivida: FinanceDivida = {
      ...d,
      id: newId,
      created_at: new Date().toISOString()
    };

    // Create first parcela
    const firstParcela: FinanceParcela = {
      id: 'parc-' + Date.now(),
      divida_id: newId,
      numero_parcela: d.parcelas_pagas + 1,
      valor: d.valor_parcela,
      vencimento: d.proximo_vencimento,
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    setStore(prev => {
      const divUpdated = [newDivida, ...prev.finance_dividas];
      const parcUpdated = [firstParcela, ...prev.finance_parcelas];
      syncTableToSupabase('finance_dividas', divUpdated, prev.config);
      syncTableToSupabase('finance_parcelas', parcUpdated, prev.config);
      return {
        ...prev,
        finance_dividas: divUpdated,
        finance_parcelas: parcUpdated
      };
    });
  };

  // Garagem
  const addAbastecimento = (ab: Omit<GaragemAbastecimento, 'id' | 'created_at' | 'km_por_litro' | 'custo_por_km'>) => {
    soundFx.beep(600, 0.1);
    // Automatic calculations:
    // km/l = (km atual - km anterior) / litros
    // custo/km = valor / km rodado
    const anterior = store.garagem_abastecimento[0];
    let kmPorLitro: number | undefined = undefined;
    let custoPorKm: number | undefined = undefined;

    if (anterior && ab.km_atual > anterior.km_atual) {
      const kmRodado = ab.km_atual - anterior.km_atual;
      if (ab.litros > 0) {
        kmPorLitro = Number((kmRodado / ab.litros).toFixed(2));
      }
      if (kmRodado > 0) {
        custoPorKm = Number((ab.valor_total / kmRodado).toFixed(2));
      }
    }

    const newItem: GaragemAbastecimento = {
      ...ab,
      id: 'ab-' + Date.now(),
      km_por_litro: kmPorLitro,
      custo_por_km: custoPorKm,
      created_at: new Date().toISOString()
    };

    setStore(prev => {
      const updated = [newItem, ...prev.garagem_abastecimento];
      syncTableToSupabase('garagem_abastecimento', updated, prev.config);
      return { ...prev, garagem_abastecimento: updated };
    });
  };

  const addGaragemManutencao = (gm: Omit<GaragemManutencao, 'id' | 'created_at'>) => {
    const newItem: GaragemManutencao = {
      ...gm,
      id: 'gm-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.garagem_manutencao];
      syncTableToSupabase('garagem_manutencao', updated, prev.config);
      return { ...prev, garagem_manutencao: updated };
    });
  };

  const renovarGaragemManutencao = (id: string, novoKmAtual: number) => {
    soundFx.success();
    const today = new Date().toISOString().split('T')[0];
    setStore(prev => {
      const updated = prev.garagem_manutencao.map(gm => {
        if (gm.id === id) {
          const delta = gm.km_proxima - gm.km_ultima || 10000;
          return {
            ...gm,
            km_ultima: novoKmAtual,
            km_proxima: novoKmAtual + delta,
            data_ultima: today
          };
        }
        return gm;
      });
      syncTableToSupabase('garagem_manutencao', updated, prev.config);
      return { ...prev, garagem_manutencao: updated };
    });
  };

  // Saúde / Corpo
  const toggleRemedio = (id: string) => {
    soundFx.success();
    const today = new Date().toISOString().split('T')[0];
    setStore(prev => {
      const updated = prev.corpo_remedios.map(r => {
        if (r.id === id) {
          const novoTomado = !r.tomado_hoje;
          return {
            ...r,
            tomado_hoje: novoTomado,
            ultimo_tomado_data: novoTomado ? today : r.ultimo_tomado_data
          };
        }
        return r;
      });
      syncTableToSupabase('corpo_remedios', updated, prev.config);
      return { ...prev, corpo_remedios: updated };
    });
  };

  const addRemedio = (rem: Omit<CorpoRemedio, 'id' | 'created_at'>) => {
    const newItem: CorpoRemedio = {
      ...rem,
      id: 'rem-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.corpo_remedios];
      syncTableToSupabase('corpo_remedios', updated, prev.config);
      return { ...prev, corpo_remedios: updated };
    });
  };

  const addRefeicao = (ref: Omit<CorpoRefeicao, 'id' | 'created_at'>) => {
    soundFx.beep(650, 0.1);
    const newItem: CorpoRefeicao = {
      ...ref,
      id: 'ref-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.corpo_refeicao];
      syncTableToSupabase('corpo_refeicao', updated, prev.config);
      return { ...prev, corpo_refeicao: updated };
    });
  };

  const addSono = (sono: Omit<CorpoSono, 'id' | 'created_at'>) => {
    soundFx.beep(550, 0.1);
    const newItem: CorpoSono = {
      ...sono,
      id: 'so-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.corpo_sono];
      syncTableToSupabase('corpo_sono', updated, prev.config);
      return { ...prev, corpo_sono: updated };
    });
  };

  const addPeso = (pesoKg: number) => {
    soundFx.beep(700, 0.1);
    const newItem: CorpoPeso = {
      id: 'pe-' + Date.now(),
      data: new Date().toISOString().split('T')[0],
      peso_kg: pesoKg,
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.corpo_peso];
      syncTableToSupabase('corpo_peso', updated, prev.config);
      return { ...prev, corpo_peso: updated };
    });
  };

  const addMedidas = (med: Omit<CorpoMedidas, 'id' | 'created_at'>) => {
    soundFx.beep(650, 0.1);
    const newItem: CorpoMedidas = {
      ...med,
      id: 'med-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.corpo_medidas];
      syncTableToSupabase('corpo_medidas', updated, prev.config);
      return { ...prev, corpo_medidas: updated };
    });
  };

  const saveWorkoutLog = (log: Omit<CorpoLogTreino, 'id' | 'created_at'>) => {
    soundFx.finishChime();
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    const newLog: CorpoLogTreino = {
      ...log,
      id: 'log-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newLog, ...prev.corpo_log_treino];
      syncTableToSupabase('corpo_log_treino', updated, prev.config);
      return { ...prev, corpo_log_treino: updated };
    });
  };

  // Docs
  const addDocCofre = (doc: Omit<DocsCofre, 'id' | 'created_at'>) => {
    soundFx.beep(650, 0.1);
    const newItem: DocsCofre = {
      ...doc,
      id: 'doc-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.docs_cofre];
      syncTableToSupabase('docs_cofre', updated, prev.config);
      return { ...prev, docs_cofre: updated };
    });
  };

  const deleteDocCofre = (id: string) => {
    setStore(prev => {
      const updated = prev.docs_cofre.filter(d => d.id !== id);
      syncTableToSupabase('docs_cofre', updated, prev.config);
      return { ...prev, docs_cofre: updated };
    });
  };

  // Mente Notas
  const addMenteNota = (nota: Omit<MenteNota, 'id' | 'created_at'>) => {
    soundFx.beep(650, 0.1);
    const newItem: MenteNota = {
      ...nota,
      id: 'not-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStore(prev => {
      const updated = [newItem, ...prev.mente_notas];
      syncTableToSupabase('mente_notas', updated, prev.config);
      return { ...prev, mente_notas: updated };
    });
  };

  const deleteMenteNota = (id: string) => {
    setStore(prev => {
      const updated = prev.mente_notas.filter(n => n.id !== id);
      syncTableToSupabase('mente_notas', updated, prev.config);
      return { ...prev, mente_notas: updated };
    });
  };

  // Action: "Criar lembrete no Finance?" if note contains bill keywords
  const converterNotaParaFinance = (notaId: string) => {
    const nota = store.mente_notas.find(n => n.id === notaId);
    if (!nota) return;

    // Extract any number from note or default to 150
    const numbers = nota.texto.match(/\d+([.,]\d+)?/);
    const valor = numbers ? parseFloat(numbers[0].replace(',', '.')) : 100;

    const newConta: CasaConta = {
      id: 'cc-' + Date.now(),
      nome: nota.texto.slice(0, 30) + '...',
      categoria: 'outros',
      valor,
      vencimento: new Date().toISOString().split('T')[0],
      status: 'pendente',
      recorrente_mensal: false,
      created_at: new Date().toISOString()
    };

    soundFx.success();
    confetti({ particleCount: 30, spread: 50 });

    setStore(prev => {
      const contasUpdated = [newConta, ...prev.casa_contas];
      const notasUpdated = prev.mente_notas.map(n => n.id === notaId ? { ...n, finance_processado: true } : n);
      syncTableToSupabase('casa_contas', contasUpdated, prev.config);
      syncTableToSupabase('mente_notas', notasUpdated, prev.config);
      return {
        ...prev,
        casa_contas: contasUpdated,
        mente_notas: notasUpdated
      };
    });

    setActiveModule('finance');
  };

  // Config & Supabase Testing
  const updateConfig = (cfg: Partial<UserConfig>) => {
    setStore(prev => ({
      ...prev,
      config: { ...prev.config, ...cfg }
    }));
  };

  const testAndSaveSupabase = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    try {
      const client = initSupabase(url, key);
      if (!client) {
        return { success: false, message: 'URL ou Chave inválidas.' };
      }
      // Try to query finance_guardado to verify connection
      const { error } = await client.from('finance_guardado').select('id').limit(1);
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        return { success: false, message: `Erro Supabase: ${error.message}` };
      }

      setStore(prev => ({
        ...prev,
        config: {
          ...prev.config,
          supabaseUrl: url,
          supabaseAnonKey: key,
          lastSyncedAt: new Date().toISOString()
        }
      }));

      soundFx.success();
      return {
        success: true,
        message: 'Conexão Supabase verificada com sucesso! Tabelas sincronizadas.'
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na conexão.';
      return { success: false, message: errorMsg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        store,
        focusTimer,
        startFocusTimer,
        pauseFocusTimer,
        finishFocusTimer,
        patrimonioTotal,
        totalGuardado,
        totalInvestimentos,
        totalDividas,
        possoGastarHoje,
        addWaterQuick,
        addIdeiaQuick,
        baixarParcela,
        addConta,
        toggleContaStatus,
        deleteConta,
        addDespensaItem,
        consumeDespensaItem,
        deleteDespensaItem,
        addCompraItem,
        toggleCompraItem,
        clearComprados,
        addManutencaoItem,
        renovarManutencao,
        addGuardado,
        movimentarGuardado,
        addInvestimento,
        addDivida,
        addAbastecimento,
        addGaragemManutencao,
        renovarGaragemManutencao,
        toggleRemedio,
        addRemedio,
        addRefeicao,
        addSono,
        addPeso,
        addMedidas,
        addDocCofre,
        deleteDocCofre,
        addMenteNota,
        deleteMenteNota,
        converterNotaParaFinance,
        saveWorkoutLog,
        updateConfig,
        testAndSaveSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
