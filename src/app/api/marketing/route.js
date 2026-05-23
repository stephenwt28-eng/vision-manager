import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================================
   AUTH / PERMISSÕES
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

function requireAdmin(profile) {
  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Você não tem permissão para acessar o módulo de marketing." },
      { status: 403 }
    );
  }

  return null;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function normalizeError(error) {
  if (!error) return null;

  return {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  };
}

async function safeSelectAll({ supabase, table, contaId, orderBy = "created_at" }) {
  let query = supabase.from(table).select("*").eq("conta_id", contaId);

  if (orderBy) {
    query = query.order(orderBy, { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`MARKETING_${table.toUpperCase()}_GET_ERROR:`, error);
    throw error;
  }

  return data || [];
}

/* ==========================================================================
   GET
   ========================================================================== */

/**
 * GET /api/marketing
 *
 * Retorna os dados brutos necessários para o módulo de marketing.
 *
 * Regra arquitetural:
 * - Backend valida autenticação e permissão.
 * - Backend isola por conta_id.
 * - Backend usa select("*").
 * - Filtros, segmentações e visualizações ficam no front.
 *
 * Ideias de segmentação no front:
 * - aniversariantes;
 * - receita vencendo;
 * - receita vencida;
 * - clientes sem comprar há 2 anos;
 * - clientes com OS pronta para retirada;
 * - clientes com pagamento pendente;
 * - campanha promocional manual.
 */
export async function GET() {
  try {
    const { supabase, profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const permissionError = requireAdmin(profile);

    if (permissionError) return permissionError;

    const [
      clientes,
      ordensServico,
      receitas,
      vendedores,
    ] = await Promise.all([
      safeSelectAll({
        supabase,
        table: "clientes",
        contaId: profile.conta_id,
      }),

      safeSelectAll({
        supabase,
        table: "ordens_servico",
        contaId: profile.conta_id,
        orderBy: "data_venda",
      }),

      safeSelectAll({
        supabase,
        table: "receitas",
        contaId: profile.conta_id,
        orderBy: "data_receita",
      }),

      safeSelectAll({
        supabase,
        table: "vendedores",
        contaId: profile.conta_id,
      }),
    ]);

    return NextResponse.json({
      success: true,
      marketing: {
        clientes,
        ordensServico,
        receitas,
        vendedores,
      },
    });
  } catch (error) {
    console.error("MARKETING_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao carregar dados de marketing.",
        details:
          process.env.NODE_ENV === "development"
            ? normalizeError(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}