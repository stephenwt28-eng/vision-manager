"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Eye,
  Filter,
  KeyRound,
  LockKeyhole,
  Mail,
  PencilLine,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  UserRoundCog,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  formatCNPJInput,
  formatPhoneInput,
  formatCEPInput,
  isValidCNPJ,
  isValidPhone,
  isValidCEP,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const pageSizeOptions = [12, 24, 48, 96];

const roleLabels = {
  admin: "Administrador",
  balcao: "Balcão",
};

const statusLabels = {
  ativo: "Ativo",
  inativo: "Inativo",
  bloqueado: "Bloqueado",
};

const emptyUsuarioForm = {
  nome_completo: "",
  email: "",
  telefone: "",
  image_url: "",
  role: "balcao",
  cargo: "",
  status: "ativo",
  password: "",
  confirmPassword: "",
};

const emptyContaForm = {
  nome_fantasia: "",
  razao_social: "",
  cnpj: "",
  inscricao_estadual: "",
  telefone: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  observacoes: "",
};

const emptyConfiguracoesForm = {
  prefixo_os: "OS",
  proximo_numero_os: "1",
  permitir_edicao_os_terminal: true,
  permitir_alterar_status_os_terminal: true,
  permitir_anexos_terminal: true,
  exibir_valor_vendido_relatorio_vendedor: true,
  exibir_comissao_relatorio_vendedor: true,
  exigir_observacao_ao_cancelar_os: false,
  moeda: "BRL",
  fuso_horario: "America/Sao_Paulo",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

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

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "US";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getStatusBadgeClass(status) {
  if (status === "ativo") {
    return "rounded-full bg-primary px-3 py-1 text-primary-foreground";
  }

  if (status === "inativo") {
    return "rounded-full bg-zinc-700 px-3 py-1 text-primary-foreground";
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

function toInputValue(value) {
  return value ?? "";
}

function getInitialUsuarioForm(usuario) {
  if (!usuario) return emptyUsuarioForm;

  return {
    nome_completo: usuario.nome_completo || "",
    email: usuario.email || "",
    telefone: usuario.telefone || "",
    image_url: usuario.image_url || "",
    role: usuario.role || "balcao",
    cargo: usuario.cargo || "",
    status: usuario.status || "ativo",
    password: "",
    confirmPassword: "",
  };
}

function getInitialContaForm(conta) {
  if (!conta) return emptyContaForm;

  return {
    nome_fantasia: conta.nome_fantasia || "",
    razao_social: conta.razao_social || "",
    cnpj: conta.cnpj || "",
    inscricao_estadual: conta.inscricao_estadual || "",
    telefone: conta.telefone || "",
    email: conta.email || "",
    cep: conta.cep || "",
    rua: conta.rua || "",
    numero: conta.numero || "",
    complemento: conta.complemento || "",
    bairro: conta.bairro || "",
    cidade: conta.cidade || "",
    estado: conta.estado || "",
    pais: conta.pais || "Brasil",
    observacoes: conta.observacoes || "",
  };
}

function getInitialConfiguracoesForm(configuracoes) {
  if (!configuracoes) return emptyConfiguracoesForm;

  return {
    prefixo_os: configuracoes.prefixo_os || "OS",
    proximo_numero_os:
      configuracoes.proximo_numero_os === null ||
      configuracoes.proximo_numero_os === undefined
        ? "1"
        : String(configuracoes.proximo_numero_os),
    permitir_edicao_os_terminal:
      configuracoes.permitir_edicao_os_terminal ?? true,
    permitir_alterar_status_os_terminal:
      configuracoes.permitir_alterar_status_os_terminal ?? true,
    permitir_anexos_terminal:
      configuracoes.permitir_anexos_terminal ?? true,
    exibir_valor_vendido_relatorio_vendedor:
      configuracoes.exibir_valor_vendido_relatorio_vendedor ?? true,
    exibir_comissao_relatorio_vendedor:
      configuracoes.exibir_comissao_relatorio_vendedor ?? true,
    exigir_observacao_ao_cancelar_os:
      configuracoes.exigir_observacao_ao_cancelar_os ?? false,
    moeda: configuracoes.moeda || "BRL",
    fuso_horario:
      configuracoes.fuso_horario || "America/Sao_Paulo",
  };
}

function booleanLabel(value) {
  return value ? "Ativado" : "Desativado";
}

/* ==========================================================================
   COMPONENTES BASE DE LAYOUT
   ========================================================================== */

function FormSection({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-[30px] border border-border bg-background/65 p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
          {title}
        </h3>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function InfoLine({ icon: Icon, label, value }) {
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

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-[24px] border border-border bg-background p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 font-medium text-dark-title">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  value,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-full rounded-[26px] border p-4 text-left transition ${
        value
          ? "border-primary/25 bg-primary/[0.07]"
          : "border-border bg-background hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-dark-title">{title}</p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <Badge
          variant="secondary"
          className={`shrink-0 rounded-full px-3 py-1 ${
            value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {booleanLabel(value)}
        </Badge>
      </div>
    </button>
  );
}

/* ==========================================================================
   KPIS
   ========================================================================== */

export function ConfiguracoesKpis({
  conta,
  usuarios = [],
}) {
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter(
    (usuario) => usuario.role === "admin"
  ).length;
  const totalBalcao = usuarios.filter(
    (usuario) => usuario.role === "balcao"
  ).length;

  const kpis = [
    {
      title: "Conta",
      value: conta?.nome_fantasia || "Ótica",
      meta: "Identidade principal da operação",
      icon: Store,
      compact: true,
    },
    {
      title: "Usuários da plataforma",
      value: totalUsuarios,
      meta: `${totalAdmins} admin${totalAdmins === 1 ? "" : "s"} e ${totalBalcao} balcão`,
      icon: UsersRound,
    },
    {
      title: "Acessos de balcão",
      value: totalBalcao,
      meta: "Contas editáveis e removíveis",
      icon: UserRoundCog,
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-muted-foreground">
                  {kpi.title}
                </p>

                <p
                  className={`mt-3 font-black tracking-[-0.06em] text-dark-title ${
                    kpi.compact
                      ? "line-clamp-2 text-2xl"
                      : "text-3xl"
                  }`}
                >
                  {kpi.value}
                </p>
              </div>

              <div className="grid size-13 shrink-0 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                <Icon className="size-6" />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-primary">
              {kpi.meta}
            </p>
          </div>
        );
      })}
    </section>
  );
}

/* ==========================================================================
   RESUMO DA CONTA / PREFERÊNCIAS
   ========================================================================== */

export function ContaConfiguracaoCards({
  conta,
  configuracoes,
  onEditConta,
  onEditConfiguracoes,
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
              <Building2 className="size-4" />
              Dados da ótica
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-dark-title">
              {conta?.nome_fantasia || "Ótica sem nome cadastrado"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Identidade da conta, canais principais e endereço comercial.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onEditConta}
            className="h-12 rounded-full px-5 font-black"
          >
            <PencilLine className="size-4" />
            Editar conta
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <InfoLine
            icon={Building2}
            label="Razão social"
            value={conta?.razao_social}
          />

          <InfoLine
            icon={ShieldCheck}
            label="CNPJ"
            value={conta?.cnpj}
          />

          <InfoLine
            icon={Phone}
            label="Telefone"
            value={conta?.telefone}
          />

          <InfoLine
            icon={Mail}
            label="E-mail"
            value={conta?.email}
          />
        </div>

        <div className="mt-3">
          <InfoBlock
            label="Endereço resumido"
            value={[
              conta?.rua,
              conta?.numero,
              conta?.bairro,
              conta?.cidade,
              conta?.estado,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </div>
      </article>

      <article className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
              <Settings2 className="size-4" />
              Preferências da operação
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-dark-title">
              Regras que moldam o sistema
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Ajustes da criação de OS, permissões do terminal e visibilidade de relatórios.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onEditConfiguracoes}
            className="h-12 rounded-full px-5 font-black"
          >
            <PencilLine className="size-4" />
            Editar preferências
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <InfoLine
            icon={ShieldCheck}
            label="Editar OS no balcão"
            value={booleanLabel(
              configuracoes?.permitir_edicao_os_terminal ?? true
            )}
          />

          <InfoLine
            icon={ShieldCheck}
            label="Anexos no balcão"
            value={booleanLabel(
              configuracoes?.permitir_anexos_terminal ?? true
            )}
          />
        </div>

        <div className="mt-3">
          <InfoBlock
            label="Regra sensível"
            value={
              configuracoes?.exigir_observacao_ao_cancelar_os
                ? "Cancelar uma OS exige observação explicativa."
                : "Cancelar uma OS não exige observação obrigatória."
            }
          />
        </div>
      </article>
    </section>
  );
}

/* ==========================================================================
   FILTROS DE USUÁRIOS
   ========================================================================== */

export function UsuariosFilters({
  filters,
  onChangeFilters,
  onClearFilters,
  totalResults = 0,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={filters.search}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    search: event.target.value,
                  })
                }
                placeholder="Pesquisar por nome, e-mail, telefone, cargo ou perfil..."
                className="h-14 rounded-full border-border bg-background pl-11 pr-4 text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="h-14 rounded-full px-5 font-black"
              >
                <Filter className="size-4" />
                {open ? "Fechar filtros" : "Mais filtros"}
              </Button>
            </CollapsibleTrigger>

            <Button
              variant="secondary"
              onClick={onClearFilters}
              className="h-14 rounded-full px-5 font-black"
            >
              <X className="size-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {totalResults} usuário{totalResults === 1 ? "" : "s"} encontrado
            {totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Perfil</p>

              <Select
                value={filters.role}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    role: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="balcao">Balcão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Status</p>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    status: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                  <SelectItem value="bloqueado">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">
                Permissão de edição
              </p>

              <Select
                value={filters.editavel}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    editavel: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="editaveis">Editáveis</SelectItem>
                  <SelectItem value="protegidos">Protegidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   CARD DE USUÁRIO
   ========================================================================== */

export function UsuarioCard({
  usuario,
  onView,
}) {
  const isAdmin = usuario?.role === "admin";

  return (
    <button
      type="button"
      onClick={() => onView(usuario)}
      className="group flex min-h-[355px] w-full min-w-0 overflow-hidden rounded-[34px] border border-border bg-card text-left shadow-[0_28px_80px_-64px_rgba(15,23,42,0.42)] transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_38px_100px_-68px_rgba(108,77,230,0.48)]"
    >
      <div className="flex w-full flex-col">
        <div className="relative left-4 top-6 flex flex-wrap gap-2">
            <Badge
              variant="default"
              className={getStatusBadgeClass(usuario?.status)}
            >
              {statusLabels[usuario?.status] || "Sem status"}
            </Badge>

            <Badge
              variant="secondary"
              className={getRoleBadgeClass(usuario?.role)}
            >
              {roleLabels[usuario?.role] || "Perfil"}
            </Badge>
        </div>
        <div className="relative h-60 mt-10 overflow-hidden bg-background">
          {usuario?.image_url ? (
            <img
              src={usuario.image_url}
              alt={usuario.nome_completo || "Usuário"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/[0.06]">
              <div className="grid size-24 place-items-center rounded-full border border-primary/10 bg-card text-3xl font-black tracking-[-0.05em] text-primary shadow-[0_22px_60px_-42px_rgba(108,77,230,0.55)]">
                {getInitials(usuario?.nome_completo)}
              </div>
            </div>
          )}

          

          <div className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-[20px] bg-card/95 text-primary shadow-[0_20px_40px_-26px_rgba(15,23,42,0.50)] backdrop-blur-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
            <Eye className="size-5" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <h3 className="line-clamp-2 text-xl font-black tracking-[-0.045em] text-dark-title">
              {usuario?.nome_completo || "Usuário sem nome"}
            </h3>

            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {usuario?.cargo || roleLabels[usuario?.role] || "Sem cargo"}
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                <span className="truncate">{usuario?.email || "Sem e-mail"}</span>
              </div>

              <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                <span className="truncate">
                  {usuario?.telefone || "Sem telefone"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            {isAdmin ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-dark-title px-3 py-1 text-sm font-black text-white">
                <LockKeyhole className="size-4" />
                Protegido contra edição
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
                <PencilLine className="size-4" />
                Editável pelo admin
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ==========================================================================
   MODAL DE CRIAR / EDITAR USUÁRIO
   ========================================================================== */

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
  onSubmit,
  isSaving = false,
}) {
  const isEditing = Boolean(usuario?.id);
  const isProtectedAdmin = usuario?.role === "admin";

  const [form, setForm] = useState(() =>
    getInitialUsuarioForm(usuario)
  );

  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.nome_completo?.trim()) {
      nextErrors.nome_completo = "Informe o nome completo.";
    }

    if (!form.email?.trim()) {
      nextErrors.email = "Informe o e-mail.";
    }

    if (form.telefone && !isValidPhone(form.telefone)) {
      nextErrors.telefone = "Informe um telefone válido.";
    }

    if (!isEditing) {
      if (!form.password || form.password.length < 8) {
        nextErrors.password = "A senha precisa ter pelo menos 8 caracteres.";
      }

      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "As senhas não coincidem.";
      }
    }

    if (isEditing && (form.password || form.confirmPassword)) {
      if (!form.password || form.password.length < 8) {
        nextErrors.password = "A nova senha precisa ter pelo menos 8 caracteres.";
      }

      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "As senhas não coincidem.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isProtectedAdmin) return;

    if (!validateForm()) return;

    const payload = {
      ...(usuario?.id ? { id: usuario.id } : {}),
      ...form,
    };

    await onSubmit(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-[24px] bg-primary/[0.10] text-primary">
              {isEditing ? (
                <UserRoundCog className="size-7" />
              ) : (
                <UserRoundPlus className="size-7" />
              )}
            </div>

            <div>
              <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
                {isEditing ? "Editar usuário" : "Criar novo usuário"}
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {isEditing
                  ? "Atualize os dados do acesso de balcão. Administradores são exibidos, mas não podem ser alterados por esta tela."
                  : "Cadastre um novo login da plataforma. Você pode criar acesso de balcão ou um segundo administrador."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isProtectedAdmin ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
            <div className="rounded-[30px] border border-border bg-background p-6">
              <div className="flex items-start gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-[24px] bg-dark-title text-white">
                  <LockKeyhole className="size-7" />
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-[-0.045em] text-dark-title">
                    Este administrador está protegido
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    A tela permite visualizar administradores, mas não editar nem remover.
                    Isso evita mudanças acidentais em acessos críticos da conta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-7">
              <FormSection
                title="Identificação do usuário"
                description="Dados básicos usados para apresentar e localizar este acesso."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Nome completo
                    </p>

                    <Input
                      value={form.nome_completo}
                      onChange={(event) =>
                        updateField("nome_completo", event.target.value)
                      }
                      placeholder="Ex.: Balcão Principal"
                      className="h-12 rounded-2xl border-border bg-card"
                    />

                    {errors.nome_completo ? (
                      <p className="text-sm font-bold text-destructive">
                        {errors.nome_completo}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Cargo ou identificação
                    </p>

                    <Input
                      value={form.cargo}
                      onChange={(event) =>
                        updateField("cargo", event.target.value)
                      }
                      placeholder="Ex.: Balcão 1, Caixa, Admin 2"
                      className="h-12 rounded-2xl border-border bg-card"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      E-mail de login
                    </p>

                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="usuario@otica.com"
                      className="h-12 rounded-2xl border-border bg-card"
                    />

                    {errors.email ? (
                      <p className="text-sm font-bold text-destructive">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Telefone
                    </p>

                    <Input
                      value={form.telefone}
                      onChange={(event) =>
                        updateField(
                          "telefone",
                          formatPhoneInput(event.target.value)
                        )
                      }
                      placeholder="(00) 00000-0000"
                      className="h-12 rounded-2xl border-border bg-card"
                    />

                    {errors.telefone ? (
                      <p className="text-sm font-bold text-destructive">
                        {errors.telefone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Permissão e status"
                description="Defina o nível de acesso e se o login já nasce ativo."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Perfil
                    </p>

                    <Select
                      value={form.role}
                      onValueChange={(value) =>
                        updateField("role", value)
                      }
                      disabled={isEditing}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="balcao">Balcão</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>

                    {isEditing ? (
                      <p className="text-xs font-semibold text-muted-foreground">
                        O perfil não é alterado depois da criação.
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Status
                    </p>

                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        updateField("status", value)
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title={isEditing ? "Nova senha opcional" : "Senha inicial"}
                description={
                  isEditing
                    ? "Preencha apenas se quiser redefinir a senha deste usuário."
                    : "O admin escolhe a senha inicial do novo acesso."
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      {isEditing ? "Nova senha" : "Senha"}
                    </p>

                    <Input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="Mínimo de 8 caracteres"
                      className="h-12 rounded-2xl border-border bg-card"
                    />

                    {errors.password ? (
                      <p className="text-sm font-bold text-destructive">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark-title">
                      Confirmar senha
                    </p>

                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                      placeholder="Repita a senha"
                      className="h-12 rounded-2xl border-border bg-card"
                    />

                    {errors.confirmPassword ? (
                      <p className="text-sm font-bold text-destructive">
                        {errors.confirmPassword}
                      </p>
                    ) : null}
                  </div>
                </div>
              </FormSection>
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-5 sm:px-7">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-12 rounded-full px-6 font-black"
                disabled={isSaving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="h-12 rounded-full px-6 font-black"
                disabled={isSaving}
              >
                {isSaving
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   DRAWER DE DETALHES DO USUÁRIO
   ========================================================================== */

export function UsuarioDetailsDrawer({
  open,
  onOpenChange,
  usuario,
  onEdit,
  onDelete,
}) {
  const isAdmin = usuario?.role === "admin";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94vh] overflow-hidden border-border bg-card">
        <div className="flex max-h-[94vh] flex-col">
          <DrawerHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-[26px] bg-primary/[0.10] text-2xl font-black text-primary">
                  {getInitials(usuario?.nome_completo)}
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusBadgeClass(usuario?.status)}>
                      {statusLabels[usuario?.status] || "Sem status"}
                    </Badge>

                    <Badge className={getRoleBadgeClass(usuario?.role)}>
                      {roleLabels[usuario?.role] || "Perfil"}
                    </Badge>
                  </div>

                  <DrawerTitle className="mt-3 text-2xl font-black tracking-[-0.055em] text-dark-title">
                    {usuario?.nome_completo || "Usuário"}
                  </DrawerTitle>

                  <DrawerDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                    {isAdmin
                      ? "Administrador da plataforma. Pode ser visualizado nesta tela, mas permanece protegido contra edição e remoção."
                      : "Acesso de balcão gerenciado pelo administrador da conta."}
                  </DrawerDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isAdmin ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onEdit(usuario)}
                      className="h-12 rounded-full px-5 font-black"
                    >
                      <PencilLine className="size-4" />
                      Editar
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => onDelete(usuario)}
                      className="h-12 rounded-full px-5 font-black"
                    >
                      <Trash2 className="size-4" />
                      Remover
                    </Button>
                  </>
                ) : (
                  <div className="inline-flex h-12 items-center gap-2 rounded-full bg-dark-title px-5 font-black text-white">
                    <LockKeyhole className="size-4" />
                    Protegido
                  </div>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 pb-8 sm:px-7 sm:pb-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <section className="rounded-[30px] border border-border bg-background/65 p-5">
                <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
                  Dados de acesso
                </h3>

                <div className="mt-5 grid gap-3">
                  <InfoLine
                    icon={Mail}
                    label="E-mail"
                    value={usuario?.email}
                  />

                  <InfoLine
                    icon={Phone}
                    label="Telefone"
                    value={usuario?.telefone}
                  />

                  <InfoLine
                    icon={UserRoundCog}
                    label="Cargo"
                    value={usuario?.cargo}
                  />

                  <InfoLine
                    icon={KeyRound}
                    label="Último acesso"
                    value={formatDateTimeBR(usuario?.ultimo_acesso_em)}
                  />
                </div>
              </section>

              <section className="rounded-[30px] border border-border bg-background/65 p-5 md:mb-0 mb-16">
                <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
                  Segurança e permissão
                </h3>

                <div className="mt-5 grid gap-3">
                  <InfoLine
                    icon={ShieldCheck}
                    label="Perfil"
                    value={roleLabels[usuario?.role]}
                  />

                  <InfoLine
                    icon={BadgeCheck}
                    label="Status"
                    value={statusLabels[usuario?.status]}
                  />

                  <InfoLine
                    icon={LockKeyhole}
                    label="Pode editar?"
                    value={isAdmin ? "Não" : "Sim"}
                  />

                  <InfoLine
                    icon={Trash2}
                    label="Pode remover?"
                    value={isAdmin ? "Não" : "Sim"}
                  />
                </div>
              </section>
            </div>
          </div>

          <DrawerFooter className="shrink-0 border-t border-border px-5 py-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:px-7 sm:pb-5">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-6 font-black"
            >
              Fechar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ==========================================================================
   MODAL DE EXCLUSÃO DE USUÁRIO
   ========================================================================== */

export function ConfirmDeleteUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[34px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Remover acesso de balcão?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Você está prestes a remover{" "}
            <strong className="font-black text-dark-title">
              {usuario?.nome_completo || "este usuário"}
            </strong>
            . O login será apagado e ele perderá acesso à plataforma.
            Administradores nunca podem ser removidos por esta tela.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-12 rounded-full px-6 font-black"
          >
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-12 rounded-full bg-destructive px-6 font-black text-white hover:bg-destructive/90"
          >
            {isDeleting ? "Removendo..." : "Confirmar remoção"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ==========================================================================
   MODAL DE EDITAR CONTA
   ========================================================================== */

export function ContaFormDialog({
  open,
  onOpenChange,
  conta,
  onSubmit,
  isSaving = false,
}) {
  const [form, setForm] = useState(() => getInitialContaForm(conta));
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.nome_fantasia?.trim()) {
      nextErrors.nome_fantasia = "Informe o nome fantasia.";
    }

    if (form.cnpj && !isValidCNPJ(form.cnpj)) {
      nextErrors.cnpj = "Informe um CNPJ válido.";
    }

    if (form.telefone && !isValidPhone(form.telefone)) {
      nextErrors.telefone = "Informe um telefone válido.";
    }

    if (form.cep && !isValidCEP(form.cep)) {
      nextErrors.cep = "Informe um CEP válido.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-[24px] bg-primary/[0.10] text-primary">
              <Building2 className="size-7" />
            </div>

            <div>
              <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
                Editar dados da ótica
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Atualize as informações da conta. Estes dados pertencem à ótica, não a um usuário isolado.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-7">
            <FormSection
              title="Identificação"
              description="Nome comercial, razão social e dados fiscais básicos."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Nome fantasia
                  </p>

                  <Input
                    value={form.nome_fantasia}
                    onChange={(event) =>
                      updateField("nome_fantasia", event.target.value)
                    }
                    placeholder="Ótica Visão Clara"
                    className="h-12 rounded-2xl border-border bg-card"
                  />

                  {errors.nome_fantasia ? (
                    <p className="text-sm font-bold text-destructive">
                      {errors.nome_fantasia}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Razão social
                  </p>

                  <Input
                    value={form.razao_social}
                    onChange={(event) =>
                      updateField("razao_social", event.target.value)
                    }
                    placeholder="Razão social completa"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    CNPJ
                  </p>

                  <Input
                    value={form.cnpj}
                    onChange={(event) =>
                      updateField("cnpj", formatCNPJInput(event.target.value))
                    }
                    placeholder="00.000.000/0000-00"
                    className="h-12 rounded-2xl border-border bg-card"
                  />

                  {errors.cnpj ? (
                    <p className="text-sm font-bold text-destructive">
                      {errors.cnpj}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Inscrição estadual
                  </p>

                  <Input
                    value={form.inscricao_estadual}
                    onChange={(event) =>
                      updateField("inscricao_estadual", event.target.value)
                    }
                    placeholder="Opcional"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Contato"
              description="Canais gerais usados pela conta da ótica."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Telefone
                  </p>

                  <Input
                    value={form.telefone}
                    onChange={(event) =>
                      updateField(
                        "telefone",
                        formatPhoneInput(event.target.value)
                      )
                    }
                    placeholder="(00) 00000-0000"
                    className="h-12 rounded-2xl border-border bg-card"
                  />

                  {errors.telefone ? (
                    <p className="text-sm font-bold text-destructive">
                      {errors.telefone}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    E-mail
                  </p>

                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="contato@otica.com"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Endereço"
              description="Endereço comercial principal da ótica."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">CEP</p>

                  <Input
                    value={form.cep}
                    onChange={(event) =>
                      updateField("cep", formatCEPInput(event.target.value))
                    }
                    placeholder="00000-000"
                    className="h-12 rounded-2xl border-border bg-card"
                  />

                  {errors.cep ? (
                    <p className="text-sm font-bold text-destructive">
                      {errors.cep}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 xl:col-span-2">
                  <p className="text-sm font-black text-dark-title">Rua</p>

                  <Input
                    value={form.rua}
                    onChange={(event) =>
                      updateField("rua", event.target.value)
                    }
                    placeholder="Rua, avenida..."
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Número</p>

                  <Input
                    value={form.numero}
                    onChange={(event) =>
                      updateField("numero", event.target.value)
                    }
                    placeholder="123"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Complemento
                  </p>

                  <Input
                    value={form.complemento}
                    onChange={(event) =>
                      updateField("complemento", event.target.value)
                    }
                    placeholder="Sala, loja..."
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Bairro</p>

                  <Input
                    value={form.bairro}
                    onChange={(event) =>
                      updateField("bairro", event.target.value)
                    }
                    placeholder="Centro"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Cidade</p>

                  <Input
                    value={form.cidade}
                    onChange={(event) =>
                      updateField("cidade", event.target.value)
                    }
                    placeholder="São João del-Rei"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Estado</p>

                  <Input
                    value={form.estado}
                    onChange={(event) =>
                      updateField("estado", event.target.value)
                    }
                    placeholder="MG"
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Observações"
              description="Notas internas sobre a conta da ótica."
            >
              <Textarea
                value={form.observacoes}
                onChange={(event) =>
                  updateField("observacoes", event.target.value)
                }
                placeholder="Informações adicionais..."
                className="min-h-32 rounded-[24px] border-border bg-card"
              />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-5 sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-6 font-black"
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-12 rounded-full px-6 font-black"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar dados da conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   MODAL DE EDITAR CONFIGURAÇÕES
   ========================================================================== */

export function ConfiguracoesFormDialog({
  open,
  onOpenChange,
  configuracoes,
  onSubmit,
  isSaving = false,
}) {
  const [form, setForm] = useState(() =>
    getInitialConfiguracoesForm(configuracoes)
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      ...form,
      proximo_numero_os: Number(form.proximo_numero_os || 1),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-[24px] bg-primary/[0.10] text-primary">
              <Settings2 className="size-7" />
            </div>

            <div>
              <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
                Editar preferências da conta
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Defina regras operacionais do sistema. Aqui mora o tempero da plataforma, e um ajuste errado pode bagunçar o fluxo, então mantive tudo bem explícito.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-7">
            <FormSection
              title="Permissões do terminal de balcão"
              description="Defina o que o terminal compartilhado pode ou não executar."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <ToggleCard
                  title="Permitir editar OS pelo terminal"
                  description="Autoriza ajustes operacionais em ordens de serviço no balcão."
                  value={form.permitir_edicao_os_terminal}
                  onChange={(value) =>
                    updateField("permitir_edicao_os_terminal", value)
                  }
                />

                <ToggleCard
                  title="Permitir alterar status da OS"
                  description="Autoriza movimentação operacional de status diretamente pelo balcão."
                  value={form.permitir_alterar_status_os_terminal}
                  onChange={(value) =>
                    updateField(
                      "permitir_alterar_status_os_terminal",
                      value
                    )
                  }
                />

                <ToggleCard
                  title="Permitir anexos no terminal"
                  description="Libera upload de arquivos, fotos e comprovantes em telas operacionais."
                  value={form.permitir_anexos_terminal}
                  onChange={(value) =>
                    updateField("permitir_anexos_terminal", value)
                  }
                />

                <ToggleCard
                  title="Exigir observação ao cancelar OS"
                  description="Evita cancelamentos secos e cria um rastro mínimo de justificativa."
                  value={form.exigir_observacao_ao_cancelar_os}
                  onChange={(value) =>
                    updateField("exigir_observacao_ao_cancelar_os", value)
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Relatórios do vendedor"
              description="Controle de exposição de informações individuais."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <ToggleCard
                  title="Exibir valor vendido"
                  description="Mostra o faturamento individual no relatório acessado com PIN."
                  value={
                    form.exibir_valor_vendido_relatorio_vendedor
                  }
                  onChange={(value) =>
                    updateField(
                      "exibir_valor_vendido_relatorio_vendedor",
                      value
                    )
                  }
                />

                <ToggleCard
                  title="Exibir comissão estimada"
                  description="Mostra o cálculo de comissão na área individual do vendedor."
                  value={
                    form.exibir_comissao_relatorio_vendedor
                  }
                  onChange={(value) =>
                    updateField(
                      "exibir_comissao_relatorio_vendedor",
                      value
                    )
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Regionalização"
              description="Configurações globais de moeda e fuso."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Moeda
                  </p>

                  <Select
                    value={form.moeda}
                    onValueChange={(value) =>
                      updateField("moeda", value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="BRL">Real brasileiro - BRL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Fuso horário
                  </p>

                  <Select
                    value={form.fuso_horario}
                    onValueChange={(value) =>
                      updateField("fuso_horario", value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        America/Sao_Paulo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-5 sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-6 font-black"
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-12 rounded-full px-6 font-black"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar preferências"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */

export function UsuariosEmptyState({
  hasFilters = false,
}) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.36)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.10] text-primary">
        <UsersRound className="size-8" />
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-[-0.055em] text-dark-title">
        {hasFilters
          ? "Nenhum usuário bate com os filtros"
          : "Nenhum usuário encontrado"}
      </h3>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A busca ficou estreita demais. Limpe ou ajuste os filtros para trazer os acessos de volta."
          : "Crie o primeiro acesso adicional da plataforma para começar a separar perfis e responsabilidades."}
      </p>
    </section>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

export function UsuariosPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <section className="flex flex-col gap-4 rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)] lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-black text-dark-title">
          Exibindo {start} a {end} de {totalItems} usuário
          {totalItems === 1 ? "" : "s"}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Página {page} de {safeTotalPages}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-12 w-full rounded-full border-border bg-background px-5 font-black sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-12 rounded-full px-5 font-black"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= safeTotalPages}
            className="h-12 rounded-full px-5 font-black"
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
