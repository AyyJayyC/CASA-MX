const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function parseResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }

  return payload?.data;
}

export async function getMyApplications(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${BACKEND_URL}/applications${params.toString() ? `?${params.toString()}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return parseResponse(response, 'No se pudieron cargar tus solicitudes de renta');
}

export async function getPropertyApplications(propertyId) {
  const response = await fetch(`${BACKEND_URL}/applications/property/${propertyId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return parseResponse(response, 'No se pudieron cargar las solicitudes de esta propiedad');
}

export async function updateApplicationStatus(applicationId, payload) {
  const response = await fetch(`${BACKEND_URL}/applications/${applicationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseResponse(response, 'No se pudo actualizar la solicitud');
}
