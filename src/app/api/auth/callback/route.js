import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(next) {
  if (!next) return "/admin";
  if (typeof next !== "string") return "/admin";
  if (!next.startsWith("/")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  if (next.startsWith("/api")) return "/admin";

  return next;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("AUTH_CALLBACK_ERROR:", error);

      return NextResponse.redirect(
        new URL("/login?error=callback_error", requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}