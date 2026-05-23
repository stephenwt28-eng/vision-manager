"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileImage,
  FileText,
  Glasses,
  History,
  Loader2,
  PencilLine,
  ReceiptText,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const osStatusOptions = [
  { value: "cadastrada", label: "Cadastrada" },
  { value: "enviada_laboratorio", label: "Enviada ao laboratório" },
  { value: "aguardando_retorno", label: "Aguardando retorno" },
  { value: "pronta_retirada", label: "Pronta para retirada" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];

export const pagamentoStatusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "parcial", label: "Parcial" },
  { value: "pago", label: "Pago" },
  { value: "estornado", label: "Estornado" },
  { value: "cancelado", label: "Cancelado" },
];

export const tipoOsOptions = [
  { value: "venda", label: "Venda" },
  { value: "orcamento", label: "Orçamento" },
  { value: "garantia", label: "Garantia" },
  { value: "ajuste", label: "Ajuste" },
  { value: "troca", label: "Troca" },
];

export const formaPagamentoOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "crediario", label: "Crediário" },
  { value: "outro", label: "Outro" },
];

export const tipoAnexoOptions = [
  { value: "receita_oftalmologica", label: "Receita oftalmológica" },
  { value: "comprovante_pagamento", label: "Comprovante de pagamento" },
  { value: "recibo", label: "Recibo" },
  { value: "garantia", label: "Garantia" },
  { value: "foto_envelope", label: "Foto do envelope" },
  { value: "documento_cliente", label: "Documento do cliente" },
  { value: "outro", label: "Outro" },
];

const statusMeta = {
  cadastrada: {
    label: "Cadastrada",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: FileText,
  },
  enviada_laboratorio: {
    label: "No laboratório",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Glasses,
  },
  aguardando_retorno: {
    label: "Aguardando retorno",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  pronta_retirada: {
    label: "Pronta para retirada",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  entregue: {
    label: "Entregue",
    className: "bg-primary/[0.10] text-primary border-primary/20",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: X,
  },
};

const pagamentoMeta = {
  pendente: {
    label: "Pendente",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  parcial: {
    label: "Parcial",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  pago: {
    label: "Pago",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  estornado: {
    label: "Estornado",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatBRL(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDateBR(value) {
  if (!value) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR").format(
      new Date(`${String(value).slice(0, 10)}T00:00:00`)
    );
  } catch {
    return "Não informado";
  }
}

function formatDateTimeBR(value) {
  if (!value) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Não informado";
  }
}

function formatFileSize(bytes = 0) {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getTipoAnexoLabel(value) {
  return tipoAnexoOptions.find((option) => option.value === value)?.label || value || "Documento";
}

function isAtrasada(os) {
  if (!os?.prazo_entrega_combinado) return false;

  const finished = ["pronta_retirada", "entregue", "cancelada"].includes(
    os.status
  );

  if (finished) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prazo = new Date(`${os.prazo_entrega_combinado}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return today > prazo;
}

/* ==========================================================================
   BADGES
   ========================================================================== */

export function OSStatusBadge({ status, atrasada = false }) {
  if (atrasada) {
    return (
      <Badge className="rounded-full border border-red-200 bg-red-100 px-3 py-1 font-black text-red-700">
        <AlertTriangle className="mr-1 size-3.5" />
        Atrasada
      </Badge>
    );
  }

  const meta = statusMeta[status] || statusMeta.cadastrada;
  const Icon = meta.icon;

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
      <Icon className="mr-1 size-3.5" />
      {meta.label}
    </Badge>
  );
}

export function PagamentoStatusBadge({ status }) {
  const meta = pagamentoMeta[status] || pagamentoMeta.pendente;

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

/* ==========================================================================
   HEADER
   ========================================================================== */

export function OrdemServicoHeader({
  ordemServico,
  cliente,
  vendedor,
  canDelete = false,
  isSaving = false,
  onBackHref = "/admin/ordens-servico",
  onEdit,
  onDelete,
}) {
  const atrasada = isAtrasada(ordemServico);

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            asChild
            variant="outline"
            className="mb-4 h-11 rounded-full px-4 font-black"
          >
            <Link href={onBackHref}>
              <ArrowLeft className="size-4" />
              Voltar para OS
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <OSStatusBadge status={ordemServico?.status} atrasada={atrasada} />
            <PagamentoStatusBadge status={ordemServico?.status_pagamento} />
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.065em] text-dark-title md:text-4xl">
            {ordemServico?.numero_os || "Ordem de serviço"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            {cliente?.nome_completo || "Cliente não informado"} •{" "}
            {vendedor?.nome_exibicao || vendedor?.nome_completo || "Vendedor não informado"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={onEdit}
            disabled={isSaving}
            className="h-12 rounded-full px-5 font-black"
          >
            <PencilLine className="size-4" />
            Editar OS
          </Button>

          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSaving}
              className="h-12 rounded-full px-5 font-black"
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ==========================================================================
   CARDS RESUMO
   ========================================================================== */

export function OrdemServicoResumoCards({ ordemServico }) {
  const cards = [
    {
      title: "Valor total",
      value: formatBRL(ordemServico?.valor_total),
      meta: `Entrada ${formatBRL(ordemServico?.valor_entrada)}`,
      icon: Banknote,
    },
    {
      title: "Valor restante",
      value: formatBRL(ordemServico?.valor_restante),
      meta: pagamentoMeta[ordemServico?.status_pagamento]?.label || "Financeiro",
      icon: CreditCard,
    },
    {
      title: "Data da venda",
      value: formatDateBR(ordemServico?.data_venda),
      meta: "Registro comercial",
      icon: ReceiptText,
    },
    {
      title: "Prazo combinado",
      value: formatDateBR(ordemServico?.prazo_entrega_combinado),
      meta: isAtrasada(ordemServico) ? "Atenção: atrasada" : "Entrega prevista",
      icon: CalendarClock,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-3 text-2xl font-black tracking-[-0.055em] text-dark-title">
                  {card.value}
                </p>
              </div>

              <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                <Icon className="size-6" />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-primary">
              {card.meta}
            </p>
          </div>
        );
      })}
    </section>
  );
}

/* ==========================================================================
   QUICK UPDATE
   ========================================================================== */

export function OrdemServicoQuickPanel({
  ordemServico,
  quickForm,
  onChange,
  onSubmit,
  isSaving = false,
}) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
          <Save className="size-5" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
            Atualização rápida
          </h2>

          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Status operacional e financeiro sem abrir o form completo.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-6">
        <FieldBlock label="Status da OS">
          <Select
            value={quickForm.status || ordemServico?.status || "cadastrada"}
            onValueChange={(value) => onChange("status", value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {osStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        <FieldBlock label="Pagamento">
          <Select
            value={
              quickForm.status_pagamento ||
              ordemServico?.status_pagamento ||
              "pendente"
            }
            onValueChange={(value) => onChange("status_pagamento", value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {pagamentoStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        <FieldBlock label="Forma">
          <Select
            value={quickForm.forma_pagamento || "__empty"}
            onValueChange={(value) =>
              onChange("forma_pagamento", value === "__empty" ? "" : value)
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="__empty">Não informado</SelectItem>

              {formaPagamentoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        <InputField
          label="Entrada"
          value={quickForm.valor_entrada}
          onChange={(value) => onChange("valor_entrada", value)}
        />

        <InputField
          label="Restante"
          value={quickForm.valor_restante}
          onChange={(value) => onChange("valor_restante", value)}
        />

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 w-full rounded-full font-black"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ==========================================================================
   GRID DETALHES
   ========================================================================== */

export function OrdemServicoDetailsGrid({
  ordemServico,
  cliente,
  vendedor,
  receita,
  armacao,
  lente,
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <InfoCard
        icon={UserRound}
        title="Cliente"
        items={[
          ["Nome", cliente?.nome_completo],
          ["Telefone", cliente?.telefone_principal],
          ["CPF", cliente?.cpf],
          ["E-mail", cliente?.email],
          ["Cidade", [cliente?.cidade, cliente?.estado].filter(Boolean).join(" - ")],
        ]}
      />

      <InfoCard
        icon={ReceiptText}
        title="Dados da OS"
        items={[
          ["Tipo", ordemServico?.tipo_os],
          ["Vendedor", vendedor?.nome_exibicao || vendedor?.nome_completo],
          ["Laboratório", ordemServico?.laboratorio_nome],
          ["Pedido lab.", ordemServico?.pedido_laboratorio_numero],
          ["Previsão lab.", formatDateBR(ordemServico?.previsao_laboratorio)],
        ]}
      />

      <InfoCard
        icon={Banknote}
        title="Financeiro"
        items={[
          ["Armação", formatBRL(ordemServico?.valor_armacao)],
          ["Lentes", formatBRL(ordemServico?.valor_lentes)],
          ["Serviços", formatBRL(ordemServico?.valor_servicos)],
          ["Desconto", formatBRL(ordemServico?.desconto_valor)],
          ["Total", formatBRL(ordemServico?.valor_total)],
          ["Entrada", formatBRL(ordemServico?.valor_entrada)],
          ["Restante", formatBRL(ordemServico?.valor_restante)],
        ]}
      />

      <InfoCard
        icon={ReceiptText}
        title="Receita"
        items={[
          ["Data", formatDateBR(receita?.data_receita)],
          ["Médico", receita?.medico_nome],
          ["CRM", receita?.medico_crm],
          ["Tipo", receita?.tipo_receita],
          ["DNP OD", receita?.dnp_od],
          ["DNP OE", receita?.dnp_oe],
          ["DP total", receita?.dp_total],
          ["Altura OD", receita?.altura_od],
          ["Altura OE", receita?.altura_oe],
        ]}
      />

      <InfoCard
        icon={Glasses}
        title="Olho direito"
        items={[
          ["Esférico", receita?.od_esferico],
          ["Cilíndrico", receita?.od_cilindrico],
          ["Eixo", receita?.od_eixo],
          ["Adição", receita?.od_adicao],
          ["Prisma", receita?.od_prisma],
          ["Base", receita?.od_base],
        ]}
      />

      <InfoCard
        icon={Glasses}
        title="Olho esquerdo"
        items={[
          ["Esférico", receita?.oe_esferico],
          ["Cilíndrico", receita?.oe_cilindrico],
          ["Eixo", receita?.oe_eixo],
          ["Adição", receita?.oe_adicao],
          ["Prisma", receita?.oe_prisma],
          ["Base", receita?.oe_base],
        ]}
      />

      <InfoCard
        icon={Glasses}
        title="Armação"
        items={[
          ["Marca", armacao?.marca],
          ["Modelo", armacao?.modelo],
          ["Cor", armacao?.cor],
          ["Código", armacao?.codigo_interno],
          ["Tipo", armacao?.tipo_armacao],
          ["Aro", armacao?.aro],
          ["Ponte", armacao?.ponte],
          ["Haste", armacao?.haste],
        ]}
      />

      <InfoCard
        icon={Glasses}
        title="Lente"
        items={[
          ["Tipo", lente?.tipo_lente],
          ["Marca", lente?.marca],
          ["Linha", lente?.linha],
          ["Laboratório", lente?.laboratorio],
          ["Material", lente?.material],
          ["Índice", lente?.indice_refracao],
          ["Coloração", lente?.coloracao],
          ["Garantia", lente?.garantia_meses ? `${lente.garantia_meses} meses` : null],
        ]}
      />

      <InfoCard
        icon={FileText}
        title="Observações"
        items={[
          ["Cliente", ordemServico?.observacoes_cliente],
          ["Internas", ordemServico?.observacoes_internas],
          ["Receita", receita?.observacoes],
          ["Armação", armacao?.observacoes],
          ["Lente", lente?.observacoes],
        ]}
      />
    </section>
  );
}

function InfoCard({ icon: Icon, title, items = [] }) {
  return (
    <div className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
          <Icon className="size-5" />
        </div>

        <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-border/70 pb-2 last:border-0 last:pb-0"
          >
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </p>

            <p className="max-w-[62%] text-right text-sm font-bold text-dark-title">
              {value || "Não informado"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   DOCUMENTOS
   ========================================================================== */

export function OrdemServicoDocumentos({
  anexos = [],
  uploadForm,
  onUploadFormChange,
  onUpload,
  onDeleteAnexo,
  isUploading = false,
  isDeletingAnexoId = "",
}) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
            <Upload className="size-5" />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
              Documentos da OS
            </h2>

            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Receita, comprovantes, recibos, garantia e arquivos do envelope digital.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={onUpload}
        className="mb-6 grid gap-4 rounded-[30px] border border-border bg-background/60 p-4 xl:grid-cols-5"
      >
        <FieldBlock label="Tipo">
          <Select
            value={uploadForm.tipo_anexo}
            onValueChange={(value) => onUploadFormChange("tipo_anexo", value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {tipoAnexoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        <InputField
          label="Data do documento"
          type="date"
          value={uploadForm.data_documento}
          onChange={(value) => onUploadFormChange("data_documento", value)}
        />

        <InputField
          label="Descrição"
          value={uploadForm.descricao}
          onChange={(value) => onUploadFormChange("descricao", value)}
        />

        <FieldBlock label="Arquivo">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) =>
              onUploadFormChange("file", event.target.files?.[0] || null)
            }
            className="h-12 rounded-2xl border-border bg-card file:mr-3 file:rounded-full file:border-0 file:bg-primary/[0.08] file:px-3 file:py-1 file:text-sm file:font-black file:text-primary"
          />
        </FieldBlock>

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={isUploading}
            className="h-12 w-full rounded-full font-black"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Anexar
              </>
            )}
          </Button>
        </div>
      </form>

      {anexos.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-border bg-background/70 p-8 text-center">
          <FileImage className="mx-auto size-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-dark-title">
            Nenhum documento anexado.
          </h3>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Suba aqui tudo que antes ficaria perdido no envelope físico.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="rounded-[28px] border border-border bg-background/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
                  <FileText className="size-5" />
                </div>

                <Badge className="rounded-full border border-border bg-card px-3 py-1 text-xs font-black text-muted-foreground">
                  {formatFileSize(anexo.tamanho_bytes)}
                </Badge>
              </div>

              <h3 className="mt-4 line-clamp-2 text-base font-black tracking-[-0.035em] text-dark-title">
                {anexo.nome_original || "Documento"}
              </h3>

              <p className="mt-1 text-sm font-semibold text-primary">
                {getTipoAnexoLabel(anexo.tipo_anexo)}
              </p>

              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {anexo.descricao || "Sem descrição"}
              </p>

              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                Enviado em {formatDateTimeBR(anexo.created_at)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {anexo.signedUrl ? (
                  <>
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="rounded-full font-black"
                    >
                      <a href={anexo.signedUrl} target="_blank" rel="noreferrer">
                        <Eye className="size-4" />
                        Ver
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full font-black"
                    >
                      <a href={anexo.signedUrl} download={anexo.nome_original}>
                        <Download className="size-4" />
                        Baixar
                      </a>
                    </Button>
                  </>
                ) : null}

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingAnexoId === anexo.id}
                  onClick={() => onDeleteAnexo(anexo)}
                  className="rounded-full font-black"
                >
                  {isDeletingAnexoId === anexo.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   HISTÓRICO
   ========================================================================== */

export function OrdemServicoTimeline({ historicoStatus = [] }) {
  return (
    <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
          <History className="size-5" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
            Histórico de status
          </h2>

          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Rastro operacional da OS. Aqui ninguém apaga pegada.
          </p>
        </div>
      </div>

      {historicoStatus.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-border bg-background/70 p-6 text-center">
          <p className="text-sm font-bold text-muted-foreground">
            Nenhuma alteração de status registrada.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historicoStatus.map((item) => (
            <div
              key={item.id}
              className="rounded-[28px] border border-border bg-background/60 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {item.status_anterior ? (
                    <OSStatusBadge status={item.status_anterior} />
                  ) : (
                    <Badge className="rounded-full border border-border bg-card px-3 py-1 font-black text-muted-foreground">
                      Início
                    </Badge>
                  )}

                  <span className="text-sm font-black text-muted-foreground">
                    →
                  </span>

                  <OSStatusBadge status={item.status_novo} />
                </div>

                <p className="text-xs font-bold text-muted-foreground">
                  {formatDateTimeBR(item.created_at)}
                </p>
              </div>

              {item.observacao ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {item.observacao}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   EDIT DIALOG
   ========================================================================== */

export function OrdemServicoEditDialog({
  open,
  onOpenChange,
  editForm,
  onChange,
  onSubmit,
  isSaving = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Editar dados principais
          </DialogTitle>

          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Edição rápida dos campos principais da OS. Para receita/armação/lente, use a
            listagem principal se quiser o formzão completo.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FieldBlock label="Tipo OS">
                <Select
                  value={editForm.tipo_os || "venda"}
                  onValueChange={(value) => onChange("tipo_os", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {tipoOsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <FieldBlock label="Status">
                <Select
                  value={editForm.status || "cadastrada"}
                  onValueChange={(value) => onChange("status", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {osStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <InputField
                label="Data venda"
                type="date"
                value={editForm.data_venda}
                onChange={(value) => onChange("data_venda", value)}
              />

              <InputField
                label="Prazo combinado"
                type="date"
                value={editForm.prazo_entrega_combinado}
                onChange={(value) => onChange("prazo_entrega_combinado", value)}
              />

              <InputField
                label="Prazo interno"
                type="date"
                value={editForm.prazo_entrega}
                onChange={(value) => onChange("prazo_entrega", value)}
              />

              <InputField
                label="Laboratório"
                value={editForm.laboratorio_nome}
                onChange={(value) => onChange("laboratorio_nome", value)}
              />

              <InputField
                label="Pedido laboratório"
                value={editForm.pedido_laboratorio_numero}
                onChange={(value) =>
                  onChange("pedido_laboratorio_numero", value)
                }
              />

              <InputField
                label="Previsão laboratório"
                type="date"
                value={editForm.previsao_laboratorio}
                onChange={(value) => onChange("previsao_laboratorio", value)}
              />

              <InputField
                label="Custo armacao"
                value={editForm.custo_armacao}
                onChange={(value) => onChange("custo_armacao", value)}
              />

              <InputField
                label="Custo lentes"
                value={editForm.custo_lentes}
                onChange={(value) => onChange("custo_lentes", value)}
              />

              <InputField
                label="Valor armacao"
                value={editForm.valor_armacao}
                onChange={(value) => onChange("valor_armacao", value)}
              />

              <InputField
                label="Valor lentes"
                value={editForm.valor_lentes}
                onChange={(value) => onChange("valor_lentes", value)}
              />

              <InputField
                label="Servicos"
                value={editForm.valor_servicos}
                onChange={(value) => onChange("valor_servicos", value)}
              />

              <InputField
                label="Adicionais"
                value={editForm.valor_adicionais}
                onChange={(value) => onChange("valor_adicionais", value)}
              />

              <FieldBlock label="Desconto">
                <Select
                  value={editForm.desconto_tipo || "valor"}
                  onValueChange={(value) => onChange("desconto_tipo", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="valor">Valor</SelectItem>
                    <SelectItem value="percentual">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </FieldBlock>

              {editForm.desconto_tipo === "percentual" ? (
                <InputField
                  label="Desconto %"
                  value={editForm.desconto_percentual}
                  onChange={(value) => onChange("desconto_percentual", value)}
                />
              ) : (
                <InputField
                  label="Desconto R$"
                  value={editForm.desconto_valor}
                  onChange={(value) => onChange("desconto_valor", value)}
                />
              )}

              <InputField
                label="Total"
                value={editForm.valor_total}
                onChange={(value) => onChange("valor_total", value)}
              />

              <FieldBlock label="Pagamento">
                <Select
                  value={editForm.status_pagamento || "pendente"}
                  onValueChange={(value) => onChange("status_pagamento", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {pagamentoStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <InputField
                label="Entrada"
                value={editForm.valor_entrada}
                onChange={(value) => onChange("valor_entrada", value)}
              />

              <InputField
                label="Restante"
                value={editForm.valor_restante}
                onChange={(value) => onChange("valor_restante", value)}
              />

              <FieldBlock label="Forma de pagamento">
                <Select
                  value={editForm.forma_pagamento || "__empty"}
                  onValueChange={(value) =>
                    onChange("forma_pagamento", value === "__empty" ? "" : value)
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="__empty">Não informado</SelectItem>

                    {formaPagamentoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

              <InputField
                label="Parcelas"
                type="number"
                value={editForm.quantidade_parcelas}
                onChange={(value) => onChange("quantidade_parcelas", value)}
              />

              <InputField
                label="Valor parcela"
                value={editForm.valor_parcela}
                onChange={(value) => onChange("valor_parcela", value)}
              />

              <BooleanField
                label="Receita recebida"
                checked={editForm.receita_recebida}
                onChange={(value) => onChange("receita_recebida", value)}
              />

              <BooleanField
                label="OS conferida"
                checked={editForm.conferida}
                onChange={(value) => onChange("conferida", value)}
              />

              <BooleanField
                label="Cliente retirou"
                checked={editForm.cliente_retirou}
                onChange={(value) => onChange("cliente_retirou", value)}
              />

              <InputField
                label="Responsavel conferencia"
                value={editForm.nome_responsavel_conferencia}
                onChange={(value) =>
                  onChange("nome_responsavel_conferencia", value)
                }
              />

              <InputField
                label="Nome retirante"
                value={editForm.nome_retirante}
                onChange={(value) => onChange("nome_retirante", value)}
              />

              <InputField
                label="Documento retirante"
                value={editForm.documento_retirante}
                onChange={(value) => onChange("documento_retirante", value)}
              />

              <InputField
                label="Telefone retirante"
                value={editForm.telefone_retirante}
                onChange={(value) => onChange("telefone_retirante", value)}
              />

              <InputField
                label="Motivo cancelamento"
                value={editForm.motivo_cancelamento}
                onChange={(value) => onChange("motivo_cancelamento", value)}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <TextareaField
                label="Observações para o cliente"
                value={editForm.observacoes_cliente}
                onChange={(value) => onChange("observacoes_cliente", value)}
              />

              <TextareaField
                label="Observações internas"
                value={editForm.observacoes_internas}
                onChange={(value) => onChange("observacoes_internas", value)}
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-full px-6 font-black"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-12 rounded-full px-7 font-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   DELETE DIALOG
   ========================================================================== */

export function ConfirmDeleteOrdemServicoDialog({
  open,
  onOpenChange,
  ordemServico,
  onConfirm,
  isDeleting = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[34px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
            Excluir ordem de serviço?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
            Você está prestes a excluir{" "}
            <strong className="font-black text-dark-title">
              {ordemServico?.numero_os || "esta OS"}
            </strong>
            . Essa ação remove a ordem e seus vínculos. Só admin pode fazer isso.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-12 rounded-full px-6 font-black"
          >
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-12 rounded-full bg-destructive px-6 font-black text-white hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ==========================================================================
   BASE FORM
   ========================================================================== */

function FieldBlock({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-black text-dark-title">{label}</p>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <FieldBlock label={label}>
      <Input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border-border bg-background"
      />
    </FieldBlock>
  );
}

function TextareaField({ label, value, onChange }) {
  return (
    <FieldBlock label={label}>
      <Textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 rounded-2xl border-border bg-background"
      />
    </FieldBlock>
  );
}

function BooleanField({ label, checked, onChange }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-background px-4">
      <Input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4"
      />
      <span className="text-sm font-black text-dark-title">{label}</span>
    </label>
  );
}
