"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737373" font-family="Arial" font-size="40">Casa-MX.com</text></svg>')}`;

export default function PropertyImageGallery({
  images = [],
  title = "Propiedad",
  showThumbnails = true,
}) {
  const safeImages = useMemo(() => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter(Boolean);
  }, [images]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = safeImages.length > 0;
  const hasMultipleImages = safeImages.length > 1;

  useEffect(() => {
    if (currentIndex > safeImages.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, safeImages.length]);

  useEffect(() => {
    if (!hasMultipleImages) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => Math.max(0, index - 1));
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => Math.min(safeImages.length - 1, index + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, safeImages.length]);

  if (!hasImages) {
    return (
      <div className="overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-100 p-8 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-neutral-400 shadow-sm dark:bg-neutral-800 dark:text-neutral-500">
          <ImageOff className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-medium">
          Aún no hay imágenes para esta propiedad.
        </p>
      </div>
    );
  }

  const activeImage = safeImages[currentIndex] || fallbackImage;

  return (
    <div className="space-y-4">
      <div className="group relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
        <div className="relative aspect-[21/9]">
          <Image
            src={activeImage}
            alt={`${title} - imagen ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            priority
          />
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((index) => Math.max(0, index - 1))
                }
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35 group-hover:opacity-100 md:opacity-0"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(safeImages.length - 1, index + 1),
                  )
                }
                disabled={currentIndex === safeImages.length - 1}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35 group-hover:opacity-100 md:opacity-0"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 right-4 rounded-full bg-neutral-950/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} de {safeImages.length}
          </div>
        </div>
      </div>

      {hasMultipleImages && showThumbnails && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {safeImages.map((image, index) => (
            <button
              key={`${String(image).slice(0, 48)}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border transition ${index === currentIndex ? "border-clay-500 ring-2 ring-clay-300/70" : "border-neutral-200 dark:border-neutral-700"}`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} miniatura ${index + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
