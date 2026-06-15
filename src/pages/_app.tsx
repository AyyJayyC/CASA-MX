import type { AppProps } from "next/app"
import Head from "next/head"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AuthProvider } from "@/context/AuthContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { OfflineBanner } from "@/components/OfflineBanner"
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <Head>
        <title>CASA MX — Tu Ruta, Tu Decisión</title>
        <meta name="description" content="Encuentra tu próximo hogar en México. Miles de propiedades en venta y renta." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <OfflineBanner />
            <Component {...pageProps} />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
