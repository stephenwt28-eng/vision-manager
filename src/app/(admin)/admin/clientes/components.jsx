"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarPlus,
  LockKeyhole,
  UserRoundCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  FileText,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Search,
  Trash2,
  UserCheck2,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
  formatCEPInput,
  formatCPFInput,
  formatPhoneInput,
  isValidCPF,
  isValidPhone,
  isValidCEP,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const emptyClienteForm = {
  nome_completo: "",
  nome_social: "",
  cpf: "",
  rg: "",
  data_nascimento: "",
  telefone_principal: "",
  telefone_secundario: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  origem_cliente: "",
  profissao: "",
  prefere_contato_por: "indefinido",
  observacoes: "",
  ativo: true,
};

const pageSizeOptions = [15, 30, 50, 100];

const contatoLabels = {
  telefone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  indefinido: "Indefinido",
};

const tipoReceitaLabels = {
  longe: "Longe",
  perto: "Perto",
  monofocal: "Visão simples",
  multifocal: "Multifocal",
  bifocal: "Bifocal",
  ocupacional: "Ocupacional",
  solar_grau: "Solar com grau",
  outro: "Outra",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatDateBR(value) {
  if (!value) return "Não informado";

  try {
    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("pt-BR").format(date);
  } catch {
    return "Não informado";
  }
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

function getInitialClienteForm(cliente) {
  if (!cliente) return emptyClienteForm;

  return {
    nome_completo: cliente.nome_completo || "",
    nome_social: cliente.nome_social || "",
    cpf: cliente.cpf || "",
    rg: cliente.rg || "",
    data_nascimento: cliente.data_nascimento || "",
    telefone_principal: cliente.telefone_principal || "",
    telefone_secundario: cliente.telefone_secundario || "",
    email: cliente.email || "",
    cep: cliente.cep || "",
    rua: cliente.rua || "",
    numero: cliente.numero || "",
    complemento: cliente.complemento || "",
    bairro: cliente.bairro || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    pais: cliente.pais || "Brasil",
    origem_cliente: cliente.origem_cliente || "",
    profissao: cliente.profissao || "",
    prefere_contato_por: cliente.prefere_contato_por || "indefinido",
    observacoes: cliente.observacoes || "",
    ativo: cliente.ativo ?? true,
  };
}

function getEnderecoCompleto(cliente) {
  const linha1 = [
    cliente?.rua,
    cliente?.numero,
    cliente?.complemento,
  ]
    .filter(Boolean)
    .join(", ");

  const linha2 = [
    cliente?.bairro,
    cliente?.cidade,
    cliente?.estado,
  ]
    .filter(Boolean)
    .join(" - ");

  const linha3 = [cliente?.cep, cliente?.pais].filter(Boolean).join(" • ");

  const lines = [linha1, linha2, linha3].filter(Boolean);

  return lines.length ? lines : ["Endereço não informado"];
}

function getMonthCreatedCount(clientes = []) {
  const now = new Date();

  return clientes.filter((cliente) => {
    if (!cliente.created_at) return false;

    const date = new Date(cliente.created_at);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;
}

function getTipoReceitaLabel(tipoReceita) {
  return tipoReceitaLabels[tipoReceita] || tipoReceita || "Receita";
}

function shouldShowReceitaPerto(tipoReceita) {
  return ["multifocal", "bifocal", "ocupacional"].includes(tipoReceita);
}

function parseReceitaNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(String(value).replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function getReceitaPertoEsferico(receita, prefix) {
  const esferico = parseReceitaNumber(receita?.[`${prefix}_esferico`]);
  const adicao = parseReceitaNumber(receita?.[`${prefix}_adicao`]);

  if (esferico === null || adicao === null) return "";

  return (esferico + adicao).toFixed(2);
}

function formatReceitaValor(value) {
  if (value === null || value === undefined || value === "") return "—";

  const parsed = Number(String(value).replace(",", "."));

  if (!Number.isFinite(parsed)) return String(value);

  return `${parsed >= 0 ? "+" : "-"}${Math.abs(parsed).toFixed(2)}`;
}

function formatReceitaResumoOlho(receita, prefix) {
  const esfera = formatReceitaValor(receita?.[`${prefix}_esferico`]);
  const cilindro = formatReceitaValor(receita?.[`${prefix}_cilindrico`]);
  const eixo = formatReceitaEixo(receita?.[`${prefix}_eixo`]);
  const adicao = formatReceitaValor(receita?.[`${prefix}_adicao`]);

  if (!receita) return "Sem receita";

  if (receita?.tipo_receita === "multifocal" || receita?.tipo_receita === "bifocal" || receita?.tipo_receita === "ocupacional") {
    return `${esfera} • ${cilindro} • ${eixo} • ADD ${adicao}`;
  }

  return `${esfera} • ${cilindro} • ${eixo}`;
}

/* ==========================================================================
   KPIs
   ========================================================================== */

export function ClientesKpis({ clientes = [] }) {
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((cliente) => cliente.ativo).length;
  const novosNoMes = getMonthCreatedCount(clientes);

  const kpis = [
    {
      title: "Clientes cadastrados",
      value: totalClientes,
      meta: "Base total da conta",
      icon: UsersRound,
    },
    {
      title: "Clientes ativos",
      value: clientesAtivos,
      meta: `${Math.max(totalClientes - clientesAtivos, 0)} inativos`,
      icon: UserCheck2,
    },
    {
      title: "Novos no mês",
      value: novosNoMes,
      meta: "Entradas recentes",
      icon: CalendarPlus,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {kpi.title}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
                  {kpi.value}
                </p>
              </div>

              <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
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

function getVendedorDisplayName(vendedor) {
  return (
    vendedor?.nome_exibicao ||
    vendedor?.nome_completo ||
    "Vendedor"
  );
}

export function ClientesVendedorFilter({
  userRole,
  vendedores = [],
  vendedorFiltro,
  onAdminSelectVendedor,
  onOpenPinDialog,
  onClearVendedorFiltro,
  totalResults = 0,
}) {
  const isAdmin = userRole === "admin";
  const hasFiltro = Boolean(vendedorFiltro?.id);

  return (
    <section className="overflow-hidden rounded-[38px] border border-primary/15 bg-card shadow-[0_30px_90px_-70px_rgba(108,77,230,0.55)]">
      <div className="border-b border-border bg-primary/[0.04] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>

            <h2 className="text-xl font-black tracking-[-0.05em] text-dark-title sm:text-2xl">
              Ver clientes pela última OS do vendedor
            </h2>
            
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {hasFiltro ? (
              <Button
                variant="secondary"
                onClick={onClearVendedorFiltro}
                className="h-11 rounded-full px-4 font-black"
              >
                <X className="size-4" />
                Finalizar exibição
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-2">
          <p className="text-sm font-black text-dark-title">
            {isAdmin ? "Selecionar vendedor" : "Acesso do balcão"}
          </p>

          {isAdmin ? (
            <Select
              value={vendedorFiltro?.id || "todos"}
              onValueChange={(value) => {
                if (value === "todos") {
                  onClearVendedorFiltro();
                  return;
                }

                const vendedor = vendedores.find((item) => item.id === value);
                onAdminSelectVendedor(vendedor || null);
              }}
            >
              <SelectTrigger className="h-11 w-full max-w-[260px] rounded-full border-border bg-background">
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todos">Todos os vendedores</SelectItem>

                {vendedores
                  .filter((vendedor) => vendedor.status === "ativo")
                  .map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {getVendedorDisplayName(vendedor)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              type="button"
              variant={hasFiltro ? "secondary" : "default"}
              onClick={onOpenPinDialog}
              className="h-11 rounded-full px-5 font-black"
            >
              <LockKeyhole className="size-4" />
              {hasFiltro ? "Trocar vendedor" : "Entrar com PIN do vendedor"}
            </Button>
          )}
        </div>

        <div className="rounded-[22px] border border-border bg-background px-4 py-3 lg:min-w-[220px]">

          <p className="text-base font-black leading-5 text-dark-title">
            {hasFiltro ? getVendedorDisplayName(vendedorFiltro) : "Todos os clientes"}
          </p>

          <p className="mt-1 text-sm font-semibold text-primary">
            {totalResults} cliente{totalResults === 1 ? "" : "s"} encontrado
            {totalResults === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function VendedorPinDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handlePinChange(value) {
    const nextValue = value.replace(/\D/g, "").slice(0, 4);
    setPin(nextValue);

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      setError("Informe o PIN com 4 dígitos.");
      return;
    }

    const success = await onSubmit(pin);

    if (success) {
      setPin("");
      setError("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[34px] border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            PIN do vendedor
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            Informe o PIN para liberar a exibição dos clientes vinculados à
            última OS desse vendedor no balcão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-black text-dark-title">PIN de 4 dígitos</p>

            <Input
              value={pin}
              onChange={(event) => handlePinChange(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="0000"
              className="h-14 rounded-2xl border-border bg-background text-center text-xl font-black tracking-[0.45em]"
            />

            {error ? (
              <p className="text-sm font-bold text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-5 font-black"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-12 rounded-full px-5 font-black"
              disabled={isSubmitting}
            >
              <LockKeyhole className="size-4" />
              {isSubmitting ? "Validando..." : "Exibir clientes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   FILTROS
   ========================================================================== */

export function ClientesFilters({
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
                placeholder="Pesquisar por nome, CPF, telefone ou e-mail..."
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
            {totalResults} cliente{totalResults === 1 ? "" : "s"} encontrado
            {totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-4">
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
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">
                Contato preferido
              </p>

              <Select
                value={filters.contato}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    contato: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="indefinido">Indefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Cidade</p>

              <Input
                value={filters.cidade}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    cidade: event.target.value,
                  })
                }
                placeholder="Ex.: São João del-Rei"
                className="h-12 rounded-2xl border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Origem</p>

              <Input
                value={filters.origem}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    origem: event.target.value,
                  })
                }
                placeholder="Ex.: indicação"
                className="h-12 rounded-2xl border-border bg-background"
              />
            </div>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   CARD DO CLIENTE
   ========================================================================== */

export function ClienteCard({ cliente, onView }) {
  const ultimaReceita = cliente?.ultima_receita;

  return (
    <button
      type="button"
      onClick={() => onView(cliente)}
      className="group flex w-full min-w-0 overflow-hidden flex-col justify-between rounded-[30px] border border-border bg-card p-5 text-left shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_34px_90px_-62px_rgba(108,77,230,0.45)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={cliente.ativo ? "secondary" : "outline"}
              className={
                cliente.ativo
                  ? "rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                  : "rounded-full px-3 py-1 text-muted-foreground"
              }
            >
              {cliente.ativo ? "Ativo" : "Inativo"}
            </Badge>

            {cliente.prefere_contato_por && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-muted-foreground"
              >
                {contatoLabels[cliente.prefere_contato_por] || "Indefinido"}
              </Badge>
            )}
          </div>

          <h3 className="mt-4 line-clamp-2 text-xl font-black tracking-[-0.045em] text-dark-title">
            {cliente.nome_completo}
          </h3>

          {cliente.nome_social && (
            <p className="mt-1 truncate text-sm font-semibold text-primary">
              {cliente.nome_social}
            </p>
          )}
        </div>

        <div className="grid size-12 shrink-0 place-items-center rounded-[20px] bg-primary/[0.08] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <Eye className="size-5" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="size-4 shrink-0 text-primary" />
          <span className="truncate">
            {cliente.telefone_principal || "Telefone não informado"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0 text-primary" />
          <span className="truncate">
            {cliente.email || "E-mail não informado"}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ==========================================================================
   ESTADO VAZIO
   ========================================================================== */

export function ClientesEmptyState({ hasFilters = false }) {
  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <UsersRound className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {hasFilters ? "Nenhum cliente bateu com os filtros." : "Nenhum cliente cadastrado."}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A busca veio afiada demais. Limpe ou ajuste os filtros para reencontrar a base."
          : "Assim que os primeiros clientes entrarem, eles aparecem aqui em cards para consulta rápida."}
      </p>
    </div>
  );
}

/* ==========================================================================
   MODAL DE FORMULÁRIO
   ========================================================================== */

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  isSaving = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ClienteFormDialogContent
          key={cliente?.id || "new"}
          cliente={cliente}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function ClienteFormDialogContent({
  cliente,
  onOpenChange,
  onSubmit,
  isSaving = false,
}) {
  const isEditing = Boolean(cliente?.id);

  const [formData, setFormData] = useState(() =>
    getInitialClienteForm(cliente)
  );
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  }

  async function buscarEnderecoPorCep() {
    const cepLimpo = formData.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setErrors((current) => ({
        ...current,
        cep: "Informe um CEP válido.",
      }));
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors((current) => ({
          ...current,
          cep: "CEP não encontrado.",
        }));
        return;
      }

      setFormData((current) => ({
        ...current,
        cep: data.cep || current.cep,
        rua: data.logradouro || current.rua,
        bairro: data.bairro || current.bairro,
        cidade: data.localidade || current.cidade,
        estado: data.uf || current.estado,
        pais: "Brasil",
      }));

      setErrors((current) => ({
        ...current,
        cep: "",
      }));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        cep: "Erro ao buscar CEP.",
      }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.nome_completo.trim()) {
      nextErrors.nome_completo = "Informe o nome completo.";
    }

    if (!formData.telefone_principal.trim()) {
      nextErrors.telefone_principal = "Informe o telefone principal.";
    } else if (!isValidPhone(formData.telefone_principal)) {
      nextErrors.telefone_principal = "Informe um telefone válido.";
    }

    if (formData.telefone_secundario) {
      if (!isValidPhone(formData.telefone_secundario)) {
        nextErrors.telefone_secundario = "Informe um telefone válido.";
      }
    }

    if (formData.cpf) {
      if (!isValidCPF(formData.cpf)) {
        nextErrors.cpf = "Informe um CPF válido.";
      }
    }

    if (formData.cep) {
      if (!isValidCEP(formData.cep)) {
        nextErrors.cep = "Informe um CEP válido.";
      }
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        nextErrors.email = "Informe um e-mail válido.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    await onSubmit({
      ...(cliente?.id ? { id: cliente.id } : {}),
      ...formData,
    });
  }

  return (
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-6 text-left sm:px-7">
          <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            {isEditing ? "Editar cliente" : "Cadastrar cliente"}
          </DialogTitle>

          <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {isEditing
              ? "Atualize os dados cadastrais."
              : "Cadastre o cliente com os dados principais agora e complemente o perfil conforme o atendimento crescer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-7">
            <FormSection title="Identificação">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Nome completo *"
                  error={errors.nome_completo}
                >
                  <Input
                    value={formData.nome_completo}
                    onChange={(event) =>
                      updateField("nome_completo", event.target.value)
                    }
                    placeholder="Nome completo do cliente"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Nome social">
                  <Input
                    value={formData.nome_social}
                    onChange={(event) =>
                      updateField("nome_social", event.target.value)
                    }
                    placeholder="Opcional"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="CPF" error={errors.cpf}>
                  <Input
                    value={formData.cpf}
                    onChange={(event) =>
                      updateField("cpf", formatCPFInput(event))
                    }
                    placeholder="000.000.000-00"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="RG">
                  <Input
                    value={formData.rg}
                    onChange={(event) => updateField("rg", event.target.value)}
                    placeholder="Documento de identidade"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Data de nascimento">
                  <Input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(event) =>
                      updateField("data_nascimento", event.target.value)
                    }
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Profissão">
                  <Input
                    value={formData.profissao}
                    onChange={(event) =>
                      updateField("profissao", event.target.value)
                    }
                    placeholder="Opcional"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Contato">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Telefone / WhatsApp principal *"
                  error={errors.telefone_principal}
                >
                  <Input
                    value={formData.telefone_principal}
                    onChange={(event) =>
                      updateField(
                        "telefone_principal",
                        formatPhoneInput(event)
                      )
                    }
                    placeholder="(00) 00000-0000"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField
                  label="Telefone secundário"
                  error={errors.telefone_secundario}
                >
                  <Input
                    value={formData.telefone_secundario}
                    onChange={(event) =>
                      updateField(
                        "telefone_secundario",
                        formatPhoneInput(event)
                      )
                    }
                    placeholder="(00) 00000-0000"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="E-mail" error={errors.email}>
                  <Input
                    value={formData.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="cliente@email.com"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Contato preferido">
                  <Select
                    value={formData.prefere_contato_por}
                    onValueChange={(value) =>
                      updateField("prefere_contato_por", value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Endereço">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="CEP" error={errors.cep}>
                  <Input
                    value={formData.cep}
                    onChange={(event) =>
                      updateField("cep", formatCEPInput(event))
                    }
                    onBlur={buscarEnderecoPorCep}
                    placeholder="00000-000"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Rua" className="xl:col-span-2">
                  <Input
                    value={formData.rua}
                    onChange={(event) =>
                      updateField("rua", event.target.value)
                    }
                    placeholder="Nome da rua"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Número">
                  <Input
                    value={formData.numero}
                    onChange={(event) =>
                      updateField("numero", event.target.value)
                    }
                    placeholder="Nº"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Complemento">
                  <Input
                    value={formData.complemento}
                    onChange={(event) =>
                      updateField("complemento", event.target.value)
                    }
                    placeholder="Apto, loja..."
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Bairro">
                  <Input
                    value={formData.bairro}
                    onChange={(event) =>
                      updateField("bairro", event.target.value)
                    }
                    placeholder="Bairro"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Cidade">
                  <Input
                    value={formData.cidade}
                    onChange={(event) =>
                      updateField("cidade", event.target.value)
                    }
                    placeholder="Cidade"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Estado">
                  <Input
                    value={formData.estado}
                    onChange={(event) =>
                      updateField("estado", event.target.value)
                    }
                    placeholder="UF"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="País">
                  <Input
                    value={formData.pais}
                    onChange={(event) =>
                      updateField("pais", event.target.value)
                    }
                    placeholder="Brasil"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Informações adicionais">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Origem do cliente">
                  <Input
                    value={formData.origem_cliente}
                    onChange={(event) =>
                      updateField("origem_cliente", event.target.value)
                    }
                    placeholder="Indicação, Instagram, balcão..."
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <div className="rounded-[24px] border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-dark-title">
                        Cliente ativo
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Mantém o cadastro visível e utilizável nos fluxos da loja.
                      </p>
                    </div>

                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) =>
                        updateField("ativo", checked)
                      }
                    />
                  </div>
                </div>

                <FormField label="Observações" className="md:col-span-2">
                  <Textarea
                    value={formData.observacoes}
                    onChange={(event) =>
                      updateField("observacoes", event.target.value)
                    }
                    placeholder="Anotações gerais do cliente..."
                    className="min-h-32 rounded-[24px] border-border bg-background"
                  />
                </FormField>
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
                  : "Cadastrar cliente"}
            </Button>
          </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ==========================================================================
   DRAWER DE DETALHES
   ========================================================================== */

export function ClienteDetailsDrawer({
  open,
  onOpenChange,
  cliente,
  receitas = [],
  ordensServico = [],
  isLoadingRelated = false,
  relatedError = "",
  visibleOsCount = 3,
  onLoadMoreOs,
  onEdit,
  onDelete,
  canDelete = false,
}) {
  const endereco = getEnderecoCompleto(cliente);
  const ultimaReceita = receitas[0] || null;
  const receitasAnteriores = receitas.slice(1);
  const visibleOrdensServico = ordensServico.slice(0, visibleOsCount);
  const hasMoreOs = visibleOsCount < ordensServico.length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94vh] overflow-hidden border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-border px-5 pb-5 pt-6 text-left sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={cliente?.ativo ? "secondary" : "outline"}
                    className={
                      cliente?.ativo
                        ? "rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                        : "rounded-full px-3 py-1 text-muted-foreground"
                    }
                  >
                    {cliente?.ativo ? "Ativo" : "Inativo"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-muted-foreground"
                  >
                    {contatoLabels[cliente?.prefere_contato_por] ||
                      "Contato indefinido"}
                  </Badge>
                </div>

                <DrawerTitle className="mt-4 text-3xl font-black tracking-[-0.065em] text-dark-title">
                  {cliente?.nome_completo || "Cliente"}
                </DrawerTitle>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => onEdit(cliente)}
                  className="h-12 rounded-full px-5 font-black"
                >
                  <PencilLine className="size-4" />
                  Editar
                </Button>

                {canDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(cliente)}
                    className="h-12 rounded-full px-5 font-black"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-7">
            <div className="grid min-w-0 gap-5 xl:grid-cols-3">
              <DrawerInfoSection title="Contato">
                <InfoLine
                  icon={Phone}
                  label="Telefone principal"
                  value={cliente?.telefone_principal || "Não informado"}
                />

                <InfoLine
                  icon={Phone}
                  label="Telefone secundário"
                  value={cliente?.telefone_secundario || "Não informado"}
                />

                <InfoLine
                  icon={Mail}
                  label="E-mail"
                  value={cliente?.email || "Não informado"}
                />
              </DrawerInfoSection>

              <DrawerInfoSection title="Documentos e perfil">
                <InfoBlock label="CPF" value={cliente?.cpf || "Não informado"} />
                <InfoBlock label="RG" value={cliente?.rg || "Não informado"} />
                <InfoBlock
                  label="Nascimento"
                  value={formatDateBR(cliente?.data_nascimento)}
                />
                <InfoBlock
                  label="Profissão"
                  value={cliente?.profissao || "Não informado"}
                />
              </DrawerInfoSection>

              <DrawerInfoSection title="Origem e cadastro">
                <InfoBlock
                  label="Origem do cliente"
                  value={cliente?.origem_cliente || "Não informado"}
                />
                <InfoBlock
                  label="Criado em"
                  value={formatDateTimeBR(cliente?.created_at)}
                />
                <InfoBlock
                  label="Atualizado em"
                  value={formatDateTimeBR(cliente?.updated_at)}
                />
              </DrawerInfoSection>
            </div>

            <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1fr_1fr]">
              <DrawerInfoSection title="Endereço">
                  <div className="flex min-w-0 gap-3 rounded-[24px] border border-border bg-background p-4">
                  <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[16px] bg-primary/[0.08] text-primary">
                    <MapPin className="size-5" />
                  </div>

                    <div className="min-w-0 space-y-1">
                    {endereco.map((linha) => (
                      <p
                        key={linha}
                        className="text-sm font-medium leading-6 text-muted-foreground"
                      >
                        {linha}
                      </p>
                    ))}
                  </div>
                </div>
              </DrawerInfoSection>

              <DrawerInfoSection title="Observações">
                <div className="min-h-[112px] rounded-[24px] border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                  {cliente?.observacoes || "Nenhuma observação cadastrada."}
                </div>
              </DrawerInfoSection>
            </div>

            <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.3fr_1fr]">
              <DrawerInfoSection title="Última receita">
                {isLoadingRelated ? (
                  <DrawerSectionFeedback message="Carregando receitas e histórico ..." />
                ) : relatedError ? (
                  <DrawerSectionFeedback message={relatedError} tone="error" />
                ) : !ultimaReceita ? (
                  <DrawerSectionFeedback message="Nenhuma receita encontrada para este cliente." />
                ) : (
                  [ultimaReceita].map((receita) => (
                    <div
                      key={receita.id}
                      className="min-w-0 rounded-[24px] border border-border bg-background p-5"
                    >
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-base font-black text-dark-title">
                            {receita.medico_nome || "Médico não informado"}
                          </p>

                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            CRM {receita.medico_crm || "Não informado"}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className="w-fit rounded-full px-3 py-1 font-semibold text-muted-foreground"
                        >
                          {formatDateBR(receita.data_receita)}
                        </Badge>
                      </div>

                      {/* TABELA DE SUCESSO DO GRAU ÓPTICO */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-primary/[0.08] px-3 py-1 text-primary">
                          {getTipoReceitaLabel(receita.tipo_receita)}
                        </Badge>
                      </div>

                      <div className="mt-5">
                        <ReceitaSnapshot receita={receita} />
                      </div>

                      {/* METADADOS/MEDIDAS COMPLEMENTARES EM BADGES */}
                      <div className="mt-4 flex flex-wrap gap-2 pt-2">
                        {receita?.dnp_od && (
                          <Badge variant="outline" className="rounded-xl border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-none">
                            <span className="font-black text-dark-title mr-1">DNP OD:</span> {receita.dnp_od}
                          </Badge>
                        )}
                        {receita?.dnp_oe && (
                          <Badge variant="outline" className="rounded-xl border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-none">
                            <span className="font-black text-dark-title mr-1">DNP OE:</span> {receita.dnp_oe}
                          </Badge>
                        )}
                        {receita?.dp_total && (
                          <Badge variant="outline" className="rounded-xl border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-none">
                            <span className="font-black text-dark-title mr-1">DP Total:</span> {receita.dp_total}
                          </Badge>
                        )}
                        {receita?.altura_od && (
                          <Badge variant="outline" className="rounded-xl border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-none">
                            <span className="font-black text-dark-title mr-1">Altura OD:</span> {receita.altura_od}
                          </Badge>
                        )}
                        {receita?.altura_oe && (
                          <Badge variant="outline" className="rounded-xl border-border bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-none">
                            <span className="font-black text-dark-title mr-1">Altura OE:</span> {receita.altura_oe}
                          </Badge>
                        )}
                        {!receita?.dnp_od && !receita?.dnp_oe && !receita?.dp_total && !receita?.altura_od && !receita?.altura_oe && (
                          <p className="text-xs font-semibold italic text-muted-foreground">Sem medidas complementares cadastradas.</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </DrawerInfoSection>

              <DrawerInfoSection title="Histórico de OS">
                {isLoadingRelated ? (
                  <DrawerSectionFeedback message="Carregando ordens de serviço..." />
                ) : relatedError ? (
                  <DrawerSectionFeedback message={relatedError} tone="error" />
                ) : visibleOrdensServico.length === 0 ? (
                  <DrawerSectionFeedback message="Nenhuma OS encontrada para este cliente." />
                ) : (
                  <>
                    {visibleOrdensServico.map((ordem) => (
                      <Link
                        key={ordem.id}
                        href={`/admin/ordens-servico/${ordem.id}`}
                        className="block min-w-0 overflow-hidden rounded-[24px] border border-border bg-background p-4 transition hover:border-primary/25 hover:shadow-[0_20px_50px_-36px_rgba(15,23,42,0.28)]"
                      >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-dark-title">
                              {ordem.numero_os || "OS sem número"}
                            </p>

                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                              {ordem.tipo_os || "Venda"}
                            </p>
                          </div>

                          <div className="grid size-9 place-items-center rounded-[14px] bg-primary/[0.08] text-primary">
                            <ArrowUpRight className="size-4" />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1 text-muted-foreground"
                          >
                            Compra em {formatDateBR(ordem.data_venda)}
                          </Badge>

                          <Badge
                            variant="secondary"
                            className="rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                          >
                            {ordem.status || "Sem status"}
                          </Badge>
                        </div>
                      </Link>
                    ))}

                    {hasMoreOs ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onLoadMoreOs}
                        className="h-11 rounded-full px-5 font-black"
                      >
                        <FileText className="size-4" />
                        Carregar mais
                      </Button>
                    ) : null}
                  </>
                )}
              </DrawerInfoSection>
            </div>
          </div>

          <DrawerFooter className="border-t border-border px-5 py-5 sm:px-7">
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
   MODAL DE EXCLUSÃO
   ========================================================================== */

export function ConfirmDeleteClienteDialog({
  open,
  onOpenChange,
  cliente,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[34px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Excluir cliente?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Você está prestes a excluir{" "}
            <strong className="font-black text-dark-title">
              {cliente?.nome_completo || "este cliente"}
            </strong>
            . Essa ação só deve ser usada quando o cadastro realmente não precisa
            mais existir.
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
            {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

export function ClientesPagination({
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
    <section className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-4 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.36)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Mostrando {start} a {end} de {totalItems} cliente
          {totalItems === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">
            Ver
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-11 w-[96px] rounded-full border-border bg-background">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="size-11 rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="rounded-full border border-border bg-background px-4 py-2 text-sm font-black text-dark-title">
          Página {page} de {safeTotalPages}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages}
          className="size-11 rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================
   COMPONENTES INTERNOS REATORADOS E NOVOS
   ========================================================================== */

function ReceitaTable({ receita }) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3">Olho</th>
              <th className="px-3 py-3 text-center">Esférico (ESF)</th>
              <th className="px-3 py-3 text-center">Cilíndrico (CIL)</th>
              <th className="px-3 py-3 text-center">Eixo</th>
              <th className="px-3 py-3 text-center">Adição (ADD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold text-dark-title">
            <tr className="hover:bg-muted/10 transition">
              <td className="bg-primary/[0.02] px-4 py-3.5 font-black text-primary whitespace-nowrap">OD (Direito)</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.od_esferico)}</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.od_cilindrico)}</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaEixo(receita?.od_eixo)}</td>
              <td className="px-3 py-3.5 text-center text-sm text-primary font-black">{formatReceitaCampo(receita?.od_adicao)}</td>
            </tr>
            <tr className="hover:bg-muted/10 transition">
              <td className="bg-primary/[0.02] px-4 py-3.5 font-black text-primary whitespace-nowrap">OE (Esquerdo)</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.oe_esferico)}</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.oe_cilindrico)}</td>
              <td className="px-3 py-3.5 text-center text-sm">{formatReceitaEixo(receita?.oe_eixo)}</td>
              <td className="px-3 py-3.5 text-center text-sm text-primary font-black">{formatReceitaCampo(receita?.oe_adicao)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Exibição condicional de Prisma e Base de maneira sutil caso existam no banco */}
      {(receita?.od_prisma || receita?.oe_prisma || receita?.od_base || receita?.oe_base) && (
        <div className="grid gap-4 border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] font-semibold text-muted-foreground sm:grid-cols-2">
          <div className="min-w-0 break-words">
            <span className="font-black text-dark-title">Prisma/Base OD:</span> {formatReceitaCampo(receita?.od_prisma)} / {formatReceitaCampo(receita?.od_base)}
          </div>
          <div className="min-w-0 break-words">
            <span className="font-black text-dark-title">Prisma/Base OE:</span> {formatReceitaCampo(receita?.oe_prisma)} / {formatReceitaCampo(receita?.oe_base)}
          </div>
        </div>
      )}
    </div>
  );
}

function ReceitaSnapshot({ receita }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:hidden">
        <ReceitaStructuredEyePanel
          title="OD"
          subtitle="Olho direito"
          prefix="od"
          tipoReceita={receita?.tipo_receita}
          esfera={receita?.od_esferico}
          cilindro={receita?.od_cilindrico}
          eixo={receita?.od_eixo}
          adicao={receita?.od_adicao}
          prisma={receita?.od_prisma}
          base={receita?.od_base}
        />

        <ReceitaStructuredEyePanel
          title="OE"
          subtitle="Olho esquerdo"
          prefix="oe"
          tipoReceita={receita?.tipo_receita}
          esfera={receita?.oe_esferico}
          cilindro={receita?.oe_cilindrico}
          eixo={receita?.oe_eixo}
          adicao={receita?.oe_adicao}
          prisma={receita?.oe_prisma}
          base={receita?.oe_base}
        />
      </div>

      <div className="hidden sm:block">
        <ReceitaStructuredTable receita={receita} />
      </div>
    </div>
  );
}

function ReceitaEyePanel({
  title,
  subtitle,
  esfera,
  cilindro,
  eixo,
  adicao,
  prisma,
  base,
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-primary">{title}</p>
          <p className="text-xs font-semibold text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ReceitaDatum label="Esférico" value={formatReceitaCampo(esfera)} />
        <ReceitaDatum label="Cilíndrico" value={formatReceitaCampo(cilindro)} />
        <ReceitaDatum label="Eixo" value={formatReceitaEixo(eixo)} />
        <ReceitaDatum label="Adição" value={formatReceitaCampo(adicao)} />
      </div>

      {(prisma || base) ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ReceitaDatum label="Prisma" value={formatReceitaCampo(prisma)} />
          <ReceitaDatum label="Base" value={formatReceitaCampo(base)} />
        </div>
      ) : null}
    </div>
  );
}

function ReceitaStructuredTable({ receita }) {
  const showNear = shouldShowReceitaPerto(receita?.tipo_receita);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[620px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3">Olho</th>
              <th className="px-3 py-3 text-center">Visão</th>
              <th className="px-3 py-3 text-center">Esférico (ESF)</th>
              <th className="px-3 py-3 text-center">Cilíndrico (CIL)</th>
              <th className="px-3 py-3 text-center">Eixo</th>
              {showNear ? (
                <th className="px-3 py-3 text-center">Adição (ADD)</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold text-dark-title">
            <ReceitaStructuredTableRows receita={receita} prefix="od" eyeLabel="OD (Direito)" />
            <ReceitaStructuredTableRows receita={receita} prefix="oe" eyeLabel="OE (Esquerdo)" />
          </tbody>
        </table>
      </div>

      {(receita?.od_prisma || receita?.oe_prisma || receita?.od_base || receita?.oe_base) && (
        <div className="grid gap-4 border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] font-semibold text-muted-foreground sm:grid-cols-2">
          <div className="min-w-0 break-words">
            <span className="font-black text-dark-title">Prisma/Base OD:</span> {formatReceitaCampo(receita?.od_prisma)} / {formatReceitaCampo(receita?.od_base)}
          </div>
          <div className="min-w-0 break-words">
            <span className="font-black text-dark-title">Prisma/Base OE:</span> {formatReceitaCampo(receita?.oe_prisma)} / {formatReceitaCampo(receita?.oe_base)}
          </div>
        </div>
      )}
    </div>
  );
}

function ReceitaStructuredTableRows({ receita, prefix, eyeLabel }) {
  const showNear = shouldShowReceitaPerto(receita?.tipo_receita);
  const primaryVisionLabel = receita?.tipo_receita === "perto" ? "Perto" : "Longe";

  return (
    <>
      <tr className="hover:bg-muted/10 transition">
        <td
          className={`bg-primary/[0.02] px-4 py-3.5 font-black text-primary whitespace-nowrap ${
            showNear ? "border-b border-border" : ""
          }`}
          rowSpan={showNear ? 2 : 1}
        >
          {eyeLabel}
        </td>
        <td className="px-3 py-3.5 text-center text-sm">{primaryVisionLabel}</td>
        <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.[`${prefix}_esferico`])}</td>
        <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.[`${prefix}_cilindrico`])}</td>
        <td className="px-3 py-3.5 text-center text-sm">{formatReceitaEixo(receita?.[`${prefix}_eixo`])}</td>
        {showNear ? (
          <td className="px-3 py-3.5 text-center text-sm text-primary font-black">
            {formatReceitaCampo(receita?.[`${prefix}_adicao`])}
          </td>
        ) : null}
      </tr>

      {showNear ? (
        <tr className="hover:bg-muted/10 transition">
          <td className="px-3 py-3.5 text-center text-sm">Perto</td>
          <td className="px-3 py-3.5 text-center text-sm">
            {formatReceitaCampo(getReceitaPertoEsferico(receita, prefix))}
          </td>
          <td className="px-3 py-3.5 text-center text-sm">{formatReceitaCampo(receita?.[`${prefix}_cilindrico`])}</td>
          <td className="px-3 py-3.5 text-center text-sm">{formatReceitaEixo(receita?.[`${prefix}_eixo`])}</td>
          <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">calculado</td>
        </tr>
      ) : null}
    </>
  );
}

function ReceitaStructuredEyePanel({
  title,
  subtitle,
  prefix,
  tipoReceita,
  esfera,
  cilindro,
  eixo,
  adicao,
  prisma,
  base,
}) {
  const showNear = shouldShowReceitaPerto(tipoReceita);
  const primaryVisionLabel = tipoReceita === "perto" ? "Perto" : "Longe";

  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-primary">{title}</p>
          <p className="text-xs font-semibold text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ReceitaVisionRow
          title={primaryVisionLabel}
          esfera={formatReceitaCampo(esfera)}
          cilindro={formatReceitaCampo(cilindro)}
          eixo={formatReceitaEixo(eixo)}
          adicao={showNear ? formatReceitaCampo(adicao) : ""}
          showAdicao={showNear}
        />

        {showNear ? (
          <ReceitaVisionRow
            title="Perto"
            esfera={formatReceitaCampo(
              getReceitaPertoEsferico(
                {
                  [`${prefix}_esferico`]: esfera,
                  [`${prefix}_adicao`]: adicao,
                },
                prefix
              )
            )}
            cilindro={formatReceitaCampo(cilindro)}
            eixo={formatReceitaEixo(eixo)}
          />
        ) : null}
      </div>

      {(prisma || base) ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ReceitaDatum label="Prisma" value={formatReceitaCampo(prisma)} />
          <ReceitaDatum label="Base" value={formatReceitaCampo(base)} />
        </div>
      ) : null}
    </div>
  );
}

function ReceitaVisionRow({
  title,
  esfera,
  cilindro,
  eixo,
  adicao = "",
  showAdicao = false,
}) {
  return (
    <div className="rounded-[18px] border border-border bg-background p-3">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <ReceitaDatum label="EsfÃ©rico" value={esfera} />
        <ReceitaDatum label="CilÃ­ndrico" value={cilindro} />
        <ReceitaDatum label="Eixo" value={eixo} compact />
        {showAdicao ? <ReceitaDatum label="AdiÃ§Ã£o" value={adicao} /> : null}
      </div>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-[30px] border border-border bg-background/70 p-4 sm:p-5">
      <h3 className="mb-4 text-lg font-black tracking-[-0.04em] text-dark-title">
        {title}
      </h3>

      {children}
    </section>
  );
}

function FormField({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-black text-dark-title">{label}</p>
      {children}

      {error && <p className="text-sm font-bold text-destructive">{error}</p>}
    </div>
  );
}

function DrawerInfoSection({ title, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[30px] border border-border bg-card p-4 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.28)] sm:p-5">
      <h3 className="mb-4 text-lg font-black tracking-[-0.045em] text-dark-title">
        {title}
      </h3>

      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

/* ==========================================================================
   PEQUENOS ELEMENTOS AUXILIARES
   ========================================================================== */

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[24px] border border-border bg-background p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-[16px] bg-primary/[0.08] text-primary">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold leading-6 text-dark-title">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-border bg-background p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold leading-6 text-dark-title">
        {value}
      </p>
    </div>
  );
}

function ReceitaDatum({ label, value, compact = false }) {
  return (
    <div
      className={`rounded-[16px] border border-border bg-background ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
    >
      <p
        className={`font-black uppercase text-muted-foreground ${
          compact
            ? "text-[10px] leading-4 tracking-[0.06em] break-words sm:text-[11px] sm:tracking-[0.1em]"
            : "text-[10px] leading-4 tracking-[0.08em] break-words sm:text-[11px] sm:tracking-[0.12em]"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 font-black text-dark-title ${
          compact ? "text-[13px] leading-5 sm:text-sm" : "text-[13px] leading-5 sm:text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DrawerSectionFeedback({ message, tone = "default" }) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded-[24px] border border-destructive/30 bg-destructive/[0.04] p-4 text-sm font-medium leading-6 text-destructive"
          : "rounded-[24px] border border-border bg-background p-4 text-sm font-medium leading-6 text-muted-foreground"
      }
    >
      {message}
    </div>
  );
}

function formatReceitaCampo(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatReceitaEixo(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${value}°`;
}
