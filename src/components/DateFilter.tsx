import { useEffect, useRef, useState } from 'react'
import { formatDisplayDate, parseDisplayDate } from '../domain/dates'

export function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [display, setDisplay] = useState(() => formatDisplayDate(value))
  const picker = useRef<HTMLInputElement>(null)

  useEffect(() => setDisplay(formatDisplayDate(value)), [value])

  const commit = () => {
    if (!display.trim()) return onChange('')
    const parsed = parseDisplayDate(display)
    if (parsed) {
      onChange(parsed)
      setDisplay(formatDisplayDate(parsed))
    } else {
      setDisplay(formatDisplayDate(value))
    }
  }

  return (
    <label>{label}<span className="date-filter">
      <input aria-label={`${label} en formato día mes año`} inputMode="numeric" placeholder="DD/MM/YYYY" value={display} onChange={(event) => setDisplay(event.target.value)} onBlur={commit} />
      <button type="button" aria-label={`Abrir calendario ${label.toLowerCase()}`} onClick={() => picker.current?.showPicker?.()}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M7 2v3M17 2v3M3.5 9h17M5.5 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
      </button>
      <input ref={picker} className="native-date-picker" type="date" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={-1} />
    </span></label>
  )
}
