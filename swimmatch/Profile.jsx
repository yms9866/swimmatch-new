import Icon from "../components/Icon.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { LESSON_PREFERENCES, SWIMMING_LEVELS } from "../state/profileReducer.js";
import { initials } from "../utils.js";

export default function Profile() {
  const { state, dispatch } = useProfile();
  const { profile, profileDraft, profileErrors, profileSaved } = state;
  const change = (event) => dispatch({ type: "draft/changed", field: event.target.name, value: event.target.value });
  const set = (field, value) => dispatch({ type: "draft/changed", field, value });
  const error = (field) => profileErrors[field];
  const invalid = (field, id) => ({ "aria-invalid": Boolean(error(field)), "aria-describedby": error(field) ? id : undefined });

  return (
    <section className="wrap pwrap">
      <div className="pcard">
        <div className="intro">
          <span className="badge" aria-hidden="true">
            {profile.name ? <span className="d">{initials(profile.name)}</span> : <Icon name="user" size={48} stroke={1.8} />}
          </span>
          <p className="m">{profile.name ? `Hello, ${profile.name.split(" ")[0]}` : "Your SwimMatch profile"}</p>
          <h1 className="d">Swimmer<br />profile.</h1>
          <p className="s">Your level and lesson types pre-fill every search. All fields are needed to save.</p>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "form/submitted" }); }} noValidate>
          <div className="fgrid">
            <label className="field" htmlFor="profile-name"><span className="field-label">Full name</span><input id="profile-name" name="name" autoComplete="name" placeholder="Your name" value={profileDraft.name} onChange={change} {...invalid("name", "error-name")} />{error("name") && <span className="field-error" id="error-name">{error("name")}</span>}</label>
            <label className="field" htmlFor="profile-email"><span className="field-label">Email address</span><input id="profile-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={profileDraft.email} onChange={change} {...invalid("email", "error-email")} />{error("email") && <span className="field-error" id="error-email">{error("email")}</span>}</label>
            <label className="field span2" htmlFor="profile-location"><span className="field-label">City or area</span><input id="profile-location" name="location" autoComplete="address-level2" placeholder="e.g. Al Reem Island" value={profileDraft.location} onChange={change} {...invalid("location", "error-location")} />{error("location") && <span className="field-error" id="error-location">{error("location")}</span>}</label>

            <div className="field span2">
              <span className="field-label" id="level-label">Swimming level</span>
              <div className={`seg3${error("swimming_level") ? " invalid" : ""}`} role="group" aria-labelledby="level-label" aria-describedby={error("swimming_level") ? "error-level" : undefined}>
                {SWIMMING_LEVELS.map((level) => (
                  <button key={level} type="button" aria-pressed={profileDraft.swimming_level === level} onClick={() => set("swimming_level", profileDraft.swimming_level === level ? "" : level)}>{level}</button>
                ))}
              </div>
              {error("swimming_level") && <span className="field-error" id="error-level">{error("swimming_level")}</span>}
            </div>

            <div className="field span2">
              <span className="field-label" id="lessons-label">Preferred lesson types · pick any</span>
              <div className="toggles" role="group" aria-labelledby="lessons-label" aria-describedby={error("preferred_lessons") ? "error-lessons" : undefined}>
                {LESSON_PREFERENCES.map((lesson) => {
                  const on = profileDraft.preferred_lessons.includes(lesson);
                  return (
                    <button key={lesson} type="button" aria-pressed={on} onClick={() => set("preferred_lessons", on
                      ? profileDraft.preferred_lessons.filter((item) => item !== lesson)
                      : [...profileDraft.preferred_lessons, lesson])}>
                      {on && <Icon name="check" size={18} stroke={2.6} />}{lesson}
                    </button>
                  );
                })}
              </div>
              {error("preferred_lessons") && <span className="field-error" id="error-lessons">{error("preferred_lessons")}</span>}
            </div>
          </div>
          <div className="form-actions">
            {profileSaved && <span className="success-message" role="status"><Icon name="check" size={18} stroke={2.6} />Profile saved. Your details are ready across SwimMatch.</span>}
            <button className="btn btn-dark" type="submit">Save profile</button>
          </div>
        </form>
      </div>
    </section>
  );
}
