/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car,
  Fuel,
  Wrench,
  FileCheck,
  Plus,
  AlertTriangle,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GaragemManutencao } from '../../types/database';

export const GaragemModule: React.FC = () => {
  const {
    store,
    addAbastecimento,
    addGaragemManutencao,
    renovarGaragemManutencao
  } = useApp();

  const [activeTab, setActiveTab] = useState<'abastecimento' | 'dashboard' | 'manutencao' | 'docs'>('abastecimento');

  // Modal Abastecimento
  const [modalAbast, setModalAbast] = useState(false);
  const [abastKm, setAbastKm] = useState('');
  const [abastLitros, setAbastLitros] = useState('');
  const [abastValor, setAbastValor] = useState('');
  const [abastPosto, setAbastPosto] = useState('Posto Ipiranga');
  const [abastData, setAbastData] = useState(new Date().toISOString().split('T')[0]);

  // Modal Manutenção
  const [modalManut, setModalManut] = useState(false);
  const [manutItem, setManutItem] = useState<GaragemManutencao['item']>('Óleo');
  const [manutKmUltima, setManutKmUltima] = useState('');
  const [manutKmProx, setManutKmProx] = useState('');

  // Latest KM registered in the car
  const latestKm = store.garagem_abastecimento.length > 0
    ? store.garagem_abastecimento[0].km_atual
    : 50000;

  // Dashboard calculations
  const totalGastoMes = store.garagem_abastecimento.reduce((acc, a) => acc + (Number(a.valor_total) || 0), 0);
  const custoPorDia = (totalGastoMes / 30).toFixed(0);

  // Postos ranking by km/l
  const postosMap: Record<string, { totalLitros: number; count: number; mediaKmL: number }> = {};
  store.garagem_abastecimento.forEach(a => {
    if (!postosMap[a.posto]) {
      postosMap[a.posto] = { totalLitros: 0, count: 0, mediaKmL: a.km_por_litro || 12 };
    }
  });

  const handleSalvarAbast = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(abastKm);
    const lit = parseFloat(abastLitros);
    const val = parseFloat(abastValor);
    if (!km || !lit || !val) return;

    addAbastecimento({
      data: abastData,
      km_atual: km,
      litros: lit,
      valor_total: val,
      posto: abastPosto
    });

    setAbastKm('');
    setAbastLitros('');
    setAbastValor('');
    setModalAbast(false);
  };

  const handleSalvarManut = (e: React.FormEvent) => {
    e.preventDefault();
    const u = parseFloat(manutKmUltima) || latestKm;
    const p = parseFloat(manutKmProx) || (u + 10000);
    addGaragemManutencao({
      item: manutItem,
      km_ultima: u,
      km_proxima: p
    });
    setModalManut(false);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* HEADER AMARELO #FFCC00 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-garagem relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#FFCC00] uppercase">
              LUME GARAGEM
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888]">
            Km Atual: {latestKm.toLocaleString('pt-BR')} km
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Eficiência & Cuidados do Veículo
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Cálculo automático de km/l, custo por km rodado e alertas preventivos com 500km de antecedência.
        </p>

        {/* 4 Tabs Bar */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222] mt-4">
          <button
            onClick={() => setActiveTab('abastecimento')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'abastecimento' ? 'bg-[#FFCC00] text-black glow-garagem' : 'text-[#888888] hover:text-white'
            }`}
          >
            Abastecer
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#FFCC00] text-black glow-garagem' : 'text-[#888888] hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('manutencao')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'manutencao' ? 'bg-[#FFCC00] text-black glow-garagem' : 'text-[#888888] hover:text-white'
            }`}
          >
            Manutenção
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-2 text-[11px] font-black rounded-[8px] transition-all cursor-pointer ${
              activeTab === 'docs' ? 'bg-[#FFCC00] text-black glow-garagem' : 'text-[#888888] hover:text-white'
            }`}
          >
            Docs
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ABA 1: ABASTECIMENTO */}
        {activeTab === 'abastecimento' && (
          <motion.div
            key="abastecimento"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              HISTÓRICO DE ABASTECIMENTOS
            </h3>
            <button
              onClick={() => setModalAbast(true)}
              className="text-xs font-bold text-[#FFCC00] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Novo Abastecimento
            </button>
          </div>

          <div className="space-y-3">
            {store.garagem_abastecimento.map((ab) => (
              <div
                key={ab.id}
                className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] hover:border-[#FFCC00]/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{ab.posto}</h4>
                    <span className="text-xs text-[#888888]">{ab.data} • {ab.km_atual.toLocaleString('pt-BR')} km</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-white">
                      R$ {ab.valor_total.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#888888] block">({ab.litros} Litros)</span>
                  </div>
                </div>

                {/* Métricas calculadas automaticamente */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-[#222222]">
                  <div className="p-2 rounded-[8px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block uppercase font-bold">Rendimento</span>
                    <span className="text-sm font-black text-[#FFCC00]">
                      {ab.km_por_litro ? `${ab.km_por_litro} km/l` : 'Primeiro Registro'}
                    </span>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#1A1A1A]">
                    <span className="text-[10px] text-[#888888] block uppercase font-bold">Custo por Km</span>
                    <span className="text-sm font-black text-white">
                      {ab.custo_por_km ? `R$ ${ab.custo_por_km}/km` : 'Calculando...'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA Abastecer */}
          <button
            onClick={() => setModalAbast(true)}
            className="w-full h-[52px] rounded-[12px] bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black font-bold text-[16px] flex items-center justify-center gap-2 glow-garagem active:scale-95 transition-all cursor-pointer"
          >
            <Fuel size={18} className="stroke-[2.5]" />
            <span>Registrar Novo Abastecimento</span>
          </button>
        </motion.div>
      )}

        {/* ABA 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          {/* Card Custo Total Mês */}
          <div className="p-5 rounded-[20px] bg-[#111111] border border-[#222222] glow-garagem">
            <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-wider block mb-1">
              CUSTO TOTAL NO MÊS
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              R$ {totalGastoMes.toFixed(2)}
            </div>
            <p className="text-sm font-bold text-[#FFCC00] mt-1">
              = R$ {custoPorDia}/dia rodando com o veículo
            </p>
          </div>

          {/* Ranking Posto Que Mais Rende */}
          <div className="p-4 rounded-[16px] bg-[#111111] border border-[#222222]">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5 mb-3">
              <Award size={15} className="text-[#FFCC00]" /> Ranking: Postos que Mais Rendem
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#161616] border border-[#FFCC00]/30">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFCC00] text-black font-black text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-white">Posto Ipiranga (Aditivada)</span>
                </div>
                <span className="text-[#FFCC00] font-black">13.0 km/l</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#161616]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#222222] text-[#888888] font-black text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-white">Posto Shell Power</span>
                </div>
                <span className="text-white font-bold">12.2 km/l</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

        {/* ABA 3: MANUTENÇÃO */}
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
            <div>
              <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
                PEÇAS & ÓLEO (ALERTA &lt; 500KM)
              </h3>
            </div>
            <button
              onClick={() => setModalManut(true)}
              className="text-xs font-bold text-[#FFCC00] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Novo Item
            </button>
          </div>

          <div className="space-y-3">
            {store.garagem_manutencao.map((m) => {
              const kmRestante = m.km_proxima - latestKm;
              const isUrgente = kmRestante <= 500;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-[16px] bg-[#111111] border transition-all ${
                    isUrgente ? 'border-[#FFCC00] shadow-[0_0_15px_rgba(255,204,0,0.35)]' : 'border-[#222222]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{m.item}</span>
                      {isUrgente && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FFCC00] text-black animate-pulse">
                          FALTAM &lt; 500 KM!
                        </span>
                      )}
                    </h4>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        kmRestante <= 0
                          ? 'bg-[#FF3B30] text-white'
                          : isUrgente
                          ? 'bg-[#FFCC00] text-black'
                          : 'text-[#00FF88] bg-[#00FF88]/10'
                      }`}
                    >
                      {kmRestante <= 0 ? 'VENCIDA!' : `${kmRestante.toLocaleString('pt-BR')} km restantes`}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-[#888888] pt-2 border-t border-[#222222]">
                    <span>Última troca: {m.km_ultima.toLocaleString('pt-BR')} km</span>
                    <span>Próxima troca: {m.km_proxima.toLocaleString('pt-BR')} km</span>
                  </div>

                  {m.observacao && (
                    <p className="text-[11px] text-[#888888] italic mt-1.5">{m.observacao}</p>
                  )}

                  <button
                    onClick={() => renovarGaragemManutencao(m.id, latestKm)}
                    className="mt-3 w-full h-11 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#FFCC00]/40 text-[#FFCC00] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} /> Registrar Troca Realizada ({latestKm} km)
                  </button>
                </div>
              );
            })}
            </div>
          </motion.div>
        )}

        {/* ABA 4: DOCS VEÍCULO */}
        {activeTab === 'docs' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
          <div className="px-1">
            <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
              DOCUMENTAÇÃO DO VEÍCULO
            </h3>
          </div>

          <div className="space-y-3">
            {store.garagem_docs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-white">{doc.tipo}</h4>
                  <span className="text-xs text-[#888888]">Vencimento: {doc.vencimento}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">
                    R$ {doc.valor.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    doc.status === 'pago' ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-[#FFCC00]/20 text-[#FFCC00]'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* MODAL NOVO ABASTECIMENTO */}
      {modalAbast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Registrar Abastecimento</h3>
            <form onSubmit={handleSalvarAbast} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Km Atual no Painel</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 50400"
                  value={abastKm}
                  onChange={(e) => setAbastKm(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Litros Abastecidos</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="40"
                    value={abastLitros}
                    onChange={(e) => setAbastLitros(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="230.00"
                    value={abastValor}
                    onChange={(e) => setAbastValor(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Posto de Combustível</label>
                <input
                  type="text"
                  required
                  value={abastPosto}
                  onChange={(e) => setAbastPosto(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalAbast(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FFCC00] text-black font-bold text-[16px] glow-garagem"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA MANUTENCAO */}
      {modalManut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Nova Manutenção Veicular</h3>
            <form onSubmit={handleSalvarManut} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Item</label>
                <select
                  value={manutItem}
                  onChange={(e) => setManutItem(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                >
                  <option value="Óleo">Óleo do Motor</option>
                  <option value="Pneu">Pneus / Rodízio</option>
                  <option value="Freio">Pastilhas / Freios</option>
                  <option value="Correia">Correia Dentada</option>
                  <option value="Filtro Ar">Filtro de Ar / Cabine</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Km da Troca</label>
                  <input
                    type="number"
                    placeholder={String(latestKm)}
                    value={manutKmUltima}
                    onChange={(e) => setManutKmUltima(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Próxima Troca (Km)</label>
                  <input
                    type="number"
                    placeholder={String(latestKm + 10000)}
                    value={manutKmProx}
                    onChange={(e) => setManutKmProx(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#FFCC00] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalManut(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#FFCC00] text-black font-bold text-[16px] glow-garagem"
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
