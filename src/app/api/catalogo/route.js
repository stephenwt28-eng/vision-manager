import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   AUTH
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
   CONFIG
   ========================================================================== */

const catalogConfig = {
  lentes: {
    table: "catalogo_lentes",
    listKey: "lentes",
    singleKey: "lente",
    label: "lente",
    required: ["tipo_lente"],
    orderBy: [
      ["ultimo_uso_em", false],
      ["created_at", false],
    ],
    allowedFields: [
      "chave_catalogo",
      "tipo_lente",
      "marca",
      "linha",
      "laboratorio",
      "material",
      "indice_refracao",
      "tratamento_antirreflexo",
      "tratamento_filtro_azul",
      "tratamento_fotossensivel",
      "tratamento_polarizado",
      "tratamento_uv",
      "tratamento_risco",
      "coloracao",
      "tonalidade",
      "curva_base",
      "diametro",
      "garantia_meses",
      "custo",
      "quantidade_usos",
      "ultimo_uso_em",
      "ativo",
    ],
    textFields: [
      "chave_catalogo",
      "tipo_lente",
      "marca",
      "linha",
      "laboratorio",
      "material",
      "indice_refracao",
      "tratamento_antirreflexo",
      "coloracao",
      "tonalidade",
      "curva_base",
      "diametro",
    ],
    numberFields: ["garantia_meses", "custo", "quantidade_usos"],
    booleanFields: [
      "tratamento_filtro_azul",
      "tratamento_fotossensivel",
      "tratamento_polarizado",
      "tratamento_uv",
      "tratamento_risco",
      "ativo",
    ],
  },

  armacoes: {
    table: "catalogo_armacoes",
    listKey: "armacoes",
    singleKey: "armacao",
    label: "armação",
    required: ["marca"],
    orderBy: [
      ["ultimo_uso_em", false],
      ["created_at", false],
    ],
    allowedFields: [
      "chave_catalogo",
      "marca",
      "modelo",
      "referencia",
      "codigo_interno",
      "codigo_barras",
      "cor",
      "material",
      "formato",
      "tamanho_texto",
      "aro",
      "diagonal_maior",
      "ponte",
      "haste",
      "largura_total",
      "altura_lente",
      "tipo_armacao",
      "genero_indicado",
      "custo",
      "quantidade_usos",
      "ultimo_uso_em",
      "ativo",
    ],
    textFields: [
      "chave_catalogo",
      "marca",
      "modelo",
      "referencia",
      "codigo_interno",
      "codigo_barras",
      "cor",
      "material",
      "formato",
      "tamanho_texto",
      "diagonal_maior",
      "tipo_armacao",
      "genero_indicado",
    ],
    numberFields: [
      "aro",
      "ponte",
      "haste",
      "largura_total",
      "altura_lente",
      "custo",
      "quantidade_usos",
    ],
    booleanFields: ["ativo"],
  },

  laboratorios: {
    table: "catalogo_laboratorios",
    listKey: "laboratorios",
    singleKey: "laboratorio",
    label: "laboratório",
    required: ["nome"],
    orderBy: [
      ["ultimo_uso_em", false],
      ["created_at", false],
    ],
    allowedFields: [
      "nome",
      "telefone",
      "quantidade_usos",
      "ultimo_uso_em",
      "ativo",
    ],
    textFields: ["nome", "telefone"],
    numberFields: ["quantidade_usos"],
    booleanFields: ["ativo"],
  },
};

function getConfig(tipo) {
  return catalogConfig[tipo] || null;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function cleanPayload(body = {}) {
  const { id, conta_id, created_at, updated_at, tipo, ...payload } = body;

  return payload;
}

function normalizeText(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function normalizeNumber(value, fallback = null) {
  if (value === "" || value === null || value === undefined) return fallback;

  const parsed = Number(String(value).replace(",", "."));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
}

function slugText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildArmacaoCatalogKey(payload = {}) {
  return [
    payload.marca,
    payload.modelo,
    payload.referencia,
    payload.codigo_interno,
    payload.codigo_barras,
    payload.cor,
    payload.tamanho_texto,
  ]
    .map(slugText)
    .filter(Boolean)
    .join("|");
}

function buildLenteCatalogKey(payload = {}) {
  return [
    payload.tipo_lente,
    payload.marca,
    payload.linha,
    payload.laboratorio,
    payload.material,
    payload.indice_refracao,
    payload.tratamento_antirreflexo,
  ]
    .map(slugText)
    .filter(Boolean)
    .join("|");
}

function buildCatalogKey(tipo, payload = {}) {
  if (payload.chave_catalogo) return slugText(payload.chave_catalogo);

  if (tipo === "armacoes") {
    return buildArmacaoCatalogKey(payload);
  }

  if (tipo === "lentes") {
    return buildLenteCatalogKey(payload);
  }

  return null;
}

function normalizeCatalogPayload(tipo, body = {}) {
  const config = getConfig(tipo);
  const rawPayload = cleanPayload(body);
  const payload = {};

  for (const field of config.allowedFields) {
    if (!(field in rawPayload)) continue;

    if (config.textFields.includes(field)) {
      payload[field] = normalizeText(rawPayload[field]);
      continue;
    }

    if (config.numberFields.includes(field)) {
      const fallback = field === "custo" ? 0 : null;
      payload[field] = normalizeNumber(rawPayload[field], fallback);
      continue;
    }

    if (config.booleanFields.includes(field)) {
      const fallback = field === "ativo" ? true : false;
      payload[field] = normalizeBoolean(rawPayload[field], fallback);
      continue;
    }

    payload[field] = rawPayload[field];
  }

  if (tipo === "lentes" || tipo === "armacoes") {
    payload.chave_catalogo = buildCatalogKey(tipo, payload);
  }

  if (tipo === "laboratorios" && payload.nome) {
    payload.nome = normalizeText(payload.nome);
  }

  if (!("ativo" in payload)) {
    payload.ativo = true;
  }

  if (!("quantidade_usos" in payload)) {
    payload.quantidade_usos = 1;
  }

  if (!("ultimo_uso_em" in payload)) {
    payload.ultimo_uso_em = new Date().toISOString();
  }

  return payload;
}

function validatePayload(tipo, payload = {}) {
  const config = getConfig(tipo);

  if (!config) {
    return "Tipo de catálogo inválido.";
  }

  for (const field of config.required) {
    if (!payload[field]) {
      if (field === "tipo_lente") return "Informe o tipo da lente.";
      if (field === "marca") return "Informe a marca da armação.";
      if (field === "nome") return "Informe o nome do laboratório.";

      return `Informe o campo obrigatório: ${field}.`;
    }
  }

  if ((tipo === "lentes" || tipo === "armacoes") && !payload.chave_catalogo) {
    return "Informe dados suficientes para gerar a chave do catálogo.";
  }

  return null;
}

async function checkDuplicateCatalogItem({
  supabase,
  contaId,
  tipo,
  payload,
  ignoreId = null,
}) {
  const config = getConfig(tipo);

  if (!config) return null;

  let query = supabase
    .from(config.table)
    .select("id")
    .eq("conta_id", contaId)
    .limit(1);

  if (tipo === "laboratorios") {
    query = query.eq("nome", payload.nome);
  } else {
    query = query.eq("chave_catalogo", payload.chave_catalogo);
  }

  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function getCatalogItem({ supabase, contaId, tipo, id }) {
  const config = getConfig(tipo);

  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", id)
    .eq("conta_id", contaId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

function applyOrdering(query, orderBy = []) {
  let nextQuery = query;

  for (const [column, ascending] of orderBy) {
    nextQuery = nextQuery.order(column, { ascending });
  }

  return nextQuery;
}

function getCurrentYearRange() {
  const now = new Date();
  const year = now.getFullYear();

  return {
    start: new Date(year, 0, 1),
    end: new Date(year + 1, 0, 1),
  };
}

function isDateWithinCurrentYear(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  const range = getCurrentYearRange();

  return date >= range.start && date < range.end;
}

async function getLaboratorioCurrentYearSpendMap({ supabase, contaId }) {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("laboratorio_nome, custo_lentes, data_venda, created_at, status")
    .eq("conta_id", contaId)
    .not("laboratorio_nome", "is", null);

  if (error) {
    throw error;
  }

  const totals = new Map();

  for (const ordem of data || []) {
    if (ordem?.status === "cancelada") continue;

    const referenceDate = ordem?.data_venda || ordem?.created_at;

    if (!isDateWithinCurrentYear(referenceDate)) continue;

    const laboratorioKey = slugText(ordem?.laboratorio_nome);

    if (!laboratorioKey) continue;

    totals.set(
      laboratorioKey,
      (totals.get(laboratorioKey) || 0) + Number(ordem?.custo_lentes || 0)
    );
  }

  return totals;
}

function attachLaboratorioCurrentYearSpend(items = [], spendMap = new Map()) {
  return items.map((item) => ({
    ...item,
    gasto_ano_atual: Number(spendMap.get(slugText(item?.nome)) || 0),
  }));
}

/* ==========================================================================
   GET /api/catalogo
   GET /api/catalogo?tipo=lentes
   GET /api/catalogo?tipo=armacoes
   GET /api/catalogo?tipo=laboratorios
   GET /api/catalogo?tipo=lentes&id=uuid
   ========================================================================== */

export async function GET(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const id = searchParams.get("id");
    const somenteAtivos = searchParams.get("ativos") !== "false";

    if (tipo) {
      const config = getConfig(tipo);

      if (!config) {
        return NextResponse.json(
          { error: "Tipo de catálogo inválido." },
          { status: 400 }
        );
      }

      if (id) {
        const item = await getCatalogItem({
          supabase,
          contaId: profile.conta_id,
          tipo,
          id,
        });

        if (!item) {
          return NextResponse.json(
            { error: `${config.label} não encontrado.` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          [config.singleKey]: item,
        });
      }

      let query = supabase
        .from(config.table)
        .select("*")
        .eq("conta_id", profile.conta_id);

      if (somenteAtivos) {
        query = query.eq("ativo", true);
      }

      query = applyOrdering(query, config.orderBy);

      const { data, error: listError } = await query;

      if (listError) {
        console.error("CATALOGO_GET_LIST_ERROR:", listError);

        return NextResponse.json(
          { error: `Não foi possível buscar ${config.label}.` },
          { status: 400 }
        );
      }

      const items =
        tipo === "laboratorios"
          ? attachLaboratorioCurrentYearSpend(
              data || [],
              await getLaboratorioCurrentYearSpendMap({
                supabase,
                contaId: profile.conta_id,
              })
            )
          : data || [];

      return NextResponse.json({
        success: true,
        [config.listKey]: items,
      });
    }

    const [
      lentesResult,
      armacoesResult,
      laboratoriosResult,
      laboratorioSpendMap,
    ] = await Promise.all([
      applyOrdering(
        supabase
          .from("catalogo_lentes")
          .select("*")
          .eq("conta_id", profile.conta_id)
          .eq("ativo", true),
        catalogConfig.lentes.orderBy
      ),

      applyOrdering(
        supabase
          .from("catalogo_armacoes")
          .select("*")
          .eq("conta_id", profile.conta_id)
          .eq("ativo", true),
        catalogConfig.armacoes.orderBy
      ),

      applyOrdering(
        supabase
          .from("catalogo_laboratorios")
          .select("*")
          .eq("conta_id", profile.conta_id)
          .eq("ativo", true),
        catalogConfig.laboratorios.orderBy
      ),

      getLaboratorioCurrentYearSpendMap({
        supabase,
        contaId: profile.conta_id,
      }),
    ]);

    if (lentesResult.error) {
      console.error("CATALOGO_GET_LENTES_ERROR:", lentesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as lentes." },
        { status: 400 }
      );
    }

    if (armacoesResult.error) {
      console.error("CATALOGO_GET_ARMACOES_ERROR:", armacoesResult.error);

      return NextResponse.json(
        { error: "Não foi possível buscar as armações." },
        { status: 400 }
      );
    }

    if (laboratoriosResult.error) {
      console.error(
        "CATALOGO_GET_LABORATORIOS_ERROR:",
        laboratoriosResult.error
      );

      return NextResponse.json(
        { error: "Não foi possível buscar os laboratórios." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      catalogo: {
        lentes: lentesResult.data || [],
        armacoes: armacoesResult.data || [],
        laboratorios: attachLaboratorioCurrentYearSpend(
          laboratoriosResult.data || [],
          laboratorioSpendMap
        ),
      },
    });
  } catch (error) {
    console.error("CATALOGO_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar catálogo." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/catalogo
   Body: { tipo: "lentes" | "armacoes" | "laboratorios", ...dados }
   ========================================================================== */

export async function POST(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { tipo } = body;

    const config = getConfig(tipo);

    if (!config) {
      return NextResponse.json(
        { error: "Tipo de catálogo inválido." },
        { status: 400 }
      );
    }

    const payload = normalizeCatalogPayload(tipo, body);
    const validationError = validatePayload(tipo, payload);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const duplicated = await checkDuplicateCatalogItem({
      supabase,
      contaId: profile.conta_id,
      tipo,
      payload,
    });

    if (duplicated) {
      return NextResponse.json(
        { error: `Este item já existe no catálogo de ${config.label}.` },
        { status: 409 }
      );
    }

    const { data, error: insertError } = await supabase
      .from(config.table)
      .insert({
        ...payload,
        conta_id: profile.conta_id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("CATALOGO_POST_ERROR:", insertError);

      return NextResponse.json(
        { error: `Não foi possível cadastrar ${config.label}.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${capitalize(config.label)} cadastrado com sucesso.`,
        [config.singleKey]: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CATALOGO_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar item no catálogo." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT /api/catalogo
   Body: { id, tipo: "lentes" | "armacoes" | "laboratorios", ...dados }
   ========================================================================== */

export async function PUT(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { id, tipo } = body;

    const config = getConfig(tipo);

    if (!config) {
      return NextResponse.json(
        { error: "Tipo de catálogo inválido." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID do item não informado." },
        { status: 400 }
      );
    }

    const existing = await getCatalogItem({
      supabase,
      contaId: profile.conta_id,
      tipo,
      id,
    });

    if (!existing) {
      return NextResponse.json(
        { error: `${capitalize(config.label)} não encontrado.` },
        { status: 404 }
      );
    }

    const payload = normalizeCatalogPayload(tipo, body);
    const validationError = validatePayload(tipo, payload);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const duplicated = await checkDuplicateCatalogItem({
      supabase,
      contaId: profile.conta_id,
      tipo,
      payload,
      ignoreId: id,
    });

    if (duplicated) {
      return NextResponse.json(
        { error: `Já existe outro item igual no catálogo de ${config.label}.` },
        { status: 409 }
      );
    }

    const { data, error: updateError } = await supabase
      .from(config.table)
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("CATALOGO_PUT_ERROR:", updateError);

      return NextResponse.json(
        { error: `Não foi possível atualizar ${config.label}.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${capitalize(config.label)} atualizado com sucesso.`,
      [config.singleKey]: data,
    });
  } catch (error) {
    console.error("CATALOGO_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar item do catálogo." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE /api/catalogo
   Body: { id, tipo: "lentes" | "armacoes" | "laboratorios" }
   ========================================================================== */

export async function DELETE(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir itens do catálogo." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, tipo } = body;

    const config = getConfig(tipo);

    if (!config) {
      return NextResponse.json(
        { error: "Tipo de catálogo inválido." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID do item não informado." },
        { status: 400 }
      );
    }

    const existing = await getCatalogItem({
      supabase,
      contaId: profile.conta_id,
      tipo,
      id,
    });

    if (!existing) {
      return NextResponse.json(
        { error: `${capitalize(config.label)} não encontrado.` },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from(config.table)
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("CATALOGO_DELETE_ERROR:", deleteError);

      return NextResponse.json(
        { error: `Não foi possível excluir ${config.label}.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${capitalize(config.label)} excluído com sucesso.`,
    });
  } catch (error) {
    console.error("CATALOGO_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir item do catálogo." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   UTILS
   ========================================================================== */

function capitalize(value = "") {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}
