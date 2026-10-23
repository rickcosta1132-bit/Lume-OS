/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Wrench,
  Package,
  Calendar,
  Send,
  Trash2,
  Minus,
  Check,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CasaConta, CasaDespensa, CasaCompra, CasaManutencao } from '../../types/database';

export const CasaModule: React.FC = () => {
  const {
    store,
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
    renovarManutencao
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contas' | 'despensa' | 'compras' | 'manutencao'>('contas');

  // Modals
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [modalNovaCompra, setModalNovaCompra] = useState(false);
  const [modalNovaManut, setModalNovaManut] = useState(false);

  // Form states
  const [contaNome, setContaNome] = useState('');
  const [contaCat, setContaCat] = useState<CasaConta['categoria']>('luz');
  const [contaValor, setContaValor] = useState('');
  const [contaVenc, setContaVenc] = useState(new Date().toISOString().split('T')[0]);

  const [despItem, setDespItem] = useState('');
  const [despQtd, setDespQtd] = useState('1');
  const [despUnidade, setDespUnidade] = useState('un');
  const [despValidade, setDespValidade] = useState(new Date().toISOString().split('T')[0]);
  const [despLocal, setDespLocal] = useState<CasaDespensa['local']>('geladeira');

  const [compraItemNome, setCompraItemNome] = useState('');
  const [compraQtd, setCompraQtd] = useState('1');

  const [manutNome, setManutNome] = useState('');
  const [manutDias, setManutDias] = useState('90');
  const [manutObs, setManutObs] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // WhatsApp formatted shopping list
  const handleEnviarWhatsApp = () => {
    const pendentes = store.casa_compras.filter(c => !c.comprado);
    if (pendentes.length === 0) return;

    let text = `🛒 *LUME OS - LISTA DE COMPRAS*\n\n`;
    pendentes.forEach(c => {
      text += `▫️ ${c.item} (${c.quantidade} ${c.unidade || 'un'})\n`;
    });
    text += `\n_Gerado automaticamente pelo Lume OS_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCriarConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaNome || !contaValor) return;
    addConta({
      nome: contaNome,
      categoria: contaCat,
      valor: parseFloat(contaValor) || 0,
      vencimento: contaVenc,
      status: 'pendente',
      recorrente_mensal: true
    });
    setContaNome('');
    setContaValor('');
    setModalNovaConta(false);
  };

  const handleCriarDespensa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!despItem) return;
    addDespensaItem({
      item: despItem,
      quantidade: parseFloat(despQtd) || 1,
      unidade: despUnidade,
      validade: despValidade,
      local: despLocal
    });
    setDespItem('');
    setModalNovoItem(false);
  };

  const handleCriarCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compraItemNome) return;
    addCompraItem({
      item: compraItemNome,
      quantidade: parseFloat(compraQtd) || 1,
      unidade: 'un',
      comprado: false,
      urgencia: 'media',
      origem_despensa: false
    });
    setCompraItemNome('');
    setModalNovaCompra(false);
  };

  const handleCriarManut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manutNome) return;
    const dias = parseInt(manutDias, 10) || 90;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + dias);

    addManutencaoItem({
      nome: manutNome,
      intervalo_dias: dias,
      ultima_troca: todayStr,
      proxima_troca: nextDate.toISOString().split('T')[0],
      observacao: manutObs || undefined
    });
    setManutNome('');
    setManutObs('');
    setModalNovaManut(false);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* HEADER LARANJA #FF8A26 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-casa relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A26] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#FF8A26] uppercase">
              LUME CASA
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">Gestão do Lar</span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Casa Conectada & Sem Surpresas
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Controle de contas, validade de alimentos, compras inteligentes e manutenção preventiva.
        </p>

        {/* 4 Tabs Bar */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222] mt-4">
          <button
            onClick={() => setActiveTab('contas')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'contas' ? 'bg-[#FF8A26] text-black glow-casa' : 'text-[#888888] hover:text-white'
            }`}
          >
            Contas
          </button>
          <button
            onClick={() => setActiveTab('despensa')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'despensa' ? 'bg-[#FF8A26] text-black glow-casa' : 'text-[#888888] hover:text-white'
            }`}
          >
            Despensa
          </button>
          <button
            onClick={() => setActiveTab('compras')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'compras' ? 'bg-[#FF8A26] text-black glow-casa' : 'text-[#888888] hover:text-white'
            }`}
          >
            Compras
          </button>
          <button
            onClick={() => setActiveTab('manutencao')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'manutencao' ? 'bg-[#FF8A26] text-black glow-casa' : 'text-[#888888] hover:text-white'
            }`}
          >
            Manutenção
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ABA 1: CONTAS */}
        {activeTab === 'contas' && (
          <motion.div
            key="contas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              CONTAS MENSAIS ({store.casa_contas.length})
            </h3>
            <button
              onClick={() => setModalNovaConta(true)}
              className="text-xs font-bold text-[#FF8A26] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Nova Conta
            </button>
          </div>

          <div className="space-y-2.5">
            {store.casa_contas.map((conta) => {
              const isPago = conta.status === 'pago';
              const isVenceHoje = !isPago && conta.vencimento === todayStr;
              const isAtrasado = !isPago && conta.vencimento < todayStr;

              return (
                <div
                  key={conta.id}
                  className={`p-4 rounded-[16px] bg-[#111111] border transition-all flex items-center justify-between gap-3 ${
                    isVenceHoje ? 'border-[#FF8A26] shadow-[0_0_12px_rgba(255,138,38,0.3)]' : isAtrasado ? 'border-[#FF3B30] pulse-urgent' : 'border-[#222222]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-white truncate">{conta.nome}</h4>
                      {isVenceHoje && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF8A26]/20 text-[#FF8A26] border border-[#FF8A26]/40">
                          VENCE HOJE
                        </span>
                      )}
                      {isAtrasado && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40">
                          ATRASADO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#888888]">
                      <span>Vencimento: {conta.vencimento}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold">{conta.categoria}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white">
                      R$ {Number(conta.valor).toFixed(2)}
                    </div>
                    <button
                      onClick={() => toggleContaStatus(conta.id)}
                      className={`mt-1.5 px-3 py-1 rounded-[8px] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isPago
                          ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40'
                          : 'bg-[#FF8A26] text-black font-extrabold glow-casa'
                      }`}
                    >
                      {isPago ? <CheckCircle2 size={12} /> : null}
                      <span>{isPago ? 'PAGO' : 'PAGAR'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

        {/* ABA 2: DESPENSA */}
        {activeTab === 'despensa' && (
          <motion.div
            key="despensa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                CONTROLE DE VALIDADE
              </h3>
              <p className="text-[10px] text-[#888888]">
                Hoje: <span className="text-[#FF3B30] font-bold">Vermelho</span> • Amanhã: <span className="text-[#FF8A26] font-bold">Laranja</span> • Ok: Normal
              </p>
            </div>
            <button
              onClick={() => setModalNovoItem(true)}
              className="text-xs font-bold text-[#FF8A26] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Novo Item
            </button>
          </div>

          <div className="space-y-2.5">
            {store.casa_despensa.map((d) => {
              const isVenceHoje = d.validade <= todayStr && d.quantidade > 0;
              const isVenceAmanha = d.validade === tomorrowStr && d.quantidade > 0;

              // Rule: Se vence hoje fundo #FF3B30, amanhã #FF8A26, ok #111111
              const cardBg = isVenceHoje ? 'bg-[#FF3B30] text-white border-[#FF3B30]' : isVenceAmanha ? 'bg-[#FF8A26] text-black border-[#FF8A26]' : 'bg-[#111111] text-white border-[#222222]';

              return (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-[16px] border transition-all flex items-center justify-between gap-3 ${cardBg}`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-extrabold truncate">{d.item}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs opacity-90">
                      <span>Validade: {d.validade}</span>
                      <span>•</span>
                      <span className="capitalize font-bold text-[10px] px-1.5 py-0.5 rounded bg-black/20">
                        {d.local}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and decrement button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-black">
                      {d.quantidade} {d.unidade}
                    </span>
                    <button
                      onClick={() => consumeDespensaItem(d.id, 1)}
                      title="Consumir / Decrementar (Se zerar, vai para Compras!)"
                      className="w-8 h-8 rounded-[8px] bg-black/30 hover:bg-black/50 border border-white/20 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => deleteDespensaItem(d.id)}
                      className="text-white/60 hover:text-white p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </motion.div>
        )}

        {/* ABA 3: COMPRAS */}
        {activeTab === 'compras' && (
          <motion.div
            key="compras"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                LISTA DE COMPRAS ({store.casa_compras.filter(c => !c.comprado).length} pendentes)
              </h3>
              <p className="text-[10px] text-[#888888]">
                Itens com qtd=0 na despensa entram aqui automaticamente
              </p>
            </div>
            <button
              onClick={() => setModalNovaCompra(true)}
              className="text-xs font-bold text-[#FF8A26] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          {/* Botão Enviar WhatsApp Formatado */}
          <button
            onClick={handleEnviarWhatsApp}
            className="w-full h-[52px] rounded-[12px] bg-[#25D366] hover:bg-[#25D366]/90 text-black font-bold text-[16px] flex items-center justify-center gap-2 glow-finance transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send size={18} className="stroke-[2.5]" />
            <span>Enviar Lista Formatada no WhatsApp</span>
          </button>

          {/* Checklist */}
          <div className="space-y-2">
            {store.casa_compras.map((compra) => (
              <div
                key={compra.id}
                onClick={() => toggleCompraItem(compra.id)}
                className={`p-3.5 rounded-[14px] border transition-all flex items-center justify-between cursor-pointer ${
                  compra.comprado
                    ? 'bg-[#111111]/50 border-[#222222] opacity-50 line-through'
                    : 'bg-[#111111] border-[#222222] hover:border-[#FF8A26]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                      compra.comprado
                        ? 'bg-[#00FF88] border-[#00FF88] text-black'
                        : 'border-[#444444] bg-[#1A1A1A]'
                    }`}
                  >
                    {compra.comprado && <Check size={14} className="stroke-[3]" />}
                  </div>
                  <span className="text-sm font-bold text-white">{compra.item}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#888888]">
                  <span>{compra.quantidade} {compra.unidade}</span>
                  {compra.origem_despensa && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30]">
                      Despensa Zerada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {store.casa_compras.some(c => c.comprado) && (
            <button
              onClick={clearComprados}
              className="w-full text-xs text-[#888888] hover:text-white py-2 text-center"
            >
              Limpar itens comprados
            </button>
          )}
        </motion.div>
      )}

        {/* ABA 4: MANUTENÇÃO */}
        {activeTab === 'manutencao' && (
          <motion.div
            key="manutencao"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              PREVENÇÃO & TROCAS PERIÓDICAS
            </h3>
            <button
              onClick={() => setModalNovaManut(true)}
              className="text-xs font-bold text-[#FF8A26] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Novo Item
            </button>
          </div>

          <div className="space-y-3">
            {store.casa_manutencao.map((m) => {
              const diffDays = Math.ceil(
                (new Date(m.proxima_troca).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
              );
              const isUrgente = diffDays <= 3;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-[16px] bg-[#111111] border transition-all ${
                    isUrgente ? 'border-[#FF8A26] shadow-[0_0_15px_rgba(255,138,38,0.3)]' : 'border-[#222222]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-extrabold text-white">{m.nome}</h4>
                      <p className="text-xs text-[#888888] mt-0.5">
                        Ciclo: a cada {m.intervalo_dias} dias
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black px-2 py-1 rounded-[8px] ${
                          diffDays <= 0
                            ? 'bg-[#FF3B30] text-white'
                            : isUrgente
                            ? 'bg-[#FF8A26] text-black font-extrabold'
                            : 'bg-[#1A1A1A] text-[#00FF88] border border-[#222222]'
                        }`}
                      >
                        {diffDays <= 0 ? 'VENCIDO!' : `${diffDays} dias restantes`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-[#888888] pt-2 border-t border-[#222222]">
                    <span>Última troca: {m.ultima_troca}</span>
                    <span>Próxima: {m.proxima_troca}</span>
                  </div>

                  {m.observacao && (
                    <p className="text-[11px] text-[#888888] italic mt-1.5">{m.observacao}</p>
                  )}

                  <button
                    onClick={() => renovarManutencao(m.id)}
                    className="mt-3 w-full h-11 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#FF8A26]/40 text-[#FF8A26] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} /> Registrar Troca Realizada Hoje
                  </button>
                </div>
              );
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL NOVA CONTA */}
      {modalNovaConta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Nova Conta Residencial</h3>
            <form onSubmit={handleCriarConta} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Luz Enel, Água Sabesp, Internet..."
                  value={contaNome}
                  onChange={(e) => setContaNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={contaValor}
                    onChange={(e) => setContaValor(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={contaVenc}
                    onChange={(e) => setContaVenc(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaConta(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF8A26] text-black font-bold text-[16px] glow-casa"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO ITEM DESPENSA */}
      {modalNovoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Novo Item na Despensa</h3>
            <form onSubmit={handleCriarDespensa} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Item / Alimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite Integral, Iogurte, Whey..."
                  value={despItem}
                  onChange={(e) => setDespItem(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Qtd</label>
                  <input
                    type="number"
                    required
                    value={despQtd}
                    onChange={(e) => setDespQtd(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Local</label>
                  <select
                    value={despLocal}
                    onChange={(e) => setDespLocal(e.target.value as CasaDespensa['local'])}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                  >
                    <option value="geladeira">Geladeira</option>
                    <option value="armario">Armário</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Data de Validade</label>
                <input
                  type="date"
                  required
                  value={despValidade}
                  onChange={(e) => setDespValidade(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF8A26] text-black font-bold text-[16px] glow-casa"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA COMPRA */}
      {modalNovaCompra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Adicionar à Lista de Compras</h3>
            <form onSubmit={handleCriarCompra} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Item</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café, Banana, Ovos..."
                  value={compraItemNome}
                  onChange={(e) => setCompraItemNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Quantidade</label>
                <input
                  type="number"
                  value={compraQtd}
                  onChange={(e) => setCompraQtd(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaCompra(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF8A26] text-black font-bold text-[16px] glow-casa"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA MANUTENCAO */}
      {modalNovaManut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Nova Manutenção Periódica</h3>
            <form onSubmit={handleCriarManut} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca Botijão Gás, Filtro d'água..."
                  value={manutNome}
                  onChange={(e) => setManutNome(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Intervalo em Dias</label>
                <input
                  type="number"
                  required
                  placeholder="90"
                  value={manutDias}
                  onChange={(e) => setManutDias(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Especificação do filtro..."
                  value={manutObs}
                  onChange={(e) => setManutObs(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FF8A26] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaManut(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FF8A26] text-black font-bold text-[16px] glow-casa"
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
