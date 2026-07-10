import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Link } from "@/i18n/routing";

export const metadata = { title: "Policies — AvontShop" };

const policies = [
  { label: "Terms and Conditions", href: "/policies/terms" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Cookie Policy", href: "/policies/cookies" },
  { label: "Returns, Refunds and Cancellation Policy", href: "/policies/returns" },
  { label: "Payment Policy", href: "/policies/payment" },
  { label: "Warranty Policy", href: "/policies/warranty" },
];

export default function PoliciesIndexPage() {
  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1rem 4rem" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Policies" }]} />
      <h1 style={{ fontSize: "clamp(1.375rem, 4.5vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem", color: "var(--color-text)" }}>
        Policies
      </h1>
      <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
        Please review our policies below. These policies govern your use of the AvontShop website and
        any purchases made through it.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {policies.map((policy) => (
          <li key={policy.href}>
            <Link
              href={policy.href}
              style={{
                display: "block",
                padding: "0.875rem 1rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                textDecoration: "none",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              {policy.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
