import { formatNights, formatPrice } from '../utils'
import styles from './RequestSummary.module.css'

function RequestSummary({ title = 'Your request', request, currency, nights }) {
  return (
    <section>
      <h2>{title}</h2>
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
      <p className={styles.total}>Total: {formatPrice(request.total, currency)}</p>
    </section>
  )
}

export default RequestSummary
