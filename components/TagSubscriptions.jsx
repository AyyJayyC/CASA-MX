'use client';
import { useState, useEffect } from 'react';
import { getTagSubscriptions, addTagSubscription, removeTagSubscription } from '@/lib/api/tags';

export default function TagSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCiudad, setNewCiudad] = useState('');
  const [newColonia, setNewColonia] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const list = await getTagSubscriptions();
      setSubs(list);
    } catch (err) {
      setError(err.message || 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  }

  const ciudadSubs = subs.filter(s => s.tagType === 'ciudad');
  const coloniaSubs = subs.filter(s => s.tagType === 'colonia');

  async function handleAdd(type, name) {
    if (!name.trim()) return;
    try {
      setError(null);
      setSuccess(null);
      await addTagSubscription(type, name.trim());
      if (type === 'ciudad') setNewCiudad('');
      else setNewColonia('');
      await loadSubscriptions();
      setSuccess(`Suscrito a "${name.trim()}"`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al suscribir');
    }
  }

  async function handleRemove(id) {
    try {
      setError(null);
      await removeTagSubscription(id);
      await loadSubscriptions();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Recibe notificaciones cuando se publique una propiedad en las áreas que te interesan.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">{success}</p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400">Cargando suscripciones...</p>
      ) : (
        <>
          {/* Ciudad subscriptions */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Ciudades ({ciudadSubs.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ciudadSubs.map(s => (
                <span key={s.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-300 rounded-full text-xs font-medium">
                  {s.tagName}
                  <button onClick={() => handleRemove(s.id)}
                    className="ml-1 hover:text-red-500 transition-colors">&times;</button>
                </span>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); handleAdd('ciudad', newCiudad); }}
              className="flex gap-2">
              <input type="text" value={newCiudad} onChange={e => setNewCiudad(e.target.value)}
                placeholder="Ej: Hermosillo"
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400" />
              <button type="submit" disabled={!newCiudad.trim() || adding}
                className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                Agregar
              </button>
            </form>
          </div>

          {/* Colonia subscriptions */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Colonias ({coloniaSubs.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {coloniaSubs.map(s => (
                <span key={s.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-300 rounded-full text-xs font-medium">
                  {s.tagName}
                  <button onClick={() => handleRemove(s.id)}
                    className="ml-1 hover:text-red-500 transition-colors">&times;</button>
                </span>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); handleAdd('colonia', newColonia); }}
              className="flex gap-2">
              <input type="text" value={newColonia} onChange={e => setNewColonia(e.target.value)}
                placeholder="Ej: Colonia Centro"
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400" />
              <button type="submit" disabled={!newColonia.trim() || adding}
                className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                Agregar
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
