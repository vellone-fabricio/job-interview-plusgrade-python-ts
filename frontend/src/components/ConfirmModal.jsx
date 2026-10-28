import { useEffect, useRef } from 'react'
import RequestSummary from './RequestSummary'
import styles from './ConfirmModal.module.css'

function ConfirmModal({ request, currency, nights, submitting, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={onCancel}>
      <RequestSummary
        title="Confirm your request"
        request={request}
        currency={currency}
        nights={nights}
      />
      <p>Do you want to request these for your stay?</p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Sending…' : 'Yes'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          No
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmModal
