"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Chip } from "@heroui/react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { name: string | null };
  product: { name: string; slug: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    fetch("/api/reviews?pending=true")
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchReviews, []);

  const handleAction = async (id: string, isApproved: boolean) => {
    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved }),
      });
      toast.success(isApproved ? "Review approved" : "Review rejected");
      fetchReviews();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="admin-page-title" style={{ marginBottom: "1.5rem" }}>Review Moderation</h1>

      {reviews.length === 0 ? (
        <p style={{ color: "var(--admin-text-secondary)" }}>No pending reviews</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              className="admin-item-card"
              style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{review.user.name || "Anonymous"}</span>
                  <span style={{ color: "var(--admin-text-muted)", marginLeft: "0.5rem" }}>on {review.product.name}</span>
                </div>
                <Chip size="sm" color="warning">{"★".repeat(review.rating)}</Chip>
              </div>
              {review.comment && <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>{review.comment}</p>}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button size="sm" color="success" startContent={<Check size={14} />} onPress={() => handleAction(review.id, true)}>Approve</Button>
                <Button size="sm" color="danger" variant="flat" startContent={<X size={14} />} onPress={() => handleAction(review.id, false)}>Reject</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
