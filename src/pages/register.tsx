import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ROLE_LABELS, type Role } from "@/types"

const REGISTER_ROLES: { role: Role; label: string; desc: string }[] = [
  { role: "seeker", label: ROLE_LABELS.seeker, desc: "Encuentra y aplica a propiedades" },
  { role: "owner", label: ROLE_LABELS.owner, desc: "Publica propiedades para venta o renta" },
  { role: "realtor", label: ROLE_LABELS.realtor, desc: "Agente profesional con perfil público" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role>("seeker")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (user) {
    router.replace("/dashboard")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const backendRoles: string[] = [selectedRole]
    if (selectedRole === "owner") {
      backendRoles.push("seller", "landlord")
    } else if (selectedRole === "realtor") {
      backendRoles.push("realtor")
    } else {
      backendRoles.push("buyer", "tenant")
    }

    try {
      await register(email, name, password, backendRoles)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center"><Logo size="auth" asLink={false} showText={false} /></div>
          <p className="mt-2 text-ink-muted">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-8 space-y-5">
          <Input
            label="Nombre completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan P&eacute;rez"
            required
          />
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
            placeholder="M&iacute;nimo 8 caracteres"
            required
            minLength={8}
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-3">Quiero</label>
            <div className="grid grid-cols-2 gap-3">
              {REGISTER_ROLES.map(({ role, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role
                      ? "border-clay bg-clay/5"
                      : "border-sand-dark/40 hover:border-clay/30 bg-white"
                  }`}
                >
                  <p className={`text-sm font-medium ${selectedRole === role ? "text-clay" : "text-ink"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-clay hover:text-clay-dark font-medium">
            Iniciar sesi&oacute;n
          </Link>
        </p>
      </div>
    </div>
  )
}
