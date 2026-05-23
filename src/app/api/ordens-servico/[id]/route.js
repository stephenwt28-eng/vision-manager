// src/app/api/ordens-servico/[id]/route.js

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const DOCUMENTOS_BUCKET = "documentos";
const SIGNED_URL_EXPIRES_IN = 60 * 10;

const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

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
  "vendedor",
  "receita",
  "armacao",
  "armação",
  "armacoes",
  "armações",
  "lente",
  "lentes",
  "anexos",
  "documentos",
  "historicoStatus",
  "historico_status",
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
   PARAMS
   ========================================================================== */

async function getRouteId(context) {
  const params = await context?.params;
  return params?.id;
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

  const withMoney = prepareMoneyFields(payload, previous);
  const withStatusDates = applyStatusDates(withMoney, previous);

  return withStatusDates;
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

function safeFileName(name = "documento") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 120);
}

function getFileExtension(file) {
  const byName = file?.name?.split(".")?.pop();

  if (byName && byName !== file.name) {
    return byName.toLowerCase();
  }

  const byMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return byMime[file?.type] || "bin";
}

/* ==========================================================================
   VALIDAÇÕES E PERMISSÕES
   ========================================================================== */

async function getOrdemById({ supabase, contaId, id }) {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*")
    .eq("id", id)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return {
      ordemServico: null,
      error: NextResponse.json(
        { error: "Ordem de serviço não encontrada." },
        { status: 404 }
      ),
    };
  }

  return {
    ordemServico: data,
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

async function ensureAnexoPermission({ profile, configuracoes }) {
  if (profile.role === "admin") return null;

  if (configuracoes?.permitir_anexos_terminal === false) {
    return NextResponse.json(
      { error: "O terminal não tem permissão para gerenciar anexos." },
      { status: 403 }
    );
  }

  return null;
}

/* ==========================================================================
   RELACIONADOS
   ========================================================================== */

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
    console.error("OS_ID_HISTORICO_STATUS_ERROR:", error);
  }
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
      console.error(`OS_ID_${table.toUpperCase()}_UPDATE_ERROR:`, error);
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
    console.error(`OS_ID_${table.toUpperCase()}_FIND_ERROR:`, findError);
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
      console.error(`OS_ID_${table.toUpperCase()}_UPSERT_UPDATE_ERROR:`, error);
      throw error;
    }

    return data;
  }

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
    console.error(`OS_ID_${table.toUpperCase()}_INSERT_ERROR:`, error);
    throw error;
  }

  return data;
}

async function getAnexosWithSignedUrls({ supabase, contaId, osId }) {
  const { data: anexos, error } = await supabase
    .from("anexos")
    .select("*")
    .eq("conta_id", contaId)
    .eq("os_id", osId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OS_ID_ANEXOS_GET_ERROR:", error);
    throw error;
  }

  const anexosWithUrls = await Promise.all(
    (anexos || []).map(async (anexo) => {
      if (!anexo.caminho_storage || !anexo.bucket_storage) {
        return {
          ...anexo,
          signedUrl: null,
          downloadUrl: null,
          signedUrlExpiresIn: SIGNED_URL_EXPIRES_IN,
        };
      }

      const { data: signed, error: signedError } = await supabase.storage
        .from(anexo.bucket_storage)
        .createSignedUrl(anexo.caminho_storage, SIGNED_URL_EXPIRES_IN);

      if (signedError) {
        console.error("OS_ID_SIGNED_URL_ERROR:", signedError);

        return {
          ...anexo,
          signedUrl: null,
          downloadUrl: null,
          signedUrlExpiresIn: SIGNED_URL_EXPIRES_IN,
        };
      }

      return {
        ...anexo,
        signedUrl: signed?.signedUrl || null,
        downloadUrl: signed?.signedUrl || null,
        signedUrlExpiresIn: SIGNED_URL_EXPIRES_IN,
      };
    })
  );

  return anexosWithUrls;
}

/* ==========================================================================
   GET /api/ordens-servico/[id]
   Detalhe completo da OS.
   ========================================================================== */

export async function GET(request, context) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const ordemResult = await getOrdemById({
      supabase,
      contaId: profile.conta_id,
      id,
    });

    if (ordemResult.error) return ordemResult.error;

    const ordemServico = ordemResult.ordemServico;

    const [
      clienteResult,
      vendedorResult,
      receitasResult,
      armacoesResult,
      lentesResult,
      historicoResult,
      anexos,
    ] = await Promise.all([
      supabase
        .from("clientes")
        .select("*")
        .eq("id", ordemServico.cliente_id)
        .eq("conta_id", profile.conta_id)
        .single(),

      supabase
        .from("vendedores")
        .select("*")
        .eq("id", ordemServico.vendedor_id)
        .eq("conta_id", profile.conta_id)
        .single(),

      supabase
        .from("receitas")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("os_id", id)
        .order("created_at", { ascending: false }),

      supabase
        .from("armacoes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("os_id", id)
        .order("created_at", { ascending: false }),

      supabase
        .from("lentes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("os_id", id)
        .order("created_at", { ascending: false }),

      supabase
        .from("historico_status_os")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .eq("os_id", id)
        .order("created_at", { ascending: false }),

      getAnexosWithSignedUrls({
        supabase,
        contaId: profile.conta_id,
        osId: id,
      }),
    ]);

    if (clienteResult.error) {
      console.error("OS_ID_CLIENTE_GET_ERROR:", clienteResult.error);
    }

    if (vendedorResult.error) {
      console.error("OS_ID_VENDEDOR_GET_ERROR:", vendedorResult.error);
    }

    if (receitasResult.error) {
      console.error("OS_ID_RECEITAS_GET_ERROR:", receitasResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as receitas da OS." },
        { status: 400 }
      );
    }

    if (armacoesResult.error) {
      console.error("OS_ID_ARMACOES_GET_ERROR:", armacoesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as armações da OS." },
        { status: 400 }
      );
    }

    if (lentesResult.error) {
      console.error("OS_ID_LENTES_GET_ERROR:", lentesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as lentes da OS." },
        { status: 400 }
      );
    }

    if (historicoResult.error) {
      console.error("OS_ID_HISTORICO_GET_ERROR:", historicoResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar o histórico da OS." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ordemServico,
      cliente: clienteResult.data || null,
      vendedor: vendedorResult.data || null,
      receitas: receitasResult.data || [],
      receita: receitasResult.data?.[0] || null,
      armacoes: armacoesResult.data || [],
      armacao: armacoesResult.data?.[0] || null,
      lentes: lentesResult.data || [],
      lente: lentesResult.data?.[0] || null,
      anexos: anexos || [],
      historicoStatus: historicoResult.data || [],
      user: profile,
    });
  } catch (error) {
    console.error("OS_ID_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar detalhes da ordem de serviço." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT /api/ordens-servico/[id]
   Atualiza OS e seus blocos relacionados.
   ========================================================================== */

export async function PUT(request, context) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const {
      supabase,
      profile,
      configuracoes,
      error,
    } = await getAuthenticatedProfile();

    if (error) return error;

    const ordemResult = await getOrdemById({
      supabase,
      contaId: profile.conta_id,
      id,
    });

    if (ordemResult.error) return ordemResult.error;

    const ordemExistente = ordemResult.ordemServico;

    const body = await request.json();
    const { ordemServico, receita, armacao, lente } = getBodySegments(body);

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
      console.error("OS_ID_PUT_ERROR:", updateError);

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
          clienteId: ordemAtualizada.cliente_id,
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
    console.error("OS_ID_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar ordem de serviço." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/ordens-servico/[id]
   Upload de documento/anexo da OS no bucket privado "documentos".
   Espera multipart/form-data:
   - file
   - tipo_anexo
   - descricao
   - data_documento
   - receita_id opcional
   ========================================================================== */

export async function POST(request, context) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const {
      supabase,
      profile,
      configuracoes,
      error,
    } = await getAuthenticatedProfile();

    if (error) return error;

    const anexoPermissionError = await ensureAnexoPermission({
      profile,
      configuracoes,
    });

    if (anexoPermissionError) return anexoPermissionError;

    const ordemResult = await getOrdemById({
      supabase,
      contaId: profile.conta_id,
      id,
    });

    if (ordemResult.error) return ordemResult.error;

    const ordemServico = ordemResult.ordemServico;

    const formData = await request.formData();

    const file = formData.get("file");
    const tipoAnexo = formData.get("tipo_anexo") || "outro";
    const descricao = normalizeText(formData.get("descricao"));
    const dataDocumento = normalizeText(formData.get("data_documento"));
    const receitaId = normalizeText(formData.get("receita_id"));

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Envie um arquivo válido." },
        { status: 400 }
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Formato não permitido. Envie JPG, PNG, WEBP ou PDF.",
        },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo deve ter no máximo 20MB." },
        { status: 400 }
      );
    }

    const extension = getFileExtension(file);
    const originalName = file.name || `documento.${extension}`;
    const storageName = `${crypto.randomUUID()}-${safeFileName(originalName)}`;
    const storagePath = `${profile.conta_id}/ordens-servico/${id}/${storageName}`;

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTOS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("OS_ID_UPLOAD_STORAGE_ERROR:", uploadError);

      return NextResponse.json(
        { error: "Não foi possível enviar o documento." },
        { status: 400 }
      );
    }

    const { data: anexo, error: insertError } = await supabase
      .from("anexos")
      .insert({
        conta_id: profile.conta_id,
        cliente_id: ordemServico.cliente_id,
        os_id: ordemServico.id,
        receita_id: receitaId || null,
        tipo_anexo: tipoAnexo,
        nome_original: originalName,
        nome_arquivo_storage: storageName,
        bucket_storage: DOCUMENTOS_BUCKET,
        caminho_storage: storagePath,
        mime_type: file.type,
        tamanho_bytes: file.size,
        descricao,
        data_documento: dataDocumento || null,
        uploaded_by_admin_id: profile.id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("OS_ID_UPLOAD_INSERT_ERROR:", insertError);

      await supabase.storage
        .from(DOCUMENTOS_BUCKET)
        .remove([storagePath]);

      return NextResponse.json(
        { error: "Não foi possível registrar o documento da OS." },
        { status: 400 }
      );
    }

    const { data: signed } = await supabase.storage
      .from(DOCUMENTOS_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN);

    return NextResponse.json(
      {
        success: true,
        message: "Documento anexado com sucesso.",
        anexo: {
          ...anexo,
          signedUrl: signed?.signedUrl || null,
          downloadUrl: signed?.signedUrl || null,
          signedUrlExpiresIn: SIGNED_URL_EXPIRES_IN,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OS_ID_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao anexar documento da OS." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE /api/ordens-servico/[id]
   - ?anexoId=uuid => remove anexo/documento
   - sem anexoId => exclui a OS inteira, somente admin
   ========================================================================== */

export async function DELETE(request, context) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { error: "ID da ordem de serviço não informado." },
        { status: 400 }
      );
    }

    const {
      supabase,
      profile,
      configuracoes,
      error,
    } = await getAuthenticatedProfile();

    if (error) return error;

    const { searchParams } = new URL(request.url);
    const anexoId = searchParams.get("anexoId");

    const ordemResult = await getOrdemById({
      supabase,
      contaId: profile.conta_id,
      id,
    });

    if (ordemResult.error) return ordemResult.error;

    if (anexoId) {
      const anexoPermissionError = await ensureAnexoPermission({
        profile,
        configuracoes,
      });

      if (anexoPermissionError) return anexoPermissionError;

      const { data: anexo, error: anexoError } = await supabase
        .from("anexos")
        .select("*")
        .eq("id", anexoId)
        .eq("os_id", id)
        .eq("conta_id", profile.conta_id)
        .single();

      if (anexoError || !anexo) {
        return NextResponse.json(
          { error: "Documento não encontrado." },
          { status: 404 }
        );
      }

      const { error: deleteAnexoError } = await supabase
        .from("anexos")
        .delete()
        .eq("id", anexoId)
        .eq("os_id", id)
        .eq("conta_id", profile.conta_id);

      if (deleteAnexoError) {
        console.error("OS_ID_DELETE_ANEXO_DB_ERROR:", deleteAnexoError);

        return NextResponse.json(
          { error: "Não foi possível remover o documento." },
          { status: 400 }
        );
      }

      if (anexo.bucket_storage && anexo.caminho_storage) {
        const { error: storageError } = await supabase.storage
          .from(anexo.bucket_storage)
          .remove([anexo.caminho_storage]);

        if (storageError) {
          console.error("OS_ID_DELETE_ANEXO_STORAGE_ERROR:", storageError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Documento removido com sucesso.",
      });
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir ordens de serviço." },
        { status: 403 }
      );
    }

    const { data: anexos, error: anexosError } = await supabase
      .from("anexos")
      .select("bucket_storage, caminho_storage")
      .eq("conta_id", profile.conta_id)
      .eq("os_id", id);

    if (anexosError) {
      console.error("OS_ID_DELETE_LIST_ANEXOS_ERROR:", anexosError);
    }

    const { error: deleteError } = await supabase
      .from("ordens_servico")
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("OS_ID_DELETE_ERROR:", deleteError);

      return NextResponse.json(
        { error: "Não foi possível excluir a ordem de serviço." },
        { status: 400 }
      );
    }

    const storagePaths = (anexos || [])
      .filter((anexo) => anexo.bucket_storage && anexo.caminho_storage)
      .map((anexo) => anexo.caminho_storage);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTOS_BUCKET)
        .remove(storagePaths);

      if (storageError) {
        console.error("OS_ID_DELETE_STORAGE_ERROR:", storageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Ordem de serviço excluída com sucesso.",
    });
  } catch (error) {
    console.error("OS_ID_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir ordem de serviço." },
      { status: 500 }
    );
  }
}
