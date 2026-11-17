import { Link, useLoaderData } from "react-router";
import ProviderCard from "../components/ProviderCard.jsx";
import Icon from "../components/Icon.jsx";
import { getProviders } from "../services/providers.js";
import { useSavedProviders } from "../context/SavedProvidersContext.jsx";

function EmptyLane({ title, text }) {
  return (
    <div className="empty-lane">
      <div className="pool" aria-hidden="true">
        <div className="rope aq" style={{ top: 70 }} />
        <div className="rope aq" style={{ top: 190 }} />
        <span className="buoy float"><i /></span>
      </div>
      <div className="txt">
        <p className="m">Saved</p>
        <h2 className="d">{title}</h2>
        <p className="s">{text}</p>
        <Link className="btn" to="/search">Explore providers <Icon name="arrow" size={20} stroke={2.4} /></Link>
      </div>
    </div>
  );
}

export default function Saved() {
  const { savedProviders } = useSavedProviders();
  const providers = useLoaderData();
  const saved = providers.filter((provider) => savedProviders.includes(provider.id));
  return (
    <section className="wrap saved-wrap">
      <div className="acct-head">
        <h1 className="d title-l rise">Saved<br />lanes.</h1>
        {saved.length > 0 && <p className="m muted">{saved.length} saved · stays on this device</p>}
      </div>
      {savedProviders.length === 0
        ? <EmptyLane title="Empty lane." text="Tap ♡ on any school to keep it here. Saved schools stay on this device, even after you reload." />
        : saved.length
          ? <div>
            <div className="rope ink" aria-hidden="true" />
            {saved.map((provider, index) => <div key={provider.id}>
              <ProviderCard provider={provider} index={index} price={provider.services?.length ? Math.min(...provider.services.map((service) => service.price)) : null} />
              <div className="rope ink" aria-hidden="true" />
            </div>)}
          </div>
          : <EmptyLane title="Gone quiet." text="Some saved providers are no longer listed. They’ll appear here again if they return to the directory." />}
    </section>
  );
}

export function savedLoader({ request }) {
  return getProviders(request.signal);
}
