// Route table. Components live in src/pages, data loaders and revalidation rules
// in src/routes/loaders.js, and the shared layout in src/App.jsx.
import { createBrowserRouter, useParams } from "react-router";
import AppLayout from "./App.jsx";
import RouteError from "./components/RouteError.jsx";
import AppLoading from "./components/AppLoading.jsx";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import ProviderDetails from "./pages/ProviderDetails.jsx";
import Bookings from "./pages/Bookings.jsx";
import Profile from "./pages/Profile.jsx";
import Services from "./pages/Services.jsx";
import Instructors from "./pages/Instructors.jsx";
import NotFound from "./pages/NotFound.jsx";
import Saved from "./pages/Saved.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import {
  bookingsLoader, homeLoader, instructorsLoader, providerDetailsLoader, savedLoader, searchLoader,
  servicesLoader, shouldRevalidateBookings, shouldRevalidateDirectory, shouldRevalidateSearch,
} from "./routes/loaders.js";

function BookingsRoute() {
  return <BookingProvider><Bookings /></BookingProvider>;
}

// Keyed on the provider id so the lesson, slot and location choices reset when
// moving from one provider to another.
function ProviderDetailsRoute() {
  const { id } = useParams();
  return <ProviderDetails key={id} />;
}

export const router = createBrowserRouter([{
  Component: AppLayout,
  errorElement: <RouteError />,
  children: [
    { index: true, Component: Home, loader: homeLoader, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "search", Component: Search, loader: searchLoader, shouldRevalidate: shouldRevalidateSearch, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "services", Component: Services, loader: servicesLoader, shouldRevalidate: shouldRevalidateDirectory, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "instructors", Component: Instructors, loader: instructorsLoader, shouldRevalidate: shouldRevalidateDirectory, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "providers/:id", Component: ProviderDetailsRoute, loader: providerDetailsLoader, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "bookings", Component: BookingsRoute, loader: bookingsLoader, shouldRevalidate: shouldRevalidateBookings, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "profile", Component: Profile },
    { path: "saved", Component: Saved, loader: savedLoader, shouldRevalidate: shouldRevalidateDirectory, HydrateFallback: AppLoading, errorElement: <RouteError /> },
    { path: "*", Component: NotFound },
  ],
}]);
