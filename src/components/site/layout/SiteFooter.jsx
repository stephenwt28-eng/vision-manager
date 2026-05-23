import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

const footerColumns = [
  {
    title: "Produto",
    links: [
      { label: "Dashboard", href: "#recursos" },
      { label: "Envelope digital", href: "#recursos" },
      { label: "Ordens de serviço", href: "#recursos" },
      { label: "Relatórios", href: "#recursos" },
    ],
  },
  {
    title: "Para a operação",
    links: [
      { label: "Atendimento de balcão", href: "#para-oticas" },
      { label: "Histórico de clientes", href: "#para-oticas" },
      { label: "Controle de vendedores", href: "#para-oticas" },
      { label: "Gestão de entregas", href: "#para-oticas" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre a solução", href: "#como-funciona" },
      { label: "Contato", href: "#contato" },
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/signup" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="contato" className="px-3 pb-4 pt-16 sm:px-4 sm:pb-5">
      <div className="mx-auto w-full max-w-[1480px] overflow-hidden rounded-[42px] border border-border bg-card shadow-[0_32px_90px_-50px_rgba(15,23,42,0.40)]">
        <div className="grid gap-8 border-b border-border px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>

            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.055em] text-dark-title sm:text-4xl">
              Uma operação que sai do papel, ganha visão e para de depender de memória.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              O Vision Manager organiza clientes, vendas, ordens de serviço e desempenho da equipe
              em uma experiência limpa, pronta para apresentar profissionalismo desde o primeiro clique.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[30px] border border-border bg-background/80 p-4 sm:p-5">
            <h2 className="mt-4 mb-4 text-center max-w-3xl text-3xl font-black tracking-[-0.055em] text-dark-title sm:text-4xl">Quero conhecer a plataforma</h2>

            <Link
              href="/signup"
              className="mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-[20px] bg-primary text-sm font-black text-primary-foreground">
                VM
              </div>
              <div>
                <p className="text-base font-black tracking-[-0.04em] text-dark-title">
                  Vision Manager
                </p>
                <p className="text-sm text-muted-foreground">Gestão moderna para óticas</p>
              </div>
            </Link>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-3">
                <Building2 className="size-4 text-primary" />
                Plataforma institucional e operacional
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 text-primary" />
                contato@suaempresa.com
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-4 text-primary" />
                (00) 00000-0000
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="size-4 text-primary" />
                Brasil
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-dark-title">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Vision Manager. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="transition hover:text-primary">
              Política de privacidade
            </Link>
            <Link href="#" className="transition hover:text-primary">
              Termos de uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
