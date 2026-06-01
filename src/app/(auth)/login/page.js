"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const supabase = createClient();

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
  event.preventDefault();
  setLoading(true);
  setError("");

  console.log('Attempting login with:', { email: form.email });
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: form.email, 
    password: form.password 
  });

  console.log('Supabase response:', { data, error });
  
  if (error) {
    console.error('Login failed:', error.message);
    setError(error.message);
  } else {
    console.log('Login successful, redirecting to:', redirect);
    setTimeout(() => {
    router.push(redirect);
    }, 500);
  }
  setLoading(false);
}

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