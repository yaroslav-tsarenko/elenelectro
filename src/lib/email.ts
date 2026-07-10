import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function getFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    "AvontShop <noreply@avontshop.com>"
  );
}

function getReplyTo(): string | undefined {
  return process.env.RESEND_REPLY_TO || undefined;
}

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

const BRAND_COLOR = "#E53935";
const BG_COLOR = "#f7f7f7";
const TEXT_COLOR = "#1A1A2E";
const MUTED_COLOR = "#666";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function send({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  const r = getResend();
  if (!r) {
    console.log(`[Email] Skipped (Resend not configured) → ${subject} to ${to}`);
    return false;
  }
  try {
    const { error } = await r.emails.send({
      from: getFrom(),
      to,
      subject,
      html,
      replyTo: replyTo ?? getReplyTo(),
    });
    if (error) {
      console.error(`[Email] Send failed → ${subject} to ${to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Email] Exception → ${subject} to ${to}:`, err);
    return false;
  }
}

function emailWrapper(content: string, options: { preheader?: string } = {}): string {
  const preheader = options.preheader
    ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${options.preheader}</div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AvontShop</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT_COLOR};">
  ${preheader}
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${getSiteUrl()}" style="text-decoration:none;">
        <span style="font-size:24px;font-weight:900;color:${BRAND_COLOR};letter-spacing:-0.03em;">AvontShop</span>
      </a>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#999;line-height:1.6;">
      <p style="margin:0 0 4px;">&copy; ${new Date().getFullYear()} AvontShop. All rights reserved.</p>
      <p style="margin:0;">AVONTRA LTD &middot; London, United Kingdom &middot; <a href="${getSiteUrl()}" style="color:${BRAND_COLOR};text-decoration:none;">avontshop.com</a></p>
      <p style="margin:8px 0 0;">
        <a href="${getSiteUrl()}/en/policies/privacy" style="color:#999;text-decoration:underline;margin:0 6px;">Privacy</a>
        <a href="${getSiteUrl()}/en/policies/terms" style="color:#999;text-decoration:underline;margin:0 6px;">Terms</a>
        <a href="${getSiteUrl()}/en/contact" style="color:#999;text-decoration:underline;margin:0 6px;">Contact</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        ${label}
      </a>
    </div>`;
}

function escape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// Welcome email
// ============================================================

export async function sendWelcomeEmail(email: string, name?: string | null): Promise<boolean> {
  const greeting = name ? `Hi ${escape(name)}` : "Welcome";
  const siteUrl = getSiteUrl();

  return send({
    to: email,
    subject: "Welcome to AvontShop!",
    html: emailWrapper(
      `
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">${greeting}, welcome to AvontShop!</h1>
      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        Your account has been created successfully. You now have access to thousands of electrical materials and supplies at competitive prices.
      </p>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-weight:600;color:${TEXT_COLOR};">What you can do now:</p>
        <ul style="margin:0;padding:0 0 0 20px;color:${MUTED_COLOR};line-height:1.8;">
          <li>Browse our full catalog of products</li>
          <li>Save items to your wishlist</li>
          <li>Track your orders in real time</li>
          <li>Get free shipping on orders over &euro;100</li>
        </ul>
      </div>
      ${button(`${siteUrl}/en/catalog`, "Start Shopping")}
      <p style="color:#999;font-size:13px;margin:24px 0 0;text-align:center;">
        Standard 2-year EU warranty on all products
      </p>
    `,
      { preheader: `${greeting}! Your AvontShop account is ready.` },
    ),
  });
}

// ============================================================
// Order emails (confirmation, invoice, status updates)
// ============================================================

interface OrderItem {
  productName: string;
  productSku: string;
  quantity: number;
  price: number | { toNumber?: () => number };
  total: number | { toNumber?: () => number };
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string | null;
  postalCode?: string;
  country?: string;
}

interface OrderEmailData {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number | { toNumber?: () => number };
  taxAmount: number | { toNumber?: () => number };
  shippingCost: number | { toNumber?: () => number };
  discountAmount?: number | { toNumber?: () => number };
  total: number | { toNumber?: () => number };
  shippingMethod: string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string | null;
  createdAt?: Date | string;
}

function toNum(v: number | { toNumber?: () => number } | undefined | null): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "object" && typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(d: Date | string | undefined): string {
  const date = d ? new Date(d) : new Date();
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function shortId(order: { orderNumber?: string; orderId: string }): string {
  const raw = order.orderNumber || order.orderId;
  return raw.slice(-8).toUpperCase();
}

function shippingLabelFor(method: string): string {
  if (method === "express") return "Express (2-3 days)";
  if (method === "free") return "Economy (7-14 days)";
  return "Standard (5-7 days)";
}

function formatAddress(addr?: ShippingAddress): string {
  if (!addr) return "—";
  const lines: string[] = [];
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  if (name) lines.push(escape(name));
  if (addr.address1) lines.push(escape(addr.address1));
  if (addr.address2) lines.push(escape(addr.address2));
  const cityLine = [addr.city, addr.postalCode].filter(Boolean).join(", ");
  if (cityLine) lines.push(escape(cityLine));
  if (addr.country) lines.push(escape(addr.country));
  return lines.join("<br />");
}

function itemRowsTable(items: OrderItem[], options: { showUnitPrice?: boolean } = {}): string {
  return items
    .map((item) => {
      const qty = item.quantity;
      const unit = formatEur(toNum(item.price));
      const total = formatEur(toNum(item.total));
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <div style="font-weight:600;font-size:14px;color:${TEXT_COLOR};">${escape(item.productName)}</div>
            <div style="font-size:12px;color:#999;margin-top:2px;">SKU: ${escape(item.productSku)}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:center;color:${MUTED_COLOR};font-size:14px;vertical-align:top;">
            ${qty}${options.showUnitPrice ? ` &times; ${unit}` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;font-size:14px;color:${TEXT_COLOR};vertical-align:top;">
            ${total}
          </td>
        </tr>`;
    })
    .join("");
}

function totalsBlock(data: OrderEmailData): string {
  const discount = toNum(data.discountAmount);
  const shipping = toNum(data.shippingCost);
  return `
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:${MUTED_COLOR};font-size:14px;padding:4px 0;">Subtotal</td>
          <td style="text-align:right;font-weight:500;font-size:14px;padding:4px 0;">${formatEur(toNum(data.subtotal))}</td>
        </tr>
        <tr>
          <td style="color:${MUTED_COLOR};font-size:14px;padding:4px 0;">Shipping (${shippingLabelFor(data.shippingMethod)})</td>
          <td style="text-align:right;font-weight:500;font-size:14px;padding:4px 0;${shipping === 0 ? "color:#2E7D32;" : ""}">${shipping === 0 ? "Free" : formatEur(shipping)}</td>
        </tr>
        <tr>
          <td style="color:${MUTED_COLOR};font-size:14px;padding:4px 0;">Tax (21%)</td>
          <td style="text-align:right;font-weight:500;font-size:14px;padding:4px 0;">${formatEur(toNum(data.taxAmount))}</td>
        </tr>
        ${
          discount > 0
            ? `<tr>
                <td style="color:#2E7D32;font-size:14px;padding:4px 0;">Discount</td>
                <td style="text-align:right;font-weight:500;font-size:14px;padding:4px 0;color:#2E7D32;">&minus;${formatEur(discount)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding-top:12px;border-top:2px solid #e5e5e5;font-weight:800;font-size:16px;color:${TEXT_COLOR};">Total</td>
          <td style="padding-top:12px;border-top:2px solid #e5e5e5;text-align:right;font-weight:800;font-size:16px;color:${TEXT_COLOR};">${formatEur(toNum(data.total))}</td>
        </tr>
      </table>
    </div>`;
}

function itemsTable(items: OrderItem[], options: { showUnitPrice?: boolean } = {}): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="border-bottom:2px solid #e5e5e5;">
          <th style="text-align:left;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Product</th>
          <th style="text-align:center;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.05em;">${options.showUnitPrice ? "Qty &times; Price" : "Qty"}</th>
          <th style="text-align:right;padding:8px 0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsTable(items, options)}
      </tbody>
    </table>`;
}

// Order confirmation — quick "we got your order" email
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const id = shortId(data);

  return send({
    to: data.customerEmail,
    subject: `Order Confirmed — #${id}`,
    html: emailWrapper(
      `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F5E9;display:inline-block;line-height:56px;font-size:28px;color:#2E7D32;">&#10003;</div>
        <h1 style="margin:12px 0 4px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">Order Confirmed!</h1>
        <p style="margin:0;color:#999;font-size:14px;">Order #${id}</p>
      </div>

      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        Hi ${escape(data.customerName)}, thank you for your order! We&rsquo;re preparing it for shipment.
      </p>

      ${itemsTable(data.items)}
      ${totalsBlock(data)}

      ${button(`${siteUrl}/en/account/orders/${data.orderId}`, "View Your Order")}

      <p style="color:#999;font-size:13px;margin:24px 0 0;text-align:center;">
        You&rsquo;ll receive a shipping confirmation when your order is on its way.
      </p>
    `,
      { preheader: `Order #${id} confirmed — thank you for your purchase!` },
    ),
  });
}

// Invoice email — formal, with full company + customer details
export async function sendOrderInvoiceEmail(data: OrderEmailData): Promise<boolean> {
  const id = shortId(data);
  const date = formatDate(data.createdAt);

  return send({
    to: data.customerEmail,
    subject: `Invoice — Order #${id}`,
    html: emailWrapper(
      `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:2px solid #e5e5e5;padding-bottom:16px;">
        <div>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:${TEXT_COLOR};">Invoice</h1>
          <p style="margin:4px 0 0;color:#999;font-size:13px;">#${id} &middot; ${date}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Billed To</p>
            <p style="margin:0;font-size:13px;color:${TEXT_COLOR};line-height:1.55;">
              ${escape(data.customerName)}<br />
              ${escape(data.customerEmail)}
            </p>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:12px;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Ship To</p>
            <p style="margin:0;font-size:13px;color:${TEXT_COLOR};line-height:1.55;">
              ${formatAddress(data.shippingAddress)}
            </p>
          </td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">From</p>
            <p style="margin:0;font-size:13px;color:${TEXT_COLOR};line-height:1.55;">
              <strong>AVONTRA LTD</strong><br />
              Company number: 17245887<br />
              Dept 6735, 196 High Road<br />
              Wood Green, London, N22 8HH<br />
              United Kingdom
            </p>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:12px;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Shipping Method</p>
            <p style="margin:0;font-size:13px;color:${TEXT_COLOR};line-height:1.55;">
              ${shippingLabelFor(data.shippingMethod)}
            </p>
          </td>
        </tr>
      </table>

      ${itemsTable(data.items, { showUnitPrice: true })}
      ${totalsBlock(data)}

      <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.6;text-align:center;">
        VAT is included in the prices shown where applicable. This invoice serves as proof of purchase.<br />
        For any questions, reply to this email or contact <a href="mailto:info@avontshop.com" style="color:${BRAND_COLOR};">info@avontshop.com</a>.
      </p>
    `,
      { preheader: `Invoice for order #${id} — ${formatEur(toNum(data.total))}` },
    ),
  });
}

// Order shipped — sent when admin marks order SHIPPED
export async function sendOrderShippedEmail(data: OrderEmailData): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const id = shortId(data);
  const tracking = data.trackingNumber;

  return send({
    to: data.customerEmail,
    subject: `Your order #${id} is on the way!`,
    html: emailWrapper(
      `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;font-size:32px;">&#128666;</div>
        <h1 style="margin:8px 0 4px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">Your order shipped!</h1>
        <p style="margin:0;color:#999;font-size:14px;">Order #${id}</p>
      </div>

      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        Hi ${escape(data.customerName)}, your order has left our warehouse and is on its way to you.
      </p>

      ${
        tracking
          ? `<div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:${TEXT_COLOR};font-family:'Courier New',monospace;">${escape(tracking)}</p>
            </div>`
          : ""
      }

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Delivering To</p>
        <p style="margin:0;font-size:13px;color:${TEXT_COLOR};line-height:1.55;">
          ${formatAddress(data.shippingAddress)}
        </p>
      </div>

      <p style="color:${MUTED_COLOR};font-size:13px;line-height:1.6;margin:16px 0 0;">
        Estimated delivery: <strong>${shippingLabelFor(data.shippingMethod)}</strong>.
        We&rsquo;ll send another email when your order is delivered.
      </p>

      ${button(`${siteUrl}/en/account/orders/${data.orderId}`, "Track Your Order")}
    `,
      { preheader: `Order #${id} shipped${tracking ? ` — ${tracking}` : ""}` },
    ),
  });
}

// Generic status update — DELIVERED / CANCELLED / REFUNDED
export async function sendOrderStatusEmail(
  data: OrderEmailData,
  status: "DELIVERED" | "CANCELLED" | "REFUNDED",
): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const id = shortId(data);

  const variants = {
    DELIVERED: {
      subject: `Order #${id} delivered`,
      title: "Your order was delivered!",
      icon: "&#128230;",
      iconBg: "#E8F5E9",
      iconColor: "#2E7D32",
      message: "Your order has been delivered. We hope you love it! If anything's wrong, just reply to this email.",
      cta: "Leave a review",
      ctaHref: `${siteUrl}/en/account/orders/${data.orderId}`,
    },
    CANCELLED: {
      subject: `Order #${id} cancelled`,
      title: "Your order was cancelled",
      icon: "&#10005;",
      iconBg: "#FFEBEE",
      iconColor: "#C62828",
      message: "This order has been cancelled. If you were charged, a refund will be processed back to your original payment method within 5–10 business days.",
      cta: "Continue shopping",
      ctaHref: `${siteUrl}/en/catalog`,
    },
    REFUNDED: {
      subject: `Order #${id} refunded`,
      title: "Your refund has been processed",
      icon: "&#8634;",
      iconBg: "#E3F2FD",
      iconColor: "#1565C0",
      message: `Your refund of <strong>${formatEur(toNum(data.total))}</strong> has been issued to your original payment method. It may take 5–10 business days to appear on your statement.`,
      cta: "View order",
      ctaHref: `${siteUrl}/en/account/orders/${data.orderId}`,
    },
  } as const;

  const v = variants[status];

  return send({
    to: data.customerEmail,
    subject: v.subject,
    html: emailWrapper(
      `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;border-radius:50%;background:${v.iconBg};display:inline-block;line-height:56px;font-size:24px;color:${v.iconColor};">${v.icon}</div>
        <h1 style="margin:12px 0 4px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">${v.title}</h1>
        <p style="margin:0;color:#999;font-size:14px;">Order #${id}</p>
      </div>

      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        Hi ${escape(data.customerName)}, ${v.message}
      </p>

      ${button(v.ctaHref, v.cta)}
    `,
      { preheader: v.title },
    ),
  });
}

// ============================================================
// Password reset
// ============================================================

export async function sendPasswordResetEmail(email: string, resetUrl: string, name?: string | null): Promise<boolean> {
  const greeting = name ? `Hi ${escape(name)}` : "Hi there";
  return send({
    to: email,
    subject: "Reset your AvontShop password",
    html: emailWrapper(
      `
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">Reset your password</h1>
      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        ${greeting}, we received a request to reset the password on your AvontShop account.
        Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
      </p>
      ${button(resetUrl, "Reset Password")}
      <p style="color:${MUTED_COLOR};font-size:13px;line-height:1.6;margin:16px 0 0;">
        If the button doesn&rsquo;t work, copy and paste this link into your browser:
        <br />
        <a href="${resetUrl}" style="color:${BRAND_COLOR};word-break:break-all;">${resetUrl}</a>
      </p>
      <p style="color:#999;font-size:13px;margin:24px 0 0;text-align:center;">
        If you didn&rsquo;t request this, you can safely ignore this email — your password won&rsquo;t change.
      </p>
    `,
      { preheader: "Reset your AvontShop password — link expires in 1 hour." },
    ),
  });
}

// ============================================================
// Contact form
// ============================================================

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Internal notification to support inbox
export async function sendContactFormEmail(submission: ContactSubmission): Promise<boolean> {
  const supportInbox = getReplyTo() || process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;
  if (!supportInbox) {
    console.log("[Email] Contact form notification skipped (no inbox configured)");
    return false;
  }

  return send({
    to: supportInbox,
    subject: `Contact: ${submission.subject}`,
    replyTo: submission.email,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:${TEXT_COLOR};">New contact form submission</h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#999;width:80px;">From</td>
          <td style="padding:8px 0;color:${TEXT_COLOR};font-weight:600;">${escape(submission.name)} &lt;${escape(submission.email)}&gt;</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#999;">Subject</td>
          <td style="padding:8px 0;color:${TEXT_COLOR};font-weight:600;">${escape(submission.subject)}</td>
        </tr>
      </table>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;color:${TEXT_COLOR};font-size:14px;line-height:1.6;white-space:pre-wrap;">${escape(submission.message)}</div>
      <p style="color:#999;font-size:12px;margin:16px 0 0;">
        Reply directly to this email to respond to ${escape(submission.email)}.
      </p>
    `),
  });
}

// Auto-reply to the customer who submitted the form
export async function sendContactAutoReplyEmail(submission: ContactSubmission): Promise<boolean> {
  return send({
    to: submission.email,
    subject: "We received your message — AvontShop",
    html: emailWrapper(
      `
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${TEXT_COLOR};">Thanks for reaching out!</h1>
      <p style="color:${MUTED_COLOR};line-height:1.6;margin:0 0 16px;">
        Hi ${escape(submission.name)}, we&rsquo;ve received your message and will reply within 24 hours.
      </p>
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Your message</p>
        <p style="margin:0 0 8px;font-size:14px;color:${TEXT_COLOR};font-weight:600;">${escape(submission.subject)}</p>
        <p style="margin:0;font-size:14px;color:${MUTED_COLOR};line-height:1.6;white-space:pre-wrap;">${escape(submission.message)}</p>
      </div>
      <p style="color:#999;font-size:13px;margin:16px 0 0;">
        In the meantime, you can check our <a href="${getSiteUrl()}/en/faq" style="color:${BRAND_COLOR};">FAQ</a> or browse our <a href="${getSiteUrl()}/en/catalog" style="color:${BRAND_COLOR};">catalog</a>.
      </p>
    `,
      { preheader: "Thanks for your message — we'll reply within 24 hours." },
    ),
  });
}
