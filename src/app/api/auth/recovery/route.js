import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Informe seu e-mail." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = request.nextUrl.origin;

    const redirectTo = `${origin}/api/auth/recovery?next=${encodeURIComponent(
      "/recovery?mode=update"
    )}`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Não foi possível enviar a recuperação." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Se este e-mail estiver cadastrado, você receberá um link de recuperação.",
    });
  } catch (error) {
    console.error("RECOVERY_REQUEST_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao solicitar recuperação." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/recovery?mode=update";

    if (!code) {
      return NextResponse.redirect(
        new URL("/recovery?error=link_invalido", request.url)
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/recovery?error=link_expirado", request.url)
      );
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("RECOVERY_CALLBACK_ERROR:", error);

    return NextResponse.redirect(
      new URL("/recovery?error=erro_recuperacao", request.url)
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { password, confirmPassword } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "A nova senha precisa ter pelo menos 8 caracteres." },
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão de recuperação inválida ou expirada." },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Não foi possível atualizar a senha." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso.",
      redirectTo: "/login?password_reset=1",
    });
  } catch (error) {
    console.error("RECOVERY_UPDATE_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao redefinir senha." },
      { status: 500 }
    );
  }
}