"use client";

import {
  Cake,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  ExternalLink,
  Gift,
  MessageCircle,
  Megaphone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const MARKETING_SEGMENTS = [
  {
    id: "todos",
    label: "Todos",
    title: "Todos os clientes",
    description: "Base completa disponível para ações manuais.",
    icon: UsersRound,
  },
  {
    id: "aniversariantes",
    label: "Aniversariantes",
    title: "Aniversariantes",
    description: "Clientes que fazem aniversário no mês atual.",
    icon: Cake,
  },
  {
    id: "promocao",
    label: "Promoção",
    title: "Campanha promocional",
    description: "Selecione clientes e envie uma mensagem comercial.",
    icon: Megaphone,
  },
  {
    id: "receita_vencendo",
    label: "Receita vencendo",
    title: "Receitas vencendo",
    description: "Clientes com receita perto de completar 12 meses.",
    icon: Clock3,
  },
  {
    id: "receita_vencida",
    label: "Receita vencida",
    title: "Receitas vencidas",
    description: "Clientes com receita antiga e bom potencial de retorno.",
    icon: CheckCircle2,
  },
  {
    id: "dois_anos_sem_oculos",
    label: "2 anos sem óculos",
    title: "Clientes sumidos",
    description: "Clientes sem OS recente há 24 meses ou mais.",
    icon: Sparkles,
  },
];

export const DEFAULT_MARKETING_MESSAGES = {
  todos:
    "Olá, {nome}! Tudo bem? Aqui é da ótica. Passando para lembrar que estamos à disposição para cuidar da sua visão. 😊",

  aniversariantes:
    "Olá, {nome}! Feliz aniversário! 🎉 Que seu dia seja cheio de alegria. Temos uma condição especial esperando por você aqui na ótica.",

  promocao:
    "Olá, {nome}! Temos uma promoção especial na ótica por tempo limitado. Quer que eu te envie os detalhes? 😊",

  receita_vencendo:
    "Olá, {nome}! Tudo bem? Sua receita está perto de completar 1 ano. Que tal agendar uma nova avaliação e conferir se está tudo certinho com sua visão?",

  receita_vencida:
    "Olá, {nome}! Notamos que sua receita já tem mais de 1 ano. É um bom momento para revisar seus óculos e garantir mais conforto no dia a dia.",

  dois_anos_sem_oculos:
    "Olá, {nome}! Faz um tempinho desde sua última compra de óculos conosco. Temos novidades lindas e condições especiais para você renovar seu visual. 👓",
};

export const WHATSAPP_BASE_URL = "https://wa.me";

/* ==========================================================================
   HELPERS
   ========================================================================== */

export function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function getFirstName(name = "") {
  const cleanName = String(name || "").trim();

  if (!cleanName) return "cliente";

  return cleanName.split(" ")[0];
}

export function formatDateBR(value) {
  if (!value) return "Não informado";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    const fallbackDate = new Date(value);

    if (Number.isNaN(fallbackDate.getTime())) return "Não informado";

    return fallbackDate.toLocaleDateString("pt-BR");
  }

  return date.toLocaleDateString("pt-BR");
}

export function formatPhoneBR(value = "") {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return value || "Sem telefone";
}

export function buildMessage(template = "", cliente = {}) {
  const nome = getFirstName(cliente?.nome_completo || cliente?.nome || "");

  return String(template || "")
    .replaceAll("{nome}", nome)
    .replaceAll("{cliente}", nome)
    .trim();
}

export function buildWhatsappLink({ phone, message }) {
  const digits = onlyDigits(phone);

  if (!digits) return "";

  const phoneWithCountryCode = digits.startsWith("55") ? digits : `55${digits}`;

  return `${WHATSAPP_BASE_URL}/${phoneWithCountryCode}?text=${encodeURIComponent(
    message || ""
  )}`;
}

export function getSegmentById(segmentId) {
  return (
    MARKETING_SEGMENTS.find((segment) => segment.id === segmentId) ||
    MARKETING_SEGMENTS[0]
  );
}

function getClienteId(cliente) {
  return cliente?.id || cliente?.cliente_id;
}

function getClientePhone(cliente) {
  return (
    cliente?.telefone_principal ||
    cliente?.telefone ||
    cliente?.whatsapp ||
    cliente?.celular ||
    ""
  );
}

function getClienteName(cliente) {
  return cliente?.nome_completo || cliente?.nome || "Cliente sem nome";
}

function getClienteBirthDate(cliente) {
  return cliente?.data_nascimento || cliente?.nascimento || null;
}

function getMetaText(cliente) {
  const pieces = [];

  if (cliente?.marketing_reason) pieces.push(cliente.marketing_reason);
  if (cliente?.ultima_compra_label) pieces.push(`Última compra: ${cliente.ultima_compra_label}`);
  if (cliente?.ultima_receita_label) pieces.push(`Última receita: ${cliente.ultima_receita_label}`);

  return pieces.filter(Boolean).join(" • ");
}

/* ==========================================================================
   MINI COMPONENTES
   ========================================================================== */

export function MarketingPageHeader({
  onRefresh,
  isLoading = false,
  totalClientes = 0,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          Marketing via link do WhatsApp
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Marketing
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Crie listas inteligentes, use mensagens prontas e abra conversas no
          WhatsApp sem complicar o sistema com integração pesada.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="rounded-2xl border bg-white px-4 py-3 text-sm">
          <span className="text-muted-foreground">Clientes carregados</span>
          <strong className="ml-2 text-slate-950">{totalClientes}</strong>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
}

export function MarketingKpis({ stats = {} }) {
  const items = [
    {
      label: "Clientes com telefone",
      value: stats.withPhone || 0,
      description: "Podem receber mensagem pelo WhatsApp.",
      icon: MessageCircle,
    },
    {
      label: "Aniversariantes",
      value: stats.birthdays || 0,
      description: "No mês atual.",
      icon: Cake,
    },
    {
      label: "Receitas vencendo",
      value: stats.expiringPrescriptions || 0,
      description: "Próximas de completar 12 meses.",
      icon: Clock3,
    },
    {
      label: "2 anos sem comprar",
      value: stats.inactiveTwoYears || 0,
      description: "Ótima chance de reativação.",
      icon: Gift,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <strong className="mt-2 block text-3xl font-bold tracking-tight text-slate-950">
                  {item.value}
                </strong>
              </div>

              <div className="rounded-2xl bg-slate-100 p-3">
                <Icon className="h-5 w-5 text-slate-700" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function MarketingSegments({
  activeSegment,
  onChange,
  counts = {},
}) {
  return (
    <div className="rounded-3xl border bg-white p-3 shadow-sm">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        {MARKETING_SEGMENTS.map((segment) => {
          const Icon = segment.icon;
          const isActive = activeSegment === segment.id;

          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onChange(segment.id)}
              className={[
                "rounded-2xl border px-4 py-3 text-left transition",
                isActive
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-4 w-4" />

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-white text-muted-foreground",
                  ].join(" ")}
                >
                  {counts?.[segment.id] || 0}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold">{segment.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MarketingFilters({
  filters,
  onChange,
  onClear,
  hasActiveFilters = false,
}) {
  function updateFilter(key, value) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_160px_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Buscar por nome, telefone, CPF, cidade..."
            className="h-11 w-full rounded-full border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-950"
          />
        </label>

        <select
          value={filters.contactStatus}
          onChange={(event) =>
            updateFilter("contactStatus", event.target.value)
          }
          className="h-11 rounded-full border bg-white px-4 text-sm outline-none transition focus:border-slate-950"
        >
          <option value="todos">Todos os contatos</option>
          <option value="com_telefone">Com telefone</option>
          <option value="sem_telefone">Sem telefone</option>
        </select>

        <select
          value={filters.onlyActive}
          onChange={(event) => updateFilter("onlyActive", event.target.value)}
          className="h-11 rounded-full border bg-white px-4 text-sm outline-none transition focus:border-slate-950"
        >
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
}

export function MarketingMessageBox({
  activeSegment,
  template,
  onTemplateChange,
  selectedCount = 0,
  onClearSelection,
}) {
  const segment = getSegmentById(activeSegment);

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Mensagem pronta
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Campanha atual: <strong>{segment.title}</strong>. Use{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">
              {"{nome}"}
            </code>{" "}
            para personalizar automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          <Check className="h-4 w-4" />
          {selectedCount} selecionado{selectedCount === 1 ? "" : "s"}
        </div>
      </div>

      <textarea
        value={template}
        onChange={(event) => onTemplateChange(event.target.value)}
        rows={4}
        className="mt-4 w-full resize-none rounded-3xl border bg-white p-4 text-sm leading-6 outline-none transition focus:border-slate-950"
        placeholder="Digite a mensagem que será enviada pelo WhatsApp..."
      />

      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          O sistema abre o WhatsApp com a mensagem pronta. O envio final acontece
          lá, com controle humano. Sem gambiarra perigosa.
        </p>

        {selectedCount > 0 ? (
          <button
            type="button"
            onClick={onClearSelection}
            className="font-medium text-slate-950 underline-offset-4 hover:underline"
          >
            limpar seleção
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function BulkWhatsappPanel({
  selectedClientes = [],
  template = "",
  onOpenSelected,
  onCopySelected,
}) {
  const availableClientes = selectedClientes.filter((cliente) =>
    onlyDigits(getClientePhone(cliente))
  );

  return (
    <div className="rounded-3xl border bg-slate-950 p-5 text-white shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <Send className="h-3.5 w-3.5" />
            Disparo manual assistido
          </div>

          <h2 className="mt-3 text-xl font-bold">
            Enviar para selecionados
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-white/70">
            Para evitar bloqueio no WhatsApp, a plataforma abre os contatos com
            mensagem pronta. Você revisa e envia manualmente. É menos foguete,
            mais tanque blindado.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={onCopySelected}
            disabled={!availableClientes.length || !template}
            className="gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Copiar lista
          </Button>

          <Button
            type="button"
            onClick={onOpenSelected}
            disabled={!availableClientes.length || !template}
            className="gap-2 bg-white text-slate-950 hover:bg-white/90"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir WhatsApps
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs text-white/60">Selecionados</p>
          <strong className="mt-1 block text-2xl">
            {selectedClientes.length}
          </strong>
        </div>

        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs text-white/60">Com WhatsApp</p>
          <strong className="mt-1 block text-2xl">
            {availableClientes.length}
          </strong>
        </div>

        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs text-white/60">Sem telefone</p>
          <strong className="mt-1 block text-2xl">
            {selectedClientes.length - availableClientes.length}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function MarketingListHeader({
  title,
  description,
  visibleCount = 0,
  totalCount = 0,
  allSelected = false,
  hasItems = false,
  onToggleAll,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <p className="mt-2 text-xs text-muted-foreground">
          Exibindo {visibleCount} de {totalCount} cliente
          {totalCount === 1 ? "" : "s"}.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onToggleAll}
        disabled={!hasItems}
        className="gap-2"
      >
        {allSelected ? (
          <>
            <X className="h-4 w-4" />
            Desmarcar todos
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Selecionar todos
          </>
        )}
      </Button>
    </div>
  );
}

export function MarketingClienteCard({
  cliente,
  isSelected = false,
  template = "",
  onToggleSelected,
  onOpenWhatsapp,
  onCopyMessage,
}) {
  const id = getClienteId(cliente);
  const name = getClienteName(cliente);
  const phone = getClientePhone(cliente);
  const hasPhone = Boolean(onlyDigits(phone));
  const birthDate = getClienteBirthDate(cliente);
  const metaText = getMetaText(cliente);
  const message = buildMessage(template, cliente);

  return (
    <article
      className={[
        "rounded-3xl border bg-white p-5 shadow-sm transition",
        isSelected ? "border-slate-950 ring-2 ring-slate-950/10" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggleSelected(cliente)}
          className={[
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
            isSelected
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-300 bg-white text-transparent hover:border-slate-950",
          ].join(" ")}
          aria-label={isSelected ? "Desmarcar cliente" : "Selecionar cliente"}
        >
          <Check className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">
                {name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {formatPhoneBR(phone)}
              </p>
            </div>

            <span
              className={[
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium",
                hasPhone
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700",
              ].join(" ")}
            >
              {hasPhone ? "Com WhatsApp" : "Sem telefone"}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <InfoPill label="Nascimento" value={formatDateBR(birthDate)} />
            <InfoPill
              label="Cidade"
              value={cliente?.cidade || cliente?.estado || "Não informado"}
            />
          </div>

          {metaText ? (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-muted-foreground">
              {metaText}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => onOpenWhatsapp(cliente)}
              disabled={!hasPhone || !message}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Mandar mensagem
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onCopyMessage(cliente)}
              disabled={!message}
              className="gap-2"
            >
              <Clipboard className="h-4 w-4" />
              Copiar texto
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-800">
        {value || "Não informado"}
      </p>
    </div>
  );
}

export function MarketingEmptyState({
  title = "Nenhum cliente encontrado",
  description = "Ajuste os filtros ou tente outro segmento.",
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
        <UsersRound className="h-6 w-6 text-slate-600" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function MarketingLoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-3xl border bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-1/3 rounded-full bg-slate-100" />
          <div className="mt-4 h-3 w-1/2 rounded-full bg-slate-100" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="h-14 rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketingErrorState({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
      <h3 className="font-bold text-rose-900">
        Não foi possível carregar o marketing
      </h3>

      <p className="mt-2 text-sm text-rose-700">
        {message || "Ocorreu um erro ao buscar os dados."}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-4 gap-2 border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
      >
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

export function MarketingPagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-10 rounded-full border bg-white px-4 text-sm outline-none"
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}