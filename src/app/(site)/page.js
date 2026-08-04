import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  CircleX,
  FileText,
  Glasses,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  ArrowUp,
  Store,
  UserRound,
  UsersRound,
  WandSparkles,
} from "lucide-react";

const highlightStats = [
  {
    value: "1 painel",
    label: "para controle da operação",
  },
  {
    value: "2 ambientes",
    label: "administrativo e balcão",
  },
  {
    value: "100%",
    label: "focado na rotina da ótica",
  },
];

const pains = [
  {
    title: "Envelopes físicos difíceis de localizar",
    description:
      "Garantias, receitas e históricos ficam presos em gavetas, armários ou pastas. Quando o cliente retorna, a equipe perde tempo procurando informações básicas.",
  },
  {
    title: "Dados do cliente espalhados",
    description:
      "Parte das informações fica no papel, parte no WhatsApp e parte na memória dos vendedores. Isso dificulta o atendimento e aumenta o risco de erro.",
  },
  {
    title: "Pouca visibilidade sobre as ordens de serviço",
    description:
      "Sem status claros, fica mais difícil saber o que está em aberto, atrasado, pronto para retirada ou pendente de fornecedor.",
  },
  {
    title: "Gestão dependente de conferência manual",
    description:
      "O gestor precisa perguntar, conferir papel ou montar planilhas para entender vendas, desempenho da equipe e andamento dos pedidos.",
  },
];

const features = [
  {
    icon: UserRound,
    title: "Cadastro completo de clientes",
    description:
      "Centralize dados pessoais, contatos, histórico de compras, receitas, observações e documentos vinculados ao cliente.",
  },
  {
    icon: FileText,
    title: "Envelope digital",
    description:
      "Organize receitas, anexos, garantias e registros do atendimento em um ambiente digital, reduzindo a dependência de envelopes físicos.",
  },
  {
    icon: ClipboardList,
    title: "Ordens de serviço organizadas",
    description:
      "Crie e acompanhe OS com vendedor, produto, lente, armação, valores, prazos, status e informações essenciais para entrega.",
  },
  {
    icon: UsersRound,
    title: "Controle de funcionários",
    description:
      "Cadastre vendedores, defina permissões e acompanhe a atuação da equipe com mais clareza e segurança operacional.",
  },
  {
    icon: BarChart3,
    title: "Relatórios gerenciais",
    description:
      "Acompanhe vendas, ticket médio, ordens em aberto, atrasos, clientes atendidos e desempenho por vendedor.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso por perfil",
    description:
      "Separe a visão administrativa da visão de balcão, garantindo que cada usuário acesse apenas o que precisa para executar sua função.",
  },
];

const steps = [
  {
    number: "01",
    title: "Localize ou cadastre o cliente",
    description:
      "Pesquise por nome, telefone ou CPF. Caso o cliente ainda não exista, cadastre as informações principais em poucos passos.",
  },
  {
    number: "02",
    title: "Registre a venda e a ordem de serviço",
    description:
      "Inclua vendedor, receita, armação, lentes, valores, prazos, observações e anexos importantes para o acompanhamento.",
  },
  {
    number: "03",
    title: "Acompanhe até a entrega",
    description:
      "Visualize status, pendências, atrasos, produtos prontos para retirada e histórico completo do atendimento.",
  },
];

const audienceCards = [
  {
    icon: Store,
    title: "Para a ótica",
    description:
      "Mais controle sobre clientes, vendas, ordens de serviço e documentos, com redução de retrabalho e perda de informação.",
  },
  {
    icon: Glasses,
    title: "Para o balcão",
    description:
      "Atendimento mais rápido, busca simples por cliente e acesso fácil ao histórico sem depender de envelopes físicos.",
  },
  {
    icon: Layers3,
    title: "Para a gestão",
    description:
      "Indicadores claros para acompanhar a operação, identificar gargalos e tomar decisões com base em dados reais.",
  },
];

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

function ProductWindow() {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-16 hidden w-44 rounded-[26px] border border-border bg-card/95 p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.50)] backdrop-blur-xl xl:block">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
          OS em atraso
        </p>
        <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
          08
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Identifique pedidos que precisam de atenção antes do cliente cobrar.
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
          Acompanhe indicadores comerciais sem depender de planilhas externas.
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
              ["08", "Em atraso"],
              ["142", "Clientes ativos"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[28px] border border-border bg-card p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]"
              >
                <p className="text-2xl font-black tracking-[-0.055em] text-dark-title">
                  {value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[-0.03em] text-dark-title">
                    Desempenho comercial
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Visão resumida das vendas por período.
                  </p>
                </div>
                <span className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-xs font-bold text-primary">
                  +18%
                </span>
              </div>

              <div className="mt-6 flex h-48 items-end gap-3 rounded-[26px] bg-background/80 p-4">
                {[42, 54, 38, 72, 62, 88, 76].map((height, index) => (
                  <div
                    key={height + index}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div
                      className="w-full rounded-b-[10px] rounded-t-[18px] bg-primary shadow-[0_18px_32px_-24px_rgba(108,77,230,0.9)]"
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

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        Demonstração visual do painel. Os dados exibidos são exemplos.
      </p>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="overflow-hidden rounded-[42px] border border-border bg-card shadow-[0_32px_90px_-64px_rgba(15,23,42,0.38)]">
      <div className="aspect-[16/10] bg-background">
        <img
          src="/Print_3.png"
          alt="Imagem da ótica ou equipe utilizando o sistema"
          className="h-full w-full opacity-80"
          width={800}
          height={280
          
          }
        />
      </div>
    </div>
  );
}

export default function SiteHomePage() {
  return (
    <>
      <section id="topo" className="px-3 mt-10 pb-14 sm:px-4 sm:pb-20">
        <div className="mx-auto grid w-full max-w-[1480px] gap-10 overflow-hidden rounded-[48px] border border-border bg-card px-5 py-8 shadow-[0_42px_120px_-72px_rgba(15,23,42,0.46)] sm:px-8 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10 lg:py-12">
          <div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.075em] text-dark-title sm:text-5xl lg:text-6xl xl:text-[4.7rem]">
              Organize clientes, ordens de serviço e envelopes digitais em uma única
              plataforma.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              O Vision Manager ajuda óticas a reduzir perda de informação, melhorar o
              acompanhamento de pedidos e dar mais controle ao atendimento, ao balcão e
              à gestão.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
  href="/83972SIGNUP2309"
  className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-primary-foreground shadow-[0_24px_50px_-32px_rgba(108,77,230,0.95)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
>
  Solicitar demonstração
  <ArrowRight className="size-4" />
</Link>

              <Link
                href="#problemas"
                className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-black text-dark-title transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
              >
                Ver problemas resolvidos
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

      <section id="problemas" className="px-3 py-8 sm:px-4 sm:py-10">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[42px] border border-border bg-card p-6 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.35)] sm:p-8">

            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-dark-title sm:text-4xl">
              O problema não é só o envelope. É a informação fora do lugar.
            </h2>

            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Em muitas óticas, a rotina ainda depende de papel, conferência manual e
              comunicação fragmentada. Isso torna o atendimento mais lento, dificulta o
              controle das OS e reduz a previsibilidade da gestão.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pains.map((pain) => (
              <div
                key={pain.title}
                className="rounded-[34px] border border-border bg-card p-5 shadow-[0_24px_65px_-56px_rgba(15,23,42,0.36)]"
              >
                <div className="grid size-11 place-items-center rounded-[18px] bg-red-500/10 text-red-400">
                  <CircleX className="size-5" />
                </div>

                <h3 className="mt-4 text-lg font-black leading-6 tracking-[-0.04em] text-dark-title">
                  {pain.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {pain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>

            <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
              Uma plataforma para padronizar a operação da ótica.
            </h2>

            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              O Vision Manager foi pensado para reunir os principais dados da operação
              em um ambiente simples: cliente, receita, OS, documentos, vendedor,
              financeiro básico e acompanhamento de entrega.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Menos dependência de papel",
                "Histórico do cliente centralizado",
                "Acompanhamento de OS por status",
                "Relatórios para tomada de decisão",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[22px] border border-border bg-card px-4 py-3"
                >
                  <CheckCircle2 className="size-5 text-primary" />
                  <span className="text-sm font-bold text-dark-title">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[42px] border border-border bg-card shadow-[0_32px_90px_-64px_rgba(15,23,42,0.38)]">
            <div className="aspect-[16/10] bg-background">
              <img
                src="/Print_1.png"
                alt="Imagem da ótica ou equipe utilizando o sistema"
                className="h-full w-full opacity-80"
                width={800}
                height={280
                
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="max-w-3xl">

            <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
              Funcionalidades criadas para a rotina real da ótica.
            </h2>

            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Cada módulo tem uma função clara dentro do processo: organizar o
              atendimento, reduzir falhas operacionais e dar mais visibilidade para a
              gestão.
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
              <Eyebrow>Fluxo de uso</Eyebrow>

              <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
                Do cadastro do cliente à entrega do pedido.
              </h2>

              <p className="mt-5 text-base leading-8 text-muted-foreground">
                A plataforma organiza o processo em etapas simples, mantendo o balcão
                ágil e o administrativo com acesso às informações necessárias para
                acompanhar a operação.
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
                Mais organização para quem atende, vende e gerencia.
              </h2>
            </div>

            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              O sistema atende três frentes importantes da ótica: operação, balcão e
              gestão. Isso facilita a adoção pela equipe e transforma o software em uma
              ferramenta de rotina, não apenas em um painel para o gestor.
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

      <section className="px-3 py-12 sm:px-4 sm:py-16">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 rounded-[48px] border border-border bg-card p-5 shadow-[0_42px_120px_-72px_rgba(15,23,42,0.42)] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-10">
          <ImagePlaceholder />

          <div>

            <h2 className="mt-5 text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-5xl">
              Um sistema para começar simples e evoluir com a ótica.
            </h2>

            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              A plataforma pode ser usada inicialmente para organizar clientes, OS e
              envelopes digitais. Depois, a ótica pode avançar para relatórios,
              permissões, indicadores comerciais e processos mais completos.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Cadastro inicial de clientes e equipe",
                "Configuração de permissões por perfil",
                "Padronização do fluxo de atendimento",
                "Acompanhamento das primeiras ordens de serviço",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[22px] border border-border bg-background/75 px-4 py-3"
                >
                  <CheckCircle2 className="size-5 text-primary" />
                  <span className="text-sm font-bold text-dark-title">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-10 pt-12 sm:px-4 sm:pb-14 sm:pt-16">
        <div className="mx-auto w-full max-w-[1480px] overflow-hidden rounded-[48px] border border-primary/15 bg-primary px-5 py-8 text-primary-foreground shadow-[0_42px_120px_-60px_rgba(108,77,230,0.75)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>

              <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.065em] text-white sm:text-5xl">
                Veja como o Vision Manager pode organizar a rotina da sua ótica.
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                Agende uma apresentação para conhecer os recursos, entender o fluxo de
                uso e avaliar como a plataforma se encaixa no atendimento, na gestão e
                no controle das ordens de serviço.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/83972SIGNUP2309"
                className="inline-flex h-[58px] items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-primary transition hover:-translate-y-0.5"
              >
                Solicitar demonstração
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
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 sm:bottom-7 sm:right-7">
        <Link
          href="http://wa.me/5532999786332"
          target="_blank"
          aria-label="Falar no WhatsApp"
          className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_24px_50px_-28px_rgba(108,77,230,0.95)] transition hover:-translate-y-1 hover:bg-primary-hover"
        >
          <MessageCircle className="size-6" />
        </Link>

        <a
          href="#topo"
          aria-label="Voltar para o topo"
          className="grid size-14 place-items-center rounded-full border border-border bg-card text-primary shadow-[0_24px_50px_-34px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-primary/25 hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowUp className="size-6" />
        </a>
      </div>
    </>
  );
}
