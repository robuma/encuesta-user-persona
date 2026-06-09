import { describe, expect, it } from 'vitest'
import { costaRicaDateKey, formatCostaRicaDate, formatCostaRicaDateTime, formatDisplayDate, parseDisplayDate } from './dates'

describe('display dates', () => {
  it('formats ISO dates as DD/MM/YYYY', () => {
    expect(formatDisplayDate('2026-06-08')).toBe('08/06/2026')
  })

  it('parses DD/MM/YYYY dates as ISO', () => {
    expect(parseDisplayDate('08/06/2026')).toBe('2026-06-08')
  })

  it('rejects invalid calendar dates', () => {
    expect(parseDisplayDate('31/02/2026')).toBeNull()
  })

  it('uses the Costa Rica calendar date for UTC timestamps', () => {
    expect(costaRicaDateKey('2026-06-09T04:41:00Z')).toBe('2026-06-08')
    expect(formatCostaRicaDate('2026-06-09T04:41:00Z')).toBe('08/06/2026')
  })

  it('formats timestamps explicitly in Costa Rica time', () => {
    expect(formatCostaRicaDateTime('2026-06-09T04:41:00Z')).toContain('08/06/2026')
  })
})
