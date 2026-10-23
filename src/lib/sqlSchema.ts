/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUPABASE_SQL_SCHEMA = `-- LUME OS by Lume Labs
-- Script SQL Completo de Criação das 25 Tabelas no Supabase

-- Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. finance_guardado
CREATE TABLE IF NOT EXISTS finance_guardado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  meta_valor NUMERIC NOT NULL DEFAULT 0,
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'reserva',
  historico JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. finance_investimentos
CREATE TABLE IF NOT EXISTS finance_investimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  codigo TEXT,
  tipo TEXT NOT NULL DEFAULT 'fixa',
  valor_inicial NUMERIC NOT NULL DEFAULT 0,
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  dividendos_recebidos NUMERIC NOT NULL DEFAULT 0,
  melhor_mes TEXT,
  pior_mes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. finance_dividas
CREATE TABLE IF NOT EXISTS finance_dividas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cartao',
  valor_total NUMERIC NOT NULL DEFAULT 0,
  valor_parcela NUMERIC NOT NULL DEFAULT 0,
  parcelas_total INT NOT NULL DEFAULT 1,
  parcelas_pagas INT NOT NULL DEFAULT 0,
  dia_vencimento INT NOT NULL DEFAULT 10,
  proximo_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_dia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. finance_parcelas
CREATE TABLE IF NOT EXISTS finance_parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  divida_id UUID REFERENCES finance_dividas(id) ON DELETE CASCADE,
  numero_parcela INT NOT NULL,
  valor NUMERIC NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  pago_em TIMESTAMPTZ,
  juros_multa NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. casa_contas
CREATE TABLE IF NOT EXISTS casa_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'outros',
  valor NUMERIC NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  foto_comprovante TEXT,
  recorrente_mensal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. casa_despensa
CREATE TABLE IF NOT EXISTS casa_despensa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 1,
  unidade TEXT NOT NULL DEFAULT 'un',
  validade DATE NOT NULL,
  local TEXT NOT NULL DEFAULT 'armario',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. casa_compras
CREATE TABLE IF NOT EXISTS casa_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 1,
  unidade TEXT NOT NULL DEFAULT 'un',
  comprado BOOLEAN DEFAULT false,
  urgencia TEXT NOT NULL DEFAULT 'media',
  origem_despensa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. casa_manutencao
CREATE TABLE IF NOT EXISTS casa_manutencao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  intervalo_dias INT NOT NULL DEFAULT 90,
  ultima_troca DATE NOT NULL,
  proxima_troca DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. docs_cofre
CREATE TABLE IF NOT EXISTS docs_cofre (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Pessoal',
  vencimento DATE,
  foto_frente TEXT,
  foto_verso TEXT,
  pdf_url TEXT,
  numero_documento TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. corpo_biblioteca_treinos
CREATE TABLE IF NOT EXISTS corpo_biblioteca_treinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'musculacao',
  duracao_estimada_min INT NOT NULL DEFAULT 45,
  exercicios_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. corpo_biblioteca_exercicios
CREATE TABLE IF NOT EXISTS corpo_biblioteca_exercicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  series_sugeridas INT NOT NULL DEFAULT 4,
  reps_sugeridas TEXT NOT NULL DEFAULT '10-12',
  instrucoes TEXT,
  carga_padrao_kg NUMERIC DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. corpo_meus_treinos
CREATE TABLE IF NOT EXISTS corpo_meus_treinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  dia_semana TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. corpo_treino_exercicios
CREATE TABLE IF NOT EXISTS corpo_treino_exercicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treino_id UUID REFERENCES corpo_meus_treinos(id) ON DELETE CASCADE,
  exercicio_id UUID REFERENCES corpo_biblioteca_exercicios(id) ON DELETE CASCADE,
  ordem INT NOT NULL DEFAULT 1,
  series INT NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '10-12',
  carga_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. corpo_log_treino
CREATE TABLE IF NOT EXISTS corpo_log_treino (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treino_nome TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  duracao_minutos INT NOT NULL DEFAULT 0,
  exercicios_realizados JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. corpo_agua
CREATE TABLE IF NOT EXISTS corpo_agua (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade_ml INT NOT NULL DEFAULT 250,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. corpo_refeicao
CREATE TABLE IF NOT EXISTS corpo_refeicao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  nome TEXT NOT NULL,
  foto TEXT,
  tags TEXT[] DEFAULT '{}',
  calorias_estimadas INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. corpo_remedios
CREATE TABLE IF NOT EXISTS corpo_remedios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  horario TIME NOT NULL,
  dose TEXT NOT NULL,
  tomado_hoje BOOLEAN DEFAULT false,
  ultimo_tomado_data DATE,
  dias_semana TEXT[] DEFAULT '{"seg","ter","qua","qui","sex","sab","dom"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. corpo_sono
CREATE TABLE IF NOT EXISTS corpo_sono (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  dormiu_as TIME NOT NULL,
  acordou_as TIME NOT NULL,
  horas_dormidas NUMERIC NOT NULL,
  qualidade TEXT NOT NULL DEFAULT 'boa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. corpo_peso
CREATE TABLE IF NOT EXISTS corpo_peso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_kg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. corpo_medidas
CREATE TABLE IF NOT EXISTS corpo_medidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  braco_cm NUMERIC,
  cintura_cm NUMERIC,
  perna_cm NUMERIC,
  peitoral_cm NUMERIC,
  foto_frente TEXT,
  foto_lado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. tempo_logs
CREATE TABLE IF NOT EXISTS tempo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria TEXT NOT NULL,
  duracao_segundos INT NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  valor_gerado_reais NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. garagem_abastecimento
CREATE TABLE IF NOT EXISTS garagem_abastecimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  km_atual NUMERIC NOT NULL,
  litros NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  posto TEXT NOT NULL,
  km_por_litro NUMERIC,
  custo_por_km NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. garagem_manutencao
CREATE TABLE IF NOT EXISTS garagem_manutencao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  km_ultima NUMERIC NOT NULL,
  km_proxima NUMERIC NOT NULL,
  data_ultima DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. garagem_docs
CREATE TABLE IF NOT EXISTS garagem_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. mente_notas
CREATE TABLE IF NOT EXISTS mente_notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  tags TEXT[] DEFAULT '{}',
  link_url TEXT,
  foto_url TEXT,
  audio_url TEXT,
  transcricao_feita BOOLEAN DEFAULT false,
  sugestao_finance BOOLEAN DEFAULT false,
  finance_processado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS público para acesso anônimo inicial (ou autenticado)
ALTER TABLE finance_guardado ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE casa_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE casa_despensa ENABLE ROW LEVEL SECURITY;
ALTER TABLE casa_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE casa_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_cofre ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_biblioteca_treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_biblioteca_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_meus_treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_treino_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_log_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_refeicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_remedios ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_sono ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpo_medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tempo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE garagem_abastecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE garagem_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE garagem_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mente_notas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso livre via anon key
CREATE POLICY "Acesso Total Anonimo" ON finance_guardado FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON finance_investimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON finance_dividas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON finance_parcelas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON casa_contas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON casa_despensa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON casa_compras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON casa_manutencao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON docs_cofre FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_biblioteca_treinos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_biblioteca_exercicios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_meus_treinos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_treino_exercicios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_log_treino FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_agua FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_refeicao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_remedios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_sono FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_peso FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON corpo_medidas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON tempo_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON garagem_abastecimento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON garagem_manutencao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON garagem_docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Anonimo" ON mente_notas FOR ALL USING (true) WITH CHECK (true);
`;
