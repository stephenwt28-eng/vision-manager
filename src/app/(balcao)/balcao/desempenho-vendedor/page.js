"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Eye,
  FileSpreadsheet,
  KeyRound,
  LockKeyhole,
  Medal,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatMoneyBR(value) {
  if (value === null || value === undefined) return "Oculto";

  const numericValue = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatPercent(value) {
  if (value === null || value === undefined) return "Oculto";

  const numericValue = Number(value || 0);

  return `${Number.isFinite(numericValue) ? numericValue.toLocaleString("pt-BR") : "0"}%`;
}

function formatDateBR(value) {
  if (!value) return "Não informado";

  try {
    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("pt-BR").format(date);
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

  if (!parts.length) return "VD";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getVendedorName(vendedor) {
  return vendedor?.nome_exibicao || vendedor?.nome_completo || "Vendedor";
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildExcelCell(value) {
  if (value === null || value === undefined) return "";

  return escapeHtml(value);
}

function buildExcelMoney(value) {
  if (value === null || value === undefined) return "Oculto";

  return formatMoneyBR(value);
}

function buildExcelPercent(value) {
  if (value === null || value === undefined) return "Oculto";

  return formatPercent(value);
}

function downloadHtmlExcel({
  filename,
  title,
  subtitle,
  headers,
  rows,
  summaryRows = [],
}) {
  const primaryColor = "#6C4DE6";
  const darkTitle = "#1B1464";
  const borderColor = "#E2E8F0";

  const summaryHtml = summaryRows.length
    ? `
      <table style="margin-bottom: 22px; border-collapse: collapse;">
        ${summaryRows
          .map(
            (row) => `
              <tr>
                <td style="padding: 8px 12px; border: 1px solid ${borderColor}; font-weight: 700; color: ${darkTitle}; background: #F8FAFC;">
                  ${buildExcelCell(row.label)}
                </td>
                <td style="padding: 8px 12px; border: 1px solid ${borderColor}; font-weight: 700;">
                  ${buildExcelCell(row.value)}
                </td>
              </tr>
            `
          )
          .join("")}
      </table>
    `
    : "";

  const tableHtml = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          ${headers
            .map(
              (header) => `
                <th style="padding: 10px 12px; border: 1px solid ${primaryColor}; background: ${primaryColor}; color: #FFFFFF; font-weight: 800; text-align: left;">
                  ${buildExcelCell(header)}
                </th>
              `
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                ${row
                  .map(
                    (cell) => `
                      <td style="padding: 9px 12px; border: 1px solid ${borderColor}; vertical-align: top;">
                        ${buildExcelCell(cell)}
                      </td>
                    `
                  )
                  .join("")}
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h1 style="margin: 0 0 6px; color: ${darkTitle}; font-size: 24px;">
          ${buildExcelCell(title)}
        </h1>
        <p style="margin: 0 0 20px; color: #64748B; font-size: 13px;">
          ${buildExcelCell(subtitle)}
        </p>
        ${summaryHtml}
        ${tableHtml}
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function getCurrentMonthPeriod() {
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    data_inicio: firstDay.toISOString().slice(0, 10),
    data_fim: lastDay.toISOString().slice(0, 10),
  };
}

const initialPeriod = getCurrentMonthPeriod();

/* ==========================================================================
   COMPONENTES INTERNOS
   ========================================================================== */

function VendedorAvatar({ vendedor, size = "lg" }) {
  const nome = getVendedorName(vendedor);

  const sizeClass =
    size === "sm"
      ? "size-11 text-xs"
      : size === "xl"
        ? "size-20 text-xl"
        : "size-16 text-base";

  return (
    <div
      className={`${sizeClass} relative shrink-0 overflow-hidden rounded-full border-4 border-card bg-primary/[0.08] shadow-[0_20px_45px_-34px_rgba(15,23,42,0.55)]`}
    >
      {vendedor?.image_url ? (
        <img
          src={vendedor.image_url}
          alt={nome}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center font-black text-primary">
          {getInitials(nome)}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onReload }) {
  return (
    <section className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <UserRound className="size-8" />
      </div>

      <h2 className="mt-5 text-xl font-black tracking-[-0.04em] text-dark-title">
        Nenhum vendedor ativo encontrado
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Cadastre vendedores no painel administrativo para liberar o desempenho
        individual no balcão.
      </p>

      <Button
        onClick={onReload}
        className="mt-6 h-12 rounded-full px-6 font-black"
      >
        <RefreshCw className="size-4" />
        Recarregar
      </Button>
    </section>
  );
}

function KpiCard({ title, value, meta, icon: Icon }) {
  return (
    <div className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{title}</p>

          <p className="mt-3 text-2xl font-black tracking-[-0.06em] text-dark-title sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
          <Icon className="size-6" />
        </div>
      </div>

      {meta ? (
        <p className="mt-4 text-sm font-semibold text-primary">{meta}</p>
      ) : null}
    </div>
  );
}

function PinDialog({
  open,
  onOpenChange,
  vendedor,
  pin,
  onPinChange,
  onConfirm,
  isLoading,
}) {
  const nome = getVendedorName(vendedor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[34px] border-border p-0 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.65)] sm:max-w-md">
        <DialogHeader className="border-b border-border bg-primary/[0.04] p-6 text-left">
          <div className="flex items-center gap-4">
            <VendedorAvatar vendedor={vendedor} size="sm" />

            <div>
              <DialogTitle className="text-xl font-black tracking-[-0.05em] text-dark-title">
                Confirmar PIN
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm leading-6">
                Digite o PIN de 4 dígitos para abrir o desempenho de {nome}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className="p-6"
        >
          <label className="text-sm font-black text-dark-title">
            PIN do vendedor
          </label>

          <div className="relative mt-3">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={pin}
              onChange={(event) =>
                onPinChange(
                  event.target.value.replace(/\D/g, "").slice(0, 4)
                )
              }
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              className="h-14 rounded-full border-border bg-background pl-12 pr-4 text-center text-2xl font-black tracking-[0.5em] shadow-none"
              autoFocus
            />
          </div>

          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            O PIN não aparece no relatório e não é exposto no navegador.
          </p>

          <DialogFooter className="mt-6 gap-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-5 font-black"
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-12 rounded-full px-5 font-black"
              disabled={isLoading || pin.length !== 4}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Validando
                </>
              ) : (
                <>
                  <LockKeyhole className="size-4" />
                  Abrir relatório
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function BalcaoDesempenhoPage() {
  const { addToast } = useToast();

  const [vendedores, setVendedores] = useState([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isValidatingPin, setIsValidatingPin] = useState(false);

  const [period, setPeriod] = useState(initialPeriod);
  const [report, setReport] = useState(null);

  const loadVendedores = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/balcao/desempenho", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível carregar vendedores.");
      }

      setVendedores(data?.vendedores || []);
    } catch (error) {
      console.error("BALCAO_DESEMPENHO_LOAD_ERROR:", error);

      const message = error?.message || "Não foi possível carregar vendedores.";

      setLoadError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void loadVendedores();
    });

    return () => {
      cancelled = true;
    };
  }, [loadVendedores]);

  const filteredVendedores = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search);

    return vendedores.filter((vendedor) => {
      const text = normalizeSearchValue(
        [
          vendedor?.nome_completo,
          vendedor?.nome_exibicao,
          vendedor?.cargo,
          vendedor?.status,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return !normalizedSearch || text.includes(normalizedSearch);
    });
  }, [vendedores, search]);

  function handleOpenPin(vendedor) {
    setSelectedVendedor(vendedor);
    setPin("");
    setPinOpen(true);
  }

  function handleCloseReport() {
    setReport(null);
    setSelectedVendedor(null);
    setPin("");
  }

  async function handleValidatePin() {
    if (!selectedVendedor?.id) {
      addToast("Selecione um vendedor.", "error");
      return;
    }

    if (pin.length !== 4) {
      addToast("Informe o PIN com 4 dígitos.", "error");
      return;
    }

    try {
      setIsValidatingPin(true);

      const response = await fetch("/api/balcao/desempenho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          vendedor_id: selectedVendedor.id,
          pin,
          data_inicio: period.data_inicio,
          data_fim: period.data_fim,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível abrir o relatório.");
      }

      setReport(data);
      setPinOpen(false);
      setPin("");
      addToast("Relatório liberado com sucesso.", "success");
    } catch (error) {
      console.error("BALCAO_DESEMPENHO_PIN_ERROR:", error);

      addToast(error?.message || "PIN inválido.", "error");
    } finally {
      setIsValidatingPin(false);
    }
  }

  async function handleRefreshReport() {
    if (!report?.vendedor?.id) return;

    setSelectedVendedor(report.vendedor);
    setPin("");
    setPinOpen(true);
  }

  function handleExportExcel() {
    if (!report) return;

    const vendedorNome = getVendedorName(report.vendedor);

    const headers = [
      "Nº OS",
      "Data",
      "Cliente",
      "Telefone",
      "Tipo",
      "Status",
      "Pagamento",
      "Forma de pagamento",
      "Valor total",
      "Entrada",
      "Restante",
      "Comissão %",
      "Comissão R$",
    ];

    const rows = (report.tabela || []).map((item) => [
      item.numero_os || "",
      formatDateBR(item.data_venda),
      item.cliente || "",
      item.telefone || "",
      item.tipo_os || "",
      item.status || "",
      item.status_pagamento || "",
      item.forma_pagamento || "",
      buildExcelMoney(item.valor_total),
      buildExcelMoney(item.valor_entrada),
      buildExcelMoney(item.valor_restante),
      buildExcelPercent(item.comissao_percentual_aplicada),
      buildExcelMoney(item.comissao_valor_estimado),
    ]);

    const resumo = report.resumo || {};

    const summaryRows = [
      {
        label: "Vendedor",
        value: vendedorNome,
      },
      {
        label: "Período",
        value: `${formatDateBR(report.periodo?.data_inicio)} até ${formatDateBR(
          report.periodo?.data_fim
        )}`,
      },
      {
        label: "Quantidade de vendas",
        value: resumo.quantidade_vendas || 0,
      },
      {
        label: "Total vendido",
        value: formatMoneyBR(resumo.total_vendido),
      },
      {
        label: "Ticket médio",
        value: formatMoneyBR(resumo.ticket_medio),
      },
      {
        label: "Comissão estimada",
        value: formatMoneyBR(resumo.total_comissao),
      },
      {
        label: "Progresso da meta",
        value: formatPercent(resumo.progresso_meta_percentual),
      },
    ];

    const filename = `desempenho-${vendedorNome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${report.periodo?.data_inicio || "inicio"}-${
      report.periodo?.data_fim || "fim"
    }.xls`;

    downloadHtmlExcel({
      filename,
      title: "Relatório de Desempenho do Vendedor",
      subtitle: `Gerado pelo Vision Manager em ${new Intl.DateTimeFormat(
        "pt-BR",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      ).format(new Date())}`,
      headers,
      rows,
      summaryRows,
    });

    addToast("Excel gerado com sucesso.", "success");
  }

  const hasReport = Boolean(report);

  if (hasReport) {
    const vendedor = report.vendedor;
    const resumo = report.resumo || {};
    const vendedorNome = getVendedorName(vendedor);

    return (
      <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-[40px] border border-primary/10 bg-card shadow-[0_35px_110px_-80px_rgba(108,77,230,0.65)]">
            <div className="relative overflow-hidden border-b border-border bg-primary/[0.04] p-5 sm:p-7">
              <div className="absolute -right-12 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 left-1/3 size-44 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <VendedorAvatar vendedor={vendedor} size="xl" />

                  <div>
                    <button
                      type="button"
                      onClick={handleCloseReport}
                      className="mb-3 inline-flex items-center gap-2 text-sm font-black text-primary transition hover:opacity-80"
                    >
                      <ChevronLeft className="size-4" />
                      Voltar para vendedores
                    </button>

                    <h1 className="mt-3 text-3xl font-black tracking-[-0.07em] text-dark-title sm:text-4xl">
                      {vendedorNome}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Período de {formatDateBR(report.periodo?.data_inicio)} até{" "}
                      {formatDateBR(report.periodo?.data_fim)}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleRefreshReport}
                    className="h-12 rounded-full px-5 font-black"
                  >
                    <RefreshCw className="size-4" />
                    Atualizar período
                  </Button>

                  <Button
                    onClick={handleExportExcel}
                    className="h-12 rounded-full px-5 font-black"
                  >
                    <FileSpreadsheet className="size-4" />
                    Baixar Excel
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Vendas no período"
                value={resumo.quantidade_vendas || 0}
                meta="OS de venda não canceladas"
                icon={BarChart3}
              />

              <KpiCard
                title="Total vendido"
                value={formatMoneyBR(resumo.total_vendido)}
                meta={`Ticket médio: ${formatMoneyBR(resumo.ticket_medio)}`}
                icon={Wallet}
              />

              <KpiCard
                title="Comissão estimada"
                value={formatMoneyBR(resumo.total_comissao)}
                meta="Conforme comissão aplicada na OS"
                icon={Medal}
              />

              <KpiCard
                title="Meta mensal"
                value={formatPercent(resumo.progresso_meta_percentual)}
                meta={
                  resumo.faltante_meta === null ||
                  resumo.faltante_meta === undefined
                    ? "Meta oculta ou não configurada"
                    : resumo.faltante_meta > 0
                      ? `Faltam ${formatMoneyBR(resumo.faltante_meta)}`
                      : "Meta batida"
                }
                icon={Target}
              />
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-[-0.05em] text-dark-title">
                    Evolução por dia
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Vendas distribuídas no período selecionado.
                  </p>
                </div>

                <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                  {(report.agrupamentos?.por_dia || []).length} dias
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {(report.agrupamentos?.por_dia || []).length ? (
                  report.agrupamentos.por_dia.map((item) => {
                    const total = Number(resumo.total_vendido || 0);
                    const percent =
                      total > 0
                        ? Math.min((Number(item.valor_total || 0) / total) * 100, 100)
                        : 0;

                    return (
                      <div
                        key={item.data}
                        className="rounded-[26px] border border-border bg-background p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-dark-title">
                              {formatDateBR(item.data)}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                              {item.quantidade} venda(s)
                            </p>
                          </div>

                          <p className="text-sm font-black text-primary">
                            {formatMoneyBR(item.valor_total)}
                          </p>
                        </div>

                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[26px] border border-dashed border-border bg-background p-5 text-sm font-semibold text-muted-foreground">
                    Nenhuma venda encontrada nesse período.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
              <h2 className="text-xl font-black tracking-[-0.05em] text-dark-title">
                Diagnóstico rápido
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Um raio-x simples para o balcão não pilotar no escuro.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-[26px] border border-primary/15 bg-primary/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary" />

                    <div>
                      <p className="text-sm font-black text-dark-title">
                        Vendas pagas
                      </p>

                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPercent(resumo.percentual_vendas_pagas)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-primary/15 bg-primary/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <ArrowDownToLine className="size-5 text-primary" />

                    <div>
                      <p className="text-sm font-black text-dark-title">
                        Vendas entregues
                      </p>

                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPercent(resumo.percentual_vendas_entregues)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-border bg-background p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                    Resumo financeiro
                  </p>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Entrada
                      </span>
                      <strong className="text-sm text-dark-title">
                        {formatMoneyBR(resumo.total_entrada)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Restante
                      </span>
                      <strong className="text-sm text-dark-title">
                        {formatMoneyBR(resumo.total_restante)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
            <div className="border-b border-border p-5 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-[-0.05em] text-dark-title">
                    Tabela do relatório
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Essa é a mesma base usada na exportação em Excel.
                  </p>
                </div>

                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="h-12 rounded-full px-5 font-black"
                >
                  <FileSpreadsheet className="size-4" />
                  Exportar tabela
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      OS
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Data
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Cliente
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Pagamento
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Valor
                    </th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]">
                      Comissão
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {(report.tabela || []).length ? (
                    report.tabela.map((item) => (
                      <tr key={item.id} className="bg-card hover:bg-muted/40">
                        <td className="px-5 py-4 text-sm font-black text-dark-title">
                          {item.numero_os || "Sem número"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-muted-foreground">
                          {formatDateBR(item.data_venda)}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-dark-title">
                            {item.cliente}
                          </p>

                          {item.telefone ? (
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                              {item.telefone}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-primary/[0.08] px-3 py-1 font-black text-primary"
                          >
                            {item.status || "não informado"}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-dark-title">
                            {item.status_pagamento || "não informado"}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {item.forma_pagamento || "não informado"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-dark-title">
                          {formatMoneyBR(item.valor_total)}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-dark-title">
                            {formatMoneyBR(item.comissao_valor_estimado)}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {formatPercent(item.comissao_percentual_aplicada)}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm font-semibold text-muted-foreground"
                      >
                        Nenhuma venda encontrada nesse período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <PinDialog
            open={pinOpen}
            onOpenChange={setPinOpen}
            vendedor={selectedVendedor}
            pin={pin}
            onPinChange={setPin}
            onConfirm={handleValidatePin}
            isLoading={isValidatingPin}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[40px] border border-primary/10 bg-card shadow-[0_35px_110px_-80px_rgba(108,77,230,0.65)]">
          <div className="relative overflow-hidden p-5 sm:p-7">
            <div className="absolute -right-12 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 size-44 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>

                <h1 className="mt-4 text-3xl font-black tracking-[-0.07em] text-dark-title sm:text-4xl">
                  Desempenho dos vendedores
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Selecione um vendedor, informe o PIN e acesse o relatório
                  individual com vendas, meta, comissão e exportação em Excel.
                </p>
              </div>

              <Button
                onClick={loadVendedores}
                variant="outline"
                className="h-12 rounded-full px-5 font-black"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Recarregar
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <label className="text-sm font-black text-dark-title">
                Buscar vendedor
              </label>

              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar por nome ou cargo..."
                  className="h-14 rounded-full border-border bg-background pl-11 pr-4 text-sm font-medium shadow-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-dark-title">
                Início
              </label>

              <Input
                type="date"
                value={period.data_inicio}
                onChange={(event) =>
                  setPeriod((current) => ({
                    ...current,
                    data_inicio: event.target.value,
                  }))
                }
                className="mt-2 h-14 rounded-full border-border bg-background px-4 text-sm font-bold shadow-none"
              />
            </div>

            <div>
              <label className="text-sm font-black text-dark-title">Fim</label>

              <Input
                type="date"
                value={period.data_fim}
                onChange={(event) =>
                  setPeriod((current) => ({
                    ...current,
                    data_fim: event.target.value,
                  }))
                }
                className="mt-2 h-14 rounded-full border-border bg-background px-4 text-sm font-bold shadow-none"
              />
            </div>
          </div>
        </section>

        {loadError ? (
          <section className="rounded-[34px] border border-destructive/20 bg-destructive/[0.08] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-destructive">
                  Erro ao carregar
                </h2>

                <p className="mt-1 text-sm font-semibold text-destructive">
                  {loadError}
                </p>
              </div>

              <Button
                onClick={loadVendedores}
                variant="outline"
                className="h-11 rounded-full px-5 font-black"
              >
                Tentar novamente
              </Button>
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-[34px] border border-border bg-card"
              />
            ))}
          </section>
        ) : !filteredVendedores.length ? (
          <EmptyState onReload={loadVendedores} />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredVendedores.map((vendedor) => {
              const nome = getVendedorName(vendedor);

              return (
                <button
                  key={vendedor.id}
                  type="button"
                  onClick={() => handleOpenPin(vendedor)}
                  className="group overflow-hidden rounded-[34px] border border-border bg-card p-5 text-left shadow-[0_28px_80px_-68px_rgba(15,23,42,0.46)] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_35px_90px_-66px_rgba(108,77,230,0.5)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <VendedorAvatar vendedor={vendedor} />

                    <div className="grid size-11 place-items-center rounded-[18px] bg-primary/[0.08] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Eye className="size-5" />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2 className="line-clamp-2 text-xl font-black tracking-[-0.05em] text-dark-title">
                      {nome}
                    </h2>

                    <p className="mt-1 text-sm font-semibold capitalize text-muted-foreground">
                      {vendedor.cargo || "vendedor"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                      Ativo
                    </Badge>

                    <span className="inline-flex items-center gap-2 text-xs font-black text-primary">
                      <LockKeyhole className="size-4" />
                      Exige PIN
                    </span>
                  </div>
                </button>
              );
            })}
          </section>
        )}

        <PinDialog
          open={pinOpen}
          onOpenChange={(open) => {
            setPinOpen(open);

            if (!open) {
              setPin("");
            }
          }}
          vendedor={selectedVendedor}
          pin={pin}
          onPinChange={setPin}
          onConfirm={handleValidatePin}
          isLoading={isValidatingPin}
        />
      </div>
    </main>
  );
}