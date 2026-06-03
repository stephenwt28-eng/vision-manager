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

    const supabase = createClient();

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

   console.log("Auth user ID:", authData.user.id, "Type:", typeof authData.user.id);

const { data: usuario, error: usuarioError } = await supabase
  .from("user_profiles")
  .select(`id, email, status, role`)
  .eq("id", authData.user.id)
  .maybeSingle();

console.log("Query result:", { usuario, usuarioError });
console.log("All user_profiles:", await supabase.from("user_profiles").select("*"));

    if (usuarioError || !usuario) {
      console.log("User profile not found or error:", usuarioError);
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