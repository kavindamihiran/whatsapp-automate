/**
 * Sri Lankan phone number utilities for WhatsApp click-to-chat.
 *
 * Accepts:        "0771234567", "771234567", "+94771234567", "94771234567"
 *                 "+94 77 123 4567", "077-123-4567"
 * Normalized to:  "+94771234567"
 */

export type ValidationResult = {
  raw: string;
  normalized: string | null;
  valid: boolean;
  reason?: string;
};

const SL_COUNTRY_CODE = "94";
const SL_NATIONAL_LENGTH = 9;
const SL_INTL_PLUS = "+94";

function stripToDigits(input: string): string {
  return input.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function normalizeSriLankanNumber(raw: string): ValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { raw, normalized: null, valid: false, reason: "Empty" };
  }

  const digits = trimmed.replace(/[^\d]/g, "");

  let normalizedDigits: string;
  if (digits.startsWith("0")) {
    if (digits.length - 1 !== SL_NATIONAL_LENGTH) {
      return {
        raw,
        normalized: null,
        valid: false,
        reason: `Expected 9 digits after 0, got ${digits.length - 1}`,
      };
    }
    normalizedDigits = SL_COUNTRY_CODE + digits.slice(1);
  } else if (digits.startsWith(SL_COUNTRY_CODE)) {
    const tail = digits.slice(2);
    if (tail.length !== SL_NATIONAL_LENGTH) {
      return {
        raw,
        normalized: null,
        valid: false,
        reason: `Expected 9 digits after 94, got ${tail.length}`,
      };
    }
    normalizedDigits = digits;
  } else {
    if (digits.length !== SL_NATIONAL_LENGTH) {
      return {
        raw,
        normalized: null,
        valid: false,
        reason: `Expected 9 digits, got ${digits.length}`,
      };
    }
    normalizedDigits = SL_COUNTRY_CODE + digits;
  }

  if (!/^[7][1-9]\d{7}$/.test(normalizedDigits.slice(2))) {
    return {
      raw,
      normalized: null,
      valid: false,
      reason: "Not a valid Sri Lankan mobile prefix",
    };
  }

  return { raw, normalized: SL_INTL_PLUS + normalizedDigits.slice(2), valid: true };
}

export function parseNumbers(input: string): ValidationResult[] {
  return input
    .split(/[\n,;\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(normalizeSriLankanNumber);
}

export function parseFile(text: string): ValidationResult[] {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const isCsv = rows.some((line) => /[,;\t]/.test(line));

  if (isCsv) {
    return rows
      .map((line) => line.split(/[,;\t]/).map((cell) => cell.replace(/^"|"$/g, "").trim()))
      .map((columns) => {
        const phone = columns.find((column) => normalizeSriLankanNumber(column).valid);
        return phone ? normalizeSriLankanNumber(phone) : normalizeSriLankanNumber(columns.find((column) => /\d/.test(column)) ?? "");
      });
  }
  return parseNumbers(rows.join("\n"));
}

export function buildWhatsAppLink(phoneE164: string, message: string): string {
  const cleaned = phoneE164.replace(/[^\d]/g, "");
  const text = message.trim();
  const base = `https://web.whatsapp.com/send?phone=${cleaned}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}
