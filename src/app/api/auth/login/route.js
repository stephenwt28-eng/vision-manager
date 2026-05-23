import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getRedirectByRole(role) {
  if (role === "balcao") return "/balcao";
  return "/admin";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select(`
        id,
        conta_id,
        nome_completo,
        email,
        telefone,
        role,
        status
      `)
      .eq("id", authData.user.id)
      .maybeSingle();

    if (usuarioError || !usuario) {
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

    await supabase
      .from("usuarios")
      .update({
        ultimo_acesso_em: new Date().toISOString(),
      })
      .eq("id", usuario.id);

    return NextResponse.json({
      success: true,
      user: usuario,
      redirectTo: getRedirectByRole(usuario.role),
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao fazer login." },
      { status: 500 }
    );
  }
}