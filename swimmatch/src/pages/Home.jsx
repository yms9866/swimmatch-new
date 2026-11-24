import { Link, Form, useLoaderData } from "react-router";
import Icon from "../components/Icon.jsx";
import { SaveButton } from "../components/ProviderCard.jsx";
import { matchingPrice } from "../services/providers.js";
import { PHOTOS, providerPhoto, maskFor } from "../lib/media.js";

const place = (provider) => [provider.area, provider.city].filter(Boolean).join(" · ");
const typesLine = (provider) => {
  const types = [...new Set(provider.services.map((service) => service.type))].map((type) => type[0].toUpperCase() + type.slice(1));
  return [...types, provider.home_visit ? "Home visit" : null].filter(Boolean).join(" · ");
};

function Badge() {
  return (
    <div className="hero-badge" aria-hidden="true">
      <svg className="spin" viewBox="0 0 168 168">
        <defs><path id="badge-circle" d="M84 84 m-64 0 a64 64 0 1 1 128 0 a64 64 0 1 1 -128 0" /></defs>
        <circle cx="84" cy="84" r="84" fill="#E4FF5C" />
        <text fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" letterSpacing="3.2" fill="#04263A"><textPath href="#badge-circle">BEGINNERS • PRIVATE • GROUPS • ALL AGES • </textPath></text>
      </svg>
      <div className="core">
        <svg viewBox="0 0 32 32"><path d="M3 13c3-5 5 4 8 0s5 4 8 0 5 4 8 0M3 20c3-5 5 4 8 0s5 4 8 0 5 4 8 0" fill="none" stroke="#3EE6D4" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </div>
    </div>
  );
}

export default function Home() {
  const { providers, instructors } = useLoaderData();
  const ranked = [...providers].sort((a, b) => b.rating - a.rating);
  const heat = ranked.slice(0, 5);
  const [featured, ...rows] = heat;
  const lessonCount = providers.reduce((sum, provider) => sum + provider.services.length, 0);
  const groupPrices = providers.flatMap((provider) => provider.services.filter((service) => service.type === "group").map((service) => service.price));
  const groupFrom = groupPrices.length ? Math.min(...groupPrices) : null;
  const areas = [...new Set(ranked.map((provider) => provider.area).filter(Boolean))].slice(0, 7);
  const ribbon = [...areas, "Home visits"];
  const names = new Map(providers.map((provider) => [provider.id, provider.name]));
  const coach = instructors?.length ? [...instructors].sort((a, b) => b.experience_years - a.experience_years)[0] : null;
  const minRating = heat.length ? Math.min(...heat.map((provider) => provider.rating)) : null;

  return (
    <>
      {/* HERO */}
      <section className="wrap hero-wrap">
        <div className="hero">
          <img className="hero-img kb" src={PHOTOS.heroFly.src} alt={PHOTOS.heroFly.alt} fetchPriority="high" />
          <p className="m hero-kicker rise">Dubai · Abu Dhabi · Sharjah</p>
          <h1 className="d hero-title rise r2">Get<br /> in<span>.</span></h1>
          <p className="hero-sub rise r3">
            {providers.length} swim schools{instructors ? ` and ${instructors.length} coaches` : ""}. Pick a pool, meet a coach, book a lane.
          </p>
          {featured && (
            <Link to={`/providers/${featured.id}`} className="hero-chip bob">
              <img src={providerPhoto(featured).src} alt="" />
              <span className="t">
                <span className="n">{featured.name}</span>
                <span className="m">{featured.area}</span>
                <span className="r"><span className="star" aria-hidden="true">★</span> {featured.rating} · from AED {matchingPrice(featured)}</span>
              </span>
            </Link>
          )}
          <Badge />
          <div className="rope hero-rope" aria-hidden="true" />
        </div>
        <Form className="dock rise r4" action="/search" method="get" role="search">
          <div className="rope" aria-hidden="true" />
          <label className="dock-field where">
            <Icon name="pin" size={22} />
            <span><span className="m">Where</span><input name="location" placeholder="Al Reem, Jumeirah, Sharjah…" /></span>
          </label>
          <label className="dock-field level">
            <Icon name="steps" size={22} />
            <span>
              <span className="m">Level</span>
              <select name="level" defaultValue="">
                <option value="">Any level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </span>
          </label>
          <button className="btn" type="submit">Show matches <Icon name="arrow" size={22} stroke={2.4} /></button>
        </Form>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track m">
          {[0, 1].map((copy) => ribbon.map((label) => <span key={`${copy}-${label}`}>{label}<i> ●</i></span>))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="wrap cats-sec">
        <div className="sec-head reveal">
          <h2 className="d h-xl">Three ways<br /><span className="teal">into the water.</span></h2>
          <Link to="/services" className="link-line">All {lessonCount} lessons <Icon name="diag" size={18} stroke={2.4} /></Link>
        </div>
        <div className="cats reveal">
          <Link to="/search?level=Beginner" className="tile cat-beg">
            <img className="photo" src={PHOTOS.girlSwim.src} alt="" loading="lazy" />
            <span className="disc"><Icon name="ring" size={30} /></span>
            <div className="body">
              <div>
                <p className="m">Kids &amp; adults</p>
                <h3 className="d">Beginners</h3>
                <p className="s">From floating to your first full length.</p>
              </div>
              <span className="go"><Icon name="arrow" size={24} stroke={2.4} /></span>
            </div>
          </Link>
          <Link to="/search?type=Private" className="tile cat-priv">
            <div className="side">
              <span className="disc"><Icon name="pair" size={26} /></span>
              <div><h3 className="d">Private</h3><p className="s">One coach. Your pace.</p></div>
            </div>
            <div className="frame">
              <img src={PHOTOS.teach.src} alt="" loading="lazy" />
              <span className="m">1 : 1 · 60–90 min</span>
            </div>
          </Link>
          <Link to="/search?type=Group" className="tile cat-grp">
            <img className="photo" src={PHOTOS.kidsBoard.src} alt="" loading="lazy" />
            <div className="side">
              <span className="disc"><Icon name="group" size={26} /></span>
              <div><h3 className="d">Groups</h3><p className="s">Swim together.{groupFrom != null ? ` From AED ${groupFrom}.` : ""}</p></div>
            </div>
            <span className="go"><Icon name="arrow" size={22} stroke={2.4} /></span>
          </Link>
        </div>
      </section>

      {/* 25 METRES */}
      <section className="lane-sec">
        <div className="caustic" aria-hidden="true" />
        <div className="wrap inner">
          <div className="lane-head reveal">
            <h2 className="d h-xl">25 metres<br /><span className="chl">to lesson one.</span></h2>
            <p>No sign-up maze. Search, compare and request a slot in one length of the pool.</p>
          </div>
          <div className="lane tiles reveal">
            <div className="rope aq top" aria-hidden="true" />
            <div className="rope aq bot" aria-hidden="true" />
            <div className="floor" aria-hidden="true">
              <i className="bar" /><i className="tl" /><i className="tr" />
              <div className="track">
                <span className="swimmer"><svg width="16" height="16" viewBox="0 0 32 32"><path d="M3 13c3-5 5 4 8 0s5 4 8 0 5 4 8 0M3 20c3-5 5 4 8 0s5 4 8 0 5 4 8 0" fill="none" stroke="#04263A" strokeWidth="3" strokeLinecap="round" /></svg></span>
              </div>
            </div>
            <div className="vfloor" aria-hidden="true">
              <div className="vrope" />
              <i className="bar" /><i className="tt" /><i className="tb" />
              <div className="track"><span className="swimmer" /></div>
            </div>
            <ol className="stops">
              <li><p className="m">0 m</p><h3 className="d">Pick a pool</h3><p>Filter by area, level, budget and day.</p></li>
              <li><p className="m">12.5 m</p><h3 className="d">Meet the coach</h3><p>Experience, specialties, real reviews.</p></li>
              <li><p className="m">25 m</p><h3 className="d">Book a lane</h3><p>Request a slot, track it in Bookings.</p></li>
            </ol>
          </div>
        </div>
      </section>

      {/* HEAT SHEET */}
      <section className="wrap heat-sec">
        <div className="sec-head reveal">
          <div>
            {minRating != null && <p className="m kicker">Rated {minRating} and up</p>}
            <h2 className="d h-xl">Swim centers.</h2>
          </div>
          <Link to="/search" className="link-line">All {providers.length} schools <Icon name="diag" size={18} stroke={2.4} /></Link>
        </div>
        {featured ? (
          <div className="heat">
            <article className="tile feat reveal">
              <img className="photo" src={providerPhoto(featured).src} alt="" loading="lazy" style={{ objectPosition: providerPhoto(featured).pos }} />
              <div className="badges">
                <span className="chip chip-sun">★ {featured.rating}</span>
                <span className="m">{typesLine(featured)}</span>
              </div>
              <SaveButton provider={featured} className="save-round" />
              <div className="body">
                <p className="m loc">{place(featured)}</p>
                <h3 className="d"><Link to={`/providers/${featured.id}`} className="stretch">{featured.name}</Link></h3>
                <div className="row">
                  <p>{featured.description}</p>
                  {matchingPrice(featured) != null && <div className="price-big"><span className="m">From · AED</span><span className="d">{matchingPrice(featured)}</span></div>}
                </div>
              </div>
            </article>
            <div className="heat-list reveal">
              <div className="rope ink" aria-hidden="true" />
              {rows.map((provider, index) => {
                const photo = providerPhoto(provider);
                return (
                  <div key={provider.id}>
                    <Link to={`/providers/${provider.id}`} className="heat-row">
                      <img className={maskFor(index)} src={photo.src} alt="" loading="lazy" style={{ objectPosition: photo.pos }} />
                      <div className="t">
                        <h3>{provider.name}</h3>
                        <p className="m">{place(provider)}</p>
                        <span className="r"><span className="star" aria-hidden="true">★</span> {provider.rating}</span><span className="x">{typesLine(provider)}</span>
                      </div>
                      {matchingPrice(provider) != null && <div className="p"><span className="m">AED</span><span className="d">{matchingPrice(provider)}</span></div>}
                      <span className="arr" aria-hidden="true"><Icon name="arrow" size={22} stroke={2.4} /></span>
                    </Link>
                    <div className="rope ink" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : <p className="empty-note">No providers are available right now.</p>}
      </section>

      {/* COACH FEATURE */}
      {coach && (
        <section className="wrap coach-sec">
          <div className="coach-feat">
            <div className="coach-pics reveal">
              <img className="main" src={PHOTOS.peace.src} alt="" loading="lazy" />
              <img className="inset bob" src={PHOTOS.orangeCap.src} alt="" loading="lazy" />
              {names.get(coach.provider_id) && <span className="m">On deck · {names.get(coach.provider_id)}</span>}
            </div>
            <div className="coach-copy reveal">
              <p className="m kicker">{instructors.length} coaches on SwimMatch</p>
              <div className="years">
                <span className="d n">{coach.experience_years}</span>
                <span className="d l">years<br />on deck.</span>
              </div>
              <h3>{coach.name}</h3>
              <p>Coaching at {names.get(coach.provider_id) || "SwimMatch"}.</p>
              <div className="chips">{coach.specialties.slice(0, 3).map((specialty) => <span className="chip" key={specialty}>{specialty}</span>)}</div>
              <Link to="/instructors" className="btn btn-dark">Meet all coaches <Icon name="arrow" size={20} stroke={2.4} /></Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
