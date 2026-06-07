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

  console.log('DEBUG usuarioError:', usuarioError, 'usuario:', usuario, 'user.id:', user.id);

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

        const clientesData = await supabase.from("clientes").select("*").limit(100);
    if (clientesData.error) throw clientesData.error;

    return NextResponse.json({
      success: true,
      data: {
        clientes: clientesData.data ?? [],
        ordens_servico: [],
        vendedores: [],
        totalRevenue: 0,
        openOrders: [],
        delayedOrders: [],
        readyOrders: [],
        deliveredOrders: [],
        averageTicket: 0,
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