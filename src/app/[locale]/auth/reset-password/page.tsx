"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Lock, Eye, EyeOff, ShoppingBag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("passwordsMismatch"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f4ff_30%,#faf5ff_70%,#fdf2f8_100%)] dark:bg-[linear-gradient(135deg,#0a0a1a_0%,#0f0f23_30%,#1a0f2e_70%,#0a0a1a_100%)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)] before:pointer-events-none">
        <motion.div
          className="relative w-full max-w-[420px] p-10 max-[480px]:px-5 max-[480px]:py-7 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand text-white mb-5 shadow-accent">
              <ShoppingBag size={24} />
            </div>
            <h1 className="text-[1.75rem] max-[480px]:text-2xl font-extrabold text-ink m-0 mb-2 tracking-[-0.04em]">{t("invalidResetLink")}</h1>
            <p className="text-[0.9375rem] text-ink-muted m-0 leading-[1.5]">{t("invalidResetLinkDesc")}</p>
          </div>
          <p className="text-center mt-7 text-sm text-ink-muted [&_a]:text-brand [&_a]:font-semibold [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-80">
            <Link href="/auth/forgot-password">{t("requestNewLink")}</Link>
          </p>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-[1.75rem] max-[480px]:text-2xl font-extrabold text-ink m-0 mb-2 tracking-[-0.04em]">{t("resetPasswordTitle")}</h1>
          <p className="text-[0.9375rem] text-ink-muted m-0 leading-[1.5]">{t("resetPasswordSubtitle")}</p>
        </motion.div>

        {success ? (
          <motion.div className="text-center p-6 bg-surface-1 rounded-md border border-line [&_svg]:block [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-ink-muted [&_p]:leading-[1.5]" custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <CheckCircle size={32} />
            <p>{t("passwordResetSuccess")}</p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/auth/login">{t("signIn")}</Link>
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div className="flex flex-col gap-1.5" custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-[0.8125rem] font-medium text-ink-muted">{t("newPassword")}</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="peer w-full pl-10 pr-10 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                />
                <button
                  type="button"
                  className="absolute right-2 flex items-center justify-center p-1 bg-transparent border-0 text-ink-subtle cursor-pointer rounded transition-colors hover:text-ink-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div className="flex flex-col gap-1.5" custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-[0.8125rem] font-medium text-ink-muted">{t("confirmPassword")}</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                  className="peer w-full pl-10 pr-10 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                />
                <button
                  type="button"
                  className="absolute right-2 flex items-center justify-center p-1 bg-transparent border-0 text-ink-subtle cursor-pointer rounded transition-colors hover:text-ink-muted"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-2">
              <Button type="submit" color="primary" fullWidth isLoading={loading}>
                {t("resetPassword")}
              </Button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
