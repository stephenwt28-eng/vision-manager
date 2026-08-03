import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function cleanSearch(value) {
  return String(value || "").trim().slice(0, 80);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function makeIlike(value) {
  const safe = String(value || "")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");

  return `%${safe}%`;
}

function formatClienteDescription(cliente) {
  const parts = [
    cliente.telefone_principal ? `Tel: ${cliente.telefone_principal}` : null,
    cliente.cpf ? `CPF: ${cliente.cpf}` : null,
    cliente.email || null,
  ].filter(Boolean);

  return parts.join(" • ");
}

function formatOsDescription(os) {
  const cliente = os.clientes?.nome_completo || "Cliente não informado";
  const status = os.status ? `Status: ${os.status}` : null;
  const total =
    os.valor_total !== null && os.valor_total !== undefined
      ? `Total: R$ ${Number(os.valor_total).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null;

  return [cliente, status, total].filter(Boolean).join(" • ");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = cleanSearch(searchParams.get("q"));
    const digits = onlyDigits(q);

    if (q.length < 2) {
      return NextResponse.json({
        results: [],
      });
    }

    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("id, conta_id, role, status")
      .eq("id", authUser.id)
      .single();

    if (userError || !usuario) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 403 }
      );
    }

    if (usuario.status !== "ativo") {
      return NextResponse.json(
        { error: "Usuário inativo ou bloqueado." },
        { status: 403 }
      );
    }

    const textPattern = makeIlike(q);
    const digitPattern = digits ? makeIlike(digits) : null;

    const clienteOrFilters = [
      `nome_completo.ilike.${textPattern}`,
      `nome_social.ilike.${textPattern}`,
      `email.ilike.${textPattern}`,
    ];

    if (digitPattern) {
      clienteOrFilters.push(`cpf.ilike.${digitPattern}`);
      clienteOrFilters.push(`telefone_principal.ilike.${digitPattern}`);
      clienteOrFilters.push(`telefone_secundario.ilike.${digitPattern}`);
    }

    const osOrFilters = [
      `numero_os.ilike.${textPattern}`,
      `numero_nf.ilike.${textPattern}`,
      `numero_pedido_antigo.ilike.${textPattern}`,
      `pedido_laboratorio_numero.ilike.${textPattern}`,
      `laboratorio_nome.ilike.${textPattern}`,
    ];

    if (digitPattern) {
      osOrFilters.push(`numero_os.ilike.${digitPattern}`);
      osOrFilters.push(`numero_nf.ilike.${digitPattern}`);
      osOrFilters.push(`numero_pedido_antigo.ilike.${digitPattern}`);
      osOrFilters.push(`pedido_laboratorio_numero.ilike.${digitPattern}`);
    }

    const [clientesResponse, osResponse] = await Promise.all([
      supabase
        .from("clientes")
        .select(
          "id, nome_completo, nome_social, cpf, telefone_principal, telefone_secundario, email, updated_at"
        )
        .eq("conta_id", usuario.conta_id)
        .or(clienteOrFilters.join(","))
        .order("updated_at", { ascending: false })
        .limit(6),

      supabase
        .from("ordens_servico")
        .select(
          `
          id,
          numero_os,
          numero_nf,
          numero_pedido_antigo,
          pedido_laboratorio_numero,
          status,
          valor_total,
          updated_at,
          clientes:cliente_id (
            id,
            nome_completo,
            telefone_principal
          )
        `
        )
        .eq("conta_id", usuario.conta_id)
        .or(osOrFilters.join(","))
        .order("updated_at", { ascending: false })
        .limit(8),
    ]);

    if (clientesResponse.error) {
      console.error("Erro ao buscar clientes:", clientesResponse.error);
    }

    if (osResponse.error) {
      console.error("Erro ao buscar OS:", osResponse.error);
    }

    if (clientesResponse.error && osResponse.error) {
      return NextResponse.json(
        { error: "Erro ao buscar no sistema." },
        { status: 500 }
      );
    }

    const clientes = (clientesResponse.data || []).map((cliente) => ({
      type: "cliente",
      id: cliente.id,
      title: cliente.nome_social || cliente.nome_completo,
      description: formatClienteDescription(cliente),
      meta: "Cadastro de cliente",
      updated_at: cliente.updated_at,
    }));

    const ordens = (osResponse.data || []).map((os) => ({
      type: "os",
      id: os.id,
      title: `OS ${os.numero_os || "sem número"}`,
      description: formatOsDescription(os),
      meta: os.numero_nf
        ? `NF ${os.numero_nf}`
        : os.numero_pedido_antigo
          ? `Pedido antigo ${os.numero_pedido_antigo}`
          : "Ordem de serviço",
      updated_at: os.updated_at,
    }));

    const results = [...ordens, ...clientes]
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .slice(0, 12);

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Erro inesperado na busca global:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar no sistema." },
      { status: 500 }
    );
  }
}