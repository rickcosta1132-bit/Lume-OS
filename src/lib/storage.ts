/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_CONFIG,
  INITIAL_BIBLIOTECA_TREINOS,
  INITIAL_EXERCICIOS,
  INITIAL_GUARDADO,
  INITIAL_INVESTIMENTOS,
  INITIAL_DIVIDAS,
  INITIAL_CASA_CONTAS,
  INITIAL_CASA_DESPENSA,
  INITIAL_CASA_MANUTENCAO,
  INITIAL_GARAGEM_MANUTENCAO,
  INITIAL_GARAGEM_DOCS,
  INITIAL_REMEDIOS,
  INITIAL_DOCS,
  INITIAL_NOTAS
} from './initialData';
import {
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
  CorpoBibliotecaTreino,
  CorpoBibliotecaExercicio,
  CorpoMeuTreino,
  CorpoTreinoExercicio,
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

export interface AppStoreData {
  config: UserConfig;
  finance_guardado: FinanceGuardado[];
  finance_investimentos: FinanceInvestimento[];
  finance_dividas: FinanceDivida[];
  finance_parcelas: FinanceParcela[];
  casa_contas: CasaConta[];
  casa_despensa: CasaDespensa[];
  casa_compras: CasaCompra[];
  casa_manutencao: CasaManutencao[];
  docs_cofre: DocsCofre[];
  corpo_biblioteca_treinos: CorpoBibliotecaTreino[];
  corpo_biblioteca_exercicios: CorpoBibliotecaExercicio[];
  corpo_meus_treinos: CorpoMeuTreino[];
  corpo_treino_exercicios: CorpoTreinoExercicio[];
  corpo_log_treino: CorpoLogTreino[];
  corpo_agua: CorpoAgua[];
  corpo_refeicao: CorpoRefeicao[];
  corpo_remedios: CorpoRemedio[];
  corpo_sono: CorpoSono[];
  corpo_peso: CorpoPeso[];
  corpo_medidas: CorpoMedidas[];
  tempo_logs: TempoLog[];
  garagem_abastecimento: GaragemAbastecimento[];
  garagem_manutencao: GaragemManutencao[];
  garagem_docs: GaragemDocs[];
  mente_notas: MenteNota[];
}

const STORAGE_KEY = 'lume_os_store_v1';

export function getInitialStore(): AppStoreData {
  return {
    config: DEFAULT_CONFIG,
    finance_guardado: INITIAL_GUARDADO,
    finance_investimentos: INITIAL_INVESTIMENTOS,
    finance_dividas: INITIAL_DIVIDAS,
    finance_parcelas: [
      {
        id: 'parc-1',
        divida_id: 'div-1',
        numero_parcela: 1,
        valor: 3850,
        vencimento: '2026-10-25',
        status: 'pendente',
        created_at: '2026-10-01'
      },
      {
        id: 'parc-2',
        divida_id: 'div-2',
        numero_parcela: 25,
        valor: 1200,
        vencimento: '2026-11-10',
        status: 'pendente',
        created_at: '2026-10-01'
      }
    ],
    casa_contas: INITIAL_CASA_CONTAS,
    casa_despensa: INITIAL_CASA_DESPENSA,
    casa_compras: [
      {
        id: 'comp-1',
        item: 'Ovos Caipiras (cartela 30 un)',
        quantidade: 1,
        unidade: 'cartela',
        comprado: false,
        urgencia: 'alta',
        origem_despensa: false,
        created_at: '2026-10-20'
      },
      {
        id: 'comp-2',
        item: 'Azeite de Oliva Extra Virgem',
        quantidade: 1,
        unidade: 'vidro 500ml',
        comprado: false,
        urgencia: 'media',
        origem_despensa: false,
        created_at: '2026-10-21'
      }
    ],
    casa_manutencao: INITIAL_CASA_MANUTENCAO,
    docs_cofre: INITIAL_DOCS,
    corpo_biblioteca_treinos: INITIAL_BIBLIOTECA_TREINOS,
    corpo_biblioteca_exercicios: INITIAL_EXERCICIOS,
    corpo_meus_treinos: [
      {
        id: 'mt-1',
        nome: 'Meu Treino A - Peito & Tríceps',
        dia_semana: 'Segunda-feira',
        ativo: true,
        created_at: '2026-10-01'
      },
      {
        id: 'mt-2',
        nome: 'Meu Treino B - Costas & Bíceps',
        dia_semana: 'Terça-feira',
        ativo: true,
        created_at: '2026-10-01'
      },
      {
        id: 'mt-3',
        nome: 'Meu Treino C - Pernas & Core',
        dia_semana: 'Quinta-feira',
        ativo: true,
        created_at: '2026-10-01'
      }
    ],
    corpo_treino_exercicios: [
      { id: 'te-1', treino_id: 'mt-1', exercicio_id: 'ex-1', ordem: 1, series: 4, reps: '8-10', carga_kg: 60, created_at: '2026-10-01' },
      { id: 'te-2', treino_id: 'mt-1', exercicio_id: 'ex-2', ordem: 2, series: 4, reps: '10-12', carga_kg: 24, created_at: '2026-10-01' },
      { id: 'te-3', treino_id: 'mt-1', exercicio_id: 'ex-3', ordem: 3, series: 3, reps: '12-15', carga_kg: 15, created_at: '2026-10-01' },
      { id: 'te-4', treino_id: 'mt-1', exercicio_id: 'ex-16', ordem: 4, series: 4, reps: '12-15', carga_kg: 25, created_at: '2026-10-01' }
    ],
    corpo_log_treino: [
      {
        id: 'log-1',
        treino_nome: 'Meu Treino A - Peito & Tríceps',
        data: '2026-10-21',
        duracao_minutos: 48,
        exercicios_realizados: [
          {
            nome: 'Supino Reto com Barra',
            series: [
              { reps: 10, carga_kg: 60, check: true },
              { reps: 10, carga_kg: 62, check: true },
              { reps: 8, carga_kg: 65, check: true },
              { reps: 8, carga_kg: 65, check: true }
            ]
          }
        ],
        created_at: '2026-10-21T19:30:00Z'
      }
    ],
    corpo_agua: [
      { id: 'ag-1', data: '2026-10-23', quantidade_ml: 500, hora: '08:30', created_at: '2026-10-23T08:30:00Z' },
      { id: 'ag-2', data: '2026-10-23', quantidade_ml: 500, hora: '11:15', created_at: '2026-10-23T11:15:00Z' },
      { id: 'ag-3', data: '2026-10-23', quantidade_ml: 250, hora: '13:40', created_at: '2026-10-23T13:40:00Z' }
    ],
    corpo_refeicao: [
      {
        id: 'ref-1',
        data: '2026-10-23',
        hora: '08:15',
        nome: 'Omelete 4 Ovos + Aveia e Banana',
        tags: ['#proteina', '#carbo'],
        calorias_estimadas: 520,
        created_at: '2026-10-23T08:15:00Z'
      },
      {
        id: 'ref-2',
        data: '2026-10-23',
        hora: '12:45',
        nome: 'Arroz Integral, Peito de Frango Grelhado e Salada',
        tags: ['#proteina', '#carbo', '#vegetais'],
        calorias_estimadas: 680,
        created_at: '2026-10-23T12:45:00Z'
      }
    ],
    corpo_remedios: INITIAL_REMEDIOS,
    corpo_sono: [
      {
        id: 'so-1',
        data: '2026-10-23',
        dormiu_as: '23:30',
        acordou_as: '07:15',
        horas_dormidas: 7.75,
        qualidade: 'boa',
        created_at: '2026-10-23T07:15:00Z'
      }
    ],
    corpo_peso: [
      { id: 'pe-1', data: '2026-10-10', peso_kg: 78.4, created_at: '2026-10-10' },
      { id: 'pe-2', data: '2026-10-17', peso_kg: 77.9, created_at: '2026-10-17' },
      { id: 'pe-3', data: '2026-10-23', peso_kg: 77.2, created_at: '2026-10-23' }
    ],
    corpo_medidas: [
      {
        id: 'med-1',
        data: '2026-10-15',
        braco_cm: 38.5,
        cintura_cm: 82.0,
        perna_cm: 58.5,
        peitoral_cm: 104.0,
        created_at: '2026-10-15'
      }
    ],
    tempo_logs: [
      {
        id: 'tl-1',
        categoria: 'Trabalho',
        duracao_segundos: 14400, // 4 horas
        data: '2026-10-23',
        hora_inicio: '09:00',
        hora_fim: '13:00',
        valor_gerado_reais: 260,
        created_at: '2026-10-23T13:00:00Z'
      },
      {
        id: 'tl-2',
        categoria: 'Venda',
        duracao_segundos: 3600, // 1 hora
        data: '2026-10-23',
        hora_inicio: '14:00',
        hora_fim: '15:00',
        valor_gerado_reais: 65,
        created_at: '2026-10-23T15:00:00Z'
      }
    ],
    garagem_abastecimento: [
      {
        id: 'ab-1',
        data: '2026-10-12',
        km_atual: 49400,
        litros: 42.5,
        valor_total: 246.50,
        posto: 'Posto Shell Power',
        km_por_litro: 12.2,
        custo_por_km: 0.47,
        created_at: '2026-10-12'
      },
      {
        id: 'ab-2',
        data: '2026-10-21',
        km_atual: 49920,
        litros: 40.0,
        valor_total: 232.00,
        posto: 'Posto Ipiranga',
        km_por_litro: 13.0,
        custo_por_km: 0.44,
        created_at: '2026-10-21'
      }
    ],
    garagem_manutencao: INITIAL_GARAGEM_MANUTENCAO,
    garagem_docs: INITIAL_GARAGEM_DOCS,
    mente_notas: INITIAL_NOTAS
  };
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  if (url && key) {
    try {
      return createClient(url, key);
    } catch {
      return null;
    }
  }
  return supabaseClient;
}

export function initSupabase(url: string, key: string): SupabaseClient | null {
  try {
    if (!url || !key) {
      supabaseClient = null;
      return null;
    }
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
    return null;
  }
}

export function loadStore(): AppStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const initial = getInitialStore();
    // Merge defensively in case new tables or keys are introduced
    return {
      ...initial,
      ...parsed,
      config: { ...initial.config, ...(parsed.config || {}) }
    };
  } catch (e) {
    console.error('Error loading store, falling back to initial data', e);
    return getInitialStore();
  }
}

export function saveStore(store: AppStoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error saving store', e);
  }
}

// Background async sync to Supabase when table updates occur
export async function syncTableToSupabase<T extends keyof AppStoreData>(
  table: T,
  items: AppStoreData[T],
  config: UserConfig
) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return;
  const client = getSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);
  if (!client) return;

  try {
    // If it's config, skip (or save to custom table)
    if (table === 'config') return;
    
    // Upsert items into Supabase
    if (Array.isArray(items)) {
      const { error } = await client.from(table as string).upsert(items, { onConflict: 'id' });
      if (error) {
        console.warn(`Supabase sync warning for ${table}:`, error.message);
      }
    }
  } catch (err) {
    console.warn(`Failed to sync ${table} to Supabase:`, err);
  }
}
