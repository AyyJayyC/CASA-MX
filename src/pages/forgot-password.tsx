import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
    } catch (err) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error al enviar el enlace")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center"><Logo size="auth" asLink={false} showText={false} /></div>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 text-center space-y-4">
            <p className="text-4xl">\u2709\uFE0F</p>
            <h2 className="text-xl font-semibold text-ink">Revisa tu email</h2>
            <p className="text-ink-muted text-sm">
              Si existe una cuenta con ese email, te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="block text-clay hover:text-clay-dark text-sm font-medium">
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 space-y-5">
            <h2 className="text-xl font-semibold text-ink text-center">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-ink-muted text-center">
              Ingresa tu email y te enviaremos un enlace para restablecerla.
            </p>
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Enviar enlace
            </Button>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <p className="text-center text-sm text-ink-muted">
              <Link href="/login" className="text-clay hover:text-clay-dark font-medium">Volver al login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
