import { Link } from "react-router";
import Icon from "./Icon.jsx";
import { stars } from "../utils.js";
import { useSavedProviders } from "../context/SavedProvidersContext.jsx";
import { providerPhoto } from "../lib/media.js";

const RES_MASKS = ["mask-soft", "mask-arch", "mask-leaf", "mask-soft"];

export function SaveButton({ provider, className = "save-btn" }) {
  const { savedProviders, dispatch } = useSavedProviders();
  const isSaved = savedProviders.includes(provider.id);
  return (
    <button
      className={className}
      type="button"
      aria-pressed={isSaved}
      aria-label={`${isSaved ? "Remove" : "Save"} ${provider.name}`}
      onClick={() => dispatch({ type: "provider/toggled", id: provider.id })}
    >
      <Icon name="heart" size={20} filled={isSaved} />
    </button>
  );
}

/** Heat-sheet result row (search results and saved providers). */
export default function ProviderCard({ provider, price, index = 0, topRated = false }) {
  const photo = providerPhoto(provider);
  const lessonTypes = [...new Set(provider.services.map((service) => service.type))];
  return (
    <article className="res">
      <div className={`res-img ${RES_MASKS[index % RES_MASKS.length]}`}>
        <img src={photo.src} alt="" loading={index > 1 ? "lazy" : "eager"} style={{ objectPosition: photo.pos }} />
        {topRated && <span className="m tag">Top rated</span>}
      </div>
      <div className="res-body">
        <p className="m">{[provider.area, provider.city].filter(Boolean).join(" · ")}</p>
        <h2 className="d"><Link to={`/providers/${provider.id}`} className="stretch">{provider.name}</Link></h2>
        {provider.description && <p className="desc">{provider.description}</p>}
        <div className="chips">
          <span className="rate"><span className="star" aria-hidden="true">{stars(provider.rating)}</span> {provider.rating}{provider.reviews_count > 0 && <span className="muted"> ({provider.reviews_count})</span>}</span>
          {lessonTypes.map((type) => <span className="chip chip-sm" key={type}>{type}</span>)}
          {provider.home_visit && <span className="chip chip-sm chip-dark">Home visit</span>}
          {Number.isFinite(provider.distanceKm) && <span className="chip chip-sm">{provider.distanceKm.toFixed(1)} km away</span>}
        </div>
      </div>
      <div className="res-side">
        {price != null && <div className="pr"><span className="m">From · AED / session</span><span className="d">{price}</span></div>}
        <div className="acts">
          <SaveButton provider={provider} />
          <Link to={`/providers/${provider.id}`} className="view-btn" aria-label={`View ${provider.name}`}>View <Icon name="arrow" size={18} stroke={2.4} /></Link>
        </div>
      </div>
    </article>
  );
}