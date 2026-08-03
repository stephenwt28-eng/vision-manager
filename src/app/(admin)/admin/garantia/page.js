"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  ConfirmDeleteGarantiaDialog,
  GarantiaDetailsDrawer,
  GarantiaEmptyState,
  GarantiaFilters,
  GarantiaFormDialog,
  GarantiaKpis,
  GarantiaPagination,
  GarantiaTable,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  status: "todos",
  tipo: "todos",
  vendedorId: "todos",
  dataInicio: "",
  dataFim: "",
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

function isGarantiaAtrasada(garantia) {
  if (!garantia?.prazo_resolucao) return false;

  const finalizada = ["resolvida", "cancelada", "recusada"].includes(
    garantia.status_garantia
  );

  if (finalizada) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prazo = new Date(`${garantia.prazo_resolucao}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return today > prazo;
}

function buildGarantiaSearchText(garantia, clientesById, vendedoresById) {
  const cliente = clientesById.get(garantia.cliente_id);
  const vendedor = vendedoresById.get(garantia.vendedor_id);

  return [
    garantia.numero_garantia,
    garantia.numero_os_original,
    garantia.numero_nf,
    garantia.pedido_laboratorio_numero,

    garantia.status_garantia,
    garantia.tipo_garantia,
    garantia.motivo_garantia,
    garantia.descricao_problema,
    garantia.condicao_produto,
    garantia.laudo_laboratorio,
    garantia.solucao_aplicada,

    garantia.laboratorio_nome,
    garantia.telefone_laboratorio,

    garantia.lente_tipo,
    garantia.lente_marca,
    garantia.lente_linha,
    garantia.lente_laboratorio,
    garantia.lente_material,
    garantia.lente_indice_refracao,

    garantia.observacoes_cliente,
    garantia.observacoes_internas,

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
      filters.tipo !== "todos" ||
      filters.vendedorId !== "todos" ||
      filters.dataInicio ||
      filters.dataFim
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminGarantiaPage() {
  const { addToast } = useToast();

  const [garantias, setGarantias] = useState([]);
  const [historicoStatusGarantia, setHistoricoStatusGarantia] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGarantia, setEditingGarantia] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGarantia, setSelectedGarantia] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [garantiaToDelete, setGarantiaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdatingId, setIsUpdatingId] = useState("");

  const canDelete = user?.role === "admin";

  const clientesById = useMemo(() => {
    return new Map(clientes.map((cliente) => [cliente.id, cliente]));
  }, [clientes]);

  const vendedoresById = useMemo(() => {
    return new Map(vendedores.map((vendedor) => [vendedor.id, vendedor]));
  }, [vendedores]);

  const historicoByGarantiaId = useMemo(() => {
    return historicoStatusGarantia.reduce((acc, item) => {
      if (!item?.garantia_id) return acc;

      acc[item.garantia_id] = acc[item.garantia_id] || [];
      acc[item.garantia_id].push(item);
      return acc;
    }, {});
  }, [historicoStatusGarantia]);

  /* ==========================================================================
     LOAD
     ========================================================================== */

  const loadGarantias = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/garantia", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível carregar as garantias.");
      }

      setGarantias(data?.garantias || []);
      setHistoricoStatusGarantia(data?.historicoStatusGarantia || []);
      setOrdensServico(data?.ordensServico || []);
      setClientes(data?.clientes || []);
      setVendedores(data?.vendedores || []);
      setLentes(data?.lentes || []);
      setUser(data?.user || null);
    } catch (error) {
      console.error("GARANTIA_PAGE_LOAD_ERROR:", error);

      const message = error?.message || "Não foi possível carregar as garantias.";

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
      void loadGarantias();
    });

    return () => {
      cancelled = true;
    };
  }, [loadGarantias]);

  /* ==========================================================================
     FILTROS FRONT-END
     ========================================================================== */

  const filteredGarantias = useMemo(() => {
    return garantias.filter((garantia) => {
      const search = onlyUsefulText(filters.search);
      const searchText = onlyUsefulText(
        buildGarantiaSearchText(garantia, clientesById, vendedoresById)
      );

      const matchesSearch = !search || searchText.includes(search);

      const matchesStatus =
        filters.status === "todos" ||
        (filters.status === "atrasadas" && isGarantiaAtrasada(garantia)) ||
        garantia.status_garantia === filters.status;

      const matchesTipo =
        filters.tipo === "todos" || garantia.tipo_garantia === filters.tipo;

      const matchesVendedor =
        filters.vendedorId === "todos" ||
        garantia.vendedor_id === filters.vendedorId;

      const dataAbertura = garantia.data_abertura
        ? new Date(`${garantia.data_abertura}T00:00:00`)
        : null;

      const matchesDataInicio =
        !filters.dataInicio ||
        (dataAbertura &&
          dataAbertura >= new Date(`${filters.dataInicio}T00:00:00`));

      const matchesDataFim =
        !filters.dataFim ||
        (dataAbertura &&
          dataAbertura <= new Date(`${filters.dataFim}T23:59:59`));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTipo &&
        matchesVendedor &&
        matchesDataInicio &&
        matchesDataFim
      );
    });
  }, [garantias, filters, clientesById, vendedoresById]);

  const totalPages = Math.max(Math.ceil(filteredGarantias.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedGarantias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGarantias.slice(start, start + pageSize);
  }, [filteredGarantias, currentPage, pageSize]);

  /* ==========================================================================
     ACTIONS
     ========================================================================== */

  function handleCreate() {
    setEditingGarantia(null);
    setFormOpen(true);
  }

  function handleEdit(garantia) {
    setEditingGarantia(garantia);
    setFormOpen(true);
  }

  function handleOpenDetails(garantia) {
    setSelectedGarantia(garantia);
    setDrawerOpen(true);
  }

  function handleDelete(garantia) {
    setGarantiaToDelete(garantia);
    setDeleteOpen(true);
  }

  function handleClearFilters() {
    setPage(1);
    setFilters(initialFilters);
  }

  function handleFiltersChange(updater) {
    setPage(1);
    setFilters(updater);
  }

  async function handleSubmit(payload) {
    try {
      setIsSaving(true);

      const isEditing = Boolean(payload?.id);

      const response = await fetch("/api/garantia", {
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
              ? "Não foi possível atualizar a garantia."
              : "Não foi possível cadastrar a garantia.")
        );
      }

      const savedGarantia = data?.garantia;

      if (savedGarantia) {
        setGarantias((current) => {
          if (isEditing) {
            return current.map((item) =>
              item.id === savedGarantia.id ? savedGarantia : item
            );
          }

          return [savedGarantia, ...current];
        });
      }

      await loadGarantias();

      setFormOpen(false);
      setEditingGarantia(null);

      addToast(
        data?.message ||
          (isEditing
            ? "Garantia atualizada com sucesso."
            : "Garantia cadastrada com sucesso.")
      );
    } catch (error) {
      console.error("GARANTIA_PAGE_SUBMIT_ERROR:", error);

      addToast(
        error?.message || "Não foi possível salvar a garantia.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!garantiaToDelete?.id) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/garantia", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: garantiaToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível excluir a garantia.");
      }

      setGarantias((current) =>
        current.filter((item) => item.id !== garantiaToDelete.id)
      );

      setDeleteOpen(false);
      setGarantiaToDelete(null);

      addToast(data?.message || "Garantia excluída com sucesso.");
    } catch (error) {
      console.error("GARANTIA_PAGE_DELETE_ERROR:", error);

      addToast(
        error?.message || "Não foi possível excluir a garantia.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleQuickStatus(garantia, statusGarantia, dataOcorrenciaStatus) {
    if (!garantia?.id || garantia.status_garantia === statusGarantia) return;

    const optimistic = {
      ...garantia,
      status_garantia: statusGarantia,
    };

    try {
      setIsUpdatingId(garantia.id);

      setGarantias((current) =>
        current.map((item) => (item.id === garantia.id ? optimistic : item))
      );

      const response = await fetch("/api/garantia", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...optimistic,
          data_ocorrencia_status: dataOcorrenciaStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar o status da garantia."
        );
      }

      if (data?.garantia) {
        setGarantias((current) =>
          current.map((item) =>
            item.id === data.garantia.id ? data.garantia : item
          )
        );

        if (selectedGarantia?.id === data.garantia.id) {
          setSelectedGarantia(data.garantia);
        }
      }

      if (Array.isArray(data?.historicoStatusGarantia)) {
        setHistoricoStatusGarantia(data.historicoStatusGarantia);
      }

      addToast("Status da garantia atualizado.");
    } catch (error) {
      console.error("GARANTIA_PAGE_QUICK_STATUS_ERROR:", error);

      setGarantias((current) =>
        current.map((item) => (item.id === garantia.id ? garantia : item))
      );

      addToast(
        error?.message || "Não foi possível atualizar o status da garantia.",
        "error"
      );
    } finally {
      setIsUpdatingId("");
    }
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>

          <h1 className="text-3xl font-black tracking-[-0.04em] text-dark-title md:text-4xl">
            Garantias
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadGarantias}
            className="h-14 rounded-full px-6 font-black"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Button type="button" className="h-14 rounded-full px-6 font-black" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nova garantia
          </Button>
        </div>
      </header>

      <GarantiaKpis garantias={garantias} />

      <GarantiaFilters
        filters={filters}
        setFilters={handleFiltersChange}
        vendedores={vendedores}
        onClear={handleClearFilters}
        hasActiveFilters={activeFilters}
        totalResults={filteredGarantias.length}
      />

      {loadError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-black">Erro ao carregar garantias</p>
          <p className="mt-1 text-sm font-semibold">{loadError}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-50"
            onClick={loadGarantias}
          >
            <RefreshCw className="mr-2 size-4" />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredGarantias.length ? (
        <>
          <GarantiaTable
            garantias={paginatedGarantias}
            clientesById={clientesById}
            vendedoresById={vendedoresById}
            onView={handleOpenDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onQuickStatus={handleQuickStatus}
            isUpdatingId={isUpdatingId}
            canDelete={canDelete}
          />

          <GarantiaPagination
            page={currentPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            total={filteredGarantias.length}
          />
        </>
      ) : (
        <GarantiaEmptyState
          hasActiveFilters={activeFilters}
          onCreate={handleCreate}
          onClear={handleClearFilters}
        />
      )}

      <GarantiaFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingGarantia(null);
          }
        }}
        editingGarantia={editingGarantia}
        ordensServico={ordensServico}
        clientesById={clientesById}
        vendedoresById={vendedoresById}
        lentes={lentes}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <GarantiaDetailsDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);

          if (!open) {
            setSelectedGarantia(null);
          }
        }}
        garantia={selectedGarantia}
        cliente={
          selectedGarantia ? clientesById.get(selectedGarantia.cliente_id) : null
        }
        vendedor={
          selectedGarantia
            ? vendedoresById.get(selectedGarantia.vendedor_id)
            : null
        }
        historicoStatus={
          selectedGarantia ? historicoByGarantiaId[selectedGarantia.id] || [] : []
        }
        onEdit={(garantia) => {
          setDrawerOpen(false);
          handleEdit(garantia);
        }}
        onDelete={(garantia) => {
          setDrawerOpen(false);
          handleDelete(garantia);
        }}
        canDelete={canDelete}
      />

      <ConfirmDeleteGarantiaDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setGarantiaToDelete(null);
          }
        }}
        garantia={garantiaToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
