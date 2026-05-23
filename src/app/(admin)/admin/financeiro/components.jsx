"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Landmark,
  Loader2,
  PencilLine,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const pageSizeOptions = [15, 30, 50, 100];

const viewOptions = [
  {
    value: "extrato",
    label: "Extrato",
    icon: Receipt,
  },
  {
    value: "caixa",
    label: "Livro caixa",
    icon: Landmark,
  },
  {
    value: "dre",
    label: "DRE",
    icon: BarChart3,
  },
  {
    value: "categorias",
    label: "Categorias",
    icon: Tags,
  },
];

const periodoOptions = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "ano_atual", label: "Ano atual" },
  { value: "todos", label: "Todo o histórico" },
  { value: "personalizado", label: "Personalizado" },
];

const tipoLancamentoLabels = {
  receita: "Receita",
  despesa: "Despesa",
};

const grupoDreLabels = {
  receita_operacional: "Receita operacional",
  deducao_receita: "Deduções da receita",
  custo_direto: "Custo direto",
  despesa_operacional: "Despesa operacional",
  resultado_nao_operacional: "Resultado não operacional",
};

const grupoDreOptionsByTipo = {
  receita: ["receita_operacional", "resultado_nao_operacional"],
  despesa: [
    "deducao_receita",
    "custo_direto",
    "despesa_operacional",
    "resultado_nao_operacional",
  ],
};

function isCategoriaDreCompativel(tipoLancamento, grupoDre) {
  return Boolean(grupoDreOptionsByTipo[tipoLancamento]?.includes(grupoDre));
}

function getDefaultGrupoDre(tipoLancamento) {
  return tipoLancamento === "receita" ? "receita_operacional" : "despesa_operacional";
}

const statusLabels = {
  previsto: "Previsto",
  pago: "Pago",
  vencido: "Vencido",
  cancelado: "Cancelado",
  competencia: "Competência",
};

const formaPagamentoLabels = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
  boleto: "Boleto",
  transferencia: "Transferência",
  crediario: "Crediário",
  outro: "Outro",
};

const emptyLancamentoForm = {
  categoria_id: "",
  origem: "manual",
  os_id: "",
  descricao: "",
  valor: "",
  data_competencia: getTodayInputValue(),
  data_vencimento: "",
  data_pagamento: "",
  status: "previsto",
  forma_pagamento: "",
  observacoes: "",
};

const emptyCategoriaForm = {
  nome: "",
  tipo_lancamento: "despesa",
  grupo_dre: "despesa_operacional",
  ativo: true,
};

const emptyFilters = {
  search: "",
  periodo: "mes_atual",
  dataInicio: "",
  dataFim: "",
  tipo: "todos",
  status: "todos",
  formaPagamento: "todos",
  grupoDre: "todos",
  origem: "todos",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function getTodayInputValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toNumber(value = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const clean = value
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const parsed = Number(clean);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDateBR(value) {
  const date = parseDate(value);

  if (!date) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateTimeBR(value) {
  const date = parseDate(value);

  if (!date) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function parseDate(value) {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  if (!date) return null;

  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function endOfDay(date) {
  if (!date) return null;

  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);

  return copy;
}

function getPeriodRange(period, dataInicio, dataFim) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "mes_atual") {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    };
  }

  if (period === "mes_anterior") {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0),
    };
  }

  if (period === "ano_atual") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
  }

  if (period === "personalizado") {
    return {
      start: dataInicio ? parseDate(dataInicio) : null,
      end: dataFim ? parseDate(dataFim) : null,
    };
  }

  return {
    start: null,
    end: null,
  };
}

function isDateInsidePeriod(value, filters) {
  const date = parseDate(value);

  if (!date) return false;

  const { start, end } = getPeriodRange(
    filters.periodo,
    filters.dataInicio,
    filters.dataFim
  );

  if (start && date < startOfDay(start)) return false;
  if (end && date > endOfDay(end)) return false;

  return true;
}

function sumBy(items = [], getter) {
  return items.reduce((total, item) => {
    return total + (Number(getter(item)) || 0);
  }, 0);
}

function getCategoriaById(categorias = []) {
  return categorias.reduce((acc, categoria) => {
    acc[categoria.id] = categoria;
    return acc;
  }, {});
}

function getClienteById(clientes = []) {
  return clientes.reduce((acc, cliente) => {
    acc[cliente.id] = cliente;
    return acc;
  }, {});
}

function getVendedorById(vendedores = []) {
  return vendedores.reduce((acc, vendedor) => {
    acc[vendedor.id] = vendedor;
    return acc;
  }, {});
}

function getOsById(ordens = []) {
  return ordens.reduce((acc, os) => {
    acc[os.id] = os;
    return acc;
  }, {});
}

function getSignalByType(tipo) {
  return tipo === "receita" ? 1 : -1;
}

function getSignedValue(row) {
  return getSignalByType(row.tipo_lancamento) * toNumber(row.valor);
}

function applyCommonFilters(rows, filters, options = {}) {
  const search = normalizeText(filters.search);
  const { ignoreStatus = false, ignoreFormaPagamento = false } = options;

  return rows.filter((row) => {
    if (row.data_referencia && !isDateInsidePeriod(row.data_referencia, filters)) {
      return false;
    }

    if (filters.tipo !== "todos" && row.tipo_lancamento !== filters.tipo) {
      return false;
    }

    if (!ignoreStatus && filters.status !== "todos" && row.status !== filters.status) {
      return false;
    }

    if (
      !ignoreFormaPagamento &&
      filters.formaPagamento !== "todos" &&
      row.forma_pagamento !== filters.formaPagamento
    ) {
      return false;
    }

    if (filters.grupoDre !== "todos" && row.grupo_dre !== filters.grupoDre) {
      return false;
    }

    if (filters.origem !== "todos" && row.origem !== filters.origem) {
      return false;
    }

    if (!search) return true;

    const haystack = normalizeText(
      [
        row.descricao,
        row.categoria_nome,
        row.categoria,
        row.numero_os,
        row.cliente_nome,
        row.vendedor_nome,
        row.status,
        row.forma_pagamento,
        row.grupo_dre,
        row.origem,
        row.observacoes,
      ]
        .filter(Boolean)
        .join(" ")
    );

    return haystack.includes(search);
  });
}

function paginate(items, page, pageSize) {
  const totalPages = Math.max(Math.ceil(items.length / pageSize), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function exportRowsToExcel({ filename, sheetName, columns, rows }) {
  const tableHead = columns
    .map((column) => `<th>${htmlEscape(column.label)}</th>`)
    .join("");

  const tableRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          const rawValue =
            typeof column.value === "function"
              ? column.value(row)
              : row[column.value];

          return `<td>${htmlEscape(rawValue ?? "")}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table>
          <caption>${htmlEscape(sheetName)}</caption>
          <thead>
            <tr>${tableHead}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function getLancamentoInitialForm(lancamento) {
  if (!lancamento) return emptyLancamentoForm;

  return {
    categoria_id: lancamento.categoria_id || "",
    origem: lancamento.origem || "manual",
    os_id: lancamento.os_id || "",
    descricao: lancamento.descricao || "",
    valor: String(lancamento.valor ?? ""),
    data_competencia: lancamento.data_competencia || getTodayInputValue(),
    data_vencimento: lancamento.data_vencimento || "",
    data_pagamento: lancamento.data_pagamento || "",
    status: lancamento.status || "previsto",
    forma_pagamento: lancamento.forma_pagamento || "",
    observacoes: lancamento.observacoes || "",
  };
}

function getCategoriaInitialForm(categoria) {
  if (!categoria) return emptyCategoriaForm;

  return {
    nome: categoria.nome || "",
    tipo_lancamento: categoria.tipo_lancamento || "despesa",
    grupo_dre: categoria.grupo_dre || "despesa_operacional",
    ativo: categoria.ativo ?? true,
  };
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
   ========================================================================== */

export default function AdminFinanceiroComponents() {
  const [data, setData] = useState({
    usuario: null,
    conta: null,
    configuracoes_conta: null,
    categorias_financeiras: [],
    lancamentos_financeiros: [],
    ordens_servico: [],
    clientes: [],
    vendedores: [],
    armacoes: [],
    lentes: [],
    financeiro_dre_base: [],
  });

  const [activeView, setActiveView] = useState("extrato");
  const [filters, setFilters] = useState(emptyFilters);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [lancamentoDialogOpen, setLancamentoDialogOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState(null);

  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadFinanceiro() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/financeiro", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível carregar o financeiro.");
      }

      setData(payload.data || {});
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      setErrorMessage(error.message || "Erro ao carregar financeiro.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Wrap the async call in a function to avoid calling setState synchronously
    const fetchData = async () => {
      await loadFinanceiro();
    };
    fetchData();
  }, []);

  

  // ... (rest of your imports)

  const prevDepsRef = useRef({ activeView, filters, pageSize });

  useEffect(() => {
    const prev = prevDepsRef.current;
    if (
      prev.activeView !== activeView ||
      prev.pageSize !== pageSize ||
      JSON.stringify(prev.filters) !== JSON.stringify(filters)
    ) {
      setPage(1);
    }
    prevDepsRef.current = { activeView, filters, pageSize };
  }, [activeView, filters, pageSize]);

  const maps = useMemo(() => {
    return {
      categoriasById: getCategoriaById(data.categorias_financeiras || []),
      clientesById: getClienteById(data.clientes || []),
      vendedoresById: getVendedorById(data.vendedores || []),
      osById: getOsById(data.ordens_servico || []),
    };
  }, [data]);

  const enrichedLancamentos = useMemo(() => {
    return (data.lancamentos_financeiros || []).map((lancamento) => {
      const categoria = maps.categoriasById[lancamento.categoria_id];
      const os = lancamento.os_id ? maps.osById[lancamento.os_id] : null;

      return {
        ...lancamento,
        data_referencia: lancamento.data_competencia,
        categoria_nome: categoria?.nome || "Sem categoria",
        tipo_lancamento: categoria?.tipo_lancamento || "despesa",
        grupo_dre: categoria?.grupo_dre || "despesa_operacional",
        numero_os: os?.numero_os || "",
      };
    });
  }, [data.lancamentos_financeiros, maps]);

  const osFinanceRows = useMemo(() => {
    return (data.ordens_servico || [])
      .filter(
        (os) =>
          os.tipo_os === "venda" &&
          os.status !== "cancelada" &&
          !["cancelado", "estornado"].includes(os.status_pagamento)
      )
      .flatMap((os) => {
        const cliente = maps.clientesById[os.cliente_id];
        const vendedor = maps.vendedoresById[os.vendedor_id];
        const valorTotal = toNumber(os.valor_total);
        const valorEntrada = Math.min(toNumber(os.valor_entrada), valorTotal);
        const valorRestante = Math.max(toNumber(os.valor_restante), valorTotal - valorEntrada, 0);

        const baseRow = {
          origem_id: os.id,
          origem: "ordem_servico",
          categoria_nome: "Receita de OS",
          categoria: "Receita de OS",
          grupo_dre: "receita_operacional",
          tipo_lancamento: "receita",
          data_competencia: os.data_venda,
          data_vencimento: os.prazo_entrega,
          forma_pagamento: os.forma_pagamento || "",
          numero_os: os.numero_os,
          cliente_nome: cliente?.nome_completo || "",
          vendedor_nome: vendedor?.nome_completo || vendedor?.nome_exibicao || "",
          observacoes: os.observacoes_internas || os.observacoes_cliente || "",
          raw: os,
        };

        if (os.status_pagamento === "pago") {
          return [
            {
              ...baseRow,
              id: `os-${os.id}-pago`,
              descricao: `OS ${os.numero_os || ""} - valor recebido`,
              valor: valorTotal,
              data_referencia: os.data_venda,
              data_pagamento: os.data_venda,
              status: "pago",
            },
          ];
        }

        if (os.status_pagamento === "parcial") {
          return [
            valorEntrada > 0
              ? {
                  ...baseRow,
                  id: `os-${os.id}-entrada`,
                  descricao: `OS ${os.numero_os || ""} - entrada recebida`,
                  valor: valorEntrada,
                  data_referencia: os.data_venda,
                  data_pagamento: os.data_venda,
                  status: "pago",
                }
              : null,
            valorRestante > 0
              ? {
                  ...baseRow,
                  id: `os-${os.id}-saldo`,
                  descricao: `OS ${os.numero_os || ""} - saldo previsto`,
                  valor: valorRestante,
                  data_referencia: os.prazo_entrega || os.data_venda,
                  data_pagamento: null,
                  status: "previsto",
                }
              : null,
          ].filter(Boolean);
        }

        return [
          {
            ...baseRow,
            id: `os-${os.id}-previsto`,
            descricao: `OS ${os.numero_os || ""} - recebimento previsto`,
            valor: valorTotal,
            data_referencia: os.prazo_entrega || os.data_venda,
            data_pagamento: null,
            status: "previsto",
          },
        ];
      });
  }, [data.ordens_servico, maps]);

  const extratoRows = useMemo(() => {
    const rows = [...osFinanceRows, ...enrichedLancamentos]
      .map((row) => ({
        ...row,
        valor_assinado: getSignedValue(row),
      }))
      .sort((a, b) => {
        const dateA = parseDate(a.data_referencia)?.getTime() || 0;
        const dateB = parseDate(b.data_referencia)?.getTime() || 0;

        return dateB - dateA;
      });

    return applyCommonFilters(rows, filters);
  }, [osFinanceRows, enrichedLancamentos, filters]);

  const caixaRows = useMemo(() => {
    const rows = [...osFinanceRows, ...enrichedLancamentos]
      .filter((row) => row.status === "pago")
      .map((row) => ({
        ...row,
        data_referencia: row.data_pagamento || row.data_competencia,
        valor_assinado: getSignedValue(row),
      }))
      .sort((a, b) => {
        const dateA = parseDate(a.data_referencia)?.getTime() || 0;
        const dateB = parseDate(b.data_referencia)?.getTime() || 0;

        return dateB - dateA;
      });

    return applyCommonFilters(rows, filters);
  }, [osFinanceRows, enrichedLancamentos, filters]);

  const dreRows = useMemo(() => {
    const rows = (data.financeiro_dre_base || [])
      .map((row, index) => ({
        ...row,
        id: `${row.origem}-${row.origem_id}-${index}`,
        descricao: `${row.categoria || "Movimento"} ${
          row.origem === "ordem_servico" ? "por OS" : ""
        }`.trim(),
        categoria_nome: row.categoria,
        data_referencia: row.data_competencia,
        status: "competencia",
        valor_assinado: getSignalByType(row.tipo_lancamento) * toNumber(row.valor),
      }))
      .sort((a, b) => {
        const dateA = parseDate(a.data_referencia)?.getTime() || 0;
        const dateB = parseDate(b.data_referencia)?.getTime() || 0;

        return dateB - dateA;
      });

    return applyCommonFilters(rows, filters, {
      ignoreStatus: true,
      ignoreFormaPagamento: true,
    });
  }, [data.financeiro_dre_base, filters]);

  const categoriasRows = useMemo(() => {
    const search = normalizeText(filters.search);

    return (data.categorias_financeiras || [])
      .filter((categoria) => {
        if (filters.tipo !== "todos" && categoria.tipo_lancamento !== filters.tipo) {
          return false;
        }

        if (
          filters.grupoDre !== "todos" &&
          categoria.grupo_dre !== filters.grupoDre
        ) {
          return false;
        }

        if (!search) return true;

        return normalizeText(
          [categoria.nome, categoria.tipo_lancamento, categoria.grupo_dre]
            .filter(Boolean)
            .join(" ")
        ).includes(search);
      })
      .sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
  }, [data.categorias_financeiras, filters]);

  const currentRows = useMemo(() => {
    if (activeView === "caixa") return caixaRows;
    if (activeView === "dre") return dreRows;
    if (activeView === "categorias") return categoriasRows;
    return extratoRows;
  }, [activeView, caixaRows, dreRows, categoriasRows, extratoRows]);

  const paginated = useMemo(() => {
    return paginate(currentRows, page, pageSize);
  }, [currentRows, page, pageSize]);

  const kpis = useMemo(() => {
    const drePeriodo = dreRows;

    const receitaBruta = sumBy(
      drePeriodo.filter((row) => row.grupo_dre === "receita_operacional"),
      (row) => row.valor
    );

    const deducoes = sumBy(
      drePeriodo.filter((row) => row.grupo_dre === "deducao_receita"),
      (row) => row.valor
    );

    const custosDiretos = sumBy(
      drePeriodo.filter((row) => row.grupo_dre === "custo_direto"),
      (row) => row.valor
    );

    const despesasOperacionais = sumBy(
      drePeriodo.filter((row) => row.grupo_dre === "despesa_operacional"),
      (row) => row.valor
    );

    const resultadoNaoOperacional = drePeriodo
      .filter((row) => row.grupo_dre === "resultado_nao_operacional")
      .reduce((total, row) => total + getSignedValue(row), 0);

    const receitaLiquida = receitaBruta - deducoes;
    const lucroBruto = receitaLiquida - custosDiretos;
    const lucroLiquido =
      lucroBruto - despesasOperacionais + resultadoNaoOperacional;

    const entradasCaixa = sumBy(
      caixaRows.filter((row) => row.tipo_lancamento === "receita"),
      (row) => row.valor
    );

    const saidasCaixa = sumBy(
      caixaRows.filter((row) => row.tipo_lancamento === "despesa"),
      (row) => row.valor
    );

    return {
      receitaBruta,
      receitaLiquida,
      custosDiretos,
      despesasOperacionais,
      lucroLiquido,
      saldoCaixa: entradasCaixa - saidasCaixa,
      entradasCaixa,
      saidasCaixa,
    };
  }, [dreRows, caixaRows]);

  const dreSummary = useMemo(() => {
    const receitaBruta = sumBy(
      dreRows.filter((row) => row.grupo_dre === "receita_operacional"),
      (row) => row.valor
    );

    const deducoes = sumBy(
      dreRows.filter((row) => row.grupo_dre === "deducao_receita"),
      (row) => row.valor
    );

    const custosDiretos = sumBy(
      dreRows.filter((row) => row.grupo_dre === "custo_direto"),
      (row) => row.valor
    );

    const despesasOperacionais = sumBy(
      dreRows.filter((row) => row.grupo_dre === "despesa_operacional"),
      (row) => row.valor
    );

    const resultadoNaoOperacional = dreRows
      .filter((row) => row.grupo_dre === "resultado_nao_operacional")
      .reduce((total, row) => total + getSignedValue(row), 0);

    const receitaLiquida = receitaBruta - deducoes;
    const lucroBruto = receitaLiquida - custosDiretos;
    const resultadoOperacional = lucroBruto - despesasOperacionais;
    const lucroLiquido = resultadoOperacional + resultadoNaoOperacional;

    return [
      {
        label: "Receita bruta",
        value: receitaBruta,
        tone: "positive",
      },
      {
        label: "Deduções da receita",
        value: -deducoes,
        tone: "negative",
      },
      {
        label: "Receita líquida",
        value: receitaLiquida,
        tone: "subtotal",
      },
      {
        label: "Custos diretos",
        value: -custosDiretos,
        tone: "negative",
      },
      {
        label: "Lucro bruto",
        value: lucroBruto,
        tone: "subtotal",
      },
      {
        label: "Despesas operacionais",
        value: -despesasOperacionais,
        tone: "negative",
      },
      {
        label: "Resultado operacional",
        value: resultadoOperacional,
        tone: "subtotal",
      },
      {
        label: "Resultado não operacional",
        value: resultadoNaoOperacional,
        tone: resultadoNaoOperacional >= 0 ? "positive" : "negative",
      },
      {
        label: "Lucro líquido",
        value: lucroLiquido,
        tone: lucroLiquido >= 0 ? "final-positive" : "final-negative",
      },
    ];
  }, [dreRows]);

  async function handleSeedCategorias() {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/financeiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "criar_categorias_padrao",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível criar categorias.");
      }

      await loadFinanceiro();
    } catch (error) {
      console.error("Erro ao criar categorias padrão:", error);
      setErrorMessage(error.message || "Erro ao criar categorias padrão.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitLancamento(formData) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = {
        ...formData,
        valor: toNumber(formData.valor),
        os_id: formData.os_id || null,
        forma_pagamento: formData.forma_pagamento || null,
        data_vencimento: formData.data_vencimento || null,
        data_pagamento: formData.data_pagamento || null,
      };

      const response = await fetch("/api/financeiro", {
        method: selectedLancamento?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: "lancamento",
          data: selectedLancamento?.id
            ? {
                id: selectedLancamento.id,
                ...payload,
              }
            : payload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível salvar o lançamento.");
      }

      setLancamentoDialogOpen(false);
      setSelectedLancamento(null);

      await loadFinanceiro();
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
      setErrorMessage(error.message || "Erro ao salvar lançamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitCategoria(formData) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/financeiro", {
        method: selectedCategoria?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: "categoria",
          data: selectedCategoria?.id
            ? {
                id: selectedCategoria.id,
                ...formData,
              }
            : formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível salvar a categoria.");
      }

      setCategoriaDialogOpen(false);
      setSelectedCategoria(null);

      await loadFinanceiro();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      setErrorMessage(error.message || "Erro ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/financeiro", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: deleteTarget.resource,
          id: deleteTarget.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível excluir o registro.");
      }

      setDeleteTarget(null);

      await loadFinanceiro();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setErrorMessage(error.message || "Erro ao excluir registro.");
    } finally {
      setIsSaving(false);
    }
  }

  function openCreateLancamento() {
    setSelectedLancamento(null);
    setLancamentoDialogOpen(true);
  }

  function openEditLancamento(lancamento) {
    setSelectedLancamento(lancamento);
    setLancamentoDialogOpen(true);
  }

  function openCreateCategoria() {
    setSelectedCategoria(null);
    setCategoriaDialogOpen(true);
  }

  function openEditCategoria(categoria) {
    setSelectedCategoria(categoria);
    setCategoriaDialogOpen(true);
  }

  function clearFilters() {
    setFilters(emptyFilters);
  }

  function handleExport() {
    if (activeView === "categorias") {
      exportRowsToExcel({
        filename: "financeiro-categorias",
        sheetName: "Categorias financeiras",
        rows: currentRows,
        columns: [
          { label: "Nome", value: "nome" },
          {
            label: "Tipo",
            value: (row) => tipoLancamentoLabels[row.tipo_lancamento] || row.tipo_lancamento,
          },
          {
            label: "Grupo DRE",
            value: (row) => grupoDreLabels[row.grupo_dre] || row.grupo_dre,
          },
          {
            label: "Status",
            value: (row) => (row.ativo ? "Ativa" : "Inativa"),
          },
        ],
      });

      return;
    }

    if (activeView === "dre") {
      exportRowsToExcel({
        filename: "financeiro-dre",
        sheetName: "DRE",
        rows: dreSummary,
        columns: [
          { label: "Linha", value: "label" },
          {
            label: "Valor",
            value: (row) => formatCurrency(row.value),
          },
        ],
      });

      return;
    }

    exportRowsToExcel({
      filename:
        activeView === "caixa" ? "financeiro-livro-caixa" : "financeiro-extrato",
      sheetName: activeView === "caixa" ? "Livro caixa" : "Extrato financeiro",
      rows: currentRows,
      columns: [
        {
          label: "Data",
          value: (row) => formatDateBR(row.data_referencia),
        },
        { label: "Descrição", value: "descricao" },
        {
          label: "Categoria",
          value: (row) => row.categoria_nome || row.categoria,
        },
        {
          label: "Tipo",
          value: (row) => tipoLancamentoLabels[row.tipo_lancamento] || row.tipo_lancamento,
        },
        {
          label: "Grupo DRE",
          value: (row) => grupoDreLabels[row.grupo_dre] || row.grupo_dre,
        },
        {
          label: "Status",
          value: (row) => statusLabels[row.status] || row.status,
        },
        {
          label: "Forma de pagamento",
          value: (row) => formaPagamentoLabels[row.forma_pagamento] || row.forma_pagamento,
        },
        {
          label: "Valor",
          value: (row) => formatCurrency(row.valor_assinado ?? getSignedValue(row)),
        },
      ],
    });
  }

  const hasCategorias = (data.categorias_financeiras || []).length > 0;

  return (
    <main className="space-y-6">
      <FinanceiroHeader
        isLoading={isLoading}
        isSaving={isSaving}
        onRefresh={loadFinanceiro}
        onNewLancamento={openCreateLancamento}
        onNewCategoria={openCreateCategoria}
        onExport={handleExport}
        onSeedCategorias={handleSeedCategorias}
        hasCategorias={hasCategorias}
      />

      {errorMessage ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <FinanceiroKpis kpis={kpis} />

      <FinanceiroViewsNav activeView={activeView} onChange={setActiveView} />

      <FinanceiroFilters
        filters={filters}
        onChangeFilters={setFilters}
        onClearFilters={clearFilters}
        totalResults={currentRows.length}
        activeView={activeView}
      />

      {isLoading ? (
        <FinanceiroLoadingState />
      ) : activeView === "dre" ? (
        <FinanceiroDreView
          summary={dreSummary}
          rows={paginated.items}
          totalRows={currentRows.length}
          page={paginated.page}
          totalPages={paginated.totalPages}
          pageSize={pageSize}
          onChangePage={setPage}
          onChangePageSize={setPageSize}
        />
      ) : activeView === "categorias" ? (
        <FinanceiroCategoriasView
          categorias={paginated.items}
          totalRows={currentRows.length}
          page={paginated.page}
          totalPages={paginated.totalPages}
          pageSize={pageSize}
          onChangePage={setPage}
          onChangePageSize={setPageSize}
          onEdit={openEditCategoria}
          onDelete={(categoria) =>
            setDeleteTarget({
              resource: "categoria",
              id: categoria.id,
              title: categoria.nome,
            })
          }
        />
      ) : (
        <FinanceiroMovimentosView
          rows={paginated.items}
          totalRows={currentRows.length}
          page={paginated.page}
          totalPages={paginated.totalPages}
          pageSize={pageSize}
          onChangePage={setPage}
          onChangePageSize={setPageSize}
          onEdit={openEditLancamento}
          onDelete={(lancamento) =>
            setDeleteTarget({
              resource: "lancamento",
              id: lancamento.id,
              title: lancamento.descricao,
            })
          }
        />
      )}

      <LancamentoFormDialog
        open={lancamentoDialogOpen}
        onOpenChange={setLancamentoDialogOpen}
        lancamento={selectedLancamento}
        categorias={data.categorias_financeiras || []}
        ordensServico={data.ordens_servico || []}
        clientesById={maps.clientesById}
        onSubmit={handleSubmitLancamento}
        isSaving={isSaving}
      />

      <CategoriaFormDialog
        open={categoriaDialogOpen}
        onOpenChange={setCategoriaDialogOpen}
        categoria={selectedCategoria}
        onSubmit={handleSubmitCategoria}
        isSaving={isSaving}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-[32px] border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-[-0.045em] text-dark-title">
              Excluir registro?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
              Você está prestes a excluir{" "}
              <strong>{deleteTarget?.title || "este registro"}</strong>. Se for
              uma categoria já usada em lançamentos, o banco pode bloquear a
              exclusão. Nesse caso, edite e deixe como inativa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/* ==========================================================================
   HEADER
   ========================================================================== */

function FinanceiroHeader({
  isLoading,
  isSaving,
  onRefresh,
  onNewLancamento,
  onNewCategoria,
  onExport,
  onSeedCategorias,
  hasCategorias,
}) {
  return (
    <section className="flex flex-col gap-5 rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.06em] text-dark-title sm:text-4xl">
          Controle financeiro
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Receitas, despesas, livro caixa, extrato e DRE da ótica em uma tela
          só. Sem firula, sem labirinto, sem botão escondido atrás da moita.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
        {!hasCategorias ? (
          <Button
            variant="secondary"
            onClick={onSeedCategorias}
            disabled={isSaving}
            className="h-12 rounded-full px-5 font-black"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Tags className="size-4" />
            )}
            Criar categorias padrão
          </Button>
        ) : null}

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-12 rounded-full px-5 font-black"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Atualizar
        </Button>

        <Button
          variant="outline"
          onClick={onNewCategoria}
          className="h-12 rounded-full px-5 font-black"
        >
          <Tags className="size-4" />
          Categoria
        </Button>

        <Button
          onClick={onNewLancamento}
          className="h-12 rounded-full px-5 font-black"
        >
          <Plus className="size-4" />
          Lançamento
        </Button>

        <Button
          variant="secondary"
          onClick={onExport}
          className="h-12 rounded-full px-5 font-black"
        >
          <Download className="size-4" />
          Exportar Excel
        </Button>
      </div>
    </section>
  );
}

/* ==========================================================================
   KPIS
   ========================================================================== */

function FinanceiroKpis({ kpis }) {
  const cards = [
    {
      title: "Receita bruta",
      value: kpis.receitaBruta,
      meta: "Vendas e receitas do período",
      icon: TrendingUp,
      tone: "positive",
    },
    {
      title: "Despesas + custos",
      value: kpis.custosDiretos + kpis.despesasOperacionais,
      meta: "Custos diretos e operação",
      icon: TrendingDown,
      tone: "negative",
    },
    {
      title: "Lucro líquido",
      value: kpis.lucroLiquido,
      meta: "Resultado do DRE filtrado",
      icon: CircleDollarSign,
      tone: kpis.lucroLiquido >= 0 ? "positive" : "negative",
    },
    {
      title: "Saldo em caixa",
      value: kpis.saldoCaixa,
      meta: "Entradas menos saídas pagas",
      icon: Banknote,
      tone: kpis.saldoCaixa >= 0 ? "positive" : "negative",
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

                <p
                  className={`mt-3 text-2xl font-black tracking-[-0.06em] sm:text-3xl ${
                    card.tone === "negative"
                      ? "text-red-600"
                      : "text-dark-title"
                  }`}
                >
                  {formatCurrency(card.value)}
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
   NAVEGAÇÃO
   ========================================================================== */

function FinanceiroViewsNav({ activeView, onChange }) {
  return (
    <section className="rounded-[34px] border border-border bg-card p-2 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)]">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {viewOptions.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.value;

          return (
            <button
              key={view.value}
              type="button"
              onClick={() => onChange(view.value)}
              className={`flex items-center justify-center gap-2 rounded-[26px] px-4 py-4 text-sm font-black transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_20px_55px_-28px_rgba(108,77,230,0.7)]"
                  : "text-muted-foreground hover:bg-primary/[0.06] hover:text-primary"
              }`}
            >
              <Icon className="size-4" />
              {view.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   FILTROS
   ========================================================================== */

function FinanceiroFilters({
  filters,
  onChangeFilters,
  onClearFilters,
  totalResults,
  activeView,
}) {
  const [open, setOpen] = useState(false);

  function updateFilter(field, value) {
    onChangeFilters({
      ...filters,
      [field]: value,
    });
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder={
                  activeView === "categorias"
                    ? "Pesquisar por categoria, tipo ou grupo..."
                    : "Pesquisar por descrição, OS, cliente, categoria, status..."
                }
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
            {totalResults} registro{totalResults === 1 ? "" : "s"} encontrado
            {totalResults === 1 ? "" : "s"}
          </p>
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-4">
            {activeView !== "categorias" ? (
              <div className="space-y-2">
                <p className="text-sm font-black text-dark-title">Período</p>

                <Select
                  value={filters.periodo}
                  onValueChange={(value) => updateFilter("periodo", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>

                  <SelectContent>
                    {periodoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Tipo</p>

              <Select
                value={filters.tipo}
                onValueChange={(value) => updateFilter("tipo", value)}
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeView !== "categorias" ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Status</p>

                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilter("status", value)}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="previsto">Previsto</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">
                    Forma de pagamento
                  </p>

                  <Select
                    value={filters.formaPagamento}
                    onValueChange={(value) =>
                      updateFilter("formaPagamento", value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Forma" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-black text-dark-title">Grupo DRE</p>

              <Select
                value={filters.grupoDre}
                onValueChange={(value) => updateFilter("grupoDre", value)}
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Grupo DRE" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita_operacional">
                    Receita operacional
                  </SelectItem>
                  <SelectItem value="deducao_receita">
                    Deduções da receita
                  </SelectItem>
                  <SelectItem value="custo_direto">Custo direto</SelectItem>
                  <SelectItem value="despesa_operacional">
                    Despesa operacional
                  </SelectItem>
                  <SelectItem value="resultado_nao_operacional">
                    Resultado não operacional
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeView !== "categorias" ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-black text-dark-title">Origem</p>

                  <Select
                    value={filters.origem}
                    onValueChange={(value) => updateFilter("origem", value)}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="ordem_servico">Ordem de serviço</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.periodo === "personalizado" ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-dark-title">
                        Data inicial
                      </p>

                      <Input
                        type="date"
                        value={filters.dataInicio}
                        onChange={(event) =>
                          updateFilter("dataInicio", event.target.value)
                        }
                        className="h-12 rounded-2xl border-border bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-black text-dark-title">
                        Data final
                      </p>

                      <Input
                        type="date"
                        value={filters.dataFim}
                        onChange={(event) =>
                          updateFilter("dataFim", event.target.value)
                        }
                        className="h-12 rounded-2xl border-border bg-background"
                      />
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/* ==========================================================================
   MOVIMENTOS
   ========================================================================== */

function FinanceiroMovimentosView({
  rows,
  totalRows,
  page,
  totalPages,
  pageSize,
  onChangePage,
  onChangePageSize,
  onEdit,
  onDelete,
}) {
  if (!totalRows) {
    return <FinanceiroEmptyState title="Nenhum movimento encontrado." />;
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/70 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-4 font-black">Data</th>
                <th className="px-5 py-4 font-black">Descrição</th>
                <th className="px-5 py-4 font-black">Categoria</th>
                <th className="px-5 py-4 font-black">Tipo</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 font-black">Pagamento</th>
                <th className="px-5 py-4 text-right font-black">Valor</th>
                <th className="px-5 py-4 text-right font-black">Ações</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const isReceita = row.tipo_lancamento === "receita";
                const isManual = row.origem !== "ordem_servico" && !String(row.id).startsWith("os-");

                return (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0 hover:bg-primary/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-dark-title">
                        <CalendarDays className="size-4 text-primary" />
                        {formatDateBR(row.data_referencia)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="max-w-[240px] truncate text-sm font-black text-dark-title">
                          {row.descricao || "Movimento financeiro"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {row.numero_os ? `OS ${row.numero_os}` : row.origem || "manual"}
                          {row.cliente_nome ? ` • ${row.cliente_nome}` : ""}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-dark-title">
                          {row.categoria_nome || row.categoria || "Sem categoria"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {grupoDreLabels[row.grupo_dre] || row.grupo_dre || "Sem grupo"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 ${
                          isReceita
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {isReceita ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownLeft className="size-3" />
                        )}
                        {tipoLancamentoLabels[row.tipo_lancamento] ||
                          row.tipo_lancamento}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1"
                      >
                        {statusLabels[row.status] || row.status || "Previsto"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {formaPagamentoLabels[row.forma_pagamento] ||
                          row.forma_pagamento ||
                          "Não informado"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <p
                        className={`text-sm font-black ${
                          isReceita ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {isReceita ? "+" : "-"}
                        {formatCurrency(row.valor)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {isManual ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(row)}
                              className="rounded-full"
                            >
                              <PencilLine className="size-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(row)}
                              className="rounded-full text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1 text-muted-foreground"
                          >
                            <Eye className="size-3" />
                            Automático
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <FinanceiroPagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRows={totalRows}
        onChangePage={onChangePage}
        onChangePageSize={onChangePageSize}
      />
    </section>
  );
}

/* ==========================================================================
   DRE
   ========================================================================== */

function FinanceiroDreView({
  summary,
  rows,
  totalRows,
  page,
  totalPages,
  pageSize,
  onChangePage,
  onChangePageSize,
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.055em] text-dark-title">
              DRE simplificado
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Demonstrativo direto ao ponto: receita, deduções, custos,
              despesas e resultado.
            </p>
          </div>

          <Badge
            variant="secondary"
            className="w-fit rounded-full px-4 py-2 text-sm font-black"
          >
            {totalRows} movimento{totalRows === 1 ? "" : "s"} na base
          </Badge>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-border">
          {summary.map((line) => (
            <div
              key={line.label}
              className={`flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 ${
                line.tone?.includes("final")
                  ? "bg-primary/[0.08]"
                  : line.tone === "subtotal"
                    ? "bg-background/70"
                    : "bg-card"
              }`}
            >
              <p
                className={`text-sm ${
                  line.tone?.includes("final")
                    ? "font-black text-dark-title"
                    : line.tone === "subtotal"
                      ? "font-black text-dark-title"
                      : "font-semibold text-muted-foreground"
                }`}
              >
                {line.label}
              </p>

              <p
                className={`text-right text-sm font-black ${
                  line.value < 0
                    ? "text-red-600"
                    : line.tone?.includes("final")
                      ? "text-primary"
                      : "text-dark-title"
                }`}
              >
                {formatCurrency(line.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {totalRows ? (
        <>
          <div className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/70 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="px-5 py-4 font-black">Data</th>
                    <th className="px-5 py-4 font-black">Categoria</th>
                    <th className="px-5 py-4 font-black">Grupo</th>
                    <th className="px-5 py-4 font-black">Origem</th>
                    <th className="px-5 py-4 text-right font-black">Valor</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const isReceita = row.tipo_lancamento === "receita";

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-b-0 hover:bg-primary/[0.025]"
                      >
                        <td className="px-5 py-4 text-sm font-bold text-dark-title">
                          {formatDateBR(row.data_competencia)}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-dark-title">
                          {row.categoria}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-muted-foreground">
                          {grupoDreLabels[row.grupo_dre] || row.grupo_dre}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-muted-foreground">
                          {row.origem === "ordem_servico"
                            ? "Ordem de serviço"
                            : row.origem || "Manual"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span
                            className={`text-sm font-black ${
                              isReceita ? "text-emerald-700" : "text-red-600"
                            }`}
                          >
                            {isReceita ? "+" : "-"}
                            {formatCurrency(row.valor)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <FinanceiroPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRows={totalRows}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        </>
      ) : (
        <FinanceiroEmptyState title="Sem dados para montar o DRE." />
      )}
    </section>
  );
}

/* ==========================================================================
   CATEGORIAS
   ========================================================================== */

function FinanceiroCategoriasView({
  categorias,
  totalRows,
  page,
  totalPages,
  pageSize,
  onChangePage,
  onChangePageSize,
  onEdit,
  onDelete,
}) {
  if (!totalRows) {
    return <FinanceiroEmptyState title="Nenhuma categoria encontrada." />;
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[38px] border border-border bg-card shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/70 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-4 font-black">Categoria</th>
                <th className="px-5 py-4 font-black">Tipo</th>
                <th className="px-5 py-4 font-black">Grupo DRE</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 text-right font-black">Ações</th>
              </tr>
            </thead>

            <tbody>
              {categorias.map((categoria) => {
                const isReceita = categoria.tipo_lancamento === "receita";

                return (
                  <tr
                    key={categoria.id}
                    className="border-b border-border last:border-b-0 hover:bg-primary/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-dark-title">
                        {categoria.nome}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        Criada em {formatDateTimeBR(categoria.created_at)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 ${
                          isReceita
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {tipoLancamentoLabels[categoria.tipo_lancamento]}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-muted-foreground">
                      {grupoDreLabels[categoria.grupo_dre] ||
                        categoria.grupo_dre}
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={categoria.ativo ? "secondary" : "outline"}
                        className="rounded-full px-3 py-1"
                      >
                        {categoria.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(categoria)}
                          className="rounded-full"
                        >
                          <PencilLine className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(categoria)}
                          className="rounded-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <FinanceiroPagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRows={totalRows}
        onChangePage={onChangePage}
        onChangePageSize={onChangePageSize}
      />
    </section>
  );
}

/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

function FinanceiroPagination({
  page,
  totalPages,
  pageSize,
  totalRows,
  onChangePage,
  onChangePageSize,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-4 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.36)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Página {page} de {totalPages} • {totalRows} registro
          {totalRows === 1 ? "" : "s"}
        </p>

        <Select
          value={String(pageSize)}
          onValueChange={(value) => onChangePageSize(Number(value))}
        >
          <SelectTrigger className="h-10 w-[132px] rounded-full border-border bg-background">
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
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
          className="h-10 rounded-full px-4 font-black"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
          className="h-10 rounded-full px-4 font-black"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODAL LANÇAMENTO
   ========================================================================== */

function LancamentoFormDialog({
  open,
  onOpenChange,
  lancamento,
  categorias,
  ordensServico,
  clientesById,
  onSubmit,
  isSaving,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <LancamentoFormDialogContent
          key={lancamento?.id || "novo-lancamento"}
          lancamento={lancamento}
          categorias={categorias}
          ordensServico={ordensServico}
          clientesById={clientesById}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function LancamentoFormDialogContent({
  lancamento,
  categorias,
  ordensServico,
  clientesById,
  onSubmit,
  isSaving,
}) {
  const isEditing = Boolean(lancamento?.id);
  const [formData, setFormData] = useState(() =>
    getLancamentoInitialForm(lancamento)
  );
  const [errors, setErrors] = useState({});

  const categoriasAtivas = categorias.filter((categoria) => categoria.ativo);

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

  function validate() {
    const nextErrors = {};

    if (!formData.categoria_id) {
      nextErrors.categoria_id = "Selecione uma categoria.";
    }

    if (!formData.descricao.trim()) {
      nextErrors.descricao = "Informe a descrição.";
    }

    if (toNumber(formData.valor) <= 0) {
      nextErrors.valor = "Informe um valor maior que zero.";
    }

    if (!formData.data_competencia) {
      nextErrors.data_competencia = "Informe a competência.";
    }

    if (formData.origem === "ordem_servico") {
      nextErrors.origem = "Origem Ordem de serviço é gerada automaticamente. Use Manual ou Ajuste.";
    }

    if (formData.status === "pago" && !formData.data_pagamento) {
      nextErrors.data_pagamento = "Informe a data de pagamento.";
    }

    if (formData.data_pagamento && formData.status !== "pago") {
      nextErrors.status = "Com data de pagamento, o status precisa ser Pago.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  }

  return (
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-[38px] border-border bg-card p-0 sm:max-w-4xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-6 text-left sm:px-7">
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar lançamento" : "Novo lançamento"}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Use para receitas avulsas, despesas fixas, taxas, ajustes e qualquer
          movimento que não nasceu direto de uma OS.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-7">
          <FormSection title="Dados principais">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Categoria *" error={errors.categoria_id}>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) => updateField("categoria_id", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    {categoriasAtivas.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome} •{" "}
                        {tipoLancamentoLabels[categoria.tipo_lancamento]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Valor *" error={errors.valor}>
                <Input
                  value={formData.valor}
                  onChange={(event) => updateField("valor", event.target.value)}
                  placeholder="Ex.: 1500,00"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Descrição *" error={errors.descricao}>
                <Input
                  value={formData.descricao}
                  onChange={(event) =>
                    updateField("descricao", event.target.value)
                  }
                  placeholder="Ex.: Aluguel da loja"
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Origem" error={errors.origem}>
                <Select
                  value={formData.origem}
                  onValueChange={(value) => updateField("origem", value)}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Datas e pagamento">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FormField
                label="Competência *"
                error={errors.data_competencia}
              >
                <Input
                  type="date"
                  value={formData.data_competencia}
                  onChange={(event) =>
                    updateField("data_competencia", event.target.value)
                  }
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Vencimento">
                <Input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(event) =>
                    updateField("data_vencimento", event.target.value)
                  }
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Pagamento" error={errors.data_pagamento}>
                <Input
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(event) => {
                    updateField("data_pagamento", event.target.value);

                    if (event.target.value) {
                      updateField("status", "pago");
                    }
                  }}
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>

              <FormField label="Status" error={errors.status}>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    updateField("status", value);

                    if (value === "pago" && !formData.data_pagamento) {
                      updateField("data_pagamento", getTodayInputValue());
                    }

                    if (value !== "pago") {
                      updateField("data_pagamento", "");
                    }
                  }}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="previsto">Previsto</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Vínculo e observações">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Forma de pagamento">
                <Select
                  value={formData.forma_pagamento || "sem_forma"}
                  onValueChange={(value) =>
                    updateField(
                      "forma_pagamento",
                      value === "sem_forma" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="sem_forma">Não informado</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Vincular OS">
                <Select
                  value={formData.os_id || "sem_os"}
                  onValueChange={(value) =>
                    updateField("os_id", value === "sem_os" ? "" : value)
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="sem_os">Sem vínculo</SelectItem>

                    {ordensServico.map((os) => {
                      const cliente = clientesById[os.cliente_id];

                      return (
                        <SelectItem key={os.id} value={os.id}>
                          OS {os.numero_os} •{" "}
                          {cliente?.nome_completo || "Cliente"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Observações">
                  <Textarea
                    value={formData.observacoes}
                    onChange={(event) =>
                      updateField("observacoes", event.target.value)
                    }
                    placeholder="Detalhes internos do lançamento"
                    className="min-h-28 rounded-2xl border-border bg-background"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-5 sm:px-7">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 rounded-full px-6 font-black"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CircleDollarSign className="size-4" />
            )}
            Salvar lançamento
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ==========================================================================
   MODAL CATEGORIA
   ========================================================================== */

function CategoriaFormDialog({
  open,
  onOpenChange,
  categoria,
  onSubmit,
  isSaving,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CategoriaFormDialogContent
          key={categoria?.id || "nova-categoria"}
          categoria={categoria}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      ) : null}
    </Dialog>
  );
}

function CategoriaFormDialogContent({ categoria, onSubmit, isSaving }) {
  const isEditing = Boolean(categoria?.id);
  const [formData, setFormData] = useState(() =>
    getCategoriaInitialForm(categoria)
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

  function validate() {
    const nextErrors = {};

    if (!formData.nome.trim()) {
      nextErrors.nome = "Informe o nome da categoria.";
    }

    if (!isCategoriaDreCompativel(formData.tipo_lancamento, formData.grupo_dre)) {
      nextErrors.grupo_dre = "Grupo DRE incompatível com o tipo escolhido.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  }

  return (
    <DialogContent className="rounded-[38px] border-border bg-card p-0 sm:max-w-2xl">
      <DialogHeader className="border-b border-border px-6 py-6 text-left sm:px-7">
        <DialogTitle className="text-2xl font-black tracking-[-0.055em] text-dark-title">
          {isEditing ? "Editar categoria" : "Nova categoria"}
        </DialogTitle>

        <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
          Categoria é o mapa do financeiro. Se ela for mal definida, o DRE vira
          sopa de letrinhas. Capricha aqui.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 sm:px-7">
        <FormSection title="Classificação">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField label="Nome *" error={errors.nome}>
                <Input
                  value={formData.nome}
                  onChange={(event) => updateField("nome", event.target.value)}
                  placeholder="Ex.: Aluguel, Marketing, Receita avulsa..."
                  className="h-12 rounded-2xl border-border bg-background"
                />
              </FormField>
            </div>

            <FormField label="Tipo">
              <Select
                value={formData.tipo_lancamento}
                onValueChange={(value) => {
                  updateField("tipo_lancamento", value);
                  updateField("grupo_dre", getDefaultGrupoDre(value));
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Grupo DRE" error={errors.grupo_dre}>
              <Select
                value={formData.grupo_dre}
                onValueChange={(value) => updateField("grupo_dre", value)}
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Grupo DRE" />
                </SelectTrigger>

                <SelectContent>
                  {(grupoDreOptionsByTipo[formData.tipo_lancamento] || []).map(
                    (grupo) => (
                      <SelectItem key={grupo} value={grupo}>
                        {grupoDreLabels[grupo] || grupo}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.ativo ? "ativo" : "inativo"}
                onValueChange={(value) => updateField("ativo", value === "ativo")}
              >
                <SelectTrigger className="h-12 rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ativo">Ativa</SelectItem>
                  <SelectItem value="inativo">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>

        <DialogFooter className="border-t border-border pt-5">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 rounded-full px-6 font-black"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Tags className="size-4" />
            )}
            Salvar categoria
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ==========================================================================
   UI BASE
   ========================================================================== */

function FormSection({ title, children }) {
  return (
    <section className="rounded-[28px] border border-border bg-background/55 p-5">
      <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-primary">
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
        <span className="block text-xs font-bold text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

function FinanceiroEmptyState({ title }) {
  return (
    <div className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <FileSpreadsheet className="size-8" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Ajuste os filtros ou cadastre um novo lançamento financeiro para começar
        a alimentar essa área.
      </p>
    </div>
  );
}

function FinanceiroLoadingState() {
  return (
    <div className="rounded-[38px] border border-border bg-card p-10 text-center shadow-[0_30px_80px_-66px_rgba(15,23,42,0.32)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[26px] bg-primary/[0.08] text-primary">
        <Loader2 className="size-8 animate-spin" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-[-0.045em] text-dark-title">
        Carregando financeiro...
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Puxando receitas, despesas, OS e DRE. A planilha invisível está acordando.
      </p>
    </div>
  );
}