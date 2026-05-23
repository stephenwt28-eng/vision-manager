"use client";

import {
  BadgeCheck,
  Camera,
  CircleUserRound,
  ImagePlus,
  KeyRound,
  LockKeyhole,
  Mail,
  PencilLine,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { formatPhoneInput } from "@/lib/formatter";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "US";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getRoleLabel(role) {
  if (role === "admin") return "Administrador";
  if (role === "balcao") return "Balcão";
  return role || "Usuário";
}

function getStatusLabel(status) {
  if (status === "ativo") return "Ativo";
  if (status === "inativo") return "Inativo";
  if (status === "bloqueado") return "Bloqueado";
  return status || "Não informado";
}

function getStatusBadgeClass(status) {
  if (status === "ativo") {
    return "rounded-full bg-primary px-3 py-1 text-primary-foreground";
  }

  if (status === "inativo") {
    return "rounded-full bg-zinc-700 px-3 py-1 text-white";
  }

  if (status === "bloqueado") {
    return "rounded-full bg-amber-500 px-3 py-1 text-white";
  }

  return "rounded-full px-3 py-1 text-muted-foreground";
}

function getRoleBadgeClass(role) {
  if (role === "admin") {
    return "rounded-full bg-dark-title px-3 py-1 text-white";
  }

  return "rounded-full bg-primary/[0.08] px-3 py-1 text-primary";
}

function formatDateTimeBR(value) {
  if (!value) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Não informado";
  }
}

function formatFileSize(size = 0) {
  if (!size) return "";

  const mb = size / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  const kb = size / 1024;

  return `${Math.round(kb)} KB`;
}

/* ==========================================================================
   COMPONENTES BASE
   ========================================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
          <Icon className="size-4" />
          {eyebrow}
        </div>

        <h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-dark-title">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  icon: Icon,
  children,
  helper,
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-black text-dark-title">
        <Icon className="size-4 text-primary" />
        {label}
      </label>

      {children}

      {helper ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3 rounded-[24px] border border-border bg-background p-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-dark-title">
          {value || "Não informado"}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   CABEÇALHO DO PERFIL
   ========================================================================== */

export function PerfilHero({
  perfil,
  onRefresh,
  isRefreshing = false,
}) {
  const roleLabel = getRoleLabel(perfil?.role);
  const statusLabel = getStatusLabel(perfil?.status);

  return (
    <section className="overflow-hidden rounded-[42px] border border-border bg-card shadow-[0_38px_110px_-72px_rgba(15,23,42,0.46)]">
      <div className="relative p-5 sm:p-7">
        <div className="absolute right-[-70px] top-[-70px] size-56 rounded-full bg-primary/[0.08]" />
        <div className="absolute bottom-[-100px] left-[15%] size-64 rounded-full bg-primary/[0.05]" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              {perfil?.image_url ? (
                <img
                  src={perfil.image_url}
                  alt={perfil?.nome_completo || "Foto do usuário"}
                  className="size-28 rounded-[34px] border border-border object-cover shadow-[0_24px_55px_-38px_rgba(15,23,42,0.55)]"
                />
              ) : (
                <div className="grid size-28 place-items-center rounded-[34px] border border-border bg-background text-3xl font-black text-primary shadow-[0_24px_55px_-38px_rgba(15,23,42,0.55)]">
                  {getInitials(perfil?.nome_completo)}
                </div>
              )}

              <div className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full border-4 border-card bg-primary text-primary-foreground">
                <BadgeCheck className="size-4" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getRoleBadgeClass(perfil?.role)}>
                  {roleLabel}
                </Badge>

                <Badge className={getStatusBadgeClass(perfil?.status)}>
                  {statusLabel}
                </Badge>
              </div>

              <h1 className="mt-4 break-words text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-4xl">
                {perfil?.nome_completo || "Perfil do usuário"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Central de dados pessoais, foto de perfil e credenciais autorizadas da conta.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-13 rounded-full px-5 font-black"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar dados
            </Button>
          </div>
        </div>

        <div className="relative mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoPill
            icon={Mail}
            label="E-mail"
            value={perfil?.email}
          />

          <InfoPill
            icon={Phone}
            label="Telefone"
            value={perfil?.telefone}
          />

          <InfoPill
            icon={UserRound}
            label="Cargo"
            value={perfil?.cargo}
          />

          <InfoPill
            icon={ShieldCheck}
            label="Último acesso"
            value={formatDateTimeBR(perfil?.ultimo_acesso_em)}
          />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FORMULÁRIO PRINCIPAL DE PERFIL
   ========================================================================== */

export function PerfilFormCard({
  perfil,
  formData,
  avatarFile,
  avatarPreviewUrl,
  onChange,
  onAvatarChange,
  onSubmit,
  isSaving = false,
}) {
  function handleChange(field, value) {
    onChange({
      ...formData,
      [field]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  const visibleAvatar =
    avatarPreviewUrl || perfil?.image_url || "";

  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <SectionHeader
        eyebrow="Editar perfil"
        title="Seus dados ficam aqui"
        description="A foto é enviada para o bucket de avatares. Ao salvar uma nova imagem, o backend troca o arquivo e remove a anterior."
        icon={PencilLine}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <FieldBlock label="Nome completo" icon={UserRound}>
            <Input
              value={formData.nome_completo}
              onChange={(event) =>
                handleChange("nome_completo", event.target.value)
              }
              placeholder="Digite seu nome completo"
              className="h-14 rounded-2xl border-border bg-background text-sm font-medium shadow-none"
            />
          </FieldBlock>

          <FieldBlock label="E-mail" icon={Mail}>
            <Input
              type="email"
              value={formData.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              placeholder="voce@email.com"
              className="h-14 rounded-2xl border-border bg-background text-sm font-medium shadow-none"
            />
          </FieldBlock>

          <FieldBlock label="Telefone" icon={Phone}>
            <Input
              value={formData.telefone}
              onChange={(event) =>
                handleChange(
                  "telefone",
                  formatPhoneInput(event)
                )
              }
              placeholder="(00) 00000-0000"
              className="h-14 rounded-2xl border-border bg-background text-sm font-medium shadow-none"
            />
          </FieldBlock>
        </div>

        <div className="rounded-[34px] border border-border bg-background/70 p-4 sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {visibleAvatar ? (
                <img
                  src={visibleAvatar}
                  alt="Prévia da foto de perfil"
                  className="size-24 rounded-[30px] border border-border object-cover shadow-[0_18px_42px_-28px_rgba(15,23,42,0.40)]"
                />
              ) : (
                <div className="grid size-24 place-items-center rounded-[30px] border border-border bg-card text-primary">
                  <CircleUserRound className="size-11" />
                </div>
              )}

              <div>
                <p className="flex items-center gap-2 text-sm font-black text-dark-title">
                  <Camera className="size-4 text-primary" />
                  Foto de perfil
                </p>

                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Envie uma imagem JPG, PNG ou WEBP com até 5 MB.
                </p>

                {avatarFile ? (
                  <p className="mt-2 text-xs font-bold text-primary">
                    Nova foto selecionada: {avatarFile.name}{" "}
                    {formatFileSize(avatarFile.size)
                      ? `• ${formatFileSize(avatarFile.size)}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-primary-foreground transition hover:opacity-90">
                <Upload className="size-4" />
                Escolher foto

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    onAvatarChange(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-13 rounded-full px-6 font-black"
          >
            <Save className="size-4" />
            {isSaving ? "Salvando..." : "Salvar perfil"}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ==========================================================================
   TROCA DE SENHA PARA ADMIN
   ========================================================================== */

export function PerfilSenhaAdminCard({
  passwordData,
  onChange,
  onSubmit,
  isSaving = false,
}) {
  function handleChange(field, value) {
    onChange({
      ...passwordData,
      [field]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <SectionHeader
        eyebrow="Segurança"
        title="Alterar senha"
        description="Disponível apenas para administradores. A rota valida novamente no backend."
        icon={LockKeyhole}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-5">
          <FieldBlock label="Nova senha" icon={KeyRound}>
            <Input
              type="password"
              value={passwordData.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              placeholder="Mínimo de 8 caracteres"
              className="h-14 rounded-2xl border-border bg-background text-sm font-medium shadow-none"
            />
          </FieldBlock>

          <FieldBlock label="Confirmar nova senha" icon={LockKeyhole}>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(event) =>
                handleChange("confirmPassword", event.target.value)
              }
              placeholder="Digite novamente"
              className="h-14 rounded-2xl border-border bg-background text-sm font-medium shadow-none"
            />
          </FieldBlock>
        </div>

        <div className="rounded-[28px] border border-primary/15 bg-primary/[0.05] p-4">
          <p className="text-sm font-black text-dark-title">
            Regra de acesso
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            O formulário só aparece para administradores e a rota também valida essa permissão.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-13 rounded-full px-6 font-black"
          >
            <KeyRound className="size-4" />
            {isSaving ? "Atualizando..." : "Atualizar senha"}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ==========================================================================
   ESTADOS DE TELA
   ========================================================================== */

export function PerfilLoadingState() {
  return (
    <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-[24px] bg-primary/[0.08] text-primary">
          <RefreshCw className="size-7 animate-spin" />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-dark-title">
          Carregando perfil
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Buscando seus dados e preparando a edição.
        </p>
      </div>
    </section>
  );
}

export function PerfilErrorState({
  message,
  onRetry,
}) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-[24px] bg-amber-500/10 text-amber-600">
          <ShieldCheck className="size-7" />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-dark-title">
          Não foi possível carregar o perfil
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {message || "O sistema não conseguiu buscar os dados do usuário."}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-5 h-12 rounded-full px-5 font-black"
        >
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
      </div>
    </section>
  );
}