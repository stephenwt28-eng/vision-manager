"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";



export default function SignUpPage() {

  const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   );

  const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  async function handleSignUp(event) {
     event.preventDefault();
     setLoading(true);
     setError("");

      const { error } = await supabase.auth.signUp({
       email,
       password,
     });
     
     if (error) {
     setError(error.message || "Erro ao criar conta.");
   } else {
     router.push("/login"); // Redirect to login after signup
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
            Criar conta
          </h1>

          <p className="mt-2 text-sm text-foreground">
            Preencha os dados abaixo para se cadastrar.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-foreground">
              E-mail
            </label>

            <input 
      type="email" 
      value={email}
      onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
      <p className="text-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-medium text-primary transition hover:text-primary">
          Entrar
        </Link>
      </p>
    </div>
      </section>
    </main>
  );
}