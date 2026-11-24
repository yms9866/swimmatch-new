// Route data loaders and revalidation rules.
// Moved verbatim from the page files (pages now export only components, so editing a
// page hot-updates in place instead of reloading the whole site). Behaviour, arguments
// and returned data are unchanged.
import {
  getAllInstructors, getAvailability, getBookings, getInstructors, getProvider,
  getProviders, getProviderSummaries, getServices,
} from "../services/providers.js";

export const FILTER_FIELDS = ["level", "type", "budget", "location", "day", "where", "gender"];
const SERVER_FIELDS = ["level", "type", "budget", "location", "day", "where"];

export function shouldRevalidateDirectory({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;
  return false;
}

export async function homeLoader({ request }) {
  const [providers, instructors] = await Promise.all([
    getProviders(request.signal),
    // The coach feature is optional: the page still loads if this request fails.
    getAllInstructors(request.signal).catch((error) => {
      if (error.name === "AbortError") throw error;
      return null;
    }),
  ]);
  return { providers, instructors };
}

export function searchLoader({ request }) {
  const params = new URL(request.url).searchParams;
  const filters = Object.fromEntries(SERVER_FIELDS.map((field) => [field, params.get(field) || ""]));
  return getProviders(request.signal, filters);
}

export function shouldRevalidateSearch({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;
  return SERVER_FIELDS.some((field) => currentUrl.searchParams.get(field) !== nextUrl.searchParams.get(field));
}

async function loadServices(signal) {
  const [services, providers] = await Promise.all([getServices(signal), getProviderSummaries(signal)]);
  return { services, names: new Map(providers.map((provider) => [provider.id, provider.name])) };
}

export function servicesLoader({ request }) {
  return loadServices(request.signal);
}

async function loadInstructors(signal) {
  const [instructors, providers] = await Promise.all([getAllInstructors(signal), getProviderSummaries(signal)]);
  // providers is used by the Coaches page's provider filter and city search (Nov 22 original).
  return {
    instructors,
    providers,
    names: new Map(providers.map((provider) => [provider.id, provider.name])),
  };
}

export function instructorsLoader({ request }) {
  return loadInstructors(request.signal);
}

export async function providerDetailsLoader({ request, params }) {
  let provider;
  try {
    provider = await getProvider(params.id, request.signal);
  } catch (error) {
    if (error.status === 404) throw new Response("Provider not found", { status: 404 });
    throw error;
  }
  const [availability, instructors] = await Promise.all([
    getAvailability(params.id, request.signal),
    getInstructors(params.id, request.signal),
  ]);
  return { ...provider, availability, instructors };
}

export function bookingsLoader({ request }) {
  return Promise.all([
    getBookings(request.signal),
    getProviders(request.signal),
  ]).then(([bookings, providers]) => ({ bookings, providers }));
}

export function shouldRevalidateBookings(args) {
  return shouldRevalidateDirectory(args);
}

export function savedLoader({ request }) {
  return getProviders(request.signal);
}