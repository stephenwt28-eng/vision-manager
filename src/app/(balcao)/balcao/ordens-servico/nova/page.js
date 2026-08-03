"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { BalcaoOrdemServicoFormPage } from "./form-page";

export default function BalcaoNovaOrdemServicoPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [catalogoArmacoes, setCatalogoArmacoes] = useState([]);
  const [catalogoLentes, setCatalogoLentes] = useState([]);
  const [catalogoLaboratorios, setCatalogoLaboratorios] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadFormData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch("/api/ordens-servico", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar os dados para criar a OS."
        );
      }

      setClientes(data?.clientes || []);
      setVendedores(data?.vendedores || []);
      setCatalogoArmacoes(data?.catalogoArmacoes || []);
      setCatalogoLentes(data?.catalogoLentes || []);
      setCatalogoLaboratorios(data?.catalogoLaboratorios || []);
    } catch (error) {
      console.error("BALCAO_NOVA_OS_LOAD_ERROR:", error);
      addToast(
        error?.message || "Não foi possível carregar os dados para criar a OS.",
        "error"
      );
      setLoadError(
        error?.message || "Não foi possível carregar os dados para criar a OS."
      );
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

  async function handleSubmit(payload) {
    try {
      setIsSaving(true);

      const response = await fetch("/api/ordens-servico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível criar a OS.");
      }

      addToast(
        data?.message || "Ordem de serviço criada com sucesso.",
        "success"
      );

      router.push("/balcao/ordens-servico");
      router.refresh();
    } catch (error) {
      console.error("BALCAO_NOVA_OS_SAVE_ERROR:", error);
      addToast(error?.message || "Não foi possível criar a OS.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    router.push("/balcao/ordens-servico");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[38px] border border-border bg-card p-5 shadow-[0_30px_80px_-66px_rgba(15,23,42,0.40)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.06em] text-dark-title sm:text-4xl">
              Cadastre a ordem de serviço direto no balcão.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Aqui o atendimento já nasce no formulário completo.
            </p>
          </div>

          <Button asChild variant="outline" className="h-11 rounded-full px-5 font-black">
            <Link href="/balcao/ordens-servico">
              <ArrowLeft className="size-4" />
              Voltar para ordens
            </Link>
          </Button>
        </div>
      </section>

      {isLoading ? (
        <section className="flex min-h-[320px] items-center justify-center rounded-[38px] border border-border bg-card p-6">
          <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            Carregando formulário...
          </div>
        </section>
      ) : loadError ? (
        <section className="rounded-[38px] border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="text-lg font-black">Não foi possível abrir o formulário.</p>
          <p className="mt-2 text-sm leading-6">{loadError}</p>
        </section>
      ) : (
        <BalcaoOrdemServicoFormPage
          ordemServico={null}
          receita={null}
          armacao={null}
          lente={null}
          clientes={clientes}
          vendedores={vendedores}
          catalogoArmacoes={catalogoArmacoes}
          catalogoLentes={catalogoLentes}
          catalogoLaboratorios={catalogoLaboratorios}
          onOpenChange={handleClose}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
