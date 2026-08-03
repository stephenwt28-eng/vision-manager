// src/app/signup/page.js

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialForm = {
  nomeFantasia: "",
  nomeCompleto: "",
  email: "",
  telefone: "",
  password: "",
  confirmPassword: "",
};

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return {
      label: "Digite uma senha",
      className: "bg-muted",
      textClassName: "text-muted-foreground",
      width: "0%",
    };
  }

  if (score <= 1) {
    return {
      label: "Senha fraca",
      className: "bg-red-500",
      textClassName: "text-red-600",
      width: "33%",
    };
  }

  if (score <= 3) {
    return {
      label: "Senha boa",
      className: "bg-amber-500",
      textClassName: "text-amber-600",
      width: "66%",
    };
  }

  return {
    label: "Senha forte",
    className: "bg-emerald-500",
    textClassName: "text-emerald-600",
    width: "100%",
  };
}

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(formData.password);
  }, [formData.password]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setServerError("");
    setServerMessage("");

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.nomeFantasia.trim()) {
      nextErrors.nomeFantasia = "Informe o nome da ótica.";
    }

    if (!formData.nomeCompleto.trim()) {
      nextErrors.nomeCompleto = "Informe seu nome completo.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!formData.password) {
      nextErrors.password = "Informe uma senha.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "A senha precisa ter pelo menos 8 caracteres.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirme sua senha.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setServerError("");
      setServerMessage("");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeFantasia: formData.nomeFantasia.trim(),
          nomeCompleto: formData.nomeCompleto.trim(),
          email: formData.email.trim().toLowerCase(),
          telefone: formData.telefone.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível criar sua conta.");
      }

      setServerMessage(
        data?.message ||
          "Conta criada com sucesso. Verifique seu e-mail para continuar."
      );

      if (data?.needsEmailConfirmation) {
        setFormData(initialForm);

        window.setTimeout(() => {
          router.push(data?.redirectTo || "/login");
        }, 1800);

        return;
      }

      router.push(data?.redirectTo || "/admin");
    } catch (error) {
      setServerError(error?.message || "Erro inesperado ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-24 top-24 size-72 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 right-0 size-96 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
              <Sparkles className="size-4" />
              Gestão inteligente para óticas
            </div>

            <div className="mt-16 max-w-xl">
              <h1 className="text-5xl font-black tracking-[-0.07em]">
                Cadastre sua ótica e comece a organizar tudo sem virar polvo.
              </h1>

              <p className="mt-6 text-lg font-medium leading-8 text-white/80">
                Clientes, ordens de serviço, receitas, garantias, financeiro e
                rotina da loja em um só painel. Menos planilha rebelde, mais
                controle de verdade.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4">
            <div className="rounded-[34px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-white text-primary">
                  <ShieldCheck className="size-6" />
                </div>

                <div>
                  <p className="font-black">Conta protegida</p>
                  <p className="mt-1 text-sm font-medium text-white/70">
                    Autenticação via Supabase Auth com sessão segura.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-white text-primary">
                  <CheckCircle2 className="size-6" />
                </div>

                <div>
                  <p className="font-black">Fluxo completo</p>
                  <p className="mt-1 text-sm font-medium text-white/70">
                    Cadastro, confirmação de e-mail, login e recuperação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-xl">
            <div className="mb-8 text-center lg:text-left">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                Já tenho conta
                <ArrowRight className="size-4" />
              </Link>

              <h2 className="mt-7 text-4xl font-black tracking-[-0.07em] text-dark-title">
                Criar conta
              </h2>

              <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                Preencha os dados principais da ótica. Depois do cadastro, o
                sistema pode pedir confirmação por e-mail antes do login.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.55)] sm:p-7"
            >
              {serverError ? (
                <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {serverError}
                </div>
              ) : null}

              {serverMessage ? (
                <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  {serverMessage}
                </div>
              ) : null}

              <div className="grid gap-4">
                <FormField
                  label="Nome da ótica"
                  error={errors.nomeFantasia}
                  icon={Building2}
                >
                  <Input
                    value={formData.nomeFantasia}
                    onChange={(event) =>
                      updateField("nomeFantasia", event.target.value)
                    }
                    placeholder="Ex.: Óticas Carol"
                    className="h-13 rounded-2xl border-border bg-background pl-11 font-semibold"
                    autoComplete="organization"
                  />
                </FormField>

                <FormField
                  label="Seu nome completo"
                  error={errors.nomeCompleto}
                  icon={UserRound}
                >
                  <Input
                    value={formData.nomeCompleto}
                    onChange={(event) =>
                      updateField("nomeCompleto", event.target.value)
                    }
                    placeholder="Nome do responsável"
                    className="h-13 rounded-2xl border-border bg-background pl-11 font-semibold"
                    autoComplete="name"
                  />
                </FormField>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="E-mail" error={errors.email} icon={Mail}>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="voce@email.com"
                      className="h-13 rounded-2xl border-border bg-background pl-11 font-semibold"
                      autoComplete="email"
                    />
                  </FormField>

                  <FormField label="Telefone" error={errors.telefone} icon={Phone}>
                    <Input
                      value={formData.telefone}
                      onChange={(event) =>
                        updateField("telefone", formatPhone(event.target.value))
                      }
                      placeholder="(00) 00000-0000"
                      className="h-13 rounded-2xl border-border bg-background pl-11 font-semibold"
                      autoComplete="tel"
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Senha" error={errors.password} icon={Lock}>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        placeholder="Mínimo 8 caracteres"
                        className="h-13 rounded-2xl border-border bg-background pl-11 pr-11 font-semibold"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormField>

                  <FormField
                    label="Confirmar senha"
                    error={errors.confirmPassword}
                    icon={Lock}
                  >
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(event) =>
                          updateField("confirmPassword", event.target.value)
                        }
                        placeholder="Repita sua senha"
                        className="h-13 rounded-2xl border-border bg-background pl-11 pr-11 font-semibold"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary"
                        aria-label={
                          showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormField>
                </div>

                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.className}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>

                  <p
                    className={`mt-2 text-xs font-black ${passwordStrength.textClassName}`}
                  >
                    {passwordStrength.label}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-7 h-13 w-full rounded-2xl font-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar minha conta
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="mt-5 text-center text-xs font-semibold leading-5 text-muted-foreground">
                Ao criar sua conta, você poderá acessar o painel administrativo
                após a confirmação necessária do cadastro.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function FormField({ label, error, icon: Icon, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-dark-title">{label}</span>

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}

        {children}
      </div>

      {error ? (
        <span className="block text-xs font-bold text-red-600">{error}</span>
      ) : null}
    </label>
  );
}