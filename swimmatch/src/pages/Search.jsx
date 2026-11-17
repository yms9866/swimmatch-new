import { useMemo } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import ProviderCard from "../components/ProviderCard.jsx";
import Icon from "../components/Icon.jsx";
import { filterProviders, getProviders, matchingPrice } from "../services/providers.js";
import { useProfile } from "../context/ProfileContext.jsx";
import { PHOTOS } from "../lib/media.js";

const FILTER_FIELDS = ["level", "type", "budget", "location", "day", "where"];
const PAGE = 10;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function readFilters(params, profile = {}) {
  return {
    level: params.has("level") ? params.get("level") : profile.swimming_level || "",
    type: params.get("type") || "",
    budget: params.get("budget") || "",
    location: params.has("location") ? params.get("location") : profile.location || "",
    day: params.get("day") || "",
    where: params.get("where") || "",
  };
}

export function searchLoader({ request }) {
  const params = new URL(request.url).searchParams;
  const filters = Object.fromEntries(FILTER_FIELDS.map((field) => [field, params.get(field) || ""]));
  return getProviders(request.signal, filters);
}

export function shouldRevalidateSearch({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;
  return FILTER_FIELDS.some((field) => currentUrl.searchParams.get(field) !== nextUrl.searchParams.get(field));
}

function Segmented({ label, name, value, options, onChange, tone = "" }) {
  return (
    <div className={`seg ${tone}`} role="group" aria-label={label}>
      {options.map(([optionValue, text]) => (
        <button key={text} type="button" aria-pressed={value === optionValue} onClick={() => onChange(name, optionValue)}>{text}</button>
      ))}
    </div>
  );
}

export default function Search() {
  const providers = useLoaderData();
  const { state } = useProfile();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params, state.profile);
  const query = params.get("q") || "";
  const sort = params.get("sort") || "best";
  const visible = Math.max(PAGE, Number(params.get("count")) || PAGE);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = filterProviders(providers, filters).filter((provider) =>
      !term || `${provider.name} ${provider.description || ""} ${provider.city} ${provider.area} ${provider.services.map((service) => `${service.name} ${service.description || ""}`).join(" ")}`
        .toLowerCase().includes(term));
    return matches.sort((a, b) => sort === "price"
      ? matchingPrice(a, filters) - matchingPrice(b, filters)
      : b.rating - a.rating);
  }, [providers, filters.level, filters.type, filters.budget, filters.location, filters.day, filters.where, sort, query]);

  const updateParam = (key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (FILTER_FIELDS.includes(key)) next.set(key, value);
      else if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "count") next.delete("count");
      return next;
    }, { replace: true });
  };

  const changeFilter = (event) => updateParam(event.target.name, event.target.value);

  const clearAll = () => setParams(() => {
    const next = new URLSearchParams();
    FILTER_FIELDS.forEach((field) => next.set(field, ""));
    return next;
  }, { replace: true });

  const summary = [
    filters.level, filters.type, filters.day,
    filters.where === "home" ? "Home visit" : filters.where === "facility" ? "Facility" : "",
    filters.budget ? `up to AED ${filters.budget}` : "",
  ].filter(Boolean).join(" · ");
  const hasFilters = query.trim() || FILTER_FIELDS.some((field) => params.has(field) && params.get(field));
  const topRating = results.length ? Math.max(...results.map((provider) => provider.rating)) : null;

  return <>
    <section className="wrap">
      <div className="dark-head">
        <div className="caustic" aria-hidden="true" />
        <img className="corner" src={PHOTOS.aerial.src} alt="" />
        <div className="in">
          <h1 className="d title-xl rise"><span className="chl">{providers.length}</span> places<br />to swim.</h1>
          <p className="m sub">Across Dubai, Abu Dhabi &amp; Sharjah · sorted by {sort === "price" ? "price" : "rating"}</p>

          <div className="filter-lane" role="search" aria-label="Search filters">
            <div className="fl-row">
              <label className="fl-box grow">
                <Icon name="search" size={22} stroke={2.2} />
                <input name="location" value={filters.location} onChange={changeFilter} placeholder="Area, school or coach" aria-label="Location or provider" />
                <span className="m hide-sm" aria-hidden="true">Location or provider</span>
              </label>
              <label className="fl-box fix">
                <Icon name="calendar" size={20} />
                <select name="day" value={filters.day} onChange={changeFilter} aria-label="Preferred day">
                  <option value="">Any day</option>
                  {DAYS.map((day) => <option key={day}>{day}</option>)}
                </select>
              </label>
              <label className="fl-box fix">
                <span className="m">Up to</span>
                <select name="budget" value={filters.budget} onChange={changeFilter} aria-label="Budget range">
                  <option value="">Any budget</option><option value="150">AED 150</option><option value="200">AED 200</option><option value="250">AED 250</option>
                </select>
              </label>
            </div>
            <div className="fl-segs">
              <span className="m">Level</span>
              <Segmented label="Swimming level" name="level" value={filters.level} onChange={updateParam}
                options={[["", "Any"], ["Beginner", "Beginner"], ["Intermediate", "Intermediate"], ["Advanced", "Advanced"]]} />
              <span className="m">Type</span>
              <Segmented label="Lesson type" name="type" value={filters.type} onChange={updateParam} tone="seg-coral"
                options={[["", "Any"], ["Private", "Private"], ["Group", "Group"]]} />
              <span className="m">Where</span>
              <Segmented label="Home visit or facility" name="where" value={filters.where} onChange={updateParam}
                options={[["", "Either"], ["home", "Home visit"], ["facility", "Facility"]]} />
              <button type="button" className="clear-btn" onClick={clearAll}>Clear all</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="wrap results" aria-live="polite">
      <div className="results-bar">
        <p><b>{results.length} {results.length === 1 ? "match" : "matches"}</b>{summary ? ` for ${summary}` : ""}{filters.location ? ` in “${filters.location}”` : ""}</p>
        <div className="results-tools">
          <label className="mini-search">
            <Icon name="search" size={18} />
            <input id="provider-search" type="search" value={query} onChange={(event) => updateParam("q", event.target.value)} placeholder="Search lessons or schools" aria-label="Search providers or lessons" />
          </label>
          <Segmented label="Sort" name="sort" value={sort} tone="seg-sun" onChange={updateParam}
            options={[["best", "★ Highest rated"], ["price", "Lowest price"]]} />
        </div>
      </div>
      <div className="rope ink" aria-hidden="true" />
      {results.length === 0 && <p className="empty-note">{hasFilters ? "No providers match your search. Try another name, lesson, location, or filter." : "No providers are available right now."}</p>}
      {results.slice(0, visible).map((provider, index) => (
        <div key={provider.id}>
          <ProviderCard provider={provider} price={matchingPrice(provider, filters)} index={index} topRated={sort === "best" && index === 0 && provider.rating === topRating} />
          <div className="rope ink" aria-hidden="true" />
        </div>
      ))}
      {visible < results.length && (
        <div className="more">
          <button className="btn" type="button" onClick={() => updateParam("count", String(visible + PAGE))}>
            Show {Math.min(PAGE, results.length - visible)} more <Icon name="down" size={20} stroke={2.4} />
          </button>
        </div>
      )}
    </section>
  </>;
}
