/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CorpoBibliotecaTreino,
  CorpoBibliotecaExercicio,
  FinanceGuardado,
  FinanceInvestimento,
  FinanceDivida,
  CasaConta,
  CasaDespensa,
  CasaManutencao,
  GaragemManutencao,
  GaragemDocs,
  CorpoRemedio,
  UserConfig,
  DocsCofre,
  MenteNota
} from '../types/database';

export const DEFAULT_CONFIG: UserConfig = {
  userName: 'Rick Costa',
  hourlyRate: 65, // R$ 65/h default
  dailyWaterGoal: 3000, // 3000ml
  weeklyWorkoutGoal: 5,
  whatsappNumber: '+5511999999999',
  supabaseUrl: '',
  supabaseAnonKey: '',
  lastSyncedAt: undefined,
};

export const INITIAL_EXERCICIOS: CorpoBibliotecaExercicio[] = [
  // Peito
  { id: 'ex-1', nome: 'Supino Reto com Barra', grupo_muscular: 'peito', series_sugeridas: 4, reps_sugeridas: '8-10', carga_padrao_kg: 60, instrucoes: 'Desça até tocar levemente no peito e empurre com controle.' },
  { id: 'ex-2', nome: 'Supino Inclinado com Halteres', grupo_muscular: 'peito', series_sugeridas: 4, reps_sugeridas: '10-12', carga_padrao_kg: 24, instrucoes: 'Foco na porção clavicular do peitoral.' },
  { id: 'ex-3', nome: 'Crucifixo no Crossover', grupo_muscular: 'peito', series_sugeridas: 3, reps_sugeridas: '12-15', carga_padrao_kg: 15, instrucoes: 'Alongamento máximo sem hiperestender o ombro.' },
  { id: 'ex-4', nome: 'Flexão de Braço no Solo', grupo_muscular: 'peito', series_sugeridas: 3, reps_sugeridas: 'Até a falha', carga_padrao_kg: 0, instrucoes: 'Corpo reto, ativação total do core.' },

  // Costas
  { id: 'ex-5', nome: 'Puxada Alta na Frente', grupo_muscular: 'costas', series_sugeridas: 4, reps_sugeridas: '10-12', carga_padrao_kg: 55, instrucoes: 'Puxe direcionando os cotovelos para baixo e contraia as escápulas.' },
  { id: 'ex-6', nome: 'Remada Curvada com Barra', grupo_muscular: 'costas', series_sugeridas: 4, reps_sugeridas: '8-10', carga_padrao_kg: 50, instrucoes: 'Tronco inclinado a 45°, coluna neutra.' },
  { id: 'ex-7', nome: 'Remada Baixa Triângulo', grupo_muscular: 'costas', series_sugeridas: 3, reps_sugeridas: '12', carga_padrao_kg: 45, instrucoes: 'Aperto completo das escápulas ao final da puxada.' },

  // Pernas
  { id: 'ex-8', nome: 'Agachamento Livre', grupo_muscular: 'pernas', series_sugeridas: 4, reps_sugeridas: '8-10', carga_padrao_kg: 70, instrucoes: 'Quadril abaixo do joelho, calcanhares firmes no chão.' },
  { id: 'ex-9', nome: 'Leg Press 45°', grupo_muscular: 'pernas', series_sugeridas: 4, reps_sugeridas: '10-12', carga_padrao_kg: 160, instrucoes: 'Amplitude completa sem estalar o joelho na volta.' },
  { id: 'ex-10', nome: 'Cadeira Extensora', grupo_muscular: 'pernas', series_sugeridas: 3, reps_sugeridas: '12-15', carga_padrao_kg: 45, instrucoes: 'Pico de contração de 1 segundo no topo.' },
  { id: 'ex-11', nome: 'Mesa Flexora', grupo_muscular: 'pernas', series_sugeridas: 4, reps_sugeridas: '12', carga_padrao_kg: 40, instrucoes: 'Foco nos isquiotibiais.' },
  { id: 'ex-12', nome: 'Elevação Pélvica', grupo_muscular: 'pernas', series_sugeridas: 4, reps_sugeridas: '12', carga_padrao_kg: 50, instrucoes: 'Contração forte de glúteos.' },

  // Ombros
  { id: 'ex-13', nome: 'Desenvolvimento Militar com Halteres', grupo_muscular: 'ombros', series_sugeridas: 4, reps_sugeridas: '10-12', carga_padrao_kg: 20, instrucoes: 'Eleve acima da cabeça sem arquear a lombar.' },
  { id: 'ex-14', nome: 'Elevação Lateral com Halteres', grupo_muscular: 'ombros', series_sugeridas: 4, reps_sugeridas: '12-15', carga_padrao_kg: 12, instrucoes: 'Cotovelos ligeiramente flexionados, altura dos ombros.' },

  // Braços
  { id: 'ex-15', nome: 'Rosca Direta com Barra W', grupo_muscular: 'biceps', series_sugeridas: 4, reps_sugeridas: '10-12', carga_padrao_kg: 25, instrucoes: 'Cotovelos fixos ao lado do corpo.' },
  { id: 'ex-16', nome: 'Tríceps Corda na Polia', grupo_muscular: 'triceps', series_sugeridas: 4, reps_sugeridas: '12-15', carga_padrao_kg: 25, instrucoes: 'Abra a corda no ponto mais baixo.' },

  // HIIT / Sem Equipamento
  { id: 'ex-17', nome: 'Burpees Explosivos', grupo_muscular: 'cardio', series_sugeridas: 4, reps_sugeridas: '45 seg', carga_padrao_kg: 0, instrucoes: 'Peito no chão, salto vertical no retorno.' },
  { id: 'ex-18', nome: 'Polichinelos em Ritmo Acelerado', grupo_muscular: 'cardio', series_sugeridas: 4, reps_sugeridas: '45 seg', carga_padrao_kg: 0, instrucoes: 'Coordenação e ritmo contínuo.' },
  { id: 'ex-19', nome: 'Mountain Climbers (Alpinista)', grupo_muscular: 'abdomen', series_sugeridas: 4, reps_sugeridas: '45 seg', carga_padrao_kg: 0, instrucoes: 'Joelhos rápidos em direção ao peito.' },
  { id: 'ex-20', nome: 'Agachamento com Salto', grupo_muscular: 'pernas', series_sugeridas: 4, reps_sugeridas: '40 seg', carga_padrao_kg: 0, instrucoes: 'Amorteça a queda suavemente.' },
];

export const INITIAL_BIBLIOTECA_TREINOS: CorpoBibliotecaTreino[] = [
  {
    id: 'tr-peito',
    nome: 'Peito & Tríceps Hipertrofia',
    descricao: 'Foco em espessura e densidade de peito com finalização de tríceps.',
    categoria: 'musculacao',
    duracao_estimada_min: 45,
    exercicios_ids: ['ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-16']
  },
  {
    id: 'tr-costas',
    nome: 'Costas & Bíceps Largura',
    descricao: 'Desenvolvimento dorsal completo com puxadas e remadas pesadas.',
    categoria: 'musculacao',
    duracao_estimada_min: 50,
    exercicios_ids: ['ex-5', 'ex-6', 'ex-7', 'ex-15']
  },
  {
    id: 'tr-perna',
    nome: 'Perna Completa Brutal',
    descricao: 'Quadríceps, posteriores e glúteos com agachamento pesado.',
    categoria: 'musculacao',
    duracao_estimada_min: 55,
    exercicios_ids: ['ex-8', 'ex-9', 'ex-10', 'ex-11', 'ex-12']
  },
  {
    id: 'tr-ombro',
    nome: 'Ombro Blindado & Trapézio',
    descricao: 'Desenvolvimento tridimensional deltoide lateral e frontal.',
    categoria: 'musculacao',
    duracao_estimada_min: 40,
    exercicios_ids: ['ex-13', 'ex-14']
  },
  {
    id: 'tr-braco',
    nome: 'Braço Completo (Bíceps + Tríceps)',
    descricao: 'Super pump com bi-sets de rosca e extensões de tríceps.',
    categoria: 'musculacao',
    duracao_estimada_min: 40,
    exercicios_ids: ['ex-15', 'ex-16']
  },
  {
    id: 'tr-fullbody',
    nome: 'Full Body Funcional',
    descricao: 'Ativação corporal completa para dias corridos.',
    categoria: 'funcional',
    duracao_estimada_min: 45,
    exercicios_ids: ['ex-8', 'ex-1', 'ex-5', 'ex-13']
  },
  {
    id: 'tr-hiit',
    nome: 'HIIT 15min Sem Equipamento',
    descricao: 'Queima máxima e aceleração metabólica em qualquer lugar.',
    categoria: 'hiit',
    duracao_estimada_min: 15,
    exercicios_ids: ['ex-17', 'ex-18', 'ex-19', 'ex-20']
  }
];

export const INITIAL_GUARDADO: FinanceGuardado[] = [
  {
    id: 'g-reserva',
    titulo: 'Reserva de Emergência',
    meta_valor: 30000,
    valor_atual: 18500,
    categoria: 'reserva',
    historico: [
      { id: 'h-1', tipo: 'deposito', valor: 1500, data: '2026-10-15', descricao: 'Aporte mensal planejado' },
      { id: 'h-2', tipo: 'deposito', valor: 2000, data: '2026-09-20', descricao: 'Renda extra vendas' }
    ],
    created_at: '2026-01-01'
  },
  {
    id: 'g-viagem',
    titulo: 'Viagem Japão & Ásia',
    meta_valor: 25000,
    valor_atual: 12200,
    categoria: 'viagem',
    historico: [
      { id: 'h-3', tipo: 'deposito', valor: 800, data: '2026-10-10', descricao: 'Economia combustível' }
    ],
    created_at: '2026-02-10'
  },
  {
    id: 'g-carro',
    titulo: 'Upgrade Garagem',
    meta_valor: 50000,
    valor_atual: 9400,
    categoria: 'carro',
    historico: [],
    created_at: '2026-03-01'
  }
];

export const INITIAL_INVESTIMENTOS: FinanceInvestimento[] = [
  {
    id: 'inv-1',
    nome: 'Tesouro IPCA+ 2035',
    codigo: 'TD-IPCA35',
    tipo: 'fixa',
    valor_inicial: 15000,
    valor_atual: 17850,
    dividendos_recebidos: 0,
    melhor_mes: '+1.4% (Ago/26)',
    pior_mes: '+0.7% (Mar/26)',
    created_at: '2025-06-01'
  },
  {
    id: 'inv-2',
    nome: 'Carteira Ações Dividendos',
    codigo: 'BBAS3 / TAEE11',
    tipo: 'acoes',
    valor_inicial: 22000,
    valor_atual: 26400,
    dividendos_recebidos: 1840,
    melhor_mes: '+4.8% (Jul/26)',
    pior_mes: '-2.1% (Jan/26)',
    created_at: '2025-04-12'
  },
  {
    id: 'inv-3',
    nome: 'Bitcoin & Ethereum',
    codigo: 'BTC/ETH',
    tipo: 'cripto',
    valor_inicial: 8000,
    valor_atual: 14200,
    dividendos_recebidos: 0,
    melhor_mes: '+18.5% (Set/26)',
    pior_mes: '-8.2% (Mai/26)',
    created_at: '2025-01-10'
  },
  {
    id: 'inv-4',
    nome: 'Fundos Imobiliários',
    codigo: 'HGLG11 / XPML11',
    tipo: 'fiis',
    valor_inicial: 12000,
    valor_atual: 13100,
    dividendos_recebidos: 1120,
    melhor_mes: '+1.8% (Fev/26)',
    pior_mes: '-0.3% (Jun/26)',
    created_at: '2025-07-01'
  }
];

export const INITIAL_DIVIDAS: FinanceDivida[] = [
  {
    id: 'div-1',
    nome: 'Cartão Black Corporativo',
    tipo: 'cartao',
    valor_total: 3850,
    valor_parcela: 3850,
    parcelas_total: 1,
    parcelas_pagas: 0,
    dia_vencimento: 25,
    proximo_vencimento: '2026-10-25',
    status: 'em_dia',
    created_at: '2026-10-01'
  },
  {
    id: 'div-2',
    nome: 'Financiamento Imóvel Studio',
    tipo: 'financiamento',
    valor_total: 144000,
    valor_parcela: 1200,
    parcelas_total: 120,
    parcelas_pagas: 24,
    dia_vencimento: 10,
    proximo_vencimento: '2026-11-10',
    status: 'em_dia',
    created_at: '2024-10-10'
  }
];

export const INITIAL_CASA_CONTAS: CasaConta[] = [
  {
    id: 'cc-1',
    nome: 'Energia Elétrica (Enel)',
    categoria: 'luz',
    valor: 285.40,
    vencimento: '2026-10-23', // Vence hoje!
    status: 'pendente',
    recorrente_mensal: true,
    created_at: '2026-10-01'
  },
  {
    id: 'cc-2',
    nome: 'Internet Fibra 1Gbps',
    categoria: 'internet',
    valor: 149.90,
    vencimento: '2026-10-28',
    status: 'pendente',
    recorrente_mensal: true,
    created_at: '2026-10-01'
  },
  {
    id: 'cc-3',
    nome: 'Condomínio Residencial',
    categoria: 'condominio',
    valor: 620.00,
    vencimento: '2026-11-05',
    status: 'pendente',
    recorrente_mensal: true,
    created_at: '2026-10-01'
  }
];

export const INITIAL_CASA_DESPENSA: CasaDespensa[] = [
  {
    id: 'cd-1',
    item: 'Iogurte Grego Proteico',
    quantidade: 4,
    unidade: 'potes',
    validade: '2026-10-23', // Vence hoje -> fundo #FF3B30
    local: 'geladeira',
    created_at: '2026-10-18'
  },
  {
    id: 'cd-2',
    item: 'Queijo Cottage 400g',
    quantidade: 1,
    unidade: 'pote',
    validade: '2026-10-24', // Vence amanhã -> fundo #FF8A26
    local: 'geladeira',
    created_at: '2026-10-15'
  },
  {
    id: 'cd-3',
    item: 'Whey Protein Isolado',
    quantidade: 1,
    unidade: 'pote 900g',
    validade: '2027-02-15',
    local: 'armario',
    created_at: '2026-09-01'
  },
  {
    id: 'cd-4',
    item: 'Café Grãos Especiais',
    quantidade: 2,
    unidade: 'pacotes 500g',
    validade: '2026-12-30',
    local: 'armario',
    created_at: '2026-10-05'
  }
];

export const INITIAL_CASA_MANUTENCAO: CasaManutencao[] = [
  {
    id: 'cm-1',
    nome: 'Troca do Botijão de Gás P13',
    intervalo_dias: 90,
    ultima_troca: '2026-07-28',
    proxima_troca: '2026-10-26', // Vence em 3 dias!
    observacao: 'Verificar mangueira com registro de validade.',
    created_at: '2026-07-28'
  },
  {
    id: 'cm-2',
    nome: 'Filtro Refil Purificador de Água',
    intervalo_dias: 180,
    ultima_troca: '2026-06-10',
    proxima_troca: '2026-12-07',
    observacao: 'Filtro classe A retenção de cloro.',
    created_at: '2026-06-10'
  },
  {
    id: 'cm-3',
    nome: 'Higienização Ar-Condicionado',
    intervalo_dias: 120,
    ultima_troca: '2026-09-01',
    proxima_troca: '2026-12-30',
    observacao: 'Limpeza de serpentina e filtros.',
    created_at: '2026-09-01'
  }
];

export const INITIAL_GARAGEM_MANUTENCAO: GaragemManutencao[] = [
  {
    id: 'gm-1',
    item: 'Óleo',
    km_ultima: 42000,
    km_proxima: 52000,
    data_ultima: '2026-06-15',
    observacao: 'Sintético 5W30 com filtro de óleo trocado.',
    created_at: '2026-06-15'
  },
  {
    id: 'gm-2',
    item: 'Freio',
    km_ultima: 35000,
    km_proxima: 50000,
    data_ultima: '2026-01-20',
    observacao: 'Pastilhas cerâmicas e fluído DOT 4.',
    created_at: '2026-01-20'
  },
  {
    id: 'gm-3',
    item: 'Pneu',
    km_ultima: 40000,
    km_proxima: 50400, // Faltam 400km se km atual for 50.000 -> alerta amarelo!
    data_ultima: '2026-05-10',
    observacao: 'Rodízio, alinhamento 3D e balanceamento.',
    created_at: '2026-05-10'
  },
  {
    id: 'gm-4',
    item: 'Correia',
    km_ultima: 10000,
    km_proxima: 60000,
    data_ultima: '2024-03-12',
    observacao: 'Correia dentada e tensor.',
    created_at: '2024-03-12'
  }
];

export const INITIAL_GARAGEM_DOCS: GaragemDocs[] = [
  {
    id: 'gd-1',
    tipo: 'IPVA',
    valor: 1850,
    vencimento: '2027-01-20',
    status: 'pendente',
    created_at: '2026-10-01'
  },
  {
    id: 'gd-2',
    tipo: 'Licenciamento',
    valor: 160,
    vencimento: '2026-11-30',
    status: 'pendente',
    created_at: '2026-10-01'
  },
  {
    id: 'gd-3',
    tipo: 'Seguro',
    valor: 2400,
    vencimento: '2027-03-15',
    status: 'pago',
    created_at: '2026-03-15'
  }
];

export const INITIAL_REMEDIOS: CorpoRemedio[] = [
  {
    id: 'rem-1',
    nome: 'Vitamina D3 5000UI + K2',
    horario: '08:00',
    dose: '1 cápsula após o café',
    tomado_hoje: false, // Se passar das 08:00, fica vermelho pulsante!
    created_at: '2026-01-01'
  },
  {
    id: 'rem-2',
    nome: 'Creatina Monohidratada Creapure',
    horario: '12:30',
    dose: '5 gramas com água',
    tomado_hoje: true,
    ultimo_tomado_data: '2026-10-23',
    created_at: '2026-01-01'
  },
  {
    id: 'rem-3',
    nome: 'Magnésio Quelato',
    horario: '21:30',
    dose: '400mg antes de deitar',
    tomado_hoje: false,
    created_at: '2026-01-01'
  }
];

export const INITIAL_DOCS: DocsCofre[] = [
  {
    id: 'doc-1',
    titulo: 'CNH Digital Rick Costa',
    categoria: 'Pessoal',
    vencimento: '2028-06-15',
    numero_documento: '04829103920',
    notas: 'Categoria B, QR Code autenticado pelo Detran.',
    created_at: '2026-01-15'
  },
  {
    id: 'doc-2',
    titulo: 'CRLV Veículo Honda Civic',
    categoria: 'Carro',
    vencimento: '2026-11-30',
    numero_documento: '98401928301',
    notas: 'Licenciamento digital 2026 em vigor.',
    created_at: '2026-02-01'
  },
  {
    id: 'doc-3',
    titulo: 'Contrato de Locação Residencial',
    categoria: 'Casa',
    vencimento: '2027-04-01',
    numero_documento: 'CTR-2024-89',
    notas: 'Reajuste anual pelo IPCA em Maio.',
    created_at: '2024-04-01'
  }
];

export const INITIAL_NOTAS: MenteNota[] = [
  {
    id: 'not-1',
    texto: 'Pagar boleto da Enel Luz até às 17h para evitar juros #pagar #casa',
    tipo: 'texto',
    tags: ['#pagar', '#casa'],
    sugestao_finance: true,
    finance_processado: false,
    created_at: '2026-10-23T10:15:00Z'
  },
  {
    id: 'not-2',
    texto: 'Ideia para o app: criar integração com bot no Telegram que lê notas de voz e transcreve direto pro Lume Mente #ideia #lume',
    tipo: 'texto',
    tags: ['#ideia', '#lume'],
    sugestao_finance: false,
    created_at: '2026-10-22T19:40:00Z'
  },
  {
    id: 'not-3',
    texto: 'Comprar café em grãos torra fresca na cafeteria do centro #comprar',
    tipo: 'texto',
    tags: ['#comprar'],
    sugestao_finance: false,
    created_at: '2026-10-21T14:20:00Z'
  }
];
