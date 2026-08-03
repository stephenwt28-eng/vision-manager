"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  FileText,
  Filter,
  Glasses,
  Loader2,
  PencilLine,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Trash2,
  UserRoundPlus,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

import {
  formatBRLInput,
  formatCEPInput,
  formatCPFInput,
  formatPhoneInput,
  parseBRLToNumber,
} from "@/lib/formatter";

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

export const pageSizeOptions = [30, 50, 100];

export const osStatusOptions = [
  { value: "cadastrada", label: "Cadastrada" },
  { value: "enviada_laboratorio", label: "Enviada ao laboratório" },
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

const formaPagamentoOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "crediario", label: "Crediário" },
  { value: "outro", label: "Outro" },
];

const tipoOsOptions = [
  { value: "venda", label: "Venda" },
  { value: "orcamento", label: "Orçamento" },
  { value: "garantia", label: "Garantia" },
  { value: "ajuste", label: "Ajuste" },
  { value: "troca", label: "Troca" },
];

const tipoReceitaOptions = [
  { value: "longe", label: "Visão simples longe" },
  { value: "perto", label: "Visão simples perto" },
  { value: "multifocal", label: "Multifocal / progressiva" },
  { value: "bifocal", label: "Bifocal" },
  { value: "ocupacional", label: "Ocupacional / intermediária" },
  { value: "outro", label: "Outro" },
];

const tipoArmacaoOptions = [
  { value: "aro_fechado", label: "Aro fechado" },
  { value: "fio_nylon", label: "Fio de nylon" },
  { value: "tres_pecas", label: "Três peças" },
  { value: "clipon", label: "Clip-on" },
  { value: "solar", label: "Solar" },
  { value: "outro", label: "Outro" },
];

const tipoLenteOptions = [
  { value: "visao_simples", label: "Visão simples" },
  { value: "bifocal", label: "Bifocal" },
  { value: "multifocal", label: "Multifocal" },
  { value: "ocupacional", label: "Ocupacional" },
  { value: "solar", label: "Solar" },
  { value: "sem_grau", label: "Sem grau" },
  { value: "outro", label: "Outro" },
];

const lenteMaterialOptions = [
  { value: "resina", label: "Resina" },
  { value: "policarbonato", label: "Policarbonato" },
  { value: "trivex", label: "Trivex" },
  { value: "cristal", label: "Cristal" },
  { value: "alto_indice", label: "Alto índice" },
  { value: "outro", label: "Outro" },
];

const hojeLocal = new Date();

const dataVenda = hojeLocal.toLocaleDateString("sv-SE", {
  timeZone: "America/Sao_Paulo",
});

const emptyOrdemServico = {
  numero_os: "",
  cliente_id: "",
  vendedor_id: "",
  tipo_os: "venda",
  status: "cadastrada",
  data_venda: dataVenda,
  prazo_entrega_combinado: "",
  prazo_entrega_dias: "",
  laboratorio_nome: "",
  previsao_laboratorio: "",
  prazo_laboratorio_dias: "",
  pedido_laboratorio_numero: "",
  custo_armacao: "R$ 0,00",
  custo_lentes: "R$ 0,00",
  valor_armacao: "R$ 0,00",
  valor_lentes: "R$ 0,00",
  valor_servicos: "R$ 0,00",
  valor_adicionais: "R$ 0,00",
  desconto_tipo: "valor",
  desconto_valor: "R$ 0,00",
  desconto_percentual: "",
  valor_total: "R$ 0,00",
  valor_entrada: "R$ 0,00",
  valor_restante: "R$ 0,00",
  forma_pagamento: "",
  quantidade_parcelas: "",
  valor_parcela: "R$ 0,00",
  status_pagamento: "pendente",
  observacoes_cliente: "",
  observacoes_internas: "",
};

const emptyClienteRapido = {
  nome_completo: "",
  telefone_principal: "",
  cpf: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  origem_cliente: "balcao",
  prefere_contato_por: "whatsapp",
  observacoes: "",
  ativo: true,
};

const emptyReceita = {
  data_receita: "",
  medico_nome: "",
  medico_crm: "",
  medico_clinica: "",
  medico_telefone: "",
  validade_receita: "",
  tipo_receita: "",
  od_esferico: "",
  od_perto_esferico: "",
  od_cilindrico: "",
  od_eixo: "",
  od_adicao: "",
  od_prisma: "",
  od_base: "",
  oe_esferico: "",
  oe_perto_esferico: "",
  oe_cilindrico: "",
  oe_eixo: "",
  oe_adicao: "",
  oe_prisma: "",
  oe_base: "",
  dnp_od: "",
  dnp_oe: "",
  dp_total: "",
  altura_od: "",
  altura_oe: "",
  acuidade_od: "",
  acuidade_oe: "",
  observacoes: "",
};

const emptyArmacao = {
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
  custo: "",
  observacoes: "",
};

const emptyLente = {
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
  data_inicio_garantia: "",
  data_fim_garantia: "",
  custo: "",
  observacoes: "",
};

const statusMeta = {
  cadastrada: {
    label: "Cadastrada",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  enviada_laboratorio: {
    label: "No laboratório",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  pronta_retirada: {
    label: "Pronta",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  entregue: {
    label: "Entregue",
    className: "bg-primary/[0.10] text-primary border-primary/20",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-100 text-red-700 border-red-200",
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

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function addDaysToInputDate(baseDate, days) {
  if (!baseDate || days === "" || days === null || days === undefined) {
    return "";
  }

  const parsedDays = Number(days);

  if (!Number.isFinite(parsedDays) || parsedDays < 0) {
    return "";
  }

  const date = new Date(`${String(baseDate).slice(0, 10)}T00:00:00`);
  date.setDate(date.getDate() + parsedDays);

  return date.toISOString().slice(0, 10);
}

function calculateDaysBetweenDates(startDate, endDate) {
  if (!startDate || !endDate) return "";

  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endDate).slice(0, 10)}T00:00:00`);

  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(days) && days >= 0 ? String(days) : "";
}

function normalizeDaysInput(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";

  return String(Math.min(Number(digits), 365));
}

function moneyToInput(value) {
  return formatBRL(value || 0);
}

function moneyToNumber(value) {
  if (typeof value === "number") return value;
  return parseBRLToNumber(value || "R$ 0,00");
}

function getClienteName(clientesById, clienteId) {
  return clientesById.get(clienteId)?.nome_completo || "Cliente não encontrado";
}

function getVendedorName(vendedoresById, vendedorId) {
  const vendedor = vendedoresById.get(vendedorId);

  return vendedor?.nome_exibicao || vendedor?.nome_completo || "Sem vendedor";
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

function mapOrdemToForm(os) {
  if (!os) return emptyOrdemServico;

  return {
    ...emptyOrdemServico,
    ...os,
    cliente_id: os.cliente_id || "",
    vendedor_id: os.vendedor_id || "",
    data_venda: toInputDate(os.data_venda),
    prazo_entrega_combinado: toInputDate(os.prazo_entrega_combinado),
    prazo_entrega_dias: calculateDaysBetweenDates(
      toInputDate(os.data_venda),
      toInputDate(os.prazo_entrega_combinado)
    ),
    previsao_laboratorio: toInputDate(os.previsao_laboratorio),
    prazo_laboratorio_dias: calculateDaysBetweenDates(
      toInputDate(os.data_venda),
      toInputDate(os.previsao_laboratorio)
    ),
    custo_armacao: moneyToInput(os.custo_armacao),
    custo_lentes: moneyToInput(os.custo_lentes),
    valor_armacao: moneyToInput(os.valor_armacao),
    valor_lentes: moneyToInput(os.valor_lentes),
    valor_servicos: moneyToInput(os.valor_servicos),
    valor_adicionais: moneyToInput(os.valor_adicionais),
    desconto_valor: moneyToInput(os.desconto_valor),
    valor_total: moneyToInput(os.valor_total),
    valor_entrada: moneyToInput(os.valor_entrada),
    valor_restante: moneyToInput(os.valor_restante),
    valor_parcela: moneyToInput(os.valor_parcela),
    quantidade_parcelas: os.quantidade_parcelas || "",
    desconto_percentual: os.desconto_percentual || "",
  };
}

function mapRelatedToForm(value, fallback) {
  if (!value) return fallback;

  return {
    ...fallback,
    ...value,
    custo: Object.prototype.hasOwnProperty.call(fallback, "custo")
      ? moneyToInput(value.custo)
      : value.custo,
    data_receita: toInputDate(value.data_receita),
    validade_receita: toInputDate(value.validade_receita),
    data_inicio_garantia: toInputDate(value.data_inicio_garantia),
    data_fim_garantia: toInputDate(value.data_fim_garantia),
  };
}

function getFormPayload(formData) {
  return {
    ...formData,
    custo_armacao: moneyToNumber(formData.custo_armacao),
    custo_lentes: moneyToNumber(formData.custo_lentes),
    valor_armacao: moneyToNumber(formData.valor_armacao),
    valor_lentes: moneyToNumber(formData.valor_lentes),
    valor_servicos: moneyToNumber(formData.valor_servicos),
    valor_adicionais: moneyToNumber(formData.valor_adicionais),
    desconto_valor: moneyToNumber(formData.desconto_valor),
    valor_total: moneyToNumber(formData.valor_total),
    valor_entrada: moneyToNumber(formData.valor_entrada),
    valor_restante: moneyToNumber(formData.valor_restante),
    valor_parcela: moneyToNumber(formData.valor_parcela),
    quantidade_parcelas: formData.quantidade_parcelas
      ? Number(formData.quantidade_parcelas)
      : null,
    desconto_percentual: formData.desconto_percentual
      ? Number(formData.desconto_percentual)
      : 0,
    data_venda: formData.data_venda || null,
    prazo_entrega_combinado:
      addDaysToInputDate(formData.data_venda, formData.prazo_entrega_dias) ||
      formData.prazo_entrega_combinado ||
      null,
    previsao_laboratorio:
      addDaysToInputDate(formData.data_venda, formData.prazo_laboratorio_dias) ||
      formData.previsao_laboratorio ||
      null,
    forma_pagamento: formData.forma_pagamento || null,
    desconto_tipo: formData.desconto_tipo || null,
  };
}

function getRelatedPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload || {}).map(([key, value]) => [
      key,
      key === "custo" ? moneyToNumber(value) : value === "" ? null : value,
    ])
  );
}

function getCatalogoArmacaoLabel(item) {
  return [
    item?.marca,
    item?.modelo,
    item?.cor,
    item?.codigo_interno || item?.referencia,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getCatalogoLenteLabel(item) {
  return [item?.marca, item?.linha, item?.tipo_lente, item?.material]
    .filter(Boolean)
    .join(" • ");
}

function parseOpticalNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

const receitaDecimalFields = new Set([
  "od_esferico",
  "od_perto_esferico",
  "od_cilindrico",
  "od_adicao",
  "oe_esferico",
  "oe_perto_esferico",
  "oe_cilindrico",
  "oe_adicao",
  "dnp_od",
  "dnp_oe",
  "dp_total",
  "altura_od",
  "altura_oe",
]);

const receitaAxisFields = new Set(["od_eixo", "oe_eixo"]);

function normalizeOpticalDecimalInput(value) {
  if (value === null || value === undefined || value === "") return "";

  const raw = String(value).trim();
  const isNegative = raw.includes("-");
  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return isNegative ? "-" : "";
  }

  const integerPart = digits.slice(0, -2) || "0";
  const decimalPart = digits.slice(-2).padStart(2, "0");
  const normalized = `${Number(integerPart)}.${decimalPart}`;

  return isNegative ? `-${normalized}` : normalized;
}

function normalizeOpticalAxisInput(value) {
  if (value === null || value === undefined || value === "") return "";

  const digits = String(value).replace(/\D/g, "");

  if (!digits) return "";

  return String(Math.min(Number(digits), 180));
}

function formatOpticalMeasure(value) {
  const parsed = parseOpticalNumber(value);

  if (parsed === null) return "";

  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2);
}

function hasRecipeFieldValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function hasRecipeData(data = {}) {
  return Object.entries(data).some(([key, value]) => {
    if (key === "id") return false;
    return hasRecipeFieldValue(value);
  });
}

function shouldShowAddition(tipoReceita) {
  return ["multifocal", "bifocal", "ocupacional"].includes(tipoReceita);
}

function getNearSphereField(prefix) {
  return `${prefix}_perto_esferico`;
}

function getRecipeNearSphereValue(data = {}, prefix) {
  const nearField = getNearSphereField(prefix);

  if (hasRecipeFieldValue(data[nearField])) {
    return data[nearField];
  }

  const esferico = parseOpticalNumber(data[`${prefix}_esferico`]);
  const adicao = parseOpticalNumber(data[`${prefix}_adicao`]);

  if (esferico === null || adicao === null) return "";

  return formatOpticalMeasure(esferico + adicao);
}

function syncNearAndAddition(next, prefix, sourceField = "") {
  const longeField = `${prefix}_esferico`;
  const adicaoField = `${prefix}_adicao`;
  const nearField = getNearSphereField(prefix);

  const esferico = parseOpticalNumber(next[longeField]);
  const adicao = parseOpticalNumber(next[adicaoField]);
  const perto = parseOpticalNumber(next[nearField]);

  if (sourceField === adicaoField) {
    next[nearField] =
      esferico === null || adicao === null
        ? ""
        : formatOpticalMeasure(esferico + adicao);
    return;
  }

  if (sourceField === nearField) {
    next[adicaoField] =
      esferico === null || perto === null
        ? ""
        : formatOpticalMeasure(perto - esferico);
    return;
  }

  if (sourceField === longeField) {
    if (adicao !== null && esferico !== null) {
      next[nearField] = formatOpticalMeasure(esferico + adicao);
      return;
    }

    if (perto !== null && esferico !== null) {
      next[adicaoField] = formatOpticalMeasure(perto - esferico);
      return;
    }
  }

  if (adicao !== null && esferico !== null) {
    next[nearField] = formatOpticalMeasure(esferico + adicao);
    return;
  }

  if (perto !== null && esferico !== null) {
    next[adicaoField] = formatOpticalMeasure(perto - esferico);
    return;
  }

  next[nearField] = "";
}

function shouldShowHeight(tipoReceita) {
  return ["longe", "perto", "multifocal", "bifocal", "ocupacional"].includes(
    tipoReceita
  );
}

function getTipoLenteFromReceita(tipoReceita) {
  switch (tipoReceita) {
    case "longe":
    case "perto":
      return "visao_simples";
    case "multifocal":
      return "multifocal";
    case "bifocal":
      return "bifocal";
    case "ocupacional":
      return "ocupacional";
    case "solar_grau":
      return "solar";
    default:
      return "";
  }
}

function getReceitaTypeCopy(tipoReceita) {
  switch (tipoReceita) {
    case "longe":
      return {
        summary: "Preencha o grau de longe. Adição não é necessária.",
        dpLabel: "DNP / DP de longe",
      };
    case "perto":
      return {
        summary: "Preencha o grau final de perto como ele veio na receita.",
        dpLabel: "DNP / DP de perto",
      };
    case "multifocal":
      return {
        summary:
          "Esférico, cilíndrico e eixo representam o longe. A adição calcula o perto.",
        dpLabel: "DNP / DP com altura obrigatória",
      };
    case "bifocal":
      return {
        summary:
          "Use o grau de longe e informe a adição para o segmento de perto.",
        dpLabel: "DNP / DP com altura do segmento",
      };
    case "ocupacional":
      return {
        summary:
          "Use a receita base e a adição conforme a montagem ocupacional/intermediária.",
        dpLabel: "DNP / DP conforme montagem",
      };
    case "solar_grau":
      return {
        summary: "Preencha conforme a receita usada para o solar com grau.",
        dpLabel: "DNP / DP conforme receita",
      };
    default:
      return {
        summary: "Selecione a finalidade da lente para o formulário se adaptar.",
        dpLabel: "DNP / DP",
      };
  }
}

function hasMainEyeData(data = {}, prefix) {
  return [
    data[`${prefix}_esferico`],
    data[`${prefix}_cilindrico`],
    data[`${prefix}_eixo`],
  ].some(hasRecipeFieldValue);
}

function getReceitaFormState(receita) {
  const next = mapRelatedToForm(receita, emptyReceita);

  ["od", "oe"].forEach((prefix) => {
    next[getNearSphereField(prefix)] = getRecipeNearSphereValue(next, prefix);
  });

  return next;
}

function normalizeReceitaPayload(receita = {}) {
  const payload = getRelatedPayload(receita);

  delete payload.od_perto_esferico;
  delete payload.oe_perto_esferico;

  if (!shouldShowAddition(payload.tipo_receita)) {
    payload.od_adicao = null;
    payload.oe_adicao = null;
  }

  if (!shouldShowHeight(payload.tipo_receita)) {
    payload.altura_od = null;
    payload.altura_oe = null;
  }

  if (hasRecipeFieldValue(payload.dnp_od) && hasRecipeFieldValue(payload.dnp_oe)) {
    const dpTotal =
      parseOpticalNumber(payload.dnp_od) + parseOpticalNumber(payload.dnp_oe);

    if (Number.isFinite(dpTotal)) {
      payload.dp_total = formatOpticalMeasure(dpTotal);
    }
  }

  return payload;
}

function getOptionLabel(options = [], value, fallback = "Não informado") {
  if (!value) return fallback;

  return options.find((option) => option.value === value)?.label || value;
}

function escapePrintHtml(value, fallback = "Não informado") {
  const text =
    value === null || value === undefined || String(value).trim() === ""
      ? fallback
      : String(value).trim();

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printLine(label, value, options = {}) {
  const { strong = false } = options;

  return `
    <div class="line${strong ? " strong" : ""}">
      <span>${escapePrintHtml(label)}</span>
      <b>${escapePrintHtml(value)}</b>
    </div>
  `;
}

function printPairLine(left, right, options = {}) {
  const { strong = false } = options;

  return `
    <div class="pair-line${strong ? " strong" : ""}">
      <div>
        <span>${escapePrintHtml(left[0])}</span>
        <b>${escapePrintHtml(left[1])}</b>
      </div>
      <div>
        <span>${escapePrintHtml(right[0])}</span>
        <b>${escapePrintHtml(right[1])}</b>
      </div>
    </div>
  `;
}

function printSection(title, rows = []) {
  return `
    <section class="box">
      <h2>${escapePrintHtml(title)}</h2>
      ${rows.join("")}
    </section>
  `;
}

function getLenteTratamentos(lente = {}) {
  return [
    lente?.tratamento_filtro_azul ? "Filtro azul" : "",
    lente?.tratamento_fotossensivel ? "Fotossensível" : "",
    lente?.tratamento_polarizado ? "Polarizado" : "",
    lente?.tratamento_uv ? "UV" : "",
    lente?.tratamento_risco ? "Antirrisco" : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function printOptionalLine(label, value, options = {}) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  return printLine(label, value, options);
}

function printOptionalPairLine(left, right, options = {}) {
  const hasLeft =
    left?.[1] !== null && left?.[1] !== undefined && String(left[1]).trim() !== "";
  const hasRight =
    right?.[1] !== null && right?.[1] !== undefined && String(right[1]).trim() !== "";

  if (hasLeft && hasRight) return printPairLine(left, right, options);
  if (hasLeft) return printLine(left[0], left[1], options);
  if (hasRight) return printLine(right[0], right[1], options);

  return "";
}

function printQualityChecklist() {
  const items = [
    "Visão simples",
    "Bifocal",
    "Multifocal",
    "Lentes BR",
    "AR",
    "Solar",
    "Fotossensível",
    "Conferir lentes",
    "Receita oftálmica",
    "Sem receita",
    "Armação da ótica",
    "Armação cliente",
    "Coloração",
    "DNP",
    "Troca de plaquetas",
    "Solda",
    "Troca de armação",
    "Não ajustar armação",
    "Ajustar armação",
    "Conferir grau/eixos",
  ];

  return `
    <section class="box quality">
      <h2>Controle de qualidade - Técnico</h2>
      <div class="checks">
        ${items
          .map(
            (item) => `
              <label>
                <span></span>
                ${escapePrintHtml(item)}
              </label>
            `
          )
          .join("")}
      </div>
      <div class="quality-footer">
        <div>Data: ____/____/______</div>
        <div>Hora: ____:____</div>
        <div>Técnico: __________________</div>
      </div>
    </section>
  `;
}

function buildReceitaPrintTable(receita = {}) {
  const showNear = shouldShowAddition(receita?.tipo_receita);

  const row = (eye, prefix, isNear = false) => `
    <tr>
      <td>${eye}</td>
      <td>${escapePrintHtml(
        isNear ? getRecipeNearSphereValue(receita, prefix) : receita?.[`${prefix}_esferico`],
        "-"
      )}</td>
      <td>${escapePrintHtml(receita?.[`${prefix}_cilindrico`], "-")}</td>
      <td>${escapePrintHtml(receita?.[`${prefix}_eixo`], "-")}</td>
      <td>${escapePrintHtml(isNear ? "" : receita?.[`${prefix}_adicao`], "-")}</td>
      <td>${escapePrintHtml(isNear ? "" : receita?.[`${prefix}_prisma`], "-")}</td>
      <td>${escapePrintHtml(isNear ? "" : receita?.[`${prefix}_base`], "-")}</td>
    </tr>
  `;

  return `
    <table class="recipe-table">
      <thead>
        <tr>
          <th>Olho</th>
          <th>Esf.</th>
          <th>Cil.</th>
          <th>Eixo</th>
          <th>Ad.</th>
          <th>Prisma</th>
          <th>Base</th>
        </tr>
      </thead>
      <tbody>
        <tr class="group"><td colspan="7">Longe</td></tr>
        ${row("OD", "od")}
        ${row("OE", "oe")}
        ${
          showNear
            ? `
              <tr class="group"><td colspan="7">Perto</td></tr>
              ${row("OD", "od", true)}
              ${row("OE", "oe", true)}
            `
            : ""
        }
      </tbody>
    </table>
  `;
}

function buildOrdemServicoPrintHtml({
  ordemServico,
  cliente,
  receita,
  armacao,
  lente,
}) {
  const os = ordemServico || {};
  const clienteNome = cliente?.nome_completo || "Cliente não encontrado";
  const numeroOs = os.numero_os || "OS sem número";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapePrintHtml(numeroOs)} - Ordem de Serviço</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #ffffff;
        color: #111827;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .sheet {
        width: 297mm;
        min-height: 210mm;
        padding: 4mm;
      }

      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 4mm;
        align-items: start;
        border-bottom: 0.4mm solid #111827;
        padding-bottom: 2mm;
        margin-bottom: 3mm;
      }

      .brand {
        text-transform: uppercase;
        font-size: 8pt;
        font-weight: 900;
        letter-spacing: 0.14em;
        color: #2563eb;
      }

      h1 {
        margin: 1mm 0 0;
        font-size: 18pt;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .header p {
        margin: 1mm 0 0;
        font-size: 8pt;
        font-weight: 700;
        color: #4b5563;
      }

      .status {
        border: 0.35mm solid #111827;
        border-radius: 3mm;
        padding: 2mm 3mm;
        text-align: right;
        font-size: 8pt;
        font-weight: 900;
        text-transform: uppercase;
      }

      .status b {
        display: block;
        margin-top: 1mm;
        font-size: 11pt;
        color: #111827;
      }

      .columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3mm;
        align-items: start;
      }

      .column {
        min-width: 0;
        display: grid;
        gap: 2mm;
      }

      .box {
        break-inside: avoid;
        border: 0.25mm solid #d1d5db;
        border-radius: 3mm;
        overflow: hidden;
      }

      .box h2 {
        margin: 0;
        padding: 1.4mm 2mm;
        background: #f3f4f6;
        border-bottom: 0.25mm solid #d1d5db;
        font-size: 7pt;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .line {
        display: grid;
        grid-template-columns: 28mm 1fr;
        gap: 2mm;
        padding: 1.15mm 2mm;
        border-bottom: 0.2mm solid #e5e7eb;
        font-size: 7.6pt;
        line-height: 1.2;
      }

      .pair-line {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2mm;
        padding: 1.15mm 2mm;
        border-bottom: 0.2mm solid #e5e7eb;
        font-size: 7.6pt;
        line-height: 1.2;
      }

      .pair-line > div {
        display: grid;
        grid-template-columns: 21mm 1fr;
        gap: 1.5mm;
        min-width: 0;
      }

      .line:last-child {
        border-bottom: 0;
      }

      .pair-line:last-child {
        border-bottom: 0;
      }

      .line span,
      .pair-line span {
        color: #6b7280;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 6.2pt;
        letter-spacing: 0.06em;
      }

      .line b,
      .pair-line b {
        color: #111827;
        font-weight: 800;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .line.strong,
      .pair-line.strong {
        background: #eff6ff;
      }

      .line.strong b,
      .pair-line.strong b {
        font-size: 9.5pt;
        font-weight: 900;
      }

      .recipe-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 7.4pt;
      }

      .recipe-table th,
      .recipe-table td {
        border-bottom: 0.2mm solid #e5e7eb;
        padding: 1.2mm 1mm;
        text-align: center;
        font-weight: 800;
      }

      .recipe-table th {
        background: #f9fafb;
        color: #6b7280;
        font-size: 6pt;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .recipe-table .group td {
        background: #eef2ff;
        color: #3730a3;
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 6pt;
        font-weight: 900;
      }

      .quality .checks {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.1mm 2mm;
        padding: 2mm;
        font-size: 6.9pt;
        font-weight: 800;
      }

      .quality label {
        display: flex;
        align-items: center;
        gap: 1.5mm;
      }

      .quality label span {
        display: inline-block;
        width: 3mm;
        height: 3mm;
        border: 0.25mm solid #111827;
        border-radius: 0.6mm;
        flex: 0 0 auto;
      }

      .quality-footer {
        display: grid;
        grid-template-columns: 1fr 1fr 1.5fr;
        gap: 2mm;
        border-top: 0.2mm solid #e5e7eb;
        padding: 1.5mm 2mm;
        font-size: 7pt;
        font-weight: 900;
      }

      @media print {
        .sheet {
          padding: 4mm;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <header class="header">
        <div>
          <div class="brand">Ordem de Serviço</div>
          <h1>${escapePrintHtml(numeroOs)}</h1>
          <p>${escapePrintHtml(clienteNome)} • Venda ${escapePrintHtml(formatDateBR(os.data_venda))} • Prazo ${escapePrintHtml(formatDateBR(os.prazo_entrega_combinado))}</p>
        </div>

        <div class="status">
          Total
          <b>${escapePrintHtml(formatBRL(os.valor_total))}</b>
        </div>
      </header>

      <div class="columns">
        <div class="column">
          ${printSection("Cliente", [
            printLine("Nome", clienteNome, { strong: true }),
            printLine("CPF", cliente?.cpf),
            printLine("Telefone", cliente?.telefone_principal),
            printLine(
              "Endereço",
              [
                cliente?.rua,
                cliente?.numero,
                cliente?.bairro,
                cliente?.cidade,
                cliente?.estado,
              ]
                .filter(Boolean)
                .join(", ")
            ),
          ])}

          ${printSection("Dados da OS", [
            printLine("Data da venda", formatDateBR(os.data_venda)),
            printLine("Prazo", formatDateBR(os.prazo_entrega_combinado), { strong: true }),
          ])}

          ${printSection("Financeiro", [
            printPairLine(["Armação", formatBRL(os.valor_armacao)], ["Lente", formatBRL(os.valor_lentes)]),
            printPairLine(["Serviço", formatBRL(os.valor_servicos)], ["Desconto", formatBRL(os.desconto_valor)]),
            printLine("Total", formatBRL(os.valor_total), { strong: true }),
            printPairLine(["Entrada", formatBRL(os.valor_entrada)], ["Restante", formatBRL(os.valor_restante)], { strong: true }),
            printLine("Forma pag.", getOptionLabel(formaPagamentoOptions, os.forma_pagamento)),
          ])}

          ${printQualityChecklist()}
        </div>

        <div class="column">
          ${printSection("Receita", [
            printLine("Médico", receita?.medico_nome),
            printPairLine(["CRM", receita?.medico_crm], ["Tipo", getOptionLabel(tipoReceitaOptions, receita?.tipo_receita)]),
            printOptionalPairLine(["DNP OD", receita?.dnp_od], ["DNP OE", receita?.dnp_oe]),
            printOptionalLine("DP total", receita?.dp_total),
            printOptionalPairLine(["Altura OD", receita?.altura_od], ["Altura OE", receita?.altura_oe]),
          ])}

          <section class="box">
            <h2>Grau</h2>
            ${buildReceitaPrintTable(receita)}
          </section>

          ${printSection("Armação", [
            printPairLine(["Marca", armacao?.marca], ["Modelo", armacao?.modelo]),
            printLine("Tipo", getOptionLabel(tipoArmacaoOptions, armacao?.tipo_armacao)),
            printLine("Medidas", [
              armacao?.aro ? `Aro ${armacao.aro}` : "",
              armacao?.ponte ? `Ponte ${armacao.ponte}` : "",
              armacao?.haste ? `Haste ${armacao.haste}` : "",
              armacao?.diagonal_maior ? `Diagonal ${armacao.diagonal_maior}` : "",
            ].filter(Boolean).join(" • ")),
          ])}

          ${printSection("Lente", [
            printLine("Tipo", getOptionLabel(tipoLenteOptions, lente?.tipo_lente)),
            printLine("Marca/Linha", [lente?.marca, lente?.linha].filter(Boolean).join(" • ")),
            printLine("Material/Índice", [
              getOptionLabel(lenteMaterialOptions, lente?.material, ""),
              lente?.indice_refracao,
            ].filter(Boolean).join(" • ")),
            printLine("Coloração", [lente?.coloracao, lente?.tonalidade].filter(Boolean).join(" • ")),
            printLine("Tratamento", getLenteTratamentos(lente)),
            printLine("Antirreflexo", lente?.tratamento_antirreflexo),
          ])}

          ${printSection("Observações", [
            printLine("Interna", os.observacoes_internas),
          ])}
        </div>
      </div>
    </main>
    <script>
      window.addEventListener("load", () => {
        window.focus();
        window.print();
      });
    </script>
  </body>
</html>`;
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

  return (
    <Badge className={`rounded-full border px-3 py-1 font-black ${meta.className}`}>
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
   KPIS
   ========================================================================== */

export function OrdensServicoKpis({ ordensServico = [] }) {
  const now = new Date();

  const totalMes = ordensServico
    .filter((os) => {
      if (!os.data_venda) return false;

      const date = new Date(`${os.data_venda}T00:00:00`);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, os) => sum + Number(os.valor_total || 0), 0);

  const abertas = ordensServico.filter(
    (os) => !["entregue", "cancelada"].includes(os.status)
  ).length;

  const atrasadas = ordensServico.filter(isAtrasada).length;

  const prontas = ordensServico.filter(
    (os) => os.status === "pronta_retirada"
  ).length;

  const kpis = [
    {
      title: "Vendas no mês",
      value: formatBRL(totalMes),
      meta: "Somatório das OS do período",
      icon: CircleDollarSign,
    },
    {
      title: "OS abertas",
      value: abertas,
      meta: "Ainda em andamento",
      icon: Clock3,
    },
    {
      title: "Atrasadas",
      value: atrasadas,
      meta: "Precisam de atenção",
      icon: AlertTriangle,
    },
    {
      title: "Prontas",
      value: prontas,
      meta: "Aguardando retirada",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.title}
            className="rounded-[34px] border border-border bg-card p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {kpi.title}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-dark-title">
                  {kpi.value}
                </p>
              </div>

              <div className="grid size-13 place-items-center rounded-[22px] bg-primary/[0.08] text-primary">
                <Icon className="size-6" />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-primary">
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

export function OrdensServicoFilters({
  filters,
  onChangeFilters,
  onClearFilters,
  vendedores = [],
  totalResults = 0,
}) {
  const [open, setOpen] = useState(false);

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
                placeholder="Pesquisar por OS, cliente, telefone, vendedor, laboratório..."
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
            {totalResults} OS encontrada{totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-5">
            <FieldBlock label="Status">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {osStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="atrasadas">Atrasadas</SelectItem>
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Pagamento">
              <Select
                value={filters.statusPagamento}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, statusPagamento: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {pagamentoStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Vendedor">
              <Select
                value={filters.vendedorId}
                onValueChange={(value) =>
                  onChangeFilters({ ...filters, vendedorId: value })
                }
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome_exibicao || vendedor.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="Venda de">
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    dataInicio: event.target.value,
                  })
                }
                className="h-12 rounded-2xl border-border bg-background"
              />
            </FieldBlock>

            <FieldBlock label="Venda até">
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(event) =>
                  onChangeFilters({
                    ...filters,
                    dataFim: event.target.value,
                  })
                }
                className="h-12 rounded-2xl border-border bg-background"
              />
            </FieldBlock>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   SEARCH SELECT SIMPLES
   ========================================================================== */

function SearchSelect({
  label,
  value,
  options = [],
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  onChange,
  getOptionLabel = (item) => item.label,
  getOptionDescription,
  disabled = false,
  action,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((item) => item.value === value);

  const filteredOptions = useMemo(() => {
    const term = normalizeSearchValue(search);

    if (!term) return options.slice(0, 60);

    return options
      .filter((item) =>
        normalizeSearchValue(
          [
            getOptionLabel(item),
            getOptionDescription?.(item),
            item.searchText,
          ]
            .filter(Boolean)
            .join(" ")
        ).includes(term)
      )
      .slice(0, 60);
  }, [options, search, getOptionLabel, getOptionDescription]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-dark-title">{label}</p>
        {action}
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-background px-4 text-left text-sm font-semibold transition ${
            error ? "border-red-300" : "border-border"
          } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/40"}`}
        >
          <span className={selected ? "truncate text-dark-title" : "truncate text-muted-foreground"}>
            {selected ? getOptionLabel(selected) : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {open ? (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_28px_90px_-48px_rgba(15,23,42,0.55)]">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 rounded-2xl border-border bg-background pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm font-semibold text-muted-foreground">
                  Nenhum resultado encontrado.
                </p>
              ) : (
                filteredOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onChange(item.value, item);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full rounded-2xl px-3 py-3 text-left transition hover:bg-primary/[0.06] ${
                      item.value === value ? "bg-primary/[0.08]" : ""
                    }`}
                  >
                    <p className="truncate text-sm font-black text-dark-title">
                      {getOptionLabel(item)}
                    </p>

                    {getOptionDescription?.(item) ? (
                      <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
                        {getOptionDescription(item)}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   TABELA
   ========================================================================== */

export function OrdensServicoTable({
  ordensServico = [],
  clientesById,
  vendedoresById,
  relatedByOs = {},
  onLoadDetails,
  onQuickUpdate,
  onEdit,
  onDelete,
  canDelete = false,
  isUpdatingId = "",
}) {
  const [paymentInputs, setPaymentInputs] = useState({});
  const [printingId, setPrintingId] = useState("");

  function updatePaymentInput(osId, value) {
    setPaymentInputs((current) => ({
      ...current,
      [osId]: formatBRLInput(value),
    }));
  }

  function buildPaymentPatch(os, amount) {
    const valorTotal = moneyToNumber(os.valor_total);
    const entradaAtual = moneyToNumber(os.valor_entrada);
    const restanteAtual = moneyToNumber(os.valor_restante);
    const pagamento = Math.max(moneyToNumber(amount), 0);
    const valorPago = Math.min(pagamento, restanteAtual);
    const proximaEntrada = Math.min(entradaAtual + valorPago, valorTotal);
    const proximoRestante = Math.max(restanteAtual - valorPago, 0);

    return {
      valor_entrada: proximaEntrada,
      valor_restante: proximoRestante,
      status_pagamento:
        proximoRestante <= 0 && valorTotal > 0
          ? "pago"
          : proximaEntrada > 0
            ? "parcial"
            : "pendente",
    };
  }

  function handlePayRemaining(os) {
    const restante = moneyToNumber(os.valor_restante);
    if (restante <= 0) return;

    onQuickUpdate(os, buildPaymentPatch(os, restante));
  }

  function handlePayAmount(os) {
    const value = paymentInputs[os.id] || "R$ 0,00";
    const amount = moneyToNumber(value);
    if (amount <= 0) return;

    onQuickUpdate(os, buildPaymentPatch(os, amount));
    setPaymentInputs((current) => ({ ...current, [os.id]: "R$ 0,00" }));
  }

  async function handlePrint(os) {
    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      window.alert("O navegador bloqueou a janela de impressão.");
      return;
    }

    const fallbackData = {
      ordemServico: os,
      cliente: clientesById.get(os.cliente_id) || null,
      vendedor: vendedoresById.get(os.vendedor_id) || null,
      receita: relatedByOs.receitas?.[os.id] || null,
      armacao: relatedByOs.armacoes?.[os.id] || null,
      lente: relatedByOs.lentes?.[os.id] || null,
    };

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Preparando impressão</title>
          <style>
            body {
              margin: 0;
              display: grid;
              min-height: 100vh;
              place-items: center;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              color: #111827;
            }
            div {
              text-align: center;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          <div>Preparando impressão da ${escapePrintHtml(os.numero_os || "OS")}...</div>
        </body>
      </html>`);
    printWindow.document.close();

    try {
      setPrintingId(os.id);

      const detailData =
        typeof onLoadDetails === "function" ? await onLoadDetails(os.id) : null;

      const printData = {
        ordemServico: detailData?.ordemServico || fallbackData.ordemServico,
        cliente: detailData?.cliente || fallbackData.cliente,
        vendedor: detailData?.vendedor || fallbackData.vendedor,
        receita:
          detailData?.receita || detailData?.receitas?.[0] || fallbackData.receita,
        armacao:
          detailData?.armacao || detailData?.armacoes?.[0] || fallbackData.armacao,
        lente: detailData?.lente || detailData?.lentes?.[0] || fallbackData.lente,
      };

      printWindow.document.open();
      printWindow.document.write(buildOrdemServicoPrintHtml(printData));
      printWindow.document.close();
    } catch (error) {
      console.error("ORDEM_SERVICO_PRINT_ERROR:", error);

      printWindow.document.open();
      printWindow.document.write(buildOrdemServicoPrintHtml(fallbackData));
      printWindow.document.close();
    } finally {
      setPrintingId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/70 text-left">
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                OS
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Cliente
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Financeiro
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Vendedor
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Datas
              </th>
              <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {ordensServico.map((os) => {
              const atrasada = isAtrasada(os);
              const isUpdating = isUpdatingId === os.id;
              const isPrinting = printingId === os.id;

              return (
                <tr
                  key={os.id}
                  className="border-b border-border/80 transition hover:bg-primary/[0.025]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-start gap-3">

                      <div>
                        <Link
                          href={`/admin/ordens-servico/${os.id}`}
                          className="font-black tracking-[-0.03em] text-dark-title hover:text-primary"
                        >
                          {os.numero_os || "OS sem número"}
                        </Link>

                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {os.tipo_os || "venda"}
                        </p>

                        {atrasada ? (
                          <p className="mt-2 text-xs font-black text-red-600">
                            Prazo estourou
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="max-w-[260px] truncate text-sm font-black text-dark-title">
                      {getClienteName(clientesById, os.cliente_id)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Total: {formatBRL(os.valor_total)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <OSStatusBadge status={os.status} atrasada={atrasada} />

                      <Select
                        value={os.status || "cadastrada"}
                        disabled={isUpdating}
                        onValueChange={(value) =>
                          onQuickUpdate(os, { status: value })
                        }
                      >
                        <SelectTrigger className="h-10 w-[210px] rounded-full border-border bg-background text-xs font-black">
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
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                      <div className="space-y-3">
                        <PagamentoStatusBadge status={os.status_pagamento} />

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating || moneyToNumber(os.valor_restante) <= 0}
                            onClick={() => handlePayRemaining(os)}
                            className="h-9 rounded-full px-3 text-xs font-black"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Quitou
                          </Button>

                          <Input
                            value={paymentInputs[os.id] || ""}
                            disabled={isUpdating}
                            onChange={(event) =>
                              updatePaymentInput(os.id, event.target.value)
                            }
                            placeholder="Pagou R$"
                            className="h-9 w-[118px] rounded-full border-border bg-background px-3 text-xs font-black"
                          />

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handlePayAmount(os)}
                            className="h-9 rounded-full px-3 text-xs font-black"
                          >
                            <CircleDollarSign className="size-3.5" />
                            Lançar
                          </Button>

                          {isUpdating ? (
                            <Loader2 className="size-4 animate-spin text-primary" />
                        ) : null}
                      </div>

                      <p className="text-xs font-semibold text-muted-foreground">
                        Entrada {formatBRL(os.valor_entrada)} • Resta{" "}
                        {formatBRL(os.valor_restante)}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="max-w-[180px] truncate text-sm font-black text-dark-title">
                      {getVendedorName(vendedoresById, os.vendedor_id)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1 text-xs font-semibold text-muted-foreground">
                      <p>
                        Venda:{" "}
                        <span className="font-black text-dark-title">
                          {formatDateBR(os.data_venda)}
                        </span>
                      </p>

                      <p>
                        Prazo:{" "}
                        <span className={atrasada ? "font-black text-red-600" : "font-black text-dark-title"}>
                          {formatDateBR(os.prazo_entrega_combinado)}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full font-black"
                      >
                        <Link href={`/admin/ordens-servico/${os.id}`}>
                          <Eye className="size-4" />
                          Abrir
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(os)}
                        className="rounded-full font-black"
                      >
                        <PencilLine className="size-4" />
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPrinting}
                        onClick={() => handlePrint(os)}
                        className="rounded-full font-black"
                      >
                        {isPrinting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Printer className="size-4" />
                        )}
                        Imprimir
                      </Button>

                      {canDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(os)}
                          className="rounded-full font-black"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ==========================================================================
   EMPTY
   ========================================================================== */

export function OrdensServicoEmptyState({ hasFilters = false }) {
  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <FileText className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {hasFilters ? "Nenhuma OS bateu com os filtros." : "Nenhuma OS cadastrada."}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "A busca ficou precisa demais. Limpe ou ajuste os filtros para reencontrar as ordens."
          : "Quando a primeira venda nascer no balcão, ela aparece aqui com status, pagamento e prazo no radar."}
      </p>
    </div>
  );
}

/* ==========================================================================
   FORM
   ========================================================================== */

export function OrdemServicoFormDialog({
  open,
  onOpenChange,
  ordemServico,
  receita,
  armacao,
  lente,
  clientes = [],
  vendedores = [],
  catalogoArmacoes = [],
  catalogoLentes = [],
  catalogoLaboratorios = [],
  onSubmit,
  isSaving = false,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true);
        }
      }}
    >
      {open ? (
        <OrdemServicoFormContent
          key={ordemServico?.id || "new"}
          ordemServico={ordemServico}
          receita={receita}
          armacao={armacao}
          lente={lente}
          clientes={clientes}
          vendedores={vendedores}
          catalogoArmacoes={catalogoArmacoes}
          catalogoLentes={catalogoLentes}
          catalogoLaboratorios={catalogoLaboratorios}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function OrdemServicoFormContent({
  ordemServico,
  receita,
  armacao,
  lente,
  clientes,
  vendedores,
  catalogoArmacoes,
  catalogoLentes,
  catalogoLaboratorios,
  onOpenChange,
  onSubmit,
  isSaving,
}) {
  const isEditing = Boolean(ordemServico?.id);

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  function requestClose() {
    setConfirmCloseOpen(true);
  }

  function confirmClose() {
    setConfirmCloseOpen(false);
    onOpenChange(false);
  }

  const [formData, setFormData] = useState(() => mapOrdemToForm(ordemServico));
  const [clienteRapido, setClienteRapido] = useState(emptyClienteRapido);
  const [useClienteRapido, setUseClienteRapido] = useState(false);
  const [isBuscandoCepCliente, setIsBuscandoCepCliente] = useState(false);

  const [receitaData, setReceitaData] = useState(() => getReceitaFormState(receita));
  const [armacaoData, setArmacaoData] = useState(() =>
    mapRelatedToForm(armacao, emptyArmacao)
  );
  const [lenteData, setLenteData] = useState(() =>
    mapRelatedToForm(lente, emptyLente)
  );

  useEffect(() => {
    // Defer state updates to avoid synchronous setState calls inside the effect
    // which can trigger cascading renders — update on next tick instead.
    const id = setTimeout(() => {
      setFormData(mapOrdemToForm(ordemServico));
      setReceitaData(getReceitaFormState(receita));
      setArmacaoData(mapRelatedToForm(armacao, emptyArmacao));
      setLenteData(mapRelatedToForm(lente, emptyLente));
    }, 0);

    return () => clearTimeout(id);
  }, [ordemServico, receita, armacao, lente]);

  const [errors, setErrors] = useState({});
  const receitaTypeCopy = getReceitaTypeCopy(receitaData.tipo_receita);
  const showAddition = shouldShowAddition(receitaData.tipo_receita);
  const showHeight = shouldShowHeight(receitaData.tipo_receita);

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        value: cliente.id,
        label: cliente.nome_completo,
        searchText: [
          cliente.nome_completo,
          cliente.nome_social,
          cliente.cpf,
          cliente.telefone_principal,
          cliente.telefone_secundario,
          cliente.email,
        ]
          .filter(Boolean)
          .join(" "),
        raw: cliente,
      })),
    [clientes]
  );

  const vendedorOptions = useMemo(
    () =>
      vendedores
        .filter((vendedor) => vendedor.status !== "inativo")
        .map((vendedor) => ({
          value: vendedor.id,
          label: vendedor.nome_exibicao || vendedor.nome_completo,
          searchText: [
            vendedor.nome_completo,
            vendedor.nome_exibicao,
            vendedor.cpf,
            vendedor.telefone,
            vendedor.email,
          ]
            .filter(Boolean)
            .join(" "),
          raw: vendedor,
        })),
    [vendedores]
  );

  const armacaoOptions = useMemo(
    () =>
      catalogoArmacoes.map((item) => ({
        value: item.id,
        label: getCatalogoArmacaoLabel(item),
        searchText: getCatalogoArmacaoLabel(item),
        raw: item,
      })),
    [catalogoArmacoes]
  );

  const lenteOptions = useMemo(
    () =>
      catalogoLentes.map((item) => ({
        value: item.id,
        label: getCatalogoLenteLabel(item),
        searchText: getCatalogoLenteLabel(item),
        raw: item,
      })),
    [catalogoLentes]
  );

  const laboratorioOptions = useMemo(
    () =>
      catalogoLaboratorios.map((item) => ({
        value: item.id,
        label: item.nome,
        searchText: [item.nome, item.telefone].filter(Boolean).join(" "),
        raw: item,
      })),
    [catalogoLaboratorios]
  );

  function updateForm(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  }

  function updateClienteRapido(field, value) {
    setClienteRapido((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[`cliente.${field}`]) {
      setErrors((current) => ({ ...current, [`cliente.${field}`]: "" }));
    }
  }

  async function buscarEnderecoClienteRapido() {
    const cepLimpo = clienteRapido.cep.replace(/\D/g, "");

    if (!cepLimpo) return;

    if (cepLimpo.length !== 8) {
      setErrors((current) => ({
        ...current,
        "cliente.cep": "Informe um CEP válido.",
      }));
      return;
    }

    setIsBuscandoCepCliente(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error("Falha ao buscar CEP.");
      }

      const data = await response.json();

      if (data.erro) {
        setErrors((current) => ({
          ...current,
          "cliente.cep": "CEP não encontrado.",
        }));
        return;
      }

      setClienteRapido((current) => {
        if (current.cep.replace(/\D/g, "") !== cepLimpo) return current;

        return {
          ...current,
          cep: data.cep || current.cep,
          rua: current.rua || data.logradouro || "",
          bairro: current.bairro || data.bairro || "",
          cidade: current.cidade || data.localidade || "",
          estado: current.estado || data.uf || "",
          pais: "Brasil",
        };
      });

      setErrors((current) => ({
        ...current,
        "cliente.cep": "",
      }));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        "cliente.cep": "Erro ao buscar CEP.",
      }));
    } finally {
      setIsBuscandoCepCliente(false);
    }
  }

  function updateReceita(field, value) {
    setReceitaData((current) => {
      const normalizedValue = receitaDecimalFields.has(field)
        ? normalizeOpticalDecimalInput(value)
        : receitaAxisFields.has(field)
          ? normalizeOpticalAxisInput(value)
          : value;

      const next = { ...current, [field]: normalizedValue };

      if (
        shouldShowAddition(next.tipo_receita) &&
        [
          "od_esferico",
          "od_adicao",
          "od_perto_esferico",
          "oe_esferico",
          "oe_adicao",
          "oe_perto_esferico",
        ].includes(field)
      ) {
        syncNearAndAddition(next, field.startsWith("od_") ? "od" : "oe", field);
      }

      if (
        (field === "dnp_od" || field === "dnp_oe") &&
        hasRecipeFieldValue(next.dnp_od) &&
        hasRecipeFieldValue(next.dnp_oe)
      ) {
        next.dp_total = formatOpticalMeasure(
          parseOpticalNumber(next.dnp_od) + parseOpticalNumber(next.dnp_oe)
        );
      } else if (field === "dnp_od" || field === "dnp_oe") {
        next.dp_total = "";
      }

      if (field === "tipo_receita" && !shouldShowAddition(value)) {
        next.od_adicao = "";
        next.od_perto_esferico = "";
        next.oe_adicao = "";
        next.oe_perto_esferico = "";
      }

      if (field === "tipo_receita" && shouldShowAddition(value)) {
        syncNearAndAddition(next, "od");
        syncNearAndAddition(next, "oe");
      }

      if (field === "tipo_receita" && !shouldShowHeight(value)) {
        next.altura_od = "";
        next.altura_oe = "";
      }

      return next;
    });

    if (field === "tipo_receita") {
      const tipoLenteSugerido = getTipoLenteFromReceita(value);

      if (tipoLenteSugerido) {
        setLenteData((current) => ({
          ...current,
          tipo_lente: current.tipo_lente || tipoLenteSugerido,
        }));
      }

      setErrors((current) => ({
        ...current,
        "receita.od_adicao": "",
        "receita.oe_adicao": "",
        "receita.altura_od": "",
        "receita.altura_oe": "",
      }));
    }

    if (errors[`receita.${field}`]) {
      setErrors((current) => ({ ...current, [`receita.${field}`]: "" }));
    }
  }

  function updateArmacao(field, value) {
    const nextValue = field === "custo" ? formatBRLInput(value) : value;

    setArmacaoData((current) => ({ ...current, [field]: nextValue }));

    if (field === "custo") {
      setFormData((current) => ({ ...current, custo_armacao: nextValue }));
    }
  }

  function updateLente(field, value) {
    const nextValue = field === "custo" ? formatBRLInput(value) : value;

    setLenteData((current) => ({ ...current, [field]: nextValue }));

    if (field === "custo") {
      setFormData((current) => ({ ...current, custo_lentes: nextValue }));
    }
  }

  function applyArmacaoCatalogo(_, item) {
    const selected = item.raw;

    setArmacaoData((current) => ({
      ...current,
      marca: selected.marca || "",
      modelo: selected.modelo || "",
      referencia: selected.referencia || "",
      codigo_interno: selected.codigo_interno || "",
      codigo_barras: selected.codigo_barras || "",
      cor: selected.cor || "",
      material: selected.material || "",
      formato: selected.formato || "",
      tamanho_texto: selected.tamanho_texto || "",
      aro: selected.aro || "",
      diagonal_maior: selected.diagonal_maior || "",
      ponte: selected.ponte || "",
      haste: selected.haste || "",
      largura_total: selected.largura_total || "",
      altura_lente: selected.altura_lente || "",
      tipo_armacao: selected.tipo_armacao || "",
      genero_indicado: selected.genero_indicado || "indefinido",
      custo: moneyToInput(selected.custo),
    }));

    setFormData((current) => ({
      ...current,
      custo_armacao: moneyToInput(selected.custo),
    }));
  }

  function applyLenteCatalogo(_, item) {
    const selected = item.raw;

    setLenteData((current) => ({
      ...current,
      tipo_lente: selected.tipo_lente || "",
      marca: selected.marca || "",
      linha: selected.linha || "",
      laboratorio: selected.laboratorio || "",
      material: selected.material || "",
      indice_refracao: selected.indice_refracao || "",
      tratamento_antirreflexo: selected.tratamento_antirreflexo || "",
      tratamento_filtro_azul: selected.tratamento_filtro_azul || false,
      tratamento_fotossensivel: selected.tratamento_fotossensivel || false,
      tratamento_polarizado: selected.tratamento_polarizado || false,
      tratamento_uv: selected.tratamento_uv || false,
      tratamento_risco: selected.tratamento_risco || false,
      coloracao: selected.coloracao || "",
      tonalidade: selected.tonalidade || "",
      curva_base: selected.curva_base || "",
      diametro: selected.diametro || "",
      garantia_meses: selected.garantia_meses || "",
      custo: moneyToInput(selected.custo),
    }));

    setFormData((current) => ({
      ...current,
      custo_lentes: moneyToInput(selected.custo),
    }));
  }

  function applyLaboratorioCatalogo(_, item) {
    const selected = item.raw;

    setFormData((current) => ({
      ...current,
      laboratorio_nome: selected.nome || "",
      telefone_laboratorio: formatPhoneInput(selected.telefone || ""),
    }));
  }

  function recalculateTotals(next = formData) {
    const valorArmacao = moneyToNumber(next.valor_armacao);
    const valorLentes = moneyToNumber(next.valor_lentes);
    const valorServicos = moneyToNumber(next.valor_servicos);
    const valorAdicionais = moneyToNumber(next.valor_adicionais);

    const bruto = valorArmacao + valorLentes + valorServicos + valorAdicionais;

    const desconto =
      next.desconto_tipo === "percentual"
        ? bruto * (Number(next.desconto_percentual || 0) / 100)
        : moneyToNumber(next.desconto_valor);

    const total = Math.max(bruto - desconto, 0);
    const entrada = moneyToNumber(next.valor_entrada);
    const restante = Math.max(total - entrada, 0);

    setFormData((current) => ({
      ...current,
      valor_total: moneyToInput(total),
      valor_restante: moneyToInput(restante),
      status_pagamento:
        total > 0 && restante <= 0
          ? "pago"
          : entrada > 0
            ? "parcial"
            : current.status_pagamento || "pendente",
    }));
  }

  function updateMoney(field, value, shouldRecalculate = true) {
    const formatted = formatBRLInput(value);

    setFormData((current) => {
      const next = { ...current, [field]: formatted };

      if (shouldRecalculate) {
        window.requestAnimationFrame(() => recalculateTotals(next));
      }

      return next;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!useClienteRapido && !formData.cliente_id) {
      nextErrors.cliente_id = "Selecione o cliente ou crie um novo.";
    }

    if (useClienteRapido) {
      if (!clienteRapido.nome_completo.trim()) {
        nextErrors["cliente.nome_completo"] = "Informe o nome do cliente.";
      }

      if (!clienteRapido.telefone_principal.trim()) {
        nextErrors["cliente.telefone_principal"] = "Informe o telefone.";
      }
    }

    if (!formData.vendedor_id) {
      nextErrors.vendedor_id = "Selecione o vendedor responsável.";
    }

    if (!formData.numero_os?.trim()) {
      nextErrors.numero_os = "Informe o número da OS.";
    }

    if (!formData.data_venda) {
      nextErrors.data_venda = "Informe a data da venda.";
    }

    if (!formData.prazo_entrega_dias) {
      nextErrors.prazo_entrega_dias = "Informe o prazo combinado em dias.";
    }

    if (hasRecipeData(receitaData)) {
      if (!receitaData.tipo_receita) {
        nextErrors["receita.tipo_receita"] =
          "Selecione a finalidade da lente para interpretar a receita.";
      }

      if (showAddition) {
        if (hasMainEyeData(receitaData, "od") && !receitaData.od_adicao) {
          nextErrors["receita.od_adicao"] =
            "Informe a adição do olho direito para este tipo de receita.";
        }

        if (hasMainEyeData(receitaData, "oe") && !receitaData.oe_adicao) {
          nextErrors["receita.oe_adicao"] =
            "Informe a adição do olho esquerdo para este tipo de receita.";
        }
      }

      if (showHeight) {
        if (hasMainEyeData(receitaData, "od") && !receitaData.altura_od) {
          nextErrors["receita.altura_od"] =
            "Informe a altura do olho direito para esta montagem.";
        }

        if (hasMainEyeData(receitaData, "oe") && !receitaData.altura_oe) {
          nextErrors["receita.altura_oe"] =
            "Informe a altura do olho esquerdo para esta montagem.";
        }
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const ordemPayload = getFormPayload(formData);

    if (useClienteRapido) {
      delete ordemPayload.cliente_id;
    }

    await onSubmit({
      ordemServico: {
        ...(ordemServico?.id ? { id: ordemServico.id } : {}),
        ...ordemPayload,
      },
      cliente: useClienteRapido ? clienteRapido : null,
      receita: normalizeReceitaPayload(receitaData),
      armacao: getRelatedPayload(armacaoData),
      lente: getRelatedPayload(lenteData),
    });
  }

  return (
    <>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="flex max-h-[94vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-7xl [&>button]:hidden"
      >
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={requestClose}
          disabled={isSaving}
          className="absolute right-5 top-5 rounded-full"
        >
          <X className="size-5" />
          <span className="sr-only">Fechar</span>
        </Button>
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar ordem de serviço" : "Nova ordem de serviço"}
        </DialogTitle>

        <DialogDescription className="text-sm font-medium text-muted-foreground">
          Formulário completo, dividido por blocos para ninguém se perder no balcão.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <FormSection
              icon={UserRoundPlus}
              title="Identificação"
              description="Cliente, vendedor, status e datas principais."
            >
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                <SearchSelect
                  label="Cliente"
                  value={formData.cliente_id}
                  options={clienteOptions}
                  placeholder="Selecione um cliente"
                  searchPlaceholder="Buscar por nome, CPF, telefone..."
                  disabled={useClienteRapido || isEditing}
                  onChange={(value) => updateForm("cliente_id", value)}
                  getOptionLabel={(item) => item.label}
                  getOptionDescription={(item) =>
                    item.raw?.telefone_principal || item.raw?.cpf || "Sem contato"
                  }
                  error={errors.cliente_id}
                  action={
                    !isEditing ? (
                      <Button
                        type="button"
                        variant={useClienteRapido ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setUseClienteRapido((current) => !current);
                          updateForm("cliente_id", "");
                        }}
                        className="h-8 rounded-full px-3 text-xs font-black"
                      >
                        <Plus className="size-3.5" />
                        {useClienteRapido ? "Usar existente" : "Criar cliente"}
                      </Button>
                    ) : null
                  }
                />
                <div className="mt-3">
                  <SearchSelect
                    label="Vendedor responsável"
                    value={formData.vendedor_id}
                    options={vendedorOptions}
                    placeholder="Selecione o vendedor"
                    searchPlaceholder="Buscar vendedor..."
                    disabled={isEditing}
                    onChange={(value) => updateForm("vendedor_id", value)}
                    getOptionLabel={(item) => item.label}
                    getOptionDescription={(item) =>
                      item.raw?.telefone || item.raw?.email || item.raw?.cargo
                    }
                    error={errors.vendedor_id}
                  />
                </div>
              </div>

              {useClienteRapido ? (
                <div className="rounded-[30px] border border-primary/20 bg-primary/[0.035] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <UserRoundPlus className="size-5 text-primary" />
                    <h4 className="text-base font-black tracking-[-0.035em] text-dark-title">
                      Criar cliente nesta OS
                    </h4>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InputField
                      label="Nome completo"
                      value={clienteRapido.nome_completo}
                      onChange={(value) =>
                        updateClienteRapido("nome_completo", value)
                      }
                      error={errors["cliente.nome_completo"]}
                    />

                    <InputField
                      label="WhatsApp / telefone"
                      value={clienteRapido.telefone_principal}
                      onChange={(value) =>
                        updateClienteRapido(
                          "telefone_principal",
                          formatPhoneInput(value)
                        )
                      }
                      error={errors["cliente.telefone_principal"]}
                    />

                    <InputField
                      label="CPF"
                      value={clienteRapido.cpf}
                      onChange={(value) =>
                        updateClienteRapido("cpf", formatCPFInput(value))
                      }
                    />

                    <InputField
                      label="E-mail"
                      value={clienteRapido.email}
                      onChange={(value) => updateClienteRapido("email", value)}
                    />

                    <InputField
                      label="CEP"
                      value={clienteRapido.cep}
                      onChange={(value) =>
                        updateClienteRapido("cep", formatCEPInput(value))
                      }
                      onBlur={buscarEnderecoClienteRapido}
                      placeholder="00000-000"
                      disabled={isBuscandoCepCliente}
                      description={
                        isBuscandoCepCliente ? "Buscando endereço..." : undefined
                      }
                      error={errors["cliente.cep"]}
                    />

                    <InputField
                      label="Rua"
                      value={clienteRapido.rua}
                      onChange={(value) => updateClienteRapido("rua", value)}
                    />

                    <InputField
                      label="Número"
                      value={clienteRapido.numero}
                      onChange={(value) => updateClienteRapido("numero", value)}
                    />

                    <InputField
                      label="Bairro"
                      value={clienteRapido.bairro}
                      onChange={(value) => updateClienteRapido("bairro", value)}
                    />

                    <InputField
                      label="Cidade"
                      value={clienteRapido.cidade}
                      onChange={(value) => updateClienteRapido("cidade", value)}
                    />

                    <InputField
                      label="Estado"
                      value={clienteRapido.estado}
                      onChange={(value) => updateClienteRapido("estado", value)}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Número da OS"
                  value={formData.numero_os}
                  onChange={(value) => updateForm("numero_os", value)}
                  error={errors.numero_os}
                />

                <SelectField
                  label="Tipo"
                  value={formData.tipo_os}
                  onChange={(value) => updateForm("tipo_os", value)}
                  options={tipoOsOptions}
                />

                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(value) => updateForm("status", value)}
                  options={osStatusOptions}
                />

                <InputField
                  label="Data da venda"
                  type="date"
                  value={formData.data_venda}
                  onChange={(value) => updateForm("data_venda", value)}
                  error={errors.data_venda}
                />

                <InputField
                  label="Prazo entrega (dias)"
                  type="number"
                  value={formData.prazo_entrega_dias}
                  onChange={(value) =>
                    updateForm("prazo_entrega_dias", normalizeDaysInput(value))
                  }
                  error={errors.prazo_entrega_dias}
                  description={
                    formData.data_venda && formData.prazo_entrega_dias
                      ? `Entrega prevista: ${formatDateBR(
                          addDaysToInputDate(formData.data_venda, formData.prazo_entrega_dias)
                        )}`
                      : "Informe em dias após a venda."
                  }
                />

                <InputField
                  label="Número NF"
                  value={formData.numero_nf}
                  onChange={(value) =>
                    updateForm("numero_nf", value)
                  }
                />

                <div className="min-w-0 md:col-span-2 xl:col-span-5">
                  <SearchSelect
                    label="Buscar laboratório no catálogo"
                    value=""
                    options={laboratorioOptions}
                    placeholder="Pesquisar e preencher pelo laboratório salvo"
                    searchPlaceholder="Nome ou telefone do laboratório..."
                    onChange={applyLaboratorioCatalogo}
                    getOptionLabel={(item) => item.label}
                    getOptionDescription={(item) =>
                      item.raw?.telefone
                        ? `Tel: ${formatPhoneInput(item.raw.telefone)}`
                        : "Catálogo da conta"
                    }
                  />
                </div>

                <InputField
                  label="Número pedido lab."
                  value={formData.pedido_laboratorio_numero}
                  onChange={(value) =>
                    updateForm("pedido_laboratorio_numero", value)
                  }
                />

                <InputField
                  label="Laboratório"
                  value={formData.laboratorio_nome}
                  onChange={(value) => updateForm("laboratorio_nome", value)}
                />

                <InputField
                  label="Tel. Laboratório"
                  value={formData.telefone_laboratorio}
                  onChange={(value) =>
                    updateForm("telefone_laboratorio", formatPhoneInput(value))
                  }
                />

                <InputField
                  label="Prazo laboratório (dias)"
                  type="number"
                  value={formData.prazo_laboratorio_dias}
                  onChange={(value) =>
                    updateForm("prazo_laboratorio_dias", normalizeDaysInput(value))
                  }
                  description={
                    formData.data_venda && formData.prazo_laboratorio_dias
                      ? `Retorno previsto: ${formatDateBR(
                          addDaysToInputDate(formData.data_venda, formData.prazo_laboratorio_dias)
                        )}`
                      : "Informe em dias após a venda."
                  }
                />
              </div>
            </FormSection>

            <FormSection
              icon={ReceiptText}
              title="Receita"
              description="Dados ópticos e informações do médico."
            >
              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-5 [&>*]:min-w-0">
                <InputField
                  label="Data da receita"
                  type="date"
                  value={receitaData.data_receita}
                  onChange={(value) => updateReceita("data_receita", value)}
                />

                <InputField
                  label="Médico"
                  value={receitaData.medico_nome}
                  onChange={(value) => updateReceita("medico_nome", value)}
                />

                <InputField
                  label="CRM"
                  value={receitaData.medico_crm}
                  onChange={(value) => updateReceita("medico_crm", value)}
                />

                <SelectField
                  label="Finalidade da lente"
                  value={receitaData.tipo_receita}
                  onChange={(value) => updateReceita("tipo_receita", value)}
                  options={tipoReceitaOptions}
                  allowEmpty
                  error={errors["receita.tipo_receita"]}
                />

                <InputField
                  label="Validade"
                  type="date"
                  value={receitaData.validade_receita}
                  onChange={(value) => updateReceita("validade_receita", value)}
                />
              </div>

              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                <OpticalEyeBlock
                  title="Olho direito"
                  prefix="od"
                  data={receitaData}
                  onChange={updateReceita}
                  showAddition={showAddition}
                  modeLabel={
                    receitaData.tipo_receita === "perto"
                      ? "Grau final de perto"
                      : "Grau base informado na receita"
                  }
                  errors={errors}
                />

                <OpticalEyeBlock
                  title="Olho esquerdo"
                  prefix="oe"
                  data={receitaData}
                  onChange={updateReceita}
                  showAddition={showAddition}
                  modeLabel={
                    receitaData.tipo_receita === "perto"
                      ? "Grau final de perto"
                      : "Grau base informado na receita"
                  }
                  errors={errors}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="DNP OD"
                  value={receitaData.dnp_od}
                  onChange={(value) => updateReceita("dnp_od", value)}
                  description={receitaTypeCopy.dpLabel}
                />

                <InputField
                  label="DNP OE"
                  value={receitaData.dnp_oe}
                  onChange={(value) => updateReceita("dnp_oe", value)}
                  description={receitaTypeCopy.dpLabel}
                />

                <InputField
                  label="DP total"
                  value={receitaData.dp_total}
                  onChange={(value) => updateReceita("dp_total", value)}
                  description="Calculado automaticamente."
                />

                {showHeight ? (
                  <>
                    <InputField
                      label="Altura OD"
                      value={receitaData.altura_od}
                      onChange={(value) => updateReceita("altura_od", value)}
                      error={errors["receita.altura_od"]}
                      description="Obrigatória para esta montagem."
                    />

                    <InputField
                      label="Altura OE"
                      value={receitaData.altura_oe}
                      onChange={(value) => updateReceita("altura_oe", value)}
                      error={errors["receita.altura_oe"]}
                      description="Obrigatória para esta montagem."
                    />
                  </>
                ) : null}
              </div>

              <TextareaField
                label="Observações da receita"
                value={receitaData.observacoes}
                onChange={(value) => updateReceita("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Glasses}
              title="Armação"
              description="Selecione do catálogo ou preencha manualmente."
            >
              <SearchSelect
                label="Buscar armação no catálogo"
                value=""
                options={armacaoOptions}
                placeholder="Pesquisar e preencher pela armação salva"
                searchPlaceholder="Marca, modelo, cor, código..."
                onChange={applyArmacaoCatalogo}
                getOptionLabel={(item) => item.label}
                getOptionDescription={(item) =>
                  item.raw?.ultimo_uso_em
                    ? `Último uso: ${formatDateBR(item.raw.ultimo_uso_em)}`
                    : "Catálogo da conta"
                }
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Marca"
                  value={armacaoData.marca}
                  onChange={(value) => updateArmacao("marca", value)}
                />

                <InputField
                  label="Modelo"
                  value={armacaoData.modelo}
                  onChange={(value) => updateArmacao("modelo", value)}
                />

                <InputField
                  label="Cor"
                  value={armacaoData.cor}
                  onChange={(value) => updateArmacao("cor", value)}
                />

                <InputField
                  label="Código interno"
                  value={armacaoData.codigo_interno}
                  onChange={(value) => updateArmacao("codigo_interno", value)}
                />

                <SelectField
                  label="Tipo"
                  value={armacaoData.tipo_armacao}
                  onChange={(value) => updateArmacao("tipo_armacao", value)}
                  options={tipoArmacaoOptions}
                  allowEmpty
                />

                <InputField
                  label="Vertical"
                  value={armacaoData.tamanho_texto}
                  onChange={(value) => updateArmacao("tamanho_texto", value)}
                />

                <InputField
                  label="Horizontal"
                  value={armacaoData.aro}
                  onChange={(value) => updateArmacao("aro", value)}
                />

                <InputField
                  label="Diagonal Maior"
                  value={armacaoData.diagonal_maior}
                  onChange={(value) => updateArmacao("diagonal_maior", value)}
                />

                <InputField
                  label="Ponte"
                  value={armacaoData.ponte}
                  onChange={(value) => updateArmacao("ponte", value)}
                />

                <InputField
                  label="Haste"
                  value={armacaoData.haste}
                  onChange={(value) => updateArmacao("haste", value)}
                />

                <InputField
                  label="Custo"
                  value={armacaoData.custo}
                  onChange={(value) => updateArmacao("custo", value)}
                />
              </div>

              <TextareaField
                label="Observações da armação"
                value={armacaoData.observacoes}
                onChange={(value) => updateArmacao("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Glasses}
              title="Lente"
              description="Catálogo para acelerar o preenchimento e evitar retrabalho."
            >
              <SearchSelect
                label="Buscar lente no catálogo"
                value=""
                options={lenteOptions}
                placeholder="Pesquisar e preencher pela lente salva"
                searchPlaceholder="Marca, linha, tipo, material..."
                onChange={applyLenteCatalogo}
                getOptionLabel={(item) => item.label}
                getOptionDescription={(item) =>
                  item.raw?.laboratorio || "Catálogo da conta"
                }
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SelectField
                  label="Tipo de lente"
                  value={lenteData.tipo_lente}
                  onChange={(value) => updateLente("tipo_lente", value)}
                  options={tipoLenteOptions}
                  allowEmpty
                />

                <InputField
                  label="Marca"
                  value={lenteData.marca}
                  onChange={(value) => updateLente("marca", value)}
                />

                <InputField
                  label="Linha"
                  value={lenteData.linha}
                  onChange={(value) => updateLente("linha", value)}
                />

                <InputField
                  label="Laboratório"
                  value={lenteData.laboratorio}
                  onChange={(value) => updateLente("laboratorio", value)}
                />

                <SelectField
                  label="Material"
                  value={lenteData.material}
                  onChange={(value) => updateLente("material", value)}
                  options={lenteMaterialOptions}
                  allowEmpty
                />

                <InputField
                  label="Índice"
                  value={lenteData.indice_refracao}
                  onChange={(value) => updateLente("indice_refracao", value)}
                />

                <InputField
                  label="Coloração"
                  value={lenteData.coloracao}
                  onChange={(value) => updateLente("coloracao", value)}
                />

                <InputField
                  label="Tonalidade"
                  value={lenteData.tonalidade}
                  onChange={(value) => updateLente("tonalidade", value)}
                />

                <InputField
                  label="Diâmetro"
                  value={lenteData.diametro}
                  onChange={(value) => updateLente("diametro", value)}
                />

                <InputField
                  label="Garantia meses"
                  value={lenteData.garantia_meses}
                  onChange={(value) => updateLente("garantia_meses", value)}
                />

                <InputField
                  label="Custo da lente"
                  value={lenteData.custo}
                  onChange={(value) => updateLente("custo", value)}
                />

                <InputField
                  label="Antirreflexo"
                  value={lenteData.tratamento_antirreflexo}
                  onChange={(value) =>
                    updateLente("tratamento_antirreflexo", value)
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                

                <CheckField
                  label="Filtro azul"
                  checked={lenteData.tratamento_filtro_azul}
                  onChange={(value) =>
                    updateLente("tratamento_filtro_azul", value)
                  }
                />

                <CheckField
                  label="Fotossensível"
                  checked={lenteData.tratamento_fotossensivel}
                  onChange={(value) =>
                    updateLente("tratamento_fotossensivel", value)
                  }
                />

                <CheckField
                  label="Polarizada"
                  checked={lenteData.tratamento_polarizado}
                  onChange={(value) =>
                    updateLente("tratamento_polarizado", value)
                  }
                />

                <CheckField
                  label="UV"
                  checked={lenteData.tratamento_uv}
                  onChange={(value) => updateLente("tratamento_uv", value)}
                />

                <CheckField
                  label="Resistente a risco"
                  checked={lenteData.tratamento_risco}
                  onChange={(value) => updateLente("tratamento_risco", value)}
                />
              </div>

              <TextareaField
                label="Observações da lente"
                value={lenteData.observacoes}
                onChange={(value) => updateLente("observacoes", value)}
              />
            </FormSection>

            <FormSection
              icon={Banknote}
              title="Financeiro"
              description="Entrada, restante e status financeiro rápido."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InputField
                  label="Valor armação"
                  value={formData.valor_armacao}
                  onChange={(value) => updateMoney("valor_armacao", value)}
                />

                <InputField
                  label="Valor lentes"
                  value={formData.valor_lentes}
                  onChange={(value) => updateMoney("valor_lentes", value)}
                />

                <InputField
                  label="Serviços"
                  value={formData.valor_servicos}
                  onChange={(value) => updateMoney("valor_servicos", value)}
                />

                <InputField
                  label="Adicionais"
                  value={formData.valor_adicionais}
                  onChange={(value) => updateMoney("valor_adicionais", value)}
                />

                <SelectField
                  label="Desconto"
                  value={formData.desconto_tipo}
                  onChange={(value) => {
                    updateForm("desconto_tipo", value);
                    window.requestAnimationFrame(() =>
                      recalculateTotals({ ...formData, desconto_tipo: value })
                    );
                  }}
                  options={[
                    { value: "valor", label: "Valor" },
                    { value: "percentual", label: "Percentual" },
                  ]}
                />

                {formData.desconto_tipo === "percentual" ? (
                  <InputField
                    label="Desconto %"
                    value={formData.desconto_percentual}
                    onChange={(value) => {
                      updateForm("desconto_percentual", value);
                      window.requestAnimationFrame(() =>
                        recalculateTotals({
                          ...formData,
                          desconto_percentual: value,
                        })
                      );
                    }}
                  />
                ) : (
                  <InputField
                    label="Desconto R$"
                    value={formData.desconto_valor}
                    onChange={(value) => updateMoney("desconto_valor", value)}
                  />
                )}

                <InputField
                  label="Total"
                  value={formData.valor_total}
                  onChange={(value) => updateMoney("valor_total", value, false)}
                />

                <InputField
                  label="Entrada"
                  value={formData.valor_entrada}
                  onChange={(value) => updateMoney("valor_entrada", value)}
                />

                <InputField
                  label="Restante"
                  value={formData.valor_restante}
                  onChange={(value) => updateMoney("valor_restante", value, false)}
                />

                <SelectField
                  label="Status pagamento"
                  value={formData.status_pagamento}
                  onChange={(value) => updateForm("status_pagamento", value)}
                  options={pagamentoStatusOptions}
                />

                <SelectField
                  label="Forma"
                  value={formData.forma_pagamento}
                  onChange={(value) => updateForm("forma_pagamento", value)}
                  options={formaPagamentoOptions}
                  allowEmpty
                />

                <InputField
                  label="Parcelas"
                  value={formData.quantidade_parcelas}
                  onChange={(value) => updateForm("quantidade_parcelas", value)}
                />

                <InputField
                  label="Valor parcela"
                  value={formData.valor_parcela}
                  onChange={(value) => updateMoney("valor_parcela", value, false)}
                />
              </div>
            </FormSection>

            <FormSection
              icon={FileText}
              title="Observações"
              description="Informações visíveis ao cliente e anotações internas."
            >
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                <TextareaField
                  label="Observações para o cliente"
                  value={formData.observacoes_cliente}
                  onChange={(value) => updateForm("observacoes_cliente", value)}
                />

                <TextareaField
                  label="Observações internas"
                  value={formData.observacoes_internas}
                  onChange={(value) => updateForm("observacoes_internas", value)}
                />
              </div>
            </FormSection>
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
            className="h-12 rounded-full px-7 mb-4 font-black"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Criar OS"
            )}
          </Button>
        </DialogFooter>
      </form>
        </DialogContent>

        <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
          <AlertDialogContent className="rounded-[32px] border-border bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black tracking-[-0.04em] text-dark-title">
                Fechar formulário?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                Se você fechar agora, as informações preenchidas que ainda não foram salvas serão perdidas.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full font-black">
                Continuar preenchendo
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={confirmClose}
                className="rounded-full bg-red-600 font-black text-white hover:bg-red-700"
              >
                Fechar sem salvar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
}

/* ==========================================================================
   BLOQUINHOS DE FORM
   ========================================================================== */

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[34px] border border-border bg-background/55 p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[18px] bg-primary/[0.08] text-primary">
          <Icon className="size-5" />
        </div>

        <div>
          <h3 className="text-lg font-black tracking-[-0.045em] text-dark-title">
            {title}
          </h3>

          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-black text-dark-title">{label}</p>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  error,
  description,
  placeholder,
  onBlur,
  disabled = false,
}) {
  return (
    <FieldBlock label={label}>
      <Input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-12 rounded-2xl border-border bg-background ${
          error ? "border-red-300" : ""
        }`}
      />

      {description ? (
        <p className="text-xs font-semibold text-muted-foreground">{description}</p>
      ) : null}

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}
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

function SelectField({
  label,
  value,
  onChange,
  options = [],
  allowEmpty = false,
  error,
}) {
  const safeValue = value || (allowEmpty ? "__empty" : options[0]?.value || "");

  return (
    <FieldBlock label={label}>
      <Select
        value={safeValue}
        onValueChange={(nextValue) =>
          onChange(nextValue === "__empty" ? "" : nextValue)
        }
      >
        <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty">Não informado</SelectItem> : null}

          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </FieldBlock>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-2xl border px-4 text-sm font-black transition ${
        checked
          ? "border-primary/30 bg-primary/[0.08] text-primary"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {label}
      <span
        className={`grid size-5 place-items-center rounded-full border ${
          checked ? "border-primary bg-primary text-white" : "border-border"
        }`}
      >
        {checked ? <CheckCircle2 className="size-3.5" /> : null}
      </span>
    </button>
  );
}

function OpticalEyeBlock({
  title,
  prefix,
  data,
  onChange,
  showAddition = true,
  modeLabel = "",
  errors = {},
}) {
  const nearSphere = getRecipeNearSphereValue(data, prefix);
  const primaryVisionLabel = data?.tipo_receita === "perto" ? "Perto" : "Longe";

  return (
    <div className="rounded-[28px] border border-border bg-card p-4">
      <div className="mb-4">
        <h4 className="text-base font-black tracking-[-0.035em] text-dark-title">
          {title}
        </h4>

        {modeLabel ? (
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {modeLabel}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] border border-border bg-background p-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
            <p className="text-sm font-black text-primary">
              {primaryVisionLabel}
            </p>

            <p className="text-xs font-bold text-muted-foreground">
              Grau principal
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MobileOpticalField
              label="Esférico"
              value={data[`${prefix}_esferico`]}
              onChangeValue={(value) => onChange(`${prefix}_esferico`, value)}
            />

            <MobileOpticalField
              label="Cilíndrico"
              value={data[`${prefix}_cilindrico`]}
              onChangeValue={(value) => onChange(`${prefix}_cilindrico`, value)}
            />

            <MobileOpticalField
              label="Eixo"
              value={data[`${prefix}_eixo`]}
              onChangeValue={(value) => onChange(`${prefix}_eixo`, value)}
            />

            {showAddition ? (
              <MobileOpticalField
                label="Adição"
                value={data[`${prefix}_adicao`]}
                onChangeValue={(value) => onChange(`${prefix}_adicao`, value)}
                error={Boolean(errors[`receita.${prefix}_adicao`])}
              />
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-black uppercase tracking-[0.10em] text-muted-foreground">
                  Adição
                </p>

                <div className="flex h-11 items-center rounded-2xl border border-dashed border-border px-4 text-sm font-semibold text-muted-foreground">
                  Sem adição
                </div>
              </div>
            )}
          </div>
        </div>

        {showAddition ? (
          <div className="rounded-[24px] border border-border bg-primary/[0.025] p-4">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
              <p className="text-sm font-black text-primary">Perto</p>

              <p className="text-xs font-bold text-muted-foreground">
                Calculado pela adição
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MobileOpticalField
                label="Esférico perto"
                value={nearSphere}
                onChangeValue={(value) =>
                  onChange(getNearSphereField(prefix), value)
                }
              />

              <MobileOpticalField
                label="Cilíndrico"
                value={data[`${prefix}_cilindrico`]}
                disabled
              />

              <MobileOpticalField
                label="Eixo"
                value={data[`${prefix}_eixo`]}
                disabled
              />
            </div>
          </div>
        ) : null}

        {errors[`receita.${prefix}_adicao`] ? (
          <p className="text-xs font-bold text-red-600">
            {errors[`receita.${prefix}_adicao`]}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Prisma"
            value={data[`${prefix}_prisma`]}
            onChange={(value) => onChange(`${prefix}_prisma`, value)}
          />

          <InputField
            label="Base"
            value={data[`${prefix}_base`]}
            onChange={(value) => onChange(`${prefix}_base`, value)}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

export function OrdensServicoPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <section className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-4 shadow-[0_24px_65px_-58px_rgba(15,23,42,0.36)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Mostrando {start} a {end} de {totalItems} OS
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">Ver</span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-11 w-[96px] rounded-full border-border bg-background">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-11 rounded-full px-4 font-black"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        <span className="rounded-full bg-primary/[0.08] px-4 py-2 text-sm font-black text-primary">
          {page} / {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-11 rounded-full px-4 font-black"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================
   CONFIRMAÇÃO DELETE
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
            . Isso remove o registro principal e seus vínculos. Use só quando for erro
            real de cadastro.
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

function MobileOpticalField({
    label,
    value,
    onChangeValue,
    disabled = false,
    error = false,
    placeholder = "",
  }) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-black uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </p>

        <Input
          value={value || ""}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChangeValue?.(event.target.value)}
          className={`h-11 rounded-2xl border-border bg-background text-sm font-semibold ${
            disabled ? "bg-muted/35 text-muted-foreground" : ""
          } ${error ? "border-red-300" : ""}`}
        />
      </div>
    );
  }