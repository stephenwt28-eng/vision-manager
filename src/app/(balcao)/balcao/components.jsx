"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ClipboardPlus,
  Clock3,
  Eye,
  FileSearch,
  Loader2,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

const STATUS_CONFIG = {
  cadastrada: {
    label: "Cadastrada",
    className: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  enviada_laboratorio: {
    label: "Enviada ao laboratório",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  aguardando_retorno: {
    label: "Aguardando retorno",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  pronta_retirada: {
    label: "Pronta para retirada",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  entregue: {
    label: "Entregue",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

const PAYMENT_CONFIG = {
  pendente: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  parcial: {
    label: "Parcial",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  pago: {
    label: "Pago",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  estornado: {
    label: "Estornado",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

function formatDate(value) {
  if (!value) return "Sem data";

  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPhone(value = "") {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (!digits) return "Sem telefone";

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || status || "Sem status";
}

function getStatusClass(status) {
  return (
    STATUS_CONFIG[status]?.className || "bg-slate-100 text-slate-700 ring-slate-200"
  );
}

function getPaymentLabel(status) {
  return PAYMENT_CONFIG[status]?.label || status || "Sem pagamento";
}

function getPaymentClass(status) {
  return (
    PAYMENT_CONFIG[status]?.className || "bg-slate-100 text-slate-700 ring-slate-200"
  );
}

function parseApiData(payload) {
  const data = payload?.data || {};

  return {
    usuario: data.usuario || null,
    conta: data.conta || null,
    metrics: {
      clientes_total: Number(data.metrics?.clientes_total || 0),
      os_abertas: Number(data.metrics?.os_abertas || 0),
      os_atrasadas: Number(data.metrics?.os_atrasadas || 0),
      prontas_retirada: Number(data.metrics?.prontas_retirada || 0),
      vendas_hoje: Number(data.metrics?.vendas_hoje || 0),
      faturamento_hoje: Number(data.metrics?.faturamento_hoje || 0),
      garantias_abertas: Number(data.metrics?.garantias_abertas || 0),
    },
    search: {
      clientes: Array.isArray(data.search?.clientes) ? data.search.clientes : [],
      ordens_servico: Array.isArray(data.search?.ordens_servico)
        ? data.search.ordens_servico
        : [],
    },
    listas: {
      recentes: Array.isArray(data.listas?.recentes) ? data.listas.recentes : [],
      atrasadas: Array.isArray(data.listas?.atrasadas) ? data.listas.atrasadas : [],
      prontas_retirada: Array.isArray(data.listas?.prontas_retirada)
        ? data.listas.prontas_retirada
        : [],
      garantias_abertas: Array.isArray(data.listas?.garantias_abertas)
        ? data.listas.garantias_abertas
        : [],
    },
  };
}

function StatusBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ring-1",
        getStatusClass(status),
      ].join(" ")}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function PaymentBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ring-1",
        getPaymentClass(status),
      ].join(" ")}
    >
      {getPaymentLabel(status)}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-72 animate-pulse rounded-[42px] border border-border bg-card" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[30px] border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-[34px] border border-border bg-card" />
        <div className="h-80 animate-pulse rounded-[34px] border border-border bg-card" />
      </div>
    </div>
  );
}

function EmptyState({ title, description, icon: Icon = FileSearch }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-background/70 px-5 py-8 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 font-black tracking-[-0.03em] text-dark-title">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ActionButton({ href, icon: Icon, title, description, featured = false }) {
  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-[30px] border p-5 transition-all duration-300 hover:-translate-y-0.5",
        featured
          ? "border-primary bg-primary text-primary-foreground shadow-[0_28px_70px_-42px_rgba(108,77,230,0.95)]"
          : "border-border bg-card text-foreground shadow-[0_26px_70px_-62px_rgba(15,23,42,0.35)] hover:border-primary/30 hover:bg-primary/[0.03]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={[
            "grid size-12 place-items-center rounded-[20px]",
            featured ? "bg-white/15 text-white" : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <Icon className="size-5" />
        </div>

        <div
          className={[
            "grid size-9 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1",
            featured ? "bg-white/15" : "bg-background text-primary",
          ].join(" ")}
        >
          <ArrowRight className="size-4" />
        </div>
      </div>

      <h3
        className={[
          "mt-5 text-lg font-black tracking-[-0.04em]",
          featured ? "text-white" : "text-dark-title",
        ].join(" ")}
      >
        {title}
      </h3>
      <p
        className={[
          "mt-1 text-sm leading-6",
          featured ? "text-white/78" : "text-muted-foreground",
        ].join(" ")}
      >
        {description}
      </p>

      {featured && (
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/10 blur-2xl" />
      )}
    </Link>
  );
}

function MetricCard({ title, value, description, icon: Icon, href, alert = false }) {
  const content = (
    <div
      className={[
        "group rounded-[30px] border bg-card p-5 shadow-[0_24px_70px_-62px_rgba(15,23,42,0.36)] transition-all duration-300",
        href ? "hover:-translate-y-0.5 hover:border-primary/30" : "",
        alert ? "border-amber-200" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-dark-title">
            {value}
          </p>
        </div>

        <div
          className={[
            "grid size-13 place-items-center rounded-[22px]",
            alert ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <Icon className="size-6" />
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        {description}
      </p>
    </div>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}

function SectionCard({ title, description, action, children }) {
  return (
    <section className="rounded-[34px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
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

function ClientResultCard({ client }) {
  const name = client.nome_completo || client.nome_social || "Cliente sem nome";

  return (
    <div className="rounded-[26px] border border-border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-background">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-black tracking-[-0.03em] text-dark-title">
                {name}
              </p>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Cliente
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {formatPhone(client.telefone_principal || client.telefone)}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <ClipboardList className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {Number(client.total_os || 0)} OS no histórico
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href={`/balcao/clientes/${client.id}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            Ver envelope
          </Link>
          <Link
            href={`/balcao/ordens-servico/nova?cliente_id=${client.id}`}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Nova OS
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderResultCard({ order }) {
  const clienteNome =
    order.cliente_nome ||
    order.clientes?.nome_completo ||
    order.cliente?.nome_completo ||
    "Cliente não informado";

  return (
    <div className="rounded-[26px] border border-border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-background">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-black tracking-[-0.03em] text-dark-title">
                OS {order.numero_os || "sem número"}
              </p>
              <p className="mt-0.5 truncate text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {clienteNome}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.status_pagamento} />
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span>Venda: {formatDate(order.data_venda)}</span>
            <span>Prazo: {formatDate(order.prazo_entrega)}</span>
            <span>Total: {formatCurrency(order.valor_total)}</span>
            <span>
              Vendedor:{" "}
              {order.vendedor_nome ||
                order.vendedores?.nome_exibicao ||
                order.vendedores?.nome_completo ||
                "Não informado"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href={`/balcao/ordens-servico/${order.id}`}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Abrir OS
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickOrderRow({ order, variant = "default" }) {
  const clienteNome =
    order.cliente_nome ||
    order.clientes?.nome_completo ||
    order.cliente?.nome_completo ||
    "Cliente não informado";

  return (
    <Link
      href={`/balcao/ordens-servico/${order.id}`}
      className={[
        "group block rounded-[26px] border p-4 transition-all duration-300 hover:-translate-y-0.5",
        variant === "danger"
          ? "border-amber-200 bg-amber-50/70 hover:bg-amber-50"
          : "border-border bg-background/70 hover:border-primary/30 hover:bg-background",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-black tracking-[-0.03em] text-dark-title">
            OS {order.numero_os || "sem número"}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">
            {clienteNome}
          </p>
        </div>

        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={order.status} />
        {order.status_pagamento && <PaymentBadge status={order.status_pagamento} />}
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <span>Prazo: {formatDate(order.prazo_entrega)}</span>
        <span>Total: {formatCurrency(order.valor_total)}</span>
      </div>
    </Link>
  );
}

function SearchPanel({
  query,
  setQuery,
  searching,
  searchClientes,
  searchOrders,
  onClear,
}) {
  const hasQuery = query.trim().length > 0;
  const hasResults = searchClientes.length > 0 || searchOrders.length > 0;

  return (
    <section className="relative overflow-hidden rounded-[42px] border border-border bg-card p-5 shadow-[0_35px_90px_-68px_rgba(15,23,42,0.45)] sm:p-7">

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:items-center">
        <div className="absolute right-[-70px] top-[-70px] size-56 rounded-full bg-primary/[0.08]" />
        <div className="absolute bottom-[-100px] left-[15%] size-64 rounded-full bg-primary/[0.05]" />
        <div>
            

          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
            Ache cliente, OS e histórico sem caçar envelope físico.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Digite nome, telefone, CPF ou número da OS. O atendimento começa aqui:
            localiza, confere, cria venda.
          </p>

          <div className="mt-6 rounded-[28px] border border-border bg-background/80 p-2 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-[20px] bg-primary text-primary-foreground">
                {searching ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Search className="size-5" />
                )}
              </div>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por cliente, CPF, telefone ou OS..."
                className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold text-dark-title outline-none placeholder:text-muted-foreground/70"
                autoComplete="off"
              />

              {hasQuery && (
                <button
                  type="button"
                  onClick={onClear}
                  className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <ActionButton
            featured
            href="/balcao/ordens-servico/nova"
            icon={ClipboardPlus}
            title="Nova OS"
            description="Começar uma venda ou serviço em poucos cliques."
          />
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/balcao/clientes"
              className="rounded-[24px] border border-border bg-background/75 p-4 transition hover:border-primary/30 hover:bg-background"
            >
              <UserRoundPlus className="size-5 text-primary" />
              <p className="mt-3 text-sm font-black text-dark-title">
                Novo cliente
              </p>
            </Link>
            <Link
              href="/balcao/ordens-servico"
              className="rounded-[24px] border border-border bg-background/75 p-4 transition hover:border-primary/30 hover:bg-background"
            >
              <Eye className="size-5 text-primary" />
              <p className="mt-3 text-sm font-black text-dark-title">
                Consultar OS
              </p>
            </Link>
          </div>
        </div>
      </div>

      {hasQuery && (
        <div className="relative mt-6 rounded-[32px] border border-border bg-background/80 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black tracking-[-0.03em] text-dark-title">
                Resultado da busca
              </p>
              <p className="text-sm text-muted-foreground">
                Clientes e OS encontrados para “{query.trim()}”.
              </p>
            </div>

            {searching && (
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                <Loader2 className="size-4 animate-spin" />
                Buscando
              </span>
            )}
          </div>

          {!searching && !hasResults && (
            <EmptyState
              icon={FileSearch}
              title="Nada encontrado"
              description="Tente telefone sem máscara, CPF, nome completo ou número da OS. Se for cliente novo, já dá para cadastrar."
            />
          )}

          {hasResults && (
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Clientes
                </p>
                {searchClientes.length ? (
                  searchClientes.map((client) => (
                    <ClientResultCard key={client.id} client={client} />
                  ))
                ) : (
                  <EmptyState
                    icon={UsersRound}
                    title="Nenhum cliente nessa busca"
                    description="Pode ser uma OS sem cliente aparente ou um cadastro ainda não criado."
                  />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Ordens de serviço
                </p>
                {searchOrders.length ? (
                  searchOrders.map((order) => (
                    <OrderResultCard key={order.id} order={order} />
                  ))
                ) : (
                  <EmptyState
                    icon={ClipboardList}
                    title="Nenhuma OS nessa busca"
                    description="Quando a OS existir, ela aparece aqui com status, prazo e pagamento."
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function BalcaoHomeComponents() {
  const [home, setHome] = useState({
    usuario: null,
    conta: null,
    metrics: {
      clientes_total: 0,
      os_abertas: 0,
      os_atrasadas: 0,
      prontas_retirada: 0,
      vendas_hoje: 0,
      faturamento_hoje: 0,
      garantias_abertas: 0,
    },
    search: {
      clientes: [],
      ordens_servico: [],
    },
    listas: {
      recentes: [],
      atrasadas: [],
      prontas_retirada: [],
      garantias_abertas: [],
    },
  });

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  async function loadHome(searchTerm = "", isRefresh = false) {
    try {
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      if (searchTerm.trim()) {
        setSearching(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }

      const endpoint = params.toString()
        ? `/api/balcao/home?${params.toString()}`
        : "/api/balcao/home";

      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error || "Não foi possível carregar a central do balcão."
        );
      }

      setHome(parseApiData(payload));
    } catch (loadError) {
      if (loadError.name === "AbortError") return;

      setError(loadError.message || "Erro ao carregar a central do balcão.");
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHome();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadHome(query);
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timeout);
  }, [query]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const userName = useMemo(() => {
    return (
      home.usuario?.nome_completo?.split(" ")?.[0] ||
      home.usuario?.email ||
      "time do balcão"
    );
  }, [home.usuario]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <LoadingState />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">

      {error && (
        <div className="rounded-[26px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <SearchPanel
        query={query}
        setQuery={setQuery}
        searching={searching}
        searchClientes={home.search.clientes}
        searchOrders={home.search.ordens_servico}
        onClear={() => setQuery("")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="OS abertas"
          value={home.metrics.os_abertas}
          description="Pedidos em andamento agora."
          icon={ClipboardList}
          href="/balcao/ordens-servico"
        />
        <MetricCard
          title="Atrasadas"
          value={home.metrics.os_atrasadas}
          description="Precisa de atenção."
          icon={AlertTriangle}
          href="/balcao/ordens-servico?filtro=atrasadas"
          alert={home.metrics.os_atrasadas > 0}
        />
        <MetricCard
          title="Prontas"
          value={home.metrics.prontas_retirada}
          description="Prontos para retirada."
          icon={PackageCheck}
          href="/balcao/ordens-servico?status=pronta_retirada"
        />
        <MetricCard
          title="Hoje"
          value={`${home.metrics.vendas_hoje}`}
          description={`OS registradas hoje.`}
          icon={TrendingUp}
        />
      </div>


      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard
          title="OS atrasadas"
          action={
            <Link
              href="/balcao/ordens-servico?filtro=atrasadas"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              Ver todas
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {home.listas.atrasadas.length ? (
            <div className="grid gap-3">
              {home.listas.atrasadas.map((order) => (
                <QuickOrderRow key={order.id} order={order} variant="danger" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Nenhuma OS atrasada"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Prontas para retirada"
          action={
            <Link
              href="/balcao/ordens-servico?status=pronta_retirada"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              Ver prontas
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {home.listas.prontas_retirada.length ? (
            <div className="grid gap-3">
              {home.listas.prontas_retirada.map((order) => (
                <QuickOrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageCheck}
              title="Nada pronto para retirada"
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SectionCard
          title="Últimas OS movimentadas"
          action={
            <Link
              href="/balcao/ordens-servico"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              Consultar OS
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          {home.listas.recentes.length ? (
            <div className="grid gap-3">
              {home.listas.recentes.map((order) => (
                <QuickOrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma OS recente"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Resumo operacional"
        >
          <div className="grid gap-3">
            <div className="rounded-[26px] border border-border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[18px] bg-primary/10 text-primary">
                  <UsersRound className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-[-0.05em] text-dark-title">
                    {home.metrics.clientes_total}
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    clientes cadastrados
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[18px] bg-primary/10 text-primary">
                  <BadgeCheck className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-[-0.05em] text-dark-title">
                    {home.metrics.garantias_abertas}
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    garantias abertas
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[18px] bg-primary/10 text-primary">
                  <CalendarClock className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-[-0.05em] text-dark-title">
                    {home.metrics.vendas_hoje}
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    vendas registradas hoje
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}