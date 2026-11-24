import { useEffect, useState } from "react";

// Shown while a page's data is loading for the first time (React Router HydrateFallback),
// so the screen is never blank. After a few seconds it explains the wait: the API can
// take up to a minute to wake up.
export default function AppLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="wrap app-loading" role="status" aria-live="polite">
      <div className="rope aq" aria-hidden="true" />
      <p className="d">Getting in the water…</p>
      <p className="m">{slow ? "The data service is waking up. This can take up to a minute." : "Loading pools, lessons and coaches"}</p>
      <div className="rope" aria-hidden="true" />
    </section>
  );
}
