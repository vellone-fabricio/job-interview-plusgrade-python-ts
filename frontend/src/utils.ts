/// <reference types="vite/client" />

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const formatPrice = (amount: string | number, currency: string): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))

export const formatUtc = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { timeZone: 'UTC', timeZoneName: 'short' })

export const formatNights = (nights: number): string =>
  `${nights} ${nights === 1 ? 'night' : 'nights'}`

export const sumTotals = (offers: { total: string | number }[]): number =>
  offers.reduce((sum, offer) => sum + Number(offer.total), 0)

export function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return next
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof body.detail === 'string' ? body.detail : 'Something went wrong')
  return body
}
