"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import MarketKpiCards from "@/components/analytics/MarketKpiCards";
import OpportunitiesPanel from "@/components/analytics/OpportunitiesPanel";
import {
  getMarketSummary,
  getMarketByCity,
  getMarketByColonia,
  getOfferTrends,
  getOpportunities,
} from "@/lib/api/analytics";

const OfferIndexChart = dynamic(
  () => import("@/components/analytics/OfferIndexChart"),
  { loading: () => <div className="h-80 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" /> }
);

const CityMarketTable = dynamic(
  () => import("@/components/analytics/CityMarketTable"),
  { loading: () => <div className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" /> }
);
import { formatCurrency } from "@/lib/utils/format";

export default function MarketAnalyticsPage() {
  return (
    <RequireRole roles={["admin"]}>
      <MarketContent />
    </RequireRole>
  );
}

function MarketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType =
    searchParams.get("tipo") === "renta" ? "for_rent" : "for_sale";
  const [listingType, setListingType] = useState(initialType);
  const [summary, setSummary] = useState(null);
  const [cities, setCities] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [topTrends, setTopTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (lt) => {
    setLoading(true);
    setError(null);

    try {
      const [sum, cityData, opps] = await Promise.all([
        getMarketSummary(lt),
        getMarketByCity(undefined, lt),
        getOpportunities(lt),
      ]);

      setSummary(sum);
      setCities(cityData || []);
      setOpportunities(opps);
      setChartData(cityData || []);

      if (!sum)
        setError(
          "No se pudieron cargar los datos. Verifica la conexión con el backend.",
        );
    } catch (err) {
      setError("Error al cargar el dashboard de mercado.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(listingType);
  }, [listingType, fetchAll]);

  const handleDrilldown = useCallback(
    async (estado, ciudad) => {
      return getMarketByColonia(estado, ciudad, listingType);
    },
    [listingType],
  );

  const selectedTrend = listingType === "for_sale" ? "Venta" : "Renta";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Análisis de Mercado
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Ofertas, tendencias y oportunidades por ciudad y colonia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setListingType("for_sale");
              router.replace("/admin/analytics/market?tipo=venta", {
                scroll: false,
              });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              listingType === "for_sale"
                ? "bg-clay text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-clay dark:hover:border-clay-400"
            }`}
          >
            Venta
          </button>
          <button
            onClick={() => {
              setListingType("for_rent");
              router.replace("/admin/analytics/market?tipo=renta", {
                scroll: false,
              });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              listingType === "for_rent"
                ? "bg-clay text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-clay dark:hover:border-clay-400"
            }`}
          >
            Renta
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <MarketKpiCards summary={summary} loading={loading && !summary} />

      <OpportunitiesPanel
        opportunities={opportunities}
        loading={loading && !opportunities}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OfferIndexChart data={chartData} loading={loading && !chartData} />
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            Resumen del Mercado
          </h2>
          <p className="text-xs text-neutral-400 mb-4">
            Indicadores clave para {selectedTrend}
          </p>
          {summary ? (
            <div className="grid grid-cols-2 gap-3">
              <StatRow
                label="Oferta mediana/m²"
                value={formatCurrency(summary.medianOfferPerSqm)}
              />
              <StatRow
                label="Días a 1ᵃ oferta (mediana)"
                value={`${summary.medianDaysToOffer || "—"} días`}
              />
              <StatRow
                label="Tasa de aceptación"
                value={`${summary.acceptanceRate != null ? summary.acceptanceRate.toFixed(1) + "%" : "—"}`}
              />
              <StatRow
                label="Tasa de contraoferta"
                value={`${summary.counterRate != null ? summary.counterRate.toFixed(1) + "%" : "—"}`}
              />
              <StatRow
                label="Ofertas por propiedad"
                value={`${summary.avgOffersPerProperty?.toFixed(1) || "—"}`}
              />
              <StatRow
                label="Ratio oferta/precio"
                value={`${summary.offerToAskRatio != null ? (summary.offerToAskRatio * 100).toFixed(0) + "%" : "—"}`}
              />
              <StatRow
                label="Propiedades estancadas"
                value={`${summary.staleCount || 0}`}
              />
              <StatRow
                label="Ciudades activas"
                value={`${cities?.length || 0}`}
              />
            </div>
          ) : (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CityMarketTable
        cities={cities}
        loading={loading && !cities}
        onDrilldown={handleDrilldown}
        listingType={listingType}
      />
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        {value}
      </span>
    </div>
  );
}
