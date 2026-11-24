import { Link, useLoaderData, useSearchParams } from "react-router";
import Icon from "../components/Icon.jsx";
import { initials } from "../utils.js";

// Tile colour = main specialty (legend shown on the page).
const SPECIALTIES = [
  { key: "beginner", label: "Beginner", swatch: { background: "var(--sun)", boxShadow: "inset 0 0 0 1px rgba(4,38,58,.2)" } },
  { key: "children", label: "Children", swatch: { background: "var(--chlorine)" } },
  { key: "adult swimming", label: "Adult swimming", tone: "adult", swatch: { background: "var(--sand)", boxShadow: "inset 0 0 0 2px var(--deep)" } },
  { key: "competitive swimming", label: "Competitive", tone: "competitive", swatch: { background: "var(--deep)" } },
  { key: "technique", label: "Technique", swatch: { background: "var(--coral)" } },
];
const toneFor = (instructor) => {
  const main = (instructor.specialties || []).map((name) => SPECIALTIES.find((item) => item.key === name)).find(Boolean);
  return main ? (main.tone || main.key) : "other";
};
const AVATARS = [
  { borderRadius: "36px 36px 14px 14px" }, { borderRadius: "50%" }, { borderRadius: "14px 36px 14px 36px" }, { borderRadius: "22px" },
];
const AVATAR_FILL = {
  competitive: { background: "var(--chlorine)", color: "var(--deep)" },
  children: { background: "var(--deep)", color: "var(--chlorine)" },
  beginner: { background: "var(--deep)", color: "var(--sun)" },
  adult: { background: "var(--sand)", boxShadow: "inset 0 0 0 2px var(--deep)" },
  technique: { background: "var(--deep)", color: "var(--coral)" },
  other: { background: "var(--sun)" },
};
const same = (a, b) => a.toLowerCase() === b.toLowerCase();
const bookHref = (providerId) => `/bookings?create=1&provider_id=${encodeURIComponent(providerId)}`;

export default function Instructors() {
  const data = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const specialty = params.get("specialty") || "";
  const providerId = params.get("provider") || "";
  const minimumExperience = params.get("experience") || "";
  const visibleCount = Math.max(18, Number(params.get("count")) || 18);
  // Filtering logic from the Nov 22 original: text (name, specialties, school, city, area),
  // specialty (case-insensitive), provider, minimum years of experience.
  const specialties = [...new Set(data.instructors.flatMap((instructor) => instructor.specialties || []))]
    .sort((a, b) => a.localeCompare(b));
  const matches = data.instructors.filter((instructor) => {
    const provider = data.providers.find((item) => String(item.id) === String(instructor.provider_id));
    const location = `${provider?.location?.city || ""} ${provider?.location?.area || ""}`;
    const text = `${instructor.name} ${(instructor.specialties || []).join(" ")} ${data.names.get(instructor.provider_id) || ""} ${location}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) &&
      (!specialty || (instructor.specialties || []).some((item) => same(item, specialty))) &&
      (!providerId || String(instructor.provider_id) === providerId) &&
      (!minimumExperience || Number(instructor.experience_years) >= Number(minimumExperience));
  });

  const updateParam = (key, value) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "count") next.delete("count");
    return next;
  }, { replace: true });
  const filtered = Boolean(query || specialty || providerId || minimumExperience);
  const specialtyValue = specialties.find((item) => same(item, specialty)) ?? specialty;

  return <>
    <section className="wrap dir-head">
      <div className="top">
        <h1 className="d title-xl rise"><span className="coral">{data.instructors.length}</span> coaches<br />on deck.</h1>
        <label className="dir-search">
          <Icon name="search" size={20} stroke={2.2} />
          <input value={query} onChange={(event) => updateParam("q", event.target.value)} placeholder="Name, school, specialty or city" aria-label="Search instructors" />
        </label>
      </div>
      <div className="spec" role="group" aria-label="Specialty">
        <button type="button" aria-pressed={!specialty} onClick={() => updateParam("specialty", "")}>All</button>
        {SPECIALTIES.map((item) => (
          <button key={item.key} type="button" aria-pressed={same(specialty, item.key)} onClick={() => updateParam("specialty", same(specialty, item.key) ? "" : item.key)}>
            <span className="sw" style={item.swatch} aria-hidden="true" />{item.label}
          </button>
        ))}
      </div>
      <div className="dir-filters" role="group" aria-label="More coach filters">
        <label className="dir-select">
          <span className="m">Specialty</span>
          <select value={specialtyValue} onChange={(event) => updateParam("specialty", event.target.value)} aria-label="Specialty">
            <option value="">Any specialty</option>
            {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="dir-select">
          <span className="m">School</span>
          <select value={providerId} onChange={(event) => updateParam("provider", event.target.value)} aria-label="Provider">
            <option value="">Any school</option>
            {data.providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
          </select>
        </label>
        <label className="dir-select">
          <span className="m">Experience</span>
          <select value={minimumExperience} onChange={(event) => updateParam("experience", event.target.value)} aria-label="Experience">
            <option value="">Any</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
          </select>
        </label>
        {filtered && <button type="button" className="clear-btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
      </div>
    </section>

    <section className="wrap dir-body" aria-live="polite">
      <p className="m legend" style={{ marginTop: 0, marginBottom: 18 }}>{matches.length} {matches.length === 1 ? "coach" : "coaches"}</p>
      {matches.length ? <>
        <div className="cgrid">
          {matches.slice(0, visibleCount).map((instructor, index) => {
            const school = data.names.get(instructor.provider_id);
            const tone = toneFor(instructor);
            const to = `/providers/${instructor.provider_id}`;
            const book = <Link className="ct-book on-card" to={bookHref(instructor.provider_id)} aria-label={`Book ${instructor.name}${school ? ` at ${school}` : ""}`}>Book <Icon name="arrow" size={14} stroke={2.6} /></Link>;
            if (index === 0) {
              return (
                <article key={instructor.id} className="ct ct-big">
                  <span className="rope aq big-rope" aria-hidden="true" />
                  <span className="av big-av"><span className="d">{initials(instructor.name)}</span></span>
                  <div className="row">
                    <div>
                      <p className="m">{school}</p>
                      <h2 className="d"><Link to={to} className="stretch">{instructor.name}</Link></h2>
                      <div className="chips">{(instructor.specialties || []).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
                      {book}
                    </div>
                    <span className="d yr">{instructor.experience_years}<small> yrs</small></span>
                  </div>
                </article>
              );
            }
            return (
              <article key={instructor.id} className={`ct ct-${tone}`}>
                <div className="top">
                  <span className="av" style={{ ...AVATARS[index % AVATARS.length], ...AVATAR_FILL[tone] }}><span className="d">{initials(instructor.name)}</span></span>
                  <span className="d yr" aria-label={`${instructor.experience_years} years experience`}>{instructor.experience_years}</span>
                </div>
                <div>
                  <h3><Link to={to} className="stretch">{instructor.name}</Link></h3>
                  <p className="m">{[school, instructor.specialties?.[0]].filter(Boolean).join(" · ")}</p>
                  {book}
                </div>
              </article>
            );
          })}
        </div>
        <p className="m legend">Big number = years of experience · tile colour = main specialty</p>
        {visibleCount < matches.length && <div className="more"><button className="btn" type="button" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("count", String(visibleCount + 18)); return next; }, { replace: true })}>Show more coaches <Icon name="down" size={20} stroke={2.4} /></button></div>}
      </> : <p className="empty-note">{filtered ? "No instructors match these filters." : "No instructors match your search."}</p>}
    </section>
  </>;
}
