'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { getUserDocuments, uploadUserDocument, deleteUserDocument } from '@/lib/api/userDocuments';

const DOC_LABELS = {
  official_id: 'Identificación oficial (INE/IFE)',
  other: 'Otro documento',
};

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [pendingType, setPendingType] = useState('official_id');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    loadDocs();
  }, [isAuthenticated]);

  async function loadDocs() {
    setLoading(true);
    try {
      const list = await getUserDocuments();
      setDocs(list);
    } catch (e) {
      setError('No se pudieron cargar tus documentos.');
    } finally {
      setLoading(false);
    }
  }

  function handlePickFile(docType) {
    setPendingType(docType);
    setError('');
    setSuccess('');
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      await uploadUserDocument(file, pendingType, (pct) => setUploadProgress(pct));
      setSuccess(`${DOC_LABELS[pendingType]} subido correctamente.`);
      await loadDocs();
    } catch (e) {
      setError(e.message || 'Error al subir el archivo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleDelete(docId) {
    if (!confirm('¿Eliminar este documento?')) return;
    setError('');
    try {
      await deleteUserDocument(docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      setSuccess('Documento eliminado.');
    } catch (e) {
      setError(e.message || 'Error al eliminar el documento.');
    }
  }

  const hasINE = docs.some((d) => d.documentType === 'official_id');

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Cuenta</h1>
      <p className="text-gray-500 mb-8">Gestiona tu información y documentos de identidad.</p>

      {/* Profile summary */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Información personal</h2>
        <div className="space-y-1 text-sm text-gray-700">
          <p><span className="text-gray-400">Nombre:</span> {user?.name}</p>
          <p><span className="text-gray-400">Email:</span> {user?.email}</p>
        </div>
      </section>

      {/* Identity documents */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Documentos de identidad</h2>
        <p className="text-xs text-gray-500 mb-4">
          Tu identificación oficial (INE/IFE) es requerida para verificar propiedades.
          Solo necesitas subirla una vez para todas tus publicaciones.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            {success}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Cargando documentos…</p>
        ) : (
          <div className="space-y-3">
            {/* INE row */}
            <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Identificación oficial (INE/IFE)</p>
                {hasINE ? (
                  <p className="text-xs text-green-600 mt-0.5">✓ Documento cargado</p>
                ) : (
                  <p className="text-xs text-amber-600 mt-0.5">Pendiente de subir</p>
                )}
              </div>
              <button
                onClick={() => handlePickFile('official_id')}
                disabled={uploading}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 whitespace-nowrap"
              >
                {hasINE ? 'Reemplazar' : 'Subir'}
              </button>
            </div>

            {/* Existing docs list */}
            {docs.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Documentos subidos</p>
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium text-gray-700">{DOC_LABELS[doc.documentType] ?? doc.documentType}</span>
                      <span className="ml-2 text-gray-400 text-xs">{doc.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.viewUrl && (
                        <a href={doc.viewUrl} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 text-xs">Ver</a>
                      )}
                      <button onClick={() => handleDelete(doc.id)}
                        className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% subido…</p>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      <div className="mt-6">
        <button onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>
    </main>
  );
}
