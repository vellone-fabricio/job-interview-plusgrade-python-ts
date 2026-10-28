import { formatNights, formatPrice } from '../utils'

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
              {offer.per === 'night' && ` × ${formatNights(nights)}`}
            </small>
          </li>
        ))}
      </ul>
      <p className="total">Total: {formatPrice(request.total, currency)}</p>
    </section>
  )
}

export default RequestSummary
