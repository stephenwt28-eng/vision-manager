import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: "Não foi possível sair da conta." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao sair da conta." },
      { status: 500 }
    );
  }
}