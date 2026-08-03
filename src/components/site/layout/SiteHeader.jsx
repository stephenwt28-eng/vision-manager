import Link from "next/link";
import {
  ArrowRight,
  CircleUserRound,
  Menu,
} from "lucide-react";

const navItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para óticas", href: "#para-oticas" },
  { label: "Contato", href: "#contato" },
];

export default function SiteHeader() {
  return (
    <header className="relative left-3 right-3 top-3 z-40 sm:left-4 sm:right-4 sm:top-4">
      <div className="mx-auto h-[72px] w-full max-w-[1480px] rounded-[28px] border border-border bg-card/92 px-3 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.40)] backdrop-blur-xl sm:h-[88px] sm:px-5 lg:rounded-[34px]">
        
        {/* MOBILE */}
        <div className="grid h-full grid-cols-3 items-center lg:hidden">
          <div className="flex justify-start">
            <button
              type="button"
              aria-label="Abrir navegação"
              className="grid size-11 place-items-center rounded-full border border-border bg-background text-primary transition active:scale-95"
            >
              <Menu className="size-5" />
            </button>
          </div>

          <Link href="/" className="flex justify-center">
            <img
              src="/Logo_Red.png"
              alt="Logo Vision Manager"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </Link>

          <div className="flex justify-end">
            <Link
              href="/login"
              aria-label="Entrar na plataforma"
              className="grid size-11 place-items-center rounded-full border border-border bg-background text-primary transition hover:border-primary/20 hover:text-primary active:scale-95"
            >
              <CircleUserRound className="size-5" />
            </Link>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden h-full items-center justify-between gap-4 lg:flex">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/Logo_Red.png"
              alt="Logo Vision Manager"
              width={55}
              height={55}
              className="h-[55px] w-[55px] object-contain"
            />

            <img
              src="/Logo_Name2.png"
              alt="Logo Nome Vision Manager"
              width={190}
              height={90}
              className="h-auto w-[190px] object-contain"
            />
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border bg-background/85 p-1">
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
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
            >
              <CircleUserRound className="size-4" />
              Entrar
            </Link>

            <Link
              href="https://wa.me/5532999786331"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_18px_40px_-26px_rgba(108,77,230,0.95)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Demonstração
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}