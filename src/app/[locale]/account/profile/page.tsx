"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validators/profile";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("account");
  const common = useTranslations("common");
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            reset({ name: data.user.name || "", phone: data.user.phone || "" });
          }
        });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, email: user?.email, name: data.name }),
      });
      await refresh();
      toast.success(t("editProfile"));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "32rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>{t("editProfile")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Email</label>
          <input value={user?.email || ""} readOnly style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", fontSize: "0.875rem", opacity: 0.6 }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Name</label>
          <input {...register("name")} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: errors.name ? "1px solid red" : "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", fontSize: "0.875rem" }} />
          {errors.name && <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.name.message}</p>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Phone</label>
          <input {...register("phone")} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", fontSize: "0.875rem" }} />
        </div>
        <Button type="submit" color="primary" isLoading={loading}>{common("save")}</Button>
      </form>
    </div>
  );
}
