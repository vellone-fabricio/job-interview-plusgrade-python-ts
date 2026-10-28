# Take-home brief: guest upgrades page
## Context

A few days before a guest arrives, we email them a list of room upgrades and extras for their stay: a better room, breakfast, an airport pick-up. The guest taps through to a page for their stay and picks what they want.

Your task is that page.

What to build
A small full-stack application where a guest, arriving on a link like /stay/TYO-2290, can:

1. See the upgrades and extras for their stay, with prices.
2. See what they can still add.
3. Request one, then see what they asked for and what it will cost (a single request action is enough; a cart, payment or login is explicitly not required).

The supplied file is a snapshot of what our API returns for three upcoming stays. Treat it the way you would treat real production data. price is in the hotel's currency, in whole units (not cents). per says whether it's charged per night or once per stay. bookable_until is the last moment it can be requested, in UTC. Use generated_at as the current time so your results are reproducible.

## Stack
React or Vue on the front end, Node/TypeScript or Python on the back end, your choice. Use AI tooling
however you normally would; we encourage it.

Not evaluated: project scaffolding, visual design polish, authentication, payment and persistence. Hold state in memory if you like. Please don't spend time on a database.

Evaluated: what the page tells the guest, how you work out what they can have and what it costs, how you structure the code, and the questions you ask us along the way.

We expect questions. The brief is deliberately not exhaustive. Asking us isn't a penalty. It's part of the exercise.

## Submission
Git repository or ZIP at the end of the 2 hours.

---

# Solution notes

## Running it

Backend (FastAPI, Python 3.14, managed with [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv run fastapi dev
```

It runs on http://localhost:8000, with interactive API docs at http://localhost:8000/docs.

Frontend (React + Vite):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/stay/TYO-2290 (or `LIS-1042`, `LAX-0388`). The frontend calls the backend on `http://localhost:8000` by default; set `VITE_API_URL` to change it. The backend only allows CORS requests from `http://localhost:5173`.

## API

- `GET /stay/{reservation_id}`: the stay, its bookable offers (each with a `total` for the whole stay), `generated_at`, and the guest's request if they already made one (`null` otherwise).
- `POST /stay/{reservation_id}/request` with `{"offer_ids": ["T1", "T3"]}`: saves the request and returns it with per-offer totals and the overall total.
  - `404` unknown stay
  - `409` a request was already made for this stay
  - `422` empty list, unknown or expired offer, or more than one upgrade

## How it works

- **Current time.** `generated_at` from the snapshot is treated as "now" everywhere, and it's shown to the guest in the top-right corner.
- **What the guest can have.** An offer is bookable while `bookable_until >= generated_at`. Expired offers are left out of the response.
- **What it costs.** A `per: "night"` offer costs `price × nights`; a `per: "stay"` offer costs `price` once. The request total is the sum. Amounts use `Decimal` and are formatted in the hotel's currency.
- **Where the rules live.** The backend is the source of truth for availability, pricing and the one-upgrade rule, and checks all of them again on `POST`. The frontend only disables options the guest can't combine and adds up the backend's per-offer totals for the confirmation modal.
- **State.** Requests are held in memory, so restarting the backend clears them.

## Assumptions and open questions

These are the calls I made where the brief was open, each with the question I'd ask:

1. **Only one upgrade per stay.** Upgrades look like alternative rooms, so the guest can pick at most one.
2. **One request per stay.** The guest can pick several offers, confirm them in one request, and then sees a summary; a second request is rejected.
3. **Expired offers are hidden.**
4. An offer is still bookable at exactly `bookable_until`.
5. **Upgrade prices are the extra cost on top of the booked room, charged for every night.**
6. **Times are shown in UTC.** The data has no hotel timezone.
7. **A request isn't a confirmed booking.** The page says "Your request" rather than "booked".
8. **Bed-type changes aren't flagged.** For example, TYO-2290 is booked in a Moderate Double, and the Superior Twin upgrade has two single beds.
