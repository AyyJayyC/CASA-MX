const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function buildUrl(path, query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return `${BACKEND_URL}${path}${queryString ? `?${queryString}` : ''}`;
}

async function parseResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }

  return payload?.data;
}

export async function createReview(payload) {
  const response = await fetch(`${BACKEND_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseResponse(response, 'No se pudo enviar la reseña');
}

export async function getUserReviews(userId, role) {
  const response = await fetch(buildUrl(`/reviews/user/${userId}`, { role }), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return parseResponse(response, 'No se pudieron cargar las reseñas');
}

export async function getReviewSummary(userId, role) {
  const response = await fetch(buildUrl(`/reviews/summary/${userId}`, { role }), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return parseResponse(response, 'No se pudo cargar la reputación');
}

export async function getMyAuthoredReviews(role) {
  const response = await fetch(buildUrl('/reviews/mine', { role }), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return parseResponse(response, 'No se pudieron cargar tus reseñas enviadas');
}
