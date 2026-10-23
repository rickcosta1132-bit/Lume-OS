/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  History,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinanceGuardado, FinanceInvestimento, FinanceDivida } from '../../types/database';

export const FinanceModule: React.FC = () => {
  const {
    store,
    patrimonioTotal,
    totalGuardado,
    totalInvestimentos,
    totalDividas,
    possoGastarHoje,
    baixarParcela,
    addGuardado,
    movimentarGuardado,
    addInvestimento,
    addDivida
  } = useApp();

  const [activeTab, setActiveTab] = useState<'guardado' | 'investimentos' | 'dividas'>('guardado');
  const [showPossoGastarModal, setShowPossoGastarModal] = useState(false);
  const [selectedGuardado, setSelectedGuardado] = useState<FinanceGuardado | null>(null);
  const [movimentoTipo, setMovimentoTipo] = useState<'deposito' | 'saque'>('deposito');
  const [movimentoValor, setMovimentoValor] = useState('');
  const [movimentoDesc, setMovimentoDesc] = useState('');

  // Modals for adding items
  const [modalNovoGuardado, setModalNovoGuardado] = useState(false);
  const [modalNovoInvest, setModalNovoInvest] = useState(false);
  const [modalNovaDivida, setModalNovaDivida] = useState(false);

  // Form states
  const [novoGuardadoTitulo, setNovoGuardadoTitulo] = useState('');
  const [novoGuardadoMeta, setNovoGuardadoMeta] = useState('');
  const [novoGuardadoAtual, setNovoGuardadoAtual] = useState('');
  const [novoGuardadoCat, setNovoGuardadoCat] = useState<FinanceGuardado['categoria']>('reserva');

  const [novoInvestNome, setNovoInvestNome] = useState('');
  const [novoInvestCodigo, setNovoInvestCodigo] = useState('');
  const [novoInvestTipo, setNovoInvestTipo] = useState<FinanceInvestimento['tipo']>('fixa');
  const [novoInvestInicial, setNovoInvestInicial] = useState('');
  const [novoInvestAtual, setNovoInvestAtual] = useState('');
  const [novoInvestDiv, setNovoInvestDiv] = useState('');

  const [novaDivNome, setNovaDivNome] = useState('');
  const [novaDivTipo, setNovaDivTipo] = useState<FinanceDivida['tipo']>('cartao');
  const [novaDivTotal, setNovaDivTotal] = useState('');
  const [novaDivParcela, setNovaDivParcela] = useState('');
  const [novaDivParcelasTotal, setNovaDivParcelasTotal] = useState('12');
  const [novaDivVenc, setNovaDivVenc] = useState(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Allocation Pie Chart calculation
  const totalInvestVal = store.finance_investimentos.reduce((acc, i) => acc + (Number(i.valor_atual) || 0), 0);
  const investPorTipo = {
    fixa: store.finance_investimentos.filter(i => i.tipo === 'fixa').reduce((a, b) => a + Number(b.valor_atual), 0),
    acoes: store.finance_investimentos.filter(i => i.tipo === 'acoes').reduce((a, b) => a + Number(b.valor_atual), 0),
    cripto: store.finance_investimentos.filter(i => i.tipo === 'cripto').reduce((a, b) => a + Number(b.valor_atual), 0),
    fiis: store.finance_investimentos.filter(i => i.tipo === 'fiis').reduce((a, b) => a + Number(b.valor_atual), 0),
  };

  const handleMovimentar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuardado || !movimentoValor) return;
    const val = parseFloat(movimentoValor.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    movimentarGuardado(selectedGuardado.id, movimentoTipo, val, movimentoDesc || undefined);
    setMovimentoValor('');
    setMovimentoDesc('');
    setSelectedGuardado(null);
  };

  const handleCriarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoGuardadoTitulo || !novoGuardadoMeta) return;
    addGuardado({
      titulo: novoGuardadoTitulo,
      meta_valor: parseFloat(novoGuardadoMeta) || 0,
      valor_atual: parseFloat(novoGuardadoAtual) || 0,
      categoria: novoGuardadoCat
    });
    setNovoGuardadoTitulo('');
    setNovoGuardadoMeta('');
    setNovoGuardadoAtual('');
    setModalNovoGuardado(false);
  };

  const handleCriarInvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoInvestNome || !novoInvestAtual) return;
    const ini = parseFloat(novoInvestInicial) || parseFloat(novoInvestAtual) || 0;
    const atu = parseFloat(novoInvestAtual) || 0;
    const rendimentoPct = ini > 0 ? (((atu - ini) / ini) * 100).toFixed(1) : '0.0';
    addInvestimento({
      nome: novoInvestNome,
      codigo: novoInvestCodigo || undefined,
      tipo: novoInvestTipo,
      valor_inicial: ini,
      valor_atual: atu,
      dividendos_recebidos: parseFloat(novoInvestDiv) || 0,
      melhor_mes: `+${rendimentoPct}% acumulado`,
      pior_mes: '0.0%'
    });
    setNovoInvestNome('');
    setNovoInvestCodigo('');
    setNovoInvestInicial('');
    setNovoInvestAtual('');
    setNovoInvestDiv('');
    setModalNovoInvest(false);
  };

  const handleCriarDivida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDivNome || !novaDivTotal || !novaDivParcela) return;
    const diaVenc = parseInt(novaDivVenc.split('-')[2], 10) || 10;
    addDivida({
      nome: novaDivNome,
      tipo: novaDivTipo,
      valor_total: parseFloat(novaDivTotal) || 0,
      valor_parcela: parseFloat(novaDivParcela) || 0,
      parcelas_total: parseInt(novaDivParcelasTotal, 10) || 1,
      parcelas_pagas: 0,
      dia_vencimento: diaVenc,
      proximo_vencimento: novaDivVenc,
      status: 'em_dia'
    });
    setNovaDivNome('');
    setNovaDivTotal('');
    setNovaDivParcela('');
    setModalNovaDivida(false);
  };

  return (
    <div className="space-y-5 pb-32">
      {/* HEADER VERDE #00FF88 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-finance relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#00FF88] uppercase">
              LUME FINANCE
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">Patrimônio Líquido</span>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-[#00FF88] tracking-tight drop-shadow-[0_0_12px_rgba(0,255,136,0.3)]">
          R$ {patrimonioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-[#888888] mt-1">
          (Guardado R$ {totalGuardado.toFixed(0)} + Investimentos R$ {totalInvestimentos.toFixed(0)}) - Dívidas R$ {totalDividas.toFixed(0)}
        </p>

        {/* 3 Tabs bar */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222] mt-4">
          <button
            onClick={() => setActiveTab('guardado')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'guardado' ? 'bg-[#00FF88] text-black glow-finance' : 'text-[#888888] hover:text-white'
            }`}
          >
            Guardado
          </button>
          <button
            onClick={() => setActiveTab('investimentos')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'investimentos' ? 'bg-[#00FF88] text-black glow-finance' : 'text-[#888888] hover:text-white'
            }`}
          >
            Investimentos
          </button>
          <button
            onClick={() => setActiveTab('dividas')}
            className={`py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'dividas' ? 'bg-[#00FF88] text-black glow-finance' : 'text-[#888888] hover:text-white'
            }`}
          >
            Dívidas
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ABA 1: GUARDADO */}
        {activeTab === 'guardado' && (
          <motion.div
            key="guardado"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              METAS E RESERVAS ({store.finance_guardado.length})
            </h3>
            <button
              onClick={() => setModalNovoGuardado(true)}
              className="text-xs font-bold text-[#00FF88] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Nova Meta
            </button>
          </div>

          <div className="space-y-3">
            {store.finance_guardado.map((item) => {
              const meta = Number(item.meta_valor) || 1;
              const atual = Number(item.valor_atual) || 0;
              const pct = Math.min(100, Math.round((atual / meta) * 100));

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] hover:border-[#333333] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-extrabold text-white">{item.titulo}</h4>
                      <span className="text-[11px] text-[#888888] uppercase font-bold tracking-wider">
                        {item.categoria}
                      </span>
                    </div>
                    <span className="text-base font-black text-[#00FF88]">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1A1A1A] h-2.5 rounded-full overflow-hidden border border-[#222222]">
                    <div
                      className="bg-[#00FF88] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, boxShadow: '0 0 10px #00FF88' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 text-xs">
                    <span className="text-white font-bold">
                      R$ {atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[#888888]">
                      Meta: R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Actions Depositar / Sacar */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#222222]">
                    <button
                      onClick={() => {
                        setSelectedGuardado(item);
                        setMovimentoTipo('deposito');
                      }}
                      className="h-10 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#00FF88]/40 text-[#00FF88] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowDownLeft size={14} /> Depositar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGuardado(item);
                        setMovimentoTipo('saque');
                      }}
                      className="h-10 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#222222] text-[#888888] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowUpRight size={14} /> Sacar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </motion.div>
        )}

        {/* ABA 2: INVESTIMENTOS */}
        {activeTab === 'investimentos' && (
          <motion.div
            key="investimentos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              CARTEIRA DE ATIVOS
            </h3>
            <button
              onClick={() => setModalNovoInvest(true)}
              className="text-xs font-bold text-[#00FF88] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Novo Ativo
            </button>
          </div>

          {/* Allocation Pie Chart Visual */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase">Alocação de Ativos</span>
              <span className="text-xs font-black text-[#00FF88]">
                Total: R$ {totalInvestVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Visual allocation bar */}
            {totalInvestVal > 0 && (
              <div className="w-full h-3 rounded-full flex overflow-hidden bg-[#222222]">
                <div style={{ width: `${(investPorTipo.fixa / totalInvestVal) * 100}%` }} className="bg-[#00FF88]" title="Renda Fixa" />
                <div style={{ width: `${(investPorTipo.acoes / totalInvestVal) * 100}%` }} className="bg-[#38BDF8]" title="Ações" />
                <div style={{ width: `${(investPorTipo.cripto / totalInvestVal) * 100}%` }} className="bg-[#A855F7]" title="Cripto" />
                <div style={{ width: `${(investPorTipo.fiis / totalInvestVal) * 100}%` }} className="bg-[#FFCC00]" title="FIIs" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-[#888888]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" />
                <span>Fixa: R$ {(investPorTipo.fixa / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span>Ações: R$ {(investPorTipo.acoes / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                <span>Cripto: R$ {(investPorTipo.cripto / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
                <span>FIIs: R$ {(investPorTipo.fiis / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {store.finance_investimentos.map((inv) => {
              const inicial = Number(inv.valor_inicial) || 1;
              const atual = Number(inv.valor_atual) || 0;
              const rendimento = (((atual - inicial) / inicial) * 100).toFixed(2);
              const isPositive = Number(rendimento) >= 0;

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-bold text-white">{inv.nome}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#888888] uppercase">
                          {inv.tipo}
                        </span>
                        {inv.codigo && (
                          <span className="text-[11px] font-semibold text-[#888888]">
                            {inv.codigo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-white">
                        R$ {atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-bold ${isPositive ? 'text-[#00FF88]' : 'text-[#FF3B30]'}`}>
                        {isPositive ? `+${rendimento}%` : `${rendimento}%`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-[#222222] text-[11px]">
                    <div>
                      <span className="text-[#888888] block">Aporte Inicial</span>
                      <span className="font-bold text-white">R$ {inicial.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block">Dividendos</span>
                      <span className="font-bold text-[#00FF88]">
                        +R$ {Number(inv.dividendos_recebidos || 0).toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888888] block">Melhor Mês</span>
                      <span className="font-bold text-white">{inv.melhor_mes || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </motion.div>
        )}

        {/* ABA 3: DÍVIDAS */}
        {activeTab === 'dividas' && (
          <motion.div
            key="dividas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              DÍVIDAS & PARCELAMENTOS ({store.finance_dividas.length})
            </h3>
            <button
              onClick={() => setModalNovaDivida(true)}
              className="text-xs font-bold text-[#FF3B30] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Nova Dívida
            </button>
          </div>

          {/* Calendário Mensal com Bolinhas */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar size={14} className="text-[#00FF88]" /> Calendário de Vencimentos
              </span>
              <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00FF88]" /> Pago</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF8A26]" /> A vencer</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Atrasado</span>
              </div>
            </div>

            {/* Quick days preview */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-[10px] text-[#888888] font-bold">{d}</div>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const dayNum = i + 15;
                const isPaid = dayNum === 15 || dayNum === 20;
                const isToday = dayNum === 23;
                const isPending = dayNum === 25 || dayNum === 28;
                return (
                  <div
                    key={i}
                    className={`h-9 rounded-[8px] flex flex-col items-center justify-center border ${
                      isToday ? 'border-white bg-[#222222]' : 'border-[#222222] bg-[#161616]'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-white">{dayNum}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isPaid ? 'bg-[#00FF88]' : isPending ? 'bg-[#FF8A26]' : ''
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dívidas List */}
          <div className="space-y-3">
            {store.finance_dividas.map((div) => {
              const isAtrasado = div.proximo_vencimento < todayStr && div.status !== 'quitado';
              const jurosCalculado = isAtrasado ? Number((div.valor_parcela * 0.02 + 25).toFixed(2)) : 0;
              const valorComJuros = div.valor_parcela + jurosCalculado;
              const isQuitado = div.parcelas_pagas >= div.parcelas_total;

              return (
                <div
                  key={div.id}
                  className={`p-4 rounded-[16px] bg-[#111111] border transition-all ${
                    isAtrasado ? 'border-[#FF3B30] pulse-urgent' : 'border-[#222222]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-extrabold text-white">{div.nome}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#888888]">
                        <span>Parcelas: {div.parcelas_pagas}/{div.parcelas_total}</span>
                        <span>•</span>
                        <span>Venc: {div.proximo_vencimento}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-white">
                        R$ {div.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-[#888888] block">/mês</span>
                    </div>
                  </div>

                  {/* Atraso warning */}
                  {isAtrasado && (
                    <div className="p-2.5 rounded-[10px] bg-[#FF3B30]/15 border border-[#FF3B30]/40 my-3 text-xs text-[#FF3B30] flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle size={14} /> Atrasado! Juros 2% + Multa R$ 25
                      </span>
                      <span>Total: R$ {valorComJuros.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Progress Bar of installments */}
                  <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#222222] my-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isQuitado ? 'bg-[#00FF88]' : 'bg-[#FF8A26]'}`}
                      style={{ width: `${(div.parcelas_pagas / div.parcelas_total) * 100}%` }}
                    />
                  </div>

                  {/* BOTÃO BAIXAR PARCELA */}
                  {!isQuitado ? (
                    <button
                      onClick={() => baixarParcela(div.id)}
                      className="w-full h-[52px] rounded-[12px] bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-bold text-[16px] flex items-center justify-center gap-2 glow-finance transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle size={18} className="stroke-[2.5]" />
                      <span>Baixar Parcela (Gera Próxima Auto)</span>
                    </button>
                  ) : (
                    <div className="w-full h-11 rounded-[10px] bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Dívida 100% Quitada!
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÃO FIXO "POSSO GASTAR HOJE?" */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => setShowPossoGastarModal(true)}
            className="w-full h-[52px] rounded-[12px] bg-[#111111] hover:bg-[#161616] border border-[#00FF88] text-[#00FF88] font-bold text-[16px] flex items-center justify-center gap-2.5 glow-finance transition-all active:scale-95 cursor-pointer shadow-xl backdrop-blur-md"
          >
            <Calculator size={18} className="stroke-[2.5]" />
            <span>Posso gastar hoje? (R$ {possoGastarHoje.valorPorDia.toFixed(2)}/dia)</span>
          </button>
        </div>
      </div>

      {/* MODAL "POSSO GASTAR HOJE?" */}
      {showPossoGastarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPossoGastarModal(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-[#00FF88]">
              <Calculator size={22} />
              <h3 className="text-lg font-black text-white">Posso Gastar Hoje?</h3>
            </div>
            <p className="text-xs text-[#888888] mb-5">
              Cálculo de inteligência financeira: (Guardado livre - Contas futuras) ÷ Dias restantes do mês.
            </p>

            <div className="p-4 rounded-[16px] bg-[#161616] border border-[#00FF88]/40 mb-4 text-center glow-finance">
              <span className="text-[11px] font-bold text-[#888888] uppercase block">
                SEU LIMITE SEGURO POR DIA
              </span>
              <div className="text-3xl font-black text-[#00FF88] my-1">
                R$ {possoGastarHoje.valorPorDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-[#888888]">
                válido para os próximos {possoGastarHoje.diasRestantes} dias do mês
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#888888] border-t border-[#222222] pt-3">
              <div className="flex justify-between">
                <span>Total Guardado:</span>
                <span className="text-white font-bold">R$ {totalGuardado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Contas e Parcelas Futuras:</span>
                <span className="text-[#FF8A26] font-bold">- R$ {possoGastarHoje.contasFuturas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#222222] pt-1">
                <span>Saldo Livre Líquido:</span>
                <span className="text-[#00FF88] font-bold">R$ {possoGastarHoje.saldoLivre.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPossoGastarModal(false)}
              className="mt-5 w-full h-[52px] rounded-[12px] bg-[#00FF88] text-black font-bold text-[16px] glow-finance cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DEPOSITAR / SACAR GUARDADO */}
      {selectedGuardado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedGuardado(null)}
              className="absolute top-4 right-4 text-[#888888] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white mb-1">
              {movimentoTipo === 'deposito' ? 'Depositar em' : 'Sacar de'} {selectedGuardado.titulo}
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Saldo atual: R$ {selectedGuardado.valor_atual.toFixed(2)}
            </p>

            <form onSubmit={handleMovimentar} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={movimentoValor}
                  onChange={(e) => setMovimentoValor(e.target.value)}
                  className="w-full h-12 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white font-bold text-lg focus:border-[#00FF88] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">
                  Motivo / Descrição (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aporte mensal, Renda extra..."
                  value={movimentoDesc}
                  onChange={(e) => setMovimentoDesc(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>

              {/* Histórico recente */}
              {selectedGuardado.historico && selectedGuardado.historico.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-[#888888] uppercase block mb-1">
                    Histórico Recente
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-[11px]">
                    {selectedGuardado.historico.slice(0, 3).map((h) => (
                      <div key={h.id} className="flex justify-between text-[#888888]">
                        <span>{h.data}: {h.descricao}</span>
                        <span className={h.tipo === 'deposito' ? 'text-[#00FF88]' : 'text-[#FF3B30]'}>
                          {h.tipo === 'deposito' ? '+' : '-'}R$ {h.valor.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGuardado(null)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#00FF88] text-black font-bold text-[16px] glow-finance"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO GUARDADO */}
      {modalNovoGuardado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Nova Meta / Reserva</h3>
            <form onSubmit={handleCriarGuardado} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência"
                  value={novoGuardadoTitulo}
                  onChange={(e) => setNovoGuardadoTitulo(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Meta (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={novoGuardadoMeta}
                    onChange={(e) => setNovoGuardadoMeta(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Atual (R$)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={novoGuardadoAtual}
                    onChange={(e) => setNovoGuardadoAtual(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoGuardado(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#00FF88] text-black font-bold text-[16px] glow-finance"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO INVESTIMENTO */}
      {modalNovoInvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Novo Ativo / Investimento</h3>
            <form onSubmit={handleCriarInvest} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Nome / Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tesouro Selic, Bitcoin, PETR4..."
                  value={novoInvestNome}
                  onChange={(e) => setNovoInvestNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Tipo</label>
                  <select
                    value={novoInvestTipo}
                    onChange={(e) => setNovoInvestTipo(e.target.value as FinanceInvestimento['tipo'])}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  >
                    <option value="fixa">Renda Fixa</option>
                    <option value="acoes">Ações</option>
                    <option value="cripto">Cripto</option>
                    <option value="fiis">FIIs</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Código / Ticker</label>
                  <input
                    type="text"
                    placeholder="BTC, IPCA..."
                    value={novoInvestCodigo}
                    onChange={(e) => setNovoInvestCodigo(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Valor Atual (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={novoInvestAtual}
                    onChange={(e) => setNovoInvestAtual(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Inicial (R$)</label>
                  <input
                    type="number"
                    placeholder="4500"
                    value={novoInvestInicial}
                    onChange={(e) => setNovoInvestInicial(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoInvest(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#00FF88] text-black font-bold text-[16px] glow-finance"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA DÍVIDA */}
      {modalNovaDivida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Nova Dívida / Parcelamento</h3>
            <form onSubmit={handleCriarDivida} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Nome / Credor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartão Visa, Aluguel Studio..."
                  value={novaDivNome}
                  onChange={(e) => setNovaDivNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Valor Parcela (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={novaDivParcela}
                    onChange={(e) => setNovaDivParcela(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Total Parcelas</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={novaDivParcelasTotal}
                    onChange={(e) => setNovaDivParcelasTotal(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="4200"
                  value={novaDivTotal}
                  onChange={(e) => setNovaDivTotal(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Primeiro Vencimento</label>
                <input
                  type="date"
                  required
                  value={novaDivVenc}
                  onChange={(e) => setNovaDivVenc(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#00FF88] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaDivida(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#00FF88] text-black font-bold text-[16px] glow-finance"
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
