"use client";
import React from "react";
import HeroCarousel from "./HeroCarousel.jsx";
import FeaturedCarousel from "./FeaturedCarousel.jsx";
import { useProperties } from "@/lib/queries/properties";

export default function HeroSection() {
  const { data = [] } = useProperties();
  const hero = data.filter((p) => p.promotionTier === "carousel");

  return (
    <>
      <HeroCarousel properties={hero} />
      {hero.length > 0 && (
        <section className="py-12 px-4 bg-white dark:bg-neutral-950">
          <div className="container max-w-6xl">
            <h2 className="text-2xl font-normal text-neutral-900 dark:text-neutral-100 mb-12">
              Propiedades destacadas
            </h2>
            <FeaturedCarousel properties={hero} />
          </div>
        </section>
      )}
    </>
  );
}
