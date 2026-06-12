import { describe, expect, it } from 'vitest'
import { questions } from './questions'
import { personaQuestions } from './personaQuestions'
import { completionPercent, isQuestionComplete, validateStep } from './survey'
import type { SurveyAnswers } from './types'

describe('survey definition', () => {
  it('contains the 44 questions grouped into four steps', () => {
    expect(questions).toHaveLength(44)
    expect(new Set(questions.map((question) => question.step))).toEqual(new Set([0, 1, 2, 3]))
  })
})

describe('survey validation', () => {
  it('requires complementary text when Otro is selected', () => {
    expect(isQuestionComplete(questions[4], { q05: { value: 'Otro', detail: '' } })).toBe(false)
    expect(isQuestionComplete(questions[4], { q05: { value: 'Otro', detail: 'No binario' } })).toBe(true)
  })

  it('requires detail for question 10 only when Sí is selected', () => {
    expect(isQuestionComplete(questions[9], { q10: { value: 'Sí', detail: '' } })).toBe(false)
    expect(isQuestionComplete(questions[9], { q10: { value: 'No' } })).toBe(true)
  })

  it('calculates progress across all questions', () => {
    const answers: SurveyAnswers = { q01: 'Sí', q02: 'Sí' }
    expect(completionPercent(questions, answers)).toBe(5)
  })

  it('returns incomplete question ids for a step', () => {
    expect(validateStep(questions, 0, { q01: 'Sí' })).toContain('q02')
  })

  it('supports seven-point Likert and multiple-selection questions', () => {
    expect(isQuestionComplete(personaQuestions[6], { b01: 7 })).toBe(true)
    expect(isQuestionComplete(personaQuestions[6], { b01: 8 })).toBe(false)
    expect(isQuestionComplete(personaQuestions[3], { d04: ['Portátil', 'Celular'] })).toBe(true)
  })

  it('validates standardized age and residence answers', () => {
    expect(isQuestionComplete(personaQuestions[1], { d02: '17' })).toBe(true)
    expect(isQuestionComplete(personaQuestions[1], { d02: '16' })).toBe(false)
    expect(isQuestionComplete(personaQuestions[2], { d03: 'San José > San José > Carmen' })).toBe(true)
    expect(isQuestionComplete(personaQuestions[2], { d03: 'San José' })).toBe(false)
  })
})
