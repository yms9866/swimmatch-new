import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigation } from "react-router";
import Navbar from "./components/Navbar.jsx";
import Logo from "./components/Logo.jsx";
import Icon from "./components/Icon.jsx";

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

// Shared page shell: nav, main outlet, footer. The route table is in router.jsx.
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

export default AppLayout;
