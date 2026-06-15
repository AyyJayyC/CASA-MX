import { Layout } from "@/components/layout/Layout"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/Button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { token } = router.query

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-6xl mb-4">\u2709\uFE0F</p>
          <h1 className="text-2xl font-bold text-ink mb-2">Verifica tu email</h1>
          <p className="text-ink-muted mb-6">
            {token ? "Estamos verificando tu cuenta. Un momento..." : "Revisa tu bandeja de entrada para el enlace de verificación."}
          </p>
          <Button onClick={() => router.push("/login")}>Ir al login</Button>
        </div>
      </div>
    </Layout>
  )
}
