import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const formatPrice = (amount, currency) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))

const formatUtc = (iso) =>
  new Date(iso).toLocaleString(undefined, { timeZone: 'UTC', timeZoneName: 'short' })

function OfferList({ title, offers, currency }) {
  if (offers.length === 0) return null
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {offers.map((offer) => (
          <li key={offer.id}>
            <strong>{offer.name}</strong>: {formatPrice(offer.price, currency)} per {offer.per}
            {offer.description && <p>{offer.description}</p>}
            <small>Bookable until {formatUtc(offer.bookable_until)}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StayPage({ reservationId }) {
  const [stay, setStay] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/stay/${encodeURIComponent(reservationId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Stay not found' : 'Could not load stay')
        return res.json()
      })
      .then(setStay)
      .catch((err) => setError(err.message))
  }, [reservationId])

  if (error) return <p>{error}</p>
  if (!stay) return <p>Loading…</p>

  const { currency } = stay.hotel
  const byKind = (kind) => stay.offers.filter((offer) => offer.kind === kind)

  return (
    <main>
      <h1>Hi {stay.guest_first_name}, your stay at {stay.hotel.name}</h1>
      <p>
        Reservation {stay.reservation_id}: {stay.booked_room}, arriving {stay.arrival_date} for{' '}
        {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}
      </p>
      <OfferList title="Upgrades" offers={byKind('upgrade')} currency={currency} />
      <OfferList title="Extras" offers={byKind('extra')} currency={currency} />
    </main>
  )
}

export default StayPage
