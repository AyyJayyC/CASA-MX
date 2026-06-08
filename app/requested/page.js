import ContactRequestsList from "../../components/ContactRequestsList.jsx";

export default function RequestedPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Mis Solicitudes de Contacto
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Propiedades de las que has solicitado la dirección
        </p>
      </div>
      <ContactRequestsList />
    </div>
  );
}
