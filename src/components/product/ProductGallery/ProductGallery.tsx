"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-white border border-line cursor-zoom-in p-2 sm:p-4 flex items-center justify-center text-ink-subtle">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-white border border-line cursor-zoom-in p-2 sm:p-4">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`relative w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden cursor-pointer border-2 shrink-0 bg-surface-2 transition-all ${
                index === selectedIndex
                  ? "border-brand"
                  : "border-transparent hover:border-line-hover hover:scale-105"
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                sizes="64px"
                style={{ objectFit: "contain" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
