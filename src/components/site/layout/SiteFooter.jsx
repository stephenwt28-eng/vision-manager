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
      { label: "Contato", href: "https://wa.me/5532999786332" },
      { label: "Entrar", href: "/login" },
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
              href="https://wa.me/5532999786332"
              target="_blank"
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
              <img src="/Logo_Red.png"
               alt="Logo Vision Manager"
               width={75}
               height={75} 
              ></img>
              <div>
                <img src="/Logo_Name2.png"
                 alt="Logo Nome"
                 width={240}
                 height={90}
                ></img>
              </div>
            </Link>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-3">
                <Building2 className="size-4 text-primary" />
                Plataforma institucional e operacional
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 text-primary" />
                bitbloomai@gmail.com
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-4 text-primary" />
                (32) 99978-6332
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

        <div className="flex flex-col gap-5 border-t border-border px-5 py-5 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between sm:px-8">
          <div className="flex flex-col gap-2">
            <p>
              © {new Date().getFullYear()} Vision Manager. Todos os direitos reservados.
            </p>

            <Link
              href="https://bitbloomai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary"
            >
              <span>Desenvolvido por</span>

              <img
                src="/Logo_BB.png"
                alt="BitBloom AI"
                width={96}
                height={28}
                className="h-6 w-auto opacity-80 transition group-hover:opacity-100"
              />
            </Link>
          </div>

          <div className="flex flex-wrap gap-4">

            <Link href="/termos" target="_blank" className="transition hover:text-primary">
              Termos de Uso e Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
