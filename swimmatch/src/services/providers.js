// Base URL of the SwimMatch JSON API. Override with VITE_API_BASE (see .env.example).
const API_BASE = (import.meta.env.VITE_API_BASE || "https://swimmatch.onrender.com").replace(/\/+$/, "");

// Requests give up after this long. The API runs on a free tier that can take
// ~30 s to wake up, so the limit leaves room for that. Override with
// VITE_API_TIMEOUT_MS (milliseconds) if needed.
export const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 45000;

function apiError(message, kind, extra = {}) {
  return Object.assign(new Error(message), { kind, ...extra });
}

/**
 * Fetch JSON from the API.
 * - `signal` is the route's signal: when the user navigates away, the request is
 *   cancelled and the original cancellation error is passed through unchanged
 *   (React Router ignores it), exactly as before.
 * - If the API does not answer within REQUEST_TIMEOUT_MS, the request is cancelled
 *   and rejects with an error whose `kind` is "timeout".
 * Errors carry `kind` ("timeout" | "offline" | "network" | "http" | "invalid");
 * HTTP errors keep `status`, as before.
 */
export async function getJson(path, signal) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) forwardAbort();
    else signal.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw apiError(`Request failed (${response.status})`, "http", { status: response.status });
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timedOut) throw apiError("The SwimMatch service took too long to respond.", "timeout", { name: "TimeoutError" });
    if (error.kind) throw error;
    if (error instanceof SyntaxError) throw apiError("The SwimMatch service sent an unexpected response.", "invalid", { cause: error });
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw apiError(offline ? "You appear to be offline." : "The SwimMatch service could not be reached.", offline ? "offline" : "network", { cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

export async function getProviders(signal, filters = {}) {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location.trim());
  if (filters.level) params.set("level", filters.level.toLowerCase());
  if (filters.type) params.set("type", filters.type.toLowerCase());
  if (filters.budget) params.set("max_price", filters.budget);
  if (filters.day) params.set("day", filters.day);
  if (filters.where) params.set("visit", filters.where);
  const query = params.size ? `?${params}` : "";
  const [providerData, serviceData] = await Promise.all([
    getJson(`/api/providers${query}`, signal),
    getJson("/api/services", signal),
  ]);
  if (!Array.isArray(providerData.providers) || !Array.isArray(serviceData.services)) {
    throw new Error("Unexpected API response");
  }
  const servicesByProvider = new Map();
  for (const service of serviceData.services) {
    const items = servicesByProvider.get(service.provider_id) || [];
    items.push(service);
    servicesByProvider.set(service.provider_id, items);
  }
  return providerData.providers.map((provider) => ({
    ...provider,
    city: provider.location?.city || "",
    area: provider.location?.area || "",
    services: servicesByProvider.get(provider.id) || [],
  }));
}

export async function getProvider(id, signal) {
  return getJson(`/api/providers/${encodeURIComponent(id)}`, signal);
}

export async function getProviderSummaries(signal) {
  const data = await getJson("/api/providers", signal);
  if (!Array.isArray(data.providers)) throw new Error("Unexpected provider response");
  return data.providers;
}

export async function getAvailability(id, signal) {
  const data = await getJson(`/api/providers/${encodeURIComponent(id)}/availability`, signal);
  if (!Array.isArray(data.availability)) throw new Error("Unexpected availability response");
  return data.availability;
}

export async function getInstructors(providerId, signal) {
  const data = await getJson(`/api/instructors?provider_id=${encodeURIComponent(providerId)}`, signal);
  if (!Array.isArray(data.instructors)) throw new Error("Unexpected instructors response");
  return data.instructors;
}

export async function getServices(signal) {
  const data = await getJson("/api/services", signal);
  if (!Array.isArray(data.services)) throw new Error("Unexpected services response");
  return data.services;
}

export async function getAllInstructors(signal) {
  const data = await getJson("/api/instructors", signal);
  if (!Array.isArray(data.instructors)) throw new Error("Unexpected instructors response");
  return data.instructors;
}

export async function getBookings(signal) {
  const data = await getJson("/api/bookings", signal);
  if (!Array.isArray(data.bookings)) throw new Error("Unexpected bookings response");
  return data.bookings;
}

export function getProfile(signal) {
  return getJson("/api/profile", signal);
}

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Optional exact overrides by full instructor name if the API doesn't include `gender`
const INSTRUCTOR_GENDER_FALLBACK = {
  // "Coach Full Name": "female",
};

const FEMALE_NAMES = new Set([
  "sarah", "sara", "layla", "leila", "aisha", "fatima", "mariam", "maryam",
  "noor", "nour", "reem", "hana", "hanna", "maya", "lina", "rana", "dana",
  "yasmin", "jasmine", "amina", "salma", "nadia", "mona", "alia", "amal",
  "emily", "emma", "sophia", "olivia", "chloe", "claire", "anna", "elena",
  "maria", "julia", "laura", "rachel", "jessica", "kate", "natalie", "zoe",
  "dina", "yara", "tala", "samar", "huda", "hind", "shamma", "latifa",
  "maitha", "moza", "meera", "mira", "sofia", "victoria", "isabella", "mia",
]);

export function resolveCoachGender(inst) {
  if (inst.gender) return inst.gender.toLowerCase();
  const fullName = (inst.name || "").trim();
  if (INSTRUCTOR_GENDER_FALLBACK[fullName]) {
    return INSTRUCTOR_GENDER_FALLBACK[fullName].toLowerCase();
  }
  const firstName = fullName.split(/\s+/)[0]?.toLowerCase() || "";
  return FEMALE_NAMES.has(firstName) ? "female" : "male";
}

export function filterProviders(providers, filters, instructorsByProvider = new Map()) {
  const location = filters.location.trim().toLowerCase();
  const gender = (filters.gender || "").toLowerCase();

  return providers.filter((provider) => {
    if (location && !`${provider.name} ${provider.city} ${provider.area}`.toLowerCase().includes(location)) return false;

    if (gender) {
      const providerGender = (provider.gender || "").toLowerCase();
      const coaches = instructorsByProvider.get(provider.id) || provider.instructors || [];
      const hasMatchingCoach = coaches.some((inst) => resolveCoachGender(inst) === gender);
      if (providerGender !== gender && !hasMatchingCoach) return false;
    }

    return provider.services.some((service) =>
      (!filters.level || service.level === filters.level.toLowerCase()) &&
      (!filters.type || service.type === filters.type.toLowerCase()) &&
      (!filters.budget || service.price <= Number(filters.budget))
    );
  });
}

export function matchingPrice(provider, filters = {}) {
  const prices = provider.services
    .filter((service) =>
      (!filters.level || service.level === filters.level.toLowerCase()) &&
      (!filters.type || service.type === filters.type.toLowerCase()) &&
      (!filters.budget || service.price <= Number(filters.budget))
    )
    .map((service) => service.price);
  return prices.length ? Math.min(...prices) : null;
}