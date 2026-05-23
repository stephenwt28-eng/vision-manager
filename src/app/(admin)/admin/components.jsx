"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardClock,
  Clock3,
  PieChart,
  PackageCheck,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  UsersRound,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "ano_atual", label: "Ano atual" },
  { value: "todos", label: "Todo o histórico" },
];

const STATUS_CONFIG = {
  cadastrada: {
    label: "Cadastrada",
    color: "rgba(108, 77, 230, 0.95)",
  },
  enviada_laboratorio: {
    label: "Enviada ao laboratório",
    color: "rgba(108, 77, 230, 0.76)",
  },
  aguardando_retorno: {
    label: "Aguardando retorno",
    color: "rgba(27, 20, 100, 0.74)",
  },
  pronta_retirada: {
    label: "Pronta para retirada",
    color: "rgba(16, 185, 129, 0.78)",
  },
  entregue: {
    label: "Entregue",
    color: "rgba(34, 197, 94, 0.92)",
  },
  cancelada: {
    label: "Cancelada",
    color: "rgba(148, 163, 184, 0.86)",
  },
};

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatCompactCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Sem data";

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

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getPeriodRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "mes_atual") {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 1),
      label: `${MONTHS_SHORT[month]}/${year}`,
    };
  }

  if (period === "mes_anterior") {
    const previousMonthDate = new Date(year, month - 1, 1);

    return {
      start: new Date(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth(),
        1
      ),
      end: new Date(year, month, 1),
      label: `${MONTHS_SHORT[previousMonthDate.getMonth()]}/${previousMonthDate.getFullYear()}`,
    };
  }

  if (period === "ano_atual") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
      label: `${year}`,
    };
  }

  return {
    start: null,
    end: null,
    label: "Todo o histórico",
  };
}

function isWithinRange(dateValue, range) {
  if (!range.start || !range.end) return true;

  const date = parseDate(dateValue);

  if (!date) return false;

  return date >= range.start && date < range.end;
}

function sumBy(items, getter) {
  return items.reduce((total, item) => total + (Number(getter(item)) || 0), 0);
}

function isCanceled(order) {
  return order?.status === "cancelada";
}

function isOpenOrder(order) {
  return !["entregue", "cancelada"].includes(order?.status);
}

function isReadyOrder(order) {
  return order?.status === "pronta_retirada";
}

function isDeliveredOrder(order) {
  return order?.status === "entregue";
}

function isDelayedOrder(order) {
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

function groupSalesByDay(orders, range) {
  const items = [];
  const grouped = new Map();

  orders.forEach((order) => {
    const date = parseDate(order.data_venda);

    if (!date) return;

    const key = date.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) || 0) + (Number(order.valor_total) || 0));
  });

  if (range.start && range.end) {
    let cursor = new Date(range.start);

    while (cursor < range.end) {
      const key = cursor.toISOString().slice(0, 10);

      items.push({
        key,
        label: String(cursor.getDate()).padStart(2, "0"),
        value: grouped.get(key) || 0,
      });

      cursor = addDays(cursor, 1);
    }

    return items;
  }

  return Array.from(grouped.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-18)
    .map(([key, value]) => {
      const date = parseDate(key);

      return {
        key,
        label: date
          ? `${String(date.getDate()).padStart(2, "0")}/${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`
          : key,
        value,
      };
    });
}

function groupSalesByMonth(orders) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const months = MONTHS_SHORT.map((label, index) => ({
    key: `${currentYear}-${String(index + 1).padStart(2, "0")}`,
    label,
    value: 0,
  }));

  orders.forEach((order) => {
    const date = parseDate(order.data_venda);

    if (!date || date.getFullYear() !== currentYear) return;

    const monthIndex = date.getMonth();
    months[monthIndex].value += Number(order.valor_total) || 0;
  });

  return months;
}

function groupSalesForAllHistory(orders) {
  const grouped = new Map();

  orders.forEach((order) => {
    const date = parseDate(order.data_venda);

    if (!date) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    grouped.set(key, (grouped.get(key) || 0) + (Number(order.valor_total) || 0));
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      const label = `${MONTHS_SHORT[Number(month) - 1]}/${year.slice(-2)}`;

      return {
        key,
        label,
        value,
      };
    });
}

function buildSalesChartData(orders, period, range) {
  if (period === "ano_atual") {
    return groupSalesByMonth(orders);
  }

  if (period === "todos") {
    return groupSalesForAllHistory(orders);
  }

  return groupSalesByDay(orders, range);
}

function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || status || "Sem status";
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

function StatusCard({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.36)]">
      <div>
        <p className="text-sm font-bold text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-black tracking-[-0.055em] text-dark-title">
          {value}
        </p>
      </div>

      <div className="grid size-14 place-items-center rounded-[22px] bg-primary text-primary-foreground">
        <Icon className="size-6" />
      </div>
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

function LoadingPanel() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="h-48 animate-pulse rounded-[40px] border border-border bg-card" />

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

function SalesBarsChart({ items }) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);
  const mobileLabelStep =
    items.length <= 10 ? 1 : Math.max(Math.ceil(items.length / 6), 2);

  if (!items.length || maxValue === 0) {
    return (
      <EmptyState
        title="Sem vendas no período"
        description="Quando as OS começarem a registrar faturamento, o ritmo aparece aqui em barras verticais."
      />
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[30px] border border-border bg-background/70 p-3 sm:p-5">
      <div
        className="grid h-72 w-full items-end gap-1.5 sm:h-80 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => {
          const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 6) : 6;
          const showMobileLabel =
            index % mobileLabelStep === 0 || index === items.length - 1;

          return (
            <div
              key={item.key}
              className="group flex h-full min-w-0 flex-col items-center justify-end gap-2 sm:gap-3"
            >
              <div className="relative flex h-full w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[12px] rounded-t-[10px] rounded-b-[4px] bg-primary shadow-[0_12px_24px_-10px_rgba(108,77,230,0.6)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-primary/90 sm:max-w-[20px]"
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${formatCurrency(item.value)}`}
                />
              </div>

              <span
                className={`w-full truncate text-center text-[10px] font-bold text-muted-foreground transition-colors group-hover:text-dark-title sm:text-[11px] ${
                  showMobileLabel ? "block" : "hidden sm:block"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!items.length || total === 0) {
    return (
      <EmptyState
        title="Sem OS para distribuir"
        description="O gráfico de pizza ganha vida assim que existirem ordens no recorte selecionado."
      />
    );
  }

  const gradient = items
    .reduce(
      (acc, item) => {
        const percent = (item.value / total) * 100;
        const start = acc.currentPercent;
        const end = acc.currentPercent + percent;
        acc.stops.push(`${item.color} ${start}% ${end}%`);
        acc.currentPercent = end;
        return acc;
      },
      { currentPercent: 0, stops: [] }
    )
    .stops.join(", ");

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:items-center">
      <div className="relative mx-auto grid size-[190px] place-items-center rounded-full sm:size-[220px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${gradient})`,
          }}
        />

        <div className="relative z-10 grid size-[124px] place-items-center rounded-full border border-border bg-card text-center shadow-[0_20px_42px_-30px_rgba(15,23,42,0.45)] sm:size-[148px]">
          <div>
            <p className="text-3xl font-black tracking-[-0.06em] text-dark-title">
              {total}
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              OS
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 xl:max-h-[280px] xl:overflow-y-auto xl:pr-1">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div
              key={item.key}
              className="grid gap-3 rounded-[22px] border border-border bg-background/70 px-4 py-3 transition-colors hover:bg-background/90 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-5 text-dark-title break-words">
                      {item.label}
                    </p>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <p className="text-sm font-black text-dark-title">
                  {item.value} OS
                </p>
                <span className="min-w-[42px] rounded-lg bg-muted px-2 py-0.5 text-center text-[11px] font-bold text-muted-foreground">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderRow({ title, subtitle, badge }) {
  return (
    <div className="grid gap-3 rounded-[26px] border border-border bg-background/75 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-black tracking-[-0.03em] text-dark-title">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {badge}
    </div>
  );
}

export default function AdminDashboardComponents() {
  const [dashboard, setDashboard] = useState({
    clientes: [],
    ordens_servico: [],
    vendedores: [],
  });

  const [period, setPeriod] = useState("mes_atual");
  const [sellerId, setSellerId] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível carregar o dashboard.");
      }

      setDashboard({
        clientes: payload?.data?.clientes ?? [],
        ordens_servico: payload?.data?.ordens_servico ?? [],
        vendedores: payload?.data?.vendedores ?? [],
      });
    } catch (loadError) {
      setError(loadError.message || "Erro ao carregar o dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      await loadDashboard();
    };
    fetchDashboard();
  }, []);

  const range = useMemo(() => getPeriodRange(period), [period]);

  const sellersMap = useMemo(() => {
    return new Map(
      dashboard.vendedores.map((seller) => [
        seller.id,
        seller.nome_exibicao || seller.nome_completo || "Vendedor",
      ])
    );
  }, [dashboard.vendedores]);

  const periodOrders = useMemo(() => {
    return dashboard.ordens_servico.filter((order) => {
      const matchesPeriod = isWithinRange(order.data_venda, range);
      const matchesSeller =
        sellerId === "todos" || order.vendedor_id === sellerId;

      return matchesPeriod && matchesSeller;
    });
  }, [dashboard.ordens_servico, range, sellerId]);

  const periodClients = useMemo(() => {
    return dashboard.clientes.filter((client) =>
      isWithinRange(client.created_at, range)
    );
  }, [dashboard.clientes, range]);

  const revenueOrders = useMemo(() => {
    return periodOrders.filter((order) => !isCanceled(order));
  }, [periodOrders]);

  const operationalOrders = useMemo(() => {
    return dashboard.ordens_servico.filter((order) => {
      const matchesSeller =
        sellerId === "todos" || order.vendedor_id === sellerId;

      return matchesSeller;
    });
  }, [dashboard.ordens_servico, sellerId]);

  const openOrders = useMemo(() => {
    return operationalOrders.filter(isOpenOrder);
  }, [operationalOrders]);

  const delayedOrders = useMemo(() => {
    return operationalOrders
      .filter(isDelayedOrder)
      .sort((a, b) => {
        const dateA = parseDate(a.prazo_entrega)?.getTime() || 0;
        const dateB = parseDate(b.prazo_entrega)?.getTime() || 0;

        return dateA - dateB;
      });
  }, [operationalOrders]);

  const readyOrders = useMemo(() => {
    return operationalOrders
      .filter(isReadyOrder)
      .sort((a, b) => {
        const dateA = parseDate(a.data_venda)?.getTime() || 0;
        const dateB = parseDate(b.data_venda)?.getTime() || 0;

        return dateB - dateA;
      });
  }, [operationalOrders]);

  const deliveredOrders = useMemo(() => {
    return periodOrders.filter(isDeliveredOrder);
  }, [periodOrders]);

  const totalRevenue = useMemo(() => {
    return sumBy(revenueOrders, (order) => order.valor_total);
  }, [revenueOrders]);

  const averageTicket = useMemo(() => {
    if (!revenueOrders.length) return 0;

    return totalRevenue / revenueOrders.length;
  }, [revenueOrders, totalRevenue]);

  const salesBars = useMemo(() => {
    return buildSalesChartData(revenueOrders, period, range);
  }, [revenueOrders, period, range]);

  const statusPie = useMemo(() => {
    return Object.entries(STATUS_CONFIG)
      .map(([key, config]) => ({
        key,
        label: config.label,
        color: config.color,
        value: periodOrders.filter((order) => order.status === key).length,
      }))
      .filter((item) => item.value > 0);
  }, [periodOrders]);

  const salesRanking = useMemo(() => {
    const rankingMap = new Map();

    revenueOrders.forEach((order) => {
      const sellerName =
        sellersMap.get(order.vendedor_id) || "Vendedor não identificado";

      const current = rankingMap.get(order.vendedor_id) || {
        id: order.vendedor_id,
        name: sellerName,
        sold: 0,
        quantity: 0,
      };

      current.sold += Number(order.valor_total) || 0;
      current.quantity += 1;

      rankingMap.set(order.vendedor_id, current);
    });

    const ranking = Array.from(rankingMap.values()).sort(
      (a, b) => b.sold - a.sold
    );

    const topValue = ranking[0]?.sold || 0;

    return ranking.slice(0, 5).map((seller) => ({
      ...seller,
      percent: topValue > 0 ? Math.max((seller.sold / topValue) * 100, 8) : 0,
    }));
  }, [revenueOrders, sellersMap]);

  const latestSales = useMemo(() => {
    return [...revenueOrders]
      .sort((a, b) => {
        const dateA = parseDate(a.data_venda)?.getTime() || 0;
        const dateB = parseDate(b.data_venda)?.getTime() || 0;

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [revenueOrders]);

  if (loading) {
    return <LoadingPanel />;
  }

  if (error) {
    return (
      <div className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
        <p className="text-lg font-black tracking-[-0.04em] text-dark-title">
          O dashboard não carregou.
        </p>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          <RefreshCw className="size-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-[40px] border border-border bg-card p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.42)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-4xl">
              Visão executiva da operação.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Faturamento, atrasos, status das OS, vendedores e movimento do período.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href="/admin/ordens-servico"
              className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Ver ordens de serviço
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/admin/clientes"
              className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-black text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
            >
              Clientes
              <UsersRound className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-border bg-card p-4 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.36)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Período
            </label>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="mt-2 h-13 w-full rounded-full border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Vendedor
            </label>

            <select
              value={sellerId}
              onChange={(event) => setSellerId(event.target.value)}
              className="mt-2 h-13 w-full rounded-full border border-border bg-background px-4 text-sm font-bold text-dark-title outline-none transition focus:border-primary"
            >
              <option value="todos">Todos os vendedores</option>

              {dashboard.vendedores.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.nome_exibicao || seller.nome_completo}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-black text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Vendas no período"
          value={formatCurrency(totalRevenue)}
          meta={range.label}
          icon={CircleDollarSign}
        />

        <MetricCard
          title="OS abertas agora"
          value={String(openOrders.length).padStart(2, "0")}
          meta="Visão operacional"
          icon={ClipboardList}
        />

        <MetricCard
          title="OS atrasadas"
          value={String(delayedOrders.length).padStart(2, "0")}
          meta="Cobram ação rápida"
          icon={ClipboardClock}
        />

        <MetricCard
          title="Novos clientes"
          value={String(periodClients.length).padStart(2, "0")}
          meta={range.label}
          icon={UsersRound}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatusCard
          title="Prontas para retirada"
          value={String(readyOrders.length).padStart(2, "0")}
          icon={PackageCheck}
        />

        <StatusCard
          title="Entregues no período"
          value={String(deliveredOrders.length).padStart(2, "0")}
          icon={CheckCircle2}
        />

        <StatusCard
          title="Ticket médio"
          value={formatCurrency(averageTicket)}
          icon={TrendingUp}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Vendas em barras verticais"
          description="Ritmo financeiro do recorte selecionado."
          action={
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary" />
              {range.label}
            </span>
          }
        >
          <SalesBarsChart items={salesBars} />
        </SectionCard>

        <SectionCard
          title="OS por status"
          description="Pizza operacional para bater o olho e entender o funil."
          action={
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black text-muted-foreground">
              <PieChart className="size-3.5 text-primary" />
              Distribuição
            </span>
          }
        >
          <StatusPieChart items={statusPie} />
        </SectionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Ranking de vendedores"
          description="Faturamento no período, ordenado sem diplomacia."
          action={
            <Link
              href="/admin/relatorios"
              className="inline-flex items-center gap-2 text-sm font-black text-primary hover:opacity-80"
            >
              Ver relatório
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {salesRanking.length === 0 ? (
            <EmptyState
              title="Ranking ainda vazio"
              description="Sem vendas neste filtro, ninguém sobe ao pódio."
            />
          ) : (
            <div className="space-y-4">
              {salesRanking.map((seller) => (
                <div
                  key={seller.id}
                  className="rounded-[26px] border border-border bg-background/75 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black tracking-[-0.03em] text-dark-title">
                        {seller.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(seller.sold)} · {seller.quantity} OS
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-xs font-black text-primary">
                      {Math.round(seller.percent)}%
                    </span>
                  </div>

                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${seller.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Últimas vendas registradas"
          description="Movimento recente dentro do recorte escolhido."
          action={
            <Link
              href="/admin/ordens-servico"
              className="inline-flex items-center gap-2 text-sm font-black text-primary hover:opacity-80"
            >
              Abrir OS
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {latestSales.length === 0 ? (
            <EmptyState
              title="Nenhuma venda neste período"
              description="Quando novas OS entrarem, elas aparecem aqui com valor e vendedor."
            />
          ) : (
            <div className="space-y-3">
              {latestSales.map((order) => (
                <OrderRow
                  key={order.id}
                  title={order.numero_os || "OS sem número"}
                  subtitle={`${sellersMap.get(order.vendedor_id) || "Vendedor não identificado"} · ${formatDate(order.data_venda)}`}
                  badge={
                    <div className="inline-flex w-fit items-center rounded-full bg-primary/[0.08] px-3 py-2 text-xs font-black text-primary">
                      {formatCompactCurrency(order.valor_total)}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="OS atrasadas recentes"
          description="Esse bloco é farol vermelho. Prazo vencido corrói confiança."
          action={
            <Link
              href="/admin/ordens-servico"
              className="inline-flex items-center gap-2 text-sm font-black text-primary hover:opacity-80"
            >
              Abrir lista
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {delayedOrders.length === 0 ? (
            <EmptyState
              title="Nenhuma OS atrasada"
              description="Boa notícia. O painel não encontrou pedidos vencidos pendentes."
            />
          ) : (
            <div className="space-y-3">
              {delayedOrders.slice(0, 4).map((order) => (
                <OrderRow
                  key={order.id}
                  title={order.numero_os || "OS sem número"}
                  subtitle={`${getStatusLabel(order.status)} · ${sellersMap.get(order.vendedor_id) || "Vendedor não identificado"}`}
                  badge={
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-2 text-xs font-black text-primary">
                      <Clock3 className="size-3.5" />
                      Prazo {formatDate(order.prazo_entrega)}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Prontas para retirada"
          description="Pedidos que já podem virar satisfação, entrega e caixa resolvido."
          action={
            <Link
              href="/admin/ordens-servico"
              className="inline-flex items-center gap-2 text-sm font-black text-primary hover:opacity-80"
            >
              Ver todas
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {readyOrders.length === 0 ? (
            <EmptyState
              title="Nada pronto para retirada"
              description="Assim que uma OS mudar para pronta, ela pousa aqui."
            />
          ) : (
            <div className="space-y-3">
              {readyOrders.slice(0, 4).map((order) => (
                <OrderRow
                  key={order.id}
                  title={order.numero_os || "OS sem número"}
                  subtitle={`${formatDate(order.data_venda)} · ${sellersMap.get(order.vendedor_id) || "Vendedor não identificado"}`}
                  badge={
                    <div className="inline-flex w-fit items-center rounded-full bg-primary/[0.08] px-3 py-2 text-xs font-black text-primary">
                      {formatCurrency(order.valor_total)}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
