import { Link } from "react-router";
import Icon from "../components/Icon.jsx";

export default function NotFound() {
  return (
    <section className="wrap status-block">
      <p className="m kicker">404 · Page not found</p>
      <h1 className="d">Wrong<br /><span className="teal">lane.</span></h1>
      <p>That address doesn't lead anywhere on SwimMatch.</p>
      <Link to="/" className="btn">Go home <Icon name="arrow" size={20} stroke={2.4} /></Link>
    </section>
  );
}
