import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      nomeFantasia,
      nomeCompleto,
      email,
      telefone,
      password,
      confirmPassword,
    } = body;

    if (!nomeFantasia?.trim()) {
      return NextResponse.json(
        { error: "Informe o nome da ótica." },
        { status: 400 }
      );
    }

    if (!nomeCompleto?.trim()) {
      return NextResponse.json(
        { error: "Informe seu nome completo." },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Informe seu e-mail." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "As senhas não coincidem." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = request.nextUrl.origin;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=/login?confirmed=1`,
        data: {
          nome_fantasia: nomeFantasia.trim(),
          nome_completo: nomeCompleto.trim(),
          telefone: telefone?.trim() || null,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Não foi possível criar a conta." },
        { status: 400 }
      );
    }

    if (data.user) {
  await supabase
    .from("user_profiles")
    .insert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      status: "ativo",
      role: "admin",
    });
}

    return NextResponse.json({
      success: true,
      message: data.session
        ? "Conta criada com sucesso."
        : "Conta criada. Verifique seu e-mail para confirmar o cadastro.",
      needsEmailConfirmation: !data.session,
      redirectTo: data.session ? "/admin" : "/login",
    });
  } catch (error) {
    console.error("SIGNUP_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}