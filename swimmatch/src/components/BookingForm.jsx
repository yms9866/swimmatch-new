import { useReducer } from "react";
import { useBookings } from "../context/BookingContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import Icon from "./Icon.jsx";

const TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00"];

function todayValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialValues(profile) {
  return { name: profile.name, email: profile.email, provider_id: "", service_id: "", instructor_id: "", date: "", time: "", place: "facility", notes: "" };
}

/** Optional choices handed over from a provider page; anything that doesn't fit the form is dropped. */
function withPrefill(values, prefill, providers) {
  if (!prefill?.provider_id) return values;
  const provider = providers.find((item) => String(item.id) === String(prefill.provider_id));
  if (!provider) return values;
  const next = { ...values, provider_id: String(provider.id) };
  if (provider.services.some((item) => String(item.id) === String(prefill.service_id))) next.service_id = String(prefill.service_id);
  if ((provider.instructors || []).some((item) => String(item.id) === String(prefill.instructor_id))) next.instructor_id = String(prefill.instructor_id);
  if (/^\d{4}-\d{2}-\d{2}$/.test(prefill.date || "") && prefill.date >= todayValue()) next.date = prefill.date;
  if (TIMES.includes(prefill.time)) next.time = prefill.time;
  next.place = prefill.place === "home" && provider.home_visit ? "home" : "facility";
  return next;
}

function validate(values, providers) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter the swimmer’s name.";
  else if (values.name.trim().length < 2) errors.name = "Enter a name with at least 2 characters.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email, such as name@example.com.";

  const provider = providers.find((item) => String(item.id) === values.provider_id);
  if (!values.provider_id) errors.provider_id = "Choose a swimming provider.";
  else if (!provider) errors.provider_id = "Choose a provider from the list.";

  const service = provider?.services.find((item) => String(item.id) === values.service_id);
  if (!values.service_id) errors.service_id = "Choose a lesson from the list.";
  else if (!service) errors.service_id = "Choose a lesson offered by the selected provider.";

  if (!values.date) errors.date = "Choose a requested lesson date.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || values.date < todayValue()) errors.date = "Choose today or a future date.";
  else {
    const [year, month, day] = values.date.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) errors.date = "Choose a valid calendar date.";
  }
  if (!TIMES.includes(values.time)) errors.time = "Choose a lesson time from the list.";
  if (values.place === "home" && !provider?.home_visit) errors.place = "Choose a provider that offers home visits, or select facility.";
  if (values.place !== "home" && values.place !== "facility") errors.place = "Choose home visit or provider facility.";
  if (values.notes.length > 300) errors.notes = "Keep your note to 300 characters or fewer.";
  return errors;
}

function bookingFormReducer(state, action) {
  switch (action.type) {
    case "changed":
      return { ...state, values: action.values, errors: action.errors, notice: "" };
    case "invalid":
      return { ...state, errors: action.errors, submitted: true, notice: "" };
    case "created":
      return { values: action.values, errors: {}, submitted: false, notice: action.notice };
    default:
      return state;
  }
}

function newBookingId() {
  return globalThis.crypto?.randomUUID?.() || `request-${Date.now()}`;
}

export default function BookingForm({ providers, prefill }) {
  const { state: profileState } = useProfile();
  const { dispatch: dispatchBooking } = useBookings();
  const [state, dispatch] = useReducer(bookingFormReducer, profileState.profile, (profile) => ({
    values: withPrefill(initialValues(profile), prefill, providers), errors: {}, submitted: false, notice: "",
  }));
  const { values, errors } = state;
  const selectedProvider = providers.find((provider) => String(provider.id) === values.provider_id);
  const services = selectedProvider?.services || [];
  const instructors = selectedProvider?.instructors || [];
  const error = (field) => errors[field];
  const invalid = (field, id) => ({ "aria-invalid": Boolean(error(field)), "aria-describedby": error(field) ? id : undefined });
  const errorText = (field, id) => error(field) && <span className="field-error" id={id}>{error(field)}</span>;

  const change = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    if (name === "provider_id") {
      nextValues.service_id = "";
      nextValues.instructor_id = "";
      const nextProvider = providers.find((provider) => String(provider.id) === value);
      if (!nextProvider?.home_visit) nextValues.place = "facility";
    }
    dispatch({ type: "changed", values: nextValues, errors: state.submitted ? validate(nextValues, providers) : errors });
  };

  const submit = (event) => {
    event.preventDefault();
    const errors = validate(values, providers);
    if (Object.keys(errors).length) {
      dispatch({ type: "invalid", errors });
      return;
    }

    const provider = providers.find((item) => String(item.id) === values.provider_id);
    const service = provider.services.find((item) => String(item.id) === values.service_id);
    const instructor = (provider.instructors || []).find((item) => String(item.id) === values.instructor_id);
    dispatchBooking({ type: "booking/requested", booking: {
      id: newBookingId(),
      provider_id: provider.id,
      provider_name: provider.name,
      service_name: service.name,
      instructor_name: instructor?.name || "",
      date: values.date,
      time: values.time,
      place: values.place === "home" ? "Home visit" : "Provider facility",
      status: "pending",
    } });
    dispatch({ type: "created", values: initialValues(profileState.profile), notice: "Booking added and saved on this device." });
  };

  return <form className="booking-form" onSubmit={submit} noValidate>
    <div className="form-intro"><h2 className="d">Request a lesson.</h2><p>Choose a provider, lesson, date and time.</p></div>
    <div className="fgrid">
      <label className="field" htmlFor="booking-name"><span className="field-label">Swimmer’s name</span><input id="booking-name" name="name" autoComplete="name" value={values.name} onChange={change} required {...invalid("name", "booking-error-name")} />{errorText("name", "booking-error-name")}</label>
      <label className="field" htmlFor="booking-email"><span className="field-label">Email address</span><input id="booking-email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} required {...invalid("email", "booking-error-email")} />{errorText("email", "booking-error-email")}</label>
      <label className="field span2" htmlFor="booking-provider"><span className="field-label">Provider</span><select id="booking-provider" name="provider_id" value={values.provider_id} onChange={change} required {...invalid("provider_id", "booking-error-provider")}><option value="">Choose a provider</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select>{errorText("provider_id", "booking-error-provider")}</label>
      <label className="field span2" htmlFor="booking-service"><span className="field-label">Lesson</span><select id="booking-service" name="service_id" value={values.service_id} onChange={change} required disabled={!selectedProvider} {...invalid("service_id", "booking-error-service")}><option value="">{selectedProvider ? "Choose a lesson" : "Choose a provider first"}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · AED {service.price}</option>)}</select>{errorText("service_id", "booking-error-service")}</label>
      <label className="field span2" htmlFor="booking-instructor"><span className="field-label">Instructor (optional)</span><select id="booking-instructor" name="instructor_id" value={values.instructor_id} onChange={change} disabled={!selectedProvider}><option value="">{selectedProvider ? "Any available coach" : "Choose a provider first"}</option>{instructors.map((inst) => <option key={inst.id} value={inst.id}>{inst.name} ({inst.experience_years} yrs)</option>)}</select></label>
      <label className="field" htmlFor="booking-date"><span className="field-label">Requested date</span><input id="booking-date" name="date" type="date" min={todayValue()} value={values.date} onChange={change} required {...invalid("date", "booking-error-date")} />{errorText("date", "booking-error-date")}</label>
      <label className="field" htmlFor="booking-time"><span className="field-label">Requested time</span><select id="booking-time" name="time" value={values.time} onChange={change} required {...invalid("time", "booking-error-time")}><option value="">Choose a time</option>{TIMES.map((time) => <option key={time} value={time}>{time}</option>)}</select>{errorText("time", "booking-error-time")}</label>
      <label className="field span2" htmlFor="booking-place"><span className="field-label">Lesson location</span><select id="booking-place" name="place" value={values.place} onChange={change} required {...invalid("place", "booking-error-place")}><option value="facility">Provider facility</option>{selectedProvider?.home_visit && <option value="home">Home visit</option>}</select>{errorText("place", "booking-error-place")}</label>
      <label className="field span2" htmlFor="booking-notes"><span className="field-label">Note for the provider (optional)</span><textarea id="booking-notes" name="notes" value={values.notes} onChange={change} maxLength={301} rows={3} aria-invalid={Boolean(error("notes"))} aria-describedby={error("notes") ? "booking-error-notes" : "booking-notes-count"} />{error("notes") ? <span className="field-error" id="booking-error-notes">{error("notes")}</span> : <span className="field-hint" id="booking-notes-count">{values.notes.length}/300 characters</span>}</label>
    </div>
    <div className="form-actions">{state.notice && <span className="success-message" role="status"><Icon name="check" size={18} stroke={2.6} />{state.notice}</span>}<button className="btn" type="submit">Add booking request <Icon name="arrow" size={20} stroke={2.4} /></button></div>
  </form>;
}