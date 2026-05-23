"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleHelp,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

const adminTitles = [
  ["/admin/configuracoes", "Configurações"],
  ["/admin/relatorios", "Relatórios"],
  ["/admin/perfil", "Perfil"],
  ["/admin/vendedores", "Vendedores"],
  ["/admin/ordens-servico", "Ordens de Serviço"],
  ["/admin/clientes", "Clientes"],
  ["/admin/financeiro", "Financeiro"],
  ["/admin/marketing", "Marketing"],
  ["/admin", "Dashboard"],
];

const balcaoTitles = [
  ["/balcao/desempenho-vendedor", "Desempenho do Vendedor"],
  ["/balcao/ordens-servico/nova", "Nova Ordem de Serviço"],
  ["/balcao/ordens-servico", "Consultar Ordens de Serviço"],
  ["/balcao/clientes/novo", "Novo Cliente"],
  ["/balcao", "Buscar Cliente"],
  ["/balcao/perfil", "Perfil"],
];

function resolvePageTitle(pathname, mode) {
  const titles = mode === "balcao" ? balcaoTitles : adminTitles;

  return (
    titles.find(
      ([route]) => pathname === route || pathname.startsWith(`${route}/`)
    )?.[1] ?? "Visão Geral"
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
    <div className="relative grid size-14 md:size-13 shrink-0 overflow-hidden place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-[0_14px_24px_-18px_rgba(108,77,230,0.95)] ring-2 ring-background">
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

export default function Header({
  mode = "admin",
  sidebarCollapsed = false,
  onOpenMobileSidebar,
}) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

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

        if (!response.ok) {
          return;
        }

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

  function handleQuickSearchSubmit(event) {
    event.preventDefault();

    const query = new FormData(event.currentTarget)
      .get("q")
      ?.toString()
      .trim();

    if (!query) return;

    window.dispatchEvent(
      new CustomEvent("vision:quick-search", {
        detail: { query, mode },
      })
    );
  }

  const displayName =
    user?.nome_completo ||
    (mode === "balcao" ? "Equipe do balcão" : "Usuário logado");

  const accountLabel =
    user?.conta?.nome_fantasia ||
    (mode === "balcao" ? "Atendimento" : "Painel administrativo");

  const imageUrl = user?.image_url || null;

  return (
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
          onSubmit={handleQuickSearchSubmit}
          className="hidden h-16 items-center gap-3 rounded-full border border-border/80 bg-background/92 px-5 shadow-[0_24px_55px_-28px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md md:flex"
        >
          <Search className="size-4 shrink-0 text-primary" />

          <input
            name="q"
            type="search"
            autoComplete="off"
            placeholder={
              mode === "balcao"
                ? "Buscar cliente, telefone ou OS..."
                : "Busca rápida: cliente, OS, vendedor..."
            }
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />

          <span className="hidden rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground xl:inline-flex">
            Enter
          </span>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <ActionBubble label="Atalhos">
              <Sparkles className="size-[18px]" />
            </ActionBubble>

            <ActionBubble label="Notificações">
              <Bell className="size-[18px]" />
            </ActionBubble>

            <ActionBubble label="Ajuda">
              <CircleHelp className="size-[18px]" />
            </ActionBubble>
          </div>

          <div className="flex h-16 min-w-0 items-center gap-3 rounded-full bg-transparent p-2 pr-4 shadow-none backdrop-blur-md md:border md:border-border/80 md:bg-background/95 md:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.55)]">
            <UserAvatar imageUrl={imageUrl} name={displayName} />

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[150px] truncate text-sm font-bold tracking-[-0.02em] text-dark-title">
                {displayName}
              </p>

              <p className="max-w-[150px] truncate text-xs font-medium text-muted-foreground">
                {accountLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}