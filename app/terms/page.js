export const metadata = {
  title: 'Términos de Servicio | CASA MX',
  description: 'Términos y condiciones de uso de CASA MX.',
};

export default function TermsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Términos de Servicio</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        El uso de CASA MX implica la aceptación de estos términos y condiciones.
      </p>

      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Uso permitido</h2>
        <p>Debes usar la plataforma de forma lícita, sin fraude, abuso o suplantación de identidad.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Contenido publicado</h2>
        <p>Los usuarios son responsables de la veracidad de la información y contenido de sus publicaciones.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Limitación de responsabilidad</h2>
        <p>CASA MX provee la plataforma "tal cual" y no garantiza resultados comerciales entre usuarios.</p>
      </div>
    </section>
  );
}
