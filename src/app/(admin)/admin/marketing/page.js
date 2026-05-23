"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "@/contexts/ToastContext";

import {
  DEFAULT_MARKETING_MESSAGES,
  MARKETING_SEGMENTS,
  BulkWhatsappPanel,
  MarketingClienteCard,
  MarketingEmptyState,
  MarketingErrorState,
  MarketingFilters,
  MarketingKpis,
  MarketingListHeader,
  MarketingLoadingState,
  MarketingMessageBox,
  MarketingPageHeader,
  MarketingPagination,
  MarketingSegments,
  buildMessage,
  buildWhatsappLink,
  formatDateBR,
  normalizeSearch,
  onlyDigits,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  contactStatus: "todos",
  onlyActive: "todos",
};

const PRESCRIPTION_EXPIRING_START_MONTHS = 10;
const PRESCRIPTION_EXPIRED_MONTHS = 12;
const TWO_YEARS_IN_MONTHS = 24;

/* ==========================================================================
   HELPERS DE DATA
   ========================================================================== */

function getDateValue(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getDateOnlyValue(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (!Number.isNaN(date.getTime())) return date;

  return getDateValue(value);
}

function differenceInMonths(fromDate, toDate = new Date()) {
  if (!fromDate) return null;

  const years = toDate.getFullYear() - fromDate.getFullYear();
  const months = toDate.getMonth() - fromDate.getMonth();

  return years * 12 + months;
}

function isBirthdayThisMonth(cliente) {
  const date = getDateOnlyValue(cliente?.data_nascimento);

  if (!date) return false;

  const now = new Date();

  return date.getMonth() === now.getMonth();
}

function getClienteId(cliente) {
  return cliente?.id || cliente?.cliente_id;
}

function getClienteName(cliente) {
  return cliente?.nome_completo || cliente?.nome || "Cliente sem nome";
}

function getClientePhone(cliente) {
  return (
    cliente?.telefone_principal ||
    cliente?.telefone ||
    cliente?.whatsapp ||
    cliente?.celular ||
    ""
  );
}

function hasPhone(cliente) {
  return Boolean(onlyDigits(getClientePhone(cliente)));
}

function isClienteActive(cliente) {
  if (typeof cliente?.ativo === "boolean") return cliente.ativo;
  if (cliente?.status === "inativo") return false;
  if (cliente?.status === "bloqueado") return false;

  return true;
}

/* ==========================================================================
   INDEXADORES
   ========================================================================== */

function getLatestByClienteId({
  records = [],
  dateFields = [],
  clienteIdFields = ["cliente_id"],
}) {
  const map = new Map();

  records.forEach((record) => {
    const clienteId = clienteIdFields
      .map((field) => record?.[field])
      .find(Boolean);

    if (!clienteId) return;

    const date = dateFields
      .map((field) => getDateValue(record?.[field]))
      .find(Boolean);

    if (!date) return;

    const current = map.get(clienteId);

    if (!current || date > current.date) {
      map.set(clienteId, {
        record,
        date,
      });
    }
  });

  return map;
}

function enrichClientes({
  clientes = [],
  ordensServico = [],
  receitas = [],
}) {
  const latestOsByCliente = getLatestByClienteId({
    records: ordensServico,
    dateFields: ["data_venda", "created_at"],
    clienteIdFields: ["cliente_id"],
  });

  const latestReceitaByCliente = getLatestByClienteId({
    records: receitas,
    dateFields: ["data_receita", "created_at"],
    clienteIdFields: ["cliente_id"],
  });

  return clientes.map((cliente) => {
    const clienteId = getClienteId(cliente);

    const latestOs = latestOsByCliente.get(clienteId);
    const latestReceita = latestReceitaByCliente.get(clienteId);

    const monthsSinceLastOs = latestOs?.date
      ? differenceInMonths(latestOs.date)
      : null;

    const monthsSinceLastReceita = latestReceita?.date
      ? differenceInMonths(latestReceita.date)
      : null;

    return {
      ...cliente,

      marketing_latest_os: latestOs?.record || null,
      marketing_latest_os_date: latestOs?.date || null,
      marketing_months_since_last_os: monthsSinceLastOs,
      ultima_compra_label: latestOs?.date ? formatDateBR(latestOs.date) : "",

      marketing_latest_receita: latestReceita?.record || null,
      marketing_latest_receita_date: latestReceita?.date || null,
      marketing_months_since_last_receita: monthsSinceLastReceita,
      ultima_receita_label: latestReceita?.date
        ? formatDateBR(latestReceita.date)
        : "",
    };
  });
}

/* ==========================================================================
   FILTROS E SEGMENTOS
   ========================================================================== */

function buildClienteSearchText(cliente) {
  return [
    cliente?.nome_completo,
    cliente?.nome,
    cliente?.nome_social,
    cliente?.cpf,
    cliente?.telefone_principal,
    cliente?.telefone_secundario,
    cliente?.telefone,
    cliente?.whatsapp,
    cliente?.email,
    cliente?.cidade,
    cliente?.estado,
    cliente?.origem_cliente,
  ]
    .filter(Boolean)
    .join(" ");
}

function applyBaseFilters(clientes, filters) {
  const search = normalizeSearch(filters.search);

  return clientes.filter((cliente) => {
    const clienteSearchText = normalizeSearch(buildClienteSearchText(cliente));

    const matchesSearch = !search || clienteSearchText.includes(search);

    const matchesContactStatus =
      filters.contactStatus === "todos" ||
      (filters.contactStatus === "com_telefone" && hasPhone(cliente)) ||
      (filters.contactStatus === "sem_telefone" && !hasPhone(cliente));

    const matchesActive =
      filters.onlyActive === "todos" ||
      (filters.onlyActive === "ativos" && isClienteActive(cliente)) ||
      (filters.onlyActive === "inativos" && !isClienteActive(cliente));

    return matchesSearch && matchesContactStatus && matchesActive;
  });
}

function applySegment(clientes, segmentId) {
  return clientes
    .map((cliente) => {
      if (segmentId === "aniversariantes") {
        return {
          ...cliente,
          marketing_reason: isBirthdayThisMonth(cliente)
            ? "Aniversariante do mês"
            : "",
        };
      }

      if (segmentId === "receita_vencendo") {
        const months = cliente.marketing_months_since_last_receita;

        return {
          ...cliente,
          marketing_reason:
            months !== null
              ? `Receita com aproximadamente ${months} mês${
                  months === 1 ? "" : "es"
                }`
              : "",
        };
      }

      if (segmentId === "receita_vencida") {
        const months = cliente.marketing_months_since_last_receita;

        return {
          ...cliente,
          marketing_reason:
            months !== null
              ? `Receita vencida há aproximadamente ${months} mês${
                  months === 1 ? "" : "es"
                }`
              : "",
        };
      }

      if (segmentId === "dois_anos_sem_oculos") {
        const months = cliente.marketing_months_since_last_os;

        return {
          ...cliente,
          marketing_reason:
            months !== null
              ? `Sem compra há aproximadamente ${months} mês${
                  months === 1 ? "" : "es"
                }`
              : "Sem compra registrada",
        };
      }

      if (segmentId === "promocao") {
        return {
          ...cliente,
          marketing_reason: "Disponível para campanha promocional",
        };
      }

      return cliente;
    })
    .filter((cliente) => {
      if (segmentId === "todos") return true;

      if (segmentId === "promocao") {
        return hasPhone(cliente);
      }

      if (segmentId === "aniversariantes") {
        return isBirthdayThisMonth(cliente);
      }

      if (segmentId === "receita_vencendo") {
        const months = cliente.marketing_months_since_last_receita;

        return (
          months !== null &&
          months >= PRESCRIPTION_EXPIRING_START_MONTHS &&
          months < PRESCRIPTION_EXPIRED_MONTHS
        );
      }

      if (segmentId === "receita_vencida") {
        const months = cliente.marketing_months_since_last_receita;

        return months !== null && months >= PRESCRIPTION_EXPIRED_MONTHS;
      }

      if (segmentId === "dois_anos_sem_oculos") {
        const months = cliente.marketing_months_since_last_os;

        return months === null || months >= TWO_YEARS_IN_MONTHS;
      }

      return true;
    });
}

function getSegmentCounts(clientes) {
  return MARKETING_SEGMENTS.reduce((acc, segment) => {
    acc[segment.id] = applySegment(clientes, segment.id).length;

    return acc;
  }, {});
}

function getStats(clientes) {
  return {
    withPhone: clientes.filter(hasPhone).length,
    birthdays: clientes.filter(isBirthdayThisMonth).length,
    expiringPrescriptions: clientes.filter((cliente) => {
      const months = cliente.marketing_months_since_last_receita;

      return (
        months !== null &&
        months >= PRESCRIPTION_EXPIRING_START_MONTHS &&
        months < PRESCRIPTION_EXPIRED_MONTHS
      );
    }).length,
    inactiveTwoYears: clientes.filter((cliente) => {
      const months = cliente.marketing_months_since_last_os;

      return months === null || months >= TWO_YEARS_IN_MONTHS;
    }).length,
  };
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.contactStatus !== "todos" ||
      filters.onlyActive !== "todos"
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminMarketingPage() {
  const { addToast } = useToast();

  const [clientes, setClientes] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [receitas, setReceitas] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeSegment, setActiveSegment] = useState("todos");
  const [filters, setFilters] = useState(initialFilters);

  const [messageTemplate, setMessageTemplate] = useState(
    DEFAULT_MARKETING_MESSAGES.todos
  );

  const [selectedIds, setSelectedIds] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ==========================================================================
     CARREGAMENTO
     ========================================================================== */

  const loadMarketing = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/marketing", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar os dados de marketing."
        );
      }

      const marketing = data?.marketing || {};

      setClientes(marketing?.clientes || []);
      setOrdensServico(marketing?.ordensServico || []);
      setReceitas(marketing?.receitas || []);
    } catch (error) {
      console.error("MARKETING_PAGE_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar os dados de marketing.";

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

      void loadMarketing();
    });

    return () => {
      cancelled = true;
    };
  }, [loadMarketing]);

  /* ==========================================================================
     DADOS CALCULADOS NO FRONT
     ========================================================================== */

  const enrichedClientes = useMemo(() => {
    return enrichClientes({
      clientes,
      ordensServico,
      receitas,
    });
  }, [clientes, ordensServico, receitas]);

  const filteredBaseClientes = useMemo(() => {
    return applyBaseFilters(enrichedClientes, filters);
  }, [enrichedClientes, filters]);

  const segmentedClientes = useMemo(() => {
    return applySegment(filteredBaseClientes, activeSegment);
  }, [activeSegment, filteredBaseClientes]);

  const segmentCounts = useMemo(() => {
    return getSegmentCounts(filteredBaseClientes);
  }, [filteredBaseClientes]);

  const stats = useMemo(() => {
    return getStats(enrichedClientes);
  }, [enrichedClientes]);

  const totalPages = Math.max(Math.ceil(segmentedClientes.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return segmentedClientes.slice(start, end);
  }, [currentPage, pageSize, segmentedClientes]);

  const selectedClientes = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return segmentedClientes.filter((cliente) =>
      selectedSet.has(getClienteId(cliente))
    );
  }, [segmentedClientes, selectedIds]);

  const visibleIds = useMemo(() => {
    return paginatedClientes.map(getClienteId).filter(Boolean);
  }, [paginatedClientes]);

  const allVisibleSelected = useMemo(() => {
    if (!visibleIds.length) return false;

    return visibleIds.every((id) => selectedIds.includes(id));
  }, [selectedIds, visibleIds]);

  /* ==========================================================================
     EVENTOS
     ========================================================================== */

  function handleSegmentChange(segmentId) {
    setActiveSegment(segmentId);
    setMessageTemplate(
      DEFAULT_MARKETING_MESSAGES[segmentId] ||
        DEFAULT_MARKETING_MESSAGES.todos
    );
    setSelectedIds([]);
    setPage(1);
  }

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    setSelectedIds([]);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    setSelectedIds([]);
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function handleToggleSelected(cliente) {
    const id = getClienteId(cliente);

    if (!id) return;

    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  function handleToggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      const next = new Set([...current, ...visibleIds]);

      return Array.from(next);
    });
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function handleOpenWhatsapp(cliente) {
    const phone = getClientePhone(cliente);
    const message = buildMessage(messageTemplate, cliente);
    const link = buildWhatsappLink({
      phone,
      message,
    });

    if (!link) {
      addToast("Cliente sem telefone válido para WhatsApp.", "error");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function handleCopyMessage(cliente) {
    try {
      const message = buildMessage(messageTemplate, cliente);

      await navigator.clipboard.writeText(message);

      addToast("Mensagem copiada.");
    } catch (error) {
      console.error("MARKETING_COPY_MESSAGE_ERROR:", error);

      addToast("Não foi possível copiar a mensagem.", "error");
    }
  }

  function handleOpenSelected() {
    const clientesWithPhone = selectedClientes.filter(hasPhone);

    if (!clientesWithPhone.length) {
      addToast("Selecione pelo menos um cliente com telefone.", "error");
      return;
    }

    clientesWithPhone.forEach((cliente, index) => {
      const phone = getClientePhone(cliente);
      const message = buildMessage(messageTemplate, cliente);
      const link = buildWhatsappLink({
        phone,
        message,
      });

      if (!link) return;

      window.setTimeout(() => {
        window.open(link, "_blank", "noopener,noreferrer");
      }, index * 350);
    });

    addToast(
      `${clientesWithPhone.length} conversa${
        clientesWithPhone.length === 1 ? "" : "s"
      } aberta${clientesWithPhone.length === 1 ? "" : "s"} no WhatsApp.`
    );
  }

  async function handleCopySelected() {
    try {
      const clientesWithPhone = selectedClientes.filter(hasPhone);

      if (!clientesWithPhone.length) {
        addToast("Selecione pelo menos um cliente com telefone.", "error");
        return;
      }

      const content = clientesWithPhone
        .map((cliente) => {
          const name = getClienteName(cliente);
          const phone = getClientePhone(cliente);
          const message = buildMessage(messageTemplate, cliente);
          const link = buildWhatsappLink({
            phone,
            message,
          });

          return `${name} - ${phone}\n${link}`;
        })
        .join("\n\n");

      await navigator.clipboard.writeText(content);

      addToast("Lista de links copiada.");
    } catch (error) {
      console.error("MARKETING_COPY_SELECTED_ERROR:", error);

      addToast("Não foi possível copiar a lista.", "error");
    }
  }

  const activeSegmentMeta =
    MARKETING_SEGMENTS.find((segment) => segment.id === activeSegment) ||
    MARKETING_SEGMENTS[0];

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <MarketingPageHeader
        onRefresh={loadMarketing}
        isLoading={isLoading}
        totalClientes={clientes.length}
      />

      <MarketingKpis stats={stats} />

      <MarketingSegments
        activeSegment={activeSegment}
        onChange={handleSegmentChange}
        counts={segmentCounts}
      />

      <MarketingFilters
        filters={filters}
        onChange={handleFiltersChange}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters(filters)}
      />

      <MarketingMessageBox
        activeSegment={activeSegment}
        template={messageTemplate}
        onTemplateChange={setMessageTemplate}
        selectedCount={selectedClientes.length}
        onClearSelection={handleClearSelection}
      />

      <BulkWhatsappPanel
        selectedClientes={selectedClientes}
        template={messageTemplate}
        onOpenSelected={handleOpenSelected}
        onCopySelected={handleCopySelected}
      />

      <MarketingListHeader
        title={activeSegmentMeta.title}
        description={activeSegmentMeta.description}
        visibleCount={paginatedClientes.length}
        totalCount={segmentedClientes.length}
        allSelected={allVisibleSelected}
        hasItems={Boolean(paginatedClientes.length)}
        onToggleAll={handleToggleAllVisible}
      />

      {loadError ? (
        <MarketingErrorState message={loadError} onRetry={loadMarketing} />
      ) : null}

      {isLoading ? (
        <MarketingLoadingState />
      ) : !loadError && !paginatedClientes.length ? (
        <MarketingEmptyState />
      ) : !loadError ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {paginatedClientes.map((cliente) => {
            const id = getClienteId(cliente);

            return (
              <MarketingClienteCard
                key={id}
                cliente={cliente}
                isSelected={selectedIds.includes(id)}
                template={messageTemplate}
                onToggleSelected={handleToggleSelected}
                onOpenWhatsapp={handleOpenWhatsapp}
                onCopyMessage={handleCopyMessage}
              />
            );
          })}
        </div>
      ) : null}

      {!isLoading && !loadError && segmentedClientes.length ? (
        <MarketingPagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}
    </main>
  );
}