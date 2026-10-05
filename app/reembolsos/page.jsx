export const metadata = {
  title: "Política de Reembolsos | Casa-MX.com",
  description:
    "Información sobre reembolsos de créditos adquiridos en Casa-MX.com.",
};

export default function ReembolsosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose dark:prose-invert">
      <h1>Política de Reembolsos</h1>
      <p className="text-sm text-gray-500">
        Créditos prepagados de Casa-MX.com
      </p>

      <h2>Créditos utilizados</h2>
      <p>
        Los créditos que ya fueron utilizados para desbloquear datos de contacto
        u otros servicios una vez utilizados no son reembolsables, conforme a
        la sección 5 de los Términos y Condiciones.
      </p>

      <h2>Créditos no utilizados</h2>
      <p>
        Si adquiriste un paquete de créditos y no los has utilizado, puedes
        solicitar su reembolso escribiendo a{" "}
        <a href="mailto:facturacion@casa-mx.com">facturacion@casa-mx.com</a> con
        los datos de tu compra. Revisaremos tu solicitud y te responderemos por
        ese medio.
      </p>

      <h2>Derechos del consumidor</h2>
      <p>
        Nada en esta política limita los derechos que la Ley Federal de
        Protección al Consumidor (LFPC) y la Procuraduría Federal del
        Consumidor (Profeco) reconocen a las personas consumidoras.
      </p>

      <h2>Contacto</h2>
      <p>
        Para dudas sobre esta política escribe a{" "}
        <a href="mailto:facturacion@casa-mx.com">facturacion@casa-mx.com</a>.
      </p>
    </main>
  );
}
