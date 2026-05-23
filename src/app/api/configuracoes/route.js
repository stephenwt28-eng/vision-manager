// src/app/api/clientes/route.js
// RECOMENDAÇÃO DE ARQUITETURA:
// src/app/api/configuracoes/route.js

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
   AUTENTICAÇÃO / PERFIL
   ========================================================================== */

async function getAuthenticatedAdminProfile() {
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
    .select("id, conta_id, role, status")
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

  if (profile.role !== "admin") {
    return {
      supabase,
      profile: null,
      error: NextResponse.json(
        { error: "Apenas administradores podem acessar as configurações." },
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

function normalizeNullableDate(value) {
  if (!value || typeof value !== "string") return null;

  return value.trim() || null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function normalizePositiveInteger(value, fallback = null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function isValidPassword(password) {
  return typeof password === "string" && password.trim().length >= 8;
}

function cleanContaPayload(body = {}) {
  const {
    id,
    created_at,
    updated_at,
    conta_id,
    ...payload
  } = body;

  return payload;
}

function cleanConfiguracoesPayload(body = {}) {
  const {
    id,
    conta_id,
    created_at,
    updated_at,
    ...payload
  } = body;

  return payload;
}

function cleanUsuarioPayload(body = {}) {
  const {
    id,
    conta_id,
    created_at,
    updated_at,
    ultimo_acesso_em,
    role,
    password,
    confirmPassword,
    ...payload
  } = body;

  return payload;
}

function normalizeContaPayload(body = {}) {
  const payload = cleanContaPayload(body);

  return {
    ...payload,
    nome_fantasia: normalizeText(payload.nome_fantasia),
    razao_social: normalizeText(payload.razao_social),
    cnpj: normalizeText(payload.cnpj),
    inscricao_estadual: normalizeText(payload.inscricao_estadual),
    telefone: normalizeText(payload.telefone),
    email: normalizeEmail(payload.email),
    cep: normalizeText(payload.cep),
    rua: normalizeText(payload.rua),
    numero: normalizeText(payload.numero),
    complemento: normalizeText(payload.complemento),
    bairro: normalizeText(payload.bairro),
    cidade: normalizeText(payload.cidade),
    estado: normalizeText(payload.estado),
    pais: normalizeText(payload.pais) || "Brasil",
    status: normalizeText(payload.status),
    data_inicio_assinatura: normalizeNullableDate(
      payload.data_inicio_assinatura
    ),
    data_fim_assinatura: normalizeNullableDate(
      payload.data_fim_assinatura
    ),
    observacoes: normalizeText(payload.observacoes),
  };
}

function normalizeConfiguracoesPayload(body = {}) {
  const payload = cleanConfiguracoesPayload(body);

  return {
    ...payload,
    prefixo_os: normalizeText(payload.prefixo_os) || "OS",
    proximo_numero_os: normalizePositiveInteger(
      payload.proximo_numero_os,
      1
    ),
    permitir_edicao_os_terminal: normalizeBoolean(
      payload.permitir_edicao_os_terminal,
      true
    ),
    permitir_alterar_status_os_terminal: normalizeBoolean(
      payload.permitir_alterar_status_os_terminal,
      true
    ),
    permitir_anexos_terminal: normalizeBoolean(
      payload.permitir_anexos_terminal,
      true
    ),
    exibir_valor_vendido_relatorio_vendedor: normalizeBoolean(
      payload.exibir_valor_vendido_relatorio_vendedor,
      true
    ),
    exibir_comissao_relatorio_vendedor: normalizeBoolean(
      payload.exibir_comissao_relatorio_vendedor,
      true
    ),
    exigir_observacao_ao_cancelar_os: normalizeBoolean(
      payload.exigir_observacao_ao_cancelar_os,
      false
    ),
    moeda: normalizeText(payload.moeda) || "BRL",
    fuso_horario:
      normalizeText(payload.fuso_horario) || "America/Sao_Paulo",
  };
}

function normalizeUsuarioCreatePayload(body = {}) {
  return {
    nome_completo: normalizeText(body.nome_completo),
    email: normalizeEmail(body.email),
    telefone: normalizeText(body.telefone),
    image_url: normalizeText(body.image_url),
    role: normalizeText(body.role) || "balcao",
    cargo: normalizeText(body.cargo),
    status: normalizeText(body.status) || "ativo",
    password:
      typeof body.password === "string" ? body.password.trim() : "",
    confirmPassword:
      typeof body.confirmPassword === "string"
        ? body.confirmPassword.trim()
        : "",
  };
}

function normalizeUsuarioUpdatePayload(body = {}) {
  const payload = cleanUsuarioPayload(body);

  return {
    ...payload,
    nome_completo: normalizeText(payload.nome_completo),
    email: normalizeEmail(payload.email),
    telefone: normalizeText(payload.telefone),
    image_url: normalizeText(payload.image_url),
    cargo: normalizeText(payload.cargo),
    status: normalizeText(payload.status),
  };
}

function buildSafeUsuarios(usuarios = []) {
  return usuarios.map((usuario) => ({
    ...usuario,
    pode_editar: usuario.role === "balcao",
    pode_remover: usuario.role === "balcao",
  }));
}

/* ==========================================================================
   GET
   Retorna:
   - conta
   - configuracoes
   - usuarios
   ========================================================================== */

export async function GET() {
  try {
    const { profile, error } = await getAuthenticatedAdminProfile();

    if (error) return error;

    const admin = createAdminClient();

    const [
      contaResponse,
      configuracoesResponse,
      usuariosResponse,
    ] = await Promise.all([
      admin
        .from("contas")
        .select("*")
        .eq("id", profile.conta_id)
        .single(),

      admin
        .from("configuracoes_conta")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .maybeSingle(),

      admin
        .from("usuarios")
        .select("*")
        .eq("conta_id", profile.conta_id)
        .order("created_at", { ascending: true }),
    ]);

    if (contaResponse.error) {
      console.error("CONFIGURACOES_GET_CONTA_ERROR:", contaResponse.error);

      return NextResponse.json(
        { error: "Não foi possível carregar os dados da conta." },
        { status: 500 }
      );
    }

    if (configuracoesResponse.error) {
      console.error(
        "CONFIGURACOES_GET_PREFERENCIAS_ERROR:",
        configuracoesResponse.error
      );

      return NextResponse.json(
        { error: "Não foi possível carregar as preferências da conta." },
        { status: 500 }
      );
    }

    if (usuariosResponse.error) {
      console.error(
        "CONFIGURACOES_GET_USUARIOS_ERROR:",
        usuariosResponse.error
      );

      return NextResponse.json(
        { error: "Não foi possível carregar os usuários da plataforma." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conta: contaResponse.data,
      configuracoes: configuracoesResponse.data || null,
      usuarios: buildSafeUsuarios(usuariosResponse.data || []),
    });
  } catch (error) {
    console.error("CONFIGURACOES_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao carregar as configurações." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST
   Cria novo usuário da plataforma
   Roles permitidas:
   - admin
   - balcao
   ========================================================================== */

export async function POST(request) {
  try {
    const { profile, error } = await getAuthenticatedAdminProfile();

    if (error) return error;

    const body = await request.json();
    const payload = normalizeUsuarioCreatePayload(body);

    if (!payload.nome_completo) {
      return NextResponse.json(
        { error: "Informe o nome completo do usuário." },
        { status: 400 }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        { error: "Informe o e-mail do usuário." },
        { status: 400 }
      );
    }

    if (!["admin", "balcao"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Perfil de acesso inválido." },
        { status: 400 }
      );
    }

    if (!["ativo", "inativo", "bloqueado"].includes(payload.status)) {
      return NextResponse.json(
        { error: "Status de usuário inválido." },
        { status: 400 }
      );
    }

    if (!isValidPassword(payload.password)) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (payload.password !== payload.confirmPassword) {
      return NextResponse.json(
        { error: "As senhas não coincidem." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: existingUser, error: existingUserError } = await admin
      .from("usuarios")
      .select("id")
      .eq("email", payload.email)
      .maybeSingle();

    if (existingUserError) {
      console.error(
        "CONFIGURACOES_POST_CHECK_EMAIL_ERROR:",
        existingUserError
      );

      return NextResponse.json(
        { error: "Não foi possível validar o e-mail informado." },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este e-mail." },
        { status: 409 }
      );
    }

    const { data: authData, error: createAuthError } =
      await admin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
          nome_completo: payload.nome_completo,
          telefone: payload.telefone,
          role: payload.role,
        },
      });

    if (createAuthError || !authData?.user) {
      console.error(
        "CONFIGURACOES_POST_CREATE_AUTH_USER_ERROR:",
        createAuthError
      );

      return NextResponse.json(
        {
          error:
            createAuthError?.message ||
            "Não foi possível criar o login do usuário.",
        },
        { status: 400 }
      );
    }

    const novoUsuario = {
      id: authData.user.id,
      conta_id: profile.conta_id,
      nome_completo: payload.nome_completo,
      email: payload.email,
      telefone: payload.telefone,
      image_url: payload.image_url,
      role: payload.role,
      cargo:
        payload.cargo ||
        (payload.role === "admin" ? "administrador" : "balcão"),
      status: payload.status,
    };

    const { data: usuarioCriado, error: insertProfileError } = await admin
      .from("usuarios")
      .insert(novoUsuario)
      .select("*")
      .single();

    if (insertProfileError) {
      console.error(
        "CONFIGURACOES_POST_INSERT_PROFILE_ERROR:",
        insertProfileError
      );

      await admin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Não foi possível salvar o perfil do novo usuário." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuário criado com sucesso.",
        usuario: {
          ...usuarioCriado,
          pode_editar: usuarioCriado.role === "balcao",
          pode_remover: usuarioCriado.role === "balcao",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CONFIGURACOES_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar usuário." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT
   Atualiza:
   - conta
   - configuracoes
   - usuario balcao

   Body esperado:
   {
     "tipo": "conta" | "configuracoes" | "usuario",
     ...payloadCompleto
   }
   ========================================================================== */

export async function PUT(request) {
  try {
    const { profile, error } = await getAuthenticatedAdminProfile();

    if (error) return error;

    const body = await request.json();
    const tipo = body?.tipo;

    if (!["conta", "configuracoes", "usuario"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de atualização inválido." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    /* ----------------------------------------------------------------------
       ATUALIZAR CONTA
       ---------------------------------------------------------------------- */

    if (tipo === "conta") {
      const payload = normalizeContaPayload(body);

      if (!payload.nome_fantasia) {
        return NextResponse.json(
          { error: "Informe o nome fantasia da ótica." },
          { status: 400 }
        );
      }

      const { data, error: updateContaError } = await admin
        .from("contas")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.conta_id)
        .select("*")
        .single();

      if (updateContaError) {
        console.error(
          "CONFIGURACOES_PUT_CONTA_ERROR:",
          updateContaError
        );

        return NextResponse.json(
          { error: "Não foi possível atualizar os dados da conta." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Dados da conta atualizados com sucesso.",
        conta: data,
      });
    }

    /* ----------------------------------------------------------------------
       ATUALIZAR CONFIGURAÇÕES
       ---------------------------------------------------------------------- */

    if (tipo === "configuracoes") {
      const payload = normalizeConfiguracoesPayload(body);

      const { data, error: upsertConfiguracoesError } = await admin
        .from("configuracoes_conta")
        .upsert(
          {
            ...payload,
            conta_id: profile.conta_id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "conta_id",
          }
        )
        .select("*")
        .single();

      if (upsertConfiguracoesError) {
        console.error(
          "CONFIGURACOES_PUT_PREFERENCIAS_ERROR:",
          upsertConfiguracoesError
        );

        return NextResponse.json(
          { error: "Não foi possível atualizar as preferências da conta." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Preferências da conta atualizadas com sucesso.",
        configuracoes: data,
      });
    }

    /* ----------------------------------------------------------------------
       ATUALIZAR USUÁRIO BALCÃO
       ---------------------------------------------------------------------- */

    if (tipo === "usuario") {
      const usuarioId = body?.id;

      if (!usuarioId) {
        return NextResponse.json(
          { error: "Informe o ID do usuário." },
          { status: 400 }
        );
      }

      const { data: usuarioAtual, error: usuarioAtualError } = await admin
        .from("usuarios")
        .select("*")
        .eq("id", usuarioId)
        .eq("conta_id", profile.conta_id)
        .single();

      if (usuarioAtualError || !usuarioAtual) {
        return NextResponse.json(
          { error: "Usuário não encontrado." },
          { status: 404 }
        );
      }

      if (usuarioAtual.role === "admin") {
        return NextResponse.json(
          {
            error:
              "Usuários administradores podem ser visualizados, mas não editados.",
          },
          { status: 403 }
        );
      }

      const payload = normalizeUsuarioUpdatePayload(body);

      if (!payload.nome_completo) {
        return NextResponse.json(
          { error: "Informe o nome completo do usuário." },
          { status: 400 }
        );
      }

      if (!payload.email) {
        return NextResponse.json(
          { error: "Informe o e-mail do usuário." },
          { status: 400 }
        );
      }

      if (
        payload.status &&
        !["ativo", "inativo", "bloqueado"].includes(payload.status)
      ) {
        return NextResponse.json(
          { error: "Status de usuário inválido." },
          { status: 400 }
        );
      }

      if (
        body.password ||
        body.confirmPassword
      ) {
        const password =
          typeof body.password === "string"
            ? body.password.trim()
            : "";

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
          await admin.auth.admin.updateUserById(usuarioId, {
            password,
          });

        if (updatePasswordError) {
          console.error(
            "CONFIGURACOES_PUT_USUARIO_PASSWORD_ERROR:",
            updatePasswordError
          );

          return NextResponse.json(
            { error: "Não foi possível atualizar a senha do usuário." },
            { status: 500 }
          );
        }
      }

      if (payload.email !== usuarioAtual.email) {
        const { error: updateAuthEmailError } =
          await admin.auth.admin.updateUserById(usuarioId, {
            email: payload.email,
            email_confirm: true,
          });

        if (updateAuthEmailError) {
          console.error(
            "CONFIGURACOES_PUT_USUARIO_EMAIL_AUTH_ERROR:",
            updateAuthEmailError
          );

          return NextResponse.json(
            { error: "Não foi possível atualizar o e-mail de login." },
            { status: 500 }
          );
        }
      }

      const { data: usuarioAtualizado, error: updateUsuarioError } =
        await admin
          .from("usuarios")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", usuarioId)
          .eq("conta_id", profile.conta_id)
          .select("*")
          .single();

      if (updateUsuarioError) {
        console.error(
          "CONFIGURACOES_PUT_USUARIO_ERROR:",
          updateUsuarioError
        );

        return NextResponse.json(
          { error: "Não foi possível atualizar o usuário." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Usuário atualizado com sucesso.",
        usuario: {
          ...usuarioAtualizado,
          pode_editar: true,
          pode_remover: true,
        },
      });
    }
  } catch (error) {
    console.error("CONFIGURACOES_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar configurações." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE
   Remove apenas usuário balcão
   Admin nunca pode ser removido por esta tela
   ========================================================================== */

export async function DELETE(request) {
  try {
    const { profile, error } = await getAuthenticatedAdminProfile();

    if (error) return error;

    const body = await request.json();
    const usuarioId = body?.id;

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Informe o ID do usuário." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: usuario, error: usuarioError } = await admin
      .from("usuarios")
      .select("*")
      .eq("id", usuarioId)
      .eq("conta_id", profile.conta_id)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    if (usuario.role === "admin") {
      return NextResponse.json(
        {
          error:
            "Usuários administradores podem ser visualizados, mas não removidos.",
        },
        { status: 403 }
      );
    }

    const { error: deleteAuthError } =
      await admin.auth.admin.deleteUser(usuarioId);

    if (deleteAuthError) {
      console.error(
        "CONFIGURACOES_DELETE_AUTH_USER_ERROR:",
        deleteAuthError
      );

      return NextResponse.json(
        { error: "Não foi possível remover o usuário." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário removido com sucesso.",
      id: usuarioId,
    });
  } catch (error) {
    console.error("CONFIGURACOES_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao remover usuário." },
      { status: 500 }
    );
  }
}