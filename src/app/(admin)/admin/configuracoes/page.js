"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Settings2,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

import {
  ConfiguracoesFormDialog,
  ConfiguracoesKpis,
  ConfirmDeleteUsuarioDialog,
  ContaConfiguracaoCards,
  ContaFormDialog,
  UsuarioCard,
  UsuarioDetailsDrawer,
  UsuarioFormDialog,
  UsuariosEmptyState,
  UsuariosFilters,
  UsuariosPagination,
} from "./components";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const initialFilters = {
  search: "",
  role: "todos",
  status: "todos",
  editavel: "todos",
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

function buildUsuarioSearchText(usuario) {
  return [
    usuario?.nome_completo,
    usuario?.email,
    usuario?.telefone,
    usuario?.cargo,
    usuario?.role,
    usuario?.status,
  ]
    .filter(Boolean)
    .join(" ");
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.role !== "todos" ||
      filters.status !== "todos" ||
      filters.editavel !== "todos"
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminConfiguracoesPage() {
  const { addToast } = useToast();

  const [conta, setConta] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isSavingUsuario, setIsSavingUsuario] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [isDeletingUsuario, setIsDeletingUsuario] = useState(false);

  const [contaFormOpen, setContaFormOpen] = useState(false);
  const [isSavingConta, setIsSavingConta] = useState(false);

  const [configuracoesFormOpen, setConfiguracoesFormOpen] =
    useState(false);
  const [isSavingConfiguracoes, setIsSavingConfiguracoes] =
    useState(false);

  /* ==========================================================================
     CARREGAMENTO
     ========================================================================== */

  const loadConfiguracoesPage = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/configuracoes", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar as configurações."
        );
      }

      setConta(data?.conta || null);
      setConfiguracoes(data?.configuracoes || null);
      setUsuarios(data?.usuarios || []);
    } catch (error) {
      console.error("CONFIGURACOES_PAGE_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar as configurações.";

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

      void loadConfiguracoesPage();
    });

    return () => {
      cancelled = true;
    };
  }, [loadConfiguracoesPage]);

  /* ==========================================================================
     FILTROS FRONT-END
     ========================================================================== */

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const search = onlyUsefulText(filters.search);
      const usuarioSearchText = onlyUsefulText(
        buildUsuarioSearchText(usuario)
      );

      const matchesSearch =
        !search || usuarioSearchText.includes(search);

      const matchesRole =
        filters.role === "todos" || usuario.role === filters.role;

      const matchesStatus =
        filters.status === "todos" || usuario.status === filters.status;

      const matchesEditavel =
        filters.editavel === "todos" ||
        (filters.editavel === "editaveis" &&
          usuario.role === "balcao") ||
        (filters.editavel === "protegidos" &&
          usuario.role === "admin");

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesEditavel
      );
    });
  }, [usuarios, filters]);

  const totalPages = Math.max(
    Math.ceil(filteredUsuarios.length / pageSize),
    1
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    return filteredUsuarios.slice(start, end);
  }, [currentPage, filteredUsuarios, pageSize]);

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

  function handleOpenCreateUsuario() {
    setEditingUsuario(null);
    setUsuarioFormOpen(true);
  }

  function handleOpenViewUsuario(usuario) {
    setSelectedUsuario(usuario);
    setDrawerOpen(true);
  }

  function handleOpenEditUsuario(usuario) {
    if (usuario?.role === "admin") {
      addToast(
        "Administradores podem ser visualizados, mas não editados.",
        "warning"
      );
      return;
    }

    setEditingUsuario(usuario);
    setDrawerOpen(false);
    setUsuarioFormOpen(true);
  }

  function handleOpenDeleteUsuario(usuario) {
    if (usuario?.role === "admin") {
      addToast(
        "Administradores podem ser visualizados, mas não removidos.",
        "warning"
      );
      return;
    }

    setUsuarioToDelete(usuario);
    setDrawerOpen(false);
    setDeleteOpen(true);
  }

  function handleDrawerOpenChange(open) {
    setDrawerOpen(open);

    if (!open) {
      setSelectedUsuario(null);
    }
  }

  function handleUsuarioFormOpenChange(open) {
    setUsuarioFormOpen(open);

    if (!open) {
      setEditingUsuario(null);
    }
  }

  function handleDeleteOpenChange(open) {
    setDeleteOpen(open);

    if (!open) {
      setUsuarioToDelete(null);
    }
  }

  /* ==========================================================================
     CREATE / UPDATE USUÁRIO
     ========================================================================== */

  async function handleSubmitUsuario(payload) {
    const isEditing = Boolean(payload?.id);

    try {
      setIsSavingUsuario(true);

      const response = await fetch("/api/configuracoes", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                tipo: "usuario",
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (isEditing
              ? "Não foi possível atualizar o usuário."
              : "Não foi possível criar o usuário.")
        );
      }

      if (isEditing) {
        setUsuarios((current) =>
          current.map((usuario) =>
            usuario.id === data?.usuario?.id
              ? data.usuario
              : usuario
          )
        );

        if (selectedUsuario?.id === data?.usuario?.id) {
          setSelectedUsuario(data.usuario);
        }

        addToast(
          data?.message || "Usuário atualizado com sucesso.",
          "success"
        );
      } else {
        setUsuarios((current) => [...current, data.usuario]);

        addToast(
          data?.message || "Usuário criado com sucesso.",
          "success"
        );
      }

      setUsuarioFormOpen(false);
      setEditingUsuario(null);
    } catch (error) {
      console.error("CONFIGURACOES_PAGE_SAVE_USUARIO_ERROR:", error);

      addToast(
        error?.message || "Não foi possível salvar o usuário.",
        "error"
      );
    } finally {
      setIsSavingUsuario(false);
    }
  }

  /* ==========================================================================
     DELETE USUÁRIO
     ========================================================================== */

  async function handleConfirmDeleteUsuario() {
    if (!usuarioToDelete?.id) return;

    try {
      setIsDeletingUsuario(true);

      const response = await fetch("/api/configuracoes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: usuarioToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível remover o usuário."
        );
      }

      setUsuarios((current) =>
        current.filter(
          (usuario) => usuario.id !== usuarioToDelete.id
        )
      );

      if (selectedUsuario?.id === usuarioToDelete.id) {
        setSelectedUsuario(null);
        setDrawerOpen(false);
      }

      setDeleteOpen(false);
      setUsuarioToDelete(null);

      addToast(
        data?.message || "Usuário removido com sucesso.",
        "success"
      );
    } catch (error) {
      console.error("CONFIGURACOES_PAGE_DELETE_USUARIO_ERROR:", error);

      addToast(
        error?.message || "Não foi possível remover o usuário.",
        "error"
      );
    } finally {
      setIsDeletingUsuario(false);
    }
  }

  /* ==========================================================================
     UPDATE CONTA
     ========================================================================== */

  async function handleSubmitConta(payload) {
    try {
      setIsSavingConta(true);

      const response = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "conta",
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar os dados da conta."
        );
      }

      setConta(data?.conta || null);
      setContaFormOpen(false);

      addToast(
        data?.message || "Dados da conta atualizados com sucesso.",
        "success"
      );
    } catch (error) {
      console.error("CONFIGURACOES_PAGE_SAVE_CONTA_ERROR:", error);

      addToast(
        error?.message || "Não foi possível salvar os dados da conta.",
        "error"
      );
    } finally {
      setIsSavingConta(false);
    }
  }

  /* ==========================================================================
     UPDATE CONFIGURAÇÕES
     ========================================================================== */

  async function handleSubmitConfiguracoes(payload) {
    try {
      setIsSavingConfiguracoes(true);

      const response = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "configuracoes",
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível atualizar as preferências da conta."
        );
      }

      setConfiguracoes(data?.configuracoes || null);
      setConfiguracoesFormOpen(false);

      addToast(
        data?.message || "Preferências atualizadas com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "CONFIGURACOES_PAGE_SAVE_PREFERENCIAS_ERROR:",
        error
      );

      addToast(
        error?.message ||
          "Não foi possível salvar as preferências da conta.",
        "error"
      );
    } finally {
      setIsSavingConfiguracoes(false);
    }
  }

  /* ==========================================================================
     ESTADOS DE TELA
     ========================================================================== */

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-full bg-primary/[0.10] text-primary">
              <RefreshCw className="size-7 animate-spin" />
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-[-0.055em] text-dark-title">
              Carregando configurações
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Buscando dados da conta, preferências e acessos da plataforma.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="space-y-6">
        <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-full bg-destructive/[0.10] text-destructive">
              <Settings2 className="size-7" />
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-[-0.055em] text-dark-title">
              Não foi possível abrir esta aba
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {loadError}
            </p>

            <Button
              onClick={loadConfiguracoesPage}
              className="mt-6 h-12 rounded-full px-6 font-black"
            >
              <RefreshCw className="size-4" />
              Tentar novamente
            </Button>
          </div>
        </section>
      </main>
    );
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <main className="space-y-6">
      <section className="rounded-[42px] border border-border bg-card p-5 shadow-[0_36px_100px_-72px_rgba(15,23,42,0.52)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
              <Settings2 className="size-4" />
              Configurações da conta
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-[-0.07em] text-dark-title sm:text-4xl">
              Conta, preferências e acessos
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Gerencie os dados da ótica, as regras operacionais da plataforma e os usuários que podem entrar no sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={loadConfiguracoesPage}
              className="h-14 rounded-full px-6 font-black"
            >
              <RefreshCw className="size-4" />
              Atualizar
            </Button>

            <Button
              onClick={handleOpenCreateUsuario}
              className="h-14 rounded-full px-6 font-black"
            >
              <Plus className="size-4" />
              Novo usuário
            </Button>
          </div>
        </div>
      </section>

      <ConfiguracoesKpis conta={conta} usuarios={usuarios} />

      <ContaConfiguracaoCards
        conta={conta}
        configuracoes={configuracoes}
        onEditConta={() => setContaFormOpen(true)}
        onEditConfiguracoes={() =>
          setConfiguracoesFormOpen(true)
        }
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1 text-sm font-black text-primary">
              <UsersRound className="size-4" />
              Usuários da plataforma
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.055em] text-dark-title">
              Controle os acessos do sistema
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Administradores aparecem para transparência. Acessos de balcão podem ser editados, ter senha redefinida ou ser removidos.
            </p>
          </div>
        </div>

        <UsuariosFilters
          filters={filters}
          onChangeFilters={handleFiltersChange}
          onClearFilters={handleClearFilters}
          totalResults={filteredUsuarios.length}
        />

        {paginatedUsuarios.length ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedUsuarios.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  onView={handleOpenViewUsuario}
                />
              ))}
            </section>

            <UsuariosPagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredUsuarios.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <UsuariosEmptyState
            hasFilters={hasActiveFilters(filters)}
          />
        )}
      </section>

      <UsuarioFormDialog
        key={`usuario-form-${editingUsuario?.id ?? "novo"}-${usuarioFormOpen ? "open" : "closed"}`}
        open={usuarioFormOpen}
        onOpenChange={handleUsuarioFormOpenChange}
        usuario={editingUsuario}
        onSubmit={handleSubmitUsuario}
        isSaving={isSavingUsuario}
      />

      <UsuarioDetailsDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        usuario={selectedUsuario}
        onEdit={handleOpenEditUsuario}
        onDelete={handleOpenDeleteUsuario}
      />

      <ConfirmDeleteUsuarioDialog
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        usuario={usuarioToDelete}
        onConfirm={handleConfirmDeleteUsuario}
        isDeleting={isDeletingUsuario}
      />

      <ContaFormDialog
        key={`conta-form-${conta?.id ?? "conta"}-${contaFormOpen ? "open" : "closed"}`}
        open={contaFormOpen}
        onOpenChange={setContaFormOpen}
        conta={conta}
        onSubmit={handleSubmitConta}
        isSaving={isSavingConta}
      />

      <ConfiguracoesFormDialog
        key={`configuracoes-form-${configuracoes?.id ?? "config"}-${configuracoesFormOpen ? "open" : "closed"}`}
        open={configuracoesFormOpen}
        onOpenChange={setConfiguracoesFormOpen}
        configuracoes={configuracoes}
        onSubmit={handleSubmitConfiguracoes}
        isSaving={isSavingConfiguracoes}
      />
    </main>
  );
}
