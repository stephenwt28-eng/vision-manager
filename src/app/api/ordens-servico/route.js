// src/app/api/ordens-servico/route.js

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const OS_STATUS_FINAIS = ["pronta_retirada", "entregue", "cancelada"];

const QUICK_EDIT_FIELDS = [
  "status",
  "status_pagamento",
  "valor_entrada",
  "valor_restante",
  "forma_pagamento",
  "quantidade_parcelas",
  "valor_parcela",
  "cliente_retirou",
  "nome_retirante",
  "documento_retirante",
  "telefone_retirante",
  "data_pronta_para_retirada",
  "data_entrega",
  "motivo_cancelamento",
  "observacoes_internas",
];

const NESTED_KEYS = [
  "ordemServico",
  "ordem_servico",
  "os",
  "cliente",
  "clienteRapido",
  "cliente_rapido",
  "receita",
  "armacao",
  "armação",
  "armacoes",
  "armações",
  "lente",
  "lentes",
  "anexos",
  "documentos",
];

/* ==========================================================================
   AUTH / PERFIL
   ========================================================================== */

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      error: NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("id, conta_id, role, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      error: NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 404 }
      ),
    };
  }

  if (profile.status !== "ativo") {
    return {
      supabase,
      error: NextResponse.json(
        { error: "Seu acesso está inativo ou bloqueado." },
        { status: 403 }
      ),
    };
  }

  const { data: configuracoes } = await supabase
    .from("configuracoes_conta")
    .select("*")
    .eq("conta_id", profile.conta_id)
    .maybeSingle();

  return {
    supabase,
    profile,
    configuracoes: configuracoes || null,
    error: null,
  };
}

/* ==========================================================================
   HELPERS GERAIS
   ========================================================================== */

function normalizeText(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function normalizePayloadValues(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value === "") return [key, null];
      if (typeof value === "string") return [key, normalizeText(value)];

      return [key, value];
    })
  );
}

function cleanPayload(body = {}, options = {}) {
  const { keepId = false } = options;

  const {
    conta_id,
    created_at,
    updated_at,
    created_by_admin_id,
    updated_by_admin_id,
    ...rest
  } = body || {};

  const payload = { ...rest };

  if (!keepId) {
    delete payload.id;
  }

  for (const key of NESTED_KEYS) {
    delete payload[key];
  }

  return normalizePayloadValues(payload);
}

function getBodySegments(body = {}) {
  const ordemServico =
    body.ordemServico ||
    body.ordem_servico ||
    body.os ||
    body;

  const cliente =
    body.cliente ||
    body.clienteRapido ||
    body.cliente_rapido ||
    null;

  const receita = body.receita || null;

  const armacao =
    body.armacao ||
    body.armação ||
    body.armacoes?.[0] ||
    body.armações?.[0] ||
    null;

  const lente =
    body.lente ||
    body.lentes?.[0] ||
    null;

  return {
    ordemServico,
    cliente,
    receita,
    armacao,
    lente,
  };
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function hasUsefulData(payload) {
  if (!payload || typeof payload !== "object") return false;

  return Object.entries(payload).some(([key, value]) => {
    if (
      [
        "id",
        "conta_id",
        "cliente_id",
        "os_id",
        "created_at",
        "updated_at",
      ].includes(key)
    ) {
      return false;
    }

    if (typeof value === "boolean") return value === true;
    if (typeof value === "number") return Number.isFinite(value) && value !== 0;

    return value !== null && value !== undefined && String(value).trim() !== "";
  });
}

function generateNumeroOS() {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const time = now
    .toTimeString()
    .slice(0, 8)
    .replaceAll(":", "");

  const random = Math.random().toString(36).slice(2, 5).toUpperCase();

  return `OS-${date}-${time}-${random}`;
}

function applyStatusDates(payload = {}, previous = null) {
  const nextPayload = { ...payload };
  const nextStatus = nextPayload.status;
  const previousStatus = previous?.status;

  if (!nextStatus || nextStatus === previousStatus) {
    return nextPayload;
  }

  const now = new Date().toISOString();

  if (nextStatus === "pronta_retirada" && !nextPayload.data_pronta_para_retirada) {
    nextPayload.data_pronta_para_retirada = now;
  }

  if (nextStatus === "entregue" && !nextPayload.data_entrega) {
    nextPayload.data_entrega = now;
    nextPayload.cliente_retirou = nextPayload.cliente_retirou ?? true;
  }

  if (nextStatus === "cancelada" && !nextPayload.cancelada_em) {
    nextPayload.cancelada_em = now;
    nextPayload.status_pagamento =
      nextPayload.status_pagamento === "pago"
        ? "pago"
        : nextPayload.status_pagamento || "cancelado";
  }

  return nextPayload;
}

function getMoneyInput(payload = {}, previous = null, field) {
  if (
    payload[field] === null ||
    payload[field] === undefined ||
    payload[field] === ""
  ) {
    return previous?.[field];
  }

  return payload[field];
}

function prepareMoneyFields(payload = {}, previous = null) {
  const nextPayload = { ...payload };

  const custoArmacao = roundMoney(
    getMoneyInput(nextPayload, previous, "custo_armacao")
  );
  const custoLentes = roundMoney(
    getMoneyInput(nextPayload, previous, "custo_lentes")
  );

  const valorArmacao = roundMoney(
    getMoneyInput(nextPayload, previous, "valor_armacao")
  );
  const valorLentes = roundMoney(
    getMoneyInput(nextPayload, previous, "valor_lentes")
  );
  const valorServicos = roundMoney(
    getMoneyInput(nextPayload, previous, "valor_servicos")
  );
  const valorAdicionais = roundMoney(
    getMoneyInput(nextPayload, previous, "valor_adicionais")
  );

  const brutoCalculado = roundMoney(
    valorArmacao + valorLentes + valorServicos + valorAdicionais
  );

  const valorBruto =
    nextPayload.valor_bruto === null ||
    nextPayload.valor_bruto === undefined ||
    nextPayload.valor_bruto === ""
      ? brutoCalculado
      : roundMoney(nextPayload.valor_bruto);

  const descontoTipo = nextPayload.desconto_tipo || previous?.desconto_tipo || null;
  const descontoPercentual = roundMoney(
    getMoneyInput(nextPayload, previous, "desconto_percentual")
  );
  const descontoValorInformado = roundMoney(
    getMoneyInput(nextPayload, previous, "desconto_valor")
  );

  const descontoValor =
    descontoTipo === "percentual"
      ? roundMoney(valorBruto * (descontoPercentual / 100))
      : descontoValorInformado;

  const valorTotal =
    nextPayload.valor_total === null ||
    nextPayload.valor_total === undefined ||
    nextPayload.valor_total === ""
      ? Math.max(roundMoney(valorBruto - descontoValor), 0)
      : roundMoney(nextPayload.valor_total);

  const valorEntrada = roundMoney(
    getMoneyInput(nextPayload, previous, "valor_entrada")
  );
  const valorRestante =
    nextPayload.valor_restante === null ||
    nextPayload.valor_restante === undefined ||
    nextPayload.valor_restante === ""
      ? Math.max(roundMoney(valorTotal - valorEntrada), 0)
      : roundMoney(nextPayload.valor_restante);

  let statusPagamento = nextPayload.status_pagamento;

  if (!statusPagamento) {
    if (valorTotal > 0 && valorRestante <= 0) {
      statusPagamento = "pago";
    } else if (valorEntrada > 0 && valorRestante > 0) {
      statusPagamento = "parcial";
    } else {
      statusPagamento = "pendente";
    }
  }

  return {
    ...nextPayload,
    custo_armacao: custoArmacao,
    custo_lentes: custoLentes,
    valor_armacao: valorArmacao,
    valor_lentes: valorLentes,
    valor_servicos: valorServicos,
    valor_adicionais: valorAdicionais,
    valor_bruto: valorBruto,
    desconto_valor: descontoValor,
    desconto_percentual: descontoPercentual,
    valor_total: valorTotal,
    valor_entrada: valorEntrada,
    valor_restante: valorRestante,
    status_pagamento: statusPagamento,
  };
}

function prepareOrdemPayload(body = {}, previous = null) {
  const payload = cleanPayload(body);

  payload.prazo_entrega = payload.prazo_entrega_combinado || payload.prazo_entrega || previous?.prazo_entrega || null;
  delete payload.prazo_entrega_combinado;

  const withMoney = prepareMoneyFields(payload, previous);
  const withStatusDates = applyStatusDates(withMoney, previous);

  return withStatusDates;
}

function prepareClientePayload(body = {}) {
  const payload = cleanPayload(body);

  return {
    ...payload,
    nome_completo: normalizeText(payload.nome_completo),
    nome_social: normalizeText(payload.nome_social),
    cpf: normalizeText(payload.cpf),
    rg: normalizeText(payload.rg),
    telefone_principal: normalizeText(payload.telefone_principal),
    telefone_secundario: normalizeText(payload.telefone_secundario),
    email: normalizeText(payload.email),
    cep: normalizeText(payload.cep),
    rua: normalizeText(payload.rua),
    numero: normalizeText(payload.numero),
    complemento: normalizeText(payload.complemento),
    bairro: normalizeText(payload.bairro),
    cidade: normalizeText(payload.cidade),
    estado: normalizeText(payload.estado),
    pais: normalizeText(payload.pais) || "Brasil",
    origem_cliente: normalizeText(payload.origem_cliente),
    profissao: normalizeText(payload.profissao),
    prefere_contato_por: normalizeText(payload.prefere_contato_por) || "indefinido",
    observacoes: normalizeText(payload.observacoes),
    ativo: payload.ativo ?? true,
  };
}

async function checkDuplicateCpf({
  supabase,
  contaId,
  cpf,
  ignoreClienteId = null,
}) {
  if (!cpf) return null;

  let query = supabase
    .from("clientes")
    .select("id")
    .eq("conta_id", contaId)
    .eq("cpf", cpf)
    .limit(1);

  if (ignoreClienteId) {
    query = query.neq("id", ignoreClienteId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.[0] || null;
}

async function createClienteIfNeeded({
  supabase,
  contaId,
  clientePayload,
}) {
  if (!clientePayload) return null;

  const payload = prepareClientePayload(clientePayload);

  if (!payload.nome_completo) {
    return {
      error: NextResponse.json(
        { error: "Informe o nome completo do cliente." },
        { status: 400 }
      ),
    };
  }

  if (!payload.telefone_principal) {
    return {
      error: NextResponse.json(
        { error: "Informe o telefone principal do cliente." },
        { status: 400 }
      ),
    };
  }

  const cpfDuplicado = await checkDuplicateCpf({
    supabase,
    contaId,
    cpf: payload.cpf,
  });

  if (cpfDuplicado) {
    return {
      error: NextResponse.json(
        { error: "Já existe um cliente cadastrado com este CPF." },
        { status: 409 }
      ),
    };
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      ...payload,
      conta_id: contaId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("OS_CREATE_CLIENTE_ERROR:", error);

    return {
      error: NextResponse.json(
        { error: "Não foi possível cadastrar o cliente da OS." },
        { status: 400 }
      ),
    };
  }

  return {
    cliente: data,
    error: null,
  };
}

async function validateClienteExists({ supabase, contaId, clienteId }) {
  if (!clienteId) {
    return {
      error: NextResponse.json(
        { error: "Selecione um cliente para a OS." },
        { status: 400 }
      ),
    };
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", clienteId)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return {
      error: NextResponse.json(
        { error: "Cliente não encontrado nesta conta." },
        { status: 404 }
      ),
    };
  }

  return { error: null };
}

async function validateVendedorExists({ supabase, contaId, vendedorId }) {
  if (!vendedorId) {
    return {
      error: NextResponse.json(
        { error: "Selecione o vendedor responsável pela OS." },
        { status: 400 }
      ),
    };
  }

  const { data, error } = await supabase
    .from("vendedores")
    .select("id, comissao_padrao_percentual, status")
    .eq("id", vendedorId)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return {
      error: NextResponse.json(
        { error: "Vendedor não encontrado nesta conta." },
        { status: 404 }
      ),
    };
  }

  if (data.status !== "ativo") {
    return {
      error: NextResponse.json(
        { error: "O vendedor selecionado não está ativo." },
        { status: 400 }
      ),
    };
  }

  return {
    vendedor: data,
    error: null,
  };
}

function applyComissaoIfMissing(payload = {}, vendedor = null) {
  const nextPayload = { ...payload };

  const percentual =
    nextPayload.comissao_percentual_aplicada === null ||
    nextPayload.comissao_percentual_aplicada === undefined ||
    nextPayload.comissao_percentual_aplicada === ""
      ? toNumber(vendedor?.comissao_padrao_percentual)
      : toNumber(nextPayload.comissao_percentual_aplicada);

  const valorTotal = toNumber(nextPayload.valor_total);
  const valorEstimado =
    nextPayload.comissao_valor_estimado === null ||
    nextPayload.comissao_valor_estimado === undefined ||
    nextPayload.comissao_valor_estimado === ""
      ? roundMoney(valorTotal * (percentual / 100))
      : roundMoney(nextPayload.comissao_valor_estimado);

  return {
    ...nextPayload,
    comissao_percentual_aplicada: percentual,
    comissao_valor_estimado: valorEstimado,
  };
}

function getQuickEditPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => QUICK_EDIT_FIELDS.includes(key))
  );
}

function isOnlyQuickEdit(payload = {}) {
  const keys = Object.keys(payload).filter((key) => key !== "id");

  if (keys.length === 0) return false;

  return keys.every((key) => QUICK_EDIT_FIELDS.includes(key));
}

async function ensureUpdatePermission({
  profile,
  configuracoes,
  previous,
  payload,
}) {
  if (profile.role === "admin") return null;

  if (payload.vendedor_id && payload.vendedor_id !== previous.vendedor_id) {
    return NextResponse.json(
      { error: "Apenas administradores podem alterar o vendedor da OS." },
      { status: 403 }
    );
  }

  const onlyQuickEdit = isOnlyQuickEdit(payload);

  if (!onlyQuickEdit && configuracoes?.permitir_edicao_os_terminal === false) {
    return NextResponse.json(
      { error: "O terminal não tem permissão para editar dados completos da OS." },
      { status: 403 }
    );
  }

  if (
    payload.status &&
    payload.status !== previous.status &&
    configuracoes?.permitir_alterar_status_os_terminal === false
  ) {
    return NextResponse.json(
      { error: "O terminal não tem permissão para alterar status de OS." },
      { status: 403 }
    );
  }

  return null;
}

async function insertHistoricoStatus({
  supabase,
  contaId,
  osId,
  statusAnterior,
  statusNovo,
  profile,
  observacao = null,
}) {
  if (!statusNovo || statusNovo === statusAnterior) return;

  const { error } = await supabase.from("historico_status_os").insert({
    conta_id: contaId,
    os_id: osId,
    status_anterior: statusAnterior || null,
    status_novo: statusNovo,
    alterado_por_tipo: profile.role === "admin" ? "admin" : "terminal",
    alterado_por_admin_id: profile.id,
    observacao,
  });

  if (error) {
    console.error("OS_HISTORICO_STATUS_ERROR:", error);
  }
}

async function insertNestedRecord({
  supabase,
  table,
  contaId,
  clienteId,
  osId,
  payload,
}) {
  if (!hasUsefulData(payload)) return null;

  const clean = cleanPayload(payload);

  const { data, error } = await supabase
    .from(table)
    .insert({
      ...clean,
      conta_id: contaId,
      cliente_id: clienteId,
      os_id: osId,
    })
    .select("*")
    .single();

  if (error) {
    console.error(`OS_${table.toUpperCase()}_INSERT_ERROR:`, error);
    throw error;
  }

  return data;
}

async function upsertNestedRecord({
  supabase,
  table,
  contaId,
  clienteId,
  osId,
  payload,
}) {
  if (!hasUsefulData(payload)) return null;

  const clean = cleanPayload(payload, { keepId: true });
  const id = clean.id;

  delete clean.id;

  if (id) {
    const { data, error } = await supabase
      .from(table)
      .update({
        ...clean,
        cliente_id: clienteId,
        os_id: osId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", contaId)
      .eq("os_id", osId)
      .select("*")
      .single();

    if (error) {
      console.error(`OS_${table.toUpperCase()}_UPDATE_ERROR:`, error);
      throw error;
    }

    return data;
  }

  const { data: existing, error: findError } = await supabase
    .from(table)
    .select("id")
    .eq("conta_id", contaId)
    .eq("os_id", osId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (findError) {
    console.error(`OS_${table.toUpperCase()}_FIND_ERROR:`, findError);
    throw findError;
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from(table)
      .update({
        ...clean,
        cliente_id: clienteId,
        os_id: osId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("conta_id", contaId)
      .eq("os_id", osId)
      .select("*")
      .single();

    if (error) {
      console.error(`OS_${table.toUpperCase()}_UPSERT_UPDATE_ERROR:`, error);
      throw error;
    }

    return data;
  }

  return insertNestedRecord({
    supabase,
    table,
    contaId,
    clienteId,
    osId,
    payload: clean,
  });
}

/* ==========================================================================
   GET /api/ordens-servico
   Lista OS e dados auxiliares para search selects.
   Filtros ficam no front.
   ========================================================================== */

export async function GET() {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const [
      ordensResult,
      clientesResult,
      vendedoresResult,
      catalogoArmacoesResult,
      catalogoLentesResult,
    ] = await Promise.all([
      supabase
        .from("ordens_servico")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("created_at", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("nome_completo", { ascending: true }),

      supabase
        .from("vendedores")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("nome_completo", { ascending: true }),

      supabase
        .from("catalogo_armacoes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("ativo", true)
        .order("ultimo_uso_em", { ascending: false }),

      supabase
        .from("catalogo_lentes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("ativo", true)
        .order("ultimo_uso_em", { ascending: false }),
    ]);

    if (ordensResult.error) {
      console.error("OS_GET_ORDENS_ERROR:", ordensResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as ordens de serviço." },
        { status: 400 }
      );
    }

    if (clientesResult.error) {
      console.error("OS_GET_CLIENTES_ERROR:", clientesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar os clientes." },
        { status: 400 }
      );
    }

    if (vendedoresResult.error) {
      console.error("OS_GET_VENDEDORES_ERROR:", vendedoresResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar os vendedores." },
        { status: 400 }
      );
    }

    if (catalogoArmacoesResult.error) {
      console.error("OS_GET_CATALOGO_ARMACOES_ERROR:", catalogoArmacoesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar o catálogo de armações." },
        { status: 400 }
      );
    }

    if (catalogoLentesResult.error) {
      console.error("OS_GET_CATALOGO_LENTES_ERROR:", catalogoLentesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar o catálogo de lentes." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ordensServico: ordensResult.data || [],
      clientes: clientesResult.data || [],
      vendedores: vendedoresResult.data || [],
      catalogoArmacoes: catalogoArmacoesResult.data || [],
      catalogoLentes: catalogoLentesResult.data || [],
      user: profile,
    });
  } catch (error) {
    console.error("OS_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar ordens de serviço." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/ordens-servico
   Cria OS com payload completo.
   Também aceita cliente rápido, receita, armação e lente.
   ========================================================================== */

export async function POST(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { ordemServico, cliente, receita, armacao, lente } =
      getBodySegments(body);

    let payload = prepareOrdemPayload(ordemServico);

    if (cliente && !payload.cliente_id) {
      const createdCliente = await createClienteIfNeeded({
        supabase,
        contaId: profile.conta_id,
        clientePayload: cliente,
      });

      if (createdCliente.error) return createdCliente.error;

      payload.cliente_id = createdCliente.cliente.id;
    }

    const clienteValidation = await validateClienteExists({
      supabase,
      contaId: profile.conta_id,
      clienteId: payload.cliente_id,
    });

    if (clienteValidation.error) return clienteValidation.error;

    const vendedorValidation = await validateVendedorExists({
      supabase,
      contaId: profile.conta_id,
      vendedorId: payload.vendedor_id,
    });

    if (vendedorValidation.error) return vendedorValidation.error;

    payload = applyComissaoIfMissing(payload, vendedorValidation.vendedor);

    if (!payload.numero_os) {
      payload.numero_os = generateNumeroOS();
    }

    if (!payload.tipo_os) {
      payload.tipo_os = "venda";
    }

    if (!payload.status) {
      payload.status = "cadastrada";
    }

    if (!payload.data_venda) {
      payload.data_venda = new Date().toISOString().slice(0, 10);
    }

    const { data: ordemCriada, error: insertError } = await supabase
      .from("ordens_servico")
      .insert({
        ...payload,
        conta_id: profile.conta_id,
        created_by_admin_id: profile.id,
        updated_by_admin_id: profile.id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("OS_POST_ERROR:", insertError);

      return NextResponse.json(
        { error: "Não foi possível cadastrar a ordem de serviço." },
        { status: 400 }
      );
    }

    await insertHistoricoStatus({
      supabase,
      contaId: profile.conta_id,
      osId: ordemCriada.id,
      statusAnterior: null,
      statusNovo: ordemCriada.status,
      profile,
      observacao: "OS criada.",
    });

    const [receitaCriada, armacaoCriada, lenteCriada] = await Promise.all([
      insertNestedRecord({
        supabase,
        table: "receitas",
        contaId: profile.conta_id,
        clienteId: ordemCriada.cliente_id,
        osId: ordemCriada.id,
        payload: receita,
      }),

      insertNestedRecord({
  supabase,
  table: "armacoes",
  contaId: profile.conta_id,
  osId: ordemCriada.id,
  payload: armacao,
}),

      insertNestedRecord({
        supabase,
        table: "lentes",
        contaId: profile.conta_id,
        clienteId: ordemCriada.cliente_id,
        osId: ordemCriada.id,
        payload: lente,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Ordem de serviço cadastrada com sucesso.",
        ordemServico: ordemCriada,
        receita: receitaCriada,
        armacao: armacaoCriada,
        lente: lenteCriada,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OS_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar ordem de serviço." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT /api/ordens-servico
   Atualiza OS com payload completo.
   Também serve para alteração rápida de status e financeiro na tabela.
   ========================================================================== */

export async function PUT(request) {
  try {
    const {
      supabase,
      profile,
      configuracoes,
      error,
    } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { ordemServico, receita, armacao, lente } = getBodySegments(body);

    const id =
      ordemServico?.id ||
      body?.id ||
      body?.ordem_servico_id ||
      body?.os_id;

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const { data: ordemExistente, error: findError } = await supabase
      .from("ordens_servico")
      .select("*")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !ordemExistente) {
      return NextResponse.json(
        { error: "Ordem de serviço não encontrada." },
        { status: 404 }
      );
    }

    let payload = prepareOrdemPayload(ordemServico, ordemExistente);

    const permissionError = await ensureUpdatePermission({
      profile,
      configuracoes,
      previous: ordemExistente,
      payload,
    });

    if (permissionError) return permissionError;

    if (profile.role !== "admin" && isOnlyQuickEdit(payload)) {
      payload = getQuickEditPayload(payload);
      payload = prepareOrdemPayload(payload, ordemExistente);
    }

    if (!payload.cliente_id) {
      payload.cliente_id = ordemExistente.cliente_id;
    }

    if (!payload.vendedor_id) {
      payload.vendedor_id = ordemExistente.vendedor_id;
    }

    const clienteValidation = await validateClienteExists({
      supabase,
      contaId: profile.conta_id,
      clienteId: payload.cliente_id,
    });

    if (clienteValidation.error) return clienteValidation.error;

    const vendedorValidation = await validateVendedorExists({
      supabase,
      contaId: profile.conta_id,
      vendedorId: payload.vendedor_id,
    });

    if (vendedorValidation.error) return vendedorValidation.error;

    payload = applyComissaoIfMissing(payload, vendedorValidation.vendedor);

    const { data: ordemAtualizada, error: updateError } = await supabase
      .from("ordens_servico")
      .update({
        ...payload,
        updated_by_admin_id: profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("OS_PUT_ERROR:", updateError);

      return NextResponse.json(
        { error: "Não foi possível atualizar a ordem de serviço." },
        { status: 400 }
      );
    }

    await insertHistoricoStatus({
      supabase,
      contaId: profile.conta_id,
      osId: ordemAtualizada.id,
      statusAnterior: ordemExistente.status,
      statusNovo: ordemAtualizada.status,
      profile,
      observacao: body?.observacao_status || null,
    });

    const [receitaAtualizada, armacaoAtualizada, lenteAtualizada] =
      await Promise.all([
        upsertNestedRecord({
          supabase,
          table: "receitas",
          contaId: profile.conta_id,
          clienteId: ordemAtualizada.cliente_id,
          osId: ordemAtualizada.id,
          payload: receita,
        }),

        upsertNestedRecord({
  supabase,
  table: "armacoes",
  contaId: profile.conta_id,
  osId: ordemAtualizada.id,
  payload: armacao,
}),

        upsertNestedRecord({
          supabase,
          table: "lentes",
          contaId: profile.conta_id,
          clienteId: ordemAtualizada.cliente_id,
          osId: ordemAtualizada.id,
          payload: lente,
        }),
      ]);

    return NextResponse.json({
      success: true,
      message: "Ordem de serviço atualizada com sucesso.",
      ordemServico: ordemAtualizada,
      receita: receitaAtualizada,
      armacao: armacaoAtualizada,
      lente: lenteAtualizada,
    });
  } catch (error) {
    console.error("OS_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar ordem de serviço." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE /api/ordens-servico
   Exclui OS.
   Somente admin.
   ========================================================================== */

export async function DELETE(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir ordens de serviço." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const { data: ordemExistente, error: findError } = await supabase
      .from("ordens_servico")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !ordemExistente) {
      return NextResponse.json(
        { error: "Ordem de serviço não encontrada." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("ordens_servico")
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("OS_DELETE_ERROR:", deleteError);

      return NextResponse.json(
        { error: "Não foi possível excluir a ordem de serviço." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ordem de serviço excluída com sucesso.",
    });
  } catch (error) {
    console.error("OS_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir ordem de serviço." },
      { status: 500 }
    );
  }
}
