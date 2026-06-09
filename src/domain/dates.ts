export const COSTA_RICA_TIME_ZONE = 'America/Costa_Rica'

const costaRicaParts = (value: string) => new Intl.DateTimeFormat('en-CA', {
  timeZone: COSTA_RICA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).formatToParts(new Date(value))

export function costaRicaDateKey(value: string): string {
  const parts = Object.fromEntries(costaRicaParts(value).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function formatCostaRicaDate(value: string): string {
  return formatDisplayDate(costaRicaDateKey(value))
}

export function formatCostaRicaDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    timeZone: COSTA_RICA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDisplayDate(value: string): string {
  const iso = value.slice(0, 10)
  const [year, month, day] = iso.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

export function parseDisplayDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const date = new Date(`${iso}T00:00:00Z`)
  return date.toISOString().slice(0, 10) === iso ? iso : null
}
