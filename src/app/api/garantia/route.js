// src/app/api/garantia/route.js

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const FINAL_STATUS = ["resolvida", "cancelada", "recusada"];
const RETURNED_FROM_LAB_STATUS = ["aprovada", "recusada", "resolvida"];

const NESTED_KEYS = [
  "garantia",
  "ordemServico",
  "ordem_servico",
  "os",
  "cliente",
  "vendedor",
  "lente",
  "lentes",
  "armacao",
  "armação",
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

  return {
    supabase,
    profile,
    error: null,
  };
}

/* ==========================================================================
   HELPERS
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
    responsavel_abertura_id,
    responsavel_finalizacao_id,
    data_ocorrencia_status,
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

function getGarantiaSegment(body = {}) {
  return body.garantia || body;
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

function prepareMoneyFields(payload = {}) {
  return {
    ...payload,
    custo_garantia: roundMoney(payload.custo_garantia),
    valor_cobrado_cliente: roundMoney(payload.valor_cobrado_cliente),
  };
}

function getStatusOccurrenceDate(payload = {}, previous = null) {
  return (
    payload.data_ocorrencia_status ||
    previous?.data_ocorrencia_status ||
    new Date().toISOString().slice(0, 10)
  );
}

function applyStatusDates(payload = {}, previous = null) {
  const nextPayload = { ...payload };

  const nextStatus = nextPayload.status_garantia;
  const previousStatus = previous?.status_garantia;

  if (!nextStatus || nextStatus === previousStatus) {
    return nextPayload;
  }

  const occurrenceDate = getStatusOccurrenceDate(nextPayload, previous);

  if (nextStatus === "enviada_laboratorio") {
    nextPayload.data_envio_laboratorio =
      nextPayload.data_envio_laboratorio || occurrenceDate;
  }

  if (
    nextStatus === "aguardando_retorno" &&
    !nextPayload.data_envio_laboratorio
  ) {
    nextPayload.data_envio_laboratorio = occurrenceDate;
  }

  if (
    RETURNED_FROM_LAB_STATUS.includes(nextStatus) &&
    !nextPayload.data_retorno_laboratorio
  ) {
    nextPayload.data_retorno_laboratorio = occurrenceDate;
  }

  if (FINAL_STATUS.includes(nextStatus) && !nextPayload.data_finalizacao) {
    nextPayload.data_finalizacao = occurrenceDate;
  }

  return nextPayload;
}

function prepareGarantiaPayload(body = {}, previous = null) {
  const payload = cleanPayload(body, { keepId: Boolean(previous) });

  const withMoney = prepareMoneyFields(payload);
  const withStatusDates = applyStatusDates(withMoney, previous);

  return withStatusDates;
}

async function insertHistoricoStatusGarantia({
  supabase,
  contaId,
  garantiaId,
  statusAnterior,
  statusNovo,
  profile,
  dataOcorrencia,
  observacao = null,
}) {
  if (!statusNovo || statusNovo === statusAnterior) return;

  const { error } = await supabase.from("historico_status_garantia").insert({
    conta_id: contaId,
    garantia_id: garantiaId,
    status_anterior: statusAnterior || null,
    status_novo: statusNovo,
    data_ocorrencia:
      dataOcorrencia || new Date().toISOString().slice(0, 10),
    alterado_por_tipo: profile.role === "admin" ? "admin" : "terminal",
    alterado_por_admin_id: profile.id,
    observacao,
  });

  if (error) {
    console.error("GARANTIA_HISTORICO_STATUS_ERROR:", error);
  }
}

async function getOrdemServicoOriginal({ supabase, contaId, osId }) {
  if (!osId) {
    return {
      error: NextResponse.json(
        { error: "Selecione a OS original da garantia." },
        { status: 400 }
      ),
    };
  }

  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*")
    .eq("id", osId)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return {
      error: NextResponse.json(
        { error: "OS original não encontrada nesta conta." },
        { status: 404 }
      ),
    };
  }

  return {
    ordemServico: data,
    error: null,
  };
}

async function getLenteOriginal({ supabase, contaId, osId, lenteId = null }) {
  let query = supabase
    .from("lentes")
    .select("*")
    .eq("conta_id", contaId);

  if (lenteId) {
    query = query.eq("id", lenteId);
  } else {
    query = query.eq("os_id", osId).order("created_at", { ascending: true }).limit(1);
  }

  const { data, error } = lenteId ? await query.maybeSingle() : await query;

  if (error) {
    console.error("GARANTIA_GET_LENTE_ORIGINAL_ERROR:", error);
    return null;
  }

  if (Array.isArray(data)) {
    return data?.[0] || null;
  }

  return data || null;
}

function applySnapshotFromOs(payload = {}, ordemServico = {}, lente = null) {
  const nextPayload = { ...payload };

  nextPayload.os_id = nextPayload.os_id || ordemServico.id;
  nextPayload.cliente_id = nextPayload.cliente_id || ordemServico.cliente_id;
  nextPayload.vendedor_id = nextPayload.vendedor_id || ordemServico.vendedor_id;

  nextPayload.numero_os_original =
    nextPayload.numero_os_original || ordemServico.numero_os || null;

  nextPayload.numero_nf = nextPayload.numero_nf || ordemServico.numero_nf || null;

  nextPayload.pedido_laboratorio_numero =
    nextPayload.pedido_laboratorio_numero ||
    ordemServico.pedido_laboratorio_numero ||
    null;

  nextPayload.laboratorio_nome =
    nextPayload.laboratorio_nome || ordemServico.laboratorio_nome || null;

  nextPayload.telefone_laboratorio =
    nextPayload.telefone_laboratorio || ordemServico.telefone_laboratorio || null;

  if (lente) {
    nextPayload.lente_original_id = nextPayload.lente_original_id || lente.id;

    nextPayload.lente_tipo = nextPayload.lente_tipo || lente.tipo_lente || null;
    nextPayload.lente_marca = nextPayload.lente_marca || lente.marca || null;
    nextPayload.lente_linha = nextPayload.lente_linha || lente.linha || null;
    nextPayload.lente_laboratorio =
      nextPayload.lente_laboratorio || lente.laboratorio || null;
    nextPayload.lente_material = nextPayload.lente_material || lente.material || null;
    nextPayload.lente_indice_refracao =
      nextPayload.lente_indice_refracao || lente.indice_refracao || null;

    nextPayload.tratamento_antirreflexo =
      nextPayload.tratamento_antirreflexo || lente.tratamento_antirreflexo || null;

    nextPayload.tratamento_filtro_azul =
      nextPayload.tratamento_filtro_azul ?? lente.tratamento_filtro_azul ?? false;

    nextPayload.tratamento_fotossensivel =
      nextPayload.tratamento_fotossensivel ?? lente.tratamento_fotossensivel ?? false;

    nextPayload.tratamento_polarizado =
      nextPayload.tratamento_polarizado ?? lente.tratamento_polarizado ?? false;

    nextPayload.tratamento_uv =
      nextPayload.tratamento_uv ?? lente.tratamento_uv ?? false;

    nextPayload.tratamento_risco =
      nextPayload.tratamento_risco ?? lente.tratamento_risco ?? false;
  }

  return nextPayload;
}

async function validateClienteBelongsToConta({
  supabase,
  contaId,
  clienteId,
}) {
  if (!clienteId) {
    return NextResponse.json(
      { error: "Cliente da garantia não informado." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", clienteId)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Cliente não encontrado nesta conta." },
      { status: 404 }
    );
  }

  return null;
}

/* ==========================================================================
   GET /api/garantia
   Busca garantias e dados auxiliares.
   Filtros ficam no front.
   ========================================================================== */

export async function GET() {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const [
      garantiasResult,
      historicoStatusResult,
      ordensResult,
      clientesResult,
      vendedoresResult,
      lentesResult,
    ] = await Promise.all([
      supabase
        .from("garantias")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("created_at", { ascending: false }),

      supabase
        .from("historico_status_garantia")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("created_at", { ascending: false }),

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
        .from("lentes")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("created_at", { ascending: false }),
    ]);

    if (garantiasResult.error) {
      console.error("GARANTIA_GET_GARANTIAS_ERROR:", garantiasResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as garantias." },
        { status: 400 }
      );
    }

    if (ordensResult.error) {
      console.error("GARANTIA_GET_ORDENS_ERROR:", ordensResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as ordens de serviço." },
        { status: 400 }
      );
    }

    if (historicoStatusResult.error) {
      console.error(
        "GARANTIA_GET_HISTORICO_STATUS_ERROR:",
        historicoStatusResult.error
      );

      return NextResponse.json(
        { error: "Não foi possível buscar o histórico das garantias." },
        { status: 400 }
      );
    }

    if (clientesResult.error) {
      console.error("GARANTIA_GET_CLIENTES_ERROR:", clientesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar os clientes." },
        { status: 400 }
      );
    }

    if (vendedoresResult.error) {
      console.error("GARANTIA_GET_VENDEDORES_ERROR:", vendedoresResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar os vendedores." },
        { status: 400 }
      );
    }

    if (lentesResult.error) {
      console.error("GARANTIA_GET_LENTES_ERROR:", lentesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as lentes." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      garantias: garantiasResult.data || [],
      historicoStatusGarantia: historicoStatusResult.data || [],
      ordensServico: ordensResult.data || [],
      clientes: clientesResult.data || [],
      vendedores: vendedoresResult.data || [],
      lentes: lentesResult.data || [],
      user: profile,
    });
  } catch (error) {
    console.error("GARANTIA_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar garantias." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/garantia
   Cria garantia vinculada a uma OS existente.
   Recebe body completo.
   ========================================================================== */

export async function POST(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const garantiaBody = getGarantiaSegment(body);
    const dataOcorrenciaStatus =
      garantiaBody?.data_ocorrencia_status ||
      body?.data_ocorrencia_status ||
      null;
    const observacaoStatus =
      garantiaBody?.observacao_status || body?.observacao_status || null;

    let payload = prepareGarantiaPayload(garantiaBody);

    const osOriginal = await getOrdemServicoOriginal({
      supabase,
      contaId: profile.conta_id,
      osId: payload.os_id || body.os_id,
    });

    if (osOriginal.error) return osOriginal.error;

    const lenteOriginal = await getLenteOriginal({
      supabase,
      contaId: profile.conta_id,
      osId: osOriginal.ordemServico.id,
      lenteId: payload.lente_original_id,
    });

    payload = applySnapshotFromOs(
      payload,
      osOriginal.ordemServico,
      lenteOriginal
    );

    const clienteError = await validateClienteBelongsToConta({
      supabase,
      contaId: profile.conta_id,
      clienteId: payload.cliente_id,
    });

    if (clienteError) return clienteError;

    if (!payload.status_garantia) {
      payload.status_garantia = "aberta";
    }

    if (!payload.data_abertura) {
      payload.data_abertura = new Date().toISOString().slice(0, 10);
    }

    const { data: garantiaCriada, error: insertError } = await supabase
      .from("garantias")
      .insert({
        ...payload,
        conta_id: profile.conta_id,
        responsavel_abertura_id: profile.id,
        created_by_admin_id: profile.id,
        updated_by_admin_id: profile.id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("GARANTIA_POST_ERROR:", insertError);

      return NextResponse.json(
        { error: "Não foi possível cadastrar a garantia." },
        { status: 400 }
      );
    }

    await insertHistoricoStatusGarantia({
      supabase,
      contaId: profile.conta_id,
      garantiaId: garantiaCriada.id,
      statusAnterior: null,
      statusNovo: garantiaCriada.status_garantia,
      profile,
      dataOcorrencia:
        dataOcorrenciaStatus || garantiaCriada.data_abertura || null,
      observacao: observacaoStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Garantia cadastrada com sucesso.",
        garantia: garantiaCriada,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("GARANTIA_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar garantia." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT /api/garantia
   Atualiza garantia com payload completo.
   ========================================================================== */

export async function PUT(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const garantiaBody = getGarantiaSegment(body);
    const dataOcorrenciaStatus =
      garantiaBody?.data_ocorrencia_status ||
      body?.data_ocorrencia_status ||
      null;
    const observacaoStatus =
      garantiaBody?.observacao_status || body?.observacao_status || null;

    const id = garantiaBody?.id || body?.id || body?.garantia_id;

    if (!id) {
      return NextResponse.json(
        { error: "ID da garantia não informado." },
        { status: 400 }
      );
    }

    const { data: garantiaExistente, error: findError } = await supabase
      .from("garantias")
      .select("*")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !garantiaExistente) {
      return NextResponse.json(
        { error: "Garantia não encontrada." },
        { status: 404 }
      );
    }

    let payload = prepareGarantiaPayload(garantiaBody, garantiaExistente);

    const osId = payload.os_id || garantiaExistente.os_id;

    const osOriginal = await getOrdemServicoOriginal({
      supabase,
      contaId: profile.conta_id,
      osId,
    });

    if (osOriginal.error) return osOriginal.error;

    const lenteOriginal = await getLenteOriginal({
      supabase,
      contaId: profile.conta_id,
      osId: osOriginal.ordemServico.id,
      lenteId: payload.lente_original_id || garantiaExistente.lente_original_id,
    });

    payload = applySnapshotFromOs(
      payload,
      osOriginal.ordemServico,
      lenteOriginal
    );

    const clienteError = await validateClienteBelongsToConta({
      supabase,
      contaId: profile.conta_id,
      clienteId: payload.cliente_id,
    });

    if (clienteError) return clienteError;

    const shouldSetFinalizador =
      FINAL_STATUS.includes(payload.status_garantia) &&
      !garantiaExistente.responsavel_finalizacao_id;

    const { data: garantiaAtualizada, error: updateError } = await supabase
      .from("garantias")
      .update({
        ...payload,
        responsavel_finalizacao_id: shouldSetFinalizador
          ? profile.id
          : garantiaExistente.responsavel_finalizacao_id,
        updated_by_admin_id: profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("GARANTIA_PUT_ERROR:", updateError);

      return NextResponse.json(
        { error: "Não foi possível atualizar a garantia." },
        { status: 400 }
      );
    }

    await insertHistoricoStatusGarantia({
      supabase,
      contaId: profile.conta_id,
      garantiaId: garantiaAtualizada.id,
      statusAnterior: garantiaExistente.status_garantia,
      statusNovo: garantiaAtualizada.status_garantia,
      profile,
      dataOcorrencia:
        dataOcorrenciaStatus ||
        garantiaAtualizada.data_finalizacao ||
        garantiaAtualizada.data_retorno_laboratorio ||
        garantiaAtualizada.data_envio_laboratorio ||
        null,
      observacao: observacaoStatus,
    });

    const { data: historicoStatusGarantia } = await supabase
      .from("historico_status_garantia")
      .select("*")
      .eq("conta_id", profile.conta_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      message: "Garantia atualizada com sucesso.",
      garantia: garantiaAtualizada,
      historicoStatusGarantia: historicoStatusGarantia || [],
    });
  } catch (error) {
    console.error("GARANTIA_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar garantia." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE /api/garantia
   Exclui garantia.
   Somente admin.
   ========================================================================== */

export async function DELETE(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir garantias." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da garantia não informado." },
        { status: 400 }
      );
    }

    const { data: garantiaExistente, error: findError } = await supabase
      .from("garantias")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !garantiaExistente) {
      return NextResponse.json(
        { error: "Garantia não encontrada." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("garantias")
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("GARANTIA_DELETE_ERROR:", deleteError);

      return NextResponse.json(
        { error: "Não foi possível excluir a garantia." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Garantia excluída com sucesso.",
    });
  } catch (error) {
    console.error("GARANTIA_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir garantia." },
      { status: 500 }
    );
  }
}
