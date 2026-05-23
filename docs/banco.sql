create table public.contas (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null,
  razao_social text,
  cnpj text,
  inscricao_estadual text,
  telefone text,
  email text,
  cep text,
  rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  pais text default 'Brasil',
  status text not null default 'ativa' check (status in ('ativa', 'suspensa', 'cancelada')),
  data_inicio_assinatura date,
  data_fim_assinatura date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  conta_id uuid not null references public.contas(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  image_url text,
  telefone text,
  role text not null default 'admin' check (role in ('admin', 'balcao')),
  cargo text default 'administrador',
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'bloqueado')),
  ultimo_acesso_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.configuracoes_conta (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) unique on delete cascade,
  permitir_edicao_os_terminal boolean not null default true,
  permitir_alterar_status_os_terminal boolean not null default true,
  permitir_anexos_terminal boolean not null default true,
  exibir_valor_vendido_relatorio_vendedor boolean not null default true,
  exibir_comissao_relatorio_vendedor boolean not null default true,
  exigir_observacao_ao_cancelar_os boolean not null default false,
  moeda text not null default 'BRL',
  fuso_horario text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendedores (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  nome_completo text not null,
  nome_exibicao text,
  cpf text,
  telefone text,
  email text,
  image_url text,
  cargo text not null default 'vendedor',
  data_admissao date,
  data_desligamento date,
  comissao_padrao_percentual numeric(5,2) default 0 check (comissao_padrao_percentual >= 0),
  meta_mensal_valor numeric(12,2),
  pin_hash text not null,
  pin_definido_em timestamptz not null default now(),
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'desligado', 'bloqueado')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  nome_completo text not null,
  nome_social text,
  cpf text,
  rg text,
  data_nascimento date,
  telefone_principal text not null,
  telefone_secundario text,
  email text,
  cep text,
  rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  pais text default 'Brasil',
  origem_cliente text,
  profissao text,
  prefere_contato_por text check (prefere_contato_por in ('telefone', 'whatsapp', 'email', 'indefinido')),
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  vendedor_id uuid not null references public.vendedores(id) on delete restrict,
  numero_os text not null,
  numero_pedido_antigo text,
  tipo_os text not null default 'venda' check (tipo_os in ('venda', 'orcamento', 'garantia', 'ajuste', 'troca')),
  data_venda date not null default current_date,
  data_abertura timestamptz not null default now(),
  prazo_entrega date,
  data_pronta_para_retirada timestamptz,
  data_entrega timestamptz,
  status text not null default 'cadastrada' check (status in ('cadastrada', 'enviada_laboratorio', 'aguardando_retorno', 'pronta_retirada', 'entregue', 'cancelada')),
  laboratorio_nome text,
  previsao_laboratorio date,
  pedido_laboratorio_numero text,
  cliente_retirou boolean not null default false,
  nome_retirante text,
  documento_retirante text,
  telefone_retirante text,
  custo_armacao numeric(12,2) not null default 0,
  custo_lentes numeric(12,2) not null default 0,
  valor_armacao numeric(12,2) not null default 0,
  valor_lentes numeric(12,2) not null default 0,
  valor_servicos numeric(12,2) not null default 0,
  valor_adicionais numeric(12,2) not null default 0,
  valor_bruto numeric(12,2) not null default 0,
  desconto_tipo text check (desconto_tipo in ('valor', 'percentual')),
  desconto_valor numeric(12,2) not null default 0,
  desconto_percentual numeric(5,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  valor_entrada numeric(12,2) not null default 0,
  valor_restante numeric(12,2) not null default 0,
  forma_pagamento text check (forma_pagamento in ('dinheiro', 'pix', 'debito', 'credito', 'boleto', 'transferencia', 'crediario', 'outro')),
  quantidade_parcelas integer,
  valor_parcela numeric(12,2),
  status_pagamento text not null default 'pendente' check (status_pagamento in ('pendente', 'parcial', 'pago', 'estornado', 'cancelado')),
  comissao_percentual_aplicada numeric(5,2) default 0,
  comissao_valor_estimado numeric(12,2) default 0,
  receita_recebida boolean not null default false,
  conferida boolean not null default false,
  nome_responsavel_conferencia text,
  data_conferencia timestamptz,
  observacoes_cliente text,
  observacoes_internas text,
  motivo_cancelamento text,
  cancelada_em timestamptz,
  created_by_admin_id uuid references public.usuarios(id) on delete set null,
  updated_by_admin_id uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  os_id uuid references public.ordens_servico(id) on delete cascade,
  data_receita date,
  medico_nome text,
  medico_crm text,
  medico_clinica text,
  medico_telefone text,
  validade_receita date,
  tipo_receita text check (tipo_receita in ('monofocal', 'bifocal', 'multifocal', 'ocupacional', 'solar_grau', 'outro')),
  od_esferico numeric(6,2),
  od_cilindrico numeric(6,2),
  od_eixo integer check (od_eixo between 0 and 180),
  od_adicao numeric(6,2),
  od_prisma text,
  od_base text,
  oe_esferico numeric(6,2),
  oe_cilindrico numeric(6,2),
  oe_eixo integer check (oe_eixo between 0 and 180),
  oe_adicao numeric(6,2),
  oe_prisma text,
  oe_base text,
  dnp_od numeric(6,2),
  dnp_oe numeric(6,2),
  dp_total numeric(6,2),
  altura_od numeric(6,2),
  altura_oe numeric(6,2),
  acuidade_od text,
  acuidade_oe text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.armacoes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  marca text,
  modelo text,
  referencia text,
  codigo_interno text,
  codigo_barras text,
  cor text,
  material text,
  formato text,
  tamanho_texto text,
  aro numeric(6,2),
  ponte numeric(6,2),
  haste numeric(6,2),
  largura_total numeric(6,2),
  altura_lente numeric(6,2),
  tipo_armacao text check (tipo_armacao in ('aro_fechado', 'fio_nylon', 'tres_pecas', 'clipon', 'solar', 'outro')),
  genero_indicado text check (genero_indicado in ('masculino', 'feminino', 'unissex', 'infantil', 'indefinido')),
  custo numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lentes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  tipo_lente text check (tipo_lente in ('visao_simples', 'bifocal', 'multifocal', 'ocupacional', 'solar', 'sem_grau', 'outro')),
  marca text,
  linha text,
  laboratorio text,
  material text check (material in ('resina', 'policarbonato', 'trivex', 'cristal', 'alto_indice', 'outro')),
  indice_refracao text,
  tratamento_antirreflexo boolean not null default false,
  tratamento_filtro_azul boolean not null default false,
  tratamento_fotossensivel boolean not null default false,
  tratamento_polarizado boolean not null default false,
  tratamento_uv boolean not null default false,
  tratamento_risco boolean not null default false,
  coloracao text,
  tonalidade text,
  curva_base text,
  diametro text,
  garantia_meses integer,
  data_inicio_garantia date,
  data_fim_garantia date,
  custo numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.anexos (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete cascade,
  os_id uuid references public.ordens_servico(id) on delete cascade,
  receita_id uuid references public.receitas(id) on delete set null,
  tipo_anexo text not null check (tipo_anexo in ('receita', 'envelope_antigo', 'documento_cliente', 'comprovante_pagamento', 'foto_armacao', 'garantia', 'os_assinada', 'outro')),
  nome_original text not null,
  nome_arquivo_storage text not null,
  bucket_storage text not null,
  caminho_storage text not null,
  mime_type text,
  tamanho_bytes bigint,
  descricao text,
  data_documento date,
  uploaded_by_admin_id uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.historico_status_os (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  alterado_por_tipo text not null check (alterado_por_tipo in ('admin', 'terminal', 'sistema')),
  alterado_por_admin_id uuid references public.usuarios(id) on delete set null,
  observacao text,
  created_at timestamptz not null default now()
);

create table public.observacoes_clientes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  os_id uuid references public.ordens_servico(id) on delete set null,
  tipo_observacao text not null default 'geral' check (tipo_observacao in ('geral', 'atendimento', 'preferencia', 'financeiro', 'alerta', 'outro')),
  texto text not null,
  visibilidade text not null default 'interna' check (visibilidade in ('interna', 'administrativa')),
  criado_por_tipo text not null check (criado_por_tipo in ('admin', 'terminal')),
  criado_por_admin_id uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 7. CATEGORIAS FINANCEIRAS
-- Simples, essenciais e já preparadas para DRE
-- =========================================================

create table if not exists public.categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,

  nome text not null,

  tipo_lancamento text not null check (
    tipo_lancamento in ('receita', 'despesa')
  ),

  grupo_dre text not null check (
    grupo_dre in (
      'receita_operacional',
      'deducao_receita',
      'custo_direto',
      'despesa_operacional',
      'resultado_nao_operacional'
    )
  ),

  constraint categorias_financeiras_tipo_grupo_dre_chk check (
    (tipo_lancamento = 'receita' and grupo_dre in ('receita_operacional', 'resultado_nao_operacional'))
    or
    (tipo_lancamento = 'despesa' and grupo_dre in ('deducao_receita', 'custo_direto', 'despesa_operacional', 'resultado_nao_operacional'))
  ),

  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (conta_id, nome, tipo_lancamento)
);


create index if not exists idx_categorias_financeiras_conta
  on public.categorias_financeiras(conta_id);


-- =========================================================
-- 8. LANÇAMENTOS FINANCEIROS AVULSOS
-- Aqui entram IPTU, salários, aluguel, taxas, etc.
-- =========================================================

create table if not exists public.lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  categoria_id uuid not null references public.categorias_financeiras(id) on delete restrict,

  origem text not null default 'manual' check (
    origem in ('manual', 'ordem_servico', 'ajuste')
  ),

  os_id uuid references public.ordens_servico(id) on delete set null,

  descricao text not null,
  valor numeric(12,2) not null check (valor >= 0),

  data_competencia date not null default current_date,
  data_vencimento date,
  data_pagamento date,

  status text not null default 'previsto' check (
    status in ('previsto', 'pago', 'vencido', 'cancelado')
  ),

  constraint lancamentos_financeiros_status_pagamento_data_chk check (
    (status = 'pago' and data_pagamento is not null)
    or
    (status <> 'pago' and data_pagamento is null)
  ),

  constraint lancamentos_financeiros_origem_reservada_chk check (
    origem <> 'ordem_servico'
  ),

  forma_pagamento text check (
    forma_pagamento in (
      'dinheiro',
      'pix',
      'debito',
      'credito',
      'boleto',
      'transferencia',
      'outro'
    )
  ),

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.logs_acesso_relatorio_vendedor (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,
  vendedor_id uuid references public.vendedores(id) on delete set null,
  nome_vendedor_informado text,
  pin_validado boolean not null default false,
  origem_acesso text not null default 'terminal' check (origem_acesso in ('terminal', 'admin')),
  ip_origem text,
  user_agent text,
  motivo_falha text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 3. CATÁLOGO DE ARMAÇÕES
-- =========================================================

create table if not exists public.catalogo_armacoes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,

  chave_catalogo text not null,

  marca text,
  modelo text,
  referencia text,
  codigo_interno text,
  codigo_barras text,
  cor text,
  material text,
  formato text,
  tamanho_texto text,

  aro numeric(6,2),
  ponte numeric(6,2),
  haste numeric(6,2),
  largura_total numeric(6,2),
  altura_lente numeric(6,2),

  tipo_armacao text check (
    tipo_armacao in (
      'aro_fechado',
      'fio_nylon',
      'tres_pecas',
      'clipon',
      'solar',
      'outro'
    )
  ),

  genero_indicado text check (
    genero_indicado in (
      'masculino',
      'feminino',
      'unissex',
      'infantil',
      'indefinido'
    )
  ),

  custo numeric(12,2) not null default 0,

  quantidade_usos integer not null default 1,
  ultimo_uso_em timestamptz not null default now(),

  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (conta_id, chave_catalogo)
);

-- =========================================================
-- 4. CATÁLOGO DE LENTES
-- =========================================================

create table if not exists public.catalogo_lentes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas(id) on delete cascade,

  chave_catalogo text not null,

  tipo_lente text check (
    tipo_lente in (
      'visao_simples',
      'bifocal',
      'multifocal',
      'ocupacional',
      'solar',
      'sem_grau',
      'outro'
    )
  ),

  marca text,
  linha text,
  laboratorio text,

  material text check (
    material in (
      'resina',
      'policarbonato',
      'trivex',
      'cristal',
      'alto_indice',
      'outro'
    )
  ),

  indice_refracao text,

  tratamento_antirreflexo boolean not null default false,
  tratamento_filtro_azul boolean not null default false,
  tratamento_fotossensivel boolean not null default false,
  tratamento_polarizado boolean not null default false,
  tratamento_uv boolean not null default false,
  tratamento_risco boolean not null default false,

  coloracao text,
  tonalidade text,
  curva_base text,
  diametro text,

  garantia_meses integer,

  custo numeric(12,2) not null default 0,

  quantidade_usos integer not null default 1,
  ultimo_uso_em timestamptz not null default now(),

  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (conta_id, chave_catalogo)
);


insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'documentos',
  'documentos',
  false,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do nothing;


create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conta_id uuid;
  v_nome_fantasia text;
  v_nome_completo text;
  v_telefone text;
begin
  v_nome_fantasia :=
    coalesce(
      nullif(new.raw_user_meta_data->>'nome_fantasia', ''),
      'Nova conta'
    );

  v_nome_completo :=
    coalesce(
      nullif(new.raw_user_meta_data->>'nome_completo', ''),
      split_part(new.email, '@', 1)
    );

  v_telefone :=
    nullif(new.raw_user_meta_data->>'telefone', '');

  insert into public.contas (
    nome_fantasia,
    email,
    telefone
  )
  values (
    v_nome_fantasia,
    new.email,
    v_telefone
  )
  returning id into v_conta_id;

  insert into public.usuarios (
    id,
    conta_id,
    nome_completo,
    email,
    telefone,
    role,
    cargo,
    status
  )
  values (
    new.id,
    v_conta_id,
    v_nome_completo,
    new.email,
    v_telefone,
    'admin',
    'administrador',
    'ativo'
  );

  insert into public.configuracoes_conta (
    conta_id
  )
  values (
    v_conta_id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- =========================================================
-- 5. TRIGGER: ALIMENTAR CATÁLOGO DE ARMAÇÕES AUTOMATICAMENTE
-- =========================================================

create or replace function public.sync_catalogo_armacoes()
returns trigger
language plpgsql
as $$
declare
  v_chave text;
begin
  -- Só cataloga se houver alguma identificação minimamente útil
  if coalesce(new.marca, '') = ''
     and coalesce(new.modelo, '') = ''
     and coalesce(new.referencia, '') = '' then
    return new;
  end if;

  v_chave :=
    lower(trim(coalesce(new.marca, ''))) || '|' ||
    lower(trim(coalesce(new.modelo, ''))) || '|' ||
    lower(trim(coalesce(new.referencia, ''))) || '|' ||
    lower(trim(coalesce(new.cor, '')));

  insert into public.catalogo_armacoes (
    conta_id,
    chave_catalogo,
    marca,
    modelo,
    referencia,
    codigo_interno,
    codigo_barras,
    cor,
    material,
    formato,
    tamanho_texto,
    aro,
    ponte,
    haste,
    largura_total,
    altura_lente,
    tipo_armacao,
    genero_indicado,
    custo,
    quantidade_usos,
    ultimo_uso_em,
    updated_at
  )
  values (
    new.conta_id,
    v_chave,
    new.marca,
    new.modelo,
    new.referencia,
    new.codigo_interno,
    new.codigo_barras,
    new.cor,
    new.material,
    new.formato,
    new.tamanho_texto,
    new.aro,
    new.ponte,
    new.haste,
    new.largura_total,
    new.altura_lente,
    new.tipo_armacao,
    new.genero_indicado,
    new.custo,
    1,
    now(),
    now()
  )
  on conflict (conta_id, chave_catalogo)
  do update set
    marca = excluded.marca,
    modelo = excluded.modelo,
    referencia = excluded.referencia,
    codigo_interno = excluded.codigo_interno,
    codigo_barras = excluded.codigo_barras,
    cor = excluded.cor,
    material = excluded.material,
    formato = excluded.formato,
    tamanho_texto = excluded.tamanho_texto,
    aro = excluded.aro,
    ponte = excluded.ponte,
    haste = excluded.haste,
    largura_total = excluded.largura_total,
    altura_lente = excluded.altura_lente,
    tipo_armacao = excluded.tipo_armacao,
    genero_indicado = excluded.genero_indicado,
    custo = excluded.custo,
    ultimo_uso_em = now(),
    updated_at = now(),
    quantidade_usos =
      case
        when tg_op = 'INSERT'
          then public.catalogo_armacoes.quantidade_usos + 1
        else public.catalogo_armacoes.quantidade_usos
      end;

  return new;
end;
$$;


drop trigger if exists trg_sync_catalogo_armacoes on public.armacoes;

create trigger trg_sync_catalogo_armacoes
after insert or update on public.armacoes
for each row
execute function public.sync_catalogo_armacoes();


-- =========================================================
-- 6. TRIGGER: ALIMENTAR CATÁLOGO DE LENTES AUTOMATICAMENTE
-- =========================================================

create or replace function public.sync_catalogo_lentes()
returns trigger
language plpgsql
as $$
declare
  v_chave text;
begin
  -- Só cataloga se houver alguma identificação minimamente útil
  if coalesce(new.marca, '') = ''
     and coalesce(new.linha, '') = ''
     and coalesce(new.laboratorio, '') = '' then
    return new;
  end if;

  v_chave :=
    lower(trim(coalesce(new.tipo_lente, ''))) || '|' ||
    lower(trim(coalesce(new.marca, ''))) || '|' ||
    lower(trim(coalesce(new.linha, ''))) || '|' ||
    lower(trim(coalesce(new.laboratorio, ''))) || '|' ||
    lower(trim(coalesce(new.material, ''))) || '|' ||
    lower(trim(coalesce(new.indice_refracao, ''))) || '|' ||
    coalesce(new.tratamento_antirreflexo, false)::text || '|' ||
    coalesce(new.tratamento_filtro_azul, false)::text || '|' ||
    coalesce(new.tratamento_fotossensivel, false)::text || '|' ||
    coalesce(new.tratamento_polarizado, false)::text || '|' ||
    coalesce(new.tratamento_uv, false)::text || '|' ||
    coalesce(new.tratamento_risco, false)::text;

  insert into public.catalogo_lentes (
    conta_id,
    chave_catalogo,
    tipo_lente,
    marca,
    linha,
    laboratorio,
    material,
    indice_refracao,
    tratamento_antirreflexo,
    tratamento_filtro_azul,
    tratamento_fotossensivel,
    tratamento_polarizado,
    tratamento_uv,
    tratamento_risco,
    coloracao,
    tonalidade,
    curva_base,
    diametro,
    garantia_meses,
    custo,
    quantidade_usos,
    ultimo_uso_em,
    updated_at
  )
  values (
    new.conta_id,
    v_chave,
    new.tipo_lente,
    new.marca,
    new.linha,
    new.laboratorio,
    new.material,
    new.indice_refracao,
    new.tratamento_antirreflexo,
    new.tratamento_filtro_azul,
    new.tratamento_fotossensivel,
    new.tratamento_polarizado,
    new.tratamento_uv,
    new.tratamento_risco,
    new.coloracao,
    new.tonalidade,
    new.curva_base,
    new.diametro,
    new.garantia_meses,
    new.custo,
    1,
    now(),
    now()
  )
  on conflict (conta_id, chave_catalogo)
  do update set
    tipo_lente = excluded.tipo_lente,
    marca = excluded.marca,
    linha = excluded.linha,
    laboratorio = excluded.laboratorio,
    material = excluded.material,
    indice_refracao = excluded.indice_refracao,
    tratamento_antirreflexo = excluded.tratamento_antirreflexo,
    tratamento_filtro_azul = excluded.tratamento_filtro_azul,
    tratamento_fotossensivel = excluded.tratamento_fotossensivel,
    tratamento_polarizado = excluded.tratamento_polarizado,
    tratamento_uv = excluded.tratamento_uv,
    tratamento_risco = excluded.tratamento_risco,
    coloracao = excluded.coloracao,
    tonalidade = excluded.tonalidade,
    curva_base = excluded.curva_base,
    diametro = excluded.diametro,
    garantia_meses = excluded.garantia_meses,
    custo = excluded.custo,
    ultimo_uso_em = now(),
    updated_at = now(),
    quantidade_usos =
      case
        when tg_op = 'INSERT'
          then public.catalogo_lentes.quantidade_usos + 1
        else public.catalogo_lentes.quantidade_usos
      end;

  return new;
end;
$$;


drop trigger if exists trg_sync_catalogo_lentes on public.lentes;

create trigger trg_sync_catalogo_lentes
after insert or update on public.lentes
for each row
execute function public.sync_catalogo_lentes();

-- =========================================================
-- 9. VIEW BASE PARA O FUTURO DRE
-- Une:
-- - Receitas da OS
-- - Custos de armação/lentes da OS
-- - Lançamentos financeiros avulsos
-- =========================================================

create or replace view public.vw_financeiro_dre_base as
select
  os.conta_id,
  os.data_venda as data_competencia,
  'receita_operacional'::text as grupo_dre,
  'Receita de OS'::text as categoria,
  'receita'::text as tipo_lancamento,
  'ordem_servico'::text as origem,
  os.id as origem_id,
  os.valor_total as valor
from public.ordens_servico os
where os.tipo_os = 'venda'
  and os.status <> 'cancelada'
  and os.status_pagamento not in ('cancelado', 'estornado')
  and os.valor_total > 0

union all

select
  os.conta_id,
  os.data_venda as data_competencia,
  'custo_direto'::text as grupo_dre,
  'Custo de armação'::text as categoria,
  'despesa'::text as tipo_lancamento,
  'ordem_servico'::text as origem,
  os.id as origem_id,
  os.custo_armacao as valor
from public.ordens_servico os
where os.tipo_os = 'venda'
  and os.status <> 'cancelada'
  and os.status_pagamento not in ('cancelado', 'estornado')
  and os.custo_armacao > 0

union all

select
  os.conta_id,
  os.data_venda as data_competencia,
  'custo_direto'::text as grupo_dre,
  'Custo de lentes'::text as categoria,
  'despesa'::text as tipo_lancamento,
  'ordem_servico'::text as origem,
  os.id as origem_id,
  os.custo_lentes as valor
from public.ordens_servico os
where os.tipo_os = 'venda'
  and os.status <> 'cancelada'
  and os.status_pagamento not in ('cancelado', 'estornado')
  and os.custo_lentes > 0

union all

select
  lf.conta_id,
  lf.data_competencia,
  cf.grupo_dre,
  cf.nome as categoria,
  cf.tipo_lancamento,
  lf.origem,
  lf.id as origem_id,
  lf.valor
from public.lancamentos_financeiros lf
inner join public.categorias_financeiras cf
  on cf.id = lf.categoria_id
where lf.status <> 'cancelado';