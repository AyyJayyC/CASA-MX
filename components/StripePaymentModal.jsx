'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as creditsAPI from '@/lib/api/credits';

let stripePromise = null;
function getStripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) { console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'); return null; }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

const CARD_STYLE = {
  style: {
    base: { fontSize: '16px', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } },
    invalid: { color: '#ef4444' },
  },
};

function CheckoutForm({ pkg, onSuccess, onClose, refresh, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setErrorMsg(null);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        // Webhook fulfills server-side; client call is a safety fallback
        try { await creditsAPI.fulfillPayment(pkg.id, paymentIntent.id); } catch (_) {}
        await refresh();
        onSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-neutral-300 px-4 py-3 bg-white">
        <CardElement options={CARD_STYLE} />
      </div>
      {errorMsg && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {processing ? 'Procesando…' : `Pagar $${pkg?.priceMXN?.toLocaleString('es-MX')} MXN`}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentModal({ pkg, onClose, onSuccess, refresh }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!pkg) return;
    setClientSecret(null);
    setLoadError(null);
    setSucceeded(false);
    creditsAPI.createPaymentIntent(pkg.id)
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setLoadError(err.message || 'Error al iniciar el pago'));
  }, [pkg]);

  const handleSuccess = () => {
    setSucceeded(true);
    setTimeout(onClose, 2000);
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Comprar {pkg.name}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {pkg.credits} créditos · ${pkg.priceMXN?.toLocaleString('es-MX')} MXN
        </p>

        {succeeded && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center font-medium">
            ✓ ¡Pago exitoso! Créditos acreditados.
          </div>
        )}

        {loadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        )}

        {!clientSecret && !loadError && !succeeded && (
          <p className="text-sm text-neutral-500 py-4 text-center">Preparando pago…</p>
        )}

        {clientSecret && !succeeded && (
          <Elements stripe={getStripePromise()} options={{ clientSecret }}>
            <CheckoutForm pkg={pkg} onClose={onClose} onSuccess={handleSuccess} refresh={refresh} clientSecret={clientSecret} />
          </Elements>
        )}
        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <p className="text-xs text-red-500">Error: Stripe key not configured</p>
        )}
      </div>
    </div>
  );
}
