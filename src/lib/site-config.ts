/**
 * Site-wide contact constants.
 *
 * WhatsApp number lives in exactly one place so it can never drift out of
 * sync across the header, footer, and contact page again. Override via
 * NEXT_PUBLIC_WHATSAPP_NUMBER in .env if the number ever changes.
 */

const RAW_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '967733644466';

/** Digits only, no leading +, ready for wa.me links (e.g. "967733644466") */
export const WHATSAPP_NUMBER = RAW_WHATSAPP_NUMBER.replace(/\D/g, '');

/** wa.me deep link, optionally with a prefilled message */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** tel: link for click-to-call */
export const WHATSAPP_TEL_LINK = `tel:+${WHATSAPP_NUMBER}`;

/** Human-readable display format, e.g. "+967 733 644 466" */
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 3)} ${WHATSAPP_NUMBER.slice(3, 6)} ${WHATSAPP_NUMBER.slice(6, 9)} ${WHATSAPP_NUMBER.slice(9)}`;
