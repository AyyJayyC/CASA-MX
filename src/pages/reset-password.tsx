import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import api from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token: String(token ?? ""), password })
      setDone(true)
    } catch (err) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error al actualizar la contraseña")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center"><Logo size="auth" asLink={false} showText={false} /></div>
        </div>

        {!token ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 text-center space-y-4">
            <p className="text-4xl">\u26A0\uFE0F</p>
            <h2 className="text-xl font-semibold text-ink">Enlace inválido</h2>
            <p className="text-ink-muted text-sm">El enlace de restablecimiento no es válido o ha expirado.</p>
            <Link href="/forgot-password" className="inline-block px-6 py-3 bg-clay text-white font-medium rounded-lg hover:bg-clay-dark transition-colors">
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 text-center space-y-4">
            <p className="text-4xl">\u2705</p>
            <h2 className="text-xl font-semibold text-ink">Contraseña actualizada</h2>
            <p className="text-ink-muted text-sm">Tu contraseña ha sido actualizada exitosamente.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-clay text-white font-medium rounded-lg hover:bg-clay-dark transition-colors">
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 space-y-5">
            <h2 className="text-xl font-semibold text-ink text-center">Nueva contraseña</h2>
            <Input label="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
            <Input label="Confirmar contraseña" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite la contraseña" required />
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <Button type="submit" loading={loading} className="w-full">Actualizar contraseña</Button>
          </form>
        )}
      </div>
    </div>
  )
}
