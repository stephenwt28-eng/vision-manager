"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CircleHelp,
  FileText,
  Loader2,
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

const adminTitles = [
  ["/admin/configuracoes"],
  ["/admin/relatorios"],
  ["/admin/perfil"],
  ["/admin/vendedores"],
  ["/admin/ordens-servico"],
  ["/admin/clientes"],
  ["/admin/financeiro"],
  ["/admin/marketing"],
  ["/admin"],
];

const balcaoTitles = [
  ["/balcao/desempenho-vendedor"],
  ["/balcao/ordens-servico/nova"],
  ["/balcao/ordens-servico"],
  ["/balcao/clientes/novo"],
  ["/balcao/clientes"],
  ["/balcao"],
  ["/balcao/perfil"],
];

function resolvePageTitle(pathname, mode) {
  const titles = mode === "balcao" ? balcaoTitles : adminTitles;

  return (
    titles.find(
      ([route]) => pathname === route || pathname.startsWith(`${route}/`)
    )?.[1] ?? "Eficiente"
  );
}

function initialsFromName(name) {
  return (
    String(name || "Usuário")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "US"
  );
}

function getBasePath(mode) {
  return mode === "balcao" ? "/balcao" : "/admin";
}

function getPerfilHref(mode) {
  return mode === "balcao" ? "/balcao/perfil" : "/admin/perfil";
}

function getOsHref(mode, id) {
  return `${getBasePath(mode)}/ordens-servico/${id}`;
}

function getClienteHref(mode, id) {
  // Se você tiver página /clientes/[id], troque por:
  // return `${getBasePath(mode)}/clientes/${id}`;

  // Do jeito mais seguro para listagem existente:
  return `${getBasePath(mode)}/clientes?cliente=${id}`;
}

function normalizeSearchText(value) {
  return String(value || "").trim();
}

function ActionBubble({ label, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid size-13 shrink-0 place-items-center rounded-full border border-border/80 bg-background/95 text-primary shadow-[0_24px_48px_-26px_rgba(15,23,42,0.6)] backdrop-blur-md transition hover:-translate-y-1 hover:border-primary/25 hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </button>
  );
}

function UserAvatar({ imageUrl, name }) {
  const [imageFailed, setImageFailed] = useState(false);

  const shouldShowImage = Boolean(imageUrl) && !imageFailed;
  const initials = initialsFromName(name);

  return (
    <div className="relative grid size-14 shrink-0 overflow-hidden place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-[0_14px_24px_-18px_rgba(108,77,230,0.95)] ring-2 ring-background md:size-13">
      {shouldShowImage ? (
        <img
          src={imageUrl}
          alt={`Foto de perfil de ${name}`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function SearchResultIcon({ type }) {
  const isOs = type === "os";

  return (
    <div
      className={[
        "grid size-10 shrink-0 place-items-center rounded-2xl",
        isOs
          ? "bg-primary/10 text-primary"
          : "bg-emerald-500/10 text-emerald-600",
      ].join(" ")}
    >
      {isOs ? <FileText className="size-4" /> : <UserRound className="size-4" />}
    </div>
  );
}

function QuickSearchPortal({
  open,
  query,
  loading,
  results,
  error,
  mode,
  anchorRect,
  onClose,
  onNavigate,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open || !anchorRect) return null;

  const left = Math.max(12, anchorRect.left);
  const width = Math.min(anchorRect.width, window.innerWidth - 24);
  const top = anchorRect.bottom + 10;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Fechar busca"
        className="fixed inset-0 z-[80] cursor-default bg-transparent"
        onClick={onClose}
      />

      <section
        className="fixed z-[90] overflow-hidden rounded-[2rem] border border-border/80 bg-background/98 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.65)] backdrop-blur-xl"
        style={{
          top,
          left,
          width,
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Busca inteligente
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-muted-foreground">
              Resultado para:{" "}
              <span className="text-dark-title">{query || "..."}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Fechar resultados"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center gap-3 rounded-3xl px-4 py-6 text-sm font-semibold text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Buscando no sistema...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/70 px-4 py-6">
              <p className="text-sm font-black text-dark-title">
                Nada encontrado.
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Tente buscar por nome, telefone, CPF, número da OS ou pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((item) => {
                const href =
                  item.type === "os"
                    ? getOsHref(mode, item.id)
                    : getClienteHref(mode, item.id);

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => onNavigate(href)}
                    className="group flex w-full items-center gap-3 rounded-3xl px-3 py-3 text-left transition hover:bg-primary/7"
                  >
                    <SearchResultIcon type={item.type} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-black tracking-[-0.02em] text-dark-title">
                          {item.title}
                        </span>

                        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                          {item.type === "os" ? "OS" : "Cliente"}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}

                      {item.meta ? (
                        <p className="mt-0.5 truncate text-[11px] font-bold text-primary/80">
                          {item.meta}
                        </p>
                      ) : null}
                    </div>

                    <span className="shrink-0 rounded-full bg-card px-3 py-1 text-[11px] font-black text-muted-foreground opacity-0 transition group-hover:opacity-100">
                      Abrir
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>,
    document.body
  );
}

export default function Header({
  mode = "admin",
  sidebarCollapsed = false,
  onOpenMobileSidebar,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const searchFormRef = useRef(null);
  const searchAbortRef = useRef(null);
  const debounceRef = useRef(null);

  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [anchorRect, setAnchorRect] = useState(null);

  const pageTitle = useMemo(
    () => resolvePageTitle(pathname, mode),
    [pathname, mode]
  );

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (active && data?.authenticated && data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário no Header:", error);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function updateRect() {
      if (!searchFormRef.current) return;
      setAnchorRect(searchFormRef.current.getBoundingClientRect());
    }

    updateRect();

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, []);

  useEffect(() => {
    const query = normalizeSearchText(searchQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setSearchLoading(true);
      setSearchError("");
      setSearchOpen(true);

      try {
        const params = new URLSearchParams({
          q: query,
          mode,
        });

        const response = await fetch(`/api/search?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Erro ao buscar.");
        }

        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);
          setSearchError(error.message || "Erro ao buscar.");
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, mode]);

  function handleQuickSearchSubmit(event) {
    event.preventDefault();

    const query = normalizeSearchText(searchQuery);

    if (!query) return;

    setSearchOpen(true);

    if (searchResults.length === 1) {
      const item = searchResults[0];
      const href =
        item.type === "os"
          ? getOsHref(mode, item.id)
          : getClienteHref(mode, item.id);

      handleNavigate(href);
    }
  }

  function handleInputFocus() {
    if (searchFormRef.current) {
      setAnchorRect(searchFormRef.current.getBoundingClientRect());
    }

    if (normalizeSearchText(searchQuery).length >= 2) {
      setSearchOpen(true);
    }
  }

  function handleNavigate(href) {
    setSearchOpen(false);
    router.push(href);
  }

  function handleClearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchOpen(false);
  }

  const displayName =
    user?.nome_completo ||
    (mode === "balcao" ? "Equipe do balcão" : "Usuário logado");

  const accountLabel =
    user?.conta?.nome_fantasia ||
    (mode === "balcao" ? "Atendimento" : "Painel administrativo");

  const imageUrl = user?.image_url || null;

  const perfilHref = getPerfilHref(mode);

  return (
    <>
      <header
        className={[
          "fixed left-0 right-0 top-0 z-30 h-[142px] bg-background",
          "transition-[left] duration-300 ease-out",
          sidebarCollapsed ? "lg:left-[108px]" : "lg:left-[316px]",
        ].join(" ")}
      >
        <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-4 px-3 pt-3 sm:px-4 sm:pt-4 lg:grid-cols-[minmax(220px,1fr)_minmax(340px,600px)_minmax(380px,1fr)] lg:gap-6 lg:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu lateral"
              onClick={onOpenMobileSidebar}
              className="grid size-13 shrink-0 place-items-center rounded-full border border-border bg-background text-primary shadow-[0_22px_45px_-24px_rgba(15,23,42,0.55)] lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="min-w-0">
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:block">
                {mode === "balcao" ? "Operação" : "Gestão"}
              </p>

              <h1 className="truncate text-base font-black tracking-[-0.04em] text-dark-title sm:text-xl">
                {pageTitle}
              </h1>
            </div>
          </div>

          <form
            ref={searchFormRef}
            onSubmit={handleQuickSearchSubmit}
            className="hidden h-16 items-center gap-3 rounded-full border border-border/80 bg-background/92 px-5 shadow-[0_24px_55px_-28px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md md:flex"
          >
            {searchLoading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              <Search className="size-4 shrink-0 text-primary" />
            )}

            <input
              name="q"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={handleInputFocus}
              autoComplete="off"
              placeholder={
                mode === "balcao"
                  ? "Buscar cliente, telefone ou OS..."
                  : "Busca rápida: cliente, OS, vendedor..."
              }
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-card hover:text-primary"
                aria-label="Limpar busca"
              >
                <X className="size-4" />
              </button>
            ) : (
              <span className="hidden rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground xl:inline-flex">
                Enter
              </span>
            )}
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={() => router.push(perfilHref)}
              className="flex h-16 min-w-0 items-center gap-3 rounded-full bg-transparent p-2 pr-4 text-left shadow-none backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-primary/5 md:border md:border-border/80 md:bg-background/95 md:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.55)]"
              aria-label="Abrir perfil"
              title="Abrir perfil"
            >
              <UserAvatar imageUrl={imageUrl} name={displayName} />

              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[150px] truncate text-sm font-bold tracking-[-0.02em] text-dark-title">
                  {displayName}
                </p>

                <p className="max-w-[150px] truncate text-xs font-medium text-muted-foreground">
                  {accountLabel}
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <QuickSearchPortal
        open={searchOpen}
        query={searchQuery}
        loading={searchLoading}
        results={searchResults}
        error={searchError}
        mode={mode}
        anchorRect={anchorRect}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}