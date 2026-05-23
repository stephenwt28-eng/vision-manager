"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Download,
  Filter,
  Hourglass,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "ano_atual", label: "Ano atual" },
  { value: "todos", label: "Todo o histórico" },
  { value: "personalizado", label: "Personalizado" },
];

const STATUS_LABELS = {
  cadastrada: "Cadastrada",
  enviada_laboratorio: "Enviada ao laboratório",
  aguardando_retorno: "Aguardando retorno",
  pronta_retirada: "Pronta para retirada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const STATUS_STYLES = {
  cadastrada: "bg-violet-100 text-violet-700",
  enviada_laboratorio: "bg-indigo-100 text-indigo-700",
  aguardando_retorno: "bg-amber-100 text-amber-700",
  pronta_retirada: "bg-emerald-100 text-emerald-700",
  entregue: "bg-green-100 text-green-700",
  cancelada: "bg-slate-100 text-slate-600",
};

const TIPO_OS_LABELS = {
  venda: "Venda",
  orcamento: "Orçamento",
  garantia: "Garantia",
  ajuste: "Ajuste",
  troca: "Troca",
};

const STATUS_PAGAMENTO_LABELS = {
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
  estornado: "Estornado",
  cancelado: "Cancelado",
};

const FORMA_PAGAMENTO_LABELS = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
  boleto: "Boleto",
  transferencia: "Transferência",
  crediario: "Crediário",
  outro: "Outro",
};

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPercent(value = 0) {
  return `${Number(value || 0).toFixed(1).replace(".", ",")}%`;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function parseDate(value) {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function dateToInputValue(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function getPeriodRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "mes_atual") {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    };
  }

  if (period === "mes_anterior") {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0),
    };
  }

  if (period === "ano_atual") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
  }

  return {
    start: null,
    end: null,
  };
}

function sumBy(items, getter) {
  return items.reduce((total, item) => {
    return total + (Number(getter(item)) || 0);
  }, 0);
}

function isCanceled(order) {
  return order?.status === "cancelada";
}

function isDelivered(order) {
  return order?.status === "entregue";
}

function isOpen(order) {
  return !["entregue", "cancelada"].includes(order?.status);
}

function isDelayed(order) {
  if (!order?.prazo_entrega) return false;

  const deadline = parseDate(order.prazo_entrega);

  if (!deadline) return false;

  const today = startOfDay(new Date());
  const deadlineDay = startOfDay(deadline);

  return (
    deadlineDay < today &&
    !["pronta_retirada", "entregue", "cancelada"].includes(order.status)
  );
}

function average(values = []) {
  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

function daysBetween(startValue, endValue) {
  const start = parseDate(startValue);
  const end = parseDate(endValue);

  if (!start || !end) return null;

  const diff = end.getTime() - start.getTime();

  return diff / (1000 * 60 * 60 * 24);
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "Sem status";
}

function getTipoOSLabel(tipo) {
  return TIPO_OS_LABELS[tipo] || tipo || "Sem tipo";
}

function getStatusPagamentoLabel(status) {
  return STATUS_PAGAMENTO_LABELS[status] || status || "Sem status";
}

function getFormaPagamentoLabel(forma) {
  return FORMA_PAGAMENTO_LABELS[forma] || forma || "Não informado";
}

function escapeCsv(value) {
  const safeValue = value === null || value === undefined ? "" : String(value);

  return `"${safeValue.replaceAll('"', '""')}"`;
}

function exportRowsToCsv(filename, headers, rows) {
  const csvContent = [
    headers.map(escapeCsv).join(";"),
    ...rows.map((row) => row.map(escapeCsv).join(";")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function MetricCard({ title, value, meta, icon: Icon }) {
  return (
    <div className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
            {value}
          </p>
        </div>

        <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
          <Icon className="size-6" />
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-primary">{meta}</p>
    </div>
  );
}

function SectionCard({ title, description, children, action }) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {action}
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-background/65 px-5 py-8 text-center">
      <p className="font-black tracking-[-0.03em] text-dark-title">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="h-52 animate-pulse rounded-[40px] border border-border bg-card" />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[34px] border border-border bg-card"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[38px] border border-border bg-card" />
        <div className="h-96 animate-pulse rounded-[38px] border border-border bg-card" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function HorizontalBar({ label, value, total, meta }) {
  const percent = total > 0 ? Math.max((value / total) * 100, 4) : 0;

  return (
    <div className="rounded-[24px] border border-border bg-background/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-dark-title">{label}</p>
          {meta ? (
            <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          ) : null}
        </div>

        <p className="text-sm font-black text-primary">{formatCurrency(value)}</p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminRelatoriosComponents() {
  const [data, setData] = useState({
    conta: null,
    configuracoes_conta: null,
    clientes: [],
    vendedores: [],
    ordens_servico: [],
    receitas: [],
    armacoes: [],
    lentes: [],
    anexos: [],
    historico_status_os: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialRange = getPeriodRange("mes_atual");

  const [period, setPeriod] = useState("mes_atual");
  const [startDate, setStartDate] = useState(
    dateToInputValue(initialRange.start)
  );
  const [endDate, setEndDate] = useState(dateToInputValue(initialRange.end));

  const [search, setSearch] = useState("");
  const [vendorId, setVendorId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [tipoOS, setTipoOS] = useState("todos");
  const [statusPagamento, setStatusPagamento] = useState("todos");
  const [formaPagamento, setFormaPagamento] = useState("todos");
  const [onlyDelayed, setOnlyDelayed] = useState(false);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/relatorios", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao carregar relatórios.");
      }

      setData(payload?.data || {});
    } catch (err) {
      setError(err.message || "Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadReports());
  }, []);

  function handlePeriodChange(value) {
    setPeriod(value);

    if (value === "personalizado") return;

    const range = getPeriodRange(value);

    setStartDate(dateToInputValue(range.start));
    setEndDate(dateToInputValue(range.end));
  }

  function handleStartDateChange(value) {
    setStartDate(value);
    setPeriod("personalizado");
  }

  function handleEndDateChange(value) {
    setEndDate(value);
    setPeriod("personalizado");
  }

  function clearFilters() {
    const range = getPeriodRange("mes_atual");

    setPeriod("mes_atual");
    setStartDate(dateToInputValue(range.start));
    setEndDate(dateToInputValue(range.end));
    setSearch("");
    setVendorId("todos");
    setStatus("todos");
    setTipoOS("todos");
    setStatusPagamento("todos");
    setFormaPagamento("todos");
    setOnlyDelayed(false);
  }

  const clientesById = useMemo(() => {
    return new Map((data.clientes || []).map((cliente) => [cliente.id, cliente]));
  }, [data.clientes]);

  const vendedoresById = useMemo(() => {
    return new Map(
      (data.vendedores || []).map((vendedor) => [vendedor.id, vendedor])
    );
  }, [data.vendedores]);

  const lentesByOsId = useMemo(() => {
    const map = new Map();

    (data.lentes || []).forEach((lente) => {
      if (!map.has(lente.os_id)) {
        map.set(lente.os_id, []);
      }

      map.get(lente.os_id).push(lente);
    });

    return map;
  }, [data.lentes]);

  const armacoesByOsId = useMemo(() => {
    const map = new Map();

    (data.armacoes || []).forEach((armacao) => {
      if (!map.has(armacao.os_id)) {
        map.set(armacao.os_id, []);
      }

      map.get(armacao.os_id).push(armacao);
    });

    return map;
  }, [data.armacoes]);

  const enrichedOrders = useMemo(() => {
    return (data.ordens_servico || []).map((order) => {
      const cliente = clientesById.get(order.cliente_id) || null;
      const vendedor = vendedoresById.get(order.vendedor_id) || null;
      const lentes = lentesByOsId.get(order.id) || [];
      const armacoes = armacoesByOsId.get(order.id) || [];

      return {
        ...order,
        cliente,
        vendedor,
        lentes,
        armacoes,
        atrasada: isDelayed(order),
      };
    });
  }, [data.ordens_servico, clientesById, vendedoresById, lentesByOsId, armacoesByOsId]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const start = startDate ? startOfDay(parseDate(startDate)) : null;
    const end = endDate ? endOfDay(parseDate(endDate)) : null;

    return enrichedOrders.filter((order) => {
      const vendaDate = parseDate(order.data_venda);

      if (start && (!vendaDate || vendaDate < start)) {
        return false;
      }

      if (end && (!vendaDate || vendaDate > end)) {
        return false;
      }

      if (vendorId !== "todos" && order.vendedor_id !== vendorId) {
        return false;
      }

      if (status !== "todos" && order.status !== status) {
        return false;
      }

      if (tipoOS !== "todos" && order.tipo_os !== tipoOS) {
        return false;
      }

      if (
        statusPagamento !== "todos" &&
        order.status_pagamento !== statusPagamento
      ) {
        return false;
      }

      if (
        formaPagamento !== "todos" &&
        order.forma_pagamento !== formaPagamento
      ) {
        return false;
      }

      if (onlyDelayed && !order.atrasada) {
        return false;
      }

      if (normalizedSearch) {
        const searchableContent = normalizeText(
          [
            order.numero_os,
            order.numero_pedido_antigo,
            order.laboratorio_nome,
            order.cliente?.nome_completo,
            order.cliente?.telefone_principal,
            order.cliente?.cpf,
            order.vendedor?.nome_completo,
            order.vendedor?.nome_exibicao,
            order.forma_pagamento,
            order.status_pagamento,
            ...order.lentes.map((lente) => lente.marca),
            ...order.lentes.map((lente) => lente.laboratorio),
            ...order.armacoes.map((armacao) => armacao.marca),
            ...order.armacoes.map((armacao) => armacao.modelo),
          ].join(" ")
        );

        if (!searchableContent.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [
    enrichedOrders,
    search,
    startDate,
    endDate,
    vendorId,
    status,
    tipoOS,
    statusPagamento,
    formaPagamento,
    onlyDelayed,
  ]);

  const activeSalesOrders = useMemo(() => {
    return filteredOrders.filter((order) => !isCanceled(order));
  }, [filteredOrders]);

  const metrics = useMemo(() => {
    const faturamento = sumBy(activeSalesOrders, (order) => order.valor_total);
    const totalEntrada = sumBy(activeSalesOrders, (order) => order.valor_entrada);
    const totalRestante = sumBy(activeSalesOrders, (order) => order.valor_restante);
    const ticketMedio =
      activeSalesOrders.length > 0 ? faturamento / activeSalesOrders.length : 0;

    const osAtrasadas = filteredOrders.filter(isDelayed).length;
    const osEntregues = filteredOrders.filter(isDelivered).length;
    const osAbertas = filteredOrders.filter(isOpen).length;

    const deliveryTimes = filteredOrders
      .filter((order) => order.data_entrega)
      .map((order) => daysBetween(order.data_abertura || order.data_venda, order.data_entrega))
      .filter((value) => value !== null && value >= 0);

    const prazoMedioEntrega = average(deliveryTimes);

    const clientesAtendidos = new Set(
      filteredOrders.map((order) => order.cliente_id).filter(Boolean)
    ).size;

    const clientesRecorrentesMap = new Map();

    activeSalesOrders.forEach((order) => {
      clientesRecorrentesMap.set(
        order.cliente_id,
        (clientesRecorrentesMap.get(order.cliente_id) || 0) + 1
      );
    });

    const clientesRecorrentes = Array.from(clientesRecorrentesMap.values()).filter(
      (total) => total > 1
    ).length;

    return {
      faturamento,
      totalEntrada,
      totalRestante,
      ticketMedio,
      osAtrasadas,
      osEntregues,
      osAbertas,
      prazoMedioEntrega,
      clientesAtendidos,
      clientesRecorrentes,
      totalOS: filteredOrders.length,
    };
  }, [filteredOrders, activeSalesOrders]);

  const rankingVendedores = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      const vendedorId = order.vendedor_id || "sem-vendedor";
      const vendedor = order.vendedor;

      if (!map.has(vendedorId)) {
        map.set(vendedorId, {
          id: vendedorId,
          nome:
            vendedor?.nome_exibicao ||
            vendedor?.nome_completo ||
            "Vendedor não identificado",
          quantidadeOS: 0,
          faturamento: 0,
          entregues: 0,
          atrasadas: 0,
          comissao: 0,
          meta: Number(vendedor?.meta_mensal_valor) || 0,
        });
      }

      const item = map.get(vendedorId);

      item.quantidadeOS += 1;

      if (!isCanceled(order)) {
        item.faturamento += Number(order.valor_total) || 0;
        item.comissao += Number(order.comissao_valor_estimado) || 0;
      }

      if (isDelivered(order)) {
        item.entregues += 1;
      }

      if (isDelayed(order)) {
        item.atrasadas += 1;
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        ticketMedio:
          item.quantidadeOS > 0 ? item.faturamento / item.quantidadeOS : 0,
        percentualMeta:
          item.meta > 0 ? (item.faturamento / item.meta) * 100 : 0,
      }))
      .sort((a, b) => b.faturamento - a.faturamento);
  }, [filteredOrders]);

  const totalRankingRevenue = useMemo(() => {
    return sumBy(rankingVendedores, (item) => item.faturamento);
  }, [rankingVendedores]);

  const statusSummary = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      const key = order.status || "sem_status";

      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([key, value]) => ({
        key,
        label: getStatusLabel(key),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const paymentSummary = useMemo(() => {
    const map = new Map();

    activeSalesOrders.forEach((order) => {
      const key = order.forma_pagamento || "nao_informado";

      map.set(key, {
        label: getFormaPagamentoLabel(key),
        quantidade: (map.get(key)?.quantidade || 0) + 1,
        total: (map.get(key)?.total || 0) + (Number(order.valor_total) || 0),
      });
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [activeSalesOrders]);

  const topClientes = useMemo(() => {
    const map = new Map();

    activeSalesOrders.forEach((order) => {
      const key = order.cliente_id || "sem-cliente";
      const cliente = order.cliente;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          nome: cliente?.nome_completo || "Cliente não identificado",
          telefone: cliente?.telefone_principal || "Sem telefone",
          quantidadeOS: 0,
          total: 0,
        });
      }

      const item = map.get(key);

      item.quantidadeOS += 1;
      item.total += Number(order.valor_total) || 0;
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [activeSalesOrders]);

  const clientesCadastradosNoPeriodo = useMemo(() => {
    const start = startDate ? startOfDay(parseDate(startDate)) : null;
    const end = endDate ? endOfDay(parseDate(endDate)) : null;

    return (data.clientes || []).filter((cliente) => {
      const createdAt = parseDate(cliente.created_at);

      if (start && (!createdAt || createdAt < start)) {
        return false;
      }

      if (end && (!createdAt || createdAt > end)) {
        return false;
      }

      return true;
    });
  }, [data.clientes, startDate, endDate]);

  function exportDetailedReport() {
    const headers = [
      "Número da OS",
      "Data da venda",
      "Cliente",
      "Telefone",
      "Vendedor",
      "Tipo de OS",
      "Status da OS",
      "Atrasada",
      "Prazo de entrega",
      "Data de entrega",
      "Valor total",
      "Entrada",
      "Restante",
      "Status do pagamento",
      "Forma de pagamento",
      "Laboratório",
      "Comissão estimada",
    ];

    const rows = filteredOrders.map((order) => [
      order.numero_os || "",
      formatDate(order.data_venda),
      order.cliente?.nome_completo || "",
      order.cliente?.telefone_principal || "",
      order.vendedor?.nome_exibicao ||
        order.vendedor?.nome_completo ||
        "",
      getTipoOSLabel(order.tipo_os),
      getStatusLabel(order.status),
      order.atrasada ? "Sim" : "Não",
      formatDate(order.prazo_entrega),
      formatDate(order.data_entrega),
      Number(order.valor_total) || 0,
      Number(order.valor_entrada) || 0,
      Number(order.valor_restante) || 0,
      getStatusPagamentoLabel(order.status_pagamento),
      getFormaPagamentoLabel(order.forma_pagamento),
      order.laboratorio_nome || "",
      Number(order.comissao_valor_estimado) || 0,
    ]);

    exportRowsToCsv("relatorio-detalhado-otica.csv", headers, rows);
  }

  function exportVendorReport() {
    const headers = [
      "Vendedor",
      "Quantidade de OS",
      "Faturamento",
      "Ticket médio",
      "Entregues",
      "Atrasadas",
      "Comissão estimada",
      "Meta",
      "Percentual da meta",
    ];

    const rows = rankingVendedores.map((item) => [
      item.nome,
      item.quantidadeOS,
      item.faturamento,
      item.ticketMedio,
      item.entregues,
      item.atrasadas,
      item.comissao,
      item.meta,
      `${item.percentualMeta.toFixed(2)}%`,
    ]);

    exportRowsToCsv("relatorio-vendedores-otica.csv", headers, rows);
  }

  if (loading) {
    return <LoadingPanel />;
  }

  if (error) {
    return (
      <div className="rounded-[38px] border border-red-200 bg-red-50 p-6">
        <p className="text-lg font-black text-red-700">
          Não foi possível carregar os relatórios.
        </p>

        <p className="mt-2 text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={loadReports}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
        >
          <RefreshCw className="size-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-[42px] border border-border bg-card p-5 shadow-[0_30px_90px_-68px_rgba(15,23,42,0.42)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-4 py-2 text-sm font-black text-primary">
              <BarChart3 className="size-4" />
              Relatórios administrativos
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
              A operação da ótica, desmontada em números que realmente ajudam a decidir.
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Acompanhe vendas, performance de vendedores, eficiência operacional,
              comportamento de clientes e exporte o recorte filtrado para Excel.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={exportDetailedReport}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
            >
              <Download className="size-4" />
              Exportar relatório
            </button>

            <button
              type="button"
              onClick={exportVendorReport}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-black text-dark-title transition hover:bg-muted"
            >
              <Download className="size-4" />
              Exportar vendedores
            </button>
          </div>
        </div>
      </section>

      <SectionCard
        title="Filtros do relatório"
        description="Tudo é filtrado no front para dar resposta rápida, sem mandar o banco fazer ginástica desnecessária."
        action={
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-black text-dark-title transition hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Limpar filtros
          </button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Período
            </span>

            <select
              value={period}
              onChange={(event) => handlePeriodChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Data inicial
            </span>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="date"
                value={startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Data final
            </span>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="date"
                value={endDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Busca geral
            </span>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="OS, cliente, laboratório..."
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
              />
            </div>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Vendedor
            </span>

            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todos</option>

              {(data.vendedores || []).map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nome_exibicao || vendedor.nome_completo}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Status da OS
            </span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todos</option>

              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Tipo de OS
            </span>

            <select
              value={tipoOS}
              onChange={(event) => setTipoOS(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todos</option>

              {Object.entries(TIPO_OS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Pagamento
            </span>

            <select
              value={statusPagamento}
              onChange={(event) => setStatusPagamento(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todos</option>

              {Object.entries(STATUS_PAGAMENTO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-muted-foreground">
              Forma
            </span>

            <select
              value={formaPagamento}
              onChange={(event) => setFormaPagamento(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todas</option>

              {Object.entries(FORMA_PAGAMENTO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-[22px] border border-border bg-background/70 px-4 py-4">
          <input
            type="checkbox"
            checked={onlyDelayed}
            onChange={(event) => setOnlyDelayed(event.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />

          <div>
            <p className="text-sm font-black text-dark-title">
              Mostrar apenas OS atrasadas
            </p>

            <p className="text-sm text-muted-foreground">
              Considera prazo vencido e status ainda não finalizado.
            </p>
          </div>
        </label>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Faturamento"
          value={formatCurrency(metrics.faturamento)}
          meta={`${metrics.totalOS} OS no recorte`}
          icon={CircleDollarSign}
        />

        <MetricCard
          title="Ticket médio"
          value={formatCurrency(metrics.ticketMedio)}
          meta={`${activeSalesOrders.length} vendas válidas`}
          icon={TrendingUp}
        />

        <MetricCard
          title="OS atrasadas"
          value={metrics.osAtrasadas}
          meta={`${metrics.osAbertas} ordens ainda abertas`}
          icon={Hourglass}
        />

        <MetricCard
          title="Clientes atendidos"
          value={metrics.clientesAtendidos}
          meta={`${metrics.clientesRecorrentes} recorrentes no recorte`}
          icon={UsersRound}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Valor de entrada"
          value={formatCurrency(metrics.totalEntrada)}
          meta="Recebido como entrada"
          icon={WalletCards}
        />

        <MetricCard
          title="Saldo restante"
          value={formatCurrency(metrics.totalRestante)}
          meta="Valor ainda pendente nas OS"
          icon={ShoppingBag}
        />

        <MetricCard
          title="OS entregues"
          value={metrics.osEntregues}
          meta="Finalizadas no recorte filtrado"
          icon={CheckCircle2}
        />

        <MetricCard
          title="Prazo médio"
          value={`${metrics.prazoMedioEntrega.toFixed(1).replace(".", ",")} dias`}
          meta="Entre abertura e entrega"
          icon={ClipboardList}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="Ranking de vendedores"
          description="Quem está puxando faturamento, ticket, entrega e comissão."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-4 py-2 text-sm font-black text-primary">
              <UserRound className="size-4" />
              {rankingVendedores.length} vendedores
            </div>
          }
        >
          {rankingVendedores.length === 0 ? (
            <EmptyState
              title="Nenhum vendedor no recorte"
              description="Aplique um período diferente ou remova filtros para enxergar o ranking."
            />
          ) : (
            <div className="space-y-4">
              {rankingVendedores.slice(0, 8).map((item) => (
                <HorizontalBar
                  key={item.id}
                  label={item.nome}
                  value={item.faturamento}
                  total={totalRankingRevenue}
                  meta={`${item.quantidadeOS} OS · Ticket ${formatCurrency(
                    item.ticketMedio
                  )} · Comissão ${formatCurrency(item.comissao)}`}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Distribuição operacional"
          description="Como as ordens estão espalhadas por status."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-4 py-2 text-sm font-black text-primary">
              <Filter className="size-4" />
              {filteredOrders.length} OS
            </div>
          }
        >
          {statusSummary.length === 0 ? (
            <EmptyState
              title="Sem OS para distribuir"
              description="Quando houver ordens no filtro, os status aparecem aqui com clareza."
            />
          ) : (
            <div className="space-y-3">
              {statusSummary.map((item) => {
                const percent =
                  filteredOrders.length > 0
                    ? (item.value / filteredOrders.length) * 100
                    : 0;

                return (
                  <div
                    key={item.key}
                    className="rounded-[24px] border border-border bg-background/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <StatusBadge status={item.key} />

                      <div className="text-right">
                        <p className="text-lg font-black text-dark-title">
                          {item.value}
                        </p>

                        <p className="text-xs font-bold text-muted-foreground">
                          {formatPercent(percent)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="Receita por forma de pagamento"
          description="Leitura rápida de onde o caixa está respirando melhor."
        >
          {paymentSummary.length === 0 ? (
            <EmptyState
              title="Sem pagamentos no recorte"
              description="As formas de pagamento aparecem assim que houver vendas compatíveis com o filtro."
            />
          ) : (
            <div className="space-y-3">
              {paymentSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-border bg-background/70 p-4"
                >
                  <div>
                    <p className="font-black text-dark-title">{item.label}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.quantidade} OS
                    </p>
                  </div>

                  <p className="text-lg font-black text-primary">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Clientes com maior faturamento"
          description="Ótimo para enxergar recorrência e peso comercial da base."
        >
          {topClientes.length === 0 ? (
            <EmptyState
              title="Sem clientes no recorte"
              description="Os clientes mais relevantes aparecem aqui conforme as vendas filtradas."
            />
          ) : (
            <div className="space-y-3">
              {topClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-dark-title">{cliente.nome}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {cliente.telefone} · {cliente.quantidadeOS} OS
                    </p>
                  </div>

                  <p className="text-lg font-black text-primary">
                    {formatCurrency(cliente.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title="Clientes cadastrados"
          description="Volume de novos cadastros no período selecionado."
        >
          <div className="rounded-[28px] border border-border bg-background/70 p-5">
            <p className="text-5xl font-black tracking-[-0.07em] text-dark-title">
              {clientesCadastradosNoPeriodo.length}
            </p>

            <p className="mt-3 text-sm font-bold text-muted-foreground">
              novos registros no período
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="OS entregues"
          description="Termômetro de finalização operacional."
        >
          <div className="rounded-[28px] border border-border bg-background/70 p-5">
            <p className="text-5xl font-black tracking-[-0.07em] text-dark-title">
              {metrics.osEntregues}
            </p>

            <p className="mt-3 text-sm font-bold text-muted-foreground">
              entregas dentro do recorte
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Saldo em aberto"
          description="Dinheiro que ainda não atravessou a porta do caixa."
        >
          <div className="rounded-[28px] border border-border bg-background/70 p-5">
            <p className="text-4xl font-black tracking-[-0.07em] text-dark-title">
              {formatCurrency(metrics.totalRestante)}
            </p>

            <p className="mt-3 text-sm font-bold text-muted-foreground">
              valor restante consolidado
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Relatório detalhado de ordens"
        description="A tabela final para auditoria, exportação e leitura micro da operação."
        action={
          <button
            type="button"
            onClick={exportDetailedReport}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground transition hover:opacity-90"
          >
            <Download className="size-4" />
            Exportar
          </button>
        }
      >
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="Nenhuma OS encontrada"
            description="Afrouxe algum filtro ou escolha outro período para abrir o mapa do relatório."
          />
        ) : (
          <div className="overflow-x-auto rounded-[28px] border border-border">
            <table className="min-w-[1280px] w-full border-collapse bg-card">
              <thead className="bg-background/80">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    OS
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Cliente
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Vendedor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Data
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Pagamento
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Restante
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Prazo
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-border transition hover:bg-background/70"
                  >
                    <td className="px-4 py-4">
                      <p className="font-black text-dark-title">
                        {order.numero_os}
                      </p>

                      {order.atrasada ? (
                        <p className="mt-1 text-xs font-black text-red-600">
                          Atrasada
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-dark-title">
                        {order.cliente?.nome_completo || "Cliente não informado"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.cliente?.telefone_principal || "Sem telefone"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-dark-title">
                      {order.vendedor?.nome_exibicao ||
                        order.vendedor?.nome_completo ||
                        "Não informado"}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-dark-title">
                      {formatDate(order.data_venda)}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-dark-title">
                      {getTipoOSLabel(order.tipo_os)}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-dark-title">
                        {getStatusPagamentoLabel(order.status_pagamento)}
                      </p>

                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        {getFormaPagamentoLabel(order.forma_pagamento)}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-black text-primary">
                      {formatCurrency(order.valor_total)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-black text-dark-title">
                      {formatCurrency(order.valor_restante)}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-dark-title">
                      {formatDate(order.prazo_entrega)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}