"use client";
import React from "react";

function Alert({ emoji, title, items, action, color }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`p-4 rounded-lg border ${color} flex flex-col gap-1.5`}>
      <p className="text-sm font-semibold flex items-center gap-1.5">
        <span>{emoji}</span> {title}
        <span className="text-xs font-normal opacity-60 ml-1">
          ({items.length})
        </span>
      </p>
      <ul className="text-xs space-y-0.5">
        {items.slice(0, 5).map((item, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="truncate max-w-[70%]">
              {item.colonia || item.title}
              {item.ciudad ? `, ${item.ciudad}` : ""}
            </span>
            <span className="font-medium shrink-0 ml-2">
              {item.detail || ""}
            </span>
          </li>
        ))}
        {items.length > 5 && (
          <li className="text-xs opacity-60">+{items.length - 5} más</li>
        )}
      </ul>
      {action && <p className="text-xs mt-1 opacity-70 italic">{action}</p>}
    </div>
  );
}

export default function OpportunitiesPanel({ opportunities, loading }) {
  if (loading) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
        <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded" />
          <div className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (!opportunities) return null;

  const hasContent = [
    opportunities.highDemandLowSupply,
    opportunities.underpricedOffers,
    opportunities.staleProperties,
    opportunities.trendingUp,
    opportunities.trendingDown,
  ].some((arr) => arr && arr.length > 0);

  if (!hasContent) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Sin alertas
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          No se detectaron oportunidades en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
        <span>⚡</span> Oportunidades
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Alert
          emoji="🔥"
          title="Alta demanda, poca oferta"
          items={opportunities.highDemandLowSupply?.map((i) => ({
            ...i,
            detail: i.score ? `Score ${i.score.toFixed(1)}` : "",
          }))}
          action="Contactar propietarios en estas zonas para publicar"
          color="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
        />

        <Alert
          emoji="📉"
          title="Ofertas por debajo del precio"
          items={opportunities.underpricedOffers?.map((i) => ({
            ...i,
            detail: i.avgDiscount
              ? `-${Math.abs(i.avgDiscount).toFixed(0)}%`
              : "",
          }))}
          action="Sugerir ajuste de expectativas a vendedores"
          color="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        />

        <Alert
          emoji="⏳"
          title="Propiedades estancadas (&gt;60d sin oferta)"
          items={opportunities.staleProperties?.map((i) => ({
            ...i,
            detail: i.daysSinceListed ? `${i.daysSinceListed} días` : "",
          }))}
          action="Revisar listing: fotos, descripción, precio sugerido"
          color="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
        />

        <Alert
          emoji="📈"
          title="Tendencia al alza"
          items={opportunities.trendingUp?.map((i) => ({
            ...i,
            detail: i.momChange ? `+${i.momChange.toFixed(1)}%` : "",
          }))}
          action="Incentivar publicaciones en estas zonas"
          color="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
        />

        <Alert
          emoji="📉"
          title="Tendencia a la baja"
          items={opportunities.trendingDown?.map((i) => ({
            ...i,
            detail: i.momChange ? `${i.momChange.toFixed(1)}%` : "",
          }))}
          action="Revisar precios y estrategia en estas zonas"
          color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
        />
      </div>
    </div>
  );
}
