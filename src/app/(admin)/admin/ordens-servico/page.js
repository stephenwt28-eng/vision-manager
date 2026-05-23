"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  ConfirmDeleteOrdemServicoDialog,
  OrdemServicoFormDialog,
  OrdensServicoEmptyState,
  OrdensServicoFilters,
  OrdensServicoKpis,
  OrdensServicoPagination,
  OrdensServicoTable,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  status: "todos",
  statusPagamento: "todos",
  vendedorId: "todos",
  dataInicio: "",
  dataFim: "",
};

const finalStatus = ["pronta_retirada", "entregue", "cancelada"];

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

function isAtrasada(os) {
  if (!os?.prazo_entrega_combinado) return false;

  if (finalStatus.includes(os.status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prazo = new Date(`${os.prazo_entrega_combinado}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return today > prazo;
}

function buildOsSearchText(os, clientesById, vendedoresById) {
  const cliente = clientesById.get(os.cliente_id);
  const vendedor = vendedoresById.get(os.vendedor_id);

  return [
    os.numero_os,
    os.tipo_os,
    os.status,
    os.status_pagamento,
    os.laboratorio_nome,
    os.pedido_laboratorio_numero,
    os.observacoes_cliente,
    os.observacoes_internas,
    cliente?.nome_completo,
    cliente?.nome_social,
    cliente?.cpf,
    cliente?.telefone_principal,
    cliente?.telefone_secundario,
    cliente?.email,
    vendedor?.nome_completo,
    vendedor?.nome_exibicao,
    vendedor?.cpf,
    vendedor?.telefone,
    vendedor?.email,
  ]
    .filter(Boolean)
    .join(" ");
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.status !== "todos" ||
      filters.statusPagamento !== "todos" ||
      filters.vendedorId !== "todos" ||
      filters.dataInicio ||
      filters.dataFim
  );
}

function getSingleByOsId(items = [], osId) {
  return items.find((item) => item.os_id === osId) || null;
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminOrdensServicoPage() {
  const { addToast } = useToast();

  const [ordensServico, setOrdensServico] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [catalogoArmacoes, setCatalogoArmacoes] = useState([]);
  const [catalogoLentes, setCatalogoLentes] = useState([]);
  const [user, setUser] = useState(null);

  const [relatedByOs, setRelatedByOs] = useState({
    receitas: {},
    armacoes: {},
    lentes: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrdemServico, setEditingOrdemServico] = useState(null);
  const [editingRelated, setEditingRelated] = useState({
    receita: null,
    armacao: null,
    lente: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ordemToDelete, setOrdemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdatingId, setIsUpdatingId] = useState("");

  const canDelete = user?.role === "admin";

  const clientesById = useMemo(() => {
    return new Map(clientes.map((cliente) => [cliente.id, cliente]));
  }, [clientes]);

  const vendedoresById = useMemo(() => {
    return new Map(vendedores.map((vendedor) => [vendedor.id, vendedor]));
  }, [vendedores]);

  /* ==========================================================================
     LOAD
     ========================================================================== */

  const loadOrdensServico = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/ordens-servico", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar as ordens de serviço."
        );
      }

      setOrdensServico(data?.ordensServico || []);
      setClientes(data?.clientes || []);
      setVendedores(data?.vendedores || []);
      setCatalogoArmacoes(data?.catalogoArmacoes || []);
      setCatalogoLentes(data?.catalogoLentes || []);
      setUser(data?.user || null);
    } catch (error) {
      console.error("ORDENS_SERVICO_PAGE_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar as ordens de serviço.";

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
      void loadOrdensServico();
    });

    return () => {
      cancelled = true;
    };
  }, [loadOrdensServico]);

  async function loadOrdemDetails(osId) {
    const response = await fetch(`/api/ordens-servico/${osId}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Não foi possível carregar os detalhes da OS.");
    }

    setRelatedByOs((current) => ({
      receitas: {
        ...current.receitas,
        [osId]: data?.receita || null,
      },
      armacoes: {
        ...current.armacoes,
        [osId]: data?.armacao || null,
      },
      lentes: {
        ...current.lentes,
        [osId]: data?.lente || null,
      },
    }));

    return data;
  }

  /* ==========================================================================
     FILTROS FRONT-END
     ========================================================================== */

  const filteredOrdensServico = useMemo(() => {
    return ordensServico.filter((os) => {
      const search = onlyUsefulText(filters.search);
      const searchText = onlyUsefulText(
        buildOsSearchText(os, clientesById, vendedoresById)
      );

      const matchesSearch = !search || searchText.includes(search);

      const matchesStatus =
        filters.status === "todos" ||
        (filters.status === "atrasadas" && isAtrasada(os)) ||
        os.status === filters.status;

      const matchesPagamento =
        filters.statusPagamento === "todos" ||
        os.status_pagamento === filters.statusPagamento;

      const matchesVendedor =
        filters.vendedorId === "todos" || os.vendedor_id === filters.vendedorId;

      const dataVenda = os.data_venda
        ? new Date(`${os.data_venda}T00:00:00`)
        : null;

      const matchesDataInicio =
        !filters.dataInicio ||
        (dataVenda && dataVenda >= new Date(`${filters.dataInicio}T00:00:00`));

      const matchesDataFim =
        !filters.dataFim ||
        (dataVenda && dataVenda <= new Date(`${filters.dataFim}T23:59:59`));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPagamento &&
        matchesVendedor &&
        matchesDataInicio &&
        matchesDataFim
      );
    });
  }, [clientesById, filters, ordensServico, vendedoresById]);

  const totalPages = Math.max(
    Math.ceil(filteredOrdensServico.length / pageSize),
    1
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedOrdensServico = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return filteredOrdensServico.slice(start, end);
  }, [currentPage, filteredOrdensServico, pageSize]);

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
     FORM
     ========================================================================== */

  function handleOpenCreate() {
    setEditingOrdemServico(null);
    setEditingRelated({
      receita: null,
      armacao: null,
      lente: null,
    });
    setFormOpen(true);
  }

  async function handleOpenEdit(os) {
    try {
      setEditingOrdemServico(os);
      setEditingRelated({
        receita: relatedByOs.receitas[os.id] || null,
        armacao: relatedByOs.armacoes[os.id] || null,
        lente: relatedByOs.lentes[os.id] || null,
      });
      setFormOpen(true);

      const details = await loadOrdemDetails(os.id);

      setEditingOrdemServico(details?.ordemServico || os);
      setEditingRelated({
        receita: details?.receita || null,
        armacao: details?.armacao || null,
        lente: details?.lente || null,
      });
    } catch (error) {
      console.error("ORDENS_SERVICO_OPEN_EDIT_ERROR:", error);

      addToast(
        error?.message || "Não foi possível carregar os detalhes da OS.",
        "error"
      );
    }
  }

  async function handleSubmit(payload) {
    try {
      setIsSaving(true);

      const isEditing = Boolean(editingOrdemServico?.id);

      const url = isEditing
        ? `/api/ordens-servico/${editingOrdemServico.id}`
        : "/api/ordens-servico";

      const response = await fetch(url, {
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
              ? "Não foi possível atualizar a OS."
              : "Não foi possível criar a OS.")
        );
      }

      const saved = data?.ordemServico;

      if (saved) {
        setOrdensServico((current) => {
          if (isEditing) {
            return current.map((item) => (item.id === saved.id ? saved : item));
          }

          return [saved, ...current];
        });

        setRelatedByOs((current) => ({
          receitas: {
            ...current.receitas,
            [saved.id]: data?.receita || current.receitas[saved.id] || null,
          },
          armacoes: {
            ...current.armacoes,
            [saved.id]: data?.armacao || current.armacoes[saved.id] || null,
          },
          lentes: {
            ...current.lentes,
            [saved.id]: data?.lente || current.lentes[saved.id] || null,
          },
        }));
      }

      addToast(
        data?.message ||
          (isEditing
            ? "Ordem de serviço atualizada com sucesso."
            : "Ordem de serviço criada com sucesso."),
        "success"
      );

      setFormOpen(false);
      setEditingOrdemServico(null);
      setEditingRelated({
        receita: null,
        armacao: null,
        lente: null,
      });

      void loadOrdensServico();
    } catch (error) {
      console.error("ORDENS_SERVICO_SAVE_ERROR:", error);

      addToast(error?.message || "Não foi possível salvar a OS.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  /* ==========================================================================
     QUICK UPDATE
     ========================================================================== */

  async function handleQuickUpdate(os, patch) {
    try {
      setIsUpdatingId(os.id);

      const response = await fetch("/api/ordens-servico", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: os.id,
          ...patch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível atualizar a OS.");
      }

      const updated = data?.ordemServico;

      if (updated) {
        setOrdensServico((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
      }

      addToast("OS atualizada.", "success");
    } catch (error) {
      console.error("ORDENS_SERVICO_QUICK_UPDATE_ERROR:", error);

      addToast(error?.message || "Não foi possível atualizar a OS.", "error");
    } finally {
      setIsUpdatingId("");
    }
  }

  /* ==========================================================================
     DELETE
     ========================================================================== */

  function handleOpenDelete(os) {
    setOrdemToDelete(os);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!ordemToDelete?.id) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/ordens-servico", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ordemToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível excluir a OS.");
      }

      setOrdensServico((current) =>
        current.filter((item) => item.id !== ordemToDelete.id)
      );

      setDeleteOpen(false);
      setOrdemToDelete(null);

      addToast(data?.message || "Ordem de serviço excluída.", "success");
    } catch (error) {
      console.error("ORDENS_SERVICO_DELETE_ERROR:", error);

      addToast(error?.message || "Não foi possível excluir a OS.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  const activeFilters = hasActiveFilters(filters);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
            <FileText className="size-3.5" />
            Ordens de serviço
          </div>

          <h1 className="text-3xl font-black tracking-[-0.065em] text-dark-title md:text-4xl">
            Controle completo das OS
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Status, financeiro, cliente, receita, armação e lente em uma tela só.
            Aqui é o cockpit da ótica, sem papel voando no balcão.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={loadOrdensServico}
            disabled={isLoading}
            className="h-12 rounded-full px-5 font-black"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-12 rounded-full px-6 font-black"
          >
            <Plus className="size-4" />
            Nova OS
          </Button>
        </div>
      </header>

      <OrdensServicoKpis ordensServico={ordensServico} />

      <OrdensServicoFilters
        filters={filters}
        onChangeFilters={handleFiltersChange}
        onClearFilters={handleClearFilters}
        vendedores={vendedores}
        totalResults={filteredOrdensServico.length}
      />

      {isLoading ? (
        <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-[24px] bg-background"
              />
            ))}
          </div>
        </section>
      ) : loadError ? (
        <section className="rounded-[38px] border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="text-sm font-black">{loadError}</p>
        </section>
      ) : paginatedOrdensServico.length === 0 ? (
        <OrdensServicoEmptyState hasFilters={activeFilters} />
      ) : (
        <>
          <OrdensServicoTable
            ordensServico={paginatedOrdensServico}
            clientesById={clientesById}
            vendedoresById={vendedoresById}
            onQuickUpdate={handleQuickUpdate}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            canDelete={canDelete}
            isUpdatingId={isUpdatingId}
          />

          <OrdensServicoPagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredOrdensServico.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <OrdemServicoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ordemServico={editingOrdemServico}
        receita={
          editingOrdemServico?.id
            ? getSingleByOsId(
                Object.values(relatedByOs.receitas).filter(Boolean),
                editingOrdemServico.id
              ) || editingRelated.receita
            : null
        }
        armacao={
          editingOrdemServico?.id
            ? getSingleByOsId(
                Object.values(relatedByOs.armacoes).filter(Boolean),
                editingOrdemServico.id
              ) || editingRelated.armacao
            : null
        }
        lente={
          editingOrdemServico?.id
            ? getSingleByOsId(
                Object.values(relatedByOs.lentes).filter(Boolean),
                editingOrdemServico.id
              ) || editingRelated.lente
            : null
        }
        clientes={clientes}
        vendedores={vendedores}
        catalogoArmacoes={catalogoArmacoes}
        catalogoLentes={catalogoLentes}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <ConfirmDeleteOrdemServicoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ordemServico={ordemToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}