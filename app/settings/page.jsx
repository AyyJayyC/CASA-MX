'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/guards/RequireAuth';
import VerificationBadges from '@/components/VerificationBadges';
import { getUserProfile, updateUserProfile, uploadProfileAvatar } from '@/lib/api/users';
import { getUserDocuments, uploadUserDocument } from '@/lib/api/userDocuments';
import UserPreferences from '@/components/UserPreferences.jsx';
export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
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
  const [verified, setVerified] = useState({ email: false, phone: false });
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPhone, setChangingPhone] = useState(false);
  const [emailChangeMsg, setEmailChangeMsg] = useState('');
  const [phoneChangeStep, setPhoneChangeStep] = useState(null); // null = idle, 'form' = entering new phone
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
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
        });
        setVerified({
          email: Boolean(user.emailVerified),
          phone: Boolean(user.phoneVerified),
        });
      } catch (err) {
        setError('No se pudo cargar tu perfil. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      <main className="max-w-2xl mx-auto px-4 py-10">
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-clay-400 to-clay-600 text-white font-semibold flex items-center justify-center">
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
              <p className={`text-sm font-medium ${verifiedIne ? 'text-green-600 dark:text-green-400' : pendingIne ? 'text-blue-700 dark:text-blue-300' : 'text-clay-700 dark:text-clay-300'}`}>
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
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Correo electrónico {verified.email && <span className="text-clay-400 text-xs ml-1">✓ Verificado</span>}
              </label>
              {verified.email ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={form.email}
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
                    />
                    {!changingEmail && (
                      <button type="button" onClick={() => { setChangingEmail(true); setEmailChangeMsg(''); }}
                        className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        Cambiar
                      </button>
                    )}
                  </div>
                  {changingEmail && (
                    <div className="p-3 border border-clay-200 dark:border-clay-800 rounded-lg space-y-2 bg-clay-50 dark:bg-clay-900/10">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Te enviaremos un enlace de verificación a tu nuevo correo.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="nuevo@email.com"
                          className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                        />
                        <button type="button"
                          onClick={async () => {
                            if (!newEmail) return;
                            setSaving(true);
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/change-email`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                                body: JSON.stringify({ newEmail }),
                              });
                              const data = await res.json();
                              if (res.ok) setEmailChangeMsg('Revisa tu nuevo correo para verificar el cambio.');
                              else setEmailChangeMsg(data.error || 'Error');
                            } catch { setEmailChangeMsg('Error de conexión'); }
                            setSaving(false);
                          }}
                          disabled={saving || !newEmail}
                          className="px-3 py-2 rounded-lg bg-clay-400 hover:bg-clay-500 disabled:opacity-50 text-white text-sm font-medium"
                        >
                          {saving ? 'Enviando...' : 'Enviar verificación'}
                        </button>
                      </div>
                      {emailChangeMsg && <p className="text-xs text-clay-600 dark:text-clay-400">{emailChangeMsg}</p>}
                      <button type="button" onClick={() => { setChangingEmail(false); setNewEmail(''); setEmailChangeMsg(''); }}
                        className="text-xs text-neutral-500 hover:underline">Cancelar</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    name="email" type="email" value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400"
                  />
                  {!verified.email && <p className="text-xs text-clay-500">Sin verificar. <a href="/verify-email" className="underline">Verificar ahora</a></p>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Teléfono {verified.phone && <span className="text-clay-400 text-xs ml-1">✓ Verificado</span>}
              </label>
              {verified.phone ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={form.phone}
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
                    />
                    {!changingPhone && (
                      <button type="button" onClick={() => { setChangingPhone(true); setPhoneChangeStep('form'); setNewPhone(''); }}
                        className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        Cambiar
                      </button>
                    )}
                  </div>
                  {changingPhone && phoneChangeStep === 'form' && (
                    <div className="p-3 border border-clay-200 dark:border-clay-800 rounded-lg space-y-2 bg-clay-50 dark:bg-clay-900/10">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Ingresa tu nuevo número de teléfono. Se verificará automáticamente.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+525512345678"
                          className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                        />
                        <button type="button"
                          onClick={async () => {
                            if (!newPhone) return;
                            setSaving(true);
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/change-phone`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                                body: JSON.stringify({ phone: newPhone }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setForm(f => ({ ...f, phone: newPhone }));
                                setVerified(v => ({ ...v, phone: true }));
                                setChangingPhone(false);
                                setPhoneChangeStep(null);
                                setSuccess(true);
                              } else {
                                setError(data.error);
                              }
                            } catch { setError('Error de conexión'); }
                            setSaving(false);
                          }}
                          disabled={saving || !newPhone}
                          className="px-3 py-2 rounded-lg bg-clay-400 hover:bg-clay-500 disabled:opacity-50 text-white text-sm font-medium"
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                      <button type="button" onClick={() => { setChangingPhone(false); setPhoneChangeStep(null); }}
                        className="text-xs text-neutral-500 hover:underline">Cancelar</button>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  name="phone" type="tel" value={form.phone}
                  onChange={handleChange}
                  placeholder="+525512345678"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400"
                />
              )}
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
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-clay-400"
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
              className="w-full py-2.5 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}

        {!loading && (
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
            <UserPreferences />
          </div>
        )}
      </main>
    </div>
  );
}
