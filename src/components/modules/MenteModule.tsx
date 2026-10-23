/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Brain,
  Search,
  Plus,
  Mic,
  Camera,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Trash2,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenteNota } from '../../types/database';
import { soundFx } from '../../lib/sound';

export const MenteModule: React.FC = () => {
  const {
    store,
    addMenteNota,
    deleteMenteNota,
    converterNotaParaFinance
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalNovo, setModalNovo] = useState(false);
  const [modoEntrada, setModoEntrada] = useState<'texto' | 'voz' | 'link' | 'foto'>('texto');
  const [textoInput, setTextoInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showResumoDomingo, setShowResumoDomingo] = useState(false);

  // Auto-tagging logic
  const detectTags = (text: string) => {
    const tags: string[] = [];
    const lower = text.toLowerCase();
    if (/pagar|boleto|conta|venc|r\$|fatura/i.test(lower)) tags.push('#pagar');
    if (/ideia|app|projeto|criar|startup/i.test(lower)) tags.push('#ideia');
    if (/comprar|mercado|farmacia|loja/i.test(lower)) tags.push('#comprar');
    if (/estudar|ler|livro|curso|artigo/i.test(lower)) tags.push('#estudar');
    return tags;
  };

  // Web Speech Recognition for voice note
  const handleStartVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Digite sua nota.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        soundFx.beep(880, 0.1);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTextoInput(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        soundFx.finishChime();
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSalvarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoInput.trim()) return;

    const tags = detectTags(textoInput);
    const isPagar = tags.includes('#pagar');

    addMenteNota({
      texto: textoInput.trim(),
      tipo: modoEntrada,
      tags: tags.length > 0 ? tags : ['#pensamento'],
      link_url: linkInput || undefined,
      sugestao_finance: isPagar,
      finance_processado: false
    });

    setTextoInput('');
    setLinkInput('');
    setModalNovo(false);
  };

  const filteredNotas = store.mente_notas.filter(n => {
    return n.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-5 pb-32">
      {/* HEADER BRANCO #E5E5E5 */}
      <div className="rounded-[20px] bg-[#111111] border border-[#222222] p-5 glow-mente relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#E5E5E5] uppercase">
              LUME MENTE
            </span>
          </div>
          <button
            onClick={() => setShowResumoDomingo(!showResumoDomingo)}
            className="text-[11px] font-bold text-[#E5E5E5] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Sparkles size={13} /> Resumo Domingo
          </button>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Feed Rápido da Mente
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Estilo WhatsApp cronológico. Detecção inteligente de contas (#pagar), ideias e tarefas.
        </p>

        {/* Busca Total */}
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Buscar pensamentos, links ou tags (#ideia, #pagar)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-white focus:outline-none placeholder:text-[#888888]"
          />
        </div>
      </div>

      {/* RESUMO DO DOMINGO AUTOMÁTICO */}
      {showResumoDomingo && (
        <div className="p-4 rounded-[16px] bg-[#E5E5E5] text-black border border-white glow-mente shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> Resumo Semanal da Mente (Compilação de Domingo)
            </h4>
            <button onClick={() => setShowResumoDomingo(false)} className="text-black/60 hover:text-black">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs font-medium text-black/80 mb-3">
            Você registrou {store.mente_notas.length} pensamentos esta semana.
          </p>
          <div className="space-y-1.5 text-xs text-black/90">
            <div className="flex justify-between border-b border-black/10 pb-1">
              <span>Ideias de Negócio / Projetos:</span>
              <span className="font-bold">{store.mente_notas.filter(n => n.tags.includes('#ideia')).length}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-1">
              <span>Lembretes Financeiros (#pagar):</span>
              <span className="font-bold">{store.mente_notas.filter(n => n.tags.includes('#pagar')).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Compras e Estudos:</span>
              <span className="font-bold">
                {store.mente_notas.filter(n => n.tags.includes('#comprar') || n.tags.includes('#estudar')).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FEED ESTILO WHATSAPP CRONOLÓGICO */}
      {/* Cards Brancos #E5E5E5 com texto preto #000 */}
      <div className="space-y-3">
        {filteredNotas.map((nota) => {
          const date = new Date(nota.created_at);
          const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={nota.id}
              className="p-4 rounded-[18px] bg-[#E5E5E5] text-black shadow-lg glow-mente transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-wrap gap-1">
                  {nota.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/10 text-black border border-black/15"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-black/60">
                  <Clock size={11} />
                  <span>{timeFormatted}</span>
                  <button
                    onClick={() => deleteMenteNota(nota.id)}
                    className="p-1 text-black/40 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Texto principal da nota */}
              <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                {nota.texto}
              </p>

              {nota.link_url && (
                <a
                  href={nota.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-bold text-blue-800 underline block"
                >
                  🔗 {nota.link_url}
                </a>
              )}

              {/* BOTÃO AÇÃO: "CRIAR LEMBRETE NO FINANCE?" SE DETECTAR "PAGAR" */}
              {nota.sugestao_finance && !nota.finance_processado && (
                <div className="mt-3 pt-2.5 border-t border-black/15 flex items-center justify-between">
                  <span className="text-[11px] font-black text-black/70">
                    Conta / Pagamento detectado!
                  </span>
                  <button
                    onClick={() => converterNotaParaFinance(nota.id)}
                    className="px-3 py-1.5 rounded-[8px] bg-black text-[#00FF88] text-xs font-black flex items-center gap-1.5 glow-finance active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Criar lembrete no Finance?</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {nota.finance_processado && (
                <div className="mt-2 text-[11px] font-bold text-[#008844] flex items-center gap-1">
                  <CheckCircle2 size={13} /> Já enviado para o Finance
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTÃO FLUTUANTE + GIGANTE BRANCO COM OPÇÕES */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setModalNovo(true)}
          className="w-14 h-14 rounded-full bg-white text-black font-black flex items-center justify-center shadow-2xl glow-mente active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={28} className="stroke-[3]" />
        </button>
      </div>

      {/* MODAL NOVO REGISTRO NA MENTE */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#111111] border border-[#222222] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-white">+ Capturar Ideia</h3>
              <button onClick={() => setModalNovo(false)} className="text-[#888888] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Selector de tipo: Texto / Voz / Link / Foto */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#1A1A1A] rounded-[12px] border border-[#222222] mb-3">
              <button
                type="button"
                onClick={() => setModoEntrada('texto')}
                className={`py-1.5 text-xs font-bold rounded-[8px] ${modoEntrada === 'texto' ? 'bg-white text-black' : 'text-[#888888]'}`}
              >
                Texto
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoEntrada('voz');
                  handleStartVoice();
                }}
                className={`py-1.5 text-xs font-bold rounded-[8px] flex items-center justify-center gap-1 ${modoEntrada === 'voz' ? 'bg-white text-black' : 'text-[#888888]'}`}
              >
                <Mic size={12} /> Voz
              </button>
              <button
                type="button"
                onClick={() => setModoEntrada('link')}
                className={`py-1.5 text-xs font-bold rounded-[8px] ${modoEntrada === 'link' ? 'bg-white text-black' : 'text-[#888888]'}`}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => setModoEntrada('foto')}
                className={`py-1.5 text-xs font-bold rounded-[8px] ${modoEntrada === 'foto' ? 'bg-white text-black' : 'text-[#888888]'}`}
              >
                Foto
              </button>
            </div>

            <form onSubmit={handleSalvarNota} className="space-y-3">
              {modoEntrada === 'link' && (
                <div>
                  <label className="text-[10px] font-bold text-[#888888] uppercase block mb-1">URL / Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-xs focus:border-white focus:outline-none"
                  />
                </div>
              )}

              {modoEntrada === 'voz' && (
                <div className="text-center p-3 rounded-[12px] bg-[#1A1A1A] border border-white/20 mb-2">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-1 ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white/10 text-white'}`}>
                    <Mic size={22} />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {isRecording ? 'Escutando e transcrevendo...' : 'Toque no microfone para falar'}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-[#888888] uppercase block mb-1">
                  Nota / Pensamento
                </label>
                <textarea
                  required
                  placeholder="Escreva qualquer coisa... Ex: Pagar boleto da internet R$ 149 ou Ideia nova..."
                  value={textoInput}
                  onChange={(e) => setTextoInput(e.target.value)}
                  className="w-full h-28 p-3 rounded-[12px] bg-[#1A1A1A] border border-[#222222] text-white text-sm focus:border-white focus:outline-none resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="flex-1 h-[52px] rounded-[12px] bg-[#1A1A1A] text-[#888888] font-bold text-[15px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[52px] rounded-[12px] bg-white text-black font-bold text-[16px] glow-mente"
                >
                  Publicar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
