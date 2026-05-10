const KEY = 'traveloop:lastTripId';

const listeners = new Set();

export function rememberTripId(id) {
  if (id == null || id === '') return;
  localStorage.setItem(KEY, String(id));
  listeners.forEach((fn) => fn());
}

export function getLastTripId() {
  const v = localStorage.getItem(KEY);
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function subscribeLastTrip(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
