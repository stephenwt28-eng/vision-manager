import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/login";

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=callback_sem_codigo", request.url)
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=confirmacao_invalida", request.url)
      );
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("AUTH_CALLBACK_ERROR:", error);

    return NextResponse.redirect(
      new URL("/login?error=erro_callback", request.url)
    );
  }
}