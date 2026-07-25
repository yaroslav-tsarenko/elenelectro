"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators/checkout";
import { formatPrice } from "@/lib/utils/format-price";
import { COUNTRIES } from "@/lib/countries";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { MerchantInfo } from "@/components/checkout/MerchantInfo";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Truck, CreditCard,
  ChevronRight, ShieldCheck, Lock, Check, ImageOff, UserPlus, Tag, X as XIcon,
} from "lucide-react";

interface AppliedDiscount {
  type: "welcome" | "newsletter";
  percent: number;
  code: string;
  source: "auto" | "code";
}

const SHIPPING_METHODS = [
  { key: "standard", label: "Standard Shipping", time: "5-7 business days", price: 5.99, icon: Truck },
  { key: "express", label: "Express Shipping", time: "2-3 business days", price: 12.99, icon: Truck },
  { key: "free", label: "Economy Shipping", time: "7-14 business days", price: 0, icon: Truck },
];

const stepIcons = [Mail, MapPin, CreditCard];
const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const inputBaseStyle: React.CSSProperties = {
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
  ...inputBaseStyle,
  paddingLeft: "1rem",
};

const selectStyle: React.CSSProperties = {
  ...inputPlainStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9EB8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  paddingRight: "2rem",
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
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

function InputWithIcon({ icon: Icon, error, ...props }: { icon: React.ElementType; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ position: "relative" }}>
      <Icon size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
      <input
        {...props}
        style={{
          ...inputBaseStyle,
          borderColor: error ? "var(--color-danger)" : undefined,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const nav = useTranslations("nav");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { currency, convert } = useCurrency();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contact: { email: user?.email || "", phone: "" },
      shipping: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
      },
      shippingMethod: "standard",
      acceptedPolicies: false,
    },
  });

  const steps = [t("contact"), t("shipping"), t("review")];
  const selectedMethod = watch("shippingMethod");
  const selectedCountry = watch("shipping.country");
  const availableMethods = cart.subtotal >= 100
    ? SHIPPING_METHODS
    : SHIPPING_METHODS.filter((m) => m.key !== "free");
  const shippingPrice = SHIPPING_METHODS.find((m) => m.key === selectedMethod)?.price ?? 5.99;

  const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
  const phoneHint = countryData ? `${countryData.phone} XX XXX XXXX` : "+44 XX XXX XXXX";

  const discountAmount = discount ? +(cart.subtotal * (discount.percent / 100)).toFixed(2) : 0;
  const discountedSubtotal = Math.max(cart.subtotal - discountAmount, 0);
  const taxOnDiscounted = +(discountedSubtotal * 0.21).toFixed(2);
  const finalShipping = discountedSubtotal >= 100 && selectedMethod === "free" ? 0 : shippingPrice;

  useEffect(() => {
    let cancelled = false;
    if (user) {
      fetch("/api/discounts")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && d?.discount) setDiscount(d.discount);
        })
        .catch(() => null);
    }
    return () => { cancelled = true; };
  }, [user]);

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setApplyingPromo(true);
    setPromoError(null);
    try {
      const r = await fetch(`/api/discounts?code=${encodeURIComponent(code)}`);
      const data = await r.json();
      if (data?.discount) {
        setDiscount(data.discount);
        setPromoInput("");
        toast.success(`${data.discount.percent}% discount applied!`);
      } else {
        setPromoError("Invalid or expired code");
      }
    } catch {
      setPromoError("Failed to apply code");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setPromoError(null);
  };

  const goNext = async () => {
    if (step === 0) {
      const valid = await trigger("contact");
      if (!valid) return;
    } else if (step === 1) {
      const valid = await trigger(["shipping", "shippingMethod"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          locale,
          discountCode: discount?.source === "code" ? discount.code : undefined,
          currency,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantName: item.variantName,
          })),
        }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          // ignore
        }
        console.error("Checkout submission failed on server:", errorData);
        throw new Error(errorData?.details || errorData?.error || "Failed to create order");
      }

      const order = await res.json();
      if (order.paymentLink) {
        window.location.href = order.paymentLink;
      } else {
        toast.success("Order placed successfully!");
        router.push(`/order/confirmed?orderId=${order.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

  if (cart.items.length === 0) return null;

  const freeShippingThreshold = convert(100);
  const subtotalConverted = convert(cart.subtotal);
  const amountToFreeShipping = freeShippingThreshold - subtotalConverted;

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: nav("cart"), href: "/cart" }, { label: t("title") }]} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[1.75rem] max-[480px]:text-[1.375rem] font-extrabold tracking-[-0.03em] mb-4 max-[480px]:mb-3"
      >
        {t("title")}
      </motion.h1>

      {/* Guest checkout notice */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1.25rem",
            borderRadius: "12px",
            background: "var(--color-accent-light)",
            border: "1px solid var(--color-accent)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <UserPlus size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <span>
            Checking out as guest.{" "}
            <Link href="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/auth/register" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
              create an account
            </Link>{" "}
            to track orders easily.
          </span>
        </motion.div>
      )}

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-0 mb-8 max-[480px]:mb-6 p-1 rounded-2xl bg-surface-1"
      >
        {steps.map((s, i) => {
          const Icon = stepIcons[i];
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "none",
                cursor: i <= step ? "pointer" : "default",
                background: isActive ? "var(--color-bg)" : "transparent",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.8125rem",
                color: isActive ? "var(--color-text)" : isDone ? "var(--color-accent)" : "var(--color-text-tertiary)",
                transition: "all 0.2s",
              }}
            >
              {isDone ? (
                <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : (
                <Icon size={16} />
              )}
              <span className="inline max-[480px]:hidden">{s}</span>
            </button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">
        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="contact"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 max-sm:gap-4 p-8 max-sm:p-5 border border-line rounded-xl max-sm:rounded-lg bg-surface"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("contact")}</h2>
                </div>
                <div>
                  <label style={labelStyle}>{t("email")} *</label>
                  <InputWithIcon
                    icon={Mail}
                    placeholder="your@email.com"
                    error={errors.contact?.email?.message}
                    {...register("contact.email")}
                  />
                  {!user && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem", display: "block" }}>
                      Order confirmation will be sent to this email
                    </span>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>{t("phone")}</label>
                  <InputWithIcon
                    icon={Phone}
                    placeholder={phoneHint}
                    error={errors.contact?.phone?.message}
                    {...register("contact.phone")}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem", display: "block" }}>
                    Include country code (e.g. +371, +44, +49)
                  </span>
                </div>
                <Button color="primary" size="lg" onPress={goNext} style={{ marginTop: "0.5rem" }}>
                  Continue to Shipping <ChevronRight size={16} />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="shipping"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 max-sm:gap-4 p-8 max-sm:p-5 border border-line rounded-xl max-sm:rounded-lg bg-surface"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("shipping")}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>{t("firstName")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.firstName ? "var(--color-danger)" : undefined }} placeholder="John" {...register("shipping.firstName")} />
                    {errors.shipping?.firstName && <span style={errorStyle}>{errors.shipping.firstName.message}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("lastName")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.lastName ? "var(--color-danger)" : undefined }} placeholder="Doe" {...register("shipping.lastName")} />
                    {errors.shipping?.lastName && <span style={errorStyle}>{errors.shipping.lastName.message}</span>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("address")} *</label>
                  <InputWithIcon icon={MapPin} placeholder="123 Main Street" error={errors.shipping?.address1?.message} {...register("shipping.address1")} />
                </div>
                <div>
                  <label style={labelStyle}>{t("apartment")}</label>
                  <input style={inputPlainStyle} placeholder="Apt 4B (optional)" {...register("shipping.address2")} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>{t("city")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.city ? "var(--color-danger)" : undefined }} placeholder="Riga" {...register("shipping.city")} />
                    {errors.shipping?.city && <span style={errorStyle}>{errors.shipping.city.message}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("province")}</label>
                    <input style={inputPlainStyle} placeholder="Region (optional)" {...register("shipping.province")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>{t("postalCode")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.postalCode ? "var(--color-danger)" : undefined }} placeholder="LV-1001" {...register("shipping.postalCode")} />
                    {errors.shipping?.postalCode && <span style={errorStyle}>{errors.shipping.postalCode.message}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("country")} *</label>
                    <select
                      style={{
                        ...selectStyle,
                        borderColor: errors.shipping?.country ? "var(--color-danger)" : undefined,
                      }}
                      {...register("shipping.country")}
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    {errors.shipping?.country && <span style={errorStyle}>{errors.shipping.country.message}</span>}
                  </div>
                </div>

                {/* Shipping Method Cards */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>{t("shippingMethod")}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {availableMethods.map((m) => {
                      const isSelected = selectedMethod === m.key;
                      return (
                        <label
                          key={m.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem 1.25rem",
                            borderRadius: "12px",
                            border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                            background: isSelected ? "var(--color-accent-light)" : "var(--color-bg)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <input type="radio" value={m.key} {...register("shippingMethod")} style={{ display: "none" }} />
                          <div
                            style={{
                              width: "1.25rem",
                              height: "1.25rem",
                              borderRadius: "50%",
                              border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--color-accent)" }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{m.label}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{m.time}</div>
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: m.price === 0 ? "#2E7D32" : "var(--color-text)" }}>
                            {m.price === 0 ? "Free" : formatPrice(convert(m.price), currency)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <Button variant="bordered" size="lg" onPress={() => setStep(0)} style={{ flex: "0 0 auto" }}>
                    Back
                  </Button>
                  <Button color="primary" size="lg" onPress={goNext} style={{ flex: 1 }}>
                    Review Order <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="review"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 max-sm:gap-4 p-8 max-sm:p-5 border border-line rounded-xl max-sm:rounded-lg bg-surface"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("review")}</h2>
                </div>

                {/* Order Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {cart.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.875rem 0",
                        borderBottom: i < cart.items.length - 1 ? "1px solid var(--color-border)" : "none",
                      }}
                    >
                      <div style={{
                        position: "relative",
                        width: "56px",
                        height: "56px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#fff",
                        border: "1px solid var(--color-border)",
                        flexShrink: 0,
                      }}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="56px" style={{ objectFit: "contain", padding: "4px" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                            <ImageOff size={18} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Qty: {item.quantity}</div>
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>
                        {formatPrice(convert(item.price * item.quantity), currency)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: "0.25rem" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      {...register("acceptedPolicies")}
                      style={{
                        width: "1.125rem",
                        height: "1.125rem",
                        marginTop: "0.125rem",
                        accentColor: "var(--color-accent)",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                    />
                    <span className="text-[0.8125rem] leading-[1.5] [&_a]:text-brand [&_a]:font-semibold [&_a]:no-underline hover:[&_a]:underline">
                      {t.rich("acceptPolicies", {
                        terms: (chunks) => <Link href="/policies/terms" target="_blank">{chunks}</Link>,
                        privacy: (chunks) => <Link href="/policies/privacy" target="_blank">{chunks}</Link>,
                      })}
                      {" *"}
                    </span>
                  </label>
                  {errors.acceptedPolicies && (
                    <span style={errorStyle}>{t("acceptPoliciesRequired")}</span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <Button variant="bordered" size="lg" onPress={() => setStep(1)} style={{ flex: "0 0 auto" }}>
                    Back
                  </Button>
                  <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      isLoading={submitting}
                      style={{ width: "100%" }}
                      startContent={!submitting ? <Lock size={16} /> : undefined}
                    >
                      {t("placeOrder")}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Order Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-7 max-sm:p-5 border border-line rounded-xl max-sm:rounded-lg bg-surface h-fit lg:sticky lg:top-[calc(var(--header-height)+var(--announcement-height)+1rem)] max-lg:static max-lg:order-first"
        >
          <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1.25rem" }}>{t("orderSummary")}</h3>

          {/* Free shipping progress */}
          {amountToFreeShipping > 0 && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "var(--color-bg-secondary)",
              marginBottom: "1.25rem",
              fontSize: "0.8125rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Truck size={14} style={{ color: "var(--color-accent)" }} />
                <span>Add <strong>{formatPrice(amountToFreeShipping, currency)}</strong> more for free shipping</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--color-border)", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min((subtotalConverted / freeShippingThreshold) * 100, 100)}%`,
                  height: "100%",
                  background: "var(--color-accent)",
                  borderRadius: 2,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
          )}

          {/* Mini item list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  flexShrink: 0,
                }}>
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="40px" style={{ objectFit: "contain", padding: "2px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                      <ImageOff size={14} />
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--color-text-secondary)",
                    color: "#fff",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {item.quantity}
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-secondary)" }}>
                  {item.name}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
                  {formatPrice(convert(item.price * item.quantity), currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo / discount block */}
          <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)" }}>
            {discount ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "10px",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                fontSize: "0.8125rem",
              }}>
                <Tag size={14} style={{ color: "#15803d", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#166534" }}>
                    {discount.percent}% OFF applied
                  </div>
                  <div style={{ color: "#15803d", fontSize: "0.6875rem" }}>
                    {discount.type === "welcome" ? "Welcome discount" : `Code: ${discount.code}`}
                  </div>
                </div>
                {discount.source === "code" && (
                  <button
                    type="button"
                    onClick={removeDiscount}
                    aria-label="Remove discount"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#15803d", padding: 4, display: "flex" }}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.375rem" }}>Promo code</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                    placeholder="NEWS-XXXXXX"
                    style={{ ...inputPlainStyle, fontSize: "0.8125rem", letterSpacing: "0.5px" }}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={!promoInput.trim() || applyingPromo}
                    style={{
                      padding: "0 0.875rem",
                      borderRadius: "12px",
                      border: "none",
                      background: "var(--color-accent)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: promoInput.trim() && !applyingPromo ? "pointer" : "not-allowed",
                      opacity: promoInput.trim() && !applyingPromo ? 1 : 0.5,
                    }}
                  >
                    {applyingPromo ? "…" : "Apply"}
                  </button>
                </div>
                {promoError && <span style={errorStyle}>{promoError}</span>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(convert(cart.subtotal), currency)}</span>
            </div>
            {discount && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#15803d" }}>
                <span>Discount ({discount.percent}%)</span>
                <span style={{ fontWeight: 600 }}>−{formatPrice(convert(discountAmount), currency)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span style={{ fontWeight: 500, color: finalShipping === 0 ? "#2E7D32" : undefined }}>
                {finalShipping > 0 ? formatPrice(convert(finalShipping), currency) : "Free"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Tax (21%)</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(convert(taxOnDiscounted), currency)}</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              fontSize: "1.125rem",
              borderTop: "2px solid var(--color-border)",
              paddingTop: "0.875rem",
              marginTop: "0.375rem",
            }}>
              <span>Total</span>
              <span>{formatPrice(convert(discountedSubtotal + taxOnDiscounted + finalShipping), currency)}</span>
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              <ShieldCheck size={14} />
              Secure checkout with SSL encryption
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              <Lock size={14} />
              Your data is protected
            </div>
          </div>

          <MerchantInfo title={t("merchantInfo")} />
        </motion.div>
      </div>
    </div>
  );
}
