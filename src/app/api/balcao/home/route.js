import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPEN_ORDER_STATUSES = [
  "cadastrada",
  "enviada_laboratorio",
  "aguardando_retorno",
];

const CLOSED_ORDER_STATUSES = ["entregue", "cancelada"];

const DELAY_IGNORED_STATUSES = ["pronta_retirada", "entregue", "cancelada"];

const OPEN_GUARANTEE_STATUSES = [
  "aberta",
  "em_analise",
  "enviada_laboratorio",
  "aguardando_retorno",
  "aprovada",
];

function normalize(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function onlyDigits(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function getTodayDateKey() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function parseDateOnly(value) {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isOpenOrder(order) {
  return !CLOSED_ORDER_STATUSES.includes(order?.status);
}

function isReadyOrder(order) {
  return order?.status === "pronta_retirada";
}

function isDelayedOrder(order) {
  if (!order?.prazo_entrega) return false;
  if (DELAY_IGNORED_STATUSES.includes(order?.status)) return false;

  const deadline = parseDateOnly(order.prazo_entrega);
  if (!deadline) return false;

  const today = startOfDay(new Date());
  const deadlineDay = startOfDay(deadline);

  return deadlineDay < today;
}

function isOpenGuarantee(guarantee) {
  return OPEN_GUARANTEE_STATUSES.includes(guarantee?.status_garantia);
}

function sortByDateDesc(field) {
  return (a, b) => {
    const dateA = parseDateOnly(a?.[field])?.getTime() || 0;
    const dateB = parseDateOnly(b?.[field])?.getTime() || 0;

    return dateB - dateA;
  };
}

function sortByDeadlineAsc(a, b) {
  const dateA = parseDateOnly(a?.prazo_entrega)?.getTime() || 0;
  const dateB = parseDateOnly(b?.prazo_entrega)?.getTime() || 0;

  return dateA - dateB;
}

function enrichOrder(order, sellersMap = new Map()) {
  const cliente = order?.clientes || null;
  const vendedor = order?.vendedores || null;

  return {
    ...order,
    cliente_nome: cliente?.nome_completo || cliente?.nome_social || null,
    cliente_telefone: cliente?.telefone_principal || null,
    cliente_cpf: cliente?.cpf || null,
    vendedor_nome:
      vendedor?.nome_exibicao ||
      vendedor?.nome_completo ||
      sellersMap.get(order?.vendedor_id) ||
      null,
  };
}

function clientMatchesSearch(client, searchTerm, searchDigits) {
  if (!searchTerm) return false;

  const haystack = normalize(
    [
      client?.nome_completo,
      client?.nome_social,
      client?.cpf,
      client?.telefone_principal,
      client?.telefone_secundario,
      client?.email,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const digitHaystack = onlyDigits(
    [
      client?.cpf,
      client?.telefone_principal,
      client?.telefone_secundario,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    haystack.includes(searchTerm) ||
    Boolean(searchDigits && digitHaystack.includes(searchDigits))
  );
}

function orderMatchesSearch(order, searchTerm, searchDigits) {
  if (!searchTerm) return false;

  const cliente = order?.clientes || {};
  const vendedor = order?.vendedores || {};

  const haystack = normalize(
    [
      order?.numero_os,
      order?.numero_nf,
      order?.numero_pedido_antigo,
      order?.pedido_laboratorio_numero,
      order?.laboratorio_nome,
      cliente?.nome_completo,
      cliente?.nome_social,
      cliente?.cpf,
      cliente?.telefone_principal,
      vendedor?.nome_completo,
      vendedor?.nome_exibicao,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const digitHaystack = onlyDigits(
    [
      order?.numero_os,
      order?.numero_nf,
      order?.numero_pedido_antigo,
      order?.pedido_laboratorio_numero,
      cliente?.cpf,
      cliente?.telefone_principal,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    haystack.includes(searchTerm) ||
    Boolean(searchDigits && digitHaystack.includes(searchDigits))
  );
}

async function getAuthenticatedProfile(supabase) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      response: NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        { status: 401 }
      ),
    };
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (usuarioError || !usuario) {
    return {
      response: NextResponse.json(
        {
          error: "Perfil de usuário não encontrado.",
        },
        { status: 404 }
      ),
    };
  }

  if (usuario.status !== "ativo") {
    return {
      response: NextResponse.json(
        {
          error: "Seu acesso está inativo ou bloqueado.",
        },
        { status: 403 }
      ),
    };
  }

  if (!["admin", "balcao"].includes(usuario.role)) {
    return {
      response: NextResponse.json(
        {
          error: "Acesso permitido apenas para usuários do balcão ou administradores.",
        },
        { status: 403 }
      ),
    };
  }

  if (!usuario.conta_id) {
    return {
      response: NextResponse.json(
        {
          error: "Usuário sem conta vinculada.",
        },
        { status: 403 }
      ),
    };
  }

  return { usuario };
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const auth = await getAuthenticatedProfile(supabase);

    if (auth.response) return auth.response;

    const usuario = auth.usuario;
    const contaId = usuario.conta_id;

    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const searchTerm = normalize(rawQuery);
    const searchDigits = onlyDigits(rawQuery);
    const todayKey = getTodayDateKey();

    const [
      contaResult,
      clientesResult,
      ordensServicoResult,
      vendedoresResult,
      garantiasResult,
    ] = await Promise.all([
      supabase
        .from("contas")
        .select("id, nome_fantasia, razao_social, cnpj, telefone, email, status")
        .eq("id", contaId)
        .maybeSingle(),

      supabase
        .from("clientes")
        .select(
          `
          id,
          conta_id,
          nome_completo,
          nome_social,
          cpf,
          telefone_principal,
          telefone_secundario,
          email,
          ativo,
          created_at,
          updated_at
        `
        )
        .eq("conta_id", contaId)
        .order("updated_at", { ascending: false })
        .limit(1000),

      supabase
        .from("ordens_servico")
        .select(
          `
          id,
          conta_id,
          cliente_id,
          vendedor_id,
          numero_os,
          numero_nf,
          numero_pedido_antigo,
          pedido_laboratorio_numero,
          tipo_os,
          data_venda,
          data_abertura,
          prazo_entrega,
          data_pronta_para_retirada,
          data_entrega,
          status,
          laboratorio_nome,
          telefone_laboratorio,
          previsao_laboratorio,
          valor_total,
          valor_entrada,
          valor_restante,
          forma_pagamento,
          quantidade_parcelas,
          status_pagamento,
          receita_recebida,
          conferida,
          created_at,
          updated_at,
          clientes:cliente_id (
            id,
            nome_completo,
            nome_social,
            cpf,
            telefone_principal,
            email
          ),
          vendedores:vendedor_id (
            id,
            nome_completo,
            nome_exibicao,
            telefone,
            status
          )
        `
        )
        .eq("conta_id", contaId)
        .order("updated_at", { ascending: false })
        .limit(1000),

      supabase
        .from("vendedores")
        .select(
          `
          id,
          conta_id,
          nome_completo,
          nome_exibicao,
          telefone,
          email,
          cargo,
          status
        `
        )
        .eq("conta_id", contaId),

      supabase
        .from("garantias")
        .select(
          `
          id,
          conta_id,
          os_id,
          cliente_id,
          vendedor_id,
          numero_garantia,
          numero_os_original,
          laboratorio_nome,
          status_garantia,
          tipo_garantia,
          motivo_garantia,
          data_abertura,
          prazo_resolucao,
          data_finalizacao,
          created_at,
          updated_at
        `
        )
        .eq("conta_id", contaId)
        .order("updated_at", { ascending: false })
        .limit(300),
    ]);

    if (contaResult.error) throw contaResult.error;
    if (clientesResult.error) throw clientesResult.error;
    if (ordensServicoResult.error) throw ordensServicoResult.error;
    if (vendedoresResult.error) throw vendedoresResult.error;
    if (garantiasResult.error) throw garantiasResult.error;

    const conta = contaResult.data || null;
    const clientes = clientesResult.data || [];
    const vendedores = vendedoresResult.data || [];
    const garantias = garantiasResult.data || [];

    const sellersMap = new Map(
      vendedores.map((seller) => [
        seller.id,
        seller.nome_exibicao || seller.nome_completo || "Vendedor",
      ])
    );

    const ordensServico = (ordensServicoResult.data || []).map((order) =>
      enrichOrder(order, sellersMap)
    );

    const openOrders = ordensServico.filter(isOpenOrder);
    const delayedOrders = ordensServico.filter(isDelayedOrder);
    const readyOrders = ordensServico.filter(isReadyOrder);
    const todayOrders = ordensServico.filter(
      (order) => order.data_venda === todayKey && order.status !== "cancelada"
    );
    const openGuarantees = garantias.filter(isOpenGuarantee);

    const clientesWithTotals = clientes.map((client) => {
      const totalOs = ordensServico.filter(
        (order) => order.cliente_id === client.id
      ).length;

      const lastOrder = ordensServico
        .filter((order) => order.cliente_id === client.id)
        .sort(sortByDateDesc("data_venda"))[0];

      return {
        ...client,
        total_os: totalOs,
        ultima_compra: lastOrder?.data_venda || null,
      };
    });

    const searchClientes = searchTerm
      ? clientesWithTotals
          .filter((client) =>
            clientMatchesSearch(client, searchTerm, searchDigits)
          )
          .sort((a, b) => {
            const aName = normalize(a.nome_completo || a.nome_social);
            const bName = normalize(b.nome_completo || b.nome_social);

            return aName.localeCompare(bName);
          })
          .slice(0, 8)
      : [];

    const searchOrders = searchTerm
      ? ordensServico
          .filter((order) => orderMatchesSearch(order, searchTerm, searchDigits))
          .sort(sortByDateDesc("updated_at"))
          .slice(0, 8)
      : [];

    const response = {
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          conta_id: usuario.conta_id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          role: usuario.role,
          status: usuario.status,
        },
        conta,
        metrics: {
          clientes_total: clientes.filter((client) => client.ativo !== false).length,
          os_abertas: openOrders.length,
          os_atrasadas: delayedOrders.length,
          prontas_retirada: readyOrders.length,
          vendas_hoje: todayOrders.length,
          faturamento_hoje: todayOrders.reduce(
            (total, order) => total + (Number(order.valor_total) || 0),
            0
          ),
          garantias_abertas: openGuarantees.length,
        },
        search: {
          clientes: searchClientes,
          ordens_servico: searchOrders,
        },
        listas: {
          recentes: ordensServico.sort(sortByDateDesc("updated_at")).slice(0, 6),
          atrasadas: delayedOrders.sort(sortByDeadlineAsc).slice(0, 6),
          prontas_retirada: readyOrders
            .sort(sortByDateDesc("data_pronta_para_retirada"))
            .slice(0, 6),
          garantias_abertas: openGuarantees
            .sort(sortByDateDesc("updated_at"))
            .slice(0, 6),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("BALCAO_HOME_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao carregar a central do balcão.",
      },
      { status: 500 }
    );
  }
}