import { formatUtc } from '../utils'

function CurrentTime({ iso }) {
  return (
    <p className="now">
      Current time: <time dateTime={iso}>{formatUtc(iso)}</time>
    </p>
  )
}

export default CurrentTime
