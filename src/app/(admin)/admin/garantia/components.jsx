"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Filter,
  Glasses,
  Loader2,
  PackageCheck,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  formatBRLInput,
  formatPhoneInput,
  parseBRLToNumber,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const pageSizeOptions = [30, 50, 100];

export const garantiaStatusOptions = [
  { value: "aberta", label: "Aberta" },
  { value: "em_analise", label: "Em análise" },
  { value: "enviada_laboratorio", label: "Enviada ao laboratório" },
  { value: "aguardando_retorno", label: "Aguardando retorno" },
  { value: "aprovada", label: "Aprovada" },
  { value: "recusada", label: "Recusada" },
  { value: "resolvida", label: "Resolvida" },
  { value: "cancelada", label: "Cancelada" },
];

export const tipoGarantiaOptions = [
  { value: "lente", label: "Lente" },
  { value: "armacao", label: "Armação" },
  { value: "tratamento", label: "Tratamento" },
  { value: "montagem", label: "Montagem" },
  { value: "adaptacao", label: "Adaptação" },
  { value: "outro", label: "Outro" },
];

const emptyGarantia = {
  os_id: "",
  cliente_id: "",
  vendedor_id: "",

  numero_garantia: "",
  numero_os_original: "",
  numero_nf: "",
  pedido_laboratorio_numero: "",

  laboratorio_nome: "",
  telefone_laboratorio: "",

  lente_original_id: "",
  lente_tipo: "",
  lente_marca: "",
  lente_linha: "",
  lente_laboratorio: "",
  lente_material: "",
  lente_indice_refracao: "",

  tratamento_antirreflexo: "",
  tratamento_filtro_azul: false,
  tratamento_fotossensivel: false,
  tratamento_polarizado: false,
  tratamento_uv: false,
  tratamento_risco: false,

  status_garantia: "aberta",
  tipo_garantia: "lente",

  motivo_garantia: "",
  descricao_problema: "",
  condicao_produto: "",
  laudo_laboratorio: "",
  solucao_aplicada: "",

  data_abertura: new Date().toISOString().slice(0, 10),
  prazo_resolucao_dias: "",
  prazo_resolucao: "",
  data_envio_laboratorio: "",
  data_retorno_laboratorio: "",
  data_finalizacao: "",

  custo_garantia: "R$ 0,00",
  cobrar_cliente: false,
  valor_cobrado_cliente: "R$ 0,00",

  observacoes_cliente: "",
  observacoes_internas: "",
};

const statusMeta = {
  aberta: {
    label: "Aberta",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  em_analise: {
    label: "Em análise",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  enviada_laboratorio: {
    label: "No laboratório",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  aguardando_retorno: {
    label: "Aguardando retorno",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  aprovada: {
    label: "Aprovada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  recusada: {
    label: "Recusada",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  resolvida: {
    label: "Resolvida",
    className: "bg-primary/[0.10] text-primary border-primary/20",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatBRL(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(number) ? number : 0);
}

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 rounded-[30px] border border-border bg-background/60 p-4 sm:p-5">
      <div className="mb-5 flex items-center gap-2">
        {Icon ? <Icon className="size-5 text-primary" /> : null}

        <h3 className="text-base font-black tracking-[-0.03em] text-dark-title">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function FormField({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <p className="text-sm font-black text-dark-title">{label}</p>
      {children}
    </div>
  );
}

function formatDateBR(value) {
  if (!value) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR").format(
      new Date(`${String(value).slice(0, 10)}T00:00:00`)
    );
  } catch {
    return "Não informado";
  }
}

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function addDaysToInputDate(dateValue, daysToAdd) {
  if (!dateValue) return "";

  const safeDays = Number(daysToAdd);

  if (!Number.isFinite(safeDays) || safeDays < 0) return "";

  const [year, month, day] = String(dateValue)
    .slice(0, 10)
    .split("-")
    .map(Number);

  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + safeDays);

  const resultYear = date.getFullYear();
  const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resultDay = String(date.getDate()).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function getPrazoResolucaoDateFromDays(daysValue, baseDate = null) {
  const normalized = String(daysValue || "").replace(/[^\d]/g, "");

  if (!normalized) return "";

  const base = toInputDate(baseDate) || new Date().toISOString().slice(0, 10);

  return addDaysToInputDate(base, Number(normalized));
}

function getDaysBetweenDates(startDate, endDate) {
  if (!startDate || !endDate) return "";

  const start = new Date(`${toInputDate(startDate)}T00:00:00`);
  const end = new Date(`${toInputDate(endDate)}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays >= 0 ? String(diffInDays) : "";
}

function moneyToInput(value) {
  return formatBRL(value || 0);
}

function moneyToNumber(value) {
  if (typeof value === "number") return value;
  return parseBRLToNumber(value || "R$ 0,00");
}

function getClienteName(clientesById, clienteId) {
  return clientesById.get(clienteId)?.nome_completo || "Cliente não encontrado";
}

function getVendedorName(vendedoresById, vendedorId) {
  const vendedor = vendedoresById.get(vendedorId);

  return vendedor?.nome_exibicao || vendedor?.nome_completo || "Sem vendedor";
}

function getOsLabel(os, clientesById) {
  const cliente = clientesById.get(os?.cliente_id);

  return [
    os?.numero_os ? `OS ${os.numero_os}` : "OS sem número",
    cliente?.nome_completo,
    os?.numero_nf ? `NF ${os.numero_nf}` : null,
    os?.pedido_laboratorio_numero ? `Pedido ${os.pedido_laboratorio_numero}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getLenteLabel(lente) {
  return [
    lente?.marca,
    lente?.linha,
    lente?.tipo_lente,
    lente?.material,
    lente?.indice_refracao,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getLenteByOsId(lentes = [], osId) {
  return lentes.find((lente) => lente.os_id === osId) || null;
}

function isGarantiaAtrasada(garantia) {
  if (!garantia?.prazo_resolucao) return false;

  const finalizada = ["resolvida", "cancelada", "recusada"].includes(
    garantia.status_garantia
  );

  if (finalizada) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prazo = new Date(`${garantia.prazo_resolucao}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return today > prazo;
}

function mapGarantiaToForm(garantia) {
  if (!garantia) return emptyGarantia;

  const dataAbertura = toInputDate(garantia.data_abertura);
  const prazoResolucao = toInputDate(garantia.prazo_resolucao);

  return {
    ...emptyGarantia,
    ...garantia,

    os_id: garantia.os_id || "",
    cliente_id: garantia.cliente_id || "",
    vendedor_id: garantia.vendedor_id || "",

    lente_original_id: garantia.lente_original_id || "",

    data_abertura: dataAbertura,
    prazo_resolucao_dias: getDaysBetweenDates(dataAbertura, prazoResolucao),
    prazo_resolucao: prazoResolucao,
    data_envio_laboratorio: toInputDate(garantia.data_envio_laboratorio),
    data_retorno_laboratorio: toInputDate(garantia.data_retorno_laboratorio),
    data_finalizacao: toInputDate(garantia.data_finalizacao),

    custo_garantia: moneyToInput(garantia.custo_garantia),
    valor_cobrado_cliente: moneyToInput(garantia.valor_cobrado_cliente),
  };
}

function buildGarantiaFromOs({ os, lente }) {
  if (!os) return emptyGarantia;

  const prazoResolucao =
    os.previsao_laboratorio ||
    os.prazo_entrega ||
    os.data_entrega?.slice?.(0, 10) ||
    "";

  const observacoesInternas = [
    os.status ? `Status da OS: ${os.status}` : null,
    os.data_venda ? `Data da venda: ${formatDateBR(os.data_venda)}` : null,
    os.prazo_entrega ? `Prazo de entrega da OS: ${formatDateBR(os.prazo_entrega)}` : null,
    os.previsao_laboratorio
      ? `Previsão do laboratório: ${formatDateBR(os.previsao_laboratorio)}`
      : null,
    os.valor_total ? `Valor total da OS: ${formatBRL(os.valor_total)}` : null,
    os.valor_restante
      ? `Valor restante da OS: ${formatBRL(os.valor_restante)}`
      : null,
    os.status_pagamento ? `Pagamento: ${os.status_pagamento}` : null,
    os.forma_pagamento ? `Forma de pagamento: ${os.forma_pagamento}` : null,
    os.observacoes_internas ? `Obs. internas da OS: ${os.observacoes_internas}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...emptyGarantia,

    os_id: os.id || "",
    cliente_id: os.cliente_id || "",
    vendedor_id: os.vendedor_id || "",

    numero_os_original: os.numero_os || "",
    numero_nf: os.numero_nf || "",
    pedido_laboratorio_numero: os.pedido_laboratorio_numero || "",

    laboratorio_nome: os.laboratorio_nome || lente?.laboratorio || "",
    telefone_laboratorio: os.telefone_laboratorio || "",

    lente_original_id: lente?.id || "",
    lente_tipo: lente?.tipo_lente || "",
    lente_marca: lente?.marca || "",
    lente_linha: lente?.linha || "",
    lente_laboratorio: lente?.laboratorio || os.laboratorio_nome || "",
    lente_material: lente?.material || "",
    lente_indice_refracao: lente?.indice_refracao || "",

    tratamento_antirreflexo: lente?.tratamento_antirreflexo || "",
    tratamento_filtro_azul: lente?.tratamento_filtro_azul ?? false,
    tratamento_fotossensivel: lente?.tratamento_fotossensivel ?? false,
    tratamento_polarizado: lente?.tratamento_polarizado ?? false,
    tratamento_uv: lente?.tratamento_uv ?? false,
    tratamento_risco: lente?.tratamento_risco ?? false,

    prazo_resolucao_dias: getDaysBetweenDates(
      new Date().toISOString().slice(0, 10),
      prazoResolucao
    ),
    prazo_resolucao: prazoResolucao,
    observacoes_cliente: os.observacoes_cliente || "",
    observacoes_internas: observacoesInternas,
  };
}

function getFormPayload(formData) {
  const {
    prazo_resolucao_dias,
    ...restFormData
  } = formData;

  return {
    ...restFormData,

    os_id: formData.os_id || null,
    cliente_id: formData.cliente_id || null,
    vendedor_id: formData.vendedor_id || null,

    lente_original_id: formData.lente_original_id || null,

    numero_garantia: formData.numero_garantia || null,
    numero_os_original: formData.numero_os_original || null,
    numero_nf: formData.numero_nf || null,
    pedido_laboratorio_numero: formData.pedido_laboratorio_numero || null,

    laboratorio_nome: formData.laboratorio_nome || null,
    telefone_laboratorio: formData.telefone_laboratorio || null,

    lente_tipo: formData.lente_tipo || null,
    lente_marca: formData.lente_marca || null,
    lente_linha: formData.lente_linha || null,
    lente_laboratorio: formData.lente_laboratorio || null,
    lente_material: formData.lente_material || null,
    lente_indice_refracao: formData.lente_indice_refracao || null,

    status_garantia: formData.status_garantia || "aberta",
    tipo_garantia: formData.tipo_garantia || null,

    motivo_garantia: formData.motivo_garantia || null,
    descricao_problema: formData.descricao_problema || null,
    condicao_produto: formData.condicao_produto || null,
    laudo_laboratorio: formData.laudo_laboratorio || null,
    solucao_aplicada: formData.solucao_aplicada || null,

    data_abertura: formData.data_abertura || null,
    prazo_resolucao:
      getPrazoResolucaoDateFromDays(
        prazo_resolucao_dias,
        formData.data_abertura
      ) ||
      formData.prazo_resolucao ||
      null,
    data_envio_laboratorio: formData.data_envio_laboratorio || null,
    data_retorno_laboratorio: formData.data_retorno_laboratorio || null,
    data_finalizacao: formData.data_finalizacao || null,

    custo_garantia: moneyToNumber(formData.custo_garantia),
    cobrar_cliente: Boolean(formData.cobrar_cliente),
    valor_cobrado_cliente: moneyToNumber(formData.valor_cobrado_cliente),

    observacoes_cliente: formData.observacoes_cliente || null,
    observacoes_internas: formData.observacoes_internas || null,
  };
}

/* ==========================================================================
   BADGES
   ========================================================================== */

export function GarantiaStatusBadge({ status, atrasada = false }) {
  if (atrasada) {
    return (
      <Badge className="rounded-full border border-red-200 bg-red-100 px-3 py-1 font-black text-red-700">
        <AlertTriangle className="mr-1 size-3.5" />
        Atrasada
      </Badge>
    );
  }

  const meta = statusMeta[status] || statusMeta.aberta;

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

/* ==========================================================================
   KPIS
   ========================================================================== */

export function GarantiaKpis({ garantias = [] }) {
  const abertas = garantias.filter(
    (garantia) =>
      !["resolvida", "cancelada", "recusada"].includes(garantia.status_garantia)
  ).length;

  const atrasadas = garantias.filter(isGarantiaAtrasada).length;

  const emLaboratorio = garantias.filter((garantia) =>
    ["enviada_laboratorio", "aguardando_retorno"].includes(
      garantia.status_garantia
    )
  ).length;

  const resolvidas = garantias.filter(
    (garantia) => garantia.status_garantia === "resolvida"
  ).length;

  const custoTotal = garantias.reduce(
    (sum, garantia) => sum + Number(garantia.custo_garantia || 0),
    0
  );

  const kpis = [
    {
      title: "Garantias abertas",
      value: abertas,
      meta: "Processos ativos",
      icon: ShieldCheck,
      className: "bg-blue-50 text-blue-700",
    },
    {
      title: "Atrasadas",
      value: atrasadas,
      meta: "Passaram do prazo",
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700",
    },
    {
      title: "No laboratório",
      value: emLaboratorio,
      meta: "Aguardando análise/retorno",
      icon: PackageCheck,
      className: "bg-amber-50 text-amber-700",
    },
    {
      title: "Resolvidas",
      value: resolvidas,
      meta: "Finalizadas com solução",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Custo em garantia",
      value: formatBRL(custoTotal),
      meta: "Total registrado",
      icon: ClipboardCheck,
      className: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {kpis.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {item.title}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
                  {item.value}
                </p>
              </div>

              <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                <Icon className="size-6" />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-primary">
              {item.meta}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SearchSelect({
  label,
  value,
  options = [],
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  onChange,
  getOptionLabel = (item) => item.label,
  getOptionDescription,
  disabled = false,
  action,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((item) => item.value === value);

  const filteredOptions = useMemo(() => {
    const term = normalizeSearchValue(search);

    if (!term) return options.slice(0, 60);

    return options
      .filter((item) =>
        normalizeSearchValue(
          [
            getOptionLabel(item),
            getOptionDescription?.(item),
            item.searchText,
          ]
            .filter(Boolean)
            .join(" ")
        ).includes(term)
      )
      .slice(0, 60);
  }, [options, search, getOptionLabel, getOptionDescription]);

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-black text-dark-title">
          {label}
        </p>
        {action}
      </div>

      <div className="relative min-w-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-2xl border bg-background px-4 text-left text-sm font-semibold transition ${
            error ? "border-red-300" : "border-border"
          } ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-primary/40"
          }`}
        >
          <span
            className={
              selected
                ? "min-w-0 flex-1 truncate text-dark-title"
                : "min-w-0 flex-1 truncate text-muted-foreground"
            }
          >
            {selected ? getOptionLabel(selected) : placeholder}
          </span>

          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 z-50 mt-2 w-full max-w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_28px_90px_-48px_rgba(15,23,42,0.55)]">
            <div className="border-b border-border p-3">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 w-full min-w-0 rounded-2xl border-border bg-background pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto overflow-x-hidden p-2">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm font-semibold text-muted-foreground">
                  Nenhum resultado encontrado.
                </p>
              ) : (
                filteredOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onChange(item.value, item);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full min-w-0 rounded-2xl px-3 py-3 text-left transition hover:bg-primary/[0.06] ${
                      item.value === value ? "bg-primary/[0.08]" : ""
                    }`}
                  >
                    <p className="min-w-0 truncate text-sm font-black text-dark-title">
                      {getOptionLabel(item)}
                    </p>

                    {getOptionDescription?.(item) ? (
                      <p className="mt-1 min-w-0 truncate text-xs font-semibold text-muted-foreground">
                        {getOptionDescription(item)}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

/* ==========================================================================
   FILTROS
   ========================================================================== */

export function GarantiaFilters({
  filters,
  setFilters,
  vendedores = [],
  onClear,
  hasActiveFilters,
  totalResults = 0,
}) {
  const [open, setOpen] = useState(false);

  function handleChange(nextFilters) {
    setFilters(() => nextFilters);
  }

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
                  handleChange({
                    ...filters,
                    search: event.target.value,
                  })
                }
                placeholder="Pesquisar por cliente, OS, NF, pedido ou laboratório..."
                className="h-14 rounded-full border-border bg-background pl-11 pr-4 text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-14 rounded-full px-5 font-black"
              >
                <Filter className="size-4" />
                {open ? "Fechar filtros" : "Mais filtros"}
              </Button>
            </CollapsibleTrigger>

            <Button
              type="button"
              variant="secondary"
              onClick={onClear}
              disabled={!hasActiveFilters}
              className="h-14 rounded-full px-5 font-black"
            >
              <X className="size-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            {totalResults} garantia{totalResults === 1 ? "" : "s"} encontrada
            {totalResults === 1 ? "" : "s"}
          </p>

          {hasActiveFilters ? (
            <Badge className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-black text-primary">
              Filtros ativos
            </Badge>
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Busca rápida no painel
            </span>
          )}
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Status</p>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  handleChange({
                    ...filters,
                    status: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="atrasadas">Atrasadas</SelectItem>

                  {garantiaStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Tipo</p>

              <Select
                value={filters.tipo}
                onValueChange={(value) =>
                  handleChange({
                    ...filters,
                    tipo: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>

                  {tipoGarantiaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Vendedor</p>

              <Select
                value={filters.vendedorId}
                onValueChange={(value) =>
                  handleChange({
                    ...filters,
                    vendedorId: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos os vendedores</SelectItem>

                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome_exibicao || vendedor.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Data inicial</p>

              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(event) =>
                  handleChange({
                    ...filters,
                    dataInicio: event.target.value,
                  })
                }
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Data final</p>

              <Input
                type="date"
                value={filters.dataFim}
                onChange={(event) =>
                  handleChange({
                    ...filters,
                    dataFim: event.target.value,
                  })
                }
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
   TABELA
   ========================================================================== */

export function GarantiaTable({
  garantias = [],
  clientesById,
  vendedoresById,
  onView,
  onEdit,
  onDelete,
  onQuickStatus,
  isUpdatingId,
  canDelete,
}) {
  const [quickStatusDrafts, setQuickStatusDrafts] = useState({});
  const [quickDateDrafts, setQuickDateDrafts] = useState({});

  useEffect(() => {
    setQuickStatusDrafts((current) => {
      const next = { ...current };

      garantias.forEach((garantia) => {
        if (!next[garantia.id]) {
          next[garantia.id] = garantia.status_garantia || "aberta";
        }
      });

      return next;
    });

    setQuickDateDrafts((current) => {
      const today = new Date().toISOString().slice(0, 10);
      const next = { ...current };

      garantias.forEach((garantia) => {
        if (!next[garantia.id]) {
          next[garantia.id] = today;
        }
      });

      return next;
    });
  }, [garantias]);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left">
          <thead className="border-b border-border bg-slate-50">
            <tr className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3">Garantia</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Lente / laboratório</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Custo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {garantias.map((garantia) => {
              const atrasada = isGarantiaAtrasada(garantia);
              const isUpdating = isUpdatingId === garantia.id;

              return (
                <tr key={garantia.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-black text-dark-title">
                        {garantia.numero_garantia || "Garantia sem número"}
                      </p>

                      <p className="text-sm font-semibold text-muted-foreground">
                        OS {garantia.numero_os_original || "não informada"}
                      </p>

                      {garantia.numero_nf ? (
                        <p className="text-xs font-bold text-muted-foreground">
                          NF {garantia.numero_nf}
                        </p>
                      ) : null}

                      {garantia.pedido_laboratorio_numero ? (
                        <p className="text-xs font-bold text-primary">
                          Pedido lab. {garantia.pedido_laboratorio_numero}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-black text-dark-title">
                      {getClienteName(clientesById, garantia.cliente_id)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {getVendedorName(vendedoresById, garantia.vendedor_id)}
                    </p>
                    <p className="mt-2 text-xs font-bold text-muted-foreground">
                      Aberta em {formatDateBR(garantia.data_abertura)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-dark-title">
                        {[garantia.lente_marca, garantia.lente_linha]
                          .filter(Boolean)
                          .join(" • ") || "Lente não informada"}
                      </p>

                      <p className="text-xs font-semibold text-muted-foreground">
                        {[garantia.lente_tipo, garantia.lente_material]
                          .filter(Boolean)
                          .join(" • ") || "Sem detalhes da lente"}
                      </p>

                      <p className="text-xs font-bold text-muted-foreground">
                        {garantia.laboratorio_nome || "Laboratório não informado"}
                      </p>

                      {garantia.telefone_laboratorio ? (
                        <p className="text-xs font-bold text-primary">
                          {garantia.telefone_laboratorio}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <GarantiaStatusBadge
                        status={garantia.status_garantia}
                        atrasada={atrasada}
                      />

                      <Select
                        value={quickStatusDrafts[garantia.id] || garantia.status_garantia || "aberta"}
                        onValueChange={(value) =>
                          setQuickStatusDrafts((current) => ({
                            ...current,
                            [garantia.id]: value,
                          }))
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="h-9 w-[190px] rounded-full text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {garantiaStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isUpdating ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" />
                          Atualizando...
                        </span>
                      ) : (
                        <>
                          <Field
                            label="Data da ocorrência"
                            type="date"
                            value={quickDateDrafts[garantia.id] || ""}
                            onChange={(value) =>
                              setQuickDateDrafts((current) => ({
                                ...current,
                                [garantia.id]: value,
                              }))
                            }
                            className="h-9 rounded-2xl border-border bg-background text-xs"
                          />

                          <Button
                            type="button"
                            size="sm"
                            className="h-9 rounded-full px-4 text-xs font-black"
                            onClick={() =>
                              onQuickStatus(
                                garantia,
                                quickStatusDrafts[garantia.id] ||
                                  garantia.status_garantia ||
                                  "aberta",
                                quickDateDrafts[garantia.id] ||
                                  new Date().toISOString().slice(0, 10)
                              )
                            }
                          >
                            Atualizar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-black text-dark-title">
                      {formatDateBR(garantia.prazo_resolucao)}
                    </p>

                    <div className="mt-2 space-y-1 text-xs font-semibold text-muted-foreground">
                      {garantia.data_envio_laboratorio ? (
                        <p>Envio: {formatDateBR(garantia.data_envio_laboratorio)}</p>
                      ) : null}

                      {garantia.data_retorno_laboratorio ? (
                        <p>
                          Retorno:{" "}
                          {formatDateBR(garantia.data_retorno_laboratorio)}
                        </p>
                      ) : null}

                      {garantia.data_finalizacao ? (
                        <p>Finalizada: {formatDateBR(garantia.data_finalizacao)}</p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-black text-dark-title">
                      {formatBRL(garantia.custo_garantia)}
                    </p>

                    {garantia.cobrar_cliente ? (
                      <Badge className="mt-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                        Cobrar {formatBRL(garantia.valor_cobrado_cliente)}
                      </Badge>
                    ) : (
                      <p className="mt-2 text-xs font-bold text-muted-foreground">
                        Sem cobrança ao cliente
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onView(garantia)}
                      >
                        <Eye className="mr-2 size-4" />
                        Ver
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(garantia)}
                      >
                        <PencilLine className="mr-2 size-4" />
                        Editar
                      </Button>

                      {canDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(garantia)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Excluir
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGINACAO
   ========================================================================== */

export function GarantiaDetailsDrawer({
  open,
  onOpenChange,
  garantia,
  cliente,
  vendedor,
  historicoStatus = [],
  onEdit,
  onDelete,
  canDelete = false,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[94vh] max-h-[94vh] overflow-hidden border-border bg-card data-[vaul-drawer-direction=bottom]:!max-h-[94vh]">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <DrawerHeader className="shrink-0 border-b border-border px-5 py-5 text-left sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <GarantiaStatusBadge status={garantia?.status_garantia} />
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-muted-foreground"
                  >
                    {garantia?.tipo_garantia || "Sem tipo"}
                  </Badge>
                </div>

                <DrawerTitle className="mt-3 text-2xl font-black tracking-[-0.055em] text-dark-title">
                  {garantia?.numero_garantia || "Garantia sem número"}
                </DrawerTitle>

                <DrawerDescription className="mt-1 text-sm font-semibold text-muted-foreground">
                  OS {garantia?.numero_os_original || "não informada"} •{" "}
                  {cliente?.nome_completo || "Cliente não informado"}
                </DrawerDescription>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(garantia)}
                  className="h-12 rounded-full px-5 font-black"
                >
                  <PencilLine className="size-4" />
                  Editar
                </Button>

                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(garantia)}
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
              <FormSection title="Resumo da garantia">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBox label="Cliente" value={cliente?.nome_completo || "Não informado"} />
                  <InfoBox
                    label="Vendedor"
                    value={vendedor?.nome_exibicao || vendedor?.nome_completo || "Não informado"}
                  />
                  <InfoBox label="Nota fiscal" value={garantia?.numero_nf || "Não informada"} />
                  <InfoBox
                    label="Pedido do laboratório"
                    value={garantia?.pedido_laboratorio_numero || "Não informado"}
                  />
                  <InfoBox label="Abertura" value={formatDateBR(garantia?.data_abertura)} />
                  <InfoBox label="Prazo" value={formatDateBR(garantia?.prazo_resolucao)} />
                </div>
              </FormSection>

              <FormSection title="Lente e laboratório">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBox label="Laboratório" value={garantia?.laboratorio_nome || "Não informado"} />
                  <InfoBox label="Telefone" value={garantia?.telefone_laboratorio || "Não informado"} />
                  <InfoBox
                    label="Lente"
                    value={[garantia?.lente_marca, garantia?.lente_linha].filter(Boolean).join(" • ") || "Não informada"}
                  />
                  <InfoBox
                    label="Detalhes"
                    value={[
                      garantia?.lente_tipo,
                      garantia?.lente_material,
                      garantia?.lente_indice_refracao,
                    ].filter(Boolean).join(" • ") || "Sem detalhes"}
                  />
                </div>
              </FormSection>

              <FormSection title="Problema e solução">
                <div className="grid gap-4">
                  <InfoBox label="Motivo" value={garantia?.motivo_garantia || "Não informado"} />
                  <InfoBox label="Descrição do problema" value={garantia?.descricao_problema || "Não informada"} />
                  <InfoBox label="Laudo" value={garantia?.laudo_laboratorio || "Não informado"} />
                  <InfoBox label="Solução aplicada" value={garantia?.solucao_aplicada || "Não informada"} />
                </div>
              </FormSection>

              <FormSection title="Custos e observações">
                <div className="grid gap-4">
                  <InfoBox label="Custo da garantia" value={formatBRL(garantia?.custo_garantia)} />
                  <InfoBox
                    label="Cobrança ao cliente"
                    value={garantia?.cobrar_cliente ? formatBRL(garantia?.valor_cobrado_cliente) : "Sem cobrança"}
                  />
                  <InfoBox
                    label="Observações do cliente"
                    value={garantia?.observacoes_cliente || "Nenhuma observação cadastrada."}
                  />
                  <InfoBox
                    label="Observações internas"
                    value={garantia?.observacoes_internas || "Nenhuma observação interna cadastrada."}
                  />
                </div>
              </FormSection>

              <FormSection title="Histórico de movimentação" icon={CalendarClock}>
                <div className="space-y-4">
                  {historicoStatus.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
                      Nenhuma movimentação registrada ainda.
                    </div>
                  ) : (
                    historicoStatus.map((item) => (
                      <div key={item.id} className="rounded-[24px] border border-border bg-card p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.status_anterior ? (
                              <GarantiaStatusBadge status={item.status_anterior} />
                            ) : (
                              <Badge className="rounded-full border border-border bg-background px-3 py-1 font-black text-muted-foreground">
                                Início
                              </Badge>
                            )}
                            <span className="text-sm font-black text-muted-foreground">--</span>
                            <GarantiaStatusBadge status={item.status_novo} />
                          </div>

                          <div className="text-xs font-bold text-muted-foreground">
                            <p>{formatDateBR(item.data_ocorrencia)}</p>
                          </div>
                        </div>

                        {item.observacao ? (
                          <p className="mt-3 text-sm font-medium text-muted-foreground">
                            {item.observacao}
                          </p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </FormSection>
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
export function GarantiaPagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
}) {
  const safeTotalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <section className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-4 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.36)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Mostrando {start} a {end} de {total} garantia
          {total === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">Ver</span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
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
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
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
          disabled={page >= safeTotalPages}
          onClick={() => setPage((current) => Math.min(current + 1, safeTotalPages))}
          className="size-11 rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

/* ================================================================================================================================
   EMPTY STATE
   ========================================================================== */

export function GarantiaEmptyState({ hasActiveFilters, onCreate, onClear }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <ShieldCheck className="size-7" />
      </div>

      <h2 className="mt-4 text-xl font-black text-dark-title">
        Nenhuma garantia encontrada
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-muted-foreground">
        {hasActiveFilters
          ? "Os filtros estão escondendo os resultados. Limpa esse garimpo aí que a lista aparece."
          : "Quando uma OS precisar de garantia, ela aparece aqui com status próprio, laboratório, prazo, laudo e solução."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasActiveFilters ? (
          <Button variant="outline" onClick={onClear}>
            <X className="mr-2 size-4" />
            Limpar filtros
          </Button>
        ) : null}

        <Button className="h-14 rounded-full px-6 font-black" onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          Nova garantia
        </Button>
      </div>
    </div>
  );
}

/* ==========================================================================
   FORM MODAL
   ========================================================================== */

export function GarantiaFormDialog({
  open,
  onOpenChange,
  editingGarantia,
  ordensServico = [],
  clientesById,
  vendedoresById,
  lentes = [],
  onSubmit,
  isSaving,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <GarantiaFormContent
          key={editingGarantia?.id || "new"}
          onOpenChange={onOpenChange}
          editingGarantia={editingGarantia}
          ordensServico={ordensServico}
          clientesById={clientesById}
          vendedoresById={vendedoresById}
          lentes={lentes}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function GarantiaFormContent({
  onOpenChange,
  editingGarantia,
  ordensServico = [],
  clientesById,
  vendedoresById,
  lentes = [],
  onSubmit,
  isSaving,
}) {
  const [formData, setFormData] = useState(() =>
    editingGarantia ? mapGarantiaToForm(editingGarantia) : emptyGarantia
  );

  const isEditing = Boolean(editingGarantia?.id);

  const selectedOs = useMemo(() => {
    if (!formData.os_id) return null;
    return ordensServico.find((os) => os.id === formData.os_id) || null;
  }, [formData.os_id, ordensServico]);

  const selectedLente = useMemo(() => {
    if (!formData.lente_original_id) {
      return getLenteByOsId(lentes, formData.os_id);
    }

    return lentes.find((lente) => lente.id === formData.lente_original_id) || null;
  }, [formData.lente_original_id, formData.os_id, lentes]);

  const lentesDaOs = useMemo(() => {
    if (!formData.os_id) return [];
    return lentes.filter((lente) => lente.os_id === formData.os_id);
  }, [formData.os_id, lentes]);

  const osOptions = useMemo(() => {
    return ordensServico.map((os) => {
      const cliente = clientesById.get(os?.cliente_id);
      const vendedor = vendedoresById.get(os?.vendedor_id);

      return {
        value: os.id,
        raw: os,
        label: getOsLabel(os, clientesById),
        searchText: [
          os.numero_os,
          os.numero_nf,
          os.pedido_laboratorio_numero,
          os.laboratorio_nome,
          cliente?.nome_completo,
          cliente?.telefone_principal,
          vendedor?.nome_exibicao,
          vendedor?.nome_completo,
        ]
          .filter(Boolean)
          .join(" "),
      };
    });
  }, [ordensServico, clientesById, vendedoresById]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSelectOs(osId) {
    const os = ordensServico.find((item) => item.id === osId);
    const lente = getLenteByOsId(lentes, osId);
    const autoData = buildGarantiaFromOs({ os, lente });

    setFormData((current) => ({
      ...current,
      ...autoData,

      id: current.id,
      os_id: osId,

      status_garantia: current.status_garantia || "aberta",
      tipo_garantia: current.tipo_garantia || (lente ? "lente" : "outro"),
      data_abertura:
        current.data_abertura || new Date().toISOString().slice(0, 10),

      numero_garantia: current.numero_garantia,

      motivo_garantia: current.motivo_garantia,
      descricao_problema: current.descricao_problema,
      condicao_produto: current.condicao_produto,
      laudo_laboratorio: current.laudo_laboratorio,
      solucao_aplicada: current.solucao_aplicada,

      custo_garantia: current.custo_garantia,
      cobrar_cliente: current.cobrar_cliente,
      valor_cobrado_cliente: current.valor_cobrado_cliente,

      observacoes_cliente:
        current.observacoes_cliente || autoData.observacoes_cliente,

      observacoes_internas:
        current.observacoes_internas || autoData.observacoes_internas,
    }));
  }

  function handleSelectLente(lenteId) {
    if (!lenteId) {
      setFormData((current) => ({
        ...current,
        lente_original_id: "",
        lente_tipo: "",
        lente_marca: "",
        lente_linha: "",
        lente_material: "",
        lente_indice_refracao: "",
        tratamento_antirreflexo: "",
        tratamento_filtro_azul: false,
        tratamento_fotossensivel: false,
        tratamento_polarizado: false,
        tratamento_uv: false,
        tratamento_risco: false,
      }));

      return;
    }

    const lente = lentes.find((item) => item.id === lenteId);

    setFormData((current) => ({
      ...current,
      lente_original_id: lente?.id || "",
      lente_tipo: lente?.tipo_lente || "",
      lente_marca: lente?.marca || "",
      lente_linha: lente?.linha || "",
      lente_laboratorio:
        lente?.laboratorio || current.laboratorio_nome || current.lente_laboratorio,
      lente_material: lente?.material || "",
      lente_indice_refracao: lente?.indice_refracao || "",

      tratamento_antirreflexo: lente?.tratamento_antirreflexo || "",
      tratamento_filtro_azul: lente?.tratamento_filtro_azul ?? false,
      tratamento_fotossensivel: lente?.tratamento_fotossensivel ?? false,
      tratamento_polarizado: lente?.tratamento_polarizado ?? false,
      tratamento_uv: lente?.tratamento_uv ?? false,
      tratamento_risco: lente?.tratamento_risco ?? false,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = getFormPayload(formData);

    if (isEditing) {
      payload.id = editingGarantia.id;
    }

    await onSubmit(payload);
  }

  const clienteName = getClienteName(clientesById, formData.cliente_id);
  const vendedorName = getVendedorName(vendedoresById, formData.vendedor_id);

  return (
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-6 text-left sm:px-7">
        <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar garantia" : "Nova garantia"}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {isEditing
            ? "Atualize os dados da garantia, acompanhe o status e registre a solução aplicada."
            : "Selecione uma OS existente para puxar automaticamente cliente, vendedor, NF, pedido, laboratório, lente e tratamentos."}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-7">

          <FormSection title="Origem da garantia" icon={FileText}>
            <div className="grid gap-4 min-w-0 md:grid-cols-2">
              <div className="min-w-0 md:col-span-2">
                <SearchSelect
                  label="OS original"
                  value={formData.os_id}
                  options={osOptions}
                  placeholder="Selecione a OS que gerou a garantia"
                  searchPlaceholder="Buscar por OS, cliente, NF, pedido, vendedor ou laboratório..."
                  onChange={handleSelectOs}
                  disabled={isEditing}
                  getOptionLabel={(item) => item.label}
                  getOptionDescription={(item) => {
                    const os = item.raw;
                    const vendedor = vendedoresById.get(os?.vendedor_id);

                    return [
                      os?.status ? `Status: ${os.status}` : null,
                      os?.valor_total ? `Valor: ${formatBRL(os.valor_total)}` : null,
                      vendedor?.nome_exibicao || vendedor?.nome_completo,
                    ]
                      .filter(Boolean)
                      .join(" • ");
                  }}
                />
              </div>

              <Field
                label="Número da garantia"
                value={formData.numero_garantia}
                onChange={(value) => updateField("numero_garantia", value)}
                placeholder="Ex: GAR-0001"
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Número da OS"
                value={formData.numero_os_original}
                onChange={(value) => updateField("numero_os_original", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Número da nota fiscal"
                value={formData.numero_nf}
                onChange={(value) => updateField("numero_nf", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Número do pedido no laboratório"
                value={formData.pedido_laboratorio_numero}
                onChange={(value) =>
                  updateField("pedido_laboratorio_numero", value)
                }
                className="h-12 rounded-2xl border-border bg-background"
              />

              <InfoBox label="Cliente" value={clienteName} />

              <InfoBox label="Vendedor" value={vendedorName} />
            </div>
          </FormSection>
          
          <FormSection title="Lente e laboratório" icon={Glasses}>

            <div className="grid gap-4 min-w-0 md:grid-cols-2">
              <FormField label="Lente da OS" className="md:col-span-2">
                <Select
                  value={formData.lente_original_id || "__empty"}
                  onValueChange={(value) => {
                    if (value === "__empty") {
                      handleSelectLente("");
                      return;
                    }

                    handleSelectLente(value);
                  }}
                  disabled={!formData.os_id || lentesDaOs.length === 0}
                >
                  <SelectTrigger className="h-12 w-full min-w-0 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Selecione a lente vinculada à OS" />
                  </SelectTrigger>

                  <SelectContent className="max-w-[calc(100vw-2rem)] overflow-x-hidden">
                    <SelectItem value="__empty">
                      {formData.os_id
                        ? "Nenhuma lente selecionada"
                        : "Selecione uma OS primeiro"}
                    </SelectItem>

                    {lentesDaOs.map((lente) => (
                      <SelectItem key={lente.id} value={lente.id}>
                        <span className="block max-w-[calc(100vw-4rem)] truncate">
                          {getLenteLabel(lente) || "Lente sem descrição"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!formData.os_id ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Primeiro escolha a OS para carregar as lentes vinculadas.
                  </p>
                ) : lentesDaOs.length === 0 ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Essa OS não possui lente vinculada.
                  </p>
                ) : null}
              </FormField>

              <Field
                label="Laboratório"
                value={formData.laboratorio_nome}
                onChange={(value) => updateField("laboratorio_nome", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Telefone do laboratório"
                value={formData.telefone_laboratorio}
                onChange={(value) =>
                  updateField("telefone_laboratorio", formatPhoneInput(value))
                }
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Marca da lente"
                value={formData.lente_marca}
                onChange={(value) => updateField("lente_marca", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Linha da lente"
                value={formData.lente_linha}
                onChange={(value) => updateField("lente_linha", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Tipo da lente"
                value={formData.lente_tipo}
                onChange={(value) => updateField("lente_tipo", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Material"
                value={formData.lente_material}
                onChange={(value) => updateField("lente_material", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Índice de refração"
                value={formData.lente_indice_refracao}
                onChange={(value) => updateField("lente_indice_refracao", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Laboratório da lente"
                value={formData.lente_laboratorio}
                onChange={(value) => updateField("lente_laboratorio", value)}
                className="h-12 rounded-2xl border-border bg-background"
              />

              <div className="md:col-span-2">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Tratamentos
                </p>

                <div className="grid min-w-0 gap-4 md:grid-cols-3">
                  <Field
                    label="Antirreflexo"
                    value={formData.tratamento_antirreflexo}
                    onChange={(value) =>
                      updateField("tratamento_antirreflexo", value)
                    }
                    className="h-12 rounded-2xl border-border bg-background"
                  />

                  <CheckField
                    label="Filtro azul"
                    checked={formData.tratamento_filtro_azul}
                    onChange={(checked) =>
                      updateField("tratamento_filtro_azul", checked)
                    }
                  />

                  <CheckField
                    label="Fotossensível"
                    checked={formData.tratamento_fotossensivel}
                    onChange={(checked) =>
                      updateField("tratamento_fotossensivel", checked)
                    }
                  />

                  <CheckField
                    label="Polarizado"
                    checked={formData.tratamento_polarizado}
                    onChange={(checked) =>
                      updateField("tratamento_polarizado", checked)
                    }
                  />

                  <CheckField
                    label="Proteção UV"
                    checked={formData.tratamento_uv}
                    onChange={(checked) =>
                      updateField("tratamento_uv", checked)
                    }
                  />

                  <CheckField
                    label="Antirrisco"
                    checked={formData.tratamento_risco}
                    onChange={(checked) =>
                      updateField("tratamento_risco", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Status, problema e solução" icon={CalendarClock}>

            <div className="grid gap-4 min-w-0 md:grid-cols-2">
              <SelectField
                label="Status da garantia"
                value={formData.status_garantia}
                onValueChange={(value) => updateField("status_garantia", value)}
                options={garantiaStatusOptions}
              />

              <SelectField
                label="Tipo de garantia"
                value={formData.tipo_garantia}
                onValueChange={(value) => updateField("tipo_garantia", value)}
                options={tipoGarantiaOptions}
              />

              <Field
                label="Data de abertura"
                type="date"
                value={formData.data_abertura}
                onChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    data_abertura: value,
                    prazo_resolucao: getPrazoResolucaoDateFromDays(
                      current.prazo_resolucao_dias,
                      value
                    ),
                  }))
                }
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Prazo de resolução"
                type="date"
                value={formData.prazo_resolucao}
                onChange={(value) => updateField("prazo_resolucao", value)}
                className="hidden"
              />

              <FormField label="Prazo de resolução (dias)">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.prazo_resolucao_dias || ""}
                  onChange={(event) => {
                    const nextDays = event.target.value.replace(/[^\d]/g, "");

                    setFormData((current) => ({
                      ...current,
                      prazo_resolucao_dias: nextDays,
                      prazo_resolucao: getPrazoResolucaoDateFromDays(
                        nextDays,
                        current.data_abertura
                      ),
                    }));
                  }}
                  placeholder="Ex: 7"
                  className="h-12 rounded-2xl border-border bg-background"
                />

                <p className="text-xs font-semibold text-muted-foreground">
                  Data prevista:{" "}
                  <span className="font-black text-dark-title">
                    {formData.prazo_resolucao
                      ? formatDateBR(formData.prazo_resolucao)
                      : "não definida"}
                  </span>
                </p>
              </FormField>

              <Field
                label="Envio ao laboratório"
                type="date"
                value={formData.data_envio_laboratorio}
                onChange={(value) =>
                  updateField("data_envio_laboratorio", value)
                }
                className="hidden"
              />

              <Field
                label="Retorno do laboratório"
                type="date"
                value={formData.data_retorno_laboratorio}
                onChange={(value) =>
                  updateField("data_retorno_laboratorio", value)
                }
                className="hidden"
              />

              <Field
                label="Finalização"
                type="date"
                value={formData.data_finalizacao}
                onChange={(value) => updateField("data_finalizacao", value)}
                className="hidden"
              />

              <Field
                label="Motivo da garantia"
                value={formData.motivo_garantia}
                onChange={(value) => updateField("motivo_garantia", value)}
                placeholder="Ex: defeito no tratamento, adaptação, quebra..."
                className="h-12 rounded-2xl border-border bg-background"
              />

              <TextField
                label="Descrição do problema"
                value={formData.descricao_problema}
                onChange={(value) => updateField("descricao_problema", value)}
              />

              <TextField
                label="Condição do produto"
                value={formData.condicao_produto}
                onChange={(value) => updateField("condicao_produto", value)}
              />

              <TextField
                label="Laudo do laboratório"
                value={formData.laudo_laboratorio}
                onChange={(value) => updateField("laudo_laboratorio", value)}
              />

              <TextField
                label="Solução aplicada"
                value={formData.solucao_aplicada}
                onChange={(value) => updateField("solucao_aplicada", value)}
              />
            </div>
          </FormSection>

          <FormSection title="Custos e observações " icon={ClipboardCheck}>

            <div className="grid gap-4 min-w-0 md:grid-cols-2">
              <Field
                label="Custo da garantia"
                value={formData.custo_garantia}
                onChange={(value) =>
                  updateField("custo_garantia", formatBRLInput(value))
                }
                className="h-12 rounded-2xl border-border bg-background"
              />

              <Field
                label="Valor cobrado do cliente"
                value={formData.valor_cobrado_cliente}
                onChange={(value) =>
                  updateField("valor_cobrado_cliente", formatBRLInput(value))
                }
                className="h-12 rounded-2xl border-border bg-background"
              />

              <div className="md:col-span-2">
                <CheckField
                  label="Cobrar algum valor do cliente"
                  checked={formData.cobrar_cliente}
                  onChange={(checked) => updateField("cobrar_cliente", checked)}
                />
              </div>

              <TextField
                label="Observações para o cliente"
                value={formData.observacoes_cliente}
                onChange={(value) => updateField("observacoes_cliente", value)}
              />

              <TextField
                label="Observações internas"
                value={formData.observacoes_internas}
                onChange={(value) => updateField("observacoes_internas", value)}
              />
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
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-4" />
                  {isEditing ? "Salvar alterações" : "Cadastrar garantia"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
  );
}

/* ==========================================================================
   DELETE DIALOG
   ========================================================================== */

export function ConfirmDeleteGarantiaDialog({
  open,
  onOpenChange,
  garantia,
  onConfirm,
  isDeleting,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir garantia?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação remove o processo de garantia selecionado. A OS original
            não será apagada, mas o histórico dessa garantia sai da lista.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {garantia ? (
          <div className="rounded-2xl border border-border bg-slate-50 p-3 text-sm">
            <p className="font-black text-dark-title">
              {garantia.numero_garantia || "Garantia sem número"}
            </p>
            <p className="font-semibold text-muted-foreground">
              OS {garantia.numero_os_original || "não informada"}
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir garantia"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ==========================================================================
   CAMPOS INTERNOS
   ========================================================================== */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}) {
  if (className === "hidden") {
    return null;
  }

  return (
    <FormField label={label}>
      <Input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={
          className ||
          "h-12 rounded-2xl border-border bg-background"
        }
      />
    </FormField>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <FormField label={label}>
      <Textarea
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={
          className ||
          "min-h-32 rounded-[24px] border-border bg-background"
        }
      />
    </FormField>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = "Selecione",
}) {
  return (
    <FormField label={label}>
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
        checked
          ? "border-primary/25 bg-primary/[0.08] text-primary shadow-[0_18px_45px_-38px_rgba(108,77,230,0.65)]"
          : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:bg-primary/[0.04]"
      }`}
    >
      <span>{label}</span>

      <span
        className={`grid size-6 place-items-center rounded-full border transition ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card"
        }`}
      >
        {checked ? <CheckCircle2 className="size-4" /> : null}
      </span>
    </button>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-border bg-background p-4">
      <p className="text-sm font-black text-dark-title">{label}</p>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-muted-foreground">
        {value || "Não informado"}
      </p>
    </div>
  );
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
