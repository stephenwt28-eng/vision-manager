import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Glasses,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  UsersRound,
  WandSparkles,
} from "lucide-react";

const highlightStats = [
  {
    value: "1 painel",
    label: "para gestão e operação",
  },
  {
    value: "2 ambientes",
    label: "admin + balcão",
  },
  {
    value: "0 envelopes",
    label: "perdidos no armário",
  },
];

const pains = [
  "Histórico do cliente espalhado em papel, WhatsApp e memória.",
  "Ordens de serviço difíceis de acompanhar até a entrega.",
  "Gestor sem clareza rápida sobre vendas, atrasos e desempenho.",
  "Balcão operando no improviso quando deveria operar com precisão.",
];

const features = [
  {
    icon: UserRound,
    title: "Cadastro e histórico do cliente",
    description:
      "Cada cliente ganha um perfil organizado com dados, compras, anexos e observações em um só lugar.",
  },
  {
    icon: FileText,
    title: "Envelope Digital",
    description:
      "Substitua o envelope físico por uma central digital de receitas, documentos e registros vinculados.",
  },
  {
    icon: ClipboardList,
    title: "Ordens de Serviço",
    description:
      "Crie, acompanhe e entregue OS com status claros, prazos e informações completas do pedido.",
  },
  {
    icon: UsersRound,
    title: "Gestão de funcionários",
    description:
      "Organize vendedores, cargos, acessos e desempenho individual sem transformar o sistema em um labirinto.",
  },
  {
    icon: BarChart3,
    title: "Relatórios que ajudam a decidir",
    description:
      "Vendas, ticket médio, entregas, atrasos e ranking de vendedores sem dashboard decorativo.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso por perfil",
    description:
      "Administrador com visão gerencial. Balcão com foco no atendimento. Cada tela com o peso certo.",
  },
];

const steps = [
  {
    number: "01",
    title: "Encontre ou cadastre",
    description:
      "Busque o cliente por nome, telefone ou CPF. Se não existir, registre em poucos cliques.",
  },
  {
    number: "02",
    title: "Crie a OS",
    description:
      "Inclua vendedor, receita, armação, lente, valores, prazo e anexos em um fluxo limpo.",
  },
  {
    number: "03",
    title: "Acompanhe sem caos",
    description:
      "Monitore atrasos, andamento, retirada e histórico enquanto o painel administrativo revela os números.",
  },
];

const audienceCards = [
  {
    icon: Store,
    title: "Para a ótica",
    description:
      "Mais organização, menos dependência de papel e uma operação que parece tão profissional quanto a marca deseja ser.",
  },
  {
    icon: Glasses,
    title: "Para o balcão",
    description:
      "Busca rápida, criação de OS fluida e histórico do cliente à mão. Atendimento sem caça ao tesouro.",
  },
  {
    icon: Layers3,
    title: "Para o gestor",
    description:
      "Indicadores, relatórios e controle real da rotina. Decisão com base em cenário, não em sensação.",
  },
];

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
      <Sparkles className="size-3.5" />
      {children}
    </span>
  );
}

function ProductWindow() {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-16 hidden w-44 rounded-[26px] border border-border bg-card/95 p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.50)] backdrop-blur-xl xl:block">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
          OS atrasadas
        </p>
        <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">08</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Priorize entregas antes que elas virem ligação irritada.
        </p>
      </div>

      <div className="absolute -right-4 bottom-16 hidden w-48 rounded-[26px] border border-border bg-card/95 p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.50)] backdrop-blur-xl xl:block">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
          Ticket médio
        </p>
        <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
          R$ 684
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Informação útil, não enfeite de gráfico.
        </p>
      </div>

      <div className="overflow-hidden rounded-[42px] border border-border bg-card shadow-[0_42px_120px_-60px_rgba(15,23,42,0.52)]">
        <div className="flex items-center justify-between border-b border-border bg-background/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-primary/90" />
            <span className="size-3 rounded-full bg-primary/40" />
            <span className="size-3 rounded-full bg-primary/20" />
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground">
            visionmanager.com.br/admin
          </div>
        </div>

        <div className="grid gap-4 bg-background/70 p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["R$ 48.320", "Vendas do mês"],
              ["36", "OS abertas"],
              ["08", "Atrasadas"],
              ["142", "Clientes"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[28px] border border-border bg-card p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]"
              >
                <p className="text-2xl font-black tracking-[-0.055em] text-dark-title">
                  {value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[-0.03em] text-dark-title">
                    Ritmo de vendas
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A leitura rápida que o dono precisa abrir pela manhã.
                  </p>
                </div>
                <span className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-xs font-bold text-primary">
                  +18%
                </span>
              </div>

              <div className="mt-6 flex h-48 items-end gap-3 rounded-[26px] bg-background/80 p-4">
                {[42, 54, 38, 72, 62, 88, 76].map((height, index) => (
                  <div key={height + index} className="flex flex-1 flex-col items-center gap-3">
                    <div
                      className="w-full rounded-t-[18px] rounded-b-[10px] bg-primary shadow-[0_18px_32px_-24px_rgba(108,77,230,0.9)]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {["S", "T", "Q", "Q", "S", "S", "D"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]">
              <p className="text-sm font-black tracking-[-0.03em] text-dark-title">
                Prontas para retirada
              </p>
              <div className="mt-5 space-y-3">
                {[
                  ["OS #1042", "Maria F.", "Hoje"],
                  ["OS #1038", "José C.", "Hoje"],
                  ["OS #1031", "Ana L.", "Amanhã"],
                ].map(([os, client, when]) => (
                  <div
                    key={os}
                    className="flex items-center justify-between gap-3 rounded-[22px] border border-border bg-background/80 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-dark-title">{os}</p>
                      <p className="text-xs text-muted-foreground">{client}</p>
                    </div>
                    <span className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-[11px] font-black text-primary">
                      {when}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteHomePage() {
  return (
    <>
      <section className="px-3 pb-14 pt-6 sm:px-4 sm:pb-20">
        <div className="mx-auto grid w-full max-w-[1480px] gap-10 overflow-hidden rounded-[48px] border border-border bg-card px-5 py-8 shadow-[0_42px_120px_-72px_rgba(15,23,42,0.46)] sm:px-8 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10 lg:py-12">
          <div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.075em] text-dark-title sm:text-5xl lg:text-6xl xl:text-[4.7rem]">
              Sua ótica para de correr atrás de papel e começa a operar com visão.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              O Vision Manager reúne clientes, envelopes digitais, ordens de serviço,
              vendedores e relatórios em uma plataforma elegante, rápida e feita para
              a rotina real da loja.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-primary-foreground shadow-[0_24px_50px_-32px_rgba(108,77,230,0.95)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Quero começar
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="#recursos"
                className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-black text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
              >
                Ver recursos
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlightStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[26px] border border-border bg-background/75 p-4"
                >
                  <p className="text-xl font-black tracking-[-0.05em] text-dark-title">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ProductWindow />
        </div>
      </section>

      <section className="px-3 py-8 sm:px-4 sm:py-10">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[42px] border border-border bg-card p-6 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.35)] sm:p-8">
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-dark-title sm:text-4xl">
              Boa ótica não deveria parecer organizada só quando o dono está presente.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Quando a informação depende de envelopes físicos, conversas antigas e lembrança
              de funcionário, a operação vira um castelo de cartas com nota fiscal embaixo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pains.map((pain) => (
              <div
                key={pain}
                className="rounded-[34px] border border-border bg-card p-5 shadow-[0_24px_65px_-56px_rgba(15,23,42,0.36)]"
              >
                <CheckCircle2 className="size-5 text-primary" />
                <p className="mt-4 text-base font-bold leading-7 tracking-[-0.025em] text-dark-title">
                  {pain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="max-w-3xl">
            <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
              Uma plataforma com função. Não um carnaval de telas.
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Cada módulo nasce para resolver um pedaço concreto da rotina da ótica,
              sem empurrar complexidade disfarçada de “robustez”.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-[36px] border border-border bg-card p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-primary/20"
                >
                  <div className="grid size-14 place-items-center rounded-[22px] bg-primary/[0.08] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto w-full max-w-[1480px] rounded-[48px] border border-border bg-card p-5 shadow-[0_42px_120px_-72px_rgba(15,23,42,0.42)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
                Do primeiro atendimento à entrega, sem buracos no caminho.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                A experiência foi pensada para o balcão ser veloz e o administrativo ser
                claro. Cada um com sua função, nenhum dos dois atrapalhando o outro.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-bold text-dark-title">
                <Search className="size-4 text-primary" />
                Busca rápida como ponto de partida
              </div>
            </div>

            <div className="grid gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-4 rounded-[34px] border border-border bg-background/75 p-5 sm:grid-cols-[92px_1fr] sm:items-start"
                >
                  <div className="inline-flex h-16 items-center justify-center rounded-[24px] bg-primary text-2xl font-black tracking-[-0.06em] text-primary-foreground">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-[-0.045em] text-dark-title">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="para-oticas" className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
                A operação inteira melhora quando a informação para de se esconder.
              </h2>
            </div>

            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              O sistema serve a três frentes ao mesmo tempo: a empresa, o atendimento e
              a gestão. Isso importa, porque software que só agrada ao dono costuma ser
              sabotado pela rotina.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {audienceCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[38px] border border-border bg-card p-6 shadow-[0_28px_80px_-62px_rgba(15,23,42,0.36)]"
                >
                  <div className="grid size-14 place-items-center rounded-[22px] bg-primary text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black tracking-[-0.05em] text-dark-title">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-3 pb-10 pt-12 sm:px-4 sm:pb-14 sm:pt-16">
        <div className="mx-auto w-full max-w-[1480px] overflow-hidden rounded-[48px] border border-primary/15 bg-primary px-5 py-8 text-primary-foreground shadow-[0_42px_120px_-60px_rgba(108,77,230,0.75)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                <WandSparkles className="size-3.5" />
                Pronto para testar
              </div>

              <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.065em] text-white sm:text-5xl">
                O Vision Manager já pode nascer com cara de software que vende confiança.
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                A base visual, os fluxos de produto e a divisão admin/balcão estão jogando
                no mesmo time. Agora é plugar dados reais e deixar a plataforma ganhar musculatura.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/signup"
                className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-primary transition hover:-translate-y-0.5"
              >
                Criar conta
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-[58px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Entrar na plataforma
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
