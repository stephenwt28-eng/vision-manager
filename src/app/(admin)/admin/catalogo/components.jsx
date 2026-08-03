"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  Factory,
  Filter,
  Glasses,
  Layers3,
  PencilLine,
  Search,
  ShieldCheck,
  MirrorRound,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  formatBRL,
  formatBRLInput,
  formatPhoneInput,
  parseBRLToNumber,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const catalogTabs = [
  {
    key: "lentes",
    title: "Lentes",
    singular: "lente",
    actionLabel: "Nova lente",
    icon: MirrorRound,
    description: "Tipos, tratamentos, materiais e custos usados nas OS.",
  },
  {
    key: "armacoes",
    title: "Armações",
    singular: "armação",
    actionLabel: "Nova armação",
    icon: Glasses,
    description: "Modelos, medidas, cores e referências das armações.",
  },
  {
    key: "laboratorios",
    title: "Laboratórios",
    singular: "laboratório",
    actionLabel: "Novo laboratório",
    icon: Factory,
    description: "Parceiros de produção, contatos e frequência de uso.",
  },
];

const pageSizeOptions = [12, 24, 48, 96];

const tipoLenteOptions = [
  { value: "visao_simples", label: "Visão simples" },
  { value: "bifocal", label: "Bifocal" },
  { value: "multifocal", label: "Multifocal" },
  { value: "ocupacional", label: "Ocupacional" },
  { value: "solar", label: "Solar" },
  { value: "sem_grau", label: "Sem grau" },
  { value: "outro", label: "Outro" },
];

const materialLenteOptions = [
  { value: "resina", label: "Resina" },
  { value: "policarbonato", label: "Policarbonato" },
  { value: "trivex", label: "Trivex" },
  { value: "cristal", label: "Cristal" },
  { value: "alto_indice", label: "Alto índice" },
  { value: "outro", label: "Outro" },
];

const tipoArmacaoOptions = [
  { value: "aro_fechado", label: "Aro fechado" },
  { value: "fio_nylon", label: "Fio nylon" },
  { value: "tres_pecas", label: "Três peças" },
  { value: "clipon", label: "Clip-on" },
  { value: "solar", label: "Solar" },
  { value: "outro", label: "Outro" },
];

const generoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "unissex", label: "Unissex" },
  { value: "infantil", label: "Infantil" },
  { value: "indefinido", label: "Indefinido" },
];

const tipoLenteLabels = Object.fromEntries(
  tipoLenteOptions.map((option) => [option.value, option.label])
);

const materialLenteLabels = Object.fromEntries(
  materialLenteOptions.map((option) => [option.value, option.label])
);

const tipoArmacaoLabels = Object.fromEntries(
  tipoArmacaoOptions.map((option) => [option.value, option.label])
);

const generoLabels = Object.fromEntries(
  generoOptions.map((option) => [option.value, option.label])
);

const emptyLenteForm = {
  tipo_lente: "",
  marca: "",
  linha: "",
  laboratorio: "",
  material: "",
  indice_refracao: "",
  tratamento_antirreflexo: "",
  tratamento_filtro_azul: false,
  tratamento_fotossensivel: false,
  tratamento_polarizado: false,
  tratamento_uv: false,
  tratamento_risco: false,
  coloracao: "",
  tonalidade: "",
  curva_base: "",
  diametro: "",
  garantia_meses: "",
  custo: "R$ 0,00",
  ativo: true,
};

const emptyArmacaoForm = {
  marca: "",
  modelo: "",
  referencia: "",
  codigo_interno: "",
  codigo_barras: "",
  cor: "",
  material: "",
  formato: "",
  tamanho_texto: "",
  aro: "",
  diagonal_maior: "",
  ponte: "",
  haste: "",
  largura_total: "",
  altura_lente: "",
  tipo_armacao: "",
  genero_indicado: "indefinido",
  custo: "R$ 0,00",
  ativo: true,
};

const emptyLaboratorioForm = {
  nome: "",
  telefone: "",
  ativo: true,
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function getTabMeta(tab) {
  return catalogTabs.find((item) => item.key === tab) || catalogTabs[0];
}

function getOptionLabel(optionsMap, value, fallback = "Não informado") {
  if (!value) return fallback;

  return optionsMap[value] || value;
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

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return String(value);

  return String(parsed).replace(".", ",");
}

function formatMoneyValue(value) {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }

  return formatBRL(String(Math.round(Number(value || 0) * 100)));
}

function getInitialFormData(tab, item) {
  if (!item) {
    if (tab === "lentes") return emptyLenteForm;
    if (tab === "armacoes") return emptyArmacaoForm;
    return emptyLaboratorioForm;
  }

  if (tab === "lentes") {
    return {
      tipo_lente: item.tipo_lente || "",
      marca: item.marca || "",
      linha: item.linha || "",
      laboratorio: item.laboratorio || "",
      material: item.material || "",
      indice_refracao: item.indice_refracao || "",
      tratamento_antirreflexo: item.tratamento_antirreflexo || "",
      tratamento_filtro_azul: item.tratamento_filtro_azul ?? false,
      tratamento_fotossensivel: item.tratamento_fotossensivel ?? false,
      tratamento_polarizado: item.tratamento_polarizado ?? false,
      tratamento_uv: item.tratamento_uv ?? false,
      tratamento_risco: item.tratamento_risco ?? false,
      coloracao: item.coloracao || "",
      tonalidade: item.tonalidade || "",
      curva_base: item.curva_base || "",
      diametro: item.diametro || "",
      garantia_meses: item.garantia_meses ?? "",
      custo: formatMoneyValue(item.custo),
      ativo: item.ativo ?? true,
    };
  }

  if (tab === "armacoes") {
    return {
      marca: item.marca || "",
      modelo: item.modelo || "",
      referencia: item.referencia || "",
      codigo_interno: item.codigo_interno || "",
      codigo_barras: item.codigo_barras || "",
      cor: item.cor || "",
      material: item.material || "",
      formato: item.formato || "",
      tamanho_texto: item.tamanho_texto || "",
      aro: item.aro ?? "",
      diagonal_maior: item.diagonal_maior || "",
      ponte: item.ponte ?? "",
      haste: item.haste ?? "",
      largura_total: item.largura_total ?? "",
      altura_lente: item.altura_lente ?? "",
      tipo_armacao: item.tipo_armacao || "",
      genero_indicado: item.genero_indicado || "indefinido",
      custo: formatMoneyValue(item.custo),
      ativo: item.ativo ?? true,
    };
  }

  return {
    nome: item.nome || "",
    telefone: item.telefone || "",
    ativo: item.ativo ?? true,
  };
}

function prepareSubmitPayload(tab, formData, item) {
  const basePayload = {
    ...(item?.id ? { id: item.id } : {}),
    tipo: tab,
    ...formData,
    ativo: formData.ativo ?? true,
  };

  if (tab === "laboratorios") {
    return {
      ...basePayload,
      telefone: formData.telefone || null,
    };
  }

  return {
    ...basePayload,
    custo: parseBRLToNumber(formData.custo),
  };
}

function getItemTitle(tab, item) {
  if (!item) return "Item";

  if (tab === "lentes") {
    return [
      getOptionLabel(tipoLenteLabels, item.tipo_lente, "Lente"),
      item.marca,
      item.linha,
    ]
      .filter(Boolean)
      .join(" • ");
  }

  if (tab === "armacoes") {
    return [item.marca || "Armação", item.modelo, item.referencia]
      .filter(Boolean)
      .join(" • ");
  }

  return item.nome || "Laboratório";
}

function getItemSubtitle(tab, item) {
  if (!item) return "";

  if (tab === "lentes") {
    return [
      item.laboratorio,
      getOptionLabel(materialLenteLabels, item.material, ""),
      item.indice_refracao,
    ]
      .filter(Boolean)
      .join(" • ");
  }

  if (tab === "armacoes") {
    return [item.cor, item.material, item.tamanho_texto]
      .filter(Boolean)
      .join(" • ");
  }

  return item.telefone || "Telefone não informado";
}

function getItemIcon(tab) {
  if (tab === "lentes") return MirrorRound;
  if (tab === "armacoes") return Glasses;
  return Factory;
}

function getActiveCount(items = []) {
  return items.filter((item) => item.ativo).length;
}

function getMostUsedItem(items = []) {
  return [...items].sort(
    (a, b) => Number(b.quantidade_usos || 0) - Number(a.quantidade_usos || 0)
  )[0];
}

function hasAnyTreatment(item) {
  return Boolean(
    item?.tratamento_filtro_azul ||
      item?.tratamento_fotossensivel ||
      item?.tratamento_polarizado ||
      item?.tratamento_uv ||
      item?.tratamento_risco ||
      item?.tratamento_antirreflexo
  );
}

/* ==========================================================================
   TABS
   ========================================================================== */

export function CatalogoTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {catalogTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={[
              "group flex min-w-0 items-start justify-between gap-4 rounded-[30px] border p-5 text-left transition duration-200",
              isActive
                ? "border-primary/30 bg-primary/[0.08] shadow-[0_30px_80px_-62px_rgba(108,77,230,0.42)]"
                : "border-border bg-card shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)] hover:-translate-y-0.5 hover:border-primary/20",
            ].join(" ")}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "grid size-12 shrink-0 place-items-center rounded-[20px] transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/[0.08] text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black tracking-[-0.045em] text-dark-title">
                    {tab.title}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-primary">
                    {counts[tab.key] || 0} item
                    {counts[tab.key] === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
}

/* ==========================================================================
   KPIS
   ========================================================================== */

export function CatalogoKpis({ activeTab, items = [] }) {
  const meta = getTabMeta(activeTab);
  const total = items.length;
  const ativos = getActiveCount(items);
  const inativos = Math.max(total - ativos, 0);
  const maisUsado = getMostUsedItem(items);

  const kpis = [
    {
      title: `${meta.title} cadastrados`,
      value: total,
      meta: "Base total da aba",
      icon: Boxes,
    },
    {
      title: "Ativos",
      value: ativos,
      meta: `${inativos} inativo${inativos === 1 ? "" : "s"}`,
      icon: ShieldCheck,
    },
    {
      title: "Mais usado",
      value: maisUsado?.quantidade_usos || 0,
      meta: maisUsado ? getItemTitle(activeTab, maisUsado) : "Sem uso ainda",
      icon: Layers3,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-muted-foreground">
                  {kpi.title}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
                  {kpi.value}
                </p>
              </div>

              <div className="grid size-13 shrink-0 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                <Icon className="size-6" />
              </div>
            </div>

            <p className="mt-4 truncate text-sm font-semibold text-primary">
              {kpi.meta}
            </p>
          </div>
        );
      })}
    </section>
  );
}

/* ==========================================================================
   FILTROS
   ========================================================================== */

export function CatalogoFilters({
  activeTab,
  filters,
  onChangeFilters,
  onClearFilters,
  totalResults = 0,
}) {
  const [open, setOpen] = useState(false);
  const meta = getTabMeta(activeTab);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={filters.search}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    search: event.target.value,
                  })
                }
                placeholder={`Pesquisar em ${meta.title.toLowerCase()}...`}
                className="h-14 rounded-full border-border bg-background pl-11 pr-4 text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="h-14 rounded-full px-5 font-black"
              >
                <Filter className="size-4" />
                {open ? "Fechar filtros" : "Mais filtros"}
              </Button>
            </CollapsibleTrigger>

            <Button
              variant="secondary"
              onClick={onClearFilters}
              className="h-14 rounded-full px-5 font-black"
            >
              <X className="size-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {totalResults} item{totalResults === 1 ? "" : "s"} encontrado
            {totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Status">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onChangeFilters({
                    ...filters,
                    status: value,
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {activeTab === "lentes" ? (
              <>
                <FormField label="Tipo de lente">
                  <Select
                    value={filters.tipo_lente}
                    onValueChange={(value) =>
                      onChangeFilters({
                        ...filters,
                        tipo_lente: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tipoLenteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Laboratório">
                  <Input
                    value={filters.laboratorio}
                    onChange={(event) =>
                      onChangeFilters({
                        ...filters,
                        laboratorio: event.target.value,
                      })
                    }
                    placeholder="Ex.: Zeiss, Hoya..."
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Marca">
                  <Input
                    value={filters.marca}
                    onChange={(event) =>
                      onChangeFilters({
                        ...filters,
                        marca: event.target.value,
                      })
                    }
                    placeholder="Marca da lente"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </>
            ) : null}

            {activeTab === "armacoes" ? (
              <>
                <FormField label="Tipo de armação">
                  <Select
                    value={filters.tipo_armacao}
                    onValueChange={(value) =>
                      onChangeFilters({
                        ...filters,
                        tipo_armacao: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tipoArmacaoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Marca">
                  <Input
                    value={filters.marca}
                    onChange={(event) =>
                      onChangeFilters({
                        ...filters,
                        marca: event.target.value,
                      })
                    }
                    placeholder="Marca da armação"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>

                <FormField label="Cor">
                  <Input
                    value={filters.cor}
                    onChange={(event) =>
                      onChangeFilters({
                        ...filters,
                        cor: event.target.value,
                      })
                    }
                    placeholder="Ex.: preto, dourado..."
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </>
            ) : null}

            {activeTab === "laboratorios" ? (
              <>
                <FormField label="Nome">
                  <Input
                    value={filters.nome}
                    onChange={(event) =>
                      onChangeFilters({
                        ...filters,
                        nome: event.target.value,
                      })
                    }
                    placeholder="Nome do laboratório"
                    className="h-12 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </>
            ) : null}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   CARD
   ========================================================================== */

export function CatalogoItemCard({ activeTab, item, onView }) {
  const Icon = getItemIcon(activeTab);
  const title = getItemTitle(activeTab, item);
  const subtitle = getItemSubtitle(activeTab, item);

  return (
    <button
      type="button"
      onClick={() => onView(item)}
      className="group flex w-full min-w-0 flex-col justify-between overflow-hidden rounded-[30px] border border-border bg-card p-5 text-left shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_34px_90px_-62px_rgba(108,77,230,0.45)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={item.ativo ? "secondary" : "outline"}
              className={
                item.ativo
                  ? "rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                  : "rounded-full px-3 py-1 text-muted-foreground"
              }
            >
              {item.ativo ? "Ativo" : "Inativo"}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-muted-foreground"
            >
              {item.quantidade_usos || 0} uso
              {Number(item.quantidade_usos || 0) === 1 ? "" : "s"}
            </Badge>
          </div>

          <h3 className="mt-4 line-clamp-2 text-xl font-black tracking-[-0.045em] text-dark-title">
            {title}
          </h3>

          {subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-primary">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid size-12 shrink-0 place-items-center rounded-[20px] bg-primary/[0.08] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {activeTab !== "laboratorios" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeDollarSign className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              Custo: {formatMoneyValue(item.custo)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeDollarSign className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              Gasto no ano atual: {formatMoneyValue(item.gasto_ano_atual)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="size-4 shrink-0 text-primary" />
          <span className="truncate">
            Último uso: {formatDateTimeBR(item.ultimo_uso_em)}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ==========================================================================
   ESTADO VAZIO
   ========================================================================== */

export function CatalogoEmptyState({ activeTab, hasFilters = false }) {
  const meta = getTabMeta(activeTab);
  const Icon = meta.icon;

  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <Icon className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {hasFilters
          ? `Nenhum item encontrado em ${meta.title}.`
          : `Nenhum item cadastrado em ${meta.title}.`}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A busca ficou com mira de sniper. Limpe ou ajuste os filtros para reencontrar o catálogo."
          : "Quando você cadastrar ou usar itens nas OS, eles aparecem aqui como uma vitrine organizada da ótica."}
      </p>
    </div>
  );
}

/* ==========================================================================
   MODAL DE FORMULÁRIO
   ========================================================================== */

export function CatalogoFormDialog({
  open,
  onOpenChange,
  activeTab,
  item,
  onSubmit,
  isSaving = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CatalogoFormDialogContent
          key={`${activeTab}-${item?.id || "new"}`}
          activeTab={activeTab}
          item={item}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function CatalogoFormDialogContent({
  activeTab,
  item,
  onOpenChange,
  onSubmit,
  isSaving = false,
}) {
  const meta = getTabMeta(activeTab);
  const isEditing = Boolean(item?.id);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(activeTab, item)
  );
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (activeTab === "lentes" && !formData.tipo_lente) {
      nextErrors.tipo_lente = "Informe o tipo da lente.";
    }

    if (activeTab === "armacoes" && !formData.marca.trim()) {
      nextErrors.marca = "Informe a marca da armação.";
    }

    if (activeTab === "laboratorios" && !formData.nome.trim()) {
      nextErrors.nome = "Informe o nome do laboratório.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    await onSubmit(prepareSubmitPayload(activeTab, formData, item));
  }

  return (
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-6 text-left sm:px-7">
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? `Editar ${meta.singular}` : `Cadastrar ${meta.singular}`}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {isEditing
            ? "Atualize as informações do item mantendo o catálogo limpo e rastreável."
            : "Cadastre o item para reutilizar nas ordens de serviço sem ficar digitando tudo de novo."}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-7">
          {activeTab === "lentes" ? (
            <LenteFormFields
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          ) : null}

          {activeTab === "armacoes" ? (
            <ArmacaoFormFields
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          ) : null}

          {activeTab === "laboratorios" ? (
            <LaboratorioFormFields
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-5 sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-full px-5 font-black"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-full px-6 font-black"
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function LenteFormFields({ formData, errors, updateField }) {
  return (
    <>
      <FormSection title="Identificação da lente">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tipo da lente *" error={errors.tipo_lente}>
            <Select
              value={formData.tipo_lente}
              onValueChange={(value) => updateField("tipo_lente", value)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {tipoLenteOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Marca">
            <Input
              value={formData.marca}
              onChange={(event) => updateField("marca", event.target.value)}
              placeholder="Ex.: Zeiss, Hoya, Varilux..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Linha">
            <Input
              value={formData.linha}
              onChange={(event) => updateField("linha", event.target.value)}
              placeholder="Linha da lente"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Laboratório">
            <Input
              value={formData.laboratorio}
              onChange={(event) =>
                updateField("laboratorio", event.target.value)
              }
              placeholder="Laboratório parceiro"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Material e medidas">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Material">
            <Select
              value={formData.material}
              onValueChange={(value) => updateField("material", value)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {materialLenteOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Índice de refração">
            <Input
              value={formData.indice_refracao}
              onChange={(event) =>
                updateField("indice_refracao", event.target.value)
              }
              placeholder="Ex.: 1.56, 1.61"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Curva base">
            <Input
              value={formData.curva_base}
              onChange={(event) =>
                updateField("curva_base", event.target.value)
              }
              placeholder="Ex.: 4"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Diâmetro">
            <Input
              value={formData.diametro}
              onChange={(event) => updateField("diametro", event.target.value)}
              placeholder="Ex.: 65"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Tratamentos">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Antirreflexo">
            <Input
              value={formData.tratamento_antirreflexo}
              onChange={(event) =>
                updateField("tratamento_antirreflexo", event.target.value)
              }
              placeholder="Ex.: Crizal, No Reflex..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Coloração">
            <Input
              value={formData.coloracao}
              onChange={(event) => updateField("coloracao", event.target.value)}
              placeholder="Ex.: marrom, cinza..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Tonalidade">
            <Input
              value={formData.tonalidade}
              onChange={(event) => updateField("tonalidade", event.target.value)}
              placeholder="Ex.: 15%, 50%, degradê..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SwitchField
            label="Filtro azul"
            checked={formData.tratamento_filtro_azul}
            onCheckedChange={(checked) =>
              updateField("tratamento_filtro_azul", checked)
            }
          />

          <SwitchField
            label="Fotossensível"
            checked={formData.tratamento_fotossensivel}
            onCheckedChange={(checked) =>
              updateField("tratamento_fotossensivel", checked)
            }
          />

          <SwitchField
            label="Polarizada"
            checked={formData.tratamento_polarizado}
            onCheckedChange={(checked) =>
              updateField("tratamento_polarizado", checked)
            }
          />

          <SwitchField
            label="UV"
            checked={formData.tratamento_uv}
            onCheckedChange={(checked) =>
              updateField("tratamento_uv", checked)
            }
          />

          <SwitchField
            label="Risco"
            checked={formData.tratamento_risco}
            onCheckedChange={(checked) =>
              updateField("tratamento_risco", checked)
            }
          />
        </div>
      </FormSection>

      <FormSection title="Comercial">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Garantia em meses">
            <Input
              value={formData.garantia_meses}
              onChange={(event) =>
                updateField("garantia_meses", event.target.value)
              }
              inputMode="numeric"
              placeholder="Ex.: 12"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Custo">
            <Input
              value={formData.custo}
              onChange={(event) => updateField("custo", formatBRLInput(event))}
              placeholder="R$ 0,00"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <SwitchField
            label="Item ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => updateField("ativo", checked)}
          />
        </div>
      </FormSection>
    </>
  );
}

function ArmacaoFormFields({ formData, errors, updateField }) {
  return (
    <>
      <FormSection title="Identificação da armação">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Marca *" error={errors.marca}>
            <Input
              value={formData.marca}
              onChange={(event) => updateField("marca", event.target.value)}
              placeholder="Marca da armação"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Modelo">
            <Input
              value={formData.modelo}
              onChange={(event) => updateField("modelo", event.target.value)}
              placeholder="Modelo"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Referência">
            <Input
              value={formData.referencia}
              onChange={(event) => updateField("referencia", event.target.value)}
              placeholder="Referência do fabricante"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Código interno">
            <Input
              value={formData.codigo_interno}
              onChange={(event) =>
                updateField("codigo_interno", event.target.value)
              }
              placeholder="Código da loja"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Código de barras">
            <Input
              value={formData.codigo_barras}
              onChange={(event) =>
                updateField("codigo_barras", event.target.value)
              }
              placeholder="EAN ou código do produto"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Cor">
            <Input
              value={formData.cor}
              onChange={(event) => updateField("cor", event.target.value)}
              placeholder="Cor"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Características">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Material">
            <Input
              value={formData.material}
              onChange={(event) => updateField("material", event.target.value)}
              placeholder="Ex.: acetato, metal..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Formato">
            <Input
              value={formData.formato}
              onChange={(event) => updateField("formato", event.target.value)}
              placeholder="Ex.: redondo, quadrado..."
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Tamanho">
            <Input
              value={formData.tamanho_texto}
              onChange={(event) =>
                updateField("tamanho_texto", event.target.value)
              }
              placeholder="Ex.: P, M, G"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Tipo">
            <Select
              value={formData.tipo_armacao}
              onValueChange={(value) => updateField("tipo_armacao", value)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {tipoArmacaoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Gênero indicado">
            <Select
              value={formData.genero_indicado}
              onValueChange={(value) => updateField("genero_indicado", value)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                {generoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Medidas">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <FormField label="Aro">
            <Input
              value={formData.aro}
              onChange={(event) => updateField("aro", event.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 54"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Ponte">
            <Input
              value={formData.ponte}
              onChange={(event) => updateField("ponte", event.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 18"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Haste">
            <Input
              value={formData.haste}
              onChange={(event) => updateField("haste", event.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 140"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Largura total">
            <Input
              value={formData.largura_total}
              onChange={(event) =>
                updateField("largura_total", event.target.value)
              }
              inputMode="decimal"
              placeholder="Ex.: 135"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Altura lente">
            <Input
              value={formData.altura_lente}
              onChange={(event) =>
                updateField("altura_lente", event.target.value)
              }
              inputMode="decimal"
              placeholder="Ex.: 42"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <FormField label="Diagonal maior">
            <Input
              value={formData.diagonal_maior}
              onChange={(event) =>
                updateField("diagonal_maior", event.target.value)
              }
              placeholder="Ex.: 58"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Comercial">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Custo">
            <Input
              value={formData.custo}
              onChange={(event) => updateField("custo", formatBRLInput(event))}
              placeholder="R$ 0,00"
              className="h-12 rounded-2xl border-border bg-background"
            />
          </FormField>

          <SwitchField
            label="Item ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => updateField("ativo", checked)}
          />
        </div>
      </FormSection>
    </>
  );
}

function LaboratorioFormFields({ formData, errors, updateField }) {
  return (
    <FormSection title="Dados do laboratório">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Nome *" error={errors.nome}>
          <Input
            value={formData.nome}
            onChange={(event) => updateField("nome", event.target.value)}
            placeholder="Nome do laboratório"
            className="h-12 rounded-2xl border-border bg-background"
          />
        </FormField>

        <FormField label="Telefone">
          <Input
            value={formData.telefone}
            onChange={(event) =>
              updateField("telefone", formatPhoneInput(event))
            }
            placeholder="(00) 00000-0000"
            className="h-12 rounded-2xl border-border bg-background"
          />
        </FormField>

        <SwitchField
          label="Laboratório ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => updateField("ativo", checked)}
        />
      </div>
    </FormSection>
  );
}

/* ==========================================================================
   DRAWER
   ========================================================================== */

export function CatalogoDetailsDrawer({
  open,
  onOpenChange,
  activeTab,
  item,
  onEdit,
  onDelete,
  canDelete = false,
}) {
  const meta = getTabMeta(activeTab);
  const Icon = getItemIcon(activeTab);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94vh] overflow-hidden border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col overflow-hidden">
        {item ? (
          <>
            <DrawerHeader className="border-b border-border px-6 py-6 text-left sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                    <Icon className="size-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={item.ativo ? "secondary" : "outline"}
                        className={
                          item.ativo
                            ? "rounded-full bg-primary/[0.08] px-3 py-1 text-primary"
                            : "rounded-full px-3 py-1 text-muted-foreground"
                        }
                      >
                        {item.ativo ? "Ativo" : "Inativo"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1 text-muted-foreground"
                      >
                        {item.quantidade_usos || 0} uso
                        {Number(item.quantidade_usos || 0) === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <DrawerTitle className="mt-3 line-clamp-2 text-2xl font-black tracking-[-0.055em] text-dark-title">
                      {getItemTitle(activeTab, item)}
                    </DrawerTitle>

                    <DrawerDescription className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {getItemSubtitle(activeTab, item) ||
                        `Detalhes do catálogo de ${meta.title.toLowerCase()}.`}
                    </DrawerDescription>
                  </div>
                </div>
              </div>
            </DrawerHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {activeTab === "lentes" ? (
                <LenteDetails item={item} />
              ) : null}

              {activeTab === "armacoes" ? (
                <ArmacaoDetails item={item} />
              ) : null}

              {activeTab === "laboratorios" ? (
                <LaboratorioDetails item={item} />
              ) : null}
            </div>

            <DrawerFooter className="border-t border-border px-6 py-5 sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(item)}
                    className="rounded-full px-5 font-black"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  className="rounded-full px-5 font-black"
                >
                  <PencilLine className="size-4" />
                  Editar
                </Button>
              </div>
            </DrawerFooter>
          </>
        ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function LenteDetails({ item }) {
  return (
    <div className="space-y-6">
      <DetailSection title="Resumo">
        <DetailGrid>
          <DetailItem
            label="Tipo"
            value={getOptionLabel(tipoLenteLabels, item.tipo_lente)}
          />
          <DetailItem label="Marca" value={item.marca} />
          <DetailItem label="Linha" value={item.linha} />
          <DetailItem label="Laboratório" value={item.laboratorio} />
          <DetailItem
            label="Material"
            value={getOptionLabel(materialLenteLabels, item.material)}
          />
          <DetailItem label="Índice" value={item.indice_refracao} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Tratamentos">
        {hasAnyTreatment(item) ? (
          <div className="flex flex-wrap gap-2">
            {item.tratamento_antirreflexo ? (
              <Badge className="rounded-full px-3 py-1">
                Antirreflexo: {item.tratamento_antirreflexo}
              </Badge>
            ) : null}

            {item.tratamento_filtro_azul ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Filtro azul
              </Badge>
            ) : null}

            {item.tratamento_fotossensivel ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Fotossensível
              </Badge>
            ) : null}

            {item.tratamento_polarizado ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Polarizada
              </Badge>
            ) : null}

            {item.tratamento_uv ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                UV
              </Badge>
            ) : null}

            {item.tratamento_risco ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Risco
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum tratamento informado.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Medidas e comercial">
        <DetailGrid>
          <DetailItem label="Coloração" value={item.coloracao} />
          <DetailItem label="Tonalidade" value={item.tonalidade} />
          <DetailItem label="Curva base" value={item.curva_base} />
          <DetailItem label="Diâmetro" value={item.diametro} />
          <DetailItem
            label="Garantia"
            value={
              item.garantia_meses
                ? `${item.garantia_meses} mês${Number(item.garantia_meses) === 1 ? "" : "es"}`
                : "Não informado"
            }
          />
          <DetailItem label="Custo" value={formatMoneyValue(item.custo)} />
        </DetailGrid>
      </DetailSection>

      <AuditDetails item={item} />
    </div>
  );
}

function ArmacaoDetails({ item }) {
  return (
    <div className="space-y-6">
      <DetailSection title="Resumo">
        <DetailGrid>
          <DetailItem label="Marca" value={item.marca} />
          <DetailItem label="Modelo" value={item.modelo} />
          <DetailItem label="Referência" value={item.referencia} />
          <DetailItem label="Código interno" value={item.codigo_interno} />
          <DetailItem label="Código de barras" value={item.codigo_barras} />
          <DetailItem label="Cor" value={item.cor} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Características">
        <DetailGrid>
          <DetailItem label="Material" value={item.material} />
          <DetailItem label="Formato" value={item.formato} />
          <DetailItem label="Tamanho" value={item.tamanho_texto} />
          <DetailItem
            label="Tipo"
            value={getOptionLabel(tipoArmacaoLabels, item.tipo_armacao)}
          />
          <DetailItem
            label="Gênero indicado"
            value={getOptionLabel(generoLabels, item.genero_indicado)}
          />
          <DetailItem label="Custo" value={formatMoneyValue(item.custo)} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Medidas">
        <DetailGrid>
          <DetailItem label="Aro" value={formatNumber(item.aro)} />
          <DetailItem label="Ponte" value={formatNumber(item.ponte)} />
          <DetailItem label="Haste" value={formatNumber(item.haste)} />
          <DetailItem
            label="Largura total"
            value={formatNumber(item.largura_total)}
          />
          <DetailItem
            label="Altura da lente"
            value={formatNumber(item.altura_lente)}
          />
          <DetailItem label="Diagonal maior" value={item.diagonal_maior} />
        </DetailGrid>
      </DetailSection>

      <AuditDetails item={item} />
    </div>
  );
}

function LaboratorioDetails({ item }) {
  return (
    <div className="space-y-6">
      <DetailSection title="Dados do laboratório">
        <DetailGrid>
          <DetailItem label="Nome" value={item.nome} />
          <DetailItem label="Telefone" value={item.telefone} />
          <DetailItem
            label="Status"
            value={item.ativo ? "Ativo" : "Inativo"}
          />
          <DetailItem
            label="Quantidade de usos"
            value={`${item.quantidade_usos || 0}`}
          />
        </DetailGrid>
      </DetailSection>

      <AuditDetails item={item} />
    </div>
  );
}

function AuditDetails({ item }) {
  return (
    <DetailSection title="Histórico">
      <DetailGrid>
        <DetailItem
          label="Último uso"
          value={formatDateTimeBR(item.ultimo_uso_em)}
        />
        <DetailItem
          label="Criado em"
          value={formatDateTimeBR(item.created_at)}
        />
        <DetailItem
          label="Atualizado em"
          value={formatDateTimeBR(item.updated_at)}
        />
      </DetailGrid>
    </DetailSection>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

export function CatalogoPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <section className="flex flex-col gap-4 rounded-[30px] border border-border bg-card p-4 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.30)] md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-semibold text-muted-foreground">
        Página {page} de {safeTotalPages} • {totalItems} item
        {totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-11 w-full rounded-full border-border bg-background sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-11 rounded-full px-4 font-black"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= safeTotalPages}
            className="h-11 rounded-full px-4 font-black"
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   CONFIRMAÇÃO DE DELETE
   ========================================================================== */

export function ConfirmDeleteCatalogoDialog({
  open,
  onOpenChange,
  activeTab,
  item,
  onConfirm,
  isDeleting = false,
}) {
  const meta = getTabMeta(activeTab);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {item ? (
        <AlertDialogContent className="rounded-[32px] border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-[-0.045em] text-dark-title">
              Excluir {meta.singular}?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
              Você está prestes a excluir{" "}
              <span className="font-bold text-dark-title">
                {getItemTitle(activeTab, item)}
              </span>
              . Essa ação remove o item do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-full font-black"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onConfirm(item);
              }}
              disabled={isDeleting}
              className="rounded-full bg-destructive px-5 font-black text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}

/* ==========================================================================
   PEÇAS DE UI
   ========================================================================== */

function FormSection({ title, children }) {
  return (
    <section className="rounded-[28px] border border-border bg-background/60 p-5">
      <h3 className="mb-4 text-base font-black tracking-[-0.035em] text-dark-title">
        {title}
      </h3>

      {children}
    </section>
  );
}

function FormField({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-dark-title">{label}</span>

      {children}

      {error ? (
        <span className="block text-xs font-bold text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SwitchField({ label, checked, onCheckedChange }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3">
      <span className="text-sm font-black text-dark-title">{label}</span>

      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-[28px] border border-border bg-background/60 p-5">
      <h3 className="mb-4 text-base font-black tracking-[-0.035em] text-dark-title">
        {title}
      </h3>

      {children}
    </section>
  );
}

function DetailGrid({ children }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-dark-title">
        {value || "Não informado"}
      </p>
    </div>
  );
}

/* ==========================================================================
   EXPORTS AUXILIARES PARA PAGE
   ========================================================================== */

export function getCatalogoItemSearchText(activeTab, item) {
  if (!item) return "";

  if (activeTab === "lentes") {
    return [
      item.tipo_lente,
      tipoLenteLabels[item.tipo_lente],
      item.marca,
      item.linha,
      item.laboratorio,
      item.material,
      materialLenteLabels[item.material],
      item.indice_refracao,
      item.tratamento_antirreflexo,
      item.coloracao,
      item.tonalidade,
      item.curva_base,
      item.diametro,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (activeTab === "armacoes") {
    return [
      item.marca,
      item.modelo,
      item.referencia,
      item.codigo_interno,
      item.codigo_barras,
      item.cor,
      item.material,
      item.formato,
      item.tamanho_texto,
      item.tipo_armacao,
      tipoArmacaoLabels[item.tipo_armacao],
      item.genero_indicado,
      generoLabels[item.genero_indicado],
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [item.nome, item.telefone].filter(Boolean).join(" ");
}

export function getCatalogoTabMeta(tab) {
  return getTabMeta(tab);
}
