/**
 * Requested properties page (buyer-only view)
 * Purpose: Show buyer's list of properties they've requested info on.
 */
import RequestedPropertiesList from '../../components/RequestedPropertiesList.jsx';

export default function RequestedPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Mis Solicitudes
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Propiedades sobre las que has solicitado información
        </p>
      </div>
      <RequestedPropertiesList />
    </div>
  );
}
