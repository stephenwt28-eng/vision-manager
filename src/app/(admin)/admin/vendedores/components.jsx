"use client";

import { useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Eye,
  Filter,
  ImageOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  PencilLine,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  UploadCloud,
  UserRoundPlus,
  UsersRound,
  Wallet,
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
  formatBRLInput,
  formatCPFInput,
  formatPhoneInput,
  isValidCPF,
  isValidPhone,
  parseBRLToNumber,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const emptyVendedorForm = {
  nome_completo: "",
  nome_exibicao: "",
  cpf: "",
  telefone: "",
  email: "",
  cargo: "vendedor",
  data_admissao: "",
  data_desligamento: "",
  comissao_padrao_percentual: "0",
  meta_mensal_valor: "R$ 0,00",
  status: "ativo",
  observacoes: "",
  image_url: "",
  pin: "",
  regenerar_pin: false,
};

const pageSizeOptions = [15, 30, 50, 100];

const vendedorStatusLabels = {
  ativo: "Ativo",
  inativo: "Inativo",
  desligado: "Desligado",
  bloqueado: "Bloqueado",
};

const cargoLabels = {
  vendedor: "Vendedor",
  caixa: "Caixa",
  atendente: "Atendente",
  gerente: "Gerente",
  outro: "Outro",
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

function generateRandomPin() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
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

function formatMoneyBR(value) {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatPercent(value) {
  const numericValue = Number(value || 0);

  return `${Number.isFinite(numericValue) ? numericValue.toLocaleString("pt-BR") : "0"}%`;
}

function normalizePercentageInput(value = "") {
  return String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(".", ",");
}

function parsePercentageToNumber(value = "") {
  const normalized = String(value)
    .replace(/\./g, "")
    .replace(",", ".");

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "VD";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getInitialVendedorForm(vendedor) {
  if (!vendedor) return emptyVendedorForm;

  return {
    nome_completo: vendedor.nome_completo || "",
    nome_exibicao: vendedor.nome_exibicao || "",
    cpf: vendedor.cpf || "",
    telefone: vendedor.telefone || "",
    email: vendedor.email || "",
    cargo: vendedor.cargo || "vendedor",
    data_admissao: vendedor.data_admissao || "",
    data_desligamento: vendedor.data_desligamento || "",
    comissao_padrao_percentual:
      vendedor.comissao_padrao_percentual === null ||
      vendedor.comissao_padrao_percentual === undefined
        ? "0"
        : String(vendedor.comissao_padrao_percentual).replace(".", ","),
    meta_mensal_valor: formatMoneyBR(vendedor.meta_mensal_valor || 0),
    status: vendedor.status || "ativo",
    observacoes: vendedor.observacoes || "",
    image_url: vendedor.image_url || "",
    pin: "",
    regenerar_pin: false,
  };
}

function getMonthCreatedCount(vendedores = []) {
  const now = new Date();

  return vendedores.filter((vendedor) => {
    if (!vendedor.created_at) return false;

    const date = new Date(vendedor.created_at);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;
}

function getStatusBadgeClass(status) {
  if (status === "ativo") {
    return "rounded-full bg-primary px-3 py-1 text-primary-foreground";
  }
  
  if (status === "inativo") {
    return "rounded-full bg-zinc-700 px-3 py-1 text-primary-foreground";
  }

  if (status === "desligado") {
    return "rounded-full border-destructive/20 bg-destructive px-3 py-1 text-primary-foreground";
  }

  if (status === "bloqueado") {
    return "rounded-full border-amber-500 bg-amber-500 px-3 py-1 text-primary-foreground";
  }

  return "rounded-full px-3 py-1 text-muted-foreground";
}

function buildReadableFileSize(bytes = 0) {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ==========================================================================
   KPIs
   ========================================================================== */

export function VendedoresKpis({ vendedores = [] }) {
  const totalVendedores = vendedores.length;
  const vendedoresAtivos = vendedores.filter(
    (vendedor) => vendedor.status === "ativo"
  ).length;
  const novosNoMes = getMonthCreatedCount(vendedores);

  const kpis = [
    {
      title: "Vendedores cadastrados",
      value: totalVendedores,
      meta: "Base total da conta",
      icon: UsersRound,
    },
    {
      title: "Vendedores ativos",
      value: vendedoresAtivos,
      meta: `${Math.max(totalVendedores - vendedoresAtivos, 0)} fora da operação`,
      icon: BadgeCheck,
    },
    {
      title: "Novos no mês",
      value: novosNoMes,
      meta: "Cadastros recentes",
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

/* ==========================================================================
   FILTROS
   ========================================================================== */

export function VendedoresFilters({
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
                placeholder="Pesquisar por nome, CPF, telefone, e-mail ou cargo..."
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
            {totalResults} vendedor{totalResults === 1 ? "" : "es"} encontrado
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
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                  <SelectItem value="desligado">Desligados</SelectItem>
                  <SelectItem value="bloqueado">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Cargo</p>

              <Select
                value={filters.cargo}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    cargo: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="atendente">Atendente</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">
                Situação da foto
              </p>

              <Select
                value={filters.imagem}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    imagem: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="com_foto">Com foto</SelectItem>
                  <SelectItem value="sem_foto">Sem foto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">
                Comissão mínima
              </p>

              <Input
                value={filters.comissaoMinima}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    comissaoMinima: normalizePercentageInput(
                      event.target.value
                    ),
                  })
                }
                placeholder="Ex.: 5"
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
   CARD DO VENDEDOR
   ========================================================================== */

export function VendedorCard({ vendedor, onView }) {
  return (
    <button
      type="button"
      onClick={() => onView(vendedor)}
      className="group flex min-h-[430px] w-full min-w-0 overflow-hidden rounded-[34px] border border-border bg-card text-left shadow-[0_28px_80px_-64px_rgba(15,23,42,0.42)] transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_38px_100px_-68px_rgba(108,77,230,0.48)]"
    >
      <div className="flex w-full flex-col">
        <div className="relative left-4 top-4 flex flex-wrap gap-2">
            <Badge
              variant="default"
              className={getStatusBadgeClass(vendedor.status)}
            >
              {vendedorStatusLabels[vendedor.status] || "Sem status"}
            </Badge>
        </div>
        
        <div className="relative mt-8 h-56 overflow-hidden bg-background">
          {vendedor.image_url ? (
            <img
              src={vendedor.image_url}
              alt={vendedor.nome_completo || "Foto do vendedor"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/[0.06]">
              <div className="grid size-28 place-items-center rounded-full border border-primary/10 bg-card text-3xl font-black tracking-[-0.05em] text-primary shadow-[0_22px_60px_-42px_rgba(108,77,230,0.55)]">
                {getInitials(vendedor.nome_exibicao || vendedor.nome_completo)}
              </div>
            </div>
          )}

          

          <div className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-[20px] bg-card/95 text-primary shadow-[0_20px_40px_-26px_rgba(15,23,42,0.50)] backdrop-blur-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
            <Eye className="size-5" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-muted-foreground"
              >
                {cargoLabels[vendedor.cargo] || vendedor.cargo || "Cargo não informado"}
              </Badge>

              {Number(vendedor.comissao_padrao_percentual || 0) > 0 ? (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                >
                  Comissão {formatPercent(vendedor.comissao_padrao_percentual)}
                </Badge>
              ) : null}
            </div>

            <h3 className="mt-4 line-clamp-2 text-xl font-black tracking-[-0.045em] text-dark-title">
              {vendedor.nome_exibicao || vendedor.nome_completo}
            </h3>

            {vendedor.nome_exibicao &&
              vendedor.nome_exibicao !== vendedor.nome_completo && (
                <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">
                  {vendedor.nome_completo}
                </p>
              )}
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {vendedor.telefone || "Telefone não informado"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {vendedor.email || "E-mail não informado"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                Meta: {formatMoneyBR(vendedor.meta_mensal_valor || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ==========================================================================
   ESTADO VAZIO
   ========================================================================== */

export function VendedoresEmptyState({ hasFilters = false }) {
  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <UsersRound className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {hasFilters
          ? "Nenhum vendedor combinou com os filtros."
          : "Nenhum vendedor cadastrado."}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A peneira ficou apertada demais. Limpe ou ajuste os filtros para reencontrar a equipe."
          : "Quando os vendedores entrarem, eles aparecerão aqui em cards visuais para gestão rápida."}
      </p>
    </div>
  );
}

/* ==========================================================================
   MODAL DE FORMULÁRIO
   ========================================================================== */

export function VendedorFormDialog({
  open,
  onOpenChange,
  vendedor,
  onSubmit,
  isSaving = false,
  canManagePin = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <VendedorFormDialogContent
          key={vendedor?.id || "new"}
          vendedor={vendedor}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSaving={isSaving}
          canManagePin={canManagePin}
        />
      ) : null}
    </Dialog>
  );
}

function VendedorFormDialogContent({
  vendedor,
  onOpenChange,
  onSubmit,
  isSaving = false,
  canManagePin = false,
}) {
  const isEditing = Boolean(vendedor?.id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() =>
    getInitialVendedorForm(vendedor)
  );
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(
    vendedor?.image_url || ""
  );
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageInfo, setImageInfo] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

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

  function handleChooseImage() {
    fileInputRef.current?.click();
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((current) => ({
        ...current,
        image: "Envie uma imagem JPG, PNG ou WEBP.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: "A imagem deve ter no máximo 5 MB.",
      }));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";

      setPreviewImage(result);
      setImageDataUrl(result);
      setImageInfo({
        name: file.name,
        size: file.size,
      });
      setRemoveCurrentImage(false);

      setErrors((current) => ({
        ...current,
        image: "",
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setPreviewImage("");
    setImageDataUrl("");
    setImageInfo(null);
    setRemoveCurrentImage(Boolean(vendedor?.image_url));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleGenerateNewPin() {
    const newPin = generateRandomPin();

    setFormData((current) => ({
      ...current,
      pin: newPin,
      regenerar_pin: false,
    }));

    setErrors((current) => ({
      ...current,
      pin: "",
    }));
  }

  function handlePinChange(value) {
    setFormData((current) => ({
      ...current,
      pin: value.replace(/\D/g, "").slice(0, 4),
      regenerar_pin: false,
    }));

    if (errors.pin) {
      setErrors((current) => ({
        ...current,
        pin: "",
      }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.nome_completo.trim()) {
      nextErrors.nome_completo = "Informe o nome completo.";
    }

    if (!formData.cargo.trim()) {
      nextErrors.cargo = "Informe o cargo.";
    }

    if (!formData.telefone.trim()) {
      nextErrors.telefone = "Informe o telefone.";
    } else if (!isValidPhone(formData.telefone)) {
      nextErrors.telefone = "Informe um telefone válido.";
    }

    if (formData.cpf && !isValidCPF(formData.cpf)) {
      nextErrors.cpf = "Informe um CPF válido.";
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        nextErrors.email = "Informe um e-mail válido.";
      }
    }

    const comissao = parsePercentageToNumber(
      formData.comissao_padrao_percentual
    );

    if (comissao < 0) {
      nextErrors.comissao_padrao_percentual =
        "A comissão não pode ser negativa.";
    }

    if (formData.pin && !/^\d{4}$/.test(formData.pin)) {
      nextErrors.pin = "O PIN deve conter exatamente 4 dígitos.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    await onSubmit({
      ...(vendedor?.id ? { id: vendedor.id } : {}),
      nome_completo: formData.nome_completo,
      nome_exibicao: formData.nome_exibicao,
      cpf: formData.cpf,
      telefone: formData.telefone,
      email: formData.email,
      cargo: formData.cargo,
      data_admissao: formData.data_admissao,
      data_desligamento: formData.data_desligamento,
      comissao_padrao_percentual: parsePercentageToNumber(
        formData.comissao_padrao_percentual
      ),
      meta_mensal_valor: parseBRLToNumber(formData.meta_mensal_valor),
      status: formData.status,
      observacoes: formData.observacoes,
      ...(imageDataUrl ? { image_data_url: imageDataUrl } : {}),
      ...(removeCurrentImage ? { remover_imagem: true } : {}),
      ...(canManagePin && isEditing && formData.pin
        ? { pin: formData.pin }
        : {}),
    });
  }

  return (
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-6xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-6 text-left sm:px-7">
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar vendedor" : "Cadastrar vendedor"}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          {isEditing
            ? "Atualize os dados do vendedor, a foto e os campos operacionais. O envio continua enxuto: body completo, rota simples e manutenção limpa."
            : "Cadastre o vendedor com os dados essenciais. O PIN de acesso ao relatório individual será gerado automaticamente no salvamento."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-7">
          <FormSection title="Foto do vendedor">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-[30px] border border-border bg-background">
                <div className="flex h-[240px] items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Pré-visualização do vendedor"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 px-4 text-center text-muted-foreground">
                      <CircleUserRound className="size-16 text-primary" />
                      <p className="text-sm font-semibold">
                        Sem foto carregada
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-[30px] border border-border bg-background p-5">
                <div>
                  <p className="text-base font-black text-dark-title">
                    Imagem de perfil
                  </p>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Use JPG, PNG ou WEBP com até 5 MB. Ao trocar a imagem, a
                    anterior será removida no backend e o novo arquivo receberá
                    nome único para evitar cache velho.
                  </p>

                  {imageInfo ? (
                    <p className="mt-3 text-sm font-bold text-primary">
                      {imageInfo.name} • {buildReadableFileSize(imageInfo.size)}
                    </p>
                  ) : null}

                  {errors.image ? (
                    <p className="mt-3 text-sm font-bold text-destructive">
                      {errors.image}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleChooseImage}
                    className="h-12 rounded-full px-5 font-black"
                  >
                    <UploadCloud className="size-4" />
                    Escolher imagem
                  </Button>

                  {previewImage ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRemoveImage}
                      className="h-12 rounded-full px-5 font-black"
                    >
                      <ImageOff className="size-4" />
                      Remover
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </FormSection>

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
                  placeholder="Nome completo do vendedor"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Nome de exibição">
                <Input
                  value={formData.nome_exibicao}
                  onChange={(event) =>
                    updateField("nome_exibicao", event.target.value)
                  }
                  placeholder="Ex.: Duda"
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

              <FormField label="Cargo *" error={errors.cargo}>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => updateField("cargo", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Contato">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Telefone *" error={errors.telefone}>
                <Input
                  value={formData.telefone}
                  onChange={(event) =>
                    updateField("telefone", formatPhoneInput(event))
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
                  placeholder="vendedor@email.com"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Dados operacionais">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Data de admissão">
                <Input
                  type="date"
                  value={formData.data_admissao}
                  onChange={(event) =>
                    updateField("data_admissao", event.target.value)
                  }
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Data de desligamento">
                <Input
                  type="date"
                  value={formData.data_desligamento}
                  onChange={(event) =>
                    updateField("data_desligamento", event.target.value)
                  }
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField
                label="Comissão padrão (%)"
                error={errors.comissao_padrao_percentual}
              >
                <Input
                  value={formData.comissao_padrao_percentual}
                  onChange={(event) =>
                    updateField(
                      "comissao_padrao_percentual",
                      normalizePercentageInput(event.target.value)
                    )
                  }
                  placeholder="Ex.: 5"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Meta mensal">
                <Input
                  value={formData.meta_mensal_valor}
                  onChange={(event) =>
                    updateField(
                      "meta_mensal_valor",
                      formatBRLInput(event)
                    )
                  }
                  placeholder="R$ 0,00"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Status e observações">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Status">
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField("status", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <div className="rounded-[24px] border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-[16px] bg-primary/[0.08] text-primary">
                    <ShieldCheck className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-dark-title">
                      Sobre exclusão
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Vendedor com histórico de OS deve ser desligado ou
                      inativado, não apagado. A rota protege esse dado para a
                      conta não perder rastreabilidade.
                    </p>
                  </div>
                </div>
              </div>

              <FormField label="Observações" className="md:col-span-2">
                <Textarea
                  value={formData.observacoes}
                  onChange={(event) =>
                    updateField("observacoes", event.target.value)
                  }
                  placeholder="Anotações internas sobre o vendedor."
                  className="min-h-32 rounded-[24px] border-border bg-background"
                />
              </FormField>
            </div>
          </FormSection>

          {isEditing && canManagePin ? (
            <FormSection title="PIN de relatório individual">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="rounded-[28px] border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
                      <LockKeyhole className="size-5" />
                    </div>

                    <div className="flex-1">
                      <p className="text-base font-black text-dark-title">
                        Redefinir PIN
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Apenas o administrador altera esse PIN. Ele é usado
                        somente para abrir o desempenho individual do vendedor
                        no terminal.
                      </p>

                      <div className="mt-4 max-w-xs">
                        <FormField label="Novo PIN de 4 dígitos" error={errors.pin}>
                          <Input
                            value={formData.pin}
                            onChange={(event) =>
                              handlePinChange(event.target.value)
                            }
                            inputMode="numeric"
                            placeholder="0000"
                            className="h-12 rounded-2xl border-border bg-card text-center text-lg font-black tracking-[0.35em]"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateNewPin}
                  className="h-auto min-h-[120px] rounded-[28px] px-6 font-black lg:w-56"
                >
                  <RefreshCw className="size-5" />
                  Gerar PIN aleatório
                </Button>
              </div>
            </FormSection>
          ) : null}
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
                : "Cadastrar vendedor"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ==========================================================================
   DRAWER DE DETALHES
   ========================================================================== */

export function VendedorDetailsDrawer({
  open,
  onOpenChange,
  vendedor,
  onEdit,
  onDelete,
  canDelete = false,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[94vh] max-h-[94vh] overflow-hidden border-border bg-card data-[vaul-drawer-direction=bottom]:!max-h-[94vh]">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <DrawerHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-[30px] border border-border bg-background">
                  {vendedor?.image_url ? (
                    <img
                      src={vendedor.image_url}
                      alt={vendedor?.nome_completo || "Foto do vendedor"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-primary/[0.06] text-2xl font-black tracking-[-0.05em] text-primary">
                      {getInitials(
                        vendedor?.nome_exibicao || vendedor?.nome_completo
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(vendedor?.status)}
                    >
                      {vendedorStatusLabels[vendedor?.status] || "Sem status"}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-muted-foreground"
                    >
                      {cargoLabels[vendedor?.cargo] ||
                        vendedor?.cargo ||
                        "Cargo não informado"}
                    </Badge>
                  </div>

                  <DrawerTitle className="mt-3 text-2xl font-black tracking-[-0.055em] text-dark-title">
                    {vendedor?.nome_exibicao ||
                      vendedor?.nome_completo ||
                      "Vendedor"}
                  </DrawerTitle>

                  {vendedor?.nome_exibicao &&
                  vendedor.nome_exibicao !== vendedor.nome_completo ? (
                    <DrawerDescription className="mt-1 text-sm font-semibold text-muted-foreground">
                      {vendedor.nome_completo}
                    </DrawerDescription>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(vendedor)}
                  className="h-12 rounded-full px-5 font-black"
                >
                  <PencilLine className="size-4" />
                  Editar
                </Button>

                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(vendedor)}
                    className="h-12 rounded-full px-5 font-black"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                ) : null}
              </div>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="grid gap-6 xl:grid-cols-2">
              <DrawerInfoSection title="Contato">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoLine
                    icon={Phone}
                    label="Telefone"
                    value={vendedor?.telefone || "Não informado"}
                  />

                  <InfoLine
                    icon={Mail}
                    label="E-mail"
                    value={vendedor?.email || "Não informado"}
                  />

                  <InfoLine
                    icon={CircleUserRound}
                    label="CPF"
                    value={vendedor?.cpf || "Não informado"}
                  />

                  <InfoLine
                    icon={BriefcaseBusiness}
                    label="Cargo"
                    value={
                      cargoLabels[vendedor?.cargo] ||
                      vendedor?.cargo ||
                      "Não informado"
                    }
                  />
                </div>
              </DrawerInfoSection>

              <DrawerInfoSection title="Vínculo e histórico">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoLine
                    icon={CalendarDays}
                    label="Admissão"
                    value={formatDateBR(vendedor?.data_admissao)}
                  />

                  <InfoLine
                    icon={CalendarDays}
                    label="Desligamento"
                    value={formatDateBR(vendedor?.data_desligamento)}
                  />

                  <InfoLine
                    icon={UserRoundPlus}
                    label="Cadastro"
                    value={formatDateTimeBR(vendedor?.created_at)}
                  />

                  <InfoLine
                    icon={RefreshCw}
                    label="Última atualização"
                    value={formatDateTimeBR(vendedor?.updated_at)}
                  />
                </div>
              </DrawerInfoSection>

              <DrawerInfoSection title="Indicadores cadastrados">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoLine
                    icon={Wallet}
                    label="Comissão padrão"
                    value={formatPercent(
                      vendedor?.comissao_padrao_percentual || 0
                    )}
                  />

                  <InfoLine
                    icon={Target}
                    label="Meta mensal"
                    value={formatMoneyBR(vendedor?.meta_mensal_valor || 0)}
                  />
                </div>
              </DrawerInfoSection>

              <DrawerInfoSection title="Acesso ao relatório individual">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoLine
                    icon={LockKeyhole}
                    label="PIN definido em"
                    value={formatDateTimeBR(vendedor?.pin_definido_em)}
                  />

                  <InfoLine
                    icon={ShieldCheck}
                    label="Regra de acesso"
                    value="PIN gerenciado apenas pelo admin"
                  />
                </div>
              </DrawerInfoSection>

              <DrawerInfoSection
                title="Observações"
                className="xl:col-span-2"
              >
                <InfoBlock
                  label="Anotações internas"
                  value={
                    vendedor?.observacoes ||
                    "Nenhuma observação cadastrada para este vendedor."
                  }
                />
              </DrawerInfoSection>
            </div>
          </div>

          <DrawerFooter className="shrink-0 border-t border-border px-5 py-5 sm:px-7">
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

export function ConfirmDeleteVendedorDialog({
  open,
  onOpenChange,
  vendedor,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[34px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Excluir vendedor?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Você está prestes a excluir{" "}
            <strong className="font-black text-dark-title">
              {vendedor?.nome_exibicao ||
                vendedor?.nome_completo ||
                "este vendedor"}
            </strong>
            . Caso existam ordens de serviço vinculadas a ele, o backend vai
            bloquear a exclusão para preservar o histórico da conta. Nessa
            situação, o caminho certo é alterar o status para inativo ou
            desligado.
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

export function VendedoresPagination({
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
          Mostrando {start} a {end} de {totalItems} vendedor
          {totalItems === 1 ? "" : "es"}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">
            Ver:
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-11 w-[110px] rounded-full border-border bg-background">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-black text-dark-title">
          Página {page} de {safeTotalPages}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-11 rounded-full px-4 font-black"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= safeTotalPages}
            className="h-11 rounded-full px-4 font-black"
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   COMPONENTES INTERNOS
   ========================================================================== */

function FormSection({ title, children }) {
  return (
    <section className="rounded-[32px] border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-black tracking-[-0.03em] text-dark-title">
          {title}
        </h3>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  error,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <p className="text-sm font-black text-dark-title">{label}</p>
      ) : null}

      {children}

      {error ? (
        <p className="text-sm font-bold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function DrawerInfoSection({
  title,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-[34px] border border-border bg-card p-5 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.34)] ${className}`}
    >
      <h3 className="mb-4 text-lg font-black tracking-[-0.045em] text-dark-title">
        {title}
      </h3>

      {children}
    </section>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-[24px] border border-border bg-background p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-[16px] bg-primary/[0.08] text-primary">
        <Icon className="size-5" />
      </div>

      <div>
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
    <div className="rounded-[24px] border border-border bg-background p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-bold leading-6 text-dark-title">
        {value}
      </p>
    </div>
  );
}