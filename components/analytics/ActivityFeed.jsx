import React from 'react';
import analytics from '@/lib/analytics';
import { getRoleLabel } from '@/lib/reviews';

export default function ActivityFeed({ limit = 20 }) {
  const events = analytics.getRecentEvents(limit);

  if (!events || events.length === 0) {
    return <div className="p-4">Sin actividad reciente.</div>;
  }

  return (
    <div className="p-4">
      <ul className="space-y-2">
        {events.map((e, idx) => (
          <li key={`${e.timestamp}-${idx}`} className="border rounded p-2">
            <div className="text-sm font-medium">{e.eventName}</div>
            <div className="text-xs text-gray-500">{e.timestamp}</div>
            <div className="text-xs">Usuario: {e.userId || '—'} Rol: {getRoleLabel(e.activeRole) || '—'}</div>
            <div className="text-xs">Entidad: {e.entityId || '—'}</div>
            <div className="text-xs">{JSON.stringify(e.metadata)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
