"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthCard({ title, subtitle, children, footerHref = "/login", footerText = "Volver al inicio de sesión" }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          <div className="text-center mb-8">
            <Image
              src="/brand/logo-light.png"
              alt="Casa-MX.com"
              width={1000}
              height={300}
              className="mx-auto block h-11 w-auto mb-4"
              sizes="200px"
              priority
            />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <Link
            href={footerHref}
            className="font-semibold text-clay dark:text-clay-400 hover:text-clay-600 dark:hover:text-amber-300 transition-colors"
          >
            {footerText}
          </Link>
        </p>
      </div>
    </div>
  );
}
