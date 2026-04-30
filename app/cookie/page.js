export const metadata = {
  title: 'Política de Cookies | Casa-MX.com',
  description: 'Información sobre el uso de cookies en Casa-MX.com.',
};

export default function CookiePage() {
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Política de Cookies</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        Casa-MX.com utiliza cookies y tecnologías similares para mantener sesión, seguridad y analítica básica.
      </p>

      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Cookies esenciales</h2>
        <p>Necesarias para autenticación, navegación y funcionamiento básico de la plataforma.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Cookies de rendimiento</h2>
        <p>Ayudan a medir estabilidad y uso del sitio para mejorar la experiencia del usuario.</p>

        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Control de cookies</h2>
        <p>Puedes gestionar cookies desde la configuración de tu navegador y controles del sitio cuando aplique.</p>
      </div>
    </section>
  );
}

