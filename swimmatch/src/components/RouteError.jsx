import { Link, isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import Icon from "./Icon.jsx";

export default function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return <section className="wrap status-block" role="alert">
    <p className="m kicker">{notFound ? "404 · Not found" : "Connection"}</p>
    <h1 className="d">{notFound ? "Page not found" : "We couldn’t load this page"}</h1>
    <p>{notFound ? "The requested item or page does not exist." : "Check your connection, then try loading this page again."}</p>
    {notFound
      ? <Link to="/" className="btn">Go home <Icon name="arrow" size={20} stroke={2.4} /></Link>
      : <button className="btn" type="button" disabled={revalidator.state !== "idle"} onClick={() => revalidator.revalidate()}>
        {revalidator.state === "loading" ? "Retrying…" : "Try again"}
      </button>}
  </section>;
}
