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
    image_data_url,
    remover_imagem,
    pin,
    ...payload
  } = body;

  return payload;
}

function normalizeText(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeVendedorPayload(body = {}) {
  const payload = cleanPayload(body);

  return {
    nome_completo: normalizeText(payload.nome_completo),
    nome_exibicao: normalizeText(payload.nome_exibicao),
    cpf: normalizeText(payload.cpf),
    telefone: normalizeText(payload.telefone),
    email: payload.email ? normalizeText(payload.email).toLowerCase() : null,
    image_url: normalizeText(payload.image_url),
    cargo: normalizeText(payload.cargo),
    data_admissao: payload.data_admissao || null,
    data_desligamento: payload.data_desligamento || null,
    comissao_padrao_percentual: payload.comissao_padrao_percentual ? parseFloat(payload.comissao_padrao_percentual) : 0,
    meta_mensal_valor: payload.meta_mensal_valor ? parseFloat(payload.meta_mensal_valor) : 0,
    status: payload.status || "ativo",
    observacoes: normalizeText(payload.observacoes),
    pin_hash: payload.pin_hash || "default_pin_hash",
  };
}

async function checkDuplicateEmail({
  supabase,
  contaId,
  email,
  ignoreVendedorId = null,
}) {
  if (!email) return null;

  let query = supabase
    .from("vendedores")
    .select("id")
    .eq("conta_id", contaId)
    .eq("email", email)
    .limit(1);

  if (ignoreVendedorId) {
    query = query.neq("id", ignoreVendedorId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

/**
 * GET /api/vendedores
 * Lista todos os vendedores da conta logada.
 */
export async function GET(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const { data, error: vendedoresError } = await supabase
      .from("vendedores")
      .select("*")
      .eq("conta_id", profile.conta_id)
      .order("created_at", { ascending: false });

    if (vendedoresError) {
      console.error("VENDEDORES_GET_ERROR:", vendedoresError);

      return NextResponse.json(
        { error: "Não foi possível buscar os vendedores." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      vendedores: data || [],
    });
  } catch (error) {
    console.error("VENDEDORES_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar vendedores." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendedores
 * Cria um novo vendedor.
 */
export async function POST(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const payload = normalizeVendedorPayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome do vendedor." },
        { status: 400 }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        { error: "Informe o email do vendedor." },
        { status: 400 }
      );
    }

    const emailDuplicado = await checkDuplicateEmail({
      supabase,
      contaId: profile.conta_id,
      email: payload.email,
    });

    if (emailDuplicado) {
      return NextResponse.json(
        { error: "Já existe um vendedor cadastrado com este email." },
        { status: 409 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("vendedores")
      .insert({
        ...payload,
        conta_id: profile.conta_id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("VENDEDORES_POST_ERROR:", insertError);

      return NextResponse.json(
        { error: "Não foi possível cadastrar o vendedor." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Vendedor cadastrado com sucesso.",
        vendedor: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("VENDEDORES_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar vendedor." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vendedores
 * Atualiza um vendedor.
 */
export async function PUT(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do vendedor não informado." },
        { status: 400 }
      );
    }

    const payload = normalizeVendedorPayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome do vendedor." },
        { status: 400 }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        { error: "Informe o email do vendedor." },
        { status: 400 }
      );
    }

    const { data: vendedorExistente, error: findError } = await supabase
      .from("vendedores")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !vendedorExistente) {
      return NextResponse.json(
        { error: "Vendedor não encontrado." },
        { status: 404 }
      );
    }

    const emailDuplicado = await checkDuplicateEmail({
      supabase,
      contaId: profile.conta_id,
      email: payload.email,
      ignoreVendedorId: id,
    });

    if (emailDuplicado) {
      return NextResponse.json(
        { error: "Já existe outro vendedor cadastrado com este email." },
        { status: 409 }
      );
    }

    const { data, error: updateError } = await supabase
      .from("vendedores")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("VENDEDORES_PUT_ERROR:", updateError);

      return NextResponse.json(
        { error: "Não foi possível atualizar o vendedor." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vendedor atualizado com sucesso.",
      vendedor: data,
    });
  } catch (error) {
    console.error("VENDEDORES_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar vendedor." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vendedores
 * Exclui vendedor.
 * Somente admin pode excluir.
 */
export async function DELETE(request) {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir vendedores." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do vendedor não informado." },
        { status: 400 }
      );
    }

    const { data: vendedorExistente, error: findError } = await supabase
      .from("vendedores")
      .select("id")
      .eq("id", id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !vendedorExistente) {
      return NextResponse.json(
        { error: "Vendedor não encontrado." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("vendedores")
      .delete()
      .eq("id", id)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("VENDEDORES_DELETE_ERROR:", deleteError);

      if (deleteError.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Este vendedor possui registros vinculados e não pode ser excluído.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Não foi possível excluir o vendedor." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vendedor excluído com sucesso.",
    });
  } catch (error) {
    console.error("VENDEDORES_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir vendedor." },
      { status: 500 }
    );
  }
}