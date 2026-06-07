"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatBRLInput, parseBRLToNumber } from "@/lib/formatter";
import { useToast } from "@/contexts/ToastContext";

import {
  ConfirmDeleteOrdemServicoDialog,
  OrdemServicoDetailsGrid,
  OrdemServicoDocumentos,
  OrdemServicoEditDialog,
  OrdemServicoHeader,
  OrdemServicoQuickPanel,
  OrdemServicoResumoCards,
  OrdemServicoTimeline,
} from "./components";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function moneyToInput(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function moneyToNumber(value) {
  if (typeof value === "number") return value;
  return parseBRLToNumber(value || "R$ 0,00");
}

function buildQuickForm(os) {
  return {
    status: os?.status || "cadastrada",
    status_pagamento: os?.status_pagamento || "pendente",
    forma_pagamento: os?.forma_pagamento || "",
    valor_entrada: moneyToInput(os?.valor_entrada),
    valor_restante: moneyToInput(os?.valor_restante),
  };
}

function buildEditForm(os) {
  return {
    tipo_os: os?.tipo_os || "venda",
    status: os?.status || "cadastrada",
    status_pagamento: os?.status_pagamento || "pendente",
    data_venda: toInputDate(os?.data_venda),
    prazo_entrega: toInputDate(os?.prazo_entrega),
    prazo_entrega_combinado: toInputDate(os?.prazo_entrega_combinado),
    laboratorio_nome: os?.laboratorio_nome || "",
    pedido_laboratorio_numero: os?.pedido_laboratorio_numero || "",
    previsao_laboratorio: toInputDate(os?.previsao_laboratorio),
    custo_armacao: moneyToInput(os?.custo_armacao),
    custo_lentes: moneyToInput(os?.custo_lentes),
    valor_armacao: moneyToInput(os?.valor_armacao),
    valor_lentes: moneyToInput(os?.valor_lentes),
    valor_servicos: moneyToInput(os?.valor_servicos),
    valor_adicionais: moneyToInput(os?.valor_adicionais),
    desconto_tipo: os?.desconto_tipo || "valor",
    desconto_valor: moneyToInput(os?.desconto_valor),
    desconto_percentual: os?.desconto_percentual || "",
    valor_total: moneyToInput(os?.valor_total),
    valor_entrada: moneyToInput(os?.valor_entrada),
    valor_restante: moneyToInput(os?.valor_restante),
    forma_pagamento: os?.forma_pagamento || "",
    quantidade_parcelas: os?.quantidade_parcelas || "",
    valor_parcela: moneyToInput(os?.valor_parcela),
    receita_recebida: Boolean(os?.receita_recebida),
    conferida: Boolean(os?.conferida),
    nome_responsavel_conferencia: os?.nome_responsavel_conferencia || "",
    cliente_retirou: Boolean(os?.cliente_retirou),
    nome_retirante: os?.nome_retirante || "",
    documento_retirante: os?.documento_retirante || "",
    telefone_retirante: os?.telefone_retirante || "",
    motivo_cancelamento: os?.motivo_cancelamento || "",
    observacoes_cliente: os?.observacoes_cliente || "",
    observacoes_internas: os?.observacoes_internas || "",
  };
}

function normalizeQuickPayload(form) {
  return {
    status: form.status,
    status_pagamento: form.status_pagamento,
    forma_pagamento: form.forma_pagamento || null,
    valor_entrada: moneyToNumber(form.valor_entrada),
    valor_restante: moneyToNumber(form.valor_restante),
  };
}

function normalizeEditPayload(form) {
  return {
    tipo_os: form.tipo_os,
    status: form.status,
    status_pagamento: form.status_pagamento,
    data_venda: form.data_venda || null,
    prazo_entrega: form.prazo_entrega || null,
    prazo_entrega_combinado: form.prazo_entrega_combinado || null,
    laboratorio_nome: form.laboratorio_nome || null,
    pedido_laboratorio_numero: form.pedido_laboratorio_numero || null,
    previsao_laboratorio: form.previsao_laboratorio || null,
    custo_armacao: moneyToNumber(form.custo_armacao),
    custo_lentes: moneyToNumber(form.custo_lentes),
    valor_armacao: moneyToNumber(form.valor_armacao),
    valor_lentes: moneyToNumber(form.valor_lentes),
    valor_servicos: moneyToNumber(form.valor_servicos),
    valor_adicionais: moneyToNumber(form.valor_adicionais),
    desconto_tipo: form.desconto_tipo || null,
    desconto_valor: moneyToNumber(form.desconto_valor),
    desconto_percentual: form.desconto_percentual
      ? Number(form.desconto_percentual)
      : 0,
    valor_total: moneyToNumber(form.valor_total),
    valor_entrada: moneyToNumber(form.valor_entrada),
    valor_restante: moneyToNumber(form.valor_restante),
    forma_pagamento: form.forma_pagamento || null,
    quantidade_parcelas: form.quantidade_parcelas
      ? Number(form.quantidade_parcelas)
      : null,
    valor_parcela: moneyToNumber(form.valor_parcela),
    receita_recebida: Boolean(form.receita_recebida),
    conferida: Boolean(form.conferida),
    nome_responsavel_conferencia: form.nome_responsavel_conferencia || null,
    cliente_retirou: Boolean(form.cliente_retirou),
    nome_retirante: form.nome_retirante || null,
    documento_retirante: form.documento_retirante || null,
    telefone_retirante: form.telefone_retirante || null,
    motivo_cancelamento: form.motivo_cancelamento || null,
    observacoes_cliente: form.observacoes_cliente || null,
    observacoes_internas: form.observacoes_internas || null,
  };
}

const emptyUploadForm = {
  tipo_anexo: "receita_oftalmologica",
  descricao: "",
  data_documento: "",
  file: null,
};

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function OrdemServicoDetailPage({ params }) {
  const resolvedParams = use(params);
  const osId = resolvedParams?.id;

  const router = useRouter();
  const { addToast } = useToast();

  const [ordemServico, setOrdemServico] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [receita, setReceita] = useState(null);
  const [armacao, setArmacao] = useState(null);
  const [lente, setLente] = useState(null);
  const [anexos, setAnexos] = useState([]);
  const [historicoStatus, setHistoricoStatus] = useState([]);
  const [user, setUser] = useState(null);

  const [quickForm, setQuickForm] = useState(buildQuickForm(null));
  const [editForm, setEditForm] = useState(buildEditForm(null));
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSavingQuick, setIsSavingQuick] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAnexoId, setIsDeletingAnexoId] = useState("");

  const canDelete = user?.role === "admin";

  const refreshForms = useCallback((os) => {
    setQuickForm(buildQuickForm(os));
    setEditForm(buildEditForm(os));
  }, []);

  const applyDetailPayload = useCallback(
    (data) => {
      setOrdemServico(data?.ordemServico || null);
      setCliente(data?.cliente || null);
      setVendedor(data?.vendedor || null);
      setReceita(data?.receita || data?.receitas?.[0] || null);
      setArmacao(data?.armacao || data?.armacoes?.[0] || null);
      setLente(data?.lente || data?.lentes?.[0] || null);
      setAnexos(data?.anexos || []);
      setHistoricoStatus(data?.historicoStatus || []);
      setUser(data?.user || null);

      refreshForms(data?.ordemServico || null);
    },
    [refreshForms]
  );

  const loadOrdemServico = useCallback(async () => {
    if (!osId) return;

    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch(`/api/ordens-servico/${osId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar a ordem de serviço."
        );
      }

      applyDetailPayload(data);
    } catch (error) {
      console.error("OS_DETAIL_LOAD_ERROR:", error);

      const message =
        error?.message || "Não foi possível carregar a ordem de serviço.";

      setLoadError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast, applyDetailPayload, osId]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      void loadOrdemServico();
    });

    return () => {
      cancelled = true;
    };
  }, [loadOrdemServico]);

  function updateQuickForm(field, value) {
    const moneyFields = ["valor_entrada", "valor_restante"];

    setQuickForm((current) => ({
      ...current,
      [field]: moneyFields.includes(field) ? formatBRLInput(value) : value,
    }));
  }

  function updateEditForm(field, value) {
    const moneyFields = [
      "custo_armacao",
      "custo_lentes",
      "valor_armacao",
      "valor_lentes",
      "valor_servicos",
      "valor_adicionais",
      "desconto_valor",
      "valor_total",
      "valor_entrada",
      "valor_restante",
      "valor_parcela",
    ];

    setEditForm((current) => ({
      ...current,
      [field]: moneyFields.includes(field) ? formatBRLInput(value) : value,
    }));
  }

  function updateUploadForm(field, value) {
    setUploadForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveOrdemPatch(payload, options = {}) {
    const { successMessage = "OS atualizada com sucesso." } = options;

    const response = await fetch(`/api/ordens-servico/${osId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ordemServico: {
          id: osId,
          ...payload,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Não foi possível atualizar a OS.");
    }

    if (data?.ordemServico) {
      setOrdemServico(data.ordemServico);
      refreshForms(data.ordemServico);
    }

    addToast(data?.message || successMessage, "success");

    void loadOrdemServico();

    return data;
  }

  async function handleQuickSubmit(event) {
    event.preventDefault();

    try {
      setIsSavingQuick(true);

      await saveOrdemPatch(normalizeQuickPayload(quickForm), {
        successMessage: "Atualização rápida salva.",
      });
    } catch (error) {
      console.error("OS_DETAIL_QUICK_SAVE_ERROR:", error);

      addToast(error?.message || "Não foi possível salvar a atualização.", "error");
    } finally {
      setIsSavingQuick(false);
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    try {
      setIsSavingEdit(true);

      await saveOrdemPatch(normalizeEditPayload(editForm), {
        successMessage: "Dados da OS atualizados.",
      });

      setEditOpen(false);
    } catch (error) {
      console.error("OS_DETAIL_EDIT_SAVE_ERROR:", error);

      addToast(error?.message || "Não foi possível editar a OS.", "error");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!uploadForm.file) {
      addToast("Selecione um arquivo para anexar.", "error");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("tipo_anexo", uploadForm.tipo_anexo);
      formData.append("descricao", uploadForm.descricao || "");
      formData.append("data_documento", uploadForm.data_documento || "");

      const response = await fetch(`/api/ordens-servico/${osId}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível anexar o documento.");
      }

      if (data?.anexo) {
        setAnexos((current) => [data.anexo, ...current]);
      }

      setUploadForm(emptyUploadForm);

      addToast(data?.message || "Documento anexado com sucesso.", "success");

      void loadOrdemServico();
    } catch (error) {
      console.error("OS_DETAIL_UPLOAD_ERROR:", error);

      addToast(error?.message || "Não foi possível anexar o documento.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAnexo(anexo) {
    if (!anexo?.id) return;

    try {
      setIsDeletingAnexoId(anexo.id);

      const response = await fetch(
        `/api/ordens-servico/${osId}?anexoId=${encodeURIComponent(anexo.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível remover o documento.");
      }

      setAnexos((current) => current.filter((item) => item.id !== anexo.id));

      addToast(data?.message || "Documento removido com sucesso.", "success");
    } catch (error) {
      console.error("OS_DETAIL_DELETE_ANEXO_ERROR:", error);

      addToast(error?.message || "Não foi possível remover o documento.", "error");
    } finally {
      setIsDeletingAnexoId("");
    }
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/ordens-servico/${osId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível excluir a OS.");
      }

      addToast(data?.message || "Ordem de serviço excluída.", "success");

      router.push("/admin/ordens-servico");
      router.refresh();
    } catch (error) {
      console.error("OS_DETAIL_DELETE_ERROR:", error);

      addToast(error?.message || "Não foi possível excluir a OS.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const pageContent = useMemo(() => {
    if (isLoading) {
      return (
        <section className="rounded-[38px] border border-border bg-card p-6 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)]">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-[24px] bg-background"
              />
            ))}
          </div>
        </section>
      );
    }

    if (loadError) {
      return (
        <section className="rounded-[38px] border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="text-sm font-black">{loadError}</p>
        </section>
      );
    }

    if (!ordemServico) {
      return (
        <section className="rounded-[38px] border border-dashed border-border bg-card p-8 text-center">
          <h2 className="text-xl font-black tracking-[-0.045em] text-dark-title">
            Ordem de serviço não encontrada.
          </h2>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Essa OS pode ter sido removida ou não pertence à conta atual.
          </p>
        </section>
      );
    }

    return (
      <>
        <OrdemServicoHeader
          ordemServico={ordemServico}
          cliente={cliente}
          vendedor={vendedor}
          canDelete={canDelete}
          isSaving={isSavingQuick || isSavingEdit || isDeleting}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />

        <OrdemServicoResumoCards ordemServico={ordemServico} />

        <OrdemServicoQuickPanel
          ordemServico={ordemServico}
          quickForm={quickForm}
          onChange={updateQuickForm}
          onSubmit={handleQuickSubmit}
          isSaving={isSavingQuick}
        />

        <OrdemServicoDetailsGrid
          ordemServico={ordemServico}
          cliente={cliente}
          vendedor={vendedor}
          receita={receita}
          armacao={armacao}
          lente={lente}
        />

        <OrdemServicoDocumentos
          anexos={anexos}
          uploadForm={uploadForm}
          onUploadFormChange={updateUploadForm}
          onUpload={handleUpload}
          onDeleteAnexo={handleDeleteAnexo}
          isUploading={isUploading}
          isDeletingAnexoId={isDeletingAnexoId}
        />

        <OrdemServicoTimeline historicoStatus={historicoStatus} />
      </>
    );
  }, [
    anexos,
    armacao,
    canDelete,
    cliente,
    historicoStatus,
    isDeleting,
    isDeletingAnexoId,
    isLoading,
    isSavingEdit,
    isSavingQuick,
    isUploading,
    lente,
    loadError,
    ordemServico,
    quickForm,
    receita,
    uploadForm,
    vendedor,
  ]);

  return (
    <main className="space-y-6">
      {pageContent}

      <OrdemServicoEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editForm={editForm}
        onChange={updateEditForm}
        onSubmit={handleEditSubmit}
        isSaving={isSavingEdit}
      />

      <ConfirmDeleteOrdemServicoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ordemServico={ordemServico}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}
