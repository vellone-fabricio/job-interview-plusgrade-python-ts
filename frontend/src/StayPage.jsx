import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const formatPrice = (amount, currency) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))

const formatUtc = (iso) =>
  new Date(iso).toLocaleString(undefined, { timeZone: 'UTC', timeZoneName: 'short' })

const api = async (path, options) => {
  const res = await fetch(`${API_URL}${path}`, options)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof body.detail === 'string' ? body.detail : 'Something went wrong')
  return body
}

function RequestSummary({ request, currency, nights }) {
  return (
    <section>
      <h2>Your request</h2>
      <ul>
        {request.offers.map((offer) => (
          <li key={offer.id}>
            <strong>{offer.name}</strong>: {formatPrice(offer.total, currency)}
            <small>
              {formatPrice(offer.price, currency)} per {offer.per}
              {offer.per === 'night' && ` × ${nights} ${nights === 1 ? 'night' : 'nights'}`}
            </small>
          </li>
        ))}
      </ul>
      <p className="total">Total: {formatPrice(request.total, currency)}</p>
    </section>
  )
}

function OfferList({ title, hint, offers, currency, selected, onToggle, isDisabled }) {
  if (offers.length === 0) return null
  return (
    <section>
      <h2>{title}</h2>
      {hint && <p className="hint">{hint}</p>}
      <ul>
        {offers.map((offer) => (
          <li key={offer.id}>
            <label className={isDisabled(offer) ? 'disabled' : undefined}>
              <input
                type="checkbox"
                checked={selected.has(offer.id)}
                disabled={isDisabled(offer)}
                onChange={() => onToggle(offer.id)}
              />
              <span>
                <strong>{offer.name}</strong>: {formatPrice(offer.price, currency)} per {offer.per}
                {offer.description && <small>{offer.description}</small>}
                <small>Bookable until {formatUtc(offer.bookable_until)}</small>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StayPage({ reservationId }) {
  const [stay, setStay] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const stayPath = `/stay/${encodeURIComponent(reservationId)}`

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  useEffect(() => {
    api(stayPath)
      .then(setStay)
      .catch((err) => setError(err.message))
  }, [stayPath])

  const submit = () => {
    setSubmitting(true)
    setSubmitError(null)
    api(`${stayPath}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer_ids: [...selected] }),
    })
      .then((request) => setStay((prev) => ({ ...prev, request })))
      .catch((err) => setSubmitError(err.message))
      .finally(() => setSubmitting(false))
  }

  if (error) return <p>{error}</p>
  if (!stay) return <p>Loading…</p>

  const { currency } = stay.hotel
  const byKind = (kind) => stay.offers.filter((offer) => offer.kind === kind)
  const upgrades = byKind('upgrade')
  const chosenUpgrade = upgrades.find((offer) => selected.has(offer.id))
  const isDisabled = (offer) =>
    offer.kind === 'upgrade' && chosenUpgrade !== undefined && chosenUpgrade.id !== offer.id
  const listProps = { currency, selected, onToggle: toggle, isDisabled }

  return (
    <main>
      <p className="now">
        Current time: <time dateTime={stay.generated_at}>{formatUtc(stay.generated_at)}</time>
      </p>
      <h1>Hi {stay.guest_first_name}, your stay at {stay.hotel.name}</h1>
      <p>
        Reservation {stay.reservation_id}: {stay.booked_room}, arriving {stay.arrival_date} for{' '}
        {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}
      </p>
      {stay.request ? (
        <RequestSummary request={stay.request} currency={currency} nights={stay.nights} />
      ) : (
        <>
          <OfferList
            title="Upgrades"
            hint="You can choose one upgrade. Untick it to pick a different one."
            offers={upgrades}
            {...listProps}
          />
          <OfferList title="Extras" offers={byKind('extra')} {...listProps} />
          <div className="actions">
            <button type="button" onClick={submit} disabled={selected.size === 0 || submitting}>
              {submitting ? 'Sending…' : 'Request'}
            </button>
            {submitError && <p className="error">{submitError}</p>}
          </div>
        </>
      )}
    </main>
  )
}

export default StayPage
