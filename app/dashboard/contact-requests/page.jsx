"use client";
import React from "react";
import SellerContactRequests from "../../../components/SellerContactRequests.jsx";
import { useAuth } from "@/lib/auth/useAuth";
import Link from "next/link";

export default function SellerContactRequestsPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Link href="/login" className="text-clay hover:underline font-medium">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Solicitudes de Contacto
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Compradores interesados en conocer la dirección de tus propiedades.
            Desbloquea sus datos de contacto o comparte la dirección.
          </p>
        </div>
        <SellerContactRequests />
      </div>
    </div>
  );
}
