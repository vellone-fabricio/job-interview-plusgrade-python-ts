import { useEffect, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import CurrentTime from '../components/CurrentTime'
import OfferList from '../components/OfferList'
import RequestSummary from '../components/RequestSummary'
import { api, formatNights, sumTotals, toggleInSet } from '../utils'

function StayPage({ reservationId }) {
  const [stay, setStay] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const stayPath = `/stay/${encodeURIComponent(reservationId)}`

  const toggle = (id) => setSelected((prev) => toggleInSet(prev, id))

  useEffect(() => {
    api(stayPath)
      .then(setStay)
      .catch((err) => setError(err.message))
  }, [stayPath])

  async function submit(offerIds) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const request = await api(`${stayPath}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_ids: offerIds }),
      })
      setStay((prev) => ({ ...prev, request }))
      setConfirming(false)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function cancel() {
    setConfirming(false)
    setSubmitError(null)
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
  const selectedOffers = stay.offers.filter((offer) => selected.has(offer.id))

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
            <button type="button" onClick={() => setConfirming(true)} disabled={selected.size === 0}>
              Request
            </button>
          </div>
        </>
      )}
      {confirming && (
        <ConfirmModal
          request={{ offers: selectedOffers, total: sumTotals(selectedOffers) }}
          currency={currency}
          nights={stay.nights}
          submitting={submitting}
          error={submitError}
          onConfirm={() => submit(selectedOffers.map((offer) => offer.id))}
          onCancel={cancel}
        />
      )}
    </main>
  )
}

export default StayPage
