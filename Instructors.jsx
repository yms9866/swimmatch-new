import { Link, useLoaderData, useSearchParams } from "react-router";
import { getAllInstructors, getProviderSummaries } from "../services/providers.js";
import Icon from "../components/Icon.jsx";
import { initials } from "../utils.js";

async function loadInstructors(signal) {
  const [instructors, providers] = await Promise.all([getAllInstructors(signal), getProviderSummaries(signal)]);
  return { instructors, names: new Map(providers.map((provider) => [provider.id, provider.name])) };
}

// Tile colour = main specialty (legend shown on the page).
const SPECIALTIES = [
  { key: "beginner", label: "Beginner", swatch: { background: "var(--sun)", boxShadow: "inset 0 0 0 1px rgba(4,38,58,.2)" } },
  { key: "children", label: "Children", swatch: { background: "var(--chlorine)" } },
  { key: "adult swimming", label: "Adult swimming", tone: "adult", swatch: { background: "var(--sand)", boxShadow: "inset 0 0 0 2px var(--deep)" } },
  { key: "competitive swimming", label: "Competitive", tone: "competitive", swatch: { background: "var(--deep)" } },
  { key: "technique", label: "Technique", swatch: { background: "var(--coral)" } },
];
const toneFor = (instructor) => {
  const main = instructor.specialties.map((name) => SPECIALTIES.find((item) => item.key === name)).find(Boolean);
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

export default function Instructors() {
  const data = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const specialty = params.get("specialty") || "";
  const visibleCount = Math.max(18, Number(params.get("count")) || 18);
  const matches = data?.instructors.filter((instructor) =>
    (!specialty || instructor.specialties.includes(specialty)) &&
    `${instructor.name} ${instructor.specialties.join(" ")} ${data.names.get(instructor.provider_id)}`
      .toLowerCase().includes(query.trim().toLowerCase())) || [];

  const setParam = (key, value) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("count");
    return next;
  }, { replace: true });

  return <>
    <section className="wrap dir-head">
      <div className="top">
        <h1 className="d title-xl rise"><span className="coral">{data.instructors.length}</span> coaches<br />on deck.</h1>
        <label className="dir-search">
          <Icon name="search" size={20} stroke={2.2} />
          <input value={query} onChange={(event) => setParam("q", event.target.value)} placeholder="Name, school or specialty" aria-label="Search instructors" />
        </label>
      </div>
      <div className="spec" role="group" aria-label="Specialty">
        <button type="button" aria-pressed={!specialty} onClick={() => setParam("specialty", "")}>All</button>
        {SPECIALTIES.map((item) => (
          <button key={item.key} type="button" aria-pressed={specialty === item.key} onClick={() => setParam("specialty", specialty === item.key ? "" : item.key)}>
            <span className="sw" style={item.swatch} aria-hidden="true" />{item.label}
          </button>
        ))}
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
            if (index === 0) {
              return (
                <Link key={instructor.id} to={to} className="ct ct-big">
                  <span className="rope aq big-rope" aria-hidden="true" />
                  <span className="av big-av"><span className="d">{initials(instructor.name)}</span></span>
                  <div className="row">
                    <div>
                      <p className="m">{school}</p>
                      <h2 className="d">{instructor.name}</h2>
                      <div className="chips">{instructor.specialties.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
                    </div>
                    <span className="d yr">{instructor.experience_years}<small> yrs</small></span>
                  </div>
                </Link>
              );
            }
            return (
              <Link key={instructor.id} to={to} className={`ct ct-${tone}`}>
                <div className="top">
                  <span className="av" style={{ ...AVATARS[index % AVATARS.length], ...AVATAR_FILL[tone] }}><span className="d">{initials(instructor.name)}</span></span>
                  <span className="d yr" aria-label={`${instructor.experience_years} years experience`}>{instructor.experience_years}</span>
                </div>
                <div>
                  <h3>{instructor.name}</h3>
                  <p className="m">{[school, instructor.specialties[0]].filter(Boolean).join(" · ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="m legend">Big number = years of experience · tile colour = main specialty</p>
        {visibleCount < matches.length && <div className="more"><button className="btn" type="button" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.set("count", String(visibleCount + 18)); return next; }, { replace: true })}>Show more coaches <Icon name="down" size={20} stroke={2.4} /></button></div>}
      </> : <p className="empty-note">No instructors match your search.</p>}
    </section>
  </>;
}

export function instructorsLoader({ request }) {
  return loadInstructors(request.signal);
}
