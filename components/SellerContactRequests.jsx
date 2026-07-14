"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSellerContactRequests } from "../lib/queries/requests";
import { approveRequest } from "../lib/api/requests";
import { useSpendCredit, useCreditsBalance } from "../lib/queries/credits";
import LoadingSpinner from "@/components/LoadingSpinner";

function redactPhone(phone) {
  if (!phone) return "—";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length <= 4) return "*".repeat(cleaned.length);
  return cleaned.slice(0, -4).replace(/\d/g, "*") + cleaned.slice(-4);
}

function redactName(name) {
  if (!name) return "Desconocido";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0] + "***";
  return parts[0] + " " + parts[parts.length - 1][0] + "***";
}

export default function SellerContactRequests() {
  const { data = [], isLoading, refetch } = useSellerContactRequests();
  const { data: balance = 0 } = useCreditsBalance();
  const { mutateAsync: spend } = useSpendCredit();
  const [unlocking, setUnlocking] = useState(null);
  const [unlockedContacts, setUnlockedContacts] = useState({});
  const [approving, setApproving] = useState(null);
  const [approvedIds, setApprovedIds] = useState(new Set());

  const handleUnlock = async (req) => {
    setUnlocking(req.id);
    try {
      const result = await spend(req.id, "request");
      if (result.success && result.contact) {
        setUnlockedContacts((prev) => ({ ...prev, [req.id]: result.contact }));
      }
    } catch (err) {
      if (err.status === 402) {
        alert("Saldo insuficiente. Ve a Créditos para comprar más.");
      } else {
        alert(err.message || "Error al desbloquear contacto");
      }
    } finally {
      setUnlocking(null);
    }
  };

  const handleApprove = async (req) => {
    setApproving(req.id);
    try {
      await approveRequest(req.id);
      setApprovedIds((prev) => new Set([...prev, req.id]));
      refetch();
    } catch (err) {
      alert(err.message || "Error al revelar dirección");
    } finally {
      setApproving(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando solicitudes..." />;
  }

  if (data.length === 0) {
    return (
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Sin solicitudes de contacto
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Aún no hay compradores que hayan solicitado la dirección de tus
          propiedades.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Total: {data.length} {data.length === 1 ? "solicitud" : "solicitudes"}
        </span>
      </div>

      <div className="grid gap-4">
        {data.map((req) => {
          const contact = unlockedContacts[req.id];
          const isApproved =
            approvedIds.has(req.id) || req.status === "contacted";

          return (
            <div
              key={req.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                      {req.property?.title || "Propiedad desconocida"}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>
                        {new Date(req.createdAt).toLocaleDateString("es-MX")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isApproved ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-clay-100 text-clay-800 dark:bg-clay-900/30 dark:text-clay-300"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-green-500" : "bg-clay-500"}`}
                        />
                        {isApproved ? "Dirección revelada" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/properties/${req.propertyId}`}
                    className="text-clay-600 dark:text-clay-400 hover:underline text-sm font-medium"
                  >
                    Ver propiedad →
                  </Link>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 text-sm">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {contact ? contact.fullName : redactName(req.name)}
                        </span>
                      </p>
                      {contact ? (
                        <p className="text-neutral-500 mt-0.5">
                          {contact.phone}{" "}
                          {contact.email && `· ${contact.email}`}
                        </p>
                      ) : (
                        <p className="text-neutral-500 mt-0.5">
                          Tel: {redactPhone(req.phone)}
                        </p>
                      )}
                      {req.message && (
                        <p className="text-neutral-500 mt-1 italic">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!contact && (
                        <button
                          onClick={() => handleUnlock(req)}
                          disabled={unlocking === req.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {unlocking === req.id
                            ? "..."
                            : "Ver datos (1 crédito)"}
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={approving === req.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {approving === req.id ? "..." : "Revelar dirección"}
                        </button>
                      )}
                      {isApproved && (
                        <span className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg border border-green-200 dark:border-green-800">
                          Dirección compartida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
