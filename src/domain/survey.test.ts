import { describe, expect, it } from 'vitest'
import { questions } from './questions'
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
    expect(completionPercent(answers)).toBe(5)
  })

  it('returns incomplete question ids for a step', () => {
    expect(validateStep(0, { q01: 'Sí' })).toContain('q02')
  })
})
