/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModuleType = 'inicio' | 'finance' | 'casa' | 'corpo' | 'tempo' | 'garagem' | 'docs' | 'mente' | 'config';

export interface UserConfig {
  userName: string;
  hourlyRate: number; // R$/h for Tempo module
  dailyWaterGoal: number; // ml
  weeklyWorkoutGoal: number; // workouts count
  whatsappNumber: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  lastSyncedAt?: string;
}

// 1. finance_guardado (Metas / Reserva de Emergência)
export interface FinanceGuardado {
  id: string;
  titulo: string;
  meta_valor: number;
  valor_atual: number;
  categoria: 'reserva' | 'viagem' | 'carro' | 'casa' | 'outro';
  historico?: Array<{ id: string; tipo: 'deposito' | 'saque'; valor: number; data: string; descricao?: string }>;
  created_at: string;
}

// 2. finance_investimentos
export interface FinanceInvestimento {
  id: string;
  nome: string;
  codigo?: string; // ex: PETR4, BTC, Tesouro Selic
  tipo: 'fixa' | 'acoes' | 'cripto' | 'fiis';
  valor_inicial: number;
  valor_atual: number;
  dividendos_recebidos: number;
  melhor_mes?: string;
  pior_mes?: string;
  created_at: string;
}

// 3. finance_dividas
export interface FinanceDivida {
  id: string;
  nome: string; // ex: Cartão Nubank, Financiamento Carro, Aluguel
  tipo: 'cartao' | 'financiamento' | 'aluguel' | 'emprestimo' | 'outro';
  valor_total: number;
  valor_parcela: number;
  parcelas_total: number;
  parcelas_pagas: number;
  dia_vencimento: number; // 1-31
  proximo_vencimento: string; // YYYY-MM-DD
  status: 'em_dia' | 'atrasado' | 'quitado';
  created_at: string;
}

// 4. finance_parcelas
export interface FinanceParcela {
  id: string;
  divida_id: string;
  numero_parcela: number;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  status: 'paga' | 'pendente' | 'atrasada';
  pago_em?: string;
  juros_multa?: number;
  created_at: string;
}

// 5. casa_contas
export interface CasaConta {
  id: string;
  nome: string; // Luz, Água, Internet, Aluguel, Gás
  categoria: 'luz' | 'agua' | 'internet' | 'aluguel' | 'gas' | 'condominio' | 'outros';
  valor: number;
  vencimento: string; // YYYY-MM-DD
  status: 'pendente' | 'pago' | 'atrasado';
  foto_comprovante?: string;
  recorrente_mensal: boolean;
  created_at: string;
}

// 6. casa_despensa
export interface CasaDespensa {
  id: string;
  item: string;
  quantidade: number;
  unidade: string; // un, kg, g, L, pacote
  validade: string; // YYYY-MM-DD
  local: 'geladeira' | 'armario' | 'freezer';
  created_at: string;
}

// 7. casa_compras
export interface CasaCompra {
  id: string;
  item: string;
  quantidade: number;
  unidade: string;
  comprado: boolean;
  urgencia: 'alta' | 'media' | 'baixa';
  origem_despensa: boolean;
  created_at: string;
}

// 8. casa_manutencao
export interface CasaManutencao {
  id: string;
  nome: string; // Gás, Filtro, Caixa d'água, Ar condicionado
  intervalo_dias: number; // ex: 90 dias
  ultima_troca: string; // YYYY-MM-DD
  proxima_troca: string; // YYYY-MM-DD
  observacao?: string;
  created_at: string;
}

// 9. docs_cofre
export interface DocsCofre {
  id: string;
  titulo: string;
  categoria: 'Pessoal' | 'Moto' | 'Carro' | 'Casa' | 'Trabalho' | 'Saude';
  vencimento?: string; // YYYY-MM-DD
  foto_frente?: string;
  foto_verso?: string;
  pdf_url?: string;
  numero_documento?: string;
  notas?: string;
  created_at: string;
}

// 10. corpo_biblioteca_treinos
export interface CorpoBibliotecaTreino {
  id: string;
  nome: string; // Peito, Costas, Perna, Ombro, Braço, Full Body, HIIT 15min Sem Equip
  descricao: string;
  categoria: 'musculacao' | 'hiit' | 'funcional';
  duracao_estimada_min: number;
  exercicios_ids: string[];
}

// 11. corpo_biblioteca_exercicios
export interface CorpoBibliotecaExercicio {
  id: string;
  nome: string;
  grupo_muscular: 'peito' | 'costas' | 'pernas' | 'ombros' | 'biceps' | 'triceps' | 'abdomen' | 'cardio';
  series_sugeridas: number;
  reps_sugeridas: string;
  instrucoes?: string;
  carga_padrao_kg?: number;
}

// 12. corpo_meus_treinos
export interface CorpoMeuTreino {
  id: string;
  nome: string;
  dia_semana?: string;
  ativo: boolean;
  created_at: string;
}

// 13. corpo_treino_exercicios
export interface CorpoTreinoExercicio {
  id: string;
  treino_id: string;
  exercicio_id: string;
  ordem: number;
  series: number;
  reps: string;
  carga_kg: number;
  created_at?: string;
}

// 14. corpo_log_treino
export interface CorpoLogTreino {
  id: string;
  treino_nome: string;
  data: string; // YYYY-MM-DD
  duracao_minutos: number;
  exercicios_realizados: Array<{
    nome: string;
    series: Array<{ reps: number; carga_kg: number; check: boolean }>;
  }>;
  created_at: string;
}

// 15. corpo_agua
export interface CorpoAgua {
  id: string;
  data: string; // YYYY-MM-DD
  quantidade_ml: number;
  hora: string;
  created_at: string;
}

// 16. corpo_refeicao
export interface CorpoRefeicao {
  id: string;
  data: string;
  hora: string;
  nome: string;
  foto?: string;
  tags: string[]; // ['#proteina', '#carbo', '#besteira', etc.]
  calorias_estimadas?: number;
  created_at: string;
}

// 17. corpo_remedios
export interface CorpoRemedio {
  id: string;
  nome: string;
  horario: string; // HH:MM
  dose: string;
  tomado_hoje: boolean;
  ultimo_tomado_data?: string;
  dias_semana?: string[];
  created_at: string;
}

// 18. corpo_sono
export interface CorpoSono {
  id: string;
  data: string; // YYYY-MM-DD
  dormiu_as: string; // HH:MM
  acordou_as: string; // HH:MM
  horas_dormidas: number;
  qualidade: 'excelente' | 'boa' | 'regular' | 'ruim';
  created_at: string;
}

// 19. corpo_peso
export interface CorpoPeso {
  id: string;
  data: string; // YYYY-MM-DD
  peso_kg: number;
  created_at: string;
}

// 20. corpo_medidas
export interface CorpoMedidas {
  id: string;
  data: string; // YYYY-MM-DD
  braco_cm?: number;
  cintura_cm?: number;
  perna_cm?: number;
  peitoral_cm?: number;
  foto_frente?: string;
  foto_lado?: string;
  created_at: string;
}

// 21. tempo_logs
export interface TempoLog {
  id: string;
  categoria: 'Trabalho' | 'Venda' | 'Estudo' | 'Celular' | 'Descanso' | 'Casa';
  duracao_segundos: number;
  data: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_fim?: string;
  valor_gerado_reais?: number;
  created_at: string;
}

// 22. garagem_abastecimento
export interface GaragemAbastecimento {
  id: string;
  data: string;
  km_atual: number;
  litros: number;
  valor_total: number;
  posto: string;
  km_por_litro?: number;
  custo_por_km?: number;
  created_at: string;
}

// 23. garagem_manutencao
export interface GaragemManutencao {
  id: string;
  item: 'Óleo' | 'Pneu' | 'Freio' | 'Correia' | 'Pastilha' | 'Filtro Ar';
  km_ultima: number;
  km_proxima: number;
  data_ultima?: string;
  observacao?: string;
  created_at: string;
}

// 24. garagem_docs
export interface GaragemDocs {
  id: string;
  tipo: 'IPVA' | 'Licenciamento' | 'Seguro' | 'DPVAT';
  valor: number;
  vencimento: string; // YYYY-MM-DD
  status: 'pendente' | 'pago' | 'atrasado';
  created_at: string;
}

// 25. mente_notas
export interface MenteNota {
  id: string;
  texto: string;
  tipo: 'texto' | 'voz' | 'foto' | 'link';
  tags: string[]; // ex: #pagar, #ideia, #comprar, #estudar
  link_url?: string;
  foto_url?: string;
  audio_url?: string;
  transcricao_feita?: boolean;
  sugestao_finance?: boolean; // if contains bill / pay keywords
  finance_processado?: boolean;
  created_at: string;
}
