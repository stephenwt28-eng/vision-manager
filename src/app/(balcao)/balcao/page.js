import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Glasses,
  Plus,
  ScanSearch,
  Search,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

const quickActions = [
  {
    title: "Novo cliente",
    description: "Cadastre quem ainda não está na base.",
    href: "/balcao/clientes/novo",
    icon: UserRoundPlus,
  },
  {
    title: "Nova OS",
    description: "Crie um pedido sem sair do fluxo.",
    href: "/balcao/ordens-servico/nova",
    icon: Plus,
  },
  {
    title: "Consultar OS",
    description: "Veja status, prazo e detalhes.",
    href: "/balcao/ordens-servico",
    icon: ClipboardList,
  },
];

const recentClients = [
  {
    name: "Marina Andrade",
    phone: "(32) 99991-1122",
    note: "Comprou há 18 dias",
  },
  {
    name: "Carlos Henrique",
    phone: "(32) 98888-7711",
    note: "OS aberta",
  },
  {
    name: "Ana Luiza",
    phone: "(32) 99770-3344",
    note: "Cliente recorrente",
  },
];

const operationalOrders = [
  {
    os: "OS #1057",
    client: "Roberta Nunes",
    status: "Pronta para retirada",
  },
  {
    os: "OS #1054",
    client: "Mateus Ribeiro",
    status: "Aguardando retorno",
  },
  {
    os: "OS #1049",
    client: "Lívia Moreira",
    status: "Em laboratório",
  },
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1.5 text-xs font-black text-primary">
      {children}
    </span>
  );
}

export default function BalcaoHomePage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-[42px] border border-border bg-card p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.42)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <ScanSearch className="size-3.5" />
              Terminal do balcão
            </span>

            <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.065em] text-dark-title sm:text-4xl">
              Comece pelo cliente. O resto do atendimento se organiza em volta dele.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Busca rápida, cadastro ágil e criação de ordem de serviço sem atravessar um
              corredor de telas. Balcão tem que ser veloz, não burocrático.
            </p>
          </div>

          <div className="rounded-[34px] border border-border bg-background/75 p-4 shadow-[0_24px_60px_-54px_rgba(15,23,42,0.38)]">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-4">
              <Search className="size-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">
                Cliente, telefone, CPF ou número da OS...
              </span>
            </div>
            <p className="mt-3 px-1 text-xs leading-6 text-muted-foreground">
              Visual de busca demonstrativo. Depois conectamos isso à pesquisa real.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[36px] border border-border bg-card p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-primary/20"
            >
              <div className="grid size-14 place-items-center rounded-[22px] bg-primary text-primary-foreground">
                <Icon className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {action.description}
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                Abrir
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
                Clientes recentes
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Retome atendimentos sem recomeçar do zero.
              </p>
            </div>
            <Pill>Base viva</Pill>
          </div>

          <div className="space-y-3 pt-5">
            {recentClients.map((client) => (
              <div
                key={client.name}
                className="flex flex-col gap-3 rounded-[28px] border border-border bg-background/75 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
                    <UsersRound className="size-5" />
                  </div>
                  <div>
                    <p className="font-black tracking-[-0.03em] text-dark-title">
                      {client.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-border bg-card px-3 py-2 text-xs font-black text-dark-title">
                  {client.note}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
                Pedidos em movimento
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                O balcão enxerga o que precisa responder rápido.
              </p>
            </div>
            <Pill>Operação</Pill>
          </div>

          <div className="space-y-3 pt-5">
            {operationalOrders.map((order) => (
              <div
                key={order.os}
                className="grid gap-3 rounded-[28px] border border-border bg-background/75 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
                    <Glasses className="size-5" />
                  </div>
                  <div>
                    <p className="font-black tracking-[-0.03em] text-dark-title">{order.os}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{order.client}</p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-primary/[0.08] px-3 py-2 text-xs font-black text-primary">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[38px] border border-border bg-primary p-5 text-primary-foreground shadow-[0_36px_90px_-58px_rgba(108,77,230,0.76)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                <BadgeCheck className="size-3.5" />
                Fluxo recomendado
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.055em] text-white">
                Encontrou o cliente? Abra o histórico antes de criar uma nova OS.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">
                Isso evita cadastro duplicado, melhora o atendimento e preserva o envelope digital como fonte central de verdade.
              </p>
            </div>

            <Link
              href="/balcao"
              className="inline-flex h-[56px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-primary transition hover:-translate-y-0.5"
            >
              Buscar cliente
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
            Lembrete operacional
          </p>
          <h3 className="mt-4 text-2xl font-black tracking-[-0.055em] text-dark-title">
            Balcão bom é rápido, mas não atropelado.
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Use esta home como estação de partida. Ela ajuda a equipe a entrar pelo caminho
            certo e reduz clique aleatório.
          </p>
        </div>
      </section>
    </div>
  );
}
