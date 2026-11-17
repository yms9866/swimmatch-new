import { Link } from "react-router";
import Icon from "./Icon.jsx";

function parts(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  if (!match) return null;
  const value = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return {
    weekday: value.toLocaleString("en-GB", { weekday: "short" }),
    month: value.toLocaleString("en-GB", { month: "short" }),
    day: match[3],
  };
}

/** Ticket-style booking: tear-off date stub, perforation, details. */
export default function BookingCard({ provider_id, provider_name, service_name, date, time, place, status, area }) {
  const state = String(status).toLowerCase();
  const tone = state === "confirmed" ? "confirmed" : state === "completed" || state === "cancelled" ? "done" : "pending";
  const when = parts(date);
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
  const placeLine = [place, area].filter(Boolean).join(" · ");

  if (tone === "done") {
    return (
      <article className="ticket done">
        <div className="stub">{when ? <><span className="d">{when.day}</span><span className="m">{when.weekday} · {when.month}</span></> : <span className="m">{date}</span>}</div>
        <div className="main">
          <div><h2><Link to={`/providers/${provider_id}`} className="stretch">{provider_name}</Link></h2><p className="m">{[service_name, time, place].filter(Boolean).join(" · ")}</p></div>
          <span className="m status">{label}</span>
        </div>
      </article>
    );
  }

  return (
    <article className={`ticket ${tone}`}>
      <div className="stub">
        <span className="m">{when ? `${when.weekday} · ${when.month}` : ""}</span>
        <span className="d">{when ? when.day : "—"}</span>
        <span className="m">{time}</span>
      </div>
      <div className="perf" aria-hidden="true" />
      <div className="main">
        <div className="top">
          <div><h2 className="d"><Link to={`/providers/${provider_id}`} className="stretch">{provider_name}</Link></h2><p>{service_name}</p></div>
          <span className="m status">{tone === "confirmed" ? "✓ " : "◔ "}{label}</span>
        </div>
        <div className="foot-row"><span className="m">{placeLine}</span><span className="go-l" aria-hidden="true">View details <Icon name="arrow" size={18} stroke={2.4} /></span></div>
      </div>
    </article>
  );
}
