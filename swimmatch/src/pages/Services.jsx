import { Link, useLoaderData, useSearchParams } from "react-router";
import Icon from "../components/Icon.jsx";
import Segmented from "../components/Segmented.jsx";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TYPES = ["Private", "Group"];
const MAX_PRICES = ["150", "200", "250", "300"];
// Show the matching option as selected even if the URL uses a different case.
const pick = (list, value) => list.find((item) => item.toLowerCase() === value.toLowerCase()) ?? value;

export default function Services() {
  const data = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const level = params.get("level") || "";
  const type = params.get("type") || "";
  const maxPrice = params.get("max_price") || "";
  const visibleCount = Math.max(18, Number(params.get("count")) || 18);
  const matches = data.services.filter((service) => {
    const text = `${service.name} ${service.description || ""} ${service.level} ${service.type} ${data.names.get(service.provider_id) || ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) &&
      (!level || service.level?.toLowerCase() === level.toLowerCase()) &&
      (!type || service.type?.toLowerCase() === type.toLowerCase()) &&
      (!maxPrice || Number(service.price) <= Number(maxPrice));
  });

  const updateParam = (key, value) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "count") next.delete("count");
    return next;
  }, { replace: true });
  const filtered = Boolean(query || level || type || maxPrice);

  return <>
    <section className="wrap dir-head">
      <div className="top">
        <h1 className="d title-xl rise"><span className="coral">{data.services.length}</span> lessons<br />on the menu.</h1>
        <label className="dir-search">
          <Icon name="search" size={20} stroke={2.2} />
          <input value={query} onChange={(event) => updateParam("q", event.target.value)} placeholder="Lesson, school or level" aria-label="Search services" />
        </label>
      </div>
      <div className="dir-filters" role="group" aria-label="Filter lessons">
        <span className="m">Level</span>
        <Segmented label="Swimming level" name="level" value={pick(LEVELS, level)} onChange={updateParam}
          options={[["", "Any"], ...LEVELS.map((item) => [item, item])]} />
        <span className="m">Type</span>
        <Segmented label="Lesson type" name="type" value={pick(TYPES, type)} onChange={updateParam} tone="seg-coral"
          options={[["", "Any"], ...TYPES.map((item) => [item, item])]} />
        <label className="dir-select">
          <span className="m">Up to</span>
          <select value={maxPrice} onChange={(event) => updateParam("max_price", event.target.value)} aria-label="Maximum price">
            <option value="">Any price</option>
            {MAX_PRICES.map((price) => <option key={price} value={price}>AED {price}</option>)}
          </select>
        </label>
        {filtered && <button type="button" className="clear-btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
      </div>
    </section>

    <section className="wrap dir-body" aria-live="polite">
      <p className="m legend" style={{ marginTop: 0 }}>{matches.length} {matches.length === 1 ? "lesson" : "lessons"}{query.trim() ? ` for “${query.trim()}”` : ""} · price per session</p>
      {matches.length ? <>
        <div className="lessons">
          <div className="rope ink" aria-hidden="true" />
          {matches.slice(0, visibleCount).map((service) => {
            const school = data.names.get(service.provider_id);
            return (
              <div key={service.id}>
                <article className="lesson">
                  <span className={`ix ${service.type}`} aria-hidden="true"><Icon name={service.type === "group" ? "group" : "pair"} size={24} /></span>
                  <span className="nm">
                    <span className="m">{school}</span>
                    <b><Link to={`/providers/${service.provider_id}`} className="stretch">{service.name}</Link></b>
                    {service.description && <span className="ds">{service.description}</span>}
                    <span className="meta"><span className="chip chip-sm">{service.level}</span><span className="chip chip-sm">{service.type}</span><span className="chip chip-sm raw">{service.duration_minutes} min</span></span>
                  </span>
                  <span className="leader" aria-hidden="true" />
                  <span className="pr"><span className="m">{service.currency} </span><span className="d">{service.price}</span></span>
                  <Link className="btn btn-sm on-card" to={`/bookings?create=1&provider_id=${encodeURIComponent(service.provider_id)}&service_id=${encodeURIComponent(service.id)}`} aria-label={`Book ${service.name}${school ? ` at ${school}` : ""}`}>Book lesson</Link>
                  <span className="arr" aria-hidden="true"><Icon name="arrow" size={22} stroke={2.4} /></span>
                </article>
                <div className="rope ink" aria-hidden="true" />
              </div>
            );
          })}
        </div>
        {visibleCount < matches.length && <div className="more"><button className="btn" type="button" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("count", String(visibleCount + 18)); return next; }, { replace: true })}>Show more lessons <Icon name="down" size={20} stroke={2.4} /></button></div>}
      </> : <p className="empty-note">{filtered ? "No services match these filters." : "No services match your search."}</p>}
    </section>
  </>;
}
