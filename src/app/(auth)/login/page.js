"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível fazer login.");
        return;
      }

      router.replace(data.redirectTo || "/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">
            VisionManager
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Entrar no sistema
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Acesse o painel administrativo ou o terminal do balcão.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@otica.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Senha
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/recovery"
            className="text-zinc-300 transition hover:text-white"
          >
            Esqueci minha senha
          </Link>

          <Link
            href="/signup"
            className="font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}