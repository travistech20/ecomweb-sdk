import { z } from "zod";
import { urlSchema } from "./common";

/**
 * Email branding vocabulary, mirrored from the API.
 *
 * The API owns these values (src/modules/templates/domain/email-palette.ts)
 * and pins this file with a tripwire test. It cannot import this package —
 * the SDK is a client OF that API, and depending on it would invert the
 * relationship. So the two are kept in step by hand.
 *
 * If you change anything here, change it there in the same PR, or the
 * dashboard will show merchants a default swatch the emails do not render.
 */
export const EMAIL_PALETTE_DEFAULTS = {
  accent: "#f4644f",
  bg: "#FFFFFF",
  bodyBg: "#FFFFFF",
  text: "#1A1A1A",
  footerText: "#6B7280",
} as const;

/**
 * Matches the API's DTO validation exactly: #RRGGBB, nothing else. 3-digit
 * hex, named colours and rgb() are rejected at the edge so the render path
 * never has to parse anything.
 */
export const EMAIL_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const emailColorSchema = z
  .string()
  .regex(EMAIL_COLOR_PATTERN, "Must be a 6-digit hex colour, e.g. #1D4ED8")
  .optional()
  .nullable();

/**
 * The nine store_settings columns a merchant can set for email branding.
 * Every one is nullable: NULL means "use the house default", which is what
 * lets an unconfigured store render exactly as it did before the feature.
 */
export const emailBrandingShape = {
  email_accent_color: emailColorSchema,
  email_bg_color: emailColorSchema,
  email_body_bg_color: emailColorSchema,
  email_text_color: emailColorSchema,
  email_footer_text_color: emailColorSchema,
  email_logo_url: urlSchema,
  email_header_tagline: z.string().max(120).optional().nullable(),
  email_footer_address: z.string().max(255).optional().nullable(),
  email_footer_phone: z.string().max(32).optional().nullable(),
};

export const emailBrandingSchema = z.object(emailBrandingShape);

export type StoreEmailBrandingSettings = z.infer<typeof emailBrandingSchema>;
