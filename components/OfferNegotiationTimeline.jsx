'use client';

function furnishedStatusLabel(value) {
  if (value === 'amueblada') return 'Amueblada';
  if (value === 'equipada') return 'Equipada (solo electrodomesticos)';
  if (value === 'sin_muebles') return 'Sin muebles';
  return '';
}

export default function OfferNegotiationTimeline({ events = [], title = 'Arbol / historial de negociacion' }) {
  if (!events.length) return null;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={`text-xs rounded-md px-3 py-2 ${event.actorRole === 'buyer' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">
                {event.actorRole === 'buyer' ? 'Comprador' : 'Vendedor'} · {event.action}
              </span>
              <span>${Number(event.amount || 0).toLocaleString('es-MX')} MXN</span>
            </div>
            {!!event.proposedFurnishedStatus && (
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                🛋️ {furnishedStatusLabel(event.proposedFurnishedStatus)}
              </span>
            )}
            {!!event.message && <p className="mt-1 text-neutral-600 dark:text-neutral-300">{event.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}