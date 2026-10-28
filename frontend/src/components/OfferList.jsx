import { formatPrice, formatUtc } from '../utils'
import styles from './OfferList.module.css'

function OfferList({ title, hint, offers, currency, selected, onToggle, isDisabled }) {
  if (offers.length === 0) return null
  return (
    <section>
      <h2>{title}</h2>
      {hint && <p className={styles.hint}>{hint}</p>}
      <ul>
        {offers.map((offer) => (
          <li key={offer.id}>
            <label className={styles.option}>
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

export default OfferList
