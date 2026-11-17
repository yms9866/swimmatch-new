import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import Icon from "../components/Icon.jsx";
import { useSavedProviders } from "../context/SavedProvidersContext.jsx";
import { getAvailability, getInstructors, getProvider } from "../services/providers.js";
import { initials, stars } from "../utils.js";
import { PHOTOS, providerGallery } from "../lib/media.js";

const tabs = ["Services", "Schedule", "Instructors", "Reviews", "Map"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const deckStyles = ["deck-photo", "deck-teal", "deck-white"];
const avatarShapes = [{ borderRadius: "42px 42px 16px 16px", background: "var(--chlorine)" }, { borderRadius: "50%", background: "var(--sun)" }];

/** Next calendar date (YYYY-MM-DD) that falls on the given weekday, from today. */
function nextDateFor(dayName) {
  const target = DAYS.indexOf(dayName);
  if (target < 0) return "";
  const date = new Date();
  date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function slotLabel(slot) {
  const [, month, day] = slot.date.split("-").map(Number);
  const short = new Date(2000, month - 1, day).toLocaleString("en-GB", { month: "short" });
  return `${slot.day.slice(0, 3)} ${day} ${short} · ${slot.time}`;
}

const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export default function ProviderDetails() {
  const [tab, setTab] = useState("Services");
  const provider = useLoaderData();
  const navigate = useNavigate();

  const location = provider.location || {};
  const services = provider.services || [];
  const availability = provider.availability || [];
  const instructors = provider.instructors || [];
  const reviews = provider.reviews || [];
  const hasMap = Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
  const delta = 0.01;
  const mapSrc = hasMap ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - delta},${location.latitude - delta},${location.longitude + delta},${location.latitude + delta}&layer=mapnik&marker=${location.latitude},${location.longitude}` : "";
  const gallery = providerGallery(provider);
  const lessonTypes = [...new Set(services.map((service) => service.type))];
  const where = [location.area, location.city].filter(Boolean).join(" · ");

  const [serviceId, setServiceId] = useState(services[0]?.id ?? null);
  const service = services.find((item) => item.id === serviceId) || services[0];
  const slots = availability
    .slice()
    .sort((a, b) => nextDateFor(a.day).localeCompare(nextDateFor(b.day)))
    .flatMap((day) => day.times.map((time) => ({ key: `${day.id}-${time}`, day: day.day, time, date: nextDateFor(day.day) })));
  const [slotKey, setSlotKey] = useState(slots[0]?.key || "");
  const slot = slots.find((item) => item.key === slotKey);
  const [place, setPlace] = useState("facility");

  // Hands the choice to the existing booking request form on /bookings.
  const requestBooking = () => {
    const params = new URLSearchParams({ create: "1", provider: String(provider.id), place });
    if (service) params.set("service", String(service.id));
    if (slot) { params.set("date", slot.date); params.set("time", slot.time); }
    navigate(`/bookings?${params}`);
  };

  const scrollToBooking = () => document.getElementById("book-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <section className="wrap">
        <Link to="/search" className="m back-link"><Icon name="back" size={16} stroke={2.4} />Back to results</Link>
        <div className="collage">
          <div><img className="kb" src={gallery[0].src} alt={`${provider.name}`} style={{ objectPosition: gallery[0].pos }} /><span className="m">{gallery.length} photos</span></div>
          <div><img src={gallery[1].src} alt="" style={{ objectPosition: gallery[1].pos }} /></div>
          <div><img src={gallery[2].src} alt="" style={{ objectPosition: gallery[2].pos }} /></div>
        </div>
      </section>

      <section className="wrap prov">
        <div className="prov-main">
          <p className="m">{where}</p>
          <h1 className="d prov-title rise">{provider.name}</h1>
          <div className="prov-chips">
            <span className="chip chip-sun" aria-label={`Rated ${provider.rating} out of 5`}><span aria-hidden="true">★</span> {provider.rating}{provider.reviews_count > 0 ? ` · ${provider.reviews_count} ${provider.reviews_count === 1 ? "review" : "reviews"}` : ""}</span>
            {lessonTypes.map((type) => <span className="chip" key={type}>{type}</span>)}
            {provider.home_visit && <span className="chip chip-dark raw">Home visits available</span>}
          </div>
          {provider.description && <p className="prov-desc">{provider.description}</p>}

          <div className="ptabs" role="tablist" aria-label="Provider information">
            {tabs.map((item) => {
              const count = item === "Instructors" ? instructors.length : item === "Reviews" ? reviews.length : 0;
              return (
                <button key={item} type="button" role="tab" id={`tab-${item}`} aria-controls="provider-tabpanel" aria-selected={tab === item} className="ptab" onClick={() => setTab(item)}>
                  {item}{count > 0 && <> <span className="m">{count}</span></>}
                  <span className="rope" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="tabpanel" id="provider-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === "Services" && (services.length ? <div role="radiogroup" aria-label="Choose a lesson">
              {services.map((item) => (
                <label key={item.id} className={`svc${service?.id === item.id ? " on" : ""}`}>
                  <input type="radio" name="service" checked={service?.id === item.id} onChange={() => setServiceId(item.id)} />
                  <span className="nm"><b>{item.name}</b><span className="m">{cap(item.level)} · {cap(item.type)} · {item.duration_minutes} min</span></span>
                  <span className="leader" aria-hidden="true" />
                  <span className="pr"><span className="m">{item.currency || "AED"} </span><span className="d">{item.price}</span></span>
                </label>
              ))}
            </div> : <p className="empty-tab">No services listed yet.</p>)}
            {tab === "Schedule" && (availability.length ? <div>
              {availability.map((day, index) => <div key={day.id}>
                {index > 0 && <div className="rope ink" aria-hidden="true" />}
                <div className="trow"><b>{day.day}</b><span className="slots">{day.times.map((time) => <span key={time}>{time}</span>)}</span></div>
              </div>)}
            </div> : <p className="empty-tab">No schedule listed yet.</p>)}
            {tab === "Instructors" && (instructors.length ? <div>
              {instructors.map((instructor, index) => <div key={instructor.id}>
                {index > 0 && <div className="rope ink" aria-hidden="true" />}
                <div className="trow"><span><b>{instructor.name}</b><br /><span className="muted">{instructor.specialties.map(cap).join(", ")}</span></span><span className="m">{instructor.experience_years} years experience</span></div>
              </div>)}
            </div> : <p className="empty-tab">No instructors listed yet.</p>)}
            {tab === "Reviews" && (reviews.length ? <div>
              {reviews.map((review, index) => <div key={review.id}>
                {index > 0 && <div className="rope ink" aria-hidden="true" />}
                <div className="trow"><span>{review.text}</span><span className="m">{review.author} · {review.rating}/5</span></div>
              </div>)}
            </div> : <p className="empty-tab">No reviews listed yet.</p>)}
            {tab === "Map" && (hasMap ? <iframe className="map-frame" title={`Map of ${provider.name}`} src={mapSrc} loading="lazy" /> : <p className="empty-tab">Map location unavailable.</p>)}
          </div>

          {instructors.length > 0 && <>
            <h2 className="d deck-title">On deck here.</h2>
            <div className="deck">
              {instructors.slice(0, 3).map((instructor, index) => {
                const style = deckStyles[index % deckStyles.length];
                return (
                  <article key={instructor.id} className={style}>
                    {style === "deck-photo"
                      ? <img src={PHOTOS.peace.src} alt="" loading="lazy" />
                      : <span className="av" style={avatarShapes[index % 2]}><span className="d" style={{ color: "var(--deep)" }}>{initials(instructor.name)}</span></span>}
                    <div>
                      <span className="d yrs">{instructor.experience_years}<small> yrs</small></span>
                      <h3>{instructor.name}</h3>
                      <p className="m">{instructor.specialties.slice(0, 2).join(" · ")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </>}

          {reviews[0] && (
            <figure className="review">
              <span className="d q" aria-hidden="true">”</span>
              <blockquote>{reviews[0].text}</blockquote>
              <figcaption className="m">{stars(reviews[0].rating)} · {reviews[0].author}</figcaption>
            </figure>
          )}
        </div>

        <aside className="book" id="book-panel" aria-label="Request a booking">
          <div className="rope" aria-hidden="true" />
          <p className="m k">Request a booking</p>
          {service && <div className="sel">
            <div><p>{service.name}</p><p className="m">{cap(service.type)} · {service.duration_minutes} min</p></div>
            <div className="pr"><span className="m">{service.currency || "AED"}</span><span className="d">{service.price}</span></div>
          </div>}
          {slots.length > 0 && (
            <label className="dk-field">
              <span className="m">Date &amp; time</span>
              <select value={slotKey} onChange={(event) => setSlotKey(event.target.value)}>
                {slots.map((item) => <option key={item.key} value={item.key}>{slotLabel(item)}</option>)}
              </select>
            </label>
          )}
          <div className="dk-seg" role="group" aria-label="Lesson location">
            <button type="button" aria-pressed={place === "facility"} onClick={() => setPlace("facility")}>Facility</button>
            <button type="button" aria-pressed={place === "home"} disabled={!provider.home_visit} title={provider.home_visit ? undefined : "This provider doesn’t offer home visits"} onClick={() => setPlace("home")}>Home visit</button>
          </div>
          <button type="button" className="btn" onClick={requestBooking}>Request booking <Icon name="arrow" size={20} stroke={2.4} /></button>
          <SaveToggle provider={provider} />
          <div className="contact">
            {provider.phone && <a href={`tel:${provider.phone}`}><Icon name="phone" size={20} />{provider.phone}</a>}
            {provider.email && <a href={`mailto:${provider.email}`}><Icon name="mail" size={20} />{provider.email}</a>}
          </div>
          <button type="button" className="mini-map" onClick={() => { setTab("Map"); document.getElementById("provider-tabpanel")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} aria-label="Show map">
            <span className="road h" /><span className="road v" />
            <span className="pinx" /><span className="pinx ping" />
            {location.area && <span className="m">{location.area}</span>}
          </button>
        </aside>
      </section>

      {service && (
        <div className="book-bar">
          <span className="t"><span className="m">{service.name}</span><b>AED {service.price}</b></span>
          <button type="button" className="btn" onClick={scrollToBooking}>Book <Icon name="arrow" size={18} stroke={2.4} /></button>
        </div>
      )}
    </>
  );
}

function SaveToggle({ provider }) {
  const { savedProviders, dispatch } = useSavedProviders();
  const isSaved = savedProviders.includes(provider.id);
  return (
    <button type="button" className="btn btn-ghost btn-wide" aria-pressed={isSaved} onClick={() => dispatch({ type: "provider/toggled", id: provider.id })}>
      <Icon name="heart" size={18} filled={isSaved} />{isSaved ? "Saved" : "Save provider"}
    </button>
  );
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
