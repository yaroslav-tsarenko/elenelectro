"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validators/contact";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, Send,
  CheckCircle, MessageSquare, HelpCircle, ShieldCheck,
} from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  paddingLeft: "2.75rem",
  borderRadius: "12px",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-bg)",
  color: "var(--color-text)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const inputPlainStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: "1rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  marginBottom: "0.375rem",
  color: "var(--color-text-secondary)",
};

const errorStyle: React.CSSProperties = {
  color: "var(--color-danger)",
  fontSize: "0.75rem",
  marginTop: "0.25rem",
};

const CONTACT_INFO = [
  { icon: Mail, title: "Email Us", detail: "info@elenelectro.com", sub: "We reply within 24 hours" },
  { icon: Phone, title: "Call Us", detail: "+44 7360 545980", sub: "Mon-Fri 9:00-18:00 GMT" },
  { icon: MapPin, title: "Our Office", detail: "London, United Kingdom", sub: "AVONTRA LTD", tooltip: "Dept 6735, 196 High Road, Wood Green, London, N22 8HH, UK\nCompany No. 17245887\nDirector: Helen CHAMPION" },
  { icon: Clock, title: "Working Hours", detail: "Mon-Fri 9:00-18:00", sub: "Sat 10:00-14:00" },
];

const TOPICS = [
  { icon: MessageSquare, label: "General Inquiry", value: "general" },
  { icon: HelpCircle, label: "Product Support", value: "support" },
  { icon: ShieldCheck, label: "Warranty & Returns", value: "warranty" },
  { icon: Send, label: "Business / Wholesale", value: "business" },
];

export default function ContactPage() {
  const t = useTranslations("contact");
  const nav = useTranslations("nav");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
      toast.success(t("success"));
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <style>{`
        .contact-input:focus {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 3px rgba(27,77,255,0.1) !important;
        }
      `}</style>
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("title") }]} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-sm:mb-8"
      >
        <h1 className="text-4xl max-sm:text-[1.625rem] font-extrabold tracking-[-0.03em] mb-3">
          {t("title")}
        </h1>
        <p className="text-ink-muted text-[1.0625rem] max-sm:text-[0.9375rem] max-w-[480px] mx-auto">
          {t("subtitle")}. We&apos;re here to help with orders, products, and any questions you may have.
        </p>
      </motion.div>

      {/* Contact Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-[480px]:gap-3 mb-12 max-[480px]:mb-8"
      >
        {CONTACT_INFO.map((info, i) => (
          <motion.div
            key={info.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="p-6 max-[480px]:px-3 max-[480px]:py-4 rounded-2xl border border-line bg-surface text-center"
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          >
            <div style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "14px",
              background: "var(--color-accent-light)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.875rem",
            }}>
              <info.icon size={22} />
            </div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.375rem" }}>{info.title}</h3>
            <p title={"tooltip" in info ? info.tooltip : undefined} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.25rem", cursor: "tooltip" in info ? "help" : undefined }}>{info.detail}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{info.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content: Form + Map/Info */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 max-sm:p-5 rounded-xl max-sm:rounded-lg border border-line bg-surface"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                style={{ textAlign: "center", padding: "3rem 1rem" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 12, stiffness: 300 }}
                >
                  <CheckCircle size={64} style={{ color: "#2E7D32", margin: "0 auto 1.5rem" }} />
                </motion.div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Message Sent!</h2>
                <p style={{ color: "var(--color-text-secondary)", maxWidth: "320px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
                  {t("success")}
                </p>
                <Button color="primary" onPress={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Send size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Send us a message</h2>
                </div>

                {/* Topic Selector */}
                <div>
                  <label style={labelStyle}>What can we help with?</label>
                  <div className="grid grid-cols-1 min-[381px]:grid-cols-2 gap-2">
                    {TOPICS.map((topic) => {
                      const isActive = selectedTopic === topic.value;
                      return (
                        <button
                          key={topic.value}
                          type="button"
                          onClick={() => {
                            setSelectedTopic(topic.value);
                            setValue("subject", topic.label);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.625rem 0.875rem",
                            borderRadius: "10px",
                            border: `1.5px solid ${isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                            background: isActive ? "var(--color-accent-light)" : "var(--color-bg)",
                            color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <topic.icon size={15} />
                          {topic.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>{t("name")}</label>
                    <input
                      className="contact-input"
                      style={inputPlainStyle}
                      placeholder="John Doe"
                      {...register("name")}
                    />
                    {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("email")}</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
                      <input
                        className="contact-input"
                        type="email"
                        style={inputStyle}
                        placeholder="your@email.com"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("subject")}</label>
                  <input
                    className="contact-input"
                    style={inputPlainStyle}
                    placeholder="How can we help?"
                    {...register("subject")}
                  />
                  {errors.subject && <span style={errorStyle}>{errors.subject.message}</span>}
                </div>

                <div>
                  <label style={labelStyle}>{t("message")}</label>
                  <textarea
                    className="contact-input"
                    rows={5}
                    style={{ ...inputPlainStyle, resize: "vertical", lineHeight: 1.6 }}
                    placeholder="Tell us more about your question or concern..."
                    {...register("message")}
                  />
                  {errors.message && <span style={errorStyle}>{errors.message.message}</span>}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={loading}
                    style={{ width: "100%" }}
                    startContent={!loading ? <Send size={16} /> : undefined}
                  >
                    {t("send")}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-5"
        >
          {/* FAQ Teaser */}
          <div style={{
            padding: "1.75rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HelpCircle size={18} style={{ color: "var(--color-accent)" }} />
              Frequently Asked
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { q: "How long does shipping take?", a: "Standard 5-7 days, Express 2-3 days." },
                { q: "What is your return policy?", a: "30-day returns on all unused items." },
                { q: "Do you ship internationally?", a: "Yes, across all EU countries." },
                { q: "How do I track my order?", a: "Check your account or email for tracking." },
              ].map((faq, i) => (
                <div key={i} style={{
                  padding: "0.75rem",
                  borderRadius: "10px",
                  background: "var(--color-bg-secondary)",
                  fontSize: "0.8125rem",
                }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--color-text)" }}>{faq.q}</p>
                  <p style={{ color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response Time */}
          <div style={{
            padding: "1.5rem",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(135deg, #1A1A2E 0%, #2d2d4e 100%)",
            color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
              <Clock size={18} style={{ color: "#1B4DFF" }} />
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Response Times</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Email</span>
                <span style={{ fontWeight: 600 }}>Within 24h</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Phone</span>
                <span style={{ fontWeight: 600 }}>Immediate</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Wholesale</span>
                <span style={{ fontWeight: 600 }}>Within 48h</span>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div style={{
            padding: "1.5rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={18} style={{ color: "var(--color-accent)" }} />
              Company Details
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "var(--color-text)" }}>AVONTRA LTD</strong>
              <br />
              Company number: 17245887
              <br />
              Director: Helen CHAMPION
              <br />
              Dept 6735, 196 High Road,
              <br />
              Wood Green, London,
              <br />
              United Kingdom, N22 8HH
              <br />
              Phone: <a href="tel:+447360545980" style={{ color: "var(--color-accent)", textDecoration: "none" }}>+44 7360 545980</a>
              <br />
              Email: <a href="mailto:info@elenelectro.com" style={{ color: "var(--color-accent)", textDecoration: "none" }}>info@elenelectro.com</a>
            </p>
          </div>

          {/* Trust */}
          <div style={{
            padding: "1.25rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <ShieldCheck size={20} style={{ color: "#2E7D32", flexShrink: 0 }} />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Your information is secure and will only be used to respond to your inquiry. We never share your data.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
