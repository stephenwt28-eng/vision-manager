"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/contexts/ToastContext";

import {
  PerfilErrorState,
  PerfilFormCard,
  PerfilHero,
  PerfilLoadingState,
  PerfilSenhaAdminCard,
} from "./components";

/* ==========================================================================
   ESTADOS INICIAIS
   ========================================================================== */

const initialProfileForm = {
  nome_completo: "",
  email: "",
  telefone: "",
};

const initialPasswordForm = {
  password: "",
  confirmPassword: "",
};

const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

/* ==========================================================================
   HELPERS
   ========================================================================== */

function buildProfileForm(perfil) {
  return {
    nome_completo: perfil?.nome_completo || "",
    email: perfil?.email || "",
    telefone: perfil?.telefone || "",
  };
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function AdminPerfilPage() {
  const { addToast } = useToast();

  const [perfil, setPerfil] = useState(null);

  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  /* ==========================================================================
     LIMPEZA DO PREVIEW LOCAL
     ========================================================================== */

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  /* ==========================================================================
     CARREGAMENTO
     ========================================================================== */

  const loadPerfil = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setLoadError("");

        const response = await fetch("/api/perfil", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Não foi possível carregar o perfil."
          );
        }

        const nextPerfil = data?.perfil || null;

        setPerfil(nextPerfil);
        setProfileForm(buildProfileForm(nextPerfil));

        setAvatarFile(null);
        setAvatarPreviewUrl("");
      } catch (error) {
        console.error("PERFIL_PAGE_LOAD_ERROR:", error);

        const message =
          error?.message || "Não foi possível carregar o perfil.";

        setLoadError(message);
        addToast(message, "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void loadPerfil();
    });

    return () => {
      cancelled = true;
    };
  }, [loadPerfil]);

  /* ==========================================================================
     AVATAR
     ========================================================================== */

  function handleAvatarChange(file) {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreviewUrl("");
      return;
    }

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      addToast(
        "Envie uma imagem JPG, PNG ou WEBP.",
        "error"
      );
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      addToast(
        "A imagem deve ter no máximo 5 MB.",
        "error"
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
  }

  /* ==========================================================================
     UPDATE DO PERFIL
     ========================================================================== */

  async function handleSubmitProfile() {
    if (!perfil) return;

    try {
      setIsSavingProfile(true);

      const payload = {
        ...perfil,
        ...profileForm,
      };

      const formData = new FormData();

      formData.append("perfil", JSON.stringify(payload));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/perfil", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar o perfil."
        );
      }

      const perfilAtualizado = data?.perfil || null;

      setPerfil(perfilAtualizado);
      setProfileForm(buildProfileForm(perfilAtualizado));

      setAvatarFile(null);
      setAvatarPreviewUrl("");

      addToast(
        data?.message || "Perfil atualizado com sucesso.",
        "success"
      );
    } catch (error) {
      console.error("PERFIL_PAGE_SAVE_PROFILE_ERROR:", error);

      addToast(
        error?.message || "Não foi possível salvar o perfil.",
        "error"
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  /* ==========================================================================
     UPDATE DE SENHA
     ========================================================================== */

  async function handleSubmitPassword() {
    if (!perfil?.pode_alterar_senha) return;

    try {
      setIsSavingPassword(true);

      const payload = {
        ...perfil,
        ...profileForm,
        ...passwordForm,
      };

      const response = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar a senha."
        );
      }

      const perfilAtualizado = data?.perfil || null;

      setPerfil(perfilAtualizado);
      setProfileForm(buildProfileForm(perfilAtualizado));
      setPasswordForm(initialPasswordForm);

      addToast(
        data?.message || "Senha atualizada com sucesso.",
        "success"
      );
    } catch (error) {
      console.error("PERFIL_PAGE_SAVE_PASSWORD_ERROR:", error);

      addToast(
        error?.message || "Não foi possível atualizar a senha.",
        "error"
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  /* ==========================================================================
     ESTADOS DE TELA
     ========================================================================== */

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PerfilLoadingState />
      </main>
    );
  }

  if (loadError || !perfil) {
    return (
      <main className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PerfilErrorState
          message={loadError}
          onRetry={() => loadPerfil()}
        />
      </main>
    );
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <main className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <PerfilHero
        perfil={perfil}
        isRefreshing={isRefreshing}
        onRefresh={() => loadPerfil({ refresh: true })}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <PerfilFormCard
          perfil={perfil}
          formData={profileForm}
          avatarFile={avatarFile}
          avatarPreviewUrl={avatarPreviewUrl}
          onChange={setProfileForm}
          onAvatarChange={handleAvatarChange}
          onSubmit={handleSubmitProfile}
          isSaving={isSavingProfile}
        />

        {perfil?.pode_alterar_senha ? (
          <PerfilSenhaAdminCard
            passwordData={passwordForm}
            onChange={setPasswordForm}
            onSubmit={handleSubmitPassword}
            isSaving={isSavingPassword}
          />
        ) : null}
      </div>
    </main>
  );
}