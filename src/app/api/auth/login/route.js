import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getDefaultRedirectByRole(role) {
  if (role === "balcao") return "/balcao";
  return "/admin";
}

function isSafeInternalRedirect(value) {
  if (!value) return false;
  if (typeof value !== "string") return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/api")) return false;
  if (value.startsWith("/login")) return false;
  if (value.startsWith("/signup")) return false;

  return true;
}

function getRedirectTo(role, requestedRedirect) {
  const defaultRedirect = getDefaultRedirectByRole(role);

  if (!isSafeInternalRedirect(requestedRedirect)) {
    return defaultRedirect;
  }

  if (role === "balcao" && !requestedRedirect.startsWith("/balcao")) {
    return "/balcao";
  }

  return requestedRedirect;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      email,
      password,
      redirect,
    } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data: usuario, error: usuarioError } = await adminSupabase
      .from("usuarios")
      .select(`
        id,
        conta_id,
        nome_completo,
        email,
        telefone,
        role,
        cargo,
        status,
        contas (
          id,
          nome_fantasia,
          status
        )
      `)
      .eq("id", authData.user.id)
      .maybeSingle();

    if (usuarioError || !usuario) {
      console.error("LOGIN_USER_PROFILE_ERROR:", usuarioError);

      await supabase.auth.signOut();

      return NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 403 }
      );
    }

    if (usuario.status !== "ativo") {
      await supabase.auth.signOut();

      return NextResponse.json(
        { error: "Seu acesso está inativo ou bloqueado." },
        { status: 403 }
      );
    }

    if (usuario.contas?.status !== "ativa") {
      await supabase.auth.signOut();

      return NextResponse.json(
        { error: "A conta da ótica está suspensa ou cancelada." },
        { status: 403 }
      );
    }

    const { error: updateError } = await adminSupabase
      .from("usuarios")
      .update({
        ultimo_acesso_em: new Date().toISOString(),
      })
      .eq("id", usuario.id);

    if (updateError) {
      console.error("LOGIN_UPDATE_ACCESS_ERROR:", updateError);
    }

    return NextResponse.json({
      success: true,
      user: usuario,
      redirectTo: getRedirectTo(usuario.role, redirect),
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao fazer login." },
      { status: 500 }
    );
  }
}