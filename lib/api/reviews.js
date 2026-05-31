import { apiPost, apiGet } from './client';

function buildUrl(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const queryString = params.toString();
  return `${path}${queryString ? `?${queryString}` : ''}`;
}

export async function createReview(payload) {
  return (await apiPost('/reviews', payload)).data;
}

export async function getUserReviews(userId, role) {
  return (await apiGet(buildUrl(`/reviews/user/${userId}`, { role }))).data;
}

export async function getReviewSummary(userId, role) {
  return (await apiGet(buildUrl(`/reviews/summary/${userId}`, { role }))).data;
}

export async function getMyAuthoredReviews(role) {
  return (await apiGet(buildUrl('/reviews/mine', { role }))).data;
}
