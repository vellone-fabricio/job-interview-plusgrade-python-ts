import { useEffect, useState } from 'react'
import CurrentTime from '../components/CurrentTime'
import OfferList from '../components/OfferList'
import RequestSummary from '../components/RequestSummary'
import { api, formatNights, toggleInSet } from '../utils'

function StayPage({ reservationId }) {
  const [stay, setStay] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const stayPath = `/stay/${encodeURIComponent(reservationId)}`

  const toggle = (id) => setSelected((prev) => toggleInSet(prev, id))

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
      <CurrentTime iso={stay.generated_at} />
      <h1>Hi {stay.guest_first_name}, your stay at {stay.hotel.name}</h1>
      <p>
        Reservation {stay.reservation_id}: {stay.booked_room}, arriving {stay.arrival_date} for{' '}
        {formatNights(stay.nights)}
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
