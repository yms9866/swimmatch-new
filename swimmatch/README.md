# SwimMatch

## 1. Project Overview

SwimMatch is a web application that helps users find swimming lessons, instructors, and providers across the UAE. Users can explore available services and filter providers based on their swimming level, lesson type, budget, location, preferred day, and venue.

The application also allows users to view provider details, compare available options, save favorite providers, manage their profiles, and submit lesson requests.

The interface uses the **"Lane Lines"** visual design (lane-rope dividers, pool-floor lines, scoreboard prices; Bricolage Grotesque, Figtree and JetBrains Mono type).

## 2. Main Features

- **Provider Search:** Browse and filter swimming providers by level, lesson type, budget, location, preferred day and venue; sort by rating or price.
- **Services Directory (Lessons):** Search lessons and filter by level, lesson type and maximum price; book a lesson directly.
- **Instructor Directory (Coaches):** Search by name, school, specialty or city; filter by specialty, school and minimum experience; book with a coach's school.
- **Provider Details:** Services, schedule, instructors, reviews and map, with a booking panel that pre-fills a booking request.
- **Saved Providers:** Save and revisit favorite providers.
- **Booking Requests:** Submit booking requests and view them alongside existing bookings.
- **User Profile:** Manage personal information and swimming preferences.

## 3. Technologies Used

- React 19 – Frontend user interface.
- React Router 8 – Application routing and data loading.
- Vite 5 – Development server and production build tool.
- JavaScript – Application functionality.
- CSS – Styling, motion and responsive layout (`src/index.css`).
- React Context and useReducer – Application state management.
- JSON API – Provides provider, service, instructor, availability, and booking data.
- LocalStorage – Stores the user profile, saved providers and booking requests locally.

## 4. Prerequisites

- **Node.js:** Version 18 or later.
- **npm:** Installed automatically with Node.js.
- **Git:** Optional.

```bash
node -v
npm -v
```

## 5. Installation

1. Download or clone the project.
2. Open a terminal in the project root directory.
3. Install the exact dependency versions from `package-lock.json`:

```bash
npm ci
```

(`npm install` also works.)

## 6. Running the Application

```bash
npm run dev
```

Open **http://localhost:5173**.

**Why port 5173:** the SwimMatch API only accepts browser requests from `http://localhost:5173` and `https://swimmatch.vercel.app` (CORS). `vite.config.js` therefore uses port 5173 for both `npm run dev` and `npm run preview`, with `strictPort`: if 5173 is already in use, Vite stops with "Port 5173 is already in use" instead of silently moving to another port that the API would reject. Free the port (for example, close the other dev server) and run the command again.

To use a different port, set `PORT` (for example `PORT=5180 npm run dev`) — only useful if the API has also been configured to accept that origin.

Production build and local preview:

```bash
npm run build
npm run preview
```

## 7. API Configuration and Environment Variables

The application calls the SwimMatch JSON API directly from the browser. The address is defined in `src/services/providers.js`:

```javascript
const API_BASE = (import.meta.env.VITE_API_BASE || "https://swimmatch.onrender.com").replace(/\/+$/, "");
```

No `.env` file is required. Optional overrides are listed in `.env.example` (copy it to `.env.local`):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE` | `https://swimmatch.onrender.com` | API base URL |
| `VITE_API_TIMEOUT_MS` | `45000` | How long a request may take before showing a "timed out" message |
| `PORT` | `5173` | Dev/preview port (see section 6) |

No API keys or authentication tokens are required.

### Loading, timeouts and errors

- While a page's data loads for the first time, a "Getting in the water…" screen is shown inside the site layout. After 8 seconds it explains that the data service may be waking up (the API runs on a tier that can take ~30 seconds to start).
- Each request gives up after 45 seconds and the page shows a clear message (timed out, offline, server error, or connection problem).
- **Try again** re-runs only that page's data requests, without reloading the site. **Reload page** is available as a fallback.
- Navigating away while data is loading cancels the old requests; that never shows an error.

## 8. Data Storage

- **User profile:** browser LocalStorage (`swimmatch.profile`).
- **Saved providers:** browser LocalStorage (`swimmatch.savedProviders`).
- **Booking requests:** browser LocalStorage (`swimmatch.bookings`). Only the booking summary is stored (provider, lesson, date, time, location, status) — not the name, email or note. Stored entries are validated when the page loads. Bookings returned by the API are not stored locally.

### Booking links

`/bookings?create=1` opens the booking form. It can be pre-filled with:

| Parameter | Example |
|---|---|
| `provider_id` | `3` |
| `service_id` | `110` |
| `date` | `2026-12-05` |
| `time` | `09:00` (must be one of the form's times) |
| `place` | `home` or `facility` |

Older links using `provider` / `service` are still accepted.

## 9. Project Structure

```text
swimmatch/
│
├── public/
│   └── images/
│       └── lane/            # placeholder photography (Unsplash) for the redesign
│
├── src/
│   ├── components/          # shared UI (Navbar, Logo, Icon, Segmented, BookingForm, ...)
│   ├── context/             # profile, saved providers, booking requests
│   ├── lib/media.js         # photo selection for providers
│   ├── pages/               # page components only (no data loading)
│   ├── routes/loaders.js    # route data loaders and revalidation rules
│   ├── services/providers.js# API access (timeout, error kinds)
│   ├── state/               # reducers
│   ├── App.jsx              # site layout (nav, footer)
│   ├── router.jsx           # route table
│   ├── index.css            # Lane Lines design system and page styles
│   ├── main.jsx
│   └── utils.js
│
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── vercel.json              # sends every URL to index.html (single-page app routing on Vercel)
├── vite.config.js
└── README.md
```

**Why loaders live outside the pages:** page files export only React components, so editing a page updates the open browser instantly (Fast Refresh) instead of reloading the whole site and re-fetching all data. Add new route loaders to `src/routes/loaders.js` and register them in `src/router.jsx`.

## 10. Deployment

The project deploys to Vercel as a static Vite build (`npm run build`, output `dist`). `vercel.json` rewrites every path to `index.html` so links such as `/providers/3` work when opened directly.

## 11. Additional Notes

- The `node_modules` folder is not included. It is generated by `npm ci` / `npm install`.
- The `dist` folder is generated by `npm run build`.
- Provider and coach photos are free-licence placeholders; replace them with real photos when available (`src/lib/media.js`).
- No real API keys, passwords, or authentication credentials are included in the project.
- An active internet connection is required to retrieve data from the external API.
