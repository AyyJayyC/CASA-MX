"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";

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
  const dialogRef = useRef(null);

  useEffect(() => {
    if (currentIndex > safeImages.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, safeImages.length]);

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
  const goPrev = () => setCurrentIndex((index) => Math.max(0, index - 1));
  const goNext = () =>
    setCurrentIndex((index) => Math.min(safeImages.length - 1, index + 1));
  const openLightbox = () => {
    const d = dialogRef.current;
    if (d?.showModal) d.showModal();
  };
  const handleBackdropClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      dialogRef.current?.close();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
        <div className="relative aspect-[4/3] sm:aspect-[16/9]">
          <Image
            src={activeImage}
            alt={`${title} - imagen ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* after the image: a preceding overlay would paint under it and never receive the click */}
          <button
            type="button"
            onClick={openLightbox}
            aria-label={`Ver imagen ${currentIndex + 1} en tamaño completo`}
            className="absolute inset-0 cursor-zoom-in"
          />
          <Maximize2
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 rounded-full bg-neutral-950/70 p-1.5 text-white/80"
          />
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex === safeImages.length - 1}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
          <div
            aria-live="polite"
            className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-neutral-950/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
          >
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
              aria-current={index === currentIndex ? "true" : undefined}
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

      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="gallery-lightbox-title"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") goPrev();
          if (event.key === "ArrowRight") goNext();
        }}
        onClick={handleBackdropClick}
        className="m-auto h-[90dvh] w-[96vw] max-w-6xl overflow-hidden rounded-2xl bg-neutral-950 p-0 text-white"
      >
        <div className="relative h-full w-full">
          <h2
            id="gallery-lightbox-title"
            className="sr-only"
          >{`${title} - imagen ${currentIndex + 1} de ${safeImages.length}`}</h2>
          <Image
            src={activeImage}
            alt={`${title} - imagen ${currentIndex + 1}`}
            fill
            sizes="96vw"
            className="object-contain"
            loading="lazy"
            fetchpriority="low"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar galería"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/80 text-white"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex === safeImages.length - 1}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
          <p className="absolute bottom-4 right-4 rounded-full bg-neutral-900/80 px-3 py-1.5 text-sm font-medium">
            {currentIndex + 1} / {safeImages.length}
          </p>
        </div>
      </dialog>
    </div>
  );
}
