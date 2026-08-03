import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
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

  return {
    supabase,
    profile,
    error: null,
  };
}

function requireAdmin(profile) {
  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem gerenciar vendedores." },
      { status: 403 }
    );
  }

  return null;
}

/* ==========================================================================
   HELPERS DE NORMALIZAÇÃO
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

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeNumber(value, fallback = null) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanVendedorPayload(body = {}) {
  const {
    id,
    conta_id,
    created_at,
    updated_at,
    pin,
    pin_hash,
    pin_temporario,
    pin_definido_em,
    image_data_url,
    remover_imagem,
    regenerar_pin,
    ...payload
  } = body;

  return payload;
}

function normalizeVendedorPayload(body = {}) {
  const payload = cleanVendedorPayload(body);

  return {
    ...payload,
    nome_completo: normalizeText(payload.nome_completo),
    nome_exibicao: normalizeText(payload.nome_exibicao),
    cpf: normalizeText(payload.cpf),
    telefone: normalizeText(payload.telefone),
    email: normalizeEmail(payload.email),
    image_url: normalizeText(payload.image_url),
    cargo: normalizeText(payload.cargo) || "vendedor",
    data_admissao: normalizeNullableDate(payload.data_admissao),
    data_desligamento: normalizeNullableDate(payload.data_desligamento),
    comissao_padrao_percentual: normalizeNumber(
      payload.comissao_padrao_percentual,
      0
    ),
    meta_mensal_valor: normalizeNumber(payload.meta_mensal_valor, null),
    status: normalizeText(payload.status) || "ativo",
    observacoes: normalizeText(payload.observacoes),
  };
}

function sanitizeVendedor(vendedor) {
  if (!vendedor) return vendedor;

  const { pin_hash, ...safeVendedor } = vendedor;

  return safeVendedor;
}

function sanitizeVendedores(vendedores = []) {
  return vendedores.map(sanitizeVendedor);
}

/* ==========================================================================
   HELPERS DE PIN
   ========================================================================== */

function generatePin() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

function isValidPin(pin) {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

function hashPin(pin) {
  return createHash("sha256").update(pin).digest("hex");
}

/* ==========================================================================
   HELPERS DE IMAGEM / STORAGE
   ========================================================================== */

const AVATAR_BUCKET = "avatars";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const allowedImageMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const mimeToExtension = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return {
      error: "Imagem inválida. Envie JPG, PNG ou WEBP em formato compatível.",
    };
  }

  const match = dataUrl.match(/^data:(image\/jpeg|image\/png|image\/webp);base64,(.+)$/);

  if (!match) {
    return {
      error: "Imagem inválida. Envie JPG, PNG ou WEBP em formato compatível.",
    };
  }

  const mimeType = match[1];
  const base64 = match[2];

  if (!allowedImageMimes.has(mimeType)) {
    return {
      error: "Imagem inválida. Envie JPG, PNG ou WEBP em formato compatível.",
    };
  }

  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length) {
    return {
      error: "Imagem inválida. Envie JPG, PNG ou WEBP em formato compatível.",
    };
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    return {
      error: "A imagem deve ter no máximo 5 MB.",
    };
  }

  return {
    mimeType,
    buffer,
    extension: mimeToExtension[mimeType] || "webp",
    error: null,
  };
}

function extractStoragePathFromPublicUrl(url) {
  if (!url || typeof url !== "string") return null;

  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const rawPath = url.slice(markerIndex + marker.length);

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

async function removeAvatarIfExists(admin, imageUrl) {
  const path = extractStoragePathFromPublicUrl(imageUrl);

  if (!path) return;

  const { error } = await admin.storage.from(AVATAR_BUCKET).remove([path]);

  if (error) {
    console.error("VENDEDORES_REMOVE_AVATAR_ERROR:", {
      message: error.message,
    });
  }
}

async function uploadVendedorAvatar({
  admin,
  contaId,
  vendedorId,
  imageDataUrl,
}) {
  const parsed = parseDataUrl(imageDataUrl);

  if (parsed.error) {
    return {
      imageUrl: null,
      error: parsed.error,
    };
  }

  const filePath = `${contaId}/vendedores/${vendedorId}/${Date.now()}-${randomUUID()}.${parsed.extension}`;

  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, parsed.buffer, {
      contentType: parsed.mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("VENDEDORES_UPLOAD_AVATAR_ERROR:", {
      message: uploadError.message,
    });

    return {
      imageUrl: null,
      error: "Não foi possível enviar a imagem do vendedor.",
    };
  }

  const { data } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return {
    imageUrl: data?.publicUrl || null,
    error: null,
  };
}

/* ==========================================================================
   VALIDAÇÕES
   ========================================================================== */

function validateVendedorPayload(payload) {
  if (!payload.nome_completo) {
    return NextResponse.json(
      { error: "Informe o nome completo do vendedor." },
      { status: 400 }
    );
  }

  if (!payload.cargo) {
    return NextResponse.json(
      { error: "Informe o cargo do vendedor." },
      { status: 400 }
    );
  }

  if (!payload.telefone) {
    return NextResponse.json(
      { error: "Informe o telefone do vendedor." },
      { status: 400 }
    );
  }

  if (
    payload.status &&
    !["ativo", "inativo", "desligado", "bloqueado"].includes(payload.status)
  ) {
    return NextResponse.json(
      { error: "Status de vendedor inválido." },
      { status: 400 }
    );
  }

  if (Number(payload.comissao_padrao_percentual || 0) < 0) {
    return NextResponse.json(
      { error: "A comissão não pode ser negativa." },
      { status: 400 }
    );
  }

  return null;
}

async function checkDuplicateCpf({
  admin,
  contaId,
  cpf,
  ignoreVendedorId = null,
}) {
  if (!cpf) return null;

  let query = admin
    .from("vendedores")
    .select("id")
    .eq("conta_id", contaId)
    .eq("cpf", cpf)
    .limit(1);

  if (ignoreVendedorId) {
    query = query.neq("id", ignoreVendedorId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

/* ==========================================================================
   GET /api/vendedores
   ========================================================================== */

export async function GET() {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const admin = createAdminClient();

    const { data, error: vendedoresError } = await admin
      .from("vendedores")
      .select("*")
      .eq("conta_id", profile.conta_id)
      .order("created_at", { ascending: false });

    if (vendedoresError) {
      console.error("VENDEDORES_GET_ERROR:", {
        message: vendedoresError.message,
        details: vendedoresError.details,
        hint: vendedoresError.hint,
        code: vendedoresError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível buscar os vendedores." },
        { status: 400 }
      );
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const toDateOnly = (date) => date.toISOString().slice(0, 10);

    const { data: ordensDoMes, error: ordensError } = await admin
      .from("ordens_servico")
      .select("id, vendedor_id, valor_total, status, tipo_os, data_venda")
      .eq("conta_id", profile.conta_id)
      .eq("tipo_os", "venda")
      .neq("status", "cancelada")
      .gte("data_venda", toDateOnly(firstDayOfMonth))
      .lt("data_venda", toDateOnly(firstDayOfNextMonth));

    if (ordensError) {
      console.error("VENDEDORES_GET_METAS_ERROR:", {
        message: ordensError.message,
        details: ordensError.details,
        hint: ordensError.hint,
        code: ordensError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível calcular as metas dos vendedores." },
        { status: 400 }
      );
    }

    const metasPorVendedor = new Map();

    for (const ordem of ordensDoMes || []) {
      const vendedorId = ordem.vendedor_id;

      if (!vendedorId) continue;

      const atual = metasPorVendedor.get(vendedorId) || {
        meta_atual_valor: 0,
        meta_os_count: 0,
      };

      atual.meta_atual_valor += Number(ordem.valor_total || 0);
      atual.meta_os_count += 1;

      metasPorVendedor.set(vendedorId, atual);
    }

    const vendedoresComMetas = (data || []).map((vendedor) => {
      const metaMensal = Number(vendedor.meta_mensal_valor || 0);
      const resumoMeta = metasPorVendedor.get(vendedor.id) || {
        meta_atual_valor: 0,
        meta_os_count: 0,
      };

      const percentual =
        metaMensal > 0
          ? Math.min((resumoMeta.meta_atual_valor / metaMensal) * 100, 999)
          : 0;

      return {
        ...vendedor,
        meta_atual_valor: resumoMeta.meta_atual_valor,
        meta_os_count: resumoMeta.meta_os_count,
        meta_percentual: Number(percentual.toFixed(2)),
      };
    });

    return NextResponse.json({
      success: true,
      vendedores: sanitizeVendedores(vendedoresComMetas),
    });
  } catch (error) {
    console.error("VENDEDORES_GET_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar vendedores." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   POST /api/vendedores
   ========================================================================== */

export async function POST(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const permissionError = requireAdmin(profile);

    if (permissionError) return permissionError;

    const body = await request.json();
    const payload = normalizeVendedorPayload(body);

    const validationError = validateVendedorPayload(payload);

    if (validationError) return validationError;

    const pinTemporario =
      typeof body?.pin === "string" && body.pin.trim()
        ? body.pin.trim()
        : generatePin();

    if (!isValidPin(pinTemporario)) {
      return NextResponse.json(
        { error: "O PIN deve conter exatamente 4 dígitos." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const cpfDuplicado = await checkDuplicateCpf({
      admin,
      contaId: profile.conta_id,
      cpf: payload.cpf,
    });

    if (cpfDuplicado) {
      return NextResponse.json(
        { error: "Já existe um vendedor cadastrado com este CPF." },
        { status: 409 }
      );
    }

    const { data: vendedorCriado, error: insertError } = await admin
      .from("vendedores")
      .insert({
        ...payload,
        conta_id: profile.conta_id,
        pin_hash: hashPin(pinTemporario),
        pin_definido_em: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError || !vendedorCriado) {
      console.error("VENDEDORES_POST_ERROR:", {
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
        code: insertError?.code,
      });

      return NextResponse.json(
        { error: "Não foi possível cadastrar o vendedor." },
        { status: 400 }
      );
    }

    let vendedorFinal = vendedorCriado;

    if (body?.image_data_url) {
      const uploadResult = await uploadVendedorAvatar({
        admin,
        contaId: profile.conta_id,
        vendedorId: vendedorCriado.id,
        imageDataUrl: body.image_data_url,
      });

      if (uploadResult.error) {
        await admin
          .from("vendedores")
          .delete()
          .eq("id", vendedorCriado.id)
          .eq("conta_id", profile.conta_id);

        return NextResponse.json(
          { error: uploadResult.error },
          { status: 400 }
        );
      }

      const { data: vendedorComImagem, error: updateImageError } = await admin
        .from("vendedores")
        .update({
          image_url: uploadResult.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendedorCriado.id)
        .eq("conta_id", profile.conta_id)
        .select("*")
        .single();

      if (updateImageError || !vendedorComImagem) {
        console.error("VENDEDORES_POST_UPDATE_IMAGE_ERROR:", {
          message: updateImageError?.message,
          details: updateImageError?.details,
          hint: updateImageError?.hint,
          code: updateImageError?.code,
        });

        await removeAvatarIfExists(admin, uploadResult.imageUrl);

        return NextResponse.json(
          { error: "Não foi possível salvar a imagem do vendedor." },
          { status: 400 }
        );
      }

      vendedorFinal = vendedorComImagem;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Vendedor cadastrado com sucesso.",
        vendedor: sanitizeVendedor(vendedorFinal),
        pin_temporario: pinTemporario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("VENDEDORES_POST_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar vendedor." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   PUT /api/vendedores
   ========================================================================== */

export async function PUT(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const permissionError = requireAdmin(profile);

    if (permissionError) return permissionError;

    const body = await request.json();
    const vendedorId = body?.id;

    if (!vendedorId) {
      return NextResponse.json(
        { error: "ID do vendedor não informado." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: vendedorAtual, error: findError } = await admin
      .from("vendedores")
      .select("*")
      .eq("id", vendedorId)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !vendedorAtual) {
      return NextResponse.json(
        { error: "Vendedor não encontrado." },
        { status: 404 }
      );
    }

    const payload = normalizeVendedorPayload(body);

    const validationError = validateVendedorPayload(payload);

    if (validationError) return validationError;

    const cpfDuplicado = await checkDuplicateCpf({
      admin,
      contaId: profile.conta_id,
      cpf: payload.cpf,
      ignoreVendedorId: vendedorId,
    });

    if (cpfDuplicado) {
      return NextResponse.json(
        { error: "Já existe outro vendedor cadastrado com este CPF." },
        { status: 409 }
      );
    }

    let pinTemporario = null;
    let pinAtualizado = false;

    const shouldUpdateManualPin =
      typeof body?.pin === "string" && body.pin.trim();

    const shouldRegeneratePin = body?.regenerar_pin === true;

    const updatePayload = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    if (shouldUpdateManualPin || shouldRegeneratePin) {
      pinTemporario = shouldUpdateManualPin
        ? body.pin.trim()
        : generatePin();

      if (!isValidPin(pinTemporario)) {
        return NextResponse.json(
          { error: "O PIN deve conter exatamente 4 dígitos." },
          { status: 400 }
        );
      }

      updatePayload.pin_hash = hashPin(pinTemporario);
      updatePayload.pin_definido_em = new Date().toISOString();
      pinAtualizado = true;
    }

    if (body?.remover_imagem === true) {
      updatePayload.image_url = null;
    }

    let novaImagemUrl = null;

    if (body?.image_data_url) {
      const uploadResult = await uploadVendedorAvatar({
        admin,
        contaId: profile.conta_id,
        vendedorId,
        imageDataUrl: body.image_data_url,
      });

      if (uploadResult.error) {
        return NextResponse.json(
          { error: uploadResult.error },
          { status: 400 }
        );
      }

      novaImagemUrl = uploadResult.imageUrl;
      updatePayload.image_url = novaImagemUrl;
    }

    const { data: vendedorAtualizado, error: updateError } = await admin
      .from("vendedores")
      .update(updatePayload)
      .eq("id", vendedorId)
      .eq("conta_id", profile.conta_id)
      .select("*")
      .single();

    if (updateError || !vendedorAtualizado) {
      console.error("VENDEDORES_PUT_ERROR:", {
        message: updateError?.message,
        details: updateError?.details,
        hint: updateError?.hint,
        code: updateError?.code,
      });

      if (novaImagemUrl) {
        await removeAvatarIfExists(admin, novaImagemUrl);
      }

      return NextResponse.json(
        { error: "Não foi possível atualizar o vendedor." },
        { status: 400 }
      );
    }

    if (
      (body?.remover_imagem === true || novaImagemUrl) &&
      vendedorAtual.image_url
    ) {
      await removeAvatarIfExists(admin, vendedorAtual.image_url);
    }

    return NextResponse.json({
      success: true,
      message: "Vendedor atualizado com sucesso.",
      vendedor: sanitizeVendedor(vendedorAtualizado),
      pin_temporario: pinTemporario,
      pin_atualizado: pinAtualizado,
    });
  } catch (error) {
    console.error("VENDEDORES_PUT_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar vendedor." },
      { status: 500 }
    );
  }
}

/* ==========================================================================
   DELETE /api/vendedores
   ========================================================================== */

export async function DELETE(request) {
  try {
    const { profile, error } = await getAuthenticatedProfile();

    if (error) return error;

    const permissionError = requireAdmin(profile);

    if (permissionError) return permissionError;

    const body = await request.json();
    const vendedorId = body?.id;

    if (!vendedorId) {
      return NextResponse.json(
        { error: "ID do vendedor não informado." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: vendedor, error: findError } = await admin
      .from("vendedores")
      .select("*")
      .eq("id", vendedorId)
      .eq("conta_id", profile.conta_id)
      .single();

    if (findError || !vendedor) {
      return NextResponse.json(
        { error: "Vendedor não encontrado." },
        { status: 404 }
      );
    }

    const { data: osVinculada, error: osError } = await admin
      .from("ordens_servico")
      .select("id")
      .eq("conta_id", profile.conta_id)
      .eq("vendedor_id", vendedorId)
      .limit(1);

    if (osError) {
      console.error("VENDEDORES_DELETE_CHECK_OS_ERROR:", {
        message: osError.message,
        details: osError.details,
        hint: osError.hint,
        code: osError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível validar o histórico do vendedor." },
        { status: 400 }
      );
    }

    if (osVinculada?.length) {
      return NextResponse.json(
        {
          error:
            "Este vendedor possui ordens de serviço vinculadas e não pode ser excluído. Altere o status para inativo ou desligado para preservar o histórico da conta.",
        },
        { status: 409 }
      );
    }

    const { error: deleteError } = await admin
      .from("vendedores")
      .delete()
      .eq("id", vendedorId)
      .eq("conta_id", profile.conta_id);

    if (deleteError) {
      console.error("VENDEDORES_DELETE_ERROR:", {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code,
      });

      return NextResponse.json(
        { error: "Não foi possível excluir o vendedor." },
        { status: 400 }
      );
    }

    if (vendedor.image_url) {
      await removeAvatarIfExists(admin, vendedor.image_url);
    }

    return NextResponse.json({
      success: true,
      message: "Vendedor excluído com sucesso.",
    });
  } catch (error) {
    console.error("VENDEDORES_DELETE_INTERNAL_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir vendedor." },
      { status: 500 }
    );
  }
}