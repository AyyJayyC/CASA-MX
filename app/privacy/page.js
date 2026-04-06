export const metadata = {
  title: 'Política de Privacidad | CASA MX',
  description: 'Política de privacidad de CASA MX.',
};

export default function PrivacyPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Política de Privacidad</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        En CASA MX protegemos tus datos personales y los tratamos conforme a la normativa aplicable.
      </p>

      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Datos que recopilamos</h2>
        <p>Recopilamos datos de cuenta, actividad en la plataforma y datos necesarios para operar búsquedas y publicaciones.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Uso de la información</h2>
        <p>Usamos la información para autenticación, operación del servicio, seguridad, soporte y mejora del producto.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Derechos del usuario</h2>
        <p>Puedes solicitar acceso, corrección o eliminación de tus datos mediante los canales de soporte oficiales.</p>
      </div>
    </section>
  );
}
