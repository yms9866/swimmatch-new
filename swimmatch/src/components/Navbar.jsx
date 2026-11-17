import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router";
import { useProfile } from "../context/ProfileContext.jsx";
import { useSavedProviders } from "../context/SavedProvidersContext.jsx";
import { getAllInstructors, getBookings, getProviderSummaries, getServices } from "../services/providers.js";
import Icon from "./Icon.jsx";
import Logo from "./Logo.jsx";

// Labels follow the approved design; routes are unchanged.
const links = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/search", label: "Search", icon: "search" },
  { to: "/services", label: "Lessons", icon: "waves" },
  { to: "/instructors", label: "Coaches", icon: "whistle" },
  { to: "/bookings", label: "Bookings", icon: "calendar" },
];

// Counts shown in the mobile menu, fetched once on first open.
let countsCache = null;
async function loadCounts() {
  if (countsCache) return countsCache;
  const settle = (promise) => promise.then((value) => value, () => null);
  const [providers, services, instructors, bookings] = await Promise.all([
    settle(getProviderSummaries()), settle(getServices()), settle(getAllInstructors()), settle(getBookings()),
  ]);
  countsCache = {
    "/search": providers ? `${providers.length} schools` : "",
    "/services": services ? String(services.length) : "",
    "/instructors": instructors ? String(instructors.length) : "",
    pending: bookings ? bookings.filter((booking) => String(booking.status).toLowerCase() === "pending").length : 0,
  };
  return countsCache;
}

function MenuSheet({ onClose, savedCount, profileLabel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState(countsCache);
  const closeButton = useRef(null);
  const sheet = useRef(null);

  useEffect(() => {
    closeButton.current?.focus();
    let live = true;
    loadCounts().then((value) => { if (live) setCounts(value); });
    return () => { live = false; };
  }, []);

  // keep keyboard focus inside the open sheet
  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    const focusable = sheet.current.querySelectorAll("a[href], button, input");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const search = (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("location")?.toString().trim();
    navigate(value ? `/search?location=${encodeURIComponent(value)}` : "/search");
  };

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <div className="sheet" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" ref={sheet} onKeyDown={trapFocus}>
      <div className="caustic" />
      <div className="sheet-top">
        <Logo size="md" chip onClick={onClose} />
        <button ref={closeButton} type="button" className="sheet-close" aria-label="Close menu" onClick={onClose}>
          <Icon name="close" size={22} stroke={2.6} />
        </button>
      </div>

      <form className="sheet-search stagger" role="search" onSubmit={search} style={{ animationDelay: ".25s" }}>
        <Icon name="search" size={20} stroke={2.2} />
        <input name="location" type="search" placeholder="Area, school or coach" aria-label="Search by area, school or coach" />
      </form>

      <nav className="sheet-links" aria-label="Primary navigation">
        {links.map((link, index) => {
          const active = isActive(link.to);
          const count = link.to === "/bookings"
            ? (counts?.pending ? <span className="m pending">{counts.pending} pending</span> : null)
            : counts?.[link.to] ? <span className="m">{counts[link.to]}</span> : null;
          return (
            <div key={link.to}>
              {index > 0 && <div className="rope soft" aria-hidden="true" />}
              <NavLink to={link.to} end={link.to === "/"} onClick={onClose} className={`sheet-link stagger${active ? " active" : ""}`} style={{ animationDelay: `${0.25 + index * 0.06}s` }}>
                <span className="ico"><Icon name={link.icon} size={22} /></span>
                <span className="d">{link.label}</span>
                {active ? <span className="m here">You’re here</span> : count}
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="sheet-bottom stagger" style={{ animationDelay: ".6s" }}>
        <NavLink to="/saved" onClick={onClose} className={({ isActive: on }) => `sheet-tile${on ? " active" : ""}`}>
          <Icon name="heart" size={20} filled style={{ color: "var(--coral)" }} />Saved · {savedCount}
        </NavLink>
        <NavLink to="/profile" onClick={onClose} className={({ isActive: on }) => `sheet-tile${on ? " active" : ""}`}>
          <Icon name="user" size={20} style={{ color: "var(--chlorine)" }} />{profileLabel}
        </NavLink>
        <Link to="/bookings?create=1" onClick={onClose} className="btn">Book a lesson <Icon name="arrow" size={20} stroke={2.4} /></Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { state: profileState } = useProfile();
  const { profile } = profileState;
  const { savedProviders } = useSavedProviders();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  const profileLabel = profile.name ? profile.name.split(" ")[0] : "Profile";

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButton.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && menuOpen) closeMenu();
  };

  const savedLabel = savedProviders.length ? `Saved providers, ${savedProviders.length} saved` : "Saved providers";

  return (
    <header className="nav" onKeyDown={handleKeyDown}>
      <Logo size="lg" />
      <nav className="nav-pill" aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            <span className="dot" aria-hidden="true" />
            <Icon name={link.icon} size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-actions">
        <NavLink to="/saved" aria-label={savedLabel} className={({ isActive }) => `icon-btn${isActive ? " active" : ""}`}>
          <Icon name="heart" size={20} />
          {savedProviders.length > 0 && <span className="count-badge" aria-hidden="true">{savedProviders.length}</span>}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `profile-pill${isActive ? " active" : ""}`}>
          <span className="av"><Icon name="user" size={18} /></span>{profileLabel}
        </NavLink>
        <button
          ref={menuButton}
          type="button"
          className="menu-btn"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" size={18} stroke={2.4} />Menu
        </button>
      </div>
      {menuOpen && <MenuSheet onClose={closeMenu} savedCount={savedProviders.length} profileLabel={profileLabel} />}
    </header>
  );
}
