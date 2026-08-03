"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  CatalogoDetailsDrawer,
  CatalogoEmptyState,
  CatalogoFilters,
  CatalogoFormDialog,
  CatalogoItemCard,
  CatalogoKpis,
  CatalogoPagination,
  CatalogoTabs,
  ConfirmDeleteCatalogoDialog,
  catalogTabs,
  getCatalogoItemSearchText,
  getCatalogoTabMeta,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  status: "todos",

  // lentes
  tipo_lente: "todos",
  laboratorio: "",
  marca: "",

  // armações
  tipo_armacao: "todos",
  cor: "",

  // laboratórios
  nome: "",
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

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.status !== "todos" ||
      filters.tipo_lente !== "todos" ||
      filters.laboratorio ||
      filters.marca ||
      filters.tipo_armacao !== "todos" ||
      filters.cor ||
      filters.nome
  );
}

function filterCatalogoItems(items = [], activeTab, filters) {
  return items.filter((item) => {
    const search = onlyUsefulText(filters.search);
    const itemSearchText = onlyUsefulText(
      getCatalogoItemSearchText(activeTab, item)
    );

    const matchesSearch = !search || itemSearchText.includes(search);

    const matchesStatus =
      filters.status === "todos" ||
      (filters.status === "ativos" && item.ativo) ||
      (filters.status === "inativos" && !item.ativo);

    if (activeTab === "lentes") {
      const matchesTipo =
        filters.tipo_lente === "todos" ||
        item.tipo_lente === filters.tipo_lente;

      const matchesLaboratorio =
        !filters.laboratorio ||
        onlyUsefulText(item.laboratorio).includes(
          onlyUsefulText(filters.laboratorio)
        );

      const matchesMarca =
        !filters.marca ||
        onlyUsefulText(item.marca).includes(onlyUsefulText(filters.marca));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTipo &&
        matchesLaboratorio &&
        matchesMarca
      );
    }

    if (activeTab === "armacoes") {
      const matchesTipo =
        filters.tipo_armacao === "todos" ||
        item.tipo_armacao === filters.tipo_armacao;

      const matchesMarca =
        !filters.marca ||
        onlyUsefulText(item.marca).includes(onlyUsefulText(filters.marca));

      const matchesCor =
        !filters.cor ||
        onlyUsefulText(item.cor).includes(onlyUsefulText(filters.cor));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTipo &&
        matchesMarca &&
        matchesCor
      );
    }

    const matchesNome =
      !filters.nome ||
      onlyUsefulText(item.nome).includes(onlyUsefulText(filters.nome));

    return matchesSearch && matchesStatus && matchesNome;
  });
}

function replaceCatalogItem(items = [], updatedItem) {
  return items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
}

function removeCatalogItem(items = [], itemId) {
  return items.filter((item) => item.id !== itemId);
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminCatalogoPage() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("lentes");

  const [catalogo, setCatalogo] = useState({
    lentes: [],
    armacoes: [],
    laboratorios: [],
  });

  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeMeta = getCatalogoTabMeta(activeTab);
  const activeItems = catalogo[activeTab] || [];

  const canDeleteItem = user?.role === "admin";

  /* ==========================================================================
     CARREGAMENTO
     ========================================================================== */

  const loadCatalogo = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/catalogo?ativos=false", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível carregar o catálogo.");
      }

      setCatalogo({
        lentes: data?.catalogo?.lentes || [],
        armacoes: data?.catalogo?.armacoes || [],
        laboratorios: data?.catalogo?.laboratorios || [],
      });
    } catch (error) {
      console.error("CATALOGO_PAGE_LOAD_ERROR:", error);

      const message = error?.message || "Não foi possível carregar o catálogo.";

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
      console.error("CATALOGO_PAGE_USER_ERROR:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void loadCatalogo();
      void loadCurrentUser();
    });

    return () => {
      cancelled = true;
    };
  }, [loadCatalogo, loadCurrentUser]);

  /* ==========================================================================
     FILTROS / PAGINAÇÃO
     ========================================================================== */

  const counts = useMemo(() => {
    return {
      lentes: catalogo.lentes.length,
      armacoes: catalogo.armacoes.length,
      laboratorios: catalogo.laboratorios.length,
    };
  }, [catalogo]);

  const filteredItems = useMemo(() => {
    return filterCatalogoItems(activeItems, activeTab, filters);
  }, [activeItems, activeTab, filters]);

  const totalPages = Math.max(Math.ceil(filteredItems.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return filteredItems.slice(start, end);
  }, [currentPage, filteredItems, pageSize]);

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setFilters(initialFilters);
    setPage(1);
    handleDrawerOpenChange(false);
    setFormOpen(false);
    setEditingItem(null);
    setDeleteOpen(false);
    setItemToDelete(null);
  }

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
     OVERLAYS
     ========================================================================== */

  function handleOpenCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function handleOpenView(item) {
    setSelectedItem(item);
    setDrawerOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    handleDrawerOpenChange(false);
    setFormOpen(true);
  }

  function handleOpenDelete(item) {
    setItemToDelete(item);
    handleDrawerOpenChange(false);
    setDeleteOpen(true);
  }

  function handleDrawerOpenChange(open) {
    setDrawerOpen(open);

    if (!open) {
      setSelectedItem(null);
    }
  }

  /* ==========================================================================
     CRUD
     ========================================================================== */

  async function handleSubmitCatalogItem(payload) {
    try {
      setIsSaving(true);

      const isEditing = Boolean(payload?.id);

      const response = await fetch("/api/catalogo", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Não foi possível ${isEditing ? "atualizar" : "cadastrar"} o item.`
        );
      }

      const returnedItem =
        data?.lente || data?.armacao || data?.laboratorio || null;

      if (!returnedItem) {
        throw new Error("A API não retornou o item salvo.");
      }

      setCatalogo((current) => {
        const currentItems = current[activeTab] || [];

        return {
          ...current,
          [activeTab]: isEditing
            ? replaceCatalogItem(currentItems, returnedItem)
            : [returnedItem, ...currentItems],
        };
      });

      setFormOpen(false);
      setEditingItem(null);

      addToast(data?.message || "Item salvo com sucesso.");
    } catch (error) {
      console.error("CATALOGO_PAGE_SAVE_ERROR:", error);

      addToast(error?.message || "Não foi possível salvar o item.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete(item) {
    if (!item?.id) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/catalogo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          tipo: activeTab,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível excluir o item.");
      }

      setCatalogo((current) => ({
        ...current,
        [activeTab]: removeCatalogItem(current[activeTab] || [], item.id),
      }));

      setDeleteOpen(false);
      setItemToDelete(null);
      addToast(data?.message || "Item excluído com sucesso.");
    } catch (error) {
      console.error("CATALOGO_PAGE_DELETE_ERROR:", error);

      addToast(error?.message || "Não foi possível excluir o item.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  const isBooting = isLoading || isLoadingUser;
  const hasFilters = hasActiveFilters(filters);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.44)] md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">

          <h1 className="mt-4 text-3xl font-black tracking-[-0.065em] text-dark-title md:text-4xl">
            Catálogo da ótica
          </h1>

        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadCatalogo}
            disabled={isLoading}
            className="h-12 rounded-full px-5 font-black"
          >
            <RefreshCw
              className={["size-4", isLoading ? "animate-spin" : ""].join(" ")}
            />
            Atualizar
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-12 rounded-full px-5 font-black"
          >
            <Plus className="size-4" />
            {activeMeta.actionLabel}
          </Button>
        </div>
      </section>

      <CatalogoTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      <CatalogoFilters
        activeTab={activeTab}
        filters={filters}
        onChangeFilters={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredItems.length}
      />

      {isBooting ? (
        <CatalogoLoadingGrid />
      ) : loadError ? (
        <CatalogoErrorState message={loadError} onRetry={loadCatalogo} />
      ) : paginatedItems.length ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((item) => (
              <CatalogoItemCard
                key={item.id}
                activeTab={activeTab}
                item={item}
                onView={handleOpenView}
              />
            ))}
          </section>

          <CatalogoPagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredItems.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      ) : (
        <CatalogoEmptyState activeTab={activeTab} hasFilters={hasFilters} />
      )}

      <CatalogoFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingItem(null);
          }
        }}
        activeTab={activeTab}
        item={editingItem}
        onSubmit={handleSubmitCatalogItem}
        isSaving={isSaving}
      />

      <CatalogoDetailsDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        activeTab={activeTab}
        item={selectedItem}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        canDelete={canDeleteItem}
      />

      <ConfirmDeleteCatalogoDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setItemToDelete(null);
          }
        }}
        activeTab={activeTab}
        item={itemToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}

/* ==========================================================================
   ESTADOS VISUAIS
   ========================================================================== */

function CatalogoLoadingGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[220px] animate-pulse rounded-[30px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 w-28 rounded-full bg-muted" />
              <div className="h-7 w-4/5 rounded-full bg-muted" />
              <div className="h-4 w-2/3 rounded-full bg-muted" />
            </div>

            <div className="size-12 rounded-[20px] bg-muted" />
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-4 w-3/4 rounded-full bg-muted" />
            <div className="h-4 w-1/2 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </section>
  );
}

function CatalogoErrorState({ message, onRetry }) {
  return (
    <section className="rounded-[38px] border border-destructive/20 bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-destructive/10 text-destructive">
        <RefreshCw className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        Não foi possível carregar o catálogo.
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {message || "A rota respondeu atravessado. Tenta atualizar de novo."}
      </p>

      <Button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-full px-6 font-black"
      >
        <RefreshCw className="size-4" />
        Tentar novamente
      </Button>
    </section>
  );
}