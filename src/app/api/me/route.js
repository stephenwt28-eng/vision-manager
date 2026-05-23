import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
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
        image_url,
        telefone,
        role,
        status,
        ultimo_acesso_em,
        created_at,
        conta:contas (
          id,
          nome_fantasia,
          razao_social,
          cnpj,
          telefone,
          email,
          status
        )
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: "Usuário não encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: usuario,
    });
  } catch (error) {
    console.error("ME_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar usuário logado." },
      { status: 500 }
    );
  }
}