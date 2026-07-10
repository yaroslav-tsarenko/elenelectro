import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Heart, Truck, Shield, Award } from "lucide-react";

const values = [
  { icon: <Heart size={28} />, title: "Customer First", desc: "Whether you're a professional electrician or a DIY installer, your satisfaction drives every decision we make." },
  { icon: <Truck size={28} />, title: "Fast & Reliable", desc: "We partner with trusted carriers to deliver your electrical supplies quickly and safely, every time." },
  { icon: <Shield size={28} />, title: "Certified Quality", desc: "Every product meets professional installation standards and is sourced from certified manufacturers." },
  { icon: <Award size={28} />, title: "Trade Pricing", desc: "We work directly with manufacturers to offer competitive trade prices on cables, switchgear, and more." },
];

export default function AboutPage() {
  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-12 max-sm:mb-8">
          <h1 className="text-4xl max-sm:text-[1.625rem] font-extrabold tracking-[-0.04em] mb-4">
            About <span className="gradient-text">AvontShop</span>
          </h1>
          <p className="text-[1.0625rem] max-sm:text-[0.9375rem] text-ink-muted leading-[1.7] max-w-[540px] mx-auto">
            We&apos;re on a mission to make professional-grade electrical materials accessible to electricians, contractors, and DIY installers. Finding the right cables, switchgear, and installation accessories shouldn&apos;t be complicated.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[601px]:grid-cols-2 gap-5 max-[600px]:gap-3.5 mb-12 max-[600px]:mb-8">
          {values.map((v) => (
            <div key={v.title} className="p-7 max-[480px]:p-5 rounded-xl border border-line bg-surface">
              <div className="w-12 h-12 rounded-lg bg-brand-soft flex items-center justify-center text-brand mb-4">{v.icon}</div>
              <h3 className="text-[1.0625rem] font-bold mb-2">{v.title}</h3>
              <p className="text-sm text-ink-muted leading-[1.6]">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-10 max-[480px]:px-5 max-[480px]:py-7 rounded-2xl bg-brand text-white text-center">
          <h2 className="text-2xl max-[480px]:text-xl font-extrabold mb-3">Our Promise</h2>
          <p className="text-[0.9375rem] opacity-90 leading-[1.7] max-w-[480px] mx-auto">
            We stand behind every electrical product we sell. If you&apos;re not completely satisfied, we&apos;ll make it right — that&apos;s our guarantee to you.
          </p>
        </div>
      </div>
    </div>
  );
}
