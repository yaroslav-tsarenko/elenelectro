"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  Mail, Lock, Eye, EyeOff, User, ShoppingBag,
  Phone, MapPin, Calendar, ChevronRight, ChevronLeft, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: "", color: "transparent" };
  if (password.length < 6) return { level: 25, label: "Weak", color: "#ef4444" };
  if (password.length < 10) return { level: 50, label: "Fair", color: "#00D4E0" };
  if (password.length < 14) return { level: 75, label: "Good", color: "#22c55e" };
  return { level: 100, label: "Strong", color: "#16a34a" };
}

const STEP_LABELS = ["Personal Info", "Contact Details", "Address", "Password"];
const STEP_ICONS = [User, Phone, MapPin, Lock];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  country: "",
  postalCode: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(form.password);

  const selectedCountry = COUNTRIES.find((c) => c.code === form.country);
  const phoneHint = selectedCountry ? selectedCountry.phone : "+44";

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (s === 0) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.lastName.trim()) errs.lastName = "Last name is required";
      if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
      else {
        const dob = new Date(form.dateOfBirth);
        const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) errs.dateOfBirth = "You must be at least 18 years old";
      }
    } else if (s === 1) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
      if (!form.phone.trim()) errs.phone = "Phone is required";
    } else if (s === 2) {
      if (!form.street.trim()) errs.street = "Street address is required";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.country) errs.country = "Country is required";
      if (!form.postalCode.trim()) errs.postalCode = "Postal code is required";
    } else if (s === 3) {
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 6) errs.password = "Min 6 characters";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          street: form.street,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
          dateOfBirth: form.dateOfBirth,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created!");
      window.location.href = "/en/account";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.75rem 0.625rem 2.5rem",
    fontSize: "0.875rem",
    color: "var(--color-text)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const plainInputStyle: React.CSSProperties = {
    ...inputStyle,
    paddingLeft: "0.75rem",
  };

  const selectStyle: React.CSSProperties = {
    ...plainInputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9EB8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    paddingRight: "2rem",
  };

  const renderError = (field: keyof FormData) =>
    errors[field] ? (
      <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors[field]}</span>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f4ff_30%,#faf5ff_70%,#fdf2f8_100%)] dark:bg-[linear-gradient(135deg,#0a0a1a_0%,#0f0f23_30%,#1a0f2e_70%,#0a0a1a_100%)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)] before:pointer-events-none">
      <motion.div
        className="relative w-full max-w-[420px] p-10 max-[480px]:px-5 max-[480px]:py-7 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"
        style={{ maxWidth: 480 }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand text-white mb-5 shadow-accent">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-[1.75rem] max-[480px]:text-2xl font-extrabold text-ink m-0 mb-2 tracking-[-0.04em]">{t("registerTitle")}</h1>
          <p className="text-[0.9375rem] text-ink-muted m-0 leading-[1.5]">{t("registerSubtitle")}</p>
        </div>

        {/* Step indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          marginBottom: "1.75rem",
        }}>
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={i}
                type="button"
                onClick={() => i < step && setStep(i)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 0.25rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: i <= step ? "pointer" : "default",
                  background: isActive ? "var(--color-accent-light)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.6875rem",
                  color: isActive ? "var(--color-accent)" : isDone ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {isDone ? (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                ) : (
                  <Icon size={14} />
                )}
                <span style={{ display: "none" }}>{label}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}>
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? "var(--color-accent)" : "var(--color-border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem", fontWeight: 600 }}>
          Step {step + 1} of 4: {STEP_LABELS[step]}
        </p>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">First Name *</label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={set("firstName")}
                      placeholder="John"
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.firstName ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("firstName")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Last Name *</label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={set("lastName")}
                      placeholder="Doe"
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.lastName ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("lastName")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Date of Birth *</label>
                  <div className="relative flex items-center">
                    <Calendar size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={set("dateOfBirth")}
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.dateOfBirth ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("dateOfBirth")}
                </div>

                <div className="mt-2">
                  <Button type="button" color="primary" fullWidth onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">{t("email")} *</label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.email ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("email")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Phone *</label>
                  <div className="relative flex items-center">
                    <Phone size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder={`${phoneHint} XX XXX XXXX`}
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.phone ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("phone")}
                  {!form.country && (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-tertiary)" }}>
                      Select country in next step for phone code hint
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }} className="mt-2">
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="button" color="primary" style={{ flex: 1 }} onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Street Address *</label>
                  <div className="relative flex items-center">
                    <MapPin size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type="text"
                      value={form.street}
                      onChange={set("street")}
                      placeholder="123 Main Street, Apt 4B"
                      className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.street ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("street")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={set("city")}
                    placeholder="Riga"
                    style={{
                      ...plainInputStyle,
                      borderColor: errors.city ? "var(--color-danger)" : undefined,
                    }}
                  />
                  {renderError("city")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Country *</label>
                  <select
                    value={form.country}
                    onChange={set("country")}
                    style={{
                      ...selectStyle,
                      borderColor: errors.country ? "var(--color-danger)" : undefined,
                      color: form.country ? "var(--color-text)" : "var(--color-text-tertiary)",
                    }}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  {renderError("country")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">Postal Code *</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={set("postalCode")}
                    placeholder="LV-1001"
                    style={{
                      ...plainInputStyle,
                      borderColor: errors.postalCode ? "var(--color-danger)" : undefined,
                    }}
                  />
                  {renderError("postalCode")}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }} className="mt-2">
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="button" color="primary" style={{ flex: 1 }} onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">{t("password")} *</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="Min 6 characters"
                      className="peer w-full pl-10 pr-10 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.password ? { borderColor: "var(--color-danger)" } : undefined}
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
                  {renderError("password")}
                  {form.password.length > 0 && (
                    <div style={{ marginTop: "0.375rem" }}>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--color-border)", overflow: "hidden" }}>
                        <div style={{ width: `${strength.level}%`, height: "100%", background: strength.color, transition: "width 0.3s" }} />
                      </div>
                      <p style={{ fontSize: "0.75rem", color: strength.color, marginTop: "0.25rem", margin: "0.25rem 0 0" }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-medium text-ink-muted">{t("confirmPassword")} *</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      placeholder="Confirm your password"
                      className="peer w-full pl-10 pr-10 py-2.5 text-sm text-ink bg-surface border border-line rounded-lg outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,77,255,0.15)]"
                      style={errors.confirmPassword ? { borderColor: "var(--color-danger)" } : undefined}
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
                  {renderError("confirmPassword")}
                </div>

                <p className="text-[0.8125rem] text-ink-subtle leading-[1.5] m-0 [&_a]:text-brand [&_a]:no-underline hover:[&_a]:underline">
                  By creating an account, you agree to our{" "}
                  <Link href="/policies/terms">Terms of Service</Link> and{" "}
                  <Link href="/policies/privacy">Privacy Policy</Link>.
                </p>

                <div style={{ display: "flex", gap: "0.75rem" }} className="mt-2">
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" color="primary" style={{ flex: 1 }} isLoading={loading}>
                    {t("signUp")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center mt-7 text-sm text-ink-muted [&_a]:text-brand [&_a]:font-semibold [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-80">
          {t("haveAccount")}{" "}
          <Link href="/auth/login">{t("signIn")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
