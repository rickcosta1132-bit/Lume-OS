/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Share2,
  AlertCircle,
  Calendar,
  Lock,
  User,
  Car,
  Home,
  Briefcase,
  Activity,
  Send,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocsCofre } from '../../types/database';
import { soundFx } from '../../lib/sound';

export const DocsModule: React.FC = () => {
  const { store, addDocCofre, deleteDocCofre } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [selectedDoc, setSelectedDoc] = useState<DocsCofre | null>(null);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [modalNovoDoc, setModalNovoDoc] = useState(false);

  // Form states
  const [docTitulo, setDocTitulo] = useState('');
  const [docCat, setDocCat] = useState<DocsCofre['categoria']>('Pessoal');
  const [docVenc, setDocVenc] = useState('');
  const [docNumero, setDocNumero] = useState('');
  const [docNotas, setDocNotas] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const getCategoryIcon = (cat: DocsCofre['categoria']) => {
    switch (cat) {
      case 'Pessoal': return User;
      case 'Carro':
      case 'Moto': return Car;
      case 'Casa': return Home;
      case 'Trabalho': return Briefcase;
      case 'Saude': return Activity;
      default: return FileText;
    }
  };

  const filteredDocs = store.docs_cofre.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.numero_documento && doc.numero_documento.includes(searchTerm));
    const matchesCat = categoriaFiltro === 'todos' || doc.categoria === categoriaFiltro;
    return matchesSearch && matchesCat;
  });

  const getAlertStatus = (venc?: string) => {
    if (!venc) return null;
    const diffDays = Math.ceil((new Date(venc).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return { label: 'VENCIDO!', color: '#FF3B30' };
    if (diffDays <= 3) return { label: `Vence em ${diffDays} dias!`, color: '#FF3B30' };
    if (diffDays <= 15) return { label: `Vence em ${diffDays} dias`, color: '#FF8A26' };
    if (diffDays <= 30) return { label: `Vence em ${diffDays} dias`, color: '#38BDF8' };
    return { label: `Válido (${diffDays}d)`, color: '#00FF88' };
  };

  const handleWhatsAppAlert = (doc: DocsCofre) => {
    const alert = getAlertStatus(doc.vencimento);
    const text = `🔔 *LUME OS - ALERTA DE DOCUMENTO*\n\nDocumento: *${doc.titulo}*\nCategoria: ${doc.categoria}\nVencimento: ${doc.vencimento || 'Não expira'}\nStatus: ${alert?.label || 'Em dia'}\n\n_Cofre Digital Lume OS_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSalvarDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitulo) return;
    addDocCofre({
      titulo: docTitulo,
      categoria: docCat,
      vencimento: docVenc || undefined,
      numero_documento: docNumero || undefined,
      notas: docNotas || undefined
    });
    setDocTitulo('');
    setDocNumero('');
    setDocNotas('');
    setModalNovoDoc(false);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* HEADER AZUL #38BDF8 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-docs relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#38BDF8] uppercase">
              LUME DOCS
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#888888] flex items-center gap-1">
            <Lock size={12} className="text-[#38BDF8]" /> Cofre Seguro
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Cofre Digital com Marca d'Água
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Armazenamento confidencial de CNH, CRLV, contratos e alertas de vencimento (30, 15 e 3 dias).
        </p>

        {/* Busca Instantânea */}
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Buscar por nome ou número do documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#38BDF8] focus:outline-none placeholder:text-[#888888]"
          />
        </div>
      </div>

      {/* Categorias Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['todos', 'Pessoal', 'Carro', 'Moto', 'Casa', 'Trabalho', 'Saude'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
              categoriaFiltro === cat
                ? 'bg-[#38BDF8] text-black border-[#38BDF8]'
                : 'bg-[#111111] text-[#888888] border-[#222222] hover:text-white'
            }`}
          >
            {cat === 'todos' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Grade de Cards com Ícones por Categoria */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black tracking-widest text-[#888888] uppercase">
            SEUS DOCUMENTOS ({filteredDocs.length})
          </h3>
          <button
            onClick={() => setModalNovoDoc(true)}
            className="text-xs font-bold text-[#38BDF8] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus size={14} /> Novo Doc
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredDocs.map((doc) => {
            const Icon = getCategoryIcon(doc.categoria);
            const alert = getAlertStatus(doc.vencimento);

            return (
              <div
                key={doc.id}
                className="p-4 rounded-[16px] bg-[#111111] border border-[#222222] hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[12px] bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{doc.titulo}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#888888]">
                        <span className="font-bold">{doc.categoria}</span>
                        {doc.numero_documento && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{doc.numero_documento}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {alert && (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded border"
                      style={{
                        color: alert.color,
                        borderColor: `${alert.color}50`,
                        backgroundColor: `${alert.color}15`
                      }}
                    >
                      {alert.label}
                    </span>
                  )}
                </div>

                {doc.notas && (
                  <p className="text-xs text-[#888888] my-2 bg-[#161616] p-2 rounded-[8px]">
                    {doc.notas}
                  </p>
                )}

                {/* Actions: Ver com Marca d'Água & WhatsApp */}
                <div className="flex gap-2 pt-3 mt-1 border-t border-[#222222]">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowWatermarkModal(true);
                      soundFx.beep(600, 0.1);
                    }}
                    className="flex-1 h-10 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 size={13} /> Compartilhar com Marca d'Água
                  </button>
                  <button
                    onClick={() => handleWhatsAppAlert(doc)}
                    title="Alerta WhatsApp 30/15/3 dias"
                    className="w-10 h-10 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#222222] text-[#25D366] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                  <button
                    onClick={() => deleteDocCofre(doc.id)}
                    className="w-10 h-10 rounded-[10px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#222222] text-[#888888] hover:text-[#FF3B30] flex items-center justify-center"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL COMPARTILHAR COM MARCA D'ÁGUA */}
      {showWatermarkModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-5 shadow-2xl relative">
            <button
              onClick={() => setShowWatermarkModal(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <Lock size={18} className="text-[#38BDF8]" /> Visualização Protegida
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Marca d'água de proteção contra uso indevido aplicada automaticamente.
            </p>

            {/* Simulated protected document container with watermark */}
            <div className="relative rounded-[16px] bg-[#1A1A1A] border-2 border-dashed border-[#38BDF8]/40 p-6 text-center overflow-hidden">
              {/* WATERMARK OVERLAY */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-25deg] select-none">
                <span className="text-2xl font-black text-white/10 uppercase tracking-widest whitespace-nowrap">
                  CONFIDENCIAL • LUME OS • EXCLUSIVO
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] uppercase">
                  {selectedDoc.categoria}
                </span>
                <h4 className="text-xl font-black text-white">{selectedDoc.titulo}</h4>
                {selectedDoc.numero_documento && (
                  <p className="text-sm font-mono text-[#888888]">
                    DOC: {selectedDoc.numero_documento}
                  </p>
                )}
                {selectedDoc.vencimento && (
                  <p className="text-xs text-[#888888]">
                    Vencimento: {selectedDoc.vencimento}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.success();
                alert('Documento seguro compartilhado com sucesso!');
                setShowWatermarkModal(false);
              }}
              className="mt-4 w-full h-[52px] rounded-[12px] bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-black font-bold text-[16px] glow-docs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={18} />
              <span>Exportar com Marca d'Água</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL NOVO DOC */}
      {modalNovoDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Novo Documento Seguro</h3>
            <form onSubmit={handleSalvarDoc} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CNH Digital, Passaporte, CRLV..."
                  value={docTitulo}
                  onChange={(e) => setDocTitulo(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#38BDF8] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Categoria</label>
                  <select
                    value={docCat}
                    onChange={(e) => setDocCat(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#38BDF8] focus:outline-none"
                  >
                    <option value="Pessoal">Pessoal</option>
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Saude">Saúde</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={docVenc}
                    onChange={(e) => setDocVenc(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#888888] uppercase block mb-1">Número / Registro</label>
                <input
                  type="text"
                  placeholder="Ex: 04829103920"
                  value={docNumero}
                  onChange={(e) => setDocNumero(e.target.value)}
                  className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-[#38BDF8] focus:outline-none font-mono"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoDoc(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-[#38BDF8] text-black font-bold text-[16px] glow-docs"
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
