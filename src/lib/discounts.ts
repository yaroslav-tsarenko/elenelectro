import { prisma } from "@/lib/prisma";

export const WELCOME_DISCOUNT_PERCENT = 10;
export const NEWSLETTER_DISCOUNT_PERCENT = 10;
export const WELCOME_CODE_PREFIX = "WELCOME";
export const NEWSLETTER_CODE_PREFIX = "NEWS";

function randomCode(prefix: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function generateUniqueNewsletterCode() {
  for (let i = 0; i < 6; i++) {
    const code = randomCode(NEWSLETTER_CODE_PREFIX);
    const exists = await prisma.newsletter.findUnique({ where: { discountCode: code } });
    if (!exists) return code;
  }
  return `${NEWSLETTER_CODE_PREFIX}-${Date.now().toString(36).toUpperCase()}`;
}

export interface ResolvedDiscount {
  type: "welcome" | "newsletter";
  percent: number;
  code: string;
  source: "auto" | "code";
}

interface ResolveOptions {
  userId?: string | null;
  email?: string | null;
  code?: string | null;
}

/**
 * Returns the highest applicable discount for the order. Welcome auto-applies
 * for any logged-in user who hasn't used it yet; newsletter requires a code
 * (or auto-applies when subscriber matches the logged-in user).
 */
export async function resolveDiscount(opts: ResolveOptions): Promise<ResolvedDiscount | null> {
  const candidates: ResolvedDiscount[] = [];

  if (opts.userId) {
    const user = await prisma.user.findUnique({
      where: { id: opts.userId },
      select: { welcomeDiscountUsed: true, newsletterDiscountUsed: true },
    });
    if (user && !user.welcomeDiscountUsed) {
      candidates.push({
        type: "welcome",
        percent: WELCOME_DISCOUNT_PERCENT,
        code: `${WELCOME_CODE_PREFIX}-${opts.userId.slice(-6).toUpperCase()}`,
        source: "auto",
      });
    }
    if (user && !user.newsletterDiscountUsed) {
      const sub = await prisma.newsletter.findFirst({
        where: { userId: opts.userId, discountUsed: false, unsubscribedAt: null },
      });
      if (sub?.discountCode) {
        candidates.push({
          type: "newsletter",
          percent: NEWSLETTER_DISCOUNT_PERCENT,
          code: sub.discountCode,
          source: "auto",
        });
      }
    }
  }

  if (opts.code) {
    const cleaned = opts.code.trim().toUpperCase();
    const sub = await prisma.newsletter.findUnique({ where: { discountCode: cleaned } });
    if (sub && !sub.discountUsed && !sub.unsubscribedAt) {
      candidates.push({
        type: "newsletter",
        percent: NEWSLETTER_DISCOUNT_PERCENT,
        code: cleaned,
        source: "code",
      });
    }
  }

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.percent - a.percent)[0];
}

export async function markDiscountUsed(discount: ResolvedDiscount, userId?: string | null) {
  if (discount.type === "welcome" && userId) {
    await prisma.user.update({ where: { id: userId }, data: { welcomeDiscountUsed: true } });
  }
  if (discount.type === "newsletter") {
    await prisma.newsletter.updateMany({
      where: { discountCode: discount.code },
      data: { discountUsed: true },
    });
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { newsletterDiscountUsed: true },
      });
    }
  }
}
