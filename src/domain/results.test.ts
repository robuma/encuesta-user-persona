import { describe, expect, it } from 'vitest'
import { filterableQuestions, observedAnswerOptions, observedDistribution, responsesToCsv, filterResponses, likertDistribution } from './results'
import { questions } from './questions'
import type { SurveyQuestion, SurveyResponse } from './types'

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

  it('builds a seven-point Likert distribution', () => {
    expect(likertDistribution([], 'b01', 7)).toHaveLength(7)
  })

  it('exports a spreadsheet-compatible CSV', () => {
    const csv = responsesToCsv(responses, questions)
    expect(csv).toContain('"id","submitted_at","q01"')
    expect(csv).toContain('"Practicar"')
  })

  it('exports multiple-selection answers as a readable list', () => {
    const equipmentQuestion: SurveyQuestion = {
      id: 'd04',
      number: 4,
      section: 0,
      step: 0,
      type: 'multi',
      text: 'Equipo',
      options: ['Portátil', 'Celular'],
    }
    const multipleResponse: SurveyResponse = {
      id: '6',
      survey_version: '2.0',
      submitted_at: '2026-06-03T12:00:00Z',
      answers: { d04: ['Portátil', 'Celular'] },
    }

    expect(responsesToCsv([multipleResponse], [equipmentQuestion])).toContain('"Portátil; Celular"')
    expect(responsesToCsv([multipleResponse], [equipmentQuestion])).not.toContain('undefined')
  })

  it('groups standardized residence answers by province while preserving full CSV values', () => {
    const residenceQuestion: SurveyQuestion = {
      id: 'd03',
      number: 3,
      section: 0,
      step: 0,
      type: 'location',
      text: 'Residencia',
      chartOptions: 'observed',
      resultValue: 'province',
    }
    const residenceResponses: SurveyResponse[] = [
      { id: '3', survey_version: '2.0', submitted_at: '2026-06-03T12:00:00Z', answers: { d03: 'San José > San José > Carmen' } },
      { id: '4', survey_version: '2.0', submitted_at: '2026-06-03T12:00:00Z', answers: { d03: 'Alajuela > Alajuela > Carmen' } },
      { id: '5', survey_version: '2.0', submitted_at: '2026-06-03T12:00:00Z', answers: { d03: 'San José > San José > Catedral' } },
    ]

    expect(observedDistribution(residenceResponses, residenceQuestion)).toEqual([
      { option: 'Alajuela', count: 1 },
      { option: 'San José', count: 2 },
    ])
    expect(observedAnswerOptions(residenceResponses, residenceQuestion)).toEqual(['Alajuela', 'San José'])
    expect(filterResponses(residenceResponses, { from: '', to: '', questionId: 'd03', value: 'San José' }, [residenceQuestion])).toHaveLength(2)
    expect(responsesToCsv(residenceResponses, [residenceQuestion])).toContain('San José > San José > Carmen')
  })

  it('only offers multiple-selection options that were actually answered', () => {
    const equipmentQuestion: SurveyQuestion = {
      id: 'd04',
      number: 4,
      section: 0,
      step: 0,
      type: 'multi',
      text: 'Equipo',
      options: ['Portátil', 'Tableta', 'Celular'],
    }
    const equipmentResponses: SurveyResponse[] = [
      { id: '7', survey_version: '2.0', submitted_at: '2026-06-03T12:00:00Z', answers: { d04: ['Portátil', 'Celular'] } },
    ]

    expect(observedAnswerOptions(equipmentResponses, equipmentQuestion)).toEqual(['Celular', 'Portátil'])
  })

  it('includes all categorical characterization questions from survey 1 in filters', () => {
    expect(filterableQuestions(questions).map((question) => question.id)).toEqual([
      'q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q07', 'q08', 'q09', 'q10', 'q11', 'q12',
    ])
  })

  it('offers and filters only observed conditional answer values', () => {
    const genderQuestion = questions.find((question) => question.id === 'q05')!
    const genderResponses: SurveyResponse[] = [
      { id: '8', survey_version: '1.0', submitted_at: '2026-06-03T12:00:00Z', answers: { q05: { value: 'Otro', detail: 'No binario' } } },
      { id: '9', survey_version: '1.0', submitted_at: '2026-06-03T12:00:00Z', answers: { q05: { value: 'Mujer' } } },
    ]

    expect(observedAnswerOptions(genderResponses, genderQuestion)).toEqual(['Mujer', 'Otro'])
    expect(filterResponses(genderResponses, { from: '', to: '', questionId: 'q05', value: 'Otro' }, [genderQuestion])).toHaveLength(1)
  })
})
