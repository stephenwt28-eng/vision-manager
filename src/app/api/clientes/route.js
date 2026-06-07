import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

function cleanPayload(body = {}) {
  const {
    id,
    conta_id,
    created_at,
    updated_at,
    ...payload
  } = body;

  return payload;
}

function normalizeText(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeClientePayload(body = {}) {
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
    pais: normalizeText(payload.pais),
    origem_cliente: normalizeText(payload.origem_cliente),
    profissao: normalizeText(payload.profissao),
    prefere_contato_por: normalizeText(payload.prefere_contato_por),
    observacoes: normalizeText(payload.observacoes),
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

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function getClienteDrawerData({ supabase, contaId, clienteId }) {
  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", clienteId)
    .eq("conta_id", contaId)
    .single();

  if (clienteError || !cliente) {
    return {
      error: NextResponse.json(
        { error: "Cliente nÃ£o encontrado." },
        { status: 404 }
      ),
    };
  }

  const { data: receitas, error: receitasError } = await supabase
    .from("receitas")
    .select(`
      id,
      data_receita,
      medico_nome,
      medico_crm,
      od_esferico,
      od_cilindrico,
      od_eixo,
      od_adicao,
      od_prisma,
      od_base,
      oe_esferico,
      oe_cilindrico,
      oe_eixo,
      oe_adicao,
      oe_prisma,
      oe_base,
      dnp_od,
      dnp_oe,
      dp_total,
      altura_od,
      altura_oe,
      created_at
    `)
    .eq("conta_id", contaId)
    .eq("cliente_id", clienteId)
    .order("data_receita", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (receitasError) {
    throw receitasError;
  }

  const { data: ordensServico, error: ordensServicoError } = await supabase
    .from("ordens_servico")
    .select("id, numero_os, tipo_os, status, data_venda, created_at")
    .eq("conta_id", contaId)
    .eq("cliente_id", clienteId)
    .order("data_venda", { ascending: false })
    .order("created_at", { ascending: false });

  if (ordensServicoError) {
    throw ordensServicoError;
  }

  return {
    error: null,
    data: {
      cliente,
      receitas: receitas || [],
      ordensServico: ordensServico || [],
    },
  };
}

/**
 * GET /api/clientes
 * Lista todos os clientes da conta logada.
 * Filtros ficam propositalmente no front.
 */
export async function GET(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("id");
    const include = searchParams.get("include");

    if (include === "drawer") {
      if (!clienteId) {
        return NextResponse.json(
          { error: "ID do cliente nÃ£o informado." },
          { status: 400 }
        );
      }

      const drawerResult = await getClienteDrawerData({
        supabase,
        contaId: profile.conta_id,
        clienteId,
      });

      if (drawerResult.error) {
        return drawerResult.error;
      }

      return NextResponse.json({
        success: true,
        ...drawerResult.data,
      });
    }

    const { data, error: clientesError } = await supabase
      .from("clientes")
      .select("*")
      .eq("conta_id", profile.conta_id)
      .order("created_at", { ascending: false });

    if (clientesError) {
      console.error("CLIENTES_GET_ERROR:", clientesError);

      return NextResponse.json(
        { error: "Não foi possível buscar os clientes." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      clientes: data || [],
    });
  } catch (error) {
    console.error("CLIENTES_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar clientes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clientes
 * Cria um novo cliente.
 * Recebe o body completo vindo do formulário.
 */
export async function POST(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const payload = normalizeClientePayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome completo do cliente." },
        { status: 400 }
      );
    }

    if (!payload.telefone_principal) {
      return NextResponse.json(
        { error: "Informe o telefone principal do cliente." },
        { status: 400 }
      );
    }

    const cpfDuplicado = await checkDuplicateCpf({
      supabase,
      contaId: profile.conta_id,
      cpf: payload.cpf,
    });

    if (cpfDuplicado) {
      return NextResponse.json(
        { error: "Já existe um cliente cadastrado com este CPF." },
        { status: 409 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("clientes")
      .insert({
        ...payload,
        conta_id: profile.conta_id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("CLIENTES_POST_ERROR:", insertError);

      return NextResponse.json(
        { error: "Não foi possível cadastrar o cliente." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cliente cadastrado com sucesso.",
        cliente: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CLIENTES_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar cliente." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clientes
 * Atualiza um cliente.
 * Recebe o body completo, incluindo o id.
 */
export async function PUT(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente não informado." },
        { status: 400 }
      );
    }

    const payload = normalizeClientePayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome completo do cliente." },
        { status: 400 }
      );
    }

    if (!payload.telefone_principal) {
      return NextResponse.json(
        { error: "Informe o telefone principal do cliente." },
        { status: 400 }
      );
    }

    const { data: clienteExistente, error: findError } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const cpfDuplicado = await checkDuplicateCpf({
      supabase,
      contaId: profile.conta_id,
      cpf: payload.cpf,
      ignoreClienteId: id,
    });

    if (cpfDuplicado) {
      return NextResponse.json(
        { error: "Já existe outro cliente cadastrado com este CPF." },
        { status: 409 }
      );
    }

    const { data, error: updateError } = await supabase
      .from("clientes")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("CLIENTES_PUT_ERROR:", updateError);

      return NextResponse.json(
        { error: "Não foi possível atualizar o cliente." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cliente atualizado com sucesso.",
      cliente: data,
    });
  } catch (error) {
    console.error("CLIENTES_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar cliente." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clientes
 * Exclui cliente.
 * Somente admin pode excluir.
 * Body esperado: { "id": "uuid-do-cliente" }
 */
export async function DELETE(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir clientes." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente não informado." },
        { status: 400 }
      );
    }

    const { data: clienteExistente, error: findError } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("CLIENTES_DELETE_ERROR:", deleteError);

      if (deleteError.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Este cliente possui registros vinculados e não pode ser excluído.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Não foi possível excluir o cliente." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cliente excluído com sucesso.",
    });
  } catch (error) {
    console.error("CLIENTES_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir cliente." },
      { status: 500 }
    );
  }
}
