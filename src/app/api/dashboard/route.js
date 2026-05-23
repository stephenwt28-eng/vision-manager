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
          error: "Usuário não autenticado.",
        },
        { status: 401 }
      );
    }

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        {
          error: "Perfil de usuário não encontrado.",
        },
        { status: 404 }
      );
    }

    if (usuario.status !== "ativo") {
      return NextResponse.json(
        {
          error: "Seu acesso está inativo ou bloqueado.",
        },
        { status: 403 }
      );
    }

    if (usuario.role !== "admin") {
      return NextResponse.json(
        {
          error: "Acesso permitido apenas para administradores.",
        },
        { status: 403 }
      );
    }

    const contaId = usuario.conta_id;

    const [clientesResult, ordensServicoResult, vendedoresResult] =
      await Promise.all([
        supabase.from("clientes").select("*").eq("conta_id", contaId),

        supabase
          .from("ordens_servico")
          .select("*")
          .eq("conta_id", contaId),

        supabase.from("vendedores").select("*").eq("conta_id", contaId),
      ]);

    if (clientesResult.error) {
      throw clientesResult.error;
    }

    if (ordensServicoResult.error) {
      throw ordensServicoResult.error;
    }

    if (vendedoresResult.error) {
      throw vendedoresResult.error;
    }

    return NextResponse.json({
      success: true,
      data: {
        clientes: clientesResult.data ?? [],
        ordens_servico: ordensServicoResult.data ?? [],
        vendedores: vendedoresResult.data ?? [],
      },
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao carregar os dados do dashboard.",
      },
      { status: 500 }
    );
  }
}