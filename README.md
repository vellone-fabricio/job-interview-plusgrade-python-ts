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
