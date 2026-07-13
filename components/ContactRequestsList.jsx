"use client";
import React from "react";
import Link from "next/link";
import { useMyContactRequests } from "../lib/queries/requests";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ContactRequestsList() {
  const { data = [], isLoading } = useMyContactRequests();

  if (isLoading) {
    return <LoadingSpinner message="Cargando solicitudes..." />;
  }

  return (
    <div>
      {data.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No hay solicitudes
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            No has solicitado la dirección de ninguna propiedad aún
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Explorar propiedades
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total: {data.length}{" "}
              {data.length === 1 ? "solicitud" : "solicitudes"}
            </span>
          </div>

          <div className="grid gap-4">
            {data.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                      {req.property?.title || "Propiedad desconocida"}
                    </h3>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <p className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(req.createdAt).toLocaleDateString("es-MX")}
                      </p>
                      <p className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${req.status === "contacted" ? "bg-green-500" : "bg-clay-500"}`}
                        />
                        {req.status === "contacted"
                          ? "Dirección recibida"
                          : "Pendiente"}
                      </p>
                    </div>
                    {req.status === "contacted" && req.property?.address && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                        <p className="font-medium text-green-800 dark:text-green-300 flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Dirección: {req.property.address}
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/properties/${req.propertyId}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-clay-100 hover:bg-clay-200 dark:bg-clay-900/30 dark:hover:bg-clay-900/50 text-clay-900 dark:text-clay-400 font-medium text-sm rounded-lg transition-colors"
                  >
                    Ver propiedad
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
