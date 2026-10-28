import { formatUtc } from '../utils'
import styles from './CurrentTime.module.css'

function CurrentTime({ iso }) {
  return (
    <p className={styles.now}>
      Current time: <time dateTime={iso}>{formatUtc(iso)}</time>
    </p>
  )
}

export default CurrentTime
