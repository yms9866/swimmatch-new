import { Link, useLoaderData, useSearchParams } from "react-router";
import Icon from "../components/Icon.jsx";
import { getProviderSummaries, getServices } from "../services/providers.js";

async function loadServices(signal) {
  const [services, providers] = await Promise.all([getServices(signal), getProviderSummaries(signal)]);
  return { services, names: new Map(providers.map((provider) => [provider.id, provider.name])) };
}

export default function Services() {
  const data = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const visibleCount = Math.max(18, Number(params.get("count")) || 18);
  const matches = data?.services.filter((service) =>
    `${service.name} ${service.description} ${service.level} ${service.type} ${data.names.get(service.provider_id)}`
      .toLowerCase().includes(query.trim().toLowerCase())) || [];
  const setQuery = (event) => setParams((current) => {
    const next = new URLSearchParams(current);
    const value = event.target.value;
    if (value) next.set("q", value); else next.delete("q");
    next.delete("count");
    return next;
  }, { replace: true });

  return <>
    <section className="wrap dir-head">
      <div className="top">
        <h1 className="d title-xl rise"><span className="coral">{data.services.length}</span> lessons<br />on the menu.</h1>
        <label className="dir-search">
          <Icon name="search" size={20} stroke={2.2} />
          <input value={query} onChange={setQuery} placeholder="Lesson, school or level" aria-label="Search services" />
        </label>
      </div>
    </section>

    <section className="wrap dir-body" aria-live="polite">
      <p className="m legend" style={{ marginTop: 0 }}>{matches.length} {matches.length === 1 ? "lesson" : "lessons"}{query.trim() ? ` for “${query.trim()}”` : ""} · price per session</p>
      {matches.length ? <>
        <div className="lessons">
          <div className="rope ink" aria-hidden="true" />
          {matches.slice(0, visibleCount).map((service) => (
            <div key={service.id}>
              <Link className="lesson" to={`/providers/${service.provider_id}`}>
                <span className={`ix ${service.type}`} aria-hidden="true"><Icon name={service.type === "group" ? "group" : "pair"} size={24} /></span>
                <span className="nm">
                  <span className="m">{data.names.get(service.provider_id)}</span>
                  <b>{service.name}</b>
                  {service.description && <span className="ds">{service.description}</span>}
                  <span className="meta"><span className="chip chip-sm">{service.level}</span><span className="chip chip-sm">{service.type}</span><span className="chip chip-sm raw">{service.duration_minutes} min</span></span>
                </span>
                <span className="leader" aria-hidden="true" />
                <span className="pr"><span className="m">{service.currency} </span><span className="d">{service.price}</span></span>
                <span className="arr" aria-hidden="true"><Icon name="arrow" size={22} stroke={2.4} /></span>
              </Link>
              <div className="rope ink" aria-hidden="true" />
            </div>
          ))}
        </div>
        {visibleCount < matches.length && <div className="more"><button className="btn" type="button" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("count", String(visibleCount + 18)); return next; }, { replace: true })}>Show more lessons <Icon name="down" size={20} stroke={2.4} /></button></div>}
      </> : <p className="empty-note">No services match your search.</p>}
    </section>
  </>;
}

export function servicesLoader({ request }) {
  return loadServices(request.signal);
}
