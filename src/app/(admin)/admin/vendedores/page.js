"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Plus,
  RefreshCw,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  ConfirmDeleteVendedorDialog,
  VendedorCard,
  VendedorDetailsDrawer,
  VendedorFormDialog,
  VendedoresEmptyState,
  VendedoresFilters,
  VendedoresKpis,
  VendedoresPagination,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  status: "todos",
  cargo: "todos",
  imagem: "todas",
  comissaoMinima: "",
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

function buildVendedorSearchText(vendedor) {
  return [
    vendedor?.nome_completo,
    vendedor?.nome_exibicao,
    vendedor?.cpf,
    vendedor?.telefone,
    vendedor?.email,
    vendedor?.cargo,
    vendedor?.status,
    vendedor?.observacoes,
  ]
    .filter(Boolean)
    .join(" ");
}

function parsePercentageFilter(value = "") {
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.status !== "todos" ||
      filters.cargo !== "todos" ||
      filters.imagem !== "todas" ||
      filters.comissaoMinima
  );
}

function getPinNoticeMessage(context) {
  if (context === "create") {
    return "Vendedor cadastrado. Anote o PIN temporário antes de fechar este aviso.";
  }

  return "PIN redefinido. Anote o novo código antes de fechar este aviso.";
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminVendedoresPage() {
  const { addToast } = useToast();

  const [vendedores, setVendedores] = useState([]);
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [vendedorToDelete, setVendedorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pinNotice, setPinNotice] = useState(null);

  const isAdmin = user?.role === "admin";
  const canDeleteVendedor = isAdmin;
  const canManagePin = isAdmin;

  /* ==========================================================================
     CARREGAMENTO INICIAL
     ========================================================================== */

  const loadVendedores = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/vendedores", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar os vendedores."
        );
      }

      setVendedores(data?.vendedores || []);
    } catch (error) {
      console.error("VENDEDORES_PAGE_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar os vendedores.";

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
        throw new Error(
          data?.error || "Não foi possível identificar o usuário."
        );
      }

      setUser(data?.user || null);
    } catch (error) {
      console.error("VENDEDORES_PAGE_USER_ERROR:", error);

      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void loadVendedores();
      void loadCurrentUser();
    });

    return () => {
      cancelled = true;
    };
  }, [loadVendedores, loadCurrentUser]);

  /* ==========================================================================
     FILTROS FRONT-END
     ========================================================================== */

  const filteredVendedores = useMemo(() => {
    return vendedores.filter((vendedor) => {
      const search = onlyUsefulText(filters.search);
      const vendedorSearchText = onlyUsefulText(
        buildVendedorSearchText(vendedor)
      );

      const matchesSearch =
        !search || vendedorSearchText.includes(search);

      const matchesStatus =
        filters.status === "todos" ||
        vendedor.status === filters.status;

      const matchesCargo =
        filters.cargo === "todos" ||
        vendedor.cargo === filters.cargo;

      const matchesImagem =
        filters.imagem === "todas" ||
        (filters.imagem === "com_foto" && Boolean(vendedor.image_url)) ||
        (filters.imagem === "sem_foto" && !vendedor.image_url);

      const comissaoMinima = parsePercentageFilter(
        filters.comissaoMinima
      );

      const comissaoVendedor = Number(
        vendedor.comissao_padrao_percentual || 0
      );

      const matchesComissao =
        !filters.comissaoMinima ||
        comissaoVendedor >= comissaoMinima;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCargo &&
        matchesImagem &&
        matchesComissao
      );
    });
  }, [vendedores, filters]);

  const totalPages = Math.max(
    Math.ceil(filteredVendedores.length / pageSize),
    1
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedVendedores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return filteredVendedores.slice(start, end);
  }, [currentPage, filteredVendedores, pageSize]);

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
    setEditingVendedor(null);
    setFormOpen(true);
  }

  function handleOpenView(vendedor) {
    setSelectedVendedor(vendedor);
    setDrawerOpen(true);
  }

  function handleOpenEdit(vendedor) {
    setEditingVendedor(vendedor);
    setDrawerOpen(false);
    setFormOpen(true);
  }

  function handleOpenDelete(vendedor) {
    setVendedorToDelete(vendedor);
    setDrawerOpen(false);
    setDeleteOpen(true);
  }

  function handleDrawerOpenChange(open) {
    setDrawerOpen(open);

    if (!open) {
      setSelectedVendedor(null);
    }
  }

  /* ==========================================================================
     CREATE / UPDATE
     ========================================================================== */

  async function handleSubmitVendedor(payload) {
    const isEditing = Boolean(payload?.id);

    try {
      setIsSaving(true);

      const response = await fetch("/api/vendedores", {
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
            (isEditing
              ? "Não foi possível atualizar o vendedor."
              : "Não foi possível cadastrar o vendedor.")
        );
      }

      const savedVendedor = data?.vendedor;

      if (isEditing) {
        setVendedores((current) =>
          current.map((vendedor) =>
            vendedor.id === savedVendedor.id
              ? savedVendedor
              : vendedor
          )
        );

        if (selectedVendedor?.id === savedVendedor.id) {
          setSelectedVendedor(savedVendedor);
        }

        addToast("Vendedor atualizado com sucesso!");
      } else {
        setVendedores((current) => [
          savedVendedor,
          ...current,
        ]);

        setPage(1);

        addToast("Vendedor cadastrado com sucesso!");
      }

      if (data?.pin_temporario) {
        setPinNotice({
          pin: data.pin_temporario,
          context: isEditing ? "update" : "create",
          vendedorNome:
            savedVendedor?.nome_exibicao ||
            savedVendedor?.nome_completo ||
            "Vendedor",
        });
      }

      setFormOpen(false);
      setEditingVendedor(null);
    } catch (error) {
      console.error("VENDEDORES_PAGE_SAVE_ERROR:", error);

      addToast(
        error?.message ||
          "Ocorreu um erro ao salvar o vendedor.",
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
    if (!vendedorToDelete?.id) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/vendedores", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: vendedorToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível excluir o vendedor."
        );
      }

      setVendedores((current) =>
        current.filter(
          (vendedor) => vendedor.id !== vendedorToDelete.id
        )
      );

      if (selectedVendedor?.id === vendedorToDelete.id) {
        setSelectedVendedor(null);
      }

      setDeleteOpen(false);
      setVendedorToDelete(null);

      addToast("Vendedor excluído com sucesso!");
    } catch (error) {
      console.error("VENDEDORES_PAGE_DELETE_ERROR:", error);

      addToast(
        error?.message ||
          "Ocorreu um erro ao excluir o vendedor.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
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
            Vendedores
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Cadastre, organize e acompanhe os profissionais ligados às vendas
            da ótica.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-14 rounded-full px-6 font-black"
        >
          <Plus className="size-4" />
          Novo vendedor
        </Button>
      </section>

      {/* Aviso de PIN recém-gerado */}
      {pinNotice ? (
        <section className="overflow-hidden rounded-[34px] border border-primary/15 bg-primary/[0.06] shadow-[0_28px_80px_-64px_rgba(108,77,230,0.52)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-[22px] bg-primary text-primary-foreground">
                <KeyRound className="size-6" />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">
                  PIN temporário
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.045em] text-dark-title">
                  {pinNotice.vendedorNome}:{" "}
                  <span className="font-mono text-2xl tracking-[0.28em] text-primary">
                    {pinNotice.pin}
                  </span>
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {getPinNoticeMessage(pinNotice.context)}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setPinNotice(null)}
              className="h-12 rounded-full px-5 font-black"
            >
              <X className="size-4" />
              Fechar aviso
            </Button>
          </div>
        </section>
      ) : null}

      {/* KPIs */}
      <VendedoresKpis vendedores={vendedores} />

      {/* Filtros */}
      <VendedoresFilters
        filters={filters}
        onChangeFilters={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredVendedores.length}
      />

      {/* Conteúdo */}
      {isLoading ? (
        <VendedoresLoadingState />
      ) : loadError ? (
        <VendedoresErrorState
          message={loadError}
          onRetry={loadVendedores}
        />
      ) : paginatedVendedores.length === 0 ? (
        <VendedoresEmptyState
          hasFilters={hasActiveFilters(filters)}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedVendedores.map((vendedor) => (
              <VendedorCard
                key={vendedor.id}
                vendedor={vendedor}
                onView={handleOpenView}
              />
            ))}
          </section>

          <VendedoresPagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredVendedores.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form criar/editar */}
      <VendedorFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingVendedor(null);
          }
        }}
        vendedor={editingVendedor}
        onSubmit={handleSubmitVendedor}
        isSaving={isSaving}
        canManagePin={canManagePin && !isLoadingUser}
      />

      {/* Drawer detalhes */}
      <VendedorDetailsDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        vendedor={selectedVendedor}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        canDelete={canDeleteVendedor && !isLoadingUser}
      />

      {/* Confirmar exclusão */}
      <ConfirmDeleteVendedorDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setVendedorToDelete(null);
          }
        }}
        vendedor={vendedorToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

/* ==========================================================================
   ESTADOS AUXILIARES DA PÁGINA
   ========================================================================== */

function VendedoresLoadingState() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[430px] animate-pulse overflow-hidden rounded-[34px] border border-border bg-card shadow-[0_28px_80px_-64px_rgba(15,23,42,0.32)]"
        >
          <div className="h-56 bg-muted" />

          <div className="p-5">
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-muted" />
              <div className="h-6 w-28 rounded-full bg-muted" />
            </div>

            <div className="mt-5 h-7 w-4/5 rounded-full bg-muted" />
            <div className="mt-3 h-4 w-2/3 rounded-full bg-muted" />

            <div className="mt-7 space-y-3">
              <div className="h-4 w-4/5 rounded-full bg-muted" />
              <div className="h-4 w-3/4 rounded-full bg-muted" />
              <div className="h-4 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function VendedoresErrorState({ message, onRetry }) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.36)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <UsersRound className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        Não foi possível carregar os vendedores.
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {message ||
          "A página não conseguiu buscar a equipe agora. Tente novamente."}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-5 h-12 rounded-full px-6 font-black"
      >
        <RefreshCw className="size-4" />
        Tentar novamente
      </Button>
    </section>
  );
}