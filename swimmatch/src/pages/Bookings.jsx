import { useLoaderData, useSearchParams } from "react-router";
import BookingCard from "../components/BookingCard.jsx";
import BookingForm from "../components/BookingForm.jsx";
import Icon from "../components/Icon.jsx";
import { useBookings } from "../context/BookingContext.jsx";

function todayValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Bookings() {
  const { bookings: existingBookings, providers } = useLoaderData();
  const { bookings: requestedBookings } = useBookings();
  const [params, setParams] = useSearchParams();
  const formOpen = params.get("create") === "1";
  // Booking links use provider_id / service_id (older provider / service links still work).
const prefill = {
    provider_id: params.get("provider_id") ?? params.get("provider"),
    service_id: params.get("service_id") ?? params.get("service"),
    instructor_id: params.get("instructor_id") ?? params.get("instructor"),
    date: params.get("date"), time: params.get("time"), place: params.get("place"),
  };
  const areas = new Map(providers.map((provider) => [provider.id, [provider.area, provider.city].filter(Boolean).join(", ")]));

  const all = [
    ...requestedBookings.map((booking) => ({ ...booking, key: `request-${booking.id}` })),
    ...existingBookings.map((booking) => ({ ...booking, key: `existing-${booking.id}` })),
  ].map((booking) => ({ ...booking, area: areas.get(booking.provider_id) }));
  const today = todayValue();
  const isEarlier = (booking) => ["completed", "cancelled"].includes(String(booking.status).toLowerCase()) || (booking.date && booking.date < today && String(booking.status).toLowerCase() !== "pending");
  const upcoming = all.filter((booking) => !isEarlier(booking));
  const earlier = all.filter(isEarlier);

  const toggleForm = () => setParams((current) => {
    const next = new URLSearchParams(current);
    if (formOpen) ["create", "provider_id", "service_id", "provider", "service", "date", "time", "place"].forEach((key) => next.delete(key));
    else next.set("create", "1");
    return next;
  }, { replace: true });

  return (
    <section className="wrap acct">
      <div className="acct-main">
        <div className="acct-head">
          <h1 className="d title-l rise">Your lane<br />times.</h1>
          <button className="btn" type="button" aria-expanded={formOpen} aria-controls="booking-request-form" onClick={toggleForm}>
            <Icon name={formOpen ? "close" : "plus"} size={20} stroke={2.4} />{formOpen ? "Close form" : "New request"}
          </button>
          <p className="acct-sub">Request a lesson and keep track of it here. Your requests are saved on this device.</p>
        </div>

        {all.length ? <div className="tickets" aria-live="polite">
          {upcoming.map(({ key, ...booking }) => <BookingCard key={key} {...booking} />)}
          {earlier.length > 0 && <p className="m">Earlier</p>}
          {earlier.map(({ key, ...booking }) => <BookingCard key={key} {...booking} />)}
        </div> : <p className="empty-note" style={{ paddingLeft: 0 }}>No bookings yet.</p>}
      </div>

      <div id="booking-request-form" className="form-panel" hidden={!formOpen}>
        <div className="rope" aria-hidden="true" />
        {formOpen && <BookingForm key={params.toString()} providers={providers} prefill={prefill} />}
      </div>
    </section>
  );
}
