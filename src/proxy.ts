import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Definição de tipos para o usuário do banco de dados
interface Usuario {
  id: string;
  role: string;
 
  status: string;
}

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isBalcaoRoute(pathname: string): boolean {
  return pathname === "/balcao" || pathname.startsWith("/balcao/");
}

function isAuthRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/recovery"
  );
}

function getHomeByRole(role: string): string {
  if (role === "balcao") return "/balcao";
  return "/admin";
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Tipagem do getClaims do Supabase (geralmente retorna any/unknown por padrão se não customizado)
  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = (claimsData as any)?.claims?.sub || null;
  const isAuthenticated = Boolean(userId);

  const protectedAdmin = isAdminRoute(pathname);
  const protectedBalcao = isBalcaoRoute(pathname);
  const protectedRoute = protectedAdmin || protectedBalcao;

  if (!isAuthenticated) {
    if (protectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Forçando o tipo do retorno da query para bater com a interface Usuario
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, role, status")
    .eq("id", userId)
    .maybeSingle() as { data: Usuario | null };

  if (!usuario || usuario.status !== "ativo") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "acesso_bloqueado");

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getHomeByRole(usuario.role);
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  if (protectedAdmin && usuario.role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/balcao";
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  if (protectedBalcao && usuario.role !== "balcao") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};