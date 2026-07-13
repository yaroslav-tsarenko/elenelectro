"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Mail, ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  } as const;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f4ff_30%,#faf5ff_70%,#fdf2f8_100%)] dark:bg-[linear-gradient(135deg,#0a0a1a_0%,#0f0f23_30%,#1a0f2e_70%,#0a0a1a_100%)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)] before:pointer-events-none">
      <motion.div
        className="relative w-full max-w-[420px] p-10 max-[480px]:px-5 max-[480px]:py-7 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div className="text-center mb-8" custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand text-white mb-5 shadow-accent">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-[1.75rem] max-[480px]:text-2xl font-extrabold text-ink m-0 mb-2 tracking-[-0.04em]">{t("forgotPasswordTitle")}</h1>
          <p className="text-[0.9375rem] text-ink-muted m-0 leading-[1.5]">{t("forgotPasswordSubtitle")}</p>
        </motion.div>

        {sent ? (
          <motion.div className="text-center p-6 bg-surface-1 rounded-md border border-line [&_svg]:block [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-ink-muted [&_p]:leading-[1.5]" custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <CheckCircle size={32} />
            <p>{t("resetEmailSent")}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div className="flex flex-col gap-1.5" custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-[0.8125rem] font-medium text-ink-muted">{t("email")}</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                />
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mt-2">
              <Button type="submit" color="primary" fullWidth isLoading={loading}>
                {t("sendResetLink")}
              </Button>
            </motion.div>
          </form>
        )}

        <motion.p className="text-center mt-7 text-sm text-ink-muted [&_a]:text-brand [&_a]:font-semibold [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-80" custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft size={14} />
            {t("backToLogin")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}