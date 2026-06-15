import { Layout } from "@/components/layout/Layout"
import Link from "next/link"

export default function TerminosPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sand">
        <Link href="/" className="text-clay hover:text-clay-dark text-sm font-medium mb-4 inline-block">&larr; Volver</Link>
        <h1 className="text-2xl font-bold text-ink mb-6">Términos y Condiciones</h1>

        <section className="space-y-4 text-ink-light leading-relaxed">
          <h2 className="text-lg font-semibold text-ink">1. Aceptación</h2>
          <p>Al registrarte y usar CASA MX, aceptas estos términos y condiciones.</p>

          <h2 className="text-lg font-semibold text-ink">2. Registro</h2>
          <p>Debes proporcionar información veraz y mantenerla actualizada. Eres responsable de la seguridad de tu cuenta.</p>

          <h2 className="text-lg font-semibold text-ink">3. Publicación de propiedades</h2>
          <p>Las propiedades publicadas deben ser reales y estar disponibles. Nos reservamos el derecho de remover contenido inapropiado o fraudulento.</p>

          <h2 className="text-lg font-semibold text-ink">4. Créditos y pagos</h2>
          <p>Los créditos adquiridos son no reembolsables y se utilizan para acceder a funcionalidades premium de la plataforma.</p>

          <h2 className="text-lg font-semibold text-ink">5. Privacidad</h2>
          <p>Tu información personal se trata conforme a nuestro Aviso de Privacidad.</p>

          <h2 className="text-lg font-semibold text-ink">6. Modificaciones</h2>
          <p>Podemos modificar estos términos en cualquier momento. Los cambios se notificarán por email o al iniciar sesión.</p>

          <h2 className="text-lg font-semibold text-ink">7. Contacto</h2>
          <p>Para dudas sobre estos términos, escríbenos a soporte@casa-mx.com</p>

          <p className="text-sm text-ink-muted pt-8">
            Última actualización: {new Date().toLocaleDateString("es-MX")}
          </p>
        </section>
      </div>
    </Layout>
  )
}
