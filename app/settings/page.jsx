'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import VerificationBadges from '@/components/VerificationBadges';
import { getUserProfile, updateUserProfile, uploadProfileAvatar } from '@/lib/api/users';
import { getUserDocuments, uploadUserDocument } from '@/lib/api/userDocuments';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingIne, setUploadingIne] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [ineError, setIneError] = useState(null);
  const [ineSuccess, setIneSuccess] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState(null);
  const [profileBadges, setProfileBadges] = useState({
    officialIdUploaded: false,
    officialIdVerified: false,
    paidSubscriber: false,
    subscriptionStatus: 'inactive',
  });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserProfile();
        const docs = await getUserDocuments().catch(() => []);
        setDocuments(docs);
        setProfileBadges({
          officialIdUploaded: Boolean(user.officialIdUploaded),
          officialIdVerified: Boolean(user.officialIdVerified),
          paidSubscriber: Boolean(user.paidSubscriber),
          subscriptionStatus: user.subscriptionStatus || 'inactive',
        });
        setForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          avatarUrl: user.avatarUrl || '',
        });
      } catch (err) {
        const isUnauthorized = err?.status === 401 || String(err?.message || '').toLowerCase().includes('unauthorized');
        if (isUnauthorized) {
          router.push('/login');
        } else {
          setError('No se pudo cargar tu perfil. Inténtalo de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.phone !== undefined) payload.phone = form.phone;
      if (form.whatsapp !== undefined) payload.whatsapp = form.whatsapp;
      await updateUserProfile(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const officialIneDoc = documents.find((doc) => doc.documentType === 'official_id');
  const verifiedIne = Boolean(officialIneDoc?.isVerified);
  const pendingIne = Boolean(officialIneDoc) && !verifiedIne;
  const rejectedIne = officialIneDoc?.reviewStatus === 'rejected';

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarError(null);
    setAvatarSuccess(null);
    try {
      const result = await uploadProfileAvatar(file);
      setForm((prev) => ({ ...prev, avatarUrl: result?.avatarUrl || prev.avatarUrl }));
      setAvatarSuccess('Foto de perfil actualizada correctamente.');
    } catch (err) {
      setAvatarError(err.message || 'No se pudo subir tu foto de perfil');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleIneUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIne(true);
    setIneError(null);
    setIneSuccess(null);
    try {
      await uploadUserDocument(file, 'official_id');
      const docs = await getUserDocuments();
      setDocuments(docs);
      const user = await getUserProfile();
      setProfileBadges({
        officialIdUploaded: Boolean(user?.officialIdUploaded),
        officialIdVerified: Boolean(user?.officialIdVerified),
        paidSubscriber: Boolean(user?.paidSubscriber),
        subscriptionStatus: user?.subscriptionStatus || 'inactive',
      });
      setIneSuccess('INE subida correctamente. Queda pendiente de verificacion.');
    } catch (err) {
      setIneError(err.message || 'No se pudo subir tu INE');
    } finally {
      setUploadingIne(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <NavBar />
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Ajustes de perfil
        </h1>

        {loading ? (
          <div className="text-neutral-500 dark:text-neutral-400">Cargando…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Foto de perfil</h2>
              <div className="flex items-center gap-3">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt="Foto de perfil"
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-semibold flex items-center justify-center">
                    {form.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? 'Subiendo...' : 'Subir/actualizar foto'}
                </label>
              </div>
              {avatarError && <p className="text-sm text-red-600 dark:text-red-400">{avatarError}</p>}
              {avatarSuccess && <p className="text-sm text-green-600 dark:text-green-400">{avatarSuccess}</p>}
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Estado de cuenta</h2>
              <VerificationBadges
                identityUploaded={profileBadges.officialIdUploaded}
                identityVerified={profileBadges.officialIdVerified}
                paidSubscriber={profileBadges.paidSubscriber}
              />
              {!profileBadges.paidSubscriber && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Suscripcion: {profileBadges.subscriptionStatus || 'inactive'}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Verificación de identidad (INE)</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Necesitas correo verificado e INE verificada para publicar propiedades y enviar ofertas.
              </p>
              <p className={`text-sm font-medium ${verifiedIne ? 'text-green-600 dark:text-green-400' : pendingIne ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {verifiedIne ? 'INE verificada' : rejectedIne ? 'INE rechazada' : pendingIne ? 'INE subida (pendiente de verificacion)' : 'INE pendiente'}
              </p>
              {rejectedIne && officialIneDoc?.reviewNote && (
                <p className="text-xs text-red-700 dark:text-red-300">
                  Motivo de rechazo: {officialIneDoc.reviewNote}
                </p>
              )}

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm">
                <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={handleIneUpload} disabled={uploadingIne} />
                {uploadingIne ? 'Subiendo...' : 'Subir/actualizar INE'}
              </label>

              {ineError && <p className="text-sm text-red-600 dark:text-red-400">{ineError}</p>}
              {ineSuccess && <p className="text-sm text-green-600 dark:text-green-400">{ineSuccess}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nombre
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+525512345678"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                WhatsApp
              </label>
              <input
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+525512345678"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Usado para el botón "Contactar por WhatsApp" en tus propiedades
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400">Perfil actualizado correctamente</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
