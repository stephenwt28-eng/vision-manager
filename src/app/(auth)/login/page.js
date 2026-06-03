"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const [supabase, setSupabase] = useState(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

useEffect(() => {
  setSupabase(createClient());
}, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "acesso_bloqueado") {
      setError("Sua conta foi desativada. Contate o administrador.");
    }
  }, [searchParams]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    if (!supabase) return;
  event.preventDefault();
  setLoading(true);
  setError("");

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email, password: form.password }),
  });

  const data = await response.json();

if (!response.ok) {
  setError(data.error || "Erro ao fazer login");
} else if (data.redirectTo) {
  router.push(data.redirectTo);
} else {
  console.error("No redirectTo in response:", data);
  setError("Erro: redirecionamento não configurado");
}
setLoading(false);
}

    console.log('Attempting login with:', { email: form.email });

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            VisionManager
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Entrar no sistema
          </h1>

          <p className="mt-2 text-sm text-foreground">
            Acesse o painel administrativo ou o terminal do balcão.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-foreground">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@otica.com"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-foreground">
              Senha
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-text-primary"
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/recovery"
            className="text-foreground transition hover:text-foreground"
          >
            Esqueci minha senha
          </Link>

          <Link
            href="/signup"
            className="font-medium text-primary transition hover:text-primary"
          >
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}