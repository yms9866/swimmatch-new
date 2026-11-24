import { Link, isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import Icon from "./Icon.jsx";

// What to tell the user for each kind of failure (see getJson in services/providers.js).
function describe(error) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return { notFound: true, kicker: "404 · Not found", title: "Page not found", text: "The requested item or page does not exist." };
  }
  switch (error?.kind) {
    case "timeout":
      return { kicker: "Timed out", title: "The pool is still filling up", text: "The SwimMatch data service didn’t respond in time. It may be waking up, which can take up to a minute. Try again in a moment." };
    case "offline":
      return { kicker: "Offline", title: "You’re offline", text: "Check your internet connection, then try again." };
    case "http":
      return error.status >= 500
        ? { kicker: `Server error · ${error.status}`, title: "The data service hit a problem", text: "This is on our side, not yours. Try again in a moment." }
        : { kicker: `Error · ${error.status}`, title: "We couldn’t load this page", text: "The data service refused the request. Try again, or go back home." };
    case "invalid":
      return { kicker: "Unexpected response", title: "We couldn’t load this page", text: "The data service sent something we didn’t expect. Try again in a moment." };
    default:
      return { kicker: "Connection", title: "We couldn’t load this page", text: "Check your connection, then try loading this page again." };
  }
}

export default function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const info = describe(error);
  const retrying = revalidator.state === "loading";

  return <section className="wrap status-block" role="alert">
    <p className="m kicker">{info.kicker}</p>
    <h1 className="d">{info.title}</h1>
    <p>{info.text}</p>
    {info.notFound
      ? <Link to="/" className="btn">Go home <Icon name="arrow" size={20} stroke={2.4} /></Link>
      : <div className="status-actions">
        {/* Re-runs only this page's data requests; the app itself is not reloaded. */}
        <button className="btn" type="button" disabled={revalidator.state !== "idle"} onClick={() => revalidator.revalidate()}>
          {retrying ? "Retrying…" : "Try again"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => window.location.reload()}>Reload page</button>
      </div>}
  </section>;
}
