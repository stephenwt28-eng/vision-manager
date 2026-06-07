"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ClipboardPlus,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings2,
  LogOut,
  ShieldCheck,
  Loader2,
  User,
  UserRoundCog,
  UserRoundPlus,
  UsersRound,
  X,
  DollarSign,
} from "lucide-react";

const adminItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: UsersRound,
  },
  {
    label: "Ordens de Serviço",
    href: "/admin/ordens-servico",
    icon: ClipboardList,
  },
  {
    label: "Garantia",
    href: "/admin/garantia",
    icon: ShieldCheck,
  },
  {
    label: "Vendedores",
    href: "/admin/vendedores",
    icon: UserRoundCog,
  },
  {
    label: "Relatórios",
    href: "/admin/relatorios",
    icon: BarChart3,
  },
  {
    label: "Financeiro",
    href: "/admin/financeiro",
    icon: DollarSign
  },
  {
    label: "Perfil",
    href: "/admin/perfil",
    icon: User,
  },
  {
    label: "Marketing",
    href: "/admin/marketing",
    icon: Megaphone,
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings2,
  },
];

const balcaoItems = [
  {
    label: "Buscar Cliente",
    href: "/balcao",
    icon: Search,
    exact: true,
  },
  {
    label: "Novo Cliente",
    href: "/balcao/clientes/novo",
    icon: UserRoundPlus,
  },
  {
    label: "Nova OS",
    href: "/balcao/ordens-servico/nova",
    icon: ClipboardPlus,
  },
  {
    label: "Consultar OS",
    href: "/balcao/ordens-servico",
    icon: ClipboardList,
    exclude: ["/balcao/ordens-servico/nova"],
  },
  {
    label: "Desempenho",
    href: "/balcao/desempenho-vendedor",
    icon: BarChart3,
  },
  {
    label: "Perfil",
    href: "/balcao/perfil",
    icon: User,
  },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  if (item.exclude?.some((route) => pathname.startsWith(route))) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Brand({ collapsed, mode }) {
  return (
    <div className="flex h-[78px] items-center gap-3 px-3">
      <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-[20px] border border-primary/15 bg-primary text-primary-foreground shadow-[0_18px_36px_-24px_rgba(108,77,230,0.9)]">
        <span className="text-base font-black tracking-[-0.06em]">VM</span>
        <span className="absolute inset-x-1 bottom-1 h-2 rounded-full bg-white/20 blur-[1px]" />
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-[-0.04em] text-dark-title">
            Vision Manager
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground">
            {mode === "admin" ? "Painel administrativo" : "Terminal do balcão"}
          </p>
        </div>
      )}
    </div>
  );
}

function NavItem({ item, active, collapsed, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={[
        "group relative flex h-14 items-center gap-3 overflow-hidden rounded-[22px] border px-3 transition-all duration-200",
        collapsed ? "justify-center" : "",
        active
          ? "border-primary/15 bg-primary text-primary-foreground shadow-[0_18px_35px_-28px_rgba(108,77,230,0.95)]"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "grid size-9 shrink-0 place-items-center rounded-[16px] transition-colors duration-200",
          active
            ? "bg-white/15 text-white"
            : "bg-secondary text-primary group-hover:bg-primary/10",
        ].join(" ")}
      >
        <Icon className="size-[18px]" strokeWidth={2.1} />
      </span>

      {!collapsed && (
        <>
          <span className="truncate text-sm font-semibold">{item.label}</span>
          {active && (
            <span className="ml-auto size-2 rounded-full bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.15)]" />
          )}
        </>
      )}
    </Link>
  );
}

export default function Sidebar({
  mode = "admin",
  collapsed = false,
  mobileOpen = false,
  onToggleCollapsed,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const items = mode === "balcao" ? balcaoItems : adminItems;
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível sair da conta.");
      }

      router.push(data?.redirectTo || "/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT_CLIENT_ERROR:", error);
      alert(error.message || "Erro ao sair da conta.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu lateral"
        onClick={onCloseMobile}
        className={[
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed bottom-3 left-3 top-3 z-50 flex w-[min(88vw,320px)] flex-col rounded-[34px] border border-border bg-card/95 shadow-[0_30px_90px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-[115%]",
          "lg:bottom-4 lg:left-4 lg:top-4 lg:translate-x-0 lg:transition-[width] lg:duration-300",
          collapsed ? "lg:w-[92px]" : "lg:w-[288px]",
        ].join(" ")}
      >
        <div className="flex items-center justify-between pr-3 lg:pr-0">
          <Brand collapsed={collapsed} mode={mode} />

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onCloseMobile}
            className="grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mx-4 h-px bg-border/80 lg:mx-3" />

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(pathname, item)}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
            />
          ))}
        </nav>

        <div className="space-y-3 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Sair da conta" : undefined}
            className={[
              "group flex h-14 w-full items-center gap-3 rounded-[22px] border border-transparent px-3 text-muted-foreground transition-all duration-200",
              "hover:border-destructive/15 hover:bg-destructive/10 hover:text-destructive",
              "disabled:cursor-not-allowed disabled:opacity-60",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[16px] bg-secondary text-muted-foreground transition-colors duration-200 group-hover:bg-destructive/10 group-hover:text-destructive">
              {loggingOut ? (
                <Loader2 className="size-[18px] animate-spin" strokeWidth={2.1} />
              ) : (
                <LogOut className="size-[18px]" strokeWidth={2.1} />
              )}
            </span>

            {!collapsed && (
              <span className="truncate text-sm font-semibold">
                {loggingOut ? "Saindo..." : "Sair da conta"}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          onClick={onToggleCollapsed}
          className="absolute -right-4 top-[104px] hidden size-7 place-items-center rounded-full border border-border bg-card text-primary shadow-[0_18px_35px_-24px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground lg:grid"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </aside>
    </>
  );
}
