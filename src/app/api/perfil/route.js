import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

/* ==========================================================================
   CLIENTE ADMIN / SERVICE ROLE
   ========================================================================== */

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const AVATAR_BUCKET = "avatars";

const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

/* ==========================================================================
   AUTENTICAÇÃO / PERFIL LOGADO
   ========================================================================== */

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      profile: null,
      error: NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      profile: null,
      error: NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 404 }
      ),
    };
  }

  if (profile.status !== "ativo") {
    return {
      supabase,
      profile: null,
      error: NextResponse.json(
        { error: "Seu acesso está inativo ou bloqueado." },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    profile,
    error: null,
  };
}

/* ==========================================================================
   HELPERS GERAIS
   ========================================================================== */

function normalizeText(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim().toLowerCase();

  return trimmed || null;
}

function isValidPassword(password) {
  return typeof password === "string" && password.trim().length >= 8;
}

function cleanPerfilPayload(body = {}) {
  const {
    id,
    conta_id,
    role,
    cargo,
    status,
    ultimo_acesso_em,
    created_at,
    updated_at,
    password,
    confirmPassword,
    pode_alterar_senha,
    image_url,
    ...payload
  } = body;

  return payload;
}

function normalizePerfilPayload(body = {}) {
  const payload = cleanPerfilPayload(body);

  return {
    ...payload,
    nome_completo: normalizeText(payload.nome_completo),
    email: normalizeEmail(payload.email),
    telefone: normalizeText(payload.telefone),
  };
}

function buildSafePerfil(perfil) {
  if (!perfil) return null;

  return {
    ...perfil,
    pode_alterar_senha: perfil.role === "admin",
  };
}

/* ==========================================================================
   HELPERS DE AVATAR
   ========================================================================== */

function getFileExtension(file) {
  const originalName = String(file?.name || "").trim();
  const extensionFromName = originalName.split(".").pop()?.toLowerCase();

  if (
    extensionFromName &&
    ["jpg", "jpeg", "png", "webp"].includes(extensionFromName)
  ) {
    return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
  }

  if (file?.type === "image/png") return "png";
  if (file?.type === "image/webp") return "webp";

  return "jpg";
}

function buildAvatarStoragePath(profile, file) {
  const extension = getFileExtension(file);
  const uniqueName = `${crypto.randomUUID()}.${extension}`;

  return `${profile.conta_id}/${profile.id}/${uniqueName}`;
}

function extractAvatarStoragePathFromPublicUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = url.pathname.slice(markerIndex + marker.length);

    return decodeURIComponent(path || "") || null;
  } catch {
    return null;
  }
}

function validateAvatarFile(file) {
  if (!file) return null;

  if (!(file instanceof File)) {
    return "Arquivo de avatar inválido.";
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return "Envie uma imagem JPG, PNG ou WEBP.";
  }

  if (file.size > AVATAR_MAX_SIZE) {
    return "A imagem deve ter no máximo 5 MB.";
  }

  return null;
}

/* ==========================================================================
   LEITURA DO BODY
   Aceita:
   - JSON normal
   - multipart/form-data com:
     perfil: JSON string
     avatar: File opcional
   ========================================================================== */

async function readRequestBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    const perfilRaw = formData.get("perfil");
    const avatar = formData.get("avatar");

    let body = {};

    try {
      body = perfilRaw ? JSON.parse(String(perfilRaw)) : {};
    } catch {
      throw new Error("Payload do perfil inválido.");
    }

    return {
      body,
      avatar: avatar instanceof File && avatar.size > 0 ? avatar : null,
    };
  }

  return {
    body: await request.json(),
    avatar: null,
  };
}

/* ==========================================================================
   GET
   Retorna o perfil completo do usuário logado
   ========================================================================== */

export async function GET() {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const admin = createAdminClient();

    const { data: perfil, error: perfilError } = await admin
      .from("usuarios")
      .select("*")
      .eq("id", profile.id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (perfilError || !perfil) {
      console.error("PERFIL_GET_ERROR:", perfilError);

      return NextResponse.json(
        { error: "Não foi possível carregar o perfil do usuário." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      perfil: buildSafePerfil(perfil),
    });
  } catch (error) {
    console.error("PERFIL_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao carregar o perfil." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT
   Atualiza o perfil do usuário logado

   JSON:
   {
     ...perfilCompleto
   }

   FormData:
   perfil: JSON.stringify(perfilCompleto)
   avatar: File opcional
   ========================================================================== */

export async function PUT(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const { body, avatar } = await readRequestBody(request);
    const payload = normalizePerfilPayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome completo." },
        { status: 400 }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        { error: "Informe o e-mail." },
        { status: 400 }
      );
    }

    const avatarValidationError = validateAvatarFile(avatar);

    if (avatarValidationError) {
      return NextResponse.json(
        { error: avatarValidationError },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: perfilAtual, error: perfilAtualError } = await admin
      .from("usuarios")
      .select("*")
      .eq("id", profile.id)
      .eq("conta_id", profile.conta_id)
      .single();

    if (perfilAtualError || !perfilAtual) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado." },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------------------
       ALTERAÇÃO DE SENHA
       Apenas admins podem trocar a própria senha nesta tela
       ---------------------------------------------------------------------- */

    if (body.password || body.confirmPassword) {
      if (perfilAtual.role !== "admin") {
        return NextResponse.json(
          {
            error:
              "Apenas administradores podem alterar a senha nesta tela.",
          },
          { status: 403 }
        );
      }

      const password =
        typeof body.password === "string" ? body.password.trim() : "";

      const confirmPassword =
        typeof body.confirmPassword === "string"
          ? body.confirmPassword.trim()
          : "";

      if (!isValidPassword(password)) {
        return NextResponse.json(
          { error: "A nova senha precisa ter pelo menos 8 caracteres." },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { error: "As senhas não coincidem." },
          { status: 400 }
        );
      }

      const { error: updatePasswordError } =
        await admin.auth.admin.updateUserById(profile.id, {
          password,
        });

      if (updatePasswordError) {
        console.error(
          "PERFIL_PUT_PASSWORD_ERROR:",
          updatePasswordError
        );

        return NextResponse.json(
          { error: "Não foi possível atualizar a senha." },
          { status: 500 }
        );
      }
    }

    /* ----------------------------------------------------------------------
       ALTERAÇÃO DE E-MAIL NO AUTH
       Mantém tabela usuarios e login sincronizados
       ---------------------------------------------------------------------- */

    if (payload.email !== perfilAtual.email) {
      const { error: updateAuthEmailError } =
        await admin.auth.admin.updateUserById(profile.id, {
          email: payload.email,
          email_confirm: true,
        });

      if (updateAuthEmailError) {
        console.error(
          "PERFIL_PUT_EMAIL_AUTH_ERROR:",
          updateAuthEmailError
        );

        return NextResponse.json(
          { error: "Não foi possível atualizar o e-mail de login." },
          { status: 500 }
        );
      }
    }

    /* ----------------------------------------------------------------------
       UPLOAD DO NOVO AVATAR
       ---------------------------------------------------------------------- */

    let nextImageUrl = perfilAtual.image_url || null;
    let previousAvatarPath = null;

    if (avatar) {
      const avatarPath = buildAvatarStoragePath(profile, avatar);

      const avatarArrayBuffer = await avatar.arrayBuffer();
      const avatarBuffer = Buffer.from(avatarArrayBuffer);

      const { error: uploadAvatarError } = await admin.storage
        .from(AVATAR_BUCKET)
        .upload(avatarPath, avatarBuffer, {
          contentType: avatar.type,
          upsert: false,
        });

      if (uploadAvatarError) {
        console.error("PERFIL_PUT_UPLOAD_AVATAR_ERROR:", uploadAvatarError);

        return NextResponse.json(
          { error: "Não foi possível enviar a nova foto de perfil." },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = admin.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(avatarPath);

      nextImageUrl = publicUrlData?.publicUrl || null;

      previousAvatarPath =
        extractAvatarStoragePathFromPublicUrl(perfilAtual.image_url);
    }

    /* ----------------------------------------------------------------------
       ATUALIZAÇÃO DO PERFIL
       ---------------------------------------------------------------------- */

    const { data: perfilAtualizado, error: updatePerfilError } =
      await admin
        .from("usuarios")
        .update({
          ...payload,
          image_url: nextImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .eq("conta_id", profile.conta_id)
        .select("*")
        .single();

    if (updatePerfilError) {
      console.error("PERFIL_PUT_ERROR:", updatePerfilError);

      return NextResponse.json(
        { error: "Não foi possível atualizar o perfil." },
        { status: 500 }
      );
    }

    /* ----------------------------------------------------------------------
       EXCLUSÃO DO AVATAR ANTERIOR
       Só acontece depois que:
       - novo avatar subiu
       - perfil foi salvo com sucesso
       ---------------------------------------------------------------------- */

    if (avatar && previousAvatarPath) {
      const { error: removePreviousAvatarError } = await admin.storage
        .from(AVATAR_BUCKET)
        .remove([previousAvatarPath]);

      if (removePreviousAvatarError) {
        console.error(
          "PERFIL_PUT_REMOVE_OLD_AVATAR_ERROR:",
          removePreviousAvatarError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: avatar
        ? "Perfil e foto atualizados com sucesso."
        : "Perfil atualizado com sucesso.",
      perfil: buildSafePerfil(perfilAtualizado),
    });
  } catch (error) {
    console.error("PERFIL_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message === "Payload do perfil inválido."
            ? error.message
            : "Erro interno ao atualizar o perfil.",
      },
      { status: error?.message === "Payload do perfil inválido." ? 400 : 500 }
    );
  }
}