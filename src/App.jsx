import { useEffect } from "react";
import { createBrowserRouter, Link, Outlet, useLocation, useNavigation } from "react-router";
import Navbar from "./components/Navbar.jsx";
import RouteError from "./components/RouteError.jsx";
import Logo from "./components/Logo.jsx";
import Icon from "./components/Icon.jsx";
import Home, { homeLoader } from "./pages/Home.jsx";
import Search, { searchLoader, shouldRevalidateSearch } from "./pages/Search.jsx";
import ProviderDetails, { providerDetailsLoader } from "./pages/ProviderDetails.jsx";
import Bookings, { bookingsLoader, shouldRevalidateBookings } from "./pages/Bookings.jsx";
import Profile from "./pages/Profile.jsx";
import Services, { servicesLoader } from "./pages/Services.jsx";
import Instructors, { instructorsLoader } from "./pages/Instructors.jsx";
import NotFound from "./pages/NotFound.jsx";
import Saved, { savedLoader } from "./pages/Saved.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";

function BookingsRoute() {
  return <BookingProvider><Bookings /></BookingProvider>;
}

const year = new Date().getFullYear();

function BigFooter() {
  return (
    <footer className="foot foot-big">
      <div className="rope" aria-hidden="true" />
      <div className="wrap inner">
        <div className="foot-top">
          <div>
            <p className="d foot-title" aria-hidden="true">Get in<span>.</span></p>
            <Link to="/search" className="btn">Find a pool near you <Icon name="arrow" size={20} stroke={2.4} /></Link>
          </div>
          <div className="foot-cols">
            <nav aria-label="Explore">
              <span className="m">Explore</span>
              <Link to="/search">Search</Link><Link to="/services">Lessons</Link><Link to="/instructors">Coaches</Link>
            </nav>
            <nav aria-label="You">
              <span className="m">You</span>
              <Link to="/bookings">Bookings</Link><Link to="/saved">Saved</Link><Link to="/profile">Profile</Link>
            </nav>
          </div>
        </div>
        <div className="foot-base">
          <Logo size="md" chip />
          <p className="m">© {year} SwimMatch · Dubai · Abu Dhabi · Sharjah</p>
        </div>
      </div>
    </footer>
  );
}

function CompactFooter() {
  return (
    <footer className="foot foot-compact">
      <div className="rope" aria-hidden="true" />
      <div className="wrap inner">
        <Logo size="sm" chip />
        <nav className="foot-links" aria-label="Footer navigation">
          <Link to="/">Home</Link><Link to="/search">Search</Link><Link to="/services">Lessons</Link><Link to="/instructors">Coaches</Link>
        </nav>
        <p className="m">© {year} SwimMatch · Dubai · Abu Dhabi · Sharjah</p>
      </div>
    </footer>
  );
}

function AppLayout() {
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>
    {loading && <div className="rope loading-bar" role="progressbar" aria-label="Loading page" />}
    <Navbar />
    <main className="page" aria-busy={loading}>
      <Outlet />
    </main>
    {pathname === "/" ? <BigFooter /> : <CompactFooter />}
  </>;
}

export const router = createBrowserRouter([{
  Component: AppLayout,
  children: [
    { index: true, Component: Home, loader: homeLoader, errorElement: <RouteError /> },
    { path: "search", Component: Search, loader: searchLoader, shouldRevalidate: shouldRevalidateSearch, errorElement: <RouteError /> },
    { path: "services", Component: Services, loader: servicesLoader, shouldRevalidate: shouldRevalidateDirectory, errorElement: <RouteError /> },
    { path: "instructors", Component: Instructors, loader: instructorsLoader, shouldRevalidate: shouldRevalidateDirectory, errorElement: <RouteError /> },
    { path: "providers/:id", Component: ProviderDetails, loader: providerDetailsLoader, errorElement: <RouteError /> },
    { path: "bookings", Component: BookingsRoute, loader: bookingsLoader, shouldRevalidate: shouldRevalidateBookings, errorElement: <RouteError /> },
    { path: "profile", Component: Profile },
    { path: "saved", Component: Saved, loader: savedLoader, shouldRevalidate: shouldRevalidateDirectory, errorElement: <RouteError /> },
    { path: "*", Component: NotFound },
  ],
}]);

function shouldRevalidateDirectory({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;
  return false;
}

export default AppLayout;
