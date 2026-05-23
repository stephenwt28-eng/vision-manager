"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  ClienteCard,
  ClienteDetailsDrawer,
  ClienteFormDialog,
  ClientesEmptyState,
  ClientesFilters,
  ClientesKpis,
  ClientesPagination,
  ConfirmDeleteClienteDialog,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  status: "todos",
  contato: "todos",
  cidade: "",
  origem: "",
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

function onlyUsefulText(value = "") {
  return normalizeSearchValue(value);
}

function buildClienteSearchText(cliente) {
  return [
    cliente?.nome_completo,
    cliente?.nome_social,
    cliente?.cpf,
    cliente?.telefone_principal,
    cliente?.telefone_secundario,
    cliente?.email,
    cliente?.cidade,
    cliente?.origem_cliente,
  ]
    .filter(Boolean)
    .join(" ");
}

function prepareClientePayload(payload) {
  return {
    ...payload,
    data_nascimento: payload.data_nascimento || null,
  };
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.status !== "todos" ||
      filters.contato !== "todos" ||
      filters.cidade ||
      filters.origem
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminClientesPage() {
  const { addToast } = useToast();

  const [clientes, setClientes] = useState([]);
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [drawerReceitas, setDrawerReceitas] = useState([]);
  const [drawerOrdensServico, setDrawerOrdensServico] = useState([]);
  const [isLoadingDrawerData, setIsLoadingDrawerData] = useState(false);
  const [drawerDataError, setDrawerDataError] = useState("");
  const [visibleOsCount, setVisibleOsCount] = useState(3);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDeleteCliente = user?.role === "admin";
  const drawerRequestRef = useRef(0);

  /* ==========================================================================
     CARREGAMENTO INICIAL
     ========================================================================== */

  const loadClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/clientes", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível carregar os clientes.");
      }

      setClientes(data?.clientes || []);
    } catch (error) {
      console.error("CLIENTES_PAGE_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar os clientes.";

      setLoadError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoadingUser(true);

      const response = await fetch("/api/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível identificar o usuário.");
      }

      setUser(data?.user || null);
    } catch (error) {
      console.error("CLIENTES_PAGE_USER_ERROR:", error);

      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void loadClientes();
      void loadCurrentUser();
    });

    return () => {
      cancelled = true;
    };
  }, [loadClientes, loadCurrentUser]);

  async function loadDrawerData(clienteId) {
    const requestId = drawerRequestRef.current + 1;
    drawerRequestRef.current = requestId;

    try {
      setIsLoadingDrawerData(true);
      setDrawerDataError("");

      const response = await fetch(
        `/api/clientes?id=${encodeURIComponent(clienteId)}&include=drawer`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "NÃ£o foi possÃ­vel carregar os detalhes do cliente."
        );
      }

      if (drawerRequestRef.current !== requestId) return;

      setSelectedCliente(data?.cliente || null);
      setDrawerReceitas(data?.receitas || []);
      setDrawerOrdensServico(data?.ordensServico || []);
    } catch (error) {
      console.error("CLIENTES_PAGE_DRAWER_ERROR:", error);

      if (drawerRequestRef.current !== requestId) return;

      setDrawerDataError(
        error?.message ||
          "NÃ£o foi possÃ­vel carregar as receitas e o histÃ³rico de OS."
      );
      setDrawerReceitas([]);
      setDrawerOrdensServico([]);
    } finally {
      if (drawerRequestRef.current === requestId) {
        setIsLoadingDrawerData(false);
      }
    }
  }

  /* ==========================================================================
     FILTROS FRONT-END
     ========================================================================== */

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const search = onlyUsefulText(filters.search);
      const clienteSearchText = onlyUsefulText(buildClienteSearchText(cliente));

      const matchesSearch =
        !search || clienteSearchText.includes(search);

      const matchesStatus =
        filters.status === "todos" ||
        (filters.status === "ativos" && cliente.ativo) ||
        (filters.status === "inativos" && !cliente.ativo);

      const matchesContato =
        filters.contato === "todos" ||
        cliente.prefere_contato_por === filters.contato;

      const matchesCidade =
        !filters.cidade ||
        onlyUsefulText(cliente.cidade).includes(
          onlyUsefulText(filters.cidade)
        );

      const matchesOrigem =
        !filters.origem ||
        onlyUsefulText(cliente.origem_cliente).includes(
          onlyUsefulText(filters.origem)
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesContato &&
        matchesCidade &&
        matchesOrigem
      );
    });
  }, [clientes, filters]);

  const totalPages = Math.max(
    Math.ceil(filteredClientes.length / pageSize),
    1
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return filteredClientes.slice(start, end);
  }, [currentPage, filteredClientes, pageSize]);

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  /* ==========================================================================
     ABERTURA DE OVERLAYS
     ========================================================================== */

  function handleOpenCreate() {
    setEditingCliente(null);
    setFormOpen(true);
  }

  function handleOpenView(cliente) {
    setSelectedCliente(cliente);
    setDrawerReceitas([]);
    setDrawerOrdensServico([]);
    setDrawerDataError("");
    setVisibleOsCount(3);
    setDrawerOpen(true);
    void loadDrawerData(cliente.id);
  }

  function handleOpenEdit(cliente) {
    setEditingCliente(cliente);
    handleDrawerOpenChange(false);
    setFormOpen(true);
  }

  function handleOpenDelete(cliente) {
    setClienteToDelete(cliente);
    handleDrawerOpenChange(false);
    setDeleteOpen(true);
  }

  function handleDrawerOpenChange(open) {
    setDrawerOpen(open);

    if (!open) {
      drawerRequestRef.current += 1;
      setSelectedCliente(null);
      setDrawerReceitas([]);
      setDrawerOrdensServico([]);
      setDrawerDataError("");
      setIsLoadingDrawerData(false);
      setVisibleOsCount(3);
    }
  }

  /* ==========================================================================
     CREATE / UPDATE
     ========================================================================== */

  async function handleSubmitCliente(payload) {
    const isEditing = Boolean(payload?.id);

    try {
      setIsSaving(true);

      const response = await fetch("/api/clientes", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prepareClientePayload(payload)),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (isEditing
              ? "Não foi possível atualizar o cliente."
              : "Não foi possível cadastrar o cliente.")
        );
      }

      const savedCliente = data?.cliente;

      if (isEditing) {
        setClientes((current) =>
          current.map((cliente) =>
            cliente.id === savedCliente.id ? savedCliente : cliente
          )
        );

        if (selectedCliente?.id === savedCliente.id) {
          setSelectedCliente(savedCliente);
        }

        addToast("Cliente atualizado com sucesso!");
      } else {
        setClientes((current) => [savedCliente, ...current]);
        setPage(1);
        addToast("Cliente cadastrado com sucesso!");
      }

      setFormOpen(false);
      setEditingCliente(null);
    } catch (error) {
      console.error("CLIENTES_PAGE_SAVE_ERROR:", error);

      addToast(
        error?.message ||
          "Ocorreu um erro ao salvar o cliente.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ==========================================================================
     DELETE
     ========================================================================== */

  async function handleConfirmDelete() {
    if (!clienteToDelete?.id) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/clientes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: clienteToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível excluir o cliente."
        );
      }

      setClientes((current) =>
        current.filter((cliente) => cliente.id !== clienteToDelete.id)
      );

      if (selectedCliente?.id === clienteToDelete.id) {
        setSelectedCliente(null);
        setDrawerReceitas([]);
        setDrawerOrdensServico([]);
      }

      setDeleteOpen(false);
      setClienteToDelete(null);

      addToast("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("CLIENTES_PAGE_DELETE_ERROR:", error);

      addToast(
        error?.message ||
          "Ocorreu um erro ao excluir o cliente.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleLoadMoreOs() {
    setVisibleOsCount((current) => current + 3);
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho simples, sem apresentação inicial */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-4xl">
            Clientes
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Cadastre, consulte e organize a base de atendimento da ótica.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-14 rounded-full px-6 font-black"
        >
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </section>

      {/* KPIs */}
      <ClientesKpis clientes={clientes} />

      {/* Filtros */}
      <ClientesFilters
        filters={filters}
        onChangeFilters={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredClientes.length}
      />

      {/* Conteúdo */}
      {isLoading ? (
        <ClientesLoadingState />
      ) : loadError ? (
        <ClientesErrorState
          message={loadError}
          onRetry={loadClientes}
        />
      ) : paginatedClientes.length === 0 ? (
        <ClientesEmptyState hasFilters={hasActiveFilters(filters)} />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedClientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onView={handleOpenView}
              />
            ))}
          </section>

          <ClientesPagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredClientes.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form criar/editar */}
      <ClienteFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingCliente(null);
          }
        }}
        cliente={editingCliente}
        onSubmit={handleSubmitCliente}
        isSaving={isSaving}
      />

      {/* Drawer detalhes */}
      <ClienteDetailsDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        cliente={selectedCliente}
        receitas={drawerReceitas}
        ordensServico={drawerOrdensServico}
        isLoadingRelated={isLoadingDrawerData}
        relatedError={drawerDataError}
        visibleOsCount={visibleOsCount}
        onLoadMoreOs={handleLoadMoreOs}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        canDelete={canDeleteCliente && !isLoadingUser}
      />

      {/* Confirmar exclusão */}
      <ConfirmDeleteClienteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setClienteToDelete(null);
          }
        }}
        cliente={clienteToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

/* ==========================================================================
   ESTADOS AUXILIARES DA PÁGINA
   ========================================================================== */

function ClientesLoadingState() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[210px] animate-pulse rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.26)] md:aspect-[2/1]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-full">
              <div className="h-6 w-28 rounded-full bg-muted" />
              <div className="mt-5 h-7 w-4/5 rounded-full bg-muted" />
              <div className="mt-3 h-4 w-2/5 rounded-full bg-muted" />
            </div>

            <div className="size-12 shrink-0 rounded-[20px] bg-muted" />
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-4 w-3/4 rounded-full bg-muted" />
            <div className="h-4 w-2/3 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </section>
  );
}

function ClientesErrorState({ message, onRetry }) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.36)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <UsersRound className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        Não foi possível carregar os clientes.
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {message}
      </p>

      <Button
        onClick={onRetry}
        variant="outline"
        className="mt-5 h-12 rounded-full px-6 font-black"
      >
        <RefreshCw className="size-4" />
        Tentar novamente
      </Button>
    </section>
  );
}
