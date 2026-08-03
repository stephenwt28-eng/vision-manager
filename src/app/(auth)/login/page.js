"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Glasses,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const heroImageUrl =
  "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1600&auto=format&fit=crop";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen overflow-hidden bg-[#f7f7fb] text-slate-950">
      <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute left-10 top-10 size-52 rounded-full bg-[#6f58cc]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-10 size-64 rounded-full bg-[#6f58cc]/15 blur-3xl" />

          <div className="relative w-full max-w-[500px]">

            <div className="rounded-[38px] border border-slate-200 bg-white/85 p-6 shadow-[0_42px_120px_-72px_rgba(15,23,42,0.48)] backdrop-blur-xl sm:p-8">
              <div>

                <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.075em] text-[#1B1464] sm:text-5xl">
                  Entre na plataforma.
                </h1>

                <p className="mt-4 text-base leading-7 text-slate-500">
                  Acesse o painel administrativo ou o terminal do balcão com
                  segurança, rapidez e controle.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    E-mail
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#6f58cc]" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="voce@otica.com"
                      autoComplete="email"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#6f58cc]/45 focus:bg-white focus:shadow-[0_18px_45px_-34px_rgba(111,88,204,0.9)]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Senha
                  </label>

                  <div className="group relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#6f58cc]" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 pr-16 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#6f58cc]/45 focus:bg-white focus:shadow-[0_18px_45px_-34px_rgba(111,88,204,0.9)]"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="absolute right-2.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition duration-300 hover:bg-[#6f58cc]/10 hover:text-[#6f58cc] active:scale-90"
                    >
                      <span
                        className={`grid place-items-center transition duration-300 ${
                          showPassword
                            ? "rotate-0 scale-110"
                            : "-rotate-6 scale-100"
                        }`}
                      >
                        {showPassword ? (
                          <Glasses className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </span>
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Clique no ícone para revelar ou ocultar a senha.
                  </p>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative h-14 w-full overflow-hidden rounded-2xl bg-[#6f58cc] px-4 font-black text-white shadow-[0_28px_60px_-34px_rgba(111,88,204,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#5539c4] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full" />

                  <span className="relative inline-flex items-center justify-center gap-2">
                    {loading ? "Entrando..." : "Entrar na plataforma"}
                    {!loading ? <ArrowRight className="size-4" /> : null}
                  </span>
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/recovery"
                  className="font-semibold text-slate-500 transition hover:text-[#6f58cc]"
                >
                  Esqueci minha senha
                </Link>

              </div>
            </div>
          </div>
        </div>

          <div className="md:block relative hidden h-full overflow-hidden bg-[#1B1464] shadow-[0_42px_120px_-70px_rgba(15,23,42,0.8)]">
            <img
              src={heroImageUrl}
              alt="Ótica moderna com armações e atendimento profissional"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-[#1B1464]/95 via-[#1B1464]/68 to-[#6f58cc]/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.24),transparent_32%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.18),transparent_30%)]" />

            <div className="relative flex h-full flex-col justify-center p-10 xl:p-12">

              <div className="max-w-2xl">

                <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.08em] text-white xl:text-7xl">
                  Tecnologia para óticas que querem enxergar a operação inteira.
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
                  “Criamos plataformas para tirar processos do improviso e
                  transformar atendimento em gestão, sem perder o olhar humano.”
                </p>
                <p className=" max-w-xl text-sm leading-8 text-white/78">
                  - BitBloom AI
                </p>
              </div>
            </div>
          </div>
      </section>
    </main>
  );
}