"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Glasses,
  Loader2,
  PencilLine,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  UserRoundPlus,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  formatBRLInput,
  formatCEPInput,
  formatCPFInput,
  formatPhoneInput,
  parseBRLToNumber,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const pageSizeOptions = [30, 50, 100];

export const osStatusOptions = [
  { value: "cadastrada", label: "Cadastrada" },
  { value: "enviada_laboratorio", label: "Enviada ao laboratório" },
  { value: "aguardando_retorno", label: "Aguardando retorno" },
  { value: "pronta_retirada", label: "Pronta para retirada" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];

export const pagamentoStatusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "parcial", label: "Parcial" },
  { value: "pago", label: "Pago" },
  { value: "estornado", label: "Estornado" },
  { value: "cancelado", label: "Cancelado" },
];

const formaPagamentoOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "crediario", label: "Crediário" },
  { value: "outro", label: "Outro" },
];

const tipoOsOptions = [
  { value: "venda", label: "Venda" },
  { value: "orcamento", label: "Orçamento" },
  { value: "garantia", label: "Garantia" },
  { value: "ajuste", label: "Ajuste" },
  { value: "troca", label: "Troca" },
];

const tipoReceitaOptions = [
  { value: "monofocal", label: "Monofocal" },
  { value: "bifocal", label: "Bifocal" },
  { value: "multifocal", label: "Multifocal" },
  { value: "ocupacional", label: "Ocupacional" },
  { value: "solar_grau", label: "Solar com grau" },
  { value: "outro", label: "Outro" },
];

const tipoArmacaoOptions = [
  { value: "aro_fechado", label: "Aro fechado" },
  { value: "fio_nylon", label: "Fio de nylon" },
  { value: "tres_pecas", label: "Três peças" },
  { value: "clipon", label: "Clip-on" },
  { value: "solar", label: "Solar" },
  { value: "outro", label: "Outro" },
];

const tipoLenteOptions = [
  { value: "visao_simples", label: "Visão simples" },
  { value: "bifocal", label: "Bifocal" },
  { value: "multifocal", label: "Multifocal" },
  { value: "ocupacional", label: "Ocupacional" },
  { value: "solar", label: "Solar" },
  { value: "sem_grau", label: "Sem grau" },
  { value: "outro", label: "Outro" },
];

const lenteMaterialOptions = [
  { value: "resina", label: "Resina" },
  { value: "policarbonato", label: "Policarbonato" },
  { value: "trivex", label: "Trivex" },
  { value: "cristal", label: "Cristal" },
  { value: "alto_indice", label: "Alto índice" },
  { value: "outro", label: "Outro" },
];

const emptyOrdemServico = {
  cliente_id: "",
  vendedor_id: "",
  tipo_os: "venda",
  status: "cadastrada",
  data_venda: new Date().toISOString().slice(0, 10),
  prazo_entrega_combinado: "",
  laboratorio_nome: "",
  previsao_laboratorio: "",
  pedido_laboratorio_numero: "",
  custo_armacao: "R$ 0,00",
  custo_lentes: "R$ 0,00",
  valor_armacao: "R$ 0,00",
  valor_lentes: "R$ 0,00",
  valor_servicos: "R$ 0,00",
  valor_adicionais: "R$ 0,00",
  desconto_tipo: "valor",
  desconto_valor: "R$ 0,00",
  desconto_percentual: "",
  valor_total: "R$ 0,00",
  valor_entrada: "R$ 0,00",
  valor_restante: "R$ 0,00",
  forma_pagamento: "",
  quantidade_parcelas: "",
  valor_parcela: "R$ 0,00",
  status_pagamento: "pendente",
  observacoes_cliente: "",
  observacoes_internas: "",
};

const emptyClienteRapido = {
  nome_completo: "",
  telefone_principal: "",
  cpf: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  origem_cliente: "balcao",
  prefere_contato_por: "whatsapp",
  observacoes: "",
  ativo: true,
};

const emptyReceita = {
  data_receita: "",
  medico_nome: "",
  medico_crm: "",
  medico_clinica: "",
  medico_telefone: "",
  validade_receita: "",
  tipo_receita: "",
  od_esferico: "",
  od_cilindrico: "",
  od_eixo: "",
  od_adicao: "",
  od_prisma: "",
  od_base: "",
  oe_esferico: "",
  oe_cilindrico: "",
  oe_eixo: "",
  oe_adicao: "",
  oe_prisma: "",
  oe_base: "",
  dnp_od: "",
  dnp_oe: "",
  dp_total: "",
  altura_od: "",
  altura_oe: "",
  acuidade_od: "",
  acuidade_oe: "",
  observacoes: "",
};

const emptyArmacao = {
  marca: "",
  modelo: "",
  referencia: "",
  codigo_interno: "",
  codigo_barras: "",
  cor: "",
  material: "",
  formato: "",
  tamanho_texto: "",
  aro: "",
  ponte: "",
  haste: "",
  largura_total: "",
  altura_lente: "",
  tipo_armacao: "",
  genero_indicado: "indefinido",
  custo: "",
  observacoes: "",
};

const emptyLente = {
  tipo_lente: "",
  marca: "",
  linha: "",
  laboratorio: "",
  material: "",
  indice_refracao: "",
  tratamento_antirreflexo: false,
  tratamento_filtro_azul: false,
  tratamento_fotossensivel: false,
  tratamento_polarizado: false,
  tratamento_uv: false,
  tratamento_risco: false,
  coloracao: "",
  tonalidade: "",
  curva_base: "",
  diametro: "",
  garantia_meses: "",
  data_inicio_garantia: "",
  data_fim_garantia: "",
  custo: "",
  observacoes: "",
};

const statusMeta = {
  cadastrada: {
    label: "Cadastrada",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  enviada_laboratorio: {
    label: "No laboratório",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  aguardando_retorno: {
    label: "Aguardando retorno",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  pronta_retirada: {
    label: "Pronta",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  entregue: {
    label: "Entregue",
    className: "bg-primary/[0.10] text-primary border-primary/20",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const pagamentoMeta = {
  pendente: {
    label: "Pendente",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  parcial: {
    label: "Parcial",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  pago: {
    label: "Pago",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  estornado: {
    label: "Estornado",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatBRL(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(number) ? number : 0);
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

function isAtrasada(os) {
  if (!os?.prazo_entrega_combinado) return false;

  const finished = ["pronta_retirada", "entregue", "cancelada"].includes(
    os.status
  );

  if (finished) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prazo = new Date(`${os.prazo_entrega_combinado}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return today > prazo;
}

function mapOrdemToForm(os) {
  if (!os) return emptyOrdemServico;

  return {
    ...emptyOrdemServico,
    ...os,
    cliente_id: os.cliente_id || "",
    vendedor_id: os.vendedor_id || "",
    data_venda: toInputDate(os.data_venda),
    prazo_entrega_combinado: toInputDate(os.prazo_entrega_combinado),
    previsao_laboratorio: toInputDate(os.previsao_laboratorio),
    custo_armacao: moneyToInput(os.custo_armacao),
    custo_lentes: moneyToInput(os.custo_lentes),
    valor_armacao: moneyToInput(os.valor_armacao),
    valor_lentes: moneyToInput(os.valor_lentes),
    valor_servicos: moneyToInput(os.valor_servicos),
    valor_adicionais: moneyToInput(os.valor_adicionais),
    desconto_valor: moneyToInput(os.desconto_valor),
    valor_total: moneyToInput(os.valor_total),
    valor_entrada: moneyToInput(os.valor_entrada),
    valor_restante: moneyToInput(os.valor_restante),
    valor_parcela: moneyToInput(os.valor_parcela),
    quantidade_parcelas: os.quantidade_parcelas || "",
    desconto_percentual: os.desconto_percentual || "",
  };
}

function mapRelatedToForm(value, fallback) {
  if (!value) return fallback;

  return {
    ...fallback,
    ...value,
    custo: Object.prototype.hasOwnProperty.call(fallback, "custo")
      ? moneyToInput(value.custo)
      : value.custo,
    data_receita: toInputDate(value.data_receita),
    validade_receita: toInputDate(value.validade_receita),
    data_inicio_garantia: toInputDate(value.data_inicio_garantia),
    data_fim_garantia: toInputDate(value.data_fim_garantia),
  };
}

function getFormPayload(formData) {
  return {
    ...formData,
    custo_armacao: moneyToNumber(formData.custo_armacao),
    custo_lentes: moneyToNumber(formData.custo_lentes),
    valor_armacao: moneyToNumber(formData.valor_armacao),
    valor_lentes: moneyToNumber(formData.valor_lentes),
    valor_servicos: moneyToNumber(formData.valor_servicos),
    valor_adicionais: moneyToNumber(formData.valor_adicionais),
    desconto_valor: moneyToNumber(formData.desconto_valor),
    valor_total: moneyToNumber(formData.valor_total),
    valor_entrada: moneyToNumber(formData.valor_entrada),
    valor_restante: moneyToNumber(formData.valor_restante),
    valor_parcela: moneyToNumber(formData.valor_parcela),
    quantidade_parcelas: formData.quantidade_parcelas
      ? Number(formData.quantidade_parcelas)
      : null,
    desconto_percentual: formData.desconto_percentual
      ? Number(formData.desconto_percentual)
      : 0,
    data_venda: formData.data_venda || null,
    prazo_entrega_combinado: formData.prazo_entrega_combinado || null,
    previsao_laboratorio: formData.previsao_laboratorio || null,
    forma_pagamento: formData.forma_pagamento || null,
    desconto_tipo: formData.desconto_tipo || null,
  };
}

function getRelatedPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload || {}).map(([key, value]) => [
      key,
      key === "custo" ? moneyToNumber(value) : value === "" ? null : value,
    ])
  );
}

function getCatalogoArmacaoLabel(item) {
  return [
    item?.marca,
    item?.modelo,
    item?.cor,
    item?.codigo_interno || item?.referencia,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getCatalogoLenteLabel(item) {
  return [item?.marca, item?.linha, item?.tipo_lente, item?.material]
    .filter(Boolean)
    .join(" • ");
}

/* ==========================================================================
   BADGES
   ========================================================================== */

export function OSStatusBadge({ status, atrasada = false }) {
  if (atrasada) {
    return (
      <Badge className="rounded-full border border-red-200 bg-red-100 px-3 py-1 font-black text-red-700">
        <AlertTriangle className="mr-1 size-3.5" />
        Atrasada
      </Badge>
    );
  }

  const meta = statusMeta[status] || statusMeta.cadastrada;

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

export function PagamentoStatusBadge({ status }) {
  const meta = pagamentoMeta[status] || pagamentoMeta.pendente;

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

/* ==========================================================================
   KPIS
   ========================================================================== */

export function OrdensServicoKpis({ ordensServico = [] }) {
  const now = new Date();

  const totalMes = ordensServico
    .filter((os) => {
      if (!os.data_venda) return false;

      const date = new Date(`${os.data_venda}T00:00:00`);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, os) => sum + Number(os.valor_total || 0), 0);

  const abertas = ordensServico.filter(
    (os) => !["entregue", "cancelada"].includes(os.status)
  ).length;

  const atrasadas = ordensServico.filter(isAtrasada).length;

  const prontas = ordensServico.filter(
    (os) => os.status === "pronta_retirada"
  ).length;

  const kpis = [
    {
      title: "Vendas no mês",
      value: formatBRL(totalMes),
      meta: "Somatório das OS do período",
      icon: CircleDollarSign,
    },
    {
      title: "OS abertas",
      value: abertas,
      meta: "Ainda em andamento",
      icon: Clock3,
    },
    {
      title: "Atrasadas",
      value: atrasadas,
      meta: "Precisam de atenção",
      icon: AlertTriangle,
    },
    {
      title: "Prontas",
      value: prontas,
      meta: "Aguardando retirada",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

export function OrdensServicoFilters({
  filters,
  onChangeFilters,
  onClearFilters,
  vendedores = [],
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
                placeholder="Pesquisar por OS, cliente, telefone, vendedor, laboratório..."
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
            {totalResults} OS encontrada{totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-5">
            <FieldBlock label="Status">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {osStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="atrasadas">Atrasadas</SelectItem>
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Pagamento">
              <Select
                value={filters.statusPagamento}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, statusPagamento: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {pagamentoStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Vendedor">
              <Select
                value={filters.vendedorId}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, vendedorId: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome_exibicao || vendedor.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Venda de">
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    dataInicio: event.target.value,
                  })
                }
                className="h-12 rounded-2xl border-border bg-background"
              />
            </FieldBlock>

            <FieldBlock label="Venda até">
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    dataFim: event.target.value,
                  })
                }
                className="h-12 rounded-2xl border-border bg-background"
              />
            </FieldBlock>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   SEARCH SELECT SIMPLES
   ========================================================================== */

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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-dark-title">{label}</p>
        {action}
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-background px-4 text-left text-sm font-semibold transition ${
            error ? "border-red-300" : "border-border"
          } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/40"}`}
        >
          <span className={selected ? "truncate text-dark-title" : "truncate text-muted-foreground"}>
            {selected ? getOptionLabel(selected) : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {open ? (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_28px_90px_-48px_rgba(15,23,42,0.55)]">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 rounded-2xl border-border bg-background pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
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
                    className={`w-full rounded-2xl px-3 py-3 text-left transition hover:bg-primary/[0.06] ${
                      item.value === value ? "bg-primary/[0.08]" : ""
                    }`}
                  >
                    <p className="truncate text-sm font-black text-dark-title">
                      {getOptionLabel(item)}
                    </p>

                    {getOptionDescription?.(item) ? (
                      <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
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

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   TABELA
   ========================================================================== */

export function OrdensServicoTable({
  ordensServico = [],
  clientesById,
  vendedoresById,
  onQuickUpdate,
  onEdit,
  onDelete,
  canDelete = false,
  isUpdatingId = "",
}) {
  const [paymentInputs, setPaymentInputs] = useState({});

  function updatePaymentInput(osId, value) {
    setPaymentInputs((current) => ({
      ...current,
      [osId]: formatBRLInput(value),
    }));
  }

  function buildPaymentPatch(os, amount) {
    const valorTotal = moneyToNumber(os.valor_total);
    const entradaAtual = moneyToNumber(os.valor_entrada);
    const restanteAtual = moneyToNumber(os.valor_restante);
    const pagamento = Math.max(moneyToNumber(amount), 0);
    const valorPago = Math.min(pagamento, restanteAtual);
    const proximaEntrada = Math.min(entradaAtual + valorPago, valorTotal);
    const proximoRestante = Math.max(restanteAtual - valorPago, 0);

    return {
      valor_entrada: proximaEntrada,
      valor_restante: proximoRestante,
      status_pagamento:
        proximoRestante <= 0 && valorTotal > 0
          ? "pago"
          : proximaEntrada > 0
            ? "parcial"
            : "pendente",
    };
  }

  function handlePayRemaining(os) {
    const restante = moneyToNumber(os.valor_restante);
    if (restante <= 0) return;

    onQuickUpdate(os, buildPaymentPatch(os, restante));
  }

  function handlePayAmount(os) {
    const value = paymentInputs[os.id] || "R$ 0,00";
    const amount = moneyToNumber(value);
    if (amount <= 0) return;

    onQuickUpdate(os, buildPaymentPatch(os, amount));
    setPaymentInputs((current) => ({ ...current, [os.id]: "R$ 0,00" }));
  }

  return (
    <section className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/70 text-left">
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                OS
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Cliente
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Financeiro
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Vendedor
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Datas
              </th>
              <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {ordensServico.map((os) => {
              const atrasada = isAtrasada(os);
              const isUpdating = isUpdatingId === os.id;

              return (
                <tr
                  key={os.id}
                  className="border-b border-border/80 transition hover:bg-primary/[0.025]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
                        <ReceiptText className="size-5" />
                      </div>

                      <div>
                        <Link
                          href={`/admin/ordens-servico/${os.id}`}
                          className="font-black tracking-[-0.03em] text-dark-title hover:text-primary"
                        >
                          {os.numero_os || "OS sem número"}
                        </Link>

                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {os.tipo_os || "venda"}
                        </p>

                        {atrasada ? (
                          <p className="mt-2 text-xs font-black text-red-600">
                            Prazo estourou
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="max-w-[260px] truncate text-sm font-black text-dark-title">
                      {getClienteName(clientesById, os.cliente_id)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Total: {formatBRL(os.valor_total)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <OSStatusBadge status={os.status} atrasada={atrasada} />

                      <Select
                        value={os.status || "cadastrada"}
                        disabled={isUpdating}
                        onValueChange={(value) =>
                          onQuickUpdate(os, { status: value })
                        }
                      >
                        <SelectTrigger className="h-10 w-[210px] rounded-full border-border bg-background text-xs font-black">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {osStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                      <div className="space-y-3">
                        <PagamentoStatusBadge status={os.status_pagamento} />

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating || moneyToNumber(os.valor_restante) <= 0}
                            onClick={() => handlePayRemaining(os)}
                            className="h-9 rounded-full px-3 text-xs font-black"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Quitou
                          </Button>

                          <Input
                            value={paymentInputs[os.id] || ""}
                            disabled={isUpdating}
                            onChange={(event) =>
                              updatePaymentInput(os.id, event.target.value)
                            }
                            placeholder="Pagou R$"
                            className="h-9 w-[118px] rounded-full border-border bg-background px-3 text-xs font-black"
                          />

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handlePayAmount(os)}
                            className="h-9 rounded-full px-3 text-xs font-black"
                          >
                            <CircleDollarSign className="size-3.5" />
                            Lançar
                          </Button>

                          {isUpdating ? (
                            <Loader2 className="size-4 animate-spin text-primary" />
                        ) : null}
                      </div>

                      <p className="text-xs font-semibold text-muted-foreground">
                        Entrada {formatBRL(os.valor_entrada)} • Resta{" "}
                        {formatBRL(os.valor_restante)}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="max-w-[180px] truncate text-sm font-black text-dark-title">
                      {getVendedorName(vendedoresById, os.vendedor_id)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Comissão est.: {formatBRL(os.comissao_valor_estimado)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1 text-xs font-semibold text-muted-foreground">
                      <p>
                        Venda:{" "}
                        <span className="font-black text-dark-title">
                          {formatDateBR(os.data_venda)}
                        </span>
                      </p>

                      <p>
                        Prazo:{" "}
                        <span className={atrasada ? "font-black text-red-600" : "font-black text-dark-title"}>
                          {formatDateBR(os.prazo_entrega_combinado)}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full font-black"
                      >
                        <Link href={`/admin/ordens-servico/${os.id}`}>
                          <Eye className="size-4" />
                          Abrir
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(os)}
                        className="rounded-full font-black"
                      >
                        <PencilLine className="size-4" />
                        Editar
                      </Button>

                      {canDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(os)}
                          className="rounded-full font-black"
                        >
                          <Trash2 className="size-4" />
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
    </section>
  );
}

/* ==========================================================================
   EMPTY
   ========================================================================== */

export function OrdensServicoEmptyState({ hasFilters = false }) {
  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <FileText className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {hasFilters ? "Nenhuma OS bateu com os filtros." : "Nenhuma OS cadastrada."}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A busca ficou precisa demais. Limpe ou ajuste os filtros para reencontrar as ordens."
          : "Quando a primeira venda nascer no balcão, ela aparece aqui com status, pagamento e prazo no radar."}
      </p>
    </div>
  );
}

/* ==========================================================================
   FORM
   ========================================================================== */

export function OrdemServicoFormDialog({
  open,
  onOpenChange,
  ordemServico,
  receita,
  armacao,
  lente,
  clientes = [],
  vendedores = [],
  catalogoArmacoes = [],
  catalogoLentes = [],
  onSubmit,
  isSaving = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <OrdemServicoFormContent
          key={ordemServico?.id || "new"}
          ordemServico={ordemServico}
          receita={receita}
          armacao={armacao}
          lente={lente}
          clientes={clientes}
          vendedores={vendedores}
          catalogoArmacoes={catalogoArmacoes}
          catalogoLentes={catalogoLentes}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function OrdemServicoFormContent({
  ordemServico,
  receita,
  armacao,
  lente,
  clientes,
  vendedores,
  catalogoArmacoes,
  catalogoLentes,
  onOpenChange,
  onSubmit,
  isSaving,
}) {
  const isEditing = Boolean(ordemServico?.id);

  const [formData, setFormData] = useState(() => mapOrdemToForm(ordemServico));
  const [clienteRapido, setClienteRapido] = useState(emptyClienteRapido);
  const [useClienteRapido, setUseClienteRapido] = useState(false);

  const [receitaData, setReceitaData] = useState(() =>
    mapRelatedToForm(receita, emptyReceita)
  );
  const [armacaoData, setArmacaoData] = useState(() =>
    mapRelatedToForm(armacao, emptyArmacao)
  );
  const [lenteData, setLenteData] = useState(() =>
    mapRelatedToForm(lente, emptyLente)
  );

  const [errors, setErrors] = useState({});

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        value: cliente.id,
        label: cliente.nome_completo,
        searchText: [
          cliente.nome_completo,
          cliente.nome_social,
          cliente.cpf,
          cliente.telefone_principal,
          cliente.telefone_secundario,
          cliente.email,
        ]
          .filter(Boolean)
          .join(" "),
        raw: cliente,
      })),
    [clientes]
  );

  const vendedorOptions = useMemo(
    () =>
      vendedores
        .filter((vendedor) => vendedor.status !== "inativo")
        .map((vendedor) => ({
          value: vendedor.id,
          label: vendedor.nome_exibicao || vendedor.nome_completo,
          searchText: [
            vendedor.nome_completo,
            vendedor.nome_exibicao,
            vendedor.cpf,
            vendedor.telefone,
            vendedor.email,
          ]
            .filter(Boolean)
            .join(" "),
          raw: vendedor,
        })),
    [vendedores]
  );

  const armacaoOptions = useMemo(
    () =>
      catalogoArmacoes.map((item) => ({
        value: item.id,
        label: getCatalogoArmacaoLabel(item),
        searchText: getCatalogoArmacaoLabel(item),
        raw: item,
      })),
    [catalogoArmacoes]
  );

  const lenteOptions = useMemo(
    () =>
      catalogoLentes.map((item) => ({
        value: item.id,
        label: getCatalogoLenteLabel(item),
        searchText: getCatalogoLenteLabel(item),
        raw: item,
      })),
    [catalogoLentes]
  );

  function updateForm(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  }

  function updateClienteRapido(field, value) {
    setClienteRapido((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[`cliente.${field}`]) {
      setErrors((current) => ({ ...current, [`cliente.${field}`]: "" }));
    }
  }

  function updateReceita(field, value) {
    setReceitaData((current) => ({ ...current, [field]: value }));
  }

  function updateArmacao(field, value) {
    const nextValue = field === "custo" ? formatBRLInput(value) : value;

    setArmacaoData((current) => ({ ...current, [field]: nextValue }));

    if (field === "custo") {
      setFormData((current) => ({ ...current, custo_armacao: nextValue }));
    }
  }

  function updateLente(field, value) {
    const nextValue = field === "custo" ? formatBRLInput(value) : value;

    setLenteData((current) => ({ ...current, [field]: nextValue }));

    if (field === "custo") {
      setFormData((current) => ({ ...current, custo_lentes: nextValue }));
    }
  }

  function applyArmacaoCatalogo(_, item) {
    const selected = item.raw;

    setArmacaoData((current) => ({
      ...current,
      marca: selected.marca || "",
      modelo: selected.modelo || "",
      referencia: selected.referencia || "",
      codigo_interno: selected.codigo_interno || "",
      codigo_barras: selected.codigo_barras || "",
      cor: selected.cor || "",
      material: selected.material || "",
      formato: selected.formato || "",
      tamanho_texto: selected.tamanho_texto || "",
      aro: selected.aro || "",
      ponte: selected.ponte || "",
      haste: selected.haste || "",
      largura_total: selected.largura_total || "",
      altura_lente: selected.altura_lente || "",
      tipo_armacao: selected.tipo_armacao || "",
      genero_indicado: selected.genero_indicado || "indefinido",
      custo: moneyToInput(selected.custo),
    }));

    setFormData((current) => ({
      ...current,
      custo_armacao: moneyToInput(selected.custo),
    }));
  }

  function applyLenteCatalogo(_, item) {
    const selected = item.raw;

    setLenteData((current) => ({
      ...current,
      tipo_lente: selected.tipo_lente || "",
      marca: selected.marca || "",
      linha: selected.linha || "",
      laboratorio: selected.laboratorio || "",
      material: selected.material || "",
      indice_refracao: selected.indice_refracao || "",
      tratamento_antirreflexo: selected.tratamento_antirreflexo || false,
      tratamento_filtro_azul: selected.tratamento_filtro_azul || false,
      tratamento_fotossensivel: selected.tratamento_fotossensivel || false,
      tratamento_polarizado: selected.tratamento_polarizado || false,
      tratamento_uv: selected.tratamento_uv || false,
      tratamento_risco: selected.tratamento_risco || false,
      coloracao: selected.coloracao || "",
      tonalidade: selected.tonalidade || "",
      curva_base: selected.curva_base || "",
      diametro: selected.diametro || "",
      garantia_meses: selected.garantia_meses || "",
      custo: moneyToInput(selected.custo),
    }));

    setFormData((current) => ({
      ...current,
      custo_lentes: moneyToInput(selected.custo),
    }));
  }

  function recalculateTotals(next = formData) {
    const valorArmacao = moneyToNumber(next.valor_armacao);
    const valorLentes = moneyToNumber(next.valor_lentes);
    const valorServicos = moneyToNumber(next.valor_servicos);
    const valorAdicionais = moneyToNumber(next.valor_adicionais);

    const bruto = valorArmacao + valorLentes + valorServicos + valorAdicionais;

    const desconto =
      next.desconto_tipo === "percentual"
        ? bruto * (Number(next.desconto_percentual || 0) / 100)
        : moneyToNumber(next.desconto_valor);

    const total = Math.max(bruto - desconto, 0);
    const entrada = moneyToNumber(next.valor_entrada);
    const restante = Math.max(total - entrada, 0);

    setFormData((current) => ({
      ...current,
      valor_total: moneyToInput(total),
      valor_restante: moneyToInput(restante),
      status_pagamento:
        total > 0 && restante <= 0
          ? "pago"
          : entrada > 0
            ? "parcial"
            : current.status_pagamento || "pendente",
    }));
  }

  function updateMoney(field, value, shouldRecalculate = true) {
    const formatted = formatBRLInput(value);

    setFormData((current) => {
      const next = { ...current, [field]: formatted };

      if (shouldRecalculate) {
        window.requestAnimationFrame(() => recalculateTotals(next));
      }

      return next;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!useClienteRapido && !formData.cliente_id) {
      nextErrors.cliente_id = "Selecione o cliente ou crie um novo.";
    }

    if (useClienteRapido) {
      if (!clienteRapido.nome_completo.trim()) {
        nextErrors["cliente.nome_completo"] = "Informe o nome do cliente.";
      }

      if (!clienteRapido.telefone_principal.trim()) {
        nextErrors["cliente.telefone_principal"] = "Informe o telefone.";
      }
    }

    if (!formData.vendedor_id) {
      nextErrors.vendedor_id = "Selecione o vendedor responsável.";
    }

    if (!formData.data_venda) {
      nextErrors.data_venda = "Informe a data da venda.";
    }

    if (!formData.prazo_entrega_combinado) {
      nextErrors.prazo_entrega_combinado = "Informe o prazo combinado.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const ordemPayload = getFormPayload(formData);

    if (useClienteRapido) {
      delete ordemPayload.cliente_id;
    }

    await onSubmit({
      ordemServico: {
        ...(ordemServico?.id ? { id: ordemServico.id } : {}),
        ...ordemPayload,
      },
      cliente: useClienteRapido ? clienteRapido : null,
      receita: getRelatedPayload(receitaData),
      armacao: getRelatedPayload(armacaoData),
      lente: getRelatedPayload(lenteData),
    });
  }

  return (
    <DialogContent className="flex max-h-[94vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-7xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar ordem de serviço" : "Nova ordem de serviço"}
        </DialogTitle>

        <DialogDescription className="text-sm font-medium text-muted-foreground">
          Formulário completo, dividido por blocos para ninguém se perder no balcão.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <FormSection
              icon={UserRoundPlus}
              title="Identificação"
              description="Cliente, vendedor, status e datas principais."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <SearchSelect
                  label="Cliente"
                  value={formData.cliente_id}
                  options={clienteOptions}
                  placeholder="Selecione um cliente"
                  searchPlaceholder="Buscar por nome, CPF, telefone..."
                  disabled={useClienteRapido || isEditing}
                  onChange={(value) => updateForm("cliente_id", value)}
                  getOptionLabel={(item) => item.label}
                  getOptionDescription={(item) =>
                    item.raw?.telefone_principal || item.raw?.cpf || "Sem contato"
                  }
                  error={errors.cliente_id}
                  action={
                    !isEditing ? (
                      <Button
                        type="button"
                        variant={useClienteRapido ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUseClienteRapido((current) => !current);
                          updateForm("cliente_id", "");
                        }}
                        className="h-8 rounded-full px-3 text-xs font-black"
                      >
                        <Plus className="size-3.5" />
                        {useClienteRapido ? "Usar existente" : "Criar cliente"}
                      </Button>
                    ) : null
                  }
                />

                <SearchSelect
                  label="Vendedor responsável"
                  value={formData.vendedor_id}
                  options={vendedorOptions}
                  placeholder="Selecione o vendedor"
                  searchPlaceholder="Buscar vendedor..."
                  disabled={isEditing}
                  onChange={(value) => updateForm("vendedor_id", value)}
                  getOptionLabel={(item) => item.label}
                  getOptionDescription={(item) =>
                    item.raw?.telefone || item.raw?.email || item.raw?.cargo
                  }
                  error={errors.vendedor_id}
                />
              </div>

              {useClienteRapido ? (
                <div className="rounded-[30px] border border-primary/20 bg-primary/[0.035] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <UserRoundPlus className="size-5 text-primary" />
                    <h4 className="text-base font-black tracking-[-0.035em] text-dark-title">
                      Criar cliente nesta OS
                    </h4>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InputField
                      label="Nome completo"
                      value={clienteRapido.nome_completo}
                      onChange={(value) =>
                        updateClienteRapido("nome_completo", value)
                      }
                      error={errors["cliente.nome_completo"]}
                    />

                    <InputField
                      label="WhatsApp / telefone"
                      value={clienteRapido.telefone_principal}
                      onChange={(value) =>
                        updateClienteRapido(
                          "telefone_principal",
                          formatPhoneInput(value)
                        )
                      }
                      error={errors["cliente.telefone_principal"]}
                    />

                    <InputField
                      label="CPF"
                      value={clienteRapido.cpf}
                      onChange={(value) =>
                        updateClienteRapido("cpf", formatCPFInput(value))
                      }
                    />

                    <InputField
                      label="E-mail"
                      value={clienteRapido.email}
                      onChange={(value) => updateClienteRapido("email", value)}
                    />

                    <InputField
                      label="CEP"
                      value={clienteRapido.cep}
                      onChange={(value) =>
                        updateClienteRapido("cep", formatCEPInput(value))
                      }
                    />

                    <InputField
                      label="Rua"
                      value={clienteRapido.rua}
                      onChange={(value) => updateClienteRapido("rua", value)}
                    />

                    <InputField
                      label="Número"
                      value={clienteRapido.numero}
                      onChange={(value) => updateClienteRapido("numero", value)}
                    />

                    <InputField
                      label="Bairro"
                      value={clienteRapido.bairro}
                      onChange={(value) => updateClienteRapido("bairro", value)}
                    />

                    <InputField
                      label="Cidade"
                      value={clienteRapido.cidade}
                      onChange={(value) => updateClienteRapido("cidade", value)}
                    />

                    <InputField
                      label="Estado"
                      value={clienteRapido.estado}
                      onChange={(value) => updateClienteRapido("estado", value)}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SelectField
                  label="Tipo"
                  value={formData.tipo_os}
                  onChange={(value) => updateForm("tipo_os", value)}
                  options={tipoOsOptions}
                />

                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(value) => updateForm("status", value)}
                  options={osStatusOptions}
                />

                <InputField
                  label="Data da venda"
                  type="date"
                  value={formData.data_venda}
                  onChange={(value) => updateForm("data_venda", value)}
                  error={errors.data_venda}
                />

                <InputField
                  label="Prazo combinado"
                  type="date"
                  value={formData.prazo_entrega_combinado}
                  onChange={(value) =>
                    updateForm("prazo_entrega_combinado", value)
                  }
                  error={errors.prazo_entrega_combinado}
                />

                <InputField
                  label="Número lab."
                  value={formData.pedido_laboratorio_numero}
                  onChange={(value) =>
                    updateForm("pedido_laboratorio_numero", value)
                  }
                />

                <InputField
                  label="Laboratório"
                  value={formData.laboratorio_nome}
                  onChange={(value) => updateForm("laboratorio_nome", value)}
                />

                <InputField
                  label="Previsão laboratório"
                  type="date"
                  value={formData.previsao_laboratorio}
                  onChange={(value) => updateForm("previsao_laboratorio", value)}
                />
              </div>
            </FormSection>

            <FormSection
              icon={ReceiptText}
              title="Receita"
              description="Dados ópticos e informações do médico."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Data da receita"
                  type="date"
                  value={receitaData.data_receita}
                  onChange={(value) => updateReceita("data_receita", value)}
                />

                <InputField
                  label="Médico"
                  value={receitaData.medico_nome}
                  onChange={(value) => updateReceita("medico_nome", value)}
                />

                <InputField
                  label="CRM"
                  value={receitaData.medico_crm}
                  onChange={(value) => updateReceita("medico_crm", value)}
                />

                <SelectField
                  label="Tipo receita"
                  value={receitaData.tipo_receita}
                  onChange={(value) => updateReceita("tipo_receita", value)}
                  options={tipoReceitaOptions}
                  allowEmpty
                />

                <InputField
                  label="Validade"
                  type="date"
                  value={receitaData.validade_receita}
                  onChange={(value) => updateReceita("validade_receita", value)}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <OpticalEyeBlock
                  title="Olho direito"
                  prefix="od"
                  data={receitaData}
                  onChange={updateReceita}
                />

                <OpticalEyeBlock
                  title="Olho esquerdo"
                  prefix="oe"
                  data={receitaData}
                  onChange={updateReceita}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="DNP OD"
                  value={receitaData.dnp_od}
                  onChange={(value) => updateReceita("dnp_od", value)}
                />

                <InputField
                  label="DNP OE"
                  value={receitaData.dnp_oe}
                  onChange={(value) => updateReceita("dnp_oe", value)}
                />

                <InputField
                  label="DP total"
                  value={receitaData.dp_total}
                  onChange={(value) => updateReceita("dp_total", value)}
                />

                <InputField
                  label="Altura OD"
                  value={receitaData.altura_od}
                  onChange={(value) => updateReceita("altura_od", value)}
                />

                <InputField
                  label="Altura OE"
                  value={receitaData.altura_oe}
                  onChange={(value) => updateReceita("altura_oe", value)}
                />
              </div>

              <TextareaField
                label="Observações da receita"
                value={receitaData.observacoes}
                onChange={(value) => updateReceita("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Glasses}
              title="Armação"
              description="Selecione do catálogo ou preencha manualmente."
            >
              <SearchSelect
                label="Buscar armação no catálogo"
                value=""
                options={armacaoOptions}
                placeholder="Pesquisar e preencher pela armação salva"
                searchPlaceholder="Marca, modelo, cor, código..."
                onChange={applyArmacaoCatalogo}
                getOptionLabel={(item) => item.label}
                getOptionDescription={(item) =>
                  item.raw?.ultimo_uso_em
                    ? `Último uso: ${formatDateBR(item.raw.ultimo_uso_em)}`
                    : "Catálogo da conta"
                }
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Marca"
                  value={armacaoData.marca}
                  onChange={(value) => updateArmacao("marca", value)}
                />

                <InputField
                  label="Modelo"
                  value={armacaoData.modelo}
                  onChange={(value) => updateArmacao("modelo", value)}
                />

                <InputField
                  label="Cor"
                  value={armacaoData.cor}
                  onChange={(value) => updateArmacao("cor", value)}
                />

                <InputField
                  label="Código interno"
                  value={armacaoData.codigo_interno}
                  onChange={(value) => updateArmacao("codigo_interno", value)}
                />

                <SelectField
                  label="Tipo"
                  value={armacaoData.tipo_armacao}
                  onChange={(value) => updateArmacao("tipo_armacao", value)}
                  options={tipoArmacaoOptions}
                  allowEmpty
                />

                <InputField
                  label="Tamanho"
                  value={armacaoData.tamanho_texto}
                  onChange={(value) => updateArmacao("tamanho_texto", value)}
                />

                <InputField
                  label="Aro"
                  value={armacaoData.aro}
                  onChange={(value) => updateArmacao("aro", value)}
                />

                <InputField
                  label="Ponte"
                  value={armacaoData.ponte}
                  onChange={(value) => updateArmacao("ponte", value)}
                />

                <InputField
                  label="Haste"
                  value={armacaoData.haste}
                  onChange={(value) => updateArmacao("haste", value)}
                />

                <InputField
                  label="Custo"
                  value={armacaoData.custo}
                  onChange={(value) => updateArmacao("custo", value)}
                />
              </div>

              <TextareaField
                label="Observações da armação"
                value={armacaoData.observacoes}
                onChange={(value) => updateArmacao("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Glasses}
              title="Lente"
              description="Catálogo para acelerar o preenchimento e evitar retrabalho."
            >
              <SearchSelect
                label="Buscar lente no catálogo"
                value=""
                options={lenteOptions}
                placeholder="Pesquisar e preencher pela lente salva"
                searchPlaceholder="Marca, linha, tipo, material..."
                onChange={applyLenteCatalogo}
                getOptionLabel={(item) => item.label}
                getOptionDescription={(item) =>
                  item.raw?.laboratorio || "Catálogo da conta"
                }
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SelectField
                  label="Tipo de lente"
                  value={lenteData.tipo_lente}
                  onChange={(value) => updateLente("tipo_lente", value)}
                  options={tipoLenteOptions}
                  allowEmpty
                />

                <InputField
                  label="Marca"
                  value={lenteData.marca}
                  onChange={(value) => updateLente("marca", value)}
                />

                <InputField
                  label="Linha"
                  value={lenteData.linha}
                  onChange={(value) => updateLente("linha", value)}
                />

                <InputField
                  label="Laboratório"
                  value={lenteData.laboratorio}
                  onChange={(value) => updateLente("laboratorio", value)}
                />

                <SelectField
                  label="Material"
                  value={lenteData.material}
                  onChange={(value) => updateLente("material", value)}
                  options={lenteMaterialOptions}
                  allowEmpty
                />

                <InputField
                  label="Índice"
                  value={lenteData.indice_refracao}
                  onChange={(value) => updateLente("indice_refracao", value)}
                />

                <InputField
                  label="Coloração"
                  value={lenteData.coloracao}
                  onChange={(value) => updateLente("coloracao", value)}
                />

                <InputField
                  label="Tonalidade"
                  value={lenteData.tonalidade}
                  onChange={(value) => updateLente("tonalidade", value)}
                />

                <InputField
                  label="Diâmetro"
                  value={lenteData.diametro}
                  onChange={(value) => updateLente("diametro", value)}
                />

                <InputField
                  label="Garantia meses"
                  value={lenteData.garantia_meses}
                  onChange={(value) => updateLente("garantia_meses", value)}
                />

                <InputField
                  label="Custo da lente"
                  value={lenteData.custo}
                  onChange={(value) => updateLente("custo", value)}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <CheckField
                  label="Antirreflexo"
                  checked={lenteData.tratamento_antirreflexo}
                  onChange={(value) =>
                    updateLente("tratamento_antirreflexo", value)
                  }
                />

                <CheckField
                  label="Filtro azul"
                  checked={lenteData.tratamento_filtro_azul}
                  onChange={(value) =>
                    updateLente("tratamento_filtro_azul", value)
                  }
                />

                <CheckField
                  label="Fotossensível"
                  checked={lenteData.tratamento_fotossensivel}
                  onChange={(value) =>
                    updateLente("tratamento_fotossensivel", value)
                  }
                />

                <CheckField
                  label="Polarizada"
                  checked={lenteData.tratamento_polarizado}
                  onChange={(value) =>
                    updateLente("tratamento_polarizado", value)
                  }
                />

                <CheckField
                  label="UV"
                  checked={lenteData.tratamento_uv}
                  onChange={(value) => updateLente("tratamento_uv", value)}
                />

                <CheckField
                  label="Resistente a risco"
                  checked={lenteData.tratamento_risco}
                  onChange={(value) => updateLente("tratamento_risco", value)}
                />
              </div>

              <TextareaField
                label="Observações da lente"
                value={lenteData.observacoes}
                onChange={(value) => updateLente("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Banknote}
              title="Financeiro"
              description="Entrada, restante e status financeiro rápido."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Valor armação"
                  value={formData.valor_armacao}
                  onChange={(value) => updateMoney("valor_armacao", value)}
                />

                <InputField
                  label="Valor lentes"
                  value={formData.valor_lentes}
                  onChange={(value) => updateMoney("valor_lentes", value)}
                />

                <InputField
                  label="Serviços"
                  value={formData.valor_servicos}
                  onChange={(value) => updateMoney("valor_servicos", value)}
                />

                <InputField
                  label="Adicionais"
                  value={formData.valor_adicionais}
                  onChange={(value) => updateMoney("valor_adicionais", value)}
                />

                <SelectField
                  label="Desconto"
                  value={formData.desconto_tipo}
                  onChange={(value) => {
                    updateForm("desconto_tipo", value);
                    window.requestAnimationFrame(() =>
                      recalculateTotals({ ...formData, desconto_tipo: value })
                    );
                  }}
                  options={[
                    { value: "valor", label: "Valor" },
                    { value: "percentual", label: "Percentual" },
                  ]}
                />

                {formData.desconto_tipo === "percentual" ? (
                  <InputField
                    label="Desconto %"
                    value={formData.desconto_percentual}
                    onChange={(value) => {
                      updateForm("desconto_percentual", value);
                      window.requestAnimationFrame(() =>
                        recalculateTotals({
                          ...formData,
                          desconto_percentual: value,
                        })
                      );
                    }}
                  />
                ) : (
                  <InputField
                    label="Desconto R$"
                    value={formData.desconto_valor}
                    onChange={(value) => updateMoney("desconto_valor", value)}
                  />
                )}

                <InputField
                  label="Total"
                  value={formData.valor_total}
                  onChange={(value) => updateMoney("valor_total", value, false)}
                />

                <InputField
                  label="Entrada"
                  value={formData.valor_entrada}
                  onChange={(value) => updateMoney("valor_entrada", value)}
                />

                <InputField
                  label="Restante"
                  value={formData.valor_restante}
                  onChange={(value) => updateMoney("valor_restante", value, false)}
                />

                <SelectField
                  label="Status pagamento"
                  value={formData.status_pagamento}
                  onChange={(value) => updateForm("status_pagamento", value)}
                  options={pagamentoStatusOptions}
                />

                <SelectField
                  label="Forma"
                  value={formData.forma_pagamento}
                  onChange={(value) => updateForm("forma_pagamento", value)}
                  options={formaPagamentoOptions}
                  allowEmpty
                />

                <InputField
                  label="Parcelas"
                  value={formData.quantidade_parcelas}
                  onChange={(value) => updateForm("quantidade_parcelas", value)}
                />

                <InputField
                  label="Valor parcela"
                  value={formData.valor_parcela}
                  onChange={(value) => updateMoney("valor_parcela", value, false)}
                />
              </div>
            </FormSection>

            <FormSection
              icon={FileText}
              title="Observações"
              description="Informações visíveis ao cliente e anotações internas."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <TextareaField
                  label="Observações para o cliente"
                  value={formData.observacoes_cliente}
                  onChange={(value) => updateForm("observacoes_cliente", value)}
                />

                <TextareaField
                  label="Observações internas"
                  value={formData.observacoes_internas}
                  onChange={(value) => updateForm("observacoes_internas", value)}
                />
              </div>
            </FormSection>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-full px-6 font-black"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 rounded-full px-7 font-black"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Criar OS"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ==========================================================================
   BLOQUINHOS DE FORM
   ========================================================================== */

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[34px] border border-border bg-background/55 p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
          <Icon className="size-5" />
        </div>

        <div>
          <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
            {title}
          </h3>

          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-black text-dark-title">{label}</p>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", error }) {
  return (
    <FieldBlock label={label}>
      <Input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 rounded-2xl border-border bg-background ${
          error ? "border-red-300" : ""
        }`}
      />

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </FieldBlock>
  );
}

function TextareaField({ label, value, onChange }) {
  return (
    <FieldBlock label={label}>
      <Textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 rounded-2xl border-border bg-background"
      />
    </FieldBlock>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
  allowEmpty = false,
}) {
  const safeValue = value || (allowEmpty ? "__empty" : options[0]?.value || "");

  return (
    <FieldBlock label={label}>
      <Select
        value={safeValue}
        onValueChange={(nextValue) =>
          onChange(nextValue === "__empty" ? "" : nextValue)
        }
      >
        <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty">Não informado</SelectItem> : null}

          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldBlock>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-2xl border px-4 text-sm font-black transition ${
        checked
          ? "border-primary/30 bg-primary/[0.08] text-primary"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {label}
      <span
        className={`grid size-5 place-items-center rounded-full border ${
          checked ? "border-primary bg-primary text-white" : "border-border"
        }`}
      >
        {checked ? <CheckCircle2 className="size-3.5" /> : null}
      </span>
    </button>
  );
}

function OpticalEyeBlock({ title, prefix, data, onChange }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-4">
      <h4 className="mb-4 text-base font-black tracking-[-0.035em] text-dark-title">
        {title}
      </h4>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Esférico"
          value={data[`${prefix}_esferico`]}
          onChange={(value) => onChange(`${prefix}_esferico`, value)}
        />

        <InputField
          label="Cilíndrico"
          value={data[`${prefix}_cilindrico`]}
          onChange={(value) => onChange(`${prefix}_cilindrico`, value)}
        />

        <InputField
          label="Eixo"
          value={data[`${prefix}_eixo`]}
          onChange={(value) => onChange(`${prefix}_eixo`, value)}
        />

        <InputField
          label="Adição"
          value={data[`${prefix}_adicao`]}
          onChange={(value) => onChange(`${prefix}_adicao`, value)}
        />

        <InputField
          label="Prisma"
          value={data[`${prefix}_prisma`]}
          onChange={(value) => onChange(`${prefix}_prisma`, value)}
        />

        <InputField
          label="Base"
          value={data[`${prefix}_base`]}
          onChange={(value) => onChange(`${prefix}_base`, value)}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

export function OrdensServicoPagination({
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
          Mostrando {start} a {end} de {totalItems} OS
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">Ver</span>

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
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-11 rounded-full px-4 font-black"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        <span className="rounded-full bg-primary/[0.08] px-4 py-2 text-sm font-black text-primary">
          {page} / {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-11 rounded-full px-4 font-black"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================
   CONFIRMAÇÃO DELETE
   ========================================================================== */

export function ConfirmDeleteOrdemServicoDialog({
  open,
  onOpenChange,
  ordemServico,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[34px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Excluir ordem de serviço?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Você está prestes a excluir{" "}
            <strong className="font-black text-dark-title">
              {ordemServico?.numero_os || "esta OS"}
            </strong>
            . Isso remove o registro principal e seus vínculos. Use só quando for erro
            real de cadastro.
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
