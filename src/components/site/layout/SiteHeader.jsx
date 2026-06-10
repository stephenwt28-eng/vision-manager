import Link from "next/link";
import {
  ArrowRight,
  CircleUserRound,
  Menu,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para óticas", href: "#para-oticas" },
  { label: "Contato", href: "#contato" },
];

export default function SiteHeader() {
  return (
    <header className="fixed left-3 right-3 top-3 z-40 sm:left-4 sm:right-4 sm:top-4">
      <div className="mx-auto flex h-[88px] w-full max-w-[1480px] items-center justify-between gap-4 rounded-[34px] border border-border bg-card/92 px-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.40)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img 
  src="/Logo_Red.png" 
  alt="VM logo" 
  className="size-12 shrink-0 rounded-[20px] shadow-[0_18px_36px_-24px_rgba(108,77,230,0.95)]"
/>
          <div className="min-w-0">
            <p className="truncate text-sm font-black tracking-[-0.04em] text-dark-title sm:text-base">
              Vision Manager
            </p>
            <p className="hidden truncate text-xs font-medium text-muted-foreground sm:block">
              CRM elegante para óticas
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-background/85 p-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-12 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary sm:inline-flex"
          >
            <CircleUserRound className="size-4" />
            Entrar
          </Link>

          <Link
            href="#contato"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_18px_40px_-26px_rgba(108,77,230,0.95)] transition hover:-translate-y-0.5 hover:bg-primary-hover sm:px-5"
          >
            <Sparkles className="hidden size-4 sm:block" />
            Demonstração
            <ArrowRight className="size-4" />
          </Link>

          <button
            type="button"
            aria-label="Abrir navegação"
            className="grid size-12 place-items-center rounded-full border border-border bg-background text-primary lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
