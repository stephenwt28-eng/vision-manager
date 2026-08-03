import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

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

function hashPin(pin) {
  return createHash("sha256").update(pin).digest("hex");
}

function sanitizeVendedor(vendedor) {
  if (!vendedor) return null;

  const { pin_hash, ...safeVendedor } = vendedor;

  return safeVendedor;
}

export async function POST(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const body = await request.json();
    const pin = String(body?.pin || "").trim();

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "Informe um PIN válido com 4 dígitos." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const pinHash = hashPin(pin);

    const { data: vendedor, error: vendedorError } = await admin
      .from("vendedores")
      .select("*")
      .eq("conta_id", profile.conta_id)
      .eq("pin_hash", pinHash)
      .eq("status", "ativo")
      .single();

    if (vendedorError || !vendedor) {
      await admin.from("logs_acesso_relatorio_vendedor").insert({
        conta_id: profile.conta_id,
        vendedor_id: null,
        nome_vendedor_informado: null,
        pin_validado: false,
        origem_acesso: "terminal",
        motivo_falha: "PIN inválido ao filtrar clientes",
      });

      return NextResponse.json(
        { error: "PIN inválido ou vendedor inativo." },
        { status: 401 }
      );
    }

    await admin.from("logs_acesso_relatorio_vendedor").insert({
      conta_id: profile.conta_id,
      vendedor_id: vendedor.id,
      nome_vendedor_informado:
        vendedor.nome_exibicao || vendedor.nome_completo || null,
      pin_validado: true,
      origem_acesso: profile.role === "admin" ? "admin" : "terminal",
      motivo_falha: null,
    });

    return NextResponse.json({
      success: true,
      vendedor: sanitizeVendedor(vendedor),
    });
  } catch (error) {
    console.error("VALIDAR_PIN_VENDEDOR_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao validar o PIN do vendedor." },
      { status: 500 }
    );
  }
}