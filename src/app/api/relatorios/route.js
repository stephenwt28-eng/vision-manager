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

    const [
      contaResult,
      configuracoesResult,
      clientesResult,
      vendedoresResult,
      ordensServicoResult,
      receitasResult,
      armacoesResult,
      lentesResult,
      anexosResult,
      historicoStatusResult,
    ] = await Promise.all([
      supabase.from("contas").select("*").eq("id", contaId).single(),

      supabase
        .from("configuracoes_conta")
        .select("*")
        .eq("conta_id", contaId)
        .maybeSingle(),

      supabase.from("clientes").select("*").eq("conta_id", contaId),

      supabase.from("vendedores").select("*").eq("conta_id", contaId),

      supabase
        .from("ordens_servico")
        .select("*")
        .eq("conta_id", contaId),

      supabase.from("receitas").select("*").eq("conta_id", contaId),

      supabase.from("armacoes").select("*").eq("conta_id", contaId),

      supabase.from("lentes").select("*").eq("conta_id", contaId),

      supabase.from("anexos").select("*").eq("conta_id", contaId),

      supabase
        .from("historico_status_os")
        .select("*")
        .eq("conta_id", contaId),
    ]);

    if (contaResult.error) {
      throw contaResult.error;
    }

    if (configuracoesResult.error) {
      throw configuracoesResult.error;
    }

    if (clientesResult.error) {
      throw clientesResult.error;
    }

    if (vendedoresResult.error) {
      throw vendedoresResult.error;
    }

    if (ordensServicoResult.error) {
      throw ordensServicoResult.error;
    }

    if (receitasResult.error) {
      throw receitasResult.error;
    }

    if (armacoesResult.error) {
      throw armacoesResult.error;
    }

    if (lentesResult.error) {
      throw lentesResult.error;
    }

    if (anexosResult.error) {
      throw anexosResult.error;
    }

    if (historicoStatusResult.error) {
      throw historicoStatusResult.error;
    }

    return NextResponse.json({
      success: true,
      data: {
        conta: contaResult.data ?? null,
        configuracoes_conta: configuracoesResult.data ?? null,
        clientes: clientesResult.data ?? [],
        vendedores: vendedoresResult.data ?? [],
        ordens_servico: ordensServicoResult.data ?? [],
        receitas: receitasResult.data ?? [],
        armacoes: armacoesResult.data ?? [],
        lentes: lentesResult.data ?? [],
        anexos: anexosResult.data ?? [],
        historico_status_os: historicoStatusResult.data ?? [],
      },
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios administrativos:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao carregar os dados dos relatórios.",
      },
      { status: 500 }
    );
  }
}