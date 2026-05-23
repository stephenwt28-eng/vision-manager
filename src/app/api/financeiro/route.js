import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RESOURCE_TABLES = {
  categoria: "categorias_financeiras",
  categorias: "categorias_financeiras",
  categorias_financeiras: "categorias_financeiras",

  lancamento: "lancamentos_financeiros",
  lancamentos: "lancamentos_financeiros",
  lancamentos_financeiros: "lancamentos_financeiros",
};

const DEFAULT_CATEGORIAS = [
  {
    nome: "Receitas avulsas",
    tipo_lancamento: "receita",
    grupo_dre: "receita_operacional",
    ativo: true,
  },
  {
    nome: "Ajustes positivos",
    tipo_lancamento: "receita",
    grupo_dre: "resultado_nao_operacional",
    ativo: true,
  },
  {
    nome: "Deduções e devoluções",
    tipo_lancamento: "despesa",
    grupo_dre: "deducao_receita",
    ativo: true,
  },
  {
    nome: "Custo direto avulso",
    tipo_lancamento: "despesa",
    grupo_dre: "custo_direto",
    ativo: true,
  },
  {
    nome: "Aluguel",
    tipo_lancamento: "despesa",
    grupo_dre: "despesa_operacional",
    ativo: true,
  },
  {
    nome: "Salários e comissões",
    tipo_lancamento: "despesa",
    grupo_dre: "despesa_operacional",
    ativo: true,
  },
  {
    nome: "Taxas e tarifas",
    tipo_lancamento: "despesa",
    grupo_dre: "despesa_operacional",
    ativo: true,
  },
  {
    nome: "Marketing",
    tipo_lancamento: "despesa",
    grupo_dre: "despesa_operacional",
    ativo: true,
  },
  {
    nome: "Outras despesas",
    tipo_lancamento: "despesa",
    grupo_dre: "despesa_operacional",
    ativo: true,
  },
  {
    nome: "Resultado não operacional",
    tipo_lancamento: "despesa",
    grupo_dre: "resultado_nao_operacional",
    ativo: true,
  },
];


const CATEGORIA_COMPATIVEL_POR_TIPO = {
  receita: new Set(["receita_operacional", "resultado_nao_operacional"]),
  despesa: new Set([
    "deducao_receita",
    "custo_direto",
    "despesa_operacional",
    "resultado_nao_operacional",
  ]),
};

const ORIGENS_RESERVADAS_PARA_SISTEMA = new Set(["ordem_servico"]);

function isCategoriaDreCompativel(tipoLancamento, grupoDre) {
  return Boolean(CATEGORIA_COMPATIVEL_POR_TIPO[tipoLancamento]?.has(grupoDre));
}

function validateCategoriaPayload(payload = {}) {
  const tipoLancamento = payload.tipo_lancamento;
  const grupoDre = payload.grupo_dre;

  if (!payload.nome || !String(payload.nome).trim()) {
    throw new ApiError("Informe o nome da categoria financeira.", 400);
  }

  if (!tipoLancamento || !grupoDre) {
    throw new ApiError("Informe o tipo do lançamento e o grupo DRE da categoria.", 400);
  }

  if (!isCategoriaDreCompativel(tipoLancamento, grupoDre)) {
    throw new ApiError(
      "Categoria incompatível: receitas só podem ser Receita operacional ou Resultado não operacional; despesas só podem ser Deduções, Custo direto, Despesa operacional ou Resultado não operacional.",
      400
    );
  }
}

function validateLancamentoPayload(payload = {}) {
  const valor = Number(payload.valor);

  if (!payload.categoria_id) {
    throw new ApiError("Informe a categoria financeira do lançamento.", 400);
  }

  if (!payload.descricao || !String(payload.descricao).trim()) {
    throw new ApiError("Informe a descrição do lançamento financeiro.", 400);
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    throw new ApiError("Informe um valor maior que zero para o lançamento financeiro.", 400);
  }

  if (ORIGENS_RESERVADAS_PARA_SISTEMA.has(payload.origem)) {
    throw new ApiError(
      "A origem ordem_servico é reservada para movimentos gerados automaticamente pelo sistema. Use manual ou ajuste para lançamentos criados pelo painel.",
      400
    );
  }

  if (payload.status === "pago" && !payload.data_pagamento) {
    throw new ApiError("Lançamento pago precisa ter data de pagamento.", 400);
  }

  if (payload.data_pagamento && payload.status !== "pago") {
    throw new ApiError("Lançamento com data de pagamento precisa estar com status Pago.", 400);
  }
}

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function jsonError(message, status = 400) {
  return NextResponse.json(
    {
      error: message,
    },
    { status }
  );
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function resolveResource(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return RESOURCE_TABLES[normalized] || null;
}

function getBodyResource(body = {}) {
  return resolveResource(
    body.resource || body.recurso || body.table || body.tabela || body.tipo
  );
}

function getPayload(body = {}) {
  const payload = body.data || body.payload || body.registro || body;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const cleanPayload = { ...payload };

  delete cleanPayload.resource;
  delete cleanPayload.recurso;
  delete cleanPayload.table;
  delete cleanPayload.tabela;
  delete cleanPayload.tipo;
  delete cleanPayload.action;
  delete cleanPayload.acao;

  Object.keys(cleanPayload).forEach((key) => {
    if (cleanPayload[key] === undefined) {
      delete cleanPayload[key];
    }
  });

  return cleanPayload;
}

function prepareInsertPayload(payload, contaId) {
  const cleanPayload = { ...payload };

  delete cleanPayload.id;
  delete cleanPayload.conta_id;
  delete cleanPayload.created_at;
  delete cleanPayload.updated_at;

  return {
    ...cleanPayload,
    conta_id: contaId,
  };
}

function prepareUpdatePayload(payload) {
  const cleanPayload = { ...payload };

  delete cleanPayload.id;
  delete cleanPayload.conta_id;
  delete cleanPayload.created_at;

  return {
    ...cleanPayload,
    updated_at: new Date().toISOString(),
  };
}

async function getAuthenticatedAdmin(supabase) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ApiError("Usuário não autenticado.", 401);
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (usuarioError || !usuario) {
    throw new ApiError("Perfil de usuário não encontrado.", 404);
  }

  if (usuario.status !== "ativo") {
    throw new ApiError("Seu acesso está inativo ou bloqueado.", 403);
  }

  if (usuario.role !== "admin") {
    throw new ApiError("Acesso permitido apenas para administradores.", 403);
  }

  return usuario;
}

async function assertRecordBelongsToConta({
  supabase,
  table,
  id,
  contaId,
  label = "Registro",
}) {
  if (!id) {
    throw new ApiError(`${label} não informado.`, 400);
  }

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("conta_id", contaId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new ApiError(`${label} não encontrado nesta conta.`, 404);
  }

  return data;
}

async function validateLancamentoRelations(supabase, payload, contaId) {
  validateLancamentoPayload(payload);

  const { data: categoria, error: categoriaError } = await supabase
    .from("categorias_financeiras")
    .select("id, tipo_lancamento, grupo_dre, ativo")
    .eq("id", payload.categoria_id)
    .eq("conta_id", contaId)
    .maybeSingle();

  if (categoriaError) {
    throw categoriaError;
  }

  if (!categoria) {
    throw new ApiError("Categoria financeira não encontrada nesta conta.", 404);
  }

  if (categoria.ativo === false) {
    throw new ApiError("Categoria financeira inativa não pode receber novos lançamentos.", 400);
  }

  if (!isCategoriaDreCompativel(categoria.tipo_lancamento, categoria.grupo_dre)) {
    throw new ApiError(
      "Categoria financeira incompatível com o DRE. Corrija a categoria antes de lançar.",
      400
    );
  }

  if (payload.os_id) {
    await assertRecordBelongsToConta({
      supabase,
      table: "ordens_servico",
      id: payload.os_id,
      contaId,
      label: "Ordem de serviço",
    });
  }
}

async function seedCategoriasFinanceiras(supabase, contaId) {
  const payload = DEFAULT_CATEGORIAS.map((categoria) => ({
    ...categoria,
    conta_id: contaId,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("categorias_financeiras")
    .upsert(payload, {
      onConflict: "conta_id,nome,tipo_lancamento",
    })
    .select("*");

  if (error) {
    throw error;
  }

  return data || [];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const usuario = await getAuthenticatedAdmin(supabase);
    const contaId = usuario.conta_id;

    const [
      contaResult,
      configuracoesResult,
      categoriasResult,
      lancamentosResult,
      ordensServicoResult,
      clientesResult,
      vendedoresResult,
      armacoesResult,
      lentesResult,
      dreBaseResult,
    ] = await Promise.all([
      supabase.from("contas").select("*").eq("id", contaId).single(),

      supabase
        .from("configuracoes_conta")
        .select("*")
        .eq("conta_id", contaId)
        .maybeSingle(),

      supabase
        .from("categorias_financeiras")
        .select("*")
        .eq("conta_id", contaId)
        .order("nome", { ascending: true }),

      supabase
        .from("lancamentos_financeiros")
        .select("*")
        .eq("conta_id", contaId)
        .order("data_competencia", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("ordens_servico")
        .select("*")
        .eq("conta_id", contaId)
        .order("data_venda", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .eq("conta_id", contaId)
        .order("nome_completo", { ascending: true }),

      supabase
        .from("vendedores")
        .select("*")
        .eq("conta_id", contaId)
        .order("nome_completo", { ascending: true }),

      supabase.from("armacoes").select("*").eq("conta_id", contaId),

      supabase.from("lentes").select("*").eq("conta_id", contaId),

      supabase
        .from("vw_financeiro_dre_base")
        .select("*")
        .eq("conta_id", contaId)
        .order("data_competencia", { ascending: false }),
    ]);

    if (contaResult.error) throw contaResult.error;
    if (configuracoesResult.error) throw configuracoesResult.error;
    if (categoriasResult.error) throw categoriasResult.error;
    if (lancamentosResult.error) throw lancamentosResult.error;
    if (ordensServicoResult.error) throw ordensServicoResult.error;
    if (clientesResult.error) throw clientesResult.error;
    if (vendedoresResult.error) throw vendedoresResult.error;
    if (armacoesResult.error) throw armacoesResult.error;
    if (lentesResult.error) throw lentesResult.error;
    if (dreBaseResult.error) throw dreBaseResult.error;

    return NextResponse.json({
      success: true,
      data: {
        usuario,
        conta: contaResult.data || null,
        configuracoes_conta: configuracoesResult.data || null,

        categorias_financeiras: categoriasResult.data || [],
        lancamentos_financeiros: lancamentosResult.data || [],

        ordens_servico: ordensServicoResult.data || [],
        clientes: clientesResult.data || [],
        vendedores: vendedoresResult.data || [],
        armacoes: armacoesResult.data || [],
        lentes: lentesResult.data || [],

        financeiro_dre_base: dreBaseResult.data || [],
      },
    });
  } catch (error) {
    console.error("Erro ao carregar financeiro:", error);

    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Erro interno ao carregar os dados financeiros.", 500);
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const usuario = await getAuthenticatedAdmin(supabase);
    const contaId = usuario.conta_id;

    const body = await readBody(request);
    const action = body.action || body.acao;

    if (action === "seed_categorias" || action === "criar_categorias_padrao") {
      const categorias = await seedCategoriasFinanceiras(supabase, contaId);

      return NextResponse.json({
        success: true,
        message: "Categorias financeiras padrão criadas ou atualizadas.",
        data: categorias,
      });
    }

    const table = getBodyResource(body);

    if (!table) {
      throw new ApiError(
        "Informe o recurso: categoria ou lancamento.",
        400
      );
    }

    const payload = prepareInsertPayload(getPayload(body), contaId);

    if (table === "categorias_financeiras") {
      validateCategoriaPayload(payload);
    }

    if (table === "lancamentos_financeiros") {
      await validateLancamentoRelations(supabase, payload, contaId);
    }

    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar registro financeiro:", error);

    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Erro interno ao criar registro financeiro.", 500);
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const usuario = await getAuthenticatedAdmin(supabase);
    const contaId = usuario.conta_id;

    const body = await readBody(request);
    const table = getBodyResource(body);

    if (!table) {
      throw new ApiError(
        "Informe o recurso: categoria ou lancamento.",
        400
      );
    }

    const payload = getPayload(body);
    const id = body.id || payload.id;

    await assertRecordBelongsToConta({
      supabase,
      table,
      id,
      contaId,
      label: "Registro financeiro",
    });

    const updatePayload = prepareUpdatePayload(payload);

    if (table === "categorias_financeiras") {
      validateCategoriaPayload(updatePayload);
    }

    if (table === "lancamentos_financeiros") {
      await validateLancamentoRelations(supabase, updatePayload, contaId);
    }

    const { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq("id", id)
      .eq("conta_id", contaId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Erro ao atualizar registro financeiro:", error);

    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Erro interno ao atualizar registro financeiro.", 500);
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const usuario = await getAuthenticatedAdmin(supabase);
    const contaId = usuario.conta_id;

    const url = new URL(request.url);
    const body = await readBody(request);

    const table = resolveResource(
      url.searchParams.get("resource") ||
        url.searchParams.get("recurso") ||
        url.searchParams.get("table") ||
        url.searchParams.get("tabela") ||
        body.resource ||
        body.recurso ||
        body.table ||
        body.tabela ||
        body.tipo
    );

    const id = url.searchParams.get("id") || body.id;

    if (!table) {
      throw new ApiError(
        "Informe o recurso: categoria ou lancamento.",
        400
      );
    }

    await assertRecordBelongsToConta({
      supabase,
      table,
      id,
      contaId,
      label: "Registro financeiro",
    });

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("conta_id", contaId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error("Erro ao excluir registro financeiro:", error);

    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }

    return jsonError(
      "Erro interno ao excluir registro financeiro. Se for uma categoria em uso, desative em vez de excluir.",
      500
    );
  }
}