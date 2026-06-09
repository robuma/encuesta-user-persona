import { describe, expect, it } from 'vitest'
import { filterResponses, likertDistribution, responsesToCsv } from './results'
import type { SurveyResponse } from './types'

const responses: SurveyResponse[] = [
  { id: '1', survey_version: '1.0', submitted_at: '2026-06-01T12:00:00Z', answers: { q01: 'Sí', q13: 5, q41: 'Practicar' } },
  { id: '2', survey_version: '1.0', submitted_at: '2026-06-03T12:00:00Z', answers: { q01: 'No', q13: 3, q41: 'Errores' } },
]

describe('dashboard calculations', () => {
  it('filters by date and characterization answer', () => {
    expect(filterResponses(responses, { from: '2026-06-02', to: '', questionId: 'q01', value: 'No' })).toHaveLength(1)
  })

  it('filters timestamps using the Costa Rica calendar date', () => {
    const lateEveningResponse: SurveyResponse = { id: '3', survey_version: '1.0', submitted_at: '2026-06-09T04:41:00Z', answers: { q01: 'Sí' } }
    expect(filterResponses([lateEveningResponse], { from: '2026-06-08', to: '2026-06-08', questionId: '', value: '' })).toHaveLength(1)
  })

  it('builds a five-point Likert distribution', () => {
    expect(likertDistribution(responses, 'q13')).toEqual([
      { value: 1, count: 0 }, { value: 2, count: 0 }, { value: 3, count: 1 },
      { value: 4, count: 0 }, { value: 5, count: 1 },
    ])
  })

  it('exports a spreadsheet-compatible CSV', () => {
    const csv = responsesToCsv(responses)
    expect(csv).toContain('"id","submitted_at","q01"')
    expect(csv).toContain('"Practicar"')
  })
})
