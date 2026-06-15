import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (user) {
    router.replace(router.query.redirect as string || "/dashboard")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      router.push((router.query.redirect as string) || "/dashboard")
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center"><Logo size="auth" asLink={false} showText={false} /></div>
          <p className="mt-2 text-ink-muted">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 space-y-5">
          <Input
            label="Correo electr&oacute;nico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="t&uacute;@email.com"
            required
          />
          <Input
            label="Contrase&ntilde;a"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contrase&ntilde;a"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Iniciar sesi&oacute;n
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-clay hover:text-clay-dark font-medium">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
