import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || !page.isActive) notFound();

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1rem 4rem", overflowWrap: "anywhere" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <h1 style={{ fontSize: "clamp(1.375rem, 4.5vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1.25rem", wordBreak: "break-word" }}>{page.title}</h1>
      <div
        style={{ lineHeight: 1.75, color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
