// src/lib/formatter.js

// ========================================
// HELPERS
// ========================================

export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function onlyMoneyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function removeMask(value = "") {
  return String(value).replace(/\D/g, "");
}

// ========================================
// CPF
// ========================================

export function formatCPF(value = "") {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/^(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) {
    return digits.replace(/^(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  }

  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

// ========================================
// CNPJ
// ========================================

export function formatCNPJ(value = "") {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, "$1.$2");
  if (digits.length <= 8) return digits.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (digits.length <= 12) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

// ========================================
// CPF ou CNPJ automático
// ========================================

export function formatCpfCnpj(value = "") {
  const digits = onlyDigits(value);

  if (digits.length <= 11) {
    return formatCPF(digits);
  }

  return formatCNPJ(digits);
}

// ========================================
// TELEFONE BR
// Regras:
// 10 dígitos: (32) 3333-4444
// 11 dígitos: (32) 99999-8888
// ========================================

export function formatPhone(value = "") {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}

// ========================================
// CEP
// ========================================

export function formatCEP(value = "") {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) return digits;
  return digits.replace(/^(\d{5})(\d+)/, "$1-$2");
}

// ========================================
// DINHEIRO BRL
// Exemplo digitando:
// "1" -> "R$ 0,01"
// "12" -> "R$ 0,12"
// "123" -> "R$ 1,23"
// ========================================

export function formatBRL(value = "") {
  const digits = onlyMoneyDigits(value);

  if (!digits) return "R$ 0,00";

  const number = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

// Retorna número JS a partir de string BRL
// "R$ 1.234,56" -> 1234.56
export function parseBRLToNumber(value = "") {
  if (!value) return 0;

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const number = Number(normalized);
  return Number.isNaN(number) ? 0 : number;
}

// ========================================
// QUANTIDADE DE ITENS
// Exemplo:
// 28000 -> "28.000"
// 28000000 -> "28.000.000"
// Sem casas decimais
// ========================================

export function formatQuantidade(value = "") {
  const digits = onlyDigits(value);

  if (!digits) return "";

  const number = Number(digits);

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export function parseQuantidadeToNumber(value = "") {
  const digits = onlyDigits(value);

  if (!digits) return 0;

  const number = Number(digits);
  return Number.isNaN(number) ? 0 : number;
}

// Retorna string numérica limpa em centavos
// "R$ 1.234,56" -> "123456"
export function parseBRLToCents(value = "") {
  return onlyMoneyDigits(value);
}

// ========================================
// FORMATADORES PARA INPUT ONCHANGE
// ========================================

export function formatCPFInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatCPF(value);
}

export function formatCNPJInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatCNPJ(value);
}

export function formatCpfCnpjInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatCpfCnpj(value);
}

export function formatPhoneInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatPhone(value);
}

export function formatCEPInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatCEP(value);
}

export function formatBRLInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatBRL(value);
}

export function formatQuantidadeInput(eventOrValue) {
  const value =
    typeof eventOrValue === "string"
      ? eventOrValue
      : eventOrValue?.target?.value || "";

  return formatQuantidade(value);
}

// ========================================
// VALIDAÇÕES BÁSICAS
// ========================================

export function isValidCPF(value = "") {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }

  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;

  return secondDigit === Number(cpf[10]);
}

export function isValidCNPJ(value = "") {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base, weights) => {
    const sum = base.reduce((acc, num, idx) => acc + num * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const numbers = cnpj.split("").map(Number);

  const base12 = numbers.slice(0, 12);
  const digit1 = calcDigit(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  const base13 = [...base12, digit1];
  const digit2 = calcDigit(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digit1 === numbers[12] && digit2 === numbers[13];
}

export function isValidPhone(value = "") {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

export function isValidCEP(value = "") {
  return onlyDigits(value).length === 8;
}