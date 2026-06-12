import { describe, expect, it } from 'vitest'
import { costaRicaLocations } from './costaRicaLocations'
import { personaQuestions } from './personaQuestions'

describe('persona survey definition', () => {
  it('contains 21 required questions across four categories', () => {
    expect(personaQuestions).toHaveLength(21)
    expect(new Set(personaQuestions.map((question) => question.section))).toEqual(new Set([0, 1, 2, 3]))
  })

  it('uses seven-point Likert scales and supports multiple equipment choices', () => {
    expect(personaQuestions.filter((question) => question.type === 'likert')).toHaveLength(14)
    expect(personaQuestions.find((question) => question.id === 'b01')?.options).toHaveLength(7)
    expect(personaQuestions.find((question) => question.id === 'd04')?.type).toBe('multi')
  })

  it('standardizes age and residence selections', () => {
    const age = personaQuestions.find((question) => question.id === 'd02')
    const residence = personaQuestions.find((question) => question.id === 'd03')

    expect(age?.type).toBe('select')
    expect(age?.options?.at(0)).toBe('17')
    expect(age?.options?.at(-1)).toBe('99')
    expect(age?.chartOptions).toBe('observed')
    expect(residence?.type).toBe('location')
    expect(residence?.chartOptions).toBe('observed')
    expect(residence?.resultValue).toBe('province')
  })

  it('contains the 494 districts reported by the 2026 territorial division', () => {
    const districts = Object.values(costaRicaLocations)
      .flatMap((cantons) => Object.values(cantons))
      .flat()

    expect(districts).toHaveLength(494)
    expect(costaRicaLocations.Limón.Guácimo).toContain('Duacarí')
  })
})
