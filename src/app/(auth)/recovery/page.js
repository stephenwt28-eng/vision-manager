"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RecoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") === "update" ? "update" : "request";

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRequestRecovery(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível enviar a recuperação.");
        return;
      }

      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/auth/recovery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwords),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
        return;
      }

      router.replace(data.redirectTo || "/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-2xl">
        {mode === "request" ? (
          <>
            <div className="mb-8">
              <p className="text-sm font-medium text-primary">
                Recuperação
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Esqueci minha senha
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos o link de redefinição.
              </p>
            </div>

            <form onSubmit={handleRequestRecovery} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-foreground">
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@otica.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar recuperação"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-sm font-medium text-primary">
                Nova senha
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Redefinir acesso
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Crie uma nova senha para continuar.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-foreground">
                  Nova senha
                </label>

                <input
                  type="password"
                  value={passwords.password}
                  onChange={(event) =>
                    setPasswords((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-foreground">
                  Confirmar nova senha
                </label>

                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(event) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Repita a senha"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
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
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Voltar para o login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense fallback={null}>
      <RecoveryContent />
    </Suspense>
  );
}