const shimmerCls =
  "bg-[linear-gradient(90deg,var(--color-bg-secondary)_25%,var(--color-bg-tertiary)_50%,var(--color-bg-secondary)_75%)] bg-[length:800px_100%] animate-shimmer";

export function ProductSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-line bg-surface">
          <div className={`aspect-square ${shimmerCls}`} />
          <div className="p-4 flex flex-col gap-2">
            <div className={`w-[40%] h-2.5 rounded ${shimmerCls}`} />
            <div className={`w-[85%] h-3.5 rounded ${shimmerCls}`} />
            <div className={`w-[60%] h-3.5 rounded ${shimmerCls}`} />
            <div className="flex items-center justify-between mt-2">
              <div className={`w-[70px] h-[18px] rounded ${shimmerCls}`} />
              <div className={`w-9 h-9 rounded-lg ${shimmerCls}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
