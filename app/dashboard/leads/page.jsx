"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { getReferredLeads } from "@/lib/api/leads";

function waLink(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function LeadCard({ lead, kind }) {
  const agent = lead.capturingAgent;
  const title = lead.property?.title || "Propiedad";
  const buyerName = kind === "offer" ? lead.buyerName : lead.name;
  const buyerPhone = kind === "offer" ? lead.buyerPhone : lead.phone;
  const buyerEmail = lead.buyerEmail;
  const link = agent
    ? waLink(
        agent.whatsapp || agent.phone,
        `Hola ${agent.name}, te contacto por el lead referido de "${title}".`,
      )
    : null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/properties/${lead.property?.id}`}
            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-clay-600"
          >
            {title}
          </Link>
          <p className="text-xs text-neutral-500 mt-0.5">
            {kind === "offer" ? "Oferta de compra" : "Solicitud de contacto"} ·{" "}
            {new Date(lead.createdAt).toLocaleDateString("es-MX")}
          </p>
        </div>
        {lead.offerAmount > 0 && (
          <span className="text-sm font-bold text-clay-600">
            ${Number(lead.offerAmount).toLocaleString("es-MX")}
          </span>
        )}
      </div>

      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        <p className="font-medium">{buyerName || "Interesado"}</p>
        <p className="text-neutral-500">
          {buyerPhone}
          {buyerEmail ? ` · ${buyerEmail}` : ""}
        </p>
        {lead.message && (
          <p className="italic text-neutral-500 mt-1">"{lead.message}"</p>
        )}
      </div>

      {agent && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-500">
            Agente de la propiedad:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {agent.name}
            </span>
          </span>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              Contactar por WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReferredLeadsPage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({ offers: [], requests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    getReferredLeads()
      .then((d) => {
        if (active) setData(d);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/login" className="text-clay hover:underline font-medium">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const leads = [
    ...data.offers.map((l) => ({ ...l, _kind: "offer" })),
    ...data.requests.map((l) => ({ ...l, _kind: "request" })),
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Leads referidos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Interesados que llegaron por tu enlace. Tú recibes su contacto y
            pagas el crédito; contacta al agente de la propiedad por WhatsApp.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-neutral-400 py-10">Cargando...</p>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">
              No tienes leads referidos todavía.
            </p>
            <p className="text-sm mt-1">
              Comparte una propiedad con tu enlace para empezar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadCard key={`${lead._kind}-${lead.id}`} lead={lead} kind={lead._kind} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
