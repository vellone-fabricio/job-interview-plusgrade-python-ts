import './App.css'
import StayPage from './StayPage.jsx'

function App() {
  const reservationId = window.location.pathname.match(/^\/stay\/([^/]+)/)?.[1]

  if (!reservationId) return <p>Open the link from your email, e.g. /stay/TYO-2290</p>

  return <StayPage reservationId={decodeURIComponent(reservationId)} />
}

export default App
