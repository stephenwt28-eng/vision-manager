import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

/* ==========================================================================
   CLIENTE ADMIN / SERVICE ROLE
   ========================================================================== */

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/* ==========================================================================
   AUTENTICAÇÃO / PERFIL
   ========================================================================== */

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      profile: null,
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
      profile: null,
      error: NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 404 }
      ),
    };
  }

  if (profile.status !== "ativo") {
    return {
      profile: null,
      error: NextResponse.json(
        { error: "Seu acesso está inativo ou bloqueado." },
        { status: 403 }
      ),
    };
  }

  return {
    profile,
    error: null,
  };
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function hashPin(pin) {
  return createHash("sha256").update(pin).digest("hex");
}

function sanitizeVendedor(vendedor) {
  if (!vendedor) return null;

  const { pin_hash, ...safeVendedor } = vendedor;

  return safeVendedor;
}

function isValidPin(pin) {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

function normalizeDate(value) {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function getDefaultPeriod() {
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    data_inicio: firstDay.toISOString().slice(0, 10),
    data_fim: lastDay.toISOString().slice(0, 10),
  };
}

function parseNumber(value) {
  const numberValue = Number(value || 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function calculatePercent(value, total) {
  if (!total) return 0;

  return Number(((value / total) * 100).toFixed(2));
}

function groupByField(items = [], field) {
  const map = new Map();

  for (const item of items) {
    const key = item?.[field] || "não informado";
    const current = map.get(key) || {
      chave: key,
      quantidade: 0,
      valor_total: 0,
    };

    current.quantidade += 1;
    current.valor_total += parseNumber(item.valor_total);

    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => b.valor_total - a.valor_total);
}

function groupByDay(items = []) {
  const map = new Map();

  for (const item of items) {
    const key = item?.data_venda || "sem data";
    const current = map.get(key) || {
      data: key,
      quantidade: 0,
      valor_total: 0,
    };

    current.quantidade += 1;
    current.valor_total += parseNumber(item.valor_total);

    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.data).localeCompare(String(b.data))
  );
}

function buildReportRows(ordens = [], mostrarValores = true, mostrarComissao = true) {
  return ordens.map((ordem) => {
    const clienteNome =
      ordem?.cliente?.nome_completo ||
      ordem?.clientes?.nome_completo ||
      "Cliente não informado";

    const clienteTelefone =
      ordem?.cliente?.telefone_principal ||
      ordem?.clientes?.telefone_principal ||
      "";

    const valorTotal = parseNumber(ordem.valor_total);
    const comissaoPercentual = parseNumber(ordem.comissao_percentual_aplicada);
    const comissaoValor = parseNumber(ordem.comissao_valor_estimado);

    return {
      id: ordem.id,
      numero_os: ordem.numero_os,
      data_venda: ordem.data_venda,
      cliente: clienteNome,
      telefone: clienteTelefone,
      tipo_os: ordem.tipo_os,
      status: ordem.status,
      status_pagamento: ordem.status_pagamento,
      forma_pagamento: ordem.forma_pagamento || "não informado",
      valor_total: mostrarValores ? valorTotal : null,
      valor_entrada: mostrarValores ? parseNumber(ordem.valor_entrada) : null,
      valor_restante: mostrarValores ? parseNumber(ordem.valor_restante) : null,
      comissao_percentual_aplicada: mostrarComissao
        ? comissaoPercentual
        : null,
      comissao_valor_estimado: mostrarComissao ? comissaoValor : null,
    };
  });
}

async function logAccess({
  admin,
  request,
  contaId,
  vendedorId = null,
  nomeVendedor = null,
  pinValidado = false,
  origemAcesso = "terminal",
  motivoFalha = null,
}) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipOrigem = forwardedFor?.split(",")?.[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error } = await admin.from("logs_acesso_relatorio_vendedor").insert({
    conta_id: contaId,
    vendedor_id: vendedorId,
    nome_vendedor_informado: nomeVendedor,
    pin_validado: pinValidado,
    origem_acesso: origemAcesso,
    ip_origem: ipOrigem,
    user_agent: userAgent,
    motivo_falha: motivoFalha,
  });

  if (error) {
    console.error("BALCAO_DESEMPENHO_LOG_ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }
}

/* ==========================================================================
   GET /api/balcao/desempenho
   Lista vendedores ativos para a tela inicial
   ========================================================================== */

export async function GET() {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const admin = createAdminClient();

    const { data: vendedores, error: vendedoresError } = await admin
      .from("vendedores")
      .select(
        "id, nome_completo, nome_exibicao, image_url, cargo, status, meta_mensal_valor, comissao_padrao_percentual"
      )
      .eq("conta_id", profile.conta_id)
      .eq("status", "ativo")
      .order("nome_exibicao", { ascending: true });

    if (vendedoresError) {
      console.error("BALCAO_DESEMPENHO_GET_VENDEDORES_ERROR:", {
        message: vendedoresError.message,
        details: vendedoresError.details,
        hint: vendedoresError.hint,
        code: vendedoresError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível carregar os vendedores." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      vendedores: vendedores || [],
    });
  } catch (error) {
    console.error("BALCAO_DESEMPENHO_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao carregar desempenho." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/balcao/desempenho
   Valida PIN do vendedor escolhido e retorna relatório individual
   ========================================================================== */

export async function POST(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();

    const vendedorId = String(body?.vendedor_id || "").trim();
    const pin = String(body?.pin || "").trim();

    if (!vendedorId) {
      return NextResponse.json(
        { error: "Selecione um vendedor para abrir o relatório." },
        { status: 400 }
      );
    }

    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: "Informe um PIN válido com 4 dígitos." },
        { status: 400 }
      );
    }

    const defaultPeriod = getDefaultPeriod();

    const dataInicio =
      normalizeDate(body?.data_inicio) || defaultPeriod.data_inicio;

    const dataFim = normalizeDate(body?.data_fim) || defaultPeriod.data_fim;

    if (dataInicio > dataFim) {
      return NextResponse.json(
        { error: "A data inicial não pode ser maior que a data final." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: vendedor, error: vendedorError } = await admin
      .from("vendedores")
      .select("*")
      .eq("id", vendedorId)
      .eq("conta_id", profile.conta_id)
      .eq("status", "ativo")
      .single();

    if (vendedorError || !vendedor) {
      await logAccess({
        admin,
        request,
        contaId: profile.conta_id,
        vendedorId: null,
        nomeVendedor: null,
        pinValidado: false,
        origemAcesso: profile.role === "admin" ? "admin" : "terminal",
        motivoFalha: "Vendedor não encontrado ou inativo ao abrir desempenho",
      });

      return NextResponse.json(
        { error: "Vendedor não encontrado ou inativo." },
        { status: 404 }
      );
    }

    const pinHash = hashPin(pin);

    if (vendedor.pin_hash !== pinHash) {
      await logAccess({
        admin,
        request,
        contaId: profile.conta_id,
        vendedorId: vendedor.id,
        nomeVendedor:
          vendedor.nome_exibicao || vendedor.nome_completo || null,
        pinValidado: false,
        origemAcesso: profile.role === "admin" ? "admin" : "terminal",
        motivoFalha: "PIN inválido ao abrir desempenho individual",
      });

      return NextResponse.json(
        { error: "PIN inválido para este vendedor." },
        { status: 401 }
      );
    }

    await logAccess({
      admin,
      request,
      contaId: profile.conta_id,
      vendedorId: vendedor.id,
      nomeVendedor:
        vendedor.nome_exibicao || vendedor.nome_completo || null,
      pinValidado: true,
      origemAcesso: profile.role === "admin" ? "admin" : "terminal",
      motivoFalha: null,
    });

    const { data: configuracao } = await admin
      .from("configuracoes_conta")
      .select(
        "exibir_valor_vendido_relatorio_vendedor, exibir_comissao_relatorio_vendedor"
      )
      .eq("conta_id", profile.conta_id)
      .maybeSingle();

    const mostrarValores =
      configuracao?.exibir_valor_vendido_relatorio_vendedor !== false;

    const mostrarComissao =
      configuracao?.exibir_comissao_relatorio_vendedor !== false;

    const { data: ordens, error: ordensError } = await admin
      .from("ordens_servico")
      .select(
        `
        id,
        numero_os,
        tipo_os,
        data_venda,
        status,
        status_pagamento,
        forma_pagamento,
        valor_total,
        valor_entrada,
        valor_restante,
        comissao_percentual_aplicada,
        comissao_valor_estimado,
        cliente:clientes (
          nome_completo,
          telefone_principal
        )
      `
      )
      .eq("conta_id", profile.conta_id)
      .eq("vendedor_id", vendedor.id)
      .eq("tipo_os", "venda")
      .neq("status", "cancelada")
      .gte("data_venda", dataInicio)
      .lte("data_venda", dataFim)
      .order("data_venda", { ascending: false })
      .order("created_at", { ascending: false });

    if (ordensError) {
      console.error("BALCAO_DESEMPENHO_ORDENS_ERROR:", {
        message: ordensError.message,
        details: ordensError.details,
        hint: ordensError.hint,
        code: ordensError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível carregar o relatório do vendedor." },
        { status: 400 }
      );
    }

    const safeOrdens = ordens || [];

    const totalVendido = safeOrdens.reduce(
      (total, ordem) => total + parseNumber(ordem.valor_total),
      0
    );

    const totalEntrada = safeOrdens.reduce(
      (total, ordem) => total + parseNumber(ordem.valor_entrada),
      0
    );

    const totalRestante = safeOrdens.reduce(
      (total, ordem) => total + parseNumber(ordem.valor_restante),
      0
    );

    const totalComissao = safeOrdens.reduce(
      (total, ordem) => total + parseNumber(ordem.comissao_valor_estimado),
      0
    );

    const quantidadeVendas = safeOrdens.length;
    const ticketMedio =
      quantidadeVendas > 0 ? totalVendido / quantidadeVendas : 0;

    const metaMensal = parseNumber(vendedor.meta_mensal_valor);
    const progressoMeta =
      metaMensal > 0 ? Math.min((totalVendido / metaMensal) * 100, 999) : 0;

    const porStatus = groupByField(safeOrdens, "status");
    const porPagamento = groupByField(safeOrdens, "status_pagamento");
    const porFormaPagamento = groupByField(safeOrdens, "forma_pagamento");
    const porDia = groupByDay(safeOrdens);

    const tabela = buildReportRows(
      safeOrdens,
      mostrarValores,
      mostrarComissao
    );

    return NextResponse.json({
      success: true,
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
      permissoes_relatorio: {
        mostrar_valores: mostrarValores,
        mostrar_comissao: mostrarComissao,
      },
      vendedor: sanitizeVendedor(vendedor),
      resumo: {
        quantidade_vendas: quantidadeVendas,
        total_vendido: mostrarValores ? Number(totalVendido.toFixed(2)) : null,
        total_entrada: mostrarValores ? Number(totalEntrada.toFixed(2)) : null,
        total_restante: mostrarValores ? Number(totalRestante.toFixed(2)) : null,
        ticket_medio: mostrarValores ? Number(ticketMedio.toFixed(2)) : null,
        total_comissao: mostrarComissao ? Number(totalComissao.toFixed(2)) : null,
        meta_mensal: mostrarValores ? Number(metaMensal.toFixed(2)) : null,
        progresso_meta_percentual:
          mostrarValores && metaMensal > 0
            ? Number(progressoMeta.toFixed(2))
            : null,
        faltante_meta:
          mostrarValores && metaMensal > 0
            ? Number(Math.max(metaMensal - totalVendido, 0).toFixed(2))
            : null,
        percentual_vendas_entregues: calculatePercent(
          safeOrdens.filter((ordem) => ordem.status === "entregue").length,
          quantidadeVendas
        ),
        percentual_vendas_pagas: calculatePercent(
          safeOrdens.filter((ordem) => ordem.status_pagamento === "pago")
            .length,
          quantidadeVendas
        ),
      },
      agrupamentos: {
        por_status: porStatus,
        por_pagamento: porPagamento,
        por_forma_pagamento: porFormaPagamento,
        por_dia: porDia,
      },
      tabela,
    });
  } catch (error) {
    console.error("BALCAO_DESEMPENHO_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao carregar relatório do vendedor." },
      { status: 500 }
    );
  }
}